// Helper compartilhado entre `/api/lead-atacante` (POST do site) e
// `/api/admin/backfill-atacante-reservas` (one-shot que relê a planilha).
//
// Toda submissão da LP `/atacante-matinha` deve virar um card em `/reservas`,
// além de continuar gravando a linha de auditoria na aba `Atacante-Matinha`
// da planilha "Backup leads".

import type { SupabaseClient } from '@supabase/supabase-js';

const DIGITS_ONLY = /\D/g;

const PRODUCT_BASE_NAME = 'Atacante da Matinha';
const PRODUCT_CENTRAL = 'Central Bela Vista';
const ORIGIN = 'site-atacante';

// Preço por dose do Atacante da Matinha — alinhado com os cards
// RSV-1001/1002 fechados no grupo da Central Bela Vista (R$ 25,50/dose
// convencional). Só aplicamos automaticamente quando o lead escolhe
// 'convencional'; sexado/ambos/indef ficam null e o operador define na
// etapa de qualificação. Mudou de preço? Edite aqui.
const UNIT_PRICE_BY_TIPO: Record<string, number> = {
    convencional: 25.5,
};

const TIPO_LABEL: Record<string, string> = {
    convencional: 'Convencional',
    sexado: 'Sexado',
    ambos: 'Conv + Sexado',
    indef: 'A definir',
};

const PO_LABEL: Record<string, string> = {
    'po-registrado': 'PO registrado',
    'po-sem-registro': 'PO em formação',
    'pretende': 'Pretende migrar',
    'comercial': 'Gado comercial',
};

const ESTACAO_LABEL: Record<string, string> = {
    '2026-1': '1º semestre 2026',
    '2026-2': '2º semestre 2026',
    '2027': '2027',
    'indef': 'A definir',
};

export interface AtacanteLead {
    nome: string;
    whatsapp: string;
    email?: string | null;
    cidade?: string | null;
    fazenda?: string | null;
    po?: string | null;
    qtd?: string | null;       // faixa de rebanho (ex: '1-50')
    doses?: string | null;     // faixa de doses (ex: '1-100')
    tipo?: string | null;      // convencional | sexado | ambos | indef
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
    created_at?: string | null; // ISO; default = now (usado pelo backfill)
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

function buildNotes(lead: AtacanteLead): string {
    const lines: string[] = [];
    if (lead.po) lines.push(`Perfil: ${PO_LABEL[lead.po] ?? lead.po}`);
    if (lead.qtd) lines.push(`Rebanho: ${lead.qtd} animais`);
    if (lead.doses) lines.push(`Doses pretendidas: ${lead.doses}`);
    if (lead.tipo) lines.push(`Tipo de sêmen: ${TIPO_LABEL[lead.tipo] ?? lead.tipo}`);
    if (lead.estacao) lines.push(`Estação reprodutiva: ${ESTACAO_LABEL[lead.estacao] ?? lead.estacao}`);
    if (lead.fazenda) lines.push(`Fazenda: ${lead.fazenda}`);
    return lines.join('\n');
}

interface BuildOptions {
    position: number;
}

export function buildAtacanteReservationInsert(lead: AtacanteLead, opts: BuildOptions) {
    const phoneDigits = String(lead.whatsapp || '').replace(DIGITS_ONLY, '').slice(0, 20);
    const { city, uf } = splitCityUf(lead.cidade);
    const createdAt = lead.created_at || new Date().toISOString();
    const quantity = parseDosesUpperBound(lead.doses);
    const unitPrice = UNIT_PRICE_BY_TIPO[(lead.tipo || '').toLowerCase()] ?? null;
    const totalValue = unitPrice != null ? Number((unitPrice * quantity).toFixed(2)) : null;

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
        customer_fazenda: lead.fazenda || null,
        customer_city: city,
        customer_uf: uf,

        quantity,
        unit_price: unitPrice,
        total_value: totalValue,
        payment_method: null,
        payment_status: 'pendente',

        status: 'nova',
        position: opts.position,
        priority: 'normal',
        origin: ORIGIN,

        utm_source: lead.utm_source ?? 'site',
        utm_medium: lead.utm_medium ?? 'organic',
        utm_campaign: lead.utm_campaign ?? 'atacante-matinha',
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
                text: 'Pré-reserva enviada pelo site /atacante-matinha.',
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
export async function insertAtacanteReservation(
    supabase: SupabaseClient,
    lead: AtacanteLead,
    opts: { position: number },
) {
    const payload = buildAtacanteReservationInsert(lead, opts);
    const { data, error } = await supabase
        .from('product_reservations')
        .insert(payload)
        .select('id, seq')
        .single();
    if (error) {
        console.error('[atacante-reservation] insert error', error);
        return null;
    }
    return data;
}

// Verifica se já existe uma reserva pro mesmo telefone vinda dessa LP —
// usado pelo backfill pra ficar idempotente.
export async function reservationExistsForPhone(
    supabase: SupabaseClient,
    phoneDigits: string,
): Promise<boolean> {
    if (!phoneDigits) return false;
    const { data } = await supabase
        .from('product_reservations')
        .select('id')
        .eq('customer_phone', phoneDigits)
        .eq('origin', ORIGIN)
        .limit(1);
    return !!(data && data.length > 0);
}

export const ATACANTE_RESERVATION_ORIGIN = ORIGIN;
