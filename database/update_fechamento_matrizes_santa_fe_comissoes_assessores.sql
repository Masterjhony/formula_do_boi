-- ============================================================
-- UPDATE — Comissões dos assessores × Leilão Matrizes Santa Fé (07/05/2026)
--
-- Regra confirmada pelo chefe (Marcelo Carneiro) via WhatsApp 08/05:
--   • Marcelo Carneiro (Fórmula do Boi):  2% sobre o que vendeu
--   • Douglas Bispo (Bula Assessoria):    2% sobre o que vendeu
--   • Fábio Omena (Bula Assessoria):      3% sobre o que vendeu
--
-- Todos os três entram na regra DESTE leilão (diferente de outros
-- fechamentos onde Fábio/Douglas não recebiam pela regra dos 2%).
--
-- Cálculo:
--   Marcelo: 2% × R$  30.000 = R$   600  (já lançada)
--   Douglas: 2% × R$ 114.000 = R$ 2.280  (lançar)
--   Fábio:   3% × R$  63.000 = R$ 1.890  (lançar)
--   Total comissao_assessoria = R$ 4.770
--
-- Receita Bula (1,5% × 960k + 3% × 207k) = R$ 20.610 (mantida)
-- Sobra bruta = 20.610 − 4.770 = R$ 15.840
-- ============================================================

UPDATE public.bula_leilao_fechamento
SET comissao_assessoria = 4770,
    sobra_bruta         = 20610 - 4770,
    observacoes         = 'Leilão de TERCEIRO — promotor Programa Leilões Nordeste (Sérgio Alcântara) + Agreste Leilões Rurais; vendedor Fazenda Santa Fé (Lote 32 partilhado 50/50 com FLOC). Catálogo: 35 lotes (Lote 27 retirado → 34 ativos, todos vendidos). Somatória oficial da leiloeira: 33,5 lotes / R$ 960.000 / 17 compradores / estados AL/BA/MG/PB/PE/PI/TO — PA omitido por erro de arte. Pagamento padrão: 30 parcelas (5 dup. + 20). NOSSA COBERTURA (Fórmula+Bula): 9 lotes / 9 matrizes / R$ 207.000 / 4 compradores / 3 UFs (TO, PA, PB) + 1 pendente (Orismar Leão). Por assessor: Douglas Bispo (Bula) — 6 lotes para Sarubi (PA) = R$ 114k (55,07%); Fábio Omena (Bula) — 2 lotes (Lt 25 → João Pereira/TO + Lt 08 → Irmãos Vale/PB) = R$ 63k (30,43%); Marcelo Carneiro (Fórmula) — Lt 20 → Orismar Leão = R$ 30k (14,49%). RECEITA BULA: 1,5% × R$ 960k (R$ 14.400) + 3% × R$ 207k (R$ 6.210) = R$ 20.610 a receber. COMISSÕES (regra deste leilão, confirmada pelo chefe): Marcelo 2% × R$ 30k = R$ 600; Douglas 2% × R$ 114k = R$ 2.280; Fábio 3% × R$ 63k = R$ 1.890; total R$ 4.770 a pagar. Sobra bruta = R$ 15.840. ⚠ PENDÊNCIAS: (a) UF do Orismar Moreira Leão; (b) rateio Santa Fé × FLOC do Lote 32.',
    updated_at          = NOW()
WHERE nome = 'Leilão Matrizes Fazenda Santa Fé – 07/05/2026'
  AND data = '2026-05-07';


-- ── CONTA A PAGAR — DOUGLAS BISPO (BULA) – 2% × R$ 114.000 ──────
INSERT INTO public.erp_finance_transactions (
  account_id, category_id, type, amount, description, observacao,
  transaction_date, status
)
SELECT
  (SELECT id FROM public.erp_finance_accounts ORDER BY created_at LIMIT 1),
  (SELECT id FROM public.erp_finance_categories WHERE name = 'Fornecedores' AND type = 'expense' LIMIT 1),
  'expense',
  2280,
  'Comissão Douglas Bispo (Bula Assessoria) – 2% – 6 lotes Leilão Matrizes Santa Fé',
  'Leilão 07/05/2026 – Matrizes Fazenda Santa Fé (Maceió/AL). Douglas Bispo intermediou 2 lances / 6 matrizes para Gilberto Sarubi (Fazenda Garantido, Oriximiná/PA): Lt 32 (R$ 21.000) + pacote Lts 30·12·15·16·13 (R$ 93.000) = R$ 114.000. 2% × R$ 114.000 = R$ 2.280. Regra deste leilão (confirmada pelo chefe): Marcelo 2%, Douglas 2%, Fábio 3%.',
  '2026-05-07',
  'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM public.erp_finance_transactions
  WHERE description = 'Comissão Douglas Bispo (Bula Assessoria) – 2% – 6 lotes Leilão Matrizes Santa Fé'
    AND transaction_date = '2026-05-07'
);


-- ── CONTA A PAGAR — FÁBIO OMENA (BULA) – 3% × R$ 63.000 ─────────
INSERT INTO public.erp_finance_transactions (
  account_id, category_id, type, amount, description, observacao,
  transaction_date, status
)
SELECT
  (SELECT id FROM public.erp_finance_accounts ORDER BY created_at LIMIT 1),
  (SELECT id FROM public.erp_finance_categories WHERE name = 'Fornecedores' AND type = 'expense' LIMIT 1),
  'expense',
  1890,
  'Comissão Fábio Omena (Bula Assessoria) – 3% – 2 lotes Leilão Matrizes Santa Fé',
  'Leilão 07/05/2026 – Matrizes Fazenda Santa Fé (Maceió/AL). Fábio Omena intermediou 2 lances / 2 matrizes: Lt 25 (R$ 42.000) para João Pereira da Silva (Fazenda Buriti Alegre, Barrolândia/TO) + Lt 08 (R$ 21.000) para Irmãos Milton e Mailton Vale (Agropecuária Canaã, Mamanguape/PB) = R$ 63.000. 3% × R$ 63.000 = R$ 1.890. Regra deste leilão (confirmada pelo chefe): Marcelo 2%, Douglas 2%, Fábio 3%.',
  '2026-05-07',
  'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM public.erp_finance_transactions
  WHERE description = 'Comissão Fábio Omena (Bula Assessoria) – 3% – 2 lotes Leilão Matrizes Santa Fé'
    AND transaction_date = '2026-05-07'
);
