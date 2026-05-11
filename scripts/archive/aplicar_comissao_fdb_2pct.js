// ============================================================
// Aplica comissão 2% como conta a pagar para vendas dos
// assessores Fórmula do Boi: Bulinha (Felipe Andrade),
// Marcelo Carneiro e Matheus Amormino.
//
// Diretiva do chefe (2026-05-05): essas três pessoas deixam
// de ser tratadas como "intercompany sem conta a pagar".
// Toda venda em que apareçam como assessor gera comissão de
// 2% sobre o VGV vendido, lançada como expense no ERP.
//
// Idempotente:
//   • erp_finance_transactions: dedup por (description, transaction_date)
//   • bula_leilao_fechamento.comissao_assessoria/sobra_bruta:
//     marcador "[FDB-COMISSAO-2PCT]" em observacoes evita
//     somar duas vezes em re-runs.
//
// Uso: node scripts/aplicar_comissao_fdb_2pct.js
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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) { console.error('Missing SUPABASE env'); process.exit(1) }
const supa = createClient(url, key)

const COMMISSION_RATE = 0.02
const APPLIED_MARKER = '[FDB-COMISSAO-2PCT]'

// Normaliza nomes pra matching tolerante a acento, caixa e parênteses
function norm(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Padrões que identificam os 3 assessores Fórmula do Boi
function isFdbAssessor(nome) {
  const n = norm(nome)
  if (!n) return false
  if (n.includes('bulinha') || n.includes('felipe andrade')) return true
  if (n.includes('marcelo carneiro')) return true   // cobre "Marcelo Primo Carneiro"
  if (n.includes('matheus amormino')) return true
  return false
}

// Primeiro nome para usar em descrições curtas
function firstName(nome) {
  if (!nome) return ''
  if (norm(nome).startsWith('bulinha') || norm(nome).startsWith('felipe andrade')) return 'Bulinha (Felipe Andrade)'
  if (norm(nome).includes('marcelo carneiro')) return 'Marcelo Carneiro'
  if (norm(nome).includes('matheus amormino')) return 'Matheus Amormino'
  return nome
}

async function ensureAccountAndCategory() {
  const { data: account } = await supa
    .from('erp_finance_accounts')
    .select('id, name')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (!account) throw new Error('Nenhuma erp_finance_accounts cadastrada — não consigo lançar conta a pagar.')

  const { data: cat } = await supa
    .from('erp_finance_categories')
    .select('id, name')
    .eq('type', 'expense')
    .ilike('name', 'Fornecedores')
    .maybeSingle()
  if (!cat) console.warn('⚠ Categoria "Fornecedores" não encontrada — lançando sem categoria.')

  return { accountId: account.id, categoryId: cat?.id || null }
}

async function upsertContaPagar({ accountId, categoryId, fechamento, assessor, valor }) {
  const nomeAssessor = firstName(assessor.nome)
  const description = `Comissão ${nomeAssessor} (Fórmula do Boi) – 2% – ${fechamento.nome}`
  const observacao =
    `Comissão automática (diretiva 2026-05-05). VGV vendido pelo assessor: ` +
    `R$ ${Number(assessor.vgv).toLocaleString('pt-BR')} × 2% = R$ ${Number(valor).toLocaleString('pt-BR')}. ` +
    `Fechamento: ${fechamento.nome} (${fechamento.data}).`

  const { data: existing } = await supa
    .from('erp_finance_transactions')
    .select('id, amount')
    .eq('description', description)
    .eq('transaction_date', fechamento.data)
    .maybeSingle()

  if (existing) {
    if (Math.round(Number(existing.amount)) !== Math.round(valor)) {
      const { error } = await supa
        .from('erp_finance_transactions')
        .update({ amount: valor, observacao, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
      if (error) throw error
      console.log(`  ↻ ATUALIZOU ${nomeAssessor}: R$ ${existing.amount} → R$ ${valor}`)
    } else {
      console.log(`  · existe (R$ ${valor}) ${nomeAssessor}`)
    }
    return false
  }

  const { error } = await supa
    .from('erp_finance_transactions')
    .insert([{
      account_id: accountId,
      category_id: categoryId,
      type: 'expense',
      amount: valor,
      description,
      observacao,
      transaction_date: fechamento.data,
      status: 'pending',
    }])
  if (error) throw error
  console.log(`  ✓ INSERIU ${nomeAssessor}: R$ ${valor}`)
  return true
}

async function ajustarFechamento(fechamento, fdbDelta) {
  const obs = fechamento.observacoes || ''
  if (obs.includes(APPLIED_MARKER)) {
    console.log(`  · totais já ajustados — pulando comissao_assessoria/sobra_bruta`)
    return
  }
  const novaComissao = Number(fechamento.comissao_assessoria || 0) + fdbDelta
  const receita = Number(fechamento.receita_bula || 0)
  const novaSobra = receita > 0 ? receita - novaComissao : Number(fechamento.sobra_bruta || 0) - fdbDelta
  const novasObs = (obs ? obs + ' ' : '') +
    `${APPLIED_MARKER} +R$ ${fdbDelta.toLocaleString('pt-BR')} em comissões 2% para Bulinha/Marcelo Carneiro/Matheus (diretiva 2026-05-05).`

  const { error } = await supa
    .from('bula_leilao_fechamento')
    .update({
      comissao_assessoria: novaComissao,
      sobra_bruta: novaSobra,
      observacoes: novasObs,
      updated_at: new Date().toISOString(),
    })
    .eq('id', fechamento.id)
  if (error) throw error
  console.log(`  ✓ comissao_assessoria: ${fechamento.comissao_assessoria} → ${novaComissao}`)
  console.log(`  ✓ sobra_bruta:         ${fechamento.sobra_bruta} → ${novaSobra}`)
}

;(async () => {
  try {
    const { accountId, categoryId } = await ensureAccountAndCategory()

    const { data: fechamentos, error } = await supa
      .from('bula_leilao_fechamento')
      .select('id, nome, data, por_assessor, comissao_assessoria, receita_bula, sobra_bruta, observacoes')
      .order('data', { ascending: true })
    if (error) throw error

    let totalInseridas = 0
    let totalValor = 0
    let leiloesAfetados = 0

    for (const f of fechamentos || []) {
      const assessores = Array.isArray(f.por_assessor) ? f.por_assessor : []
      const fdb = assessores.filter(a => isFdbAssessor(a.nome))
      if (fdb.length === 0) continue

      console.log(`\n▸ ${f.nome} (${f.data})`)
      let delta = 0
      for (const a of fdb) {
        const valor = Math.round(Number(a.vgv || 0) * COMMISSION_RATE)
        if (valor <= 0) continue
        const inserted = await upsertContaPagar({
          accountId, categoryId, fechamento: f, assessor: a, valor,
        })
        if (inserted) totalInseridas++
        delta += valor
        totalValor += valor
      }
      if (delta > 0) await ajustarFechamento(f, delta)
      leiloesAfetados++
    }

    console.log('\n═══ RESUMO ═══')
    console.log(`Leilões com assessor FdB: ${leiloesAfetados}`)
    console.log(`Contas a pagar inseridas: ${totalInseridas}`)
    console.log(`Total de comissões 2%:    R$ ${totalValor.toLocaleString('pt-BR')}`)
  } catch (e) {
    console.error('ERROR:', e.message || e)
    process.exitCode = 1
  }
})()
