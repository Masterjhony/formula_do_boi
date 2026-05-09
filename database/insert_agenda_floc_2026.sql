-- ============================================================
-- Agenda Nelore FLOC 2026 — inserção no cronograma de leilões
--
-- Origem: card oficial "Agenda 2026 de Leilões" enviado pela
-- equipe Nelore FLOC em 08/05/2026.
--
-- Eventos:
--   • 15/06 (Seg) — LEILÃO SELEÇÃO NELORE FLOC
--   • 14/10 (Qua) — DIA DE CAMPO NELORE FLOC
--   • 23/10 (Sex) — LEILÃO TOUROS NELORE FLOC
--   • 26/10 (Seg) — 3º DAMAS DO CAMPO
--
-- Idempotente: usa NOT EXISTS por (data, nome). Rodar múltiplas
-- vezes não duplica linhas.
-- ============================================================

INSERT INTO public.cronograma_leiloes
  (data, dia_semana, hora, nome, criador, presencial, leiloeira, raca,
   qtd_animais, sexo, comissao, contrato, faturamento_previsto,
   faturamento_realizado, venda_bula, comissao_receber, recebido)
SELECT * FROM (VALUES
  ('2026-06-15'::date, 'Segunda-feira', '', 'LEILÃO SELEÇÃO NELORE FLOC',
   'NELORE FLOC', 'VIRTUAL', 'AGRESTE LEILÕES', 'Nelore Padrão',
   NULL::int, '', '', 'NÃO', NULL::numeric, NULL::numeric, NULL::numeric, '', 'NÃO'),
  ('2026-10-14'::date, 'Quarta-feira', '', 'DIA DE CAMPO NELORE FLOC',
   'NELORE FLOC', 'PRESENCIAL', '', 'Nelore Padrão',
   NULL::int, '', '', 'NÃO', NULL::numeric, NULL::numeric, NULL::numeric, '', 'NÃO'),
  ('2026-10-23'::date, 'Sexta-feira', '', 'LEILÃO TOUROS NELORE FLOC',
   'NELORE FLOC', 'VIRTUAL', 'AGRESTE LEILÕES', 'Nelore Padrão',
   NULL::int, 'MACHOS', '', 'NÃO', NULL::numeric, NULL::numeric, NULL::numeric, '', 'NÃO'),
  ('2026-10-26'::date, 'Segunda-feira', '', '3º DAMAS DO CAMPO',
   'NELORE FLOC', 'VIRTUAL', 'AGRESTE LEILÕES', 'Nelore Padrão',
   NULL::int, 'FÊMEAS', '', 'NÃO', NULL::numeric, NULL::numeric, NULL::numeric, '', 'NÃO')
) AS novos(data, dia_semana, hora, nome, criador, presencial, leiloeira, raca,
            qtd_animais, sexo, comissao, contrato, faturamento_previsto,
            faturamento_realizado, venda_bula, comissao_receber, recebido)
WHERE NOT EXISTS (
  SELECT 1 FROM public.cronograma_leiloes c
  WHERE c.data = novos.data AND c.nome = novos.nome
);
