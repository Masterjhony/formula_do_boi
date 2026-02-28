-- Register 6 New Bulls for Owner Nelore da Nata

-- 1. 933 ACN
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = '933 ACN') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1772293267/ACNN933_ufauha.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1772293267/ACNN933_ufauha.mp4'],
            price = 15000.00,
            installments = '10x',
            forma_pagamento = '10x',
            category = 'Touro',
            classificacao = 'touro',
            location = 'Comendador Gomes MG',
            details = products.details || jsonb_build_object(
                'registro', 'ACNN 933',
                'raca', 'Nelore Padrão',
                'nascimento', '13/12/2024',
                'pai', 'FABULOSO FIV GUADALUPE', 
                'mae', 'CIGANA ACN', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore da Nata',
                'pdf', '/ACNN933.pdf',
                'comissao', '4%'
            )
        WHERE name = '933 ACN';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '933 ACN',
            'Touro',
            'touro',
            'venda_direta',
            'retira_fazenda',
            '10x',
            'Comendador Gomes MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1772293267/ACNN933_ufauha.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1772293267/ACNN933_ufauha.mp4'],
            15000.00,
            '10x',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'ACNN 933',
                'raca', 'Nelore Padrão',
                'nascimento', '13/12/2024',
                'pai', 'FABULOSO FIV GUADALUPE', 
                'mae', 'CIGANA ACN', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore da Nata',
                'pdf', '/ACNN933.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;

-- 2. 9796 DE NAVIRAI
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = '9796 DE NAVIRAI') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1772293266/CSCC9796_bppz7l.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1772293266/CSCC9796_bppz7l.mp4'],
            price = 15000.00,
            installments = '10x',
            forma_pagamento = '10x',
            category = 'Touro',
            classificacao = 'touro',
            location = 'Comendador Gomes MG',
            details = products.details || jsonb_build_object(
                'registro', 'CSCC 9796',
                'raca', 'Nelore Padrão',
                'nascimento', '28/11/2024',
                'pai', 'NAVIRAI FIV 19093-19', 
                'mae', '7769 FIV DE NAVIRAI', 
                'iabcz', '15,05',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore da Nata',
                'pdf', '/CSCC9796.pdf',
                'comissao', '4%'
            )
        WHERE name = '9796 DE NAVIRAI';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '9796 DE NAVIRAI',
            'Touro',
            'touro',
            'venda_direta',
            'retira_fazenda',
            '10x',
            'Comendador Gomes MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1772293266/CSCC9796_bppz7l.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1772293266/CSCC9796_bppz7l.mp4'],
            15000.00,
            '10x',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'CSCC 9796',
                'raca', 'Nelore Padrão',
                'nascimento', '28/11/2024',
                'pai', 'NAVIRAI FIV 19093-19', 
                'mae', '7769 FIV DE NAVIRAI', 
                'iabcz', '15,05',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore da Nata',
                'pdf', '/CSCC9796.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;

-- 3. 816 ACN
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = '816 ACN') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1772293267/ACNN816_vlbcvx.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1772293267/ACNN816_vlbcvx.mp4'],
            price = 15000.00,
            installments = '10x',
            forma_pagamento = '10x',
            category = 'Touro',
            classificacao = 'touro',
            location = 'Comendador Gomes MG',
            details = products.details || jsonb_build_object(
                'registro', 'ACNN 816',
                'raca', 'Nelore Padrão',
                'nascimento', '11/09/2024',
                'pai', 'RAM DA BELA', 
                'mae', 'CAPRI ACN', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore da Nata',
                'pdf', '/ACNN816.pdf',
                'comissao', '4%'
            )
        WHERE name = '816 ACN';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '816 ACN',
            'Touro',
            'touro',
            'venda_direta',
            'retira_fazenda',
            '10x',
            'Comendador Gomes MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1772293267/ACNN816_vlbcvx.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1772293267/ACNN816_vlbcvx.mp4'],
            15000.00,
            '10x',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'ACNN 816',
                'raca', 'Nelore Padrão',
                'nascimento', '11/09/2024',
                'pai', 'RAM DA BELA', 
                'mae', 'CAPRI ACN', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore da Nata',
                'pdf', '/ACNN816.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;

-- 4. 8468 DE NAV.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = '8468 DE NAV.') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1772293267/CSCF8468_j33elc.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1772293267/CSCF8468_j33elc.mp4'],
            price = 15000.00,
            installments = '10x',
            forma_pagamento = '10x',
            category = 'Touro',
            classificacao = 'touro',
            location = 'Comendador Gomes MG',
            details = products.details || jsonb_build_object(
                'registro', 'CSCF 8468',
                'raca', 'Nelore Padrão',
                'nascimento', '09/09/2024',
                'pai', 'MAXIMO DO MORRO', 
                'mae', '6647 DE NAV.', 
                'iabcz', '26,82',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore da Nata',
                'pdf', '/CSCF8468.pdf',
                'comissao', '4%'
            )
        WHERE name = '8468 DE NAV.';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '8468 DE NAV.',
            'Touro',
            'touro',
            'venda_direta',
            'retira_fazenda',
            '10x',
            'Comendador Gomes MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1772293267/CSCF8468_j33elc.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1772293267/CSCF8468_j33elc.mp4'],
            15000.00,
            '10x',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'CSCF 8468',
                'raca', 'Nelore Padrão',
                'nascimento', '09/09/2024',
                'pai', 'MAXIMO DO MORRO', 
                'mae', '6647 DE NAV.', 
                'iabcz', '26,82',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore da Nata',
                'pdf', '/CSCF8468.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;

-- 5. 800 ACN
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = '800 ACN') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1772293266/ACNN800_skrm7y.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1772293266/ACNN800_skrm7y.mp4'],
            price = 15000.00,
            installments = '10x',
            forma_pagamento = '10x',
            category = 'Touro',
            classificacao = 'touro',
            location = 'Comendador Gomes MG',
            details = products.details || jsonb_build_object(
                'registro', 'ACNN 800',
                'raca', 'Nelore Padrão',
                'nascimento', '06/09/2024',
                'pai', 'PESO FVC', 
                'mae', 'CLEO ACN', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore da Nata',
                'pdf', '/ACNN800.pdf',
                'comissao', '4%'
            )
        WHERE name = '800 ACN';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '800 ACN',
            'Touro',
            'touro',
            'venda_direta',
            'retira_fazenda',
            '10x',
            'Comendador Gomes MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1772293266/ACNN800_skrm7y.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1772293266/ACNN800_skrm7y.mp4'],
            15000.00,
            '10x',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'ACNN 800',
                'raca', 'Nelore Padrão',
                'nascimento', '06/09/2024',
                'pai', 'PESO FVC', 
                'mae', 'CLEO ACN', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore da Nata',
                'pdf', '/ACNN800.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;

-- 6. 9525 DE NAVIRAI
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = '9525 DE NAVIRAI') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1772293267/CSCC9525_xc4hxz.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1772293267/CSCC9525_xc4hxz.mp4'],
            price = 15000.00,
            installments = '10x',
            forma_pagamento = '10x',
            category = 'Touro',
            classificacao = 'touro',
            location = 'Comendador Gomes MG',
            details = products.details || jsonb_build_object(
                'registro', 'CSCC 9525',
                'raca', 'Nelore Padrão',
                'nascimento', '24/08/2024',
                'pai', 'DRUIDO DA AGRONOVA', 
                'mae', '8429 FIV DE NAVIRAI', 
                'iabcz', '28,72',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore da Nata',
                'pdf', '/CSCC9525.pdf',
                'comissao', '4%'
            )
        WHERE name = '9525 DE NAVIRAI';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '9525 DE NAVIRAI',
            'Touro',
            'touro',
            'venda_direta',
            'retira_fazenda',
            '10x',
            'Comendador Gomes MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1772293267/CSCC9525_xc4hxz.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1772293267/CSCC9525_xc4hxz.mp4'],
            15000.00,
            '10x',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'CSCC 9525',
                'raca', 'Nelore Padrão',
                'nascimento', '24/08/2024',
                'pai', 'DRUIDO DA AGRONOVA', 
                'mae', '8429 FIV DE NAVIRAI', 
                'iabcz', '28,72',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore da Nata',
                'pdf', '/CSCC9525.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;
