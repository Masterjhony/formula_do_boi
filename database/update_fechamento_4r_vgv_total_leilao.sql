-- ============================================================
-- CORREÇÃO — Fechamento 32° Leilão 4R (09/05/2026, Dourados/MS)
--
-- Diretiva chefe (11/05/2026, segunda rodada): o relatório é da
-- ASSESSORIA, não do leilão. VGV exibido = NOSSA COBERTURA (4 lotes
-- / R$ 165.000), não os R$ 4.123.500 do leilão inteiro. A somatória
-- oficial da leiloeira (Programa Leilões + Leiloboi: 136 machos /
-- R$ 4.123.500 / média R$ 30.319,85 / 50 compradores / 7 estados
-- BA, GO, MG, MS, MT, PA, SP) fica apenas como referência nas
-- observações.
--
-- Mantém a centralização Pedro Barnabé → Marcelo Carneiro (diretiva
-- mesma data) com comissão FdB 2% incidindo sobre Marcelo Lt 76
-- (R$ 22.500) + Pedro Lt 91 (R$ 69.000) = R$ 1.830 paga
-- integralmente a Marcelo, discriminada por assessor original:
--   • Marcelo Carneiro (Lt 76)  → 2% = R$    450,00
--   • Pedro Barnabé    (Lt 91)  → 2% = R$  1.380,00
--                                TOTAL R$ 1.830,00
--
-- Receita Bula = R$ 0 (taxa NÃO informada pelo chefe para este
-- leilão; Bula Remates aparece como leiloeira do lado MRA mas o %
-- específico ainda não foi confirmado — revisar quando vier).
-- Sobra bruta = 0 − 1.830 = −R$ 1.830,00 (negativa até receita
-- Bula ser lançada).
-- ============================================================

UPDATE public.bula_leilao_fechamento
SET lotes_vendidos      = 4,
    animais_vendidos    = 4,
    vgv_total           = 165000,
    ticket_medio        = 41250,
    compradores_unicos  = 4,
    estados_alcancados  = 2,
    receita_bula        = 0,
    comissao_assessoria = 1830,
    sobra_bruta         = -1830,
    observacoes         = 'Leilão de TERCEIRO — promotor Programa Leilões + Leiloboi; vendedores Cabanha KITO (Nelore Pintado) + Cabanha MRA. Local: Dourados/MS. Pagamento: 30 parcelas (2+2+2+2+2+2+2+2+2+2+10 mensais), comissão de compra 8% (até 3x cartão), à vista 12% desconto, 12 parcelas (02+10) 8% desconto. CABEÇALHO = NOSSA COBERTURA (somos assessoria, não o leilão) — 4 lotes / 4 machos / R$ 165.000 / 4 compradores / 2 UFs (MG: 3 lotes R$ 115.500; BA: 1 lote R$ 49.500). REFERÊNCIA — somatória oficial da leiloeira (não entra no header): 136 machos / R$ 4.123.500 / média R$ 30.319,85 / 50 compradores / 7 estados (BA, GO, MG, MS, MT, PA, SP) — comparativo divulgado total +13,76% e média +20,46%. Por assessor (cobertura, nomes originais preservados no jsonb; canonicalização Pedro→Marcelo aplicada na renderização): Fábio Omena (Bula) — 2 lotes (Lt 94 R$ 49.500 c/ co-assessoria Leandro Moura LM ASSESSORIA + Lt 40 R$ 24.000) = R$ 73.500 (44,55%). Pedro Barnabe (Fórmula do Boi / Aceleradora) — 1 lote (Lt 91 R$ 69.000) — animal vai para Central Bela Vista coletar e entra no programa Aceleradora de Touros = R$ 69.000 (41,82%). Marcelo Carneiro (Fórmula) — 1 lote (Lt 76 R$ 22.500) = R$ 22.500 (13,64%). COMISSÃO FdB 2% (diretiva chefe 11/05/2026 — Pedro Barnabé centralizado sob Marcelo Carneiro): R$ 1.830 pagos integralmente a Marcelo Carneiro, discriminados como Marcelo Lt 76 R$ 450 + Pedro Lt 91 R$ 1.380. Fábio Omena (Bula) fora da regra dos 2% — Bula tem rotina própria. RECEITA BULA: R$ 0 (taxa NÃO informada pelo chefe para este leilão — revisar quando confirmada; Bula Remates aparece como leiloeira do lado MRA, pode haver % específico). Sobra bruta = 0 − 1.830 = −R$ 1.830,00 até receita Bula ser lançada. ⚠ Lt 94 entrou no print com co-assessoria Leandro Moura (LM ASSESSORIA) → canonicalizado como Fábio Omena/Bula Assessoria com obs do co-assessor (padrão histórico do banco).',
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
WHERE description IN (
        'Comissão Marcelo Carneiro (Fórmula do Boi) – 2% – Lt 76 32° Leilão 4R',
        'Comissão FdB 2% – 32° Leilão 4R (R$ 1.830 a Marcelo Carneiro)'
      )
  AND transaction_date = '2026-05-09';
