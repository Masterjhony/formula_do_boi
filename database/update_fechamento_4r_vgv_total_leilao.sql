-- ============================================================
-- CORREÇÃO — Fechamento 32° Leilão 4R (09/05/2026, Dourados/MS)
--
-- Duas diretivas do chefe (11/05/2026) consolidadas neste UPDATE:
--
--   1) VGV / cabeçalho refletem o LEILÃO INTEIRO (não a nossa cobertura).
--      Os R$ 165.000 da nossa cobertura passam a ser RECEITA BULA.
--      Somatória oficial da leiloeira (Programa Leilões + Leiloboi):
--         136 machos / R$ 4.123.500,00 / média R$ 30.319,85 /
--         50 compradores / 7 estados (BA, GO, MG, MS, MT, PA, SP).
--      Cobertura Fórmula+Bula preservada nos jsonbs por_assessor /
--      por_estado / compradores / lances (exibidos no PDF como
--      "% Cobertura"): 4 lotes / 4 machos / R$ 165.000 / 4 compradores /
--      2 UFs (MG R$ 115.500; BA R$ 49.500).
--
--   2) Pedro Barnabé é centralizado sob Marcelo Carneiro (mesma diretiva
--      11/05/2026 — vale também para Matheus Amormino). Comissão FdB 2%
--      passa a incidir sobre as duas vendas (Marcelo Lt 76 R$ 22.500 +
--      Pedro Lt 91 R$ 69.000) totalizando R$ 1.830, pago integralmente a
--      Marcelo, mas DISCRIMINADO por assessor original para fins
--      informativos:
--         • Marcelo Carneiro (Lt 76 R$ 22.500) → 2% = R$    450,00
--         • Pedro Barnabé    (Lt 91 R$ 69.000) → 2% = R$  1.380,00
--                                                   TOTAL R$ 1.830,00
--      Sobra bruta = 165.000 − 1.830 = R$ 163.170,00.
-- ============================================================

UPDATE public.bula_leilao_fechamento
SET lotes_vendidos      = 136,
    animais_vendidos    = 136,
    vgv_total           = 4123500,
    ticket_medio        = 30319.85,
    compradores_unicos  = 50,
    estados_alcancados  = 7,
    receita_bula        = 165000,
    comissao_assessoria = 1830,
    sobra_bruta         = 163170,
    observacoes         = 'Leilão de TERCEIRO — promotor Programa Leilões + Leiloboi; vendedores Cabanha KITO (Nelore Pintado) + Cabanha MRA. Local: Dourados/MS. Pagamento: 30 parcelas (2+2+2+2+2+2+2+2+2+2+10 mensais), comissão de compra 8% (até 3x cartão), à vista 12% desconto, 12 parcelas (02+10) 8% desconto. CABEÇALHO = LEILÃO INTEIRO (diretiva chefe 11/05/2026): 136 machos / R$ 4.123.500,00 / média R$ 30.319,85 / 50 compradores / 7 estados (BA, GO, MG, MS, MT, PA, SP). Comparativo divulgado: total +13,76% e média +20,46%. NOSSA COBERTURA (preservada nos jsonbs por_assessor/por_estado/compradores/lances — exibidos no PDF como "% Cobertura"): 4 lotes / 4 machos / R$ 165.000 / 4 compradores / 2 UFs (MG: 3 lotes R$ 115.500; BA: 1 lote R$ 49.500) — ~2,94% dos lotes / ~4,00% do VGV / 8% dos compradores. Por assessor (cobertura, nomes originais preservados no jsonb): Fábio Omena (Bula) — 2 lotes (Lt 94 R$ 49.500 c/ co-assessoria Leandro Moura LM ASSESSORIA + Lt 40 R$ 24.000) = R$ 73.500 (44,55% da cobertura). Pedro Barnabe (Fórmula do Boi / Aceleradora) — 1 lote (Lt 91 R$ 69.000) — animal vai para Central Bela Vista coletar e entra no programa Aceleradora de Touros = R$ 69.000 (41,82%). Marcelo Carneiro (Fórmula) — 1 lote (Lt 76 R$ 22.500) = R$ 22.500 (13,64%). RECEITA BULA: R$ 165.000 = nossa slice deste leilão (≈ 4,00% do VGV total) — registrada como receita do relatório. COMISSÃO FdB 2% (diretiva chefe 11/05/2026 — Pedro Barnabé centralizado sob Marcelo Carneiro): R$ 1.830 pagos integralmente a Marcelo Carneiro, discriminados como Marcelo Lt 76 R$ 450 + Pedro Lt 91 R$ 1.380. Fábio Omena (Bula) fora da regra dos 2% — Bula tem rotina própria. Sobra bruta = 165.000 − 1.830 = R$ 163.170,00. ⚠ Lt 94 entrou no print com co-assessoria Leandro Moura (LM ASSESSORIA) → canonicalizado como Fábio Omena/Bula Assessoria com obs do co-assessor (padrão histórico do banco).',
    updated_at          = NOW()
WHERE nome = '32° Leilão 4R – 09/05/2026'
  AND data = '2026-05-09';


-- ── CONTA A PAGAR — COMISSÃO CONSOLIDADA MARCELO CARNEIRO ──────
-- Atualiza a transação original (R$ 450 → R$ 1.830), inclui o
-- sourceTag [FECHAMENTO:<id>:ASSESSOR:MARCELO_CARNEIRO] para a camada
-- virtual de helpers.ts não duplicar, e detalha os dois lotes geradores.
UPDATE public.erp_finance_transactions
SET amount      = 1830,
    description = 'Comissão FdB 2% – 32° Leilão 4R (R$ 1.830 a Marcelo Carneiro)',
    observacao  = '[FECHAMENTO:' || (
                    SELECT id::text FROM public.bula_leilao_fechamento
                    WHERE nome = '32° Leilão 4R – 09/05/2026'
                      AND data = '2026-05-09'
                  ) || ':ASSESSOR:MARCELO_CARNEIRO] Leilão 09/05/2026 – 32° Leilão 4R (Dourados/MS). Comissão FdB 2% paga integralmente a Marcelo Carneiro, discriminada por assessor original (diretiva chefe 11/05/2026 — Pedro Barnabé centralizado sob Marcelo): Marcelo Carneiro Lt 76 (Cabanha KITO, 1 macho, comprador Marco Aurélio Resende, Fazenda Ribeirão, Resende Costa/MG, parcela R$ 750 × 30 = R$ 22.500) → 2% = R$ 450,00; Pedro Barnabé Lt 91 (Cabanha MRA, 1 macho, comprador Orismar Moreira Leão, Fazenda Nelore Leão, João Pinheiro/MG, parcela R$ 2.300 × 30 = R$ 69.000, animal vai para Central Bela Vista coletar e entra no programa Aceleradora de Touros) → 2% = R$ 1.380,00. TOTAL = R$ 1.830,00. Demais lotes da cobertura: Lt 94 e Lt 40 com Fábio Omena (Bula Assessoria — fora da regra dos 2%, Bula tem rotina própria).'
WHERE description = 'Comissão Marcelo Carneiro (Fórmula do Boi) – 2% – Lt 76 32° Leilão 4R'
  AND transaction_date = '2026-05-09';
