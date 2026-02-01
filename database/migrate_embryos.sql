-- INSERT EMBRYOS & SEMEN into products table
-- Data source: src/data/embryos.ts

-- 1. TRUFA BERRANTE DE OURO
INSERT INTO public.products (
    id, name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
) OVERRIDING SYSTEM VALUE VALUES (
    1,
    'TRUFA BERRANTE DE OURO',
    'Embrião',
    'matriz',
    'leilao',
    'frete_gratis',
    'parcelado_30x',
    'Uberaba - MG',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769224979/trufa_gz0wpf.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769224979/trufa_gz0wpf.mp4', '/cattle/boi_01.jpg'],
    0, -- Consultar
    'Consultar',
    'DESTAQUE',
    '{"registro": "RGD 1234", "raca": "Nelore", "nascimento": "01/01/2020", "pai": "BERRANTE", "mae": "TRUFA", "peso": "800 kg", "comentario": "Doadora de exceção, com produção comprovada. Animal de pista."}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 2. VANEZA MUN 4611
INSERT INTO public.products (
    id, name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
) OVERRIDING SYSTEM VALUE VALUES (
    2,
    'VANEZA MUN 4611',
    'Matriz PO',
    'matriz',
    'venda_direta',
    'frete_compartilhado',
    'parcelado_24x',
    'Goiânia - GO',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769224979/vaneza_yfeis7.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769224979/vaneza_yfeis7.mp4'],
    18000.00,
    '600,00',
    'OPORTUNIDADE',
    '{"registro": "MUN 4611", "raca": "Nelore", "nascimento": "15/03/2021", "pai": "REM ARMADOR", "mae": "VANEZA FIV", "peso": "650 kg", "comentario": "Fêmea jovem, muito equilibrada e fértil."}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 3. AMORA AQMJ 3422
INSERT INTO public.products (
    id, name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
) OVERRIDING SYSTEM VALUE VALUES (
    3,
    'AMORA AQMJ 3422',
    'Novilha PO',
    'reposicao',
    'venda_fixa',
    'retira_fazenda',
    'a_vista',
    'Campo Grande - MS',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769224984/amora_lpw1xx.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769224984/amora_lpw1xx.mp4'],
    12000.00,
    '12.000,00',
    'NOVIDADE',
    '{"registro": "AQMJ 3422", "raca": "Nelore", "nascimento": "20/08/2022", "pai": "LANDAU DA DI GENIO", "mae": "AMORA FIV", "peso": "480 kg", "comentario": "Novilha de futuro, pronta para estação de monta."}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 4. DANDARA EAJR 2
INSERT INTO public.products (
    id, name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
) OVERRIDING SYSTEM VALUE VALUES (
    4,
    'DANDARA EAJR 2',
    'Matriz',
    'matriz',
    'venda_direta',
    'frete_gratis',
    'parcelado_12x',
    'Uberlândia - MG',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769224964/dandara_nwmjkr.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769224964/dandara_nwmjkr.mp4'],
    22500.00,
    '1.875,00',
    'PREMIUM',
    '{"registro": "EAJR 2", "raca": "Nelore", "nascimento": "10/05/2019", "pai": "BITELO", "mae": "DANDARA 1", "peso": "720 kg", "comentario": "Matriz consagrada, parida de fêmea."}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 5. FADA IBIZ 2331
INSERT INTO public.products (
    id, name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
) OVERRIDING SYSTEM VALUE VALUES (
    5,
    'FADA IBIZ 2331',
    'Embrião', -- Changed to Embrion per request likely
    'matriz',
    'leilao',
    'frete_compartilhado',
    'parcelado_36x',
    'Barretos - SP',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769224984/fada_vg580y.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769224984/fada_vg580y.mp4'],
    0,
    'Consultar',
    'LEILÃO',
    '{"registro": "IBIZ 2331", "raca": "Nelore", "nascimento": "12/12/2018", "pai": "BIG BEN", "mae": "FADA FIV", "peso": "780 kg", "comentario": "Doadora de alta produção de embriões."}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 6. FRANÇA EAJR 7
INSERT INTO public.products (
    id, name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
) OVERRIDING SYSTEM VALUE VALUES (
    6,
    'FRANÇA EAJR 7',
    'Novilha',
    'reposicao',
    'venda_direta',
    'frete_gratis',
    'parcelado_24x',
    'Cuiabá - MT',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769224980/franca_ga4fbt.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769224980/franca_ga4fbt.mp4'],
    15000.00,
    '625,00',
    'TOP',
    '{"registro": "EAJR 7", "raca": "Nelore", "nascimento": "05/01/2022", "pai": "REM USP", "mae": "FRANÇA 1", "peso": "510 kg", "comentario": "Novilha de pista, morfologia impecável."}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 102. Dose de Sêmen - LANDROVER
INSERT INTO public.products (
    id, name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
) OVERRIDING SYSTEM VALUE VALUES (
    102,
    'Dose de Sêmen - LANDROVER',
    'Sêmen',
    'touro',
    'venda_direta',
    'retira_fazenda',
    'venda_direta',
    'Central Genex',
    '/cattle/boi_semen.mp4',
    ARRAY['/cattle/boi_reprodutor.jpg'],
    50.00,
    'Pedido Mínimo: 50 doses',
    'PROVADO',
    '{"raca": "Nelore", "tipo": "Sêmen Convencional", "pai": "LANDROVER", "mae": "DA XARAES", "comentario": "Touro com excelente avaliação de carcaça e desempenho. Ideal para rebanhos comerciais e puros."}'::jsonb
) ON CONFLICT (id) DO NOTHING;
