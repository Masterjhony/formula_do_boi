// Upsert correção IPB Prime (base real = R$ 854.700 · receita 1% = R$ 8.547)
// Fonte: F:\Leilao_IPB_Prime_Resultado (2).xlsx
// Uso: node scripts/upsert_ipb_prime_v2.js

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

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

const ipb = {
  nome: 'Leilão IPB Prime',
  data: '2026-04-11',
  local: '',
  lotes_ofertados: 42,
  lotes_vendidos: 7,
  animais_vendidos: 14,
  vgv_total: 175200,
  ticket_medio: 12514,
  maior_lance: 69000,            // corrigido — Lote 22 (Leonardo Serafim)
  compradores_unicos: 2,
  estados_alcancados: 0,
  comissao_assessoria: 3645,
  receita_bula: 8547,            // corrigido — 1% × R$ 854.700
  sobra_bruta: 4902,             // corrigido — 8547 − 3645
  observacoes:
    'Base corrigida (xlsx v2): faturamento do leilão = R$ 854.700 (não R$ 1,31 MM como estimado). ' +
    'Participação Bula/FdB: 20,5% do VGV (7 lotes · R$ 175.200 · 14 animais). ' +
    'Receita Bula Assessoria: R$ 8.547 (1% do faturamento) — sobra bruta R$ 4.902 após comissões de R$ 3.645 ' +
    '(Leonardo 2% = R$ 2.262 · Douglas 2% = R$ 960 · Fábio 3% = R$ 423). ' +
    'Maior lance Bula/FdB: Lote 22 — Joel de Assis Gouvêa Júnior, assessor Leonardo Serafim (R$ 69.000). ' +
    'Detalhamento lote-a-lote dos 4 lotes adicionais (R$ 58.200) pendente — completar via CRM Bula.',
  por_assessor: [
    { posicao: 1, nome: 'Leonardo Serafim Francisco', empresa: 'Bula Assessoria', transacoes: 4, animais: 11, vgv: 113100, ticket_medio: 10282, pct_total: 0.6455 },
    { posicao: 2, nome: 'Douglas Bispo Carvalho',     empresa: 'Bula Assessoria', transacoes: 2, animais: 2,  vgv: 48000,  ticket_medio: 24000, pct_total: 0.2740 },
    { posicao: 3, nome: 'Fábio de Omena Gaia',        empresa: 'Bula Assessoria', transacoes: 1, animais: 1,  vgv: 14100,  ticket_medio: 14100, pct_total: 0.0805 },
  ],
  por_estado: [],
  compradores: [
    { rank: 1, fazenda: 'Joel de Assis Gouvêa Júnior', comprador: 'Joel de Assis Gouvêa Júnior', cidade: '—', uf: '—', lotes: 1, animais: 1, vgv: 69000 },
    { rank: 2, fazenda: 'Antonio Luiz Manhães Areas',  comprador: 'Antonio Luiz Manhães Areas',  cidade: '—', uf: '—', lotes: 2, animais: 2, vgv: 48000 },
  ],
  lances: [
    { lote: '22', fazenda: 'Genética Aditiva Agropecuária LTDA',  comprador: 'Joel de Assis Gouvêa Júnior', uf: '—', assessor: 'Leonardo Serafim Francisco', empresa: 'Bula Assessoria', animais: 1, parcela: 0, vgv: 69000 },
    { lote: '20', fazenda: 'Ulisses Azuil de Almeida Serra Neto', comprador: 'Antonio Luiz Manhães Areas',  uf: '—', assessor: 'Douglas Bispo Carvalho',      empresa: 'Bula Assessoria', animais: 1, parcela: 0, vgv: 28500 },
    { lote: '15', fazenda: 'Ulisses Azuil de Almeida Serra Neto', comprador: 'Antonio Luiz Manhães Areas',  uf: '—', assessor: 'Douglas Bispo Carvalho',      empresa: 'Bula Assessoria', animais: 1, parcela: 0, vgv: 19500 },
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
  try { await upsertByName(ipb) }
  catch (e) { console.error(`ERROR ${ipb.nome}:`, e.message || e); process.exitCode = 1 }
})()
