-- =================================================================
-- FIX: Policies de STORAGE para o bucket tactical-attachments
-- ESTE era o problema real — as policies de storage.objects
-- estavam comentadas na migração original e nunca foram criadas.
-- Sem elas, o upload do arquivo falha com RLS error.
-- =================================================================

-- Remove storage policies antigas se existirem
DROP POLICY IF EXISTS "Authenticated users can upload tactical attachments" ON storage.objects;
DROP POLICY IF EXISTS "Public read tactical attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete tactical attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload to tactical-attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read of tactical-attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete from tactical-attachments" ON storage.objects;

-- Storage: permitir upload por usuários autenticados
CREATE POLICY "Allow authenticated upload to tactical-attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tactical-attachments');

-- Storage: leitura pública (para gerar URLs públicas)
CREATE POLICY "Allow public read of tactical-attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'tactical-attachments');

-- Storage: permitir delete por usuários autenticados
CREATE POLICY "Allow authenticated delete from tactical-attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'tactical-attachments');

-- Tornar o bucket público (necessário para getPublicUrl funcionar)
UPDATE storage.buckets SET public = true WHERE id = 'tactical-attachments';

-- =================================================================
-- Tabela tactical_task_attachments — garantir policy existe
-- =================================================================
ALTER TABLE public.tactical_task_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read attachments" ON public.tactical_task_attachments;
DROP POLICY IF EXISTS "Authenticated users can insert attachments" ON public.tactical_task_attachments;
DROP POLICY IF EXISTS "Authenticated users can delete attachments" ON public.tactical_task_attachments;
DROP POLICY IF EXISTS "Allow all actions on attachments for authenticated users" ON public.tactical_task_attachments;

CREATE POLICY "Allow all actions on attachments for authenticated users"
ON public.tactical_task_attachments
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
