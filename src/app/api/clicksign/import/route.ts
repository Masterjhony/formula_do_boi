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
 * POST /api/clicksign/import
 * body: { documentKey: string, clientName?: string, title?: string }
 *
 * Cria um registro local em tactical_contracts a partir de um documento
 * existente no ClickSign. Útil para vincular contratos legados que já
 * foram enviados pela plataforma antes da integração.
 */
export async function POST(req: NextRequest) {
    const auth = await requireAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    let body: any;
    try { body = await req.json(); } catch { return NextResponse.json({ error: 'Body inválido.' }, { status: 400 }); }

    const documentKey = String(body?.documentKey || '').trim();
    if (!documentKey) return NextResponse.json({ error: 'documentKey obrigatório.' }, { status: 400 });

    const admin = getAdminClient();

    // Já importado?
    const { data: existing } = await admin
        .from('tactical_contracts')
        .select('id')
        .eq('clicksign_document_key', documentKey)
        .maybeSingle();
    if (existing) {
        return NextResponse.json({ ok: true, contractId: existing.id, alreadyImported: true });
    }

    try {
        const doc = await getDocument(documentKey);
        const status = doc.status;
        const isClosed = status === 'closed' || status === 'auto_closed';
        const isCancelled = status === 'cancelled' || status === 'canceled';

        const localStatus = isClosed ? 'Ativo' : isCancelled ? 'Cancelado' : 'Pendente';
        const filename = doc.filename || (doc.path ? doc.path.split('/').pop() : null) || 'Contrato ClickSign';
        const clientName = String(body?.clientName || '').trim()
            || (doc.signers?.[0]?.name) || 'Cliente ClickSign';
        const title = String(body?.title || '').trim() || filename || 'Contrato';

        const signersJson = (doc.signers || []).map(s => ({
            key: s.key,
            name: s.name || '',
            email: s.email || '',
            request_signature_key: s.request_signature_key || '',
            signed_at: s.signed_at ?? null,
        }));

        const { data: created, error: iErr } = await admin
            .from('tactical_contracts')
            .insert([{
                client_name: clientName,
                title,
                status: localStatus,
                clicksign_document_key: doc.key,
                clicksign_status: status,
                clicksign_url: `https://app.clicksign.com/documents/${doc.key}`,
                clicksign_signers: signersJson,
                clicksign_signed_url: doc.signed_file_url ?? null,
                clicksign_finished_at: isClosed || isCancelled ? (doc.finished_at || new Date().toISOString()) : null,
                file_name: filename,
            }])
            .select()
            .single();
        if (iErr) return NextResponse.json({ error: iErr.message }, { status: 500 });

        return NextResponse.json({ ok: true, contractId: created.id, status });
    } catch (e: unknown) {
        if (e instanceof ClickSignError) {
            return NextResponse.json({ error: e.message, body: e.body }, { status: e.status || 500 });
        }
        const msg = e instanceof Error ? e.message : 'Erro inesperado.';
        console.error('[clicksign/import]', e);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
