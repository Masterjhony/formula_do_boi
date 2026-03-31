import { NextResponse } from 'next/server';

// Webhook de validação de saque do Asaas
// Necessário para habilitar a geração da chave de API
// Para saques via API: responde com APPROVED automaticamente
export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Evento de validação de saque — aprovamos automaticamente
        if (body?.event === 'TRANSFER.CREATED' || body?.transfer) {
            return NextResponse.json({ approved: true });
        }

        // Outros eventos de pagamento (notificações futuras)
        return NextResponse.json({ received: true });
    } catch {
        return NextResponse.json({ received: true });
    }
}

export async function GET() {
    return NextResponse.json({ status: 'ok', service: 'asaas-webhook' });
}
