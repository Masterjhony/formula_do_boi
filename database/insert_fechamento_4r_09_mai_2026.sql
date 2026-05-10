-- ============================================================
-- Fechamento — 32° Leilão 4R (09/05/2026, Dourados/MS)
--
-- Leilão de TERCEIRO em que Fórmula+Bula PARTICIPARAM cobrindo
-- compradores. Promotor: Programa Leilões + Leiloboi. Vendedores:
-- Cabanha KITO (Nelore Pintado) + Cabanha MRA. Pagamento: 30 parcelas
-- (2+2+2+2+2+2+2+2+2+2+10 mensais), comissão de compra 8% (até 3x cartão),
-- à vista 12% desconto, 12 parcelas (02+10) 8% desconto.
--
-- HEADER (lotes_ofertados é referência do catálogo; demais campos do
-- header refletem NOSSA COBERTURA — mesma soma dos jsonbs).
-- Oficial divulgado pela leiloeira (referência, NÃO entra no header):
--   136 machos / R$ 4.123.500,00 / média R$ 30.319,85 / 50 compradores
--   / 7 estados (BA, GO, MG, MS, MT, PA, SP).
--
-- NOSSA COBERTURA (mensagens encaminhadas pelo Marcelo Primo Carneiro):
--   Pedro Barnabe (Fórmula do Boi / Aceleradora) — 1 lance / 1 macho / R$ 69.000
--     • Lt 91 (cabanha MRA, parcela R$ 2.300 × 30) – Orismar Moreira Leão
--       (Fazenda Nelore Leão, João Pinheiro/MG). Animal vai para Central
--       Bela Vista coletar — entra no programa "Aceleradora de Touros".
--   Fábio Omena (Bula Assessoria) — 2 lances / 2 machos / R$ 73.500
--     • Lt 94 (cabanha MRA, parcela R$ 1.650 × 30) – Givaldo Ferreira Neves
--       (Fazenda Bell Monte, Guajeru/BA). Co-assessoria Leandro Moura
--       (LM ASSESSORIA) — registrado em "observacao" do lance.
--       Lt 94 inicialmente ficou sem valor; corrigido em 20:10 pelo Marcelo Primo.
--     • Lt 40 (cabanha KITO, parcela R$ 800 × 30) – Ailton Gabriel de Sousa
--       (Fazenda Santa Rita, São Gonçalo do Sapucaí/MG).
--   Marcelo Carneiro (Fórmula do Boi) — 1 lance / 1 macho / R$ 22.500
--     • Lt 76 (cabanha KITO, parcela R$ 750 × 30) – Marco Aurélio Resende
--       (Fazenda Ribeirão, Resende Costa/MG).
--
-- Total cobertura: 4 lotes / 4 machos / R$ 165.000 / 4 compradores / 2 UFs
-- (MG: 3 lotes R$ 115.500; BA: 1 lote R$ 49.500). Cobertura proporcional ao
-- leilão: ~2,94% dos lotes / ~4,00% do VGV / 8% dos compradores.
--
-- Conta a pagar (regra histórica dos 2% FdB — Bulinha/Marcelo/Matheus):
--   • Marcelo Carneiro: 2% × R$ 22.500 = R$ 450
--   • Pedro Barnabe (FdB / Aceleradora) — NOVO no roster, fora da regra
--     dos 2% por enquanto — REVISAR com o chefe se entra.
--   • Fábio Omena (Bula) — fora da regra (Bula tem rotina própria).
--
-- Receita Bula: 0 — taxa para este leilão NÃO foi informada pelo chefe.
-- Revisar quando a taxa for confirmada (Bula Remates aparece como leiloeira
-- do lado MRA; pode haver % específico). Sobra bruta = 0 − 450 = −R$ 450
-- até a receita ser lançada.
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
  '32° Leilão 4R – 09/05/2026',
  '2026-05-09',
  'Dourados/MS',
  136,       -- lotes ofertados (catálogo: 136 machos KITO + MRA)
  4,         -- lotes vendidos (NOSSA COBERTURA)
  4,         -- animais vendidos (1 macho por lote)
  165000,    -- VGV total (NOSSA COBERTURA)
  41250,     -- ticket médio (165.000 / 4)
  2300,      -- maior parcela mapeada (Lt 91, Pedro Barnabe)
  4,         -- compradores únicos (NOSSA COBERTURA)
  2,         -- estados alcançados (MG, BA — NOSSA COBERTURA)

  -- por_assessor (NOSSA COBERTURA, ordenado por VGV)
  '[
    {"posicao":1,"nome":"Fábio Omena","empresa":"Bula Assessoria","transacoes":2,"animais":2,"vgv":73500,"ticket_medio":36750,"pct_total":0.4455},
    {"posicao":2,"nome":"Pedro Barnabe","empresa":"Fórmula do Boi","transacoes":1,"animais":1,"vgv":69000,"ticket_medio":69000,"pct_total":0.4182},
    {"posicao":3,"nome":"Marcelo Carneiro","empresa":"Fórmula do Boi","transacoes":1,"animais":1,"vgv":22500,"ticket_medio":22500,"pct_total":0.1364}
  ]'::jsonb,

  -- por_estado (NOSSA COBERTURA)
  '[
    {"uf":"MG","estado":"Minas Gerais","lotes":3,"animais":3,"vgv":115500,"pct_total":0.7000},
    {"uf":"BA","estado":"Bahia","lotes":1,"animais":1,"vgv":49500,"pct_total":0.3000}
  ]'::jsonb,

  -- compradores (NOSSA COBERTURA, rank por VGV)
  '[
    {"rank":1,"fazenda":"Nelore Leão","comprador":"Orismar Moreira Leão","cidade":"João Pinheiro","uf":"MG","lotes":1,"animais":1,"vgv":69000},
    {"rank":2,"fazenda":"Fazenda Bell Monte","comprador":"Givaldo Ferreira Neves","cidade":"Guajeru","uf":"BA","lotes":1,"animais":1,"vgv":49500},
    {"rank":3,"fazenda":"Fazenda Santa Rita","comprador":"Ailton Gabriel de Sousa","cidade":"São Gonçalo do Sapucaí","uf":"MG","lotes":1,"animais":1,"vgv":24000},
    {"rank":4,"fazenda":"Fazenda Ribeirão","comprador":"Marco Aurélio Resende","cidade":"Resende Costa","uf":"MG","lotes":1,"animais":1,"vgv":22500}
  ]'::jsonb,

  -- lances (cada batida de martelo da NOSSA COBERTURA)
  '[
    {"lote":"91","vendedor":"Cabanha MRA","fazenda":"Nelore Leão","comprador":"Orismar Moreira Leão","cidade":"João Pinheiro","uf":"MG","assessor":"Pedro Barnabe","empresa":"Fórmula do Boi","animais":1,"parcela":2300,"vgv":69000,"observacao":"Animal entra no programa Aceleradora de Touros (Fórmula do Boi) — vai para Central Bela Vista coletar"},
    {"lote":"94","vendedor":"Cabanha MRA","fazenda":"Fazenda Bell Monte","comprador":"Givaldo Ferreira Neves","cidade":"Guajeru","uf":"BA","assessor":"Fábio Omena","empresa":"Bula Assessoria","animais":1,"parcela":1650,"vgv":49500,"observacao":"co-assessoria Leandro Moura (LM ASSESSORIA); lote inicialmente sem valor, corrigido em 20:10 pelo Marcelo Primo Carneiro"},
    {"lote":"40","vendedor":"Cabanha KITO","fazenda":"Fazenda Santa Rita","comprador":"Ailton Gabriel de Sousa","cidade":"São Gonçalo do Sapucaí","uf":"MG","assessor":"Fábio Omena","empresa":"Bula Assessoria","animais":1,"parcela":800,"vgv":24000},
    {"lote":"76","vendedor":"Cabanha KITO","fazenda":"Fazenda Ribeirão","comprador":"Marco Aurélio Resende","cidade":"Resende Costa","uf":"MG","assessor":"Marcelo Carneiro","empresa":"Fórmula do Boi","animais":1,"parcela":750,"vgv":22500}
  ]'::jsonb,

  NULL,      -- perfil_genetico (catálogo extenso; índices não consolidados aqui)
  450,       -- comissao_assessoria: 2% × R$ 22.500 (Marcelo Carneiro)
  0,         -- receita_bula: taxa NÃO informada pelo chefe — revisar
  -450,      -- sobra_bruta = 0 − 450 (negativa até receita_bula ser lançada)

  'Leilão de TERCEIRO — promotor Programa Leilões + Leiloboi; vendedores Cabanha KITO (Nelore Pintado) + Cabanha MRA. Local: Dourados/MS. Pagamento: 30 parcelas (2+2+2+2+2+2+2+2+2+2+10 mensais), comissão de compra 8% (até 3x cartão), à vista 12% desconto, 12 parcelas (02+10) 8% desconto. SOMATÓRIA OFICIAL DA LEILOEIRA (referência, não entra no header): 136 machos / R$ 4.123.500 / média R$ 30.319,85 / 50 compradores / 7 estados (BA, GO, MG, MS, MT, PA, SP) — comparativo de crescimento divulgado: total +13,76% e média +20,46%. NOSSA COBERTURA (Fórmula+Bula): 4 lotes / 4 machos / R$ 165.000 / 4 compradores / 2 UFs (MG: 3 lotes R$ 115.500; BA: 1 lote R$ 49.500) — cobertura proporcional ~2,94% dos lotes / ~4,00% do VGV / 8% dos compradores. Por assessor: Fábio Omena (Bula) — 2 lotes (Lt 94 R$ 49.500 c/ co-assessoria Leandro Moura LM ASSESSORIA + Lt 40 R$ 24.000) = R$ 73.500 (44,55%). Pedro Barnabe (Fórmula do Boi / Aceleradora) — 1 lote (Lt 91 R$ 69.000) — animal vai para Central Bela Vista coletar e entra no programa Aceleradora de Touros = R$ 69.000 (41,82%). Marcelo Carneiro (Fórmula) — 1 lote (Lt 76 R$ 22.500) = R$ 22.500 (13,64%). Comissão: aplicada regra histórica dos 2% FdB → Marcelo 2% × R$ 22.500 = R$ 450 lançada. ⚠ PENDÊNCIAS: (a) Pedro Barnabe é NOVO no roster — confirmar com o chefe se entra na regra dos 2% (Aceleradora/FdB); (b) RECEITA BULA não informada para este leilão — Bula Remates aparece como leiloeira do lado MRA, pode haver % específico (revisar quando confirmado); (c) Lt 94 entrou no print com co-assessoria Leandro Moura (LM ASSESSORIA) → canonicalizado como Fábio Omena/Bula Assessoria com obs do co-assessor, seguindo padrão histórico do banco (scripts/unify_assessores_*). Sobra bruta = -R$ 450 até receita Bula ser lançada.'

WHERE NOT EXISTS (
  SELECT 1 FROM public.bula_leilao_fechamento
  WHERE data = '2026-05-09'
    AND nome = '32° Leilão 4R – 09/05/2026'
);


-- ── CONTA A PAGAR — COMISSÃO MARCELO CARNEIRO ──────────────────
-- 2% × R$ 22.500 (Lt 76, Marco Aurélio Resende)
INSERT INTO public.erp_finance_transactions (
  account_id, category_id, type, amount, description, observacao,
  transaction_date, status
)
SELECT
  (SELECT id FROM public.erp_finance_accounts ORDER BY created_at LIMIT 1),
  (SELECT id FROM public.erp_finance_categories WHERE name = 'Fornecedores' AND type = 'expense' LIMIT 1),
  'expense',
  450,
  'Comissão Marcelo Carneiro (Fórmula do Boi) – 2% – Lt 76 32° Leilão 4R',
  'Leilão 09/05/2026 – 32° Leilão 4R (Dourados/MS). Lt 76 (Cabanha KITO, 1 macho) – comprador Marco Aurélio Resende (Fazenda Ribeirão, Resende Costa/MG). Parcela R$ 750 × 30 = R$ 22.500. 2% × R$ 22.500 = R$ 450. Demais lotes da cobertura: Lt 91 com Pedro Barnabe (Fórmula do Boi / Aceleradora — fora da regra dos 2% por ser novo no roster, REVISAR), Lt 94 e Lt 40 com Fábio Omena (Bula Assessoria — fora da regra, rotina própria).',
  '2026-05-09',
  'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM public.erp_finance_transactions
  WHERE description = 'Comissão Marcelo Carneiro (Fórmula do Boi) – 2% – Lt 76 32° Leilão 4R'
    AND transaction_date = '2026-05-09'
);
