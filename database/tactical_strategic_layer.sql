-- ============================================================
-- Camada Estratégica do Plano Tático
-- Adiciona OKRs, ICE scoring, dependências, riscos, decisões
-- ============================================================

-- 1. Adicionar campos de scoring e metadados às tarefas existentes
ALTER TABLE tactical_tasks
  ADD COLUMN IF NOT EXISTS ice_impact      SMALLINT DEFAULT 5,
  ADD COLUMN IF NOT EXISTS ice_confidence  SMALLINT DEFAULT 5,
  ADD COLUMN IF NOT EXISTS ice_ease        SMALLINT DEFAULT 5,
  ADD COLUMN IF NOT EXISTS depends_on      TEXT[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS strategic_stage TEXT     DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS status_changed_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Objetivos (O do OKR)
CREATE TABLE IF NOT EXISTS tactical_objectives (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT        NOT NULL,
  description TEXT,
  quarter     TEXT        DEFAULT 'Q2 2026',
  color       TEXT        DEFAULT '#B8860B',
  status      TEXT        DEFAULT 'active',   -- active | completed | cancelled
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Resultados-Chave (KR do OKR)
CREATE TABLE IF NOT EXISTS tactical_key_results (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id  UUID    NOT NULL REFERENCES tactical_objectives(id) ON DELETE CASCADE,
  title         TEXT    NOT NULL,
  current_value NUMERIC DEFAULT 0,
  target_value  NUMERIC DEFAULT 100,
  unit          TEXT    DEFAULT '%',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Vínculo Tarefa → KR
CREATE TABLE IF NOT EXISTS tactical_task_kr_links (
  task_id UUID NOT NULL REFERENCES tactical_tasks(id)       ON DELETE CASCADE,
  kr_id   UUID NOT NULL REFERENCES tactical_key_results(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, kr_id)
);

-- 5. Registro de Riscos
CREATE TABLE IF NOT EXISTS tactical_risks (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT        NOT NULL,
  description TEXT,
  probability TEXT        DEFAULT 'media',    -- baixa | media | alta
  impact      TEXT        DEFAULT 'medio',    -- baixo | medio | alto
  mitigation  TEXT,
  status      TEXT        DEFAULT 'active',   -- active | mitigated | accepted
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Log de Decisões
CREATE TABLE IF NOT EXISTS tactical_decisions (
  id          UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  decision    TEXT  NOT NULL,
  reason      TEXT,
  data_basis  TEXT,
  outcome     TEXT,
  decided_at  DATE  DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE tactical_objectives     ENABLE ROW LEVEL SECURITY;
ALTER TABLE tactical_key_results    ENABLE ROW LEVEL SECURITY;
ALTER TABLE tactical_task_kr_links  ENABLE ROW LEVEL SECURITY;
ALTER TABLE tactical_risks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE tactical_decisions      ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tactical_objectives' AND policyname='authenticated full access') THEN
    CREATE POLICY "authenticated full access" ON tactical_objectives FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tactical_key_results' AND policyname='authenticated full access') THEN
    CREATE POLICY "authenticated full access" ON tactical_key_results FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tactical_task_kr_links' AND policyname='authenticated full access') THEN
    CREATE POLICY "authenticated full access" ON tactical_task_kr_links FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tactical_risks' AND policyname='authenticated full access') THEN
    CREATE POLICY "authenticated full access" ON tactical_risks FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tactical_decisions' AND policyname='authenticated full access') THEN
    CREATE POLICY "authenticated full access" ON tactical_decisions FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;
