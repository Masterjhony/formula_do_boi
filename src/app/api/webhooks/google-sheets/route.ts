import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const WHATSAPP_SERVER_URL = process.env.WHATSAPP_SERVER_URL || 'http://localhost:3001';

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

            const record = {
                nome: nomeFormatado,
                status: 'Lead',
                telefone: lead.celular || lead.telefone || null,
                instagram: lead.instagram || null,
                empresa: lead.nome_fazenda || lead.empresa || null,
                estado: estado || null,
                cidade: cidade || null,
                interesse: lead.momento_pecuaria || lead.interesse || null,
                o_que_busca: lead.o_que_busca || null,
                quantidade_animais: lead.quantidade_animais || null,
                source_page: lead.page || lead.source_page || null,
                source: lead.source || null,
                medium: lead.medium || null,
                campaign: lead.campaign || null,
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
                inserted.push(data);
                
                // Fire and forget welcome message via whatsapp-server
                if (record.telefone) {
                    fetch(`${WHATSAPP_SERVER_URL}/send`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ phone: record.telefone, name: nomeCompleto }),
                        signal: AbortSignal.timeout(15000),
                    }).catch(e => {
                        console.error('[GoogleSheets Webhook] Failed to send WhatsApp message:', e);
                    });
                }
            }
        }

        return NextResponse.json({
            success: true,
            inserted: inserted.length,
            errors: errors.length,
            details: errors.length > 0 ? errors : undefined,
        });
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
