-- SQL Script for inserting Semen cards into the products table
-- Run this script in the Supabase SQL Editor

INSERT INTO public.products (
  name, 
  category, 
  classificacao, 
  location, 
  image_url, 
  gallery, 
  price, 
  installments, 
  tag, 
  details
) VALUES
(
  'Dose de Sêmen - WOLVERINE DA MYO',
  'Sêmen',
  'semen',
  'Central Genex',
  'https://res.cloudinary.com/dkh2nsugb/video/upload/v1770078928/boi_semen_dffkyz.mp4',
  ARRAY['https://res.cloudinary.com/dkh2nsugb/video/upload/v1770078928/boi_semen_dffkyz.mp4'],
  50.00,
  'Pedido Mínimo: 50 doses',
  'PROVADO',
  '{
    "raca": "Nelore",
    "tipo": "Sêmen Convencional",
    "pai": "WOLVERINE DA MYO",
    "mae": "DA XARAES",
    "iabcz": "25.00",
    "iqg": "22.50",
    "proprietario": "LUDEN",
    "comentario": "Touro com excelente avaliação de carcaça e desempenho. Ideal para rebanhos comerciais e puros."
  }'::jsonb
),
(
  'Dose de Sêmen - SERTANEJO TERRA BRAVA',
  'Sêmen',
  'semen',
  'Central Semex',
  'https://res.cloudinary.com/dkh2nsugb/image/upload/v1774271580/sertanejo-04_a2avtq.jpg',
  ARRAY[
    'https://res.cloudinary.com/dkh2nsugb/image/upload/v1774271580/sertanejo-04_a2avtq.jpg',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1774271587/WhatsApp_Video_2026-03-21_at_12.21.08_zhdbrd.mp4',
    'https://res.cloudinary.com/dkh2nsugb/video/upload/v1774271582/WhatsApp_Video_2026-03-21_at_12.21.06_tqodqe.mp4'
  ],
  NULL,
  'Sob Consulta',
  'DESTAQUE',
  '{
    "registro": "EPCF 2315",
    "raca": "Nelore PO",
    "pai": "REMANSO TE DA MUNDIAL",
    "mae": "MARLY FIV DA ER",
    "iabcz": "11.37",
    "mgte": "20.81",
    "proprietario": "Terra Brava",
    "comentario": "Touro Nelore PO com MGTe TOP 16%. Genética comprovada.",
    "customLink": "/sertanejo"
  }'::jsonb
);
