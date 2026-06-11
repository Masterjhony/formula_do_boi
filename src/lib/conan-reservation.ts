// Helper do `/api/lead-conan` (POST do checkout /conan).
//
// Toda submissão da LP `/conan` deve virar um card em `/reservas`, além de
// gravar a linha de auditoria na aba `Conan` da planilha "Backup leads".
//
// Espelha src/lib/volante-reservation.ts — mesma mecânica, dados do touro
// CONAN FIV TresMar. Diferença comercial: o CONAN tem tabela de preço por
// faixa publicada na LP, mas a confirmação final do valor fica com o curador
// (depende de volume e estação), então unit_price/total_value ficam null e o
// operador define na etapa de qualificação — igual ao Volante.

import type { SupabaseClient } from '@supabase/supabase-js';

const DIGITS_ONLY = /\D/g;

const PRODUCT_BASE_NAME = 'CONAN FIV TresMar';
const PRODUCT_CENTRAL = 'Central Bela Vista';
const ORIGIN = 'site-conan';

const TIPO_LABEL: Record<string, string> = {
    convencional: 'Convencional',
    sexado: 'Sexado',
    ambos: 'Conv + Sexado',
    indef: 'A definir',
};

const ESTACAO_LABEL: Record<string, string> = {
    '2026-1': '1º semestre 2026',
    '2026-2': '2º semestre 2026',
    '2027': '2027',
    'indef': 'A definir',
};

export interface ConanLead {
    nome: string;
    whatsapp: string;
    email?: string | null;
    cidade?: string | null;     // "Cidade / UF" — splitCityUf separa
    qtd?: string | null;        // quantidade de matrizes (texto livre)
    doses?: string | null;      // faixa de doses (ex: '1-100')
    tipo?: string | null;       // convencional | sexado | ambos | indef
    estacao?: string | null;
    utm_source?: string | null;
    utm_medium?: string | null;
    utm_campaign?: string | null;
    utm_content?: string | null;
    utm_term?: string | null;
    gclid?: string | null;
    fbclid?: string | null;
    referrer?: string | null;
    landing_url?: string | null;
    created_at?: string | null; // ISO; default = now (usado por backfill)
}

// Doses são faixas ('1-100', '101-200', '500+', 'indef'). O card precisa de
// um inteiro NOT NULL — pegamos o limite superior da faixa pra refletir o
// tamanho da intenção. 'indef'/sem número vira 1.
export function parseDosesUpperBound(doses: string | null | undefined): number {
    if (!doses) return 1;
    const matches = String(doses).match(/\d+/g);
    if (!matches || matches.length === 0) return 1;
    const nums = matches.map(Number).filter((n) => Number.isFinite(n) && n > 0);
    if (nums.length === 0) return 1;
    return Math.max(...nums);
}

function splitCityUf(value: string | null | undefined): { city: string | null; uf: string | null } {
    if (!value) return { city: null, uf: null };
    const raw = String(value).trim();
    if (!raw) return { city: null, uf: null };
    // aceita "Cidade / UF", "Cidade - UF", "Cidade, UF", "Cidade UF"
    const m = raw.match(/^(.*?)[\s,\-\/]+([A-Za-z]{2})\s*$/);
    if (m) return { city: m[1].trim() || null, uf: m[2].toUpperCase() };
    return { city: raw, uf: null };
}

function productNameForTipo(tipo: string | null | undefined): string {
    const t = (tipo || '').toLowerCase();
    const label = TIPO_LABEL[t];
    return label && t !== 'indef' ? `${PRODUCT_BASE_NAME} (${label})` : PRODUCT_BASE_NAME;
}

function buildNotes(lead: ConanLead): string {
    const lines: string[] = [];
    if (lead.qtd) lines.push(`Matrizes: ${lead.qtd}`);
    if (lead.doses) lines.push(`Doses pretendidas: ${lead.doses}`);
    if (lead.tipo) lines.push(`Tipo de sêmen: ${TIPO_LABEL[lead.tipo] ?? lead.tipo}`);
    if (lead.estacao) lines.push(`Estação reprodutiva: ${ESTACAO_LABEL[lead.estacao] ?? lead.estacao}`);
    return lines.join('\n');
}

interface BuildOptions {
    position: number;
}

export function buildConanReservationInsert(lead: ConanLead, opts: BuildOptions) {
    const phoneDigits = String(lead.whatsapp || '').replace(DIGITS_ONLY, '').slice(0, 20);
    const { city, uf } = splitCityUf(lead.cidade);
    const createdAt = lead.created_at || new Date().toISOString();
    const quantity = parseDosesUpperBound(lead.doses);

    return {
        product_id: null,
        product_name: productNameForTipo(lead.tipo),
        product_category: 'Sêmen',
        product_kind: 'semen' as const,
        central: PRODUCT_CENTRAL,

        customer_name: String(lead.nome).slice(0, 160),
        customer_phone: phoneDigits,
        customer_email: lead.email ? String(lead.email).slice(0, 160) : null,
        customer_doc: null,
        customer_fazenda: null,
        customer_city: city,
        customer_uf: uf,

        quantity,
        unit_price: null,
        total_value: null,
        payment_method: null,
        payment_status: 'pendente',

        status: 'nova',
        position: opts.position,
        priority: 'normal',
        origin: ORIGIN,

        utm_source: lead.utm_source ?? 'site',
        utm_medium: lead.utm_medium ?? 'organic',
        utm_campaign: lead.utm_campaign ?? 'conan',
        utm_content: lead.utm_content ?? null,
        utm_term: lead.utm_term ?? null,
        gclid: lead.gclid ?? null,
        fbclid: lead.fbclid ?? null,
        referrer: lead.referrer ?? null,
        landing_url: lead.landing_url ?? null,

        notes: buildNotes(lead) || null,
        history: [
            {
                at: createdAt,
                kind: 'created',
                text: 'Pré-reserva enviada pelo site /conan.',
            },
        ],
        created_at: createdAt,
    };
}

// Pega o `position` mais baixo da coluna "nova" e devolve um valor pra
// posicionar o novo card no topo (mais recente primeiro), igual /api/reservas.
export async function getNextTopPosition(supabase: SupabaseClient): Promise<number> {
    const { data } = await supabase
        .from('product_reservations')
        .select('position')
        .eq('status', 'nova')
        .order('position', { ascending: true })
        .limit(1);
    return (data?.[0]?.position ?? 1000) - 1000;
}

// Insere a reserva; devolve a linha criada ou null em caso de erro.
// Não lança — chamadores tratam best-effort.
export async function insertConanReservation(
    supabase: SupabaseClient,
    lead: ConanLead,
    opts: { position: number },
) {
    const payload = buildConanReservationInsert(lead, opts);
    const { data, error } = await supabase
        .from('product_reservations')
        .insert(payload)
        .select('id, seq')
        .single();
    if (error) {
        console.error('[conan-reservation] insert error', error);
        return null;
    }
    return data;
}

export const CONAN_RESERVATION_ORIGIN = ORIGIN;
