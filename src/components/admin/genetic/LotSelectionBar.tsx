'use client';

import { X, Check } from 'lucide-react';
import type { GeneticProduct } from './GeneticAnalysisCard';

const BRAND = {
    BRONZE: '#A0792E',
    BRONZE_PALE: '#D4A85C',
    TECH_GREEN: '#7FD4A0',
} as const;

interface LotSelectionBarProps {
    selected: GeneticProduct[];
    onRemove: (id: string | number) => void;
    onClear: () => void;
}

export function LotSelectionBar({ selected, onRemove, onClear }: LotSelectionBarProps) {
    if (selected.length === 0) return null;

    return (
        <div className="fixed bottom-4 left-3 right-3 sm:left-6 sm:right-6 z-40">
            <div
                className="mx-auto max-w-4xl bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[rgba(212,168,92,0.22)] shadow-2xl shadow-black/30 backdrop-blur-xl flex items-center gap-3 px-4 py-3"
                style={{ borderRadius: 6 }}
            >
                {/* Brand hairline */}
                <span aria-hidden className="absolute top-0 left-0 block" style={{ width: 40, height: 1, background: BRAND.BRONZE }} />

                {/* Counter */}
                <div className="shrink-0">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shadow-md"
                            style={{
                                background: `linear-gradient(135deg, ${BRAND.BRONZE}, ${BRAND.BRONZE_PALE})`,
                                color: '#0A0A0A',
                                fontFamily: 'var(--font-mono), ui-monospace, monospace',
                                boxShadow: `0 4px 14px ${BRAND.BRONZE}40`,
                            }}
                        >
                            {selected.length}
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                                {selected.length === 1 ? 'animal selecionado' : 'animais selecionados'}
                            </p>
                            <p
                                className="text-[9px]"
                                style={{
                                    fontFamily: 'var(--font-mono), ui-monospace, monospace',
                                    letterSpacing: '0.16em',
                                    textTransform: 'uppercase',
                                    color: BRAND.BRONZE_PALE,
                                }}
                            >
                                no comparativo
                            </p>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-[rgba(212,168,92,0.18)]" />

                {/* Selected chips */}
                <div className="flex-1 flex gap-1.5 overflow-x-auto scrollbar-thin py-0.5">
                    {selected.map(p => (
                        <div
                            key={p.id}
                            className="shrink-0 flex items-center gap-1.5 pl-2 pr-1.5 py-1 border"
                            style={{
                                borderRadius: 3,
                                borderColor: `${BRAND.BRONZE}33`,
                                backgroundColor: `${BRAND.BRONZE}0F`,
                            }}
                        >
                            <Check size={10} style={{ color: BRAND.TECH_GREEN }} />
                            <span className="text-[11px] font-bold text-gray-800 dark:text-gray-100 truncate max-w-[140px]">
                                {p.name || 'Sem nome'}
                            </span>
                            <button
                                onClick={() => onRemove(p.id)}
                                className="p-0.5 rounded hover:bg-black/10 text-gray-500 hover:text-[#A04545] transition-colors"
                                aria-label={`Remover ${p.name}`}
                            >
                                <X size={11} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Clear */}
                <button
                    onClick={onClear}
                    className="shrink-0 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-[#A04545] transition-colors"
                    style={{
                        fontFamily: 'var(--font-mono), ui-monospace, monospace',
                        letterSpacing: '0.18em',
                    }}
                >
                    Limpar
                </button>
            </div>
        </div>
    );
}
