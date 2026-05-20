import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(url, key, { auth: { persistSession: false } })

console.log('\n=== STAGES ===')
const { data: stages } = await supabase.from('crm_leads').select('stage')
const stageCount = {}
for (const r of stages) stageCount[r.stage || '(null)'] = (stageCount[r.stage || '(null)'] || 0) + 1
for (const [k, v] of Object.entries(stageCount).sort((a, b) => b[1] - a[1])) console.log(`  ${v.toString().padStart(4)}  ${k}`)

console.log('\n=== STATUS ===')
const { data: statuses } = await supabase.from('crm_leads').select('status')
const stCount = {}
for (const r of statuses) stCount[r.status || '(null)'] = (stCount[r.status || '(null)'] || 0) + 1
for (const [k, v] of Object.entries(stCount).sort((a, b) => b[1] - a[1])) console.log(`  ${v.toString().padStart(4)}  ${k}`)

console.log('\n=== INTERESSE PRINCIPAL ===')
const { data: intRows } = await supabase.from('crm_leads').select('interesse_principal')
const intCount = {}
for (const r of intRows) intCount[r.interesse_principal || '(null)'] = (intCount[r.interesse_principal || '(null)'] || 0) + 1
for (const [k, v] of Object.entries(intCount).sort((a, b) => b[1] - a[1])) console.log(`  ${v.toString().padStart(4)}  ${k}`)

console.log('\n=== TAGS WHATSAPP (top 20) ===')
const { data: tagRows } = await supabase.from('crm_leads').select('tags_whatsapp').not('tags_whatsapp', 'is', null)
const tagCount = {}
for (const r of tagRows) {
    if (!Array.isArray(r.tags_whatsapp)) continue
    for (const t of r.tags_whatsapp) tagCount[t] = (tagCount[t] || 0) + 1
}
for (const [k, v] of Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 20)) console.log(`  ${v.toString().padStart(4)}  ${k}`)

console.log('\n=== FILTROS COMBINADOS (potenciais alvos de campanha) ===')
const filters = [
    {
        label: 'Qualificados (interesse_principal != null) + sem optout + sem handoff + tem telefone',
        q: () => supabase.from('crm_leads').select('id', { count: 'exact', head: true })
            .not('interesse_principal', 'is', null)
            .eq('optout_whatsapp', false)
            .eq('handoff_humano', false)
            .not('telefone', 'is', null),
    },
    {
        label: 'Stage=qualificado + sem optout + tem telefone',
        q: () => supabase.from('crm_leads').select('id', { count: 'exact', head: true })
            .eq('stage', 'qualificado')
            .eq('optout_whatsapp', false)
            .not('telefone', 'is', null),
    },
    {
        label: 'Tag academia + sem optout',
        q: () => supabase.from('crm_leads').select('id', { count: 'exact', head: true })
            .contains('tags_whatsapp', ['grupo_academia_nelore_po'])
            .eq('optout_whatsapp', false),
    },
    {
        label: 'Tag lista_matheus_personalizada + sem optout',
        q: () => supabase.from('crm_leads').select('id', { count: 'exact', head: true })
            .contains('tags_whatsapp', ['lista_matheus_personalizada'])
            .eq('optout_whatsapp', false),
    },
    {
        label: 'Qualificados (interesse_principal != null) + ja receberam welcome (menu_enviado) + sem optout/handoff',
        q: () => supabase.from('crm_leads').select('id', { count: 'exact', head: true })
            .not('interesse_principal', 'is', null)
            .contains('tags_whatsapp', ['whatsapp:menu_enviado'])
            .eq('optout_whatsapp', false)
            .eq('handoff_humano', false),
    },
]

for (const f of filters) {
    const { count } = await f.q()
    console.log(`  ${(count ?? 0).toString().padStart(4)}  ${f.label}`)
}

console.log('\n=== AMOSTRA: qualificados sem optout/handoff (top 25 mais recentes) ===')
const { data: sample } = await supabase
    .from('crm_leads')
    .select('id, nome, telefone, interesse_principal, stage, tags_whatsapp, created_at, last_whatsapp_at')
    .not('interesse_principal', 'is', null)
    .eq('optout_whatsapp', false)
    .eq('handoff_humano', false)
    .not('telefone', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(25)

for (const l of sample) {
    const tags = Array.isArray(l.tags_whatsapp) ? l.tags_whatsapp.join(',') : ''
    console.log(`  ${(l.nome || '').slice(0, 28).padEnd(28)}  ${(l.telefone || '').padEnd(15)}  interesse=${(l.interesse_principal || '').padEnd(22)}  stage=${(l.stage || '').padEnd(14)}  tags=${tags}`)
}

process.exit(0)
