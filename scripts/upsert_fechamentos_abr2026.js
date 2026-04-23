// Upsert fechamentos de abril/2026: Pérolas Cachoeirão, JMP Supreme, IPB Prime
// Dados extraídos dos arquivos .xlsx enviados pelo usuário.
// Uso: node scripts/upsert_fechamentos_abr2026.js

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Load .env.local
const envPath = path.resolve(__dirname, '..', '.env.local')
for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
  if (!m) continue
  let v = m[2]
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
  process.env[m[1]] = v
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) { console.error('Missing SUPABASE env'); process.exit(1) }
const supa = createClient(url, key)

// ── 1) Pérolas Cachoeirão ─────────────────────────────────────────
const perolas = {
  nome: 'Leilão Pérolas Cachoeirão',
  data: '2026-04-14',
  local: 'Tatersal de Elite da Acrissul – Expogrande/MS',
  lotes_ofertados: 27,
  lotes_vendidos: 8,
  animais_vendidos: 8,
  vgv_total: 508500,
  ticket_medio: 63563,
  maior_lance: 5000,        // parcela do lote 01 (VGV R$ 150.000)
  compradores_unicos: 5,
  estados_alcancados: 0,     // cidades/UF não preenchidas na planilha
  comissao_assessoria: 11520,
  observacoes:
    'VGV total do leilão: R$ 1,43 MM (8% Bula Remates = R$ 114.720 faturamento leiloeira; 1% Bula Assessoria = R$ 13.400 receita). Participação Bula/FdB: 35,5% (8 lotes · 5 compradores, 1 recorrente). Maior lance: Douglas Bispo — Lote 01 (R$ 150.000). Bula Remates respondeu por 81,7% do share (R$ 415.500) e Fórmula do Boi por 18,3% (R$ 93.000). Cidade/UF dos compradores a preencher na próxima iteração.',
  por_assessor: [
    { posicao: 1, nome: 'Douglas Bispo',    empresa: 'Bula Remates',    transacoes: 1, animais: 1, vgv: 150000, ticket_medio: 150000, pct_total: 0.2950 },
    { posicao: 2, nome: 'Fábio Omena',      empresa: 'Bula Remates',    transacoes: 1, animais: 1, vgv: 135000, ticket_medio: 135000, pct_total: 0.2655 },
    { posicao: 3, nome: 'Leonardo Serafim', empresa: 'Bula Remates',    transacoes: 3, animais: 3, vgv: 130500, ticket_medio: 43500,  pct_total: 0.2566 },
    { posicao: 4, nome: 'Marcelo Carneiro', empresa: 'Fórmula do Boi',  transacoes: 2, animais: 2, vgv: 72000,  ticket_medio: 36000,  pct_total: 0.1416 },
    { posicao: 5, nome: 'Matheus Amormino', empresa: 'Fórmula do Boi',  transacoes: 1, animais: 1, vgv: 21000,  ticket_medio: 21000,  pct_total: 0.0413 },
  ],
  por_estado: [],
  compradores: [
    { rank: 1, fazenda: 'Alfredo José Cardoso',                                 comprador: 'Alfredo José Cardoso',                                 cidade: '—', uf: '—', lotes: 1, animais: 1, vgv: 150000 },
    { rank: 2, fazenda: 'Diego Benitah Batista',                                comprador: 'Diego Benitah Batista',                                cidade: '—', uf: '—', lotes: 1, animais: 1, vgv: 135000 },
    { rank: 3, fazenda: 'Elias Abdo Filho / Joel de Assis Gouvêa Jr.',          comprador: 'Elias Abdo Filho / Joel de Assis Gouvêa Jr.',          cidade: '—', uf: '—', lotes: 3, animais: 3, vgv: 130500 },
    { rank: 4, fazenda: 'Orismar Moreira Leão',                                 comprador: 'Orismar Moreira Leão',                                 cidade: '—', uf: '—', lotes: 2, animais: 2, vgv: 72000  },
    { rank: 5, fazenda: 'Raphael Henrique Rodrigues Sabino Coelho',             comprador: 'Raphael Henrique Rodrigues Sabino Coelho',             cidade: '—', uf: '—', lotes: 1, animais: 1, vgv: 21000  },
  ],
  lances: [
    { lote: '01',    fazenda: 'José Rodrigues Pereira e Irmãos',       comprador: 'Alfredo José Cardoso',             uf: '—', assessor: 'Douglas Bispo',    empresa: 'Bula Remates',   animais: 1, parcela: 5000, vgv: 150000 },
    { lote: '25',    fazenda: 'Cássio Barbosa Rodrigues Yule',         comprador: 'Diego Benitah Batista',            uf: '—', assessor: 'Fábio Omena',      empresa: 'Bula Remates',   animais: 1, parcela: 4500, vgv: 135000 },
    { lote: '10',    fazenda: 'José Rodrigues Pereira e Irmãos',       comprador: 'Elias Abdo F. / Joel A. G. Jr.',   uf: '—', assessor: 'Leonardo Serafim', empresa: 'Bula Remates',   animais: 1, parcela: 2000, vgv: 60000  },
    { lote: '06',    fazenda: 'José Rodrigues Pereira e Irmãos',       comprador: 'Elias Abdo F. / Joel A. G. Jr.',   uf: '—', assessor: 'Leonardo Serafim', empresa: 'Bula Remates',   animais: 1, parcela: 1550, vgv: 46500  },
    { lote: '09',    fazenda: 'José Rodrigues Pereira e Irmãos',       comprador: 'Orismar Moreira Leão',             uf: '—', assessor: 'Marcelo Carneiro', empresa: 'Fórmula do Boi', animais: 1, parcela: 1300, vgv: 39000  },
    { lote: 'ASP01', fazenda: 'Alfredo J. Cardoso / JRP Irmãos',       comprador: 'Orismar Moreira Leão',             uf: '—', assessor: 'Marcelo Carneiro', empresa: 'Fórmula do Boi', animais: 1, parcela: 1100, vgv: 33000  },
    { lote: '16',    fazenda: 'José Rodrigues Pereira e Irmãos',       comprador: 'Joel de Assis Gouvêa Jr.',         uf: '—', assessor: 'Leonardo Serafim', empresa: 'Bula Remates',   animais: 1, parcela: 800,  vgv: 24000  },
    { lote: '07',    fazenda: 'José Rodrigues Pereira e Irmãos',       comprador: 'Raphael H. R. Sabino Coelho',      uf: '—', assessor: 'Matheus Amormino', empresa: 'Fórmula do Boi', animais: 1, parcela: 700,  vgv: 21000  },
  ],
  distribuicao_empresa: [
    { empresa: 'Bula Remates',   transacoes: 5, animais: 5, vgv: 415500, pct_total: 0.8171, ticket_medio: 83100 },
    { empresa: 'Fórmula do Boi', transacoes: 3, animais: 3, vgv: 93000,  pct_total: 0.1829, ticket_medio: 31000 },
  ],
  perfil_genetico: null,
  lotes_catalogo: [],
}

// ── 2) JMP Supreme ────────────────────────────────────────────────
const jmp = {
  nome: 'Leilão JMP Supreme',
  data: '2026-04-19',
  local: 'Virtual · Canal Rural',
  lotes_ofertados: 160,
  lotes_vendidos: 7,
  animais_vendidos: 7,
  vgv_total: 410400,
  ticket_medio: 58629,
  maior_lance: 5600, // parcela do lote 06 (VGV R$ 168.000)
  compradores_unicos: 4,
  estados_alcancados: 4,
  comissao_assessoria: 10242,
  observacoes:
    'Leilão virtual (Canal Rural) — edição especial 2026, 160 bezerras Nelore P.O. 100% FIV · Top 0,1% PMGZ/ANCP/Embrapa/Gene Plus. VGV total do leilão: R$ 10,37 MM em 163,5 animais (m. R$ 63.451/animal · 70 compradores · 14 estados). Acordo especial Bula × JMP: 0,5% sobre o VGV total do leilão = R$ 51.872 receita Bula (sobra bruta R$ 41.630 após comissões de R$ 10.242). Share Bula/FdB: 7 lotes / R$ 410.400 (4,0% do VGV) para 4 clientes (PA/MT/GO/BA). Douglas Bispo R$ 207k (50,4%) · Fábio Omena R$ 203,4k (49,6%, inclui lote #6 em co-assessoria com Leandro Moura).',
  por_assessor: [
    { posicao: 1, nome: 'Douglas Bispo Carvalho', empresa: 'Bula Assessoria', transacoes: 3, animais: 3, vgv: 207000, ticket_medio: 69000, pct_total: 0.5044 },
    { posicao: 2, nome: 'Fábio de Omena Gaia',    empresa: 'Bula Assessoria', transacoes: 4, animais: 4, vgv: 203400, ticket_medio: 50850, pct_total: 0.4956 },
  ],
  por_estado: [
    { uf: 'PA', estado: 'Pará',         lotes: 3, animais: 3, vgv: 207000, pct_total: 0.5044 },
    { uf: 'MT', estado: 'Mato Grosso',  lotes: 1, animais: 1, vgv: 168000, pct_total: 0.4094 },
    { uf: 'GO', estado: 'Goiás',        lotes: 1, animais: 1, vgv: 21000,  pct_total: 0.0512 },
    { uf: 'BA', estado: 'Bahia',        lotes: 2, animais: 2, vgv: 14400,  pct_total: 0.0351 },
  ],
  compradores: [
    { rank: 1, fazenda: 'Nelore Itajaí',             comprador: 'Welton & Gustavo Miranda',  cidade: 'Conceição do Araguaia', uf: 'PA', lotes: 3, animais: 3, vgv: 207000 },
    { rank: 2, fazenda: 'Nelore MR & Fronteira',     comprador: 'Mayara & Marcel Neves',     cidade: 'Poconé',               uf: 'MT', lotes: 1, animais: 1, vgv: 168000 },
    { rank: 3, fazenda: 'Agropecuária MR',           comprador: 'Bonfim de Abreu',           cidade: 'Silvânia',             uf: 'GO', lotes: 1, animais: 1, vgv: 21000  },
    { rank: 4, fazenda: 'Fazenda Santa Helena',      comprador: 'Nelore NJMR',               cidade: 'Cocos',                uf: 'BA', lotes: 2, animais: 2, vgv: 14400  },
  ],
  lances: [
    { lote: '06',  fazenda: 'JMP Supreme (Categoria 1F)', comprador: 'Nelore MR & Fronteira · Mayara e Marcel Neves',      uf: 'MT', assessor: 'Fábio de Omena Gaia (c/ co-assessoria Leandro Moura)', empresa: 'Bula Assessoria', animais: 1, parcela: 5600, vgv: 168000 },
    { lote: '23',  fazenda: 'JMP Supreme (Categoria 1F)', comprador: 'Nelore Itajaí · Welton e Gustavo Miranda',           uf: 'PA', assessor: 'Douglas Bispo Carvalho',                                empresa: 'Bula Assessoria', animais: 1, parcela: 3500, vgv: 105000 },
    { lote: '53',  fazenda: 'JMP Supreme (Categoria 1F)', comprador: 'Nelore Itajaí · Welton e Gustavo Miranda',           uf: 'PA', assessor: 'Douglas Bispo Carvalho',                                empresa: 'Bula Assessoria', animais: 1, parcela: 2600, vgv: 78000  },
    { lote: '110', fazenda: 'JMP Supreme (Categoria 1F)', comprador: 'Nelore Itajaí · Welton e Gustavo Miranda',           uf: 'PA', assessor: 'Douglas Bispo Carvalho',                                empresa: 'Bula Assessoria', animais: 1, parcela: 800,  vgv: 24000  },
    { lote: '160', fazenda: 'JMP Supreme (Categoria 1M)', comprador: 'Agropecuária MR · Bonfim de Abreu',                  uf: 'GO', assessor: 'Fábio de Omena Gaia',                                    empresa: 'Bula Assessoria', animais: 1, parcela: 700,  vgv: 21000  },
    { lote: '147', fazenda: 'JMP Supreme (Categoria 2F)', comprador: 'Fazenda Santa Helena · Nelore NJMR',                 uf: 'BA', assessor: 'Fábio de Omena Gaia',                                    empresa: 'Bula Assessoria', animais: 1, parcela: 240,  vgv: 7200   },
    { lote: '148', fazenda: 'JMP Supreme (Categoria 2F)', comprador: 'Fazenda Santa Helena · Nelore NJMR',                 uf: 'BA', assessor: 'Fábio de Omena Gaia',                                    empresa: 'Bula Assessoria', animais: 1, parcela: 240,  vgv: 7200   },
  ],
  distribuicao_empresa: [
    { empresa: 'Bula Assessoria', transacoes: 7, animais: 7, vgv: 410400, pct_total: 1.0, ticket_medio: 58629 },
  ],
  perfil_genetico: null,
  lotes_catalogo: [],
}

// ── 3) IPB Prime ──────────────────────────────────────────────────
const ipb = {
  nome: 'Leilão IPB Prime',
  data: '2026-04-11',
  local: '',
  lotes_ofertados: 42,
  lotes_vendidos: 7,
  animais_vendidos: 14,
  vgv_total: 175200,
  ticket_medio: 12514,
  maior_lance: 0,   // planilha de lances registra parcela 0 (pagamento à vista / VGV direto)
  compradores_unicos: 2,
  estados_alcancados: 0,
  comissao_assessoria: 3645,
  observacoes:
    'VGV total do leilão: R$ 1,31 MM (42 lotes · 76 animais · média R$ 17.185/animal). Participação Bula/FdB: 13,4% (7 lotes · R$ 175.200 · 14 animais). Receita Bula Assessoria: R$ 13.060,80 (1% do faturamento) — sobra bruta R$ 9.416 após comissões de R$ 3.645 (Fábio Omena opera com 3%, demais com 2%). Maior lance: Lote 22 (Leonardo Serafim · R$ 69.000). Detalhamento lote-a-lote dos 4 lotes adicionais de Leonardo (R$ 44,1k) e 1 de Fábio (R$ 14,1k) pendente — completar via CRM Bula.',
  por_assessor: [
    { posicao: 1, nome: 'Leonardo Serafim Francisco', empresa: 'Bula Assessoria', transacoes: 4, animais: 11, vgv: 113100, ticket_medio: 10282, pct_total: 0.6455 },
    { posicao: 2, nome: 'Douglas Bispo Carvalho',     empresa: 'Bula Assessoria', transacoes: 2, animais: 2,  vgv: 48000,  ticket_medio: 24000, pct_total: 0.2740 },
    { posicao: 3, nome: 'Fábio de Omena Gaia',        empresa: 'Bula Assessoria', transacoes: 1, animais: 1,  vgv: 14100,  ticket_medio: 14100, pct_total: 0.0805 },
  ],
  por_estado: [],
  compradores: [
    { rank: 1, fazenda: 'Joel de Assis Gouvéa Júnior',  comprador: 'Joel de Assis Gouvéa Júnior',  cidade: '—', uf: '—', lotes: 1, animais: 1, vgv: 69000 },
    { rank: 2, fazenda: 'Antonio Luiz Manhães Areas',   comprador: 'Antonio Luiz Manhães Areas',   cidade: '—', uf: '—', lotes: 2, animais: 2, vgv: 48000 },
  ],
  lances: [
    { lote: '22', fazenda: 'Genética Aditiva Agropecuária LTDA',      comprador: 'Joel de Assis Gouvéa Júnior',  uf: '—', assessor: 'Leonardo Serafim Francisco', empresa: 'Bula Assessoria', animais: 1, parcela: 0, vgv: 69000 },
    { lote: '20', fazenda: 'Ulisses Azuil de Almeida Serra Neto',     comprador: 'Antonio Luiz Manhães Areas',   uf: '—', assessor: 'Douglas Bispo Carvalho',    empresa: 'Bula Assessoria', animais: 1, parcela: 0, vgv: 28500 },
    { lote: '15', fazenda: 'Ulisses Azuil de Almeida Serra Neto',     comprador: 'Antonio Luiz Manhães Areas',   uf: '—', assessor: 'Douglas Bispo Carvalho',    empresa: 'Bula Assessoria', animais: 1, parcela: 0, vgv: 19500 },
  ],
  distribuicao_empresa: [
    { empresa: 'Bula Assessoria', transacoes: 7, animais: 14, vgv: 175200, pct_total: 1.0, ticket_medio: 12514 },
  ],
  perfil_genetico: null,
  lotes_catalogo: [],
}

async function upsertByName(f) {
  const { data: existing, error: errSel } = await supa
    .from('bula_leilao_fechamento')
    .select('id, nome')
    .eq('nome', f.nome)
    .maybeSingle()
  if (errSel) throw errSel
  const payload = { ...f, updated_at: new Date().toISOString() }
  if (existing) {
    const { error } = await supa.from('bula_leilao_fechamento').update(payload).eq('id', existing.id)
    if (error) throw error
    console.log(`UPDATED ${f.nome} (${existing.id})`)
  } else {
    const { data, error } = await supa.from('bula_leilao_fechamento').insert([payload]).select('id').single()
    if (error) throw error
    console.log(`INSERTED ${f.nome} (${data.id})`)
  }
}

;(async () => {
  for (const f of [ipb, perolas, jmp]) {
    try { await upsertByName(f) }
    catch (e) { console.error(`ERROR ${f.nome}:`, e.message || e); process.exitCode = 1 }
  }
})()
