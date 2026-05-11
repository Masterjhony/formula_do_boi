/**
 * /api/whatsapp/central/campaigns/[id]
 *   GET    → detalhes da campanha + amostra de destinatários (até 50)
 *   DELETE → permite remover apenas campanhas em rascunho
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/auth-helpers'

export async function GET(
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

    const [campRes, recipRes] = await Promise.all([
        supabase
            .from('whatsapp_campaigns')
            .select('id, name, description, segment, template_id, body, status, total_recipients, sent_count, failed_count, optout_skip_count, started_at, finished_at, created_at, media_url, media_type, media_mime, media_filename, media_caption')
            .eq('id', id)
            .single(),
        supabase
            .from('whatsapp_campaign_recipients')
            .select('id, phone, name, status, error_msg, sent_at, created_at')
            .eq('campaign_id', id)
            .order('created_at', { ascending: false })
            .limit(100),
    ])

    if (campRes.error) return NextResponse.json({ error: campRes.error.message }, { status: 404 })
    return NextResponse.json({
        campaign: campRes.data,
        recipients: recipRes.data ?? [],
    })
}

export async function DELETE(
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

    const { data: c } = await supabase
        .from('whatsapp_campaigns')
        .select('status')
        .eq('id', id)
        .single()
    if (!c) return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 })
    if (c.status !== 'rascunho') {
        return NextResponse.json({ error: 'Apenas campanhas em rascunho podem ser deletadas.' }, { status: 409 })
    }

    const { error } = await supabase.from('whatsapp_campaigns').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
}
