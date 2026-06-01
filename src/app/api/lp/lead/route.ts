import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import { dispatchWelcome } from '@/lib/whatsapp';

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

        const {
            nome, email, tel, uf, cidade, momento_pecuaria, quantidade_cabecas,
            interesse,
            utm_source, utm_medium, utm_campaign, utm_content, utm_term,
            gclid, fbclid, referrer, landing_url,
        } = body;

        if (!nome || !email || !tel || !uf || !cidade || !momento_pecuaria || !quantidade_cabecas) {
            return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();

        const { data: maxPosData } = await supabase
            .from('crm_leads')
            .select('position')
            .order('position', { ascending: false })
            .limit(1);

        const position = (maxPosData?.[0]?.position || 0) + 1000;

        // Default attribution quando UTMs ausentes — marca origem como tráfego direto da LP
        // ao invés de deixar NULL, facilitando análise no CRM e no Sheets.
        const attrSource   = utm_source   || (referrer ? 'referral' : 'direct');
        const attrMedium   = utm_medium   || (gclid ? 'cpc' : fbclid ? 'paid_social' : 'organic');
        const attrCampaign = utm_campaign || '(not set)';
        const attrContent  = utm_content  || null;
        const attrTerm     = utm_term     || null;

        // MQL: critério canônico replicado do quiz (`public/lp/index.html`).
        // Mantemos a lista aqui para o servidor não confiar no client.
        const MQL_QCABECAS = new Set(['100-300', '300-500', '500+']);
        const isMql = MQL_QCABECAS.has(quantidade_cabecas);

        const notesLines = [
            `Momento na pecuária: ${momento_pecuaria}`,
            `Quantidade de cabeças: ${quantidade_cabecas}`,
            ...(interesse ? [`Interesse: ${interesse}`] : []),
            `UF: ${uf}`,
            `Cidade: ${cidade}`,
        ];

        const { data: lead, error } = await supabase
            .from('crm_leads')
            .insert({
                nome,
                email,
                // Mantemos `telefone` por compatibilidade com relatórios/queries antigos,
                // mas o componente de Qualificação edita inline em `celular`. Gravar nos
                // dois evita o input "Celular / WhatsApp" aparecer vazio.
                telefone: tel.replace(/\D/g, ''),
                celular:  tel.replace(/\D/g, ''),
                origem: 'landing-page',
                stage: 'novo',
                status: 'Lead',
                position,
                notes: notesLines.join('\n'),
                interesse: interesse || null,
                momento_pecuaria: momento_pecuaria || null,
                quantidade_animais: quantidade_cabecas,
                is_mql: isMql,
                data_entrada: new Date().toISOString(),
                estado: uf,
                cidade,
                source_page: 'formuladoboi.com',
                source:      attrSource,
                medium:      attrMedium,
                campaign:    attrCampaign,
                utm_content: attrContent,
                utm_term:    attrTerm,
                gclid:       gclid || null,
                fbclid:      fbclid || null,
                referrer:    referrer || null,
                landing_url: landing_url || null,
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao inserir lead:', error);
            return NextResponse.json({ error: 'Erro ao salvar lead' }, { status: 500 });
        }

        // Welcome via helper centralizado (dedup 24h, opt-out, log unificado).
        // Após welcome enviado/enfileirado, tenta também adicionar ao grupo da LP.
        // O log em whatsapp_messages é gravado pelo próprio dispatchWelcome.
        const WHATSAPP_GROUP_INVITE = 'https://chat.whatsapp.com/JYxJPWfkoHHLZfosHlywN9?mode=gi_t';
        const phone = tel.replace(/\D/g, '');

        if (phone) {
            const welcomeRes = await dispatchWelcome(phone, nome, 'lp', { lead_id: lead.id });
            if (welcomeRes.sent || welcomeRes.queued) {
                // Tenta adicionar direto ao grupo; se falhar (privacidade), envia o link
                void fetch(`${WHATSAPP_SERVER_URL}/add-to-group`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone }),
                    signal: AbortSignal.timeout(15000),
                }).then(async r => {
                    const data = await r.json().catch(() => ({}));
                    if (!r.ok || !data.added) {
                        return fetch(`${WHATSAPP_SERVER_URL}/send-direct`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                phone,
                                message: `🐂 Entre no grupo exclusivo da *Fórmula do Boi*:\n👉 ${WHATSAPP_GROUP_INVITE}`,
                            }),
                            signal: AbortSignal.timeout(15000),
                        });
                    }
                }).catch(err => console.warn('[LP] Add ao grupo falhou:', err.message));
            }
        }

        // Salva na aba Pag-zap do Google Sheets
        try {
            const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
            if (serviceAccountJson) {
                const credentials = JSON.parse(serviceAccountJson);
                const auth = new google.auth.GoogleAuth({
                    credentials,
                    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                });
                const sheets = google.sheets({ version: 'v4', auth });

                const dataHora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

                // Estendido para A:S — adiciona UTMs/referrer (L..R) e Interesse (S).
                // Interesse vai numa coluna nova no final pra não deslocar nada já
                // mapeado em fórmulas/relatórios. Cabeçalho esperado na linha 1
                // (criar/atualizar manualmente uma vez):
                //   A=Data/Hora B=Nome C=Email D=Telefone E=Cabeças F=(reservado)
                //   G=Momento H=(reservado) I=(reservado) J=UF K=Cidade
                //   L=utm_source M=utm_medium N=utm_campaign O=utm_content P=utm_term
                //   Q=gclid/fbclid R=referrer S=Interesse
                await sheets.spreadsheets.values.append({
                    spreadsheetId: SPREADSHEET_ID,
                    range: `${SHEET_NAME}!A:S`,
                    valueInputOption: 'USER_ENTERED',
                    requestBody: {
                        values: [[
                            dataHora,
                            nome,
                            email,
                            tel,
                            quantidade_cabecas,
                            '',
                            momento_pecuaria,
                            '',
                            '',
                            uf,
                            cidade,
                            attrSource,
                            attrMedium,
                            attrCampaign,
                            attrContent || '',
                            attrTerm || '',
                            gclid || fbclid || '',
                            referrer || '',
                            interesse || '',
                        ]],
                    },
                });
            }
        } catch (sheetErr) {
            console.warn('Google Sheets append falhou:', sheetErr);
        }

        return NextResponse.json({ success: true, id: lead.id });
    } catch (err) {
        console.error('Erro no endpoint /api/lp/lead:', err);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
