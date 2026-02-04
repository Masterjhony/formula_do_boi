-- Insert or Update New Bulls (Feb 4, 2026) - FIXED PRICE FORMATTING
-- Data source: User provided videos, PDFs, and spreadsheet images.
-- Logic:
--   - 'installments' column must hold the VALUE string (e.g. '3.500,00') OR 'À Vista'.
--   - 'price' holds the total numeric value.
--   - 'forma_pagamento' holds the multiplied string for parsing (e.g. '10x').

-- 1. 385 FIV BEMACH (NBEM 385) - 30k A Vista
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = '385 FIV BEMACH') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226308/NBEM_385_m6wjdy.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226308/NBEM_385_m6wjdy.mp4'],
            price = 30000.00,
            installments = 'À Vista',
            forma_pagamento = 'a_vista',
            details = products.details || jsonb_build_object(
                'registro', 'NBEM 385',
                'raca', 'Nelore Padrão',
                'nascimento', '04/02/2024',
                'iabcz', '34.06',
                'mgte', '30.1',
                'top', 'Deca 1',
                'status', 'Touro',
                'breeder', 'GSOL',
                'pdf', '/NBEM 385.pdf'
            )
        WHERE name = '385 FIV BEMACH';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '385 FIV BEMACH',
            'Touro PO',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Jordânia-MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226308/NBEM_385_m6wjdy.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226308/NBEM_385_m6wjdy.mp4'],
            30000.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'NBEM 385',
                'raca', 'Nelore Padrão',
                'nascimento', '04/02/2024',
                'pai', '', 
                'mae', '', 
                'iabcz', '34.06',
                'mgte', '30.1',
                'top', 'Deca 1',
                'status', 'Touro',
                'breeder', 'GSOL',
                'pdf', '/NBEM 385.pdf'
            )
        );
    END IF;
END $$;


-- 2. L4365 SINO (SINO 4365) - 30k A Vista
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'L4365 SINO') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226314/SINO4365_fulo4l.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226314/SINO4365_fulo4l.mp4'],
            price = 30000.00,
            installments = 'À Vista',
            forma_pagamento = 'a_vista',
            details = products.details || jsonb_build_object(
                'registro', 'SINO 4365',
                'raca', 'Nelore Padrão',
                'nascimento', '24/09/2024',
                'pai', 'GOLDMAN MAT.', 
                'mae', 'JACUNDA SINO', 
                'iabcz', '38.94',
                'mgte', '30.27',
                'top', 'Deca 1',
                'status', 'Touro',
                'breeder', 'GSOL',
                'pdf', '/SINO4365.pdf'
            )
        WHERE name = 'L4365 SINO';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'L4365 SINO',
            'Touro PO',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Jordânia-MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226314/SINO4365_fulo4l.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226314/SINO4365_fulo4l.mp4'],
            30000.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'SINO 4365',
                'raca', 'Nelore Padrão',
                'nascimento', '24/09/2024',
                'pai', 'GOLDMAN MAT.', 
                'mae', 'JACUNDA SINO', 
                'iabcz', '38.94',
                'mgte', '30.27',
                'top', 'Deca 1',
                'status', 'Touro',
                'breeder', 'GSOL',
                'pdf', '/SINO4365.pdf'
            )
        );
    END IF;
END $$;


-- 3. 3853 FIV DA MARCONDES (MMAR 3853) - 30k A Vista
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = '3853 FIV DA MARCONDES') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226308/MMAR_3853_t1g79m.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226308/MMAR_3853_t1g79m.mp4'],
            price = 30000.00,
            installments = 'À Vista',
            forma_pagamento = 'a_vista',
            details = products.details || jsonb_build_object(
                'registro', 'MMAR 3853',
                'raca', 'Nelore Padrão',
                'nascimento', '05/09/2023',
                'pai', 'REM JACARANDA GENETICA A', 
                'mae', '3015 FIV DA MARCONDES', 
                'iabcz', '36.77',
                'mgte', '26.46',
                'top', 'Deca 1',
                'status', 'Touro',
                'breeder', 'GSOL',
                'pdf', '/MMAR 3853.pdf'
            )
        WHERE name = '3853 FIV DA MARCONDES';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '3853 FIV DA MARCONDES',
            'Touro PO',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Jordânia-MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226308/MMAR_3853_t1g79m.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226308/MMAR_3853_t1g79m.mp4'],
            30000.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'MMAR 3853',
                'raca', 'Nelore Padrão',
                'nascimento', '05/09/2023',
                'pai', 'REM JACARANDA GENETICA A', 
                'mae', '3015 FIV DA MARCONDES', 
                'iabcz', '36.77',
                'mgte', '26.46',
                'top', 'Deca 1',
                'status', 'Touro',
                'breeder', 'GSOL',
                'pdf', '/MMAR 3853.pdf'
            )
        );
    END IF;
END $$;


-- 4. 14785 FIV AMBAR AMARAL (SOAL 14785) - 35k 10x
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = '14785 FIV AMBAR AMARAL') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226314/SOAL_14785_zoaigv.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226314/SOAL_14785_zoaigv.mp4'],
            price = 35000.00,
            installments = '3.500,00',
            forma_pagamento = '10x',
            details = products.details || jsonb_build_object(
                'registro', 'SOAL 14785',
                'raca', 'Nelore Padrão',
                'nascimento', '26/10/2024',
                'pai', 'FLOC 517 FIV', 
                'mae', '5837 FIV DA 3A', 
                'iabcz', '38.15',
                'mgte', '31.78',
                'top', 'Deca 1',
                'status', 'Matriz',
                'breeder', 'GSOL',
                'pdf', '/SOAL 14785.pdf'
            )
        WHERE name = '14785 FIV AMBAR AMARAL';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '14785 FIV AMBAR AMARAL',
            'Matriz PO',
            'matriz',
            'venda_direta',
            'retira_fazenda',
            '10x',
            'Jordânia-MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226314/SOAL_14785_zoaigv.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226314/SOAL_14785_zoaigv.mp4'],
            35000.00,
            '3.500,00',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'SOAL 14785',
                'raca', 'Nelore Padrão',
                'nascimento', '26/10/2024',
                'pai', 'FLOC 517 FIV', 
                'mae', '5837 FIV DA 3A', 
                'iabcz', '38.15',
                'mgte', '31.78',
                'top', 'Deca 1',
                'status', 'Matriz',
                'breeder', 'GSOL',
                'pdf', '/SOAL 14785.pdf'
            )
        );
    END IF;
END $$;


-- 5. 13550 FIV AMBAR AMARAL (SOAL 13550) - 35k 10x
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = '13550 FIV AMBAR AMARAL') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226314/SOAL_13550_zufjsb.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226314/SOAL_13550_zufjsb.mp4'],
            price = 35000.00,
            installments = '3.500,00',
            forma_pagamento = '10x',
            details = products.details || jsonb_build_object(
                'registro', 'SOAL 13550',
                'raca', 'Nelore Padrão',
                'nascimento', '03/08/2024',
                'pai', '10432 DO IF', 
                'mae', 'ETAPA FIV AMBAR AMARAL', 
                'iabcz', '35.77',
                'mgte', '27.43',
                'top', 'Deca 1',
                'status', 'Matriz',
                'breeder', 'GSOL',
                'pdf', '/SOAL13550.pdf'
            )
        WHERE name = '13550 FIV AMBAR AMARAL';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '13550 FIV AMBAR AMARAL',
            'Matriz PO',
            'matriz',
            'venda_direta',
            'retira_fazenda',
            '10x',
            'Jordânia-MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226314/SOAL_13550_zufjsb.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226314/SOAL_13550_zufjsb.mp4'],
            35000.00,
            '3.500,00',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'SOAL 13550',
                'raca', 'Nelore Padrão',
                'nascimento', '03/08/2024',
                'pai', '10432 DO IF', 
                'mae', 'ETAPA FIV AMBAR AMARAL', 
                'iabcz', '35.77',
                'mgte', '27.43',
                'top', 'Deca 1',
                'status', 'Matriz',
                'breeder', 'GSOL',
                'pdf', '/SOAL13550.pdf'
            )
        );
    END IF;
END $$;


-- 6. 13851 FIV AMBAR AMARAL (SOAL 13851) - 35k 10x
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = '13851 FIV AMBAR AMARAL') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226312/SOAL_13851_ermzzx.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226312/SOAL_13851_ermzzx.mp4'],
            price = 35000.00,
            installments = '3.500,00',
            forma_pagamento = '10x',
            details = products.details || jsonb_build_object(
                'registro', 'SOAL 13851',
                'raca', 'Nelore Padrão',
                'nascimento', '24/08/2024',
                'pai', 'B8305 DA EAO', 
                'mae', '7585 FIV DA 3A', 
                'iabcz', '36.68',
                'mgte', '28.4',
                'top', 'Deca 1',
                'status', 'Matriz',
                'breeder', 'GSOL',
                'pdf', '/SOAL 13851.pdf'
            )
        WHERE name = '13851 FIV AMBAR AMARAL';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '13851 FIV AMBAR AMARAL',
            'Matriz PO',
            'matriz',
            'venda_direta',
            'retira_fazenda',
            '10x',
            'Jordânia-MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226312/SOAL_13851_ermzzx.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226312/SOAL_13851_ermzzx.mp4'],
            35000.00,
            '3.500,00',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'SOAL 13851',
                'raca', 'Nelore Padrão',
                'nascimento', '24/08/2024',
                'pai', 'B8305 DA EAO', 
                'mae', '7585 FIV DA 3A', 
                'iabcz', '36.68',
                'mgte', '28.4',
                'top', 'Deca 1',
                'status', 'Matriz',
                'breeder', 'GSOL',
                'pdf', '/SOAL 13851.pdf'
            )
        );
    END IF;
END $$;


-- 7. ESTIMAR FIV FVC (FVCP 3834) - 50k 10x
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'ESTIMAR FIV FVC') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226307/FVCP_3834_iyjite.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226307/FVCP_3834_iyjite.mp4'],
            price = 50000.00,
            installments = '5.000,00',
            forma_pagamento = '10x',
            details = products.details || jsonb_build_object(
                'registro', 'FVCP 3834',
                'raca', 'Nelore Padrão',
                'nascimento', '10/11/2023',
                'pai', 'REM HORUS GENETICA ADITIVA', 
                'mae', 'TUCA FIV FVC', 
                'iabcz', '36.05',
                'mgte', '30.73',
                'top', 'Deca 1',
                'status', 'Matriz',
                'breeder', 'GSOL',
                'pdf', '/FVCP 3834.pdf'
            )
        WHERE name = 'ESTIMAR FIV FVC';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'ESTIMAR FIV FVC',
            'Matriz PO',
            'matriz',
            'venda_direta',
            'retira_fazenda',
            '10x',
            'Jordânia-MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226307/FVCP_3834_iyjite.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226307/FVCP_3834_iyjite.mp4'],
            50000.00,
            '5.000,00',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'FVCP 3834',
                'raca', 'Nelore Padrão',
                'nascimento', '10/11/2023',
                'pai', 'REM HORUS GENETICA ADITIVA', 
                'mae', 'TUCA FIV FVC', 
                'iabcz', '36.05',
                'mgte', '30.73',
                'top', 'Deca 1',
                'status', 'Matriz',
                'breeder', 'GSOL',
                'pdf', '/FVCP 3834.pdf'
            )
        );
    END IF;
END $$;


-- 8. AG (GSOL 382) - 20k A Vista
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'AG') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226306/GSOL382_xih0sz.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226306/GSOL382_xih0sz.mp4'],
            price = 20000.00,
            installments = 'À Vista',
            forma_pagamento = 'a_vista',
            details = products.details || jsonb_build_object(
                'registro', 'GSOL 382',
                'raca', 'Nelore Padrão',
                'nascimento', '01/05/2020',
                'pai', 'REM BULLDOG', 
                'mae', 'MASSIA DA AC AGRO', 
                'iabcz', '18.01',
                'mgte', '',
                'top', 'Deca 1',
                'status', 'Matriz',
                'breeder', 'GSOL',
                'pdf', '/GSOL382.pdf'
            )
        WHERE name = 'AG';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'AG',
            'Matriz PO',
            'matriz',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Jordânia-MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226306/GSOL382_xih0sz.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226306/GSOL382_xih0sz.mp4'],
            20000.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'GSOL 382',
                'raca', 'Nelore Padrão',
                'nascimento', '01/05/2020',
                'pai', 'REM BULLDOG', 
                'mae', 'MASSIA DA AC AGRO', 
                'iabcz', '18.01',
                'mgte', '',
                'top', 'Deca 1',
                'status', 'Matriz',
                'breeder', 'GSOL',
                'pdf', '/GSOL382.pdf'
            )
        );
    END IF;
END $$;


-- 9. MESURA DA AC AGRO (ACAC 8298) - 20k A Vista
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'MESURA DA AC AGRO') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226306/ACAC8298_wcmdyb.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226306/ACAC8298_wcmdyb.mp4'],
            price = 20000.00,
            installments = 'À Vista',
            forma_pagamento = 'a_vista',
            details = products.details || jsonb_build_object(
                'registro', 'ACAC 8298',
                'raca', 'Nelore Padrão',
                'nascimento', '17/10/2017',
                'pai', 'BIBLIOGRAFO DA AC AGRO', 
                'mae', 'HUMANISTA DA AC AGRO', 
                'iabcz', '4.94',
                'mgte', '',
                'top', '',
                'status', 'Matriz',
                'breeder', 'GSOL',
                'pdf', '/ACAC 8298.pdf'
            )
        WHERE name = 'MESURA DA AC AGRO';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'MESURA DA AC AGRO',
            'Matriz PO',
            'matriz',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Jordânia-MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226306/ACAC8298_wcmdyb.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226306/ACAC8298_wcmdyb.mp4'],
            20000.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'ACAC 8298',
                'raca', 'Nelore Padrão',
                'nascimento', '17/10/2017',
                'pai', 'BIBLIOGRAFO DA AC AGRO', 
                'mae', 'HUMANISTA DA AC AGRO', 
                'iabcz', '4.94',
                'mgte', '',
                'top', '',
                'status', 'Matriz',
                'breeder', 'GSOL',
                'pdf', '/ACAC 8298.pdf'
            )
        );
    END IF;
END $$;


-- 10. MACAIBA DA AC AGRO (ACAC 8096) - 20k A Vista
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'MACAIBA DA AC AGRO') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226306/ACAC8096_op3abx.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226306/ACAC8096_op3abx.mp4'],
            price = 20000.00,
            installments = 'À Vista',
            forma_pagamento = 'a_vista',
            details = products.details || jsonb_build_object(
                'registro', 'ACAC 8096',
                'raca', 'Nelore Padrão',
                'nascimento', '22/09/2017',
                'pai', 'HOATCHI LEMGRUBER', 
                'mae', 'COLOMBINA DA AC AGRO', 
                'iabcz', '7.12',
                'mgte', '',
                'top', '',
                'status', 'Matriz',
                'breeder', 'GSOL',
                'pdf', '/ACAC 8096.pdf'
            )
        WHERE name = 'MACAIBA DA AC AGRO';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'MACAIBA DA AC AGRO',
            'Matriz PO',
            'matriz',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Jordânia-MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226306/ACAC8096_op3abx.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226306/ACAC8096_op3abx.mp4'],
            20000.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'ACAC 8096',
                'raca', 'Nelore Padrão',
                'nascimento', '22/09/2017',
                'pai', 'HOATCHI LEMGRUBER', 
                'mae', 'COLOMBINA DA AC AGRO', 
                'iabcz', '7.12',
                'mgte', '',
                'top', '',
                'status', 'Matriz',
                'breeder', 'GSOL',
                'pdf', '/ACAC 8096.pdf'
            )
        );
    END IF;
END $$;


-- 11. HUMANITARIO DA AC AGRO (ACAC 5148) - Undefined Price
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'HUMANITARIO DA AC AGRO') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226306/ACAC5148_hmnlpj.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226306/ACAC5148_hmnlpj.mp4'],
            price = 0.0,
            installments = 'Sob Consulta',
            forma_pagamento = 'Sob Consulta',
            details = products.details || jsonb_build_object(
                'registro', 'ACAC 5148',
                'raca', 'Nelore Padrão',
                'nascimento', '13/10/2014',
                'pai', 'CASTICAL DA AC AGRO', 
                'mae', 'ALANA DA NP', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Matriz',
                'breeder', 'GSOL',
                'pdf', NULL
            )
        WHERE name = 'HUMANITARIO DA AC AGRO';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'HUMANITARIO DA AC AGRO',
            'Matriz PO',
            'matriz',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Jordânia-MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226306/ACAC5148_hmnlpj.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770226306/ACAC5148_hmnlpj.mp4'],
            0.0,
            'Sob Consulta',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'ACAC 5148',
                'raca', 'Nelore Padrão',
                'nascimento', '13/10/2014',
                'pai', 'CASTICAL DA AC AGRO', 
                'mae', 'ALANA DA NP', 
                'iabcz', '',
                'mgte', '',
                'top', '',
                'status', 'Matriz',
                'breeder', 'GSOL',
                'pdf', NULL
            )
        );
    END IF;
END $$;
