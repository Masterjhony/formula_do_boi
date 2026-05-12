-- ============================================================================
-- whatsapp_flows: settings JSONB + last_activated_at
-- ============================================================================
-- Data: 2026-05-12
--
-- Adiciona:
--   settings           — bag de parâmetros do fluxo (rate limit, horário
--                        permitido, fuso, fallback template, etc). Lidos pelo
--                        engine quando o fluxo está ativo. Default '{}'::jsonb
--                        para nunca quebrar reads existentes.
--   last_activated_at  — quando o fluxo virou ativo pela última vez.
--                        Preenchido pelo endpoint /activate.
--
-- A migration é idempotente: usa ADD COLUMN IF NOT EXISTS.
-- ============================================================================

ALTER TABLE public.whatsapp_flows
    ADD COLUMN IF NOT EXISTS settings JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.whatsapp_flows
    ADD COLUMN IF NOT EXISTS last_activated_at TIMESTAMPTZ;

-- Backfill: marca last_activated_at = updated_at para o fluxo ativo (única
-- estimativa razoável). Linhas inativas ficam NULL.
UPDATE public.whatsapp_flows
SET last_activated_at = updated_at
WHERE is_active = true AND last_activated_at IS NULL;

COMMENT ON COLUMN public.whatsapp_flows.settings IS
    'Parâmetros do fluxo (rate limit, horário, fuso, etc). JSONB livre — o engine só lê chaves conhecidas.';

COMMENT ON COLUMN public.whatsapp_flows.last_activated_at IS
    'Última vez que este fluxo foi ativado via /activate. Útil pra histórico/rollback.';
