// Read-only — verifica o estado atual do fechamento "2º Leilão
// Pintado Raiz – 05/05/2026" e compara com os dados oficiais
// (Médias por Raças + lances reportados).
//
// Roda sem efeito colateral. Só imprime relatório.

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

const ESPERADO = {
  lotes_ofertados: 40,
  lotes_vendidos: 39,
  animais_vendidos: 39,
  vgv_total: 458800,
  ticket_medio: 11764.1,
  maior_lance: 20400,
  comissao_assessoria: 2664,
}

const LANCES_ESPERADOS = [
  { lote: '46',         parcela: 370, animais: 1, vgv: 14800, assessor: 'Marcelo Carneiro' },
  { lote: '09',         parcela: 360, animais: 1, vgv: 14400, assessor: 'Marcelo Carneiro' },
  { lote: '01',         parcela: 360, animais: 1, vgv: 14400, assessor: 'Marcelo Carneiro' },
  { lote: '29',         parcela: 280, animais: 1, vgv: 11200, assessor: 'Marcelo Carneiro' },
  { lote: '27',         parcela: 270, animais: 1, vgv: 10800, assessor: 'Marcelo Carneiro' },
  { lote: '25',         parcela: 230, animais: 1, vgv: 9200,  assessor: 'Marcelo Carneiro' },
  { lote: '34',         parcela: 200, animais: 1, vgv: 8000,  assessor: 'Marcelo Carneiro' },
  { lote: '42·40·47·33',parcela: 210, animais: 4, vgv: 33600, assessor: 'Marcelo Carneiro' },
  { lote: '44·24',      parcela: 210, animais: 2, vgv: 16800, assessor: 'Marcelo Carneiro' },
  { lote: '28·03·08',   parcela: 230, animais: 3, vgv: 27600, assessor: 'Mateus Alves' },
]

function fmtBRL(n) {
  return Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

;(async () => {
  // Busca por qualquer registro na data 05/05 ou que tenha "Pintado" no nome
  const { data: candidatos, error: eAll } = await supa
    .from('bula_leilao_fechamento')
    .select('id, nome, data, lotes_ofertados, lotes_vendidos, animais_vendidos, vgv_total')
    .or(`data.eq.2026-05-05,nome.ilike.%Pintado%`)
    .order('data')
  if (eAll) { console.error('ERRO query:', eAll.message); process.exit(1) }

  console.log('\n═══ CANDIDATOS (data=2026-05-05 OU nome ilike "Pintado") ═══')
  for (const c of candidatos || []) {
    console.log(`  • [${c.data}] "${c.nome}" — ofert ${c.lotes_ofertados} / vend ${c.lotes_vendidos} / VGV ${fmtBRL(c.vgv_total)}  (id ${c.id})`)
  }

  // Tenta encontrar o Pintado Raiz exato
  const pintado = (candidatos || []).find(c => c.nome.includes('Pintado') && c.data === '2026-05-05')
  if (!pintado) {
    console.log('\n✗ Nenhum candidato Pintado em 2026-05-05')
    process.exit(0)
  }

  const { data: row } = await supa
    .from('bula_leilao_fechamento')
    .select('*')
    .eq('id', pintado.id)
    .single()

  console.log(`\n═══ Detalhe: ${row.nome} ═══`)
  console.log(`id: ${row.id}`)
  console.log(`local: ${row.local}`)
  console.log(`updated_at: ${row.updated_at}\n`)

  console.log('── Campos numéricos vs esperado ──')
  const checks = []
  for (const [k, esperado] of Object.entries(ESPERADO)) {
    const atual = Number(row[k])
    const ok = Math.abs(atual - esperado) < 0.01
    checks.push(ok)
    console.log(`  ${ok ? '✓' : '✗'} ${k.padEnd(22)} esperado ${esperado}  •  no DB ${atual}`)
  }

  console.log('\n── Lances vs esperado (parcela × 40) ──')
  const lances = row.lances || []
  console.log(`  Total no DB: ${lances.length}  •  Esperado: ${LANCES_ESPERADOS.length}`)
  for (const esp of LANCES_ESPERADOS) {
    const found = lances.find(l => l.lote === esp.lote)
    if (!found) {
      console.log(`  ✗ Lt ${esp.lote.padEnd(14)} NÃO ENCONTRADO`)
      checks.push(false)
      continue
    }
    const okParc = Number(found.parcela) === esp.parcela
    const okVGV  = Number(found.vgv) === esp.vgv
    const okAnim = Number(found.animais) === esp.animais
    const calc40 = esp.parcela * 40 * esp.animais
    const ok40   = calc40 === esp.vgv
    const allOk  = okParc && okVGV && okAnim && ok40
    checks.push(allOk)
    console.log(`  ${allOk ? '✓' : '✗'} Lt ${esp.lote.padEnd(14)} parc ${found.parcela} × 40 × ${found.animais}an = ${fmtBRL(found.vgv)}  (${found.assessor})`)
  }

  console.log('\n── Por assessor ──')
  for (const a of (row.por_assessor || [])) {
    console.log(`  • ${a.nome.padEnd(20)} (${a.empresa.padEnd(14)}) — ${a.transacoes} trans, ${a.animais} an, VGV ${fmtBRL(a.vgv)}`)
  }

  console.log('\n── Conta a pagar (Marcelo, 2% × 133.200) ──')
  const { data: contas } = await supa
    .from('erp_finance_transactions')
    .select('id, amount, description, status, transaction_date')
    .ilike('description', '%Marcelo Carneiro%Pintado%')
    .eq('transaction_date', '2026-05-05')
  console.log(`  Encontradas: ${(contas || []).length}`)
  for (const c of contas || []) {
    console.log(`    ✓ ${fmtBRL(c.amount)} • ${c.status} • ${c.description}  (id ${c.id})`)
  }

  const allGreen = checks.every(Boolean)
  console.log(`\n${allGreen ? '✓ TUDO BATENDO' : '✗ HÁ DIVERGÊNCIAS — revisar acima'}`)
})()
