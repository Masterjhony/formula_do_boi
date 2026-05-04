import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import {
    sendDocumentForSignature,
    fileUrlToBase64DataUri,
    ClickSignError,
    ClickSignSignerInput,
} from '@/lib/clicksign';

export const runtime = 'nodejs';

function getAdminClient() {
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

/**
 * POST /api/clicksign/send
 * body: {
 *   contractId: string,
 *   signers: ClickSignSignerInput[],
 *   deadlineAt?: string,
 *   message?: string,
 *   sequenceEnabled?: boolean
 * }
 *
 * Lê o contrato em tactical_contracts, baixa o arquivo (file_url),
 * sobe pro ClickSign, cria signatários e dispara as notificações.
 * Persiste clicksign_document_key, status e signers no contrato.
 */
export async function POST(req: NextRequest) {
    const auth = await requireAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    let body: any;
    try { body = await req.json(); } catch { return NextResponse.json({ error: 'Body inválido.' }, { status: 400 }); }

    const contractId = String(body?.contractId || '').trim();
    const signers: ClickSignSignerInput[] = Array.isArray(body?.signers) ? body.signers : [];
    if (!contractId) return NextResponse.json({ error: 'contractId obrigatório.' }, { status: 400 });
    if (!signers.length) return NextResponse.json({ error: 'Pelo menos um signatário.' }, { status: 400 });

    for (const s of signers) {
        if (!s.name || !s.email) {
            return NextResponse.json({ error: 'Cada signatário precisa de nome e email.' }, { status: 400 });
        }
    }

    const admin = getAdminClient();
    const { data: contract, error: cErr } = await admin
        .from('tactical_contracts')
        .select('*')
        .eq('id', contractId)
        .single();
    if (cErr || !contract) {
        return NextResponse.json({ error: 'Contrato não encontrado.' }, { status: 404 });
    }
    if (contract.clicksign_document_key) {
        return NextResponse.json({
            error: 'Contrato já enviado ao ClickSign. Cancele o anterior antes de reenviar.',
        }, { status: 409 });
    }
    if (!contract.file_url) {
        return NextResponse.json({ error: 'Contrato sem arquivo PDF/DOC anexado.' }, { status: 400 });
    }

    try {
        const contentBase64 = await fileUrlToBase64DataUri(contract.file_url);
        const filename = (contract.file_name || `contrato-${contractId}.pdf`).replace(/[^\w.\- ]+/g, '_');
        const path = `/Formula do Boi/${filename}`;

        const result = await sendDocumentForSignature({
            path,
            contentBase64,
            signers,
            deadlineAt: body?.deadlineAt,
            message: body?.message,
            sequenceEnabled: !!body?.sequenceEnabled,
        });

        const signersJson = result.signers.map(s => ({
            key: s.key,
            name: s.name,
            email: s.email,
            request_signature_key: s.request_signature_key,
            signed_at: null,
        }));

        const { error: uErr } = await admin
            .from('tactical_contracts')
            .update({
                clicksign_document_key: result.document.key,
                clicksign_status: result.document.status,
                clicksign_url: `https://app.clicksign.com/documents/${result.document.key}`,
                clicksign_signers: signersJson,
                clicksign_sent_at: new Date().toISOString(),
                status: 'Pendente',
            })
            .eq('id', contractId);
        if (uErr) {
            console.error('[clicksign/send] update fail:', uErr);
            return NextResponse.json({
                warning: 'Documento criado no ClickSign, mas falha ao atualizar contrato local.',
                document_key: result.document.key,
                error: uErr.message,
            }, { status: 207 });
        }

        return NextResponse.json({
            ok: true,
            document_key: result.document.key,
            status: result.document.status,
            signers: signersJson,
            url: `https://app.clicksign.com/documents/${result.document.key}`,
        });
    } catch (e: unknown) {
        if (e instanceof ClickSignError) {
            return NextResponse.json({ error: e.message, body: e.body }, { status: e.status || 500 });
        }
        const msg = e instanceof Error ? e.message : 'Erro inesperado.';
        console.error('[clicksign/send]', e);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
