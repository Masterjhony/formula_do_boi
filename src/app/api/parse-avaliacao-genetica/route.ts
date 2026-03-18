/**
 * POST /api/parse-avaliacao-genetica
 * Body: { productId: number, debug?: boolean }
 *
 * 1. Busca o produto no DB para obter a URL do PDF
 * 2. Faz download do PDF e extrai o texto bruto via pdf-parse
 * 3. Faz o parse da seção AVALIAÇÃO GENÉTICA
 * 4. Salva o JSON resultante em products.avaliacao_genetica_json
 * 5. Retorna o JSON + metadados
 *
 * Requer sessão admin ativa.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { extractAvaliacaoFromPdfUrl } from '@/lib/avaliacao-genetica-parser';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
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

        const body = await request.json();
        const { productId, debug = false } = body as { productId: number; debug?: boolean };

        if (!productId || typeof productId !== 'number') {
            return NextResponse.json({ error: 'productId inválido.' }, { status: 400 });
        }

        const { data: product, error: productError } = await supabase
            .from('products')
            .select('id, name, details')
            .eq('id', productId)
            .single();

        if (productError || !product) {
            return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
        }

        const rawPdfPath: string | undefined = product.details?.pdf;
        if (!rawPdfPath) {
            return NextResponse.json({
                error: 'Nenhum PDF cadastrado neste lote.',
            }, { status: 422 });
        }

        const pdfUrl = rawPdfPath.startsWith('http')
            ? rawPdfPath
            : `${new URL(request.url).origin}${rawPdfPath.startsWith('/') ? '' : '/'}${rawPdfPath}`;

        const { data: avaliacao, rawText, section } = await extractAvaliacaoFromPdfUrl(pdfUrl);

        const { error: updateError } = await supabase
            .from('products')
            .update({ avaliacao_genetica_json: avaliacao })
            .eq('id', productId);

        if (updateError) {
            console.error('Erro ao salvar avaliacao_genetica_json:', updateError);
            return NextResponse.json({ error: 'Erro ao salvar no banco de dados.' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            productId,
            avaliacao,
            ...(debug ? { rawText, section } : {}),
        });

    } catch (err: any) {
        console.error('parse-avaliacao-genetica error:', err);
        return NextResponse.json({
            error: err?.message ?? 'Erro interno ao processar PDF.',
        }, { status: 500 });
    }
}
