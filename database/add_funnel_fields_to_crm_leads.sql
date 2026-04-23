-- Sales Funnel support: allow leads to belong to a specific funnel,
-- track monetary value and win probability for pipeline forecasting.
--
-- Funnels are stored in site_settings.crm_config (JSONB) — funnel_id here is a
-- free-form reference to one of those entries (default: 'default').

ALTER TABLE crm_leads
    ADD COLUMN IF NOT EXISTS funnel_id TEXT DEFAULT 'default',
    ADD COLUMN IF NOT EXISTS valor_estimado NUMERIC(14, 2),
    ADD COLUMN IF NOT EXISTS probabilidade SMALLINT;

CREATE INDEX IF NOT EXISTS idx_crm_leads_funnel_id ON crm_leads(funnel_id);

UPDATE crm_leads SET funnel_id = 'default' WHERE funnel_id IS NULL;

COMMENT ON COLUMN crm_leads.funnel_id IS 'FK to site_settings.crm_config -> funnels[].id';
COMMENT ON COLUMN crm_leads.valor_estimado IS 'Expected deal value in BRL';
COMMENT ON COLUMN crm_leads.probabilidade IS 'Win probability (0-100), overrides stage default if set';
