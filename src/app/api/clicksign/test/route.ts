import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { pingConnection } from '@/lib/clicksign';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/clicksign/test — verifica se o token e a conta estão OK. */
export async function GET() {
    const auth = await requireAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const tokenSet = !!process.env.CLICKSIGN_ACCESS_TOKEN;
    if (!tokenSet) {
        return NextResponse.json({
            ok: false,
            stage: 'env',
            error: 'CLICKSIGN_ACCESS_TOKEN não configurado no ambiente.',
        }, { status: 500 });
    }

    const result = await pingConnection();
    if (result.ok) {
        return NextResponse.json({
            ok: true,
            tokenSet: true,
            apiUrl: process.env.CLICKSIGN_API_URL || 'https://app.clicksign.com/api/v1',
            sample: result.sample,
        });
    }

    // Mensagens humanizadas para os erros mais comuns
    let hint: string | undefined;
    if (/E-mail do usu/i.test(result.error)) {
        hint = 'Acesse o painel do ClickSign → Configurações → API → preencha o email do usuário da API. O token sozinho não basta: a ClickSign exige esse email associado ao token para liberar as chamadas.';
    } else if (/401/.test(result.error)) {
        hint = 'Token inválido ou expirado. Gere um novo em Configurações → API.';
    } else if (/403/.test(result.error)) {
        hint = 'Acesso negado. Confirme que o token pertence à conta correta e que a API está habilitada no plano.';
    }

    return NextResponse.json({
        ok: false,
        tokenSet: true,
        apiUrl: process.env.CLICKSIGN_API_URL || 'https://app.clicksign.com/api/v1',
        error: result.error,
        hint,
    }, { status: 502 });
}
