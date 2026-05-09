-- ============================================================
-- CRM — Sinais de qualificação completos vindos das planilhas-fonte
-- (Backup leads → Pag-zap e Backup leads → Leads-GP).
--
-- Antes desta migração, o "momento na pecuária" (col. PERFIL na
-- Pag-zap / "Momento Pecuária" na Leads-GP) era atirado para dentro
-- de `notes` (LP) ou colado em `interesse` (webhook), causando
-- impureza e impedindo filtros consistentes na Qualificação.
--
-- Esta migração:
--   1) Cria colunas dedicadas para cada coluna relevante das duas
--      planilhas que ainda não tinha lugar.
--   2) Faz backfill assertivo a partir do que já existe (parse
--      do bloco "Momento na pecuária: …" gravado em `notes`,
--      cálculo de MQL a partir de `quantidade_animais`).
-- ============================================================

ALTER TABLE public.crm_leads
  ADD COLUMN IF NOT EXISTS momento_pecuaria      TEXT,
  ADD COLUMN IF NOT EXISTS intencao_investimento TEXT,
  ADD COLUMN IF NOT EXISTS assessoria            TEXT,
  ADD COLUMN IF NOT EXISTS is_mql                BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.crm_leads.momento_pecuaria
  IS 'PERFIL na Pag-zap / "Momento Pecuária" na Leads-GP (ex.: pecuaria-de-corte, corte-e-po, criador-renomado-po)';
COMMENT ON COLUMN public.crm_leads.intencao_investimento
  IS 'Coluna F (Pag-zap): faixa de investimento declarada na LP (ex.: acima-50k, nao-sei). Reservada para reativação do campo no quiz.';
COMMENT ON COLUMN public.crm_leads.assessoria
  IS 'Coluna I (Pag-zap): interesse declarado em assessoria (ex.: sim, nao, talvez). Reservada para reativação do campo no quiz.';
COMMENT ON COLUMN public.crm_leads.is_mql
  IS 'Marketing Qualified Lead — true quando o lead se enquadra no critério canônico (>=100 cabeças). Usado para destaque na Qualificação.';

-- ===== Backfill 1: extrai "Momento na pecuária" das notas legadas =====
-- O LP route grava em notes uma linha "Momento na pecuária: <valor>".
-- Recupera essas para popular a coluna estruturada sem perder histórico.
UPDATE public.crm_leads
SET momento_pecuaria = trim(substring(notes from 'Momento na pecu.{1,3}ria:\s*([^\n\r]+)'))
WHERE momento_pecuaria IS NULL
  AND notes IS NOT NULL
  AND notes ~ 'Momento na pecu.{1,3}ria:';

-- ===== Backfill 2: webhook antigo guardou "Momento Pecuária" em interesse =====
-- Para os leads importados via /api/webhooks/google-sheets, o campo
-- `interesse` ficou com valores como "Crio gado comercial e quero
-- começar no PO". Migra para momento_pecuaria preservando interesse
-- como fallback ainda visível.
UPDATE public.crm_leads
SET momento_pecuaria = interesse
WHERE momento_pecuaria IS NULL
  AND interesse IS NOT NULL
  AND interesse <> ''
  AND (
    interesse ILIKE '%pecu%' OR
    interesse ILIKE '%criador%' OR
    interesse ILIKE '%comercial%' OR
    interesse ILIKE 'corte-e-po' OR
    interesse ILIKE 'pecuaria-de-corte' OR
    interesse ILIKE 'criador-renomado-po' OR
    interesse ILIKE 'nao-trabalho-quero-aprender'
  );

-- ===== Backfill 3: marca MQL retroativo conforme regra do quiz =====
-- Critério canônico do `public/lp/index.html`:
--   MQL_QCABECAS = ['100-300', '300-500', '500+']
-- (origem: ≥100 cabeças). Aplica a mesma regra para leads existentes.
UPDATE public.crm_leads
SET is_mql = true
WHERE is_mql = false
  AND quantidade_animais IS NOT NULL
  AND (
    quantidade_animais IN ('100-300', '300-500', '500+', '100 a 300', '300 a 500', '500 ou mais') OR
    quantidade_animais ~ '^([1-9][0-9]{2,}|[1-9][0-9]{3,})\s*$'  -- "100", "150", "1500" etc.
  );

CREATE INDEX IF NOT EXISTS idx_crm_leads_is_mql
  ON public.crm_leads (is_mql)
  WHERE is_mql = true;

CREATE INDEX IF NOT EXISTS idx_crm_leads_momento_pecuaria
  ON public.crm_leads (momento_pecuaria);
