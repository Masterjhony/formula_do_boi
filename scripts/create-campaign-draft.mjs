import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(url, key, { auth: { persistSession: false } })

const CAMPAIGN_NAME = 'Apresentação Matheus — Qualificados 2026-05-19'
const CAMPAIGN_DESC = 'Primeira mensagem (cold) para a lista de 26 leads marcados como status=Qualificado. Mensagem curta, conversacional, com opt-out e menu numérico aproveitando o DEFAULT_NUMERIC_MAP da Central.'

const BODY = [
    'Olá, {nome}! Aqui é o Matheus, da Fórmula do Boi.',
    '',
    'Estou me apresentando pessoalmente por aqui. Trabalhamos com touros, embriões e assessoria em leilões de Nelore P.O.',
    '',
    'Antes de qualquer coisa, qual frente faz mais sentido pra você hoje?',
    '',
    '1 — Touros / sêmen',
    '2 — Embriões',
    '3 — Compra e venda de genética P.O',
    '4 — Só receber novidades',
    '',
    'Caso prefira não receber mais mensagens, é só responder PARAR.',
].join('\n')

const SEGMENT = {
    status: 'Qualificado',
    has_phone: true,
}

// Cria rascunho
const { data: existing } = await supabase
    .from('whatsapp_campaigns')
    .select('id, name, status, created_at')
    .eq('name', CAMPAIGN_NAME)
    .maybeSingle()

if (existing) {
    console.log(`⚠ Já existe campanha com este nome (${existing.id}, status=${existing.status}).`)
    console.log(`   Reuse ou delete antes de criar outra. Saindo.`)
    process.exit(1)
}

const { data: created, error } = await supabase
    .from('whatsapp_campaigns')
    .insert({
        name: CAMPAIGN_NAME,
        description: CAMPAIGN_DESC,
        segment: SEGMENT,
        body: BODY,
        template_id: null,
        status: 'rascunho',
        // Regras conservadoras: para de mandar se opt-out / handoff / response
        stop_on_optout: true,
        stop_on_handoff: true,
        stop_on_reply: true,
        stop_on_interest: false,  // se classificar interesse, ainda assim para? não — single-shot
        reply_tag: null,
        reply_handoff: false,
    })
    .select('id, name, status, segment, body, created_at')
    .single()

if (error) {
    console.error('❌ Falha ao criar:', error.message)
    process.exit(1)
}

console.log('✅ Campanha rascunho criada:')
console.log(`   ID:     ${created.id}`)
console.log(`   Nome:   ${created.name}`)
console.log(`   Status: ${created.status}`)
console.log(`   Body:   ${created.body.length} chars`)

// Preview manual (replica resolveSegment)
let q = supabase
    .from('crm_leads')
    .select('id, nome, telefone, tags_whatsapp, optout_whatsapp')
    .eq('optout_whatsapp', false)
    .not('telefone', 'is', null)
    .neq('telefone', '')
    .eq('status', 'Qualificado')

const { data: rcps } = await q.limit(2000)

// Dedup por telefone
const seen = new Set()
const final = []
for (const r of rcps ?? []) {
    if (!r.telefone || seen.has(r.telefone)) continue
    seen.add(r.telefone)
    final.push(r)
}

console.log(`\nPREVIEW (resolveSegment): ${final.length} destinatários únicos`)
console.log('\nAMOSTRA do que cada um receberá:')
for (const l of final.slice(0, 5)) {
    const nome = (l.nome || '').trim()
    const primeiro = nome.split(/\s+/)[0] || 'amigo(a)'
    const rendered = BODY.replace(/\{nome\}/g, primeiro)
    console.log(`\n--- ${nome} (${l.telefone}) ---`)
    console.log(rendered.split('\n').map(line => '   ' + line).join('\n'))
}

console.log(`\n... e mais ${final.length - 5} destinatários.`)
console.log(`\nGUARDE este ID para o disparo:\n   CAMPAIGN_ID=${created.id}`)
process.exit(0)
