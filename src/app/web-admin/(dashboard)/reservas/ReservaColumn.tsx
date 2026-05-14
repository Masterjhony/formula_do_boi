'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
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
}

export default function ReservaColumn({ stage, items, onCardClick, compact }: Props) {
    const { setNodeRef, isOver } = useDroppable({ id: `col:${stage.id}` });

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
            className={`flex flex-col shrink-0 ${compact ? 'w-[260px] h-auto' : 'w-[290px] min-h-[calc(100vh-220px)]'} bg-white dark:bg-[#141414] border ${toneBorder} relative`}
            style={{ borderRadius: 3 }}
        >
            {/* hairline tick brandbook */}
            <span aria-hidden className="absolute top-0 left-0 block" style={{ width: 28, height: 1, background: '#A0792E' }} />

            <div className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-[rgba(232,203,133,0.10)]">
                <div className="flex items-center justify-between gap-2">
                    <p
                        className={toneAccent}
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
                    <span
                        className="text-[10px] font-bold text-gray-700 dark:text-[#F5F0E4]/70 px-1.5 py-0.5 bg-gray-100 dark:bg-[#1E1E1E] tabular-nums"
                        style={{ borderRadius: 2 }}
                    >
                        {items.length}
                    </span>
                </div>
                {stage.hint && !compact && (
                    <p className="text-[11px] text-gray-400 dark:text-[#F5F0E4]/40 mt-1 leading-snug">
                        {stage.hint}
                    </p>
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
