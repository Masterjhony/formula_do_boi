-- ============================================================
-- ⚠ OBSOLETO — NÃO RODAR (06/05/2026)
-- Sobrescrito por database/revert_fechamento_mega_eao_vgv_intermediado.sql
-- O card do Fechamento exibe vgv_total, e por convenção do projeto esse
-- campo guarda o VGV intermediado pela Bula (= a "parte da empresa").
-- Setar vgv_total como o total oficial (R$ 7M / R$ 17M) deixa o card do
-- EAO destoante dos outros leilões. Mantemos o total oficial só em observacoes.
-- ============================================================
-- FECHAMENTO 6º Mega EAO 2026 — números OFICIAIS (anexo COMPARATIVO)
-- Espelha o que `scripts/ajustar_fechamento_mega_eao_oficial.js` faz,
-- mas em SQL idempotente (pode rodar quantas vezes precisar).
--
-- Fonte (validada pelas planilhas adicionadas no root em 05/05/26):
--   • Fechamento 6º Mega EAO 2026 — Touros.xlsx → R$ 640.500 Bula-only
--   • COMPARATIVO MEGA EAO EXPOZEBU 2026 (anexo oficial promotor):
--       FÊMEAS 2026 (02/05): 124,66 animais | R$ 17.682.200
--       MACHOS 2026 (03/05): 150,75 animais | R$  7.073.500
--   • Equinos (R$ 265.600) ficam fora — Bula não intermediou.
--
-- Card no admin passa a mostrar receita_bula (= 1% do VGV oficial).
-- ============================================================

-- ── 6º Mega EAO Fêmeas 02/05/2026 ────────────────────────────
UPDATE public.bula_leilao_fechamento
SET vgv_total           = 17682200,
    animais_vendidos    = 125,
    ticket_medio        = 141843.41,
    receita_bula        = 176822,        -- 1% × R$ 17.682.200 (DEFAULT, REVISAR % com chefe)
    sobra_bruta         = 165524,        -- 176.822 − 11.298 (Fábio + Douglas)
    updated_at          = NOW()
WHERE nome = '6º Mega EAO – Fêmeas – Expozebu 02/05/2026'
  AND data = '2026-05-02';

-- ── 6º Mega EAO Touros 03/05/2026 ────────────────────────────
UPDATE public.bula_leilao_fechamento
SET vgv_total           = 7073500,
    animais_vendidos    = 151,
    ticket_medio        = 46922.06,
    receita_bula        = 70735,         -- 1% × R$ 7.073.500
    sobra_bruta         = 69985,         -- 70.735 − 750 (Fábio Omena Lt 119)
    updated_at          = NOW()
WHERE nome = '6º Mega EAO – Touros – Expozebu 03/05/2026'
  AND data = '2026-05-03';
