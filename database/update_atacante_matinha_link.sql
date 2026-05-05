-- ============================================================
-- UPDATE — customLink do card "ATACANTE DA MATINHA" (Sêmen)
-- Aponta o card de produto para a nova LP /atacante-matinha
-- (substitui a antiga /atacante).
--
-- Contexto: o card lê product.details.customLink em
-- src/components/ProductCard.tsx — alterar o JSONB redireciona
-- o clique sem mexer no código.
--
-- Idempotente: só casa quando o valor ainda é '/atacante'.
-- ============================================================

UPDATE public.products
SET details = jsonb_set(details, '{customLink}', '"/atacante-matinha"'::jsonb)
WHERE name = 'Dose de Sêmen - ATACANTE DA MATINHA'
  AND details->>'customLink' = '/atacante';
