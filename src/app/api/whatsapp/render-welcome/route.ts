/**
 * /api/whatsapp/render-welcome — chamado pelo VPS quando vai disparar o
 * welcome de um lead novo. Permite que o template (slug "welcome-default")
 * vire fonte única de verdade, em vez de duplicar texto no flowConfig.
 *
 * Também respeita opt-out: se o lead já está em opt-out, devolve `silent: true`
 * e o VPS não envia nada.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { firstName, normalizePhone, phoneVariants, renderTemplate } from '@/lib/whatsapp-central'
import { getR2DownloadUrl } from '@/lib/r2'
import { readPauseState } from '@/lib/whatsapp-pause'

export async function POST(req: NextRequest) {
    const SECRET = process.env.WHATSAPP_GROUP_TASK_SECRET || ''
    const auth = req.headers.get('x-webhook-secret')
    if (!SECRET || auth !== SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: { phone: string; name?: string }
    try { body = await req.json() } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const phone = normalizePhone(body.phone)
    const name = body.name?.trim() || ''
    if (!phone) return NextResponse.json({ error: 'phone inválido' }, { status: 400 })

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Pausa global da Central — bloqueia o welcome (mesmo padrão do opt-out).
    const pause = await readPauseState(supabase)
    if (pause.paused) {
        return NextResponse.json({ silent: true, reason: 'paused' })
    }

    // Verifica opt-out por número (cobre casos sem lead vinculado também)
    const variants = phoneVariants(phone)
    const { data: optoutMatch } = await supabase
        .from('whatsapp_optouts')
        .select('phone').in('phone', variants).limit(1)
    if (optoutMatch && optoutMatch.length > 0) {
        return NextResponse.json({ silent: true, reason: 'optout' })
    }
    const { data: leadMatch } = await supabase
        .from('crm_leads')
        .select('optout_whatsapp').in('telefone', variants).limit(1)
    if (leadMatch?.[0]?.optout_whatsapp) {
        return NextResponse.json({ silent: true, reason: 'lead_optout' })
    }

    const { data: tpl } = await supabase
        .from('whatsapp_templates')
        .select('body, media_url, media_type, media_mime, media_filename, media_caption, poll_question, poll_options, poll_selectable_count')
        .eq('slug', 'welcome-default')
        .eq('archived', false)
        .single()

    const tplBody = tpl?.body || `Olá {nome}! 👋\n\nAqui é da Fórmula do Boi.`
    const vars = { nome: firstName(name), name }
    const rendered = renderTemplate(tplBody, vars)

    // Mídia: gera presigned URL curta (10 min) — o VPS baixa via Baileys
    let media: { url: string; type: string; mime?: string | null; filename?: string | null; caption?: string } | null = null
    if (tpl?.media_url && tpl?.media_type) {
        try {
            const url = await getR2DownloadUrl(tpl.media_url, { expiresInSeconds: 600 })
            media = {
                url,
                type: tpl.media_type,
                mime: tpl.media_mime,
                filename: tpl.media_filename,
                caption: tpl.media_caption ? renderTemplate(tpl.media_caption, vars) : undefined,
            }
        } catch (e) {
            console.warn('[render-welcome] presign falhou:', e instanceof Error ? e.message : e)
        }
    }

    let poll: { question: string; options: string[]; selectable_count: number } | null = null
    if (tpl?.poll_question && Array.isArray(tpl.poll_options) && tpl.poll_options.length >= 2) {
        poll = {
            question: renderTemplate(tpl.poll_question, vars),
            options: tpl.poll_options.map((o: string) => renderTemplate(o, vars)),
            selectable_count: tpl.poll_selectable_count ?? 1,
        }
    }

    return NextResponse.json({ body: rendered, media, poll })
}
