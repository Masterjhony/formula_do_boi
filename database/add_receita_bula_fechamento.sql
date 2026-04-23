-- ============================================================
-- ADD receita_bula + sobra_bruta — Integração ERP × Fechamentos
-- ============================================================
-- receita_bula  → receita da leiloeira/assessoria (CONTA A RECEBER)
-- sobra_bruta   → receita_bula − comissao_assessoria (margem líquida esperada)
-- ============================================================

ALTER TABLE public.bula_leilao_fechamento
  ADD COLUMN IF NOT EXISTS receita_bula NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sobra_bruta  NUMERIC(12,2) DEFAULT 0;

-- Seed — valores extraídos das planilhas de fechamento (abril/2026)
-- Observações das planilhas mencionam os cálculos:
--   MRA     — participação apenas; sem receita p/ Bula
--   Pérolas — 1% Bula Assessoria × R$ 1,34 MM = R$ 13.400
--   JMP     — 0,5% × R$ 10,37 MM (acordo especial) = R$ 51.872
--   IPB     — 1% × R$ 1,31 MM = R$ 13.060,80

UPDATE public.bula_leilao_fechamento
SET receita_bula = 0,
    sobra_bruta  = 0
WHERE nome = 'Nelore MRA – 50 Anos de Seleção';

UPDATE public.bula_leilao_fechamento
SET receita_bula = 13400,
    sobra_bruta  = 13400 - COALESCE(comissao_assessoria, 0)
WHERE nome = 'Leilão Pérolas Cachoeirão';

UPDATE public.bula_leilao_fechamento
SET receita_bula = 51872,
    sobra_bruta  = 51872 - COALESCE(comissao_assessoria, 0)
WHERE nome = 'Leilão JMP Supreme';

UPDATE public.bula_leilao_fechamento
SET receita_bula = 13060.80,
    sobra_bruta  = 13060.80 - COALESCE(comissao_assessoria, 0)
WHERE nome = 'Leilão IPB Prime';
