/**
 * /api/whatsapp/central/flow
 *
 *   GET    → devolve o grafo persistido (ou o default se nunca foi salvo)
 *   PUT    → upserta o grafo (valida antes; rejeita se houver erros graves)
 *   DELETE → reseta para o default
 *
 * Storage: site_settings (key='whatsapp_flow_v2'), value = FlowGraphV2 JSON.
 * Não notifica o VPS — o /api/whatsapp/inbound carrega o grafo a cada inbound.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/auth-helpers'
import {
    buildDefaultGraph,
    validateGraph,
    type FlowGraphV2,
} from '@/lib/whatsapp-flow-engine'

const KEY = 'whatsapp_flow_v2'

function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

async function loadGraph(): Promise<FlowGraphV2> {
    const supabase = getSupabase()
    const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', KEY)
        .single()
    const stored = data?.value as FlowGraphV2 | undefined
    if (stored && stored.version === 2 && Array.isArray(stored.nodes) && Array.isArray(stored.edges)) {
        return stored
    }
    return buildDefaultGraph()
}

export async function GET() {
    const auth = await requireAdmin()
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const graph = await loadGraph()
    const validation = validateGraph(graph)
    return NextResponse.json({ graph, validation })
}

export async function PUT(req: NextRequest) {
    const auth = await requireAdmin()
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

    let body: FlowGraphV2
    try { body = await req.json() } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    if (body.version !== 2 || !Array.isArray(body.nodes) || !Array.isArray(body.edges) || !body.startId) {
        return NextResponse.json({ error: 'Formato de grafo inválido' }, { status: 400 })
    }

    const validation = validateGraph(body)
    if (!validation.valid) {
        return NextResponse.json({ error: 'Grafo inválido', validation }, { status: 422 })
    }

    const toStore: FlowGraphV2 = {
        version: 2,
        startId: body.startId,
        nodes: body.nodes,
        edges: body.edges,
        updatedAt: new Date().toISOString(),
        updatedBy: auth.userId,
    }

    const supabase = getSupabase()
    const { error } = await supabase.from('site_settings').upsert({
        key: KEY,
        value: toStore,
        description: 'Grafo do fluxo de atendimento da Central WhatsApp (FlowGraphV2)',
        updated_at: new Date().toISOString(),
    }, { onConflict: 'key' })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, graph: toStore, validation })
}

export async function DELETE() {
    const auth = await requireAdmin()
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const def = buildDefaultGraph()
    const supabase = getSupabase()
    const { error } = await supabase.from('site_settings').upsert({
        key: KEY,
        value: { ...def, updatedAt: new Date().toISOString(), updatedBy: auth.userId },
        description: 'Grafo do fluxo de atendimento da Central WhatsApp (reset)',
        updated_at: new Date().toISOString(),
    }, { onConflict: 'key' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, graph: def })
}
