-- ============================================================
-- FIX: Remove duplicatas do seed sobrepostas pelo extrato
-- ============================================================
-- O seed (financeiro_conciliacao_seed.sql) usou " - " (hífen)
-- O extrato (extrato_banco_inter_mar_abr_2026.sql) usou " — " (travessão)
-- Para o período 20/03–31/03/2026 ambos existem → duplicata de R$ 5.276,81
--
-- Este script deleta as versões do seed (hífen) mantendo as do extrato (travessão)
-- ============================================================

DELETE FROM erp_finance_transactions
WHERE account_id IN (
    SELECT id FROM erp_finance_accounts
    WHERE name ILIKE '%Banco Inter%' OR name ILIKE '%521573610%'
)
AND transaction_date BETWEEN '2026-03-20' AND '2026-03-31'
AND (
    description LIKE 'Pix enviado - %'
    OR description LIKE 'Aplicação - %'
    OR description LIKE 'Pagamento - %'
);

-- Verificar resultado: deve restar 0 linhas com hífen nesse período
SELECT COUNT(*) AS duplicatas_restantes
FROM erp_finance_transactions
WHERE account_id IN (
    SELECT id FROM erp_finance_accounts
    WHERE name ILIKE '%Banco Inter%'
)
AND transaction_date BETWEEN '2026-03-20' AND '2026-03-31'
AND description LIKE '% - %';
