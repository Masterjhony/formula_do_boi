'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, LogOut, Menu, X, Users, Settings, Calendar,
    MessageCircle, FileText, Sparkles, Gavel, Dna, Award,
    ImageIcon, Shield, ExternalLink, ChevronDown, BarChart2, Target,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';

type NavItem = { href: string; label: string; icon: React.ElementType };
type NavGroup = { label: string; icon: React.ElementType; items: NavItem[] };
type NavEntry = NavItem | NavGroup;

function isGroup(e: NavEntry): e is NavGroup {
    return 'items' in e;
}

const navConfig: NavEntry[] = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/crm', label: 'CRM', icon: Users },
    { href: '/leiloes', label: 'Leilões', icon: Gavel },
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
            { href: '/whatsapp', label: 'Marketing & Automação', icon: MessageCircle },
        ],
    },
    {
        label: 'Administração', icon: Shield,
        items: [
            { href: '/users', label: 'Usuários & Permissões', icon: Shield },
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
    const userRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return router.push('/login');
                const { data: profile } = await supabase
                    .from('profiles').select('role').eq('id', user.id).single();
                if (profile?.role !== 'admin') return router.push('/dashboard');
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
            if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenDropdown(null);
            if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => { setMobileOpen(false); setOpenDropdown(null); }, [pathname]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-[#0A0A0A] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B8860B]" />
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
    const isTactical = pathname === '/tactical-plan';
    const isOKR = pathname === '/okr';
    const isContratos = pathname === '/contratos';
    const isFullWidth = isCRM || isTactical || isOKR || isContratos;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] flex flex-col font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
            {/* ─── Top Navbar ─── */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#111111]/95 backdrop-blur-xl border-b border-gray-200/60 dark:border-[#1E1E1E] shadow-sm shadow-black/5">
                <div className="px-4 lg:px-6">
                    <div className="flex items-center h-[60px] gap-3">

                        {/* Logo */}
                        <Link href="/" className="shrink-0 flex items-center">
                            <div className="relative h-10 w-40">
                                <Image
                                    src="/logo_complete.svg"
                                    alt="Fórmula do Boi"
                                    fill
                                    className="object-contain"
                                    style={{ filter: 'brightness(0) saturate(100%) invert(62%) sepia(34%) saturate(762%) hue-rotate(2deg) brightness(89%) contrast(85%)' }}
                                    priority
                                />
                            </div>
                        </Link>

                        {/* Separator */}
                        <div className="hidden lg:block h-6 w-px bg-gray-200 dark:bg-[#2A2A2A] mx-1" />

                        {/* Desktop Nav */}
                        <nav ref={navRef} className="hidden lg:flex items-center gap-0.5 flex-1">
                            {navConfig.map((entry) => {
                                if (!isGroup(entry)) {
                                    const Icon = entry.icon;
                                    const active = isActive(entry.href);
                                    return (
                                        <Link
                                            key={entry.href}
                                            href={entry.href}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${active
                                                ? 'bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-black shadow-md shadow-[#B8860B]/25'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1A1A1A] hover:text-gray-900 dark:hover:text-white'
                                                }`}
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
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${active
                                                ? 'bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-black shadow-md shadow-[#B8860B]/25'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1A1A1A] hover:text-gray-900 dark:hover:text-white'
                                                }`}
                                        >
                                            <Icon size={15} />
                                            <span>{entry.label}</span>
                                            <ChevronDown size={13} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''} ${active ? 'text-black/60' : 'text-gray-400'}`} />
                                        </button>

                                        {open && (
                                            <div className="absolute top-[calc(100%+8px)] left-0 w-56 bg-white dark:bg-[#181818] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/50 overflow-hidden py-1.5">
                                                <div className="px-3 pt-1 pb-2">
                                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">{entry.label}</p>
                                                </div>
                                                {entry.items.map((item) => {
                                                    const ItemIcon = item.icon;
                                                    const itemActive = isActive(item.href);
                                                    return (
                                                        <Link
                                                            key={item.href}
                                                            href={item.href}
                                                            onClick={() => setOpenDropdown(null)}
                                                            className={`flex items-center gap-3 mx-1.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${itemActive
                                                                ? 'bg-[#B8860B]/10 text-[#B8860B] font-semibold'
                                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#242424] hover:text-gray-900 dark:hover:text-white'
                                                                }`}
                                                        >
                                                            <ItemIcon size={15} className={itemActive ? 'text-[#B8860B]' : 'text-gray-400'} />
                                                            <span>{item.label}</span>
                                                            {itemActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#B8860B]" />}
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
                        <div className="flex items-center gap-1.5 ml-auto">
                            {/* ERP */}
                            <a
                                href="https://erp.formuladoboi.com"
                                target="_blank"
                                rel="noreferrer"
                                className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#B8860B]/30 bg-[#B8860B]/5 text-[#B8860B] hover:bg-[#B8860B]/10 hover:border-[#B8860B]/50 text-sm font-semibold transition-all"
                            >
                                <ExternalLink size={14} />
                                <span>ERP</span>
                            </a>

                            <ThemeToggle />

                            {/* User Menu */}
                            <div ref={userRef} className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1A1A1A] transition-all"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#B8860B] to-[#9A7209] flex items-center justify-center text-black font-bold text-sm shadow-md shadow-[#B8860B]/20">
                                        A
                                    </div>
                                    <span className="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-300">Admin</span>
                                    <ChevronDown size={13} className={`hidden lg:block text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {userMenuOpen && (
                                    <div className="absolute top-[calc(100%+8px)] right-0 w-52 bg-white dark:bg-[#181818] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/50 overflow-hidden py-1.5">
                                        <div className="px-4 py-3 border-b border-gray-100 dark:border-[#2A2A2A]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#B8860B] to-[#9A7209] flex items-center justify-center text-black font-bold text-sm">A</div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">Administrador</p>
                                                    <p className="text-xs text-gray-500">Gestão Global</p>
                                                </div>
                                            </div>
                                        </div>
                                        <a
                                            href="https://erp.formuladoboi.com"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-3 mx-1.5 px-3 py-2.5 mt-1 rounded-xl text-sm text-[#B8860B] hover:bg-[#B8860B]/10 transition-all lg:hidden"
                                        >
                                            <ExternalLink size={15} />
                                            Abrir ERP
                                        </a>
                                        <button
                                            onClick={handleSignOut}
                                            className="flex items-center gap-3 w-full mx-1.5 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 transition-all"
                                            style={{ width: 'calc(100% - 12px)' }}
                                        >
                                            <LogOut size={15} />
                                            Sair do Painel
                                        </button>
                                        <p className="text-center text-[10px] text-gray-400 dark:text-gray-700 uppercase tracking-widest mt-2 mb-1.5">
                                            Fórmula do Boi v1.0
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
                    <div className="lg:hidden border-t border-gray-200 dark:border-[#1E1E1E] bg-white dark:bg-[#111111] max-h-[calc(100svh-60px)] overflow-y-auto">
                        <div className="px-4 py-3 space-y-0.5">
                            {navConfig.map((entry) => {
                                if (!isGroup(entry)) {
                                    const Icon = entry.icon;
                                    const active = isActive(entry.href);
                                    return (
                                        <Link
                                            key={entry.href}
                                            href={entry.href}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active
                                                ? 'bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-black'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]'
                                                }`}
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
                                                ? 'text-[#B8860B] bg-[#B8860B]/5'
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
                                                    const itemActive = isActive(item.href);
                                                    return (
                                                        <Link
                                                            key={item.href}
                                                            href={item.href}
                                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${itemActive
                                                                ? 'bg-[#B8860B]/10 text-[#B8860B] font-semibold'
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
                                <a
                                    href="https://erp.formuladoboi.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#B8860B]/30 bg-[#B8860B]/5 text-[#B8860B] text-sm font-semibold transition-all"
                                >
                                    <ExternalLink size={17} />
                                    Abrir ERP
                                </a>
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

            {/* Main Content */}
            <main className={`flex-1 bg-gray-50 dark:bg-[#0A0A0A] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-[#222222] scrollbar-track-transparent ${
                (isCRM || isOKR || isContratos)
                    ? 'overflow-hidden flex flex-col p-4'
                    : isTactical
                        ? 'overflow-auto flex flex-col p-4'
                        : 'overflow-auto p-6 lg:p-10'
            }`}>
                {isFullWidth ? children : (
                    <div className="max-w-7xl mx-auto space-y-8">
                        {children}
                    </div>
                )}
                <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] overflow-hidden">
                    <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#B8860B]/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] left-[10%] w-[400px] h-[400px] bg-[#B8860B]/5 rounded-full blur-[100px]" />
                </div>
            </main>
        </div>
    );
}
