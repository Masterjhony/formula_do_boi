/**
 * One-shot: renomeia o cabeçalho da coluna I da aba "Atacante-Matinha"
 * de "Quantidade de animais" para "Quantidade de matrizes".
 *
 * Motivo: o checkout agora coleta especificamente quantidade de matrizes
 * (campo `qtd` no payload, mesma coluna I) — header genérico antigo
 * confundia o time comercial ao ler a planilha.
 *
 * Rodar: `node --env-file=.env.local scripts/_rename_atacante_sheet_header.mjs`
 */
import { google } from 'googleapis';

const SPREADSHEET_ID = '1quOwhQEqT4kthdxPTZ0aHH9XRNhfquuJrBOcS6-QgZk';
const SHEET_NAME = 'Atacante-Matinha';
const TARGET_CELL = `${SHEET_NAME}!I1`;
const OLD_VALUE = 'Quantidade de animais';
const NEW_VALUE = 'Quantidade de matrizes';

const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

// Read current value first — fail loud if it doesn't match expectation.
const current = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: TARGET_CELL,
});
const currentValue = current.data.values?.[0]?.[0] ?? '';
console.log(`[before] ${TARGET_CELL} = ${JSON.stringify(currentValue)}`);

if (currentValue === NEW_VALUE) {
    console.log('[skip] header already says "Quantidade de matrizes" — nothing to do.');
    process.exit(0);
}
if (currentValue !== OLD_VALUE) {
    console.error(`[abort] expected "${OLD_VALUE}" but found "${currentValue}". Refusing to overwrite — inspect manually.`);
    process.exit(1);
}

await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: TARGET_CELL,
    valueInputOption: 'RAW',
    requestBody: { values: [[NEW_VALUE]] },
});

const after = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: TARGET_CELL,
});
console.log(`[after]  ${TARGET_CELL} = ${JSON.stringify(after.data.values?.[0]?.[0])}`);
console.log('[ok] header renamed.');
