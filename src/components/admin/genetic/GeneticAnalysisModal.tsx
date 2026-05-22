'use client';

import { useEffect } from 'react';
import { X, Calendar, FileText } from 'lucide-react';
import { GeneticAnalysisCard, type GeneticProduct } from './GeneticAnalysisCard';

interface GeneticAnalysisModalProps {
    product: GeneticProduct | null;
    catalogProducts: GeneticProduct[];
    onClose: () => void;
}

export function GeneticAnalysisModal({ product, catalogProducts, onClose }: GeneticAnalysisModalProps) {
    useEffect(() => {
        if (!product) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        // Prevent body scroll while open
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handler);
            document.body.style.overflow = prev;
        };
    }, [product, onClose]);

    if (!product) return null;

    const registro = product.registro
        || (product.details && typeof product.details === 'object' && 'registro' in product.details ? String((product.details as Record<string, unknown>).registro) : null);
    const pai = product.pai
        || (product.details && typeof product.details === 'object' && 'pai' in product.details ? String((product.details as Record<string, unknown>).pai) : null);
    const mae = product.mae
        || (product.details && typeof product.details === 'object' && 'mae' in product.details ? String((product.details as Record<string, unknown>).mae) : null);

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Análise genética"
            className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-8 pt-[8vh]"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div
                onClick={e => e.stopPropagation()}
                className="relative w-full max-w-md bg-white dark:bg-[#1B1B1B] border border-gray-200 dark:border-[rgba(212,168,92,0.22)] shadow-2xl shadow-black/40 overflow-hidden flex flex-col max-h-[88vh]"
                style={{ borderRadius: 4 }}
            >
                {/* Compact product header */}
                <div className="px-5 py-4 border-b border-gray-100 dark:border-[rgba(212,168,92,0.14)] flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                        <p
                            className="text-[9px] font-bold uppercase mb-1"
                            style={{
                                fontFamily: 'var(--font-mono), ui-monospace, monospace',
                                letterSpacing: '0.22em',
                                color: '#D4A85C',
                            }}
                        >
                            § Lote
                        </p>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white truncate" style={{ letterSpacing: '-0.01em' }}>
                            {product.name || 'Animal sem nome'}
                        </h2>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-500 dark:text-gray-400 flex-wrap">
                            {registro && (
                                <span className="inline-flex items-center gap-1">
                                    <FileText size={9} />
                                    <span className="font-mono tabular-nums">{registro}</span>
                                </span>
                            )}
                            {product.nascimento && (
                                <span className="inline-flex items-center gap-1">
                                    <Calendar size={9} />
                                    <span className="font-mono tabular-nums">{product.nascimento}</span>
                                </span>
                            )}
                            {(pai || mae) && (
                                <span className="font-medium">
                                    {pai && <>Pai: <span className="text-gray-700 dark:text-gray-300">{pai}</span></>}
                                    {pai && mae && ' · '}
                                    {mae && <>Mãe: <span className="text-gray-700 dark:text-gray-300">{mae}</span></>}
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Fechar"
                        className="shrink-0 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#262626] text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                    <GeneticAnalysisCard product={product} catalogProducts={catalogProducts} />
                </div>
            </div>
        </div>
    );
}
