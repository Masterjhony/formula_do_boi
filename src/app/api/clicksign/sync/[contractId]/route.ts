import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { getDocument, ClickSignError } from '@/lib/clicksign';

export const runtime = 'nodejs';

function getAdminClient() {
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

/**
 * POST /api/clicksign/sync/[contractId]
 * Busca status atual do documento no ClickSign e atualiza o contrato local.
 */
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
        return NextResponse.json({ error: 'Contrato não foi enviado ao ClickSign ainda.' }, { status: 400 });
    }

    try {
        const doc = await getDocument(contract.clicksign_document_key);

        const localSigners: any[] = Array.isArray(contract.clicksign_signers) ? contract.clicksign_signers : [];
        const updatedSigners = localSigners.map(local => {
            const remote = doc.signers?.find(r => r.key === local.key);
            return remote ? { ...local, signed_at: remote.signed_at ?? local.signed_at ?? null } : local;
        });

        const isClosed = doc.status === 'closed' || doc.status === 'auto_closed';
        const isCancelled = doc.status === 'cancelled' || doc.status === 'canceled';

        const update: Record<string, any> = {
            clicksign_status: doc.status,
            clicksign_signers: updatedSigners,
            clicksign_signed_url: doc.signed_file_url ?? null,
            clicksign_finished_at: isClosed ? (doc.finished_at || new Date().toISOString()) : null,
        };
        if (isClosed && contract.status !== 'Ativo') update.status = 'Ativo';
        if (isCancelled && contract.status !== 'Cancelado') update.status = 'Cancelado';

        const { error: uErr } = await admin.from('tactical_contracts').update(update).eq('id', contractId);
        if (uErr) {
            console.error('[clicksign/sync] update fail:', uErr);
            return NextResponse.json({ error: uErr.message }, { status: 500 });
        }

        return NextResponse.json({
            ok: true,
            status: doc.status,
            signed_url: doc.signed_file_url ?? null,
            signers: updatedSigners,
        });
    } catch (e: unknown) {
        if (e instanceof ClickSignError) {
            return NextResponse.json({ error: e.message, body: e.body }, { status: e.status || 500 });
        }
        const msg = e instanceof Error ? e.message : 'Erro inesperado.';
        console.error('[clicksign/sync]', e);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
