-- Soft-delete / arquivar tarefas do Kanban tactical.
-- Cards com archived_at != NULL ficam fora do board normal,
-- mas continuam acessíveis na visão "Arquivados".

ALTER TABLE public.tactical_tasks
    ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS tactical_tasks_archived_at_idx
    ON public.tactical_tasks (archived_at);
