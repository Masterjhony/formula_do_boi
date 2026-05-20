import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
    console.error('Faltam envs')
    process.exit(1)
}
const supabase = createClient(url, key, { auth: { persistSession: false } })

const today = new Date()
today.setHours(0, 0, 0, 0)
const startUtc = today.toISOString()

console.log(`\n=== whatsapp_messages desde ${startUtc} ===\n`)

const { data: today_msgs, error: e1 } = await supabase
    .from('whatsapp_messages')
    .select('id, created_at, phone, name, direction, status, origin, bot_step, body, lead_id')
    .gte('created_at', startUtc)
    .order('created_at', { ascending: false })

if (e1) { console.error(e1); process.exit(1) }

console.log(`Total: ${today_msgs.length}\n`)

// breakdown by direction × origin × status
const buckets = {}
for (const m of today_msgs) {
    const k = `${m.direction} | origin=${m.origin || '-'} | status=${m.status || '-'} | bot_step=${m.bot_step || '-'}`
    buckets[k] = (buckets[k] || 0) + 1
}
console.log('BREAKDOWN:')
for (const [k, v] of Object.entries(buckets).sort()) {
    console.log(`  ${v.toString().padStart(3)}  ${k}`)
}

console.log('\nDETALHE (mais recentes primeiro):')
for (const m of today_msgs.slice(0, 40)) {
    const ts = new Date(m.created_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    const body = m.body ? String(m.body).replace(/\s+/g, ' ').slice(0, 80) : '(null)'
    console.log(`  ${ts}  ${m.direction.padEnd(8)} ${(m.status || '-').padEnd(8)} ${(m.origin || '-').padEnd(18)} ${(m.bot_step || '-').padEnd(12)} ${(m.phone || '').padEnd(15)} ${body}`)
}

console.log('\n=== Outbound welcome por fone (hoje) ===')
const outbWelcome = today_msgs.filter(m => m.direction === 'outbound' && m.bot_step === 'welcome')
const byPhone = {}
for (const m of outbWelcome) {
    if (!byPhone[m.phone]) byPhone[m.phone] = []
    byPhone[m.phone].push(m)
}
for (const [phone, list] of Object.entries(byPhone)) {
    const statuses = list.map(m => m.status).join(', ')
    console.log(`  ${phone}  -> ${statuses}  (${list[0].name || '-'})`)
}

console.log('\n=== Inbound hoje ===')
for (const m of today_msgs.filter(m => m.direction === 'inbound')) {
    const ts = new Date(m.created_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    console.log(`  ${ts}  ${m.phone}  ${m.name || '-'}  body="${(m.body || '').slice(0, 60)}"`)
}

console.log('\n=== Leads criados hoje ===')
const { data: leads } = await supabase
    .from('crm_leads')
    .select('id, created_at, nome, telefone, origem, last_whatsapp_at, optout_whatsapp')
    .gte('created_at', startUtc)
    .order('created_at', { ascending: false })

console.log(`Total: ${leads?.length || 0}`)
for (const l of leads || []) {
    const ts = new Date(l.created_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    const wp = l.last_whatsapp_at ? new Date(l.last_whatsapp_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : '-'
    console.log(`  ${ts}  ${l.telefone?.padEnd(15) || '-'.padEnd(15)}  ${(l.nome || '-').slice(0, 30).padEnd(30)}  origem=${l.origem || '-'}  last_wa=${wp}  optout=${l.optout_whatsapp}`)
}

process.exit(0)
