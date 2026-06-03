/* ============================================================
 * Aplica database/update_volante_card.sql via Supabase JS
 * (service-role). Equivalente ao UPDATE:
 *   details.proprietario -> "Nelore Leão"
 *   gallery              -> fotos novas
 * Idempotente: roda quantas vezes quiser, converge no valor final.
 *
 * Uso: node scripts/run-update-volante-card.mjs
 * ============================================================ */
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

// --- carrega .env.local manualmente (sem dep de dotenv) ---
function loadEnv(path) {
  const out = {}
  try {
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (!m) continue
      let v = m[2].trim()
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1)
      }
      out[m[1]] = v
    }
  } catch (e) {
    console.error('Não consegui ler', path, e.message)
  }
  return out
}

const env = { ...loadEnv('.env.local'), ...process.env }
const URL = env.NEXT_PUBLIC_SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!URL || !KEY) {
  console.error('Faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const NAME = 'Dose de Sêmen - VOLANTE MRA'
const GALLERY = [
  '/volante/volante-corpo.jpg',
  '/volante/volante-frontal.jpg',
  '/volante/volante-pasto.jpg',
  '/volante/volante-retrato.jpg',
  '/volante/volante-video.mp4',
]

const supabase = createClient(URL, KEY, { auth: { persistSession: false } })

const { data: rows, error: selErr } = await supabase
  .from('products')
  .select('id, name, gallery, details')
  .eq('name', NAME)

if (selErr) {
  console.error('Erro no SELECT:', selErr.message)
  process.exit(1)
}
if (!rows || rows.length === 0) {
  console.error(`Nenhum produto com name = "${NAME}". Rode antes o insert_volante.sql.`)
  process.exit(1)
}

const row = rows[0]
const details = { ...(row.details || {}), proprietario: 'Nelore Leão' }

const { error: updErr } = await supabase
  .from('products')
  .update({ details, gallery: GALLERY })
  .eq('id', row.id)

if (updErr) {
  console.error('Erro no UPDATE:', updErr.message)
  process.exit(1)
}

// confere resultado
const { data: after } = await supabase
  .from('products')
  .select('id, name, gallery, details')
  .eq('id', row.id)
  .single()

console.log('OK — card atualizado:')
console.log('  id:', after.id)
console.log('  proprietario:', after.details?.proprietario)
console.log('  gallery[0]:', after.gallery?.[0])
console.log('  gallery:', JSON.stringify(after.gallery))
