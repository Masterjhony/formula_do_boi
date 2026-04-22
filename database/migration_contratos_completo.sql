-- ============================================================
-- MIGRAÇÃO: Contratos Admin
-- Execute este script no SQL Editor do Supabase Dashboard
-- ============================================================

-- 1. Tabela principal
CREATE TABLE IF NOT EXISTS tactical_contracts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name TEXT NOT NULL,
    title       TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'Pendente'
                    CHECK (status IN ('Ativo', 'Pendente', 'Vencido', 'Cancelado')),
    value       NUMERIC(15, 2),
    start_date  DATE,
    end_date    DATE,
    file_url    TEXT,
    file_path   TEXT,
    file_name   TEXT,
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Auto-update de updated_at
CREATE OR REPLACE FUNCTION update_tactical_contracts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tactical_contracts_updated_at ON tactical_contracts;

CREATE TRIGGER trg_tactical_contracts_updated_at
BEFORE UPDATE ON tactical_contracts
FOR EACH ROW EXECUTE FUNCTION update_tactical_contracts_updated_at();

-- 3. RLS
ALTER TABLE tactical_contracts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage contracts" ON tactical_contracts;

CREATE POLICY "Admins can manage contracts"
ON tactical_contracts FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- 4. Storage bucket para arquivos de contrato
--    (o código já tenta criar via API, mas execute aqui se falhar)
INSERT INTO storage.buckets (id, name, public)
VALUES ('contracts', 'contracts', true)
ON CONFLICT (id) DO NOTHING;

-- Política de storage: admins podem fazer upload/download
DROP POLICY IF EXISTS "Admins can upload contracts" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read contracts" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete contracts" ON storage.objects;

CREATE POLICY "Admins can upload contracts"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'contracts'
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

CREATE POLICY "Admins can read contracts"
ON storage.objects FOR SELECT
USING (bucket_id = 'contracts');

CREATE POLICY "Admins can delete contracts"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'contracts'
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);
