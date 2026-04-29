-- ============================================================
-- Remoção de "Marcelo Carneiro" do CRM
-- Motivo: É o chefe do usuário, não é lead — registros são teste
-- ============================================================

-- Conferir antes de excluir (rode esta query primeiro)
SELECT id, nome, telefone, cidade, status, created_at
FROM public.crm_leads
WHERE nome ILIKE '%marcelo%carneiro%'
   OR nome ILIKE '%carneiro%marcelo%';

-- Exclusão definitiva
DELETE FROM public.crm_leads
WHERE nome ILIKE '%marcelo%carneiro%'
   OR nome ILIKE '%carneiro%marcelo%';
