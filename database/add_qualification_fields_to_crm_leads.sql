-- ============================================================
-- CRM — Campos para qualificação, contatos e leads preferenciais
-- ============================================================
-- contact_history  → log de interações (tipo, canal, data, observação)
-- is_preferencial  → flag manual para destaque no topo do CRM
-- contact_count    → cache (denormalizado) do número de contatos
-- ============================================================

ALTER TABLE public.crm_leads
  ADD COLUMN IF NOT EXISTS contact_history JSONB    NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_preferencial  BOOLEAN  NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS contact_count    INTEGER  NOT NULL DEFAULT 0;

-- Sincroniza contact_count com o tamanho de contact_history em registros existentes
UPDATE public.crm_leads
SET contact_count = COALESCE(jsonb_array_length(contact_history), 0)
WHERE contact_count IS NULL OR contact_count <> COALESCE(jsonb_array_length(contact_history), 0);

CREATE INDEX IF NOT EXISTS idx_crm_leads_is_preferencial
  ON public.crm_leads (is_preferencial)
  WHERE is_preferencial = true;

CREATE INDEX IF NOT EXISTS idx_crm_leads_status
  ON public.crm_leads (status);
