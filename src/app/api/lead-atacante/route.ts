import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';
import {
    getNextTopPosition,
    insertAtacanteReservation,
} from '@/lib/atacante-reservation';

export const runtime = 'nodejs';

const SPREADSHEET_ID = '1quOwhQEqT4kthdxPTZ0aHH9XRNhfquuJrBOcS6-QgZk';
const SHEET_NAME = 'Atacante-Matinha';
const SHEET_RANGE = `${SHEET_NAME}!A:X`;

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

        const dataHora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: SHEET_RANGE,
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

        // Cria o card de pré-reserva no Kanban /reservas (best-effort —
        // não bloqueia a resposta nem o fluxo do WhatsApp em caso de falha).
        try {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
            if (supabaseUrl && serviceKey) {
                const supabase = createClient(supabaseUrl, serviceKey);
                const position = await getNextTopPosition(supabase);
                await insertAtacanteReservation(
                    supabase,
                    {
                        nome,
                        whatsapp,
                        email,
                        cidade,
                        fazenda,
                        po,
                        qtd,
                        doses,
                        tipo,
                        estacao,
                        utm_source,
                        utm_medium,
                        utm_campaign,
                        utm_content,
                        utm_term,
                        gclid,
                        fbclid,
                        referrer,
                        landing_url,
                    },
                    { position },
                );
            }
        } catch (err) {
            console.error('[lead-atacante] Falha ao criar card em /reservas:', err);
        }

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
