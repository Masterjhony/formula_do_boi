import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { listDocuments, ClickSignError } from '@/lib/clicksign';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/clicksign/documents?status=running&page=1
 * Lista os documentos da conta ClickSign (proxy direto da API).
 */
export async function GET(req: NextRequest) {
    const auth = await requireAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const url = new URL(req.url);
    const status = url.searchParams.get('status') || undefined;
    const pageParam = url.searchParams.get('page');
    const page = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;

    try {
        const r = await listDocuments({ page, status });
        return NextResponse.json({ ok: true, ...r });
    } catch (e: unknown) {
        if (e instanceof ClickSignError) {
            return NextResponse.json({ error: e.message, body: e.body }, { status: e.status || 500 });
        }
        const msg = e instanceof Error ? e.message : 'Erro inesperado.';
        console.error('[clicksign/documents]', e);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
