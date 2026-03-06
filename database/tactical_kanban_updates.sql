-- Create tactical_kanban_columns table
CREATE TABLE IF NOT EXISTS public.tactical_kanban_columns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.tactical_kanban_columns ENABLE ROW LEVEL SECURITY;

-- Allow read for authenticated users
CREATE POLICY "Allow read columns for authenticated users"
ON public.tactical_kanban_columns FOR SELECT TO authenticated USING (true);

-- Allow all actions for authenticated users
CREATE POLICY "Allow all actions on columns for authenticated users"
ON public.tactical_kanban_columns FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert default columns if table is empty
INSERT INTO public.tactical_kanban_columns (title, position)
SELECT * FROM (VALUES 
    ('Idéias', 1000),
    ('A fazer', 2000),
    ('Em andamento', 3000),
    ('Completa', 4000)
) AS v(title, position)
WHERE NOT EXISTS (SELECT 1 FROM public.tactical_kanban_columns);


-- Create tactical_task_comments table
CREATE TABLE IF NOT EXISTS public.tactical_task_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.tactical_tasks(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.tactical_task_comments ENABLE ROW LEVEL SECURITY;

-- Allow read for authenticated users
CREATE POLICY "Allow read comments for authenticated users"
ON public.tactical_task_comments FOR SELECT TO authenticated USING (true);

-- Allow all actions for authenticated users
CREATE POLICY "Allow all actions on comments for authenticated users"
ON public.tactical_task_comments FOR ALL TO authenticated USING (true) WITH CHECK (true);
