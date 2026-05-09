-- ============================================================
-- 13º MEGA EVENTO EAO BAVIERA — inserção no cronograma de leilões
--
-- Origem: card oficial enviado pela equipe (contato Max
-- (34) 99672-7349 / Mylena (34) 99964-9107) em 09/05/2026.
--
-- Etapas:
--   • 09/07 (Qui) 20h — ETAPA SÊMEN     (VIRTUAL)
--   • 10/07 (Sex) 20h — ETAPA ASPIRAÇÕES (VIRTUAL)
--   • 11/07 (Sáb) 09h — ETAPA FÊMEAS    (PRESENCIAL) + bezerras/bezerros de corte
--   • 12/07 (Dom) 09h — ETAPA TOUROS    (PRESENCIAL) + bezerras/bezerros de corte
--
-- Comissão Bula sobre EAO segue tabela canônica: 0,33% do Faturamento.
--
-- Idempotente: usa NOT EXISTS por (data, nome). Rodar múltiplas
-- vezes não duplica linhas.
-- ============================================================

INSERT INTO public.cronograma_leiloes
  (data, dia_semana, hora, nome, criador, presencial, leiloeira, raca,
   qtd_animais, sexo, comissao, contrato, faturamento_previsto,
   faturamento_realizado, venda_bula, comissao_receber, recebido)
SELECT * FROM (VALUES
  ('2026-07-09'::date, 'Quinta-feira', '20:00',
   '13º MEGA EVENTO EAO BAVIERA - ETAPA SÊMEN',
   'EAO AGROPECUÁRIA', 'VIRTUAL', 'PROGRAMA LEILÕES', 'Nelore Padrão',
   NULL::int, 'SÊMEN', '0,33% do Faturamento', 'NÃO',
   NULL::numeric, NULL::numeric, NULL::numeric, '0,33% do Fat.', 'NÃO'),

  ('2026-07-10'::date, 'Sexta-feira', '20:00',
   '13º MEGA EVENTO EAO BAVIERA - ETAPA ASPIRAÇÕES',
   'EAO AGROPECUÁRIA', 'VIRTUAL', 'PROGRAMA LEILÕES', 'Nelore Padrão',
   NULL::int, 'ASPIRAÇÕES', '0,33% do Faturamento', 'NÃO',
   NULL::numeric, NULL::numeric, NULL::numeric, '0,33% do Fat.', 'NÃO'),

  ('2026-07-11'::date, 'Sábado', '09:00',
   '13º MEGA EVENTO EAO BAVIERA - ETAPA FÊMEAS',
   'EAO AGROPECUÁRIA', 'PRESENCIAL', 'PROGRAMA LEILÕES', 'Nelore Padrão',
   NULL::int, 'FÊMEAS + BEZERRAS/BEZERROS DE CORTE', '0,33% do Faturamento', 'NÃO',
   NULL::numeric, NULL::numeric, NULL::numeric, '0,33% do Fat.', 'NÃO'),

  ('2026-07-12'::date, 'Domingo', '09:00',
   '13º MEGA EVENTO EAO BAVIERA - ETAPA TOUROS',
   'EAO AGROPECUÁRIA', 'PRESENCIAL', 'PROGRAMA LEILÕES', 'Nelore Padrão',
   NULL::int, 'MACHOS + BEZERRAS/BEZERROS DE CORTE', '0,33% do Faturamento', 'NÃO',
   NULL::numeric, NULL::numeric, NULL::numeric, '0,33% do Fat.', 'NÃO')
) AS novos(data, dia_semana, hora, nome, criador, presencial, leiloeira, raca,
            qtd_animais, sexo, comissao, contrato, faturamento_previsto,
            faturamento_realizado, venda_bula, comissao_receber, recebido)
WHERE NOT EXISTS (
  SELECT 1 FROM public.cronograma_leiloes c
  WHERE c.data = novos.data AND c.nome = novos.nome
);
