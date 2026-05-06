-- ============================================================
-- Fechamentos — 05/05/2026 (dois leilões)
--
-- 1) 2º Leilão Pintado Raiz (Fazenda Garoa) — Maceió/AL
--    Registro pré-leilão já existe (insert_fechamento_pintado_raiz_05_mai_2026.sql).
--    Aqui: UPDATE com os números OFICIAIS do PDF "Médias por Raças" e
--    com os lances levados pela Fórmula/Bula (reportados via WhatsApp
--    pelo Marcelo Carneiro).
--
--    Resultado oficial:
--      • 39 animais / 39 lotes vendidos
--      • VGV total R$ 458.800,00  •  Ticket médio R$ 11.764,10
--      • Maior lance: MUMBAI FIV GC DA SL (touro) — R$ 20.400
--      • 5 maiores compradores: Vinicius Baleeiro Pereira Guimaraes,
--        Mackson Guilherme Maciel Silva, Alan Sttenyo Veras de Resende,
--        Renato Pereira da Silva, Genivaldo Nascimento Almeida
--      • Vendedor único listado: Maciel Pereira da Silva
--
--    Lances levados pela Fórmula/Bula (parcela em 40x):
--      Marcelo Carneiro (Fórmula do Boi) — 9 transações, 13 animais
--        • Lt 46 (1a, 370/40 = R$ 14.800) – Vinicius Baleeiro
--        • Lt 09 (1a, 360/40 = R$ 14.400) – Vinicius Baleeiro
--        • Lt 29 (1a, 280/40 = R$ 11.200) – Marlon Ferreira (Água Fria/BA)
--        • Lt 27 (1a, 270/40 = R$ 10.800) – Marlon Ferreira (Água Fria/BA)
--        • Lt 34 (1a, 200/40 = R$  8.000) – Vinicius Baleeiro
--        • Lt 01 (1a, 360/40 = R$ 14.400) – Airon Tavares (São Caetano/PE)
--        • Lts 42·40·47·33 (4a, 210/40 = R$ 33.600) – Vinicius Baleeiro
--        • Lts 44·24 (2a, 210/40 = R$ 16.800) – Vinicius Baleeiro
--        • Lt 25 (1a, 230/40 = R$  9.200) – Airon Tavares
--        Subtotal Marcelo: 13 animais  •  R$ 133.200
--      Mateus Alves (Bula) — 1 transação, 3 animais
--        • Lts 28·03·08 (3 fêmeas, 230/40 = R$ 27.600) – Lucio Antônio Machado
--        Subtotal Mateus Alves: 3 animais  •  R$ 27.600
--
-- 2) Leilão Matinha Embrio — 05/05/2026
--    Não tinha registro prévio. Único lance reportado pela equipe:
--      Marcelo Carneiro (Fórmula do Boi)
--        • Lt 04 (1 animal, parcela R$ 1.600) – Orismar Moreira Leão
--          (Fazenda Nelore Leão – João Pinheiro/MG)
--    ⚠ Nº de parcelas não foi reportado; assumindo 30x (padrão dos
--    fechamentos similares: MRA, Mafra, Genética Aditiva). VGV
--    estimado: R$ 1.600 × 30 = R$ 48.000. Ajustar se confirmado outro.
--    "Só eu vendi hoje" (Marcelo) → outros assessores não venderam.
--
-- 3) Conta a pagar (ERP) — 2% sobre VGV das vendas do Marcelo
--    Regra confirmada: Bulinha/Marcelo Carneiro/Matheus Amormino geram
--    conta a pagar 2% no ERP (não é mais intercompany).
--    Marcelo Garoa:        R$ 133.200 × 2% = R$ 2.664
--    Marcelo Matinha:      R$  48.000 × 2% = R$   960
--    ⚠ Mateus Alves não está no roster canônico (leiloes_equipe) nem na
--    regra dos 2% — comissão dele NÃO foi gerada automaticamente.
-- ============================================================

-- ── 1) UPDATE 2º LEILÃO PINTADO RAIZ (LEILÃO DA GAROA) ────────
UPDATE public.bula_leilao_fechamento
SET lotes_vendidos      = 39,
    animais_vendidos    = 39,
    vgv_total           = 458800,
    ticket_medio        = 11764.10,
    maior_lance         = 20400,
    compradores_unicos  = 5,        -- top 5 do relatório oficial; total real >= 5
    estados_alcancados  = 2,        -- BA + PE confirmados pelos lances; Vinicius Baleeiro UF não informada
    por_assessor = '[
      {"posicao":1,"nome":"Marcelo Carneiro","empresa":"Fórmula do Boi","transacoes":9,"animais":13,"vgv":133200,"ticket_medio":14800,"pct_total":0.2903},
      {"posicao":2,"nome":"Mateus Alves","empresa":"Bula","transacoes":1,"animais":3,"vgv":27600,"ticket_medio":27600,"pct_total":0.0602}
    ]'::jsonb,
    por_estado = '[
      {"uf":"PE","estado":"Pernambuco","lotes":2,"animais":2,"vgv":23600,"pct_total":0.0514},
      {"uf":"BA","estado":"Bahia","lotes":2,"animais":2,"vgv":22000,"pct_total":0.0479}
    ]'::jsonb,
    compradores = '[
      {"rank":1,"fazenda":"","comprador":"Vinicius Baleeiro Pereira Guimaraes","cidade":"","uf":"","lotes":9,"animais":9,"vgv":87600},
      {"rank":2,"fazenda":"","comprador":"Mackson Guilherme Maciel Silva","cidade":"","uf":"","lotes":0,"animais":0,"vgv":0},
      {"rank":3,"fazenda":"","comprador":"Alan Sttenyo Veras de Resende","cidade":"","uf":"","lotes":0,"animais":0,"vgv":0},
      {"rank":4,"fazenda":"","comprador":"Renato Pereira da Silva","cidade":"","uf":"","lotes":0,"animais":0,"vgv":0},
      {"rank":5,"fazenda":"","comprador":"Genivaldo Nascimento Almeida","cidade":"","uf":"","lotes":0,"animais":0,"vgv":0}
    ]'::jsonb,
    lances = '[
      {"lote":"46","fazenda":"","comprador":"Vinicius Baleeiro","uf":"","assessor":"Marcelo Carneiro","empresa":"Fórmula do Boi","animais":1,"parcela":370,"vgv":14800},
      {"lote":"09","fazenda":"","comprador":"Vinicius Baleeiro","uf":"","assessor":"Marcelo Carneiro","empresa":"Fórmula do Boi","animais":1,"parcela":360,"vgv":14400},
      {"lote":"01","fazenda":"Fazenda Noemia Macedo","comprador":"Airon Tavares","cidade":"São Caetano","uf":"PE","assessor":"Marcelo Carneiro","empresa":"Fórmula do Boi","animais":1,"parcela":360,"vgv":14400},
      {"lote":"29","fazenda":"Fazenda Saco","comprador":"Marlon Ferreira","cidade":"Água Fria","uf":"BA","assessor":"Marcelo Carneiro","empresa":"Fórmula do Boi","animais":1,"parcela":280,"vgv":11200},
      {"lote":"27","fazenda":"Fazenda Saco","comprador":"Marlon Ferreira","cidade":"Água Fria","uf":"BA","assessor":"Marcelo Carneiro","empresa":"Fórmula do Boi","animais":1,"parcela":270,"vgv":10800},
      {"lote":"25","fazenda":"","comprador":"Airon Tavares","uf":"PE","assessor":"Marcelo Carneiro","empresa":"Fórmula do Boi","animais":1,"parcela":230,"vgv":9200},
      {"lote":"34","fazenda":"","comprador":"Vinicius Baleeiro","uf":"","assessor":"Marcelo Carneiro","empresa":"Fórmula do Boi","animais":1,"parcela":200,"vgv":8000},
      {"lote":"42·40·47·33","fazenda":"","comprador":"Vinicius Baleeiro","uf":"","assessor":"Marcelo Carneiro","empresa":"Fórmula do Boi","animais":4,"parcela":210,"vgv":33600},
      {"lote":"44·24","fazenda":"","comprador":"Vinicius Baleeiro","uf":"","assessor":"Marcelo Carneiro","empresa":"Fórmula do Boi","animais":2,"parcela":210,"vgv":16800},
      {"lote":"28·03·08","fazenda":"","comprador":"Lucio Antônio Machado","uf":"","assessor":"Mateus Alves","empresa":"Bula","animais":3,"parcela":230,"vgv":27600}
    ]'::jsonb,
    comissao_assessoria = 2664,     -- 2% × R$ 133.200 (Marcelo). Mateus Alves não está na regra 2%.
    observacoes = 'Resultado OFICIAL (PDF "Médias por Raças" – Agreste Leilões): 39 animais vendidos / R$ 458.800 / ticket R$ 11.764,10. Maior lance: MUMBAI FIV GC DA SL (touro) – R$ 20.400 (comprador Ricardo Esteves Brito Costa). Pagamento em 40x (1+39); valores na coluna "parcela" são mensais. Lances reportados pelo Marcelo Carneiro via WhatsApp: 9 transações para o Marcelo (13 animais, VGV R$ 133.200) + 1 transação atribuída a "Mateus Alves (Bula)" (Lts 28·03·08, 3 fêmeas, R$ 27.600 – comprador Lucio Antônio Machado). ⚠ Mateus Alves NÃO está no roster canônico (leiloes_equipe) – verificar identidade e se cabe na regra de comissão. UF do Vinicius Baleeiro Pereira Guimaraes (1º maior comprador) e dos demais 4 não foi confirmada. Observação: PDF do leilão exibe "1° LEILÃO NELORE PINTADO RAIZ" – nome no DB ficou "2º" desde o pré-leilão, manter ou ajustar conforme orientação.',
    updated_at = NOW()
WHERE nome = '2º Leilão Pintado Raiz – 05/05/2026'
  AND data = '2026-05-05';


-- ── 2) INSERT LEILÃO MATINHA EMBRIO ──────────────────────────
INSERT INTO public.bula_leilao_fechamento (
  nome, data, local,
  lotes_ofertados, lotes_vendidos, animais_vendidos,
  vgv_total, ticket_medio, maior_lance,
  compradores_unicos, estados_alcancados,
  por_assessor, por_estado, compradores, lances,
  perfil_genetico,
  comissao_assessoria, receita_bula, sobra_bruta,
  observacoes
)
SELECT
  'Leilão Matinha Embrio – 05/05/2026',
  '2026-05-05',
  '',
  0, 1, 1,
  48000, 48000, 1600,
  1, 1,
  '[
    {"posicao":1,"nome":"Marcelo Carneiro","empresa":"Fórmula do Boi","transacoes":1,"animais":1,"vgv":48000,"ticket_medio":48000,"pct_total":1}
  ]'::jsonb,
  '[
    {"uf":"MG","estado":"Minas Gerais","lotes":1,"animais":1,"vgv":48000,"pct_total":1}
  ]'::jsonb,
  '[
    {"rank":1,"fazenda":"Nelore Leão","comprador":"Orismar Moreira Leão","cidade":"João Pinheiro","uf":"MG","lotes":1,"animais":1,"vgv":48000}
  ]'::jsonb,
  '[
    {"lote":"04","fazenda":"Nelore Leão","comprador":"Orismar Moreira Leão","cidade":"João Pinheiro","uf":"MG","assessor":"Marcelo Carneiro","empresa":"Fórmula do Boi","animais":1,"parcela":1600,"vgv":48000}
  ]'::jsonb,
  NULL,
  960, 0, -960,
  'Único lance reportado: Lt 04 levado pelo Marcelo Carneiro (Fórmula do Boi) – comprador Orismar Moreira Leão (Fazenda Nelore Leão – João Pinheiro/MG). Marcelo confirmou no grupo: "Só eu vendi hoje" → demais assessores da equipe não venderam neste leilão. ⚠ Nº de parcelas não foi reportado; VGV estimado em R$ 48.000 assumindo parcelamento em 30x (padrão dos fechamentos recentes). Total geral do leilão e nº de lotes ofertados não foram informados. Comissão 2% × R$ 48.000 = R$ 960 (regra Bulinha/Marcelo/Matheus).'
WHERE NOT EXISTS (
  SELECT 1 FROM public.bula_leilao_fechamento
  WHERE data = '2026-05-05'
    AND nome = 'Leilão Matinha Embrio – 05/05/2026'
);


-- ── 3) CONTA A PAGAR — COMISSÃO MARCELO CARNEIRO (LEILÃO DA GAROA) ──
-- 2% × R$ 133.200 = R$ 2.664
INSERT INTO public.erp_finance_transactions (
  account_id, category_id, type, amount, description, observacao,
  transaction_date, status
)
SELECT
  (SELECT id FROM public.erp_finance_accounts ORDER BY created_at LIMIT 1),
  (SELECT id FROM public.erp_finance_categories WHERE name = 'Fornecedores' AND type = 'expense' LIMIT 1),
  'expense',
  2664,
  'Comissão Marcelo Carneiro (Fórmula do Boi) – 2% – 9 lotes Leilão Pintado Raiz (Garoa)',
  'Leilão 05/05/2026 – 2º Leilão Pintado Raiz (Fazenda Garoa). Marcelo Carneiro intermediou 9 transações (13 animais, VGV R$ 133.200). 2% × R$ 133.200 = R$ 2.664. Compradores: Vinicius Baleeiro (×9 animais), Marlon Ferreira (×2 BA), Airon Tavares (×2 PE).',
  '2026-05-05',
  'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM public.erp_finance_transactions
  WHERE description = 'Comissão Marcelo Carneiro (Fórmula do Boi) – 2% – 9 lotes Leilão Pintado Raiz (Garoa)'
    AND transaction_date = '2026-05-05'
);


-- ── 4) CONTA A PAGAR — COMISSÃO MARCELO CARNEIRO (MATINHA EMBRIO) ──
-- 2% × R$ 48.000 = R$ 960
INSERT INTO public.erp_finance_transactions (
  account_id, category_id, type, amount, description, observacao,
  transaction_date, status
)
SELECT
  (SELECT id FROM public.erp_finance_accounts ORDER BY created_at LIMIT 1),
  (SELECT id FROM public.erp_finance_categories WHERE name = 'Fornecedores' AND type = 'expense' LIMIT 1),
  'expense',
  960,
  'Comissão Marcelo Carneiro (Fórmula do Boi) – 2% – Lt 04 Leilão Matinha Embrio',
  'Leilão 05/05/2026 – Matinha Embrio. Lt 04 (1 animal) – comprador Orismar Moreira Leão (Fazenda Nelore Leão – João Pinheiro/MG). VGV estimado R$ 48.000 (parcela R$ 1.600 × 30x assumido). 2% × R$ 48.000 = R$ 960. ⚠ Revisar se nº de parcelas confirmado for diferente.',
  '2026-05-05',
  'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM public.erp_finance_transactions
  WHERE description = 'Comissão Marcelo Carneiro (Fórmula do Boi) – 2% – Lt 04 Leilão Matinha Embrio'
    AND transaction_date = '2026-05-05'
);
