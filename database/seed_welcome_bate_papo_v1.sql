-- ============================================================================
-- Welcome em duas etapas: convite ao bate-papo com o Matheus → Calendly
-- ============================================================================
-- Data: 2026-05-19
--
-- Este seed reorganiza o welcome default em duas etapas:
--
--   1. `welcome-default` (REESCRITO): apresentação do Matheus + 3 frentes da
--      empresa + convite direto pra um bate-papo (chamada). O menu enxuto vira
--      apenas 2 opções:
--          1 — Sim, quero agendar uma conversa com você
--          2 — Por enquanto prefiro só receber informações por aqui
--
--   2. `bate-papo-aceito` (NOVO): resposta quando o lead clica "1". Envia o
--      link do Calendly (mesma URL canônica usada em `agendamento-link` e em
--      `site_settings.agendamentos_calendar.calendly_event_url`). Quando o
--      lead reservar pelo Calendly, o cron `/api/agendamentos/sync` materializa
--      o evento em `agendamentos` automaticamente — não há criação manual de
--      registro nesse momento.
--
--   3. `bate-papo-recusado` (NOVO): resposta quando o lead clica "2". Mostra o
--      menu original de 4 interesses (sêmen / embriões / compra-venda / todos)
--      pra que a triagem siga existindo. A lógica de estado vive nos tags
--      `whatsapp:bate_papo_pendente` (set ao enviar o welcome) e
--      `whatsapp:menu_interesses_v2` (set ao enviar `bate-papo-recusado`) —
--      o classifier em src/lib/whatsapp-central.ts usa esses tags pra decidir
--      o que "1/2/3/4" significa no momento da resposta.
--
-- O template `agendamento-link` (slug separado) continua existindo pra envios
-- manuais que o operador faça pelo Inbox; o conteúdo é equivalente ao
-- `bate-papo-aceito`, mas o slug aqui é dedicado ao gancho automatizado do
-- welcome v2.
--
-- Idempotente: usa `ON CONFLICT (slug) DO UPDATE`. Reaplicar é seguro.
-- ============================================================================

INSERT INTO public.whatsapp_templates (slug, title, category, body, variables) VALUES

-- 1. Welcome default — convite ao bate-papo (2 opções)
(
    'welcome-default',
    'Boas-vindas (padrão · Matheus · bate-papo v1)',
    'welcome',
    E'Olá, {nome}, tudo bem?\n\nAqui é o Matheus, da Fórmula do Boi.\n\nQuero te dar as boas-vindas e deixar este canal aberto para que você receba apenas conteúdos e oportunidades alinhados ao seu interesse dentro da genética Nelore P.O.\n\nHoje a Fórmula do Boi atua como um canal direto de comercialização de genética, conectando criadores ao que existe de mais avançado na raça Nelore P.O através de três frentes estratégicas:\n\n* Aceleradora de Touros — seleção de reprodutores com excelência zootécnica e avaliações nos principais programas da ABCZ;\n\n* Central de Embriões — oferta de embriões de doadoras importantes, com acasalamentos direcionados e foco em produtividade e evolução genética;\n\n* Assessoria em Leilões — atuação estratégica nos principais leilões da raça, aproximando compradores das melhores oportunidades do mercado.\n\nAntes de mais nada, queria te convidar para um bate-papo direto comigo por chamada — uns 15 a 20 minutos. Assim eu entendo seu momento na pecuária e te direciono com mais precisão dentro de cada uma dessas frentes.\n\nTopa? Me responde com o número da opção:\n\n1 — Sim, quero agendar uma conversa com você\n2 — Por enquanto prefiro só receber informações por aqui\n\nFico à disposição.\n\nCaso não queira mais receber nossas mensagens, basta responder PARAR.',
    '["nome"]'::jsonb
),

-- 2. Bate-papo aceito — envia o link curto da agenda
-- IMPORTANTE: usa o link público `formuladoboi.com/agendar` em vez do slug
-- interno do Calendly. A rota faz 302 pra URL configurada em
-- `site_settings.agendamentos_calendar.calendly_event_url` — assim o cliente
-- vê o domínio da empresa, e a gente pode trocar a ferramenta de agendamento
-- depois sem reescrever template.
(
    'bate-papo-aceito',
    'Bate-papo · aceito (link agendamento)',
    'agendamento',
    E'Que ótimo, {nome}.\n\nVou te mandar o link da minha agenda — escolhe o horário que te atende melhor (dias úteis, das 14h às 16h30, horário de Brasília):\n\nhttps://formuladoboi.com/agendar\n\nAssim que você confirmar, recebo aqui e te ligo no horário marcado. Se precisar de outro horário, é só me avisar por aqui mesmo.',
    '["nome"]'::jsonb
),

-- 3. Bate-papo recusado — mantém canal aberto + mostra menu de interesses
(
    'bate-papo-recusado',
    'Bate-papo · recusado (menu de interesses)',
    'triagem',
    E'Combinado, {nome}.\n\nVou manter este canal aberto e te enviar apenas oportunidades alinhadas ao seu interesse. Sempre que quiser conversar comigo diretamente, é só me chamar por aqui — agendamos uma chamada na hora.\n\nPra eu direcionar o conteúdo certo pra você, me responde com o número da opção que mais faz sentido pro seu momento:\n\n1 — Sêmen\n2 — Embriões\n3 — Compra e venda de genética Nelore P.O\n4 — Todos\n\nCaso prefira sair da lista, basta responder PARAR.',
    '["nome"]'::jsonb
)

ON CONFLICT (slug) DO UPDATE SET
    title      = EXCLUDED.title,
    category   = EXCLUDED.category,
    body       = EXCLUDED.body,
    variables  = EXCLUDED.variables,
    archived   = false,
    updated_at = timezone('utc'::text, now());
