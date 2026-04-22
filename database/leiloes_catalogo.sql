-- ============================================================
-- LEILÕES — Adiciona campo catalogo_url à tabela bula_leiloes
-- Executar no Supabase SQL Editor
-- ============================================================

ALTER TABLE public.bula_leiloes
    ADD COLUMN IF NOT EXISTS catalogo_url TEXT DEFAULT NULL;

COMMENT ON COLUMN public.bula_leiloes.catalogo_url IS 'URL pública do catálogo do leilão (PDF, link externo, etc.)';
