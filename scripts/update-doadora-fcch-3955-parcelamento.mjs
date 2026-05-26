/**
 * Atualiza o registro FCCH 3955 em `products` pra refletir o novo
 * parcelamento (20× sem juros · 1+19) — substitui o "10× sem juros"
 * antigo. Idempotente: roda quantas vezes quiser.
 *
 * Uso:
 *   node --env-file=.env.local scripts/update-doadora-fcch-3955-parcelamento.mjs
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

const PATCH_TOP = {
    forma_pagamento: 'Entrada + 19x',
    installments: '20x sem juros',
}
const PATCH_DETAILS = {
    parcelamento: '20× sem juros (1+19)',
}

console.log(`-> Buscando FCCH 3955 em products (${url})…`)

const { data: existing, error: selErr } = await supabase
    .from('products')
    .select('id, name, forma_pagamento, installments, details')
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

console.log(`   id=${existing.id} · ${existing.name}`)
console.log(`   antes: forma_pagamento="${existing.forma_pagamento}" · installments="${existing.installments}" · details.parcelamento="${existing.details?.parcelamento}"`)

const mergedDetails = { ...(existing.details ?? {}), ...PATCH_DETAILS }

const { data: updated, error: updErr } = await supabase
    .from('products')
    .update({ ...PATCH_TOP, details: mergedDetails })
    .eq('id', existing.id)
    .select('id, forma_pagamento, installments, details')
    .single()

if (updErr) {
    console.error('Erro ao atualizar:', updErr.message)
    process.exit(1)
}

console.log(`   depois: forma_pagamento="${updated.forma_pagamento}" · installments="${updated.installments}" · details.parcelamento="${updated.details?.parcelamento}"`)
console.log('OK')
process.exit(0)
