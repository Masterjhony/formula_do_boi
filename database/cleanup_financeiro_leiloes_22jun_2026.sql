-- ============================================================
-- LIMPEZA DO ERP FINANCEIRO - CONTAS DE LEILOES
-- Data: 22/06/2026
-- Motivo: os controles financeiros de leiloes passaram para a
-- outra plataforma. O ERP financeiro deve ficar voltado a operacao
-- atual de semen/embrioes e movimentacoes bancarias reais.
--
-- Removidos do Supabase em producao:
--   - 34 lancamentos nao efetivados e sem OFX
--   - 32 pendentes + 2 cancelados
--   - R$ 95.591,00 em receitas de leilao
--   - R$ 87.827,00 em despesas/comissoes de leilao
--
-- Preservados:
--   - lancamentos completed
--   - lancamentos bancarios/OFX
--   - extratos importados do Banco Inter
-- ============================================================

DELETE FROM public.erp_finance_transactions
WHERE id IN (
    'dfb320c2-6507-4508-9409-37f911e3d613',
    '2a9dc53e-d37b-4bdf-b826-ba997f0bb186',
    'f506376b-dea9-4e10-90c6-9e5b44bb7deb',
    '21f6953a-fdb6-4a1e-bff7-a7169c6e4aad',
    '907ba781-b61d-4c34-8053-8e6e59c65ea2',
    '1b13f0be-23d9-4408-8db6-de02270ab8eb',
    'dcf42e22-dc1a-4bb8-a61d-94e3e1f4bbba',
    '479faeae-9602-4cdf-bc07-3b8bcbf8a93e',
    'a617bc0c-b78d-4c9b-b1ff-17cad80569b4',
    '0c5a940d-83bd-453a-8dcf-1f9676666957',
    'c98f2233-e6ff-4839-b778-1bc6a10919a7',
    '770eecd1-93c6-4abf-9a57-75eec9239196',
    'ea3c76e0-c499-408f-b002-f10cf83a0e39',
    '5378fac9-1eaa-471b-bc0f-731021174bf6',
    '1929be04-b766-4ee3-bec7-ab1020036bf5',
    '82c886d1-0754-4039-9509-d10c5b3226b9',
    '32ddf543-22b3-45e6-bad3-ed8c97340581',
    '9e10324e-69e4-48bb-8fab-ecdb637e68e2',
    '0e8a8314-f740-47bd-a835-ec366a657ee4',
    '28e86969-08ca-4670-b7ff-015710175ac4',
    '4cd29b81-0594-4644-8064-a655f4210e79',
    '7762ddbc-0ab1-4e8d-9acb-77399573343d',
    'abd41b59-409e-4eaf-84d4-de5aa9a83b7b',
    '6fb19bf9-5d21-4303-b498-603fa31f4bd5',
    'bea8fd4a-65a6-4f40-a528-a9a3ed379706',
    'a51b7fb5-da4b-43b0-b8cd-75ad8dc69399',
    '091fa0e1-ba29-44b6-b152-0f9ec7b0c082',
    'f23b8663-e197-46bd-8fe2-06d7fb4c526e',
    'c019f1e7-90ac-49ff-9008-baa545ec5d60',
    'aa0b9073-8dac-4735-833b-58819944ef24',
    '9d15fbb4-4bdc-462f-8af0-49c3ec9e1ce1',
    '64c17fe2-dc7f-4fe3-acf2-1429ec01bf0d',
    '1df80576-695c-4d66-9a1a-f613fffacb80',
    'd1985d44-74c7-452c-9d89-8dd4c67a9a42'
);
