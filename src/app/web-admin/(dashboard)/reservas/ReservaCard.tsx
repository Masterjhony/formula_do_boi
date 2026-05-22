'use client';

import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { User, Beaker, Snowflake, Clock, AlertTriangle } from 'lucide-react';
import { ProductReservation, formatBRL, RESERVA_PRIORITY } from '@/lib/reservations';

interface Props {
    reservation: ProductReservation;
    onClick?: () => void;
    dragging?: boolean;
}

export default function ReservaCard({ reservation: r, onClick, dragging }: Props) {
    const sortable = useSortable({ id: r.id });
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = sortable;

    const dragStyle = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging && !dragging ? 0.4 : 1,
        borderRadius: 3,
    };

    const prio = RESERVA_PRIORITY.find(p => p.id === r.priority) ?? RESERVA_PRIORITY[1];
    const isSemen = r.product_kind === 'semen';
    const KindIcon = isSemen ? Snowflake : Beaker;

    // Vencimento da reserva
    const expiresIn = (() => {
        if (!r.expires_at) return null;
        const ms = new Date(r.expires_at).getTime() - Date.now();
        if (ms < 0) return { text: 'Vencida', danger: true };
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        if (days === 0) return { text: 'Vence hoje', danger: true };
        if (days <= 2) return { text: `${days}d`, danger: false, warn: true };
        return { text: `${days}d`, danger: false, warn: false };
    })();

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            onClick={(e) => {
                if (dragging) return;
                e.stopPropagation();
                onClick?.();
            }}
            className={`relative cursor-grab active:cursor-grabbing bg-white dark:bg-[#2A2A2A] border border-gray-200 dark:border-[rgba(232,203,133,0.16)] hover:border-[#D4A85C] dark:hover:border-[#D4A85C] transition-colors group ${dragging ? 'shadow-2xl shadow-black/40 ring-1 ring-[#D4A85C]/40' : ''}`}
            style={dragStyle}
        >
            {/* hairline tick */}
            <span aria-hidden className="absolute top-0 left-0 block group-hover:bg-[#D4A85C] transition-colors" style={{ width: 18, height: 1, background: '#A0792E' }} />

            {/* Top: code + priority + tipo */}
            <div className="flex items-center justify-between gap-2 px-3 pt-3">
                <span
                    className="text-[#D4A85C]"
                    style={{
                        fontFamily: 'var(--font-mono), monospace',
                        fontSize: 10,
                        letterSpacing: '0.18em',
                        fontWeight: 600,
                    }}
                >
                    {r.code}
                </span>
                <div className="flex items-center gap-1.5">
                    <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ background: prio.dot }}
                        title={`Prioridade ${prio.label}`}
                    />
                    <span
                        className="inline-flex items-center gap-1 text-[9px] text-gray-500 dark:text-[#F5F0E4]/50 uppercase"
                        style={{
                            fontFamily: 'var(--font-mono), monospace',
                            letterSpacing: '0.18em',
                        }}
                    >
                        <KindIcon size={10} />
                        {isSemen ? 'Sêmen' : 'Embrião'}
                    </span>
                </div>
            </div>

            {/* Produto */}
            <div className="px-3 mt-1.5">
                <p className="text-sm font-medium text-gray-900 dark:text-[#F5F0E4] leading-snug line-clamp-1" title={r.product_name}>
                    {r.product_name}
                </p>
                {r.central && (
                    <p className="text-[10px] text-gray-400 dark:text-[#F5F0E4]/40 mt-0.5 line-clamp-1">
                        {r.central}
                    </p>
                )}
            </div>

            {/* Cliente */}
            <div className="px-3 mt-2 pb-2 border-b border-gray-100 dark:border-[rgba(232,203,133,0.10)]">
                <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-[#F5F0E4]/80">
                    <User size={11} className="text-gray-400 dark:text-[#F5F0E4]/40 shrink-0" />
                    <span className="truncate" title={r.customer_name}>{r.customer_name}</span>
                </div>
                {(r.customer_city || r.customer_uf) && (
                    <p className="text-[10px] text-gray-400 dark:text-[#F5F0E4]/40 mt-0.5 ml-[18px]">
                        {[r.customer_city, r.customer_uf].filter(Boolean).join(' / ')}
                    </p>
                )}
            </div>

            {/* Pedido + footer */}
            <div className="px-3 py-2 flex items-center justify-between gap-2">
                <div className="flex flex-col">
                    <span
                        className="text-[9px] text-gray-400 dark:text-[#F5F0E4]/40 uppercase"
                        style={{
                            fontFamily: 'var(--font-mono), monospace',
                            letterSpacing: '0.18em',
                        }}
                    >
                        {isSemen ? 'Doses' : 'Embriões'}
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-[#F5F0E4] tabular-nums">
                        {r.quantity}
                    </span>
                </div>

                {r.total_value != null && (
                    <div className="flex flex-col items-end">
                        <span
                            className="text-[9px] text-gray-400 dark:text-[#F5F0E4]/40 uppercase"
                            style={{
                                fontFamily: 'var(--font-mono), monospace',
                                letterSpacing: '0.18em',
                            }}
                        >
                            Total
                        </span>
                        <span className="text-xs font-semibold text-[#D4A85C] tabular-nums">
                            {formatBRL(r.total_value)}
                        </span>
                    </div>
                )}
            </div>

            {/* Badges de prazo + responsável */}
            {(expiresIn || r.assigned_to) && (
                <div className="px-3 pb-2 flex items-center gap-1.5 flex-wrap">
                    {expiresIn && (
                        <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] uppercase tracking-wider border ${
                                expiresIn.danger
                                    ? 'border-red-500/30 text-red-400 bg-red-500/5'
                                    : expiresIn.warn
                                        ? 'border-amber-500/30 text-amber-400 bg-amber-500/5'
                                        : 'border-gray-200 dark:border-[rgba(232,203,133,0.18)] text-gray-500 dark:text-[#F5F0E4]/50'
                            }`}
                            style={{
                                fontFamily: 'var(--font-mono), monospace',
                                letterSpacing: '0.14em',
                                borderRadius: 2,
                            }}
                        >
                            {expiresIn.danger ? <AlertTriangle size={9} /> : <Clock size={9} />}
                            {expiresIn.text}
                        </span>
                    )}
                    {r.assigned_to && (
                        <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] uppercase tracking-wider border border-gray-200 dark:border-[rgba(232,203,133,0.18)] text-gray-600 dark:text-[#F5F0E4]/60"
                            style={{
                                fontFamily: 'var(--font-mono), monospace',
                                letterSpacing: '0.14em',
                                borderRadius: 2,
                            }}
                            title={`Responsável: ${r.assigned_to}`}
                        >
                            @ {r.assigned_to.split(' ')[0]}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
