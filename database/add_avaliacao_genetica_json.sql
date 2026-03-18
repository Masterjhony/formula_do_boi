-- Migration: adiciona coluna avaliacao_genetica_json na tabela products
-- Estrutura do JSONB:
-- {
--   "iabcz": 123.45,           -- índice iABCZ (number | null)
--   "deca": "Top 1%",          -- DECA geral (string | null)
--   "percentil": 5,            -- P% (number | null)
--   "f": 2.5,                  -- coeficiente de endogamia (number | null)
--   "caracteristicas": {       -- DEPs por categoria
--     "crescimento": [
--       { "nome": "P120", "dep": 15.3, "ac": 78, "deca": "Top 5%" },
--       ...
--     ],
--     "maternas": [...],
--     "reprodutivas": [...],
--     "acabamento": [...],
--     "carcaca": [...],
--     "morfologicas": [...]
--   }
-- }

ALTER TABLE products ADD COLUMN IF NOT EXISTS avaliacao_genetica_json JSONB DEFAULT NULL;

-- Índice GIN para consultas e filtros futuros por DEP/índice
CREATE INDEX IF NOT EXISTS idx_products_avaliacao_genetica
    ON products USING GIN (avaliacao_genetica_json);
