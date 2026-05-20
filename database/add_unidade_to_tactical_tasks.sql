-- Separa o board de Projetos (/web-admin/projetos) em duas operações:
--   'formula_boi'  → operação Fórmula do Boi (produtos, reservas, CRM) — board que já existia
--   'bula_formula' → operação Bula Assessoria × Fórmula do Boi (leilões)
--
-- Tarefas existentes (e as criadas pelo comando WhatsApp /tarefa, que não
-- informa unidade) caem em 'formula_boi' pelo DEFAULT — nada se perde.
-- As colunas do Kanban (tactical_kanban_columns) continuam compartilhadas
-- entre os dois boards: só as tarefas carregam a unidade.
--
-- Idempotente — pode reaplicar.

ALTER TABLE public.tactical_tasks
    ADD COLUMN IF NOT EXISTS unidade TEXT NOT NULL DEFAULT 'formula_boi';

CREATE INDEX IF NOT EXISTS tactical_tasks_unidade_status_position_idx
    ON public.tactical_tasks (unidade, status, position);
