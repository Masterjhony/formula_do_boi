// Insere o fechamento do 6º Mega EAO Touros (03/05/2026) e as contas correspondentes.
// Uso: node scripts/insert_fechamento_mega_eao_03_mai.js

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

const fechamento = {
  nome: '6º Mega EAO – Touros – Expozebu 03/05/2026',
  data: '2026-05-03',
  local: 'Fazenda Reunidas Uberaba – MG 427 km 12 – 91º ExpoZebu',
  lotes_ofertados: 180,
  lotes_vendidos: 16,
  animais_vendidos: 19,
  vgv_total: 640500,
  ticket_medio: 40031.25,
  maior_lance: 2000,
  compradores_unicos: 5,
  estados_alcancados: 2,
  comissao_assessoria: 750,
  receita_bula: 6405,
  sobra_bruta: 5655,
  observacoes:
    'Vendas concretizadas durante o 6º Mega EAO Touros (91ª ExpoZebu, 03/05/2026 – domingo). ' +
    'Catálogo: 180 touros (Individuais + Repasse + Central + Mangalarga); curadoria FdB classificou 146 lotes (A++ 23 / A+ 41 / A 82). ' +
    '16 lotes fechados (15 IND + 1 Mega Lote = 19 animais). ' +
    'Maior comprador: Agropecuária Martins (Coxim/MS) – 6 lotes, R$ 273,5k (incl. Lt 76 Touro de Central). ' +
    'MARCA 15 (Izanélio Rezende/MS) levou 6 animais em 3 lotes (R$ 124k) – encontro de visita marcado para 30/06. ' +
    'Lt 119 intermediado por Fábio Omena → Victor Meirelles (Tambaú/SP). ' +
    'PENDÊNCIAS: (1) Lote 115 (EAO C3472, R$ 37.500) – comprador não identificado nos prints – REVISAR com Bulinha. ' +
    '(2) Cobertura: confirmar se há lotes adicionais não reportados. ' +
    'Defaults aplicados (REVISAR): comissão Bula Assessoria 2%, Receita Bula EAO 1%. ' +
    'Bulinha (Felipe Andrade) tratado como intercompany Fórmula do Boi – sem conta a pagar.',
  por_assessor: [
    { posicao: 1, nome: 'Bulinha (Felipe Andrade)', empresa: 'Fórmula do Boi',  transacoes: 15, animais: 18, vgv: 603000, ticket_medio: 40200, pct_total: 0.9415 },
    { posicao: 2, nome: 'Fábio Omena',              empresa: 'Bula Assessoria', transacoes: 1,  animais: 1,  vgv: 37500,  ticket_medio: 37500, pct_total: 0.0585 },
  ],
  por_estado: [
    { uf: 'MS', estado: 'Mato Grosso do Sul', lotes: 14, animais: 17, vgv: 565500, pct_total: 0.8829 },
    { uf: 'SP', estado: 'São Paulo',          lotes: 1,  animais: 1,  vgv: 37500,  pct_total: 0.0586 },
    { uf: '—',  estado: 'Não informado',      lotes: 1,  animais: 1,  vgv: 37500,  pct_total: 0.0586 },
  ],
  compradores: [
    { rank: 1, fazenda: 'Agropecuária Martins',                  comprador: 'Agropecuária Martins',         cidade: 'Coxim',  uf: 'MS', lotes: 6, animais: 6, vgv: 273500 },
    { rank: 2, fazenda: 'Fazenda Londrina',                      comprador: 'Paulinho e Marcelo Vilela',    cidade: '',       uf: 'MS', lotes: 5, animais: 5, vgv: 168000 },
    { rank: 3, fazenda: 'MARCA 15',                              comprador: 'Izanélio Rezende',             cidade: '',       uf: 'MS', lotes: 3, animais: 6, vgv: 124000 },
    { rank: 4, fazenda: 'Victor Meirelles',                      comprador: 'Victor Meirelles',             cidade: 'Tambaú', uf: 'SP', lotes: 1, animais: 1, vgv: 37500  },
    { rank: 5, fazenda: '⚠ A confirmar',                         comprador: 'Comprador não identificado nos prints', cidade: '', uf: '', lotes: 1, animais: 1, vgv: 37500 },
  ],
  lances: [
    { lote: '02',      fazenda: 'MARCA 15',              comprador: 'Izanélio Rezende',          uf: 'MS', assessor: 'Bulinha (Felipe Andrade)', empresa: 'Fórmula do Boi',  animais: 1, parcela: 2000, vgv: 60000,  animal: 'EAO C3404 (A++ – TOP 0,1% iABCZ/MGTe/IQG)' },
    { lote: '35',      fazenda: 'Fazenda Londrina',      comprador: 'Paulinho e Marcelo Vilela', uf: 'MS', assessor: 'Bulinha (Felipe Andrade)', empresa: 'Fórmula do Boi',  animais: 1, parcela: 1150, vgv: 34500,  animal: 'EAO C3679 (A)' },
    { lote: '36',      fazenda: 'Fazenda Londrina',      comprador: 'Paulinho e Marcelo Vilela', uf: 'MS', assessor: 'Bulinha (Felipe Andrade)', empresa: 'Fórmula do Boi',  animais: 1, parcela: 1250, vgv: 37500,  animal: 'EAO C3326 (A++)' },
    { lote: '46',      fazenda: 'Agropecuária Martins',  comprador: 'Agropecuária Martins',      uf: 'MS', assessor: 'Bulinha (Felipe Andrade)', empresa: 'Fórmula do Boi',  animais: 1, parcela: 1400, vgv: 42000,  animal: 'EAO C3546 (A)' },
    { lote: '54',      fazenda: 'Agropecuária Martins',  comprador: 'Agropecuária Martins',      uf: 'MS', assessor: 'Bulinha (Felipe Andrade)', empresa: 'Fórmula do Boi',  animais: 1, parcela: 1200, vgv: 36000,  animal: 'EAO C3634 (A)' },
    { lote: '56',      fazenda: 'Agropecuária Martins',  comprador: 'Agropecuária Martins',      uf: 'MS', assessor: 'Bulinha (Felipe Andrade)', empresa: 'Fórmula do Boi',  animais: 1, parcela: 1400, vgv: 42000,  animal: 'EAO C3637 (A)' },
    { lote: '62',      fazenda: 'Agropecuária Martins',  comprador: 'Agropecuária Martins',      uf: 'MS', assessor: 'Bulinha (Felipe Andrade)', empresa: 'Fórmula do Boi',  animais: 1, parcela: 1550, vgv: 46500,  animal: 'EAO C3549 (A++)' },
    { lote: '76',      fazenda: 'Agropecuária Martins',  comprador: 'Agropecuária Martins',      uf: 'MS', assessor: 'Bulinha (Felipe Andrade)', empresa: 'Fórmula do Boi',  animais: 1, parcela: 1400, vgv: 56000,  animal: 'EAO C4489 — Touro de Central (1+39 = 40x)' },
    { lote: '86',      fazenda: 'Fazenda Londrina',      comprador: 'Paulinho e Marcelo Vilela', uf: 'MS', assessor: 'Bulinha (Felipe Andrade)', empresa: 'Fórmula do Boi',  animais: 1, parcela: 900,  vgv: 27000,  animal: 'EAO C3615 (A)' },
    { lote: '99',      fazenda: 'Agropecuária Martins',  comprador: 'Agropecuária Martins',      uf: 'MS', assessor: 'Bulinha (Felipe Andrade)', empresa: 'Fórmula do Boi',  animais: 1, parcela: 1700, vgv: 51000,  animal: 'EAO C3302 (A+)' },
    { lote: '105',     fazenda: 'Fazenda Londrina',      comprador: 'Paulinho e Marcelo Vilela', uf: 'MS', assessor: 'Bulinha (Felipe Andrade)', empresa: 'Fórmula do Boi',  animais: 1, parcela: 1150, vgv: 34500,  animal: 'EAO C3164 (A+)' },
    { lote: '111',     fazenda: 'Fazenda Londrina',      comprador: 'Paulinho e Marcelo Vilela', uf: 'MS', assessor: 'Bulinha (Felipe Andrade)', empresa: 'Fórmula do Boi',  animais: 1, parcela: 1150, vgv: 34500,  animal: 'EAON 6256 (A+)' },
    { lote: '115',     fazenda: '⚠ A confirmar',         comprador: 'Comprador não identificado',uf: '',   assessor: 'Bulinha (Felipe Andrade)', empresa: 'Fórmula do Boi',  animais: 1, parcela: 1250, vgv: 37500,  animal: 'EAO C3472 (A) — REVISAR comprador' },
    { lote: '119',     fazenda: 'Victor Meirelles',      comprador: 'Victor Meirelles',          uf: 'SP', assessor: 'Fábio Omena',               empresa: 'Bula Assessoria', animais: 1, parcela: 1250, vgv: 37500,  animal: 'EAON 6319 (A+) — Tambaú/SP' },
    { lote: '121',     fazenda: 'MARCA 15',              comprador: 'Izanélio Rezende',          uf: 'MS', assessor: 'Bulinha (Felipe Andrade)', empresa: 'Fórmula do Boi',  animais: 1, parcela: 1200, vgv: 36000,  animal: 'EAO C1811 (A)' },
    { lote: 'Mega 03', fazenda: 'MARCA 15',              comprador: 'Izanélio Rezende',          uf: 'MS', assessor: 'Bulinha (Felipe Andrade)', empresa: 'Fórmula do Boi',  animais: 4, parcela: 700,  vgv: 28000,  animal: 'Mega Lote 03 — 4 animais (filhos de Estoril Mat, REM Hermoso, D8 EAO) — 40x (1+39)' },
  ],
  perfil_genetico: null,
}

async function upsertFechamento() {
  const { data: existing, error: errSel } = await supa
    .from('bula_leilao_fechamento')
    .select('id')
    .eq('nome', fechamento.nome)
    .eq('data', fechamento.data)
    .maybeSingle()
  if (errSel) throw errSel

  const payload = { ...fechamento, updated_at: new Date().toISOString() }
  if (existing) {
    const { error } = await supa.from('bula_leilao_fechamento').update(payload).eq('id', existing.id)
    if (error) throw error
    console.log(`UPDATED fechamento "${fechamento.nome}" (${existing.id})`)
  } else {
    const { data, error } = await supa
      .from('bula_leilao_fechamento')
      .insert([payload])
      .select('id')
      .single()
    if (error) throw error
    console.log(`INSERTED fechamento "${fechamento.nome}" (${data.id})`)
  }
}

async function upsertContaAPagar() {
  const description = 'Comissão Fábio Omena (Bula Assessoria) – 2% – Lt 119 – 6º Mega EAO Touros'
  const observacao = 'Leilão 03/05/2026 – 6º Mega EAO Touros (Expozebu). VGV Fábio Omena: R$ 37.500 (Lt 119 – Victor Meirelles, Tambaú/SP) × 2% = R$ 750.'

  const { data: existing } = await supa
    .from('erp_finance_transactions')
    .select('id')
    .eq('description', description)
    .eq('transaction_date', '2026-05-03')
    .maybeSingle()
  if (existing) {
    console.log(`SKIP conta a pagar (já existe id=${existing.id})`)
    return
  }

  const { data: account } = await supa.from('erp_finance_accounts').select('id').order('created_at', { ascending: true }).limit(1).maybeSingle()
  const { data: category } = await supa.from('erp_finance_categories').select('id').eq('name', 'Fornecedores').eq('type', 'expense').limit(1).maybeSingle()
  if (!account?.id || !category?.id) { console.error('Conta/categoria não encontrada — pulando conta a pagar.', { account, category }); return }

  const { data, error } = await supa
    .from('erp_finance_transactions')
    .insert([{ account_id: account.id, category_id: category.id, type: 'expense', amount: 750, description, observacao, transaction_date: '2026-05-03', status: 'pending' }])
    .select('id')
    .single()
  if (error) throw error
  console.log(`INSERTED conta a pagar (${data.id})`)
}

async function upsertContaAReceber() {
  const description = 'Receita Bula – EAO Agropecuária – 1% – 6º Mega EAO Touros 03/05/2026'
  const observacao = 'A receber da EAO Agropecuária (promotora). VGV total R$ 640.500 × 1% (DEFAULT, REVISAR) = R$ 6.405. 16 lotes fechados, 19 animais, 5 compradores (4 confirmados + 1 a confirmar – Lt 115).'

  const { data: existing } = await supa
    .from('erp_finance_transactions')
    .select('id')
    .eq('description', description)
    .eq('transaction_date', '2026-05-03')
    .maybeSingle()
  if (existing) {
    console.log(`SKIP conta a receber (já existe id=${existing.id})`)
    return
  }

  const { data: account } = await supa.from('erp_finance_accounts').select('id').order('created_at', { ascending: true }).limit(1).maybeSingle()
  const { data: category } = await supa.from('erp_finance_categories').select('id').eq('name', 'Recebimentos').eq('type', 'income').limit(1).maybeSingle()
  if (!account?.id || !category?.id) { console.error('Conta/categoria não encontrada — pulando conta a receber.', { account, category }); return }

  const { data, error } = await supa
    .from('erp_finance_transactions')
    .insert([{ account_id: account.id, category_id: category.id, type: 'income', amount: 6405, description, observacao, transaction_date: '2026-05-03', status: 'pending' }])
    .select('id')
    .single()
  if (error) throw error
  console.log(`INSERTED conta a receber (${data.id})`)
}

;(async () => {
  try {
    await upsertFechamento()
    await upsertContaAPagar()
    await upsertContaAReceber()
  } catch (e) {
    console.error('ERROR:', e.message || e)
    process.exitCode = 1
  }
})()
