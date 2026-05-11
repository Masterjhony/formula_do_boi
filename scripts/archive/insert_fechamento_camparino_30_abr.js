// ============================================================
// Insert — 5° Expozebu Camparino & Amigos — 30/04/2026
// (Leilão que ficou faltando — reportado pelo Marcelo em 06/05.)
//
// Lance único:
//   Leonardo Serafim — Bula Assessoria
//   Lt 12 — NATALIA FIV CAMPARINO (Bezerra 8m, 346kg)
//   Vendedor: Fazenda Camparino
//   Comprador: Rogério Zanetti — Nelore AZ — Matupá/MT
//   Parcela R$ 2.600 × 30x = VGV R$ 78.000
//
// Comissão NÃO gerada (Leonardo é Bula Assessoria, fora da
// regra 2% dos FDB — comissão vem de outra rotina).
// receita_bula = 0 (taxa Camparino não confirmada).
// Idempotente: WHERE NOT EXISTS por nome + data.
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

const NOME = '5° Expozebu Camparino & Amigos – 30/04/2026'
const DATA = '2026-04-30'

const PAYLOAD = {
  nome: NOME,
  data: DATA,
  local: 'Uberaba/MG',
  lotes_ofertados: 30,
  lotes_vendidos: 1,
  animais_vendidos: 1,
  vgv_total: 78000,
  ticket_medio: 78000,
  maior_lance: 2600,
  compradores_unicos: 1,
  estados_alcancados: 1,
  por_assessor: [
    { posicao: 1, nome: 'Leonardo Serafim', empresa: 'Bula Assessoria', transacoes: 1, animais: 1, vgv: 78000, ticket_medio: 78000, pct_total: 1 },
  ],
  por_estado: [
    { uf: 'MT', estado: 'Mato Grosso', lotes: 1, animais: 1, vgv: 78000, pct_total: 1 },
  ],
  compradores: [
    { rank: 1, fazenda: 'Nelore AZ', comprador: 'Rogério Zanetti', cidade: 'Matupá', uf: 'MT', lotes: 1, animais: 1, vgv: 78000 },
  ],
  lances: [
    {
      lote: '12',
      produto: 'NATALIA FIV CAMPARINO',
      categoria: 'Bezerra',
      idade: '8m',
      peso_kg: 346,
      vendedor: 'Fazenda Camparino',
      fazenda: 'Nelore AZ',
      comprador: 'Rogério Zanetti',
      cidade: 'Matupá',
      uf: 'MT',
      assessor: 'Leonardo Serafim',
      empresa: 'Bula Assessoria',
      animais: 1,
      parcela: 2600,
      vgv: 78000,
    },
  ],
  perfil_genetico: null,
  comissao_assessoria: 0,
  receita_bula: 0,
  sobra_bruta: 0,
  observacoes:
    'Lance reportado pelo Marcelo Carneiro em 06/05 ("não tinha mandado" antes) — único da equipe Bula/Fórmula nesse leilão. ' +
    'Lt 12 (NATALIA FIV CAMPARINO, bezerra 8m, 346kg, vendedor Fazenda Camparino) levado pelo Leonardo Serafim (Bula Assessoria). ' +
    'Comprador Rogério Zanetti — Nelore AZ — Matupá/MT. ' +
    'Parcela R$ 2.600 × 30x = VGV R$ 78.000 (pagamento padrão do leilão: 2 à vista + 2 c/ 30d + 2 c/ 60d + 2 c/ 90d + 2 c/ 120d + 20 mensais; à vista -10%, 1+11x -5%). ' +
    'Catálogo total: 30 lotes (ordem de entrada 1º ao 30º). ' +
    'Comissão Leonardo NÃO foi gerada aqui — Bula Assessoria tem rotina própria, fora da regra 2% dos FDB. ' +
    'Receita Bula = 0: taxa do Camparino não foi confirmada — revisar quando informada.',
}

;(async () => {
  const { data: existente, error: e1 } = await supa
    .from('bula_leilao_fechamento')
    .select('id')
    .eq('nome', NOME)
    .eq('data', DATA)
    .maybeSingle()
  if (e1) { console.error('ERRO select:', e1.message); process.exit(1) }

  if (existente) {
    console.log(`= SKIP — Fechamento "${NOME}" já existe (id ${existente.id}).`)
    process.exit(0)
  }

  const { data: ins, error } = await supa
    .from('bula_leilao_fechamento')
    .insert(PAYLOAD)
    .select('id')
    .single()
  if (error) { console.error('ERRO insert:', error.message); process.exit(1) }

  console.log(`✓ Fechamento criado — id ${ins.id}`)
  console.log(`  Nome: ${NOME}`)
  console.log(`  VGV: R$ 78.000  •  Lt 12  •  Leonardo Serafim (Bula Assessoria)`)
})()
