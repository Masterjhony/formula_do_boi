-- 1. Add owner_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'owner_id') THEN
        ALTER TABLE public.products ADD COLUMN owner_id uuid REFERENCES auth.users(id);
    END IF;
END $$;

-- 2. Update RLS Policies
-- First, ensure RLS is enabled
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow users to UPDATE their own products
DROP POLICY IF EXISTS "Users can update own products" ON public.products;
CREATE POLICY "Users can update own products" ON public.products
    FOR UPDATE
    USING (auth.uid() = owner_id);

-- Allow users to SEE their own products (even if not active? Current policy is "viewable by everyone" using true)
-- We keep "Products are viewable by everyone" for public listing.

-- 3. Visual Tag Update: Set 'breeder' to 'R3' for the 6 RJPS bulls
UPDATE public.products
SET details = jsonb_set(
    COALESCE(details, '{}'::jsonb),
    '{breeder}',
    '"R3"'
)
WHERE details->>'registro' IN ('RJPS 556', 'RJPS 573', 'RJPS 579', 'RJPS 586', 'RJPS 634', 'RJPS 680');
