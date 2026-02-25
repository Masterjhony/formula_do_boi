-- Insert New Matriz AMBAR AMARAL
-- 1. 14004 FIV AMBAR AMARAL (RGD: SOAL 14004)

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.products WHERE name = '14004 FIV AMBAR AMARAL') THEN
        UPDATE public.products SET
            image_url = 'https://res.cloudinary.com/dkh2nsugb/video/upload/v1772040701/SOAL14004_yn3bts.mp4',
            gallery = ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1772040701/SOAL14004_yn3bts.mp4'],
            price = 22500.00,
            installments = '15X',
            forma_pagamento = 'parcelado',
            location = 'Comendador Gomes MG',
            details = jsonb_build_object(
                'registro', 'SOAL 14004',
                'raca', 'Nelore Padrão',
                'nascimento', '31/08/2024',
                'pai', 'TREM BALA FIV DA EAO',
                'mae', '10183 AMBAR AMARAL',
                'iabcz', '36,28',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Matriz',
                'breeder', 'Nelore da Nata',
                'proprietario', 'Nelore da Nata',
                'comissao', '4%',
                'pdf', '/SOAL14004.pdf'
            )
        WHERE name = '14004 FIV AMBAR AMARAL';
    ELSE
        INSERT INTO public.products (
            name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
        ) VALUES (
            '14004 FIV AMBAR AMARAL',
            'Matriz PO',
            'matriz',
            'venda_direta',
            'retira_fazenda',
            'parcelado',
            'Comendador Gomes MG',
            'https://res.cloudinary.com/dkh2nsugb/video/upload/v1772040701/SOAL14004_yn3bts.mp4',
            ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1772040701/SOAL14004_yn3bts.mp4'],
            22500.00,
            '15X',
            'Em Estoque',
            jsonb_build_object(
                'registro', 'SOAL 14004',
                'raca', 'Nelore Padrão',
                'nascimento', '31/08/2024',
                'pai', 'TREM BALA FIV DA EAO',
                'mae', '10183 AMBAR AMARAL',
                'iabcz', '36,28',
                'mgte', '',
                'iqg', '',
                'top', '',
                'status', 'Matriz',
                'breeder', 'Nelore da Nata',
                'proprietario', 'Nelore da Nata',
                'comissao', '4%',
                'pdf', '/SOAL14004.pdf'
            )
        );
    END IF;
END $$;
