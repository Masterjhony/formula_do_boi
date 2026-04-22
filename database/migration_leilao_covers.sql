-- ============================================================
-- MIGRAÇÃO: Storage bucket para capas de leilões + seed de imagens
-- Execute este script no SQL Editor do Supabase Dashboard
-- ============================================================

-- 1. Bucket para capas
INSERT INTO storage.buckets (id, name, public)
VALUES ('leilao-covers', 'leilao-covers', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas de storage
DROP POLICY IF EXISTS "Admins can upload leilao covers" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read leilao covers" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete leilao covers" ON storage.objects;

CREATE POLICY "Admins can upload leilao covers"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'leilao-covers'
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

CREATE POLICY "Anyone can read leilao covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'leilao-covers');

CREATE POLICY "Admins can delete leilao covers"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'leilao-covers'
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- 3. Associar capas extraídas do Excel aos leilões existentes
--    (ajuste os nomes conforme os registros reais na sua base)
UPDATE bula_leiloes SET img = '/leilao-covers/nelore-cachoeiram.jpg'
WHERE UPPER(nome) ILIKE '%CACHOEIR%' AND (img IS NULL OR img = '');

UPDATE bula_leiloes SET img = '/leilao-covers/leilao-ipb-prime.jpg'
WHERE UPPER(nome) ILIKE '%IPB%' AND (img IS NULL OR img = '');

UPDATE bula_leiloes SET img = '/leilao-covers/leilao-floc.png'
WHERE UPPER(nome) ILIKE '%FLOC%' AND (img IS NULL OR img = '');

UPDATE bula_leiloes SET img = '/leilao-covers/fb-agro.png'
WHERE (UPPER(nome) ILIKE '%FB AGRO%' OR UPPER(nome) ILIKE '%FB_AGRO%') AND (img IS NULL OR img = '');

UPDATE bula_leiloes SET img = '/leilao-covers/nelore-tresmar.jpg'
WHERE UPPER(nome) ILIKE '%TRESMAR%' AND (img IS NULL OR img = '');
