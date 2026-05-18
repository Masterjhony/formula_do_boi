-- ============================================================
-- CATÁLOGOS WHATSAPP — automação que monitora grupos para
-- detectar PDFs de catálogo de leilão e anexar ao cronograma.
--
-- Roda numa SEGUNDA sessão Baileys no VPS (container separado,
-- porta 3002, número diferente). Não toca na Central WhatsApp.
--
-- Executar uma vez no SQL Editor do Supabase.
-- ============================================================

-- 1) Coluna de catálogo no cronograma de leilões
-- ------------------------------------------------------------
ALTER TABLE public.cronograma_leiloes
    ADD COLUMN IF NOT EXISTS catalogo_url        TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS catalogo_anexado_em TIMESTAMPTZ DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS catalogo_origem     TEXT DEFAULT NULL;

COMMENT ON COLUMN public.cronograma_leiloes.catalogo_url IS 'URL pública (R2 presigned ou externa) do PDF do catálogo do leilão';
COMMENT ON COLUMN public.cronograma_leiloes.catalogo_anexado_em IS 'Quando o catálogo foi anexado pela última vez';
COMMENT ON COLUMN public.cronograma_leiloes.catalogo_origem IS 'whatsapp-bula | whatsapp-academia | manual | outro';


-- 2) Grupos monitorados (config dinâmica via UI)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.whatsapp_catalog_groups (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jid          TEXT UNIQUE NOT NULL,            -- ex: "120363012345678901@g.us"
    nome         TEXT NOT NULL,                   -- "Bula Assessoria | Assessores"
    slug         TEXT,                            -- "bula-assessoria" | "academia-nelore-po"
    ativo        BOOLEAN NOT NULL DEFAULT TRUE,
    descricao    TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_whatsapp_catalog_groups_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_wa_catalog_groups_updated_at ON public.whatsapp_catalog_groups;
CREATE TRIGGER trg_wa_catalog_groups_updated_at
    BEFORE UPDATE ON public.whatsapp_catalog_groups
    FOR EACH ROW EXECUTE FUNCTION update_whatsapp_catalog_groups_updated_at();

ALTER TABLE public.whatsapp_catalog_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage catalog groups" ON public.whatsapp_catalog_groups;
CREATE POLICY "Admins manage catalog groups"
    ON public.whatsapp_catalog_groups FOR ALL
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ));

-- Seeds iniciais (apenas o nome — o JID o operador adiciona depois pela UI).
INSERT INTO public.whatsapp_catalog_groups (nome, slug, descricao, jid, ativo)
VALUES
    ('Bula Assessoria | Assessores', 'bula-assessoria', 'Grupo dos assessores Bula — recebe catálogos antes do disparo', '', TRUE),
    ('Academia do Nelore P.O',       'academia-nelore-po', 'Comunidade Academia do Nelore P.O — catálogos de leilões parceiros', '', TRUE)
ON CONFLICT (jid) DO NOTHING;


-- 3) Detecções de PDF (uma linha por arquivo recebido)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.whatsapp_catalog_detections (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    received_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Origem
    group_jid         TEXT NOT NULL,                       -- "...@g.us"
    group_name        TEXT,                                -- snapshot do nome do grupo
    sender_jid        TEXT,                                -- "554999...@s.whatsapp.net"
    sender_name       TEXT,                                -- pushName do remetente
    message_id        TEXT,                                -- id da mensagem original (idempotência)

    -- Arquivo
    file_name         TEXT NOT NULL,                       -- "Catalogo Mega EAO 2026.pdf"
    file_mime         TEXT,
    file_size         INTEGER,
    r2_key            TEXT,                                -- key no R2 ex: "libmedia/catalogos-whatsapp/2026/05/<uuid>.pdf"

    -- Matching com cronograma_leiloes
    match_status      TEXT NOT NULL DEFAULT 'pending',     -- pending | matched | ambiguous | no_match | attached | manual
    match_score       NUMERIC(5,2),                        -- 0..100 (similaridade)
    match_method      TEXT,                                -- "filename_fuzzy" | "filename_exact" | "manual"
    cronograma_id     UUID REFERENCES public.cronograma_leiloes(id) ON DELETE SET NULL,
    candidates        JSONB,                               -- top-N candidatos com score, pro operador escolher manualmente

    -- Anexação
    attached          BOOLEAN NOT NULL DEFAULT FALSE,
    attached_at       TIMESTAMPTZ,
    attached_by       TEXT,                                -- "auto" | user_id (uuid)
    overwrote_existing BOOLEAN NOT NULL DEFAULT FALSE,     -- se substituiu catalogo_url anterior

    -- Diagnóstico
    error             TEXT,                                -- se algo deu errado no fluxo
    notes             TEXT,

    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wa_catalog_detections_received  ON public.whatsapp_catalog_detections (received_at DESC);
CREATE INDEX IF NOT EXISTS idx_wa_catalog_detections_status    ON public.whatsapp_catalog_detections (match_status);
CREATE INDEX IF NOT EXISTS idx_wa_catalog_detections_group     ON public.whatsapp_catalog_detections (group_jid);
CREATE INDEX IF NOT EXISTS idx_wa_catalog_detections_msg       ON public.whatsapp_catalog_detections (message_id);
CREATE INDEX IF NOT EXISTS idx_wa_catalog_detections_cronograma ON public.whatsapp_catalog_detections (cronograma_id);

CREATE OR REPLACE FUNCTION update_whatsapp_catalog_detections_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_wa_catalog_detections_updated_at ON public.whatsapp_catalog_detections;
CREATE TRIGGER trg_wa_catalog_detections_updated_at
    BEFORE UPDATE ON public.whatsapp_catalog_detections
    FOR EACH ROW EXECUTE FUNCTION update_whatsapp_catalog_detections_updated_at();

ALTER TABLE public.whatsapp_catalog_detections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage catalog detections" ON public.whatsapp_catalog_detections;
CREATE POLICY "Admins manage catalog detections"
    ON public.whatsapp_catalog_detections FOR ALL
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ));


-- 4) Pausa global da segunda sessão (espelha o padrão da Central)
-- ------------------------------------------------------------
INSERT INTO public.site_settings (key, value)
VALUES ('whatsapp_catalogs_paused', '{"paused": false, "paused_at": null, "paused_by": null}'::jsonb)
ON CONFLICT (key) DO NOTHING;
