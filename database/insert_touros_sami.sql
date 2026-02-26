-- Register 10 New Bulls for Owner Nelore Paulo
-- Bulls: 1070, 1204, 1191, 1057, 1067, 1075, 1087, 1088, 1189, 1200 FIV DO SAMI

-- 1. 1070 FIV DO SAMI (SAMI 1070)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = '1070 FIV DO SAMI') THEN
        UPDATE public.products SET
            price = 18000.00,
            installments = 'A vista',
            forma_pagamento = 'A vista',
            category = 'Touro',
            classificacao = 'touro',
            location = 'Curvelo - MG',
            details = products.details || jsonb_build_object(
                'registro', 'SAMI 1070',
                'raca', 'Nelore Padrão',
                'nascimento', '28/10/2024',
                'pai', 'FINLANDES DA AGRONOVA', 
                'mae', '784 FIV DO SAMI', 
                'iabcz', '34,49',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore Paulo',
                'pdf', '/SAMI1070.pdf',
                'comissao', '4%'
            )
        WHERE name = '1070 FIV DO SAMI';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '1070 FIV DO SAMI',
            'Touro',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'A vista',
            'Curvelo - MG',
            '',
            ARRAY[]::text[],
            18000.00,
            'A vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'SAMI 1070',
                'raca', 'Nelore Padrão',
                'nascimento', '28/10/2024',
                'pai', 'FINLANDES DA AGRONOVA', 
                'mae', '784 FIV DO SAMI', 
                'iabcz', '34,49',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore Paulo',
                'pdf', '/SAMI1070.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;

-- 2. 1204 FIV DO SAMI (SAMI 1204)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = '1204 FIV DO SAMI') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1772126744/SAMI_1204_h1cy2a.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1772126744/SAMI_1204_h1cy2a.mp4'],
            price = 18000.00,
            installments = 'A vista',
            forma_pagamento = 'A vista',
            category = 'Touro',
            classificacao = 'touro',
            location = 'Curvelo - MG',
            details = products.details || jsonb_build_object(
                'registro', 'SAMI 1204',
                'raca', 'Nelore Padrão',
                'nascimento', '16/09/2024',
                'pai', 'DURANGO FIV DA EAO', 
                'mae', '779 FIV DO SAMI', 
                'iabcz', '20,42',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore Paulo',
                'pdf', '/SAMI1204.pdf',
                'comissao', '4%'
            )
        WHERE name = '1204 FIV DO SAMI';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '1204 FIV DO SAMI',
            'Touro',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'A vista',
            'Curvelo - MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1772126744/SAMI_1204_h1cy2a.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1772126744/SAMI_1204_h1cy2a.mp4'],
            18000.00,
            'A vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'SAMI 1204',
                'raca', 'Nelore Padrão',
                'nascimento', '16/09/2024',
                'pai', 'DURANGO FIV DA EAO', 
                'mae', '779 FIV DO SAMI', 
                'iabcz', '20,42',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore Paulo',
                'pdf', '/SAMI1204.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;

-- 3. 1191 FIV DO SAMI (SAMI 1191)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = '1191 FIV DO SAMI') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1772126760/SAMI1191_tckjsq.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1772126760/SAMI1191_tckjsq.mp4'],
            price = 18000.00,
            installments = 'A vista',
            forma_pagamento = 'A vista',
            category = 'Touro',
            classificacao = 'touro',
            location = 'Curvelo - MG',
            details = products.details || jsonb_build_object(
                'registro', 'SAMI 1191',
                'raca', 'Nelore Padrão',
                'nascimento', '09/09/2024',
                'pai', 'DURANGO FIV DA EAO', 
                'mae', '819 FIV DO SAMI', 
                'iabcz', '24,69',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore Paulo',
                'pdf', '/SAMI1191.pdf',
                'comissao', '4%'
            )
        WHERE name = '1191 FIV DO SAMI';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '1191 FIV DO SAMI',
            'Touro',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'A vista',
            'Curvelo - MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1772126760/SAMI1191_tckjsq.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1772126760/SAMI1191_tckjsq.mp4'],
            18000.00,
            'A vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'SAMI 1191',
                'raca', 'Nelore Padrão',
                'nascimento', '09/09/2024',
                'pai', 'DURANGO FIV DA EAO', 
                'mae', '819 FIV DO SAMI', 
                'iabcz', '24,69',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore Paulo',
                'pdf', '/SAMI1191.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;

-- 4. 1057 FIV DO SAMI (SAMI 1057)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = '1057 FIV DO SAMI') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1772126765/SAMI1057_bf29ec.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1772126765/SAMI1057_bf29ec.mp4'],
            price = 18000.00,
            installments = 'A vista',
            forma_pagamento = 'A vista',
            category = 'Touro',
            classificacao = 'touro',
            location = 'Curvelo - MG',
            details = products.details || jsonb_build_object(
                'registro', 'SAMI 1057',
                'raca', 'Nelore Padrão',
                'nascimento', '25/10/2024',
                'pai', 'REM1416L FIV GENETICA ADITIVA', 
                'mae', '807 FIV DO SAMI', 
                'iabcz', '38,1',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore Paulo',
                'pdf', '/SAMI1057.pdf',
                'comissao', '4%'
            )
        WHERE name = '1057 FIV DO SAMI';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '1057 FIV DO SAMI',
            'Touro',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'A vista',
            'Curvelo - MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1772126765/SAMI1057_bf29ec.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1772126765/SAMI1057_bf29ec.mp4'],
            18000.00,
            'A vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'SAMI 1057',
                'raca', 'Nelore Padrão',
                'nascimento', '25/10/2024',
                'pai', 'REM1416L FIV GENETICA ADITIVA', 
                'mae', '807 FIV DO SAMI', 
                'iabcz', '38,1',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore Paulo',
                'pdf', '/SAMI1057.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;

-- 5. 1067 FIV DO SAMI (SAMI 1067)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = '1067 FIV DO SAMI') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1772126750/SAMI1067_k7j9pb.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1772126750/SAMI1067_k7j9pb.mp4'],
            price = 18000.00,
            installments = 'A vista',
            forma_pagamento = 'A vista',
            category = 'Touro',
            classificacao = 'touro',
            location = 'Curvelo - MG',
            details = products.details || jsonb_build_object(
                'registro', 'SAMI 1067',
                'raca', 'Nelore Padrão',
                'nascimento', '28/10/2024',
                'pai', 'REM1416L FIV GENETICA ADITIVA', 
                'mae', '898 FIV DO SAMI', 
                'iabcz', '30,32',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore Paulo',
                'pdf', '/SAMI1067.pdf',
                'comissao', '4%'
            )
        WHERE name = '1067 FIV DO SAMI';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '1067 FIV DO SAMI',
            'Touro',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'A vista',
            'Curvelo - MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1772126750/SAMI1067_k7j9pb.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1772126750/SAMI1067_k7j9pb.mp4'],
            18000.00,
            'A vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'SAMI 1067',
                'raca', 'Nelore Padrão',
                'nascimento', '28/10/2024',
                'pai', 'REM1416L FIV GENETICA ADITIVA', 
                'mae', '898 FIV DO SAMI', 
                'iabcz', '30,32',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore Paulo',
                'pdf', '/SAMI1067.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;

-- 6. 1075 FIV DO SAMI (SAMI 1075)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = '1075 FIV DO SAMI') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1772126753/SAMI1075_b7eauf.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1772126753/SAMI1075_b7eauf.mp4'],
            price = 18000.00,
            installments = 'A vista',
            forma_pagamento = 'A vista',
            category = 'Touro',
            classificacao = 'touro',
            location = 'Curvelo - MG',
            details = products.details || jsonb_build_object(
                'registro', 'SAMI 1075',
                'raca', 'Nelore Padrão',
                'nascimento', '29/10/2024',
                'pai', 'REM1416L FIV GENETICA ADITIVA', 
                'mae', '807 FIV DO SAMI', 
                'iabcz', '36,98',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore Paulo',
                'pdf', '/SAMI1075.pdf',
                'comissao', '4%'
            )
        WHERE name = '1075 FIV DO SAMI';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '1075 FIV DO SAMI',
            'Touro',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'A vista',
            'Curvelo - MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1772126753/SAMI1075_b7eauf.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1772126753/SAMI1075_b7eauf.mp4'],
            18000.00,
            'A vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'SAMI 1075',
                'raca', 'Nelore Padrão',
                'nascimento', '29/10/2024',
                'pai', 'REM1416L FIV GENETICA ADITIVA', 
                'mae', '807 FIV DO SAMI', 
                'iabcz', '36,98',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore Paulo',
                'pdf', '/SAMI1075.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;

-- 7. 1087 FIV DO SAMI (SAMI 1087)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = '1087 FIV DO SAMI') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1772126764/SAMI1087_clmned.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1772126764/SAMI1087_clmned.mp4'],
            price = 18000.00,
            installments = 'A vista',
            forma_pagamento = 'A vista',
            category = 'Touro',
            classificacao = 'touro',
            location = 'Curvelo - MG',
            details = products.details || jsonb_build_object(
                'registro', 'SAMI 1087',
                'raca', 'Nelore Padrão',
                'nascimento', '05/11/2024',
                'pai', 'REM1416L FIV GENETICA ADITIVA', 
                'mae', '898 FIV DO SAMI', 
                'iabcz', '34,66',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore Paulo',
                'pdf', '/SAMI1087.pdf',
                'comissao', '4%'
            )
        WHERE name = '1087 FIV DO SAMI';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '1087 FIV DO SAMI',
            'Touro',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'A vista',
            'Curvelo - MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1772126764/SAMI1087_clmned.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1772126764/SAMI1087_clmned.mp4'],
            18000.00,
            'A vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'SAMI 1087',
                'raca', 'Nelore Padrão',
                'nascimento', '05/11/2024',
                'pai', 'REM1416L FIV GENETICA ADITIVA', 
                'mae', '898 FIV DO SAMI', 
                'iabcz', '34,66',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore Paulo',
                'pdf', '/SAMI1087.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;

-- 8. 1088 FIV DO SAMI (SAMI 1088)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = '1088 FIV DO SAMI') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1772126755/SAMI1088_uy0crj.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1772126755/SAMI1088_uy0crj.mp4'],
            price = 18000.00,
            installments = 'A vista',
            forma_pagamento = 'A vista',
            category = 'Touro',
            classificacao = 'touro',
            location = 'Curvelo - MG',
            details = products.details || jsonb_build_object(
                'registro', 'SAMI 1088',
                'raca', 'Nelore Padrão',
                'nascimento', '10/11/2024',
                'pai', 'FINLANDES DA AGRONOVA', 
                'mae', '819 FIV DO SAMI', 
                'iabcz', '34,57',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore Paulo',
                'pdf', '/SAMI1088.pdf',
                'comissao', '4%'
            )
        WHERE name = '1088 FIV DO SAMI';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '1088 FIV DO SAMI',
            'Touro',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'A vista',
            'Curvelo - MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1772126755/SAMI1088_uy0crj.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1772126755/SAMI1088_uy0crj.mp4'],
            18000.00,
            'A vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'SAMI 1088',
                'raca', 'Nelore Padrão',
                'nascimento', '10/11/2024',
                'pai', 'FINLANDES DA AGRONOVA', 
                'mae', '819 FIV DO SAMI', 
                'iabcz', '34,57',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore Paulo',
                'pdf', '/SAMI1088.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;

-- 9. 1189 FIV DO SAMI (SAMI 1189)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = '1189 FIV DO SAMI') THEN
        UPDATE public.products SET
            price = 18000.00,
            installments = 'A vista',
            forma_pagamento = 'A vista',
            category = 'Touro',
            classificacao = 'touro',
            location = 'Curvelo - MG',
            details = products.details || jsonb_build_object(
                'registro', 'SAMI 1189',
                'raca', 'Nelore Padrão',
                'nascimento', '02/09/2024',
                'pai', 'DURANGO FIV DA EAO', 
                'mae', '776 FIV DO SAMI', 
                'iabcz', '32,43',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore Paulo',
                'pdf', '/SAMI1189.pdf',
                'comissao', '4%'
            )
        WHERE name = '1189 FIV DO SAMI';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '1189 FIV DO SAMI',
            'Touro',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'A vista',
            'Curvelo - MG',
            '',
            ARRAY[]::text[],
            18000.00,
            'A vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'SAMI 1189',
                'raca', 'Nelore Padrão',
                'nascimento', '02/09/2024',
                'pai', 'DURANGO FIV DA EAO', 
                'mae', '776 FIV DO SAMI', 
                'iabcz', '32,43',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore Paulo',
                'pdf', '/SAMI1189.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;

-- 10. 1200 FIV DO SAMI (SAMI 1200)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = '1200 FIV DO SAMI') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1772126760/SAMI1200_yhql6r.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1772126760/SAMI1200_yhql6r.mp4'],
            price = 18000.00,
            installments = 'A vista',
            forma_pagamento = 'A vista',
            category = 'Touro',
            classificacao = 'touro',
            location = 'Curvelo - MG',
            details = products.details || jsonb_build_object(
                'registro', 'SAMI 1200',
                'raca', 'Nelore Padrão',
                'nascimento', '15/09/2024',
                'pai', 'DURANGO FIV DA EAO', 
                'mae', '819 FIV DO SAMI', 
                'iabcz', '30,53',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore Paulo',
                'pdf', '/SAMI1200.pdf',
                'comissao', '4%'
            )
        WHERE name = '1200 FIV DO SAMI';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '1200 FIV DO SAMI',
            'Touro',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'A vista',
            'Curvelo - MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1772126760/SAMI1200_yhql6r.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1772126760/SAMI1200_yhql6r.mp4'],
            18000.00,
            'A vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'SAMI 1200',
                'raca', 'Nelore Padrão',
                'nascimento', '15/09/2024',
                'pai', 'DURANGO FIV DA EAO', 
                'mae', '819 FIV DO SAMI', 
                'iabcz', '30,53',
                'mgte', '',
                'top', '',
                'status', 'Em Estoque',
                'breeder', 'Nelore Paulo',
                'pdf', '/SAMI1200.pdf',
                'comissao', '4%'
            )
        );
    END IF;
END $$;
