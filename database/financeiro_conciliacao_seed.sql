-- 1. Inserir a Conta Bancária do Banco Inter
INSERT INTO erp_finance_accounts (id, name, type, current_balance)
VALUES (
    'd8b13c7c-4861-46ab-a5a8-2a2b0e6df2f4',
    'Banco Inter - C/C',
    'checking',
    8323.19
)
ON CONFLICT (id) DO NOTHING;

-- 2. Inserir as transações do CSV
INSERT INTO erp_finance_transactions (id, account_id, amount, type, description, transaction_date, status)
VALUES
    (gen_random_uuid(), 'd8b13c7c-4861-46ab-a5a8-2a2b0e6df2f4', 250.00, 'expense', 'Pix enviado - Fabricio Moraes Lucas Pereira', '2026-03-31', 'pending'),
    (gen_random_uuid(), 'd8b13c7c-4861-46ab-a5a8-2a2b0e6df2f4', 1000.00, 'expense', 'Pix enviado - Performance Publicidade', '2026-03-29', 'pending'),
    (gen_random_uuid(), 'd8b13c7c-4861-46ab-a5a8-2a2b0e6df2f4', 250.00, 'expense', 'Pix enviado - Fabricio Moraes Lucas Pereira', '2026-03-27', 'pending'),
    (gen_random_uuid(), 'd8b13c7c-4861-46ab-a5a8-2a2b0e6df2f4', 151.81, 'expense', 'Pix enviado - Joao Eduardo Lucas Pereira', '2026-03-25', 'pending'),
    (gen_random_uuid(), 'd8b13c7c-4861-46ab-a5a8-2a2b0e6df2f4', 82.00, 'expense', 'Pix enviado - Joao Eduardo Lucas Pereira', '2026-03-25', 'pending'),
    (gen_random_uuid(), 'd8b13c7c-4861-46ab-a5a8-2a2b0e6df2f4', 1000.00, 'expense', 'Pix enviado - Marcelo Carneiro Lucas Pereira', '2026-03-23', 'pending'),
    (gen_random_uuid(), 'd8b13c7c-4861-46ab-a5a8-2a2b0e6df2f4', 500.00, 'expense', 'Aplicação - Cdb Credito Banco Inter Sa', '2026-03-20', 'pending'),
    (gen_random_uuid(), 'd8b13c7c-4861-46ab-a5a8-2a2b0e6df2f4', 200.00, 'expense', 'Aplicação - Cdb Credito Banco Inter Sa', '2026-03-20', 'pending'),
    (gen_random_uuid(), 'd8b13c7c-4861-46ab-a5a8-2a2b0e6df2f4', 1843.00, 'expense', 'Pix enviado - Joao Eduardo Lucas Pereira', '2026-03-20', 'pending'),
    (gen_random_uuid(), 'd8b13c7c-4861-46ab-a5a8-2a2b0e6df2f4', 100.00, 'expense', 'Aplicação - Cdb Credito Banco Inter Sa', '2026-03-18', 'pending'),
    (gen_random_uuid(), 'd8b13c7c-4861-46ab-a5a8-2a2b0e6df2f4', 100.00, 'expense', 'Aplicação - Cdb Credito Banco Inter Sa', '2026-03-15', 'pending'),
    (gen_random_uuid(), 'd8b13c7c-4861-46ab-a5a8-2a2b0e6df2f4', 350.00, 'expense', 'Pix enviado - Everton Rodrigues Silva', '2026-03-14', 'pending'),
    (gen_random_uuid(), 'd8b13c7c-4861-46ab-a5a8-2a2b0e6df2f4', 15000.00, 'income', 'Pix recebido - Bernardo Nuno Rodrigues', '2026-03-13', 'pending'),
    (gen_random_uuid(), 'd8b13c7c-4861-46ab-a5a8-2a2b0e6df2f4', 300.00, 'expense', 'Pix enviado - Joao Eduardo Lucas Pereira', '2026-03-13', 'pending'),
    (gen_random_uuid(), 'd8b13c7c-4861-46ab-a5a8-2a2b0e6df2f4', 550.00, 'expense', 'Pix enviado - Fabricio Moraes Lucas Pereira', '2026-03-13', 'pending');
