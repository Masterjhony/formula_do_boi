import { NextResponse } from 'next/server';

const ASAAS_API_URL = process.env.ASAAS_SANDBOX === 'true'
    ? 'https://sandbox.asaas.com/api/v3'
    : 'https://api.asaas.com/api/v3';

const ASAAS_API_KEY = process.env.ASAAS_API_KEY!;

async function asaas(path: string, method: string, body?: object) {
    const res = await fetch(`${ASAAS_API_URL}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'access_token': ASAAS_API_KEY,
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.errors?.[0]?.description ?? `Asaas error ${res.status}`);
    return data;
}

export async function POST(req: Request) {
    try {
        if (!ASAAS_API_KEY) {
            return NextResponse.json({ error: 'ASAAS_API_KEY não configurada' }, { status: 500 });
        }

        const { nome, cpf, email, valor } = await req.json();

        if (!nome || !cpf || !email || !valor) {
            return NextResponse.json({ error: 'Preencha todos os campos' }, { status: 400 });
        }

        // 1. Criar ou buscar cliente
        const cpfClean = cpf.replace(/\D/g, '');
        let customerId: string;

        const search = await asaas(`/customers?cpfCnpj=${cpfClean}`, 'GET');
        if (search.data?.length > 0) {
            customerId = search.data[0].id;
        } else {
            const customer = await asaas('/customers', 'POST', {
                name: nome,
                cpfCnpj: cpfClean,
                email,
            });
            customerId = customer.id;
        }

        // 2. Criar cobrança PIX
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 1);
        const dueDateStr = dueDate.toISOString().split('T')[0];

        const payment = await asaas('/payments', 'POST', {
            customer: customerId,
            billingType: 'PIX',
            value: Number(valor),
            dueDate: dueDateStr,
            description: 'Teste de pagamento PIX — Fórmula do Boi',
        });

        // 3. Buscar QR Code
        const qr = await asaas(`/payments/${payment.id}/pixQrCode`, 'GET');

        return NextResponse.json({
            paymentId: payment.id,
            status: payment.status,
            valor: payment.value,
            qrCodeImage: qr.encodedImage,   // base64 PNG
            pixCopiaECola: qr.payload,       // string copia e cola
            expirationDate: qr.expirationDate,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
