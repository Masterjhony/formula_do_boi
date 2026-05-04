import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { verifyWebhookHmac, getDocument } from '@/lib/clicksign';

export const runtime = 'nodejs';

function getAdminClient() {
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

/**
 * POST /api/clicksign/webhook
 * Recebe eventos do ClickSign. Configurar URL no painel:
 *   https://admin.formuladoboi.com/api/clicksign/webhook
 * Eventos relevantes: sign, refusal, cancel, deadline, auto_close, document_closed.
 *
 * Se CLICKSIGN_HMAC_SECRET estiver configurado, o cabeçalho `Content-Hmac` é
 * validado (formato `sha256=<hex>`).
 */
export async function POST(req: NextRequest) {
    const raw = await req.text();
    const ok = await verifyWebhookHmac(raw, req.headers.get('content-hmac'));
    if (!ok) return NextResponse.json({ error: 'HMAC inválido.' }, { status: 401 });

    let payload: any;
    try { payload = JSON.parse(raw); } catch { return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 }); }

    const event: string = payload?.event?.name || payload?.event || '';
    const documentKey: string | undefined =
        payload?.document?.key || payload?.event?.data?.document?.key || payload?.event?.document?.key;

    if (!documentKey) {
        return NextResponse.json({ ok: true, ignored: 'sem document key' });
    }

    const admin = getAdminClient();
    const { data: contract } = await admin
        .from('tactical_contracts')
        .select('id, clicksign_signers, status')
        .eq('clicksign_document_key', documentKey)
        .maybeSingle();

    if (!contract) return NextResponse.json({ ok: true, ignored: 'contrato não encontrado' });

    try {
        const doc = await getDocument(documentKey);
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
            clicksign_finished_at: isClosed || isCancelled ? new Date().toISOString() : null,
        };
        if (isClosed && contract.status !== 'Ativo') update.status = 'Ativo';
        if (isCancelled && contract.status !== 'Cancelado') update.status = 'Cancelado';

        await admin.from('tactical_contracts').update(update).eq('id', contract.id);
        return NextResponse.json({ ok: true, event, status: doc.status });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Erro inesperado.';
        console.error('[clicksign/webhook]', e);
        return NextResponse.json({ ok: false, error: msg }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ ok: true, hint: 'Endpoint do webhook ClickSign. Use POST.' });
}
