-- Run this script in the Supabase SQL Editor to fix the Sertanejo card

UPDATE public.products
SET details = '{
    "registro": "EPCF 2315",
    "raca": "Nelore PO",
    "pai": "1070 da Terra Brava",
    "mae": "1381 FIV da Terra Brava",
    "iabcz": "11.37",
    "mgte": "20.81",
    "proprietario": "Terra Brava",
    "comentario": "Touro Nelore PO com MGTe TOP 16%. Genética comprovada.",
    "customLink": "/sertanejo"
}'::jsonb
WHERE name = 'Dose de Sêmen - SERTANEJO TERRA BRAVA' AND category = 'Sêmen';
