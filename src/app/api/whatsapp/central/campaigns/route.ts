/**
 * /api/whatsapp/central/campaigns
 *   GET  → lista campanhas com contadores
 *   POST → cria nova campanha em rascunho (não dispara — dispara via /:id/send)
 *
 * O segmento é um JSON com filtros aplicados em crm_leads, ex:
 *   { interesse_principal: 'touros' }      → leads com interesse touros
 *   { tags_whatsapp_includes: 'vip' }      → tag específica
 *   { stage: 'Qualificado' }
 *   { has_phone: true }                    → garante telefone preenchido
 *   { exclude_optout: true }               → padrão; sempre aplicado no preview
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/auth-helpers'

export async function GET() {
    const auth = await requireAdmin()
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
        .from('whatsapp_campaigns')
        .select('id, name, description, segment, template_id, body, status, total_recipients, sent_count, failed_count, optout_skip_count, started_at, finished_at, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(100)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ campaigns: data ?? [] })
}

export async function POST(req: NextRequest) {
    const auth = await requireAdmin()
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

    let body: {
        name: string
        description?: string
        segment?: Record<string, unknown>
        template_id?: string | null
        body?: string | null
    }
    try { body = await req.json() } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    if (!body.name?.trim()) {
        return NextResponse.json({ error: 'name é obrigatório' }, { status: 400 })
    }
    if (!body.template_id && !body.body?.trim()) {
        return NextResponse.json({ error: 'Selecione um template ou escreva o corpo' }, { status: 400 })
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
        .from('whatsapp_campaigns')
        .insert({
            name: body.name.trim(),
            description: body.description?.trim() ?? null,
            segment: body.segment ?? {},
            template_id: body.template_id ?? null,
            body: body.body?.trim() ?? null,
            status: 'rascunho',
            created_by: auth.userId,
        })
        .select('id')
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, id: data.id })
}
