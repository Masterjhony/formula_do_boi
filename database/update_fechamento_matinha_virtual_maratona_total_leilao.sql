-- ============================================================
-- UPDATE — Fechamento Leilão Matrizes Matinha (17/05/2026)
-- Lançamento do FATURAMENTO GERAL do leilão inteiro
-- (Virtual Maratona Matinha – Matrizes)
--
-- Fonte: comparativo enviado pelo chefe em 19/05/2026.
--   • 2026  Individual:    37 lotes · média R$ 40.102,70 · total R$ 1.483.800
--   • 2026  Bateria:      124 lotes · média R$ 20.508,87 · total R$ 2.543.100
--   • SOMATÓRIA TOTAL:    161 lotes · média R$ 25.011,80 · total R$ 4.026.900
--   • Crescimento vs ano anterior: TOTAL +18,74% · MÉDIA +37,91%
--   • Compradores únicos: 44
--   • Estados alcançados: 16 (AL, BA, CE, DF, GO, MG, MT, PA, PB, PR, RJ, RN, RO, RR, SE, SP, TO)
--
-- IMPORTANTE: nossa COBERTURA (Fórmula+Bula) permanece intocada
-- por diretiva chefe 11/05/2026 ("VGV no fechamento sempre = nossa
-- cobertura — somos assessoria, não o leilão"):
--   • vgv_total = R$ 177.000 (3 lotes Marcelo Carneiro → Orismar)
--   • receita_bula = R$ 8.850 (5% × cobertura — acordo Matinha)
--   • comissao_assessoria = R$ 3.540 (2% × cobertura)
--   • sobra_bruta = R$ 5.310
-- Esses números NÃO mudam — o acordo Rancho da Matinha é sobre
-- venda da nossa cobertura, não sobre faturamento total. O update
-- abaixo só registra o faturamento total da leiloeira para fins
-- de comparativo / share de cobertura.
-- ============================================================

UPDATE public.bula_leilao_fechamento
SET faturamento_total_leilao = 4026900,
    observacoes = observacoes || ' [GERAL DO LEILÃO – fonte chefe 19/05/2026] Faturamento total oficial (toda a leiloeira): R$ 4.026.900 em 161 lotes vendidos (37 individuais @ R$ 40.102,70 média = R$ 1.483.800; 124 bateria @ R$ 20.508,87 média = R$ 2.543.100). Ticket médio geral: R$ 25.011,80. Compradores únicos: 44. Estados alcançados: 16 (AL, BA, CE, DF, GO, MG, MT, PA, PB, PR, RJ, RN, RO, RR, SE, SP, TO). Comparativo com edição anterior: TOTAL +18,74%, MÉDIA +37,91%. Share da nossa cobertura: R$ 177.000 / R$ 4.026.900 = 4,39% do VGV, 3 / 161 = 1,86% dos lotes. Receita Bula e comissão Marcelo não mudam — acordo Rancho da Matinha é 5% sobre venda da cobertura (R$ 8.850), não sobre faturamento total.',
    updated_at = NOW()
WHERE nome = 'Leilão Matrizes Matinha – 17/05/2026'
  AND data = '2026-05-17';
