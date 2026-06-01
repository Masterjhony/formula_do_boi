-- ============================================================
-- UPDATE — card "VOLANTE MRA" (catálogo de Sêmen · página /semen)
--
-- Ajustes pós-feedback (jun/2026):
--   1. proprietario  → "Nelore Leão" (era "Fórmula do Boi · Aceleradora")
--   2. gallery       → fotos novas; a 1ª imagem não-mp4 vira o poster
--                      do card (PremiumCatalogCard usa o vídeo como
--                      mídia e o 1º .jpg da gallery como poster).
--
-- O image_url permanece o vídeo (/volante/volante-video.mp4) — toca no
-- hover do card ("vídeo dele andando").
--
-- Idempotente: roda em qualquer estado e converge pro valor final.
-- ============================================================

UPDATE public.products
SET
  details = jsonb_set(details, '{proprietario}', '"Nelore Leão"'::jsonb),
  gallery = ARRAY[
    '/volante/volante-corpo.jpg',
    '/volante/volante-frontal.jpg',
    '/volante/volante-pasto.jpg',
    '/volante/volante-retrato.jpg',
    '/volante/volante-video.mp4'
  ]
WHERE name = 'Dose de Sêmen - VOLANTE MRA';
