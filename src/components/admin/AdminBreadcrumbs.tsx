'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ChevronRight } from 'lucide-react';

// ── Route map (must align with admin layout nav) ──────────────────────────────
// Labels follow brandbook tone: técnico, conciso, premium.
const ROUTE_MAP: Record<string, { label: string; section?: string }> = {
    '': { label: 'Dashboard' },
    'analytics': { label: 'Analytics', section: 'Ferramentas' },
    'animal-availability': { label: 'Disponibilidade', section: 'Animais' },
    'biblioteca-midia': { label: 'Biblioteca de Mídia', section: 'Ferramentas' },
    'breeders': { label: 'Criadores' },
    'central-bela-vista': { label: 'Central Bela Vista' },
    'contratos': { label: 'Contratos', section: 'Operações' },
    'crm': { label: 'CRM', section: 'Vendas & Marketing' },
    'genealogia': { label: 'Genealogia' },
    'ia': { label: 'IA Mapeamento', section: 'Ferramentas' },
    'leads': { label: 'Leads', section: 'Vendas & Marketing' },
    'leiloes': { label: 'Leilões' },
    'fechamento': { label: 'Fechamento', section: 'Leilões' },
    'lotes-doadoras': { label: 'Lotes Doadoras', section: 'Animais' },
    'lotes-touros': { label: 'Lotes Touros', section: 'Animais' },
    'okr': { label: 'OKR', section: 'Operações' },
    'products': { label: 'Catálogo' },
    'new': { label: 'Novo' },
    'settings': { label: 'Configurações', section: 'Administração' },
    'tactical-plan': { label: 'Projetos', section: 'Operações' },
    'agenda': { label: 'Agenda Oficial', section: 'Operações' },
    'users': { label: 'Usuários', section: 'Administração' },
    'vendas-marketing': { label: 'Visão Geral', section: 'Vendas & Marketing' },
    'whatsapp': { label: 'WhatsApp', section: 'Administração' },
};

function labelFor(segment: string, idx: number, segments: string[]): string {
    const known = ROUTE_MAP[segment];
    if (known) return known.label;
    // Dynamic id segment: try to show "#<short-id>" or fallback to title-cased
    const prev = segments[idx - 1];
    if (prev === 'products' || prev === 'leads' || prev === 'crm' || prev === 'leiloes') {
        return segment.length > 8 ? `#${segment.slice(0, 6)}` : `#${segment}`;
    }
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
}

function sectionFor(firstSegment: string): string | undefined {
    return ROUTE_MAP[firstSegment]?.section;
}

export function AdminBreadcrumbs() {
    const pathname = usePathname();

    // Hide on Dashboard root — pointless
    if (!pathname || pathname === '/') return null;

    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return null;

    const section = sectionFor(segments[0]);

    // Build crumbs incrementally with hrefs
    const crumbs = segments.map((seg, i) => ({
        label: labelFor(seg, i, segments),
        href: '/' + segments.slice(0, i + 1).join('/'),
    }));

    return (
        <nav
            aria-label="Trilha de navegação"
            className="border-b border-gray-200/60 dark:border-[rgba(212,168,92,0.10)] bg-white/40 dark:bg-[#0A0A0A]/40 backdrop-blur-sm"
        >
            <div className="px-3 sm:px-4 lg:px-6 py-2 flex items-center gap-2 text-xs overflow-x-auto scrollbar-thin">
                {/* Section tag (optional) */}
                {section && (
                    <span
                        className="hidden sm:inline-flex shrink-0 px-2 py-0.5 rounded-sm font-bold uppercase"
                        style={{
                            fontFamily: 'var(--font-mono), ui-monospace, monospace',
                            fontSize: 9,
                            letterSpacing: '0.18em',
                            color: '#D4A85C',
                            backgroundColor: 'rgba(160,121,46,0.08)',
                        }}
                    >
                        § {section}
                    </span>
                )}

                <Link
                    href="/"
                    className="shrink-0 flex items-center gap-1.5 text-gray-400 hover:text-[#A0792E] dark:hover:text-[#D4A85C] transition-colors"
                    aria-label="Dashboard"
                >
                    <Home size={12} />
                </Link>

                {crumbs.map((c, i) => {
                    const isLast = i === crumbs.length - 1;
                    return (
                        <span key={c.href} className="flex items-center gap-2 min-w-0">
                            <ChevronRight size={11} className="text-gray-300 dark:text-[rgba(212,168,92,0.25)] shrink-0" />
                            {isLast ? (
                                <span
                                    className="font-bold text-gray-900 dark:text-[#F5F0E4] truncate max-w-[220px]"
                                    style={{ letterSpacing: '-0.005em' }}
                                    aria-current="page"
                                >
                                    {c.label}
                                </span>
                            ) : (
                                <Link
                                    href={c.href}
                                    className="text-gray-500 dark:text-[#F5F0E4]/55 hover:text-[#A0792E] dark:hover:text-[#D4A85C] transition-colors truncate max-w-[160px]"
                                >
                                    {c.label}
                                </Link>
                            )}
                        </span>
                    );
                })}
            </div>
        </nav>
    );
}
