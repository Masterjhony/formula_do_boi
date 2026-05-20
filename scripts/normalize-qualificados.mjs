import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(url, key, { auth: { persistSession: false } })

const DRY_RUN = process.env.DRY !== 'false'  // por padrão é dry-run

// Padrão: [Cidade/UF][Nome Sobrenome]  →  extrai Nome Sobrenome
const RE = /^\[([^/]+)\/([A-Z]{2})\]\[([^\]]+)\]\s*$/

const { data } = await supabase
    .from('crm_leads')
    .select('id, nome, telefone, notes')
    .eq('status', 'Qualificado')
    .order('updated_at', { ascending: false })

console.log(`\n=== ${data.length} leads — análise de normalização (DRY=${DRY_RUN}) ===\n`)

const updates = []
const seenTel = new Map()  // tel → first lead id
const dupes = []
const problematicTels = []

for (const l of data) {
    const m = RE.exec(l.nome || '')
    if (!m) {
        console.log(`  ⚠ Não casou padrão: "${l.nome}"`)
        continue
    }
    const [, cidade, uf, nomeRaw] = m
    const nomeReal = nomeRaw.trim().replace(/\s+/g, ' ')
    // Capitaliza nome (lower case com upper na primeira letra de cada palavra)
    const nomeLimpo = nomeReal
        .toLowerCase()
        .split(/\s+/)
        .map(w => w.length ? w[0].toUpperCase() + w.slice(1) : w)
        .join(' ')

    // Telefone: 13 dígitos = OK (DDI 55 + DDD 2 + celular 9), 12 = ainda comum (faltando o 9)
    const tel = (l.telefone || '').replace(/\D/g, '')
    let telOK = true, telWarn = ''
    if (tel.length === 13 && tel.startsWith('55')) {
        // OK
    } else if (tel.length === 12 && tel.startsWith('55')) {
        telWarn = '(12 dígitos — pode falhar; WhatsApp moderno exige 9 antes do número)'
        telOK = false
    } else {
        telWarn = '(formato suspeito)'
        telOK = false
    }
    if (!telOK) problematicTels.push({ id: l.id, nome: nomeLimpo, tel: l.telefone, warn: telWarn })

    // Dedup por telefone normalizado
    if (seenTel.has(l.telefone)) {
        dupes.push({ id: l.id, nome: nomeLimpo, tel: l.telefone, dupeOf: seenTel.get(l.telefone) })
        continue
    }
    seenTel.set(l.telefone, l.id)

    const notesAddition = `[Origem lista importada] Cidade: ${cidade}/${uf}. Nome original no CRM: ${l.nome}`
    const newNotes = l.notes
        ? (l.notes.includes('[Origem lista importada]') ? l.notes : `${l.notes}\n\n${notesAddition}`)
        : notesAddition

    updates.push({
        id: l.id,
        nome_atual: l.nome,
        nome_novo: nomeLimpo,
        cidade: `${cidade}/${uf}`,
        notes_novo: newNotes,
        telefone: l.telefone,
        tel_warn: telWarn,
    })
}

console.log(`Vou normalizar ${updates.length} leads. Dedup encontrou ${dupes.length} duplicados (mesmo telefone). ${problematicTels.length} têm telefone suspeito.\n`)

console.log('AMOSTRA dos updates (primeiros 8):')
for (const u of updates.slice(0, 8)) {
    console.log(`  ${u.nome_atual.slice(0, 35).padEnd(35)} → "${u.nome_novo}" (${u.cidade})  tel=${u.telefone}  ${u.tel_warn}`)
}
if (updates.length > 8) console.log(`  ... e mais ${updates.length - 8}`)

if (dupes.length) {
    console.log(`\nDUPLICADOS (NÃO vão receber — mesmo telefone que outro lead):`)
    for (const d of dupes) console.log(`  ${d.nome} (${d.tel}) — duplicado de ${d.dupeOf}`)
}
if (problematicTels.length) {
    console.log(`\nTELEFONES SUSPEITOS (ainda recebem, mas podem falhar no VPS):`)
    for (const p of problematicTels) console.log(`  ${p.nome} — ${p.tel} ${p.warn}`)
}

if (DRY_RUN) {
    console.log(`\n--- DRY RUN: nada foi escrito no banco. Rode com DRY=false pra aplicar. ---`)
    process.exit(0)
}

console.log(`\nAplicando updates…`)
let ok = 0
for (const u of updates) {
    const { error } = await supabase
        .from('crm_leads')
        .update({ nome: u.nome_novo, notes: u.notes_novo })
        .eq('id', u.id)
    if (error) console.error(`  ❌ ${u.id}: ${error.message}`)
    else ok++
}
console.log(`✅ ${ok}/${updates.length} normalizados.`)
process.exit(0)
