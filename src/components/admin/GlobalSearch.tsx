'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search, X, Loader2, ArrowRight,
    Users, Package, Gavel, BarChart3, ListChecks, Award, CornerDownLeft,
} from 'lucide-react';

type HitType = 'lead' | 'product' | 'leilao' | 'fechamento' | 'task' | 'breeder';

interface SearchHit {
    id: string;
    title: string;
    subtitle?: string;
    href: string;
    type: HitType;
}

const TYPE_META: Record<HitType, { label: string; icon: React.ElementType }> = {
    lead: { label: 'Lead', icon: Users },
    product: { label: 'Produto', icon: Package },
    leilao: { label: 'Leilão', icon: Gavel },
    fechamento: { label: 'Fechamento', icon: BarChart3 },
    task: { label: 'Tarefa', icon: ListChecks },
    breeder: { label: 'Criador', icon: Award },
};

const TYPE_ORDER: HitType[] = ['lead', 'product', 'leilao', 'fechamento', 'task', 'breeder'];

function detectMac(): boolean {
    if (typeof window === 'undefined') return false;
    return /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [hits, setHits] = useState<SearchHit[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeIdx, setActiveIdx] = useState(0);
    const [isMac, setIsMac] = useState(false);

    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<number | undefined>(undefined);
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => { setIsMac(detectMac()); }, []);

    // Global ⌘K / Ctrl+K shortcut
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setOpen(o => !o);
            } else if (e.key === '/' && !open && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                e.preventDefault();
                setOpen(true);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open]);

    // Reset on close
    useEffect(() => {
        if (!open) {
            setQuery('');
            setHits([]);
            setActiveIdx(0);
            abortRef.current?.abort();
        } else {
            // Focus input after frame
            requestAnimationFrame(() => inputRef.current?.focus());
        }
    }, [open]);

    // Debounced search
    useEffect(() => {
        if (debounceRef.current) window.clearTimeout(debounceRef.current);

        if (query.trim().length < 2) {
            setHits([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        debounceRef.current = window.setTimeout(async () => {
            abortRef.current?.abort();
            const ctrl = new AbortController();
            abortRef.current = ctrl;
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, { signal: ctrl.signal });
                if (!res.ok) throw new Error('search failed');
                const json = await res.json();
                setHits((json.hits ?? []) as SearchHit[]);
                setActiveIdx(0);
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    setHits([]);
                }
            } finally {
                setLoading(false);
            }
        }, 220);

        return () => {
            if (debounceRef.current) window.clearTimeout(debounceRef.current);
        };
    }, [query]);

    const goToHit = useCallback((hit: SearchHit) => {
        setOpen(false);
        router.push(hit.href);
    }, [router]);

    // Keyboard nav inside modal
    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            setOpen(false);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIdx(i => Math.min(i + 1, hits.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIdx(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const h = hits[activeIdx];
            if (h) goToHit(h);
        }
    };

    // Group hits by type, preserving order
    const grouped: Array<{ type: HitType; items: SearchHit[] }> = [];
    for (const t of TYPE_ORDER) {
        const items = hits.filter(h => h.type === t);
        if (items.length) grouped.push({ type: t, items });
    }

    const flatList = grouped.flatMap(g => g.items);
    const shortcut = isMac ? '⌘K' : 'Ctrl+K';

    return (
        <>
            {/* Trigger (header inline button) */}
            <button
                onClick={() => setOpen(true)}
                aria-label="Buscar"
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-sm border border-gray-200 dark:border-[rgba(212,168,92,0.20)] bg-gray-50 dark:bg-[#0F0F0F] hover:border-[#A0792E]/50 hover:bg-white dark:hover:bg-[#141414] transition-all group"
                style={{ borderRadius: 3, minWidth: 220 }}
            >
                <Search size={13} className="text-gray-400 group-hover:text-[#A0792E] transition-colors" />
                <span className="text-xs text-gray-400 dark:text-[#F5F0E4]/45 flex-1 text-left truncate">Buscar leads, produtos, leilões…</span>
                <kbd
                    className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded border border-gray-200 dark:border-[rgba(212,168,92,0.18)] bg-white dark:bg-[#1A1A1A]"
                    style={{
                        fontFamily: 'var(--font-mono), ui-monospace, monospace',
                        fontSize: 9,
                        letterSpacing: '0.12em',
                        color: '#D4A85C',
                    }}
                >
                    {shortcut}
                </kbd>
            </button>

            {/* Mobile trigger (icon only) */}
            <button
                onClick={() => setOpen(true)}
                aria-label="Buscar"
                className="md:hidden flex items-center justify-center p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1A1A1A] hover:text-[#A0792E] transition-all"
            >
                <Search size={18} />
            </button>

            {/* Spotlight Modal */}
            {open && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Busca global"
                    className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-8 pt-[15vh] sm:pt-[12vh]"
                    onClick={() => setOpen(false)}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" />

                    {/* Panel */}
                    <div
                        onClick={e => e.stopPropagation()}
                        className="relative w-full max-w-2xl bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[rgba(212,168,92,0.22)] shadow-2xl shadow-black/40 overflow-hidden flex flex-col max-h-[70vh]"
                        style={{ borderRadius: 4 }}
                    >
                        {/* Brand hairline */}
                        <span aria-hidden className="absolute top-0 left-0 block" style={{ width: 48, height: 1, background: '#A0792E' }} />

                        {/* Search input */}
                        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-[rgba(212,168,92,0.14)]">
                            <Search size={16} className="text-[#A0792E] shrink-0" />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyDown={onKeyDown}
                                placeholder="Buscar leads, produtos, leilões, contratos, tarefas…"
                                className="flex-1 bg-transparent text-sm text-gray-900 dark:text-[#F5F0E4] placeholder:text-gray-400 dark:placeholder:text-[#F5F0E4]/35 outline-none border-none"
                                autoComplete="off"
                                spellCheck={false}
                            />
                            {loading && <Loader2 size={14} className="animate-spin text-[#A0792E]" />}
                            <button
                                onClick={() => setOpen(false)}
                                aria-label="Fechar"
                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#1A1A1A] text-gray-400 hover:text-gray-700 dark:hover:text-[#F5F0E4] transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        {/* Results */}
                        <div className="flex-1 overflow-y-auto">
                            {query.trim().length < 2 ? (
                                <EmptyHint shortcut={shortcut} />
                            ) : loading && hits.length === 0 ? (
                                <div className="px-4 py-12 flex flex-col items-center gap-3 text-gray-400">
                                    <Loader2 size={20} className="animate-spin text-[#A0792E]" />
                                    <span className="text-xs">Buscando…</span>
                                </div>
                            ) : hits.length === 0 ? (
                                <NoResults query={query} />
                            ) : (
                                <div className="py-2">
                                    {grouped.map(group => {
                                        const meta = TYPE_META[group.type];
                                        const Icon = meta.icon;
                                        return (
                                            <div key={group.type} className="py-1">
                                                <div className="flex items-center gap-2 px-4 pt-2 pb-1.5">
                                                    <Icon size={11} className="text-[#D4A85C]" />
                                                    <span
                                                        className="text-[10px] font-bold uppercase"
                                                        style={{
                                                            fontFamily: 'var(--font-mono), ui-monospace, monospace',
                                                            letterSpacing: '0.22em',
                                                            color: '#D4A85C',
                                                        }}
                                                    >
                                                        {meta.label} · {group.items.length}
                                                    </span>
                                                </div>
                                                {group.items.map(hit => {
                                                    const flatIdx = flatList.findIndex(h => h.id === hit.id);
                                                    const isActive = flatIdx === activeIdx;
                                                    return (
                                                        <button
                                                            key={hit.id}
                                                            onClick={() => goToHit(hit)}
                                                            onMouseEnter={() => setActiveIdx(flatIdx)}
                                                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors group ${
                                                                isActive
                                                                    ? 'bg-[#A0792E]/12 text-gray-900 dark:text-[#D4A85C]'
                                                                    : 'text-gray-700 dark:text-[#F5F0E4]/80 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]'
                                                            }`}
                                                        >
                                                            <div
                                                                className="w-8 h-8 rounded-sm flex items-center justify-center shrink-0"
                                                                style={{
                                                                    backgroundColor: isActive ? '#A0792E' : 'rgba(160,121,46,0.10)',
                                                                    color: isActive ? '#0A0A0A' : '#A0792E',
                                                                    borderRadius: 3,
                                                                }}
                                                            >
                                                                <Icon size={14} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-bold truncate" style={{ letterSpacing: '-0.005em' }}>
                                                                    {hit.title}
                                                                </p>
                                                                {hit.subtitle && (
                                                                    <p className="text-[11px] text-gray-500 dark:text-[#F5F0E4]/45 truncate mt-0.5">
                                                                        {hit.subtitle}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <ArrowRight
                                                                size={13}
                                                                className={`shrink-0 transition-all ${
                                                                    isActive ? 'text-[#A0792E] translate-x-0.5' : 'text-gray-300 dark:text-[#F5F0E4]/20'
                                                                }`}
                                                            />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-100 dark:border-[rgba(212,168,92,0.14)] px-4 py-2 flex items-center justify-between bg-gray-50/50 dark:bg-[#0A0A0A]/50">
                            <div className="flex items-center gap-3 text-[10px] text-gray-500 dark:text-[#F5F0E4]/40">
                                <ShortcutHint label="navegar">
                                    <kbd className="kbd">↑</kbd>
                                    <kbd className="kbd">↓</kbd>
                                </ShortcutHint>
                                <ShortcutHint label="abrir">
                                    <CornerDownLeft size={9} />
                                </ShortcutHint>
                                <ShortcutHint label="fechar">
                                    <kbd className="kbd">esc</kbd>
                                </ShortcutHint>
                            </div>
                            <span
                                className="text-[10px]"
                                style={{
                                    fontFamily: 'var(--font-mono), ui-monospace, monospace',
                                    letterSpacing: '0.22em',
                                    textTransform: 'uppercase',
                                    color: 'rgba(212,168,92,0.6)',
                                }}
                            >
                                Fórmula do Boi · §
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Inline styles for kbd helper class */}
            <style jsx>{`
                :global(.kbd) {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 16px;
                    padding: 1px 4px;
                    border: 1px solid rgba(212, 168, 92, 0.18);
                    border-radius: 2px;
                    background: rgba(255, 255, 255, 0.04);
                    font-family: var(--font-mono), ui-monospace, monospace;
                    font-size: 9px;
                    color: #D4A85C;
                }
            `}</style>
        </>
    );
}

function ShortcutHint({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <span className="flex items-center gap-1">
            <span className="flex items-center gap-0.5">{children}</span>
            <span className="uppercase tracking-widest" style={{ fontSize: 8, letterSpacing: '0.18em' }}>
                {label}
            </span>
        </span>
    );
}

function EmptyHint({ shortcut }: { shortcut: string }) {
    const examples = [
        { kind: 'Lead', value: 'Adil Júnior' },
        { kind: 'Produto', value: 'Imperador da Matinha' },
        { kind: 'Leilão', value: 'Genética Aditiva' },
        { kind: 'Tarefa', value: 'Catálogo PO' },
    ];
    return (
        <div className="px-5 py-8">
            <p
                className="text-[10px] mb-3"
                style={{
                    fontFamily: 'var(--font-mono), ui-monospace, monospace',
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: '#D4A85C',
                }}
            >
                § Sugestões de busca
            </p>
            <div className="grid grid-cols-2 gap-2">
                {examples.map(ex => (
                    <div
                        key={ex.kind}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] rounded-sm border border-gray-100 dark:border-[rgba(212,168,92,0.10)]"
                        style={{ borderRadius: 3 }}
                    >
                        <span
                            className="text-[9px] font-bold uppercase shrink-0"
                            style={{
                                fontFamily: 'var(--font-mono), ui-monospace, monospace',
                                letterSpacing: '0.18em',
                                color: '#D4A85C',
                            }}
                        >
                            {ex.kind}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-[#F5F0E4]/65 truncate">{ex.value}</span>
                    </div>
                ))}
            </div>
            <p className="text-[10px] text-gray-400 dark:text-[#F5F0E4]/35 mt-4">
                Digite ao menos 2 caracteres. Atalho global: <span className="text-[#D4A85C] font-mono">{shortcut}</span>
            </p>
        </div>
    );
}

function NoResults({ query }: { query: string }) {
    return (
        <div className="px-5 py-10 flex flex-col items-center gap-2 text-center">
            <Search size={20} className="text-gray-300 dark:text-[#F5F0E4]/20" />
            <p className="text-sm font-bold text-gray-700 dark:text-[#F5F0E4]/80">Sem resultados para “{query}”</p>
            <p className="text-[11px] text-gray-400 dark:text-[#F5F0E4]/40">
                Tente outro termo ou parte de um nome, telefone ou registro.
            </p>
        </div>
    );
}
