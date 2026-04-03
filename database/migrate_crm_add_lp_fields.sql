-- Migração: Adicionar campos de LP à tabela crm_leads
-- Rodar no Supabase SQL Editor

ALTER TABLE public.crm_leads
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'novo',
  ADD COLUMN IF NOT EXISTS origem TEXT;
