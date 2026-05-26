/**
 * Corrige o registro FCCH 3955 em `products`:
 *   - criador: Nelore Leão (não Visual)
 *   - tipo embrião: DT (transferência direta), não VIT/vitrificado
 *
 * Atualiza:
 *   - products.name        → "Pacote 12 Embriões DT"
 *   - products.category    → "Embrião DT"
 *   - details.breeder      → "Nelore Leão"
 *   - details.fazenda      → "Fazenda Cachoeirão"
 *   - details.tipo_embriao → "DT"
 *   - details.comentario   → texto reescrito refletindo DT + criatório Nelore Leão
 *
 * Idempotente — pode rodar várias vezes.
 *
 * Uso:
 *   node --env-file=.env.local scripts/update-doadora-fcch-3955-criador-dt.mjs
 */

import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
    console.error('Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no .env.local')
    process.exit(1)
}

const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
})

const NEW_NAME = '3955 FIV FC CACHOEIRAO - Pacote 12 Embriões DT'
const NEW_CATEGORY = 'Embrião DT'

const PATCH_DETAILS = {
    breeder: 'Nelore Leão',
    fazenda: 'Fazenda Cachoeirão',
    tipo_embriao: 'DT',
    comentario:
        'Embrião DT Nelore PO · Criatório Nelore Leão · Doadora Cachoeirão (Bandeirantes/MS). ' +
        'Avaliação cruzada nos três programas: PMGZ/ABCZ iABCZg 33,44 (DECA 1 · P 0,1%) · ' +
        'GenePlus IQGg 37,86 (Classe E · P 0,5%) · ANCP MGTe 28,65 (TOP 4%). ' +
        'Pacote 12 embriões, 4 prenhezes garantidas.',
}

console.log(`-> Buscando FCCH 3955 em products (${url})…`)

const { data: existing, error: selErr } = await supabase
    .from('products')
    .select('id, name, category, details')
    .eq('details->>registro', 'FCCH 3955')
    .maybeSingle()

if (selErr) {
    console.error('Erro ao consultar:', selErr.message)
    process.exit(1)
}

if (!existing) {
    console.error('Não achei FCCH 3955 em products. Rode antes scripts/apply-doadora-fcch-3955.mjs.')
    process.exit(1)
}

console.log(`   id=${existing.id}`)
console.log(`   antes:`)
console.log(`     name="${existing.name}"`)
console.log(`     category="${existing.category}"`)
console.log(`     details.breeder="${existing.details?.breeder}"`)
console.log(`     details.tipo_embriao="${existing.details?.tipo_embriao ?? '(não setado)'}"`)

const mergedDetails = { ...(existing.details ?? {}), ...PATCH_DETAILS }

const { data: updated, error: updErr } = await supabase
    .from('products')
    .update({
        name: NEW_NAME,
        category: NEW_CATEGORY,
        details: mergedDetails,
    })
    .eq('id', existing.id)
    .select('id, name, category, details')
    .single()

if (updErr) {
    console.error('Erro ao atualizar:', updErr.message)
    process.exit(1)
}

console.log(`   depois:`)
console.log(`     name="${updated.name}"`)
console.log(`     category="${updated.category}"`)
console.log(`     details.breeder="${updated.details?.breeder}"`)
console.log(`     details.fazenda="${updated.details?.fazenda}"`)
console.log(`     details.tipo_embriao="${updated.details?.tipo_embriao}"`)
console.log('OK')
process.exit(0)
