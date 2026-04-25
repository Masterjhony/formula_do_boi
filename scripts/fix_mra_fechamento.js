// Corrige fechamento MRA: deduplica + popula receita/comissão/sobra com base
// no comparativo da xlsx do Pérolas Cachoeirão (única fonte que detalha a economia do MRA).
// Valores: faturamento_base 1.135.000 · receita_bula 11.350 · comissao 9.993 · sobra 1.357.
//
// Uso: node scripts/fix_mra_fechamento.js
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/); if (!m) continue
  let v = m[2]; if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
  process.env[m[1]] = v
}
const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

;(async () => {
  const { data: rows, error } = await supa
    .from('bula_leilao_fechamento')
    .select('id, nome, data, vgv_total, receita_bula, comissao_assessoria, sobra_bruta, created_at, updated_at')
    .ilike('nome', '%MRA%50 Anos%')
    .order('updated_at', { ascending: false, nullsFirst: false })

  if (error) { console.error('SELECT err:', error.message); process.exit(1) }
  console.log(`Encontrados ${rows.length} registros MRA:`)
  rows.forEach(r => console.log(`  ${r.id}  upd=${r.updated_at}  receita=${r.receita_bula}`))

  if (rows.length === 0) { console.log('Nenhum MRA — abortando.'); return }

  const survivor = rows[0]
  const duplicates = rows.slice(1)

  for (const d of duplicates) {
    const { error: dErr } = await supa.from('bula_leilao_fechamento').delete().eq('id', d.id)
    if (dErr) console.error(`DELETE ${d.id} err:`, dErr.message)
    else console.log(`DELETED duplicado ${d.id}`)
  }

  const { error: uErr } = await supa.from('bula_leilao_fechamento')
    .update({
      receita_bula: 11350,
      comissao_assessoria: 9993,
      sobra_bruta: 1357,
      updated_at: new Date().toISOString(),
    })
    .eq('id', survivor.id)
  if (uErr) console.error('UPDATE err:', uErr.message)
  else console.log(`UPDATED ${survivor.id} receita=11350 comissao=9993 sobra=1357`)
})()
