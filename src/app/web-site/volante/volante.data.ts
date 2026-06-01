/* ============================================================
 * Dados do Volante MRA · fonte única da LP (página de detalhe do
 * card de sêmen em /semen). Portado do build Vite original.
 * Caminhos de mídia namespaceados em /volante/ (public/volante).
 * ============================================================ */
export const volante = {
  nome: 'Volante MRA',
  slug: 'volante-mra',
  registro: 'MRA 10701 · 10701-P MRA',
  rg: 'RG MRA 10701',
  raca: 'Nelore PO',
  nascimento: '04 / 11 / 2023',
  idade: '30 meses',
  sexo: 'Macho',
  status: 'PO · Aprovado p/ central',
  precocidade: 'Superprecoce · idade 12,13',
  classePrecocidade: 'SUPERPRECOCE',
  pesoAtual: '886 kg',
  circEscrotal: '41 cm',
  disponibilidade: 'Em quarentena · Central Bela Vista',
  criador: 'MRA',
  proprietario: 'Nelore Leão',
  local: 'Botucatu — SP',
  ippMae: '—',
  consanguinidade: '—',
  semen: 'Convencional',
  situacao: 'Pré-reserva aberta',
  avaliacao: 'ANCP · 2026',
  edicao: 'Aceleradora 2026 · Lançamento',
  tagline: 'O reprodutor que decide a próxima arroba antes do bezerro nascer.',
  whatsapp: 'https://wa.me/5531975659900?text=Tenho%20interesse%20no%20Volante%20MRA',

  // Galeria de fotos (fotos novas · jun/2026)
  fotoHero: '/volante/volante-corpo.jpg',
  fotos: [
    { src: '/volante/volante-corpo.jpg', alt: 'Volante MRA — perfil lateral no campo' },
    { src: '/volante/volante-frontal.jpg', alt: 'Volante MRA — frontal' },
    { src: '/volante/volante-pasto.jpg', alt: 'Volante MRA — no pasto' },
    { src: '/volante/volante-retrato.jpg', alt: 'Volante MRA — retrato' },
  ],

  // 3 sumários (índices principais)
  indices: [
    { sumario: 'PMGZ · ABCZ', sigla: 'iABCZ', valor: '22,53', top: 'TOP 2%', extra: 'DECA 1' },
    { sumario: 'Geneplus · Embrapa', sigla: 'IQG', valor: '25,18', top: 'TOP 4%', extra: null },
    { sumario: 'ANCP · MGTe', sigla: 'MGTe', valor: '27,01', top: 'TOP 6%', extra: null },
  ],

  // Highlight: 5 métricas resumo (estilo Atacante)
  highlight: [
    { valor: 'MGTe 27,01', desc: 'TOP 6% nacional', destaque: true },
    { valor: '+1.635', desc: 'PE365g · TOP 0,1%' },
    { valor: '+5,128', desc: 'ACAB · TOP 0,1%' },
    { valor: '+56,65%', desc: 'STAYg · TOP 1%' },
    { valor: '+2,79', desc: 'PES · TOP 0,1%' },
  ],

  // Valores de marca
  valoresMarca: ['Curadoria', 'Precisão', 'Autoridade', 'Lealdade', 'Evolução'],

  // Manifesto (descrição do touro · estilo Atacante)
  manifesto: {
    tituloInicio: 'Eficiência, desempenho e',
    tituloItalico: 'retorno consistente.',
    nomeDestaque: 'Volante MRA',
    paragrafoPrincipal:
      ' chega como um dos grandes destaques da nova geração Nelore, criado pela MRA. Não é apenas um bom animal — é um indivíduo diferenciado, entregando resultado no campo, na balança e no bolso.',
    paragrafoSecundario:
      'Curadoria de genética PO. Avaliação ANCP completa. Sêmen convencional disponível em pré-reserva.',
  },

  tese: [
    { n: '01', titulo: 'Decisão', texto: 'Um touro responde por 50% da carga genética de cada bezerro que nasce na sua fazenda. Errar aqui custa 3 a 5 safras.' },
    { n: '02', titulo: 'Multiplicação', texto: 'Em monta natural, 1 touro × 30 vacas imprime sua genética em ~120 bezerros no ciclo. Cada kg a mais no desmame é multiplicado.' },
    { n: '03', titulo: 'Tradução', texto: 'DEP não é planilha. É arroba. É balança. É o cheque do desmame somando mais, todo ano.' },
  ],

  simulacao: [
    { cenario: 'Touro médio', dp210: '≈ 0', kg: '180 kg', safra: '5.400 kg', destaque: false },
    { cenario: 'Volante MRA', dp210: '+16,17 · TOP 5%', kg: '196 kg', safra: '5.880 kg', destaque: true },
  ],

  // DEPs unificadas (crescimento + carcaça + precocidade)
  avaliacoes: [
    { dep: 'Peso ao Sobreano (PE365g)', fonte: 'PMGZ', valor: '+1.635', top: '0,1%', categoria: 'Crescimento' },
    { dep: 'Peso à Desmama (PD210g)', fonte: 'Geneplus', valor: '+10,83', top: '4%', categoria: 'Crescimento' },
    { dep: 'Desmama Direta 210d (DP210)', fonte: 'ANCP', valor: '+16,17', top: '5%', categoria: 'Crescimento' },
    { dep: 'Pós-desmama 450d (DP450)', fonte: 'ANCP', valor: '+30,76', top: '4%', categoria: 'Crescimento' },
    { dep: 'Peso Sobreano (PS)', fonte: 'Geneplus', valor: '+15,61', top: '8%', categoria: 'Crescimento' },
    { dep: 'DEP Peso/ano (DPE365)', fonte: 'ANCP', valor: '+1,87', top: '2%', categoria: 'Crescimento' },
    { dep: 'DEP AOL · Área Olho de Lombo', fonte: 'PMGZ', valor: '+1,675', top: '17%', categoria: 'Carcaça' },
    { dep: 'DEP ACAB · Cobertura de gordura', fonte: 'PMGZ', valor: '+5,128', top: '0,1%', categoria: 'Carcaça' },
    { dep: 'STAYg · Permanência no rebanho', fonte: '—', valor: '+56,65%', top: '1%', categoria: 'Maternal' },
    { dep: 'PES · Prenhez precoce', fonte: 'Geneplus', valor: '+2,79', top: '0,1%', categoria: 'Reprodução' },
  ],

  deps: [
    { dep: 'Peso ao Sobreano (PE365g)', fonte: 'PMGZ', valor: '+1.635', top: '0,1%' },
    { dep: 'Peso à Desmama (PD210g)', fonte: 'Geneplus', valor: '+10,83', top: '4%' },
    { dep: 'Desmama Direta 210d (DP210)', fonte: 'ANCP', valor: '+16,17', top: '5%' },
    { dep: 'Pós-desmama 450d (DP450)', fonte: 'ANCP', valor: '+30,76', top: '4%' },
    { dep: 'Peso Sobreano (PS)', fonte: 'Geneplus', valor: '+15,61', top: '8%' },
    { dep: 'DEP Peso/ano (DPE365)', fonte: 'ANCP', valor: '+1,87', top: '2%' },
  ],

  carcaca: {
    intra: [
      { criterio: 'Peso', class: 'SUPERIOR' },
      { criterio: 'PE (Perímetro Escrotal)', class: 'ELITE' },
      { criterio: 'AOL (Área Olho de Lombo)', class: 'SUPERIOR' },
      { criterio: 'ACAB (Acabamento)', class: 'ELITE' },
    ],
    deps: [
      { nome: 'DEP AOL', descricao: 'Área de Olho de Lombo', valor: '+1,675', unidade: 'cm² além da média', rank: 'DECA 2 · TOP 17%' },
      { nome: 'DEP ACAB', descricao: 'Cobertura de gordura', valor: '+5,128', unidade: '', rank: 'DECA 1 · TOP 0,1%' },
    ],
  },

  precocidadeInd: [
    { dep: 'STAYg', desc: 'Permanência no rebanho', fonte: '—', valor: '+56,65%', extra: 'de filhas que permanecem', top: 'TOP 1%' },
    { dep: 'PES', desc: 'Prenhez precoce', fonte: 'Geneplus', valor: '+2,79', extra: 'filhas com prenhez antecipada', top: 'TOP 0,1%' },
  ],

  pedigree: {
    pai: { nome: 'REM HERMOSO FIV GEN.ADT', avo: 'REM ESPIÃO 007', ava: 'REM VOTUPORANGA' },
    mae: { nome: '9535 FIV MRA', avo: 'REM EMBAIXADOR', ava: 'ACILDA MRA' },
  },

  tabela: [
    { faixa: 'Faixa 01', volume: '30 → 100 doses', preco: 'R$ 29,50', tag: null },
    { faixa: 'Faixa 02', volume: '101 → 200 doses', preco: 'R$ 27,50', tag: null },
    { faixa: 'Faixa 03', volume: '201 → 500 doses', preco: 'R$ 25,50', tag: 'Sweet Spot' },
    { faixa: 'Faixa 04', volume: '500+ doses', preco: 'R$ 23,50', tag: 'Melhor Preço' },
  ],

  condicoes: [
    { item: 'Pedido mínimo', valor: '30 doses' },
    { item: 'Frete', valor: 'R$ 2,00/dose · grátis a partir de 100 doses' },
    { item: 'Contra touro médio', valor: 'Até R$ 6,00/dose de economia na faixa 04' },
    { item: 'Pagamento', valor: 'Via curador · Faturamento Fórmula do Boi' },
  ],

  logistica: [
    { regiao: 'Sudeste', prazo: '5–8 dias' },
    { regiao: 'Centro-Oeste', prazo: '7–10 dias' },
    { regiao: 'Sul', prazo: '7–12 dias' },
    { regiao: 'Nordeste', prazo: '8–14 dias' },
    { regiao: 'Norte', prazo: '10–18 dias' },
  ],

  central: [
    { ind: 'Posição', dado: '#1 maior central de coleta da Am. Latina' },
    { ind: 'Touros alojados', dado: '580+ touros de elite' },
    { ind: 'Certificação sanitária', dado: 'IVOS II · Sistema CASA · Hamilton Thorne · Análise celular' },
    { ind: 'Qualidade', dado: 'ISO 9001 / 14001 · Livre Brucelose + Tuberculose · MAPA' },
    { ind: 'Parceiros', dado: 'ABS · ALTA · CRV · GENEX · SELECT SIRES' },
  ],

  cronograma: [
    { etapa: 'Hoje', periodo: 'Quarentena · Bela Vista', status: 'atual' },
    { etapa: 'Julho', periodo: 'Início das coletas', status: 'proximo' },
    { etapa: 'Agosto', periodo: 'Estoque disponível · Primeiras doses · Reservas abertas', status: 'destaque' },
    { etapa: 'Safra 2026', periodo: 'Entrega na porteira', status: 'futuro' },
  ],

  // Downloads (cards de avaliações oficiais)
  downloads: [
    { titulo: 'Avaliação ANCP', destaque: 'MGTe 27,01 · TOP 6%', meta: 'PDF · Ficha individual · 2026', url: '#' },
    { titulo: 'Avaliação GenePlus', destaque: 'IQG 25,18 · TOP 4%', meta: 'PDF · Embrapa · 2026', url: '#' },
    { titulo: 'PMGZ', destaque: 'iABCZ 22,53 · TOP 2%', meta: 'PDF · Avaliação 2026 · ABCZ', url: '#' },
  ],

  // Perfil completo - 5 categorias de competência
  perfilCompleto: [
    { categoria: 'Crescimento', dados: 'PE365g +1.635 · DP210 +16,17 · DP450 +30,76' },
    { categoria: 'Carcaça', dados: 'AOL +1,675 · ACAB +5,128 (TOP 0,1%)' },
    { categoria: 'Maternal', dados: 'STAYg +56,65% (TOP 1%)' },
    { categoria: 'Reprodução', dados: 'PES +2,79 · Convencional · 41 cm CE' },
    { categoria: 'Sanidade', dados: 'Central Bela Vista · IVOS II · MAPA' },
  ],

  // Por que agora - 3 pilares
  pilares: [
    {
      n: '01',
      titulo: 'Genética Elite',
      subtitulo: 'MGTe 27,01 · TOP 6%',
      texto: 'Elite em Peso, ACAB e STAY. Validado nos três principais sumários do país (PMGZ, Geneplus, ANCP).',
    },
    {
      n: '02',
      titulo: 'Resultado direto',
      subtitulo: 'Mais arrobas em menos tempo',
      texto: 'Bezerros mais pesados ao desmame (+16 kg vs touro médio) e carcaças com melhor pagamento no frigorífico.',
    },
    {
      n: '03',
      titulo: 'Condição única',
      subtitulo: 'Pacotes promocionais exclusivos',
      texto: 'Tabela 2026 válida apenas até encerramento da Aceleradora. Doses a partir de R$ 23,50.',
    },
  ],
}
