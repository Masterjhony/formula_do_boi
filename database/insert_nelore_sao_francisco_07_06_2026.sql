-- ============================================================
-- 1º LEILÃO NELORE SÃO FRANCISCO — inserção no cronograma de leilões
--
-- Origem: save-the-date oficial NELORE NFSF (13/05/2026).
--   • Data: 07/06/2026 (Domingo, 12h)
--   • Leiloeira: AGRESTE LEILÕES
--   • Transmissão: Agreste Estúdio
--   • Assessoria Bula (junto com VS Assessoria Genética e Premier)
--   • Comissão Bula: 1% do faturamento
--
-- Idempotente: usa NOT EXISTS por (data, nome). Rodar múltiplas
-- vezes não duplica linhas.
-- ============================================================

INSERT INTO public.cronograma_leiloes
  (data, dia_semana, hora, nome, criador, presencial, leiloeira, raca,
   qtd_animais, sexo, comissao, contrato, faturamento_previsto,
   faturamento_realizado, venda_bula, comissao_receber, recebido)
SELECT * FROM (VALUES
  ('2026-06-07'::date, 'Domingo', '12:00', '1º LEILÃO NELORE SÃO FRANCISCO',
   'NELORE SÃO FRANCISCO', 'VIRTUAL', 'AGRESTE LEILÕES', 'Nelore Padrão',
   NULL::int, 'MACHOS', '1% do Faturamento', 'NÃO',
   NULL::numeric, NULL::numeric, NULL::numeric, '1% do Fat.', 'NÃO')
) AS novos(data, dia_semana, hora, nome, criador, presencial, leiloeira, raca,
            qtd_animais, sexo, comissao, contrato, faturamento_previsto,
            faturamento_realizado, venda_bula, comissao_receber, recebido)
WHERE NOT EXISTS (
  SELECT 1 FROM public.cronograma_leiloes c
  WHERE c.data = novos.data AND c.nome = novos.nome
);
