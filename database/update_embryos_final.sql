-- Update script for Embryos (Trufa, Dandara, Fada, Medusa)

-- 1. TRUFA BERRANTE DE OURO (ID 1)
UPDATE products
SET 
    name = 'TRUFA BERRANTE DE OURO - Pacote 10 Embriões',
    category = 'DOADORA',
    price = 12000.00,
    installments = '320,00',
    forma_pagamento = 'Entrada + 30x',
    details = jsonb_set(
        jsonb_set(
            jsonb_set(
                jsonb_set(
                    jsonb_set(
                        COALESCE(details, '{}'::jsonb),
                        '{registro}', '"EAJR 9"'
                    ),
                    '{nascimento}', '"03/10/2023"'
                ),
                '{pai}', '"PINTOR FIV L.CANCADO"'
            ),
            '{mae}', '"AMORA AK DA BERRANTE DE OURO"'
        ),
        '{pdf}', '"/EAJR 9.pdf"'
    ) || '{"proprietario": "BERRANTE DE OURO", "downPaymentValue": "2.400,00"}'::jsonb
WHERE id = 1;

-- 2. DANDARA EAJR 2 (ID 4)
UPDATE products
SET 
    name = 'DANDARA EAJR 2 - Pacote 10 Embriões',
    category = 'DOADORA',
    price = 11000.00,
    installments = '293,33',
    forma_pagamento = 'Entrada + 30x',
    details = jsonb_set(
        jsonb_set(
            jsonb_set(
                jsonb_set(
                    COALESCE(details, '{}'::jsonb),
                    '{registro}', '"EAJR 2"'
                ),
                '{nascimento}', '"17/08/2022"'
            ),
            '{pai}', '"RETINTO FIV V3"'
        ),
        '{mae}', '"AKIRA AK DA BERRANTE DE OURO"'
    ) || '{"proprietario": "BERRANTE DE OURO", "pdf": "/EAJR2.pdf", "downPaymentValue": "2.200,00"}'::jsonb
WHERE id = 4;

-- 3. FADA IBIZ 2331 (ID 5)
UPDATE products
SET 
    name = 'FADA IBIZ 2331 - Pacote 10 Embriões',
    category = 'DOADORA',
    price = 15000.00,
    installments = '400,00',
    forma_pagamento = 'Entrada + 30x',
    details = jsonb_set(
        jsonb_set(
            jsonb_set(
                jsonb_set(
                    COALESCE(details, '{}'::jsonb),
                    '{registro}', '"IBIZ 2331"'
                ),
                '{nascimento}', '"31/03/2024"'
            ),
            '{pai}', '"IMPACTO FIV V3"'
        ),
        '{mae}', '"IBIZA FIV GORAN"'
    ) || '{"proprietario": "BERRANTE DE OURO", "pdf": "/IBIZ2331.pdf", "downPaymentValue": "3.000,00"}'::jsonb
WHERE id = 5;

-- 4. MEDUZA (ID 20)
UPDATE products
SET 
    name = 'MEDUZA - Pacote 10 Embriões',
    category = 'DOADORA',
    price = 17000.00,
    installments = '453,33',
    forma_pagamento = 'Entrada + 30x',
    details = jsonb_set(
        jsonb_set(
            jsonb_set(
                jsonb_set(
                    COALESCE(details, '{}'::jsonb),
                    '{registro}', '"SYA 537"'
                ),
                '{nascimento}', '"15/06/2023"'
            ),
            '{pai}', '"PAO DE LO DA CA"'
        ),
        '{mae}', '"IBIZA FIV MERLIN"'
    ) || '{"proprietario": "BERRANTE DE OURO", "pdf": "/SYA537.pdf", "downPaymentValue": "3.400,00"}'::jsonb
WHERE id = 20;
