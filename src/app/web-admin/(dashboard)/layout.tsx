'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, LogOut, Menu, X, Users, Settings, Calendar,
    MessageCircle, FileText, Sparkles, Gavel, Dna, Award,
    ImageIcon, Shield, ChevronDown, BarChart2, Target, BarChart3,
    Megaphone, FileBarChart, Briefcase, CalendarCheck, Package,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { GlobalSearch } from '@/components/admin/GlobalSearch';
import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs';

type NavItem = { href: string; label: string; icon: React.ElementType };
type NavGroup = { label: string; icon: React.ElementType; items: NavItem[] };
type NavEntry = NavItem | NavGroup;

function isGroup(e: NavEntry): e is NavGroup {
    return 'items' in e;
}

const navConfig: NavEntry[] = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    {
        label: 'Vendas & Marketing', icon: Megaphone,
        items: [
            { href: '/vendas-marketing', label: 'Visão Geral', icon: LayoutDashboard },
            { href: '/crm', label: 'CRM', icon: Users },
            { href: '/leads', label: 'Leads', icon: Users },
        ],
    },
    {
        label: 'Leilões', icon: Gavel,
        items: [
            { href: '/leiloes', label: 'Leilões', icon: Gavel },
            { href: '/leiloes/fechamento', label: 'Fechamento de Leilões', icon: BarChart3 },
            { href: '/leiloes/vendas-por-assessor', label: 'Vendas por Assessor', icon: Briefcase },
            { href: '/leiloes/relatorios', label: 'Relatórios', icon: FileBarChart },
            { href: '/leiloes/equipe', label: 'Equipe', icon: Users },
        ],
    },
    {
        label: 'Animais', icon: Dna,
        items: [
            { href: '/lotes-doadoras', label: 'Lotes Doadoras', icon: Dna },
            { href: '/lotes-touros', label: 'Lotes Touros', icon: Award },
        ],
    },
    {
        label: 'Operações', icon: Calendar,
        items: [
            { href: '/tactical-plan', label: 'Projetos', icon: Calendar },
            { href: '/agenda', label: 'Agenda Oficial', icon: CalendarCheck },
            { href: '/reservas', label: 'Reservas', icon: Package },
            { href: '/tactical-plan/relatorios', label: 'Relatórios', icon: FileBarChart },
            { href: '/okr', label: 'OKR', icon: Target },
            { href: '/contratos', label: 'Contratos', icon: FileText },
        ],
    },
    {
        label: 'Ferramentas', icon: Sparkles,
        items: [
            { href: '/analytics', label: 'Analytics', icon: BarChart2 },
            { href: '/ia', label: 'IA Mapeamento', icon: Sparkles },
            { href: '/biblioteca-midia', label: 'Biblioteca de Mídia', icon: ImageIcon },
        ],
    },
    {
        label: 'Administração', icon: Shield,
        items: [
            { href: '/users', label: 'Usuários & Permissões', icon: Shield },
            { href: '/whatsapp', label: 'Central WhatsApp', icon: MessageCircle },
            { href: '/settings', label: 'Configurações', icon: Settings },
        ],
    },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const navRef = useRef<HTMLDivElement>(null);
    const mobileNavRef = useRef<HTMLDivElement>(null);
    const userRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    const target = pathname && pathname !== '/'
                        ? `/login?redirectTo=${encodeURIComponent(pathname)}`
                        : '/login';
                    return router.push(target);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        checkUser();
    }, [router, supabase, pathname]);

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

    useEffect(() => { setMobileOpen(false); setOpenDropdown(null); }, [pathname]);

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

    const isActive = (href: string) =>
        href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');

    const isGroupActive = (items: NavItem[]) => items.some(i => isActive(i.href));

    const isCRM = pathname === '/crm';
    const isLeads = pathname === '/leads';
    const isTactical = pathname === '/tactical-plan';
    const isOKR = pathname === '/okr';
    const isContratos = pathname === '/contratos';
    const isWhatsapp = pathname === '/whatsapp';
    const isAgenda = pathname === '/agenda';
    const isReservas = pathname === '/reservas';
    const isFullWidth = isCRM || isLeads || isTactical || isOKR || isContratos || isWhatsapp || isAgenda || isReservas;

    return (
        <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#0A0A0A] flex flex-col font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
            {/* ─── Top Navbar ─── */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-gray-200/60 dark:border-[rgba(212,168,92,0.14)] shadow-sm shadow-black/5">
                <div className="px-3 sm:px-4 lg:px-6">
                    <div className="flex items-center h-[60px] lg:h-[68px] gap-2 sm:gap-3">

                        {/* Logo */}
                        <Link href="/" className="shrink-0 flex items-center">
                            <div className="relative h-10 w-10 lg:h-12 lg:w-12">
                                <Image
                                    src="/icon.svg"
                                    alt="Fórmula do Boi"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </Link>

                        {/* Separator */}
                        <div className="hidden lg:block h-8 w-px bg-[rgba(212,168,92,0.25)] mx-1" />

                        {/* Desktop Nav */}
                        <nav ref={navRef} className="hidden lg:flex items-center justify-center gap-0.5 flex-1">
                            {navConfig.map((entry) => {
                                if (!isGroup(entry)) {
                                    const Icon = entry.icon;
                                    const active = isActive(entry.href);
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
                                                {/* Hairline tick brandbook */}
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
                                                    const hasMoreSpecific = entry.items.some(o => o.href !== item.href && pathname.startsWith(o.href));
                                                    const itemActive = hasMoreSpecific ? pathname === item.href : isActive(item.href);
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
                            <GlobalSearch />
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
                                        A
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
                                    >Admin</span>
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
                                                >A</div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-[#F5F0E4]" style={{ letterSpacing: '-0.01em' }}>Administrador</p>
                                                    <p
                                                        style={{
                                                            fontFamily: 'var(--font-mono), ui-monospace, monospace',
                                                            fontSize: 10,
                                                            color: '#D4A85C',
                                                            letterSpacing: '0.2em',
                                                            textTransform: 'uppercase',
                                                            marginTop: 2,
                                                        }}
                                                    >Gestão Global</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleSignOut}
                                            className="flex items-center gap-3 w-full mx-1.5 mt-1 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 transition-all"
                                            style={{ width: 'calc(100% - 12px)' }}
                                        >
                                            <LogOut size={15} />
                                            Sair do Painel
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
                                            Fórmula do Boi · v1.0
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
                                    const active = isActive(entry.href);
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
                                                    const hasMoreSpecific = entry.items.some(o => o.href !== item.href && pathname.startsWith(o.href));
                                                    const itemActive = hasMoreSpecific ? pathname === item.href : isActive(item.href);
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
                                    Sair do Painel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Breadcrumbs (hidden on root) */}
            <AdminBreadcrumbs />

            {/* Main Content */}
            <main className={`flex-1 bg-[#FFFFFF] dark:bg-[#0A0A0A] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-[#222222] scrollbar-track-transparent ${
                (isCRM || isLeads || isOKR || isContratos)
                    ? 'overflow-hidden flex flex-col p-3 sm:p-4'
                    : (isTactical || isWhatsapp || isAgenda || isReservas)
                        ? 'overflow-auto flex flex-col p-3 sm:p-4'
                        : 'overflow-auto p-4 sm:p-6 lg:p-10'
            }`}>
                {isFullWidth ? children : (
                    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
                        {children}
                    </div>
                )}
                <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] overflow-hidden">
                    <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#A0792E]/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] left-[10%] w-[400px] h-[400px] bg-[#A0792E]/5 rounded-full blur-[100px]" />
                </div>
            </main>
        </div>
    );
}
