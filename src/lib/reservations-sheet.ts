import { google } from 'googleapis';

/**
 * Espelha as pré-reservas de EMBRIÃO (doadoras) numa aba por doadora dentro
 * da mesma planilha dos demais funis (Pag-zap / Checkout-Semen / etc.).
 *
 * - A aba é criada sob demanda (com cabeçalho) na 1ª reserva da doadora.
 * - Best-effort: a reserva já foi gravada no banco antes daqui — qualquer
 *   falha no Sheets é logada e engolida, nunca quebra o checkout.
 * - Só embrião. Reservas de sêmen NÃO passam por aqui.
 */

const SPREADSHEET_ID = '1quOwhQEqT4kthdxPTZ0aHH9XRNhfquuJrBOcS6-QgZk';

const HEADER = [
    'Data/Hora', 'Código', 'Nome', 'WhatsApp', 'E-mail', 'CPF/CNPJ',
    'Fazenda', 'Cidade', 'UF', 'Quantidade', 'Valor unit. (R$)', 'Total (R$)',
    'Pagamento', 'Doadora', 'RGD', 'Cruzamento', 'Observações',
    'UTM Source', 'UTM Medium', 'UTM Campaign', 'UTM Content', 'Landing URL',
];

export type ReservationSheetRow = {
    /** Nome da aba (= doadora). Ex.: "GARTA MAT.". */
    tab: string;
    dataHora: string;
    code: string;
    nome: string;
    whatsapp: string;
    email: string;
    doc: string;
    fazenda: string;
    cidade: string;
    uf: string;
    quantidade: number | string;
    unit: number | string;
    total: number | string;
    pagamento: string;
    doadora: string;
    rgd: string;
    cruzamento: string;
    observacoes: string;
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    utm_content: string;
    landing_url: string;
};

/** Nomes de aba do Sheets: até 100 chars, sem : \ / ? * [ ] */
function sanitizeTab(name: string): string {
    const clean = (name || 'Reservas-Embrioes')
        .replace(/[:\\/?*[\]]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 95);
    return clean || 'Reservas-Embrioes';
}

/** Referência A1 com o nome da aba escapado (aspas simples dobradas). */
function tabRange(tab: string, a1: string): string {
    return `'${tab.replace(/'/g, "''")}'!${a1}`;
}

export async function appendReservationToSheet(row: ReservationSheetRow): Promise<void> {
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
        console.warn('[reservations-sheet] GOOGLE_SERVICE_ACCOUNT_JSON ausente — pulando Sheets.');
        return;
    }

    const credentials = JSON.parse(serviceAccountJson);
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const tab = sanitizeTab(row.tab);

    // Garante a aba (cria com cabeçalho se for a 1ª reserva da doadora).
    const meta = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
        fields: 'sheets.properties.title',
    });
    const exists = (meta.data.sheets ?? []).some((s) => s.properties?.title === tab);
    if (!exists) {
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: { requests: [{ addSheet: { properties: { title: tab } } }] },
        });
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: tabRange(tab, 'A1'),
            valueInputOption: 'RAW',
            requestBody: { values: [HEADER] },
        });
    }

    await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: tabRange(tab, 'A:V'),
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
            values: [[
                row.dataHora, row.code, row.nome, row.whatsapp, row.email, row.doc,
                row.fazenda, row.cidade, row.uf, row.quantidade, row.unit, row.total,
                row.pagamento, row.doadora, row.rgd, row.cruzamento, row.observacoes,
                row.utm_source, row.utm_medium, row.utm_campaign, row.utm_content, row.landing_url,
            ]],
        },
    });
}
