-- ============================================================
-- LEILÕES EQUIPE — Roster canônico de assessores
-- Origem: WhatsApp 2026-05-05 ("Bula Assessoria: Douglas, Fábio,
-- Leonardo, Bulinha, Matheus e Marcelo").
-- Substitui as variantes de string soltas em
-- bula_leilao_fechamento.por_assessor / lances.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.leiloes_equipe (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome        TEXT NOT NULL,                 -- 'Douglas Bispo'
  apelido     TEXT DEFAULT '',               -- 'Bulinha (Felipe Andrade)'
  iniciais    TEXT NOT NULL,                 -- 'DB'
  cor         TEXT NOT NULL DEFAULT '#A0792E',
  empresa     TEXT NOT NULL DEFAULT '',      -- 'Bula Assessoria' | 'Fórmula do Boi' | 'Bula Remates'
  telefone    TEXT DEFAULT '',
  email       TEXT DEFAULT '',
  foto_url    TEXT DEFAULT '',
  ativo       BOOLEAN DEFAULT TRUE,
  ordem       INTEGER DEFAULT 0,             -- ordem de exibição
  observacao  TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS leiloes_equipe_nome_uniq
  ON public.leiloes_equipe (LOWER(nome));

ALTER TABLE public.leiloes_equipe ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leiloes_equipe_all" ON public.leiloes_equipe;
CREATE POLICY "leiloes_equipe_all"
  ON public.leiloes_equipe
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ── Seed dos 6 canônicos (idempotente via UNIQUE em LOWER(nome)) ──
INSERT INTO public.leiloes_equipe (nome, apelido, iniciais, cor, empresa, ordem)
VALUES
  ('Douglas Bispo',     '',                          'DB', '#4A8FBF', 'Bula Assessoria', 1),
  ('Fábio Omena',       '',                          'FO', '#C8A96E', 'Bula Assessoria', 2),
  ('Leonardo Serafim',  '',                          'LS', '#6B8F5C', 'Bula Assessoria', 3),
  ('Bulinha',           'Felipe Andrade',            'B',  '#A0792E', 'Bula Assessoria', 4),
  ('Matheus Amormino',  '',                          'MA', '#9B59B6', 'Fórmula do Boi',  5),
  ('Marcelo Carneiro',  '',                          'MC', '#D4A843', 'Fórmula do Boi',  6)
ON CONFLICT (LOWER(nome)) DO UPDATE SET
  apelido    = EXCLUDED.apelido,
  iniciais   = EXCLUDED.iniciais,
  cor        = EXCLUDED.cor,
  empresa    = EXCLUDED.empresa,
  ordem      = EXCLUDED.ordem,
  updated_at = NOW();

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.touch_leiloes_equipe_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS leiloes_equipe_updated_at ON public.leiloes_equipe;
CREATE TRIGGER leiloes_equipe_updated_at
  BEFORE UPDATE ON public.leiloes_equipe
  FOR EACH ROW EXECUTE FUNCTION public.touch_leiloes_equipe_updated_at();
