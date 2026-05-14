'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
    DndContext,
    closestCorners,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    DragEndEvent,
    DragStartEvent,
} from '@dnd-kit/core';
import {
    RESERVA_STAGES,
    RESERVA_SPECIAL_STAGES,
    isSpecialStatus,
    ProductReservation,
} from '@/lib/reservations';
import { moveReservation } from '@/app/web-admin/actions/reservations';
import ReservaColumn from './ReservaColumn';
import ReservaCard from './ReservaCard';
import ReservaDetail from './ReservaDetail';
import { Search, RefreshCw, Layers } from 'lucide-react';

interface Props {
    initial: ProductReservation[];
}

type KindFilter = 'all' | 'semen' | 'embriao';
type PriorityFilter = 'all' | 'baixa' | 'normal' | 'alta';

export default function ReservasBoard({ initial }: Props) {
    const [items, setItems] = useState<ProductReservation[]>(initial);
    const [activeDrag, setActiveDrag] = useState<ProductReservation | null>(null);

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const selectedId = searchParams.get('id');
    const selected = useMemo(
        () => (selectedId ? items.find(r => r.id === selectedId) : null),
        [items, selectedId],
    );

    const updateUrl = useCallback((mutate: (p: URLSearchParams) => void) => {
        const params = new URLSearchParams(searchParams.toString());
        mutate(params);
        const qs = params.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, [router, pathname, searchParams]);

    const setSelectedId = (id: string | null) =>
        updateUrl(p => { if (id) p.set('id', id); else p.delete('id'); });

    // ── Filtros ───────────────────────────────────────────────
    const [query, setQuery] = useState('');
    const [kind, setKind] = useState<KindFilter>('all');
    const [priority, setPriority] = useState<PriorityFilter>('all');
    const [showSpecial, setShowSpecial] = useState(false);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return items.filter(r => {
            if (kind !== 'all' && r.product_kind !== kind) return false;
            if (priority !== 'all' && r.priority !== priority) return false;
            if (!q) return true;
            return (
                r.customer_name.toLowerCase().includes(q) ||
                r.product_name.toLowerCase().includes(q) ||
                r.code.toLowerCase().includes(q) ||
                (r.customer_city ?? '').toLowerCase().includes(q) ||
                (r.customer_fazenda ?? '').toLowerCase().includes(q)
            );
        });
    }, [items, query, kind, priority]);

    const grouped = useMemo(() => {
        const out: Record<string, ProductReservation[]> = {};
        for (const s of RESERVA_STAGES) out[s.id] = [];
        for (const s of RESERVA_SPECIAL_STAGES) out[s.id] = [];
        for (const r of filtered) {
            (out[r.status] ??= []).push(r);
        }
        for (const k of Object.keys(out)) {
            out[k].sort((a, b) => a.position - b.position);
        }
        return out;
    }, [filtered]);

    // Métricas leves no header
    const metrics = useMemo(() => {
        const total = filtered.length;
        const novas = filtered.filter(r => r.status === 'nova').length;
        const aguardando = filtered.filter(r => ['aguardando_central', 'aguardando_pagamento'].includes(r.status)).length;
        const finalizadas = filtered.filter(r => r.status === 'finalizado').length;
        const especiais = filtered.filter(r => isSpecialStatus(r.status)).length;
        return { total, novas, aguardando, finalizadas, especiais };
    }, [filtered]);

    // ── Drag and drop ─────────────────────────────────────────
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    function onDragStart(e: DragStartEvent) {
        const id = String(e.active.id);
        const r = items.find(x => x.id === id);
        if (r) setActiveDrag(r);
    }

    async function onDragEnd(e: DragEndEvent) {
        setActiveDrag(null);
        const { active, over } = e;
        if (!over) return;

        const draggedId = String(active.id);
        const overId = String(over.id);

        const dragged = items.find(x => x.id === draggedId);
        if (!dragged) return;

        // overId pode ser o id de outro card (drop em cima) ou o id de coluna ("col:xxx")
        let newStatus = dragged.status;
        let newPosition = dragged.position;

        if (overId.startsWith('col:')) {
            newStatus = overId.slice(4) as any;
            const colItems = items
                .filter(x => x.status === newStatus && x.id !== draggedId)
                .sort((a, b) => a.position - b.position);
            newPosition = (colItems[colItems.length - 1]?.position ?? 0) + 1000;
        } else {
            const target = items.find(x => x.id === overId);
            if (!target) return;
            newStatus = target.status;
            // posiciona logo antes do alvo
            const colItems = items
                .filter(x => x.status === newStatus && x.id !== draggedId)
                .sort((a, b) => a.position - b.position);
            const idx = colItems.findIndex(x => x.id === overId);
            if (idx <= 0) {
                newPosition = (colItems[0]?.position ?? 1000) - 1000;
            } else {
                newPosition = (colItems[idx - 1].position + colItems[idx].position) / 2;
            }
        }

        if (newStatus === dragged.status && newPosition === dragged.position) return;

        // Atualização otimista
        setItems(prev => prev.map(x => x.id === draggedId ? { ...x, status: newStatus, position: newPosition } : x));

        try {
            await moveReservation(draggedId, newStatus, newPosition);
        } catch (err) {
            console.error(err);
            // Em caso de erro, recarrega
            location.reload();
        }
    }

    function patchItem(id: string, updates: Partial<ProductReservation>) {
        setItems(prev => prev.map(x => x.id === id ? { ...x, ...updates } : x));
    }

    function removeItem(id: string) {
        setItems(prev => prev.filter(x => x.id !== id));
    }

    return (
        <div className="flex flex-col h-full">
            {/* ── Header ── */}
            <div className="flex flex-col gap-4 mb-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <p
                            className="mb-1.5"
                            style={{
                                fontFamily: 'var(--font-mono), monospace',
                                fontSize: 11,
                                color: '#D4A85C',
                                letterSpacing: '0.24em',
                                textTransform: 'uppercase',
                                fontWeight: 500,
                            }}
                        >
                            Produtos · Reservas
                        </p>
                        <h1 className="text-2xl font-medium text-gray-900 dark:text-[#F5F0E4] tracking-tight">
                            Gerenciamento de Reservas
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-[#F5F0E4]/60 mt-1 max-w-xl">
                            Pedidos vindos do catálogo público (Sêmen e Embriões). Cada card é a casca operacional
                            de uma reserva rastreável — do pedido até a entrega.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <Metric label="Total" value={metrics.total} />
                        <Metric label="Novas" value={metrics.novas} accent />
                        <Metric label="Aguardando" value={metrics.aguardando} />
                        <Metric label="Finalizadas" value={metrics.finalizadas} muted />
                        {metrics.especiais > 0 && <Metric label="Especiais" value={metrics.especiais} warn />}
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[240px] max-w-md">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Buscar por código, cliente, produto, fazenda…"
                            className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-[#141414] border border-gray-200 dark:border-[rgba(232,203,133,0.18)] focus:border-[#D4A85C] focus:outline-none text-gray-900 dark:text-[#F5F0E4]"
                            style={{ borderRadius: 3 }}
                        />
                    </div>

                    <FilterPill
                        active={kind === 'all'}
                        onClick={() => setKind('all')}
                        label="Tudo"
                    />
                    <FilterPill
                        active={kind === 'semen'}
                        onClick={() => setKind('semen')}
                        label="Sêmen"
                    />
                    <FilterPill
                        active={kind === 'embriao'}
                        onClick={() => setKind('embriao')}
                        label="Embriões"
                    />

                    <span className="w-px h-5 bg-gray-200 dark:bg-[rgba(232,203,133,0.18)] mx-1" />

                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as PriorityFilter)}
                        className="px-3 py-2 text-xs uppercase tracking-wider bg-white dark:bg-[#141414] border border-gray-200 dark:border-[rgba(232,203,133,0.18)] text-gray-700 dark:text-[#F5F0E4]/80 focus:outline-none focus:border-[#D4A85C]"
                        style={{ borderRadius: 3, letterSpacing: '0.12em' }}
                    >
                        <option value="all">Todas as prioridades</option>
                        <option value="alta">Alta</option>
                        <option value="normal">Normal</option>
                        <option value="baixa">Baixa</option>
                    </select>

                    <button
                        onClick={() => setShowSpecial(s => !s)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-wider border transition-colors ${
                            showSpecial
                                ? 'bg-[#A0792E] border-[#A0792E] text-[#0A0A0A]'
                                : 'bg-white dark:bg-[#141414] border-gray-200 dark:border-[rgba(232,203,133,0.18)] text-gray-700 dark:text-[#F5F0E4]/80 hover:border-[#D4A85C]'
                        }`}
                        style={{ borderRadius: 3, letterSpacing: '0.12em' }}
                    >
                        <Layers size={12} />
                        Status especiais
                    </button>

                    <button
                        onClick={() => router.refresh()}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-wider bg-white dark:bg-[#141414] border border-gray-200 dark:border-[rgba(232,203,133,0.18)] text-gray-700 dark:text-[#F5F0E4]/80 hover:border-[#D4A85C]"
                        style={{ borderRadius: 3, letterSpacing: '0.12em' }}
                    >
                        <RefreshCw size={12} />
                        Atualizar
                    </button>
                </div>
            </div>

            {/* ── Board ── */}
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd}>
                <div className="flex-1 overflow-x-auto pb-4">
                    <div className="flex gap-3 h-full min-w-max">
                        {RESERVA_STAGES.map(stage => (
                            <ReservaColumn
                                key={stage.id}
                                stage={stage}
                                items={grouped[stage.id] ?? []}
                                onCardClick={(r) => setSelectedId(r.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Trilho lateral de status especiais */}
                {showSpecial && (
                    <div className="border-t border-gray-200 dark:border-[rgba(232,203,133,0.14)] pt-4 mt-2">
                        <p
                            className="mb-2 px-1"
                            style={{
                                fontFamily: 'var(--font-mono), monospace',
                                fontSize: 10,
                                color: '#D4A85C',
                                letterSpacing: '0.22em',
                                textTransform: 'uppercase',
                                fontWeight: 500,
                            }}
                        >
                            Status especiais — fora do fluxo principal
                        </p>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {RESERVA_SPECIAL_STAGES.map(stage => (
                                <ReservaColumn
                                    key={stage.id}
                                    stage={stage}
                                    items={grouped[stage.id] ?? []}
                                    onCardClick={(r) => setSelectedId(r.id)}
                                    compact
                                />
                            ))}
                        </div>
                    </div>
                )}

                <DragOverlay>
                    {activeDrag && <ReservaCard reservation={activeDrag} dragging />}
                </DragOverlay>
            </DndContext>

            {/* ── Detail Modal ── */}
            {selected && (
                <ReservaDetail
                    reservation={selected}
                    onClose={() => setSelectedId(null)}
                    onPatch={(updates) => patchItem(selected.id, updates)}
                    onArchive={() => { removeItem(selected.id); setSelectedId(null); }}
                />
            )}
        </div>
    );
}

function Metric({
    label, value, accent, muted, warn,
}: {
    label: string; value: number; accent?: boolean; muted?: boolean; warn?: boolean;
}) {
    const color = warn
        ? 'text-amber-500'
        : accent
            ? 'text-[#D4A85C]'
            : muted
                ? 'text-gray-400 dark:text-[#F5F0E4]/40'
                : 'text-gray-900 dark:text-[#F5F0E4]';
    return (
        <div className="px-3 py-1.5 border border-gray-200 dark:border-[rgba(232,203,133,0.18)]" style={{ borderRadius: 3 }}>
            <div className="flex items-baseline gap-2">
                <span
                    className="text-[10px] uppercase text-gray-500 dark:text-[#F5F0E4]/50"
                    style={{
                        fontFamily: 'var(--font-mono), monospace',
                        letterSpacing: '0.18em',
                    }}
                >
                    {label}
                </span>
                <span className={`text-base font-bold tabular-nums ${color}`}>{value}</span>
            </div>
        </div>
    );
}

function FilterPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-2 text-xs uppercase tracking-wider border transition-colors ${
                active
                    ? 'bg-[#A0792E] border-[#A0792E] text-[#0A0A0A]'
                    : 'bg-white dark:bg-[#141414] border-gray-200 dark:border-[rgba(232,203,133,0.18)] text-gray-700 dark:text-[#F5F0E4]/80 hover:border-[#D4A85C]'
            }`}
            style={{ borderRadius: 3, letterSpacing: '0.12em' }}
        >
            {label}
        </button>
    );
}
