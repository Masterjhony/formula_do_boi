-- ============================================================
-- Reclassificação de Categorias de Animais
--
-- Categorias DEFINITIVAS do sistema:
--   Touro | Matriz | Doadora | Matriz prenha | Matriz parida | Matriz prenha e parida
--
-- Demais categorias são reclassificadas conforme lógica abaixo.
-- ============================================================

-- Novilha → Matriz
-- (novilha é uma fêmea bovina jovem, antes do primeiro parto — pertence ao grupo Matriz)
UPDATE public.products SET category = 'Matriz'   WHERE category IN ('Novilha', 'Novilha PO');

-- Sêmen e Embrião: material genético (não são animais vivos), mantidos como estão
-- pois são usados nos filtros das páginas do site (/semens, /embrioes)

-- Garantir consistência de capitalização em variações que possam existir
UPDATE public.products SET category = 'Touro'                   WHERE category ILIKE 'touro' AND category != 'Touro';
UPDATE public.products SET category = 'Matriz'                  WHERE category ILIKE 'matriz' AND category NOT IN ('Matriz prenha','Matriz parida','Matriz prenha e parida','Doadora');
UPDATE public.products SET category = 'Doadora'                 WHERE category ILIKE 'doadora' AND category != 'Doadora';
UPDATE public.products SET category = 'Matriz prenha'           WHERE category ILIKE 'matriz prenha' AND category NOT IN ('Matriz prenha e parida','Matriz prenha');
UPDATE public.products SET category = 'Matriz parida'           WHERE category ILIKE 'matriz parida' AND category NOT IN ('Matriz prenha e parida','Matriz parida');
UPDATE public.products SET category = 'Matriz prenha e parida'  WHERE category ILIKE 'matriz prenha e parida' AND category != 'Matriz prenha e parida';

-- Verificar resultado
SELECT category, COUNT(*) AS total
FROM public.products
GROUP BY category
ORDER BY total DESC;
