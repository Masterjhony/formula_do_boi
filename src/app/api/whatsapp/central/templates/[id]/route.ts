/**
 * /api/whatsapp/central/templates/[id]
 *   PUT    → atualiza template
 *   DELETE → arquiva (soft delete) — preserva histórico de uso
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/auth-helpers'

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireAdmin()
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { id } = await params

    let body: { title?: string; category?: string; body?: string; variables?: string[]; archived?: boolean }
    try { body = await req.json() } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const update: Record<string, unknown> = {}
    if (typeof body.title === 'string') update.title = body.title.trim()
    if (typeof body.category === 'string') update.category = body.category.trim()
    if (typeof body.body === 'string') update.body = body.body
    if (Array.isArray(body.variables)) update.variables = body.variables
    if (typeof body.archived === 'boolean') update.archived = body.archived

    const { error } = await supabase.from('whatsapp_templates').update(update).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
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

    const { error } = await supabase
        .from('whatsapp_templates')
        .update({ archived: true })
        .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
}
