-- Adiciona coluna genealogia_json para armazenar a árvore genealógica
-- extraída automaticamente do PDF da ficha técnica.
-- Estrutura de cada nó: { nome: string, rg?: string }

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS genealogia_json JSONB DEFAULT NULL;

COMMENT ON COLUMN products.genealogia_json IS
  'Árvore genealógica extraída do PDF da ficha técnica.
   Estrutura: { pai, mae, avo_paterno, avo_paterna, avo_materno, avo_materna,
   bisavo_ppp, bisavo_mpp, bisavo_pmp, bisavo_mmp, bisavo_ppm, bisavo_mpm, bisavo_pmm, bisavo_mmm }
   Cada nó: { nome: string, rg?: string }';
