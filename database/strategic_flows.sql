-- ─── Strategic Flows & Stages ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS strategic_flows (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  description TEXT,
  active      BOOLEAN     DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS strategic_stages (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id     UUID        NOT NULL REFERENCES strategic_flows(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  position    INTEGER     DEFAULT 0,
  weight      INTEGER     DEFAULT 3 CHECK (weight BETWEEN 1 AND 5),
  color       TEXT        DEFAULT '#B8860B',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- strategic_stage on tactical_tasks stores the stage UUID as TEXT
ALTER TABLE tactical_tasks ADD COLUMN IF NOT EXISTS strategic_stage TEXT;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_strategic_stages_flow_id ON strategic_stages(flow_id);
CREATE INDEX IF NOT EXISTS idx_strategic_stages_position ON strategic_stages(position);
CREATE INDEX IF NOT EXISTS idx_tactical_tasks_strategic_stage ON tactical_tasks(strategic_stage);

-- RLS
ALTER TABLE strategic_flows  ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated" ON strategic_flows
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated" ON strategic_stages
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ─── Seed: Funil Comercial ────────────────────────────────────────────────────

WITH new_flow AS (
  INSERT INTO strategic_flows (name, description)
  VALUES ('Funil Comercial', 'Pipeline principal de captação, conversão e resultado')
  RETURNING id
)
INSERT INTO strategic_stages (flow_id, name, position, weight, color)
SELECT id, etapa.name, etapa.pos, etapa.weight, etapa.color
FROM new_flow,
(VALUES
  ('Prospecção',   1000, 3, '#3B82F6'),
  ('Qualificação', 2000, 4, '#F59E0B'),
  ('Proposta',     3000, 5, '#B8860B'),
  ('Negociação',   4000, 4, '#EC4899'),
  ('Fechamento',   5000, 5, '#10B981')
) AS etapa(name, pos, weight, color);
