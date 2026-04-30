// Insere o fechamento do Leilão MAFRA (29/04/2026) e a conta a pagar correspondente.
// Uso: node scripts/insert_fechamento_mafra.js

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
  nome: 'Leilão MAFRA – 29/04/2026',
  data: '2026-04-29',
  local: '',
  lotes_ofertados: 2,
  lotes_vendidos: 2,
  animais_vendidos: 2,
  vgv_total: 480000,
  ticket_medio: 240000,
  maior_lance: 9500,
  compradores_unicos: 1,
  estados_alcancados: 1,
  comissao_assessoria: 9600,
  receita_bula: 0,
  sobra_bruta: -9600,
  observacoes:
    'Leilão não previsto na agenda — venda registrada via WhatsApp pelo assessor. Lt 20 = aspiração da REM 2484N; Lt 19 = 100% do animal 3355. Comprador estreante: Agropecuária Vale do Ouro (Parazão), Itaituba/PA. Único assessor: Douglas Bispo (Bula Assessoria, taxa 2%). Conta a pagar gerada: R$ 9.600. Receita Bula a definir conforme acordo com a promotora MAFRA.',
  por_assessor: [
    { posicao: 1, nome: 'Douglas Bispo', empresa: 'Bula Assessoria', transacoes: 2, animais: 2, vgv: 480000, ticket_medio: 240000, pct_total: 1 },
  ],
  por_estado: [
    { uf: 'PA', estado: 'Pará', lotes: 2, animais: 2, vgv: 480000, pct_total: 1 },
  ],
  compradores: [
    { rank: 1, fazenda: 'Agropecuária Vale do Ouro', comprador: 'Parazão', cidade: 'Itaituba', uf: 'PA', lotes: 2, animais: 2, vgv: 480000 },
  ],
  lances: [
    { lote: '20', fazenda: 'Agropecuária Vale do Ouro', comprador: 'Parazão', uf: 'PA', assessor: 'Douglas Bispo', empresa: 'Bula Assessoria', animais: 1, parcela: 9500, vgv: 285000 },
    { lote: '19', fazenda: 'Agropecuária Vale do Ouro', comprador: 'Parazão', uf: 'PA', assessor: 'Douglas Bispo', empresa: 'Bula Assessoria', animais: 1, parcela: 6500, vgv: 195000 },
  ],
  distribuicao_empresa: [
    { empresa: 'Bula Assessoria', transacoes: 2, animais: 2, vgv: 480000, pct_total: 1, ticket_medio: 240000 },
  ],
  perfil_genetico: null,
  lotes_catalogo: [],
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
  const description = 'Comissão Douglas Bispo (Bula Assessoria) – 2% – Lts 19 e 20 Leilão MAFRA'
  const observacao = 'Leilão 29/04/2026 – MAFRA. VGV R$ 480.000 × 2% = R$ 9.600. Único assessor vendedor. Comprador: Agropecuária Vale do Ouro (Parazão) – Itaituba/PA.'

  const { data: existing, error: errSel } = await supa
    .from('erp_finance_transactions')
    .select('id')
    .eq('description', description)
    .eq('transaction_date', '2026-04-29')
    .maybeSingle()
  if (errSel) throw errSel
  if (existing) {
    console.log(`SKIP conta a pagar (já existe id=${existing.id})`)
    return
  }

  const { data: account } = await supa
    .from('erp_finance_accounts')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  const { data: category } = await supa
    .from('erp_finance_categories')
    .select('id')
    .eq('name', 'Fornecedores')
    .eq('type', 'expense')
    .limit(1)
    .maybeSingle()

  if (!account?.id || !category?.id) {
    console.error('Conta/categoria não encontrada — pulando conta a pagar.', { account, category })
    return
  }

  const { data, error } = await supa
    .from('erp_finance_transactions')
    .insert([{
      account_id: account.id,
      category_id: category.id,
      type: 'expense',
      amount: 9600,
      description,
      observacao,
      transaction_date: '2026-04-29',
      status: 'pending',
    }])
    .select('id')
    .single()
  if (error) throw error
  console.log(`INSERTED conta a pagar (${data.id})`)
}

;(async () => {
  try {
    await upsertFechamento()
    await upsertContaAPagar()
  } catch (e) {
    console.error('ERROR:', e.message || e)
    process.exitCode = 1
  }
})()
