-- ============================================================
-- Normalização de Categorias de Animais
--
-- Problema: Campo "category" tinha valores redundantes:
--   "Touro PO" / "Touro", "Matriz PO" / "Matriz", "Novilha PO" / "Novilha"
--
-- Solução: Separar a distinção PO para uma coluna dedicada "grau_sangue".
--   - category: tipo do animal (Touro, Matriz, Novilha, Doadora, Sêmen, Embrião)
--   - grau_sangue: pureza do animal (PO = Puro de Origem | NULL = não especificado)
-- ============================================================

-- 1. Adicionar coluna grau_sangue
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS grau_sangue text;

-- 2. Migrar dados existentes
UPDATE public.products SET grau_sangue = 'PO', category = 'Touro'   WHERE category = 'Touro PO';
UPDATE public.products SET grau_sangue = 'PO', category = 'Matriz'  WHERE category = 'Matriz PO';
UPDATE public.products SET grau_sangue = 'PO', category = 'Novilha' WHERE category = 'Novilha PO';

-- 3. Verificar resultado
SELECT category, grau_sangue, COUNT(*) AS total
FROM public.products
GROUP BY category, grau_sangue
ORDER BY category, grau_sangue;
