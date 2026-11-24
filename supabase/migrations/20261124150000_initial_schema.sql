-- Schema iniziale: catalogo, richieste d'acquisto, impostazioni e accesso admin.
-- I prezzi sono numeric(10,2): PostgreSQL arrotonda al centesimo in scrittura.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.generate_reference_code()
returns text
language plpgsql
set search_path = public
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text := 'RQ-';
  i integer;
begin
  for i in 1..8 loop
    code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::integer, 1);
  end loop;
  return code;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) > 0),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  price numeric(10, 2) not null check (price >= 0),
  short_description text,
  description text,
  is_published boolean not null default false,
  is_available boolean not null default true,
  availability_notice_enabled boolean not null default false,
  availability_notice_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_slug_key unique (slug)
);

create table public.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  media_type text not null check (media_type in ('image', 'video')),
  storage_path text,
  external_url text,
  platform text,
  alt_text text,
  position integer not null check (position >= 0),
  created_at timestamptz not null default now(),
  constraint product_media_source_check check (
    (
      media_type = 'image'
      and storage_path is not null
      and external_url is null
      and platform is null
    )
    or (
      media_type = 'video'
      and external_url is not null
      and storage_path is null
      and platform in ('youtube', 'tiktok')
    )
  )
);

create table public.product_features (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  name text not null check (char_length(btrim(name)) > 0),
  value text not null check (char_length(btrim(value)) > 0),
  position integer not null check (position >= 0)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null default public.generate_reference_code()
    check (reference_code ~ '^RQ-[A-Z2-9]{8}$'),
  customer_first_name text not null check (char_length(btrim(customer_first_name)) > 0),
  customer_last_name text not null check (char_length(btrim(customer_last_name)) > 0),
  email text not null check (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  phone text not null check (char_length(btrim(phone)) > 0),
  street text not null check (char_length(btrim(street)) > 0),
  house_number text not null check (char_length(btrim(house_number)) > 0),
  postal_code text not null check (postal_code ~ '^[0-9]{5}$'),
  city text not null check (char_length(btrim(city)) > 0),
  province text not null check (char_length(btrim(province)) between 2 and 40),
  notes text,
  status text not null default 'new' check (
    status in ('new', 'to_contact', 'confirmed', 'shipped', 'completed', 'rejected')
  ),
  products_total numeric(10, 2) not null check (products_total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_reference_code_key unique (reference_code)
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name_snapshot text not null,
  unit_price_snapshot numeric(10, 2) not null check (unit_price_snapshot >= 0),
  quantity integer not null check (quantity between 1 and 99),
  line_total_snapshot numeric(10, 2) not null check (line_total_snapshot >= 0)
);

create table public.store_settings (
  id text primary key default 'default' check (id = 'default'),
  store_name text not null,
  notification_email text,
  whatsapp_number text,
  homepage_intro text,
  unavailable_message text,
  updated_at timestamptz not null default now()
);

create table public.email_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id) on delete set null,
  recipient text not null,
  template text not null check (template in ('owner_notification', 'customer_receipt')),
  status text not null check (status in ('pending', 'sent', 'failed')),
  error text,
  created_at timestamptz not null default now()
);

create table public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity text not null,
  entity_id uuid,
  detail jsonb,
  created_at timestamptz not null default now()
);

create index products_published_idx on public.products (is_published);
create index product_media_product_position_idx on public.product_media (product_id, position);
create index product_features_product_position_idx on public.product_features (product_id, position);
create index orders_status_created_idx on public.orders (status, created_at desc);
create index order_items_order_idx on public.order_items (order_id);
create index order_items_product_idx on public.order_items (product_id);
create index email_logs_order_idx on public.email_logs (order_id);

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create trigger store_settings_set_updated_at
before update on public.store_settings
for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Massimo 2 video per prodotto, anche se la scrittura non passa dall'interfaccia.
create or replace function public.enforce_product_video_limit()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  video_count integer;
begin
  if new.media_type <> 'video' then
    return new;
  end if;

  select count(*)
  into video_count
  from public.product_media
  where product_id = new.product_id
    and media_type = 'video'
    and id is distinct from new.id;

  if video_count >= 2 then
    raise exception 'Un prodotto può avere al massimo 2 video'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger product_media_video_limit
before insert or update on public.product_media
for each row execute function public.enforce_product_video_limit();

-- Il primo utente creato in Auth diventa amministratore.
-- I successivi restano "user" e non hanno permessi.
-- Tenere disattivata la registrazione pubblica nel progetto Supabase.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_role text;
begin
  if exists (select 1 from public.profiles where role = 'admin') then
    assigned_role := 'user';
  else
    assigned_role := 'admin';
  end if;

  insert into public.profiles (id, role)
  values (new.id, assigned_role);

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Profili per gli utenti già presenti prima di questo schema.
insert into public.profiles (id, role)
select
  users.id,
  case
    when users.created_at = (
      select min(created_at) from auth.users
    )
      and not exists (select 1 from public.profiles where role = 'admin')
      then 'admin'
    else 'user'
  end
from auth.users as users
on conflict (id) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

insert into public.store_settings (
  id,
  store_name,
  homepage_intro,
  unavailable_message
)
values (
  'default',
  'Album',
  'Album fotografici vuoti da personalizzare con le proprie fotografie.',
  'Non disponibile'
);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_media enable row level security;
alter table public.product_features enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.store_settings enable row level security;
alter table public.email_logs enable row level security;
alter table public.admin_audit_logs enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.products from anon, authenticated;
revoke all on table public.product_media from anon, authenticated;
revoke all on table public.product_features from anon, authenticated;
revoke all on table public.orders from anon, authenticated;
revoke all on table public.order_items from anon, authenticated;
revoke all on table public.store_settings from anon, authenticated;
revoke all on table public.email_logs from anon, authenticated;
revoke all on table public.admin_audit_logs from anon, authenticated;

grant select on table public.products to anon, authenticated;
grant insert, update, delete on table public.products to authenticated;

grant select on table public.product_media to anon, authenticated;
grant insert, update, delete on table public.product_media to authenticated;

grant select on table public.product_features to anon, authenticated;
grant insert, update, delete on table public.product_features to authenticated;

grant select, update on table public.orders to authenticated;
grant select on table public.order_items to authenticated;
grant select on table public.profiles to authenticated;
grant update (role, updated_at) on table public.profiles to authenticated;
grant select, update on table public.email_logs to authenticated;
grant select on table public.admin_audit_logs to authenticated;

-- L'email delle notifiche non è leggibile dai visitatori.
grant select (
  id,
  store_name,
  whatsapp_number,
  homepage_intro,
  unavailable_message,
  updated_at
) on table public.store_settings to anon;

grant select, update on table public.store_settings to authenticated;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create policy "profiles_select_own_or_admin"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_admin());

create policy "profiles_update_admin"
on public.profiles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "products_select_published_or_admin"
on public.products
for select
to anon, authenticated
using (is_published or public.is_admin());

create policy "products_write_admin"
on public.products
for insert
to authenticated
with check (public.is_admin());

create policy "products_update_admin"
on public.products
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "products_delete_admin"
on public.products
for delete
to authenticated
using (public.is_admin());

create policy "product_media_select_published_or_admin"
on public.product_media
for select
to anon, authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.products
    where products.id = product_media.product_id
      and products.is_published
  )
);

create policy "product_media_write_admin"
on public.product_media
for insert
to authenticated
with check (public.is_admin());

create policy "product_media_update_admin"
on public.product_media
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "product_media_delete_admin"
on public.product_media
for delete
to authenticated
using (public.is_admin());

create policy "product_features_select_published_or_admin"
on public.product_features
for select
to anon, authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.products
    where products.id = product_features.product_id
      and products.is_published
  )
);

create policy "product_features_write_admin"
on public.product_features
for insert
to authenticated
with check (public.is_admin());

create policy "product_features_update_admin"
on public.product_features
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "product_features_delete_admin"
on public.product_features
for delete
to authenticated
using (public.is_admin());

create policy "orders_select_admin"
on public.orders
for select
to authenticated
using (public.is_admin());

create policy "orders_update_admin"
on public.orders
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "order_items_select_admin"
on public.order_items
for select
to authenticated
using (public.is_admin());

create policy "store_settings_select_public"
on public.store_settings
for select
to anon
using (true);

create policy "store_settings_admin"
on public.store_settings
for select
to authenticated
using (public.is_admin());

create policy "store_settings_update_admin"
on public.store_settings
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "email_logs_select_admin"
on public.email_logs
for select
to authenticated
using (public.is_admin());

create policy "email_logs_update_admin"
on public.email_logs
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admin_audit_logs_select_admin"
on public.admin_audit_logs
for select
to authenticated
using (public.is_admin());

create policy "product_images_public_read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'product-images');

create policy "product_images_admin_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'product-images' and public.is_admin());

create policy "product_images_admin_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'product-images' and public.is_admin())
with check (bucket_id = 'product-images' and public.is_admin());

create policy "product_images_admin_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'product-images' and public.is_admin());
