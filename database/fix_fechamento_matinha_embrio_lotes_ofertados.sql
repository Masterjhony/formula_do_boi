-- ============================================================
-- Fix — Leilão Matinha Embrio – 05/05/2026
--
-- O fechamento foi inserido sem os dados do catálogo
-- (insert_fechamentos_05_mai_2026.sql linha 112: "0, 1, 1").
-- Marcelo Carneiro reportou no grupo, com a foto do catálogo,
-- a composição correta da oferta:
--
--   • 17 lotes/pacotes ofertados
--   • 0 animais vivos (oferta exclusiva de embriões Nelore PO)
--   • 426 embriões ofertados
--   • 148 prenhezes mínimas garantidas
--
-- Composição:
--   • Lote EXTRA   → 1 lote  × 10 embriões  = 10
--   • Lotes 01–09  → 16 lotes × 26 embriões = 416
--   (lotes 01–09 com subdivisões A/B/C totalizam 16 pacotes)
--   Total: 17 lotes / 426 embriões
--
-- Os números de venda (lotes_vendidos = 1, animais_vendidos = 1,
-- VGV R$ 48.000, comissão R$ 960) permanecem inalterados — o
-- único lance reportado segue sendo o Lt 04 do Marcelo Carneiro
-- (comprador Orismar Moreira Leão, Fazenda Nelore Leão –
-- João Pinheiro/MG).
-- ============================================================

UPDATE public.bula_leilao_fechamento
SET lotes_ofertados = 17,
    perfil_genetico = COALESCE(perfil_genetico, '{}'::jsonb) || '{
      "tipo_oferta": "Embriões Nelore PO",
      "animais_vivos_ofertados": 0,
      "embrioes_ofertados": 426,
      "prenhezes_minimas_garantidas": 148,
      "composicao": [
        {"tipo": "Lote EXTRA", "lotes": 1, "embrioes_por_lote": 10, "embrioes_total": 10},
        {"tipo": "Lotes 01 a 09 (com subdivisões A/B/C)", "lotes": 16, "embrioes_por_lote": 26, "embrioes_total": 416}
      ]
    }'::jsonb,
    observacoes = 'Catálogo Matinha Embrio: 17 lotes/pacotes ofertados, 0 animais vivos, oferta exclusiva de Embriões Nelore PO — 426 embriões totais e 148 prenhezes mínimas garantidas. Composição: 1 Lote EXTRA (10 embriões) + 16 lotes 01–09 com subdivisões A/B/C (26 embriões/lote = 416). Único lance reportado: Lt 04 levado pelo Marcelo Carneiro (Fórmula do Boi) – comprador Orismar Moreira Leão (Fazenda Nelore Leão – João Pinheiro/MG). Marcelo confirmou no grupo: "Só eu vendi hoje" → demais assessores da equipe não venderam neste leilão. ⚠ Nº de parcelas não foi reportado; VGV estimado em R$ 48.000 assumindo parcelamento em 30x (padrão dos fechamentos recentes). Comissão 2% × R$ 48.000 = R$ 960 (regra Bulinha/Marcelo/Matheus).',
    updated_at = NOW()
WHERE nome = 'Leilão Matinha Embrio – 05/05/2026'
  AND data = '2026-05-05';
