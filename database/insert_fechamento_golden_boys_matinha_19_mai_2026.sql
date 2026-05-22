-- ============================================================
-- Fechamento — Leilão Golden Boys Matinha (19/05/2026)
--
-- Leilão de TERCEIRO em que Fórmula+Bula PARTICIPARAM cobrindo
-- compradores. Criador/vendedor: Rancho da Matinha. Leiloeira:
-- Programa Leilões. Modalidade: virtual. Oferta: touros (machos)
-- Nelore Padrão. Fonte do cronograma: cronograma_leiloes
-- (id e0890f5a-0e8c-4054-97b9-b26d62e97bc6).
--
-- Catálogo (catalogo-digital-golden-boys.pdf — 120 páginas):
--   • 55 lotes ofertados — numeração 200 a 255, sem o Lt 202
--   • 118 touros no total (lotes IND, TRIO, MULT e MEGA)
--
-- Cobertura reportada via grupo WhatsApp (mensagens encaminhadas,
-- 14:43) — 2 lances, ambos lotes INDIVIDUAIS (1 touro cada):
--   • Lt 203 — B4388 M AT. (RGN RDM B4388) — 1 macho
--       parcela R$ 600 × 40 = R$ 24.000
--       Assessor: Lucas Martins (Bula Assessoria)
--       Comprador: Ronaldo Martins e Romualdo Martins —
--                  Fazenda Águas Claras, Ribeirão Cascalheira/MT
--   • Lt 245 — B5054 M AT. (RGN RDM B5054) — 1 macho
--       parcela R$ 460 × 40 = R$ 18.400
--       Assessor: Fábio Omena (Bula Assessoria)
--       Comprador: Crysteanne Levatti —
--                  Fazenda Pé de Breque, Santa Rita do Pardo/MS
-- Total cobertura: 2 lotes / 2 touros / R$ 42.400 / 2 compradores
--                  / 2 UFs (MT 56,60%, MS 43,40%).
-- Pagamento: 40 parcelas (1+39).
--
-- Acordo Receita Bula (cronograma marcava "A DEFINIR"): 0,33% do
-- faturamento total do leilão + 5% da venda da cobertura
-- (Fórmula+Bula) — mesma família de acordos das demais Rancho da
-- Matinha / Programa Leilões (Novilhotas Top, Touros Matinha).
--   • Componente VENDA  = 5% × R$ 42.400 = R$ 2.120  → registrado
--   • Componente FATURAMENTO = 0,33% × faturamento total = PENDENTE
--     (faturamento total do leilão não foi reportado)
--   • receita_bula = R$ 2.120 (apenas o componente calculável)
--   • comissao_assessoria = R$ 552 — comissão de Fábio Omena:
--     3% × R$ 18.400 (Lt 245) = R$ 552. Percentual informado pelo
--     operador (planilha Folha & Estrutura de Comissões — Fábio
--     Omenna, BDR/Field, 3%). Comissão de Lucas Martins (Lt 203)
--     segue PENDENTE — não está no roster canônico (leiloes_equipe)
--     e o percentual ainda não foi confirmado.
--   • sobra_bruta = R$ 2.120 − R$ 552 = R$ 1.568
--
-- ERP:
--   • CONTA A PAGAR — comissão Fábio Omena R$ 552 (3%): lançada
--     abaixo neste script.
--   • CONTA A RECEBER — Receita Bula: NÃO lançada — incompleta
--     (falta o componente 0,33% × faturamento total do leilão).
--   • CONTA A PAGAR — comissão Lucas Martins: NÃO lançada —
--     percentual pendente de confirmação.
-- ============================================================

INSERT INTO public.bula_leilao_fechamento (
  nome, data, local,
  lotes_ofertados, lotes_vendidos, animais_vendidos,
  vgv_total, faturamento_total_leilao, ticket_medio, maior_lance,
  compradores_unicos, estados_alcancados,
  por_assessor, por_estado, compradores, lances,
  perfil_genetico,
  comissao_assessoria, receita_bula, sobra_bruta,
  acordo_pct_faturamento, acordo_pct_venda_cobertura, acordo_descricao,
  observacoes
)
SELECT
  'Leilão Golden Boys Matinha – 19/05/2026',
  '2026-05-19',
  '',
  55,        -- lotes ofertados (catálogo: lotes 200–255, sem o 202)
  2,         -- lotes vendidos (NOSSA COBERTURA)
  2,         -- animais vendidos (NOSSA COBERTURA — 2 touros)
  42400,     -- VGV total NOSSA COBERTURA
  NULL,      -- faturamento total oficial do leilão (não reportado)
  21200,     -- ticket médio (R$ 42.400 / 2 lotes)
  600,       -- maior parcela mapeada (Lt 203, Lucas Martins)
  2,         -- compradores únicos (NOSSA COBERTURA)
  2,         -- estados alcançados (MT, MS — NOSSA COBERTURA)

  -- por_assessor (NOSSA COBERTURA, ordenado por VGV)
  '[
    {"posicao":1,"nome":"Lucas Martins","empresa":"Bula Assessoria","transacoes":1,"animais":1,"vgv":24000,"ticket_medio":24000,"pct_total":0.5660},
    {"posicao":2,"nome":"Fábio Omena","empresa":"Bula Assessoria","transacoes":1,"animais":1,"vgv":18400,"ticket_medio":18400,"pct_total":0.4340}
  ]'::jsonb,

  -- por_estado (NOSSA COBERTURA)
  '[
    {"uf":"MT","estado":"Mato Grosso","lotes":1,"animais":1,"vgv":24000,"pct_total":0.5660},
    {"uf":"MS","estado":"Mato Grosso do Sul","lotes":1,"animais":1,"vgv":18400,"pct_total":0.4340}
  ]'::jsonb,

  -- compradores (NOSSA COBERTURA, rank por VGV)
  '[
    {"rank":1,"fazenda":"Fazenda Águas Claras","comprador":"Ronaldo Martins e Romualdo Martins","cidade":"Ribeirão Cascalheira","uf":"MT","lotes":1,"animais":1,"vgv":24000},
    {"rank":2,"fazenda":"Fazenda Pé de Breque","comprador":"Crysteanne Levatti","cidade":"Santa Rita do Pardo","uf":"MS","lotes":1,"animais":1,"vgv":18400}
  ]'::jsonb,

  -- lances (cada batida de martelo da NOSSA COBERTURA)
  '[
    {"lote":"203","vendedor":"Rancho da Matinha","fazenda":"Fazenda Águas Claras","comprador":"Ronaldo Martins e Romualdo Martins","cidade":"Ribeirão Cascalheira","uf":"MT","assessor":"Lucas Martins","empresa":"Bula Assessoria","animais":1,"parcela":600,"vgv":24000,"observacao":"Touro B4388 M AT. (RGN RDM B4388, nasc 14/03/2025, 526 kg); parcela R$ 600 × 40"},
    {"lote":"245","vendedor":"Rancho da Matinha","fazenda":"Fazenda Pé de Breque","comprador":"Crysteanne Levatti","cidade":"Santa Rita do Pardo","uf":"MS","assessor":"Fábio Omena","empresa":"Bula Assessoria","animais":1,"parcela":460,"vgv":18400,"observacao":"Touro B5054 M AT. (RGN RDM B5054, nasc 24/05/2025, 387 kg); parcela R$ 460 × 40"}
  ]'::jsonb,

  NULL,      -- perfil_genetico

  552,       -- comissao_assessoria = comissão Fábio Omena (3% × R$ 18.400 = R$ 552); Lucas Martins pendente
  2120,      -- receita_bula = 5% × R$ 42.400 (componente venda; 0,33% × faturamento pendente)
  1568,      -- sobra_bruta = R$ 2.120 − R$ 552

  0.0033,    -- acordo_pct_faturamento
  0.05,      -- acordo_pct_venda_cobertura
  '0,33% do faturamento total + 5% da venda da cobertura',

  'Leilão de TERCEIRO — leiloeira Programa Leilões; criador/vendedor Rancho da Matinha; modalidade virtual; oferta de touros (machos) Nelore Padrão. Catálogo (catalogo-digital-golden-boys.pdf): 55 lotes ofertados (numeração 200–255, sem o Lt 202) e 118 touros no total. Pagamento: 40 parcelas (1+39). NOSSA COBERTURA (Fórmula+Bula): 2 lotes / 2 touros / R$ 42.400 / 2 compradores / 2 UFs. Por assessor: Lucas Martins (Bula Assessoria) — Lt 203 (touro B4388 M AT., parcela R$ 600 × 40 = R$ 24.000) para Ronaldo Martins e Romualdo Martins (Fazenda Águas Claras, Ribeirão Cascalheira/MT) = R$ 24.000 (56,60%); Fábio Omena (Bula Assessoria) — Lt 245 (touro B5054 M AT., parcela R$ 460 × 40 = R$ 18.400) para Crysteanne Levatti (Fazenda Pé de Breque, Santa Rita do Pardo/MS) = R$ 18.400 (43,40%). RECEITA BULA — acordo 0,33% do faturamento total + 5% da venda da cobertura: componente VENDA = 5% × R$ 42.400 = R$ 2.120 (registrado em receita_bula); componente FATURAMENTO = 0,33% × faturamento total = PENDENTE (faturamento total do leilão não reportado). COMISSÃO ASSESSORIA = R$ 552: Fábio Omena (Bula Assessoria) — 3% × R$ 18.400 (Lt 245) = R$ 552, percentual informado pelo operador (planilha Folha & Estrutura de Comissões — Fábio Omenna, BDR/Field, 3%). Comissão de Lucas Martins (Lt 203) NÃO lançada — pendente: Lucas Martins não está no roster canônico (leiloes_equipe), aguardando confirmação do percentual. SOBRA BRUTA = R$ 2.120 − R$ 552 = R$ 1.568. ⚠ PENDÊNCIAS: (a) faturamento total oficial do leilão — necessário para o componente 0,33% da Receita Bula; (b) percentual de comissão do assessor Lucas Martins (Lt 203, R$ 24.000); (c) confirmar se os 2 lances reportados são a cobertura COMPLETA da equipe (mensagens encaminhadas no grupo terminam com "Fechamento Golden Boys Matinha"); (d) ERP — conta a RECEBER (Receita Bula) ainda não lançada (aguarda faturamento total).'

WHERE NOT EXISTS (
  SELECT 1 FROM public.bula_leilao_fechamento
  WHERE data = '2026-05-19'
    AND nome = 'Leilão Golden Boys Matinha – 19/05/2026'
);


-- ── CONTA A PAGAR — COMISSÃO FÁBIO OMENA (3%) ──────────────────
-- 3% × R$ 18.400 (Lt 245) = R$ 552. Percentual conforme planilha
-- Folha & Estrutura de Comissões (Fábio Omenna, BDR/Field, 3%).
INSERT INTO public.erp_finance_transactions (
  account_id, category_id, type, amount, description, observacao,
  transaction_date, status
)
SELECT
  (SELECT id FROM public.erp_finance_accounts ORDER BY created_at LIMIT 1),
  (SELECT id FROM public.erp_finance_categories WHERE name = 'Fornecedores' AND type = 'expense' LIMIT 1),
  'expense',
  552,
  'Comissão Fábio Omena (Bula Assessoria) – 3% – Lt 245 Leilão Golden Boys Matinha',
  'Leilão 19/05/2026 – Golden Boys Matinha (Rancho da Matinha via Programa Leilões, virtual). Fábio Omena intermediou 1 lance / 1 touro: Lt 245 (B5054 M AT., parcela R$ 460 × 40 = R$ 18.400) para Crysteanne Levatti (Fazenda Pé de Breque, Santa Rita do Pardo/MS). 3% × R$ 18.400 = R$ 552 (percentual conforme planilha Folha & Estrutura de Comissões).',
  '2026-05-19',
  'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM public.erp_finance_transactions
  WHERE description = 'Comissão Fábio Omena (Bula Assessoria) – 3% – Lt 245 Leilão Golden Boys Matinha'
    AND transaction_date = '2026-05-19'
);
