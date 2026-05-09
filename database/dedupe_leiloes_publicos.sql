-- ============================================================
-- Dedup — bula_leiloes + cronograma_leiloes
--
-- Origem: agenda pública (/agenda) mostrando duas linhas iguais em
-- 03/06/2026 (NELORE CACHOEIRÃO) e potencialmente em 11/06/2026
-- (Nelore Tresmar). Causa raiz: dois seeds inseriram a mesma
-- (nome, data) em `bula_leiloes`:
--   • create_bula_assessoria_tables.sql (UUIDs estáveis 33333333-…
--     usados como FK em bula_leilao_assessores ON DELETE CASCADE)
--   • bula_leiloes_extend_and_seed.sql (UUIDs auto, com colunas
--     extras: transmissao, modelo, leiloeira, condicao, …)
--
-- Estratégia (idempotente):
--   1) Para cada (LOWER(TRIM(nome)), data) com >1 linha em
--      bula_leiloes, escolhe a linha *mais antiga* como canônica
--      (preserva os links em bula_leilao_assessores) e MESCLA os
--      campos não-vazios das outras nela. Em seguida APAGA as
--      duplicatas.
--   2) Mesma lógica em cronograma_leiloes (sem FKs apontando para
--      ela, então é só dedup).
--
-- Pode rodar várias vezes — depois da 1ª passada não há mais
-- duplicatas, então o UPDATE/DELETE viram no-ops.
-- ============================================================

-- ─── 1. bula_leiloes: merge + delete ───────────────────────────
WITH ranked AS (
  SELECT
    id, nome, data, created_at,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(TRIM(nome)), data
      ORDER BY created_at ASC NULLS LAST, id ASC
    ) AS rn,
    COUNT(*) OVER (PARTITION BY LOWER(TRIM(nome)), data) AS dup_count
  FROM public.bula_leiloes
),
canonical AS (
  SELECT id AS canonical_id, nome, data
  FROM ranked
  WHERE rn = 1 AND dup_count > 1
),
merged AS (
  SELECT
    c.canonical_id,
    MAX(NULLIF(b.local,           '')) AS local,
    MAX(NULLIF(b.animais,           0)) AS animais,
    MAX(NULLIF(b.expectativa,       0)) AS expectativa,
    MAX(NULLIF(b.meta_bula,         0)) AS meta_bula,
    MAX(NULLIF(b.realizado_bula,    0)) AS realizado_bula,
    MAX(NULLIF(b.img,              '')) AS img,
    MAX(NULLIF(b.horario,          '')) AS horario,
    MAX(NULLIF(b.transmissao,      '')) AS transmissao,
    MAX(NULLIF(b.modelo,           '')) AS modelo,
    MAX(NULLIF(b.leiloeira,        '')) AS leiloeira,
    MAX(NULLIF(b.condicao,         '')) AS condicao,
    MAX(NULLIF(b.frete_gratis,     '')) AS frete_gratis,
    MAX(NULLIF(b.acordo_comissao,  '')) AS acordo_comissao
  FROM canonical c
  JOIN public.bula_leiloes b
    ON LOWER(TRIM(b.nome)) = LOWER(TRIM(c.nome))
   AND b.data = c.data
  GROUP BY c.canonical_id
)
UPDATE public.bula_leiloes t
SET
  local           = COALESCE(NULLIF(t.local,           ''), m.local,           t.local),
  animais         = COALESCE(NULLIF(t.animais,           0), m.animais,         t.animais),
  expectativa     = COALESCE(NULLIF(t.expectativa,       0), m.expectativa,     t.expectativa),
  meta_bula       = COALESCE(NULLIF(t.meta_bula,         0), m.meta_bula,       t.meta_bula),
  realizado_bula  = COALESCE(NULLIF(t.realizado_bula,    0), m.realizado_bula,  t.realizado_bula),
  img             = COALESCE(NULLIF(t.img,              ''), m.img,             t.img),
  horario         = COALESCE(NULLIF(t.horario,          ''), m.horario,         t.horario),
  transmissao     = COALESCE(NULLIF(t.transmissao,      ''), m.transmissao,     t.transmissao),
  modelo          = COALESCE(NULLIF(t.modelo,           ''), m.modelo,          t.modelo),
  leiloeira       = COALESCE(NULLIF(t.leiloeira,        ''), m.leiloeira,       t.leiloeira),
  condicao        = COALESCE(NULLIF(t.condicao,         ''), m.condicao,        t.condicao),
  frete_gratis    = COALESCE(NULLIF(t.frete_gratis,     ''), m.frete_gratis,    t.frete_gratis),
  acordo_comissao = COALESCE(NULLIF(t.acordo_comissao,  ''), m.acordo_comissao, t.acordo_comissao)
FROM merged m
WHERE t.id = m.canonical_id;

DELETE FROM public.bula_leiloes
WHERE id IN (
  SELECT id FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY LOWER(TRIM(nome)), data
        ORDER BY created_at ASC NULLS LAST, id ASC
      ) AS rn
    FROM public.bula_leiloes
  ) t
  WHERE t.rn > 1
);

-- ─── 2. cronograma_leiloes: dedup (sem FKs apontando) ──────────
WITH ranked AS (
  SELECT
    id, nome, data, created_at,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(TRIM(nome)), data
      ORDER BY created_at ASC NULLS LAST, id ASC
    ) AS rn,
    COUNT(*) OVER (PARTITION BY LOWER(TRIM(nome)), data) AS dup_count
  FROM public.cronograma_leiloes
),
canonical AS (
  SELECT id AS canonical_id, nome, data
  FROM ranked
  WHERE rn = 1 AND dup_count > 1
),
merged AS (
  SELECT
    c.canonical_id,
    MAX(NULLIF(b.dia_semana,            '')) AS dia_semana,
    MAX(NULLIF(b.hora,                  '')) AS hora,
    MAX(NULLIF(b.criador,               '')) AS criador,
    MAX(NULLIF(b.presencial,            '')) AS presencial,
    MAX(NULLIF(b.leiloeira,             '')) AS leiloeira,
    MAX(NULLIF(b.raca,                  '')) AS raca,
    MAX(NULLIF(b.qtd_animais,             0)) AS qtd_animais,
    MAX(NULLIF(b.sexo,                  '')) AS sexo,
    MAX(NULLIF(b.comissao,              '')) AS comissao,
    MAX(NULLIF(b.contrato,              '')) AS contrato,
    MAX(NULLIF(b.faturamento_previsto,    0)) AS faturamento_previsto,
    MAX(NULLIF(b.faturamento_realizado,   0)) AS faturamento_realizado,
    MAX(NULLIF(b.venda_bula,              0)) AS venda_bula,
    MAX(NULLIF(b.comissao_receber,      '')) AS comissao_receber,
    MAX(NULLIF(b.recebido,              '')) AS recebido
  FROM canonical c
  JOIN public.cronograma_leiloes b
    ON LOWER(TRIM(b.nome)) = LOWER(TRIM(c.nome))
   AND b.data = c.data
  GROUP BY c.canonical_id
)
UPDATE public.cronograma_leiloes t
SET
  dia_semana            = COALESCE(NULLIF(t.dia_semana,            ''), m.dia_semana,            t.dia_semana),
  hora                  = COALESCE(NULLIF(t.hora,                  ''), m.hora,                  t.hora),
  criador               = COALESCE(NULLIF(t.criador,               ''), m.criador,               t.criador),
  presencial            = COALESCE(NULLIF(t.presencial,            ''), m.presencial,            t.presencial),
  leiloeira             = COALESCE(NULLIF(t.leiloeira,             ''), m.leiloeira,             t.leiloeira),
  raca                  = COALESCE(NULLIF(t.raca,                  ''), m.raca,                  t.raca),
  qtd_animais           = COALESCE(NULLIF(t.qtd_animais,             0), m.qtd_animais,           t.qtd_animais),
  sexo                  = COALESCE(NULLIF(t.sexo,                  ''), m.sexo,                  t.sexo),
  comissao              = COALESCE(NULLIF(t.comissao,              ''), m.comissao,              t.comissao),
  contrato              = COALESCE(NULLIF(t.contrato,              ''), m.contrato,              t.contrato),
  faturamento_previsto  = COALESCE(NULLIF(t.faturamento_previsto,    0), m.faturamento_previsto,  t.faturamento_previsto),
  faturamento_realizado = COALESCE(NULLIF(t.faturamento_realizado,   0), m.faturamento_realizado, t.faturamento_realizado),
  venda_bula            = COALESCE(NULLIF(t.venda_bula,              0), m.venda_bula,            t.venda_bula),
  comissao_receber      = COALESCE(NULLIF(t.comissao_receber,      ''), m.comissao_receber,      t.comissao_receber),
  recebido              = COALESCE(NULLIF(t.recebido,              ''), m.recebido,              t.recebido)
FROM merged m
WHERE t.id = m.canonical_id;

DELETE FROM public.cronograma_leiloes
WHERE id IN (
  SELECT id FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY LOWER(TRIM(nome)), data
        ORDER BY created_at ASC NULLS LAST, id ASC
      ) AS rn
    FROM public.cronograma_leiloes
  ) t
  WHERE t.rn > 1
);

-- ─── 3. Diagnóstico (rodar para confirmar 0 duplicatas) ────────
-- SELECT 'bula_leiloes'  AS tabela, LOWER(TRIM(nome)) AS nome, data, COUNT(*)
--   FROM public.bula_leiloes      GROUP BY 1,2,3 HAVING COUNT(*) > 1
-- UNION ALL
-- SELECT 'cronograma_leiloes', LOWER(TRIM(nome)), data, COUNT(*)
--   FROM public.cronograma_leiloes GROUP BY 1,2,3 HAVING COUNT(*) > 1;
