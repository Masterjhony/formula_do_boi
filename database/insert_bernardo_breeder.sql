-- Inserir criador Bernardo na tabela breeders
INSERT INTO public.breeders (name)
SELECT 'Bernardo'
WHERE NOT EXISTS (
    SELECT 1 FROM public.breeders WHERE name = 'Bernardo'
);
