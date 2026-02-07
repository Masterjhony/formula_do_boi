-- Insert New Matrizes (Feb 2026)
-- 1. VICTORIA NELORE DAMA (RGD: DAPO 30)
-- 2. BARRA LONGA FIV DA FAR (RGD: BNSS 31)
-- 3. BANDEIRA FIV DA FAR (RGD: BNSS 30)
-- 4. IBIZA FIV 2014 (RGD: IBIZ 2014)
-- 5. IBIZA FIV ORQUIDEA (RGD: IBIZ 1506)
-- 6. IBIZA FIV LOBO (RGD: IBIZ 1402)

-- 1. VICTORIA NELORE DAMA
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'VICTORIA NELORE DAMA') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770490909/DAPO30_aimkkj.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770490909/DAPO30_aimkkj.mp4'],
            price = 10000.00,
            installments = 'À Vista',
            forma_pagamento = 'a_vista',
            location = 'João Pinheiro-MG',
            details = jsonb_build_object(
                'registro', 'DAPO 30',
                'raca', 'Nelore Padrão',
                'nascimento', '12/12/2024',
                'pai', 'DIPLOMATA DA AGRONOVA',
                'mae', '22 NELORE DAMA',
                'iabcz', '',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Matriz',
                'breeder', 'Nelore Fórmula',
                'proprietario', 'Nelore Fórmula',
                'comissao', '4%',
                'pdf', '/DAPO30.pdf'
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
            'a_vista',
            'João Pinheiro-MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770490909/DAPO30_aimkkj.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770490909/DAPO30_aimkkj.mp4'],
            10000.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'DAPO 30',
                'raca', 'Nelore Padrão',
                'nascimento', '12/12/2024',
                'pai', 'DIPLOMATA DA AGRONOVA',
                'mae', '22 NELORE DAMA',
                'iabcz', '',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Matriz',
                'breeder', 'Nelore Fórmula',
                'proprietario', 'Nelore Fórmula',
                'comissao', '4%',
                'pdf', '/DAPO30.pdf'
            )
        );
    END IF;
END $$;

-- 2. BARRA LONGA FIV DA FAR
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'BARRA LONGA FIV DA FAR') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770490908/BNSS31_mmbo2k.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770490908/BNSS31_mmbo2k.mp4'],
            price = 14000.00,
            installments = 'À Vista',
            forma_pagamento = 'a_vista',
            location = 'Curvelo-MG',
            details = jsonb_build_object(
                'registro', 'BNSS 31',
                'raca', 'Nelore Padrão',
                'nascimento', '08/01/2024',
                'pai', 'DELEGADO FIV DA EAO',
                'mae', 'BESTY LUC 2L',
                'iabcz', '29.29',
                'mgte', '',
                'iqg', '36.9',
                'top', '',
                'status', 'Matriz',
                'breeder', 'Bernardo',
                'proprietario', 'Bernardo',
                'comissao', '4%',
                'pdf', '/BNSS31.pdf'
            )
        WHERE name = 'BARRA LONGA FIV DA FAR';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'BARRA LONGA FIV DA FAR',
            'Matriz PO',
            'matriz',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Curvelo-MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770490908/BNSS31_mmbo2k.mp4',
             ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770490908/BNSS31_mmbo2k.mp4'],
            14000.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'BNSS 31',
                'raca', 'Nelore Padrão',
                'nascimento', '08/01/2024',
                'pai', 'DELEGADO FIV DA EAO',
                'mae', 'BESTY LUC 2L',
                'iabcz', '29.29',
                'mgte', '',
                'iqg', '36.9',
                'top', '',
                'status', 'Matriz',
                'breeder', 'Bernardo',
                'proprietario', 'Bernardo',
                'comissao', '4%',
                'pdf', '/BNSS31.pdf'
            )
        );
    END IF;
END $$;

-- 3. BANDEIRA FIV DA FAR
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'BANDEIRA FIV DA FAR') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770490907/BNSS_30_gs0hgt.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770490907/BNSS_30_gs0hgt.mp4'],
            price = 14000.00,
            installments = 'À Vista',
            forma_pagamento = 'a_vista',
            location = 'Curvelo-MG',
            details = jsonb_build_object(
                'registro', 'BNSS 30',
                'raca', 'Nelore Padrão',
                'nascimento', '06/01/2024',
                'pai', 'REM ARMADOR',
                'mae', 'SAPATA NELOVERDE',
                'iabcz', '26.9',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Matriz',
                'breeder', 'Bernardo',
                'proprietario', 'Bernardo',
                'comissao', '4%',
                'pdf', '/BNSS30.pdf'
            )
        WHERE name = 'BANDEIRA FIV DA FAR';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'BANDEIRA FIV DA FAR',
            'Matriz PO',
            'matriz',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Curvelo-MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770490907/BNSS_30_gs0hgt.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770490907/BNSS_30_gs0hgt.mp4'],
            14000.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'BNSS 30',
                'raca', 'Nelore Padrão',
                'nascimento', '06/01/2024',
                'pai', 'REM ARMADOR',
                'mae', 'SAPATA NELOVERDE',
                'iabcz', '26.9',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Matriz',
                'breeder', 'Bernardo',
                'proprietario', 'Bernardo',
                'comissao', '4%',
                'pdf', '/BNSS30.pdf'
            )
        );
    END IF;
END $$;

-- 4. IBIZA FIV 2014
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'IBIZA FIV 2014') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770490918/IBIZ2014_tjo5jz.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770490918/IBIZ2014_tjo5jz.mp4'],
            price = 20000.00,
            installments = 'À Vista',
            forma_pagamento = 'a_vista',
            location = 'João Pinheiro-MG',
            details = jsonb_build_object(
                'registro', 'IBIZ 2014',
                'raca', 'Nelore Padrão',
                'nascimento', '29/04/2023',
                'pai', 'IMPACTO FIV V3',
                'mae', 'CAROL FIV GC DA SL',
                'iabcz', '-7.67',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Matriz',
                'breeder', 'Nelore Fórmula',
                'proprietario', 'Nelore Fórmula',
                'comissao', '4%',
                'pdf', '/IBIZ2014.pdf'
            )
        WHERE name = 'IBIZA FIV 2014';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'IBIZA FIV 2014',
            'Matriz PO',
            'matriz',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'João Pinheiro-MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770490918/IBIZ2014_tjo5jz.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770490918/IBIZ2014_tjo5jz.mp4'],
            20000.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'IBIZ 2014',
                'raca', 'Nelore Padrão',
                'nascimento', '29/04/2023',
                'pai', 'IMPACTO FIV V3',
                'mae', 'CAROL FIV GC DA SL',
                'iabcz', '-7.67',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Matriz',
                'breeder', 'Nelore Fórmula',
                'proprietario', 'Nelore Fórmula',
                'comissao', '4%',
                'pdf', '/IBIZ2014.pdf'
            )
        );
    END IF;
END $$;

-- 5. IBIZA FIV ORQUIDEA
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'IBIZA FIV ORQUIDEA') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770490916/IBIZ1506_z93agn.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770490916/IBIZ1506_z93agn.mp4'],
            price = 20000.00,
            installments = 'À Vista',
            forma_pagamento = 'a_vista',
            location = 'João Pinheiro-MG',
            details = jsonb_build_object(
                'registro', 'IBIZ 1506',
                'raca', 'Nelore Padrão',
                'nascimento', '20/07/2022',
                'pai', 'PAO DE LO DA CA',
                'mae', 'IBIZA FIV DUDALINA',
                'iabcz', '-2.7',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Matriz',
                'breeder', 'Nelore Fórmula',
                'proprietario', 'Nelore Fórmula',
                'comissao', '4%',
                'pdf', '/IBIZ1506.pdf'
            )
        WHERE name = 'IBIZA FIV ORQUIDEA';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'IBIZA FIV ORQUIDEA',
            'Matriz PO',
            'matriz',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'João Pinheiro-MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770490916/IBIZ1506_z93agn.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770490916/IBIZ1506_z93agn.mp4'],
            20000.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'IBIZ 1506',
                'raca', 'Nelore Padrão',
                'nascimento', '20/07/2022',
                'pai', 'PAO DE LO DA CA',
                'mae', 'IBIZA FIV DUDALINA',
                'iabcz', '-2.7',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Matriz',
                'breeder', 'Nelore Fórmula',
                'proprietario', 'Nelore Fórmula',
                'comissao', '4%',
                'pdf', '/IBIZ1506.pdf'
            )
        );
    END IF;
END $$;

-- 6. IBIZA FIV LOBO
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'IBIZA FIV LOBO') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770490911/IBIZ1402_ucz5im.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770490911/IBIZ1402_ucz5im.mp4'],
            price = 20000.00,
            installments = 'À Vista',
            forma_pagamento = 'a_vista',
            location = 'João Pinheiro-MG',
            details = jsonb_build_object(
                'registro', 'IBIZ 1402',
                'raca', 'Nelore Padrão',
                'nascimento', '08/07/2021',
                'pai', 'IMPACTO FIV V3',
                'mae', 'IBIZA FIV ARETA',
                'iabcz', '-5.21',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Matriz',
                'breeder', 'Nelore Fórmula',
                'proprietario', 'Nelore Fórmula',
                'comissao', '4%',
                'pdf', '/IBIZ1402.pdf'
            )
        WHERE name = 'IBIZA FIV LOBO';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'IBIZA FIV LOBO',
            'Matriz PO',
            'matriz',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'João Pinheiro-MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770490911/IBIZ1402_ucz5im.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770490911/IBIZ1402_ucz5im.mp4'],
            20000.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'IBIZ 1402',
                'raca', 'Nelore Padrão',
                'nascimento', '08/07/2021',
                'pai', 'IMPACTO FIV V3',
                'mae', 'IBIZA FIV ARETA',
                'iabcz', '-5.21',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Matriz',
                'breeder', 'Nelore Fórmula',
                'proprietario', 'Nelore Fórmula',
                'comissao', '4%',
                'pdf', '/IBIZ1402.pdf'
            )
        );
    END IF;
END $$;
