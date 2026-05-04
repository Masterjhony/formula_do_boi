-- ============================================================
-- ClickSign — integração de assinatura eletrônica
-- Acrescenta colunas em tactical_contracts para vincular cada
-- contrato local a um documento no ClickSign e armazenar status
-- e dados dos signatários.
--
-- Execute este script no SQL Editor do Supabase Dashboard.
-- ============================================================

ALTER TABLE tactical_contracts
    ADD COLUMN IF NOT EXISTS clicksign_document_key TEXT,
    ADD COLUMN IF NOT EXISTS clicksign_status       TEXT,
    ADD COLUMN IF NOT EXISTS clicksign_url          TEXT,
    ADD COLUMN IF NOT EXISTS clicksign_signers      JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS clicksign_sent_at      TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS clicksign_finished_at  TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS clicksign_signed_url   TEXT;

CREATE INDEX IF NOT EXISTS idx_tactical_contracts_clicksign_key
    ON tactical_contracts (clicksign_document_key);
