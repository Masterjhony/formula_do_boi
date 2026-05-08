-- ============================================================
-- CORREÇÃO — Fechamento Matrizes Fazenda Santa Fé (07/05/2026)
--
-- O INSERT anterior carregou os números OFICIAIS do leilão no header
-- (R$ 960k / 34 lotes / 17 compradores). Padrão do projeto (visto nos
-- seeds MRA, Pintado Raiz, Mafra, etc.): o header reflete a NOSSA
-- cobertura — mesma soma dos jsonbs por_assessor / lances. Apenas
-- `lotes_ofertados` é referência do leilão inteiro.
--
-- Cobertura correta:
--   • 9 lotes / 9 animais / R$ 207.000 / 4 compradores / 3 UFs
--     (TO + PA + PB; UF do Orismar Leão pendente)
--   • Ticket médio = 207.000 / 9 = R$ 23.000,00
--   • Maior lance (parcela) = R$ 1.400 (Lt 25, Fábio Omena)
-- ============================================================

UPDATE public.bula_leilao_fechamento
SET lotes_vendidos     = 9,
    animais_vendidos   = 9,
    vgv_total          = 207000,
    ticket_medio       = 23000,
    maior_lance        = 1400,
    compradores_unicos = 4,
    estados_alcancados = 3,
    observacoes        = 'Leilão de TERCEIRO — promotor Programa Leilões Nordeste (Sérgio Alcântara) + Agreste Leilões Rurais; vendedor Fazenda Santa Fé (Lote 32 partilhado 50/50 com FLOC). Catálogo: 35 lotes (Lote 27 retirado → 34 ativos, todos vendidos no leilão; somatória oficial da leiloeira: 33,5 lotes / R$ 960.000 / 17 compradores / estados AL/BA/MG/PB/PE/PI/TO — PA omitido por erro de arte, confirmado pelo chefe). NOSSA COBERTURA (Fórmula+Bula): 9 lotes / 9 matrizes / R$ 207.000 / 4 compradores / 3 UFs confirmadas (TO, PA, PB) + 1 UF pendente (Orismar Leão). Por assessor: Douglas Bispo (Bula) — 6 lotes em 2 lances para Gilberto Sarubi (Fazenda Garantido, Oriximiná/PA): Lt 32 R$ 21k + pacote Lts 30·12·15·16·13 R$ 93k = R$ 114k (55,07% da cobertura). Fábio Omena (Bula) — 2 lotes em 2 lances: Lt 25 R$ 42k para João Pereira da Silva (Fazenda Buriti Alegre, Barrolândia/TO) + Lt 08 R$ 21k para Irmãos Milton e Mailton Vale (Agropecuária Canaã, Mamanguape/PB) = R$ 63k (30,43%). Marcelo Carneiro (Fórmula do Boi) — 1 lote: Lt 20 (3-em-1) R$ 30k para Orismar Moreira Leão (Fazenda Nelore Leão) = R$ 30k (14,49%). Comissão 2% gerada apenas para o Marcelo (R$ 600); Fábio/Douglas são da Bula e não entram na regra dos 2%. ⚠ PENDÊNCIAS: (a) UF do Orismar Moreira Leão / Nelore Leão; (b) rateio Santa Fé × FLOC do Lote 32 (partilha 50/50).',
    updated_at         = NOW()
WHERE nome = 'Leilão Matrizes Fazenda Santa Fé – 07/05/2026'
  AND data = '2026-05-07';
