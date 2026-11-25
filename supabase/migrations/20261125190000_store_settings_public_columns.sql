-- Espone ai visitatori le nuove colonne pubbliche di store_settings.
-- L'email notifiche resta esclusa (grant a colonne).

grant select (
  id,
  store_name,
  whatsapp_number,
  homepage_headline,
  homepage_intro,
  unavailable_message,
  featured_limit,
  updated_at
) on table public.store_settings to anon;
