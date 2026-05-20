import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(url, key, { auth: { persistSession: false } })

const { data, error } = await supabase
    .from('crm_leads')
    .select('id, nome, telefone, status, stage, interesse_principal, tags_whatsapp, optout_whatsapp, handoff_humano, last_whatsapp_at, created_at, updated_at, notes, origem, source, medium, campaign')
    .eq('status', 'Qualificado')
    .order('updated_at', { ascending: false })

if (error) { console.error(error); process.exit(1) }

console.log(`\n=== ${data.length} leads com status="Qualificado" ===\n`)

let elegiveis = 0, optouts = 0, handoffs = 0, semTel = 0, semWelcome = 0, comWelcome = 0
const elegiveisList = []

for (const l of data) {
    const ts = new Date(l.updated_at).toLocaleDateString('pt-BR')
    const lastWa = l.last_whatsapp_at ? new Date(l.last_whatsapp_at).toLocaleDateString('pt-BR') : '—'
    const tags = Array.isArray(l.tags_whatsapp) ? l.tags_whatsapp.join(',') : ''
    const flags = []
    if (l.optout_whatsapp) { flags.push('OPTOUT'); optouts++ }
    if (l.handoff_humano) { flags.push('HANDOFF'); handoffs++ }
    if (!l.telefone) { flags.push('SEM-TEL'); semTel++ }
    if (!l.last_whatsapp_at) semWelcome++
    else comWelcome++
    const elegivel = !l.optout_whatsapp && !l.handoff_humano && !!l.telefone
    if (elegivel) {
        elegiveis++
        elegiveisList.push(l)
    }
    console.log(`  ${(l.nome || '').slice(0, 28).padEnd(28)}  ${(l.telefone || '—').padEnd(15)}  updated=${ts}  lastWA=${lastWa}  origem=${(l.origem || '—').padEnd(14)}  ${flags.join(',') || '✓'}  tags=${tags}`)
}

console.log(`\n--- Resumo ---`)
console.log(`  ${elegiveis} elegíveis (sem optout, sem handoff, com telefone)`)
console.log(`  ${optouts} opt-out`)
console.log(`  ${handoffs} em handoff`)
console.log(`  ${semTel} sem telefone`)
console.log(`  ${comWelcome} já tiveram interação WhatsApp registrada`)
console.log(`  ${semWelcome} ainda sem interação WhatsApp`)

console.log(`\n=== Dos elegíveis: quem já teve interação (último contato WhatsApp não null) ===`)
const aquecidos = elegiveisList.filter(l => l.last_whatsapp_at)
console.log(`  ${aquecidos.length} leads aquecidos (ja tiveram conversa WhatsApp)`)
console.log(`  ${elegiveisList.length - aquecidos.length} leads frios (qualificados manualmente, sem WhatsApp prévio)`)

console.log(`\nAQUECIDOS (mais seguros pra campanha):`)
for (const l of aquecidos) {
    const lastWa = new Date(l.last_whatsapp_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    console.log(`  ${(l.nome || '').slice(0, 30).padEnd(30)}  ${l.telefone.padEnd(15)}  lastWA=${lastWa}`)
}

console.log(`\nFRIOS (sem WhatsApp prévio — risco maior de ban se mandar em volume):`)
for (const l of elegiveisList.filter(l => !l.last_whatsapp_at).slice(0, 30)) {
    console.log(`  ${(l.nome || '').slice(0, 30).padEnd(30)}  ${l.telefone.padEnd(15)}  origem=${l.origem || '—'}`)
}

process.exit(0)
