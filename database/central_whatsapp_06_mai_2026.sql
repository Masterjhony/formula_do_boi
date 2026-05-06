-- ============================================================================
-- Central WhatsApp — Camada de automação comercial sobre o CRM existente
-- ============================================================================
-- Data: 2026-05-06
--
-- Este script:
--   1. Estende crm_leads com flags da Central (opt-in, opt-out, handoff humano,
--      interesse identificado pelo bot, último contato WhatsApp).
--   2. Estende whatsapp_messages com direção (inbound/outbound) e corpo da
--      mensagem para tornar a tabela um log conversacional completo, sem criar
--      uma tabela paralela.
--   3. Cria whatsapp_templates (mensagens prontas reutilizáveis).
--   4. Cria whatsapp_campaigns + whatsapp_campaign_recipients para envios em
--      massa segmentados a partir do CRM.
--   5. Cria whatsapp_optouts como tabela de cache rápido por número (espelhada
--      em crm_leads.optout_whatsapp para integridade transversal).
--
-- O objetivo é que a Central use APENAS o CRM como fonte de verdade dos leads
-- — não criamos contatos paralelos. As tabelas novas só registram o que o CRM
-- não comporta naturalmente (conteúdo de mensagens, biblioteca de templates,
-- campanhas e respectivos destinatários).
-- ============================================================================


-- ────────────────────────────────────────────────────────────────────────────
-- 1) crm_leads — flags da Central WhatsApp
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.crm_leads
    -- Interesse principal identificado pelo bot (touros / matrizes / embrioes /
    -- semen / leiloes / venda_genetica / consultor / outro)
    ADD COLUMN IF NOT EXISTS interesse_principal TEXT,

    -- Tags comerciais livres (preenchidas pelo bot e/ou pela equipe)
    ADD COLUMN IF NOT EXISTS tags_whatsapp JSONB NOT NULL DEFAULT '[]'::jsonb,

    -- Última interação no WhatsApp (mensagem enviada ou recebida)
    ADD COLUMN IF NOT EXISTS last_whatsapp_at TIMESTAMPTZ,

    -- O lead pediu humano? Quando true, o bot pausa para esse contato
    ADD COLUMN IF NOT EXISTS handoff_humano BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS handoff_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS handoff_responsavel TEXT,

    -- Opt-out: lead não quer mais receber mensagens (atendido em qualquer envio)
    ADD COLUMN IF NOT EXISTS optout_whatsapp BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS optout_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_crm_leads_interesse_principal
    ON public.crm_leads (interesse_principal)
    WHERE interesse_principal IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_crm_leads_handoff_humano
    ON public.crm_leads (handoff_humano)
    WHERE handoff_humano = true;

CREATE INDEX IF NOT EXISTS idx_crm_leads_optout_whatsapp
    ON public.crm_leads (optout_whatsapp)
    WHERE optout_whatsapp = true;

COMMENT ON COLUMN public.crm_leads.interesse_principal IS
    'Interesse capturado pelo bot da Central WhatsApp (touros, matrizes, embrioes, semen, leiloes, venda_genetica, consultor, outro)';
COMMENT ON COLUMN public.crm_leads.handoff_humano IS
    'Quando true, o bot pausa atendimento automatizado para este contato.';
COMMENT ON COLUMN public.crm_leads.optout_whatsapp IS
    'Quando true, nenhum envio (welcome, campanha ou template) é disparado para este contato.';


-- ────────────────────────────────────────────────────────────────────────────
-- 2) whatsapp_messages — virar log conversacional (inbound + outbound)
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.whatsapp_messages
    -- Direção da mensagem (default outbound mantém compatibilidade com registros antigos)
    ADD COLUMN IF NOT EXISTS direction TEXT NOT NULL DEFAULT 'outbound',

    -- Corpo da mensagem (texto puro — anexos ficam fora do escopo desta v1)
    ADD COLUMN IF NOT EXISTS body TEXT,

    -- Origem do envio (lp, webhook, manual, campanha, template, bot)
    ADD COLUMN IF NOT EXISTS origin TEXT,

    -- ID da campanha, quando aplicável
    ADD COLUMN IF NOT EXISTS campaign_id UUID,

    -- ID do template, quando aplicável
    ADD COLUMN IF NOT EXISTS template_id UUID,

    -- Assistente comercial — identificador da etapa do fluxo no momento do envio
    ADD COLUMN IF NOT EXISTS bot_step TEXT;

ALTER TABLE public.whatsapp_messages
    ADD CONSTRAINT whatsapp_messages_direction_check
    CHECK (direction IN ('inbound', 'outbound'))
    NOT VALID;

ALTER TABLE public.whatsapp_messages
    VALIDATE CONSTRAINT whatsapp_messages_direction_check;

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_direction
    ON public.whatsapp_messages (direction);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_campaign
    ON public.whatsapp_messages (campaign_id) WHERE campaign_id IS NOT NULL;


-- ────────────────────────────────────────────────────────────────────────────
-- 3) whatsapp_templates — biblioteca de mensagens reutilizáveis
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.whatsapp_templates (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug        TEXT NOT NULL UNIQUE,            -- chave estável (ex: 'welcome', 'follow-up')
    title       TEXT NOT NULL,                   -- nome humano (ex: "Boas-vindas LP")
    category    TEXT NOT NULL DEFAULT 'geral',   -- welcome | triagem | oportunidade | leilao | follow_up | encaminhamento | optout | geral
    body        TEXT NOT NULL,                   -- corpo da mensagem (suporta {nome}, {responsavel}, etc)
    variables   JSONB NOT NULL DEFAULT '[]'::jsonb, -- array de variáveis usadas (informativo p/ UI)
    archived    BOOLEAN NOT NULL DEFAULT false,
    usage_count INTEGER NOT NULL DEFAULT 0,
    created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wa_templates_full_access" ON public.whatsapp_templates;
CREATE POLICY "wa_templates_full_access"
    ON public.whatsapp_templates FOR ALL
    USING (auth.role() = 'service_role' OR auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_category
    ON public.whatsapp_templates (category) WHERE archived = false;


-- ────────────────────────────────────────────────────────────────────────────
-- 4) whatsapp_campaigns — listas de transmissão segmentadas
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.whatsapp_campaigns (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name            TEXT NOT NULL,                     -- nome da campanha
    description     TEXT,
    -- Filtros JSON aplicados ao CRM para gerar o público (ex: {"interesse_principal":"touros"})
    segment         JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- Mensagem de envio: pode referenciar um template ou trazer corpo livre
    template_id     UUID REFERENCES public.whatsapp_templates(id) ON DELETE SET NULL,
    body            TEXT,                              -- usado quando template_id é null
    status          TEXT NOT NULL DEFAULT 'rascunho',  -- rascunho | enviando | concluida | cancelada | erro
    total_recipients INTEGER NOT NULL DEFAULT 0,
    sent_count      INTEGER NOT NULL DEFAULT 0,
    failed_count    INTEGER NOT NULL DEFAULT 0,
    optout_skip_count INTEGER NOT NULL DEFAULT 0,      -- pulados por opt-out
    started_at      TIMESTAMPTZ,
    finished_at     TIMESTAMPTZ,
    created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.whatsapp_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wa_campaigns_full_access" ON public.whatsapp_campaigns;
CREATE POLICY "wa_campaigns_full_access"
    ON public.whatsapp_campaigns FOR ALL
    USING (auth.role() = 'service_role' OR auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_whatsapp_campaigns_status
    ON public.whatsapp_campaigns (status);


-- ────────────────────────────────────────────────────────────────────────────
-- 5) whatsapp_campaign_recipients — destinatários por campanha
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.whatsapp_campaign_recipients (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id     UUID NOT NULL REFERENCES public.whatsapp_campaigns(id) ON DELETE CASCADE,
    lead_id         UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL,
    phone           TEXT NOT NULL,
    name            TEXT,
    status          TEXT NOT NULL DEFAULT 'pendente',  -- pendente | enviado | falhou | optout
    error_msg       TEXT,
    sent_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.whatsapp_campaign_recipients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wa_recipients_full_access" ON public.whatsapp_campaign_recipients;
CREATE POLICY "wa_recipients_full_access"
    ON public.whatsapp_campaign_recipients FOR ALL
    USING (auth.role() = 'service_role' OR auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_wa_recipients_campaign ON public.whatsapp_campaign_recipients (campaign_id);
CREATE INDEX IF NOT EXISTS idx_wa_recipients_status   ON public.whatsapp_campaign_recipients (status);


-- ────────────────────────────────────────────────────────────────────────────
-- 6) whatsapp_optouts — cache rápido por número (sem precisar de lead_id)
--    útil quando alguém escreve "PARAR" sem ter lead vinculado.
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.whatsapp_optouts (
    phone       TEXT PRIMARY KEY,                     -- só dígitos, sem +55
    reason      TEXT,
    lead_id     UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.whatsapp_optouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wa_optouts_full_access" ON public.whatsapp_optouts;
CREATE POLICY "wa_optouts_full_access"
    ON public.whatsapp_optouts FOR ALL
    USING (auth.role() = 'service_role' OR auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');


-- ────────────────────────────────────────────────────────────────────────────
-- 7) Trigger updated_at em whatsapp_templates / whatsapp_campaigns
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_whatsapp_templates_updated ON public.whatsapp_templates;
CREATE TRIGGER trg_whatsapp_templates_updated
    BEFORE UPDATE ON public.whatsapp_templates
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_whatsapp_campaigns_updated ON public.whatsapp_campaigns;
CREATE TRIGGER trg_whatsapp_campaigns_updated
    BEFORE UPDATE ON public.whatsapp_campaigns
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


-- ────────────────────────────────────────────────────────────────────────────
-- 8) Seed inicial — templates padrão da Fórmula do Boi
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO public.whatsapp_templates (slug, title, category, body, variables) VALUES
    (
        'welcome-default',
        'Boas-vindas (padrão)',
        'welcome',
        E'Olá {nome}! 👋\n\nAqui é da *Fórmula do Boi* — genética Nelore PO.\n\nPara te atender melhor, qual é o seu principal interesse?\n\n1️⃣ Touros\n2️⃣ Matrizes\n3️⃣ Embriões\n4️⃣ Sêmen\n5️⃣ Leilões\n6️⃣ Vender minha genética\n7️⃣ Falar com um consultor\n\nResponda apenas com o número.',
        '["nome"]'::jsonb
    ),
    (
        'triagem-touros',
        'Triagem · interesse em touros',
        'triagem',
        E'Excelente, {nome}! 🐂\n\nTrabalhamos com touros Nelore PO de elite. Pra te apresentar opções alinhadas com seu rebanho, me conta:\n\n• Quantas matrizes pretende cobrir?\n• Tem preferência por linhagem?\n\nLogo um consultor entra em contato.',
        '["nome"]'::jsonb
    ),
    (
        'triagem-matrizes',
        'Triagem · interesse em matrizes',
        'triagem',
        E'Ótima escolha, {nome}! 🐄\n\nTemos matrizes Nelore PO de programas top. Pra apresentar as melhores oportunidades, me diz:\n\n• Quantas matrizes está buscando?\n• Foco em produção, doadora ou registro?\n\nUm consultor entra em contato em seguida.',
        '["nome"]'::jsonb
    ),
    (
        'triagem-embrioes',
        'Triagem · interesse em embriões',
        'triagem',
        E'Bacana, {nome}! 🧬\n\nTemos lotes de embriões de doadoras provadas. Pra montar a melhor proposta:\n\n• Quantos embriões pretende implantar?\n• Tem preferência por touro ou doadora específica?',
        '["nome"]'::jsonb
    ),
    (
        'triagem-semen',
        'Triagem · interesse em sêmen',
        'triagem',
        E'Show, {nome}! 💉\n\nTrabalhamos com sêmen de touros provados. Pra te ajudar:\n\n• Quantas doses está buscando?\n• Algum touro ou linhagem em mente?',
        '["nome"]'::jsonb
    ),
    (
        'triagem-leiloes',
        'Triagem · interesse em leilões',
        'triagem',
        E'Perfeito, {nome}! 🔨\n\nTemos um cronograma ativo de leilões. Vou te mandar o link com os próximos eventos e datas, ok?\n\n👉 https://formuladoboi.com/agenda',
        '["nome"]'::jsonb
    ),
    (
        'triagem-venda-genetica',
        'Triagem · vender genética',
        'triagem',
        E'Interessante, {nome}! 🤝\n\nA Fórmula do Boi também avalia genética para revenda. Me passa:\n\n• Tipo do material (touro / matriz / embrião / sêmen)\n• Quantidade disponível\n• Linhagem principal\n\nUm consultor vai analisar e retornar.',
        '["nome"]'::jsonb
    ),
    (
        'consultor-handoff',
        'Encaminhamento para consultor',
        'encaminhamento',
        E'Beleza, {nome}! 👨‍💼\n\nVou te encaminhar agora pra um consultor da equipe comercial. Ele entra em contato em instantes por aqui mesmo.',
        '["nome"]'::jsonb
    ),
    (
        'follow-up-3d',
        'Follow-up 3 dias sem resposta',
        'follow_up',
        E'Oi {nome}, tudo bem? 🤠\n\nVi que conversamos por aqui há alguns dias. Posso te passar mais detalhes sobre {interesse} ou ajustar a busca pra outro tipo de animal?',
        '["nome", "interesse"]'::jsonb
    ),
    (
        'aviso-leilao',
        'Aviso de leilão',
        'leilao',
        E'🔨 *Leilão Fórmula do Boi*\n\n{nome}, próximo leilão chegando: *{leilao_nome}* em *{leilao_data}*.\n\nConfira o catálogo e participe:\n👉 {leilao_link}',
        '["nome", "leilao_nome", "leilao_data", "leilao_link"]'::jsonb
    ),
    (
        'optout-confirmacao',
        'Confirmação de opt-out',
        'optout',
        E'Tudo certo, {nome}. Você foi removido(a) da nossa lista de envios automáticos. ✅\n\nSe mudar de ideia, é só responder *VOLTAR* a qualquer momento.',
        '["nome"]'::jsonb
    )
ON CONFLICT (slug) DO NOTHING;
