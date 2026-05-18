// One-shot: lê a aba `Atacante-Matinha` da planilha Backup leads e
// cria os cards correspondentes em `product_reservations`. Idempotente
// (não duplica se já existir reserva pro mesmo telefone com origin
// 'site-atacante').
//
// Uso:  npx tsx scripts/backfill-atacante-reservas.ts [--dry-run]
//
// Lê NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY e
// GOOGLE_SERVICE_ACCOUNT_JSON do .env.local automaticamente via dotenv.

import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';
import {
    AtacanteLead,
    buildAtacanteReservationInsert,
    reservationExistsForPhone,
} from '../src/lib/atacante-reservation';

function loadDotenv(file: string) {
    const p = path.resolve(process.cwd(), file);
    if (!fs.existsSync(p)) return;
    const raw = fs.readFileSync(p, 'utf-8');
    for (const line of raw.split(/\r?\n/)) {
        const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
        if (!m) continue;
        const [, key, valRaw] = m;
        if (process.env[key]) continue;
        let val = valRaw;
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
        }
        process.env[key] = val;
    }
}

loadDotenv('.env.local');
loadDotenv('.env');

const SPREADSHEET_ID = '1quOwhQEqT4kthdxPTZ0aHH9XRNhfquuJrBOcS6-QgZk';
const SHEET_NAME = 'Atacante-Matinha';
const DIGITS_ONLY = /\D/g;

const COL = {
    timestamp: 0, nome: 1, whatsapp: 2, email: 3, cidade: 4, fazenda: 5,
    origem: 6, po: 7, qtd: 8, foco: 9, doses: 10, invest: 11, tipo: 12,
    estacao: 13, mensagem: 14, utm_source: 15, utm_medium: 16,
    utm_campaign: 17, utm_content: 18, utm_term: 19, gclid: 20, fbclid: 21,
    referrer: 22, landing_url: 23,
};

function parseBrazilianTimestamp(raw: string): string | null {
    if (!raw) return null;
    const m = String(raw).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})[,\s]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
    if (!m) return null;
    const [, dd, mm, yyyy, hh, mi, ss] = m;
    const utc = Date.UTC(
        Number(yyyy), Number(mm) - 1, Number(dd),
        Number(hh) + 3, Number(mi), Number(ss || '0'),
    );
    if (!Number.isFinite(utc)) return null;
    return new Date(utc).toISOString();
}

function parseRowFilter(): Set<number> | null {
    const arg = process.argv.find((a) => a.startsWith('--rows='));
    if (!arg) return null;
    const list = arg.slice('--rows='.length)
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => Number.isInteger(n) && n > 1);
    return list.length ? new Set(list) : null;
}

async function main() {
    const dryRun = process.argv.includes('--dry-run');
    const rowFilter = parseRowFilter();
    if (rowFilter) console.log(`Filtrando para as linhas: ${[...rowFilter].join(', ')}`);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!supabaseUrl || !serviceKey) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ausentes');
    }
    if (!serviceAccountJson) {
        throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON ausente');
    }

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
    console.log(`Linhas encontradas na planilha: ${rows.length}`);

    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: minPosRows } = await supabase
        .from('product_reservations')
        .select('position')
        .eq('status', 'nova')
        .order('position', { ascending: true })
        .limit(1);
    let nextPosition = (minPosRows?.[0]?.position ?? 1000) - 1000;

    let inserted = 0;
    let skippedExisting = 0;
    let skippedInvalid = 0;
    let failed = 0;
    let wouldInsert = 0;

    for (let i = 0; i < rows.length; i++) {
        const sheetRow = i + 2;
        if (rowFilter && !rowFilter.has(sheetRow)) continue;
        const row = rows[i] || [];
        const nome = String(row[COL.nome] || '').trim();
        const whatsapp = String(row[COL.whatsapp] || '').trim();
        const phoneDigits = whatsapp.replace(DIGITS_ONLY, '');

        if (!nome || !phoneDigits) {
            skippedInvalid++;
            console.log(`  linha ${i + 2}: invalid (nome="${nome}", phone="${phoneDigits}")`);
            continue;
        }

        const exists = await reservationExistsForPhone(supabase, phoneDigits);
        if (exists) {
            skippedExisting++;
            console.log(`  linha ${i + 2}: já existe — ${nome} (${phoneDigits})`);
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
            wouldInsert++;
            console.log(`  linha ${i + 2}: WOULD INSERT — ${nome} (${phoneDigits}) doses=${lead.doses}`);
            nextPosition -= 1000;
            continue;
        }

        const payload = buildAtacanteReservationInsert(lead, { position: nextPosition });
        const { data: ins, error } = await supabase
            .from('product_reservations')
            .insert(payload)
            .select('id, seq')
            .single();

        if (error || !ins) {
            failed++;
            console.error(`  linha ${i + 2}: FALHA — ${error?.message || 'desconhecida'}`);
        } else {
            inserted++;
            console.log(`  linha ${i + 2}: OK — RSV-${String(ins.seq).padStart(4, '0')} ${nome}`);
            nextPosition -= 1000;
        }
    }

    console.log('\n--- Resumo ---');
    console.log({ totalRows: rows.length, inserted, skippedExisting, skippedInvalid, failed, wouldInsert, dryRun });
}

main().catch((err) => {
    console.error('Erro fatal:', err);
    process.exit(1);
});
