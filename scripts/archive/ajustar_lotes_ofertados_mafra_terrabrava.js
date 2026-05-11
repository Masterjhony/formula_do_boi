// ============================================================
// Ajuste — lotes_ofertados (catálogo total) — MAFRA & Terra Brava
// Solicitação do chefe (WhatsApp 05/05): refletir o tamanho do
// catálogo comercial em "Total de lotes" no Fechamento de Leilões.
//
//   • Leilão MAFRA – 29/04/2026 (Fêmeas ExpoZebu 2026)
//       Catálogo: Lote 1000, Lote ASP e Lotes 1 a 21  →  23 lotes comerciais
//       (25 fichas se contadas individualmente — Lt 19 figura em
//       múltiplas fichas como "livre escolha". Comercialmente = 23.)
//       lotes_ofertados: 2 → 23
//
//   • Leilão Terra Brava 50 Anos (Virtual Touros Provados, 19/04/2026)
//       Ordem de entrada: 1º ao 182º
//       lotes_ofertados: 0 → 182
//
//   • Leilão Genética Aditiva e Terra Brava – Expozebu 29/04/2026
//       8º Leilão Terra Brava Genética Aditiva ExpoZebu 2026 (Fêmeas P.O. — VIRTUAL)
//       Catálogo: 26 lotes
//       lotes_ofertados: 1 → 26
//
// Outros campos (lotes_vendidos, vgv_total, comissões, receita) NÃO mudam:
// representam apenas o que a Bula intermediou.
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

const ajustes = [
  {
    nome: 'Leilão MAFRA – 29/04/2026',
    data: '2026-04-29',
    lotes_ofertados: 23,
    nota_obs:
      ' [Ajuste 05/05] Catálogo comercial = 23 lotes (Lote 1000 + Lote ASP + Lotes 1 a 21). 25 fichas se contadas individualmente — Lt 19 aparece em múltiplas como "livre escolha".',
  },
  {
    nome: 'Leilão Terra Brava 50 Anos',
    data: '2026-04-19',
    lotes_ofertados: 182,
    nota_obs:
      ' [Ajuste 05/05] Catálogo total = 182 lotes/entradas (1º ao 182º). Bula intermediou 5 lotes — demais campos (vgv_total, vendidos, comissão) refletem apenas a participação Bula.',
  },
  {
    nome: 'Leilão Genética Aditiva e Terra Brava – Expozebu 29/04/2026',
    data: '2026-04-29',
    lotes_ofertados: 26,
    nota_obs:
      ' [Ajuste 05/05] Catálogo total = 26 lotes (8º Leilão Terra Brava Genética Aditiva ExpoZebu 2026 — Fêmeas P.O., VIRTUAL). Bula intermediou 1 lote (Lt 28) — demais campos refletem apenas a participação Bula.',
  },
]

;(async () => {
  for (const a of ajustes) {
    const { data: row, error: e1 } = await supa
      .from('bula_leilao_fechamento')
      .select('id, lotes_ofertados, observacoes')
      .eq('nome', a.nome)
      .eq('data', a.data)
      .maybeSingle()
    if (e1) { console.error(`ERRO select "${a.nome}":`, e1.message); process.exitCode = 1; continue }
    if (!row) { console.error(`Fechamento não encontrado: "${a.nome}" (${a.data})`); process.exitCode = 1; continue }

    if (row.lotes_ofertados === a.lotes_ofertados) {
      console.log(`= SKIP "${a.nome}" — lotes_ofertados já é ${a.lotes_ofertados}`)
      continue
    }

    const observacoes = (row.observacoes || '') + a.nota_obs

    const { error } = await supa
      .from('bula_leilao_fechamento')
      .update({
        lotes_ofertados: a.lotes_ofertados,
        observacoes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id)
    if (error) { console.error(`ERRO update "${a.nome}":`, error.message); process.exitCode = 1; continue }

    console.log(`✓ "${a.nome}" — lotes_ofertados ${row.lotes_ofertados} → ${a.lotes_ofertados}`)
  }
})()
