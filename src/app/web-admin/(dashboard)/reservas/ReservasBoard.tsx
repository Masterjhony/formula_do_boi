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
    RESERVA_SPECIAL_STAGES,
    isSpecialStatus,
    ProductReservation,
} from '@/lib/reservations';
import {
    moveReservation,
    ReservaColumn as ReservaColumnRow,
    updateReservaColumn,
    deleteReservaColumn,
    createReservaColumn,
} from '@/app/web-admin/actions/reservations';
import ReservaColumn from './ReservaColumn';
import ReservaCard from './ReservaCard';
import ReservaDetail from './ReservaDetail';
import ReservaCreate from './ReservaCreate';
import { Search, RefreshCw, Layers, X as XIcon, ChevronDown, SlidersHorizontal, Maximize2, Minimize2, Download, Plus } from 'lucide-react';

interface Props {
    initial: ProductReservation[];
    initialColumns: ReservaColumnRow[];
}

type KindFilter = 'all' | 'semen' | 'embriao';
type PriorityFilter = 'all' | 'baixa' | 'normal' | 'alta';
type PaymentFilter = 'all' | 'pendente' | 'sinal_pago' | 'pago' | 'estornado';
type OriginFilter = 'all' | 'site' | 'manual' | 'whatsapp' | 'leilao';
type PeriodFilter = 'all' | '7d' | '30d' | '90d';
type ExpiresFilter = 'all' | 'soon' | 'overdue';

export default function ReservasBoard({ initial, initialColumns }: Props) {
    const [items, setItems] = useState<ProductReservation[]>(initial);
    const [columns, setColumns] = useState<ReservaColumnRow[]>(initialColumns);
    const [activeDrag, setActiveDrag] = useState<ProductReservation | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [creating, setCreating] = useState(false);

    async function renameColumn(id: string, title: string) {
        const prev = columns;
        setColumns(cs => cs.map(c => c.id === id ? { ...c, title } : c));
        try {
            await updateReservaColumn(id, { title });
        } catch (err) {
            console.error(err);
            setColumns(prev);
        }
    }

    async function dropColumn(id: string) {
        const col = columns.find(c => c.id === id);
        if (!col) return;
        const cardCount = items.filter(r => r.status === id).length;
        const msg = cardCount > 0
            ? `Excluir a coluna "${col.title}"? Existem ${cardCount} reserva(s) com esse status — elas vão sumir do board até serem movidas para outro status.`
            : `Excluir a coluna "${col.title}"?`;
        if (!confirm(msg)) return;

        const prev = columns;
        setColumns(cs => cs.filter(c => c.id !== id));
        try {
            await deleteReservaColumn(id);
        } catch (err) {
            console.error(err);
            setColumns(prev);
        }
    }

    async function addColumn() {
        const title = prompt('Nome da nova coluna:');
        if (!title || !title.trim()) return;
        try {
            const created = await createReservaColumn(title.trim());
            setColumns(cs => [...cs, created]);
        } catch (err: any) {
            alert(err?.message ?? 'Erro ao criar coluna.');
        }
    }

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
    const [paymentStatus, setPaymentStatus] = useState<PaymentFilter>('all');
    const [origin, setOrigin] = useState<OriginFilter>('all');
    const [period, setPeriod] = useState<PeriodFilter>('all');
    const [expiresFilter, setExpiresFilter] = useState<ExpiresFilter>('all');
    const [assignee, setAssignee] = useState<string>('all');
    const [uf, setUf] = useState<string>('all');
    const [showSpecial, setShowSpecial] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Opções dinâmicas derivadas dos dados
    const assigneeOptions = useMemo(() => {
        const set = new Set<string>();
        for (const r of items) if (r.assigned_to) set.add(r.assigned_to);
        return Array.from(set).sort();
    }, [items]);

    const ufOptions = useMemo(() => {
        const set = new Set<string>();
        for (const r of items) if (r.customer_uf) set.add(r.customer_uf);
        return Array.from(set).sort();
    }, [items]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        const now = Date.now();
        const periodMs = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 0;

        return items.filter(r => {
            if (kind !== 'all' && r.product_kind !== kind) return false;
            if (priority !== 'all' && r.priority !== priority) return false;
            if (paymentStatus !== 'all' && (r.payment_status ?? 'pendente') !== paymentStatus) return false;
            if (origin !== 'all' && r.origin !== origin) return false;
            if (assignee !== 'all' && (r.assigned_to ?? '') !== assignee) return false;
            if (uf !== 'all' && (r.customer_uf ?? '') !== uf) return false;

            if (periodMs > 0) {
                const created = new Date(r.created_at).getTime();
                if (now - created > periodMs * 86_400_000) return false;
            }

            if (expiresFilter !== 'all') {
                if (!r.expires_at) return false;
                const ms = new Date(r.expires_at).getTime() - now;
                if (expiresFilter === 'overdue' && ms >= 0) return false;
                if (expiresFilter === 'soon'    && (ms < 0 || ms > 3 * 86_400_000)) return false;
            }

            if (!q) return true;
            return (
                r.customer_name.toLowerCase().includes(q) ||
                r.product_name.toLowerCase().includes(q) ||
                r.code.toLowerCase().includes(q) ||
                (r.customer_city ?? '').toLowerCase().includes(q) ||
                (r.customer_fazenda ?? '').toLowerCase().includes(q) ||
                (r.customer_phone ?? '').toLowerCase().includes(q) ||
                (r.assigned_to ?? '').toLowerCase().includes(q)
            );
        });
    }, [items, query, kind, priority, paymentStatus, origin, assignee, uf, period, expiresFilter]);

    // Quantos filtros ativos (excluindo busca/kind que já têm UI dedicada)
    const activeAdvancedFilters = [
        priority !== 'all',
        paymentStatus !== 'all',
        origin !== 'all',
        assignee !== 'all',
        uf !== 'all',
        period !== 'all',
        expiresFilter !== 'all',
    ].filter(Boolean).length;

    function clearAll() {
        setQuery('');
        setKind('all');
        setPriority('all');
        setPaymentStatus('all');
        setOrigin('all');
        setPeriod('all');
        setExpiresFilter('all');
        setAssignee('all');
        setUf('all');
    }

    function exportCsv() {
        const headers = [
            'Código','Tipo','Status','Prioridade','Criado em',
            'Produto','Central','Quantidade','Valor unitário','Valor total',
            'Cliente','Telefone','E-mail','CPF/CNPJ','Fazenda','Cidade','UF',
            'Forma pgto','Status pgto','Sinal',
            'Responsável','Origem','Prazo validade',
            'NF','Nº NF','Emitida em',
            'Logística','Data prevista','Enviado em','Entregue em','Rastreio',
            'UTM source','UTM medium','UTM campaign',
            'Observações',
        ];

        const escape = (v: any) => {
            if (v == null) return '';
            const s = String(v).replace(/"/g, '""');
            return /[";\n]/.test(s) ? `"${s}"` : s;
        };

        const fmtDate = (iso?: string | null) =>
            iso ? new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : '';

        const fmtNum = (n?: number | null) =>
            n == null ? '' : n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        const rows = filtered.map(r => [
            r.code,
            r.product_kind === 'semen' ? 'Sêmen' : 'Embrião',
            r.status,
            r.priority,
            fmtDate(r.created_at),
            r.product_name,
            r.central ?? '',
            r.quantity,
            fmtNum(r.unit_price),
            fmtNum(r.total_value),
            r.customer_name,
            r.customer_phone,
            r.customer_email ?? '',
            r.customer_doc ?? '',
            r.customer_fazenda ?? '',
            r.customer_city ?? '',
            r.customer_uf ?? '',
            r.payment_method ?? '',
            r.payment_status ?? '',
            fmtNum(r.down_payment),
            r.assigned_to ?? '',
            r.origin,
            fmtDate(r.expires_at),
            r.invoice_status ?? '',
            r.invoice_number ?? '',
            fmtDate(r.invoice_issued_at),
            r.logistics_type ?? '',
            r.expected_ship_at ?? '',
            fmtDate(r.shipped_at),
            fmtDate(r.delivered_at),
            r.tracking_code ?? '',
            r.utm_source ?? '',
            r.utm_medium ?? '',
            r.utm_campaign ?? '',
            r.notes ?? '',
        ]);

        const csv = [headers, ...rows].map(row => row.map(escape).join(';')).join('\r\n');
        // BOM pra Excel BR abrir UTF-8 corretamente
        const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const stamp = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = `reservas_${stamp}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    const grouped = useMemo(() => {
        const out: Record<string, ProductReservation[]> = {};
        for (const c of columns) out[c.id] = [];
        for (const s of RESERVA_SPECIAL_STAGES) out[s.id] = [];
        for (const r of filtered) {
            (out[r.status] ??= []).push(r);
        }
        for (const k of Object.keys(out)) {
            out[k].sort((a, b) => a.position - b.position);
        }
        return out;
    }, [filtered, columns]);

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
        <div className={isFullscreen
            ? 'fixed inset-0 z-[80] bg-white dark:bg-[#0A0A0A] flex flex-col p-4 overflow-auto'
            : 'flex flex-col'
        }>
            {/* ── Header ── */}
            <div className="flex flex-col gap-4 mb-4 shrink-0">
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

                {/* ── Linha 1 de filtros: busca + tipo + ações ── */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[240px] max-w-md">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Buscar por código, cliente, produto, telefone, fazenda…"
                            className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-[#141414] border border-gray-200 dark:border-[rgba(232,203,133,0.18)] focus:border-[#D4A85C] focus:outline-none text-gray-900 dark:text-[#F5F0E4]"
                            style={{ borderRadius: 3 }}
                        />
                    </div>

                    <FilterPill active={kind === 'all'}     onClick={() => setKind('all')}     label="Tudo" />
                    <FilterPill active={kind === 'semen'}   onClick={() => setKind('semen')}   label="Sêmen" />
                    <FilterPill active={kind === 'embriao'} onClick={() => setKind('embriao')} label="Embriões" />

                    <span className="w-px h-5 bg-gray-200 dark:bg-[rgba(232,203,133,0.18)] mx-1" />

                    <FilterButton
                        active={showAdvanced || activeAdvancedFilters > 0}
                        onClick={() => setShowAdvanced(s => !s)}
                        icon={<SlidersHorizontal size={12} />}
                    >
                        Filtros
                        {activeAdvancedFilters > 0 && (
                            <span
                                className="ml-1 inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold bg-[#0A0A0A] text-[#D4A85C] tabular-nums"
                                style={{ borderRadius: 2 }}
                            >
                                {activeAdvancedFilters}
                            </span>
                        )}
                        <ChevronDown size={11} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                    </FilterButton>

                    <FilterButton
                        active={showSpecial}
                        onClick={() => setShowSpecial(s => !s)}
                        icon={<Layers size={12} />}
                    >
                        Status especiais
                    </FilterButton>

                    <FilterButton
                        active={false}
                        onClick={() => router.refresh()}
                        icon={<RefreshCw size={12} />}
                    >
                        Atualizar
                    </FilterButton>

                    <FilterButton
                        active={false}
                        onClick={exportCsv}
                        icon={<Download size={12} />}
                    >
                        Exportar
                    </FilterButton>

                    <FilterButton
                        active={isFullscreen}
                        onClick={() => setIsFullscreen(f => !f)}
                        icon={isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                    >
                        {isFullscreen ? 'Sair' : 'Tela cheia'}
                    </FilterButton>

                    {(query || activeAdvancedFilters > 0 || kind !== 'all') && (
                        <button
                            onClick={clearAll}
                            className="inline-flex items-center gap-1 px-2 py-2 text-[11px] uppercase tracking-wider text-gray-500 dark:text-[#F5F0E4]/40 hover:text-red-400"
                            style={{ fontFamily: 'var(--font-mono), monospace', letterSpacing: '0.14em' }}
                        >
                            <XIcon size={11} />
                            Limpar
                        </button>
                    )}

                    <button
                        onClick={() => setCreating(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-wider bg-[#A0792E] hover:bg-[#D4A85C] text-[#0A0A0A] font-bold transition-colors"
                        style={{ borderRadius: 3, letterSpacing: '0.14em' }}
                    >
                        <Plus size={13} />
                        Nova reserva
                    </button>
                </div>

                {/* ── Linha 2 (avançada, expansível) ── */}
                {showAdvanced && (
                    <div
                        className="p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[rgba(232,203,133,0.14)]"
                        style={{ borderRadius: 3 }}
                    >
                        <FilterSelect
                            label="Prioridade"
                            value={priority}
                            onChange={(v) => setPriority(v as PriorityFilter)}
                            options={[
                                { id: 'all',    label: 'Todas' },
                                { id: 'alta',   label: 'Alta' },
                                { id: 'normal', label: 'Normal' },
                                { id: 'baixa',  label: 'Baixa' },
                            ]}
                        />
                        <FilterSelect
                            label="Pagamento"
                            value={paymentStatus}
                            onChange={(v) => setPaymentStatus(v as PaymentFilter)}
                            options={[
                                { id: 'all',        label: 'Qualquer' },
                                { id: 'pendente',   label: 'Pendente' },
                                { id: 'sinal_pago', label: 'Sinal pago' },
                                { id: 'pago',       label: 'Pago' },
                                { id: 'estornado',  label: 'Estornado' },
                            ]}
                        />
                        <FilterSelect
                            label="Origem"
                            value={origin}
                            onChange={(v) => setOrigin(v as OriginFilter)}
                            options={[
                                { id: 'all',      label: 'Qualquer' },
                                { id: 'site',     label: 'Site' },
                                { id: 'manual',   label: 'Manual' },
                                { id: 'whatsapp', label: 'WhatsApp' },
                                { id: 'leilao',   label: 'Leilão' },
                            ]}
                        />
                        <FilterSelect
                            label="Período"
                            value={period}
                            onChange={(v) => setPeriod(v as PeriodFilter)}
                            options={[
                                { id: 'all', label: 'Sempre' },
                                { id: '7d',  label: '7 dias' },
                                { id: '30d', label: '30 dias' },
                                { id: '90d', label: '90 dias' },
                            ]}
                        />
                        <FilterSelect
                            label="Prazo"
                            value={expiresFilter}
                            onChange={(v) => setExpiresFilter(v as ExpiresFilter)}
                            options={[
                                { id: 'all',     label: 'Todos' },
                                { id: 'soon',    label: '≤ 3 dias' },
                                { id: 'overdue', label: 'Vencidos' },
                            ]}
                        />
                        <FilterSelect
                            label="Responsável"
                            value={assignee}
                            onChange={setAssignee}
                            options={[
                                { id: 'all', label: 'Qualquer' },
                                ...assigneeOptions.map(a => ({ id: a, label: a })),
                            ]}
                        />
                        <FilterSelect
                            label="UF"
                            value={uf}
                            onChange={setUf}
                            options={[
                                { id: 'all', label: 'Todas' },
                                ...ufOptions.map(u => ({ id: u, label: u })),
                            ]}
                        />
                    </div>
                )}

                {/* Counter de resultado quando filtrado */}
                {(query || activeAdvancedFilters > 0 || kind !== 'all') && (
                    <p
                        className="text-[11px] text-gray-500 dark:text-[#F5F0E4]/50 -mt-1"
                        style={{ fontFamily: 'var(--font-mono), monospace', letterSpacing: '0.14em' }}
                    >
                        <span className="text-[#D4A85C]">{filtered.length}</span> de {items.length} reservas
                    </p>
                )}
            </div>

            {/* ── Board ── */}
            <div className="flex flex-col pb-2">
                <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd}>
                    <div className="flex gap-3 overflow-x-auto items-start pr-2 pb-2">
                        {columns.map(col => (
                            <ReservaColumn
                                key={col.id}
                                stage={{ id: col.id, label: col.title, hint: col.hint ?? undefined }}
                                items={grouped[col.id] ?? []}
                                onCardClick={(r) => setSelectedId(r.id)}
                                onRename={(title) => renameColumn(col.id, title)}
                                onDelete={() => dropColumn(col.id)}
                            />
                        ))}

                        {/* Botão de adicionar coluna no fim */}
                        <button
                            onClick={addColumn}
                            className="shrink-0 w-[290px] flex flex-col items-center justify-center min-h-[200px] border border-dashed border-gray-300 dark:border-[rgba(232,203,133,0.18)] text-gray-500 dark:text-[#F5F0E4]/40 hover:border-[#D4A85C] hover:text-[#D4A85C] transition-colors"
                            style={{
                                borderRadius: 3,
                                fontFamily: 'var(--font-mono), monospace',
                                fontSize: 11,
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                            }}
                        >
                            + nova coluna
                        </button>
                    </div>

                    {/* Trilho lateral de status especiais */}
                    {showSpecial && (
                        <div className="border-t border-gray-200 dark:border-[rgba(232,203,133,0.14)] pt-3 mt-2 shrink-0">
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
            </div>

            {/* ── Detail Modal ── */}
            {selected && (
                <ReservaDetail
                    reservation={selected}
                    columns={columns}
                    onClose={() => setSelectedId(null)}
                    onPatch={(updates) => patchItem(selected.id, updates)}
                    onArchive={() => { removeItem(selected.id); setSelectedId(null); }}
                />
            )}

            {/* ── Create Modal ── */}
            {creating && (
                <ReservaCreate
                    onClose={() => setCreating(false)}
                    onCreated={(r) => {
                        setItems(prev => [r, ...prev]);
                        setCreating(false);
                        setSelectedId(r.id);
                    }}
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

function FilterButton({
    active, onClick, icon, children,
}: {
    active: boolean;
    onClick: () => void;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-wider border transition-colors ${
                active
                    ? 'bg-[#A0792E] border-[#A0792E] text-[#0A0A0A]'
                    : 'bg-white dark:bg-[#141414] border-gray-200 dark:border-[rgba(232,203,133,0.18)] text-gray-700 dark:text-[#F5F0E4]/80 hover:border-[#D4A85C]'
            }`}
            style={{ borderRadius: 3, letterSpacing: '0.12em' }}
        >
            {icon}
            {children}
        </button>
    );
}

function FilterSelect({
    label, value, onChange, options,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { id: string; label: string }[];
}) {
    return (
        <label className="block">
            <span
                className="block mb-1 text-gray-500 dark:text-[#F5F0E4]/50"
                style={{
                    fontFamily: 'var(--font-mono), monospace',
                    fontSize: 9,
                    letterSpacing: '0.20em',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                }}
            >
                {label}
            </span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-[rgba(232,203,133,0.18)] focus:border-[#D4A85C] focus:outline-none text-gray-700 dark:text-[#F5F0E4]/80"
                style={{ borderRadius: 3 }}
            >
                {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
        </label>
    );
}
