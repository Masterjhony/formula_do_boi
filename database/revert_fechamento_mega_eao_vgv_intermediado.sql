-- ============================================================
-- REVERTE vgv_total / animais_vendidos / ticket_medio do EAO pra
-- os valores Bula-intermediados (originais dos seeds), mantendo
-- receita_bula = 1% × total oficial (comissão real do contrato).
--
-- Motivo: o card do Fechamento exibe vgv_total. Em todos os outros
-- leilões esse campo guarda o VGV intermediado pela Bula (= a "parte
-- da empresa"), e só o EAO tinha sido patcheado para o total oficial
-- via scripts/ajustar_fechamento_mega_eao_oficial.js — o que fazia o
-- card mostrar R$ 7M / R$ 17M, destoante. Padroniza a regra.
--
-- Total oficial fica registrado em observacoes (já tava lá).
-- ============================================================

-- ── 6º Mega EAO Fêmeas 02/05/2026 ────────────────────────────
UPDATE public.bula_leilao_fechamento
SET vgv_total        = 612900,    -- VGV Bula-intermediado (15 animais em 9 lotes)
    animais_vendidos = 15,
    ticket_medio     = 68100,
    updated_at       = NOW()
WHERE nome = '6º Mega EAO – Fêmeas – Expozebu 02/05/2026'
  AND data = '2026-05-02';

-- ── 6º Mega EAO Touros 03/05/2026 ────────────────────────────
UPDATE public.bula_leilao_fechamento
SET vgv_total        = 640500,    -- VGV Bula-intermediado (19 animais em 16 lotes)
    animais_vendidos = 19,
    ticket_medio     = 40031.25,
    updated_at       = NOW()
WHERE nome = '6º Mega EAO – Touros – Expozebu 03/05/2026'
  AND data = '2026-05-03';
