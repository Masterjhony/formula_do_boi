/**
 * Reproduz a logica do /api/whatsapp/central/campaigns/[id]/send via service role.
 *
 * Uso: CAMPAIGN_ID=<uuid> node --env-file=.env.local scripts/fire-campaign.mjs
 *
 * O que faz:
 * 1. Carrega a campanha (deve estar em 'rascunho').
 * 2. Resolve segmento, dedup por telefone.
 * 3. Insere recipients em whatsapp_campaign_recipients (status=pendente).
 * 4. Atualiza campanha -> 'enviando'.
 * 5. POST no VPS /campaign-send com a lista renderizada.
 * 6. Mostra a resposta do VPS.
 */

import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const VPS = process.env.WHATSAPP_SERVER_URL || 'http://165.232.142.37:3001'
const CAMPAIGN_ID = process.env.CAMPAIGN_ID
if (!CAMPAIGN_ID) { console.error('Falta CAMPAIGN_ID'); process.exit(1) }

const supabase = createClient(url, key, { auth: { persistSession: false } })

function firstName(name) {
    if (!name) return 'amigo(a)'
    const t = name.trim()
    if (!t) return 'amigo(a)'
    return t.split(/\s+/)[0]
}

const { data: campaign, error: cErr } = await supabase
    .from('whatsapp_campaigns')
    .select('id, name, status, segment, body, template_id')
    .eq('id', CAMPAIGN_ID)
    .single()

if (cErr || !campaign) { console.error('Campanha não encontrada:', cErr); process.exit(1) }
if (campaign.status !== 'rascunho') { console.error(`Status='${campaign.status}', so 'rascunho' pode disparar`); process.exit(1) }

console.log(`==> Campanha: ${campaign.name} (${campaign.id})`)
console.log(`==> VPS: ${VPS}`)

// Resolve segmento (mesma logica do resolveSegment + status=Qualificado)
const seg = campaign.segment || {}
let q = supabase
    .from('crm_leads')
    .select('id, nome, telefone')
    .eq('optout_whatsapp', false)
    .not('telefone', 'is', null)
    .neq('telefone', '')
if (seg.status) q = q.eq('status', seg.status)
if (seg.stage)  q = q.eq('stage', seg.stage)
if (seg.interesse_principal) q = q.eq('interesse_principal', seg.interesse_principal)

const { data: rcps } = await q.limit(2000)
const seen = new Set()
const final = []
for (const r of rcps ?? []) {
    if (!r.telefone || seen.has(r.telefone)) continue
    seen.add(r.telefone)
    final.push(r)
}
console.log(`==> ${final.length} destinatarios apos dedup`)

if (final.length === 0) { console.error('Segmento vazio. Saindo.'); process.exit(1) }

// Materializa recipients
const rows = final.map(r => ({
    campaign_id: campaign.id,
    lead_id: r.id,
    phone: r.telefone,
    name: r.nome,
    status: 'pendente',
    current_step: 1,
    next_send_at: null,
}))

const { data: inserted, error: iErr } = await supabase
    .from('whatsapp_campaign_recipients')
    .insert(rows)
    .select('id, lead_id, phone, name')
if (iErr) { console.error('Falha ao inserir recipients:', iErr.message); process.exit(1) }
console.log(`==> ${inserted.length} recipients materializados`)

// Atualiza campanha -> enviando
const now = new Date()
await supabase
    .from('whatsapp_campaigns')
    .update({ status: 'enviando', total_recipients: final.length, started_at: now.toISOString() })
    .eq('id', campaign.id)
console.log('==> Campanha marcada como "enviando"')

// Renderiza body por destinatario
const renderedRecipients = inserted.map(r => ({
    recipient_id: r.id,
    phone: r.phone,
    message: campaign.body.replace(/\{nome\}/g, firstName(r.name)).replace(/\{name\}/g, r.name || ''),
    caption: null,
}))

console.log(`==> Disparando ${renderedRecipients.length} mensagens no VPS...`)
const res = await fetch(`${VPS}/campaign-send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        campaign_id: campaign.id,
        recipients: renderedRecipients,
        media: null,
        poll: null,
    }),
    signal: AbortSignal.timeout(30_000),
})

if (!res.ok) {
    const txt = await res.text()
    console.error('VPS retornou erro:', res.status, txt)
    await supabase.from('whatsapp_campaigns').update({ status: 'erro' }).eq('id', campaign.id)
    process.exit(1)
}

const result = await res.json()
console.log(`==> VPS aceitou: ${result.queued} mensagens enfileiradas`)
console.log(`==> Tempo estimado: ${(result.queued * 4)}s (~${Math.ceil(result.queued * 4 / 60)} min)`)
console.log(`\nPara monitorar:`)
console.log(`   curl ${VPS}/queue`)
console.log(`   Painel Atividade na aba Conexão do admin`)
process.exit(0)
