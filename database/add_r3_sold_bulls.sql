-- ==============================================================================
-- INSERT NEW R3 BULLS (SOLD)
-- ==============================================================================
-- Owner: R3
-- Location: João Pinheiro-MG (Inferred/Default)
-- Status: Sold

-- 1. RJPS 592
INSERT INTO public.products (
    name, 
    category, 
    classificacao, 
    modalidade, 
    logistica, 
    forma_pagamento, 
    location, 
    image_url, 
    gallery, 
    price, 
    installments, 
    tag, 
    details
) VALUES (
    'REVOLUCAO RJ DA R3',
    'Touro PO',
    'touro',
    'venda_direta',
    'retira_fazenda',
    '30x',
    'Itacarambi - MG',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770064377/RJPS592_chsa3f.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770064377/RJPS592_chsa3f.mp4'],
    18000,
    '600,00',
    'Vendido',
    jsonb_build_object(
        'registro', 'RJPS 592',
        'raca', 'Nelore',
        'peso', 'Sob Consulta',
        'mgte', 'Sob Consulta',
        'status', 'Vendido',
        'tipo', 'Touro',
        'comentario', 'Touro PO R3.',
        'breeder', 'R3',
        'pdf', '/RJPS592.pdf'
    )
);

-- 2. RJPS 603
INSERT INTO public.products (
    name, 
    category, 
    classificacao, 
    modalidade, 
    logistica, 
    forma_pagamento, 
    location, 
    image_url, 
    gallery, 
    price, 
    installments, 
    tag, 
    details
) VALUES (
    'RISPIDO FIV RJ DA R3',
    'Touro PO',
    'touro',
    'venda_direta',
    'retira_fazenda',
    '30x',
    'João Pinheiro-MG',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770064378/RJPS603_e7h96q.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770064378/RJPS603_e7h96q.mp4'],
    18000,
    '600,00',
    'Vendido',
    jsonb_build_object(
        'registro', 'RJPS 603',
        'raca', 'Nelore',
        'peso', 'Sob Consulta',
        'mgte', 'Sob Consulta',
        'status', 'Vendido',
        'tipo', 'Touro',
        'comentario', 'Touro PO R3.',
        'breeder', 'R3',
        'pdf', '/RJPS603.pdf'
    )
);
