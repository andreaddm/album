-- Limite album in evidenza (3/6/9) e flag per prodotto.

alter table public.store_settings
  add column if not exists featured_limit integer not null default 3;

alter table public.store_settings
  drop constraint if exists store_settings_featured_limit_check;

alter table public.store_settings
  add constraint store_settings_featured_limit_check
  check (featured_limit in (3, 6, 9));

update public.store_settings
set featured_limit = 3
where id = 'default'
  and featured_limit is distinct from 3
  and featured_limit not in (3, 6, 9);

alter table public.products
  add column if not exists is_featured boolean not null default false;

create index if not exists products_featured_idx
  on public.products (is_featured)
  where is_featured = true;

create or replace function public.enforce_featured_product_limit()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  limit_count integer;
  featured_count integer;
begin
  if new.is_featured is not true then
    return new;
  end if;

  if tg_op = 'UPDATE' and old.is_featured is true then
    return new;
  end if;

  select featured_limit
  into limit_count
  from public.store_settings
  where id = 'default';

  if limit_count is null then
    limit_count := 3;
  end if;

  select count(*)
  into featured_count
  from public.products
  where is_featured = true
    and id is distinct from new.id;

  if featured_count >= limit_count then
    raise exception 'Hai raggiunto il limite di prodotti in evidenza (%).', limit_count
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists products_featured_limit on public.products;

create trigger products_featured_limit
before insert or update of is_featured on public.products
for each row execute function public.enforce_featured_product_limit();
