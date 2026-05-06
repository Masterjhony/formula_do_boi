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
        .select('body')
        .eq('slug', 'welcome-default')
        .eq('archived', false)
        .single()

    const tplBody = tpl?.body || `Olá {nome}! 👋\n\nAqui é da Fórmula do Boi.`
    const rendered = renderTemplate(tplBody, { nome: firstName(name), name })

    return NextResponse.json({ body: rendered })
}
