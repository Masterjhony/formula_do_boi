import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const SPREADSHEET_ID = '1quOwhQEqT4kthdxPTZ0aHH9XRNhfquuJrBOcS6-QgZk';
const SHEET_NAME = 'Atacante-Matinha';
const HEADER_ROW = [
    'Data/Hora',
    'Nome',
    'WhatsApp',
    'E-mail',
    'Cidade',
    'Fazenda',
    'Origem',
    'Já é criador de Nelore PO?',
    'Quantidade de animais',
    'Foco da operação',
    'Doses pretendidas',
    'Faixa de investimento',
    'Tipo de sêmen',
    'Estação reprodutiva',
    'Mensagem',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    'gclid',
    'fbclid',
    'referrer',
    'landing_url',
];

async function ensureHeaderRow(sheets: ReturnType<typeof google.sheets>) {
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:${String.fromCharCode(64 + HEADER_ROW.length)}1`,
    });
    const current = res.data.values?.[0] ?? [];
    if (current.length === 0) {
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A1`,
            valueInputOption: 'RAW',
            requestBody: { values: [HEADER_ROW] },
        });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            nome,
            whatsapp,
            email,
            cidade,
            fazenda,
            origem,
            po,
            qtd,
            foco,
            doses,
            invest,
            tipo,
            estacao,
            mensagem,
            utm_source,
            utm_medium,
            utm_campaign,
            utm_content,
            utm_term,
            gclid,
            fbclid,
            referrer,
            landing_url,
        } = body ?? {};

        if (!nome || !whatsapp || !email) {
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

        await ensureHeaderRow(sheets);

        const dataHora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:X`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[
                    dataHora,
                    nome ?? '',
                    whatsapp ?? '',
                    email ?? '',
                    cidade ?? '',
                    fazenda ?? '',
                    origem ?? '',
                    po ?? '',
                    qtd ?? '',
                    foco ?? '',
                    doses ?? '',
                    invest ?? '',
                    tipo ?? '',
                    estacao ?? '',
                    mensagem ?? '',
                    utm_source ?? 'site',
                    utm_medium ?? 'organic',
                    utm_campaign ?? 'atacante-matinha',
                    utm_content ?? '',
                    utm_term ?? '',
                    gclid ?? '',
                    fbclid ?? '',
                    referrer ?? '',
                    landing_url ?? '',
                ]],
            },
        });

        if (whatsapp) {
            const whatsappUrl = process.env.WHATSAPP_SERVER_URL || 'http://localhost:3001';
            try {
                await fetch(`${whatsappUrl}/add-to-group`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone: whatsapp }),
                });
            } catch (err) {
                console.error('[lead-atacante] Erro ao adicionar ao grupo WhatsApp:', err);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[lead-atacante] Erro ao salvar no Sheets:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
