-- Create tactical_tasks table
CREATE TABLE IF NOT EXISTS public.tactical_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'A fazer', -- 'A fazer', 'Em andamento', 'Completa'
    priority TEXT DEFAULT 'Média', -- 'Baixa', 'Média', 'Alta'
    due_date TIMESTAMPTZ,
    assignees TEXT[], -- Array of Profile IDs (UUIDs) or Names if ID not found
    position INTEGER DEFAULT 0,
    column_id TEXT -- Optional: to support multiple boards in future, or just mapped status
);

-- Enable RLS
ALTER TABLE public.tactical_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies (modify 'admin' check as needed based on project roles)
-- Policy for reading tasks (allow authenticated users, or just admins)
CREATE POLICY "Allow read for authenticated users"
ON public.tactical_tasks
FOR SELECT
TO authenticated
USING (true);

-- Policy for insert/update/delete (allow admins)
-- Assuming 'admin' role check is done via role column in profiles or metadata
-- For now, allowing authenticated users to manage tasks for this team tool
CREATE POLICY "Allow all actions for authenticated users"
ON public.tactical_tasks
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Index for ordering
CREATE INDEX IF NOT EXISTS tactical_tasks_status_position_idx ON public.tactical_tasks (status, position);
