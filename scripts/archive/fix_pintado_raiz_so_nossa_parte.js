// ============================================================
// Fix — 2º Leilão Pintado Raiz – 05/05/2026
//
// Correção do chefe (06/05): o PDF "Médias por Raças" mostra o
// TOTAL do leilão (39 lotes / R$ 458.800) — mas a nossa parte
// (Bula/Fórmula) é apenas o que está nos lances do WhatsApp:
// 16 lotes / R$ 160.800. Mesmo padrão do MAFRA / Terra Brava
// ("vgv_total, vendidos, comissão refletem apenas a participação
// Bula").
//
// Mantém: lotes_ofertados = 40 (catálogo total).
// Atualiza: vendidos / VGV / ticket / maior_lance / compradores
//           únicos / por_assessor (pct relativo à nossa parte) /
//           compradores / por_estado / observação.
// Comissão Marcelo (R$ 2.664 = 2% × 133.200) já existe no ERP
// — não mexe.
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

const NOME = '2º Leilão Pintado Raiz – 05/05/2026'
const DATA = '2026-05-05'

const PATCH = {
  // Mantém lotes_ofertados = 40 (catálogo total)
  lotes_vendidos: 16,
  animais_vendidos: 16,
  vgv_total: 160800,
  ticket_medio: 10050,           // 160800 / 16 lotes
  maior_lance: 370,              // maior parcela em nossas lances (Lt 46)
  compradores_unicos: 4,         // Vinicius + Marlon + Airon + Lucio
  estados_alcancados: 2,         // PE + BA (UF Vinicius/Lucio não confirmada)

  por_assessor: [
    { posicao: 1, nome: 'Marcelo Carneiro', empresa: 'Fórmula do Boi', transacoes: 9, animais: 13, vgv: 133200, ticket_medio: 14800, pct_total: 0.8284 },
    { posicao: 2, nome: 'Mateus Alves',     empresa: 'Bula',           transacoes: 1, animais: 3,  vgv: 27600,  ticket_medio: 27600, pct_total: 0.1716 },
  ],

  compradores: [
    { rank: 1, fazenda: '',                      comprador: 'Vinicius Baleeiro Pereira Guimaraes', cidade: '',           uf: '',   lotes: 9, animais: 9, vgv: 87600 },
    { rank: 2, fazenda: '',                      comprador: 'Lucio Antônio Machado',               cidade: '',           uf: '',   lotes: 3, animais: 3, vgv: 27600 },
    { rank: 3, fazenda: 'Fazenda Noemia Macedo', comprador: 'Airon Tavares',                       cidade: 'São Caetano', uf: 'PE', lotes: 2, animais: 2, vgv: 23600 },
    { rank: 4, fazenda: 'Fazenda Saco',          comprador: 'Marlon Ferreira',                     cidade: 'Água Fria',  uf: 'BA', lotes: 2, animais: 2, vgv: 22000 },
  ],

  por_estado: [
    { uf: 'PE', estado: 'Pernambuco', lotes: 2, animais: 2, vgv: 23600, pct_total: 0.1468 },
    { uf: 'BA', estado: 'Bahia',      lotes: 2, animais: 2, vgv: 22000, pct_total: 0.1368 },
  ],

  // Comissão e sobra_bruta permanecem (R$ 2.664 já no ERP).
  comissao_assessoria: 2664,
  receita_bula: 0,
  sobra_bruta: -2664,

  observacoes:
    'Os valores deste fechamento refletem APENAS a participação Bula/Fórmula no leilão (mesma convenção do MAFRA/Terra Brava): ' +
    '16 lotes / 16 animais / VGV R$ 160.800. ' +
    'O total geral do leilão (PDF "Médias por Raças" – Agreste Leilões) foi 39 lotes / R$ 458.800 (Maciel Pereira da Silva como vendedor único listado), ' +
    'do qual nossa equipe intermediou ~35,05%. Marcelo confirmou no WhatsApp 06/05 que o relatório é "venda total do leilão" e a nossa parte é a soma dos lances reportados. ' +
    'Nossas 10 transações (16 lotes individuais) — pagamento em 40x (1 + 39 mensais; à vista -15%): ' +
    'Marcelo Carneiro (Fórmula do Boi) levou 9 transações / 13 lotes / R$ 133.200 (82,84% da nossa parte); ' +
    'Mateus Alves (Bula) levou 1 transação / 3 lotes (Lts 28·03·08) / R$ 27.600 (17,16%) – comprador Lucio Antônio Machado. ' +
    'Compradores únicos da nossa parte (4): Vinicius Baleeiro (9 animais, R$ 87.600 – UF n/i), Lucio Antônio Machado (3, R$ 27.600 – UF n/i), Airon Tavares (2 PE, R$ 23.600), Marlon Ferreira (2 BA, R$ 22.000). ' +
    'Comissão Marcelo: 2% × R$ 133.200 = R$ 2.664 (já lançada no ERP). ' +
    '⚠ Mateus Alves NÃO está no roster canônico (leiloes_equipe) — verificar identidade e se cabe na regra de comissão. ' +
    '⚠ UF de Vinicius Baleeiro e Lucio Antônio Machado não foi reportada (R$ 115.200 sem UF). ' +
    'Maior lance (parcela) da nossa parte: R$ 370/parc. (Lt 46, Vinicius). Maior do leilão geral: R$ 20.400 – MUMBAI FIV GC DA SL (touro), comprador Ricardo Esteves Brito Costa.',
}

;(async () => {
  const { data: row, error: e1 } = await supa
    .from('bula_leilao_fechamento')
    .select('id, lotes_ofertados, lotes_vendidos, vgv_total')
    .eq('nome', NOME)
    .eq('data', DATA)
    .maybeSingle()
  if (e1) { console.error('ERRO select:', e1.message); process.exit(1) }
  if (!row) { console.error(`Não encontrado: "${NOME}" (${DATA})`); process.exit(1) }

  console.log(`Antes: ofert=${row.lotes_ofertados}  vend=${row.lotes_vendidos}  vgv=${row.vgv_total}`)

  const { error } = await supa
    .from('bula_leilao_fechamento')
    .update({ ...PATCH, updated_at: new Date().toISOString() })
    .eq('id', row.id)
  if (error) { console.error('ERRO update:', error.message); process.exit(1) }

  console.log(`Depois: ofert=40 (catálogo) vend=16 vgv=R$ 160.800`)
  console.log()
  console.log('═══ Resumo da nossa parte ═══')
  console.log('  Lotes vendidos:     16 (de 40 do catálogo, 40% de cobertura)')
  console.log('  VGV nossa parte:    R$ 160.800,00')
  console.log('  Ticket médio:       R$ 10.050,00 (160.800 / 16)')
  console.log('  Maior lance:        R$ 370/parc. (Lt 46 – Vinicius)')
  console.log('  Compradores únicos: 4 (Vinicius, Lucio, Airon, Marlon)')
  console.log('  Estados alcançados: 2 confirmados (PE, BA)')
  console.log('  Marcelo Carneiro:   9 trans / 13 lotes / R$ 133.200 (82,84%)')
  console.log('  Mateus Alves:       1 trans / 3 lotes  / R$  27.600 (17,16%)')
  console.log('  Comissão:           R$ 2.664 (já no ERP, pending)')
})()
