-- ============================================================
-- Campanhas WhatsApp Central — disparo inicial geral + aviso de leilão
-- ============================================================
-- Data: 2026-05-12
--
-- Cria dois templates (voz do Matheus, 1ª pessoa, sem emojis, com
-- instrução de opt-out — alinhado ao padrão canônico documentado em
-- database/seed_welcome_default_matheus_1p.sql) e duas campanhas em
-- status='rascunho'. NADA É DISPARADO por este script — o operador
-- valida segmento pela UI (Campanhas → Pré-visualizar) e só então
-- clica Disparar.
--
-- Campanha 1 — Disparo inicial geral
--   Alvo: TODA a base do CRM com telefone preenchido e não-optout
--   (segment={} resolve isso automaticamente em src/lib/whatsapp-segment.ts).
--   Mensagem: apresentação Matheus + menu enxuto de 4 opções.
--   Pronta para disparar como está.
--
-- Campanha 2 — Aviso de leilão (rascunho)
--   Alvo: idem (segment={}). Ajuste no UI se quiser focar por
--   interesse_principal.
--   Mensagem: TEM PLACEHOLDERS EM COLCHETES — [LEILAO_NOME], [DATA],
--   [HORA], [LINK]. Esses NÃO são interpolados pela engine (apenas
--   {nome} é). Você precisa editar o body no UI antes de disparar.
--
-- Idempotente:
--   * Templates: ON CONFLICT(slug) DO NOTHING.
--   * Campanhas: WHERE NOT EXISTS por nome (não há UNIQUE em name,
--     então usamos o nome como chave de seed).
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1) Templates
-- ────────────────────────────────────────────────────────────
INSERT INTO public.whatsapp_templates (slug, title, category, body, variables) VALUES
(
    'disparo-inicial-base-crm',
    'Disparo inicial — base CRM (reativação Matheus)',
    'campanha',
    E'{nome}, aqui é o Matheus da Fórmula do Boi.\n\nEstou passando aqui pra retomar o contato e te apresentar as três frentes em que trabalho hoje com Nelore P.O:\n\n- Aceleradora de Touros — sêmen, doses e programas de uso\n- Central de Embriões — doadoras e produção sob medida\n- Assessoria em Leilões e compra/venda de genética\n\nMe responde só com o número da frente que mais te interessa hoje que eu já te chamo direto aqui mesmo:\n\n1 — Sêmen\n2 — Embriões\n3 — Compra e venda de genética Nelore P.O\n4 — Todos\n\nSe não fizer sentido pra você agora, responde *PARAR* que eu te tiro da lista na hora — sem problema nenhum.',
    '["nome"]'::jsonb
),
(
    'aviso-leilao-matheus',
    'Aviso de leilão (Matheus, sem emojis)',
    'leilao',
    E'{nome}, aqui é o Matheus da Fórmula do Boi.\n\nTem leilão entrando na agenda que acho que vale a pena você dar uma olhada:\n\n*{leilao_nome}* — {leilao_data} às {leilao_hora}.\n\nO catálogo e os detalhes do remate tão aqui: {leilao_link}\n\nSe quiser que eu te oriente em algum lote específico ou tirar dúvida sobre os animais, me chama aqui mesmo que eu te respondo direto.\n\nSe preferir não receber mais avisos de leilão, responde *PARAR*.',
    -- IMPORTANTE: {leilao_*} acima é apenas documentação do template.
    -- A engine de campanha só interpola {nome}. Para usar este template
    -- numa campanha, copie o corpo, substitua os {leilao_*} pelos dados
    -- reais e cole no body da campanha (UI: Campanhas → editar → body).
    '["nome","leilao_nome","leilao_data","leilao_hora","leilao_link"]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- 2) Campanha 1 — Disparo inicial geral
-- ────────────────────────────────────────────────────────────
-- Sem body próprio → engine usa o body do template
-- (resolveStepContent em src/lib/whatsapp-campaign-step.ts:64).
-- {nome} é interpolado por destinatário. Pronta para disparar.
INSERT INTO public.whatsapp_campaigns (
    name, description, segment, template_id, body, status,
    stop_on_reply, stop_on_optout, stop_on_handoff, stop_on_interest,
    reply_tag, reply_handoff
)
SELECT
    'Disparo inicial — base geral CRM',
    'Reativação de toda a base do CRM com WhatsApp válido. Apresentação Matheus 1ª pessoa + menu enxuto (4 opções) + opt-out. Disparo único, sem follow-up.',
    '{}'::jsonb,
    (SELECT id FROM public.whatsapp_templates WHERE slug = 'disparo-inicial-base-crm'),
    NULL,
    'rascunho',
    true,
    true,
    true,
    false,
    'campanha-reativacao-respondeu',
    false  -- deixa o flow engine classificar a resposta; não força handoff
WHERE NOT EXISTS (
    SELECT 1 FROM public.whatsapp_campaigns
    WHERE name = 'Disparo inicial — base geral CRM'
);


-- ────────────────────────────────────────────────────────────
-- 3) Campanha 2 — Aviso de leilão (rascunho — preencher antes)
-- ────────────────────────────────────────────────────────────
-- Tem body próprio com placeholders em COLCHETES propositalmente
-- esquisitos ([LEILAO_NOME], [DATA], etc) — a engine não interpola
-- isso, então qualquer envio sem editar vai gritar visualmente.
-- Operador edita no UI antes de disparar.
INSERT INTO public.whatsapp_campaigns (
    name, description, segment, template_id, body, status,
    stop_on_reply, stop_on_optout, stop_on_handoff, stop_on_interest,
    reply_tag, reply_handoff
)
SELECT
    'Aviso de leilão (rascunho — preencher dados antes de disparar)',
    'Aviso sobre próximo leilão. ANTES DE DISPARAR: editar o body trocando [LEILAO_NOME], [DATA], [HORA] e [LINK] pelos valores reais. {nome} fica como está — interpolado automaticamente. Segmento default = todos; ajuste para interesse_principal se quiser focar.',
    '{}'::jsonb,
    (SELECT id FROM public.whatsapp_templates WHERE slug = 'aviso-leilao-matheus'),
    E'{nome}, aqui é o Matheus da Fórmula do Boi.\n\nTem leilão entrando na agenda que acho que vale a pena você dar uma olhada:\n\n*[LEILAO_NOME]* — [DATA] às [HORA].\n\nO catálogo e os detalhes do remate tão aqui: [LINK]\n\nSe quiser que eu te oriente em algum lote específico ou tirar dúvida sobre os animais, me chama aqui mesmo que eu te respondo direto.\n\nSe preferir não receber mais avisos de leilão, responde *PARAR*.',
    'rascunho',
    true,
    true,
    true,
    false,
    'campanha-leilao-respondeu',
    false
WHERE NOT EXISTS (
    SELECT 1 FROM public.whatsapp_campaigns
    WHERE name = 'Aviso de leilão (rascunho — preencher dados antes de disparar)'
);
