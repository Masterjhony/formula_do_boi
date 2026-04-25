const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
for (const line of fs.readFileSync('C:/Users/Notebook-Acer/Desktop/formula_boi/formula_boi/.env.local','utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/); if (!m) continue
  let v = m[2]; if ((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'"))) v=v.slice(1,-1)
  process.env[m[1]] = v
}
const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
;(async () => {
  const { data: fechs, error: e1 } = await supa.from('bula_leilao_fechamento')
    .select('id, nome, data, vgv_total, comissao_assessoria, receita_bula, sobra_bruta, observacoes')
    .order('data', { ascending: false })
  console.log('=== FECHAMENTOS ===')
  for (const f of fechs || []) {
    console.log(`${f.data} | ${f.nome.padEnd(40)} | vgv=${f.vgv_total} | receita=${f.receita_bula} | comissao=${f.comissao_assessoria} | sobra=${f.sobra_bruta}`)
  }
  if (e1) console.log('ERR:', e1.message)
  
  const { data: leiloes } = await supa.from('bula_leiloes')
    .select('id, nome, data, criador, status')
    .order('data', { ascending: false })
    .limit(30)
  console.log('\n=== BULA_LEILOES (recentes) ===')
  for (const l of leiloes || []) {
    console.log(`${l.data} | ${l.nome.padEnd(40)} | criador=${l.criador||'—'} | status=${l.status}`)
  }
})()
