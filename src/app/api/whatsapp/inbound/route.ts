/**
 * /api/whatsapp/inbound — recebe mensagens individuais do VPS e:
 *   1. Encontra (ou cria) o lead correspondente no CRM
 *   2. Classifica a intenção (opt-out, humano, interesse, desconhecido)
 *   3. Atualiza crm_leads + log de mensagens
 *   4. Devolve a próxima resposta do bot ao VPS, ou pede silêncio
 *
 * Autenticação: header `x-webhook-secret` deve bater com `WHATSAPP_GROUP_TASK_SECRET`.
 * O VPS espera resposta JSON: `{ silent?: true } | { reply: string, bot_step?: string }`.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
    classifyMessage,
    INTERESSES,
    normalizePhone,
    phoneVariants,
    renderTemplate,
    firstName,
    type Interesse,
    type Classification,
} from '@/lib/whatsapp-central'

export const maxDuration = 30

type ContactEntry = {
    id: string
    type: string
    date: string
    notes?: string | null
    by?: string | null
}

type LeadShape = {
    id: string
    nome: string
    telefone: string | null
    interesse_principal: string | null
    handoff_humano: boolean | null
    handoff_at: string | null
    optout_whatsapp: boolean | null
    contact_history: ContactEntry[] | null
    contact_count: number | null
    tags_whatsapp: string[] | null
    stage: string | null
    status: string | null
    notes: string | null
}

function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

function ok(payload: unknown) {
    return NextResponse.json(payload)
}

function silent(reason: string) {
    return ok({ silent: true, reason })
}

async function fetchTemplateBody(supabase: ReturnType<typeof getSupabase>, slug: string): Promise<string | null> {
    const { data } = await supabase
        .from('whatsapp_templates')
        .select('id, body, usage_count')
        .eq('slug', slug)
        .eq('archived', false)
        .single()
    if (!data) return null
    void supabase
        .from('whatsapp_templates')
        .update({ usage_count: (data.usage_count ?? 0) + 1 })
        .eq('id', data.id)
        .then(() => {})
    return data.body
}

async function findLeadByPhone(
    supabase: ReturnType<typeof getSupabase>,
    phone: string
): Promise<LeadShape | null> {
    const variants = phoneVariants(phone)
    if (variants.length === 0) return null
    const { data } = await supabase
        .from('crm_leads')
        .select('id, nome, telefone, interesse_principal, handoff_humano, handoff_at, optout_whatsapp, contact_history, contact_count, tags_whatsapp, stage, status, notes')
        .in('telefone', variants)
        .order('created_at', { ascending: false })
        .limit(1)
    return (data?.[0] as LeadShape) ?? null
}

async function createLeadFromInbound(
    supabase: ReturnType<typeof getSupabase>,
    phone: string,
    name: string
): Promise<LeadShape | null> {
    const { data: maxPos } = await supabase
        .from('crm_leads')
        .select('position')
        .order('position', { ascending: false })
        .limit(1)
    const position = (maxPos?.[0]?.position ?? 0) + 1000

    const { data: lead, error } = await supabase
        .from('crm_leads')
        .insert({
            nome: name || phone,
            telefone: phone,
            origem: 'whatsapp-central',
            stage: 'novo',
            status: 'Lead',
            source: 'whatsapp',
            medium: 'inbound',
            campaign: 'central-whatsapp',
            position,
            last_whatsapp_at: new Date().toISOString(),
        })
        .select('id, nome, telefone, interesse_principal, handoff_humano, handoff_at, optout_whatsapp, contact_history, contact_count, tags_whatsapp, stage, status, notes')
        .single()

    if (error) {
        console.error('[Inbound] Erro ao criar lead:', error)
        return null
    }
    return lead as LeadShape
}

async function logMessage(
    supabase: ReturnType<typeof getSupabase>,
    args: {
        phone: string
        name: string
        body: string
        direction: 'inbound' | 'outbound'
        lead_id?: string | null
        origin: string
        bot_step?: string | null
    }
) {
    void supabase.from('whatsapp_messages').insert({
        phone: args.phone,
        name: args.name,
        status: args.direction === 'inbound' ? 'received' : 'sent',
        body: args.body,
        direction: args.direction,
        origin: args.origin,
        lead_id: args.lead_id ?? null,
        bot_step: args.bot_step ?? null,
    }).then(({ error }) => {
        if (error) console.warn('[Inbound] Erro ao logar mensagem:', error.message)
    })
}

async function appendContactHistory(
    supabase: ReturnType<typeof getSupabase>,
    lead: LeadShape,
    entry: { type: string; notes: string; by?: string | null }
) {
    const history: ContactEntry[] = Array.isArray(lead.contact_history) ? [...lead.contact_history] : []
    history.unshift({
        id: crypto.randomUUID(),
        type: entry.type,
        date: new Date().toISOString(),
        notes: entry.notes,
        by: entry.by ?? 'bot',
    })
    await supabase
        .from('crm_leads')
        .update({
            contact_history: history,
            contact_count: history.length,
            ultimo_contato: new Date().toISOString(),
            last_whatsapp_at: new Date().toISOString(),
        })
        .eq('id', lead.id)
}

async function applyOptOut(
    supabase: ReturnType<typeof getSupabase>,
    phone: string,
    lead: LeadShape | null
) {
    void supabase.from('whatsapp_optouts').upsert({
        phone,
        lead_id: lead?.id ?? null,
        reason: 'user_request',
    }, { onConflict: 'phone' })
    if (lead) {
        await supabase
            .from('crm_leads')
            .update({
                optout_whatsapp: true,
                optout_at: new Date().toISOString(),
                handoff_humano: true,
                handoff_at: new Date().toISOString(),
            })
            .eq('id', lead.id)
    }
}

async function applyHandoff(
    supabase: ReturnType<typeof getSupabase>,
    lead: LeadShape
) {
    await supabase
        .from('crm_leads')
        .update({
            handoff_humano: true,
            handoff_at: new Date().toISOString(),
        })
        .eq('id', lead.id)
}

async function applyInteresse(
    supabase: ReturnType<typeof getSupabase>,
    lead: LeadShape,
    interesse: Interesse
) {
    const tags = new Set(lead.tags_whatsapp ?? [])
    tags.add(`whatsapp:${interesse}`)
    const interesseLabel = INTERESSES.find(i => i.id === interesse)?.label || interesse

    const update: Record<string, unknown> = {
        interesse_principal: interesse,
        interesse: interesseLabel,
        tags_whatsapp: [...tags],
        last_whatsapp_at: new Date().toISOString(),
    }
    // Promove o lead pra "Qualificado" se ainda estava em "Lead" e ele já se identificou.
    if ((lead.status ?? '') === 'Lead') {
        update.status = 'Qualificado'
    }
    await supabase.from('crm_leads').update(update).eq('id', lead.id)
}

export async function POST(req: NextRequest) {
    const SECRET = process.env.WHATSAPP_GROUP_TASK_SECRET || ''
    const auth = req.headers.get('x-webhook-secret')
    if (!SECRET || auth !== SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: { phone: string; name?: string; body: string; message_id?: string }
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const phone = normalizePhone(body.phone)
    const text = (body.body || '').trim()
    const senderName = body.name?.trim() || ''
    if (!phone || !text) {
        return NextResponse.json({ error: 'phone e body são obrigatórios' }, { status: 400 })
    }

    const supabase = getSupabase()
    let lead = await findLeadByPhone(supabase, phone)

    // Lead novo (não veio de LP/sheets antes) → cria com origem whatsapp-central
    if (!lead) {
        lead = await createLeadFromInbound(supabase, phone, senderName)
    }

    // Sempre registra a inbound — mesmo quando vamos ficar em silêncio
    void logMessage(supabase, {
        phone,
        name: senderName || lead?.nome || phone,
        body: text,
        direction: 'inbound',
        lead_id: lead?.id ?? null,
        origin: 'central-inbound',
    })

    if (lead) {
        await supabase
            .from('crm_leads')
            .update({ last_whatsapp_at: new Date().toISOString() })
            .eq('id', lead.id)
    }

    const classification: Classification = classifyMessage(text)

    // ── Opt-out ──────────────────────────────────────────────
    if (classification.kind === 'optout') {
        await applyOptOut(supabase, phone, lead)
        const tplBody = await fetchTemplateBody(supabase, 'optout-confirmacao')
        const reply = renderTemplate(tplBody ?? 'Tudo certo, você foi removido(a) da nossa lista.', {
            nome: firstName(lead?.nome) || senderName || '',
        })
        if (lead) {
            void logMessage(supabase, {
                phone, name: lead.nome, body: reply, direction: 'outbound',
                lead_id: lead.id, origin: 'central-bot', bot_step: 'optout',
            })
            await appendContactHistory(supabase, lead, {
                type: 'whatsapp', notes: 'Lead solicitou opt-out via WhatsApp', by: 'bot',
            })
        }
        return ok({ reply, bot_step: 'optout' })
    }

    // ── Re-subscribe ─────────────────────────────────────────
    if (classification.kind === 'resubscribe' && lead) {
        await supabase
            .from('crm_leads')
            .update({ optout_whatsapp: false, optout_at: null })
            .eq('id', lead.id)
        void supabase.from('whatsapp_optouts').delete().eq('phone', phone)
        const reply = `Que ótimo, ${firstName(lead.nome)}! Você voltou a receber nossas comunicações. ✅\n\nSe quiser, me diz seu interesse principal:\n1️⃣ Touros 2️⃣ Matrizes 3️⃣ Embriões 4️⃣ Sêmen\n5️⃣ Leilões 6️⃣ Vender genética 7️⃣ Falar com consultor`
        void logMessage(supabase, {
            phone, name: lead.nome, body: reply, direction: 'outbound',
            lead_id: lead.id, origin: 'central-bot', bot_step: 'resubscribe',
        })
        return ok({ reply, bot_step: 'resubscribe' })
    }

    // ── Lead em opt-out: silêncio total ──────────────────────
    if (lead?.optout_whatsapp) {
        return silent('lead_optout')
    }

    // ── Lead em handoff humano: silêncio (humano cuida) ──────
    if (lead?.handoff_humano) {
        return silent('lead_handoff')
    }

    // ── Pedido explícito de humano ────────────────────────────
    if (classification.kind === 'human' && lead) {
        await applyHandoff(supabase, lead)
        const tplBody = await fetchTemplateBody(supabase, 'consultor-handoff')
        const reply = renderTemplate(tplBody ?? 'Vou te encaminhar pra um consultor agora.', {
            nome: firstName(lead.nome) || senderName,
        })
        void logMessage(supabase, {
            phone, name: lead.nome, body: reply, direction: 'outbound',
            lead_id: lead.id, origin: 'central-bot', bot_step: 'handoff',
        })
        await appendContactHistory(supabase, lead, {
            type: 'whatsapp', notes: 'Lead pediu falar com consultor (handoff)', by: 'bot',
        })
        return ok({ reply, bot_step: 'handoff' })
    }

    // ── Interesse identificado ────────────────────────────────
    if (classification.kind === 'interest' && lead) {
        await applyInteresse(supabase, lead, classification.interesse)
        const interesseDef = INTERESSES.find(i => i.id === classification.interesse)
        const slug = interesseDef?.triagem_template_slug
        const tplBody = slug ? await fetchTemplateBody(supabase, slug) : null
        const reply = renderTemplate(
            tplBody ?? `Anotado! Vou repassar para o time comercial.`,
            { nome: firstName(lead.nome) || senderName }
        )
        void logMessage(supabase, {
            phone, name: lead.nome, body: reply, direction: 'outbound',
            lead_id: lead.id, origin: 'central-bot', bot_step: `triagem-${classification.interesse}`,
        })
        await appendContactHistory(supabase, lead, {
            type: 'whatsapp',
            notes: `Interesse identificado: ${interesseDef?.label || classification.interesse}`,
            by: 'bot',
        })
        return ok({ reply, bot_step: `triagem-${classification.interesse}` })
    }

    // ── Não classificou: registra mas fica em silêncio para não fazer
    //    spam; o atendente humano cuida pela inbox.
    if (lead && !lead.interesse_principal) {
        // Lead inbound novo SEM interesse identificado → manda welcome com menu uma única vez
        const alreadySentMenu = (lead.tags_whatsapp ?? []).includes('whatsapp:menu_enviado')
        if (!alreadySentMenu) {
            const tplBody = await fetchTemplateBody(supabase, 'welcome-default')
            const reply = renderTemplate(tplBody ?? '', { nome: firstName(lead.nome) || senderName })
            const tags = new Set(lead.tags_whatsapp ?? [])
            tags.add('whatsapp:menu_enviado')
            await supabase
                .from('crm_leads')
                .update({ tags_whatsapp: [...tags] })
                .eq('id', lead.id)
            void logMessage(supabase, {
                phone, name: lead.nome, body: reply, direction: 'outbound',
                lead_id: lead.id, origin: 'central-bot', bot_step: 'welcome',
            })
            return ok({ reply, bot_step: 'welcome' })
        }
    }

    return silent('unknown_intent')
}
