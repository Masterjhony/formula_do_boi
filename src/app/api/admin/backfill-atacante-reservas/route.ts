import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';
import {
    AtacanteLead,
    buildAtacanteReservationInsert,
    reservationExistsForPhone,
} from '@/lib/atacante-reservation';

export const runtime = 'nodejs';

const SPREADSHEET_ID = '1quOwhQEqT4kthdxPTZ0aHH9XRNhfquuJrBOcS6-QgZk';
const SHEET_NAME = 'Atacante-Matinha';
const DIGITS_ONLY = /\D/g;

// Layout da aba (A..X conforme `/api/lead-atacante`):
// A Data/Hora · B Nome · C WhatsApp · D Email · E Cidade · F Fazenda ·
// G Origem · H PO · I Quantidade animais · J Foco · K Doses · L Investimento ·
// M Tipo · N Estação · O Mensagem · P..X UTM/attribution
const COL = {
    timestamp: 0,
    nome: 1,
    whatsapp: 2,
    email: 3,
    cidade: 4,
    fazenda: 5,
    origem: 6,
    po: 7,
    qtd: 8,
    foco: 9,
    doses: 10,
    invest: 11,
    tipo: 12,
    estacao: 13,
    mensagem: 14,
    utm_source: 15,
    utm_medium: 16,
    utm_campaign: 17,
    utm_content: 18,
    utm_term: 19,
    gclid: 20,
    fbclid: 21,
    referrer: 22,
    landing_url: 23,
} as const;

// "17/05/2026, 15:53:21" (toLocaleString pt-BR) → ISO em UTC.
// São Paulo é UTC-3 fixo desde 2019 (sem horário de verão).
function parseBrazilianTimestamp(raw: string): string | null {
    if (!raw) return null;
    const m = String(raw).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})[,\s]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
    if (!m) return null;
    const [, dd, mm, yyyy, hh, mi, ss] = m;
    const utc = Date.UTC(
        Number(yyyy),
        Number(mm) - 1,
        Number(dd),
        Number(hh) + 3,
        Number(mi),
        Number(ss || '0'),
    );
    if (!Number.isFinite(utc)) return null;
    return new Date(utc).toISOString();
}

/**
 * POST /api/admin/backfill-atacante-reservas
 *
 * Relê a aba `Atacante-Matinha` da planilha e cria cards em `/reservas`
 * para qualquer linha que ainda não tenha reserva (match por telefone +
 * origin='site-atacante'). Idempotente — pode rodar quantas vezes precisar.
 *
 * Auth: header `x-admin-secret` igual ao `SUPABASE_SERVICE_ROLE_KEY`.
 *
 * Query params:
 *   ?dryRun=1 → não escreve, só retorna o que faria.
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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
        return NextResponse.json({ error: 'NEXT_PUBLIC_SUPABASE_URL ausente' }, { status: 500 });
    }

    try {
        const credentials = JSON.parse(serviceAccountJson);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });
        const sheets = google.sheets({ version: 'v4', auth });

        const { data } = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A2:X`,
        });
        const rows = data.values || [];

        const supabase = createClient(supabaseUrl, expected);

        // Buscamos o `position` mínimo uma vez e decrementamos localmente
        // pra manter os cards ordenados por linha (mais recente no topo).
        const { data: minPosRows } = await supabase
            .from('product_reservations')
            .select('position')
            .eq('status', 'nova')
            .order('position', { ascending: true })
            .limit(1);
        let nextPosition = (minPosRows?.[0]?.position ?? 1000) - 1000;

        const results: Array<{
            row: number;
            phone: string;
            nome: string;
            status: 'inserted' | 'skipped_existing' | 'skipped_invalid' | 'failed' | 'would_insert';
            error?: string;
            id?: string;
            seq?: number;
        }> = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i] || [];
            const nome = String(row[COL.nome] || '').trim();
            const whatsapp = String(row[COL.whatsapp] || '').trim();
            const phoneDigits = whatsapp.replace(DIGITS_ONLY, '');

            if (!nome || !phoneDigits) {
                results.push({
                    row: i + 2,
                    phone: phoneDigits,
                    nome,
                    status: 'skipped_invalid',
                });
                continue;
            }

            const exists = await reservationExistsForPhone(supabase, phoneDigits);
            if (exists) {
                results.push({
                    row: i + 2,
                    phone: phoneDigits,
                    nome,
                    status: 'skipped_existing',
                });
                continue;
            }

            const lead: AtacanteLead = {
                nome,
                whatsapp,
                email: row[COL.email] || null,
                cidade: row[COL.cidade] || null,
                fazenda: row[COL.fazenda] || null,
                po: row[COL.po] || null,
                qtd: row[COL.qtd] || null,
                doses: row[COL.doses] || null,
                tipo: row[COL.tipo] || null,
                estacao: row[COL.estacao] || null,
                utm_source: row[COL.utm_source] || null,
                utm_medium: row[COL.utm_medium] || null,
                utm_campaign: row[COL.utm_campaign] || null,
                utm_content: row[COL.utm_content] || null,
                utm_term: row[COL.utm_term] || null,
                gclid: row[COL.gclid] || null,
                fbclid: row[COL.fbclid] || null,
                referrer: row[COL.referrer] || null,
                landing_url: row[COL.landing_url] || null,
                created_at: parseBrazilianTimestamp(String(row[COL.timestamp] || '')),
            };

            if (dryRun) {
                results.push({
                    row: i + 2,
                    phone: phoneDigits,
                    nome,
                    status: 'would_insert',
                });
                nextPosition -= 1000;
                continue;
            }

            const payload = buildAtacanteReservationInsert(lead, { position: nextPosition });
            const { data: inserted, error } = await supabase
                .from('product_reservations')
                .insert(payload)
                .select('id, seq')
                .single();

            if (error || !inserted) {
                results.push({
                    row: i + 2,
                    phone: phoneDigits,
                    nome,
                    status: 'failed',
                    error: error?.message || 'unknown',
                });
            } else {
                results.push({
                    row: i + 2,
                    phone: phoneDigits,
                    nome,
                    status: 'inserted',
                    id: inserted.id,
                    seq: inserted.seq,
                });
                nextPosition -= 1000;
            }
        }

        const summary = {
            totalRows: rows.length,
            inserted: results.filter((r) => r.status === 'inserted').length,
            skipped_existing: results.filter((r) => r.status === 'skipped_existing').length,
            skipped_invalid: results.filter((r) => r.status === 'skipped_invalid').length,
            failed: results.filter((r) => r.status === 'failed').length,
            would_insert: results.filter((r) => r.status === 'would_insert').length,
        };

        return NextResponse.json({ ok: true, dryRun, summary, results });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[backfill-atacante-reservas] error:', err);
        return NextResponse.json({ error: msg || 'erro' }, { status: 500 });
    }
}
