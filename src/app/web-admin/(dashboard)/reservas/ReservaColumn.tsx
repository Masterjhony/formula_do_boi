'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Pencil, Trash2 } from 'lucide-react';
import { ProductReservation } from '@/lib/reservations';
import ReservaCard from './ReservaCard';

interface ColumnStage {
    id: string;
    label: string;
    hint?: string;
    tone?: 'warn' | 'danger' | 'neutral';
}

interface Props {
    stage: ColumnStage;
    items: ProductReservation[];
    onCardClick: (r: ProductReservation) => void;
    compact?: boolean;
    onRename?: (title: string) => void | Promise<void>;
    onDelete?: () => void | Promise<void>;
}

export default function ReservaColumn({ stage, items, onCardClick, compact, onRename, onDelete }: Props) {
    const { setNodeRef, isOver } = useDroppable({ id: `col:${stage.id}` });
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(stage.label);

    const commit = () => {
        const next = draft.trim();
        if (next && next !== stage.label && onRename) onRename(next);
        setEditing(false);
    };
    const cancel = () => { setDraft(stage.label); setEditing(false); };

    const toneBorder = stage.tone === 'danger'
        ? 'border-red-500/30'
        : stage.tone === 'warn'
            ? 'border-amber-500/30'
            : 'border-gray-200 dark:border-[rgba(232,203,133,0.14)]';

    const toneAccent = stage.tone === 'danger'
        ? 'text-red-400'
        : stage.tone === 'warn'
            ? 'text-amber-400'
            : 'text-[#D4A85C]';

    return (
        <div
            className={`flex flex-col shrink-0 ${compact ? 'w-[260px] h-auto' : 'w-[290px] min-h-[calc(100vh-220px)]'} bg-white dark:bg-[#202020] border ${toneBorder} relative`}
            style={{ borderRadius: 3 }}
        >
            {/* hairline tick brandbook */}
            <span aria-hidden className="absolute top-0 left-0 block" style={{ width: 28, height: 1, background: '#A0792E' }} />

            <div className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-[rgba(232,203,133,0.10)] group/header">
                <div className="flex items-center justify-between gap-2">
                    {editing ? (
                        <input
                            autoFocus
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onBlur={commit}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') commit();
                                if (e.key === 'Escape') cancel();
                            }}
                            className={`flex-1 min-w-0 px-1.5 py-0.5 bg-transparent border border-[#D4A85C] outline-none text-[10px] uppercase font-medium ${toneAccent}`}
                            style={{
                                fontFamily: 'var(--font-mono), monospace',
                                letterSpacing: '0.22em',
                                borderRadius: 2,
                            }}
                        />
                    ) : (
                        <p
                            className={`flex-1 min-w-0 truncate ${toneAccent} ${onRename ? 'cursor-text' : ''}`}
                            onClick={() => onRename && setEditing(true)}
                            title={onRename ? 'Clique pra renomear' : undefined}
                            style={{
                                fontFamily: 'var(--font-mono), monospace',
                                fontSize: 10,
                                letterSpacing: '0.22em',
                                textTransform: 'uppercase',
                                fontWeight: 500,
                            }}
                        >
                            {stage.label}
                        </p>
                    )}
                    <span
                        className="shrink-0 text-[10px] font-bold text-gray-700 dark:text-[#F5F0E4]/70 px-1.5 py-0.5 bg-gray-100 dark:bg-[#2A2A2A] tabular-nums"
                        style={{ borderRadius: 2 }}
                    >
                        {items.length}
                    </span>
                </div>
                {stage.hint && !compact && !editing && (
                    <p className="text-[11px] text-gray-400 dark:text-[#F5F0E4]/40 mt-1 leading-snug">
                        {stage.hint}
                    </p>
                )}
                {(onRename || onDelete) && !editing && (
                    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover/header:opacity-100 transition-opacity">
                        {onRename && (
                            <button
                                onClick={() => setEditing(true)}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-gray-500 dark:text-[#F5F0E4]/40 hover:text-[#D4A85C]"
                                style={{ fontFamily: 'var(--font-mono), monospace', letterSpacing: '0.16em' }}
                                title="Renomear coluna"
                            >
                                <Pencil size={10} /> Editar
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={onDelete}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-gray-500 dark:text-[#F5F0E4]/40 hover:text-red-400"
                                style={{ fontFamily: 'var(--font-mono), monospace', letterSpacing: '0.16em' }}
                                title="Excluir coluna"
                            >
                                <Trash2 size={10} /> Excluir
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div
                ref={setNodeRef}
                className={`flex-1 min-h-0 px-2 py-2 space-y-2 transition-colors ${isOver ? 'bg-[#A0792E]/5' : ''}`}
            >
                <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                    {items.map(r => (
                        <ReservaCard
                            key={r.id}
                            reservation={r}
                            onClick={() => onCardClick(r)}
                        />
                    ))}
                </SortableContext>
                {items.length === 0 && (
                    <div
                        className="flex items-center justify-center min-h-[80px] border border-dashed border-gray-200 dark:border-[rgba(232,203,133,0.12)] text-[11px] text-gray-400 dark:text-[#F5F0E4]/30 uppercase tracking-wider"
                        style={{
                            fontFamily: 'var(--font-mono), monospace',
                            letterSpacing: '0.18em',
                            borderRadius: 3,
                        }}
                    >
                        sem reservas
                    </div>
                )}
            </div>
        </div>
    );
}
