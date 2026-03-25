-- Contracts archive for tactical plan
CREATE TABLE IF NOT EXISTS tactical_contracts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name TEXT NOT NULL,
    title       TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'Pendente', -- Ativo | Pendente | Vencido | Cancelado
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

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_tactical_contracts_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tactical_contracts_updated_at
BEFORE UPDATE ON tactical_contracts
FOR EACH ROW EXECUTE FUNCTION update_tactical_contracts_updated_at();

-- RLS
ALTER TABLE tactical_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage contracts"
ON tactical_contracts FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Storage bucket for contract files (run this manually in Supabase dashboard if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('contracts', 'contracts', false) ON CONFLICT DO NOTHING;
