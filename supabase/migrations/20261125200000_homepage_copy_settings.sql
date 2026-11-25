-- Testi homepage 2: hero secondari, come funziona, perché questi album.

alter table public.store_settings
  add column if not exists homepage_eyebrow text,
  add column if not exists homepage_cta_catalog text,
  add column if not exists homepage_cta_how text,
  add column if not exists homepage_featured_title text,
  add column if not exists homepage_how_title text,
  add column if not exists homepage_how_steps jsonb,
  add column if not exists homepage_why_title text,
  add column if not exists homepage_why_items jsonb,
  add column if not exists homepage_why_cta text;

update public.store_settings
set
  homepage_eyebrow = coalesce(nullif(btrim(homepage_eyebrow), ''), 'Album fotografici'),
  homepage_cta_catalog = coalesce(nullif(btrim(homepage_cta_catalog), ''), 'Vai al catalogo'),
  homepage_cta_how = coalesce(nullif(btrim(homepage_cta_how), ''), 'Come funziona'),
  homepage_featured_title = coalesce(nullif(btrim(homepage_featured_title), ''), 'In evidenza'),
  homepage_how_title = coalesce(nullif(btrim(homepage_how_title), ''), 'Come funziona'),
  homepage_how_steps = coalesce(
    homepage_how_steps,
    '[
      {"title":"Scegli l''album","text":"Sfoglia il catalogo e aggiungi al carrello gli album vuoti che ti interessano."},
      {"title":"Invia la richiesta","text":"Lascia i tuoi recapiti e l''indirizzo. Non è un ordine confermato e non c''è pagamento online."},
      {"title":"Ti contattiamo","text":"Il titolare verifica disponibilità, spese di spedizione e consegna in contrassegno."},
      {"title":"Personalizzi a casa","text":"Ricevi l''album vuoto e incolli le tue fotografie. Il sito non chiede di caricarle."}
    ]'::jsonb
  ),
  homepage_why_title = coalesce(nullif(btrim(homepage_why_title), ''), 'Perché questi album'),
  homepage_why_items = coalesce(
    homepage_why_items,
    '[
      {"title":"Album vuoti","text":"Le fotografie restano tue. Il sito non chiede di caricarle."},
      {"title":"Nessun pagamento online","text":"Invii una richiesta. L''acquisto si conferma solo dopo il contatto."},
      {"title":"Spedizione da concordare","text":"Il prezzo in pagina è solo quello dei prodotti, senza spedizione."}
    ]'::jsonb
  ),
  homepage_why_cta = coalesce(nullif(btrim(homepage_why_cta), ''), 'Sfoglia il catalogo')
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
  updated_at
) on table public.store_settings to anon;
