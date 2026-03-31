-- ============================================================
-- BULA LEILÕES — Extensão de colunas + Seed com agenda 2026
-- Executar no Supabase SQL Editor
-- ============================================================

-- 1. Adiciona colunas extras à tabela bula_leiloes
ALTER TABLE public.bula_leiloes
    ADD COLUMN IF NOT EXISTS horario         TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS transmissao     TEXT DEFAULT '',   -- ex: RURALPLAY, CANAL DO BOI
    ADD COLUMN IF NOT EXISTS modelo          TEXT DEFAULT 'PRESENCIAL', -- PRESENCIAL | VIRTUAL
    ADD COLUMN IF NOT EXISTS leiloeira       TEXT DEFAULT 'BULA',       -- BULA | LEILOBO | CAPITALIZA
    ADD COLUMN IF NOT EXISTS condicao        TEXT DEFAULT '',   -- ex: 30(2+2+2+2+2+2+2+2+2+10)
    ADD COLUMN IF NOT EXISTS frete_gratis    TEXT DEFAULT '',   -- ex: Brasil inteiro | Só MS
    ADD COLUMN IF NOT EXISTS acordo_comissao TEXT DEFAULT '';   -- ex: 8% comprador

-- 2. Template de tasks padrão (reutilizado no seed abaixo)
-- Pre-Leilão → Leilão → Pós-Leilão

-- 3. Limpa leilões anteriores de demo (opcional — comente se quiser manter)
-- DELETE FROM public.bula_leiloes;

-- 4. Insere agenda 2026 da planilha
-- (tasks = estrutura padrão pré/dia/pós com subtarefas)

DO $$
DECLARE
  default_tasks JSONB := '[
    {
      "nome": "Pré-Leilão", "cor": "#4A8FBF",
      "tasks": [
        {"id": "pre1", "nome": "Contrato", "ini": "", "fim": "", "resp": {"nome": "Equipe Bula", "ini": "B"}, "subs": [
          {"lbl": "Minuta enviada", "done": false},
          {"lbl": "Contrato assinado", "done": false}
        ]},
        {"id": "pre2", "nome": "Catálogo", "ini": "", "fim": "", "resp": {"nome": "Equipe Bula", "ini": "B"}, "subs": [
          {"lbl": "Fotos recebidas", "done": false},
          {"lbl": "Catálogo criado", "done": false},
          {"lbl": "Catálogo aprovado", "done": false}
        ]},
        {"id": "pre3", "nome": "Divulgação", "ini": "", "fim": "", "resp": {"nome": "Equipe Bula", "ini": "B"}, "subs": [
          {"lbl": "Posts programados", "done": false},
          {"lbl": "WhatsApp disparado", "done": false},
          {"lbl": "E-mail marketing enviado", "done": false}
        ]}
      ]
    },
    {
      "nome": "Dia do Leilão", "cor": "#C8A96E",
      "tasks": [
        {"id": "dia1", "nome": "Operação", "ini": "", "fim": "", "resp": {"nome": "Equipe Bula", "ini": "B"}, "subs": [
          {"lbl": "Assessor escalado confirmado", "done": false},
          {"lbl": "Transmissão online OK", "done": false},
          {"lbl": "Lotes conferidos", "done": false},
          {"lbl": "Resultados anotados", "done": false}
        ]}
      ]
    },
    {
      "nome": "Pós-Leilão", "cor": "#6B8F5C",
      "tasks": [
        {"id": "pos1", "nome": "Pós-venda", "ini": "", "fim": "", "resp": {"nome": "Equipe Bula", "ini": "B"}, "subs": [
          {"lbl": "Resultado registrado no sistema", "done": false},
          {"lbl": "Comissão lançada", "done": false},
          {"lbl": "Relatório enviado ao criador", "done": false}
        ]}
      ]
    }
  ]';
BEGIN

INSERT INTO public.bula_leiloes
  (nome, data, tipo, local, animais, expectativa, meta_bula, realizado_bula, status, img, tasks,
   horario, transmissao, modelo, leiloeira, condicao, frete_gratis, acordo_comissao)
VALUES
  -- 1
  ('Toka Jakaré / 3 Nascentes', '2026-04-09', 'Fêmeas P.O.', '', 80, 960000, 76800, 0, 'confirmado', '', default_tasks,
   '13:00', 'RURALPLAY', 'PRESENCIAL', 'BULA', '30(2+2+2+2+2+2+2+2+2+10)', 'Só MS', '8% comprador'),
  -- 2
  ('Nelore IPB', '2026-04-11', 'Fêmeas P.O.', '', 30, 1050000, 84000, 0, 'confirmado', '', default_tasks,
   '13:00', 'AGROBRASIL', 'PRESENCIAL', 'BULA', '30(2+2+2+2+2+2+2+2+2+10)', 'Brasil inteiro', '8% comprador'),
  -- 3
  ('Cachoeirão', '2026-04-14', 'Fêmeas P.O.', '', 30, 1050000, 84000, 0, 'confirmado', '', default_tasks,
   '19:30', 'RURALPLAY', 'PRESENCIAL', 'BULA', '30(2+2+2+2+2+2+2+2+2+10)', 'Brasil inteiro', '8% comprador'),
  -- 4
  ('Grupo Ribalta', '2026-05-13', 'Touros P.O.', '', 70, 2800000, 84000, 0, 'confirmado', '', default_tasks,
   '19:00', 'CANAL DO BOI', 'PRESENCIAL', 'LEILOBO', '30(2+2+2+2+2+2+2+2+2+10)', 'Brasil inteiro', '1% Leilobo + 2% Ribalta'),
  -- 5
  ('Nelore Tresmar', '2026-05-21', 'Touros P.O.', '', 60, 1320000, 158400, 0, 'confirmado', '', default_tasks,
   '19:00', 'CANAL DO BOI', 'VIRTUAL', 'BULA', '30(2+2+2+2+2+2+2+2+2+10)', 'Brasil inteiro', '8% comprador'),
  -- 6
  ('Nelore MEAB & Modelo', '2026-05-24', 'Fêmeas P.O.', '', 45, 810000, 113400, 0, 'confirmado', '', default_tasks,
   '09:30', 'ERURAL/RP', 'VIRTUAL', 'BULA', '30(2+2+2+2+2+2+2+2+2+10)', 'Brasil inteiro', '6% + 8%'),
  -- 7
  ('Nelore Cachoeirão', '2026-06-03', 'Touros P.O.', '', 45, 990000, 118800, 0, 'confirmado', '', default_tasks,
   '19:00', 'CANAL DO BOI', 'PRESENCIAL', 'BULA', '30(2+2+2+2+2+2+2+2+2+10)', 'Brasil inteiro', '8% + 4%'),
  -- 8
  ('Nelore MNO', '2026-06-04', 'Touros P.O.', '', 50, 850000, 25500, 0, 'confirmado', '', default_tasks,
   '12:00', 'RURAL PLAY', 'PRESENCIAL', 'CAPITALIZA', '30(2+2+2+2+2+2+2+2+2+10)', 'Só MS', '1% Leilobo + 2% Ribalta'),
  -- 9
  ('Nelore Tresmar', '2026-06-11', 'Fêmeas P.O.', '', 35, 2450000, 294000, 0, 'confirmado', '', default_tasks,
   '19:00', 'CANAL DO BOI', 'PRESENCIAL', 'BULA', '30(2+2+2+2+2+2+2+2+2+10)', 'Brasil inteiro', '8% comprador'),
  -- 10
  ('Nelore Kriz', '2026-06-16', 'Fêmeas P.O.', '', 50, 1000000, 80000, 0, 'confirmado', '', default_tasks,
   '19:30', 'CANAL DO BOI', 'VIRTUAL', 'BULA', '30(2+2+2+2+2+2+2+2+2+10)', 'Brasil inteiro', '8% comprador'),
  -- 11
  ('Rio Bonito', '2026-06-20', 'Touros P.O.', '', 80, 1760000, 140800, 0, 'confirmado', '', default_tasks,
   '12:00', 'RURAL PLAY', 'PRESENCIAL', 'BULA', '30(2+2+2+2+2+2+2+2+2+10)', 'Brasil inteiro', '8% comprador'),
  -- 12
  ('Nelore IPB', '2026-06-28', 'Touros IPB', '', 70, 1540000, 30800, 0, 'confirmado', '', default_tasks,
   '12:00', 'AGROBRASIL', 'PRESENCIAL', 'CAPITALIZA', '30(2+2+2+2+2+2+2+2+2+10)', 'Brasil inteiro', '2% criador'),
  -- 13
  ('Nelore Kriz', '2026-07-07', 'Touros P.O.', '', 60, 1320000, 105600, 0, 'confirmado', '', default_tasks,
   '19:30', 'CANAL DO BOI', 'VIRTUAL', 'BULA', '30(2+2+2+2+2+2+2+2+2+10)', 'Brasil inteiro', '8% comprador'),
  -- 14
  ('Neoraço P.O.', '2026-07-25', 'Touros P.O.', '', 50, 2000000, 160000, 0, 'confirmado', '', default_tasks,
   '12:00', 'RURALPLAY', 'PRESENCIAL', 'BULA', '30(2+2+2+2+2+2+2+2+2+10)', 'Só MS', '8% comprador'),
  -- 15
  ('Fazenda São Geraldo', '2026-07-30', 'Fêmeas P.O.', '', 30, 1800000, 144000, 0, 'confirmado', '', default_tasks,
   '19:00', 'RURALPLAY', 'VIRTUAL', 'BULA', '30(2+2+2+2+2+2+2+2+2+10)', 'Brasil inteiro', '8% comprador'),
  -- 16
  ('Fazenda São Geraldo', '2026-08-01', 'Touros P.O.', '', 120, 2640000, 211200, 0, 'confirmado', '', default_tasks,
   '12:00', 'RURALPLAY', 'PRESENCIAL', 'BULA', '30(2+2+2+2+2+2+2+2+2+10)', 'Brasil inteiro', '8% comprador'),
  -- 17
  ('Melhoradores', '2026-08-29', 'Touros P.O.', '', 50, 1000000, 80000, 0, 'confirmado', '', default_tasks,
   '12:00', 'RURAL PLAY', 'PRESENCIAL', 'BULA', '30(2+2+2+2+2+2+2+2+2+10)', 'Só MS', '8% comprador'),
  -- 18
  ('Fazendas C+4 / Campanino', '2026-11-21', 'Touro / Fêmeas', '', 100, 3000000, 240000, 0, 'confirmado', '', default_tasks,
   '12:00', 'CANAL LEILÕES', 'PRESENCIAL', 'BULA', '30(2+2+2+2+2+2+2+2+2+10)', 'Brasil inteiro', '8% comprador');

END $$;
