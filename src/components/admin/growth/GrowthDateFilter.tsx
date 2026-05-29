'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Calendar, Check, ChevronDown } from 'lucide-react';

const BRONZE = '#A0792E';

export const RANGE_PRESETS = [
    { key: '7d', label: '7 dias' },
    { key: '30d', label: '30 dias' },
    { key: '90d', label: '90 dias' },
    { key: 'mes', label: 'Este mês' },
    { key: 'tudo', label: 'Tudo' },
] as const;

export type RangeKey = typeof RANGE_PRESETS[number]['key'];

/**
 * Filtro de data do painel de growth. Persiste a seleção em searchParams
 * (?range=… ou ?from=…&to=…) e deixa o server component reler e reescopar
 * todas as métricas. Sem range custom, usa um dos presets.
 */
export function GrowthDateFilter() {
    const router = useRouter();
    const params = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [customOpen, setCustomOpen] = useState(false);

    const from = params.get('from') ?? '';
    const to = params.get('to') ?? '';
    const isCustom = Boolean(from && to);
    const activeRange = (params.get('range') as RangeKey) || (isCustom ? null : '30d');

    const [fromDraft, setFromDraft] = useState(from);
    const [toDraft, setToDraft] = useState(to);

    const apply = (next: URLSearchParams) => {
        startTransition(() => {
            const qs = next.toString();
            router.replace(qs ? `?${qs}` : '?', { scroll: false });
        });
    };

    const selectPreset = (key: RangeKey) => {
        const next = new URLSearchParams(params.toString());
        next.delete('from');
        next.delete('to');
        if (key === '30d') next.delete('range');
        else next.set('range', key);
        setCustomOpen(false);
        apply(next);
    };

    const applyCustom = () => {
        if (!fromDraft || !toDraft) return;
        const next = new URLSearchParams(params.toString());
        next.delete('range');
        next.set('from', fromDraft);
        next.set('to', toDraft);
        apply(next);
    };

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <div
                className="inline-flex items-center rounded-lg border overflow-hidden"
                style={{ borderColor: `${BRONZE}33` }}
                role="tablist"
                aria-label="Período"
            >
                <span className="pl-2.5 pr-1 text-gray-400">
                    <Calendar size={13} />
                </span>
                {RANGE_PRESETS.map(p => {
                    const active = !isCustom && activeRange === p.key;
                    return (
                        <button
                            key={p.key}
                            role="tab"
                            aria-selected={active}
                            onClick={() => selectPreset(p.key)}
                            className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors"
                            style={active
                                ? { backgroundColor: BRONZE, color: '#161616' }
                                : { color: 'var(--tw-prose-body)', opacity: 0.7 }}
                        >
                            <span className={active ? '' : 'text-gray-500 dark:text-gray-400'}>{p.label}</span>
                        </button>
                    );
                })}
                <button
                    onClick={() => setCustomOpen(o => !o)}
                    aria-expanded={customOpen}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors border-l"
                    style={isCustom
                        ? { backgroundColor: BRONZE, color: '#161616', borderColor: `${BRONZE}33` }
                        : { color: '#9CA3AF', borderColor: `${BRONZE}33` }}
                >
                    {isCustom ? `${fmtShort(from)}–${fmtShort(to)}` : 'Personalizado'}
                    <ChevronDown size={11} className={customOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
                </button>
            </div>

            {isPending && (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" style={{ color: BRONZE }} />
            )}

            {customOpen && (
                <div className="flex items-end gap-2 rounded-lg border p-2.5 bg-white dark:bg-[#161616]" style={{ borderColor: `${BRONZE}33` }}>
                    <label className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">De</span>
                        <input
                            type="date"
                            value={fromDraft}
                            max={toDraft || undefined}
                            onChange={e => setFromDraft(e.target.value)}
                            className="text-xs rounded-md border border-gray-200 dark:border-[#2A2A2A] bg-transparent px-2 py-1 text-gray-900 dark:text-gray-100"
                        />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Até</span>
                        <input
                            type="date"
                            value={toDraft}
                            min={fromDraft || undefined}
                            onChange={e => setToDraft(e.target.value)}
                            className="text-xs rounded-md border border-gray-200 dark:border-[#2A2A2A] bg-transparent px-2 py-1 text-gray-900 dark:text-gray-100"
                        />
                    </label>
                    <button
                        onClick={applyCustom}
                        disabled={!fromDraft || !toDraft}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider disabled:opacity-40"
                        style={{ backgroundColor: BRONZE, color: '#161616' }}
                    >
                        <Check size={12} /> Aplicar
                    </button>
                </div>
            )}
        </div>
    );
}

function fmtShort(iso: string) {
    const [, m, d] = iso.split('-');
    return d && m ? `${d}/${m}` : iso;
}
