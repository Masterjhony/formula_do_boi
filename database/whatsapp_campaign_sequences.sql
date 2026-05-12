-- ============================================================================
-- Campanhas multi-step (sequência, follow-up, regras de parada, reação)
-- ============================================================================
-- Data: 2026-05-12
--
-- Estende a aba "Campanhas" pra cobrir tudo que é específico de campanha,
-- conforme o desenho aprovado:
--   - Sequência: 1+ passos (cada um com delay relativo ao passo anterior)
--   - Follow-up: passos adicionais quando o lead não responde
--   - Regras de parada: para a sequência se lead responder / opt-out / handoff
--   - Reação à resposta: tag aplicada / handoff humano automático quando
--     o lead responder durante a janela da campanha
--
-- O passo 0 (canônico) é o conteúdo já gravado em `whatsapp_campaigns` (body
-- + template_id + media_*). Passos adicionais ficam em `whatsapp_campaign_steps`,
-- agendados via `whatsapp_campaign_recipients.next_send_at` e processados por
-- um endpoint cron que roda a cada poucos minutos.
-- ============================================================================


-- ────────────────────────────────────────────────────────────────────────────
-- 1) whatsapp_campaigns — regras de parada e reação à resposta
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.whatsapp_campaigns
    -- Regras de parada por destinatário (default = comportamento conservador)
    ADD COLUMN IF NOT EXISTS stop_on_reply    BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS stop_on_optout   BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS stop_on_handoff  BOOLEAN NOT NULL DEFAULT true,
    -- "interesse adquirido": o engine setou interesse_principal durante a janela
    -- da campanha — sinal de qualificação, geralmente vale parar o follow-up
    ADD COLUMN IF NOT EXISTS stop_on_interest BOOLEAN NOT NULL DEFAULT false,

    -- Reação à resposta (aplicada UMA vez quando o lead responde durante a
    -- janela ativa da campanha — antes de a sequência parar via stop_on_reply)
    ADD COLUMN IF NOT EXISTS reply_tag        TEXT,         -- ex: "campanha:leilao-maio:respondeu"
    ADD COLUMN IF NOT EXISTS reply_handoff    BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.whatsapp_campaigns.stop_on_reply IS
    'Para a sequência de follow-ups deste destinatário assim que ele responder qualquer mensagem.';
COMMENT ON COLUMN public.whatsapp_campaigns.stop_on_optout IS
    'Para a sequência se o lead virar opt-out (PARAR, etc) — geralmente fica true por compliance.';
COMMENT ON COLUMN public.whatsapp_campaigns.stop_on_handoff IS
    'Para a sequência se um operador colocar o lead em handoff humano (via Inbox ou /api/whatsapp/central/lead-action).';
COMMENT ON COLUMN public.whatsapp_campaigns.stop_on_interest IS
    'Para a sequência quando o engine grava interesse_principal — sinal forte de qualificação.';
COMMENT ON COLUMN public.whatsapp_campaigns.reply_tag IS
    'Tag aplicada em crm_leads.tags_whatsapp quando o lead responder durante a janela ativa da campanha. Útil pra segmentar follow-ups manuais depois.';
COMMENT ON COLUMN public.whatsapp_campaigns.reply_handoff IS
    'Quando true, marca handoff_humano=true automaticamente se o lead responder. Use pra campanhas pequenas/quentes onde o operador prefere conduzir manualmente.';


-- ────────────────────────────────────────────────────────────────────────────
-- 2) whatsapp_campaign_steps — sequência de envios (passos 1+, follow-ups)
-- ────────────────────────────────────────────────────────────────────────────
-- O passo 0 é sempre o conteúdo da própria campanha (body/template_id/media_*).
-- Esta tabela armazena passos 1, 2, 3... cada um com delay relativo AO PASSO
-- ANTERIOR e conteúdo próprio (template_id OU body OU mídia).
--
-- Por que delay relativo (e não absoluto): quando o operador pausa o cron,
-- os deltas continuam fazendo sentido na retomada — se fosse absoluto, todos
-- os steps atrasados disparariam de uma vez ao retomar.
--
-- Quando o step seria enviado e o lead NÃO está mais ativo (replied/optout/
-- handoff/interest), o cron pula esse step (registra stopped_reason) e marca
-- a sequência como parada.
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.whatsapp_campaign_steps (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id     UUID NOT NULL REFERENCES public.whatsapp_campaigns(id) ON DELETE CASCADE,
    step_order      INTEGER NOT NULL,  -- 1, 2, 3, ... (passo 0 vive em campaigns)
    -- Atraso a partir do passo anterior (passo 1 conta a partir do passo 0).
    delay_value     INTEGER NOT NULL DEFAULT 1,
    delay_unit      TEXT NOT NULL DEFAULT 'days',  -- minutes | hours | days
    -- Conteúdo do passo (mesma regra dos campos da campanha):
    template_id     UUID REFERENCES public.whatsapp_templates(id) ON DELETE SET NULL,
    body            TEXT,
    media_url       TEXT,
    media_type      TEXT,
    media_mime      TEXT,
    media_filename  TEXT,
    media_caption   TEXT,
    -- Quando true, este step só é enviado se o passo anterior teve status OK.
    -- (Reservado pra futuro: condições mais ricas. Hoje sempre true.)
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,

    UNIQUE (campaign_id, step_order),
    CHECK (step_order >= 1),
    CHECK (delay_value >= 0),
    CHECK (delay_unit IN ('minutes', 'hours', 'days'))
);

ALTER TABLE public.whatsapp_campaign_steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wa_campaign_steps_full_access" ON public.whatsapp_campaign_steps;
CREATE POLICY "wa_campaign_steps_full_access"
    ON public.whatsapp_campaign_steps FOR ALL
    USING (auth.role() = 'service_role' OR auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_wa_campaign_steps_campaign
    ON public.whatsapp_campaign_steps (campaign_id, step_order);

DROP TRIGGER IF EXISTS trg_wa_campaign_steps_updated ON public.whatsapp_campaign_steps;
CREATE TRIGGER trg_wa_campaign_steps_updated
    BEFORE UPDATE ON public.whatsapp_campaign_steps
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


-- ────────────────────────────────────────────────────────────────────────────
-- 3) whatsapp_campaign_recipients — estado da sequência por destinatário
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.whatsapp_campaign_recipients
    -- Índice do próximo step a enviar. 0 = ainda não recebeu o passo 0;
    -- N = recebeu até o passo N-1, próximo é o passo N.
    ADD COLUMN IF NOT EXISTS current_step    INTEGER NOT NULL DEFAULT 0,

    -- Quando o cron deve mandar o próximo step. null = ou já terminou ou parou.
    ADD COLUMN IF NOT EXISTS next_send_at    TIMESTAMPTZ,

    -- Quando o lead respondeu durante a janela ativa da campanha (1ª resposta).
    ADD COLUMN IF NOT EXISTS replied_at      TIMESTAMPTZ,

    -- Quando e por que a sequência parou pra esse destinatário.
    ADD COLUMN IF NOT EXISTS stopped_at      TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS stopped_reason  TEXT;

-- replied | optout | handoff | interest | completed | cancelled | error
ALTER TABLE public.whatsapp_campaign_recipients
    DROP CONSTRAINT IF EXISTS wa_campaign_recipients_stopped_reason_check;
ALTER TABLE public.whatsapp_campaign_recipients
    ADD CONSTRAINT wa_campaign_recipients_stopped_reason_check
    CHECK (stopped_reason IS NULL OR stopped_reason IN
        ('replied', 'optout', 'handoff', 'interest', 'completed', 'cancelled', 'error'));

CREATE INDEX IF NOT EXISTS idx_wa_recipients_next_send
    ON public.whatsapp_campaign_recipients (next_send_at)
    WHERE next_send_at IS NOT NULL AND stopped_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_wa_recipients_lead_active
    ON public.whatsapp_campaign_recipients (lead_id)
    WHERE stopped_at IS NULL AND lead_id IS NOT NULL;

COMMENT ON COLUMN public.whatsapp_campaign_recipients.current_step IS
    'Índice do próximo step a enviar. 0 antes de qualquer envio; N depois de receber até o step N-1.';
COMMENT ON COLUMN public.whatsapp_campaign_recipients.next_send_at IS
    'Timestamp pra o cron acordar e enviar o próximo step. null = sequência terminou ou parou.';
COMMENT ON COLUMN public.whatsapp_campaign_recipients.stopped_reason IS
    'Razão da parada da sequência (NULL = ainda ativa ou já completou todos os steps).';
