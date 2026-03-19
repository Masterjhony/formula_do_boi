-- Tabela de anexos dos cards do plano tático
CREATE TABLE IF NOT EXISTS public.tactical_task_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.tactical_tasks(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_path TEXT NOT NULL,  -- path no Supabase Storage para deletar
    file_type TEXT,           -- mime type
    file_size BIGINT,         -- tamanho em bytes
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.tactical_task_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read attachments"
    ON public.tactical_task_attachments FOR SELECT
    TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert attachments"
    ON public.tactical_task_attachments FOR INSERT
    TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can delete attachments"
    ON public.tactical_task_attachments FOR DELETE
    TO authenticated USING (true);

-- Criar bucket no Supabase Storage (execute no dashboard ou via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('tactical-attachments', 'tactical-attachments', true);

-- Storage policies para o bucket tactical-attachments
-- CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'tactical-attachments');
-- CREATE POLICY "Public read" ON storage.objects FOR SELECT USING (bucket_id = 'tactical-attachments');
-- CREATE POLICY "Authenticated users can delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'tactical-attachments');
