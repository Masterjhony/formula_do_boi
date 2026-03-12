-- Migração: Adicionar campos do Google Sheets à tabela crm_leads
-- Rodar no Supabase SQL Editor

ALTER TABLE public.crm_leads
  ADD COLUMN IF NOT EXISTS instagram TEXT,
  ADD COLUMN IF NOT EXISTS estado TEXT,
  ADD COLUMN IF NOT EXISTS cidade TEXT,
  ADD COLUMN IF NOT EXISTS o_que_busca TEXT,
  ADD COLUMN IF NOT EXISTS quantidade_animais TEXT,
  ADD COLUMN IF NOT EXISTS source_page TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS medium TEXT,
  ADD COLUMN IF NOT EXISTS campaign TEXT,
  ADD COLUMN IF NOT EXISTS data_entrada TIMESTAMPTZ;
