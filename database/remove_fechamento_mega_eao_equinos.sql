-- Remove a conta a receber dos Equinos do 6º Mega EAO ExpoZebu 2026.
-- Diretiva do chefe (WhatsApp 2026-05-05): "Pode tirar esses equinos".
-- Justificativa: Bula não intermediou lotes de equinos — sem assessoria, sem receita.
-- Idempotente: o WHERE só casa o registro específico inserido por
-- scripts/ajustar_fechamento_mega_eao_oficial.js (ensureContaEquinos).

DELETE FROM public.erp_finance_transactions
WHERE description = 'Receita Bula – EAO Agropecuária – 1% – 6º Mega EAO Equinos – Expozebu 2026'
  AND transaction_date = '2026-05-03'
  AND type = 'income'
  AND amount = 2656;
