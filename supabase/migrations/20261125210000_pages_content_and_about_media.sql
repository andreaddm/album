-- Testi pagine Privacy / Cookie / Chi siamo + media Chi siamo.

alter table public.store_settings
  add column if not exists privacy_title text,
  add column if not exists privacy_body text,
  add column if not exists cookie_title text,
  add column if not exists cookie_body text,
  add column if not exists about_title text,
  add column if not exists about_body text;

update public.store_settings
set
  privacy_title = coalesce(nullif(btrim(privacy_title), ''), 'Privacy'),
  privacy_body = coalesce(
    nullif(btrim(privacy_body), ''),
    'L''informativa sarà pubblicata con i testi verificati dal titolare e da un consulente. Qui non è riportata un''informativa definitiva.'
  ),
  cookie_title = coalesce(nullif(btrim(cookie_title), ''), 'Cookie'),
  cookie_body = coalesce(
    nullif(btrim(cookie_body), ''),
    'La pagina sui cookie sarà completata prima della pubblicazione, dopo aver definito gli strumenti effettivamente usati dal sito.'
  ),
  about_title = coalesce(nullif(btrim(about_title), ''), 'Chi siamo'),
  about_body = coalesce(
    nullif(btrim(about_body), ''),
    'Questa pagina accoglierà la storia del progetto, con i testi forniti dal titolare. Gli album sono vuoti: le fotografie si applicano dopo l''acquisto, in autonomia.'
  )
where id = 'default';

grant select (
  id,
  store_name,
  whatsapp_number,
  homepage_headline,
  homepage_intro,
  unavailable_message,
  featured_limit,
  homepage_eyebrow,
  homepage_cta_catalog,
  homepage_cta_how,
  homepage_featured_title,
  homepage_how_title,
  homepage_how_steps,
  homepage_why_title,
  homepage_why_items,
  homepage_why_cta,
  privacy_title,
  privacy_body,
  cookie_title,
  cookie_body,
  about_title,
  about_body,
  updated_at
) on table public.store_settings to anon;

create table public.about_page_media (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('background', 'gallery')),
  storage_path text not null,
  alt_text text,
  position integer not null check (position >= 0),
  created_at timestamptz not null default now()
);

create index about_page_media_kind_position_idx
  on public.about_page_media (kind, position);

alter table public.about_page_media enable row level security;

revoke all on table public.about_page_media from anon, authenticated;
grant select on table public.about_page_media to anon, authenticated;
grant insert, update, delete on table public.about_page_media to authenticated;
grant select, insert, update, delete on table public.about_page_media to service_role;

create policy "about_page_media_select_public"
on public.about_page_media
for select
to anon, authenticated
using (true);

create policy "about_page_media_write_admin"
on public.about_page_media
for insert
to authenticated
with check (public.is_admin());

create policy "about_page_media_update_admin"
on public.about_page_media
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "about_page_media_delete_admin"
on public.about_page_media
for delete
to authenticated
using (public.is_admin());

-- Al massimo un'immagine di sfondo per Chi siamo.
create or replace function public.enforce_about_background_limit()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  bg_count integer;
begin
  if new.kind <> 'background' then
    return new;
  end if;

  select count(*)
  into bg_count
  from public.about_page_media
  where kind = 'background'
    and id is distinct from new.id;

  if bg_count >= 1 then
    raise exception 'Puoi impostare una sola immagine di sfondo per Chi siamo.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists about_page_media_background_limit on public.about_page_media;

create trigger about_page_media_background_limit
before insert or update of kind on public.about_page_media
for each row execute function public.enforce_about_background_limit();
