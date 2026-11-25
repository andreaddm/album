-- Immagini di sfondo hero della homepage (slideshow a dissolvenza).

create table public.homepage_hero_images (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  alt_text text,
  position integer not null check (position >= 0),
  created_at timestamptz not null default now()
);

create index homepage_hero_images_position_idx
  on public.homepage_hero_images (position);

alter table public.homepage_hero_images enable row level security;

revoke all on table public.homepage_hero_images from anon, authenticated;
grant select on table public.homepage_hero_images to anon, authenticated;
grant insert, update, delete on table public.homepage_hero_images to authenticated;
grant select, insert, update, delete on table public.homepage_hero_images to service_role;

create policy "homepage_hero_images_select_public"
on public.homepage_hero_images
for select
to anon, authenticated
using (true);

create policy "homepage_hero_images_write_admin"
on public.homepage_hero_images
for insert
to authenticated
with check (public.is_admin());

create policy "homepage_hero_images_update_admin"
on public.homepage_hero_images
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "homepage_hero_images_delete_admin"
on public.homepage_hero_images
for delete
to authenticated
using (public.is_admin());
