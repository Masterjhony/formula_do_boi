-- Adicionar a coluna de checklists que estava faltando na tabela tactical_tasks
ALTER TABLE public.tactical_tasks ADD COLUMN IF NOT EXISTS checklists JSONB DEFAULT '[]'::jsonb;
