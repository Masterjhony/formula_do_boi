const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
for (const line of fs.readFileSync('.env.local','utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/); if (!m) continue
  let v = m[2]; if ((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'"))) v=v.slice(1,-1)
  process.env[m[1]] = v
}
const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// Tabela-verdade vinda das xlsx
const truth = {
  'Leilão Matrizes de Vanguarda':     { vgv: 127200,   receita: 13060.8, comissao: 2685,  sobra: 10375.8 },
  'Leilão IPB Prime':                  { vgv: 175200,   receita: 8547,    comissao: 3645,  sobra: 4902 },
  'Leilão Pérolas Cachoeirão':         { vgv: 508500,   receita: 13400,   comissao: 11520, sobra: 1880 },
  'Leilão JMP Supreme':                { vgv: 410400,   receita: 51872,   comissao: 10242, sobra: 41630 },
  'Leilão Terra Brava 50 Anos':        { vgv: 138600,   receita: 6930,    comissao: 4158,  sobra: 2772 },
  'Nelore MRA – 50 Anos de Seleção':   { vgv: 385800,   receita: 11350,   comissao: 9993,  sobra: 1357 },
}

;(async () => {
  const { data } = await supa.from('bula_leilao_fechamento')
    .select('nome, vgv_total, receita_bula, comissao_assessoria, sobra_bruta')
    .order('data')
  let ok = 0, fail = 0
  for (const f of data) {
    const t = truth[f.nome]
    if (!t) { console.log(`SEM-TRUTH ${f.nome}`); continue }
    const eq = (a,b) => Math.abs(Number(a)-Number(b)) < 0.5
    const checks = [
      ['vgv',      eq(f.vgv_total, t.vgv)],
      ['receita',  eq(f.receita_bula, t.receita)],
      ['comissao', eq(f.comissao_assessoria, t.comissao)],
      ['sobra',    eq(f.sobra_bruta, t.sobra)],
    ]
    const allOk = checks.every(([_,v]) => v)
    if (allOk) { console.log(`✅ ${f.nome}`); ok++ }
    else {
      console.log(`❌ ${f.nome}`)
      for (const [k,v] of checks) if (!v) console.log(`   ${k}: db=${f[k==='vgv'?'vgv_total':k==='receita'?'receita_bula':k==='comissao'?'comissao_assessoria':'sobra_bruta']} xlsx=${t[k]}`)
      fail++
    }
  }
  // Check duplicates
  const names = data.map(d => d.nome)
  const dups = names.filter((n,i) => names.indexOf(n) !== i)
  if (dups.length) console.log(`\n⚠️  Duplicados: ${[...new Set(dups)].join(', ')}`)
  console.log(`\n${ok} ok · ${fail} falhas · ${data.length} total · ${dups.length ? dups.length + ' duplicados' : 'sem duplicados'}`)
})()
