-- ============================================================================
-- Reset do fluxo default da Central WhatsApp para a voz do Matheus (1ª pessoa)
-- ============================================================================
-- Data: 2026-05-12
--
-- Este script:
--   1. Reescreve o template `welcome-default` com a apresentação institucional
--      do Matheus e um menu enxuto de 4 opções:
--          1 — Sêmen
--          2 — Embriões
--          3 — Compra e venda de genética Nelore P.O
--          4 — Todos
--   2. Reescreve TODOS os templates de continuação do fluxo default em
--      primeira pessoa, como se o Matheus estivesse falando — sem emojis, sem
--      "vou te encaminhar para um consultor", sem o "nós" institucional.
--   3. Cobre TODO o fluxo default: welcome, triagens (4 do menu + 5 legadas
--      acessadas por palavra-chave), handoff humano, opt-out, resubscribe,
--      follow-up 3d e aviso de leilão.
--
-- Slugs cobertos (13 templates):
--   welcome-default · triagem-semen · triagem-embrioes ·
--   triagem-compra-venda-genetica · triagem-interesse-amplo ·
--   triagem-touros · triagem-matrizes · triagem-central-embrioes ·
--   triagem-leiloes · triagem-venda-genetica · consultor-handoff ·
--   optout-confirmacao · resubscribe-msg · follow-up-3d · aviso-leilao
--
-- O mapeamento numérico do classifier vive em src/lib/whatsapp-central.ts
-- (DEFAULT_NUMERIC_MAP) e deve permanecer em sincronia com este body.
--
-- Idempotente: o INSERT … ON CONFLICT (slug) DO UPDATE reaplica title/body/
-- category/variables a cada execução. Os templates "-academia" e
-- "welcome-matheus-institucional" NÃO são tocados aqui — vivem nos seeds
-- dedicados a essas audiências (seed_academia_nelore_po_templates.sql e
-- seed_welcome_matheus_institucional.sql), que têm tom intencionalmente
-- diferente (institucional / apresentação coletiva) por servirem audiências
-- com tag específica.
-- ============================================================================

INSERT INTO public.whatsapp_templates (slug, title, category, body, variables) VALUES

-- 1. Welcome default — voz do Matheus em 1ª pessoa, 4 opções
(
    'welcome-default',
    'Boas-vindas (padrão · Matheus)',
    'welcome',
    E'Olá, {nome}, tudo bem?\n\nAqui é o Matheus, da Fórmula do Boi.\n\nQuero te dar as boas-vindas e deixar este canal aberto para que você receba apenas conteúdos e oportunidades alinhados ao seu interesse dentro da genética Nelore P.O.\n\nHoje a Fórmula do Boi atua como um canal direto de comercialização de genética, conectando criadores ao que existe de mais avançado na raça Nelore P.O através de três frentes estratégicas:\n\n* Aceleradora de Touros — seleção de reprodutores com excelência zootécnica e avaliações nos principais programas da ABCZ;\n\n* Central de Embriões — oferta de embriões de doadoras importantes, com acasalamentos direcionados e foco em produtividade e evolução genética;\n\n* Assessoria em Leilões — atuação estratégica nos principais leilões da raça, aproximando compradores das melhores oportunidades do mercado.\n\nPara que eu consiga direcionar melhor as informações que você recebe, me responda com o número da opção que mais faz sentido para o seu momento:\n\n1 — Sêmen\n2 — Embriões\n3 — Compra e venda de genética Nelore P.O\n4 — Todos\n\nFico à disposição.\n\nCaso não queira mais receber nossas mensagens, basta responder PARAR.',
    '["nome"]'::jsonb
),

-- 2. Triagem · 1 = Sêmen
(
    'triagem-semen',
    'Triagem · Sêmen (padrão · Matheus)',
    'triagem',
    E'Ótimo, {nome}.\n\nVou anotar aqui que seu foco agora é em sêmen, então direciono pra você apenas oportunidades alinhadas a isso — touros provados, lançamentos da Aceleradora de Touros e ofertas pontuais que façam sentido pro seu rebanho.\n\nPra eu te apresentar algo certeiro, me conta rapidamente:\n\n1. Você busca sêmen pra rebanho comercial, seleção ou para ofertar adiante?\n2. Tem preferência por linhagem, central ou algum reprodutor específico em mente?\n3. Tem uma janela de aquisição ou volume aproximado que esteja considerando?\n\nAssim que você me responder, eu já te chamo aqui mesmo pra alinhar a melhor proposta.',
    '["nome"]'::jsonb
),

-- 3. Triagem · 2 = Embriões
(
    'triagem-embrioes',
    'Triagem · Embriões (padrão · Matheus)',
    'triagem',
    E'Ótimo, {nome}.\n\nVou registrar seu interesse em embriões. Hoje a Fórmula do Boi opera tanto na Central de Embriões própria quanto na intermediação de lotes selecionados de doadoras importantes da raça — sempre com foco em produtividade e evolução genética.\n\nPra eu te enviar exatamente o que faz sentido pro seu programa, me responde:\n\n1. Quantos embriões você pretende implantar nessa janela?\n2. Tem preferência por alguma família, linhagem ou doadora específica?\n3. Seu foco é seleção, produção comercial ou investimento em genética?\n\nCom essas informações eu já te trago propostas concretas — e, se preferir, agendo uma conversa direta comigo pra avaliarmos juntos.',
    '["nome"]'::jsonb
),

-- 4. Triagem · 3 = Compra e venda de genética Nelore P.O
(
    'triagem-compra-venda-genetica',
    'Triagem · Compra e venda de genética (padrão · Matheus)',
    'triagem',
    E'Ótimo, {nome}.\n\nVou registrar seu interesse em compra e venda de genética Nelore P.O. A Fórmula do Boi atua dos dois lados — apoiando quem quer adquirir genética selecionada e quem quer comercializar o que tem de melhor no rebanho.\n\nPra eu te direcionar com precisão, me conta:\n\n1. Você está mais interessado em comprar, vender ou ambos?\n2. Que tipo de material? Sêmen, embriões, animais (touros / matrizes) ou outro?\n3. Tem alguma demanda, prazo ou objetivo específico em mente?\n\nCom essas informações eu já consigo te apresentar oportunidades reais — ou, se for o caso, posicionar o que você tem dentro da rede de compradores qualificados que a gente acompanha.',
    '["nome"]'::jsonb
),

-- 5. Triagem · 4 = Todos
(
    'triagem-interesse-amplo',
    'Triagem · Todos os segmentos (padrão · Matheus)',
    'triagem',
    E'Combinado, {nome}.\n\nVou te marcar pra receber comunicações sobre todas as frentes da Fórmula do Boi: Aceleradora de Touros, Central de Embriões, Assessoria em Leilões e oportunidades de compra e venda de genética Nelore P.O.\n\nEu mantenho o canal enxuto — só te chamo aqui quando tiver algo realmente relevante: lançamento de reprodutor, novo lote de embriões, leilão estratégico ou oportunidade pontual de negócio.\n\nQuando quiser conversar diretamente comigo sobre algum tema específico, é só responder por aqui que eu te chamo. E, a qualquer momento, se preferir sair da lista, basta mandar PARAR.',
    '["nome"]'::jsonb
),

-- 6. Triagem · Touros (capturado por palavra-chave / lead legado)
(
    'triagem-touros',
    'Triagem · Touros (padrão · Matheus)',
    'triagem',
    E'Ótimo, {nome}.\n\nVou registrar seu interesse em touros. A Aceleradora de Touros da Fórmula do Boi seleciona reprodutores com excelência zootécnica e avaliação nos principais programas da ABCZ.\n\nPra eu te apresentar opções certeiras, me conta:\n\n1. Você está buscando touros pra cobertura comercial, seleção ou revenda?\n2. Quantas matrizes pretende cobrir nessa janela?\n3. Tem preferência por linhagem ou perfil de morfologia / DEPs?\n\nAssim que me responder, eu já te trago o que faz mais sentido — e, se quiser, agendamos uma conversa direta.',
    '["nome"]'::jsonb
),

-- 7. Triagem · Matrizes (capturado por palavra-chave / lead legado)
(
    'triagem-matrizes',
    'Triagem · Matrizes (padrão · Matheus)',
    'triagem',
    E'Ótimo, {nome}.\n\nVou anotar que seu foco é em matrizes. Pra eu te direcionar pra fêmeas alinhadas ao seu objetivo, me responda:\n\n1. Quantas matrizes você busca nessa janela?\n2. Foco em produção comercial, doadora ou animal de seleção / registro?\n3. Tem preferência por linhagem ou alguma família específica?\n\nCom isso em mãos eu já avalio o que temos circulando e te apresento o melhor cenário.',
    '["nome"]'::jsonb
),

-- 8. Triagem · Central de embriões (capturado por palavra-chave)
(
    'triagem-central-embrioes',
    'Triagem · Central de embriões (padrão · Matheus)',
    'triagem',
    E'Ótimo, {nome}.\n\nVou registrar seu interesse na operação de central de embriões. A Fórmula do Boi acompanha de perto esse universo — desde estrutura de doadoras até direcionamento comercial dos acasalamentos.\n\nPra eu te direcionar com precisão, me responda:\n\n1. Você já opera uma central, está montando uma ou está avaliando uma parceria?\n2. Seu foco é produção própria, terceirização ou comercial?\n3. Tem alguma demanda específica em aberto agora (genética, estrutura, mercado)?\n\nCom essas informações eu já consigo te chamar aqui pra uma conversa mais técnica e direcionada.',
    '["nome"]'::jsonb
),

-- 9. Triagem · Leilões / assessoria
(
    'triagem-leiloes',
    'Triagem · Leilões / assessoria (padrão · Matheus)',
    'triagem',
    E'Ótimo, {nome}.\n\nA Fórmula do Boi atua estrategicamente nos principais leilões da raça — tanto apoiando compradores na leitura das oportunidades quanto vendedores na captação e organização comercial.\n\nPra eu te direcionar pro cenário certo, me responda:\n\n1. Você participa como comprador, vendedor ou organizador?\n2. Tem algum leilão em mente — data, evento ou catálogo?\n3. Precisa de apoio comercial, análise das oportunidades ou captação de compradores?\n\nSe quiser, eu te chamo aqui mesmo pra uma conversa direta — ou já te envio o cronograma atualizado dos próximos leilões que acompanho.',
    '["nome"]'::jsonb
),

-- 10. Triagem · Venda de genética (slug legado, mantido pra leads históricos)
(
    'triagem-venda-genetica',
    'Triagem · Venda de genética (padrão · Matheus)',
    'triagem',
    E'Ótimo, {nome}.\n\nVou registrar que você quer ofertar genética. A Fórmula do Boi avalia e posiciona oportunidades reais de sêmen, embriões e animais Nelore P.O dentro da rede de compradores que a gente acompanha.\n\nPra eu te dar um retorno consistente, me responda:\n\n1. O que você quer ofertar? Sêmen, embriões, animais ou outro material?\n2. Qual a origem genética e o que ela tem de relevante?\n3. Já tem documentação, registro, DEPs ou material visual disponível?\n4. Qual seria a condição comercial que você considera justa?\n\nCom isso em mãos, eu olho seu caso pessoalmente e te retorno aqui com o melhor encaminhamento.',
    '["nome"]'::jsonb
),

-- 11. Handoff humano (palavras-chave: "consultor", "humano", "Matheus"…)
--    Como agora todo lead default já está conversando com o Matheus, o handoff
--    apenas reforça a presença direta dele.
(
    'consultor-handoff',
    'Encaminhamento direto (padrão · Matheus)',
    'encaminhamento',
    E'Pode falar, {nome}.\n\nEstou aqui — me conta em poucas palavras o que você precisa: sêmen, embriões, leilão, compra ou venda de genética, ou outra demanda.\n\nA partir disso, eu te respondo pessoalmente por aqui mesmo. Se for o caso, agendo uma conversa por chamada também.',
    '["nome"]'::jsonb
),

-- 12. Opt-out (padrão · 1ª pessoa Matheus, sem emojis)
(
    'optout-confirmacao',
    'Confirmação de opt-out (padrão · Matheus)',
    'optout',
    E'Tudo certo, {nome}.\n\nSeu contato foi removido da minha lista de envios automáticos da Fórmula do Boi. Você não vai mais receber mensagens minhas por aqui.\n\nSe um dia mudar de ideia, é só responder VOLTAR a qualquer momento. Obrigado pelo retorno.',
    '["nome"]'::jsonb
),

-- 13. Resubscribe (padrão · 1ª pessoa Matheus)
(
    'resubscribe-msg',
    'Reativação (padrão · Matheus)',
    'reativacao',
    E'Que bom ter você de volta, {nome}.\n\nReativei seu contato e a partir de agora você volta a receber comunicações da Fórmula do Boi de novo.\n\nPra eu te direcionar pro que faz mais sentido nesse momento, me responda com uma das opções:\n\n1 — Sêmen\n2 — Embriões\n3 — Compra e venda de genética Nelore P.O\n4 — Todos\n\nSe quiser sair de novo, basta responder PARAR.',
    '["nome"]'::jsonb
),

-- 14. Follow-up 3 dias sem resposta (padrão · 1ª pessoa Matheus)
(
    'follow-up-3d',
    'Follow-up 3 dias sem resposta (padrão · Matheus)',
    'follow_up',
    E'Oi, {nome}, tudo bem?\n\nNotei que a gente começou a conversa aqui há alguns dias e eu acabei não te retornando pessoalmente — quero retomar.\n\nSeu interesse é em {interesse}, certo? Posso te chamar agora pra alinharmos o que faz mais sentido, ou se preferir ajustamos o foco pra outra frente: sêmen, embriões, leilão ou compra e venda de genética Nelore P.O.\n\nMe responde aqui mesmo, eu sigo a conversa.',
    '["nome", "interesse"]'::jsonb
),

-- 15. Aviso de leilão (padrão · 1ª pessoa Matheus, mantém variáveis originais)
(
    'aviso-leilao',
    'Aviso de leilão (padrão · Matheus)',
    'leilao',
    E'Oi, {nome}.\n\nQuero te avisar pessoalmente que vem leilão na agenda: {leilao_nome} em {leilao_data}.\n\nA Fórmula do Boi está acompanhando — se você quiser, posso te passar a leitura das oportunidades do catálogo e te orientar nos lotes que valem a pena olhar com mais atenção.\n\nCatálogo completo: {leilao_link}\n\nMe chama por aqui se quiser conversar antes do evento.',
    '["nome", "leilao_nome", "leilao_data", "leilao_link"]'::jsonb
)

ON CONFLICT (slug) DO UPDATE SET
    title      = EXCLUDED.title,
    category   = EXCLUDED.category,
    body       = EXCLUDED.body,
    variables  = EXCLUDED.variables,
    archived   = false,
    updated_at = timezone('utc'::text, now());
