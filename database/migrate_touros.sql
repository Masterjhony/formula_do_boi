-- Migration to add new Bulls (Touros)
-- Owner: GSOL
-- Generated automatically from extracted PDF data

INSERT INTO public.products (
    id, name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
) OVERRIDING SYSTEM VALUE VALUES (
    200,
    'PERFEICAO',
    'Touro PO',
    'touro',
    'venda_direta',
    'retira_fazenda',
    'a_vista',
    'Jordania - MG',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796975/GSOL1442_esri7e.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796975/GSOL1442_esri7e.mp4'],
    12000,
    'À Vista',
    'NOVO',
    '{"registro":"GSOL1442","raca":"Nelore","nascimento":"20/07/2023","pai":"Sob Consulta","mae":"Sob Consulta","peso":"Sob Consulta","iabcz":"Sob Consulta","mgte":"Sob Consulta","status":"Touro","tipo":"Touro","comentario":"Touro PERFEICAO - GSOL","pdf":"/GSOL1442.pdf","proprietario":"GSOL","criador":"GSOL"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    installments = EXCLUDED.installments,
    location = EXCLUDED.location,
    forma_pagamento = EXCLUDED.forma_pagamento;

INSERT INTO public.products (
    id, name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
) OVERRIDING SYSTEM VALUE VALUES (
    201,
    '1443',
    'Touro PO',
    'touro',
    'venda_direta',
    'retira_fazenda',
    'a_vista',
    'Jordania - MG',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796976/GSOL1443_fwwjhg.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796976/GSOL1443_fwwjhg.mp4'],
    12000,
    'À Vista',
    'NOVO',
    '{"registro":"GSOL1443","raca":"Nelore","nascimento":"24/07/2023","pai":"Sob Consulta","mae":"Sob Consulta","peso":"Sob Consulta","iabcz":"Sob Consulta","mgte":"Sob Consulta","status":"Touro","tipo":"Touro","comentario":"Touro 1443 - GSOL","pdf":"/GSOL1443.pdf","proprietario":"GSOL","criador":"GSOL"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    installments = EXCLUDED.installments,
    location = EXCLUDED.location,
    forma_pagamento = EXCLUDED.forma_pagamento;

INSERT INTO public.products (
    id, name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
) OVERRIDING SYSTEM VALUE VALUES (
    202,
    'CIMENTO',
    'Touro PO',
    'touro',
    'venda_direta',
    'retira_fazenda',
    'a_vista',
    'Jordania - MG',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796978/GSOL1449_jqyq1s.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796978/GSOL1449_jqyq1s.mp4'],
    12000,
    'À Vista',
    'NOVO',
    '{"registro":"GSOL1449","raca":"Nelore","nascimento":"24/07/2023","pai":"Sob Consulta","mae":"Sob Consulta","peso":"Sob Consulta","iabcz":"Sob Consulta","mgte":"Sob Consulta","status":"Touro","tipo":"Touro","comentario":"Touro CIMENTO - GSOL","pdf":"/GSOL1449.pdf","proprietario":"GSOL","criador":"GSOL"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    installments = EXCLUDED.installments,
    location = EXCLUDED.location,
    forma_pagamento = EXCLUDED.forma_pagamento;

INSERT INTO public.products (
    id, name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
) OVERRIDING SYSTEM VALUE VALUES (
    203,
    'GENETICA',
    'Touro PO',
    'touro',
    'venda_direta',
    'retira_fazenda',
    'a_vista',
    'Jordania - MG',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796980/GSOL1485_wly0pa.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796980/GSOL1485_wly0pa.mp4'],
    12000,
    'À Vista',
    'NOVO',
    '{"registro":"GSOL1485","raca":"Nelore","nascimento":"03/08/2023","pai":"Sob Consulta","mae":"Sob Consulta","peso":"Sob Consulta","iabcz":"Sob Consulta","mgte":"Sob Consulta","status":"Touro","tipo":"Touro","comentario":"Touro GENETICA - GSOL","pdf":"/GSOL1485.pdf","proprietario":"GSOL","criador":"GSOL"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    installments = EXCLUDED.installments,
    location = EXCLUDED.location,
    forma_pagamento = EXCLUDED.forma_pagamento;

INSERT INTO public.products (
    id, name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
) OVERRIDING SYSTEM VALUE VALUES (
    204,
    'JACARANDA',
    'Touro PO',
    'touro',
    'venda_direta',
    'retira_fazenda',
    'a_vista',
    'Jordania - MG',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796977/GSOL1499_txpcf5.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796977/GSOL1499_txpcf5.mp4'],
    12000,
    'À Vista',
    'NOVO',
    '{"registro":"GSOL1499","raca":"Nelore","nascimento":"04/08/2023","pai":"Sob Consulta","mae":"Sob Consulta","peso":"Sob Consulta","iabcz":"Sob Consulta","mgte":"Sob Consulta","status":"Touro","tipo":"Touro","comentario":"Touro JACARANDA - GSOL","pdf":"/GSOL1499.pdf","proprietario":"GSOL","criador":"GSOL"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    installments = EXCLUDED.installments,
    location = EXCLUDED.location,
    forma_pagamento = EXCLUDED.forma_pagamento;

INSERT INTO public.products (
    id, name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
) OVERRIDING SYSTEM VALUE VALUES (
    205,
    'GARFIELD',
    'Touro PO',
    'touro',
    'venda_direta',
    'retira_fazenda',
    'a_vista',
    'Jordania - MG',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796978/GSOL1506_rixc90.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796978/GSOL1506_rixc90.mp4'],
    12000,
    'À Vista',
    'NOVO',
    '{"registro":"GSOL1506","raca":"Nelore","nascimento":"04/08/2023","pai":"Sob Consulta","mae":"Sob Consulta","peso":"Sob Consulta","iabcz":"Sob Consulta","mgte":"Sob Consulta","status":"Touro","tipo":"Touro","comentario":"Touro GARFIELD - GSOL","pdf":"/GSOL1506.pdf","proprietario":"GSOL","criador":"GSOL"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    installments = EXCLUDED.installments,
    location = EXCLUDED.location,
    forma_pagamento = EXCLUDED.forma_pagamento;

INSERT INTO public.products (
    id, name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
) OVERRIDING SYSTEM VALUE VALUES (
    206,
    'PONTO',
    'Touro PO',
    'touro',
    'venda_direta',
    'retira_fazenda',
    'a_vista',
    'Jordania - MG',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796980/GSOL1563_glu6dk.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796980/GSOL1563_glu6dk.mp4'],
    12000,
    'À Vista',
    'NOVO',
    '{"registro":"GSOL1563","raca":"Nelore","nascimento":"14/09/2023","pai":"Sob Consulta","mae":"Sob Consulta","peso":"Sob Consulta","iabcz":"Sob Consulta","mgte":"Sob Consulta","status":"Touro","tipo":"Touro","comentario":"Touro PONTO - GSOL","pdf":"/GSOL1563.pdf","proprietario":"GSOL","criador":"GSOL"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    installments = EXCLUDED.installments,
    location = EXCLUDED.location,
    forma_pagamento = EXCLUDED.forma_pagamento;

INSERT INTO public.products (
    id, name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
) OVERRIDING SYSTEM VALUE VALUES (
    207,
    'UNICO',
    'Touro PO',
    'touro',
    'venda_direta',
    'retira_fazenda',
    'a_vista',
    'Jordania - MG',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796980/GSOL1566_utzvxc.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796980/GSOL1566_utzvxc.mp4'],
    12000,
    'À Vista',
    'NOVO',
    '{"registro":"GSOL1566","raca":"Nelore","nascimento":"14/09/2023","pai":"Sob Consulta","mae":"Sob Consulta","peso":"Sob Consulta","iabcz":"Sob Consulta","mgte":"Sob Consulta","status":"Touro","tipo":"Touro","comentario":"Touro UNICO - GSOL","pdf":"/GSOL1566.pdf","proprietario":"GSOL","criador":"GSOL"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    installments = EXCLUDED.installments,
    location = EXCLUDED.location,
    forma_pagamento = EXCLUDED.forma_pagamento;

INSERT INTO public.products (
    id, name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
) OVERRIDING SYSTEM VALUE VALUES (
    208,
    'URI',
    'Touro PO',
    'touro',
    'venda_direta',
    'retira_fazenda',
    'a_vista',
    'Jordania - MG',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796980/GSOL1571_gvdzig.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796980/GSOL1571_gvdzig.mp4'],
    12000,
    'À Vista',
    'NOVO',
    '{"registro":"GSOL1571","raca":"Nelore","nascimento":"28/09/2023","pai":"Sob Consulta","mae":"Sob Consulta","peso":"Sob Consulta","iabcz":"Sob Consulta","mgte":"Sob Consulta","status":"Touro","tipo":"Touro","comentario":"Touro URI - GSOL","pdf":"/GSOL1571.pdf","proprietario":"GSOL","criador":"GSOL"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    installments = EXCLUDED.installments,
    location = EXCLUDED.location,
    forma_pagamento = EXCLUDED.forma_pagamento;

INSERT INTO public.products (
    id, name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
) OVERRIDING SYSTEM VALUE VALUES (
    209,
    'LEGENDARIO',
    'Touro PO',
    'touro',
    'venda_direta',
    'retira_fazenda',
    'a_vista',
    'Jordania - MG',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796980/GSOL1592_n9wk0l.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796980/GSOL1592_n9wk0l.mp4'],
    12000,
    'À Vista',
    'NOVO',
    '{"registro":"GSOL1592","raca":"Nelore","nascimento":"18/10/2023","pai":"Sob Consulta","mae":"Sob Consulta","peso":"Sob Consulta","iabcz":"Sob Consulta","mgte":"Sob Consulta","status":"Touro","tipo":"Touro","comentario":"Touro LEGENDARIO - GSOL","pdf":"/GSOL1592.pdf","proprietario":"GSOL","criador":"GSOL"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    installments = EXCLUDED.installments,
    location = EXCLUDED.location,
    forma_pagamento = EXCLUDED.forma_pagamento;

INSERT INTO public.products (
    id, name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
) OVERRIDING SYSTEM VALUE VALUES (
    210,
    'TSUNAMI',
    'Touro PO',
    'touro',
    'venda_direta',
    'retira_fazenda',
    'a_vista',
    'Jordania - MG',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796983/GSOL1593_icswoj.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796983/GSOL1593_icswoj.mp4'],
    12000,
    'À Vista',
    'NOVO',
    '{"registro":"GSOL1593","raca":"Nelore","nascimento":"18/10/2023","pai":"Sob Consulta","mae":"Sob Consulta","peso":"Sob Consulta","iabcz":"Sob Consulta","mgte":"Sob Consulta","status":"Touro","tipo":"Touro","comentario":"Touro TSUNAMI - GSOL","pdf":"/GSOL1593.pdf","proprietario":"GSOL","criador":"GSOL"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    installments = EXCLUDED.installments,
    location = EXCLUDED.location,
    forma_pagamento = EXCLUDED.forma_pagamento;

INSERT INTO public.products (
    id, name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
) OVERRIDING SYSTEM VALUE VALUES (
    211,
    'CORROSIVO',
    'Touro PO',
    'touro',
    'venda_direta',
    'retira_fazenda',
    'a_vista',
    'Jordania - MG',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796983/GSOL1595_fdrurs.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796983/GSOL1595_fdrurs.mp4'],
    12000,
    'À Vista',
    'NOVO',
    '{"registro":"GSOL1595","raca":"Nelore","nascimento":"18/10/2023","pai":"Sob Consulta","mae":"Sob Consulta","peso":"Sob Consulta","iabcz":"Sob Consulta","mgte":"Sob Consulta","status":"Touro","tipo":"Touro","comentario":"Touro CORROSIVO - GSOL","pdf":"/GSOL1595.pdf","proprietario":"GSOL","criador":"GSOL"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    installments = EXCLUDED.installments,
    location = EXCLUDED.location,
    forma_pagamento = EXCLUDED.forma_pagamento;

INSERT INTO public.products (
    id, name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
) OVERRIDING SYSTEM VALUE VALUES (
    212,
    'ALCAPONE',
    'Touro PO',
    'touro',
    'venda_direta',
    'retira_fazenda',
    'a_vista',
    'Jordania - MG',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796986/GSOL1599_h5lmwp.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796986/GSOL1599_h5lmwp.mp4'],
    12000,
    'À Vista',
    'NOVO',
    '{"registro":"GSOL1599","raca":"Nelore","nascimento":"18/10/2023","pai":"Sob Consulta","mae":"Sob Consulta","peso":"Sob Consulta","iabcz":"Sob Consulta","mgte":"Sob Consulta","status":"Touro","tipo":"Touro","comentario":"Touro ALCAPONE - GSOL","pdf":"/GSOL1599.pdf","proprietario":"GSOL","criador":"GSOL"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    installments = EXCLUDED.installments,
    location = EXCLUDED.location,
    forma_pagamento = EXCLUDED.forma_pagamento;

INSERT INTO public.products (
    id, name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
) OVERRIDING SYSTEM VALUE VALUES (
    213,
    'CELULAR',
    'Touro PO',
    'touro',
    'venda_direta',
    'retira_fazenda',
    'a_vista',
    'Jordania - MG',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796984/GSOL1604_xcux6x.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796984/GSOL1604_xcux6x.mp4'],
    12000,
    'À Vista',
    'NOVO',
    '{"registro":"GSOL1604","raca":"Nelore","nascimento":"25/10/2023","pai":"Sob Consulta","mae":"Sob Consulta","peso":"Sob Consulta","iabcz":"Sob Consulta","mgte":"Sob Consulta","status":"Touro","tipo":"Touro","comentario":"Touro CELULAR - GSOL","pdf":"/GSOL1604.pdf","proprietario":"GSOL","criador":"GSOL"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    installments = EXCLUDED.installments,
    location = EXCLUDED.location,
    forma_pagamento = EXCLUDED.forma_pagamento;

INSERT INTO public.products (
    id, name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
) OVERRIDING SYSTEM VALUE VALUES (
    214,
    'CORINTHIAS',
    'Touro PO',
    'touro',
    'venda_direta',
    'retira_fazenda',
    'a_vista',
    'Jordania - MG',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796986/GSOL1610_iohsvl.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796986/GSOL1610_iohsvl.mp4'],
    12000,
    'À Vista',
    'NOVO',
    '{"registro":"GSOL1610","raca":"Nelore","nascimento":"25/10/2023","pai":"Sob Consulta","mae":"Sob Consulta","peso":"Sob Consulta","iabcz":"Sob Consulta","mgte":"Sob Consulta","status":"Touro","tipo":"Touro","comentario":"Touro CORINTHIAS - GSOL","pdf":"/GSOL1610.pdf","proprietario":"GSOL","criador":"GSOL"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    installments = EXCLUDED.installments,
    location = EXCLUDED.location,
    forma_pagamento = EXCLUDED.forma_pagamento;

INSERT INTO public.products (
    id, name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
) OVERRIDING SYSTEM VALUE VALUES (
    215,
    'GUTO DA NAJ',
    'Touro PO',
    'touro',
    'venda_direta',
    'retira_fazenda',
    'a_vista',
    'Jordania - MG',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796992/NAJ0062_ctat4b.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796992/NAJ0062_ctat4b.mp4'],
    12000,
    'À Vista',
    'NOVO',
    '{"registro":"NAJ0062","raca":"Nelore","nascimento":"20/12/2023","pai":"Sob Consulta","mae":"Sob Consulta","peso":"Sob Consulta","iabcz":"Sob Consulta","mgte":"Sob Consulta","status":"Touro","tipo":"Touro","comentario":"Touro GUTO DA NAJ - GSOL","pdf":"/NAJ0062.pdf","proprietario":"GSOL","criador":"GSOL"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    installments = EXCLUDED.installments,
    location = EXCLUDED.location,
    forma_pagamento = EXCLUDED.forma_pagamento;

INSERT INTO public.products (
    id, name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
) OVERRIDING SYSTEM VALUE VALUES (
    216,
    'LUCIO DA NAJ',
    'Touro PO',
    'touro',
    'venda_direta',
    'retira_fazenda',
    'a_vista',
    'Jordania - MG',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796995/NAJ0071_er1ghq.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796995/NAJ0071_er1ghq.mp4'],
    12000,
    'À Vista',
    'NOVO',
    '{"registro":"NAJ0071","raca":"Nelore","nascimento":"20/12/2023","pai":"Sob Consulta","mae":"Sob Consulta","peso":"Sob Consulta","iabcz":"Sob Consulta","mgte":"Sob Consulta","status":"Touro","tipo":"Touro","comentario":"Touro LUCIO DA NAJ - GSOL","pdf":"/NAJ0071.pdf","proprietario":"GSOL","criador":"GSOL"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    installments = EXCLUDED.installments,
    location = EXCLUDED.location,
    forma_pagamento = EXCLUDED.forma_pagamento;

INSERT INTO public.products (
    id, name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
) OVERRIDING SYSTEM VALUE VALUES (
    217,
    'GOEL DA NAJ',
    'Touro PO',
    'touro',
    'venda_direta',
    'retira_fazenda',
    'a_vista',
    'Jordania - MG',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769797000/NAJ0078_idonsj.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769797000/NAJ0078_idonsj.mp4'],
    12000,
    'À Vista',
    'NOVO',
    '{"registro":"NAJ0078","raca":"Nelore","nascimento":"20/12/2023","pai":"Sob Consulta","mae":"Sob Consulta","peso":"Sob Consulta","iabcz":"Sob Consulta","mgte":"Sob Consulta","status":"Touro","tipo":"Touro","comentario":"Touro GOEL DA NAJ - GSOL","pdf":"/NAJ0078.pdf","proprietario":"GSOL","criador":"GSOL"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    installments = EXCLUDED.installments,
    location = EXCLUDED.location,
    forma_pagamento = EXCLUDED.forma_pagamento;

INSERT INTO public.products (
    id, name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
) OVERRIDING SYSTEM VALUE VALUES (
    218,
    'RUTH DA NAJ',
    'Touro PO',
    'touro',
    'venda_direta',
    'retira_fazenda',
    'a_vista',
    'Jordania - MG',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796998/NAJ0079_vganrc.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796998/NAJ0079_vganrc.mp4'],
    12000,
    'À Vista',
    'NOVO',
    '{"registro":"NAJ0079","raca":"Nelore","nascimento":"20/12/2023","pai":"Sob Consulta","mae":"Sob Consulta","peso":"Sob Consulta","iabcz":"Sob Consulta","mgte":"Sob Consulta","status":"Touro","tipo":"Touro","comentario":"Touro RUTH DA NAJ - GSOL","pdf":"/NAJ0079.pdf","proprietario":"GSOL","criador":"GSOL"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    installments = EXCLUDED.installments,
    location = EXCLUDED.location,
    forma_pagamento = EXCLUDED.forma_pagamento;

INSERT INTO public.products (
    id, name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
) OVERRIDING SYSTEM VALUE VALUES (
    219,
    'LIPE DA NAJ',
    'Touro PO',
    'touro',
    'venda_direta',
    'retira_fazenda',
    'a_vista',
    'Jordania - MG',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796999/NAJ0081_ru72kq.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796999/NAJ0081_ru72kq.mp4'],
    12000,
    'À Vista',
    'NOVO',
    '{"registro":"NAJ0081","raca":"Nelore","nascimento":"01/02/2024","pai":"Sob Consulta","mae":"Sob Consulta","peso":"Sob Consulta","iabcz":"Sob Consulta","mgte":"Sob Consulta","status":"Touro","tipo":"Touro","comentario":"Touro LIPE DA NAJ - GSOL","pdf":"/NAJ0081.pdf","proprietario":"GSOL","criador":"GSOL"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    installments = EXCLUDED.installments,
    location = EXCLUDED.location,
    forma_pagamento = EXCLUDED.forma_pagamento;

INSERT INTO public.products (
    id, name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
) OVERRIDING SYSTEM VALUE VALUES (
    220,
    'REI FIV DA NAJ',
    'Touro PO',
    'touro',
    'venda_direta',
    'retira_fazenda',
    'a_vista',
    'Jordania - MG',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796999/NAJ0086_ikczgj.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769796999/NAJ0086_ikczgj.mp4'],
    12000,
    'À Vista',
    'NOVO',
    '{"registro":"NAJ0086","raca":"Nelore","nascimento":"01/02/2024","pai":"Sob Consulta","mae":"Sob Consulta","peso":"Sob Consulta","iabcz":"Sob Consulta","mgte":"Sob Consulta","status":"Touro","tipo":"Touro","comentario":"Touro REI FIV DA NAJ - GSOL","pdf":"/NAJ0086.pdf","proprietario":"GSOL","criador":"GSOL"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    installments = EXCLUDED.installments,
    location = EXCLUDED.location,
    forma_pagamento = EXCLUDED.forma_pagamento;

INSERT INTO public.products (
    id, name, category, classificacao, modalidade, logistica, forma_pagamento, location, image_url, gallery, price, installments, tag, details
) OVERRIDING SYSTEM VALUE VALUES (
    221,
    'PIETRO DA NAJ',
    'Touro PO',
    'touro',
    'venda_direta',
    'retira_fazenda',
    'a_vista',
    'Jordania - MG',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1769797002/NAJ104_zs6h1d.mp4',
    ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1769797002/NAJ104_zs6h1d.mp4'],
    12000,
    'À Vista',
    'NOVO',
    '{"registro":"NAJ104","raca":"Nelore","nascimento":"20/12/2023","pai":"Sob Consulta","mae":"Sob Consulta","peso":"Sob Consulta","iabcz":"Sob Consulta","mgte":"Sob Consulta","status":"Touro","tipo":"Touro","comentario":"Touro PIETRO DA NAJ - GSOL","pdf":"/NAJ104.pdf","proprietario":"GSOL","criador":"GSOL"}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    installments = EXCLUDED.installments,
    location = EXCLUDED.location,
    forma_pagamento = EXCLUDED.forma_pagamento;

