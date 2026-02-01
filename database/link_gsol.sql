-- 1. Ensure GSOL is in the breeders table
INSERT INTO public.breeders (name)
SELECT 'GSOL'
WHERE NOT EXISTS (
    SELECT 1 FROM public.breeders WHERE name = 'GSOL'
);

-- 2. Update existing GSOL products to have 'breeder' field in details
-- This ensures compatibility even if we revert the code change or use other tools
UPDATE public.products
SET details = details || '{"breeder": "GSOL"}'::jsonb
WHERE details->>'proprietario' = 'GSOL';
