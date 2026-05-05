// ============================================================
// Sincronização — Leilão Naviraí (27/04/2026)
// ------------------------------------------------------------
// Solicitação do chefe (WhatsApp 05/05): o registro do
// fechamento "Leilão Bula Assessoria – 27/04/2026" e o agenda
// "Naviraí" (Fêmeas P.O., 2026-04-27) são o mesmo leilão.
// Renomear ambos para "37º Leilão Naviraí" para alinhar.
//
//   bula_leiloes              — nome 'Naviraí'                      → '37º Leilão Naviraí'
//   bula_leilao_fechamento    — nome 'Leilão Bula Assessoria – 27/04/2026' → '37º Leilão Naviraí'
//
// Match por (nome, data='2026-04-27') para evitar afetar registros
// futuros que reutilizem o nome antigo "Naviraí".
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

const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const NOME_NOVO = '37º Leilão Naviraí'
const DATA = '2026-04-27'

;(async () => {
  // 1) bula_leiloes — agenda
  {
    const { data: row, error: eSel } = await supa
      .from('bula_leiloes')
      .select('id, nome')
      .eq('nome', 'Naviraí')
      .eq('data', DATA)
      .maybeSingle()
    if (eSel) { console.error('ERRO select bula_leiloes:', eSel.message); process.exitCode = 1 }
    else if (!row) {
      console.log('= SKIP bula_leiloes — registro "Naviraí" (2026-04-27) não encontrado')
    } else if (row.nome === NOME_NOVO) {
      console.log(`= SKIP bula_leiloes — já está como "${NOME_NOVO}"`)
    } else {
      const { error } = await supa
        .from('bula_leiloes')
        .update({ nome: NOME_NOVO })
        .eq('id', row.id)
      if (error) { console.error('ERRO update bula_leiloes:', error.message); process.exitCode = 1 }
      else console.log(`✓ bula_leiloes — "${row.nome}" → "${NOME_NOVO}"`)
    }
  }

  // 2) bula_leilao_fechamento — fechamento
  {
    const { data: row, error: eSel } = await supa
      .from('bula_leilao_fechamento')
      .select('id, nome, observacoes')
      .eq('nome', 'Leilão Bula Assessoria – 27/04/2026')
      .eq('data', DATA)
      .maybeSingle()
    if (eSel) { console.error('ERRO select bula_leilao_fechamento:', eSel.message); process.exitCode = 1 }
    else if (!row) {
      console.log('= SKIP bula_leilao_fechamento — registro "Leilão Bula Assessoria – 27/04/2026" não encontrado')
    } else if (row.nome === NOME_NOVO) {
      console.log(`= SKIP bula_leilao_fechamento — já está como "${NOME_NOVO}"`)
    } else {
      const observacoes =
        (row.observacoes || '') +
        ' [Ajuste 05/05] Renomeado de "Leilão Bula Assessoria – 27/04/2026" para "37º Leilão Naviraí" — corresponde ao leilão da Naviraí (Fêmeas P.O.) registrado em bula_leiloes.'
      const { error } = await supa
        .from('bula_leilao_fechamento')
        .update({ nome: NOME_NOVO, observacoes, updated_at: new Date().toISOString() })
        .eq('id', row.id)
      if (error) { console.error('ERRO update bula_leilao_fechamento:', error.message); process.exitCode = 1 }
      else console.log(`✓ bula_leilao_fechamento — "${row.nome}" → "${NOME_NOVO}"`)
    }
  }
})()
