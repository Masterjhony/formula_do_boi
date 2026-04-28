-- ==============================================================================
-- SIGNUP VERIFICATION CODES (admin panel signup via email code)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.signup_verification_codes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL,
    code_hash text NOT NULL,
    full_name text,
    expires_at timestamptz NOT NULL,
    consumed_at timestamptz,
    attempts int NOT NULL DEFAULT 0,
    ip text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_signup_codes_email_created
    ON public.signup_verification_codes (email, created_at DESC);

-- RLS: lock down — only service role accesses this table.
ALTER TABLE public.signup_verification_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all" ON public.signup_verification_codes;
CREATE POLICY "service_role_all" ON public.signup_verification_codes
    FOR ALL TO service_role USING (true) WITH CHECK (true);
