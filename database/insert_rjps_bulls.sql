-- ==============================================================================
-- FIX SEQUENCE (CRITICAL: Fixes "duplicate key value violates unique constraint")
-- ==============================================================================
-- This syncs the auto-increment counter with the highest ID currently in the table
SELECT setval(pg_get_serial_sequence('public.products', 'id'), (SELECT MAX(id) FROM public.products));

-- ==============================================================================
-- INSERT NEW BULLS
-- ==============================================================================
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
) VALUES 
-- 1. QUINCAS RJ DA R3 (RJPS 556)
(
    'QUINCAS RJ DA R3',
    'Touro PO',
    'touro',
    'venda_direta',
    'retira_fazenda',
    'a_vista',
    'Itacarambi - MG',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769907538/RJPS556_v66dmc.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769907538/RJPS556_v66dmc.mp4'],
    NULL, -- Price Sob Consulta
    'Sob Consulta',
    'NOVO',
    '{"registro": "RJPS 556", "raca": "Nelore", "nascimento": "09/10/2021", "pai": "MUKESH FIV COL", "mae": "IABA COL", "peso": "Sob Consulta", "mgte": "iABCZ 13.04", "top": "Deca 2", "status": "Touro", "tipo": "Touro", "comentario": "Touro PO com iABCZ 13.04 (Deca 2). Criador: R3.", "pdf": "/RJPS556.pdf"}'::jsonb
),
-- 2. RAPEL RJ DA R3 (RJPS 573)
(
    'RAPEL RJ DA R3',
    'Touro PO',
    'touro',
    'venda_direta',
    'retira_fazenda',
    'a_vista',
    'Itacarambi - MG',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769907538/RJPS573_rmuu1e.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769907538/RJPS573_rmuu1e.mp4'],
    NULL,
    'Sob Consulta',
    'NOVO',
    '{"registro": "RJPS 573", "raca": "Nelore", "nascimento": "18/09/2022", "pai": "D8306 DA MN", "mae": "MARGO RJ DA R3", "peso": "Sob Consulta", "mgte": "iABCZ 8.10", "top": "Deca 3", "status": "Touro", "tipo": "Touro", "comentario": "Touro PO com iABCZ 8.10 (Deca 3). Criador: R3.", "pdf": "/RJPS573.pdf"}'::jsonb
),
-- 3. RELUTANTE RJ DA R3 (RJPS 579)
(
    'RELUTANTE RJ DA R3',
    'Touro PO',
    'touro',
    'venda_direta',
    'retira_fazenda',
    'a_vista',
    'Itacarambi - MG',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769907541/RJPS579_sjnxeg.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769907541/RJPS579_sjnxeg.mp4'],
    NULL,
    'Sob Consulta',
    'NOVO',
    '{"registro": "RJPS 579", "raca": "Nelore", "nascimento": "27/09/2022", "pai": "D8306 DA MN", "mae": "OQUENA RJ DA R3", "peso": "Sob Consulta", "mgte": "iABCZ 14.28", "top": "Deca 1", "status": "Touro", "tipo": "Touro", "comentario": "Touro PO com iABCZ 14.28 (Deca 1). Criador: R3.", "pdf": "/RJPS579.pdf"}'::jsonb
),
-- 4. RADICAL RJ DA R3 (RJPS 586)
(
    'RADICAL RJ DA R3',
    'Touro PO',
    'touro',
    'venda_direta',
    'retira_fazenda',
    'a_vista',
    'Itacarambi - MG',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769907540/RJPS586_wras8y.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769907540/RJPS586_wras8y.mp4'],
    NULL,
    'Sob Consulta',
    'NOVO',
    '{"registro": "RJPS 586", "raca": "Nelore", "nascimento": "16/10/2022", "pai": "BELO J MACHADO", "mae": "NEVADA RJ DA R3", "peso": "Sob Consulta", "mgte": "iABCZ 16.29", "top": "Deca 1", "status": "Touro", "tipo": "Touro", "comentario": "Touro PO com iABCZ 16.29 (Deca 1). Criador: R3.", "pdf": "/RJPS586.pdf"}'::jsonb
),
-- 5. ROMANCE RJ DA R3 (RJPS 634)
(
    'ROMANCE RJ DA R3',
    'Touro PO',
    'touro',
    'venda_direta',
    'retira_fazenda',
    'a_vista',
    'Itacarambi - MG',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769907541/RJPS634_oj7qus.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769907541/RJPS634_oj7qus.mp4'],
    NULL,
    'Sob Consulta',
    'NOVO',
    '{"registro": "RJPS 634", "raca": "Nelore", "nascimento": "09/01/2023", "pai": "QUICKMAN FIV COL", "mae": "JENNIFER RJ DA R3", "peso": "Sob Consulta", "mgte": "iABCZ 22.45", "top": "Deca 1", "status": "Touro", "tipo": "Touro", "comentario": "Touro PO com iABCZ 22.45 (Deca 1). Criador: R3.", "pdf": "/RJPS634.pdf"}'::jsonb
),
-- 6. RIQUELME FIV RJ DA R3 (RJPS 680)
(
    'RIQUELME FIV RJ DA R3',
    'Touro PO',
    'touro',
    'venda_direta',
    'retira_fazenda',
    'a_vista',
    'Itacarambi - MG',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769907541/RJPS680_focpkq.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769907541/RJPS680_focpkq.mp4'],
    NULL,
    'Sob Consulta',
    'NOVO',
    '{"registro": "RJPS 680", "raca": "Nelore", "nascimento": "10/12/2022", "pai": "BELO J MACHADO", "mae": "LANDE COL", "peso": "Sob Consulta", "mgte": "iABCZ 24.47", "top": "Deca 1", "status": "Touro", "tipo": "Touro", "comentario": "Touro PO com iABCZ 24.47 (Deca 1). Criador: R3.", "pdf": "/RJPS680.pdf"}'::jsonb
);
