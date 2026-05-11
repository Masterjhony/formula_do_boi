import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { dispatchWelcome } from '@/lib/whatsapp';

// Use direct Supabase client (not the SSR one) since this is an API route called by external webhook
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createClient(url, serviceKey);
}

export async function POST(request: NextRequest) {
    try {
        // Validate webhook secret
        const secret = request.headers.get('x-webhook-secret');
        const expectedSecret = process.env.SHEETS_WEBHOOK_SECRET;

        if (!expectedSecret || secret !== expectedSecret) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const leads: any[] = Array.isArray(body) ? body : body.leads ? body.leads : [body];

        if (!leads || leads.length === 0) {
            return NextResponse.json(
                { error: 'No leads provided' },
                { status: 400 }
            );
        }

        const supabase = getSupabaseAdmin();

        // Get the current max position to place new leads at the end
        const { data: maxPosData } = await supabase
            .from('crm_leads')
            .select('position')
            .order('position', { ascending: false })
            .limit(1);

        let currentMaxPosition = maxPosData?.[0]?.position || 0;

        const inserted: any[] = [];
        const errors: any[] = [];

        for (const lead of leads) {
            currentMaxPosition += 1000;

            // Format nome as [Cidade/UF][Nome] like Notion
            const cidade = lead.cidade || '';
            const estado = lead.estado || '';
            const nomeCompleto = lead.nome || lead.nome_completo || '';
            
            let nomeFormatado = nomeCompleto;
            if (cidade || estado) {
                const local = cidade && estado ? `${cidade}/${estado}` : (cidade || estado);
                nomeFormatado = `[${local}][${nomeCompleto}]`;
            }

            // Combine data + hora into data_entrada
            let dataEntrada: string | null = null;
            if (lead.data) {
                try {
                    // Handle Brazilian format DD/MM/YYYY
                    let datePart = lead.data;
                    let timePart = lead.hora ? lead.hora : '00:00';
                    
                    if (datePart.includes('/')) {
                        const parts = datePart.split('/');
                        if (parts.length === 3) {
                            // Extract DD/MM/YYYY -> YYYY-MM-DD
                            const day = parts[0];
                            const month = parts[1];
                            const year = parts[2].substring(0, 4); // Handle potential "YYYY HH:MM" inside 'data'
                            datePart = `${year}-${month}-${day}`;
                        }
                    }
                    
                    const dataStr = `${datePart} ${timePart}`;
                    const parsed = new Date(dataStr);
                    if (!isNaN(parsed.getTime())) {
                        dataEntrada = parsed.toISOString();
                    }
                } catch {
                    // If date parsing fails, skip
                }
            }

            // MQL — mesma regra canônica do quiz (≥100 cabeças).
            // Aceita as faixas em código novo ('100-300', '300-500', '500+')
            // e também as variantes "100 a 300" / "300 a 500" / "500 ou mais"
            // que aparecem na planilha Leads-GP, além de números crus ≥ 100.
            const qtd = String(lead.quantidade_animais ?? '').trim();
            const MQL_FAIXAS = new Set([
                '100-300', '300-500', '500+',
                '100 a 300', '300 a 500', '500 ou mais',
            ]);
            const numericMatch = qtd.match(/^(\d+)\s*$/);
            const isMql = MQL_FAIXAS.has(qtd) || (numericMatch ? Number(numericMatch[1]) >= 100 : false);

            const phone = lead.celular || lead.telefone || null;
            const record = {
                nome: nomeFormatado,
                status: 'Lead',
                // Grava o número nas duas colunas: `telefone` para compat com queries
                // legadas e `celular` para o input "Celular / WhatsApp" da Qualificação
                // poder editar inline (ele lê `celular`).
                telefone: phone,
                celular: phone,
                instagram: lead.instagram || null,
                empresa: lead.nome_fazenda || lead.empresa || null,
                estado: estado || null,
                cidade: cidade || null,
                // momento_pecuaria → coluna estruturada (PERFIL na Pag-zap / "Momento Pecuária" na Leads-GP)
                momento_pecuaria: lead.momento_pecuaria || null,
                // interesse → mantém compatibilidade com payloads antigos que mandavam só `interesse`
                interesse: lead.interesse || lead.momento_pecuaria || null,
                o_que_busca: lead.o_que_busca || null,
                quantidade_animais: qtd || null,
                is_mql: isMql,
                intencao_investimento: lead.intencao_investimento || null,
                assessoria: lead.assessoria || null,
                source_page: lead.page || lead.source_page || null,
                source: lead.source || null,
                medium: lead.medium || null,
                campaign: lead.campaign || null,
                utm_content: lead.utm_content || null,
                utm_term: lead.term || lead.utm_term || null,
                data_entrada: dataEntrada,
                responsavel: 'Matheus Amormino',
                position: currentMaxPosition,
            };

            const { data, error } = await supabase
                .from('crm_leads')
                .insert([record])
                .select()
                .single();

            if (error) {
                errors.push({ lead: nomeCompleto, error: error.message });
            } else {
                // Welcome via helper centralizado (dedup 24h, opt-out, log).
                // O log em whatsapp_messages é gravado dentro do dispatchWelcome.
                let whatsappResult: { sent: boolean; queued?: boolean; reason?: string; skipped?: boolean } = {
                    sent: false, reason: 'no_phone',
                };
                if (record.telefone) {
                    const r = await dispatchWelcome(record.telefone, nomeCompleto, 'webhook-sheets', { lead_id: data.id });
                    whatsappResult = { sent: r.sent, queued: r.queued, skipped: r.skipped, reason: r.reason };
                }

                inserted.push({ ...data, whatsapp: whatsappResult });
            }
        }

        const allFailed = inserted.length === 0 && errors.length > 0;
        return NextResponse.json(
            {
                success: !allFailed,
                inserted: inserted.length,
                leads: inserted.map(l => ({
                    id: l.id,
                    nome: l.nome,
                    whatsapp: l.whatsapp,
                })),
                errors: errors.length > 0 ? errors : undefined,
            },
            { status: allFailed ? 500 : 200 }
        );
    } catch (error: any) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}

// Health check
export async function GET() {
    return NextResponse.json({ status: 'ok', endpoint: 'google-sheets-webhook' });
}
