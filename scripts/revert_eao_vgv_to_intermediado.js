// One-shot: aplica database/revert_fechamento_mega_eao_vgv_intermediado.sql
// Roda os UPDATEs direto via Supabase, sem precisar abrir o SQL Editor.
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

const updates = [
  { match: { nome: '6º Mega EAO – Fêmeas – Expozebu 02/05/2026', data: '2026-05-02' },
    patch: { vgv_total: 612900, animais_vendidos: 15, ticket_medio: 68100 } },
  { match: { nome: '6º Mega EAO – Touros – Expozebu 03/05/2026', data: '2026-05-03' },
    patch: { vgv_total: 640500, animais_vendidos: 19, ticket_medio: 40031.25 } },
]

;(async () => {
  for (const { match, patch } of updates) {
    const { data: before } = await supa.from('bula_leilao_fechamento')
      .select('id, vgv_total, animais_vendidos, ticket_medio')
      .eq('nome', match.nome).eq('data', match.data).maybeSingle()
    if (!before) { console.warn('⚠ não achou:', match.nome); continue }
    const { error } = await supa.from('bula_leilao_fechamento')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', before.id)
    if (error) { console.error('✗', match.nome, error.message); continue }
    console.log(`✓ ${match.nome}`)
    console.log(`  vgv_total:        ${before.vgv_total} → ${patch.vgv_total}`)
    console.log(`  animais_vendidos: ${before.animais_vendidos} → ${patch.animais_vendidos}`)
    console.log(`  ticket_medio:     ${before.ticket_medio} → ${patch.ticket_medio}`)
  }
})()
