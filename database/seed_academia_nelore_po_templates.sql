-- ============================================================================
-- Templates da campanha "Academia do Nelore P.O — Apresentação Institucional"
-- ============================================================================
-- Data: 2026-05-11
--
-- Este seed adiciona/atualiza os templates específicos do fluxo institucional
-- usado com os participantes do grupo WhatsApp "Academia do Nelore P.O".
--
-- A Central WhatsApp segue funcionando com `welcome-default` + `triagem-*`
-- padrão. Quando um lead carrega a tag `grupo_academia_nelore_po`, o engine
-- (src/lib/whatsapp-flow-engine.ts) automaticamente prefere as variantes
-- "-academia" registradas aqui — mantendo o comportamento padrão intacto
-- para os demais contatos.
--
-- Idempotente: pode ser reaplicado, atualiza title/body/category/variables.
-- ============================================================================

INSERT INTO public.whatsapp_templates (slug, title, category, body, variables) VALUES

-- 1. Welcome institucional da Academia
(
    'welcome-academia-nelore-po',
    'Welcome · Academia do Nelore P.O (apresentação institucional)',
    'welcome',
    E'Olá, tudo bem? Aqui é da Fórmula do Boi.\n\nEstamos organizando uma comunicação mais direta com os participantes da Academia do Nelore P.O para compartilhar oportunidades e informações relevantes ligadas à genética Nelore P.O.\n\nA Fórmula do Boi atua na comercialização de sêmen, embriões e na assessoria comercial em leilões, conectando criadores, centrais, vendedores e compradores com mais critério, transparência e organização.\n\nO Matheus, diretor da empresa, está à disposição para conversar pessoalmente quando houver interesse em uma oportunidade, parceria ou negociação.\n\nPara direcionarmos corretamente, responda com uma opção:\n\n1 — Sêmen\n2 — Embriões\n3 — Assessoria em leilões\n4 — Quero ofertar genética\n5 — Quero receber oportunidades\n6 — Falar com Matheus/equipe\n\nPara sair da lista, responda PARAR.',
    '["nome"]'::jsonb
),

-- 2. Triagem · interesse em sêmen
(
    'triagem-semen-academia',
    'Triagem · Sêmen (Academia)',
    'triagem',
    E'Perfeito. Vou registrar seu interesse em sêmen.\n\nA Fórmula do Boi trabalha com oportunidades selecionadas em genética Nelore P.O e pode ajudar a direcionar opções conforme o objetivo do rebanho, linhagem desejada, orçamento e disponibilidade.\n\nPara avançarmos melhor, envie por favor:\n\n1. Qual perfil de genética você busca?\n2. Tem preferência por algum reprodutor, central ou linhagem?\n3. A compra seria para uso próprio ou revenda?\n\nSe preferir, o Matheus ou alguém da equipe pode te chamar para entender melhor.',
    '["nome"]'::jsonb
),

-- 3. Triagem · interesse em embriões
(
    'triagem-embrioes-academia',
    'Triagem · Embriões (Academia)',
    'triagem',
    E'Perfeito. Vou registrar seu interesse em embriões.\n\nA Fórmula do Boi pode auxiliar na conexão com oportunidades selecionadas em embriões Nelore P.O, considerando origem genética, avaliação do acasalamento, histórico da doadora e objetivo do comprador.\n\nPara direcionarmos melhor, envie:\n\n1. Você busca embriões para produção, seleção ou investimento?\n2. Tem preferência por linhagem ou família?\n3. Qual faixa de quantidade ou orçamento aproximado?\n\nSe fizer sentido, o Matheus pode te chamar para avaliar a melhor oportunidade.',
    '["nome"]'::jsonb
),

-- 4. Triagem · interesse em assessoria de leilões
(
    'triagem-leiloes-academia',
    'Triagem · Assessoria em leilões (Academia)',
    'triagem',
    E'Ótimo. Vou registrar seu interesse em assessoria em leilões.\n\nA Fórmula do Boi atua apoiando negociações, leitura de oportunidades, organização comercial e relacionamento entre compradores, vendedores e eventos do setor.\n\nPara entender melhor seu caso, me diga:\n\n1. Você participa como comprador, vendedor ou organizador?\n2. O leilão já tem data definida?\n3. Você precisa de apoio comercial, divulgação, captação de compradores ou análise das oportunidades?\n\nO Matheus, diretor da Fórmula do Boi, está à disposição para conversar sobre o melhor formato de apoio.',
    '["nome"]'::jsonb
),

-- 5. Triagem · vontade de ofertar genética
(
    'triagem-oferta-genetica',
    'Triagem · Quero ofertar genética',
    'triagem',
    E'Perfeito. Vou registrar que você tem interesse em ofertar genética.\n\nA Fórmula do Boi pode avaliar oportunidades envolvendo sêmen, embriões e genética Nelore P.O, sempre buscando uma abordagem comercial organizada e alinhada ao perfil do mercado.\n\nPara análise inicial, envie:\n\n1. O que você deseja ofertar? Sêmen, embriões ou outro material genético?\n2. Qual a origem genética?\n3. Já possui documentação, registro, central ou informações técnicas?\n4. Qual seria a condição comercial desejada?\n\nDepois disso, o Matheus ou alguém da equipe pode avaliar e retornar com o melhor encaminhamento.',
    '["nome"]'::jsonb
),

-- 6. Receber oportunidades selecionadas
(
    'receber-oportunidades-academia',
    'Quero receber oportunidades (Academia)',
    'oportunidade',
    E'Combinado. Vou marcar você para receber oportunidades selecionadas da Fórmula do Boi.\n\nNosso foco é enviar apenas informações relevantes sobre genética Nelore P.O, sêmen, embriões e oportunidades ligadas a leilões, evitando excesso de mensagens.\n\nQuando quiser falar com a equipe, é só responder por aqui.\n\nPara sair da lista a qualquer momento, responda PARAR.',
    '["nome"]'::jsonb
),

-- 7. Handoff humano (Matheus / equipe)
(
    'consultor-handoff-matheus',
    'Encaminhamento · Matheus / equipe (Academia)',
    'encaminhamento',
    E'Perfeito. Vou encaminhar seu contato para atendimento humano.\n\nO Matheus, diretor da Fórmula do Boi, ou alguém da equipe vai te chamar para entender melhor sua necessidade e avaliar o melhor caminho.\n\nSe puder, envie em poucas palavras o assunto principal:\nsêmen, embriões, leilão, venda de genética ou parceria.',
    '["nome"]'::jsonb
),

-- 8. Follow-up 24h sem resposta
(
    'follow-up-academia-24h',
    'Follow-up 24h · Academia',
    'follow_up',
    E'Olá, tudo bem?\n\nPassando só para confirmar se você tem interesse em receber informações da Fórmula do Boi sobre genética Nelore P.O.\n\nHoje nosso foco está em sêmen, embriões e assessoria comercial em leilões.\n\nResponda com uma opção:\n\n1 — Sêmen\n2 — Embriões\n3 — Leilões\n4 — Quero ofertar genética\n5 — Receber oportunidades\n6 — Falar com Matheus/equipe\n\nSe não quiser receber mensagens, responda PARAR.',
    '["nome"]'::jsonb
),

-- 9. Follow-up final (silêncio)
(
    'follow-up-academia-final',
    'Follow-up final · Academia',
    'follow_up',
    E'Olá. Como você ainda não respondeu, vou deixar seu contato sem novas mensagens automáticas por enquanto.\n\nCaso queira falar com a Fórmula do Boi sobre sêmen, embriões, genética Nelore P.O ou assessoria em leilões, é só responder por aqui.\n\nO Matheus e a equipe ficam à disposição.',
    '["nome"]'::jsonb
),

-- 10. Confirmação de opt-out (substitui mensagem genérica quando lead é Academia)
(
    'optout-confirmacao-academia',
    'Confirmação de opt-out · Academia',
    'optout',
    E'Tudo certo. Seu contato foi removido da lista de mensagens da Fórmula do Boi.\n\nVocê não receberá novas comunicações automáticas por aqui.\n\nCaso queira voltar a receber, responda VOLTAR.',
    '["nome"]'::jsonb
),

-- 10b. Resubscribe → reenvia confirmação + menu institucional num mesmo turno
(
    'resubscribe-msg-academia',
    'Reativação · Academia (reenvia menu institucional)',
    'reativacao',
    E'Que bom ter você de volta! Seu contato foi reativado e voltará a receber comunicações da Fórmula do Boi.\n\nPara direcionarmos corretamente, responda com uma opção:\n\n1 — Sêmen\n2 — Embriões\n3 — Assessoria em leilões\n4 — Quero ofertar genética\n5 — Quero receber oportunidades\n6 — Falar com Matheus/equipe\n\nPara sair da lista novamente, responda PARAR.',
    '["nome"]'::jsonb
),

-- 11. Aviso para o próprio grupo Academia (envio manual)
(
    'aviso-grupo-academia-nelore-po',
    'Aviso para o grupo · Academia do Nelore P.O',
    'aviso',
    E'Pessoal, boa tarde.\n\nEstamos organizando a comunicação da Fórmula do Boi com os participantes da Academia do Nelore P.O.\n\nA ideia é facilitar o contato sobre oportunidades envolvendo sêmen, embriões, genética Nelore P.O e assessoria em leilões.\n\nQuem receber nossa mensagem no privado pode responder com a opção de interesse para direcionarmos melhor. O Matheus, diretor da Fórmula do Boi, também está à disposição para conversar quando houver uma demanda específica.\n\nObrigado.',
    '[]'::jsonb
)

ON CONFLICT (slug) DO UPDATE SET
    title     = EXCLUDED.title,
    category  = EXCLUDED.category,
    body      = EXCLUDED.body,
    variables = EXCLUDED.variables,
    archived  = false,
    updated_at = timezone('utc'::text, now());


-- ────────────────────────────────────────────────────────────────────────────
-- Helper opcional: aplicar a tag "grupo_academia_nelore_po" a leads existentes
-- ────────────────────────────────────────────────────────────────────────────
-- Adicione manualmente os telefones que pertencem ao grupo Academia para que
-- o engine entenda essas conversas no mapeamento institucional (1-6) e use as
-- variantes "*-academia"/consultor-handoff-matheus nas respostas.
--
-- Substitua a lista de telefones abaixo (apenas dígitos com DDI 55) e descomente:
--
-- UPDATE public.crm_leads
-- SET tags_whatsapp = (
--         CASE
--             WHEN tags_whatsapp ? 'grupo_academia_nelore_po' THEN tags_whatsapp
--             ELSE tags_whatsapp || '["grupo_academia_nelore_po"]'::jsonb
--         END
--     )
-- WHERE telefone IN (
--     '5567999999999',
--     '5567988888888'
--     -- ...
-- );
