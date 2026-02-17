-- Verification script to check if data was correctly migrated from 'details' to columns

DO $$
DECLARE
    v_total_products INT;
    v_migrated_products INT;
    v_pai_check INT;
    v_mae_check INT;
    v_registro_check INT;
    v_sample RECORD;
BEGIN
    SELECT COUNT(*) INTO v_total_products FROM public.products;
    SELECT COUNT(*) INTO v_migrated_products FROM public.products WHERE details IS NOT NULL;
    
    -- Check how many have 'pai' populated where details->>'pai' exists
    SELECT COUNT(*) INTO v_pai_check 
    FROM public.products 
    WHERE pai IS NOT NULL AND details->>'pai' IS NOT NULL;

    -- Check how many have 'mae' populated where details->>'mae' exists
    SELECT COUNT(*) INTO v_mae_check 
    FROM public.products 
    WHERE mae IS NOT NULL AND details->>'mae' IS NOT NULL;

    -- Check how many have 'registro' populated where details->>'registro' exists
    SELECT COUNT(*) INTO v_registro_check 
    FROM public.products 
    WHERE registro IS NOT NULL AND details->>'registro' IS NOT NULL;

    RAISE NOTICE 'Total Products: %', v_total_products;
    RAISE NOTICE 'Products with Details: %', v_migrated_products;
    RAISE NOTICE 'Products with PAI (migrated/existing): % (Expect approx %)', v_pai_check, v_migrated_products; 
    -- Note: Might be less if some details didn't have 'pai'
    
    RAISE NOTICE 'Products with MAE (migrated/existing): %', v_mae_check;
    RAISE NOTICE 'Products with REGISTRO (migrated/existing): %', v_registro_check;

    -- Sample check 1
    SELECT name, registro, pai, mae, details INTO v_sample 
    FROM public.products 
    WHERE details IS NOT NULL 
    LIMIT 1;

    RAISE NOTICE 'Sample 1: Name=%, Registro=%, Pai=%, Mae=%', v_sample.name, v_sample.registro, v_sample.pai, v_sample.mae;
    IF v_sample.registro IS NULL AND v_sample.details->>'registro' IS NOT NULL THEN
        RAISE NOTICE 'WARNING: Sample 1 failed migration for registro!';
    END IF;

END $$;
