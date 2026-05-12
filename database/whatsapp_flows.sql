-- ============================================================================
-- Múltiplos fluxos nomeados — cada um é um grafo completo (inbound + new_lead),
-- com EXATAMENTE um marcado como ativo. Inbound e render-welcome consultam o
-- ativo. Operador pode criar variantes (A/B, sazonais) e trocar o ativo em
-- 1 clique.
-- ============================================================================
-- Data: 2026-05-12
--
-- Migração suave: copia o `site_settings.whatsapp_flow_v2` (se existir) pra
-- uma linha nessa tabela chamada "Padrão" com is_active=true. Se a chave não
-- existir no site_settings, criamos a linha sem grafo (a leitura via lib
-- cai no buildDefaultGraph() do código).
--
-- Os endpoints /api/whatsapp/inbound e /api/whatsapp/render-welcome passam a:
--   1. carregar o fluxo ativo desta tabela
--   2. cair no site_settings.whatsapp_flow_v2 se nada estiver ativo (compat)
--   3. cair no buildDefaultGraph() se nem isso existir
-- ============================================================================


CREATE TABLE IF NOT EXISTS public.whatsapp_flows (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT,
    graph       JSONB NOT NULL,
    is_active   BOOLEAN NOT NULL DEFAULT false,
    created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.whatsapp_flows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wa_flows_full_access" ON public.whatsapp_flows;
CREATE POLICY "wa_flows_full_access"
    ON public.whatsapp_flows FOR ALL
    USING (auth.role() = 'service_role' OR auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- Garante UM único ativo. Constraint parcial: só impede 2 linhas com
-- is_active=true (NULLs/false podem repetir). Toggling ativo é
-- "desativa todos, ativa o escolhido" — feito em transação na API.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_wa_flows_one_active
    ON public.whatsapp_flows (is_active)
    WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_wa_flows_active ON public.whatsapp_flows (is_active);

DROP TRIGGER IF EXISTS trg_wa_flows_updated ON public.whatsapp_flows;
CREATE TRIGGER trg_wa_flows_updated
    BEFORE UPDATE ON public.whatsapp_flows
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


-- ────────────────────────────────────────────────────────────────────────────
-- Seed: copia o grafo atual de site_settings.whatsapp_flow_v2 (se existir)
-- pra uma linha "Padrão" com is_active=true. Só executa se a tabela está
-- vazia (idempotente).
-- ────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
    v_count INT;
    v_graph JSONB;
BEGIN
    SELECT COUNT(*) INTO v_count FROM public.whatsapp_flows;
    IF v_count > 0 THEN
        RAISE NOTICE 'whatsapp_flows já tem dados — pulando seed.';
        RETURN;
    END IF;

    SELECT value INTO v_graph
    FROM public.site_settings
    WHERE key = 'whatsapp_flow_v2'
    LIMIT 1;

    -- Mesmo sem grafo persistido, criamos a linha Padrão com placeholder.
    -- A lib whatsapp-flows.ts detecta isso e usa buildDefaultGraph() em runtime.
    INSERT INTO public.whatsapp_flows (name, description, graph, is_active)
    VALUES (
        'Padrão',
        'Fluxo padrão criado na migração — herda o grafo anterior em site_settings.whatsapp_flow_v2 (ou o buildDefaultGraph() do código se não houver).',
        COALESCE(v_graph, '{"version":2,"startId":"start","nodes":[],"edges":[]}'::jsonb),
        true
    );
END $$;
