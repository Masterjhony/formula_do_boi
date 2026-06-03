import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { makeCode } from '@/lib/reservations';
import { appendReservationToSheet } from '@/lib/reservations-sheet';

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createClient(url, serviceKey);
}

const DIGITS_ONLY = /\D/g;

function asNumber(v: unknown): number | null {
    if (v == null || v === '') return null;
    const n = typeof v === 'number' ? v : Number(String(v).replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(n) ? n : null;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            product_id,
            product_name,
            product_category,
            product_kind,         // 'semen' | 'embriao'
            central,
            customer_name,
            customer_phone,
            customer_email,
            customer_doc,
            customer_fazenda,
            customer_city,
            customer_uf,
            quantity,
            unit_price,
            total_value,
            payment_method,
            notes,
            // honeypot anti-spam — campo invisível, deve vir vazio
            website,
            // UTM / attribution
            utm_source, utm_medium, utm_campaign, utm_content, utm_term,
            gclid, fbclid, referrer, landing_url,
            // Identificação da doadora para a planilha (aba = doadora). Opcional —
            // só o checkout de embrião envia; o ReservaModal cai no fallback de product_name.
            sheet_tab, doadora_rgd, doadora_cruzamento,
        } = body ?? {};

        if (website) {
            // Honeypot preenchido → bot. Devolve 200 mudo pra não dar pista.
            return NextResponse.json({ ok: true });
        }

        if (!customer_name || !customer_phone || !product_name || !product_kind || !quantity) {
            return NextResponse.json(
                { error: 'Campos obrigatórios faltando: nome, telefone, produto e quantidade.' },
                { status: 400 },
            );
        }

        if (product_kind !== 'semen' && product_kind !== 'embriao') {
            return NextResponse.json({ error: 'product_kind inválido.' }, { status: 400 });
        }

        const qty = Number(quantity);
        if (!Number.isInteger(qty) || qty <= 0) {
            return NextResponse.json({ error: 'quantidade inválida.' }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();

        // Position no topo da coluna "nova" (cards mais recentes primeiro).
        const { data: minPos } = await supabase
            .from('product_reservations')
            .select('position')
            .eq('status', 'nova')
            .order('position', { ascending: true })
            .limit(1);

        const position = (minPos?.[0]?.position ?? 1000) - 1000;

        const nowIso = new Date().toISOString();
        const initialHistory = [
            {
                at: nowIso,
                kind: 'created',
                text: `Reserva criada pelo site (${product_kind === 'semen' ? 'sêmen' : 'embrião'}).`,
            },
        ];

        const { data, error } = await supabase
            .from('product_reservations')
            .insert({
                product_id: product_id ?? null,
                product_name: String(product_name).slice(0, 200),
                product_category: product_category ?? (product_kind === 'semen' ? 'Sêmen' : 'Embrião'),
                product_kind,
                central: central ?? null,

                customer_name: String(customer_name).slice(0, 160),
                customer_phone: String(customer_phone).replace(DIGITS_ONLY, '').slice(0, 20),
                customer_email: customer_email ? String(customer_email).slice(0, 160) : null,
                customer_doc: customer_doc ? String(customer_doc).replace(DIGITS_ONLY, '').slice(0, 20) : null,
                customer_fazenda: customer_fazenda ?? null,
                customer_city: customer_city ?? null,
                customer_uf: customer_uf ?? null,

                quantity: qty,
                unit_price: asNumber(unit_price),
                total_value: asNumber(total_value),
                payment_method: payment_method ?? null,
                payment_status: 'pendente',

                status: 'nova',
                position,
                priority: 'normal',
                origin: 'site',

                utm_source: utm_source ?? null,
                utm_medium: utm_medium ?? null,
                utm_campaign: utm_campaign ?? null,
                utm_content: utm_content ?? null,
                utm_term: utm_term ?? null,
                gclid: gclid ?? null,
                fbclid: fbclid ?? null,
                referrer: referrer ?? null,
                landing_url: landing_url ?? null,

                notes: notes ?? null,
                history: initialHistory,
            })
            .select('id, seq')
            .single();

        if (error || !data) {
            console.error('[api/reservas] insert error', error);
            return NextResponse.json({ error: 'Não foi possível registrar a reserva.' }, { status: 500 });
        }

        const code = makeCode(data.seq);

        // Espelha no Google Sheets — só embrião, numa aba por doadora.
        // Best-effort: a reserva já está salva; falha aqui não quebra o checkout.
        if (product_kind === 'embriao') {
            try {
                const tab = String(sheet_tab || product_name || 'Reservas-Embrioes').trim();
                await appendReservationToSheet({
                    tab,
                    dataHora: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
                    code,
                    nome: String(customer_name ?? ''),
                    whatsapp: String(customer_phone ?? ''),
                    email: customer_email ? String(customer_email) : '',
                    doc: customer_doc ? String(customer_doc) : '',
                    fazenda: customer_fazenda ? String(customer_fazenda) : '',
                    cidade: customer_city ? String(customer_city) : '',
                    uf: customer_uf ? String(customer_uf) : '',
                    quantidade: qty,
                    unit: asNumber(unit_price) ?? '',
                    total: asNumber(total_value) ?? '',
                    pagamento: payment_method ? String(payment_method) : '',
                    doadora: String(sheet_tab || product_name || ''),
                    rgd: doadora_rgd ? String(doadora_rgd) : '',
                    cruzamento: doadora_cruzamento ? String(doadora_cruzamento) : '',
                    observacoes: notes ? String(notes) : '',
                    utm_source: utm_source ? String(utm_source) : '',
                    utm_medium: utm_medium ? String(utm_medium) : '',
                    utm_campaign: utm_campaign ? String(utm_campaign) : '',
                    utm_content: utm_content ? String(utm_content) : '',
                    landing_url: landing_url ? String(landing_url) : '',
                });
            } catch (sheetErr) {
                console.error('[api/reservas] Sheets espelhamento falhou (reserva já salva):', sheetErr);
            }
        }

        return NextResponse.json({
            ok: true,
            id: data.id,
            code,
        });
    } catch (err) {
        console.error('[api/reservas] error', err);
        return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
    }
}
