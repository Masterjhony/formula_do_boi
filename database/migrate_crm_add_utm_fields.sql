-- Migração: adiciona campos completos de UTM/atribuição em crm_leads.
-- Já existem source/medium/campaign desde migrate_crm_add_sheets_fields.sql;
-- esta complementa com utm_content, utm_term, gclid, fbclid, referrer e landing_url.
-- Rodar no Supabase SQL Editor.

ALTER TABLE public.crm_leads
  ADD COLUMN IF NOT EXISTS utm_content TEXT,
  ADD COLUMN IF NOT EXISTS utm_term    TEXT,
  ADD COLUMN IF NOT EXISTS gclid       TEXT,
  ADD COLUMN IF NOT EXISTS fbclid      TEXT,
  ADD COLUMN IF NOT EXISTS referrer    TEXT,
  ADD COLUMN IF NOT EXISTS landing_url TEXT;

-- Backfill retroativo: leads que vieram da LP sem nenhuma atribuição capturada
-- recebem defaults indicando "tráfego direto da landing", para não ficar NULL.
-- Não inventa campanha — apenas marca a fonte conhecida (a própria LP).
UPDATE public.crm_leads
SET
  source   = COALESCE(source,   'formuladoboi.com'),
  medium   = COALESCE(medium,   'organic'),
  campaign = COALESCE(campaign, '(historical-no-utm)')
WHERE origem = 'landing-page'
  AND (source IS NULL OR medium IS NULL OR campaign IS NULL);
