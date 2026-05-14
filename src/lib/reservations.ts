// Tipos e estágios canônicos do fluxo de reservas (Sêmen / Embriões).
// Fonte da verdade do Kanban. Mudou o fluxo? Mude aqui — o board, o card,
// os filtros e o select de status seguem a constante.

export const RESERVA_STAGES = [
    { id: 'nova',                  label: '1. Nova reserva',         hint: 'Pedido chegou do site' },
    { id: 'qualificacao',          label: '2. Em qualificação',      hint: 'Conferir cliente, qtde e condições' },
    { id: 'aguardando_central',    label: '3. Aguardando central',    hint: 'Confirmar disponibilidade junto à central/criador' },
    { id: 'confirmada',            label: '4. Reserva confirmada',    hint: 'Doses bloqueadas pro cliente' },
    { id: 'aguardando_pagamento',  label: '5. Aguardando pagamento',  hint: 'Cliente recebeu instruções de pagamento' },
    { id: 'pagamento_validado',    label: '6. Pagamento validado',    hint: 'Comprovação aprovada' },
    { id: 'faturamento',           label: '7. Faturamento',           hint: 'NF, contrato, ordem de envio' },
    { id: 'preparacao_logistica',  label: '8. Preparação logística',  hint: 'Organizar retirada/envio' },
    { id: 'enviado',               label: '9. Enviado / retirado',    hint: 'Pedido saiu da central' },
    { id: 'finalizado',            label: '10. Finalizado',           hint: 'Entrega confirmada, histórico fechado' },
] as const;

export type ReservaStatus = typeof RESERVA_STAGES[number]['id'];

// Status especiais paralelos — ficam num "trilho lateral" no Kanban.
// Cards aqui não seguem o fluxo normal, mas podem voltar via mudança manual.
export const RESERVA_SPECIAL_STAGES = [
    { id: 'expirada',                    label: 'Reserva expirada',          tone: 'warn'    },
    { id: 'cancelada_cliente',           label: 'Cancelada pelo cliente',    tone: 'neutral' },
    { id: 'cancelada_indisponibilidade', label: 'Cancelada — sem estoque',   tone: 'danger'  },
    { id: 'pendencia_fiscal',            label: 'Pendência fiscal',          tone: 'warn'    },
    { id: 'problema_logistico',          label: 'Problema logístico',        tone: 'danger'  },
] as const;

export type ReservaSpecialStatus = typeof RESERVA_SPECIAL_STAGES[number]['id'];

export type AnyReservaStatus = ReservaStatus | ReservaSpecialStatus;

export const ALL_STAGES = [...RESERVA_STAGES, ...RESERVA_SPECIAL_STAGES];

export function stageLabel(id: string): string {
    return ALL_STAGES.find(s => s.id === id)?.label ?? id;
}

export function isSpecialStatus(id: string): boolean {
    return RESERVA_SPECIAL_STAGES.some(s => s.id === id);
}

export const RESERVA_PRIORITY = [
    { id: 'baixa',  label: 'Baixa',  dot: '#8A8A8A' },
    { id: 'normal', label: 'Normal', dot: '#D4A85C' },
    { id: 'alta',   label: 'Alta',   dot: '#E25C5C' },
] as const;

export type ReservaPriority = typeof RESERVA_PRIORITY[number]['id'];

export const PAYMENT_METHODS = [
    { id: 'avista',     label: 'À vista' },
    { id: '3x_pix',     label: '3x no PIX' },
    { id: '8x_boleto',  label: '8x no boleto' },
    { id: '12x_cartao', label: '12x no cartão' },
    { id: 'parcelado',  label: 'Parcelado (combinar)' },
    { id: 'outro',      label: 'Outro' },
] as const;

export function paymentLabel(id?: string | null): string {
    if (!id) return '—';
    return PAYMENT_METHODS.find(p => p.id === id)?.label ?? id;
}

export interface ChecklistItem {
    id: string;
    title: string;
    completed: boolean;
    assignee?: string | null;
    due_date?: string | null;
}

export interface AttachmentItem {
    id: string;
    title: string;
    url: string;
    kind?: string;
    created_at: string;
}

export interface HistoryEvent {
    at: string;                           // ISO timestamp
    kind: 'created' | 'status' | 'note' | 'attachment' | 'payment' | 'invoice' | 'shipping' | 'archive' | 'unarchive';
    by?: string | null;                   // operador
    from?: string | null;                 // valor anterior (status, etc.)
    to?: string | null;                   // novo valor
    text?: string | null;                 // descrição livre
}

export interface ProductReservation {
    id: string;
    seq: number;
    code: string;                          // derivado: `RSV-${seq}`

    // Produto
    product_id: number | null;
    product_name: string;
    product_category: string;
    product_kind: 'semen' | 'embriao';
    central: string | null;

    // Cliente
    customer_name: string;
    customer_phone: string;
    customer_email: string | null;
    customer_doc: string | null;
    customer_fazenda: string | null;
    customer_city: string | null;
    customer_uf: string | null;

    // Pedido
    quantity: number;
    unit_price: number | null;
    total_value: number | null;
    payment_method: string | null;
    payment_status: string | null;
    payment_proof_url: string | null;
    down_payment: number | null;

    // Fluxo
    status: AnyReservaStatus;
    position: number;
    priority: ReservaPriority;

    // Operacional
    assigned_to: string | null;
    origin: string;
    expires_at: string | null;

    // Faturamento
    invoice_status: string | null;
    invoice_number: string | null;
    invoice_issued_at: string | null;
    fiscal_notes: string | null;

    // Logística
    logistics_type: 'envio' | 'retirada' | null;
    expected_ship_at: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    tracking_code: string | null;
    logistics_responsible: string | null;

    // UTM
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    utm_content: string | null;
    utm_term: string | null;
    gclid: string | null;
    fbclid: string | null;
    referrer: string | null;
    landing_url: string | null;

    // Conteúdo
    notes: string | null;
    checklist: ChecklistItem[];
    attachments: AttachmentItem[];
    history: HistoryEvent[];

    // Vínculo
    lead_id: string | null;

    // Auditoria
    created_at: string;
    updated_at: string;
    archived_at: string | null;
}

export function makeCode(seq: number): string {
    return `RSV-${String(seq).padStart(4, '0')}`;
}

export function formatBRL(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) return '—';
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
    });
}
