import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

const SPREADSHEET_ID = '1quOwhQEqT4kthdxPTZ0aHH9XRNhfquuJrBOcS6-QgZk';
const SHEET_NAME = 'Pag-zap';

// Cabeçalho oficial após backfill — colunas L..R recebem UTMs.
const HEADER_ROW = [
    'Data/Hora', 'Nome', 'Email', 'Telefone', 'Quantidade Cabeças',
    '', 'Momento Pecuária', '', '', 'UF', 'Cidade',
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
    'gclid/fbclid', 'referrer',
];

// Defaults aplicados onde a linha não tem UTM — equivalentes aos defaults do POST /api/lp/lead.
const DEFAULT_SOURCE   = 'formuladoboi.com';
const DEFAULT_MEDIUM   = 'organic';
const DEFAULT_CAMPAIGN = '(historical-no-utm)';

/**
 * POST /api/admin/backfill-utm-sheet
 *
 * Lê a aba `Pag-zap` da planilha, garante o cabeçalho UTM nas colunas L..R,
 * e preenche todas as linhas existentes que estejam sem essas colunas com
 * defaults indicando "tráfego histórico sem UTM". Os dados verdadeiros de
 * campanha não podem ser recuperados — quem tinha UTM real era o navegador
 * do visitante, e essa info não foi capturada à época.
 *
 * Auth: requer header `x-admin-secret` igual a SUPABASE_SERVICE_ROLE_KEY
 * (mesma chave já presente no servidor — não vaza um segredo novo).
 *
 * Query params:
 *   ?dryRun=1  → apenas mostra o que seria escrito, sem alterar a planilha.
 */
export async function POST(request: NextRequest) {
    const adminSecret = request.headers.get('x-admin-secret');
    const expected = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!expected || adminSecret !== expected) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const dryRun = request.nextUrl.searchParams.get('dryRun') === '1';

    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
        return NextResponse.json({ error: 'GOOGLE_SERVICE_ACCOUNT_JSON ausente' }, { status: 500 });
    }

    try {
        const credentials = JSON.parse(serviceAccountJson);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        const sheets = google.sheets({ version: 'v4', auth });

        // 1. Lê a aba inteira (A:R cobre o novo layout)
        const { data } = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A1:R`,
        });
        const rows = data.values || [];
        if (rows.length === 0) {
            return NextResponse.json({ message: 'Planilha vazia, nada a fazer.' });
        }

        const updates: Array<{ range: string; values: string[][] }> = [];

        // 2. Garante cabeçalho na linha 1
        const currentHeader = rows[0] || [];
        const needsHeader = HEADER_ROW.some((cell, i) => (currentHeader[i] || '') !== cell);
        if (needsHeader) {
            updates.push({
                range: `${SHEET_NAME}!A1:R1`,
                values: [HEADER_ROW],
            });
        }

        // 3. Para cada linha de dados (a partir da 2), preenche L..R se vazio
        let backfilled = 0;
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i] || [];
            const utmSource   = row[11] || '';
            const utmMedium   = row[12] || '';
            const utmCampaign = row[13] || '';
            // Considera linha "sem UTM" quando as 3 principais estão em branco
            if (!utmSource && !utmMedium && !utmCampaign) {
                // Preserva colunas O..R se já tiverem algo (improvável, mas seguro)
                const filled = [
                    DEFAULT_SOURCE,
                    DEFAULT_MEDIUM,
                    DEFAULT_CAMPAIGN,
                    row[14] || '',
                    row[15] || '',
                    row[16] || '',
                    row[17] || '',
                ];
                updates.push({
                    range: `${SHEET_NAME}!L${i + 1}:R${i + 1}`,
                    values: [filled],
                });
                backfilled++;
            }
        }

        if (dryRun) {
            return NextResponse.json({
                dryRun: true,
                totalRows: rows.length - 1,
                wouldBackfill: backfilled,
                wouldSetHeader: needsHeader,
                sampleUpdates: updates.slice(0, 3),
            });
        }

        if (updates.length > 0) {
            await sheets.spreadsheets.values.batchUpdate({
                spreadsheetId: SPREADSHEET_ID,
                requestBody: {
                    valueInputOption: 'USER_ENTERED',
                    data: updates,
                },
            });
        }

        // 4. Espelha o backfill no Supabase (crm_leads landing-page sem source)
        let supabaseUpdated = 0;
        try {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );
            const { count } = await supabase
                .from('crm_leads')
                .update({
                    source:   DEFAULT_SOURCE,
                    medium:   DEFAULT_MEDIUM,
                    campaign: DEFAULT_CAMPAIGN,
                }, { count: 'exact' })
                .eq('origem', 'landing-page')
                .or('source.is.null,medium.is.null,campaign.is.null');
            supabaseUpdated = count || 0;
        } catch (e) {
            console.warn('Falha ao espelhar backfill no Supabase:', e);
        }

        return NextResponse.json({
            ok: true,
            sheetRowsBackfilled: backfilled,
            headerUpdated: needsHeader,
            supabaseRowsBackfilled: supabaseUpdated,
        });
    } catch (err: any) {
        console.error('backfill-utm-sheet error:', err);
        return NextResponse.json({ error: err.message || 'erro' }, { status: 500 });
    }
}
