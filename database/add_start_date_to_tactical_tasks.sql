-- Add start_date field to tactical_tasks for proper Gantt visualization
ALTER TABLE tactical_tasks
ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;
