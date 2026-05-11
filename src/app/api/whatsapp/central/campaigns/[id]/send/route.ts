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
import { getR2DownloadUrl } from '@/lib/r2'

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
    let captionTemplate: string | null = null
    let mediaPayload: { url: string; type: string; mime?: string | null; filename?: string | null } | null = null
    let pollPayload: { question: string; options: string[]; selectable_count: number } | null = null
    if (campaign.template_id) {
        const { data: tpl } = await supabase
            .from('whatsapp_templates')
            .select('slug, body, media_url, media_type, media_mime, media_filename, media_caption, poll_question, poll_options, poll_selectable_count')
            .eq('id', campaign.template_id)
            .single()
        if (tpl?.body) bodyTemplate = tpl.body
        templateSlug = tpl?.slug ?? null
        captionTemplate = tpl?.media_caption ?? null

        if (tpl?.media_url && tpl?.media_type) {
            try {
                // Presigned válido por 30 min — tempo suficiente pro VPS escoar a fila
                const url = await getR2DownloadUrl(tpl.media_url, { expiresInSeconds: 1800 })
                mediaPayload = {
                    url,
                    type: tpl.media_type,
                    mime: tpl.media_mime,
                    filename: tpl.media_filename,
                }
            } catch (e) {
                console.warn('[campaigns/send] presign mídia falhou:', e instanceof Error ? e.message : e)
            }
        }
        if (tpl?.poll_question && Array.isArray(tpl.poll_options) && tpl.poll_options.length >= 2) {
            pollPayload = {
                question: tpl.poll_question,
                options: tpl.poll_options as string[],
                selectable_count: tpl.poll_selectable_count ?? 1,
            }
        }
    }
    // Aceita campanha sem texto se houver mídia ou enquete
    if (!bodyTemplate.trim() && !mediaPayload && !pollPayload) {
        return NextResponse.json({ error: 'Campanha sem mensagem, mídia ou enquete' }, { status: 400 })
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

    // Renderiza mensagem + caption por destinatário (cada um com seu {nome}).
    // Mídia e enquete são iguais para todos os recipients da campanha.
    const renderedRecipients = (insertedRecipients ?? []).map(r => {
        const vars = {
            nome: firstName(r.name) || 'amigo(a)',
            name: r.name || '',
        }
        return {
            recipient_id: r.id,
            phone: r.phone,
            message: bodyTemplate ? renderTemplate(bodyTemplate, vars) : '',
            // caption por destinatário só quando o template definiu uma legenda
            // dedicada para a mídia; senão o VPS usa `message` como caption.
            caption: captionTemplate ? renderTemplate(captionTemplate, vars) : null,
        }
    })

    try {
        await fetch(`${WHATSAPP_SERVER_URL}/campaign-send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                campaign_id: id,
                recipients: renderedRecipients,
                media: mediaPayload,
                poll: pollPayload,
            }),
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
        has_media: !!mediaPayload,
        has_poll: !!pollPayload,
    })
}
