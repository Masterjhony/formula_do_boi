-- ============================================================
-- Fechamento — Leilão Matrizes Fazenda Santa Fé – 07/05/2026
--
-- Leilão de TERCEIRO em que Fórmula+Bula PARTICIPARAM cobrindo
-- compradores. Promotor: Programa Leilões Nordeste (Sérgio Alcântara)
-- + Agreste Leilões Rurais. Vendedor: Fazenda Santa Fé. Local: Maceió/AL.
--
-- Header (lotes_ofertados/vendidos, vgv_total etc.) carrega os números
-- OFICIAIS divulgados pela leiloeira (somatória encaminhada via WhatsApp).
-- JSONBs (por_assessor, por_estado, compradores, lances) carregam APENAS
-- a nossa cobertura (9 lotes / R$ 207.000) — base do faturamento e das
-- comissões.
--
-- Cobertura mapeada (prints WhatsApp do Marcelo Primo Carneiro):
--   Douglas Bispo (Bula) — 2 lances / 6 animais / R$ 114.000
--     • Lt 32 (1a, 700/30 = R$ 21.000) – Gilberto Sarubi (Oriximiná/PA)
--     • Lts 30·12·15·16·13 (5a, 620/30 = R$ 93.000) – Gilberto Sarubi
--   Fábio Omena (Bula) — 2 lances / 2 animais / R$ 63.000
--     • Lt 25 (1a, 1.400/30 = R$ 42.000) – João Pereira da Silva (TO)
--     • Lt 08 (1a, 700/30 = R$ 21.000) – Irmãos Vale (PB)
--   Marcelo Carneiro (Fórmula do Boi) — 1 lance / 1 animal / R$ 30.000
--     • Lt 20 (1a, 1.000/30 = R$ 30.000) – Orismar Moreira Leão (Nelore Leão)
--
-- Conta a pagar (regra 2% Bulinha/Marcelo/Matheus):
--   • Marcelo Carneiro: 2% × R$ 30.000 = R$ 600
--   • Fábio/Douglas (Bula) NÃO entram na regra dos 2%.
--
-- Pendências (registradas em observacoes):
--   • UF do Orismar Moreira Leão não consta nos prints.
--   • Lote 32 partilhado 50/50 Santa Fé / FLOC — definir rateio.
--   • PA omitido na arte oficial da leiloeira (confirmado pelo chefe
--     como erro de arte; venda do pacote Sarubi/PA está válida).
-- ============================================================

INSERT INTO public.bula_leilao_fechamento (
  nome, data, local,
  lotes_ofertados, lotes_vendidos, animais_vendidos,
  vgv_total, ticket_medio, maior_lance,
  compradores_unicos, estados_alcancados,
  por_assessor, por_estado, compradores, lances,
  perfil_genetico,
  comissao_assessoria, receita_bula, sobra_bruta,
  observacoes
)
SELECT
  'Leilão Matrizes Fazenda Santa Fé – 07/05/2026',
  '2026-05-07',
  'Maceió/AL',
  35,        -- lotes ofertados (catálogo)
  34,        -- lotes vendidos (todos os ativos; Lote 27 retirado; Lote 32 partilhado 50/50)
  34,        -- matrizes vendidas (criais ao pé acompanham 3-em-1)
  960000,    -- VGV total OFICIAL do leilão
  28656.72,  -- ticket médio oficial (R$ 960.000 / 33,5)
  1400,      -- maior parcela mapeada (Lt 25, Fábio Omena/Bula); leilão pode ter lances maiores fora da nossa cobertura
  17,        -- compradores únicos OFICIAIS
  8,         -- estados alcançados (AL/BA/MG/PB/PE/PI/TO + PA por erro de arte)

  -- por_assessor (nossa cobertura)
  '[
    {"posicao":1,"nome":"Douglas Bispo","empresa":"Bula Assessoria","transacoes":2,"animais":6,"vgv":114000,"ticket_medio":57000,"pct_total":0.5507},
    {"posicao":2,"nome":"Fábio Omena","empresa":"Bula Assessoria","transacoes":2,"animais":2,"vgv":63000,"ticket_medio":31500,"pct_total":0.3043},
    {"posicao":3,"nome":"Marcelo Carneiro","empresa":"Fórmula do Boi","transacoes":1,"animais":1,"vgv":30000,"ticket_medio":30000,"pct_total":0.1449}
  ]'::jsonb,

  -- por_estado (nossa cobertura)
  '[
    {"uf":"PA","estado":"Pará","lotes":6,"animais":6,"vgv":114000,"pct_total":0.5507},
    {"uf":"TO","estado":"Tocantins","lotes":1,"animais":1,"vgv":42000,"pct_total":0.2029},
    {"uf":"","estado":"⚠ A confirmar (Orismar Leão / Nelore Leão)","lotes":1,"animais":1,"vgv":30000,"pct_total":0.1449},
    {"uf":"PB","estado":"Paraíba","lotes":1,"animais":1,"vgv":21000,"pct_total":0.1014}
  ]'::jsonb,

  -- compradores (nossa cobertura)
  '[
    {"rank":1,"fazenda":"Fazenda Garantido","comprador":"Gilberto Sarubi","cidade":"Oriximiná","uf":"PA","lotes":6,"animais":6,"vgv":114000},
    {"rank":2,"fazenda":"Fazenda Buriti Alegre","comprador":"João Pereira da Silva","cidade":"Barrolândia","uf":"TO","lotes":1,"animais":1,"vgv":42000},
    {"rank":3,"fazenda":"Nelore Leão","comprador":"Orismar Moreira Leão","cidade":"","uf":"","lotes":1,"animais":1,"vgv":30000},
    {"rank":4,"fazenda":"Agropecuária Canaã","comprador":"Irmãos Milton e Mailton Vale","cidade":"Mamanguape","uf":"PB","lotes":1,"animais":1,"vgv":21000}
  ]'::jsonb,

  -- lances (cada batida de martelo da nossa cobertura)
  '[
    {"lote":"25","fazenda":"Fazenda Buriti Alegre","comprador":"João Pereira da Silva","cidade":"Barrolândia","uf":"TO","assessor":"Fábio Omena","empresa":"Bula Assessoria","animais":1,"parcela":1400,"vgv":42000},
    {"lote":"20","fazenda":"Nelore Leão","comprador":"Orismar Moreira Leão","cidade":"","uf":"","assessor":"Marcelo Carneiro","empresa":"Fórmula do Boi","animais":1,"parcela":1000,"vgv":30000},
    {"lote":"08","fazenda":"Agropecuária Canaã","comprador":"Irmãos Milton e Mailton Vale","cidade":"Mamanguape","uf":"PB","assessor":"Fábio Omena","empresa":"Bula Assessoria","animais":1,"parcela":700,"vgv":21000},
    {"lote":"32","fazenda":"Fazenda Garantido","comprador":"Gilberto Sarubi","cidade":"Oriximiná","uf":"PA","assessor":"Douglas Bispo","empresa":"Bula Assessoria","animais":1,"parcela":700,"vgv":21000},
    {"lote":"30·12·15·16·13","fazenda":"Fazenda Garantido","comprador":"Gilberto Sarubi","cidade":"Oriximiná","uf":"PA","assessor":"Douglas Bispo","empresa":"Bula Assessoria","animais":5,"parcela":620,"vgv":93000}
  ]'::jsonb,

  NULL,      -- perfil_genetico (leilão é de matrizes; índices não consolidados pela leiloeira)
  600,       -- comissao_assessoria: 2% × R$ 30.000 (Marcelo Carneiro)
  0,
  -600,      -- sobra_bruta = 0 - 600

  'Leilão de TERCEIRO (Programa Leilões Nordeste + Agreste Leilões Rurais; vendedor Fazenda Santa Fé) — Fórmula+Bula participaram cobrindo compradores. Header com números OFICIAIS da leiloeira (33,5 lotes contabilizados / R$ 960.000 / 17 compradores; o "33,5" reflete a partilha 50/50 do Lote 32 entre Santa Fé e FLOC). JSONBs (por_assessor, por_estado, compradores, lances) carregam APENAS a nossa cobertura: 9 lotes / R$ 207.000 (21,6% do VGV / 26,9% dos lotes). Lote 27 foi retirado do leilão (34 ativos do catálogo de 35). Estados oficiais divulgados: AL/BA/MG/PB/PE/PI/TO — PA omitido por erro de arte da leiloeira (confirmado pelo Marcelo Primo Carneiro; venda do pacote Sarubi/Oriximiná-PA está válida; conto 8 estados). Cobertura por assessor: Douglas Bispo (Bula) levou 6 lotes em 2 lances (Lt 32 isolado R$ 21k + pacote Lts 30·12·15·16·13 R$ 93k) — todos para Gilberto Sarubi (Fazenda Garantido, Oriximiná/PA). Fábio Omena (Bula) levou 2 lotes em 2 lances (Lt 25 R$ 42k para João Pereira da Silva/TO + Lt 08 R$ 21k para Irmãos Milton e Mailton Vale/PB). Marcelo Carneiro (Fórmula do Boi) levou 1 lote (Lt 20, 3-em-1, R$ 30k) para Orismar Moreira Leão (Nelore Leão). Comissão 2% gerada apenas para o Marcelo (R$ 600); Fábio/Douglas são da Bula e não entram na regra dos 2%. ⚠ PENDÊNCIAS: (a) UF do Orismar Moreira Leão / Nelore Leão não consta nos prints; (b) Lote 32 é partilha 50/50 Santa Fé × FLOC — rateio de comissão e repasse a definir; (c) maior_lance registrado (R$ 1.400) é o maior da nossa cobertura — leilão pode ter tido parcela maior fora dela.'

WHERE NOT EXISTS (
  SELECT 1 FROM public.bula_leilao_fechamento
  WHERE data = '2026-05-07'
    AND nome = 'Leilão Matrizes Fazenda Santa Fé – 07/05/2026'
);


-- ── CONTA A PAGAR — COMISSÃO MARCELO CARNEIRO ──────────────────
-- 2% × R$ 30.000 (Lt 20, Orismar Moreira Leão)
INSERT INTO public.erp_finance_transactions (
  account_id, category_id, type, amount, description, observacao,
  transaction_date, status
)
SELECT
  (SELECT id FROM public.erp_finance_accounts ORDER BY created_at LIMIT 1),
  (SELECT id FROM public.erp_finance_categories WHERE name = 'Fornecedores' AND type = 'expense' LIMIT 1),
  'expense',
  600,
  'Comissão Marcelo Carneiro (Fórmula do Boi) – 2% – Lt 20 Leilão Matrizes Santa Fé',
  'Leilão 07/05/2026 – Matrizes Fazenda Santa Fé (Maceió/AL). Lt 20 (1 matriz 3-em-1) – comprador Orismar Moreira Leão (Fazenda Nelore Leão). Parcela R$ 1.000 × 30 = R$ 30.000. 2% × R$ 30.000 = R$ 600. Demais lotes da cobertura (Sarubi/Vale/Pereira) foram fechados por Fábio Omena e Douglas Bispo (Bula Assessoria) — fora da regra dos 2%.',
  '2026-05-07',
  'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM public.erp_finance_transactions
  WHERE description = 'Comissão Marcelo Carneiro (Fórmula do Boi) – 2% – Lt 20 Leilão Matrizes Santa Fé'
    AND transaction_date = '2026-05-07'
);
