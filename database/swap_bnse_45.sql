-- Este script SQL inverte ABSOLUTAMENTE TUDO (mídias + dados textuais) 
-- entre as matrizes que contenham "BNSE 4" e "BNSE 5" no nome ou no registro.
-- Assim, o animal que antes estava no ID X com as infos e vídeo Y, 
-- passa a ter TODAS as infos e vídeo Z, assumindo a identidade completa da outra matriz.

WITH alvos AS (
  SELECT id, name
  FROM products
  WHERE (name ILIKE '%BNSE 4%' OR name ILIKE '%BNSE 04%' OR details->>'registro' ILIKE '%BNSE 4%' OR details->>'registro' ILIKE '%BNSE 04%')
     OR (name ILIKE '%BNSE 5%' OR name ILIKE '%BNSE 05%' OR details->>'registro' ILIKE '%BNSE 5%' OR details->>'registro' ILIKE '%BNSE 05%')
  ORDER BY id DESC LIMIT 2
)
UPDATE products AS p
SET 
  -- Dados Textuais e Financeiros
  name = other.name,
  details = other.details,
  category = other.category,
  classificacao = other.classificacao,
  modalidade = other.modalidade,
  logistica = other.logistica,
  forma_pagamento = other.forma_pagamento,
  location = other.location,
  price = other.price,
  installments = other.installments,
  tag = other.tag,
  registro = other.registro,
  raca = other.raca,
  nascimento = other.nascimento,
  pai = other.pai,
  mae = other.mae,
  peso = other.peso,
  "top" = other."top",
  status = other.status,
  breeder = other.breeder,
  proprietario = other.proprietario,
  pdf = other.pdf,
  comissao = other.comissao,
  iabcz = other.iabcz,
  mgte = other.mgte,
  iqg = other.iqg,
  genealogia_json = other.genealogia_json,
  avaliacao_genetica_json = other.avaliacao_genetica_json,
  
  -- Mídias (Vídeos e Fotos)
  image_url = other.image_url,
  gallery = other.gallery

FROM products AS other
WHERE 
  p.id IN (SELECT id FROM alvos)
  AND other.id IN (SELECT id FROM alvos)
  AND p.id != other.id;
