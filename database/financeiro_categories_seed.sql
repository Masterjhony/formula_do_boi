-- Seed categorias financeiras padrão
-- Execute este script no Supabase SQL Editor

INSERT INTO erp_finance_categories (id, name, type) VALUES
    (gen_random_uuid(), 'Vendas', 'income'),
    (gen_random_uuid(), 'Recebimentos', 'income'),
    (gen_random_uuid(), 'Rendimentos', 'income'),
    (gen_random_uuid(), 'Outros (Receita)', 'income'),
    (gen_random_uuid(), 'Transferência', 'expense'),
    (gen_random_uuid(), 'Marketing/Publicidade', 'expense'),
    (gen_random_uuid(), 'Investimentos', 'expense'),
    (gen_random_uuid(), 'Fornecedores', 'expense'),
    (gen_random_uuid(), 'Impostos', 'expense'),
    (gen_random_uuid(), 'Salários', 'expense'),
    (gen_random_uuid(), 'Operacional', 'expense'),
    (gen_random_uuid(), 'Outros (Despesa)', 'expense');
