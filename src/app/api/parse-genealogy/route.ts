/**
 * POST /api/parse-genealogy
 * Body: { productId: number, debug?: boolean }
 *
 * Fluxo:
 *  1. Busca o produto no DB para obter a URL do PDF
 *  2. Faz download do PDF e extrai o texto bruto via pdf-parse
 *  3. Faz o parse da seção GENEALOGIA
 *  4. Salva o JSON resultante em products.genealogia_json
 *  5. Retorna o JSON + metadados
 *
 * Requer sessão admin ativa (validada via Supabase server client).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { extractGenealogyFromPdfUrl, GenealogyData } from '@/lib/genealogy-parser';

// Garante runtime Node.js (pdf-parse usa módulos nativos)
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        // ---- Auth: apenas admin ----
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
        }

        // ---- Parse body ----
        const body = await request.json();
        const { productId, debug = false } = body as { productId: number; debug?: boolean };

        if (!productId || typeof productId !== 'number') {
            return NextResponse.json({ error: 'productId inválido.' }, { status: 400 });
        }

        // ---- Busca produto ----
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('id, name, details, genealogia_json')
            .eq('id', productId)
            .single();

        if (productError || !product) {
            return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
        }

        const pdfUrl: string | undefined = product.details?.pdf;
        if (!pdfUrl) {
            return NextResponse.json({
                error: 'Nenhum PDF cadastrado neste lote. Faça o upload da ficha técnica primeiro.',
            }, { status: 422 });
        }

        // ---- Extrai genealogia do PDF ----
        const { data: genealogia, rawText, section } = await extractGenealogyFromPdfUrl(pdfUrl);

        const ancestralCount = Object.keys(genealogia).length;

        // ---- Salva no banco ----
        const { error: updateError } = await supabase
            .from('products')
            .update({ genealogia_json: genealogia })
            .eq('id', productId);

        if (updateError) {
            console.error('Erro ao salvar genealogia_json:', updateError);
            return NextResponse.json({ error: 'Erro ao salvar no banco de dados.' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            productId,
            ancestralCount,
            genealogia,
            ...(debug ? { rawText, section } : {}),
        });

    } catch (err: any) {
        console.error('parse-genealogy error:', err);
        return NextResponse.json({
            error: err?.message ?? 'Erro interno ao processar PDF.',
        }, { status: 500 });
    }
}
