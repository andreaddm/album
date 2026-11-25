-- Titolo hero homepage modificabile dalle impostazioni.

alter table public.store_settings
  add column if not exists homepage_headline text;

update public.store_settings
set homepage_headline = 'Vuoti, pronti per le tue fotografie.'
where id = 'default'
  and (homepage_headline is null or btrim(homepage_headline) = '');
