-- ============================================================================
-- Welcome institucional do Matheus + triagens dos 3 novos interesses
-- ============================================================================
-- Data: 2026-05-11
--
-- Cria 4 templates novos:
--   1. welcome-matheus-institucional  — apresentação do Matheus + menu 1..6
--   2. triagem-central-embrioes       — opção 3 da enquete
--   3. triagem-compra-venda-genetica  — opção 5
--   4. triagem-interesse-amplo        — opção 6 (Todos)
--
-- O welcome NÃO usa enquete nativa do WhatsApp (a infra existe, mas a
-- estratégia atual é menu numerado em texto). A foto do Matheus deve ser
-- anexada via aba Templates (upload pro R2) — não vai no SQL.
--
-- Idempotente: pode reaplicar.
-- ============================================================================

INSERT INTO public.whatsapp_templates (slug, title, category, body, variables) VALUES

-- 1. Welcome institucional do Matheus
(
    'welcome-matheus-institucional',
    'Welcome · Matheus institucional',
    'welcome',
    E'Olá, {nome}, tudo bem?\n\nAqui é o Matheus, da Fórmula do Boi.\n\nEstou passando para me apresentar e deixar este canal aberto com você.\n\nHoje a Fórmula do Boi atua em algumas frentes dentro da genética Nelore P.O: sêmen, embriões, central de embriões, compra e venda de genética e assessoria em leilões.\n\nQuero entender quais desses assuntos fazem mais sentido para o seu momento, para que a gente consiga te enviar apenas informações e oportunidades realmente relevantes, sem excesso de mensagem.\n\nResponda com o número da opção que mais te interessa:\n\n1 — Sêmen\n2 — Embriões\n3 — Central de embriões\n4 — Assessoria em leilões\n5 — Compra/venda de genética Nelore P.O\n6 — Todos\n\nFico à disposição. Para sair da lista, responda PARAR.',
    '["nome"]'::jsonb
),

-- 2. Triagem · Central de embriões
(
    'triagem-central-embrioes',
    'Triagem · Central de embriões',
    'triagem',
    E'Ótimo, {nome}.\n\nA Fórmula do Boi acompanha de perto o trabalho de centrais de embriões e pode te direcionar para conversa mais consultiva sobre operação, estrutura, doadoras e oportunidades comerciais.\n\nPara entender melhor seu caso, me diga:\n\n1. Você opera uma central, está montando uma ou avalia parceria com uma?\n2. Foco principal: produção própria, terceirização ou comercial?\n3. Tem alguma demanda específica em aberto agora?\n\nLogo o Matheus ou alguém da equipe te chama para conversar.',
    '["nome"]'::jsonb
),

-- 3. Triagem · Compra/venda de genética
(
    'triagem-compra-venda-genetica',
    'Triagem · Compra/venda de genética',
    'triagem',
    E'Perfeito, {nome}. Vou registrar seu interesse em compra/venda de genética Nelore P.O.\n\nA Fórmula do Boi pode atuar dos dois lados — apoiando quem quer adquirir e quem quer ofertar genética. Para direcionar melhor:\n\n1. Você está mais interessado em comprar, vender ou ambos?\n2. Que tipo de material? Sêmen, embriões, animais ou outro?\n3. Tem algum prazo ou necessidade específica?\n\nO Matheus ou alguém da equipe entra em contato com base no que você responder.',
    '["nome"]'::jsonb
),

-- 4. Triagem · Todos os segmentos (interesse amplo)
(
    'triagem-interesse-amplo',
    'Triagem · Todos os segmentos',
    'triagem',
    E'Ótimo, {nome}.\n\nVou te marcar para receber comunicações sobre todas as frentes da Fórmula do Boi: sêmen, embriões, central de embriões, assessoria em leilões e compra/venda de genética Nelore P.O.\n\nPrometo manter o foco no que é realmente relevante, sem excesso de mensagens.\n\nQuando quiser falar diretamente com o Matheus ou com alguém da equipe sobre algum tema específico, é só responder por aqui. Para sair da lista a qualquer momento, responda PARAR.',
    '["nome"]'::jsonb
)

ON CONFLICT (slug) DO UPDATE SET
    title     = EXCLUDED.title,
    category  = EXCLUDED.category,
    body      = EXCLUDED.body,
    variables = EXCLUDED.variables,
    archived  = false,
    updated_at = timezone('utc'::text, now());
