/**
 * Aplica as doadoras GARTA MAT. e JATY MAT. na tabela `products` (OCULTAS) e
 * oculta a FCCH 3955 já existente. Equivale a rodar
 * database/seed_doadoras_garta_jaty_ocultas.sql via Supabase SDK.
 *
 * Idempotente: insere por registro só se não existir; sempre força active=false
 * nos 3 registros (gate de visibilidade do /embrioes via tag SAFRA_VIS_2026).
 *
 * Uso:
 *   node --env-file=.env.local scripts/apply-doadoras-garta-jaty-ocultas.mjs
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

const GARTA_VIDEO = 'https://res.cloudinary.com/dny0ibgbn/video/upload/v1780514254/lote-77_Wo8Wijj8_t4fjt6.mp4'
const JATY_VIDEO = 'https://res.cloudinary.com/dny0ibgbn/video/upload/v1780514262/img-8157_f11T2ejZ_aesasw.mp4'

const ROWS = [
    {
        name: 'GARTA MAT. - Pacote 12 Embriões VIT',
        category: 'Embrião VIT',
        classificacao: 'embriao',
        modalidade: 'venda_direta',
        logistica: 'frete_compartilhado',
        forma_pagamento: 'Entrada + 19x',
        location: 'Esmeraldas - MG',
        image_url: GARTA_VIDEO,
        gallery: [GARTA_VIDEO],
        price: 1300,
        installments: '20x sem juros',
        tag: 'SAFRA_VIS_2026',
        active: false,
        display_order: 1007,
        details: {
            registro: 'RDM A5372',
            raca: 'Nelore PO',
            nascimento: '06/07/2021',
            pai: 'A7286 MAT.',
            mae: null,
            iabcz: '32,83',
            iqg: '41,14',
            mgte: '33,02',
            top: 'TOP 0,1%',
            status: 'Disponível',
            proprietario: 'Rancho da Matinha',
            breeder: 'Nelore Leão',
            tipo_embriao: 'VIT',
            comentario:
                'Embrião VIT Nelore PO · Criatório Nelore Leão (Esmeraldas/MG). ' +
                'iABCZ 32,83 (P 0,1%) · IQG 41,14 (TOP 0,1%) · MGTe 33,02 (TOP 0,5%). ' +
                'Pacote 12 embriões VIT, 4 prenhezes garantidas.',
            slug: 'garta-mat',
            cruzamento: 'A7286 MAT.',
            classificacao_top: 'TOP 0,1%',
            pacote_total: 15600,
            quantidade_embrioes: 12,
            parcelamento: '20× sem juros',
            video: GARTA_VIDEO,
        },
    },
    {
        name: 'JATY MAT. - Pacote 12 Embriões VIT',
        category: 'Embrião VIT',
        classificacao: 'embriao',
        modalidade: 'venda_direta',
        logistica: 'frete_compartilhado',
        forma_pagamento: 'Entrada + 19x',
        location: 'Esmeraldas - MG',
        image_url: JATY_VIDEO,
        gallery: [JATY_VIDEO],
        price: 1300,
        installments: '20x sem juros',
        tag: 'SAFRA_VIS_2026',
        active: false,
        display_order: 1006,
        details: {
            registro: 'RDM B3610',
            raca: 'Nelore PO',
            nascimento: '27/08/2024',
            pai: 'HANDI MAT.',
            mae: null,
            iabcz: '36,42',
            iqg: '45,06',
            mgte: '37,70',
            top: 'TOP 0,1%',
            status: 'Disponível',
            proprietario: 'Rancho da Matinha',
            breeder: 'Rancho da Matinha',
            tipo_embriao: 'VIT',
            comentario:
                'Embrião VIT Nelore PO · Rancho da Matinha (Esmeraldas/MG). ' +
                'iABCZ 36,42 (P 0,1%) · IQG 45,06 (TOP 0,1%) · MGTe 37,70 (TOP 0,1%). ' +
                'Pacote 12 embriões VIT, 4 prenhezes garantidas.',
            slug: 'jaty-mat',
            cruzamento: 'HANDI MAT.',
            classificacao_top: 'TOP 0,1%',
            pacote_total: 15600,
            quantidade_embrioes: 12,
            parcelamento: '20× sem juros',
            video: JATY_VIDEO,
        },
    },
]

console.log(`-> Aplicando GARTA/JATY (ocultas) em products (${url})…\n`)

for (const row of ROWS) {
    const reg = row.details.registro
    const { data: existing, error: selErr } = await supabase
        .from('products')
        .select('id, name, active')
        .eq('details->>registro', reg)
        .maybeSingle()

    if (selErr) {
        console.error(`Erro ao consultar ${reg}:`, selErr.message)
        process.exit(1)
    }

    if (existing) {
        const { error: updErr } = await supabase
            .from('products')
            .update({ active: false })
            .eq('id', existing.id)
        if (updErr) {
            console.error(`Erro ao ocultar ${reg}:`, updErr.message)
            process.exit(1)
        }
        console.log(`Já existia: id=${existing.id} · ${existing.name} → active=false`)
    } else {
        const { data: inserted, error: insErr } = await supabase
            .from('products')
            .insert(row)
            .select('id, name, tag, active, display_order')
            .single()
        if (insErr) {
            console.error(`Erro ao inserir ${reg}:`, insErr.message)
            process.exit(1)
        }
        console.log(`Inserida: id=${inserted.id} · ${inserted.name} (active=${inserted.active})`)
    }
}

// Ocultar a FCCH 3955 (Cachoeirão), que já existe com active=true.
const { data: fcch, error: fcchErr } = await supabase
    .from('products')
    .update({ active: false })
    .eq('details->>registro', 'FCCH 3955')
    .select('id, name, active')

if (fcchErr) {
    console.error('Erro ao ocultar FCCH 3955:', fcchErr.message)
    process.exit(1)
}
for (const r of fcch ?? []) console.log(`Ocultada: id=${r.id} · ${r.name} → active=${r.active}`)

console.log('\nOK — 3 doadoras no catálogo, todas ocultas (active=false).')
process.exit(0)
