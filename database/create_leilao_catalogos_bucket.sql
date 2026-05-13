-- ============================================================
-- STORAGE — bucket "leilao-catalogos"
-- Armazena PDFs dos catálogos dos leilões anexados via
-- /api/leiloes/catalogo-upload. Bucket público (acesso de leitura
-- direto via URL pública), upload restrito a usuários autenticados.
-- Executar no Supabase SQL Editor (idempotente).
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'leilao-catalogos',
  'leilao-catalogos',
  true,
  26214400, -- 25MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE
SET public            = EXCLUDED.public,
    file_size_limit   = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ── Policies ────────────────────────────────────────────────
-- Leitura pública (todos podem baixar pelo getPublicUrl)
DROP POLICY IF EXISTS "Public read leilao-catalogos" ON storage.objects;
CREATE POLICY "Public read leilao-catalogos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'leilao-catalogos');

-- Upload apenas para usuários autenticados (admin via service-role bypassa)
DROP POLICY IF EXISTS "Authenticated insert leilao-catalogos" ON storage.objects;
CREATE POLICY "Authenticated insert leilao-catalogos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'leilao-catalogos');

-- Update/delete apenas autenticado (raro — só para regravar/excluir)
DROP POLICY IF EXISTS "Authenticated update leilao-catalogos" ON storage.objects;
CREATE POLICY "Authenticated update leilao-catalogos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'leilao-catalogos');

DROP POLICY IF EXISTS "Authenticated delete leilao-catalogos" ON storage.objects;
CREATE POLICY "Authenticated delete leilao-catalogos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'leilao-catalogos');
