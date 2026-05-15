-- ─────────────────────────────────────────────────────────────────────────
-- Acordos comerciais com criadores/leiloeiras + Tabela de comissões padrão
-- ─────────────────────────────────────────────────────────────────────────
-- Origem: reunião com chefe em 2026-05-15. Estrutura definitiva pra
-- substituir o snapshot guardado em site_settings.bula_acordos_criadores
-- e site_settings.bula_comissoes_padrao.
--
-- O fluxo: leiloeira organiza com o criador, e nós (assessoria) temos
-- acordo com o criador para atuar no leilão dele. Exceção: quando a
-- leiloeira é a própria Bula Remates (leiloeira do Bulinha) — nesse
-- caso o acordo é com a leiloeira.

CREATE TABLE IF NOT EXISTS bula_acordos_criadores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    contraparte text NOT NULL,
    tipo text NOT NULL CHECK (tipo IN ('criador', 'leiloeira_propria')),
    pct_faturamento numeric(7,5),
    pct_venda_cobertura numeric(7,5),
    descricao text NOT NULL,
    vigencia_inicio date,
    vigencia_fim date,
    observacoes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bula_acordos_contraparte ON bula_acordos_criadores(lower(contraparte));
CREATE INDEX IF NOT EXISTS idx_bula_acordos_vigencia ON bula_acordos_criadores(vigencia_inicio, vigencia_fim);

COMMENT ON TABLE  bula_acordos_criadores IS 'Acordos comerciais com criadores e leiloeiras próprias (Bula Remates).';
COMMENT ON COLUMN bula_acordos_criadores.tipo IS 'criador (default) ou leiloeira_propria (Bula Remates).';
COMMENT ON COLUMN bula_acordos_criadores.pct_faturamento IS '% decimal sobre faturamento total da leiloeira. Ex: 0.01 = 1%.';
COMMENT ON COLUMN bula_acordos_criadores.pct_venda_cobertura IS '% decimal sobre VGV de cobertura (vgv_total do fechamento). Ex: 0.03 = 3%.';

-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bula_comissoes_padrao_assessor (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL,
    empresa text NOT NULL CHECK (empresa IN ('Bula Assessoria', 'Fórmula do Boi', 'Outro')),
    -- Por canal (decimal)
    pct_leilao numeric(7,5),                -- ex: 0.03 = 3%
    pct_semen_proprio numeric(7,5),         -- default global 0.12 = 12%
    pct_semen_residual_indicacao numeric(7,5), -- default global 0.03 = 3%
    pct_embrioes_proprio numeric(7,5),      -- default global 0.05 = 5%
    indicado_por_id uuid REFERENCES bula_comissoes_padrao_assessor(id) ON DELETE SET NULL,
    ativo boolean NOT NULL DEFAULT true,
    vigencia_inicio date,
    observacoes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bula_comissoes_nome ON bula_comissoes_padrao_assessor(lower(nome));
CREATE INDEX IF NOT EXISTS idx_bula_comissoes_indicado_por ON bula_comissoes_padrao_assessor(indicado_por_id);

COMMENT ON TABLE  bula_comissoes_padrao_assessor IS 'Comissões padrão por assessor por canal (leilões / sêmen / embriões).';
COMMENT ON COLUMN bula_comissoes_padrao_assessor.indicado_por_id IS 'Quem indicou esse assessor — ganha pct_semen_residual_indicacao sobre a venda da carteira do indicado.';

-- ─────────────────────────────────────────────────────────────────────────
-- Backfill a partir das chaves de site_settings (snapshot 2026-05-15)
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO bula_acordos_criadores (contraparte, tipo, pct_faturamento, pct_venda_cobertura, descricao, vigencia_inicio)
VALUES
    ('Bula Remates',           'leiloeira_propria', 0.01,    NULL, '1% do faturamento total — regra geral para todos os leilões da Bula Remates (IPB, Cachoeirão, MRA, Vanguarda etc.)', '2026-01-01'),
    ('EAO',                    'criador',           0.0033,  NULL, '0,33% do faturamento total do leilão', '2026-01-01'),
    ('Fazenda Garoa',          'criador',           0.01,    NULL, '1% do faturamento total do leilão (Leilão Pintado Raiz)', '2026-01-01'),
    ('Fazenda Santa Fé',       'criador',           0.015,   0.03, '1,5% do faturamento total + 3% da venda da cobertura', '2026-01-01'),
    ('Agropecuária Santa Nazaré', 'criador',        0.01,    0.03, '1% do faturamento total + 3% da venda da cobertura', '2026-01-01'),
    ('Leilão 4R',              'criador',           0.01,    NULL, '1% do faturamento total do leilão (32º Leilão 4R)', '2026-01-01'),
    ('Matinha',                'criador',           NULL,    0.05, '5% da venda da cobertura (Leilão Matinha Embrio)', '2026-01-01')
ON CONFLICT DO NOTHING;

INSERT INTO bula_comissoes_padrao_assessor (nome, empresa, pct_leilao, pct_semen_proprio, pct_semen_residual_indicacao, pct_embrioes_proprio, vigencia_inicio)
VALUES
    ('Fábio Omena',              'Bula Assessoria', 0.03, 0.12, 0.03, 0.05, '2026-05-01'),
    ('Marcelo Carneiro',         'Fórmula do Boi',  0.02, 0.12, 0.03, 0.05, '2026-05-01'),
    ('Bulinha (Felipe Andrade)', 'Fórmula do Boi',  0.02, 0.12, 0.03, 0.05, '2026-05-01'),
    ('Douglas Bispo',            'Bula Assessoria', 0.02, 0.12, 0.03, 0.05, '2026-05-01'),
    ('Leonardo Serafim',         'Bula Assessoria', 0.02, 0.12, 0.03, 0.05, '2026-05-01'),
    ('Lucas Freitas',            'Fórmula do Boi',  0.02, 0.12, 0.03, 0.05, '2026-05-01'),
    ('Otávio',                   'Fórmula do Boi',  0.02, 0.12, 0.03, 0.05, '2026-05-01')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────
-- Link opcional do fechamento ao acordo aplicado (para auditoria histórica)
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE bula_leilao_fechamento
    ADD COLUMN IF NOT EXISTS acordo_criador_id uuid REFERENCES bula_acordos_criadores(id) ON DELETE SET NULL;
