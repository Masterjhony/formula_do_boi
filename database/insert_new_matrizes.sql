-- Insert New Matrizes (ALANA, IMORALIDADE, METENA)
-- Owner: GSOL
-- Location: Jordânia-MG
-- Payment: A vista, 4% comissao

-- 1. ALANA (RGD: RCPN 8)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'ALANA') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770395899/RCPN8_qyk6if.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770395899/RCPN8_qyk6if.mp4'],
            price = 20000.00,
            installments = 'À Vista',
            forma_pagamento = 'a_vista',
            location = 'Jordânia-MG',
            details = jsonb_build_object(
                'registro', 'RCPN 8',
                'raca', 'Nelore Padrão',
                'nascimento', '29/11/2021',
                'pai', 'GAFAR TE DE NAVIRAI',
                'mae', 'MACTRA DA AC AGRO',
                'iabcz', '7.75',
                'mgte', '',
                'top', '',
                'status', 'Matriz',
                'breeder', 'GSOL',
                'comissao', '4%',
                'pdf', '/RCPN8.pdf'
            )
        WHERE name = 'ALANA';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'ALANA',
            'Matriz PO',
            'matriz',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Jordânia-MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770395899/RCPN8_qyk6if.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770395899/RCPN8_qyk6if.mp4'],
            20000.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'RCPN 8',
                'raca', 'Nelore Padrão',
                'nascimento', '29/11/2021',
                'pai', 'GAFAR TE DE NAVIRAI',
                'mae', 'MACTRA DA AC AGRO',
                'iabcz', '7.75',
                'mgte', '',
                'top', '',
                'status', 'Matriz',
                'breeder', 'GSOL',
                'comissao', '4%',
                'pdf', '/RCPN8.pdf'
            )
        );
    END IF;
END $$;

-- 2. IMORALIDADE DA AC AGRO (RGD: ACAC 5375)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'IMORALIDADE DA AC AGRO') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770395899/ACAC5375_hugy2i.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770395899/ACAC5375_hugy2i.mp4'],
            price = 20000.00,
            installments = 'À Vista',
            forma_pagamento = 'a_vista',
            location = 'Jordânia-MG',
            details = jsonb_build_object(
                'registro', 'ACAC 5375',
                'raca', 'Nelore Padrão',
                'nascimento', '20/11/2014',
                'pai', 'WASTO F J MATA VELHA',
                'mae', 'RIMA FIV DARAJ',
                'iabcz', '7.74',
                'mgte', '',
                'top', '',
                'status', 'Matriz',
                'breeder', 'GSOL',
                'comissao', '4%',
                'pdf', '/ACAC5375.pdf'
            )
        WHERE name = 'IMORALIDADE DA AC AGRO';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'IMORALIDADE DA AC AGRO',
            'Matriz PO',
            'matriz',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Jordânia-MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770395899/ACAC5375_hugy2i.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770395899/ACAC5375_hugy2i.mp4'],
            20000.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'ACAC 5375',
                'raca', 'Nelore Padrão',
                'nascimento', '20/11/2014',
                'pai', 'WASTO F J MATA VELHA',
                'mae', 'RIMA FIV DARAJ',
                'iabcz', '7.74',
                'mgte', '',
                'top', '',
                'status', 'Matriz',
                'breeder', 'GSOL',
                'comissao', '4%',
                'pdf', '/ACAC5375.pdf'
            )
        );
    END IF;
END $$;

-- 3. METENA DA AC AGRO (RGD: ACAC 8263)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'METENA DA AC AGRO') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770395898/ACAC8263_zrogcl.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770395898/ACAC8263_zrogcl.mp4'],
            price = 20000.00,
            installments = 'À Vista',
            forma_pagamento = 'a_vista',
            location = 'Jordânia-MG',
            details = jsonb_build_object(
                'registro', 'ACAC 8263',
                'raca', 'Nelore Padrão',
                'nascimento', '12/10/2017',
                'pai', '1872 DA ELGE',
                'mae', 'CARAPACA DA AC AGRO',
                'iabcz', '4.04',
                'mgte', '',
                'top', '',
                'status', 'Matriz',
                'breeder', 'GSOL',
                'comissao', '4%',
                'pdf', '/ACAC8263.pdf'
            )
        WHERE name = 'METENA DA AC AGRO';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'METENA DA AC AGRO',
            'Matriz PO',
            'matriz',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Jordânia-MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770395898/ACAC8263_zrogcl.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770395898/ACAC8263_zrogcl.mp4'],
            20000.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'ACAC 8263',
                'raca', 'Nelore Padrão',
                'nascimento', '12/10/2017',
                'pai', '1872 DA ELGE',
                'mae', 'CARAPACA DA AC AGRO',
                'iabcz', '4.04',
                'mgte', '',
                'top', '',
                'status', 'Matriz',
                'breeder', 'GSOL',
                'comissao', '4%',
                'pdf', '/ACAC8263.pdf'
            )
        );
    END IF;
END $$;
