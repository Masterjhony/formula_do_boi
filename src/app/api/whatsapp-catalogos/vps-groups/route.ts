/**
 * Proxy do GET /groups da sessão Baileys de catálogos.
 *
 * Retorna todos os grupos visíveis para o número logado (id + subject).
 * Útil pra UI: o admin escaneia o QR e depois pega o JID certo daqui em vez
 * de digitar à mão.
 */

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

export async function GET() {
    const gate = await requireAdmin()
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status })

    // Lê env a cada request — ver explicação no /status/route.ts.
    const VPS_URL = process.env.WHATSAPP_CATALOGS_SERVER_URL || 'http://localhost:3002'

    try {
        const r = await fetch(`${VPS_URL}/groups`, {
            cache: 'no-store',
            signal: AbortSignal.timeout(7000),
        })
        if (!r.ok) {
            return NextResponse.json({ groups: [], error: `vps ${r.status}` })
        }
        return NextResponse.json(await r.json())
    } catch (e) {
        return NextResponse.json({
            groups: [],
            error: e instanceof Error ? e.message : 'fetch failed',
        })
    }
}
