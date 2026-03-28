-- ============================================================
-- BULA ASSESSORIA PECUARIA — Schema completo
-- Tabelas: membros, leiloes, projetos, crm, leads, marketing
-- ============================================================

-- ── MEMBROS DA EQUIPE ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bula_membros (
    id   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    iniciais TEXT NOT NULL,    -- ex: "B" para Bulinha
    cor  TEXT DEFAULT '#C8A96E', -- cor do avatar
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bula_membros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bula_membros_select" ON public.bula_membros FOR SELECT TO authenticated USING (true);
CREATE POLICY "bula_membros_insert" ON public.bula_membros FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "bula_membros_update" ON public.bula_membros FOR UPDATE TO authenticated USING (true);
CREATE POLICY "bula_membros_delete" ON public.bula_membros FOR DELETE TO authenticated USING (true);

-- ── LEILÕES ────────────────────────────────────────────────
-- tasks JSONB: [{nome, cor, tasks:[{id, nome, ini, fim, resp:{nome,ini}, subs:[{lbl,done}]}]}]
CREATE TABLE IF NOT EXISTS public.bula_leiloes (
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome         TEXT NOT NULL,
    data         DATE NOT NULL,
    tipo         TEXT NOT NULL,           -- 'Touros P.O.', 'Femeas P.O.', etc.
    local        TEXT NOT NULL,
    animais      INTEGER DEFAULT 0,
    expectativa  NUMERIC(12,2) DEFAULT 0,
    meta_bula    NUMERIC(12,2) DEFAULT 0,
    realizado_bula NUMERIC(12,2) DEFAULT 0,
    status       TEXT NOT NULL DEFAULT 'prospecto', -- confirmado|negociacao|prospecto|concluido
    img          TEXT DEFAULT '',
    tasks        JSONB DEFAULT '[]'::jsonb,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Junction: leilao <-> membros (assessores escalados)
CREATE TABLE IF NOT EXISTS public.bula_leilao_assessores (
    leilao_id UUID NOT NULL REFERENCES public.bula_leiloes(id) ON DELETE CASCADE,
    membro_id UUID NOT NULL REFERENCES public.bula_membros(id) ON DELETE CASCADE,
    PRIMARY KEY (leilao_id, membro_id)
);

ALTER TABLE public.bula_leiloes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bula_leiloes_all" ON public.bula_leiloes FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.bula_leilao_assessores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bula_leilao_assessores_all" ON public.bula_leilao_assessores FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── PROJETO / KANBAN ───────────────────────────────────────
-- checks JSONB: [{l: "texto", d: false}]
-- comentarios JSONB: [{autor: "Nome", texto: "...", data: "DD/MM/YYYY HH:MM"}]
CREATE TABLE IF NOT EXISTS public.bula_projeto_cards (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo      TEXT NOT NULL,
    descricao   TEXT DEFAULT '',
    coluna      TEXT NOT NULL DEFAULT 'backlog',  -- backlog|afazer|andamento|concluido
    prioridade  TEXT NOT NULL DEFAULT 'media',    -- alta|media|baixa
    vencimento  DATE,
    checks      JSONB DEFAULT '[]'::jsonb,
    comentarios JSONB DEFAULT '[]'::jsonb,
    posicao     INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Junction: card <-> membros (responsáveis)
CREATE TABLE IF NOT EXISTS public.bula_card_responsaveis (
    card_id   UUID NOT NULL REFERENCES public.bula_projeto_cards(id) ON DELETE CASCADE,
    membro_id UUID NOT NULL REFERENCES public.bula_membros(id) ON DELETE CASCADE,
    PRIMARY KEY (card_id, membro_id)
);

ALTER TABLE public.bula_projeto_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bula_cards_all" ON public.bula_projeto_cards FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.bula_card_responsaveis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bula_card_resp_all" ON public.bula_card_responsaveis FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── CRM ────────────────────────────────────────────────────
-- etapas JSONB: [{id: "lead", nome: "Lead", cor: "#555"}]
CREATE TABLE IF NOT EXISTS public.bula_crm_funis (
    id       UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug     TEXT NOT NULL UNIQUE,   -- 'captacao', 'clientes'
    nome     TEXT NOT NULL,
    icone    TEXT DEFAULT 'funnel',
    etapas   JSONB NOT NULL DEFAULT '[]'::jsonb,
    posicao  INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- timeline JSONB: [{type: "Ligacao", date: "DD/MM/YYYY", text: "..."}]
CREATE TABLE IF NOT EXISTS public.bula_crm_deals (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    funil_id        UUID NOT NULL REFERENCES public.bula_crm_funis(id) ON DELETE CASCADE,
    etapa_id        TEXT NOT NULL,         -- references etapas[].id
    nome            TEXT NOT NULL,
    localizacao     TEXT DEFAULT '',
    telefone        TEXT DEFAULT '',
    email           TEXT DEFAULT '',
    valor           NUMERIC(12,2) DEFAULT 0,
    temperatura     TEXT DEFAULT 'frio',   -- quente|morno|frio
    assessor_id     UUID REFERENCES public.bula_membros(id) ON DELETE SET NULL,
    notas           TEXT DEFAULT '',
    timeline        JSONB DEFAULT '[]'::jsonb,
    dias_no_estagio INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bula_crm_funis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bula_funis_all" ON public.bula_crm_funis FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.bula_crm_deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bula_deals_all" ON public.bula_crm_deals FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── LEADS (MARKETING) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bula_leads (
    id        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome      TEXT NOT NULL,
    telefone  TEXT DEFAULT '',
    regiao    TEXT DEFAULT '',          -- estado (MS, GO, MG...)
    rebanho   INTEGER DEFAULT 0,       -- número de cabeças
    origem    TEXT DEFAULT 'Site',     -- Instagram|Google Ads|Facebook|WhatsApp|Site
    status    TEXT DEFAULT 'novo',     -- novo|atendimento|qualificado|descartado
    interesse TEXT DEFAULT '',         -- Touros PO|Femeas PO|Semen|Misto
    orcamento NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bula_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bula_leads_all" ON public.bula_leads FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── CONFIG DE MARKETING ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bula_marketing_config (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    investimento NUMERIC(12,2) DEFAULT 0,
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bula_marketing_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bula_mkt_config_all" ON public.bula_marketing_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- DADOS DE EXEMPLO (seed)
-- ============================================================

-- Membros
INSERT INTO public.bula_membros (id, nome, iniciais, cor) VALUES
  ('11111111-0001-0000-0000-000000000000', 'Bulinha',      'B', '#C8A96E'),
  ('11111111-0002-0000-0000-000000000000', 'Peralta',      'P', '#4A8FBF'),
  ('11111111-0003-0000-0000-000000000000', 'Leo',          'L', '#6B8F5C'),
  ('11111111-0004-0000-0000-000000000000', 'Marcelo',      'M', '#D4A843'),
  ('11111111-0005-0000-0000-000000000000', 'Joao Eduardo', 'J', '#C0504D'),
  ('11111111-0006-0000-0000-000000000000', 'Matheus',      'Mt','#9B59B6')
ON CONFLICT DO NOTHING;

-- Funis CRM
INSERT INTO public.bula_crm_funis (id, slug, nome, icone, etapas, posicao) VALUES
(
  '22222222-0001-0000-0000-000000000000',
  'captacao',
  'Captacao de Leiloes',
  'event_note',
  '[
    {"id":"lead",     "nome":"Lead",     "cor":"#555"},
    {"id":"contato",  "nome":"Contato",  "cor":"#4A8FBF"},
    {"id":"visita",   "nome":"Visita",   "cor":"#D4A843"},
    {"id":"proposta", "nome":"Proposta", "cor":"#C8A96E"},
    {"id":"fechado",  "nome":"Fechado",  "cor":"#6B8F5C"},
    {"id":"perdido",  "nome":"Perdido",  "cor":"#C0504D"}
  ]'::jsonb,
  0
),
(
  '22222222-0002-0000-0000-000000000000',
  'clientes',
  'Clientes',
  'people',
  '[
    {"id":"lead",       "nome":"Lead",       "cor":"#555"},
    {"id":"qualificado","nome":"Qualificado","cor":"#4A8FBF"},
    {"id":"proposta",   "nome":"Proposta",   "cor":"#D4A843"},
    {"id":"negociacao", "nome":"Negociacao", "cor":"#C8A96E"},
    {"id":"fechado",    "nome":"Fechado",    "cor":"#6B8F5C"},
    {"id":"perdido",    "nome":"Perdido",    "cor":"#C0504D"}
  ]'::jsonb,
  1
)
ON CONFLICT DO NOTHING;

-- Config marketing
INSERT INTO public.bula_marketing_config (investimento) VALUES (18600)
ON CONFLICT DO NOTHING;

-- Leilões (6 registros de exemplo)
INSERT INTO public.bula_leiloes (id, nome, data, tipo, local, animais, expectativa, meta_bula, realizado_bula, status, tasks) VALUES
(
  '33333333-0001-0000-0000-000000000000',
  'Nelore Cachoeirão', '2026-06-03', 'Touros P.O.', 'Campo Grande, MS', 45, 225000, 90000, 0, 'confirmado',
  '[{"nome":"Pre-Leilao","cor":"#6B8F5C","tasks":[{"id":"t1","nome":"Visita a fazenda e selecao de animais","ini":"2026-04-15","fim":"2026-04-20","resp":{"nome":"Bulinha","ini":"B"},"subs":[{"lbl":"Agendar visita com proprietario","done":true},{"lbl":"Avaliar lote disponivel","done":true},{"lbl":"Definir animais para catalogo","done":false},{"lbl":"Registrar genealogia dos selecionados","done":false}]},{"id":"t2","nome":"Producao do catalogo","ini":"2026-04-21","fim":"2026-05-05","resp":{"nome":"Leo","ini":"L"},"subs":[{"lbl":"Sessao de fotos dos animais","done":false},{"lbl":"Coleta de dados genealogicos","done":false},{"lbl":"Diagramacao e revisao","done":true},{"lbl":"Aprovacao do cliente","done":false}]},{"id":"t3","nome":"Divulgacao e marketing","ini":"2026-05-01","fim":"2026-05-28","resp":{"nome":"Peralta","ini":"P"},"subs":[{"lbl":"Criar artes para redes sociais","done":true},{"lbl":"Enviar catalogo para mailing","done":false},{"lbl":"Confirmar transmissao ao vivo","done":false},{"lbl":"Publicar anuncios patrocinados","done":true},{"lbl":"Contatar compradores potenciais","done":false}]}]},{"nome":"Leilao","cor":"#C8A96E","tasks":[{"id":"t4","nome":"Montagem do evento","ini":"2026-06-03","fim":"2026-06-03","resp":{"nome":"Bulinha","ini":"B"},"subs":[{"lbl":"Conferir estrutura do local","done":false},{"lbl":"Testar equipamentos de audio/video","done":false},{"lbl":"Organizar lotes por ordem de entrada","done":false}]},{"id":"t5","nome":"Assessoria em pista","ini":"2026-06-03","fim":"2026-06-03","resp":{"nome":"Peralta","ini":"P"},"subs":[{"lbl":"Acompanhar apresentacao dos lotes","done":false},{"lbl":"Orientar lances e negociacoes","done":false},{"lbl":"Registrar arrematantes","done":false}]}]},{"nome":"Pos-Leilao","cor":"#4A8FBF","tasks":[{"id":"t6","nome":"Prestacao de contas","ini":"2026-06-03","fim":"2026-06-10","resp":{"nome":"Leo","ini":"L"},"subs":[{"lbl":"Consolidar valores arrematados","done":false},{"lbl":"Emitir notas fiscais","done":false},{"lbl":"Calcular e recolher comissoes","done":false},{"lbl":"Enviar relatorio ao cliente","done":false}]},{"id":"t7","nome":"Logistica de entrega","ini":"2026-06-03","fim":"2026-06-17","resp":{"nome":"Bulinha","ini":"B"},"subs":[{"lbl":"Coordenar transporte dos animais","done":false},{"lbl":"Emitir GTA (Guia de Transito Animal)","done":false},{"lbl":"Confirmar recebimento pelo comprador","done":false}]}]}]'::jsonb
),
(
  '33333333-0002-0000-0000-000000000000',
  'Nelore Tresmar', '2026-06-11', 'Femeas P.O.', 'Uberaba, MG', 35, 175000, 70000, 0, 'confirmado',
  '[{"nome":"Pre-Leilao","cor":"#6B8F5C","tasks":[{"id":"t1","nome":"Visita a fazenda e selecao de animais","ini":"2026-04-15","fim":"2026-04-20","resp":{"nome":"Leo","ini":"L"},"subs":[{"lbl":"Agendar visita com proprietario","done":true},{"lbl":"Avaliar lote disponivel","done":true},{"lbl":"Definir animais para catalogo","done":false},{"lbl":"Registrar genealogia dos selecionados","done":false}]},{"id":"t2","nome":"Producao do catalogo","ini":"2026-04-21","fim":"2026-05-05","resp":{"nome":"Bulinha","ini":"B"},"subs":[{"lbl":"Sessao de fotos dos animais","done":true},{"lbl":"Coleta de dados genealogicos","done":false},{"lbl":"Diagramacao e revisao","done":false},{"lbl":"Aprovacao do cliente","done":false}]},{"id":"t3","nome":"Divulgacao e marketing","ini":"2026-05-01","fim":"2026-05-28","resp":{"nome":"Peralta","ini":"P"},"subs":[{"lbl":"Criar artes para redes sociais","done":true},{"lbl":"Enviar catalogo para mailing","done":false},{"lbl":"Confirmar transmissao ao vivo","done":false},{"lbl":"Publicar anuncios patrocinados","done":false},{"lbl":"Contatar compradores potenciais","done":false}]}]},{"nome":"Leilao","cor":"#C8A96E","tasks":[{"id":"t4","nome":"Montagem do evento","ini":"2026-06-11","fim":"2026-06-11","resp":{"nome":"Leo","ini":"L"},"subs":[{"lbl":"Conferir estrutura do local","done":false},{"lbl":"Testar equipamentos de audio/video","done":false},{"lbl":"Organizar lotes por ordem de entrada","done":false}]},{"id":"t5","nome":"Assessoria em pista","ini":"2026-06-11","fim":"2026-06-11","resp":{"nome":"Bulinha","ini":"B"},"subs":[{"lbl":"Acompanhar apresentacao dos lotes","done":false},{"lbl":"Orientar lances e negociacoes","done":false},{"lbl":"Registrar arrematantes","done":false}]}]},{"nome":"Pos-Leilao","cor":"#4A8FBF","tasks":[{"id":"t6","nome":"Prestacao de contas","ini":"2026-06-11","fim":"2026-06-18","resp":{"nome":"Peralta","ini":"P"},"subs":[{"lbl":"Consolidar valores arrematados","done":false},{"lbl":"Emitir notas fiscais","done":false},{"lbl":"Calcular e recolher comissoes","done":false},{"lbl":"Enviar relatorio ao cliente","done":false}]},{"id":"t7","nome":"Logistica de entrega","ini":"2026-06-11","fim":"2026-06-25","resp":{"nome":"Leo","ini":"L"},"subs":[{"lbl":"Coordenar transporte dos animais","done":false},{"lbl":"Emitir GTA (Guia de Transito Animal)","done":false},{"lbl":"Confirmar recebimento pelo comprador","done":false}]}]}]'::jsonb
),
(
  '33333333-0005-0000-0000-000000000000',
  'Fazenda Santa Clara', '2026-05-10', 'Touros P.O.', 'Ribeirao Preto, SP', 60, 300000, 120000, 105000, 'concluido',
  '[]'::jsonb
),
(
  '33333333-0006-0000-0000-000000000000',
  'Nelore Elite - Femeas', '2026-05-18', 'Femeas P.O.', 'Uberaba, MG', 40, 200000, 80000, 92000, 'concluido',
  '[]'::jsonb
)
ON CONFLICT DO NOTHING;

-- Leilão assessores (junction)
INSERT INTO public.bula_leilao_assessores (leilao_id, membro_id) VALUES
  ('33333333-0001-0000-0000-000000000000', '11111111-0001-0000-0000-000000000000'),
  ('33333333-0001-0000-0000-000000000000', '11111111-0002-0000-0000-000000000000'),
  ('33333333-0002-0000-0000-000000000000', '11111111-0003-0000-0000-000000000000'),
  ('33333333-0002-0000-0000-000000000000', '11111111-0001-0000-0000-000000000000'),
  ('33333333-0005-0000-0000-000000000000', '11111111-0001-0000-0000-000000000000'),
  ('33333333-0005-0000-0000-000000000000', '11111111-0003-0000-0000-000000000000'),
  ('33333333-0006-0000-0000-000000000000', '11111111-0002-0000-0000-000000000000'),
  ('33333333-0006-0000-0000-000000000000', '11111111-0001-0000-0000-000000000000')
ON CONFLICT DO NOTHING;

-- Projeto cards (8 exemplos)
INSERT INTO public.bula_projeto_cards (id, titulo, descricao, coluna, prioridade, vencimento, checks, posicao) VALUES
  ('44444444-0001-0000-0000-000000000000', 'Criar site institucional Bula', 'Desenvolver site com portfolio de leiloes, equipe e contato.', 'backlog', 'media', '2026-08-15', '[{"l":"Definir layout","d":false},{"l":"Criar conteudo","d":false},{"l":"Contratar dev","d":false}]'::jsonb, 0),
  ('44444444-0002-0000-0000-000000000000', 'Campanha Instagram - Junho', 'Criar 12 posts sobre os proximos leiloes de junho.', 'afazer', 'alta', '2026-05-28', '[{"l":"Brief criativo","d":true},{"l":"Fotos dos animais","d":false},{"l":"Copywriting","d":false},{"l":"Aprovacao","d":false}]'::jsonb, 0),
  ('44444444-0003-0000-0000-000000000000', 'Reuniao com clientes Fazenda Aurora', 'Apresentar proposta de leilao de touros para Fazenda Aurora.', 'andamento', 'alta', '2026-05-22', '[{"l":"Preparar apresentacao","d":true},{"l":"Confirmar presenca","d":true},{"l":"Realizar reuniao","d":false}]'::jsonb, 0),
  ('44444444-0004-0000-0000-000000000000', 'Relatorio mensal de resultados', 'Compilar resultados de abril para enviar aos parceiros.', 'andamento', 'media', '2026-05-25', '[{"l":"Coletar dados","d":true},{"l":"Montar relatorio","d":false},{"l":"Revisar","d":false},{"l":"Enviar","d":false}]'::jsonb, 1),
  ('44444444-0005-0000-0000-000000000000', 'Catalogo digital Nelore Cachoeirad', 'Produzir catalogo em PDF e versao online para o leilao de junho.', 'afazer', 'alta', '2026-05-30', '[{"l":"Sessao de fotos","d":false},{"l":"Diagramacao","d":false},{"l":"Aprovacao do cliente","d":false}]'::jsonb, 1),
  ('44444444-0006-0000-0000-000000000000', 'Treinamento equipe - leilao virtual', 'Treinar equipe para operar transmissao ao vivo.', 'backlog', 'baixa', '2026-06-01', '[{"l":"Definir plataforma","d":false},{"l":"Testar equipamento","d":false}]'::jsonb, 1),
  ('44444444-0007-0000-0000-000000000000', 'Fechar contrato Rancho da Matinha', 'Assinar contrato de assessoria para leilao de junho.', 'concluido', 'alta', '2026-04-30', '[{"l":"Enviar proposta","d":true},{"l":"Negociar termos","d":true},{"l":"Assinar contrato","d":true}]'::jsonb, 0),
  ('44444444-0008-0000-0000-000000000000', 'Fechar contrato Nelore Tresmar', 'Contrato de assessoria confirmado para junho.', 'concluido', 'alta', '2026-04-25', '[{"l":"Enviar proposta","d":true},{"l":"Assinar contrato","d":true}]'::jsonb, 1)
ON CONFLICT DO NOTHING;

-- Card responsáveis
INSERT INTO public.bula_card_responsaveis (card_id, membro_id) VALUES
  ('44444444-0002-0000-0000-000000000000', '11111111-0002-0000-0000-000000000000'),
  ('44444444-0003-0000-0000-000000000000', '11111111-0001-0000-0000-000000000000'),
  ('44444444-0004-0000-0000-000000000000', '11111111-0003-0000-0000-000000000000'),
  ('44444444-0005-0000-0000-000000000000', '11111111-0003-0000-0000-000000000000'),
  ('44444444-0007-0000-0000-000000000000', '11111111-0001-0000-0000-000000000000'),
  ('44444444-0008-0000-0000-000000000000', '11111111-0002-0000-0000-000000000000')
ON CONFLICT DO NOTHING;

-- CRM Deals (funil Captacao)
INSERT INTO public.bula_crm_deals (id, funil_id, etapa_id, nome, localizacao, telefone, email, valor, temperatura, assessor_id, notas, timeline, dias_no_estagio) VALUES
(
  '55555555-0001-0000-0000-000000000000',
  '22222222-0001-0000-0000-000000000000', 'lead',
  'Fazenda Aurora', 'Goiania, GO', '(62) 99812-3456', 'aurora@email.com', 350000, 'quente',
  '11111111-0001-0000-0000-000000000000',
  'Proprietario demonstrou interesse em leilao de touros PO.',
  '[{"type":"Ligacao","date":"20/03/2026","text":"Primeiro contato por telefone. Proprietario tem 40 touros disponiveis."},{"type":"Nota","date":"18/03/2026","text":"Lead identificado via indicacao do Nelore Tresmar."}]'::jsonb,
  3
),
(
  '55555555-0002-0000-0000-000000000000',
  '22222222-0001-0000-0000-000000000000', 'contato',
  'Rancho Sao Pedro', 'Cuiaba, MT', '(65) 98765-4321', 'rancho@email.com', 520000, 'quente',
  '11111111-0002-0000-0000-000000000000',
  'Grande criador, ja fez leilao no ano passado.',
  '[{"type":"Reuniao","date":"19/03/2026","text":"Reuniao presencial na fazenda. Interesse em leilao de femeas PO."},{"type":"Email","date":"15/03/2026","text":"Enviei apresentacao da Bula Assessoria."}]'::jsonb,
  5
),
(
  '55555555-0003-0000-0000-000000000000',
  '22222222-0001-0000-0000-000000000000', 'visita',
  'Haras Bela Vista', 'Campo Grande, MS', '(67) 99234-5678', 'belavista@email.com', 280000, 'morno',
  '11111111-0001-0000-0000-000000000000',
  'Criador novo, primeira vez realizando leilao.',
  '[{"type":"Visita","date":"21/03/2026","text":"Visitei a fazenda. Excelente qualidade dos animais. Possivel leilao para agosto."}]'::jsonb,
  2
),
(
  '55555555-0004-0000-0000-000000000000',
  '22222222-0001-0000-0000-000000000000', 'proposta',
  'Nelore do Cerrado', 'Brasilia, DF', '(61) 98888-1234', 'cerrado@email.com', 750000, 'quente',
  '11111111-0003-0000-0000-000000000000',
  'Cliente premium, exige contrato detalhado.',
  '[{"type":"Proposta","date":"22/03/2026","text":"Enviado proposta formal com honorarios de 5%."},{"type":"Reuniao","date":"18/03/2026","text":"Segunda reuniao. Cliente pediu referencias de outros leiloes."}]'::jsonb,
  4
),
(
  '55555555-0005-0000-0000-000000000000',
  '22222222-0001-0000-0000-000000000000', 'fechado',
  'Rancho da Matinha', 'Campo Grande, MS', '(67) 99999-0000', 'matinha@email.com', 1100000, 'quente',
  '11111111-0001-0000-0000-000000000000',
  'Maior leilao do ano. Contrato assinado.',
  '[{"type":"Contrato","date":"10/03/2026","text":"Contrato assinado. Leilao agendado para 21/06."}]'::jsonb,
  18
)
ON CONFLICT DO NOTHING;

-- Leads de marketing (10 exemplos)
INSERT INTO public.bula_leads (id, nome, telefone, regiao, rebanho, origem, status, interesse, orcamento) VALUES
  ('66666666-0001-0000-0000-000000000000', 'Carlos Mendes',    '(67) 99812-4567', 'MS', 450,  'Instagram',  'novo',        '', 0),
  ('66666666-0002-0000-0000-000000000000', 'Roberto Alves',    '(62) 98745-2345', 'GO', 200,  'Google Ads', 'novo',        '', 0),
  ('66666666-0003-0000-0000-000000000000', 'Joao Ferreira',    '(34) 99123-6789', 'MG', 850,  'Facebook',   'novo',        '', 0),
  ('66666666-0004-0000-0000-000000000000', 'Pedro Costa',      '(11) 98234-5678', 'SP', 120,  'Site',       'novo',        '', 0),
  ('66666666-0005-0000-0000-000000000000', 'Renato Silva',     '(65) 99678-5678', 'MT', 1200, 'Google Ads', 'qualificado', 'Touros PO', 400000),
  ('66666666-0006-0000-0000-000000000000', 'Antonio Souza',    '(67) 99345-1234', 'MS', 320,  'WhatsApp',   'atendimento', '', 0),
  ('66666666-0007-0000-0000-000000000000', 'Francisco Santos', '(38) 98456-7890', 'MG', 560,  'Instagram',  'novo',        '', 0),
  ('66666666-0008-0000-0000-000000000000', 'Luis Oliveira',    '(62) 99567-8901', 'GO', 180,  'Facebook',   'novo',        '', 0),
  ('66666666-0009-0000-0000-000000000000', 'Paulo Lima',       '(67) 98678-9012', 'MS', 700,  'Google Ads', 'qualificado', 'Femeas PO', 280000),
  ('66666666-0010-0000-0000-000000000000', 'Marcos Pereira',   '(66) 99789-0123', 'MT', 45,   'Instagram',  'descartado',  '', 0)
ON CONFLICT DO NOTHING;
