import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { cancelDocument, ClickSignError } from '@/lib/clicksign';

export const runtime = 'nodejs';

function getAdminClient() {
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

/** POST /api/clicksign/cancel/[contractId] — cancela um documento em andamento. */
export async function POST(_req: NextRequest, ctx: { params: Promise<{ contractId: string }> }) {
    const auth = await requireAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { contractId } = await ctx.params;
    const admin = getAdminClient();

    const { data: contract, error: cErr } = await admin
        .from('tactical_contracts')
        .select('*')
        .eq('id', contractId)
        .single();
    if (cErr || !contract) return NextResponse.json({ error: 'Contrato não encontrado.' }, { status: 404 });
    if (!contract.clicksign_document_key) {
        return NextResponse.json({ error: 'Contrato não tem documento ClickSign vinculado.' }, { status: 400 });
    }

    try {
        const doc = await cancelDocument(contract.clicksign_document_key);
        const { error: uErr } = await admin
            .from('tactical_contracts')
            .update({
                clicksign_status: doc.status,
                status: 'Cancelado',
                clicksign_finished_at: new Date().toISOString(),
            })
            .eq('id', contractId);
        if (uErr) return NextResponse.json({ error: uErr.message }, { status: 500 });
        return NextResponse.json({ ok: true, status: doc.status });
    } catch (e: unknown) {
        if (e instanceof ClickSignError) {
            return NextResponse.json({ error: e.message, body: e.body }, { status: e.status || 500 });
        }
        const msg = e instanceof Error ? e.message : 'Erro inesperado.';
        console.error('[clicksign/cancel]', e);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
