'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
    LayoutDashboard, Wallet, Calculator, LogOut, Menu, X, Settings,
    ChevronDown, ArrowDownToLine, ArrowUpFromLine, BarChart3, Gavel,
    CheckCircle2, TrendingUp, Scale, BookOpen, Receipt, FileSpreadsheet,
    FileUp, Handshake, Percent,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { ThemeToggle } from '@/components/theme-toggle';

type NavItem = { href: string; label: string; icon: React.ElementType; tab?: string };
type NavGroup = { label: string; icon: React.ElementType; items: NavItem[] };
type NavEntry = NavItem | NavGroup;

function isGroup(e: NavEntry): e is NavGroup {
    return 'items' in e;
}

const navConfig: NavEntry[] = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    {
        label: 'Financeiro', icon: Wallet,
        items: [
            { href: '/financeiro', label: 'Visão Geral', icon: LayoutDashboard },
            { href: '/financeiro/a-receber', label: 'A Receber', icon: ArrowDownToLine },
            { href: '/financeiro/a-pagar', label: 'A Pagar', icon: ArrowUpFromLine },
            { href: '/financeiro/fluxo-caixa', label: 'Fluxo de Caixa', icon: BarChart3 },
            { href: '/financeiro/conciliacao', label: 'Conciliação', icon: CheckCircle2 },
            { href: '/financeiro/conciliacao-ofx', label: 'Conciliação OFX', icon: FileUp },
        ],
    },
    {
        label: 'Leilões', icon: Gavel,
        items: [
            { href: '/leiloes', label: 'Fechamentos', icon: Gavel },
            { href: '/leiloes/acordos', label: 'Acordos com Criadores', icon: Handshake },
            { href: '/leiloes/comissoes', label: 'Comissões de Assessores', icon: Percent },
        ],
    },
    {
        label: 'Contábil', icon: Calculator,
        items: [
            { href: '/contabil', label: 'Visão Geral', icon: Calculator },
            { href: '/contabil?tab=dre', label: 'DRE', icon: TrendingUp, tab: 'dre' },
            { href: '/contabil?tab=balanco', label: 'Balanço Patrimonial', icon: Scale, tab: 'balanco' },
            { href: '/contabil?tab=plano', label: 'Plano de Contas', icon: BookOpen, tab: 'plano' },
            { href: '/contabil?tab=nfe', label: 'Notas Fiscais', icon: Receipt, tab: 'nfe' },
            { href: '/contabil?tab=razao', label: 'Livro Razão', icon: FileSpreadsheet, tab: 'razao' },
        ],
    },
    { href: '/configuracoes', label: 'Configurações', icon: Settings },
];

export default function ERPNavbarLayout({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const supabase = createClient();
    const navRef = useRef<HTMLDivElement>(null);
    const mobileNavRef = useRef<HTMLDivElement>(null);
    const userRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return router.push('/login');
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        checkUser();
    }, [router, supabase]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            const inDesktopNav = navRef.current?.contains(target);
            const inMobileNav = mobileNavRef.current?.contains(target);
            if (!inDesktopNav && !inMobileNav) setOpenDropdown(null);
            if (userRef.current && !userRef.current.contains(target)) setUserMenuOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => { setMobileOpen(false); setOpenDropdown(null); }, [pathname, searchParams]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-[#0A0A0A] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A0792E]" />
            </div>
        );
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    const currentTab = searchParams.get('tab');

    const isItemActive = (item: NavItem) => {
        if (item.tab) {
            return pathname === '/contabil' && currentTab === item.tab;
        }
        // Bare /contabil with no tab → active only when no tab is selected
        if (item.href === '/contabil') {
            return pathname === '/contabil' && !currentTab;
        }
        // /leiloes (Fechamentos) é o item "raiz" do grupo — só ativo quando exato,
        // senão Acordos/Comissões marcariam Fechamentos como ativo também.
        if (item.href === '/leiloes') {
            return pathname === '/leiloes';
        }
        if (item.href === '/') return pathname === '/';
        return pathname === item.href || pathname.startsWith(item.href + '/');
    };

    const isGroupActive = (items: NavItem[]) => items.some(isItemActive);

    return (
        <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#0A0A0A] flex flex-col font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
            {/* ─── Top Navbar ─── */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-gray-200/60 dark:border-[rgba(212,168,92,0.14)] shadow-sm shadow-black/5">
                <div className="px-3 sm:px-4 lg:px-6">
                    <div className="flex items-center h-[60px] lg:h-[68px] gap-2 sm:gap-3">

                        {/* Logo */}
                        <Link href="/" className="shrink-0 flex items-center gap-2.5">
                            <div className="relative h-10 w-10 lg:h-12 lg:w-12">
                                <Image
                                    src="/icon.svg"
                                    alt="Fórmula do Boi"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <span
                                className="hidden sm:inline-flex items-center justify-center text-[#0A0A0A] font-bold shadow-md shadow-[#A0792E]/25"
                                style={{
                                    height: 26,
                                    padding: '0 10px',
                                    background: 'linear-gradient(135deg, #D4A85C 0%, #A0792E 100%)',
                                    borderRadius: 3,
                                    fontFamily: 'var(--font-mono), ui-monospace, monospace',
                                    fontSize: 10.5,
                                    letterSpacing: '0.18em',
                                }}
                            >
                                ERP
                            </span>
                        </Link>

                        {/* Separator */}
                        <div className="hidden lg:block h-8 w-px bg-[rgba(212,168,92,0.25)] mx-1" />

                        {/* Desktop Nav */}
                        <nav ref={navRef} className="hidden lg:flex items-center justify-center gap-0.5 flex-1">
                            {navConfig.map((entry) => {
                                if (!isGroup(entry)) {
                                    const Icon = entry.icon;
                                    const active = isItemActive(entry);
                                    return (
                                        <Link
                                            key={entry.href}
                                            href={entry.href}
                                            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium transition-all duration-150 ${active
                                                ? 'bg-[#A0792E] text-[#0A0A0A] shadow-[0_0_0_1px_rgba(212,168,92,0.35),0_0_24px_rgba(160,121,46,0.25)]'
                                                : 'text-gray-600 dark:text-[#F5F0E4]/70 hover:bg-gray-100 dark:hover:bg-[rgba(212,168,92,0.08)] hover:text-gray-900 dark:hover:text-[#D4A85C]'
                                                }`}
                                            style={{ borderRadius: 3, letterSpacing: '-0.005em' }}
                                        >
                                            <Icon size={15} />
                                            <span>{entry.label}</span>
                                        </Link>
                                    );
                                }

                                const Icon = entry.icon;
                                const active = isGroupActive(entry.items);
                                const open = openDropdown === entry.label;

                                return (
                                    <div key={entry.label} className="relative">
                                        <button
                                            onClick={() => setOpenDropdown(open ? null : entry.label)}
                                            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium transition-all duration-150 ${active
                                                ? 'bg-[#A0792E] text-[#0A0A0A] shadow-[0_0_0_1px_rgba(212,168,92,0.35),0_0_24px_rgba(160,121,46,0.25)]'
                                                : 'text-gray-600 dark:text-[#F5F0E4]/70 hover:bg-gray-100 dark:hover:bg-[rgba(212,168,92,0.08)] hover:text-gray-900 dark:hover:text-[#D4A85C]'
                                                }`}
                                            style={{ borderRadius: 3, letterSpacing: '-0.005em' }}
                                        >
                                            <Icon size={15} />
                                            <span>{entry.label}</span>
                                            <ChevronDown size={13} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''} ${active ? 'text-black/60' : 'text-gray-400'}`} />
                                        </button>

                                        {open && (
                                            <div
                                                className="absolute top-[calc(100%+8px)] left-0 w-60 bg-white dark:bg-[#0f0f0f] border border-gray-100 dark:border-[rgba(212,168,92,0.22)] shadow-2xl shadow-black/30 overflow-hidden py-2"
                                                style={{ borderRadius: 4 }}
                                            >
                                                <span aria-hidden className="absolute top-0 left-0 block" style={{ width: 32, height: 1, background: '#A0792E' }} />
                                                <div className="px-4 pt-1 pb-2.5">
                                                    <p
                                                        style={{
                                                            fontFamily: 'var(--font-mono), ui-monospace, monospace',
                                                            fontSize: 10,
                                                            fontWeight: 500,
                                                            letterSpacing: '0.24em',
                                                            textTransform: 'uppercase',
                                                            color: '#D4A85C',
                                                        }}
                                                    >
                                                        {entry.label}
                                                    </p>
                                                </div>
                                                {entry.items.map((item) => {
                                                    const ItemIcon = item.icon;
                                                    const itemActive = isItemActive(item);
                                                    return (
                                                        <Link
                                                            key={item.href}
                                                            href={item.href}
                                                            onClick={() => setOpenDropdown(null)}
                                                            className={`flex items-center gap-3 mx-1.5 px-3 py-2.5 text-sm transition-all duration-150 ${itemActive
                                                                ? 'bg-[rgba(160,121,46,0.14)] text-[#D4A85C] font-semibold'
                                                                : 'text-gray-700 dark:text-[#F5F0E4]/80 hover:bg-gray-50 dark:hover:bg-[rgba(212,168,92,0.06)] hover:text-gray-900 dark:hover:text-[#D4A85C]'
                                                                }`}
                                                            style={{ borderRadius: 3 }}
                                                        >
                                                            <ItemIcon size={15} className={itemActive ? 'text-[#D4A85C]' : 'text-gray-400 dark:text-[#F5F0E4]/40'} />
                                                            <span>{item.label}</span>
                                                            {itemActive && <div className="ml-auto w-1 h-1 rounded-none bg-[#D4A85C]" />}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </nav>

                        {/* Right Side */}
                        <div className="flex items-center gap-1 sm:gap-1.5 ml-auto">
                            <ThemeToggle />

                            {/* User Menu */}
                            <div ref={userRef} className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1A1A1A] transition-all"
                                >
                                    <div
                                        className="flex items-center justify-center text-[#0A0A0A] font-bold text-sm shadow-md shadow-[#A0792E]/25"
                                        style={{
                                            width: 32,
                                            height: 32,
                                            background: 'linear-gradient(135deg, #D4A85C 0%, #A0792E 100%)',
                                            borderRadius: 3,
                                            fontFamily: 'var(--font-space-grotesk), system-ui',
                                            letterSpacing: '-0.02em',
                                        }}
                                    >
                                        E
                                    </div>
                                    <span
                                        className="hidden lg:block text-gray-700 dark:text-[#F5F0E4]"
                                        style={{
                                            fontFamily: 'var(--font-mono), ui-monospace, monospace',
                                            fontSize: 11,
                                            fontWeight: 500,
                                            letterSpacing: '0.18em',
                                            textTransform: 'uppercase',
                                        }}
                                    >ERP</span>
                                    <ChevronDown size={13} className={`hidden lg:block text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {userMenuOpen && (
                                    <div
                                        className="absolute top-[calc(100%+8px)] right-0 w-56 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-[#0f0f0f] border border-gray-100 dark:border-[rgba(212,168,92,0.22)] shadow-2xl shadow-black/30 overflow-hidden py-2"
                                        style={{ borderRadius: 4 }}
                                    >
                                        <span aria-hidden className="absolute top-0 right-0 block" style={{ width: 32, height: 1, background: '#A0792E' }} />
                                        <div className="px-4 py-3 border-b border-gray-100 dark:border-[rgba(212,168,92,0.14)]">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="flex items-center justify-center text-[#0A0A0A] font-bold text-sm"
                                                    style={{
                                                        width: 36,
                                                        height: 36,
                                                        background: 'linear-gradient(135deg, #D4A85C 0%, #A0792E 100%)',
                                                        borderRadius: 3,
                                                    }}
                                                >E</div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-[#F5F0E4]" style={{ letterSpacing: '-0.01em' }}>Gestão ERP</p>
                                                    <p
                                                        style={{
                                                            fontFamily: 'var(--font-mono), ui-monospace, monospace',
                                                            fontSize: 10,
                                                            color: '#D4A85C',
                                                            letterSpacing: '0.2em',
                                                            textTransform: 'uppercase',
                                                            marginTop: 2,
                                                        }}
                                                    >Fórmula do Boi</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleSignOut}
                                            className="flex items-center gap-3 w-full mx-1.5 mt-1 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 transition-all"
                                            style={{ width: 'calc(100% - 12px)' }}
                                        >
                                            <LogOut size={15} />
                                            Sair do ERP
                                        </button>
                                        <p
                                            className="text-center mt-3 mb-1.5"
                                            style={{
                                                fontFamily: 'var(--font-mono), ui-monospace, monospace',
                                                fontSize: 9,
                                                color: 'rgba(245,240,228,0.35)',
                                                letterSpacing: '0.24em',
                                                textTransform: 'uppercase',
                                            }}
                                        >
                                            FdB ERP · v1.0
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Mobile Toggle */}
                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1A1A1A] transition-all"
                            >
                                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div ref={mobileNavRef} className="lg:hidden border-t border-gray-200 dark:border-[rgba(212,168,92,0.14)] bg-white dark:bg-[#0A0A0A] max-h-[calc(100svh-60px)] overflow-y-auto">
                        <div className="px-4 py-3 space-y-0.5">
                            {navConfig.map((entry) => {
                                if (!isGroup(entry)) {
                                    const Icon = entry.icon;
                                    const active = isItemActive(entry);
                                    return (
                                        <Link
                                            key={entry.href}
                                            href={entry.href}
                                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all ${active
                                                ? 'bg-[#A0792E] text-[#0A0A0A]'
                                                : 'text-gray-700 dark:text-[#F5F0E4]/80 hover:bg-gray-50 dark:hover:bg-[rgba(212,168,92,0.06)] hover:text-[#D4A85C]'
                                                }`}
                                            style={{ borderRadius: 3 }}
                                        >
                                            <Icon size={18} />
                                            {entry.label}
                                        </Link>
                                    );
                                }

                                const Icon = entry.icon;
                                const active = isGroupActive(entry.items);
                                const open = openDropdown === entry.label;

                                return (
                                    <div key={entry.label}>
                                        <button
                                            onClick={() => setOpenDropdown(open ? null : entry.label)}
                                            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${active
                                                ? 'text-[#A0792E] bg-[#A0792E]/5'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]'
                                                }`}
                                        >
                                            <Icon size={18} />
                                            <span className="flex-1 text-left">{entry.label}</span>
                                            <ChevronDown size={15} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                                        </button>
                                        {open && (
                                            <div className="ml-6 mt-0.5 mb-1 space-y-0.5">
                                                {entry.items.map((item) => {
                                                    const ItemIcon = item.icon;
                                                    const itemActive = isItemActive(item);
                                                    return (
                                                        <Link
                                                            key={item.href}
                                                            href={item.href}
                                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${itemActive
                                                                ? 'bg-[#A0792E]/10 text-[#A0792E] font-semibold'
                                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]'
                                                                }`}
                                                        >
                                                            <ItemIcon size={15} />
                                                            {item.label}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            <div className="pt-3 mt-2 border-t border-gray-100 dark:border-[#222222] space-y-1">
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                                >
                                    <LogOut size={17} />
                                    Sair do ERP
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-[#FFFFFF] dark:bg-[#0A0A0A] p-4 sm:p-6 lg:p-10 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-[#222222] scrollbar-track-transparent">
                <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
                    {children}
                </div>
                <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] overflow-hidden">
                    <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#A0792E]/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] left-[10%] w-[400px] h-[400px] bg-[#A0792E]/5 rounded-full blur-[100px]" />
                </div>
            </main>
        </div>
    );
}
