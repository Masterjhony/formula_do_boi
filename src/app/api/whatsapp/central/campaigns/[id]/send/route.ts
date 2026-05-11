/**
 * /api/whatsapp/central/campaigns/[id]/send
 * Resolve o público a partir do segment, materializa em
 * whatsapp_campaign_recipients, e POSTa pra fila do VPS em /campaign-send.
 *
 * Idempotente: se a campanha já foi disparada (status != rascunho), retorna 409.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/auth-helpers'
import { resolveSegment, type SegmentFilters } from '@/lib/whatsapp-segment'
import { firstName, renderTemplate } from '@/lib/whatsapp-central'
import { ensureAudienceTagForTemplate } from '@/lib/whatsapp-audience-tags'

const WHATSAPP_SERVER_URL = process.env.WHATSAPP_SERVER_URL || 'http://localhost:3001'

export async function POST(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireAdmin()
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { id } = await params

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: campaign, error: cErr } = await supabase
        .from('whatsapp_campaigns')
        .select('id, name, segment, template_id, body, status')
        .eq('id', id)
        .single()
    if (cErr || !campaign) {
        return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 })
    }
    if (campaign.status !== 'rascunho') {
        return NextResponse.json({ error: `Campanha está em "${campaign.status}", não pode ser disparada novamente.` }, { status: 409 })
    }

    let bodyTemplate = campaign.body ?? ''
    let templateSlug: string | null = null
    if (campaign.template_id) {
        const { data: tpl } = await supabase
            .from('whatsapp_templates')
            .select('slug, body')
            .eq('id', campaign.template_id)
            .single()
        if (tpl?.body) bodyTemplate = tpl.body
        templateSlug = tpl?.slug ?? null
    }
    if (!bodyTemplate.trim()) {
        return NextResponse.json({ error: 'Campanha sem corpo de mensagem' }, { status: 400 })
    }

    const segment = (campaign.segment ?? {}) as SegmentFilters
    let recipients: Array<{ id: string; nome: string; telefone: string }> = []
    try {
        recipients = await resolveSegment(supabase, segment)
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Erro ao resolver segmento' }, { status: 500 })
    }

    if (recipients.length === 0) {
        await supabase
            .from('whatsapp_campaigns')
            .update({
                status: 'concluida',
                total_recipients: 0,
                started_at: new Date().toISOString(),
                finished_at: new Date().toISOString(),
            })
            .eq('id', id)
        return NextResponse.json({ success: true, queued: 0, message: 'Segmento sem leads — campanha marcada como concluída.' })
    }

    // Materializa recipients
    const rows = recipients.map(r => ({
        campaign_id: id,
        lead_id: r.id,
        phone: r.telefone,
        name: r.nome,
        status: 'pendente',
    }))
    const { data: insertedRecipients, error: rErr } = await supabase
        .from('whatsapp_campaign_recipients')
        .insert(rows)
        .select('id, phone, name')
    if (rErr) {
        return NextResponse.json({ error: rErr.message }, { status: 500 })
    }

    // Audiência: se o template iniciador tem tag mapeada, garante que TODOS
    // os recipients carreguem a tag antes de qualquer resposta deles chegar.
    // Isso evita que o engine classifique o "1..6" da Academia com o
    // mapeamento default. Falhas aqui não bloqueiam o envio (logamos só).
    let audienceTagged: { tag: string | null; updated: number } = { tag: null, updated: 0 }
    try {
        audienceTagged = await ensureAudienceTagForTemplate(
            supabase,
            recipients.map(r => r.id),
            templateSlug,
        )
    } catch (e) {
        console.warn('[campaigns/send] ensureAudienceTagForTemplate falhou:', e instanceof Error ? e.message : e)
    }

    // Atualiza campanha → enviando
    await supabase
        .from('whatsapp_campaigns')
        .update({
            status: 'enviando',
            total_recipients: recipients.length,
            started_at: new Date().toISOString(),
        })
        .eq('id', id)

    // Renderiza mensagem por destinatário e envia ao VPS
    const renderedRecipients = (insertedRecipients ?? []).map(r => ({
        recipient_id: r.id,
        phone: r.phone,
        message: renderTemplate(bodyTemplate, {
            nome: firstName(r.name) || 'amigo(a)',
            name: r.name || '',
        }),
    }))

    try {
        await fetch(`${WHATSAPP_SERVER_URL}/campaign-send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaign_id: id, recipients: renderedRecipients }),
            signal: AbortSignal.timeout(30000),
        })
    } catch (e: unknown) {
        await supabase
            .from('whatsapp_campaigns')
            .update({ status: 'erro' })
            .eq('id', id)
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Falha ao enviar para o VPS' }, { status: 502 })
    }

    return NextResponse.json({
        success: true,
        queued: renderedRecipients.length,
        audience_tag: audienceTagged.tag,
        audience_tagged: audienceTagged.updated,
    })
}
