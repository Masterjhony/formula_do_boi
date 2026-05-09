-- ============================================================
-- CRM — Limpa leads de teste + canoniza telefone na coluna `celular`
--
--  1) DELETE de leads de teste (nome/email com padrão claramente fake).
--     ⚠️ NÃO casa pelo campo `campaign` — temos campanhas reais
--     chamadas "FB - funil whatsapp - TESTE" / "CA - funil whatsapp -
--     teste" que entregam leads reais.
--
--  2) Backfill de `celular` a partir de `telefone`.
--     A LP gravava o WhatsApp em `crm_leads.telefone`, mas o componente
--     de Qualificação edita inline em `celular`. Resultado: o input
--     "Celular / WhatsApp" aparecia vazio mesmo quando o lead tinha
--     número. Corrige retroativamente.
-- ============================================================

-- -- Pré-visualização (rode antes para conferir):
-- SELECT id, nome, email, telefone, created_at
-- FROM public.crm_leads
-- WHERE
--      lower(trim(nome)) IN ('teste', 'teste curl', 'teste pre ads', 'teste automacao sheet')
--   OR nome ILIKE 'teste teste%'
--   OR nome ILIKE 'teste automacao%'
--   OR nome ~ '^\s*\d{1,2}/\d{1,2}/\d{2,4}'      -- name é um timestamp (lixo de fluxos antigos)
--   OR lower(email) LIKE '%@teste.com'
--   OR lower(email) LIKE '%@teste.com.br'
--   OR lower(email) LIKE '%@curl.com'
--   OR lower(email) = 'teste.automacao@formuladoboi.com'
-- ORDER BY created_at;

-- ===== 1) Apagar leads de teste =====
DELETE FROM public.crm_leads
WHERE
     lower(trim(nome)) IN ('teste', 'teste curl', 'teste pre ads', 'teste automacao sheet')
  OR nome ILIKE 'teste teste%'
  OR nome ILIKE 'teste automacao%'
  OR nome ~ '^\s*\d{1,2}/\d{1,2}/\d{2,4}'
  OR lower(email) LIKE '%@teste.com'
  OR lower(email) LIKE '%@teste.com.br'
  OR lower(email) LIKE '%@curl.com'
  OR lower(email) = 'teste.automacao@formuladoboi.com';

-- ===== 2) Migrar telefone → celular onde celular está vazio =====
-- Mantém `telefone` preenchido para não quebrar relatórios/queries
-- que ainda olham para a coluna histórica.
UPDATE public.crm_leads
   SET celular = telefone
 WHERE celular IS NULL
   AND telefone IS NOT NULL
   AND btrim(telefone) <> '';
