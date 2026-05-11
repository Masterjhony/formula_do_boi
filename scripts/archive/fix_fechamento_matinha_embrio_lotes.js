// ============================================================
// Fix — Leilão Matinha Embrio – 05/05/2026
//
// O fechamento foi inserido sem os dados do catálogo
// (insert_fechamentos_05_mai_2026.sql linha 112: "0, 1, 1").
// Marcelo Carneiro reportou no grupo, com a foto do catálogo,
// a composição correta da oferta:
//
//   • 17 lotes/pacotes ofertados
//   • 0 animais vivos (oferta exclusiva de embriões Nelore PO)
//   • 426 embriões ofertados
//   • 148 prenhezes mínimas garantidas
//
// Composição:
//   • Lote EXTRA   → 1 lote  × 10 embriões  = 10
//   • Lotes 01–09  → 16 lotes × 26 embriões = 416
//   (lotes 01–09 com subdivisões A/B/C totalizam 16 pacotes)
//
// Vendas (lotes_vendidos = 1, animais_vendidos = 1, VGV R$ 48.000)
// e comissão R$ 960 não mudam — refletem apenas o Lt 04 do Marcelo.
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

const NOME = 'Leilão Matinha Embrio – 05/05/2026'
const DATA = '2026-05-05'

const PERFIL_OFERTA = {
  tipo_oferta: 'Embriões Nelore PO',
  animais_vivos_ofertados: 0,
  embrioes_ofertados: 426,
  prenhezes_minimas_garantidas: 148,
  composicao: [
    { tipo: 'Lote EXTRA', lotes: 1, embrioes_por_lote: 10, embrioes_total: 10 },
    { tipo: 'Lotes 01 a 09 (com subdivisões A/B/C)', lotes: 16, embrioes_por_lote: 26, embrioes_total: 416 },
  ],
}

const OBS_NOVA =
  'Catálogo Matinha Embrio: 17 lotes/pacotes ofertados, 0 animais vivos, oferta exclusiva de Embriões Nelore PO — 426 embriões totais e 148 prenhezes mínimas garantidas. ' +
  'Composição: 1 Lote EXTRA (10 embriões) + 16 lotes 01–09 com subdivisões A/B/C (26 embriões/lote = 416). ' +
  'Único lance reportado: Lt 04 levado pelo Marcelo Carneiro (Fórmula do Boi) – comprador Orismar Moreira Leão (Fazenda Nelore Leão – João Pinheiro/MG). ' +
  'Marcelo confirmou no grupo: "Só eu vendi hoje" → demais assessores da equipe não venderam neste leilão. ' +
  '⚠ Nº de parcelas não foi reportado; VGV estimado em R$ 48.000 assumindo parcelamento em 30x (padrão dos fechamentos recentes). ' +
  'Comissão 2% × R$ 48.000 = R$ 960 (regra Bulinha/Marcelo/Matheus).'

;(async () => {
  const { data: row, error: e1 } = await supa
    .from('bula_leilao_fechamento')
    .select('id, lotes_ofertados, perfil_genetico, observacoes')
    .eq('nome', NOME)
    .eq('data', DATA)
    .maybeSingle()
  if (e1) { console.error('ERRO select:', e1.message); process.exit(1) }
  if (!row) { console.error(`Fechamento não encontrado: "${NOME}" (${DATA})`); process.exit(1) }

  console.log('Estado atual:')
  console.log('  lotes_ofertados:', row.lotes_ofertados)
  console.log('  perfil_genetico:', row.perfil_genetico)
  console.log('  observacoes:', (row.observacoes || '').slice(0, 80) + '…')

  const perfilMerged = { ...(row.perfil_genetico || {}), ...PERFIL_OFERTA }

  const { error } = await supa
    .from('bula_leilao_fechamento')
    .update({
      lotes_ofertados: 17,
      perfil_genetico: perfilMerged,
      observacoes: OBS_NOVA,
      updated_at: new Date().toISOString(),
    })
    .eq('id', row.id)
  if (error) { console.error('ERRO update:', error.message); process.exit(1) }

  console.log(`\n✓ "${NOME}"`)
  console.log(`  lotes_ofertados: ${row.lotes_ofertados} → 17`)
  console.log(`  perfil_genetico: ofertados/embriões/prenhezes/composição adicionados`)
  console.log(`  observacoes: substituída pela versão completa do catálogo`)
})()
