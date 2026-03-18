/**
 * POST /api/parse-genealogy/batch
 * Extrai genealogia_json de TODOS os produtos que possuem PDF cadastrado.
 * Útil para popular a coluna após a migration inicial.
 *
 * Body (opcional): { dryRun?: boolean }
 *   dryRun: true → extrai e retorna os dados mas NÃO salva no banco
 *
 * GET /api/parse-genealogy/batch
 * Lista todos os produtos com PDF e indica se já possuem genealogia_json.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { extractGenealogyFromPdfUrl } from '@/lib/genealogy-parser';

export const runtime = 'nodejs';
export const maxDuration = 60; // segundos (Vercel Pro permite até 300)

// Cliente admin com service-role para bypass de RLS nos updates
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

// ── GET: lista produtos com PDF ──────────────────────────────────────────────
export async function GET() {
    try {
        await assertAdmin();
        const admin = getAdminClient();

        const { data: products, error } = await admin
            .from('products')
            .select('id, name, details, genealogia_json')
            .eq('active', true)
            .order('id', { ascending: true });

        if (error) throw error;

        const withPdf = (products ?? [])
            .filter((p: any) => !!p.details?.pdf)
            .map((p: any) => ({
                id: p.id,
                name: p.name,
                pdfUrl: p.details.pdf,
                hasGenealogia: !!p.genealogia_json,
                ancestralCount: p.genealogia_json ? Object.keys(p.genealogia_json).length : 0,
            }));

        return NextResponse.json({
            total: withPdf.length,
            withGenealogia: withPdf.filter((p: any) => p.hasGenealogia).length,
            withoutGenealogia: withPdf.filter((p: any) => !p.hasGenealogia).length,
            products: withPdf,
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 401 });
    }
}

// ── POST: processa todos (ou só os sem genealogia) ───────────────────────────
export async function POST(request: NextRequest) {
    try {
        await assertAdmin();

        const body = await request.json().catch(() => ({}));
        const dryRun: boolean = body.dryRun ?? false;
        const onlyMissing: boolean = body.onlyMissing ?? true; // padrão: apenas quem ainda não tem

        const admin = getAdminClient();

        const { data: products, error } = await admin
            .from('products')
            .select('id, name, details, genealogia_json')
            .eq('active', true)
            .order('id', { ascending: true });

        if (error) throw error;

        const targets = (products ?? []).filter((p: any) => {
            if (!p.details?.pdf) return false;
            if (onlyMissing && p.genealogia_json) return false;
            return true;
        });

        const results: any[] = [];

        for (const product of targets) {
            const result: any = { id: product.id, name: product.name, status: 'ok', ancestralCount: 0 };
            try {
                const { data: genealogia } = await extractGenealogyFromPdfUrl(product.details.pdf);
                result.ancestralCount = Object.keys(genealogia).length;
                result.genealogia = genealogia;

                if (!dryRun) {
                    const { error: updateErr } = await admin
                        .from('products')
                        .update({ genealogia_json: genealogia })
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
