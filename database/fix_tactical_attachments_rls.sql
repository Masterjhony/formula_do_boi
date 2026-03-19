-- Corrige RLS da tabela tactical_task_attachments
-- Migração idempotente: remove policies antigas e recria seguindo padrão do projeto

-- Garante RLS habilitado
ALTER TABLE public.tactical_task_attachments ENABLE ROW LEVEL SECURITY;

-- Remove policies antigas (idempotente)
DROP POLICY IF EXISTS "Authenticated users can read attachments" ON public.tactical_task_attachments;
DROP POLICY IF EXISTS "Authenticated users can insert attachments" ON public.tactical_task_attachments;
DROP POLICY IF EXISTS "Authenticated users can delete attachments" ON public.tactical_task_attachments;
DROP POLICY IF EXISTS "Allow all actions on attachments for authenticated users" ON public.tactical_task_attachments;

-- Policy única seguindo padrão do projeto (FOR ALL, TO authenticated, USING true, WITH CHECK true)
CREATE POLICY "Allow all actions on attachments for authenticated users"
ON public.tactical_task_attachments
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
