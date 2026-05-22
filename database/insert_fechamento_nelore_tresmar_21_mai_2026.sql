-- ============================================================
-- Fechamento — Leilão Nelore Tresmar (21/05/2026)
--
-- Leilão da própria BULA REMATES (leiloeira) — criador/vendedor
-- Nelore Tresmar. Modalidade virtual, transmissão Canal do Boi.
-- Oferta: touros (machos) Nelore Padrão. Fonte do cronograma:
-- cronograma_leiloes (id dbae7d82-8172-4132-a03b-28dcda6770e5);
-- registro operacional em bula_leiloes (id 98326ae9-9111-41be-
-- aeae-2aebaa97243a): 60 touros, condição de pagamento
-- "30(2+2+2+2+2+2+2+2+2+10)", comissão do leiloeiro 8% comprador.
--
-- Catálogo não disponível no sistema — lotes_ofertados = 60
-- conforme a contagem de touros de bula_leiloes (touros = 1
-- animal/lote).
--
-- Cobertura reportada via grupo WhatsApp (mensagens encaminhadas
-- pelo Marcelo Primo Carneiro, 22:35–22:46) — 5 lances / 8 lotes
-- / 8 touros:
--   • Lt 01 — 1 touro, parcela R$ 2.150 × 30 = R$ 64.500
--       Assessor: Marcelo Carneiro (Fórmula do Boi)
--       Comprador: "Torão" (novo investidor) — Nelore Tavares,
--                  João Pinheiro/MG
--       ⚠ parcela corrigida de R$ 2.050 (msg encaminhada) para
--       R$ 2.150 pelo próprio Marcelo Primo Carneiro no grupo
--       ("Essa minha foi 2.150").
--   • Lt 08 — 1 touro, parcela R$ 720 × 30 = R$ 21.600
--       Assessor: Fábio Omena (Bula Assessoria)
--       Comprador: Sr André Caetano — Fazenda Minas Gerais,
--                  Marabá/PA
--   • Lt 31·32 — 2 touros, parcela R$ 520/touro × 30 = R$ 31.200
--       Assessor: Fábio Omena (Bula Assessoria)
--       Comprador: Dr Salomão Pereira — Fazenda Ponte das Tábuas,
--                  Rio Preto/MG
--   • Lt 37 — 1 touro, parcela R$ 600 × 30 = R$ 18.000
--       Assessor: Douglas Bispo (Bula Assessoria)
--       Comprador: Geilson de Souza — Fazenda Terra Viva,
--                  São Pedro dos Crentes/MA
--   • Lt 27·28·29 — 3 touros, parcela R$ 530/touro × 30 = R$ 47.700
--       Assessor: Douglas Bispo (Bula Assessoria)
--       Comprador: Edilberto Sarubi — Fazenda Flor da Mata,
--                  Oriximiná/PA
-- Total cobertura: 8 lotes / 8 touros / R$ 183.000 / 5 compradores
--                  / 3 UFs (MG 52,30%, PA 37,87%, MA 9,84%).
-- Pagamento: 30 parcelas.
--
-- Acordo Receita Bula (cronograma): 1% do faturamento total do
-- leilão. Faturamento total NÃO reportado:
--   • receita_bula = R$ 0 — PENDENTE (= 1% × faturamento total
--     quando confirmado).
--   • comissao_assessoria = R$ 4.188 — comissões dos assessores
--     (percentuais da planilha Folha & Estrutura de Comissões /
--     regra 2% Fórmula do Boi):
--       Marcelo Carneiro  2% × R$ 64.500 = R$ 1.290
--       Fábio Omena       3% × R$ 52.800 = R$ 1.584
--       Douglas Bispo     2% × R$ 65.700 = R$ 1.314
--   • sobra_bruta = R$ 0 − R$ 4.188 = −R$ 4.188 (provisória —
--     vira positiva quando a Receita Bula de 1% for lançada).
--
-- ERP:
--   • CONTAS A PAGAR — comissões Marcelo (1.290), Fábio (1.584),
--     Douglas (1.314): lançadas abaixo neste script.
--   • CONTA A RECEBER — Receita Bula: NÃO lançada — depende do
--     faturamento total do leilão.
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
  'Leilão Nelore Tresmar – 21/05/2026',
  '2026-05-21',
  '',
  60,        -- lotes ofertados (bula_leiloes.animais = 60 touros; catálogo não disponível)
  8,         -- lotes vendidos (NOSSA COBERTURA)
  8,         -- animais vendidos (NOSSA COBERTURA — 8 touros)
  183000,    -- VGV total NOSSA COBERTURA
  NULL,      -- faturamento total oficial do leilão (não reportado)
  22875,     -- ticket médio (R$ 183.000 / 8 lotes)
  2150,      -- maior parcela mapeada (Lt 01, Marcelo Carneiro)
  5,         -- compradores únicos (NOSSA COBERTURA)
  3,         -- estados alcançados (MG, PA, MA — NOSSA COBERTURA)

  -- por_assessor (NOSSA COBERTURA, ordenado por VGV)
  '[
    {"posicao":1,"nome":"Douglas Bispo","empresa":"Bula Assessoria","transacoes":2,"animais":4,"vgv":65700,"ticket_medio":32850,"pct_total":0.3590},
    {"posicao":2,"nome":"Marcelo Carneiro","empresa":"Fórmula do Boi","transacoes":1,"animais":1,"vgv":64500,"ticket_medio":64500,"pct_total":0.3525},
    {"posicao":3,"nome":"Fábio Omena","empresa":"Bula Assessoria","transacoes":2,"animais":3,"vgv":52800,"ticket_medio":26400,"pct_total":0.2885}
  ]'::jsonb,

  -- por_estado (NOSSA COBERTURA)
  '[
    {"uf":"MG","estado":"Minas Gerais","lotes":3,"animais":3,"vgv":95700,"pct_total":0.5230},
    {"uf":"PA","estado":"Pará","lotes":4,"animais":4,"vgv":69300,"pct_total":0.3787},
    {"uf":"MA","estado":"Maranhão","lotes":1,"animais":1,"vgv":18000,"pct_total":0.0984}
  ]'::jsonb,

  -- compradores (NOSSA COBERTURA, rank por VGV)
  '[
    {"rank":1,"fazenda":"Nelore Tavares","comprador":"Torão","cidade":"João Pinheiro","uf":"MG","lotes":1,"animais":1,"vgv":64500},
    {"rank":2,"fazenda":"Fazenda Flor da Mata","comprador":"Edilberto Sarubi","cidade":"Oriximiná","uf":"PA","lotes":3,"animais":3,"vgv":47700},
    {"rank":3,"fazenda":"Fazenda Ponte das Tábuas","comprador":"Dr Salomão Pereira","cidade":"Rio Preto","uf":"MG","lotes":2,"animais":2,"vgv":31200},
    {"rank":4,"fazenda":"Fazenda Minas Gerais","comprador":"Sr André Caetano","cidade":"Marabá","uf":"PA","lotes":1,"animais":1,"vgv":21600},
    {"rank":5,"fazenda":"Fazenda Terra Viva","comprador":"Geilson de Souza","cidade":"São Pedro dos Crentes","uf":"MA","lotes":1,"animais":1,"vgv":18000}
  ]'::jsonb,

  -- lances (cada batida de martelo da NOSSA COBERTURA)
  '[
    {"lote":"01","vendedor":"Nelore Tresmar","fazenda":"Nelore Tavares","comprador":"Torão","cidade":"João Pinheiro","uf":"MG","assessor":"Marcelo Carneiro","empresa":"Fórmula do Boi","animais":1,"parcela":2150,"vgv":64500,"observacao":"Comprador \"Torão\" — novo investidor (Nelore Tavares). Parcela corrigida de R$ 2.050 para R$ 2.150 pelo Marcelo Primo Carneiro no grupo. Parcela R$ 2.150 × 30"},
    {"lote":"08","vendedor":"Nelore Tresmar","fazenda":"Fazenda Minas Gerais","comprador":"Sr André Caetano","cidade":"Marabá","uf":"PA","assessor":"Fábio Omena","empresa":"Bula Assessoria","animais":1,"parcela":720,"vgv":21600,"observacao":"Parcela R$ 720 × 30"},
    {"lote":"31·32","vendedor":"Nelore Tresmar","fazenda":"Fazenda Ponte das Tábuas","comprador":"Dr Salomão Pereira","cidade":"Rio Preto","uf":"MG","assessor":"Fábio Omena","empresa":"Bula Assessoria","animais":2,"parcela":520,"vgv":31200,"observacao":"Pacote Lt 31 e 32 — 2 touros, parcela R$ 520 por touro × 30"},
    {"lote":"37","vendedor":"Nelore Tresmar","fazenda":"Fazenda Terra Viva","comprador":"Geilson de Souza","cidade":"São Pedro dos Crentes","uf":"MA","assessor":"Douglas Bispo","empresa":"Bula Assessoria","animais":1,"parcela":600,"vgv":18000,"observacao":"Parcela R$ 600 × 30"},
    {"lote":"27·28·29","vendedor":"Nelore Tresmar","fazenda":"Fazenda Flor da Mata","comprador":"Edilberto Sarubi","cidade":"Oriximiná","uf":"PA","assessor":"Douglas Bispo","empresa":"Bula Assessoria","animais":3,"parcela":530,"vgv":47700,"observacao":"Pacote Lt 27, 28 e 29 — 3 touros, parcela R$ 530 por touro × 30"}
  ]'::jsonb,

  NULL,      -- perfil_genetico

  4188,      -- comissao_assessoria = Marcelo 1.290 + Fábio 1.584 + Douglas 1.314
  0,         -- receita_bula = PENDENTE (1% × faturamento total, não reportado)
  -4188,     -- sobra_bruta = R$ 0 − R$ 4.188 (provisória — receita pendente)

  0.01,      -- acordo_pct_faturamento
  NULL,      -- acordo_pct_venda_cobertura
  '1% do faturamento total do leilão',

  'Leilão da própria BULA REMATES (leiloeira) — criador/vendedor Nelore Tresmar; modalidade virtual (transmissão Canal do Boi); oferta de touros (machos) Nelore Padrão. Registro operacional em bula_leiloes: 60 touros, condição de pagamento 30 parcelas (2+2+2+2+2+2+2+2+2+10), comissão do leiloeiro 8% comprador. Catálogo não disponível no sistema — lotes_ofertados = 60 conforme a contagem de touros de bula_leiloes (1 animal/lote). NOSSA COBERTURA (Fórmula+Bula): 8 lotes / 8 touros / R$ 183.000 / 5 compradores / 3 UFs. Cobertura reportada via grupo WhatsApp (mensagens encaminhadas pelo Marcelo Primo Carneiro, 22:35–22:46). Pagamento: 30 parcelas. Por assessor: Douglas Bispo (Bula Assessoria) — 2 lances / 4 touros / R$ 65.700 (35,90%): Lt 37 (1 touro, parcela R$ 600 × 30 = R$ 18.000, Geilson de Souza / Fazenda Terra Viva, São Pedro dos Crentes/MA) + pacote Lt 27·28·29 (3 touros, parcela R$ 530/touro × 30 = R$ 47.700, Edilberto Sarubi / Fazenda Flor da Mata, Oriximiná/PA). Marcelo Carneiro (Fórmula do Boi) — 1 lance / 1 touro / R$ 64.500 (35,25%): Lt 01 (parcela R$ 2.150 × 30 = R$ 64.500, comprador "Torão" / Nelore Tavares, novo investidor, João Pinheiro/MG) — parcela corrigida de R$ 2.050 para R$ 2.150 pelo próprio Marcelo Primo Carneiro no grupo ("Essa minha foi 2.150"). Fábio Omena (Bula Assessoria) — 2 lances / 3 touros / R$ 52.800 (28,85%): Lt 08 (1 touro, parcela R$ 720 × 30 = R$ 21.600, Sr André Caetano / Fazenda Minas Gerais, Marabá/PA) + pacote Lt 31·32 (2 touros, parcela R$ 520/touro × 30 = R$ 31.200, Dr Salomão Pereira / Fazenda Ponte das Tábuas, Rio Preto/MG). RECEITA BULA — acordo do cronograma 1% do faturamento total do leilão: faturamento total não reportado → receita_bula = R$ 0 PENDENTE (= 1% × faturamento total quando confirmado). COMISSÃO ASSESSORIA = R$ 4.188 (lançada no ERP): Marcelo Carneiro 2% × R$ 64.500 = R$ 1.290; Fábio Omena 3% × R$ 52.800 = R$ 1.584; Douglas Bispo 2% × R$ 65.700 = R$ 1.314 (percentuais conforme planilha Folha & Estrutura de Comissões e regra dos 2% para Fórmula do Boi). SOBRA BRUTA = R$ 0 − R$ 4.188 = −R$ 4.188 (provisória/negativa — vira positiva quando a Receita Bula de 1% do faturamento for lançada). ⚠ PENDÊNCIAS: (a) faturamento total oficial do leilão — necessário para a Receita Bula (1%) e a conta a receber no ERP; (b) contagem exata de lotes do catálogo (usado bula_leiloes.animais = 60); (c) confirmar se as 5 mensagens encaminhadas são a cobertura COMPLETA da equipe.'

WHERE NOT EXISTS (
  SELECT 1 FROM public.bula_leilao_fechamento
  WHERE data = '2026-05-21'
    AND nome = 'Leilão Nelore Tresmar – 21/05/2026'
);


-- ── CONTA A PAGAR — COMISSÃO MARCELO CARNEIRO (2%) ─────────────
-- 2% × R$ 64.500 (Lt 01) = R$ 1.290.
INSERT INTO public.erp_finance_transactions (
  account_id, category_id, type, amount, description, observacao,
  transaction_date, status
)
SELECT
  (SELECT id FROM public.erp_finance_accounts ORDER BY created_at LIMIT 1),
  (SELECT id FROM public.erp_finance_categories WHERE name = 'Fornecedores' AND type = 'expense' LIMIT 1),
  'expense',
  1290,
  'Comissão Marcelo Carneiro (Fórmula do Boi) – 2% – Lt 01 Leilão Nelore Tresmar',
  'Leilão 21/05/2026 – Nelore Tresmar (Bula Remates, virtual). Marcelo Carneiro intermediou 1 lance / 1 touro: Lt 01 (parcela R$ 2.150 × 30 = R$ 64.500) para "Torão" / Nelore Tavares (novo investidor, João Pinheiro/MG). 2% × R$ 64.500 = R$ 1.290 (regra Fórmula do Boi).',
  '2026-05-21',
  'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM public.erp_finance_transactions
  WHERE description = 'Comissão Marcelo Carneiro (Fórmula do Boi) – 2% – Lt 01 Leilão Nelore Tresmar'
    AND transaction_date = '2026-05-21'
);


-- ── CONTA A PAGAR — COMISSÃO FÁBIO OMENA (3%) ──────────────────
-- 3% × R$ 52.800 (Lt 08 + Lt 31·32) = R$ 1.584.
INSERT INTO public.erp_finance_transactions (
  account_id, category_id, type, amount, description, observacao,
  transaction_date, status
)
SELECT
  (SELECT id FROM public.erp_finance_accounts ORDER BY created_at LIMIT 1),
  (SELECT id FROM public.erp_finance_categories WHERE name = 'Fornecedores' AND type = 'expense' LIMIT 1),
  'expense',
  1584,
  'Comissão Fábio Omena (Bula Assessoria) – 3% – Lt 08 e 31·32 Leilão Nelore Tresmar',
  'Leilão 21/05/2026 – Nelore Tresmar (Bula Remates, virtual). Fábio Omena intermediou 2 lances / 3 touros: Lt 08 (parcela R$ 720 × 30 = R$ 21.600, Sr André Caetano / Marabá-PA) + Lt 31·32 (2 touros, parcela R$ 520/touro × 30 = R$ 31.200, Dr Salomão Pereira / Rio Preto-MG). Total cobertura R$ 52.800. 3% × R$ 52.800 = R$ 1.584 (percentual conforme planilha Folha & Estrutura de Comissões).',
  '2026-05-21',
  'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM public.erp_finance_transactions
  WHERE description = 'Comissão Fábio Omena (Bula Assessoria) – 3% – Lt 08 e 31·32 Leilão Nelore Tresmar'
    AND transaction_date = '2026-05-21'
);


-- ── CONTA A PAGAR — COMISSÃO DOUGLAS BISPO (2%) ────────────────
-- 2% × R$ 65.700 (Lt 37 + Lt 27·28·29) = R$ 1.314.
INSERT INTO public.erp_finance_transactions (
  account_id, category_id, type, amount, description, observacao,
  transaction_date, status
)
SELECT
  (SELECT id FROM public.erp_finance_accounts ORDER BY created_at LIMIT 1),
  (SELECT id FROM public.erp_finance_categories WHERE name = 'Fornecedores' AND type = 'expense' LIMIT 1),
  'expense',
  1314,
  'Comissão Douglas Bispo (Bula Assessoria) – 2% – Lt 37 e 27·28·29 Leilão Nelore Tresmar',
  'Leilão 21/05/2026 – Nelore Tresmar (Bula Remates, virtual). Douglas Bispo intermediou 2 lances / 4 touros: Lt 37 (parcela R$ 600 × 30 = R$ 18.000, Geilson de Souza / São Pedro dos Crentes-MA) + Lt 27·28·29 (3 touros, parcela R$ 530/touro × 30 = R$ 47.700, Edilberto Sarubi / Oriximiná-PA). Total cobertura R$ 65.700. 2% × R$ 65.700 = R$ 1.314 (percentual conforme planilha Folha & Estrutura de Comissões).',
  '2026-05-21',
  'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM public.erp_finance_transactions
  WHERE description = 'Comissão Douglas Bispo (Bula Assessoria) – 2% – Lt 37 e 27·28·29 Leilão Nelore Tresmar'
    AND transaction_date = '2026-05-21'
);
