-- ============================================================
-- BULA LEILÃO FECHAMENTO — Tabela de fechamento/resultado
-- ============================================================

CREATE TABLE IF NOT EXISTS public.bula_leilao_fechamento (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome                TEXT NOT NULL,
  data                DATE NOT NULL,
  local               TEXT DEFAULT '',
  lotes_ofertados     INTEGER DEFAULT 0,
  lotes_vendidos      INTEGER DEFAULT 0,
  animais_vendidos    INTEGER DEFAULT 0,
  vgv_total           NUMERIC(12,2) DEFAULT 0,
  ticket_medio        NUMERIC(12,2) DEFAULT 0,
  maior_lance         NUMERIC(12,2) DEFAULT 0,
  compradores_unicos  INTEGER DEFAULT 0,
  estados_alcancados  INTEGER DEFAULT 0,
  -- JSONB detalhado
  por_assessor        JSONB DEFAULT '[]'::jsonb,
  por_estado          JSONB DEFAULT '[]'::jsonb,
  compradores         JSONB DEFAULT '[]'::jsonb,
  lances              JSONB DEFAULT '[]'::jsonb,
  perfil_genetico     JSONB DEFAULT NULL,
  comissao_assessoria NUMERIC(12,2) DEFAULT 0,
  observacoes         TEXT DEFAULT '',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bula_leilao_fechamento ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bula_fechamento_all"
  ON public.bula_leilao_fechamento
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ============================================================
-- SEED — Leilão MRA 50 Anos (dados da planilha de resultado)
-- ============================================================

INSERT INTO public.bula_leilao_fechamento (
  nome, data, local,
  lotes_ofertados, lotes_vendidos, animais_vendidos,
  vgv_total, ticket_medio, maior_lance,
  compradores_unicos, estados_alcancados,
  por_assessor, por_estado, compradores, lances, perfil_genetico,
  comissao_assessoria, observacoes
) VALUES (
  'Nelore MRA – 50 Anos de Seleção',
  '2026-04-22',
  'Fazenda Paraíso – Terenos, MS',
  38, 13, 17,
  385800, 22694, 1200,
  7, 5,

  -- por_assessor
  '[
    {"posicao":1,"nome":"Fábio Omena","empresa":"Bula Remates","transacoes":5,"animais":10,"vgv":227700,"ticket_medio":22770,"pct_total":0.5902},
    {"posicao":2,"nome":"Douglas Bispo","empresa":"Bula Remates","transacoes":4,"animais":5,"vgv":120000,"ticket_medio":24000,"pct_total":0.3110},
    {"posicao":3,"nome":"Matheus Amormino","empresa":"Fórmula do Boi","transacoes":2,"animais":2,"vgv":38100,"ticket_medio":19050,"pct_total":0.0988}
  ]'::jsonb,

  -- por_estado
  '[
    {"uf":"PE","estado":"Pernambuco","lotes":1,"animais":6,"vgv":120600,"pct_total":0.3126},
    {"uf":"PA","estado":"Pará","lotes":4,"animais":5,"vgv":120000,"pct_total":0.3110},
    {"uf":"MA","estado":"Maranhão","lotes":3,"animais":3,"vgv":74100,"pct_total":0.1921},
    {"uf":"MG","estado":"Minas Gerais","lotes":2,"animais":2,"vgv":38100,"pct_total":0.0988},
    {"uf":"GO","estado":"Goiás","lotes":1,"animais":1,"vgv":33000,"pct_total":0.0855}
  ]'::jsonb,

  -- compradores
  '[
    {"rank":1,"fazenda":"Fazenda Vale Verde","comprador":"Fazenda Vale Verde","cidade":"Chã Grande","uf":"PE","lotes":1,"animais":6,"vgv":120600},
    {"rank":2,"fazenda":"Haras e Fazenda Tesla","comprador":"Haras e Fazenda Tesla","cidade":"Turilândia","uf":"MA","lotes":3,"animais":3,"vgv":74100},
    {"rank":3,"fazenda":"Fazenda Garantido","comprador":"Gilberto Sarubi","cidade":"Oriximiná","uf":"PA","lotes":2,"animais":2,"vgv":63000},
    {"rank":4,"fazenda":"Fazenda Terra Santa","comprador":"Ricardo Brasileiro","cidade":"Tucumã","uf":"PA","lotes":2,"animais":3,"vgv":57000},
    {"rank":5,"fazenda":"Nelore 3A","comprador":"Allisson Lunard","cidade":"Goiás Velho","uf":"GO","lotes":1,"animais":1,"vgv":33000},
    {"rank":6,"fazenda":"Sítio Jacarandá","comprador":"Luiz Moreira","cidade":"Pouso Alegre","uf":"MG","lotes":1,"animais":1,"vgv":19500},
    {"rank":7,"fazenda":"Fazenda Capiau","comprador":"Raphael Coelho","cidade":"Santo Antônio do Monte","uf":"MG","lotes":1,"animais":1,"vgv":18600}
  ]'::jsonb,

  -- lances
  '[
    {"lote":"32·33·35","fazenda":"Fazenda Vale Verde","comprador":"Fazenda Vale Verde","uf":"PE","assessor":"Fábio Omena","empresa":"Bula Remates","animais":6,"parcela":670,"vgv":120600},
    {"lote":"08","fazenda":"Fazenda Terra Santa","comprador":"Ricardo Brasileiro","uf":"PA","assessor":"Douglas Bispo","empresa":"Bula Remates","animais":2,"parcela":600,"vgv":36000},
    {"lote":"14","fazenda":"Fazenda Garantido","comprador":"Gilberto Sarubi","uf":"PA","assessor":"Douglas Bispo","empresa":"Bula Remates","animais":1,"parcela":1200,"vgv":36000},
    {"lote":"07","fazenda":"Nelore 3A","comprador":"Allisson Lunard","uf":"GO","assessor":"Fábio Omena","empresa":"Bula Remates","animais":1,"parcela":1100,"vgv":33000},
    {"lote":"17","fazenda":"Fazenda Garantido","comprador":"Gilberto Sarubi","uf":"PA","assessor":"Douglas Bispo","empresa":"Bula Remates","animais":1,"parcela":900,"vgv":27000},
    {"lote":"12","fazenda":"Haras e Fazenda Tesla","comprador":"Haras e Fazenda Tesla","uf":"MA","assessor":"Fábio Omena","empresa":"Bula Remates","animais":1,"parcela":850,"vgv":25500},
    {"lote":"16","fazenda":"Haras e Fazenda Tesla","comprador":"Haras e Fazenda Tesla","uf":"MA","assessor":"Fábio Omena","empresa":"Bula Remates","animais":1,"parcela":820,"vgv":24600},
    {"lote":"05","fazenda":"Haras e Fazenda Tesla","comprador":"Haras e Fazenda Tesla","uf":"MA","assessor":"Fábio Omena","empresa":"Bula Remates","animais":1,"parcela":800,"vgv":24000},
    {"lote":"06","fazenda":"Fazenda Terra Santa","comprador":"Ricardo Brasileiro","uf":"PA","assessor":"Douglas Bispo","empresa":"Bula Remates","animais":1,"parcela":700,"vgv":21000},
    {"lote":"30","fazenda":"Sítio Jacarandá","comprador":"Luiz Moreira","uf":"MG","assessor":"Matheus Amormino","empresa":"Fórmula do Boi","animais":1,"parcela":650,"vgv":19500},
    {"lote":"10","fazenda":"Fazenda Capiau","comprador":"Raphael Coelho","uf":"MG","assessor":"Matheus Amormino","empresa":"Fórmula do Boi","animais":1,"parcela":620,"vgv":18600}
  ]'::jsonb,

  -- perfil_genetico
  '{
    "indices": [
      {"fonte":"GENEPLUS – IQG","media_vendida":29.4,"media_catalogo":30.62,"diferenca":"-1.22","classificacao":"TOP 2,5%"},
      {"fonte":"ANCP – MGTe","media_vendida":26.2,"media_catalogo":26.96,"diferenca":"-0.76","classificacao":"TOP 5%"}
    ],
    "crias_sexo": [
      {"sexo":"Fêmeas","quantidade":12,"pct":0.75,"observacao":"Predominantes – formação de plantel"},
      {"sexo":"Machos","quantidade":4,"pct":0.25,"observacao":"Candidatos a touros P.O."}
    ]
  }'::jsonb,

  0,
  'Genética MRA alcançou 5 estados em uma única noite. Taxa de cobertura de 34% (13 de 38 lotes). Assessoria Bula Remates responsável por 90,12% do VGV total.'
)
ON CONFLICT DO NOTHING;
