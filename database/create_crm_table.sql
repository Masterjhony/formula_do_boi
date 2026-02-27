-- Tabela para o CRM de Vendas
CREATE TABLE IF NOT EXISTS public.crm_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Lead',
    prioridade TEXT,
    interesse TEXT,
    empresa TEXT,
    ultimo_contato TIMESTAMP WITH TIME ZONE,
    data_estimada_fechamento TIMESTAMP WITH TIME ZONE,
    telefone TEXT,
    celular TEXT,
    responsavel TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    position FLOAT8 DEFAULT 0
);

-- Ativar Row Level Security
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
-- Permitir leitura para usuários autenticados (ou admin, dependendo de como as outras tabelas estão configuradas)
-- Por simplificação e seguindo o modelo provável, permitindo autenticados. Ajuste se necessário.
CREATE POLICY "Permitir leitura para usuários autenticados" 
    ON public.crm_leads FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Permitir inserção para usuários autenticados" 
    ON public.crm_leads FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Permitir atualização para usuários autenticados" 
    ON public.crm_leads FOR UPDATE 
    TO authenticated 
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Permitir exclusão para usuários autenticados" 
    ON public.crm_leads FOR DELETE 
    TO authenticated 
    USING (true);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_modified_column_crm()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_crm_leads_modtime
    BEFORE UPDATE ON public.crm_leads
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column_crm();
