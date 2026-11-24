-- Salvataggio atomico della richiesta. I prezzi arrivano solo dal database.

alter table public.orders
  add column idempotency_key uuid,
  add column privacy_acknowledged_at timestamptz;

alter table public.orders
  alter column idempotency_key set not null,
  alter column privacy_acknowledged_at set not null;

alter table public.orders
  add constraint orders_idempotency_key_key unique (idempotency_key);

create index orders_email_created_idx
  on public.orders (lower(email), created_at desc);

create or replace function public.create_purchase_request(
  p_idempotency_key uuid,
  p_customer_first_name text,
  p_customer_last_name text,
  p_email text,
  p_phone text,
  p_street text,
  p_house_number text,
  p_postal_code text,
  p_city text,
  p_province text,
  p_notes text,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  existing public.orders%rowtype;
  order_row public.orders%rowtype;
  item jsonb;
  product_row public.products%rowtype;
  qty integer;
  line_total numeric(10, 2);
  total numeric(10, 2) := 0;
  normalized_items jsonb := '[]'::jsonb;
  seen uuid[] := '{}';
  product_id uuid;
  generated_code text;
  recent_count integer;
begin
  if p_idempotency_key is null then
    raise exception 'INVALID_INPUT' using errcode = 'P0001';
  end if;

  select * into existing
  from public.orders
  where idempotency_key = p_idempotency_key;

  if found then
    return public.purchase_request_payload(existing.id, true);
  end if;

  if (
    char_length(btrim(p_customer_first_name)) not between 1 and 80
    or char_length(btrim(p_customer_last_name)) not between 1 and 80
    or btrim(p_email) !~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    or char_length(btrim(p_phone)) not between 6 and 30
    or char_length(btrim(p_street)) not between 1 and 120
    or char_length(btrim(p_house_number)) not between 1 and 16
    or btrim(p_postal_code) !~ '^[0-9]{5}$'
    or char_length(btrim(p_city)) not between 1 and 80
    or char_length(btrim(p_province)) not between 2 and 40
    or (p_notes is not null and char_length(btrim(p_notes)) > 1000)
  ) then
    raise exception 'INVALID_INPUT' using errcode = 'P0001';
  end if;

  select count(*) into recent_count
  from public.orders
  where lower(email) = lower(btrim(p_email))
    and created_at > now() - interval '10 minutes';

  if recent_count >= 3 then
    raise exception 'RATE_LIMIT' using errcode = 'P0001';
  end if;

  if jsonb_typeof(p_items) <> 'array'
    or jsonb_array_length(p_items) < 1
    or jsonb_array_length(p_items) > 20
  then
    raise exception 'INVALID_ITEMS' using errcode = 'P0001';
  end if;

  for item in select element from jsonb_array_elements(p_items) as elements(element)
  loop
    if (item->>'product_id') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      or (item->>'quantity') !~ '^[0-9]+$'
    then
      raise exception 'INVALID_ITEMS' using errcode = 'P0001';
    end if;

    product_id := (item->>'product_id')::uuid;
    qty := (item->>'quantity')::integer;

    if qty < 1 or qty > 20 then
      raise exception 'INVALID_QUANTITY' using errcode = 'P0001';
    end if;

    if product_id = any (seen) then
      raise exception 'DUPLICATE_PRODUCT' using errcode = 'P0001';
    end if;

    seen := array_append(seen, product_id);

    select * into product_row
    from public.products
    where id = product_id;

    if not found or not product_row.is_published or not product_row.is_available then
      raise exception 'PRODUCT_UNAVAILABLE' using errcode = 'P0001';
    end if;

    line_total := round(product_row.price * qty, 2);
    total := round(total + line_total, 2);
    normalized_items := normalized_items || jsonb_build_array(
      jsonb_build_object(
        'product_id', product_row.id,
        'name', product_row.name,
        'unit_price', product_row.price,
        'quantity', qty,
        'line_total', line_total
      )
    );
  end loop;

  generated_code := public.generate_reference_code();
  while exists (
    select 1 from public.orders as existing_order
    where existing_order.reference_code = generated_code
  ) loop
    generated_code := public.generate_reference_code();
  end loop;

  insert into public.orders (
    reference_code,
    idempotency_key,
    customer_first_name,
    customer_last_name,
    email,
    phone,
    street,
    house_number,
    postal_code,
    city,
    province,
    notes,
    status,
    products_total,
    privacy_acknowledged_at
  )
  values (
    generated_code,
    p_idempotency_key,
    btrim(p_customer_first_name),
    btrim(p_customer_last_name),
    btrim(p_email),
    btrim(p_phone),
    btrim(p_street),
    btrim(p_house_number),
    btrim(p_postal_code),
    btrim(p_city),
    btrim(p_province),
    nullif(btrim(coalesce(p_notes, '')), ''),
    'new',
    total,
    now()
  )
  returning * into order_row;

  insert into public.order_items (
    order_id,
    product_id,
    product_name_snapshot,
    unit_price_snapshot,
    quantity,
    line_total_snapshot
  )
  select
    order_row.id,
    (entry->>'product_id')::uuid,
    entry->>'name',
    (entry->>'unit_price')::numeric(10, 2),
    (entry->>'quantity')::integer,
    (entry->>'line_total')::numeric(10, 2)
  from jsonb_array_elements(normalized_items) as entry;

  return public.purchase_request_payload(order_row.id, false);
exception
  when unique_violation then
    select * into existing
    from public.orders
    where idempotency_key = p_idempotency_key;

    if found then
      return public.purchase_request_payload(existing.id, true);
    end if;

    raise;
end;
$$;

create or replace function public.purchase_request_payload(
  p_order_id uuid,
  p_replayed boolean
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'reference_code', orders.reference_code,
    'products_total', orders.products_total,
    'replayed', p_replayed,
    'items', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'name', order_items.product_name_snapshot,
            'quantity', order_items.quantity,
            'unit_price', order_items.unit_price_snapshot,
            'line_total', order_items.line_total_snapshot
          )
          order by order_items.product_name_snapshot
        )
        from public.order_items
        where order_items.order_id = orders.id
      ),
      '[]'::jsonb
    )
  )
  from public.orders
  where orders.id = p_order_id;
$$;

revoke all on function public.purchase_request_payload(uuid, boolean) from public, anon, authenticated;
revoke all on function public.create_purchase_request(uuid, text, text, text, text, text, text, text, text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.create_purchase_request(uuid, text, text, text, text, text, text, text, text, text, text, jsonb) to service_role;
