-- ============================================================================
-- Reserva Sêmen — Lorenzo Monteiro Martins (Fazenda Vargem Grande / MG)
-- Data: 2026-05-18
--
-- Pedido reportado pelo grupo do WhatsApp (cliente recorrente — "Já tivemos
-- essas reservas, mandei no grupo. Não ta no CRM"):
--   • 50 doses Atacante da Matinha (Convencional)  @ R$ 27,50 = R$ 1.375
--   • 50 doses Volante MRA                         @ R$ 27,50 = R$ 1.375
--   Total pedido: 100 doses / R$ 2.750  ·  Pagamento à vista, antes do envio.
--
-- Comprovante Inscrição Estadual MG (PDF anexado pelo cliente):
--   IE 004663921.00-10  ·  CPF 117.218.286-80
--   Fazenda Vargem Grande, Acampamento Fazenda Vargem Grande, s/n,
--   Zona Rural, CEP 32920-000, São Joaquim de Bicas / MG
--   CNAE 0151-2/01 (Criação de bovinos para corte) · Situação: ATIVO desde 13/07/2023
--
-- ⚠ ANTES DE RODAR: substituir `__TELEFONE_LORENZO__` pelo número WhatsApp
--    do Lorenzo (só dígitos, com DDD; ex.: 31999990000). Faça um Find/Replace
--    no arquivo todo — o placeholder aparece em 3 lugares.
-- ============================================================================


-- ── 1) Lead no CRM ──────────────────────────────────────────────────────────
INSERT INTO public.crm_leads (
    nome, telefone, status, prioridade, interesse, empresa,
    estado, cidade, origem, stage, notes,
    interesse_principal, tags_whatsapp,
    ultimo_contato
)
SELECT
    'Lorenzo Monteiro Martins',
    '__TELEFONE_LORENZO__',
    'Negociação',                                       -- recorrente com reserva aberta aguardando pagamento
    'normal',
    'Sêmen — Atacante da Matinha + Volante MRA',
    'Fazenda Vargem Grande',
    'MG',
    'São Joaquim de Bicas',
    'manual',
    'novo',
    E'Cliente recorrente reportado pelo grupo WhatsApp em 18/05/2026.\n'
    || E'CPF 117.218.286-80 · IE MG 004663921.00-10 · CNAE 0151-2/01.\n'
    || E'Endereço: Acampamento Fazenda Vargem Grande, s/n, Zona Rural — '
    || E'São Joaquim de Bicas/MG, CEP 32920-000.\n'
    || E'Pedido em aberto: 50 doses Atacante da Matinha + 50 doses Volante MRA '
    || E'(R$ 27,50/dose · pagamento à vista, antes do envio).',
    'semen',
    '["comprador de sêmen", "produtor rural"]'::jsonb,
    timezone('utc'::text, now())
WHERE NOT EXISTS (
    SELECT 1 FROM public.crm_leads
    WHERE telefone = '__TELEFONE_LORENZO__'
       OR nome = 'Lorenzo Monteiro Martins'
);


-- ── 2) Reserva — 50 doses Atacante da Matinha (Convencional) ────────────────
INSERT INTO public.product_reservations (
    product_id, product_name, product_category, product_kind, central,
    customer_name, customer_phone, customer_doc, customer_fazenda,
    customer_city, customer_uf,
    quantity, unit_price, total_value, payment_method, payment_status,
    status, priority, origin,
    notes, history,
    lead_id
)
SELECT
    (SELECT id FROM public.products
     WHERE name = 'Dose de Sêmen - ATACANTE DA MATINHA'
     ORDER BY id LIMIT 1),
    'Dose de Sêmen - ATACANTE DA MATINHA (Convencional)',
    'Sêmen',
    'semen',
    'Central Procriar SP',
    'Lorenzo Monteiro Martins',
    '__TELEFONE_LORENZO__',
    '117.218.286-80',
    'Fazenda Vargem Grande',
    'São Joaquim de Bicas',
    'MG',
    50,
    27.50,
    1375.00,
    'avista',
    'pendente',
    'nova',
    'normal',
    'manual',
    E'Reserva reportada pelo grupo WhatsApp em 18/05/2026 — cliente recorrente '
    || E'(já tinha reservas anteriores, ainda não estava no CRM).\n'
    || E'Pagamento à vista, antes do envio.\n'
    || E'Anexo enviado pelo cliente: Comprovante_de_Inscricao_IEPR_0046639210010.pdf '
    || E'(IE MG 004663921.00-10 · CPF 117.218.286-80 · Fazenda Vargem Grande).',
    jsonb_build_array(jsonb_build_object(
        'at', to_char(timezone('utc'::text, now()), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
        'kind', 'status',
        'to', 'nova',
        'by', 'sistema',
        'text', 'Reserva criada via grupo WhatsApp (cliente recorrente)'
    )),
    (SELECT id FROM public.crm_leads
     WHERE telefone = '__TELEFONE_LORENZO__'
        OR nome = 'Lorenzo Monteiro Martins'
     ORDER BY created_at DESC LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM public.product_reservations
    WHERE customer_doc = '117.218.286-80'
      AND product_name = 'Dose de Sêmen - ATACANTE DA MATINHA (Convencional)'
      AND quantity = 50
      AND created_at::date = CURRENT_DATE
);


-- ── 3) Reserva — 50 doses Volante MRA ───────────────────────────────────────
-- Volante MRA não está no catálogo `products`; entra só como snapshot
-- denormalizado (product_id NULL).
INSERT INTO public.product_reservations (
    product_id, product_name, product_category, product_kind, central,
    customer_name, customer_phone, customer_doc, customer_fazenda,
    customer_city, customer_uf,
    quantity, unit_price, total_value, payment_method, payment_status,
    status, priority, origin,
    notes, history,
    lead_id
)
SELECT
    NULL,
    'Dose de Sêmen - VOLANTE MRA',
    'Sêmen',
    'semen',
    NULL,
    'Lorenzo Monteiro Martins',
    '__TELEFONE_LORENZO__',
    '117.218.286-80',
    'Fazenda Vargem Grande',
    'São Joaquim de Bicas',
    'MG',
    50,
    27.50,
    1375.00,
    'avista',
    'pendente',
    'nova',
    'normal',
    'manual',
    E'Reserva reportada pelo grupo WhatsApp em 18/05/2026 — cliente recorrente '
    || E'(já tinha reservas anteriores, ainda não estava no CRM).\n'
    || E'Pagamento à vista, antes do envio.\n'
    || E'⚠ Volante MRA ainda não cadastrado no catálogo (`products`); '
    || E'reserva registrada apenas como snapshot denormalizado.\n'
    || E'Anexo enviado pelo cliente: Comprovante_de_Inscricao_IEPR_0046639210010.pdf '
    || E'(IE MG 004663921.00-10 · CPF 117.218.286-80 · Fazenda Vargem Grande).',
    jsonb_build_array(jsonb_build_object(
        'at', to_char(timezone('utc'::text, now()), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
        'kind', 'status',
        'to', 'nova',
        'by', 'sistema',
        'text', 'Reserva criada via grupo WhatsApp (cliente recorrente)'
    )),
    (SELECT id FROM public.crm_leads
     WHERE telefone = '__TELEFONE_LORENZO__'
        OR nome = 'Lorenzo Monteiro Martins'
     ORDER BY created_at DESC LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM public.product_reservations
    WHERE customer_doc = '117.218.286-80'
      AND product_name = 'Dose de Sêmen - VOLANTE MRA'
      AND quantity = 50
      AND created_at::date = CURRENT_DATE
);
