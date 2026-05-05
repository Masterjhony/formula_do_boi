-- ============================================================
-- AGENDA — catálogos para os primeiros leilões publicados
-- 1. Adiciona catalogo_url em cronograma_leiloes (espelho do que
--    bula_leiloes já tem em database/leiloes_catalogo.sql)
-- 2. Aponta MATINHA EMBRIO (cronograma) e GRUPO RIBALTA
--    (bula + cronograma) para os PDFs em /public/catalogos/.
-- Idempotente: só atualiza linhas com catalogo_url ainda nulo/vazio.
-- ============================================================

ALTER TABLE public.cronograma_leiloes
    ADD COLUMN IF NOT EXISTS catalogo_url TEXT DEFAULT NULL;

COMMENT ON COLUMN public.cronograma_leiloes.catalogo_url IS 'URL pública do catálogo do leilão (PDF, link externo, etc.)';

-- MATINHA EMBRIO — só existe em cronograma_leiloes (2026-05-05)
UPDATE public.cronograma_leiloes
SET catalogo_url = '/catalogos/matinha-embrio.pdf'
WHERE data = '2026-05-05'
  AND nome ILIKE '%MATINHA EMBRIO%'
  AND (catalogo_url IS NULL OR catalogo_url = '');

-- GRUPO RIBALTA — existe em ambas (2026-05-13)
UPDATE public.bula_leiloes
SET catalogo_url = '/catalogos/grupo-ribalta-60-anos.pdf'
WHERE data = '2026-05-13'
  AND nome ILIKE '%Ribalta%'
  AND (catalogo_url IS NULL OR catalogo_url = '');

UPDATE public.cronograma_leiloes
SET catalogo_url = '/catalogos/grupo-ribalta-60-anos.pdf'
WHERE data = '2026-05-13'
  AND nome ILIKE '%RIBALTA%'
  AND (catalogo_url IS NULL OR catalogo_url = '');
