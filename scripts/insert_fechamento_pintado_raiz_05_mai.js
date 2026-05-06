// ============================================================
// Insert/Upsert — 2º Leilão Pintado Raiz – 05/05/2026
//
// Os SQLs em database/insert_fechamento_pintado_raiz_05_mai_2026.sql
// e database/insert_fechamentos_05_mai_2026.sql nunca foram
// aplicados em produção (verificado por scripts/verify_fechamento_
// pintado_raiz_05_mai.js — fechamento ausente). O chefe cobrou
// "esse de ontem que não subiu" — este script aplica tudo de uma
// vez, idempotente:
//
//   1) Cria/atualiza o fechamento com os dados oficiais
//      (Médias por Raças – Agreste Leilões) + lances reportados.
//   2) Insere a conta a pagar 2% × R$ 133.200 = R$ 2.664
//      (Marcelo Carneiro — regra FDB).
//
// IMPORTANTE: parcelamento é 40x (1+39 mensais), não 30x —
// confirmado pelo PDF "Ordem de Entrada" e pelo recado do Marcelo.
// VGV de cada lance = parcela × 40 × animais.
// ============================================================

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

const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const NOME = '2º Leilão Pintado Raiz – 05/05/2026'
const DATA = '2026-05-05'
const LOCAL = 'Maceió – AL'

const VGV_MARCELO = 133200
const COMISSAO_MARCELO = Math.round(VGV_MARCELO * 0.02 * 100) / 100 // 2.664

const FECHAMENTO = {
  nome: NOME,
  data: DATA,
  local: LOCAL,
  lotes_ofertados: 40,
  lotes_vendidos: 39,
  animais_vendidos: 39,
  vgv_total: 458800,
  ticket_medio: 11764.10,
  maior_lance: 20400,
  compradores_unicos: 5,
  estados_alcancados: 2,

  por_assessor: [
    { posicao: 1, nome: 'Marcelo Carneiro', empresa: 'Fórmula do Boi', transacoes: 9, animais: 13, vgv: 133200, ticket_medio: 14800, pct_total: 0.2903 },
    { posicao: 2, nome: 'Mateus Alves',     empresa: 'Bula',           transacoes: 1, animais: 3,  vgv: 27600,  ticket_medio: 27600, pct_total: 0.0602 },
  ],

  por_estado: [
    { uf: 'PE', estado: 'Pernambuco', lotes: 2, animais: 2, vgv: 23600, pct_total: 0.0514 },
    { uf: 'BA', estado: 'Bahia',      lotes: 2, animais: 2, vgv: 22000, pct_total: 0.0479 },
  ],

  compradores: [
    { rank: 1, fazenda: '', comprador: 'Vinicius Baleeiro Pereira Guimaraes', cidade: '', uf: '', lotes: 9, animais: 9, vgv: 87600 },
    { rank: 2, fazenda: '', comprador: 'Mackson Guilherme Maciel Silva',      cidade: '', uf: '', lotes: 0, animais: 0, vgv: 0 },
    { rank: 3, fazenda: '', comprador: 'Alan Sttenyo Veras de Resende',       cidade: '', uf: '', lotes: 0, animais: 0, vgv: 0 },
    { rank: 4, fazenda: '', comprador: 'Renato Pereira da Silva',             cidade: '', uf: '', lotes: 0, animais: 0, vgv: 0 },
    { rank: 5, fazenda: '', comprador: 'Genivaldo Nascimento Almeida',        cidade: '', uf: '', lotes: 0, animais: 0, vgv: 0 },
  ],

  lances: [
    { lote: '46',          fazenda: '',                        comprador: 'Vinicius Baleeiro',        uf: '',   assessor: 'Marcelo Carneiro', empresa: 'Fórmula do Boi', animais: 1, parcela: 370, vgv: 14800 },
    { lote: '09',          fazenda: '',                        comprador: 'Vinicius Baleeiro',        uf: '',   assessor: 'Marcelo Carneiro', empresa: 'Fórmula do Boi', animais: 1, parcela: 360, vgv: 14400 },
    { lote: '01',          fazenda: 'Fazenda Noemia Macedo',   comprador: 'Airon Tavares',  cidade: 'São Caetano', uf: 'PE', assessor: 'Marcelo Carneiro', empresa: 'Fórmula do Boi', animais: 1, parcela: 360, vgv: 14400 },
    { lote: '29',          fazenda: 'Fazenda Saco',            comprador: 'Marlon Ferreira', cidade: 'Água Fria',  uf: 'BA', assessor: 'Marcelo Carneiro', empresa: 'Fórmula do Boi', animais: 1, parcela: 280, vgv: 11200 },
    { lote: '27',          fazenda: 'Fazenda Saco',            comprador: 'Marlon Ferreira', cidade: 'Água Fria',  uf: 'BA', assessor: 'Marcelo Carneiro', empresa: 'Fórmula do Boi', animais: 1, parcela: 270, vgv: 10800 },
    { lote: '25',          fazenda: '',                        comprador: 'Airon Tavares',           uf: 'PE', assessor: 'Marcelo Carneiro', empresa: 'Fórmula do Boi', animais: 1, parcela: 230, vgv: 9200 },
    { lote: '34',          fazenda: '',                        comprador: 'Vinicius Baleeiro',        uf: '',   assessor: 'Marcelo Carneiro', empresa: 'Fórmula do Boi', animais: 1, parcela: 200, vgv: 8000 },
    { lote: '42·40·47·33', fazenda: '',                        comprador: 'Vinicius Baleeiro',        uf: '',   assessor: 'Marcelo Carneiro', empresa: 'Fórmula do Boi', animais: 4, parcela: 210, vgv: 33600 },
    { lote: '44·24',       fazenda: '',                        comprador: 'Vinicius Baleeiro',        uf: '',   assessor: 'Marcelo Carneiro', empresa: 'Fórmula do Boi', animais: 2, parcela: 210, vgv: 16800 },
    { lote: '28·03·08',    fazenda: '',                        comprador: 'Lucio Antônio Machado',    uf: '',   assessor: 'Mateus Alves',     empresa: 'Bula',           animais: 3, parcela: 230, vgv: 27600 },
  ],

  perfil_genetico: null,
  comissao_assessoria: COMISSAO_MARCELO,
  receita_bula: 0,
  sobra_bruta: -COMISSAO_MARCELO,

  observacoes:
    'Resultado OFICIAL (PDF "Médias por Raças" – Agreste Leilões): 39 animais vendidos / R$ 458.800 / ticket R$ 11.764,10. ' +
    'Maior lance: MUMBAI FIV GC DA SL (touro) – R$ 20.400 (comprador Ricardo Esteves Brito Costa). ' +
    'Pagamento em 40x (1 à vista + 39 mensais); valores na coluna "parcela" são mensais; VGV de cada lance = parcela × 40 × animais. ' +
    'À vista: -15%. Frete grátis em BA/SE/AL/PE/PB/RN/CE/PI/MA/TO. Comissão de compra: 8% sobre o martelo. ' +
    'Lances reportados pelo Marcelo Carneiro via WhatsApp: 9 transações para o Marcelo (13 animais, VGV R$ 133.200) ' +
    '+ 1 transação atribuída a "Mateus Alves (Bula)" (Lts 28·03·08, 3 fêmeas, R$ 27.600 – comprador Lucio Antônio Machado). ' +
    'Compradores: Vinicius Baleeiro (9 animais), Marlon Ferreira (2 BA), Airon Tavares (2 PE), Lucio Antônio Machado (3). ' +
    '⚠ Mateus Alves NÃO está no roster canônico (leiloes_equipe) – verificar identidade e se cabe na regra de comissão. ' +
    'UF do Vinicius Baleeiro Pereira Guimaraes (1º maior comprador) e dos demais 4 não foi confirmada. ' +
    'Vendedor único listado nas Médias por Raças: Maciel Pereira da Silva.',
}

const CONTA_PAGAR_DESC = 'Comissão Marcelo Carneiro (Fórmula do Boi) – 2% – 9 lotes Leilão Pintado Raiz (Garoa)'
const CONTA_PAGAR_OBS =
  'Leilão 05/05/2026 – 2º Leilão Pintado Raiz (Fazenda Garoa). ' +
  'Marcelo Carneiro intermediou 9 transações (13 animais, VGV R$ 133.200). ' +
  '2% × R$ 133.200 = R$ 2.664. Compradores: Vinicius Baleeiro (×9 animais), Marlon Ferreira (×2 BA), Airon Tavares (×2 PE).'

;(async () => {
  // ── 1) Upsert do fechamento ────────────────────────────────
  const { data: existente, error: e1 } = await supa
    .from('bula_leilao_fechamento')
    .select('id, lotes_ofertados, lotes_vendidos, vgv_total')
    .eq('nome', NOME)
    .eq('data', DATA)
    .maybeSingle()
  if (e1) { console.error('ERRO select fechamento:', e1.message); process.exit(1) }

  if (existente) {
    console.log(`= JÁ EXISTE — id ${existente.id}`)
    console.log(`  Antes: ofert=${existente.lotes_ofertados}  vend=${existente.lotes_vendidos}  vgv=${existente.vgv_total}`)
    const { error } = await supa
      .from('bula_leilao_fechamento')
      .update({ ...FECHAMENTO, updated_at: new Date().toISOString() })
      .eq('id', existente.id)
    if (error) { console.error('ERRO update fechamento:', error.message); process.exit(1) }
    console.log(`  ✓ atualizado com dados oficiais (40 ofert / 39 vend / R$ 458.800)`)
  } else {
    const { data: ins, error } = await supa
      .from('bula_leilao_fechamento')
      .insert(FECHAMENTO)
      .select('id')
      .single()
    if (error) { console.error('ERRO insert fechamento:', error.message); process.exit(1) }
    console.log(`✓ Fechamento criado — id ${ins.id}`)
    console.log(`  ofert=40  vend=39  VGV=R$ 458.800  •  ticket R$ 11.764,10  •  maior R$ 20.400`)
  }

  // ── 2) Conta a pagar 2% Marcelo ────────────────────────────
  const { data: contaExistente, error: e2 } = await supa
    .from('erp_finance_transactions')
    .select('id, amount, status')
    .eq('description', CONTA_PAGAR_DESC)
    .eq('transaction_date', DATA)
    .maybeSingle()
  if (e2) { console.error('ERRO select conta:', e2.message); process.exit(1) }

  if (contaExistente) {
    console.log(`\n= Conta a pagar JÁ EXISTE — id ${contaExistente.id} (${contaExistente.status}, R$ ${contaExistente.amount})`)
  } else {
    // Resolve IDs de account/category
    const { data: account } = await supa
      .from('erp_finance_accounts')
      .select('id')
      .order('created_at')
      .limit(1)
      .single()
    const { data: category } = await supa
      .from('erp_finance_categories')
      .select('id')
      .eq('name', 'Fornecedores')
      .eq('type', 'expense')
      .limit(1)
      .single()

    if (!account || !category) {
      console.error('ERRO: account/category não encontrados (account=%s category=%s)', !!account, !!category)
      process.exit(1)
    }

    const { data: ins, error } = await supa
      .from('erp_finance_transactions')
      .insert({
        account_id: account.id,
        category_id: category.id,
        type: 'expense',
        amount: COMISSAO_MARCELO,
        description: CONTA_PAGAR_DESC,
        observacao: CONTA_PAGAR_OBS,
        transaction_date: DATA,
        status: 'pending',
      })
      .select('id')
      .single()
    if (error) { console.error('ERRO insert conta:', error.message); process.exit(1) }
    console.log(`\n✓ Conta a pagar criada — id ${ins.id}  •  R$ ${COMISSAO_MARCELO}  •  pending`)
  }

  console.log('\n══ Resumo ══')
  console.log(`  • Fechamento:  ${NOME}`)
  console.log(`  • Lotes:       40 ofertados / 39 vendidos`)
  console.log(`  • VGV total:   R$ 458.800,00 (oficial Agreste)`)
  console.log(`  • Bula/Fórm.:  16 animais / R$ 160.800 (35,05%)`)
  console.log(`     - Marcelo:  13 animais / R$ 133.200 (9 lances)`)
  console.log(`     - M. Alves:  3 animais / R$  27.600 (1 lance)`)
  console.log(`  • Comissão:    R$ 2.664 (2% × 133.200) – pending no ERP`)
})()
