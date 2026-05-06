/**
 * /api/whatsapp/central/templates
 *   GET    → lista templates ativos (incluindo arquivados se ?include_archived=1)
 *   POST   → cria novo template
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/auth-helpers'

export async function GET(req: NextRequest) {
    const auth = await requireAdmin()
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const url = new URL(req.url)
    const includeArchived = url.searchParams.get('include_archived') === '1'

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let q = supabase
        .from('whatsapp_templates')
        .select('id, slug, title, category, body, variables, archived, usage_count, updated_at')
        .order('category', { ascending: true })
        .order('title', { ascending: true })

    if (!includeArchived) q = q.eq('archived', false)

    const { data, error } = await q
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ templates: data ?? [] })
}

export async function POST(req: NextRequest) {
    const auth = await requireAdmin()
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

    let body: { slug?: string; title: string; category?: string; body: string; variables?: string[] }
    try { body = await req.json() } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }
    if (!body.title?.trim() || !body.body?.trim()) {
        return NextResponse.json({ error: 'title e body são obrigatórios' }, { status: 400 })
    }

    const slug = (body.slug || body.title)
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 64)

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
        .from('whatsapp_templates')
        .insert({
            slug,
            title: body.title.trim(),
            category: body.category?.trim() || 'geral',
            body: body.body,
            variables: body.variables ?? [],
            created_by: auth.userId,
        })
        .select('id, slug')
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, ...data })
}
