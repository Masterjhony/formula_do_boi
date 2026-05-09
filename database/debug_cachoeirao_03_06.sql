-- ============================================================
-- Diagnóstico — descobrir por que NELORE CACHOEIRÃO 03/06
-- continua duplicado depois do dedup.
-- Rodar no SQL Editor do Supabase e me mandar a saída.
-- ============================================================

-- 1. Listar TODAS as linhas de 03/06/2026 nas duas tabelas,
--    com tamanho do nome e bytes hex pra ver se há caracteres
--    invisíveis ou Unicode diferentes.
SELECT
  'bula_leiloes'  AS tabela,
  id::text         AS id,
  data,
  nome,
  length(nome)     AS len,
  octet_length(nome) AS bytes,
  encode(nome::bytea, 'hex') AS nome_hex,
  leiloeira, transmissao, modelo, status
FROM public.bula_leiloes
WHERE data = '2026-06-03'
UNION ALL
SELECT
  'cronograma_leiloes',
  id::text,
  data,
  nome,
  length(nome),
  octet_length(nome),
  encode(nome::bytea, 'hex'),
  leiloeira, NULL, presencial, NULL
FROM public.cronograma_leiloes
WHERE data = '2026-06-03'
ORDER BY tabela, nome;

-- 2. Quantas linhas duplicadas restam globalmente em cada tabela
--    (depois do dedup deveria ser 0).
SELECT 'bula_leiloes' AS tabela, LOWER(TRIM(nome)) AS nome_norm, data, COUNT(*) AS qtd
  FROM public.bula_leiloes
 GROUP BY 1,2,3
 HAVING COUNT(*) > 1
UNION ALL
SELECT 'cronograma_leiloes', LOWER(TRIM(nome)), data, COUNT(*)
  FROM public.cronograma_leiloes
 GROUP BY 1,2,3
 HAVING COUNT(*) > 1;
