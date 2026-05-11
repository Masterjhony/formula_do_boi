// ============================================================
// Ajuste — Lote 115 (EAO C3472, R$ 37.500) — 6º Mega EAO Touros 03/05/2026
// Confirmação via WhatsApp (Bulinha): comprador é MARCA 15 / Izanélio Rezende (MS).
// Antes: "⚠ A confirmar" / "Comprador não identificado nos prints".
// Reflexos:
//   • lances[Lt 115]: comprador, fazenda, uf
//   • compradores[]: merge no MARCA 15 (R$ 124.000 + 37.500 = 161.500; 3→4 lotes; 6→7 animais)
//                    remove rank 5 "⚠ A confirmar"
//                    re-rank Victor Meirelles 4 (sem alteração de valor, só posição)
//   • por_estado[]: MS 14→15 lotes / 17→18 animais / R$ 565.500→603.000 / pct 0.8829→0.9415
//                   remove entry "—" "Não informado"
//                   SP permanece (R$ 37.500 / 0.0585)
//   • compradores_unicos: 5 → 4
//   • observações: remove pendência Lt 115; documenta confirmação WhatsApp.
// vgv_total / animais_vendidos / ticket_medio / receita_bula / contas a receber NÃO mudam
// (Bula-intermediado VGV continua R$ 640.500; oficial do anexo continua R$ 7.073.500).
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

const MATCH = { nome: '6º Mega EAO – Touros – Expozebu 03/05/2026', data: '2026-05-03' }

;(async () => {
  const { data: row, error: e1 } = await supa
    .from('bula_leilao_fechamento')
    .select('id, lances, compradores, por_estado, compradores_unicos, observacoes')
    .eq('nome', MATCH.nome)
    .eq('data', MATCH.data)
    .maybeSingle()
  if (e1) throw e1
  if (!row) { console.error('Fechamento não encontrado'); process.exit(1) }

  // 1) lances — atualizar Lt 115
  const lances = row.lances.map(l => {
    if (l.lote !== '115') return l
    return {
      ...l,
      fazenda: 'MARCA 15',
      comprador: 'Izanélio Rezende',
      uf: 'MS',
      animal: 'EAO C3472 (A) — confirmado MARCA 15 (Izanélio Rezende/MS) via WhatsApp',
    }
  })

  // 2) compradores — merge MARCA 15, remove "A confirmar", re-rank por VGV
  const compradoresFiltrados = row.compradores.filter(c => c.fazenda !== '⚠ A confirmar')
  const idxMarca = compradoresFiltrados.findIndex(c => c.fazenda === 'MARCA 15')
  if (idxMarca >= 0) {
    const m = compradoresFiltrados[idxMarca]
    compradoresFiltrados[idxMarca] = {
      ...m,
      lotes: m.lotes + 1,            // 3 → 4
      animais: m.animais + 1,        // 6 → 7
      vgv: m.vgv + 37500,            // 124.000 → 161.500
    }
  }
  const compradores = compradoresFiltrados
    .sort((a, b) => b.vgv - a.vgv)
    .map((c, i) => ({ ...c, rank: i + 1 }))

  // 3) por_estado — MS recebe +1 lote/+1 animal/+R$ 37.500; remove "—"
  const TOTAL_BULA_VGV = 640500
  const porEstadoFiltrado = row.por_estado.filter(e => e.uf !== '—')
  const idxMS = porEstadoFiltrado.findIndex(e => e.uf === 'MS')
  if (idxMS >= 0) {
    const ms = porEstadoFiltrado[idxMS]
    porEstadoFiltrado[idxMS] = {
      ...ms,
      lotes: ms.lotes + 1,
      animais: ms.animais + 1,
      vgv: ms.vgv + 37500,
    }
  }
  const por_estado = porEstadoFiltrado
    .sort((a, b) => b.vgv - a.vgv)
    .map(e => ({ ...e, pct_total: Number((e.vgv / TOTAL_BULA_VGV).toFixed(4)) }))

  // 4) compradores_unicos
  const compradores_unicos = compradores.length

  // 5) observações — remove pendência Lt 115, documenta confirmação
  let obs = row.observacoes
  obs = obs.replace(
    /Pendências Bula: Lote 115 \(EAO C3472, R\$ 37\.500\) – comprador não identificado nos prints\. ?/,
    ''
  )
  obs = obs.replace(
    /Campos compradores_unicos=5/,
    'Campos compradores_unicos=4'
  )
  obs += ' [Atualizado] Lote 115 (EAO C3472, R$ 37.500) confirmado para MARCA 15 / Izanélio Rezende (MS) via WhatsApp do Bulinha — pendência resolvida; MARCA 15 passa a ser o 3º maior comprador da sessão Bula com R$ 161.500 (4 lotes / 7 animais).'

  const { error } = await supa
    .from('bula_leilao_fechamento')
    .update({
      lances,
      compradores,
      por_estado,
      compradores_unicos,
      observacoes: obs,
      updated_at: new Date().toISOString(),
    })
    .eq('id', row.id)
  if (error) throw error

  console.log('✓ UPDATED 6º Mega EAO – Touros – Expozebu 03/05/2026')
  console.log('\nCompradores (re-ranked):')
  console.table(compradores.map(c => ({ rank: c.rank, fazenda: c.fazenda, uf: c.uf, lotes: c.lotes, animais: c.animais, vgv: c.vgv })))
  console.log('\nPor estado:')
  console.table(por_estado)
  console.log(`\nCompradores únicos: ${compradores_unicos} (antes: 5)`)
  console.log(`Lote 115 — comprador: "${lances.find(l => l.lote === '115').comprador}" / UF "${lances.find(l => l.lote === '115').uf}"`)
})()
