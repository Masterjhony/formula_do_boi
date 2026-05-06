// ============================================================
// Redireciona a conta a pagar de R$ 2.664 do Marcelo para o Fábio.
//
// Contexto: a conta foi criada com a atribuição errada (Marcelo).
// Quem vendeu foi o Fábio Omena (Bula Assessoria). 2% × R$ 133.200
// = R$ 2.664 — mesmo valor. Só muda o destinatário da comissão.
//
// Faz dois updates:
//   1) erp_finance_transactions: description + observação
//   2) bula_leilao_fechamento: comissao_assessoria volta a 2.664,
//      sobra_bruta = -2.664, observação atualizada.
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

const DESC_ANTIGA = 'Comissão Marcelo Carneiro (Fórmula do Boi) – 2% – 9 lotes Leilão Pintado Raiz (Garoa)'
const DESC_NOVA   = 'Comissão Fábio Omena (Bula Assessoria) – 2% – 9 lotes Leilão Pintado Raiz (Garoa)'
const OBS_NOVA =
  'Leilão 05/05/2026 – 2º Leilão Pintado Raiz (Fazenda Garoa). ' +
  'Fábio Omena (Bula Assessoria) intermediou 9 transações (13 lotes/animais, VGV R$ 133.200). ' +
  '2% × R$ 133.200 = R$ 2.664. ' +
  'Compradores: Vinicius Baleeiro (×9 animais), Marlon Ferreira (×2 BA), Airon Tavares (×2 PE). ' +
  '[Correção 06/05] Conta originalmente criada como "Comissão Marcelo Carneiro" – Marcelo só reportou os lances no grupo, quem vendeu foi o Fábio. Redirecionada para o Fábio Omena.'

const NOME_FECHAMENTO = '2º Leilão Pintado Raiz – 05/05/2026'
const DATA = '2026-05-05'

const OBS_FECHAMENTO_NOVA =
  'Os valores deste fechamento refletem APENAS a participação Bula/Fórmula no leilão (mesma convenção do MAFRA/Terra Brava): ' +
  '16 lotes / 16 animais / VGV R$ 160.800. ' +
  'O total geral do leilão (PDF "Médias por Raças" – Agreste Leilões) foi 39 lotes / R$ 458.800 (Maciel Pereira da Silva como vendedor único listado), ' +
  'do qual nossa equipe intermediou ~35,05%. ' +
  'IMPORTANTE: Marcelo Carneiro só REPORTOU os lances no grupo do WhatsApp – quem efetivamente VENDEU foi o Fábio Omena (Bula Assessoria), exceto os 3 lotes do Mateus Alves. Confirmado pelo Marcelo em 06/05 16:34: "Sim, menos os do Matheus". ' +
  'Pagamento em 40x (1 + 39 mensais; à vista -15%). ' +
  'Fábio Omena (Bula Assessoria) levou 9 transações / 13 lotes / R$ 133.200 (82,84% da nossa parte). ' +
  'Mateus Alves (Bula) levou 1 transação / 3 lotes (Lts 28·03·08) / R$ 27.600 (17,16%) – comprador Lucio Antônio Machado. ' +
  'Compradores únicos da nossa parte (4): Vinicius Baleeiro (9 animais, R$ 87.600 – UF n/i), Lucio Antônio Machado (3, R$ 27.600 – UF n/i), Airon Tavares (2 PE, R$ 23.600), Marlon Ferreira (2 BA, R$ 22.000). ' +
  'Comissão: R$ 2.664 (2% × R$ 133.200) – paga ao Fábio Omena, lançada como expense pending no ERP. Mateus Alves não está na regra de comissão (não no roster FDB). ' +
  '⚠ Mateus Alves NÃO está no roster canônico (leiloes_equipe) — verificar identidade. ' +
  '⚠ UF de Vinicius Baleeiro e Lucio Antônio Machado não foi reportada (R$ 115.200 sem UF). ' +
  'Maior lance (parcela) da nossa parte: R$ 370/parc. (Lt 46, Vinicius). Maior do leilão geral: R$ 20.400 – MUMBAI FIV GC DA SL (touro), comprador Ricardo Esteves Brito Costa.'

;(async () => {
  // ── 1) Conta a pagar: redireciona Marcelo → Fábio ────────────
  const { data: conta, error: e1 } = await supa
    .from('erp_finance_transactions')
    .select('id, amount, status, description')
    .eq('description', DESC_ANTIGA)
    .eq('transaction_date', DATA)
    .maybeSingle()
  if (e1) { console.error('ERRO select conta:', e1.message); process.exit(1) }
  if (!conta) { console.error('Conta antiga não encontrada — pode já ter sido renomeada.'); process.exit(0) }

  console.log(`Conta antes: id ${conta.id}  •  R$ ${conta.amount}  •  ${conta.status}`)
  console.log(`             "${conta.description}"`)

  const { error: e2 } = await supa
    .from('erp_finance_transactions')
    .update({
      description: DESC_NOVA,
      observacao: OBS_NOVA,
    })
    .eq('id', conta.id)
  if (e2) { console.error('ERRO update conta:', e2.message); process.exit(1) }

  console.log(`✓ Conta atualizada — agora "${DESC_NOVA}"`)
  console.log(`  Valor R$ 2.664 e status pending mantidos (mesmo valor: 2% × 133.200).`)

  // ── 2) Fechamento: restaura comissao_assessoria = 2664 ───────
  const { data: row } = await supa
    .from('bula_leilao_fechamento')
    .select('id, comissao_assessoria, sobra_bruta')
    .eq('nome', NOME_FECHAMENTO)
    .eq('data', DATA)
    .single()

  console.log(`\nFechamento antes: comissao=${row.comissao_assessoria}  sobra_bruta=${row.sobra_bruta}`)

  const { error: e3 } = await supa
    .from('bula_leilao_fechamento')
    .update({
      comissao_assessoria: 2664,
      sobra_bruta: -2664,
      observacoes: OBS_FECHAMENTO_NOVA,
      updated_at: new Date().toISOString(),
    })
    .eq('id', row.id)
  if (e3) { console.error('ERRO update fechamento:', e3.message); process.exit(1) }

  console.log(`✓ Fechamento: comissao 0 → 2664 (Fábio Omena), sobra_bruta 0 → -2664`)

  console.log('\n══ Resumo final ══')
  console.log('  • Comissão R$ 2.664 redirecionada: Marcelo Carneiro → Fábio Omena (Bula Assessoria)')
  console.log('  • Pagamento e ID da transação preservados (não criou nova entrada).')
  console.log('  • Fechamento: comissao_assessoria volta a R$ 2.664.')
})()
