-- ==============================================================================
-- ADD FULL_NAME TO PROFILES
-- ==============================================================================

-- 1. Add the column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE public.profiles ADD COLUMN full_name text;
    END IF;
END $$;

-- 2. Update the handle_new_user trigger function to include full_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    new.id, 
    new.email, 
    'user',
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Backfill existing users
-- Update profiles with full_name from auth.users metadata
UPDATE public.profiles p
SET full_name = (u.raw_user_meta_data->>'full_name')
FROM auth.users u
WHERE p.id = u.id
AND p.full_name IS NULL
AND u.raw_user_meta_data->>'full_name' IS NOT NULL;
