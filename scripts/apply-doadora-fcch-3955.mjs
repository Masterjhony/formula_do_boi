/**
 * Aplica o seed de FCCH 3955 (Cachoeirão) na tabela `products` via Supabase SDK.
 *
 * Equivale a rodar database/seed_doadora_fcch_3955.sql, mas sem precisar de
 * psql/Supabase CLI. Idempotente — chega antes via NOT EXISTS por registro.
 *
 * Uso:
 *   node --env-file=.env.local scripts/apply-doadora-fcch-3955.mjs
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

const VIDEO = 'https://res.cloudinary.com/dny0ibgbn/video/upload/v1779738203/LOTE_09_-_FCCH_3955_1_1_wlfdau.mp4'

const row = {
    name: '3955 FIV FC CACHOEIRAO - Pacote 12 Embriões VIT',
    category: 'Embrião VIT',
    classificacao: 'embriao',
    modalidade: 'venda_direta',
    logistica: 'frete_compartilhado',
    forma_pagamento: 'Entrada + 9x',
    location: 'Bandeirantes - MS',
    image_url: VIDEO,
    gallery: [VIDEO],
    price: 1100,
    installments: '10x sem juros',
    tag: 'SAFRA_VIS_2026',
    active: true,
    display_order: 1005,
    details: {
        registro: 'FCCH 3955',
        raca: 'Nelore PO',
        nascimento: '15/07/2025',
        pai: 'CASANOVA BONS',
        mae: '3027 FC CACHOEIRAO',
        iabcz: '33,44',
        iqg: '37,86',
        mgte: '28,65',
        top: 'TOP 0,1%',
        status: 'Disponível',
        proprietario: 'José Rodrigues Pereira',
        breeder: 'Fazenda Cachoeirão',
        comentario:
            'Embrião VIT Nelore PO · Doadora Cachoeirão (Bandeirantes/MS). ' +
            'Avaliação cruzada nos três programas: PMGZ/ABCZ iABCZg 33,44 (DECA 1 · P 0,1%) · ' +
            'GenePlus IQGg 37,86 (Classe E · P 0,5%) · ANCP MGTe 28,65 (TOP 4%). ' +
            'Pacote 12 embriões, 4 prenhezes garantidas.',
        slug: 'fcch-3955',
        cruzamento: null,
        classificacao_top: 'TOP 0,1%',
        pacote_total: 13200,
        quantidade_embrioes: 12,
        parcelamento: '10× sem juros (1 entrada + 9 parcelas)',
        video: VIDEO,
        fichas_tecnicas: [
            { programa: 'PMGZ/ABCZ', corte: '2026-2', url: '/FCCH-3955-PMGZ.pdf' },
            { programa: 'GenePlus/Embrapa', corte: 'Abril/2026', url: '/FCCH-3955-GENEPLUS.pdf' },
            { programa: 'ANCP', corte: '1ª AG ABR/2026', url: '/FCCH-3955-ANCP.pdf' },
        ],
    },
}

console.log(`-> Aplicando FCCH 3955 em products (${url})…\n`)

// Idempotência: procura por registro no details JSONB antes de inserir.
const { data: existing, error: selErr } = await supabase
    .from('products')
    .select('id, name, active, display_order')
    .eq('details->>registro', 'FCCH 3955')
    .maybeSingle()

if (selErr) {
    console.error('Erro ao consultar products:', selErr.message)
    process.exit(1)
}

if (existing) {
    console.log(`Já existia: id=${existing.id} · ${existing.name} (active=${existing.active}, order=${existing.display_order})`)
    console.log('Nada a fazer.')
    process.exit(0)
}

const { data: inserted, error: insErr } = await supabase
    .from('products')
    .insert(row)
    .select('id, name, tag, active, display_order')
    .single()

if (insErr) {
    console.error('Erro ao inserir:', insErr.message)
    process.exit(1)
}

console.log(`OK  id=${inserted.id} · ${inserted.name}`)
console.log(`    tag=${inserted.tag}  active=${inserted.active}  display_order=${inserted.display_order}`)
process.exit(0)
