-- ============================================================
-- Adiciona coluna `img` ao cronograma_leiloes
-- (capa do leilão exibida no card unificado / tabela)
-- Idempotente.
-- ============================================================

ALTER TABLE cronograma_leiloes
  ADD COLUMN IF NOT EXISTS img TEXT;
