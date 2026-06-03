/**
 * One-shot: cria a aba "Volante" na planilha "Backup leads"
 * (mesma do /atacante) e copia o cabeçalho A1:X1 da aba
 * "Atacante-Matinha" — para onde o /api/lead-volante faz append
 * dos pedidos de quem preenche o checkout /volante.
 *
 * Idempotente: se a aba já existir, só garante o cabeçalho.
 *
 * Rodar: node --env-file=.env.local scripts/create-volante-sheet-tab.mjs
 */
import { google } from 'googleapis';

const SPREADSHEET_ID = '1quOwhQEqT4kthdxPTZ0aHH9XRNhfquuJrBOcS6-QgZk';
const SOURCE_SHEET = 'Atacante-Matinha';
const NEW_SHEET = 'Volante';

if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    console.error('Falta GOOGLE_SERVICE_ACCOUNT_JSON no ambiente (.env.local).');
    process.exit(1);
}

const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

// 1) lê o cabeçalho da aba de referência
const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SOURCE_SHEET}!A1:X1`,
});
const header = headerRes.data.values?.[0] ?? [];
console.log(`[ref] cabeçalho de "${SOURCE_SHEET}" (${header.length} colunas):`);
console.log('     ', JSON.stringify(header));

if (header.length === 0) {
    console.error('[abort] aba de referência sem cabeçalho — inspecione manualmente.');
    process.exit(1);
}

// 2) confere se a aba "Volante" já existe
const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
const existing = meta.data.sheets?.find((s) => s.properties?.title === NEW_SHEET);

if (existing) {
    console.log(`[skip] aba "${NEW_SHEET}" já existe (sheetId ${existing.properties.sheetId}).`);
} else {
    await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
            requests: [
                {
                    addSheet: {
                        properties: {
                            title: NEW_SHEET,
                            gridProperties: { rowCount: 1000, columnCount: 24 },
                        },
                    },
                },
            ],
        },
    });
    console.log(`[ok] aba "${NEW_SHEET}" criada.`);
}

// 3) grava (ou regrava) o cabeçalho idêntico ao do /atacante
await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${NEW_SHEET}!A1:X1`,
    valueInputOption: 'RAW',
    requestBody: { values: [header] },
});
console.log(`[ok] cabeçalho gravado em "${NEW_SHEET}!A1:X1".`);

// 4) confere
const check = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${NEW_SHEET}!A1:X1`,
});
console.log('[after]', JSON.stringify(check.data.values?.[0] ?? []));
console.log('[done] aba "Volante" pronta para receber os pedidos do checkout.');
