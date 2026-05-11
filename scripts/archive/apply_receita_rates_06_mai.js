// ============================================================
// Aplica taxas de receita Bula por promotora — 06/05/2026
//
// Diretiva do chefe (WhatsApp 17:06):
//   • Naviraí       → 3% da venda
//   • Matinha Expozebu → 5% da venda
//   • Terra Brava   → 5% da venda  (qualquer leilão com "Terra Brava")
//   • Camparino     → Tabela escalonada sobre nossa participação:
//       <10%   → 0,5%
//       10–15% → 0,75%
//       15–20% → 1,0%
//       20%+   → 1,5%
//
// Observação:
//   • Matinha Embrio (05/05) NÃO foi explicitamente coberto pela
//     diretiva. Mantém em 0 com flag até confirmação.
//   • Camparino: aplico 0,5% pois vendemos 1 de 30 lotes (3,3% por
//     contagem de lotes — abaixo de 10% por qualquer métrica
//     razoável; total geral do leilão não foi reportado).
//   • EAO (0,33%), MAFRA (4%), JMP (0,5%), IPB/Pérolas (1%),
//     MRA (0%) já estão no padrão correto — não toca.
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

const ALVOS = [
  {
    nomeMatch: /Navira[íi]/i,
    rate: 0.03,
    flag: '[receita 3% Naviraí — diretiva chefe 06/05]',
  },
  {
    nomeMatch: /Matinha Expozebu/i,
    rate: 0.05,
    flag: '[receita 5% Matinha Expozebu — diretiva chefe 06/05]',
  },
  {
    nomeMatch: /Terra Brava/i,
    rate: 0.05,
    flag: '[receita 5% Terra Brava — diretiva chefe 06/05]',
    skipIfReceitaIs: (vgv) => Math.abs((vgv * 0.05) - 6930) < 30, // Terra Brava 50 Anos já tem 6930
  },
  {
    nomeMatch: /Camparino/i,
    rate: 0.005,
    flag: '[receita 0,5% Camparino — escalonado: <10% participação. Diretiva chefe 06/05]',
  },
]

;(async () => {
  const { data: rows, error } = await supa
    .from('bula_leilao_fechamento')
    .select('id, nome, data, vgv_total, receita_bula, comissao_assessoria, sobra_bruta, observacoes')
  if (error) { console.error('ERR:', error.message); process.exit(1) }

  let updated = 0
  for (const r of rows) {
    let alvo = null
    for (const a of ALVOS) {
      if (a.nomeMatch.test(r.nome)) { alvo = a; break }
    }
    if (!alvo) continue

    const novaReceita = Math.round(Number(r.vgv_total) * alvo.rate * 100) / 100
    const atualReceita = Number(r.receita_bula) || 0

    if (Math.abs(atualReceita - novaReceita) < 0.5) {
      console.log(`= SKIP "${r.nome}" — receita já é ~R$ ${atualReceita.toFixed(2)} (~${(atualReceita/r.vgv_total*100).toFixed(2)}%)`)
      continue
    }

    const novaSobra = novaReceita - (Number(r.comissao_assessoria) || 0)
    const obsAtual = r.observacoes || ''
    const novaObs = obsAtual.includes(alvo.flag) ? obsAtual : `${obsAtual}${obsAtual ? ' ' : ''}${alvo.flag}`

    const { error: upErr } = await supa
      .from('bula_leilao_fechamento')
      .update({
        receita_bula: novaReceita,
        sobra_bruta: novaSobra,
        observacoes: novaObs,
        updated_at: new Date().toISOString(),
      })
      .eq('id', r.id)
    if (upErr) { console.error(`ERRO update "${r.nome}":`, upErr.message); continue }

    updated++
    console.log(`✓ "${r.nome}"`)
    console.log(`  VGV=${r.vgv_total}  receita ${atualReceita.toFixed(2)} → ${novaReceita.toFixed(2)} (${(alvo.rate*100).toFixed(2)}%)  sobra → ${novaSobra.toFixed(2)}`)
  }

  console.log(`\nTotal atualizado: ${updated}/${rows.length}`)
})()
