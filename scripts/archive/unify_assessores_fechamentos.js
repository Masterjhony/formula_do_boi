/**
 * Unifica variantes de nome de assessor em bula_leilao_fechamento
 * (campos JSONB por_assessor e lances).
 *
 * Mapping (autorizado pelo chefe via WhatsApp 2026-05-05):
 *   "Douglas Bispo Carvalho"                                     -> "Douglas Bispo"
 *   "Fábio de Omena Gaia"                                        -> "Fábio Omena"
 *   "Fábio de Omena Gaia (c/ co-assessoria Leandro Moura)"       -> "Fábio Omena"
 *       (a co-assessoria vai pro campo `observacao` do lance)
 *   "Leonardo Serafim Francisco"                                 -> "Leonardo Serafim"
 *   "Marcelo"                                                    -> "Marcelo Carneiro"
 *
 * Empresas: por enquanto não normalizamos para "Bula × Fórmula".
 * Mantemos "Bula Assessoria"/"Fórmula do Boi"/"Bula Remates" como
 * estão — a regra de bucket Bula × Fórmula já é aplicada no display
 * pelo FechamentoView.
 *
 * Idempotente: rodar quantas vezes precisar.
 *
 * Uso: node scripts/unify_assessores_fechamentos.js [--dry-run]
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
  if (!m) continue
  let v = m[2]
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
  process.env[m[1]] = v
}

const DRY = process.argv.includes('--dry-run')
const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const NAME_MAP = new Map([
  ['douglas bispo carvalho', { canonico: 'Douglas Bispo' }],
  ['fábio de omena gaia', { canonico: 'Fábio Omena' }],
  ['fabio de omena gaia', { canonico: 'Fábio Omena' }],
  ['fábio de omena gaia (c/ co-assessoria leandro moura)', { canonico: 'Fábio Omena', addObs: 'co-assessoria Leandro Moura' }],
  ['fabio de omena gaia (c/ co-assessoria leandro moura)', { canonico: 'Fábio Omena', addObs: 'co-assessoria Leandro Moura' }],
  ['leonardo serafim francisco', { canonico: 'Leonardo Serafim' }],
  ['marcelo', { canonico: 'Marcelo Carneiro' }],
])

function mapName(orig) {
  if (!orig || typeof orig !== 'string') return null
  const key = orig.trim().toLowerCase()
  return NAME_MAP.get(key) || null
}

function unifyPorAssessor(arr) {
  if (!Array.isArray(arr)) return { changed: false, value: arr }
  const merged = new Map() // canonico -> entry
  let changed = false

  for (const a of arr) {
    const m = mapName(a.nome)
    const nome = m ? m.canonico : a.nome
    if (m) changed = true
    if (merged.has(nome)) {
      const e = merged.get(nome)
      e.transacoes = (e.transacoes || 0) + (a.transacoes || 0)
      e.animais = (e.animais || 0) + (a.animais || 0)
      e.vgv = (e.vgv || 0) + (a.vgv || 0)
      e.pct_total = (e.pct_total || 0) + (a.pct_total || 0)
      e.ticket_medio = e.transacoes ? Math.round(e.vgv / e.transacoes) : 0
      changed = true
    } else {
      merged.set(nome, { ...a, nome })
    }
  }

  // re-rank por VGV
  const out = [...merged.values()]
    .sort((x, y) => (y.vgv || 0) - (x.vgv || 0))
    .map((e, i) => ({ ...e, posicao: i + 1 }))

  if (out.length !== arr.length) changed = true
  return { changed, value: out }
}

function unifyLances(arr) {
  if (!Array.isArray(arr)) return { changed: false, value: arr }
  let changed = false
  const out = arr.map(l => {
    const m = mapName(l.assessor)
    if (!m) return l
    changed = true
    const next = { ...l, assessor: m.canonico }
    if (m.addObs) {
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
    .select('id, nome, data, por_assessor, lances')

  if (error) { console.error('ERR:', error.message); process.exit(1) }

  let totalChanged = 0
  for (const r of rows) {
    const pa = unifyPorAssessor(r.por_assessor)
    const ln = unifyLances(r.lances)
    if (!pa.changed && !ln.changed) continue

    totalChanged++
    console.log(`\n→ ${r.data} | ${r.nome}`)
    if (pa.changed) {
      console.log('  por_assessor:', r.por_assessor.map(a => a.nome).join(', '))
      console.log('         após:', pa.value.map(a => a.nome).join(', '))
    }
    if (ln.changed) {
      const before = new Set((r.lances || []).map(l => l.assessor))
      const after = new Set(ln.value.map(l => l.assessor))
      console.log('  lances assessores antes:', [...before].join(', '))
      console.log('         após:', [...after].join(', '))
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
