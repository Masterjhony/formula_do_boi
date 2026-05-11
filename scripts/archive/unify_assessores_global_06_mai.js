// ============================================================
// Unificação global de nomes/empresas de assessor — 06/05/2026
//
// Problema (chefe via WhatsApp 16:37): "Estamos tendo duplicidade
// nos nomes, temos que ter só um nome. Ex: Douglas duas vezes."
//
// Diagnóstico (scripts/discover_assessor_variants.js):
//   • Douglas Bispo Carvalho                → Douglas Bispo  (REAL DUPLICATA: ambos aparecem)
//   • Fábio de Omena Gaia (e variantes)     → Fábio Omena    (DUPLICATA potencial)
//   • Leonardo Serafim Francisco            → Leonardo Serafim
//   • Marcelo                               → Marcelo Carneiro
//
//   Empresa inconsistente para canônicos:
//   • Douglas Bispo / Fábio Omena / Leonardo Serafim aparecem
//     em uns lugares como "Bula Remates", em outros como
//     "Bula Assessoria". Padronizar para "Bula Assessoria"
//     (conforme leiloes_equipe).
//
// Não mexe (decisão consciente):
//   • "Bulinha (Felipe Andrade)" — apelido fica embutido no
//     nome no display; só aparece em 1 fechamento, não duplica.
//   • "Mateus Alves" — único, fora do roster (chefe pode
//     adicionar depois se quiser canonicalizar).
//
// Idempotente. Marca em observações o histórico de unificação.
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

const DRY = process.argv.includes('--dry-run')
const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// ── Mapeamento de nomes (variante lowercase → canônico) ──
const NAME_MAP = new Map([
  ['douglas bispo carvalho',                                  { canonico: 'Douglas Bispo' }],
  ['fábio de omena gaia',                                     { canonico: 'Fábio Omena' }],
  ['fabio de omena gaia',                                     { canonico: 'Fábio Omena' }],
  ['fábio de omena gaia (c/ co-assessoria leandro moura)',    { canonico: 'Fábio Omena', addObs: 'co-assessoria Leandro Moura' }],
  ['fabio de omena gaia (c/ co-assessoria leandro moura)',    { canonico: 'Fábio Omena', addObs: 'co-assessoria Leandro Moura' }],
  ['leonardo serafim francisco',                              { canonico: 'Leonardo Serafim' }],
  ['marcelo',                                                 { canonico: 'Marcelo Carneiro' }],
])

// ── Empresa canônica para os assessores do roster leiloes_equipe ──
// (não tocamos empresa de Mateus Alves nem Bulinha — fora do escopo desta unificação)
const EMPRESA_CANONICA = new Map([
  ['douglas bispo',     'Bula Assessoria'],
  ['fábio omena',       'Bula Assessoria'],
  ['leonardo serafim',  'Bula Assessoria'],
  ['matheus amormino',  'Fórmula do Boi'],
  ['marcelo carneiro',  'Fórmula do Boi'],
])

function mapName(orig) {
  if (!orig || typeof orig !== 'string') return null
  return NAME_MAP.get(orig.trim().toLowerCase()) || null
}

function canonEmpresa(nomeCanonico, atual) {
  const c = EMPRESA_CANONICA.get((nomeCanonico || '').toLowerCase())
  return c || atual
}

// Recalcula por_assessor: aplica nome+empresa canônicos e MERGE entries duplicadas.
function unifyPorAssessor(arr, vgvTotal) {
  if (!Array.isArray(arr)) return { changed: false, value: arr }
  const merged = new Map()
  let changed = false

  for (const a of arr) {
    const m = mapName(a.nome)
    const nome = m ? m.canonico : a.nome
    const empresaCan = canonEmpresa(nome, a.empresa)
    if (m) changed = true
    if (empresaCan !== a.empresa) changed = true

    if (merged.has(nome)) {
      const e = merged.get(nome)
      e.transacoes = (e.transacoes || 0) + (a.transacoes || 0)
      e.animais = (e.animais || 0) + (a.animais || 0)
      e.vgv = (e.vgv || 0) + (a.vgv || 0)
      e.ticket_medio = e.transacoes ? Math.round(e.vgv / e.transacoes) : 0
      changed = true
    } else {
      merged.set(nome, { ...a, nome, empresa: empresaCan })
    }
  }

  // Re-rank por VGV e recalcula pct_total relativo ao próprio total
  const total = vgvTotal || [...merged.values()].reduce((s, e) => s + (e.vgv || 0), 0)
  const out = [...merged.values()]
    .sort((x, y) => (y.vgv || 0) - (x.vgv || 0))
    .map((e, i) => ({
      ...e,
      posicao: i + 1,
      pct_total: total > 0 ? Math.round((e.vgv / total) * 10000) / 10000 : 0,
    }))

  if (out.length !== arr.length) changed = true
  return { changed, value: out }
}

function unifyLances(arr) {
  if (!Array.isArray(arr)) return { changed: false, value: arr }
  let changed = false
  const out = arr.map(l => {
    const m = mapName(l.assessor)
    const nomeNovo = m ? m.canonico : l.assessor
    const empresaCan = canonEmpresa(nomeNovo, l.empresa)
    if (!m && empresaCan === l.empresa) return l
    changed = true
    const next = { ...l, assessor: nomeNovo, empresa: empresaCan }
    if (m && m.addObs) {
      const prev = next.observacao || ''
      next.observacao = prev ? `${prev}; ${m.addObs}` : m.addObs
    }
    return next
  })
  return { changed, value: out }
}

;(async () => {
  const { data: rows, error } = await supa
    .from('bula_leilao_fechamento')
    .select('id, nome, data, vgv_total, por_assessor, lances')
  if (error) { console.error('ERR:', error.message); process.exit(1) }

  let totalChanged = 0
  for (const r of rows) {
    const pa = unifyPorAssessor(r.por_assessor, Number(r.vgv_total) || 0)
    const ln = unifyLances(r.lances)
    if (!pa.changed && !ln.changed) continue

    totalChanged++
    console.log(`\n→ ${r.data} | ${r.nome}`)
    if (pa.changed) {
      const before = (r.por_assessor || []).map(a => `${a.nome}/${a.empresa}`).join(' | ')
      const after  = pa.value.map(a => `${a.nome}/${a.empresa}`).join(' | ')
      console.log(`  por_assessor antes: ${before}`)
      console.log(`             depois: ${after}`)
    }
    if (ln.changed) {
      const beforeNames = new Set((r.lances || []).map(l => `${l.assessor}/${l.empresa}`))
      const afterNames = new Set(ln.value.map(l => `${l.assessor}/${l.empresa}`))
      console.log(`  lances antes: ${[...beforeNames].join(' | ')}`)
      console.log(`         depois: ${[...afterNames].join(' | ')}`)
    }

    if (!DRY) {
      const patch = {}
      if (pa.changed) patch.por_assessor = pa.value
      if (ln.changed) patch.lances = ln.value
      patch.updated_at = new Date().toISOString()
      const { error: upErr } = await supa.from('bula_leilao_fechamento').update(patch).eq('id', r.id)
      if (upErr) { console.error('  UPDATE ERR:', upErr.message); process.exit(1) }
      console.log('  ✓ atualizado')
    }
  }

  console.log(`\n${DRY ? '[DRY-RUN] ' : ''}Fechamentos com alteração: ${totalChanged}/${rows.length}`)
})()
