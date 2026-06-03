// One-off: pré-cria as abas das doadoras (com cabeçalho) na planilha de funis.
// Idempotente — se a aba já existe, não recria. Usa a mesma credencial do app.
import 'dotenv/config';
import { config } from 'dotenv';
config({ path: '.env.local' });
import { google } from 'googleapis';

const SPREADSHEET_ID = '1quOwhQEqT4kthdxPTZ0aHH9XRNhfquuJrBOcS6-QgZk';
const TABS = ['GARTA MAT.', 'JATY MAT.', 'EAON 6735'];
const HEADER = [
  'Data/Hora', 'Código', 'Nome', 'WhatsApp', 'E-mail', 'CPF/CNPJ',
  'Fazenda', 'Cidade', 'UF', 'Quantidade', 'Valor unit. (R$)', 'Total (R$)',
  'Pagamento', 'Doadora', 'RGD', 'Cruzamento', 'Observações',
  'UTM Source', 'UTM Medium', 'UTM Campaign', 'UTM Content', 'Landing URL',
];

const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID, fields: 'sheets.properties.title' });
const existing = new Set((meta.data.sheets ?? []).map((s) => s.properties?.title));
console.log('Abas existentes:', [...existing].join(' | '));

for (const tab of TABS) {
  if (existing.has(tab)) { console.log(`= ${tab} (já existe, pulando)`); continue; }
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: { requests: [{ addSheet: { properties: { title: tab } } }] },
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${tab.replace(/'/g, "''")}'!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: [HEADER] },
  });
  console.log(`+ ${tab} criada com cabeçalho`);
}
console.log('Pronto.');
