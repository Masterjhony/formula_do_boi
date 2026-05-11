// ============================================================
// Fix — 2º Leilão Pintado Raiz – 05/05/2026
//
// Correção do chefe (06/05 16:34): Marcelo Carneiro só REPORTOU
// os lances no grupo, mas quem VENDEU foi o Fábio Omena (Bula
// Assessoria). Exceção: o lance de Lts 28·03·08 (3 lotes, R$
// 27.600) foi do Mateus Alves (Bula).
//
// Impacto:
//   1. Substitui Marcelo Carneiro → Fábio Omena em por_assessor
//      e em todas as 9 lances (Lt 46, 09, 01, 29, 27, 25, 34,
//      42·40·47·33, 44·24).
//   2. comissao_assessoria volta para 0 — Fábio é Bula Assessoria,
//      regra 2% FDB (Bulinha/Marcelo/Matheus Amormino) não aplica.
//      Fábio recebe via outra rotina (memória feedback_comissao_
//      fdb_assessores.md).
//   3. sobra_bruta vira 0.
//   4. Observação atualizada.
//
// ATENÇÃO: a conta a pagar de R$ 2.664 que foi criada no ERP
// (erp_finance_transactions, descrição "Comissão Marcelo
// Carneiro... 9 lotes Leilão Pintado Raiz") fica ÓRFÃ. Este
// script NÃO deleta — surfaceio a pendência no relatório final
// para o usuário decidir.
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

const NOVO_ASSESSOR = 'Fábio Omena'
const NOVA_EMPRESA  = 'Bula Assessoria'

const PATCH = {
  por_assessor: [
    { posicao: 1, nome: 'Fábio Omena',  empresa: 'Bula Assessoria', transacoes: 9, animais: 13, vgv: 133200, ticket_medio: 14800, pct_total: 0.8284 },
    { posicao: 2, nome: 'Mateus Alves', empresa: 'Bula',             transacoes: 1, animais: 3,  vgv: 27600,  ticket_medio: 27600, pct_total: 0.1716 },
  ],

  // Mateus Alves não está na regra 2% FDB; Fábio também não (Bula
  // Assessoria tem outra rotina). Comissão deste fechamento = 0.
  comissao_assessoria: 0,
  receita_bula: 0,
  sobra_bruta: 0,

  observacoes:
    'Os valores deste fechamento refletem APENAS a participação Bula/Fórmula no leilão (mesma convenção do MAFRA/Terra Brava): ' +
    '16 lotes / 16 animais / VGV R$ 160.800. ' +
    'O total geral do leilão (PDF "Médias por Raças" – Agreste Leilões) foi 39 lotes / R$ 458.800 (Maciel Pereira da Silva como vendedor único listado), ' +
    'do qual nossa equipe intermediou ~35,05%. ' +
    'IMPORTANTE: Marcelo Carneiro só REPORTOU os lances no grupo do WhatsApp – quem efetivamente VENDEU foi o Fábio Omena (Bula Assessoria), exceto os 3 lotes do Mateus Alves. Confirmado pelo Marcelo em 06/05 16:34: "Sim, menos os do Matheus". ' +
    'Pagamento em 40x (1 + 39 mensais; à vista -15%). ' +
    'Fábio Omena (Bula Assessoria) levou 9 transações / 13 lotes / R$ 133.200 (82,84% da nossa parte). ' +
    'Mateus Alves (Bula) levou 1 transação / 3 lotes (Lts 28·03·08) / R$ 27.600 (17,16%) – comprador Lucio Antônio Machado. ' +
    'Compradores únicos da nossa parte (4): Vinicius Baleeiro (9 animais, R$ 87.600 – UF n/i), Lucio Antônio Machado (3, R$ 27.600 – UF n/i), Airon Tavares (2 PE, R$ 23.600), Marlon Ferreira (2 BA, R$ 22.000). ' +
    'Comissão deste fechamento = R$ 0 (Fábio Omena é Bula Assessoria, fora da regra 2% FDB que cobre apenas Bulinha/Marcelo Carneiro/Matheus Amormino; Fábio recebe via rotina própria). Mateus Alves também não está no roster FDB. ' +
    '⚠ A conta a pagar de R$ 2.664 criada anteriormente no ERP (descrição "Comissão Marcelo Carneiro... 9 lotes Leilão Pintado Raiz") foi baseada em premissa incorreta de que o Marcelo era o vendedor – precisa ser revertida. ' +
    '⚠ Mateus Alves NÃO está no roster canônico (leiloes_equipe) — verificar identidade. ' +
    '⚠ UF de Vinicius Baleeiro e Lucio Antônio Machado não foi reportada (R$ 115.200 sem UF). ' +
    'Maior lance (parcela) da nossa parte: R$ 370/parc. (Lt 46, Vinicius). Maior do leilão geral: R$ 20.400 – MUMBAI FIV GC DA SL (touro), comprador Ricardo Esteves Brito Costa.',
}

;(async () => {
  const { data: row, error: e1 } = await supa
    .from('bula_leilao_fechamento')
    .select('id, lances, por_assessor, comissao_assessoria')
    .eq('nome', NOME)
    .eq('data', DATA)
    .maybeSingle()
  if (e1) { console.error('ERRO select:', e1.message); process.exit(1) }
  if (!row) { console.error('Não encontrado'); process.exit(1) }

  // Reescreve as lances: tudo que estava como Marcelo Carneiro vai para Fábio Omena.
  // Mateus Alves permanece intacto.
  const novasLances = (row.lances || []).map(l => {
    if (l.assessor === 'Marcelo Carneiro') {
      return { ...l, assessor: NOVO_ASSESSOR, empresa: NOVA_EMPRESA }
    }
    return l
  })

  console.log('Lances reatribuídos: Marcelo → Fábio:',
    novasLances.filter(l => l.assessor === NOVO_ASSESSOR).length, '/ Mateus mantido:',
    novasLances.filter(l => l.assessor === 'Mateus Alves').length)

  const { error } = await supa
    .from('bula_leilao_fechamento')
    .update({ ...PATCH, lances: novasLances, updated_at: new Date().toISOString() })
    .eq('id', row.id)
  if (error) { console.error('ERRO update:', error.message); process.exit(1) }

  console.log('\n✓ Fechamento atualizado')
  console.log('  por_assessor: Fábio Omena (Bula Assessoria) #1, Mateus Alves (Bula) #2')
  console.log('  comissao_assessoria: R$', row.comissao_assessoria, '→ R$ 0')
  console.log('  Lances: assessor "Marcelo Carneiro" → "Fábio Omena" (empresa "Fórmula do Boi" → "Bula Assessoria") em 9 lances')

  // Surfaceia a conta a pagar órfã
  const { data: contas } = await supa
    .from('erp_finance_transactions')
    .select('id, amount, status, description')
    .eq('description', 'Comissão Marcelo Carneiro (Fórmula do Boi) – 2% – 9 lotes Leilão Pintado Raiz (Garoa)')
    .eq('transaction_date', DATA)
  if (contas && contas.length) {
    console.log('\n⚠ CONTA A PAGAR ÓRFÃ no ERP:')
    for (const c of contas) {
      console.log(`  • id ${c.id}  •  R$ ${c.amount}  •  ${c.status}`)
      console.log(`    "${c.description}"`)
    }
    console.log('  → Foi criada com base na atribuição errada (Marcelo). Como Fábio (Bula Assessoria) não cai na regra 2% FDB, esta conta deveria ser DELETADA ou cancelada.')
    console.log('  → Não deletei automaticamente — deletes em prod precisam de confirmação explícita.')
  }
})()
