-- ============================================================================
-- Meta Ads Insights — investimento, leads e CPL das campanhas do Meta (Facebook/Instagram)
-- ============================================================================
-- Data: 2026-05-22
--
-- Arquitetura: o conector MCP do Meta Ads roda apenas dentro do Claude Code —
-- o app publicado na Vercel NÃO consegue chamá-lo, e a conta Meta Business da
-- empresa não tem token de API exposto ao app. Portanto esta tabela é um
-- ESPELHO (snapshot) dos números do Meta Ads, atualizado manualmente.
--
-- Como atualizar: rodar a query de insights pelo MCP do Meta, regerar o bloco
-- de UPSERT abaixo com os números novos e reaplicar este arquivo no Supabase
-- (o UPSERT é idempotente — ON CONFLICT atualiza a linha existente).
--
-- O painel /web-admin/vendas-marketing lê esta tabela e renderiza a seção
-- "Investimento em Mídia · Meta Ads" (investimento total, leads, CPL e quebra
-- por campanha). O campo cpl é GERADO (investimento / leads) — nunca inserir
-- à mão, o Postgres recalcula sozinho.
-- ============================================================================


CREATE TABLE IF NOT EXISTS public.meta_ads_insights (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identificação na conta Meta
    meta_account_id TEXT NOT NULL,                       -- ad account id numérico
    account_name    TEXT,

    -- Escopo da linha
    scope           TEXT NOT NULL DEFAULT 'campaign',    -- 'account' (agregado) | 'campaign'
    campaign_id     TEXT NOT NULL DEFAULT '',            -- '' para a linha agregada da conta
    campaign_name   TEXT,

    -- Janela de tempo do snapshot
    period          TEXT NOT NULL DEFAULT 'lifetime',    -- 'lifetime' | 'last_30d' | ...
    date_start      DATE,
    date_stop       DATE,

    -- Métricas
    investimento    NUMERIC(14,2) NOT NULL DEFAULT 0,    -- amount_spent (BRL)
    leads           INTEGER       NOT NULL DEFAULT 0,    -- leads atribuídos
    cpl             NUMERIC(14,2)                        -- custo por lead = investimento / leads
                    GENERATED ALWAYS AS (
                        CASE WHEN leads > 0 THEN ROUND(investimento / leads, 2) ELSE NULL END
                    ) STORED,
    impressions     BIGINT        NOT NULL DEFAULT 0,
    clicks          BIGINT        NOT NULL DEFAULT 0,
    cpc             NUMERIC(14,2),                       -- custo por clique (BRL)
    ctr             NUMERIC(8,4),                        -- click-through rate (%)
    reach           BIGINT,

    -- Telemetria
    captured_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- quando os números foram puxados do Meta
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT meta_ads_insights_scope_chk CHECK (scope IN ('account','campaign')),
    CONSTRAINT meta_ads_insights_uniq UNIQUE (meta_account_id, scope, campaign_id, period)
);

CREATE INDEX IF NOT EXISTS meta_ads_insights_scope_idx   ON public.meta_ads_insights (scope);
CREATE INDEX IF NOT EXISTS meta_ads_insights_period_idx  ON public.meta_ads_insights (period);
CREATE INDEX IF NOT EXISTS meta_ads_insights_account_idx ON public.meta_ads_insights (meta_account_id);

-- updated_at auto (reaproveita função existente; se não existir, cria local)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'touch_updated_at'
    ) THEN
        CREATE OR REPLACE FUNCTION public.touch_updated_at()
        RETURNS TRIGGER AS $f$
        BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
        $f$ LANGUAGE plpgsql;
    END IF;
END $$;

DROP TRIGGER IF EXISTS trg_meta_ads_insights_updated_at ON public.meta_ads_insights;
CREATE TRIGGER trg_meta_ads_insights_updated_at
    BEFORE UPDATE ON public.meta_ads_insights
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- RLS
ALTER TABLE public.meta_ads_insights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "meta_ads_insights_full_access" ON public.meta_ads_insights;
CREATE POLICY "meta_ads_insights_full_access"
    ON public.meta_ads_insights FOR ALL
    USING (auth.role() = 'service_role' OR auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');


-- ────────────────────────────────────────────────────────────────────────────
-- SNAPSHOT — conta "Formula do Boi!" (1630761758131744)
-- Puxado do Meta Ads em 2026-05-22 · período lifetime (14/abr → 22/mai/2026)
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO public.meta_ads_insights
    (meta_account_id, account_name, scope, campaign_id, campaign_name,
     period, date_start, date_stop,
     investimento, leads, impressions, clicks, cpc, ctr, reach, captured_at)
VALUES
    -- Agregado da conta
    ('1630761758131744', 'Formula do Boi!', 'account', '', NULL,
     'lifetime', '2026-04-14', '2026-05-22',
     1335.06, 239, 186986, 2891, 0.46, 1.5500, 114856, '2026-05-22T12:00:00-03:00'),

    -- Campanhas
    ('1630761758131744', 'Formula do Boi!', 'campaign', '120243615606640276', 'FB - funil whatsapp',
     'lifetime', '2026-04-14', '2026-05-22',
     585.90, 162, 55098, 1285, 0.46, 2.3300, NULL, '2026-05-22T12:00:00-03:00'),

    ('1630761758131744', 'Formula do Boi!', 'campaign', '120244004122060276', 'FB - funil whatsapp - TESTE',
     'lifetime', '2026-04-14', '2026-05-22',
     345.24, 69, 32900, 684, 0.50, 2.0800, NULL, '2026-05-22T12:00:00-03:00'),

    ('1630761758131744', 'Formula do Boi!', 'campaign', '120244656421870276', 'FB Atacanta-da-Matinha',
     'lifetime', '2026-04-14', '2026-05-22',
     303.10, 8, 22137, 726, 0.42, 3.2800, NULL, '2026-05-22T12:00:00-03:00'),

    ('1630761758131744', 'Formula do Boi!', 'campaign', '120244759103070276', 'FB | Leilao 09/05',
     'lifetime', '2026-04-14', '2026-05-22',
     100.82, 0, 76851, 196, 0.51, 0.2600, 68961, '2026-05-22T12:00:00-03:00')
ON CONFLICT (meta_account_id, scope, campaign_id, period) DO UPDATE SET
    account_name  = EXCLUDED.account_name,
    campaign_name = EXCLUDED.campaign_name,
    date_start    = EXCLUDED.date_start,
    date_stop     = EXCLUDED.date_stop,
    investimento  = EXCLUDED.investimento,
    leads         = EXCLUDED.leads,
    impressions   = EXCLUDED.impressions,
    clicks        = EXCLUDED.clicks,
    cpc           = EXCLUDED.cpc,
    ctr           = EXCLUDED.ctr,
    reach         = EXCLUDED.reach,
    captured_at   = EXCLUDED.captured_at;
