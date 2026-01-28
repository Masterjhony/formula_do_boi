-- UPSERT Admin Profile
-- This ensures the profile exists even if the user already existed before the trigger was created.
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'formuladoboi@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin';

-- Double check verification:
SELECT * FROM public.profiles WHERE email = 'formuladoboi@gmail.com';
