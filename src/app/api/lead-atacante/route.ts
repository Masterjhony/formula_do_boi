import { NextResponse } from 'next/server';
import { google, sheets_v4 } from 'googleapis';

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

function colLetter(n: number): string {
    let s = '';
    let x = n;
    while (x > 0) {
        const r = (x - 1) % 26;
        s = String.fromCharCode(65 + r) + s;
        x = Math.floor((x - 1) / 26);
    }
    return s;
}

async function ensureSheetExists(sheets: sheets_v4.Sheets) {
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const exists = meta.data.sheets?.some(
        (s) => s.properties?.title === SHEET_NAME,
    );

    if (!exists) {
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                requests: [{ addSheet: { properties: { title: SHEET_NAME } } }],
            },
        });
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A1`,
            valueInputOption: 'RAW',
            requestBody: { values: [HEADER_ROW] },
        });
        return;
    }

    const lastCol = colLetter(HEADER_ROW.length);
    const headerRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:${lastCol}1`,
    });
    const current = headerRes.data.values?.[0] ?? [];
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

        await ensureSheetExists(sheets);

        const dataHora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        const lastCol = colLetter(HEADER_ROW.length);

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:${lastCol}`,
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
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error('[lead-atacante] Erro ao salvar no Sheets:', msg, error);
        return NextResponse.json({ error: 'Erro interno', detail: msg }, { status: 500 });
    }
}
