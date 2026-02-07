-- Insert Owner: Fazenda Limeira
INSERT INTO public.breeders (name)
SELECT 'Fazenda Limeira'
WHERE NOT EXISTS (
    SELECT 1 FROM public.breeders WHERE name = 'Fazenda Limeira'
);

-- Insert LIME BRYAN
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'LIME BRYAN') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770503017/LMRZ_100_gcdsca.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770503017/LMRZ_100_gcdsca.mp4'],
            price = 15000.00,
            installments = 'À Vista',
            forma_pagamento = 'a_vista',
            location = 'Juatuba-MG',
            details = jsonb_build_object(
                'registro', 'LMRZ 100',
                'raca', 'Nelore Padrão',
                'nascimento', '30/12/2023',
                'pai', 'ESTORIL MAT',
                'mae', '5565 DA TERRA BRAVA',
                'iabcz', '23.3',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Touro',
                'breeder', 'Fazenda Limeira',
                'proprietario', 'Fazenda Limeira',
                'comissao', '4%',
                'pdf', '/LMRZ100.pdf'
            )
        WHERE name = 'LIME BRYAN';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'LIME BRYAN',
            'Touro PO',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Juatuba-MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770503017/LMRZ_100_gcdsca.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770503017/LMRZ_100_gcdsca.mp4'],
            15000.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'LMRZ 100',
                'raca', 'Nelore Padrão',
                'nascimento', '30/12/2023',
                'pai', 'ESTORIL MAT',
                'mae', '5565 DA TERRA BRAVA',
                'iabcz', '23.3',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Touro',
                'breeder', 'Fazenda Limeira',
                'proprietario', 'Fazenda Limeira',
                'comissao', '4%',
                'pdf', '/LMRZ100.pdf'
            )
        );
    END IF;
END $$;

-- Insert LIME BASCO
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'LIME BASCO') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770503018/LMRZ_94_m7l9yj.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770503018/LMRZ_94_m7l9yj.mp4'],
            price = 15000.00,
            installments = 'À Vista',
            forma_pagamento = 'a_vista',
            location = 'Juatuba-MG',
            details = jsonb_build_object(
                'registro', 'LMRZ 94',
                'raca', 'Nelore Padrão',
                'nascimento', '13/12/2023',
                'pai', 'OPERARIO COL',
                'mae', 'TARUGA COL',
                'iabcz', '22.98',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Touro',
                'breeder', 'Fazenda Limeira',
                'proprietario', 'Fazenda Limeira',
                'comissao', '4%',
                'pdf', '/LMRZ94.pdf'
            )
        WHERE name = 'LIME BASCO';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            'LIME BASCO',
            'Touro PO',
            'touro',
            'venda_direta',
            'retira_fazenda',
            'a_vista',
            'Juatuba-MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770503018/LMRZ_94_m7l9yj.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770503018/LMRZ_94_m7l9yj.mp4'],
            15000.00,
            'À Vista',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'LMRZ 94',
                'raca', 'Nelore Padrão',
                'nascimento', '13/12/2023',
                'pai', 'OPERARIO COL',
                'mae', 'TARUGA COL',
                'iabcz', '22.98',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Touro',
                'breeder', 'Fazenda Limeira',
                'proprietario', 'Fazenda Limeira',
                'comissao', '4%',
                'pdf', '/LMRZ94.pdf'
            )
        );
    END IF;
END $$;
