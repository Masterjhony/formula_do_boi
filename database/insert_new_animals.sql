-- Insert New Animals for Owner Nelore Fórmula (Feb 15, 2026)

-- 1. MARINACA (Matriz)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'MARINACA') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771198889/AAMJ_172_yndpkr.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771198889/AAMJ_172_yndpkr.mp4'],
            price = 10000.00,
            installments = '1.000,00',
            forma_pagamento = '10x',
            category = 'Matriz PO',
            classificacao = 'matriz',
            location = 'São Joaquim de Bicas-MG',
            details = products.details || jsonb_build_object(
                'registro', 'AAMJ 172',
                'raca', 'Nelore Padrão',
                'nascimento', '20/12/2010',
                'pai', 'ESPELHO OB', 
                'mae', 'CINTIA OB', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Matriz',
                'breeder', 'Nelore Fórmula',
                'pdf', '/AAMJ 172.pdf',
                'comissao', '4%'
            )
        WHERE name = 'MARINACA';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'MARINACA',
            'Matriz PO',
            'matriz',
            'venda_direta',
            'retira_fazenda',
            '10x',
            'São Joaquim de Bicas-MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771198889/AAMJ_172_yndpkr.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771198889/AAMJ_172_yndpkr.mp4'],
            10000.00,
            '1.000,00',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'AAMJ 172',
                'raca', 'Nelore Padrão',
                'nascimento', '20/12/2010',
                'pai', 'ESPELHO OB', 
                'mae', 'CINTIA OB', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Matriz',
                'breeder', 'Nelore Fórmula',
                'pdf', '/AAMJ 172.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;

-- 2. TONEL ZEN (Touro)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'TONEL ZEN') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771198893/BRAU_806_yag6ec.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771198893/BRAU_806_yag6ec.mp4'],
            price = 12000.00,
            installments = '1.000,00',
            forma_pagamento = '12x',
            category = 'Touro PO',
            classificacao = 'touro',
            location = 'São Joaquim de Bicas-MG',
            details = products.details || jsonb_build_object(
                'registro', 'BRAU 806',
                'raca', 'Nelore Padrão',
                'nascimento', '18/12/2024',
                'pai', 'DIPLOMATA DA AGRONOVA', 
                'mae', 'QUITERIA ZEN', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Touro',
                'breeder', 'Nelore Fórmula',
                'pdf', '/BRAU 806.pdf',
                'comissao', '4%'
            )
        WHERE name = 'TONEL ZEN';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'TONEL ZEN',
            'Touro PO',
            'touro',
            'venda_direta',
            'retira_fazenda',
            '12x',
            'São Joaquim de Bicas-MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771198893/BRAU_806_yag6ec.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771198893/BRAU_806_yag6ec.mp4'],
            12000.00,
            '1.000,00',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'BRAU 806',
                'raca', 'Nelore Padrão',
                'nascimento', '18/12/2024',
                'pai', 'DIPLOMATA DA AGRONOVA', 
                'mae', 'QUITERIA ZEN', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Touro',
                'breeder', 'Nelore Fórmula',
                'pdf', '/BRAU 806.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;

-- 3. VICTORIA NELORE DAMA (Matriz)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'VICTORIA NELORE DAMA') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771198891/DAPO_30_hd4yfs.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771198891/DAPO_30_hd4yfs.mp4'],
            price = 10000.00,
            installments = '1.000,00',
            forma_pagamento = '10x',
            category = 'Matriz PO',
            classificacao = 'matriz',
            location = 'São Joaquim de Bicas-MG',
            details = products.details || jsonb_build_object(
                'registro', 'DAPO 30',
                'raca', 'Nelore Padrão',
                'nascimento', '12/12/2024',
                'pai', 'DIPLOMATA DA AGRONOVA', 
                'mae', '22 NELORE DAMA', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Matriz',
                'breeder', 'Nelore Fórmula',
                'pdf', '/DAPO 30.pdf',
                'comissao', '4%'
            )
        WHERE name = 'VICTORIA NELORE DAMA';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'VICTORIA NELORE DAMA',
            'Matriz PO',
            'matriz',
            'venda_direta',
            'retira_fazenda',
            '10x',
            'São Joaquim de Bicas-MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771198891/DAPO_30_hd4yfs.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771198891/DAPO_30_hd4yfs.mp4'],
            10000.00,
            '1.000,00',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'DAPO 30',
                'raca', 'Nelore Padrão',
                'nascimento', '12/12/2024',
                'pai', 'DIPLOMATA DA AGRONOVA', 
                'mae', '22 NELORE DAMA', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Matriz',
                'breeder', 'Nelore Fórmula',
                'pdf', '/DAPO 30.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;

-- 4. MIL (Touro)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'MIL') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771198891/AAMJ_173_uiusle.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771198891/AAMJ_173_uiusle.mp4'],
            price = 8000.00,
            installments = '800,00',
            forma_pagamento = '10x',
            category = 'Touro PO',
            classificacao = 'touro',
            location = 'São Joaquim de Bicas-MG',
            details = products.details || jsonb_build_object(
                'registro', 'AAMJ 173',
                'raca', 'Nelore Padrão',
                'nascimento', '21/12/2010',
                'pai', 'ESPELHO OB', 
                'mae', 'CALU VARRELA', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Touro',
                'breeder', 'Nelore Fórmula',
                'pdf', '/AAMJ 173.pdf',
                'comissao', '4%'
            )
        WHERE name = 'MIL';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'MIL',
            'Touro PO',
            'touro',
            'venda_direta',
            'retira_fazenda',
            '10x',
            'São Joaquim de Bicas-MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771198891/AAMJ_173_uiusle.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771198891/AAMJ_173_uiusle.mp4'],
            8000.00,
            '800,00',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'AAMJ 173',
                'raca', 'Nelore Padrão',
                'nascimento', '21/12/2010',
                'pai', 'ESPELHO OB', 
                'mae', 'CALU VARRELA', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Touro',
                'breeder', 'Nelore Fórmula',
                'pdf', '/AAMJ 173.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;

-- 5. SOLEDADE (Matriz)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'SOLEDADE') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771198891/XRGH_2_zpww09.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771198891/XRGH_2_zpww09.mp4'],
            price = 8000.00,
            installments = '800,00',
            forma_pagamento = '10x',
            category = 'Matriz PO',
            classificacao = 'matriz',
            location = 'São Joaquim de Bicas-MG',
            details = products.details || jsonb_build_object(
                'registro', 'XRGH 2',
                'raca', 'Nelore Padrão',
                'nascimento', '11/01/2025',
                'pai', '398 FIV DE NAVIRAI', 
                'mae', 'AURORA FIV GARN', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Matriz',
                'breeder', 'Nelore Fórmula',
                'pdf', '/XRGH 2.pdf',
                'comissao', '4%'
            )
        WHERE name = 'SOLEDADE';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'SOLEDADE',
            'Matriz PO',
            'matriz',
            'venda_direta',
            'retira_fazenda',
            '10x',
            'São Joaquim de Bicas-MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1771198891/XRGH_2_zpww09.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1771198891/XRGH_2_zpww09.mp4'],
            8000.00,
            '800,00',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'XRGH 2',
                'raca', 'Nelore Padrão',
                'nascimento', '11/01/2025',
                'pai', '398 FIV DE NAVIRAI', 
                'mae', 'AURORA FIV GARN', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Matriz',
                'breeder', 'Nelore Fórmula',
                'pdf', '/XRGH 2.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;
