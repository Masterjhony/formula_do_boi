/**
 * Backfill — aplica o DEFAULT_TASKS em todos os leilões em bula_leiloes
 * com `tasks` vazio cuja data seja >= 2026-05-01 (escopo confirmado).
 *
 * Idempotente: pula leilões que já tenham tasks preenchidas.
 *
 * Uso: node scripts/backfill_checklist_default.js [--dry-run]
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
  if (!m) continue
  let v = m[2]
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
  process.env[m[1]] = v
}

const DRY = process.argv.includes('--dry-run')
const FROM_DATE = '2026-05-01'
const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// Mantém em sincronia com DEFAULT_TASKS de src/app/web-admin/(dashboard)/leiloes/page.tsx
const mkTask = (id, nome) => ({
  id, nome, ini: '', fim: '', resp: { nome: '', ini: '' },
  subs: [], done: false, observacao: '', anexos: [],
})

const DEFAULT_TASKS = [
  {
    nome: 'Pré-Leilão',
    subtitulo: 'Organização dos materiais e classificação dos lotes',
    cor: '#4A8FBF',
    tasks: [
      mkTask('pre-1', 'Receber catálogo em PDF'),
      mkTask('pre-2', 'Receber link do YouTube com os lotes'),
      mkTask('pre-3', 'Receber artes para divulgação'),
      mkTask('pre-4', 'Comitê de avaliação dos lotes e classificação'),
      mkTask('pre-5', 'Adicionar leilão no catálogo da semana'),
      mkTask('pre-6', 'Divulgação no grupo de WhatsApp pré-leilão'),
      mkTask('pre-7', 'Realizar mapa de leilão, direcionando clientes para lotes específicos'),
    ],
  },
  {
    nome: 'Dia do Leilão',
    subtitulo: 'Dia do leilão',
    cor: '#C8A96E',
    tasks: [
      mkTask('dia-1', 'Mandar lotes e avaliações para todos os clientes mapeados'),
      mkTask('dia-2', 'Garantir que todos os clientes estejam cadastrados corretamente'),
      mkTask('dia-3', 'Realizar ligação para os principais clientes'),
      mkTask('dia-4', 'Fazer divulgação massiva dos lotes na hora do leilão'),
      mkTask('dia-5', 'Ao fim do leilão, enviar todos os lotes vendidos com informações no grupo de WhatsApp'),
    ],
  },
  {
    nome: 'Pós-Leilão',
    subtitulo: 'Atividades pós-leilão',
    cor: '#6B8F5C',
    tasks: [
      mkTask('pos-1', 'Fechamento e análise do leilão'),
      mkTask('pos-2', 'Envio de contas a pagar e a receber para financeiro'),
      mkTask('pos-3', 'Provisionar pagamento e comunicar assessores'),
      mkTask('pos-4', 'Postar agradecimento ao criatório nos canais de comunicação'),
    ],
  },
]

;(async () => {
  const { data: rows, error } = await supa
    .from('bula_leiloes')
    .select('id, nome, data, tasks, status')
    .gte('data', FROM_DATE)
    .order('data')

  if (error) { console.error('ERR:', error.message); process.exit(1) }

  let touched = 0
  let skipped = 0
  for (const r of rows) {
    const hasTasks = Array.isArray(r.tasks) && r.tasks.length > 0
    if (hasTasks) { skipped++; continue }

    console.log(`→ ${r.data} | ${r.nome.padEnd(40)} | status=${r.status}`)
    if (!DRY) {
      const { error: upErr } = await supa
        .from('bula_leiloes')
        .update({ tasks: DEFAULT_TASKS })
        .eq('id', r.id)
      if (upErr) { console.error('  ERR:', upErr.message); process.exit(1) }
      console.log('  ✓ checklist padrão aplicado')
    }
    touched++
  }

  console.log(`\n${DRY ? '[DRY-RUN] ' : ''}Total escopo (data >= ${FROM_DATE}): ${rows.length}`)
  console.log(`  já com checklist: ${skipped}`)
  console.log(`  ${DRY ? 'seriam' : 'foram'} preenchidos: ${touched}`)
})()
