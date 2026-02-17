-- Migration script to extract fields from 'details' JSONB column to dedicated columns
-- This script is idempotent and safe to run multiple times.

DO $$
BEGIN
    -- 1. Add columns if they don't exist
    -- 'registro'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'registro') THEN
        ALTER TABLE public.products ADD COLUMN registro TEXT;
    END IF;

    -- 'raca'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'raca') THEN
        ALTER TABLE public.products ADD COLUMN raca TEXT;
    END IF;

    -- 'nascimento'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'nascimento') THEN
        ALTER TABLE public.products ADD COLUMN nascimento TEXT;
    END IF;

    -- 'pai'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'pai') THEN
        ALTER TABLE public.products ADD COLUMN pai TEXT;
    END IF;

    -- 'mae'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'mae') THEN
        ALTER TABLE public.products ADD COLUMN mae TEXT;
    END IF;

    -- 'peso'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'peso') THEN
        ALTER TABLE public.products ADD COLUMN peso TEXT;
    END IF;

    -- 'top'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'top') THEN
        ALTER TABLE public.products ADD COLUMN top TEXT;
    END IF;

    -- 'status'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'status') THEN
        ALTER TABLE public.products ADD COLUMN status TEXT;
    END IF;

    -- 'breeder'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'breeder') THEN
        ALTER TABLE public.products ADD COLUMN breeder TEXT;
    END IF;

    -- 'proprietario'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'proprietario') THEN
        ALTER TABLE public.products ADD COLUMN proprietario TEXT;
    END IF;

    -- 'pdf'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'pdf') THEN
        ALTER TABLE public.products ADD COLUMN pdf TEXT;
    END IF;

    -- 'comissao'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'comissao') THEN
        ALTER TABLE public.products ADD COLUMN comissao TEXT;
    END IF;

    -- iabcz, mgte, iqg are assumed to exist based on previous checks, but we can add them here for completeness just in case
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'iabcz') THEN
        ALTER TABLE public.products ADD COLUMN iabcz TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'mgte') THEN
        ALTER TABLE public.products ADD COLUMN mgte TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'iqg') THEN
        ALTER TABLE public.products ADD COLUMN iqg TEXT;
    END IF;

    -- 2. Update data
    -- We use COALESCE to ensure we don't overwrite existing non-null values in the columns with data from details.
    -- However, the requirement is "garanta que todos os índices estejam nas colunas respectivas".
    -- "Safe" update means: if column is NULL or empty string, try to fill it from details.

    UPDATE public.products
    SET
        registro = CASE WHEN (registro IS NULL OR registro = '') THEN (details->>'registro') ELSE registro END,
        raca = CASE WHEN (raca IS NULL OR raca = '') THEN (details->>'raca') ELSE raca END,
        nascimento = CASE WHEN (nascimento IS NULL OR nascimento = '') THEN (details->>'nascimento') ELSE nascimento END,
        pai = CASE WHEN (pai IS NULL OR pai = '') THEN (details->>'pai') ELSE pai END,
        mae = CASE WHEN (mae IS NULL OR mae = '') THEN (details->>'mae') ELSE mae END,
        peso = CASE WHEN (peso IS NULL OR peso = '') THEN (details->>'peso') ELSE peso END,
        top = CASE WHEN (top IS NULL OR top = '') THEN (details->>'top') ELSE top END,
        status = CASE WHEN (status IS NULL OR status = '') THEN (details->>'status') ELSE status END,
        breeder = CASE WHEN (breeder IS NULL OR breeder = '') THEN (details->>'breeder') ELSE breeder END,
        proprietario = CASE WHEN (proprietario IS NULL OR proprietario = '') THEN (details->>'proprietario') ELSE proprietario END,
        pdf = CASE WHEN (pdf IS NULL OR pdf = '') THEN (details->>'pdf') ELSE pdf END,
        comissao = CASE WHEN (comissao IS NULL OR comissao = '') THEN (details->>'comissao') ELSE comissao END,
        iabcz = CASE WHEN (iabcz IS NULL OR iabcz = '') THEN (details->>'iabcz') ELSE iabcz END,
        mgte = CASE WHEN (mgte IS NULL OR mgte = '') THEN (details->>'mgte') ELSE mgte END,
        iqg = CASE WHEN (iqg IS NULL OR iqg = '') THEN (details->>'iqg') ELSE iqg END
    WHERE details IS NOT NULL;

END $$;
