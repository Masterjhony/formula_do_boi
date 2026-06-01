-- Insere o card "Volante MRA" no catálogo de Sêmen (página /semen),
-- roteando o card para a landing page dedicada em /volante.
--
-- O card aparece automaticamente em /semen (SemenClient filtra
-- category = 'Sêmen'); PremiumCatalogCard lê details.customLink e
-- aponta o clique para /volante sem mexer no código.
--
-- Idempotente: só insere se ainda não existir um produto com esse nome.

INSERT INTO public.products (
  name,
  category,
  classificacao,
  location,
  image_url,
  gallery,
  price,
  installments,
  tag,
  details
)
SELECT
  'Dose de Sêmen - VOLANTE MRA',
  'Sêmen',
  'semen',
  'Central Bela Vista',
  '/volante/volante-video.mp4',
  ARRAY[
    '/volante/volante-corpo.jpg',
    '/volante/volante-frontal.jpg',
    '/volante/volante-pasto.jpg',
    '/volante/volante-retrato.jpg',
    '/volante/volante-video.mp4'
  ],
  NULL,            -- price é coluna numérica; card de sêmen exibe "Sob consulta"
  'Sob Consulta',
  'LANÇAMENTO 2026',
  '{
    "registro": "MRA 10701 · 10701-P MRA",
    "raca": "Nelore PO",
    "nascimento": "04/11/2023",
    "pai": "REM HERMOSO FIV GEN.ADT",
    "mae": "9535 FIV MRA",
    "mgte": "27,01",
    "iabcz": "22,53",
    "iqg": "25,18",
    "proprietario": "Nelore Leão",
    "breeder": "MRA · Botucatu/SP",
    "tipo": "Sêmen Convencional",
    "comentario": "Touro Nelore PO superprecoce. MGTe 27,01 — TOP 6%. Elite em Peso, ACAB e STAY. Doses a partir de R$ 23,50. Pré-reserva aberta.",
    "customLink": "/volante"
  }'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM public.products WHERE name = 'Dose de Sêmen - VOLANTE MRA'
);
