// ============================================================
// Ajuste — 6º Mega EAO ExpoZebu 2026 — totais OFICIAIS
// ============================================================
// Origem: COMPARATIVO MEGA EAO EXPOZEBU 2026 (PDF/print do promotor EAO)
//
// Anexo oficial (totais agregados):
//   • FÊMEAS 2026 (02/05):    124,66 animais | R$ 141.843,41 média | R$ 17.682.200
//       - Aspirações: 15,75 | R$ 166.857,14 | R$ 2.628.000
//       - Fêmeas:    107,74 | R$ 129.368,85 | R$ 13.938.200
//       - Machos:      1,17 | R$ 953.846,15 | R$ 1.116.000  (touro alto valor vendido no leilão de fêmeas)
//   • MACHOS 2026 (03/05):    150,75 animais | R$ 46.922,06 média | R$ 7.073.500
//       - Machos individuais: 142,75 | R$ 48.038,53 | R$ 6.857.500
//       - Machos – MEGA:           8 | R$ 27.000,00 | R$   216.000
//   • Equinos:                15 animais | R$ 17.706,67 | R$ 265.600  (NÃO contabilizado — diretiva do chefe 2026-05-05)
//   • SOMATÓRIA MEGA EAO: R$ 25.021.300  | R$ 86.158,53 média
//   • Compradores únicos (evento): 148
//   • Estados (evento): 19 (AC, AL, BA, CE, DF, GO, MA, MG, MS, MT, PA, PB, PE, PI, PR, RJ, SE, SP, TO)
//   • Crescimento total vs 2025: +21,97% | Média: +1,15%
//
// Estratégia de ajuste:
//   • Agregados oficiais (vgv_total, animais_vendidos, ticket_medio) → totais do anexo.
//   • lotes_vendidos / compradores_unicos / estados_alcancados / maior_lance / arrays JSONB
//     (lances, por_assessor, por_estado, compradores) permanecem Bula-específicos
//     (representam o que a Bula efetivamente intermediou — fonte: prints + planilhas).
//   • comissao_assessoria continua sobre o VGV intermediado pela Bula
//     (Fábio Omena + Douglas Bispo + Bulinha — este último intercompany).
//   • receita_bula = 1% × VGV oficial por categoria (DEFAULT, REVISAR % com chefe).
//   • sobra_bruta = receita_bula − comissao_assessoria.
//   • Equinos: removidos do escopo financeiro por diretiva do chefe (WhatsApp 2026-05-05
//     "Pode tirar esses equinos"). Bula não intermediou — não há receita.
//     O DELETE da conta a receber está em database/remove_fechamento_mega_eao_equinos.sql.
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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) { console.error('Missing SUPABASE env'); process.exit(1) }
const supa = createClient(url, key)

const NOTA_ANEXO =
  'Totais agregados (vgv_total, animais_vendidos, ticket_medio) atualizados conforme COMPARATIVO MEGA EAO EXPOZEBU 2026 (anexo oficial do promotor EAO Agropecuária). ' +
  'Evento completo: R$ 25.021.300 | 290,41 animais | 148 compradores | 19 estados (AC,AL,BA,CE,DF,GO,MA,MG,MS,MT,PA,PB,PE,PI,PR,RJ,SE,SP,TO) | +21,97% vs 2025. ' +
  'Demais campos (lotes_vendidos, compradores_unicos, estados_alcancados, maior_lance, arrays lances/compradores/por_assessor/por_estado) permanecem Bula-específicos — representam APENAS o que a Bula intermediou (registrado via prints e planilhas).'

// ── FÊMEAS 02/05/2026 ────────────────────────────────────────
const FECHAMENTO_FEMEAS = {
  match: { nome: '6º Mega EAO – Fêmeas – Expozebu 02/05/2026', data: '2026-05-02' },
  patch: {
    // OFICIAIS (anexo)
    animais_vendidos: 125,                // 124,66 ≈ 125
    vgv_total: 17682200,
    ticket_medio: 141843.41,
    // RECALCULADO sobre VGV oficial
    receita_bula: 176822,                 // 1% × R$ 17.682.200
    sobra_bruta: 165524,                  // 176.822 − 11.298 (Fábio + Douglas)
    // Observações expandidas
    observacoes:
      'Vendas concretizadas durante o 6º Mega EAO Fêmeas (91º ExpoZebu, 02/05/2026). ' +
      'TOTAIS OFICIAIS (anexo COMPARATIVO MEGA EAO 2026): 124,66 animais | R$ 17.682.200 | ticket médio R$ 141.843,41. ' +
      'Quebra oficial: Aspirações 15,75 (R$ 2.628.000) + Fêmeas 107,74 (R$ 13.938.200) + Machos 1,17 (R$ 1.116.000 — touro alto valor vendido na sessão de fêmeas). ' +
      'INTERMEDIAÇÃO BULA: 9 lotes/15 animais — Dr. Celso Lopes (Faz. Flor de Minas/PA) maior comprador (R$ 219k em 3 lotes); Lt 74·75 mega lote (1+7 novilhas); Lt 83 fêmea parida. ' +
      'Comissão paga: Fábio Omena R$ 5.778 (Lts 31, 74·75, 96) + Douglas Bispo R$ 5.520 (Lts 36, 49, 83, 86); Marcelo Carneiro intercompany Fórmula do Boi (sem conta a pagar). ' +
      'Receita Bula EAO Agropecuária: 1% × R$ 17.682.200 = R$ 176.822 (DEFAULT, REVISAR % com chefe). ' +
      'Campos compradores_unicos=6 / estados_alcancados=3 / lotes_vendidos=9 / maior_lance=R$ 4.300 e arrays JSONB são Bula-específicos.',
  },
}

// ── TOUROS 03/05/2026 ────────────────────────────────────────
const FECHAMENTO_TOUROS = {
  match: { nome: '6º Mega EAO – Touros – Expozebu 03/05/2026', data: '2026-05-03' },
  patch: {
    // OFICIAIS (anexo)
    animais_vendidos: 151,                // 150,75 ≈ 151
    vgv_total: 7073500,
    ticket_medio: 46922.06,
    // RECALCULADO sobre VGV oficial
    receita_bula: 70735,                  // 1% × R$ 7.073.500
    sobra_bruta: 69985,                   // 70.735 − 750 (Fábio Omena Lt 119)
    // Observações expandidas
    observacoes:
      'Vendas concretizadas durante o 6º Mega EAO Touros (91º ExpoZebu, 03/05/2026 – domingo). ' +
      'TOTAIS OFICIAIS (anexo COMPARATIVO MEGA EAO 2026): 150,75 animais | R$ 7.073.500 | ticket médio R$ 46.922,06. ' +
      'Quebra oficial: Machos individuais 142,75 (R$ 6.857.500) + Machos Mega Lote 8 (R$ 216.000 — 1+39x). ' +
      'Catálogo: 180 touros (Individuais + Repasse + Central + Mangalarga); curadoria FdB classificou 146 lotes (A++ 23 / A+ 41 / A 82). ' +
      'INTERMEDIAÇÃO BULA: 16 lotes/19 animais (15 IND + 1 Mega Lote 4-an.) — Agropecuária Martins (Coxim/MS) maior comprador (R$ 273,5k em 6 lotes incl. Lt 76 Touro de Central); MARCA 15 (Izanélio Rezende/MS) 6 animais em 3 lotes (R$ 124k); Lt 119 intermediado por Fábio Omena → Victor Meirelles (Tambaú/SP). ' +
      'Pendências Bula: Lote 115 (EAO C3472, R$ 37.500) – comprador não identificado nos prints. ' +
      'Comissão paga: Fábio Omena R$ 750 (Lt 119); Bulinha (Felipe Andrade) intercompany Fórmula do Boi (sem conta a pagar). ' +
      'Receita Bula EAO Agropecuária: 1% × R$ 7.073.500 = R$ 70.735 (DEFAULT, REVISAR % com chefe). ' +
      'Campos compradores_unicos=5 / estados_alcancados=2 / lotes_vendidos=16 / maior_lance=R$ 2.000 e arrays JSONB são Bula-específicos.',
  },
}

// ── CONTAS A RECEBER — RECEITA BULA × EAO AGROPECUÁRIA ──────
const RECEBER_FEMEAS = {
  match: {
    description: 'Receita Bula – EAO Agropecuária – 1% – 6º Mega EAO 02/05/2026',
    transaction_date: '2026-05-02',
  },
  patch: {
    amount: 176822,
    observacao:
      'A receber da EAO Agropecuária (promotora). VGV OFICIAL R$ 17.682.200 × 1% (DEFAULT, REVISAR) = R$ 176.822. ' +
      'Fonte: COMPARATIVO MEGA EAO EXPOZEBU 2026 (anexo oficial). 6º Mega EAO Fêmeas – 02/05/2026 (91º ExpoZebu). ' +
      'Antes: R$ 6.129 (calculado sobre VGV Bula-only R$ 612.900). Ajustado para refletir VGV oficial do leilão de fêmeas.',
  },
}

const RECEBER_TOUROS = {
  match: {
    description: 'Receita Bula – EAO Agropecuária – 1% – 6º Mega EAO Touros 03/05/2026',
    transaction_date: '2026-05-03',
  },
  patch: {
    amount: 70735,
    observacao:
      'A receber da EAO Agropecuária (promotora). VGV OFICIAL R$ 7.073.500 × 1% (DEFAULT, REVISAR) = R$ 70.735. ' +
      'Fonte: COMPARATIVO MEGA EAO EXPOZEBU 2026 (anexo oficial). 6º Mega EAO Touros – 03/05/2026 (91º ExpoZebu). ' +
      'Quebra: 142,75 machos individuais (R$ 6.857.500) + 8 Mega Lote (R$ 216.000). ' +
      'Antes: R$ 6.405 (calculado sobre VGV Bula-only R$ 640.500). Ajustado para refletir VGV oficial do leilão de touros.',
  },
}

async function patchFechamento({ match, patch }) {
  const { data: existing, error: e1 } = await supa
    .from('bula_leilao_fechamento')
    .select('id, vgv_total, animais_vendidos, ticket_medio, receita_bula, sobra_bruta')
    .eq('nome', match.nome)
    .eq('data', match.data)
    .maybeSingle()
  if (e1) throw e1
  if (!existing) {
    console.warn(`⚠ fechamento não encontrado: ${match.nome} ${match.data}`)
    return
  }
  const { error } = await supa
    .from('bula_leilao_fechamento')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', existing.id)
  if (error) throw error
  console.log(`✓ UPDATED ${match.nome}`)
  console.log(`  VGV: R$ ${Number(existing.vgv_total).toLocaleString('pt-BR')} → R$ ${patch.vgv_total.toLocaleString('pt-BR')}`)
  console.log(`  Animais: ${existing.animais_vendidos} → ${patch.animais_vendidos}`)
  console.log(`  Ticket médio: R$ ${Number(existing.ticket_medio).toLocaleString('pt-BR')} → R$ ${patch.ticket_medio.toLocaleString('pt-BR')}`)
  console.log(`  Receita Bula: R$ ${Number(existing.receita_bula).toLocaleString('pt-BR')} → R$ ${patch.receita_bula.toLocaleString('pt-BR')}`)
  console.log(`  Sobra bruta: R$ ${Number(existing.sobra_bruta).toLocaleString('pt-BR')} → R$ ${patch.sobra_bruta.toLocaleString('pt-BR')}`)
}

async function patchTransacao({ match, patch }) {
  const { data: existing, error: e1 } = await supa
    .from('erp_finance_transactions')
    .select('id, amount')
    .eq('description', match.description)
    .eq('transaction_date', match.transaction_date)
    .maybeSingle()
  if (e1) throw e1
  if (!existing) {
    console.warn(`⚠ transação não encontrada: ${match.description}`)
    return
  }
  const { error } = await supa
    .from('erp_finance_transactions')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', existing.id)
  if (error) throw error
  console.log(`✓ UPDATED conta a receber: ${match.description}`)
  console.log(`  Amount: R$ ${Number(existing.amount).toLocaleString('pt-BR')} → R$ ${patch.amount.toLocaleString('pt-BR')}`)
}

async function resumoFinal() {
  console.log('\n═══ ESTADO FINAL — Fechamentos Mega EAO ═══')
  const { data: fech } = await supa
    .from('bula_leilao_fechamento')
    .select('nome, data, animais_vendidos, vgv_total, ticket_medio, receita_bula, comissao_assessoria, sobra_bruta')
    .ilike('nome', '%Mega EAO%')
    .order('data', { ascending: true })
  console.table(fech)

  console.log('\n═══ ESTADO FINAL — Contas a receber/pagar Mega EAO ═══')
  const { data: tx } = await supa
    .from('erp_finance_transactions')
    .select('type, amount, description, transaction_date, status')
    .or('description.ilike.%Mega EAO%,observacao.ilike.%Mega EAO%')
    .order('transaction_date', { ascending: true })
    .order('type', { ascending: true })
  console.table(tx)

  const totalReceber = (tx || [])
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + Number(t.amount), 0)
  const totalPagar = (tx || [])
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount), 0)
  console.log(`\n  Total a RECEBER (receita Bula): R$ ${totalReceber.toLocaleString('pt-BR')}`)
  console.log(`  Total a PAGAR (comissões):       R$ ${totalPagar.toLocaleString('pt-BR')}`)
  console.log(`  SOBRA BRUTA Mega EAO 2026:       R$ ${(totalReceber - totalPagar).toLocaleString('pt-BR')}`)
  // VGV oficial sem Equinos: R$ 17.682.200 (fêmeas) + R$ 7.073.500 (touros) = R$ 24.755.700
  // Equinos R$ 265.600 ficam fora por diretiva do chefe (Bula não intermediou).
  console.log(`  Esperado: 1% × R$ 24.755.700 − R$ 12.048 = R$ ${(247557 - 12048).toLocaleString('pt-BR')}`)
}

;(async () => {
  try {
    await patchFechamento(FECHAMENTO_FEMEAS)
    await patchFechamento(FECHAMENTO_TOUROS)
    await patchTransacao(RECEBER_FEMEAS)
    await patchTransacao(RECEBER_TOUROS)
    await resumoFinal()
    console.log('\n✓ Ajuste concluído. Lembrete: marcar nota nas observações foi feita; campos compradores_unicos/estados/lotes_vendidos/arrays JSONB permaneceram Bula-específicos.')
  } catch (e) {
    console.error('ERROR:', e.message || e)
    process.exitCode = 1
  }
})()
