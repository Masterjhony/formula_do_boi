-- ============================================================
-- IMPORTACAO DE EXTRATO - BANCO INTER CC 521573610
-- Periodo: 22/05/2026 a 22/06/2026
-- Saldo final do extrato (22/06/2026): R$ 0,00
-- Lancamentos: 12 (9 expense + 3 income)
-- Total saidas: R$ 6.714,73
-- Total entradas: R$ 6.500,00
-- ------------------------------------------------------------
-- Idempotencia: cada linha usa o FITID do OFX em ofx_fitid.
-- Reexecutar este arquivo nao duplica lancamentos ja importados.
-- ============================================================

DO $$
DECLARE
    v_account_id UUID;
BEGIN

    SELECT id INTO v_account_id
    FROM erp_finance_accounts
    WHERE name ILIKE '%521573610%'
       OR name ILIKE '%Banco Inter%'
    LIMIT 1;

    IF v_account_id IS NULL THEN
        INSERT INTO erp_finance_accounts (name, type, initial_balance, current_balance)
        VALUES ('Banco Inter - C/C', 'checking', 0.00, 0.00)
        RETURNING id INTO v_account_id;
        RAISE NOTICE 'Conta criada: Banco Inter - C/C (%)', v_account_id;
    ELSE
        RAISE NOTICE 'Conta existente utilizada: %', v_account_id;
    END IF;

    INSERT INTO erp_finance_transactions
        (account_id, type, amount, description, transaction_date, status, ofx_fitid, observacao)
    SELECT
        v_account_id,
        t.type::transaction_type,
        t.amount,
        t.description,
        t.transaction_date,
        'completed'::transaction_status,
        t.ofx_fitid,
        t.observacao
    FROM (VALUES
        ('expense',   50.67, 'Pix enviado - Marcelo Carneiro Lucas Pereira', '2026-06-13'::date, '202606130771', '[OFX:202606130771] Pix enviado: "Cp :60701190-Marcelo Carneiro Lucas Pereira"'),
        ('expense',  300.00, 'Pix enviado - Joao Eduardo Lucas Pereira', '2026-06-12'::date, '202606120771', '[OFX:202606120771] Pix enviado: "Cp :18236120-Joao Eduardo Lucas Pereira"'),
        ('expense',  170.00, 'Pix enviado - Conselho Reg De Medicina Veterinaria Do Est De M Gerais', '2026-06-11'::date, '202606110771', '[OFX:202606110771] Pix enviado: "Cp :00000000-CONSELHO REG DE MEDICINA VETERINARIA DO EST DE M GERAIS"'),
        ('expense', 2000.00, 'Pix enviado - Fabricio Moraes Lucas Pereira', '2026-06-10'::date, '202606100771', '[OFX:202606100771] Pix enviado: "00019 458192481 FABRICIO PEREIRA"'),
        ('income',  5000.00, 'Pix recebido - Bula Assessoria Pecuaria Ltda', '2026-06-09'::date, '202606090771', '[OFX:202606090771] Pix recebido: "Cp :73647935-BULA ASSESSORIA PECUARIA LTDA"'),
        ('expense', 1000.00, 'Pix enviado - Joao Gabriel Dos Santos Dos Anjos', '2026-06-09'::date, '202606090772', '[OFX:202606090772] Pix enviado: "00019 140493000 JOAO ANJOS"'),
        ('expense',  800.00, 'Pix enviado - Heliana Maria Lucas', '2026-06-09'::date, '202606090773', '[OFX:202606090773] Pix enviado: "Cp :00000000-Heliana Maria Lucas"'),
        ('expense',  679.33, 'Pagamento efetuado - Fatura cartao Inter', '2026-06-09'::date, '202606090774', '[OFX:202606090774] Pagamento efetuado: "Pagamento fatura cartao Inter"'),
        ('expense',   61.00, 'Pix enviado - Joao Eduardo Lucas Pereira', '2026-06-04'::date, '202606040771', '[OFX:202606040771] Pix enviado: "Cp :18236120-Joao Eduardo Lucas Pereira"'),
        ('income',  1500.00, 'Pix recebido - Marcelo Carneiro Lucas Pereira', '2026-05-28'::date, '202605280771', '[OFX:202605280771] Pix recebido: "Cp :60701190-MARCELO CARNEIRO LUCAS PEREIRA"'),
        ('expense', 1439.00, 'Pix enviado - L Rabello Confeccoes', '2026-05-28'::date, '202605280772', '[OFX:202605280772] Pix enviado: "Cp :87510475-L RABELLO CONFECCOES"'),
        ('expense',  214.73, 'Pix enviado - Joao Eduardo Lucas Pereira', '2026-05-22'::date, '202605220771', '[OFX:202605220771] Pix enviado: "Cp :18236120-Joao Eduardo Lucas Pereira"')
    ) AS t(type, amount, description, transaction_date, ofx_fitid, observacao)
    ON CONFLICT (account_id, ofx_fitid) WHERE ofx_fitid IS NOT NULL DO NOTHING;

    UPDATE erp_finance_accounts
    SET current_balance = 0.00,
        updated_at = NOW()
    WHERE id = v_account_id;

    RAISE NOTICE 'Importacao concluida: extrato Banco Inter 22/05/2026 a 22/06/2026.';

END $$;
