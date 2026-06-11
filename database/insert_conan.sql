-- Insere o card "CONAN FIV TresMar" no catálogo de Sêmen (página /semen),
-- roteando o card para a landing page dedicada em /conan.
--
-- O card aparece automaticamente em /semen (SemenClient filtra
-- category = 'Sêmen'); PremiumCatalogCard lê details.customLink e
-- aponta o clique para /conan sem mexer no código.
--
-- Espelha database/insert_volante.sql — mesma mecânica, dados do touro
-- CONAN FIV TresMar (RG LCF 1265, Nelore PO).
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
  'Dose de Sêmen - CONAN FIV TresMar',
  'Sêmen',
  'semen',
  'Central Bela Vista',
  '/conan/assets/conan-video.mp4',
  ARRAY[
    '/conan/assets/conan-frontal.jpg',
    '/conan/assets/conan-retrato.jpg',
    '/conan/assets/conan-pasto.jpg',
    '/conan/assets/conan-video.mp4'
  ],
  NULL,            -- price é coluna numérica; card de sêmen exibe "Sob consulta"
  'Sob Consulta',
  'LANÇAMENTO 2026',
  '{
    "registro": "LCF 1265 · Nelore PO",
    "raca": "Nelore PO",
    "pai": "REM CH LÍDER GEN.ADT",
    "mae": "8830P FIV JMP",
    "mgte": "35,12",
    "iabcz": "36,5",
    "iqg": "38,25",
    "proprietario": "Nelore TresMar",
    "breeder": "TresMar · Botucatu/SP",
    "tipo": "Sêmen Convencional",
    "comentario": "Touro Nelore PO superprecoce. MGTe 35,12 — TOP 0,1% ANCP · DECA 1 PMGZ · TOP 0,5% GenePlus. Elite em Peso, AOL e Precocidade. Doses a partir de R$ 23,50. Pré-reserva aberta.",
    "customLink": "/conan"
  }'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM public.products WHERE name = 'Dose de Sêmen - CONAN FIV TresMar'
);
