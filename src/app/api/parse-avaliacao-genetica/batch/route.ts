/**
 * POST /api/parse-avaliacao-genetica/batch
 * Extrai avaliacao_genetica_json de todos os produtos que possuem PDF.
 * Body (opcional): { dryRun?: boolean, onlyMissing?: boolean }
 *
 * GET /api/parse-avaliacao-genetica/batch
 * Lista todos os produtos com PDF e indica se já possuem avaliacao_genetica_json.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { extractAvaliacaoFromPdfUrl } from '@/lib/avaliacao-genetica-parser';

function resolvePdfUrl(raw: string, origin: string): string {
    if (raw.startsWith('http')) return raw;
    return `${origin}${raw.startsWith('/') ? '' : '/'}${raw}`;
}

export const runtime = 'nodejs';
export const maxDuration = 60;

function getAdminClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

async function assertAdmin() {
    const supabase = await createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Não autenticado.');
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') throw new Error('Acesso negado.');
}

export async function GET(request: NextRequest) {
    try {
        await assertAdmin();
        const admin = getAdminClient();
        const origin = new URL(request.url).origin;

        const { data: products, error } = await admin
            .from('products')
            .select('id, name, details, avaliacao_genetica_json')
            .eq('active', true)
            .order('id', { ascending: true });

        if (error) throw error;

        const withPdf = (products ?? [])
            .filter((p: any) => !!p.details?.pdf)
            .map((p: any) => ({
                id: p.id,
                name: p.name,
                pdfUrl: resolvePdfUrl(p.details.pdf, origin),
                hasAvaliacao: !!p.avaliacao_genetica_json,
                hasIabcz: p.avaliacao_genetica_json?.iabcz != null,
            }));

        return NextResponse.json({
            total: withPdf.length,
            withAvaliacao: withPdf.filter((p: any) => p.hasAvaliacao).length,
            withoutAvaliacao: withPdf.filter((p: any) => !p.hasAvaliacao).length,
            products: withPdf,
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 401 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await assertAdmin();

        const body = await request.json().catch(() => ({}));
        const dryRun: boolean = body.dryRun ?? false;
        const onlyMissing: boolean = body.onlyMissing ?? true;

        const origin = new URL(request.url).origin;
        const admin = getAdminClient();

        const { data: products, error } = await admin
            .from('products')
            .select('id, name, details, avaliacao_genetica_json')
            .eq('active', true)
            .order('id', { ascending: true });

        if (error) throw error;

        const targets = (products ?? []).filter((p: any) => {
            if (!p.details?.pdf) return false;
            if (onlyMissing && p.avaliacao_genetica_json) return false;
            return true;
        });

        const results: any[] = [];

        for (const product of targets) {
            const result: any = { id: product.id, name: product.name, status: 'ok' };
            try {
                const pdfUrl = resolvePdfUrl(product.details.pdf, origin);
                const { data: avaliacao } = await extractAvaliacaoFromPdfUrl(pdfUrl);
                result.avaliacao = avaliacao;
                result.hasIabcz = avaliacao.iabcz != null;

                if (!dryRun) {
                    const { error: updateErr } = await admin
                        .from('products')
                        .update({ avaliacao_genetica_json: avaliacao })
                        .eq('id', product.id);

                    if (updateErr) throw updateErr;
                }
            } catch (err: any) {
                result.status = 'error';
                result.error = err.message ?? String(err);
            }
            results.push(result);
        }

        return NextResponse.json({
            dryRun,
            processed: results.length,
            ok: results.filter(r => r.status === 'ok').length,
            errors: results.filter(r => r.status === 'error').length,
            results,
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 401 });
    }
}
