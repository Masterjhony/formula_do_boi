-- Adiciona colunas de origem WhatsApp em tactical_tasks
-- Permite rastrear cards criados via comando /tarefa em grupos

ALTER TABLE tactical_tasks
  ADD COLUMN IF NOT EXISTS whatsapp_group_id   TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_group_name TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_sender     TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_sender_name TEXT;

COMMENT ON COLUMN tactical_tasks.whatsapp_group_id   IS 'JID do grupo WhatsApp de origem (ex: 123456@g.us)';
COMMENT ON COLUMN tactical_tasks.whatsapp_group_name IS 'Nome do grupo WhatsApp de origem';
COMMENT ON COLUMN tactical_tasks.whatsapp_sender     IS 'Número do remetente que criou a tarefa';
COMMENT ON COLUMN tactical_tasks.whatsapp_sender_name IS 'Nome/pushName do remetente que criou a tarefa';
