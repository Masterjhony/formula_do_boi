-- ============================================================
-- Módulo de Responsáveis (Equipe) do Plano Tático
-- ============================================================

CREATE TABLE IF NOT EXISTS tactical_members (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT        NOT NULL,
  role         TEXT,
  avatar_color TEXT        DEFAULT '#B8860B',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tactical_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'tactical_members'
    AND policyname = 'authenticated full access'
  ) THEN
    CREATE POLICY "authenticated full access"
      ON tactical_members FOR ALL TO authenticated
      USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Seed: migrar os nomes já usados nas tarefas existentes
INSERT INTO tactical_members (name) VALUES
  ('Marcelo'),
  ('João Eduardo'),
  ('Matheus'),
  ('Joao Gabriel'),
  ('Fabrício')
ON CONFLICT DO NOTHING;
