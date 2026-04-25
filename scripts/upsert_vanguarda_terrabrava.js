// Upsert fechamentos: Matrizes de Vanguarda (09/04) e Terra Brava 50 Anos (19/04).
// Dados extraídos das xlsx em F:\.
// Uso: node scripts/upsert_vanguarda_terrabrava.js
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/); if (!m) continue
  let v = m[2]; if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
  process.env[m[1]] = v
}
const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const vanguarda = {
  nome: 'Leilão Matrizes de Vanguarda',
  data: '2026-04-09',
  local: 'BULA REMATES · Campo Grande-MS (Toka do Jacaré · Três Nascentes · Nelore da Vez)',
  lotes_ofertados: 42,
  lotes_vendidos: 5,
  animais_vendidos: 12,
  vgv_total: 127200,
  ticket_medio: 10600,
  maior_lance: 33300,
  compradores_unicos: 2,
  estados_alcancados: 0,
  comissao_assessoria: 2685,
  receita_bula: 13060.80,
  sobra_bruta: 10375.80,
  observacoes:
    'VGV total do leilão R$ 1.306.080 (42 lotes · 76 animais · média R$ 17.185/animal). Trio de vendedoras: Toka do Jacaré, Três Nascentes e Nelore da Vez. Participação Bula/FdB 9,7% (5 lotes / R$ 127.200). Leonardo Serafim 4 lotes/R$ 113.100 (88,9% do share) — todos para João Teles de Carvalho Neto (alerta de concentração). Fábio Omena 1 lote/R$ 14.100 (11,1%) para Rudce Fátima Dorileo Vieira. Receita 1% × 1.306.080 = R$ 13.060,80; sobra bruta R$ 10.375,80 após R$ 2.685 de comissões.',
  por_assessor: [
    { posicao: 1, nome: 'Leonardo Serafim Francisco', empresa: 'Bula Assessoria', transacoes: 4, animais: 11, vgv: 113100, ticket_medio: 10281.82, pct_total: 0.8892 },
    { posicao: 2, nome: 'Fábio de Omena Gaia',        empresa: 'Bula Assessoria', transacoes: 1, animais: 1,  vgv: 14100,  ticket_medio: 14100,    pct_total: 0.1108 },
  ],
  por_estado: [],
  compradores: [
    { rank: 1, fazenda: 'João Teles de Carvalho Neto', comprador: 'João Teles de Carvalho Neto', cidade: '—', uf: '—', lotes: 4, animais: 11, vgv: 113100 },
    { rank: 2, fazenda: 'Rudce Fátima Dorileo Vieira', comprador: 'Rudce Fátima Dorileo Vieira', cidade: '—', uf: '—', lotes: 1, animais: 1,  vgv: 14100  },
  ],
  lances: [
    { lote: '39', fazenda: 'Faz. Três Nascentes (Claudionor Miguel Abss Duarte)', comprador: 'João Teles de Carvalho Neto', uf: '—', assessor: 'Leonardo Serafim Francisco', empresa: 'Bula Assessoria', animais: 3, parcela: 0, vgv: 33300 },
    { lote: '20', fazenda: 'Toka do Jacaré (Sérgio Dias Campos)',                 comprador: 'João Teles de Carvalho Neto', uf: '—', assessor: 'Leonardo Serafim Francisco', empresa: 'Bula Assessoria', animais: 3, parcela: 0, vgv: 28800 },
    { lote: '21', fazenda: 'Toka do Jacaré (Sérgio Dias Campos)',                 comprador: 'João Teles de Carvalho Neto', uf: '—', assessor: 'Leonardo Serafim Francisco', empresa: 'Bula Assessoria', animais: 3, parcela: 0, vgv: 28800 },
    { lote: '41', fazenda: 'Faz. Três Nascentes (Claudionor Miguel Abss Duarte)', comprador: 'João Teles de Carvalho Neto', uf: '—', assessor: 'Leonardo Serafim Francisco', empresa: 'Bula Assessoria', animais: 2, parcela: 0, vgv: 22200 },
    { lote: '30', fazenda: 'Faz. Três Nascentes (Claudionor Miguel Abss Duarte)', comprador: 'Rudce Fátima Dorileo Vieira', uf: '—', assessor: 'Fábio de Omena Gaia',         empresa: 'Bula Assessoria', animais: 1, parcela: 0, vgv: 14100 },
  ],
  distribuicao_empresa: [
    { empresa: 'Bula Assessoria', transacoes: 5, animais: 12, vgv: 127200, pct_total: 1.0, ticket_medio: 10600 },
  ],
  perfil_genetico: null,
  lotes_catalogo: [],
}

const terraBrava = {
  nome: 'Leilão Terra Brava 50 Anos',
  data: '2026-04-19',
  local: 'Canal do Criador · Touros Provados 50 Anos',
  lotes_ofertados: 0,
  lotes_vendidos: 5,
  animais_vendidos: 5,
  vgv_total: 138600,
  ticket_medio: 27720,
  maior_lance: 36000,
  compradores_unicos: 3,
  estados_alcancados: 3,
  comissao_assessoria: 4158,
  receita_bula: 6930,
  sobra_bruta: 2772,
  observacoes:
    'Acordo especial com Terra Brava: 5% sobre o VGV vendido pela Bula (não % sobre faturamento total). VGV total do leilão R$ 4.467.600 (182 machos · m. R$ 24.547 · +72,52% vs Terra Brava 2025). Participação Bula/FdB 3,1% (5 lotes / R$ 138.600 / 100% Fábio Omena). Compradores: Fazenda Dois Irmãos (PA) R$ 61,5k, Joerson Ferronato (MT) R$ 51,6k, Agropecuária MR (GO) R$ 25,5k. Receita 5% × 138.600 = R$ 6.930; sobra bruta R$ 2.772 após R$ 4.158 de comissão (3% sobre VGV vendido).',
  por_assessor: [
    { posicao: 1, nome: 'Fábio Omena', empresa: 'Bula Assessoria', transacoes: 5, animais: 5, vgv: 138600, ticket_medio: 27720, pct_total: 1.0 },
  ],
  por_estado: [
    { uf: 'PA', estado: 'Pará',        lotes: 2, animais: 2, vgv: 61500, pct_total: 0.4437 },
    { uf: 'MT', estado: 'Mato Grosso', lotes: 2, animais: 2, vgv: 51600, pct_total: 0.3723 },
    { uf: 'GO', estado: 'Goiás',       lotes: 1, animais: 1, vgv: 25500, pct_total: 0.1840 },
  ],
  compradores: [
    { rank: 1, fazenda: 'Fazenda Dois Irmãos', comprador: 'Fazenda Dois Irmãos', cidade: 'Anapu',       uf: 'PA', lotes: 2, animais: 2, vgv: 61500 },
    { rank: 2, fazenda: 'Joerson Ferronato',   comprador: 'Joerson Ferronato',   cidade: 'Nova Ubiratã', uf: 'MT', lotes: 2, animais: 2, vgv: 51600 },
    { rank: 3, fazenda: 'Agropecuária MR',     comprador: 'Agropecuária MR',     cidade: 'Silvânia',    uf: 'GO', lotes: 1, animais: 1, vgv: 25500 },
  ],
  lances: [
    { lote: '20',  fazenda: 'Nelore DM Premium',     comprador: 'Fazenda Dois Irmãos', uf: 'PA', assessor: 'Fábio Omena', empresa: 'Bula Assessoria', animais: 1, parcela: 1200, vgv: 36000 },
    { lote: '16',  fazenda: 'Fazenda Terra Brava',   comprador: 'Joerson Ferronato',   uf: 'MT', assessor: 'Fábio Omena', empresa: 'Bula Assessoria', animais: 1, parcela: 870,  vgv: 26100 },
    { lote: '34',  fazenda: 'Fazenda Terra Brava',   comprador: 'Joerson Ferronato',   uf: 'MT', assessor: 'Fábio Omena', empresa: 'Bula Assessoria', animais: 1, parcela: 850,  vgv: 25500 },
    { lote: '73',  fazenda: 'Fazenda Terra Brava',   comprador: 'Agropecuária MR',     uf: 'GO', assessor: 'Fábio Omena', empresa: 'Bula Assessoria', animais: 1, parcela: 850,  vgv: 25500 },
    { lote: '127', fazenda: 'Fazenda Terra Brava',   comprador: 'Fazenda Dois Irmãos', uf: 'PA', assessor: 'Fábio Omena', empresa: 'Bula Assessoria', animais: 1, parcela: 850,  vgv: 25500 },
  ],
  distribuicao_empresa: [
    { empresa: 'Bula Assessoria', transacoes: 5, animais: 5, vgv: 138600, pct_total: 1.0, ticket_medio: 27720 },
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
  for (const f of [vanguarda, terraBrava]) {
    try { await upsertByName(f) }
    catch (e) { console.error(`ERROR ${f.nome}:`, e.message || e); process.exitCode = 1 }
  }
})()
