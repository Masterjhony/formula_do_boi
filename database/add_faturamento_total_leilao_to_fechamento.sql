-- ============================================================
-- Adiciona coluna `faturamento_total_leilao` em bula_leilao_fechamento
--
-- Motivo (chefe 15/05/2026): hoje só temos `vgv_total` (= NOSSA
-- COBERTURA) e `receita_bula` (= fee a receber). Falta um campo
-- próprio para o FATURAMENTO TOTAL OFICIAL do leilão (a leiloeira
-- inteira), que é uma métrica diferente — usado pra calcular % do
-- acordo Bula (X% × faturamento total) e pra comparar share de
-- mercado da nossa cobertura.
--
-- Backfill com os valores da planilha F.xlsx do chefe (15/05/2026).
-- ============================================================

ALTER TABLE public.bula_leilao_fechamento
  ADD COLUMN IF NOT EXISTS faturamento_total_leilao numeric;

COMMENT ON COLUMN public.bula_leilao_fechamento.faturamento_total_leilao IS
  'VGV total oficial do leilão inteiro (toda a leiloeira). Distinto de vgv_total (= nossa cobertura) e de receita_bula (= fee Bula). Fonte: planilha F.xlsx do chefe.';

-- ── Backfill conforme F.xlsx (15/05/2026) ─────────────────────
UPDATE public.bula_leilao_fechamento SET faturamento_total_leilao = 17682200
  WHERE nome = '6º Mega EAO – Fêmeas – Expozebu 02/05/2026' AND data = '2026-05-02';

UPDATE public.bula_leilao_fechamento SET faturamento_total_leilao = 7073500
  WHERE nome = '6º Mega EAO – Touros – Expozebu 03/05/2026' AND data = '2026-05-03';

UPDATE public.bula_leilao_fechamento SET faturamento_total_leilao = 458800
  WHERE nome = '2º Leilão Pintado Raiz – 05/05/2026' AND data = '2026-05-05';

-- Matinha Embrio: xlsx tem FATURAMENTO em branco (acordo é só sobre venda Bula).
-- Mantém NULL.

UPDATE public.bula_leilao_fechamento SET faturamento_total_leilao = 960000
  WHERE nome = 'Leilão Matrizes Fazenda Santa Fé – 07/05/2026' AND data = '2026-05-07';

UPDATE public.bula_leilao_fechamento SET faturamento_total_leilao = 4123500
  WHERE nome = '32° Leilão 4R – 09/05/2026' AND data = '2026-05-09';

UPDATE public.bula_leilao_fechamento SET faturamento_total_leilao = 1142800
  WHERE nome = 'Leilão Excelência Santa Nazaré 2026 – 14/05/2026' AND data = '2026-05-14';
