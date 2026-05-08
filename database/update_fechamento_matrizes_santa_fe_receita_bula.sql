-- ============================================================
-- UPDATE — Receita Bula × Leilão Matrizes Fazenda Santa Fé (07/05/2026)
--
-- Acordo informado pelo chefe (WhatsApp 08/05): comissão da Bula nesse
-- leilão tem DOIS componentes:
--   • 1,5% sobre o faturamento TOTAL do leilão (R$ 960.000)
--   • 3% sobre o que NÓS vendemos (R$ 207.000 — cobertura mapeada)
--
--   1,5% × 960.000 = R$ 14.400
--   3,0% × 207.000 = R$  6.210
--   Receita Bula   = R$ 20.610  (a receber da promotora)
--
-- Comissão Marcelo Carneiro (2% × R$ 30.000) = R$ 600 já lançada.
-- Sobra bruta = 20.610 − 600 = R$ 20.010
--
-- Confirmações do chefe registradas: 9 lotes / 30 parcelas (já
-- refletidos no fechamento anterior).
-- ============================================================

UPDATE public.bula_leilao_fechamento
SET receita_bula = 20610,
    sobra_bruta  = 20610 - COALESCE(comissao_assessoria, 0),
    observacoes  = 'Leilão de TERCEIRO — promotor Programa Leilões Nordeste (Sérgio Alcântara) + Agreste Leilões Rurais; vendedor Fazenda Santa Fé (Lote 32 partilhado 50/50 com FLOC). Catálogo: 35 lotes (Lote 27 retirado → 34 ativos, todos vendidos no leilão). Somatória oficial da leiloeira: 33,5 lotes / R$ 960.000 / 17 compradores / estados AL/BA/MG/PB/PE/PI/TO — PA omitido por erro de arte (confirmado pelo chefe). Pagamento padrão: 30 parcelas (5 dup. + 20). NOSSA COBERTURA (Fórmula+Bula): 9 lotes / 9 matrizes / R$ 207.000 / 4 compradores / 3 UFs confirmadas (TO, PA, PB) + 1 UF pendente (Orismar Leão). Por assessor: Douglas Bispo (Bula) — 6 lotes em 2 lances para Gilberto Sarubi (Fazenda Garantido, Oriximiná/PA): Lt 32 R$ 21k + pacote Lts 30·12·15·16·13 R$ 93k = R$ 114k (55,07%). Fábio Omena (Bula) — 2 lotes: Lt 25 R$ 42k para João Pereira da Silva (Buriti Alegre, Barrolândia/TO) + Lt 08 R$ 21k para Irmãos Milton e Mailton Vale (Canaã, Mamanguape/PB) = R$ 63k (30,43%). Marcelo Carneiro (Fórmula do Boi) — 1 lote: Lt 20 (3-em-1) R$ 30k para Orismar Moreira Leão (Nelore Leão) = R$ 30k (14,49%). RECEITA BULA: acordo de 1,5% sobre VGV total do leilão (R$ 960k → R$ 14.400) + 3% sobre VGV nossa cobertura (R$ 207k → R$ 6.210) = R$ 20.610 a receber. Comissão Marcelo (2% × R$ 30k) = R$ 600 a pagar. Sobra bruta = R$ 20.010. ⚠ PENDÊNCIAS: (a) UF do Orismar Moreira Leão; (b) rateio Santa Fé × FLOC do Lote 32.',
    updated_at   = NOW()
WHERE nome = 'Leilão Matrizes Fazenda Santa Fé – 07/05/2026'
  AND data = '2026-05-07';


-- ── CONTA A RECEBER — RECEITA BULA × SANTA FÉ ───────────────────
-- 1,5% × R$ 960.000 + 3% × R$ 207.000 = R$ 14.400 + R$ 6.210 = R$ 20.610
INSERT INTO public.erp_finance_transactions (
  account_id, category_id, type, amount, description, observacao,
  transaction_date, status
)
SELECT
  (SELECT id FROM public.erp_finance_accounts ORDER BY created_at LIMIT 1),
  (SELECT id FROM public.erp_finance_categories WHERE name = 'Recebimentos' AND type = 'income' LIMIT 1),
  'income',
  20610,
  'Receita Bula – Matrizes Santa Fé – 1,5% total + 3% cobertura – Leilão 07/05/2026',
  'A receber da promotora (Programa Leilões Nordeste / Fazenda Santa Fé). Acordo: 1,5% sobre VGV total do leilão (R$ 960.000) + 3% sobre VGV das nossas vendas (R$ 207.000). Cálculo: 1,5% × 960.000 = R$ 14.400; 3% × 207.000 = R$ 6.210; Total = R$ 20.610. Cobertura: 9 lotes / 4 compradores (Sarubi/PA, João Pereira/TO, Irmãos Vale/PB, Orismar/Nelore Leão). Assessores: Douglas Bispo, Fábio Omena (Bula) e Marcelo Carneiro (Fórmula).',
  '2026-05-07',
  'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM public.erp_finance_transactions
  WHERE description = 'Receita Bula – Matrizes Santa Fé – 1,5% total + 3% cobertura – Leilão 07/05/2026'
    AND transaction_date = '2026-05-07'
);
