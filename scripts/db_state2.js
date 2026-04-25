const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
for (const line of fs.readFileSync('.env.local','utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/); if (!m) continue
  let v = m[2]; if ((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'"))) v=v.slice(1,-1)
  process.env[m[1]] = v
}
const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
;(async () => {
  const { data: leiloes, error } = await supa.from('bula_leiloes')
    .select('*')
    .order('data', { ascending: false })
  console.log(`Total bula_leiloes: ${(leiloes||[]).length}`)
  console.log('Cols:', leiloes && leiloes[0] ? Object.keys(leiloes[0]).join(', ') : 'no rows')
  console.log()
  for (const l of leiloes || []) {
    console.log(`${l.data} | ${(l.nome||'').padEnd(40)} | criador=${l.criador||'—'} | comissao_receber=${l.comissao_receber} | recebido=${l.recebido} | status=${l.status}`)
  }
  if (error) console.log('ERR:', error.message)
})()
