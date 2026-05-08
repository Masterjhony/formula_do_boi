-- ============================================================
-- UPDATE — Corrige UF/cidade do Orismar Moreira Leão (Lote 20)
-- Leilão Matrizes Fazenda Santa Fé (07/05/2026)
--
-- Pendência registrada anteriormente: UF do Orismar não constava
-- nos prints do WhatsApp. Confirmado pelo chefe: Fazenda Nelore Leão
-- fica em João Pinheiro/MG (mesmo cliente do Lt 04 do Leilão Matinha
-- Embrio em 05/05/2026 — registro existente no banco confirma).
--
-- Ajustes:
--   • compradores[Orismar].cidade = 'João Pinheiro', uf = 'MG'
--   • lances[Lote 20].cidade = 'João Pinheiro', uf = 'MG'
--   • por_estado: substitui linha vazia (UF "") por entrada MG
--   • estados_alcancados: 3 → 4
--   • observacoes: remove pendência da UF, registra correção
-- ============================================================

UPDATE public.bula_leilao_fechamento
SET estados_alcancados = 4,
    por_estado = '[
      {"uf":"PA","estado":"Pará","lotes":6,"animais":6,"vgv":114000,"pct_total":0.5507},
      {"uf":"TO","estado":"Tocantins","lotes":1,"animais":1,"vgv":42000,"pct_total":0.2029},
      {"uf":"MG","estado":"Minas Gerais","lotes":1,"animais":1,"vgv":30000,"pct_total":0.1449},
      {"uf":"PB","estado":"Paraíba","lotes":1,"animais":1,"vgv":21000,"pct_total":0.1014}
    ]'::jsonb,
    compradores = '[
      {"rank":1,"fazenda":"Fazenda Garantido","comprador":"Gilberto Sarubi","cidade":"Oriximiná","uf":"PA","lotes":6,"animais":6,"vgv":114000},
      {"rank":2,"fazenda":"Fazenda Buriti Alegre","comprador":"João Pereira da Silva","cidade":"Barrolândia","uf":"TO","lotes":1,"animais":1,"vgv":42000},
      {"rank":3,"fazenda":"Nelore Leão","comprador":"Orismar Moreira Leão","cidade":"João Pinheiro","uf":"MG","lotes":1,"animais":1,"vgv":30000},
      {"rank":4,"fazenda":"Agropecuária Canaã","comprador":"Irmãos Milton e Mailton Vale","cidade":"Mamanguape","uf":"PB","lotes":1,"animais":1,"vgv":21000}
    ]'::jsonb,
    lances = '[
      {"lote":"25","fazenda":"Fazenda Buriti Alegre","comprador":"João Pereira da Silva","cidade":"Barrolândia","uf":"TO","assessor":"Fábio Omena","empresa":"Bula Assessoria","animais":1,"parcela":1400,"vgv":42000},
      {"lote":"20","fazenda":"Nelore Leão","comprador":"Orismar Moreira Leão","cidade":"João Pinheiro","uf":"MG","assessor":"Marcelo Carneiro","empresa":"Fórmula do Boi","animais":1,"parcela":1000,"vgv":30000},
      {"lote":"08","fazenda":"Agropecuária Canaã","comprador":"Irmãos Milton e Mailton Vale","cidade":"Mamanguape","uf":"PB","assessor":"Fábio Omena","empresa":"Bula Assessoria","animais":1,"parcela":700,"vgv":21000},
      {"lote":"32","fazenda":"Fazenda Garantido","comprador":"Gilberto Sarubi","cidade":"Oriximiná","uf":"PA","assessor":"Douglas Bispo","empresa":"Bula Assessoria","animais":1,"parcela":700,"vgv":21000},
      {"lote":"30·12·15·16·13","fazenda":"Fazenda Garantido","comprador":"Gilberto Sarubi","cidade":"Oriximiná","uf":"PA","assessor":"Douglas Bispo","empresa":"Bula Assessoria","animais":5,"parcela":620,"vgv":93000}
    ]'::jsonb,
    observacoes = 'Leilão de TERCEIRO — promotor Programa Leilões Nordeste (Sérgio Alcântara) + Agreste Leilões Rurais; vendedor Fazenda Santa Fé (Lote 32 partilhado 50/50 com FLOC). Catálogo: 35 lotes (Lote 27 retirado → 34 ativos, todos vendidos). Somatória oficial da leiloeira: 33,5 lotes / R$ 960.000 / 17 compradores / estados AL/BA/MG/PB/PE/PI/TO — PA omitido por erro de arte. Pagamento padrão: 30 parcelas (5 dup. + 20). NOSSA COBERTURA (Fórmula+Bula): 9 lotes / 9 matrizes / R$ 207.000 / 4 compradores / 4 UFs (TO, PA, PB, MG). Por assessor: Douglas Bispo (Bula) — 6 lotes para Sarubi (Fazenda Garantido, Oriximiná/PA) = R$ 114k (55,07%); Fábio Omena (Bula) — 2 lotes (Lt 25 → João Pereira/TO + Lt 08 → Irmãos Vale/PB) = R$ 63k (30,43%); Marcelo Carneiro (Fórmula) — Lt 20 (3-em-1) → Orismar Moreira Leão (Fazenda Nelore Leão, João Pinheiro/MG) = R$ 30k (14,49%). RECEITA BULA: 1,5% × R$ 960k (R$ 14.400) + 3% × R$ 207k (R$ 6.210) = R$ 20.610 a receber. COMISSÕES (regra deste leilão, confirmada pelo chefe): Marcelo 2% × R$ 30k = R$ 600; Douglas 2% × R$ 114k = R$ 2.280; Fábio 3% × R$ 63k = R$ 1.890; total R$ 4.770 a pagar. Sobra bruta = R$ 15.840. ⚠ PENDÊNCIA: rateio Santa Fé × FLOC do Lote 32 (partilha 50/50).',
    updated_at = NOW()
WHERE nome = 'Leilão Matrizes Fazenda Santa Fé – 07/05/2026'
  AND data = '2026-05-07';
