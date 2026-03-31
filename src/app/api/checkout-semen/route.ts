import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const SPREADSHEET_ID = '1quOwhQEqT4kthdxPTZ0aHH9XRNhfquuJrBOcS6-QgZk';
const SHEET_NAME = 'Checkout-Semen';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { nome, fazenda, cpf, animais, cidade, doses, parcelamento } = body;

        if (!nome || !fazenda || !cpf || !animais || !cidade || !doses || !parcelamento) {
            return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
        }

        const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
        if (!serviceAccountJson) {
            return NextResponse.json({ error: 'Credenciais não configuradas' }, { status: 500 });
        }

        const credentials = JSON.parse(serviceAccountJson);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        const dataHora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

        const parcelamentoLabel: Record<string, string> = {
            'avista': 'À Vista',
            '8x-boleto': '8x no Boleto',
            '12x-cartao': '12x no Cartão',
        };

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:H`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[
                    nome,
                    fazenda,
                    cpf,
                    animais,
                    cidade,
                    doses,
                    parcelamentoLabel[parcelamento] ?? parcelamento,
                    dataHora,
                ]],
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erro ao salvar no Sheets:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
