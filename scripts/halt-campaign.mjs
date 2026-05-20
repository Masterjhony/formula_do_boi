import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(url, key, { auth: { persistSession: false } })

const CAMPAIGN_ID = process.env.CAMPAIGN_ID
if (!CAMPAIGN_ID) { console.error('Falta CAMPAIGN_ID'); process.exit(1) }

// Marca campanha como cancelada (impede qualquer cron de continuar)
const { error } = await supabase
    .from('whatsapp_campaigns')
    .update({ status: 'cancelada', finished_at: new Date().toISOString() })
    .eq('id', CAMPAIGN_ID)
if (error) { console.error('Erro:', error.message); process.exit(1) }

console.log(`✓ Campanha ${CAMPAIGN_ID} marcada como CANCELADA`)

// Conta mensagens já registradas
const { data: msgs } = await supabase
    .from('whatsapp_messages')
    .select('id, phone, name, status, created_at, body')
    .eq('campaign_id', CAMPAIGN_ID)
    .order('created_at', { ascending: true })

console.log(`\n${msgs?.length ?? 0} mensagens registradas em whatsapp_messages pra esta campanha:`)
for (const m of msgs ?? []) {
    const t = new Date(m.created_at).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    console.log(`  ${t}  ${(m.status || '-').padEnd(8)}  ${m.phone.padEnd(15)}  ${(m.name || '').slice(0, 25)}`)
}

// Status dos recipients
const { data: rcps } = await supabase
    .from('whatsapp_campaign_recipients')
    .select('phone, name, status, stopped_reason')
    .eq('campaign_id', CAMPAIGN_ID)
    .order('created_at', { ascending: true })

const byStatus = {}
for (const r of rcps ?? []) byStatus[r.status] = (byStatus[r.status] || 0) + 1
console.log(`\nStatus dos ${rcps?.length ?? 0} recipients:`)
for (const [k, v] of Object.entries(byStatus)) console.log(`  ${v} ${k}`)

process.exit(0)
