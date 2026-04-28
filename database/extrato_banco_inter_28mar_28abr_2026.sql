-- ============================================================
-- IMPORTAÇÃO DE EXTRATO — BANCO INTER CC 521573610
-- Período: 28/03/2026 a 28/04/2026
-- Saldo inicial do período (28/03/2026): R$ 9.573,19
-- Saldo final (28/04/2026): R$ 0,00
-- Lançamentos: 18 (16 expense + 2 income)
-- Total saídas: R$ 11.773,19
-- Total entradas: R$ 2.200,00
-- ------------------------------------------------------------
-- Observação: este arquivo cobre um período que se sobrepõe a
-- extrato_banco_inter_mar_abr_2026.sql (20/03 a 20/04). O
-- WHERE NOT EXISTS abaixo evita reinserção das linhas já
-- importadas (mesma conta + valor + descrição + data).
-- ============================================================

DO $$
DECLARE
    v_account_id UUID;
BEGIN

    -- 1. Localiza ou cria a conta Banco Inter
    SELECT id INTO v_account_id
    FROM erp_finance_accounts
    WHERE name ILIKE '%521573610%'
       OR name ILIKE '%Banco Inter%'
    LIMIT 1;

    IF v_account_id IS NULL THEN
        INSERT INTO erp_finance_accounts (name, type, initial_balance, current_balance)
        VALUES ('Banco Inter — CC 521573610', 'checking', 9573.19, 0.00)
        RETURNING id INTO v_account_id;
        RAISE NOTICE 'Conta criada: % (%)', 'Banco Inter — CC 521573610', v_account_id;
    ELSE
        RAISE NOTICE 'Conta existente utilizada: %', v_account_id;
    END IF;

    -- 2a. SAÍDAS — ignora duplicatas exatas (mesma conta + valor + descrição + data)
    INSERT INTO erp_finance_transactions
        (account_id, type, amount, description, transaction_date, status)
    SELECT v_account_id, 'expense', t.amount, t.description, t.transaction_date, 'pending'
    FROM (VALUES
        (1000.00, 'Pix enviado — Performance Publicidade',                       '2026-03-29'::date),
        ( 250.00, 'Pix enviado — Fabricio Moraes Lucas Pereira',                 '2026-03-31'::date),
        (1000.00, 'Pix enviado — Facebook Servicos Online Do Brasil Ltda',       '2026-04-01'::date),
        (  46.00, 'Pix enviado — Joao Eduardo Lucas Pereira',                    '2026-04-04'::date),
        ( 262.37, 'Pagamento de fatura — Marcelo Carneiro Lucas Pereira',        '2026-04-04'::date),
        ( 381.60, 'Pix enviado — Seubone Comercio De Bones Personalizados Ltda', '2026-04-07'::date),
        (1000.00, 'Pix enviado — Joao Gabriel Dos Santos Dos Anjos',             '2026-04-09'::date),
        ( 110.00, 'Pix enviado — Joao Eduardo Lucas Pereira',                    '2026-04-10'::date),
        (1100.00, 'Pix enviado — Fabricio Moraes Lucas Pereira',                 '2026-04-10'::date),
        ( 200.00, 'Pix enviado — Joao Eduardo Lucas Pereira',                    '2026-04-13'::date),
        ( 460.00, 'Pix enviado — Brumado Hotel',                                 '2026-04-14'::date),
        (2412.75, 'Pix enviado — Azul Linhas Aereas Brasileiras SA',             '2026-04-14'::date),
        ( 350.47, 'Pix enviado — Marcelo Carneiro Lucas Pereira',                '2026-04-16'::date),
        (1000.00, 'Pix enviado — Marcelo Carneiro Lucas Pereira',                '2026-04-16'::date),
        (1200.00, 'Pix enviado — Joao Eduardo Lucas Pereira',                    '2026-04-24'::date),
        (1000.00, 'Pix enviado — Performance Publicidade',                       '2026-04-26'::date)
    ) AS t(amount, description, transaction_date)
    WHERE NOT EXISTS (
        SELECT 1
        FROM erp_finance_transactions ex
        WHERE ex.account_id       = v_account_id
          AND ex.type              = 'expense'
          AND ex.amount            = t.amount
          AND ex.description       = t.description
          AND ex.transaction_date  = t.transaction_date
    );

    -- 2b. ENTRADAS
    INSERT INTO erp_finance_transactions
        (account_id, type, amount, description, transaction_date, status)
    SELECT v_account_id, 'income', t.amount, t.description, t.transaction_date, 'pending'
    FROM (VALUES
        (1200.00, 'Pix recebido — Marcelo Carneiro Lucas Pereira', '2026-04-24'::date),
        (1000.00, 'Pix recebido — Marcelo Carneiro Lucas Pereira', '2026-04-26'::date)
    ) AS t(amount, description, transaction_date)
    WHERE NOT EXISTS (
        SELECT 1
        FROM erp_finance_transactions ex
        WHERE ex.account_id       = v_account_id
          AND ex.type              = 'income'
          AND ex.amount            = t.amount
          AND ex.description       = t.description
          AND ex.transaction_date  = t.transaction_date
    );

    RAISE NOTICE 'Importação concluída. Verifique a aba Conciliação no ERP.';

END $$;
