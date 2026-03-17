-- Tabela de log de mensagens enviadas pelo WhatsApp
-- Execute no Supabase Studio: https://supabase.com/dashboard/project/hghtikjaqixglmpujbwj/sql

CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
    id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    phone       TEXT,                              -- null se lead sem telefone
    name        TEXT        NOT NULL,
    status      TEXT        NOT NULL DEFAULT 'sent', -- 'sent' | 'failed' | 'not_on_whatsapp' | 'no_phone'
    reason      TEXT,                              -- motivo de falha (ex: 'not_on_whatsapp')
    error_msg   TEXT,                              -- mensagem de erro técnico
    lead_id     UUID        REFERENCES public.crm_leads(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role and authenticated full access"
    ON public.whatsapp_messages FOR ALL
    USING (auth.role() = 'service_role' OR auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE INDEX whatsapp_messages_created_at_idx ON public.whatsapp_messages (created_at DESC);
CREATE INDEX whatsapp_messages_phone_idx      ON public.whatsapp_messages (phone);
CREATE INDEX whatsapp_messages_lead_id_idx    ON public.whatsapp_messages (lead_id);
