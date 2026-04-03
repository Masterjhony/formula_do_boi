import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const WHATSAPP_SERVER_URL = process.env.WHATSAPP_SERVER_URL || 'http://localhost:3001';
const SPREADSHEET_ID = '1quOwhQEqT4kthdxPTZ0aHH9XRNhfquuJrBOcS6-QgZk';
const SHEET_NAME = 'Pag-zap';

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createClient(url, serviceKey);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { nome, email, tel, perfil, animais, investimento, interesse, assessoria } = body;

        if (!nome || !email || !tel) {
            return NextResponse.json({ error: 'Campos obrigatórios: nome, email, tel' }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();

        const { data: maxPosData } = await supabase
            .from('crm_leads')
            .select('position')
            .order('position', { ascending: false })
            .limit(1);

        const position = (maxPosData?.[0]?.position || 0) + 1000;

        const notesLines: string[] = [];
        if (perfil) notesLines.push(`Perfil: ${perfil === 'experienced' ? 'Criador experiente' : 'Iniciante'}`);
        if (animais) notesLines.push(`Animais: ${animais}`);
        if (investimento) notesLines.push(`Investimento: ${investimento}`);
        if (assessoria) notesLines.push(`Assessoria: ${assessoria}`);

        const { data: lead, error } = await supabase
            .from('crm_leads')
            .insert({
                nome,
                email,
                telefone: tel.replace(/\D/g, ''),
                origem: 'landing-page',
                stage: 'novo',
                status: 'Lead',
                position,
                notes: notesLines.length > 0 ? notesLines.join('\n') : null,
                interesse: interesse || null,
                quantidade_animais: animais || null,
                source_page: 'lp.formuladoboi.com',
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao inserir lead:', error);
            return NextResponse.json({ error: 'Erro ao salvar lead' }, { status: 500 });
        }

        // Dispara WhatsApp welcome (fire-and-forget)
        const phone = tel.replace(/\D/g, '');
        let whatsappStatus: string = 'no_phone';
        let whatsappReason: string | null = null;
        let whatsappError: string | null = null;

        if (phone) {
            try {
                const waRes = await fetch(`${WHATSAPP_SERVER_URL}/send`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone, name: nome }),
                    signal: AbortSignal.timeout(15000),
                });
                const waBody = await waRes.json().catch(() => ({}));
                if (waRes.ok && (waBody.sent || waBody.queued)) {
                    whatsappStatus = 'sent';
                } else {
                    whatsappStatus = 'failed';
                    whatsappReason = waBody.reason ?? null;
                    whatsappError = waBody.error ?? `HTTP ${waRes.status}`;
                }
            } catch (waErr: any) {
                whatsappStatus = 'failed';
                whatsappError = waErr.message;
                console.warn('WhatsApp send falhou (não-crítico):', waErr);
            }
        }

        void Promise.resolve(
            supabase.from('whatsapp_messages').insert({
                phone: phone || null,
                name: nome,
                status: whatsappStatus,
                reason: whatsappReason,
                error_msg: whatsappError,
                lead_id: lead.id,
            })
        ).catch(console.error);

        // Salva na aba Pag-zap do Google Sheets (fire-and-forget)
        void (async () => {
            try {
                const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
                if (!serviceAccountJson) return;

                const credentials = JSON.parse(serviceAccountJson);
                const auth = new google.auth.GoogleAuth({
                    credentials,
                    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                });
                const sheets = google.sheets({ version: 'v4', auth });

                const dataHora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

                await sheets.spreadsheets.values.append({
                    spreadsheetId: SPREADSHEET_ID,
                    range: `${SHEET_NAME}!A:F`,
                    valueInputOption: 'USER_ENTERED',
                    requestBody: {
                        values: [[
                            dataHora,
                            nome,
                            email,
                            tel,
                            animais || '',
                            investimento || '',
                        ]],
                    },
                });
            } catch (sheetErr) {
                console.warn('Google Sheets append falhou (não-crítico):', sheetErr);
            }
        })();

        return NextResponse.json({ success: true, id: lead.id });
    } catch (err) {
        console.error('Erro no endpoint /api/lp/lead:', err);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
