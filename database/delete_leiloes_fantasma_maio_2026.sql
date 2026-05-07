-- ============================================================
-- Limpeza — leilões fantasmas em Maio/2026
--
-- Origem: dois cards apareciam na agenda pública (/agenda) que
-- o chefe (Marcelo Carneiro) confirmou em 07/05 que NÃO existem:
--   • Fazenda Santa Clara — 10/05 — TOUROS P.O. — 60 animais
--   • Nelore Elite - Femeas — 18/05 — FEMEAS P.O. — 40 animais
--
-- Ambos vieram de seed sintética (IDs com prefixo 33333333-...) em
-- bula_leiloes. Não havia linha correspondente em cronograma_leiloes.
--
-- Idempotente: DELETE por ID nos seeds. Se rodar duas vezes, só
-- a primeira faz efeito.
-- ============================================================

DELETE FROM public.bula_leiloes
WHERE id IN (
  '33333333-0005-0000-0000-000000000000', -- Fazenda Santa Clara — 10/05
  '33333333-0006-0000-0000-000000000000'  -- Nelore Elite - Femeas — 18/05
);

-- Cinto+suspensório: apaga também por (data, nome) caso a próxima
-- importação recrie esses registros com novo UUID.
DELETE FROM public.bula_leiloes
WHERE data = '2026-05-10' AND nome ILIKE '%santa clara%';

DELETE FROM public.bula_leiloes
WHERE data = '2026-05-18'
  AND (nome ILIKE '%nelore elite%' OR nome ILIKE '%elite - femeas%' OR nome ILIKE '%elite femeas%');
