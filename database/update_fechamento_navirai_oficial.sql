-- ============================================================
-- UPDATE — Fechamento "37º Leilão Naviraí" (27/04/2026)
-- Sincronização com o catálogo oficial do leilão.
-- Diretiva do chefe (WhatsApp 2026-05-05): após renomear o
-- registro via scripts/rename_leilao_navirai.js, corrigir
-- lotes_ofertados (1 → 34) e preencher o local com o endereço
-- da Chácara Naviraí, conforme PDF "Catálogo 37LeilãoNaviraí
-- ExpoZebu_oficial".
--
-- Não alteramos lotes_vendidos / vgv_total / receita Bula:
-- continuam refletindo apenas o lote 26 (NAVIRAÍ 19935-20)
-- intermediado pelo Fábio Omena para a Fazenda C+4.
--
-- Idempotente: o WHERE só casa se algum campo ainda diverge.
-- ============================================================

UPDATE public.bula_leilao_fechamento
SET lotes_ofertados = 34,
    local           = 'Chácara Naviraí - BR 050, KM 157, Uberaba/MG',
    updated_at      = NOW()
WHERE nome = '37º Leilão Naviraí'
  AND data = '2026-04-27'
  AND (
        lotes_ofertados <> 34
     OR COALESCE(local, '') <> 'Chácara Naviraí - BR 050, KM 157, Uberaba/MG'
      );
