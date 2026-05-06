// Read-only — descobre todas as variações de nome de assessor
// usadas em por_assessor + lances (em bula_leilao_fechamento) e
// compara contra o roster canônico (leiloes_equipe).

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

;(async () => {
  const { data: equipe } = await supa.from('leiloes_equipe').select('nome, apelido, empresa, ordem').order('ordem')
  console.log('═══ Roster canônico (leiloes_equipe) ═══')
  for (const e of equipe || []) {
    console.log(`  • ${e.nome.padEnd(20)} (${e.empresa.padEnd(16)})${e.apelido ? ' — apelido: ' + e.apelido : ''}`)
  }

  const { data: rows } = await supa.from('bula_leilao_fechamento').select('id, nome, data, por_assessor, lances')
  console.log(`\n═══ Varrendo ${rows.length} fechamentos ═══\n`)

  // Mapa: nome → { count, fechamentos: Set, empresas: Set }
  const variantes = new Map()
  function addVariant(nome, empresa, fechId) {
    if (!nome || typeof nome !== 'string') return
    const key = nome.trim()
    if (!variantes.has(key)) variantes.set(key, { count: 0, fechamentos: new Set(), empresas: new Set() })
    const v = variantes.get(key)
    v.count++
    v.fechamentos.add(fechId)
    if (empresa) v.empresas.add(String(empresa).trim())
  }

  for (const r of rows) {
    for (const a of r.por_assessor || []) addVariant(a.nome, a.empresa, r.id)
    for (const l of r.lances || []) addVariant(l.assessor, l.empresa, r.id)
  }

  // Conjunto canônico (lowercase para case-insensitive)
  const canonicos = new Set((equipe || []).map(e => e.nome.toLowerCase()))

  console.log('Nome'.padEnd(40), 'Ocorr.', 'Fech.', 'Empresa(s) — STATUS')
  console.log('-'.repeat(95))
  const ordenado = [...variantes.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  for (const [nome, v] of ordenado) {
    const ehCanonico = canonicos.has(nome.toLowerCase())
    const status = ehCanonico ? '✓ canônico' : '✗ NÃO canônico'
    const empresas = [...v.empresas].join(' | ')
    console.log(nome.padEnd(40), String(v.count).padStart(6), String(v.fechamentos.size).padStart(5), '  ' + empresas.padEnd(30), status)
  }

  console.log('\n═══ Variantes que precisam ser unificadas ═══')
  for (const [nome, v] of ordenado) {
    if (canonicos.has(nome.toLowerCase())) continue
    console.log(`  • "${nome}" — ${v.count} ocorrências em ${v.fechamentos.size} fechamentos`)
  }
})()
