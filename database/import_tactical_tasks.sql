-- Import initial data from CSV Export
-- Clearing existing data to avoid duplicates if re-running (optional, uncomment if needed)
-- TRUNCATE TABLE public.tactical_tasks;

DO $$
BEGIN
    -- 1. Análise de Crédito
    INSERT INTO public.tactical_tasks (title, status, priority, due_date, assignees, position)
    VALUES (
        'Análise de Crédito',
        'A fazer',
        'Alta',
        '2026-02-18 10:23:00',
        ARRAY['Hugo Falk', 'joao eduardo lucas pereira'], -- Storing names for now to ensure display
        1000
    );

    -- 2. Abertura de Conta Bancária
    INSERT INTO public.tactical_tasks (title, status, priority, due_date, assignees, position)
    VALUES (
        'Abertura de Conta Bancária',
        'A fazer',
        'Média', -- Defaulting to Medium
        '2026-01-20 14:51:00',
        ARRAY['joao eduardo lucas pereira'],
        2000
    );

    -- 3. Criar minutas contratuais com Clientes e Criadores
    INSERT INTO public.tactical_tasks (title, status, priority, due_date, assignees, position)
    VALUES (
        'Criar minutas contratuais com Clientes e Criadores',
        'A fazer',
        'Média',
        '2026-02-02 17:12:00',
        ARRAY['joao eduardo lucas pereira'],
        3000
    );

    -- 4. Transferir WhatsApp Business do Matheus para o Hugo
    INSERT INTO public.tactical_tasks (title, status, priority, due_date, assignees, position)
    VALUES (
        'Transferir WhatsApp Business do Matheus para o Hugo',
        'Completa',
        'Alta',
        '2026-01-28 16:55:00',
        ARRAY['joao eduardo lucas pereira', 'Hugo Falk'],
        4000
    );

    -- 5. Criar apresentação para Criadores
    INSERT INTO public.tactical_tasks (title, status, priority, due_date, assignees, position)
    VALUES (
        'Criar apresentação para Criadores',
        'A fazer',
        'Média',
        '2026-02-11 18:27:00',
        ARRAY['Marcelo Carneiro Lucas Pereira', 'joao eduardo lucas pereira', 'Matheus Amormino'],
        5000
    );

    -- 6. Publicar todos os lotes no Storys em Destaques
    INSERT INTO public.tactical_tasks (title, status, priority, due_date, assignees, position)
    VALUES (
        'Publicar todos os lotes no Storys em Destaques',
        'A fazer',
        'Alta',
        '2026-02-18 10:09:00',
        ARRAY['Marcelo Carneiro Lucas Pereira'],
        6000
    );

    -- 7. Apresentações Comerciais e Institucionais
    INSERT INTO public.tactical_tasks (title, status, priority, due_date, assignees, position)
    VALUES (
        'Apresentações Comerciais e Institucionais',
        'A fazer',
        'Alta',
        '2026-02-18 10:11:00',
        ARRAY['Marcelo Carneiro Lucas Pereira'],
        7000
    );

    -- 8. Ferramenta de acompanhamento comercial Chatbot
    INSERT INTO public.tactical_tasks (title, status, priority, due_date, assignees, position)
    VALUES (
        'Ferramenta de acompanhamento comercial Chatbot',
        'A fazer',
        'Alta',
        '2026-02-18 10:30:00',
        ARRAY['Marcelo Carneiro Lucas Pereira', 'Hugo Falk', 'João Gabriel dos Santos'],
        8000
    );

    -- 9. Alterações no Marketplace
    INSERT INTO public.tactical_tasks (title, status, priority, due_date, assignees, position)
    VALUES (
        'Alterações no Marketplace',
        'Em andamento',
        'Alta',
        '2026-02-18 10:16:00',
        ARRAY['Marcelo Carneiro Lucas Pereira', 'joao eduardo lucas pereira'],
        9000
    );

    -- 10. Criação do CNPJ
    INSERT INTO public.tactical_tasks (title, status, priority, due_date, assignees, position)
    VALUES (
        'Criação do CNPJ',
        'Em andamento',
        'Média',
        '2026-01-20 14:50:00',
        ARRAY['joao eduardo lucas pereira'],
        10000
    );

    -- 11. Funil Perpétuo Meta ADS
    INSERT INTO public.tactical_tasks (title, status, priority, due_date, assignees, position)
    VALUES (
        'Funil Perpétuo Meta ADS',
        'Em andamento',
        'Alta',
        '2026-02-18 09:58:00',
        ARRAY['Marcelo Carneiro Lucas Pereira', 'João Gabriel dos Santos'],
        11000
    );

    -- 12. Planilha de Acompanhamento Growth e Comercial
    INSERT INTO public.tactical_tasks (title, status, priority, due_date, assignees, position)
    VALUES (
        'Planilha de Acompanhamento Growth e Comercial',
        'Em andamento',
        'Alta',
        '2026-02-18 10:10:00',
        ARRAY['Marcelo Carneiro Lucas Pereira', 'João Gabriel dos Santos', 'Hugo Falk'],
        12000
    );

    -- 13. Automação para cadastro no Marketplace
    INSERT INTO public.tactical_tasks (title, status, priority, due_date, assignees, position)
    VALUES (
        'Automação para cadastro no Marketplace',
        'Em andamento',
        'Média',
        '2026-01-25 13:58:00',
        ARRAY['joao eduardo lucas pereira', 'João Gabriel dos Santos'],
        13000
    );

END $$;
