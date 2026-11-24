-- Dati dimostrativi, non reali. Non eseguirlo in produzione.

insert into public.products (
  id,
  name,
  slug,
  price,
  short_description,
  description,
  is_published,
  is_available,
  availability_notice_enabled,
  availability_notice_text
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'Album lino naturale',
    'album-lino-naturale',
    48.00,
    'Copertina in lino, pagine avorio.',
    'Album vuoto con copertina in lino naturale. Le fotografie si incollano dopo l''acquisto.',
    true,
    true,
    false,
    null
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'Album copertina rigida',
    'album-copertina-rigida',
    62.00,
    'Copertina rigida color avorio.',
    'Album vuoto con copertina rigida. Non include il servizio di impaginazione.',
    true,
    true,
    true,
    'Ultimi pezzi disponibili'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'Album piccolo da viaggio',
    'album-piccolo-da-viaggio',
    36.00,
    'Formato compatto, momentaneamente non disponibile.',
    'Album vuoto di formato ridotto. Visibile in catalogo ma non acquistabile.',
    true,
    false,
    false,
    null
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'Album bozza',
    'album-bozza',
    40.00,
    'Non pubblicato.',
    'Prodotto di prova che non deve comparire nel catalogo pubblico.',
    false,
    true,
    false,
    null
  )
on conflict (slug) do nothing;

insert into public.product_features (product_id, name, value, position)
select product_id, name, value, position
from (
  values
    ('11111111-1111-4111-8111-111111111111'::uuid, 'Dimensioni', '30 × 30 cm', 0),
    ('11111111-1111-4111-8111-111111111111'::uuid, 'Pagine', '20', 1),
    ('11111111-1111-4111-8111-111111111111'::uuid, 'Materiale', 'Lino e carta avorio', 2),
    ('22222222-2222-4222-8222-222222222222'::uuid, 'Dimensioni', '25 × 25 cm', 0),
    ('22222222-2222-4222-8222-222222222222'::uuid, 'Pagine', '30', 1),
    ('33333333-3333-4333-8333-333333333333'::uuid, 'Dimensioni', '15 × 20 cm', 0),
    ('33333333-3333-4333-8333-333333333333'::uuid, 'Pagine', '16', 1)
) as demo(product_id, name, value, position)
where exists (
  select 1 from public.products where products.id = demo.product_id
)
and not exists (
  select 1
  from public.product_features existing
  where existing.product_id = demo.product_id
    and existing.name = demo.name
);
