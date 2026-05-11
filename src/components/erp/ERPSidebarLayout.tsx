'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { LayoutDashboard, Wallet, Calculator, LogOut, Menu, X, Settings, ChevronLeft, ChevronRight, ChevronDown, ArrowDownToLine, ArrowUpFromLine, BarChart3, Gavel, CheckCircle2, TrendingUp, Scale, BookOpen, Receipt, FileSpreadsheet, FileUp } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { ThemeToggle } from '@/components/theme-toggle';

export default function ERPSidebarLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [financeiroOpen, setFinanceiroOpen] = useState(false);
    const [contabilOpen, setContabilOpen] = useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const supabase = createClient();
    
    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    return router.push('/login');
                }
            } catch (error) {
                console.error('Error checking user:', error);
            } finally {
                setIsLoading(false);
            }
        };
        checkUser();
    }, [router, supabase]);

    useEffect(() => {
        if (pathname.startsWith('/financeiro')) setFinanceiroOpen(true);
        if (pathname.startsWith('/contabil')) setContabilOpen(true);
        setIsSidebarOpen(false);
    }, [pathname, searchParams]);

    useEffect(() => {
        if (!isSidebarOpen) return;
        const original = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = original; };
    }, [isSidebarOpen]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-[#0A0A0A] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A0792E]"></div>
            </div>
        );
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    const isContabilSubActive = pathname === '/contabil' && !!searchParams.get('tab');
    const isFinanceiroSubActive = pathname.startsWith('/financeiro/');

    const activeItemStyle = 'bg-[#A0792E] text-[#0A0A0A] font-bold shadow-[0_0_0_1px_rgba(212,168,92,0.35),0_0_24px_rgba(160,121,46,0.25)]';
    const inactiveItemStyle = 'text-gray-600 dark:text-[#F5F0E4]/70 hover:bg-gray-100 dark:hover:bg-[rgba(212,168,92,0.06)] hover:text-gray-900 dark:hover:text-[#D4A85C]';
    const sectionActiveStyle = 'text-[#D4A85C] border-l-2 border-[#A0792E] pl-[14px]';

    return (
        <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#0A0A0A] flex font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-[#0A0A0A] border-r border-gray-200 dark:border-[rgba(212,168,92,0.14)] transform transition-all duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:relative lg:translate-x-0 flex flex-col ${isCollapsed ? 'lg:w-20' : 'lg:w-72'} w-72`}
            >
                <div className={`p-8 border-b border-gray-200 dark:border-[rgba(212,168,92,0.14)] flex justify-center items-center relative transition-all duration-300 ${isCollapsed ? 'px-4' : ''}`}>
                    {!isCollapsed ? (
                        <Link href="/" className="block relative h-24 w-full max-w-[240px]">
                            <Image
                                src="/logo_complete.svg"
                                alt="Fórmula do Boi"
                                fill
                                className="object-contain"
                                style={{ filter: "brightness(0) saturate(100%) invert(62%) sepia(34%) saturate(762%) hue-rotate(2deg) brightness(89%) contrast(85%)" }}
                                priority
                            />
                        </Link>
                    ) : (
                        <Link href="/" className="block relative h-10 w-10">
                            <Image
                                src="/icon.svg"
                                alt="Fórmula do Boi"
                                fill
                                className="object-contain"
                            />
                        </Link>
                    )}
                    <button
                        className="lg:hidden absolute right-4 text-gray-500 dark:text-[#F5F0E4]/60 hover:text-[#D4A85C]"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X size={24} />
                    </button>
                    {/* Desktop Collapse Toggle */}
                    <button
                        className="hidden lg:flex absolute -right-3 top-10 bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-[rgba(212,168,92,0.35)] rounded-full p-1 text-gray-500 dark:text-[#D4A85C] hover:text-black dark:hover:text-white dark:hover:bg-[#A0792E] z-50 shadow-md transition-colors"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>
                </div>

                {!isCollapsed ? (
                    <div className="px-6 py-5 transition-all duration-300">
                        <div
                            className="relative flex items-center gap-3 p-3.5 bg-gray-50 dark:bg-[rgba(245,240,228,0.02)] border border-gray-200 dark:border-[rgba(212,168,92,0.22)]"
                            style={{ borderRadius: 4 }}
                        >
                            {/* Brackets brandbook */}
                            <span aria-hidden style={{ position: 'absolute', top: 0, left: 0, width: 8, height: 8, borderTop: '1px solid #A0792E', borderLeft: '1px solid #A0792E' }} />
                            <span aria-hidden style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderBottom: '1px solid #A0792E', borderRight: '1px solid #A0792E' }} />
                            <div
                                className="shrink-0 flex items-center justify-center text-[#0A0A0A] font-bold shadow-lg shadow-[#A0792E]/20"
                                style={{
                                    width: 40,
                                    height: 40,
                                    background: 'linear-gradient(135deg, #D4A85C 0%, #A0792E 100%)',
                                    borderRadius: 3,
                                    fontFamily: 'var(--font-mono), ui-monospace, monospace',
                                    fontSize: 12,
                                    letterSpacing: '0.14em',
                                }}
                            >
                                ERP
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <h3
                                    className="text-gray-900 dark:text-[#F5F0E4] truncate"
                                    style={{
                                        fontFamily: 'var(--font-space-grotesk), var(--font-display), system-ui',
                                        fontSize: 14,
                                        fontWeight: 600,
                                        letterSpacing: '-0.01em',
                                    }}
                                >Gestão ERP</h3>
                                <p
                                    className="truncate"
                                    style={{
                                        fontFamily: 'var(--font-mono), ui-monospace, monospace',
                                        fontSize: 9.5,
                                        color: '#D4A85C',
                                        letterSpacing: '0.24em',
                                        textTransform: 'uppercase',
                                        marginTop: 3,
                                    }}
                                >Fórmula do Boi</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="px-3 py-4 flex flex-col items-center gap-1.5 transition-all duration-300">
                        <div
                            className="flex items-center justify-center text-[#0A0A0A] font-bold shadow-lg shadow-[#A0792E]/30"
                            style={{
                                width: 36,
                                height: 36,
                                background: 'linear-gradient(135deg, #D4A85C 0%, #A0792E 100%)',
                                borderRadius: 3,
                                fontFamily: 'var(--font-mono), ui-monospace, monospace',
                                fontSize: 11,
                                letterSpacing: '0.14em',
                            }}
                            title="Gestão ERP · Fórmula do Boi"
                        >
                            ERP
                        </div>
                        <span
                            aria-hidden
                            style={{
                                fontFamily: 'var(--font-mono), ui-monospace, monospace',
                                fontSize: 7.5,
                                color: '#D4A85C',
                                letterSpacing: '0.32em',
                                textTransform: 'uppercase',
                                opacity: 0.55,
                            }}
                        >v1</span>
                    </div>
                )}

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto overflow-x-hidden">
                    {/* Dashboard */}
                    <Link
                        href="/"
                        title={isCollapsed ? 'Dashboard' : undefined}
                        className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 group ${pathname === '/' ? activeItemStyle : inactiveItemStyle} ${isCollapsed ? 'justify-center px-0' : ''}`}
                        style={{ borderRadius: 3 }}
                    >
                        <LayoutDashboard size={19} className={`${pathname === '/' ? 'text-[#0A0A0A]' : 'text-gray-400 dark:text-[#F5F0E4]/45 group-hover:text-[#D4A85C]'} shrink-0 transition-colors`} />
                        {!isCollapsed && <span className="whitespace-nowrap text-sm font-medium">Dashboard</span>}
                        {pathname === '/' && !isCollapsed && <div className="ml-auto shrink-0 w-1 h-1 bg-[#0A0A0A]" />}
                    </Link>

                    {/* ── Financeiro ── */}
                    <div>
                        <button
                            onClick={() => { router.push('/financeiro'); setFinanceiroOpen(v => !v); }}
                            title={isCollapsed ? 'Financeiro' : undefined}
                            className={`flex items-center gap-3 w-full px-4 py-3 transition-all duration-200 group ${
                                pathname === '/financeiro'
                                    ? activeItemStyle
                                    : isFinanceiroSubActive
                                        ? `${sectionActiveStyle} hover:bg-gray-100 dark:hover:bg-[rgba(212,168,92,0.06)]`
                                        : inactiveItemStyle
                            } ${isCollapsed ? 'justify-center px-0' : ''}`}
                            style={{ borderRadius: 3 }}
                        >
                            <Wallet size={19} className={`${pathname === '/financeiro' ? 'text-[#0A0A0A]' : isFinanceiroSubActive ? 'text-[#D4A85C]' : 'text-gray-400 dark:text-[#F5F0E4]/45 group-hover:text-[#D4A85C]'} shrink-0 transition-colors`} />
                            {!isCollapsed && <span className="whitespace-nowrap text-sm font-medium">Financeiro</span>}
                            {!isCollapsed && (
                                <ChevronDown size={14} className={`ml-auto shrink-0 transition-transform duration-200 ${financeiroOpen ? 'rotate-180' : ''} ${pathname === '/financeiro' ? 'text-[#0A0A0A]' : 'text-gray-400 dark:text-[#F5F0E4]/30'}`} onClick={e => { e.stopPropagation(); setFinanceiroOpen(v => !v); }} />
                            )}
                        </button>
                        <div className={`grid transition-all duration-200 ease-in-out ${financeiroOpen && !isCollapsed ? 'grid-rows-[1fr] mt-0.5' : 'grid-rows-[0fr]'}`}>
                            <div className="overflow-hidden space-y-0.5">
                                {[
                                    { href: '/financeiro/a-receber', label: 'A Receber', icon: ArrowDownToLine },
                                    { href: '/financeiro/a-pagar', label: 'A Pagar', icon: ArrowUpFromLine },
                                    { href: '/financeiro/fluxo-caixa', label: 'Fluxo de Caixa', icon: BarChart3 },
                                    { href: '/financeiro/conciliacao', label: 'Conciliação', icon: CheckCircle2 },
                                    { href: '/financeiro/conciliacao-ofx', label: 'Conciliação OFX', icon: FileUp },
                                ].map(sub => {
                                    const isActive = pathname === sub.href;
                                    const SubIcon = sub.icon;
                                    return (
                                        <Link key={sub.href} href={sub.href}
                                            className={`flex items-center gap-3 py-2 pl-9 pr-4 text-sm transition-all duration-200 group ${isActive ? activeItemStyle : inactiveItemStyle}`}
                                            style={{ borderRadius: 3 }}
                                        >
                                            <SubIcon size={15} className={`${isActive ? 'text-[#0A0A0A]' : 'text-gray-400 dark:text-[#F5F0E4]/45 group-hover:text-[#D4A85C]'} shrink-0 transition-colors`} />
                                            <span className="whitespace-nowrap font-medium">{sub.label}</span>
                                            {isActive && <div className="ml-auto shrink-0 w-1 h-1 bg-[#0A0A0A]" />}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Leilões */}
                    <Link
                        href="/leiloes"
                        title={isCollapsed ? 'Leilões' : undefined}
                        className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 group ${pathname === '/leiloes' ? activeItemStyle : inactiveItemStyle} ${isCollapsed ? 'justify-center px-0' : ''}`}
                        style={{ borderRadius: 3 }}
                    >
                        <Gavel size={19} className={`${pathname === '/leiloes' ? 'text-[#0A0A0A]' : 'text-gray-400 dark:text-[#F5F0E4]/45 group-hover:text-[#D4A85C]'} shrink-0 transition-colors`} />
                        {!isCollapsed && <span className="whitespace-nowrap text-sm font-medium">Leilões</span>}
                        {pathname === '/leiloes' && !isCollapsed && <div className="ml-auto shrink-0 w-1 h-1 bg-[#0A0A0A]" />}
                    </Link>

                    {/* ── Contábil ── */}
                    <div>
                        <button
                            onClick={() => { router.push('/contabil'); setContabilOpen(v => !v); }}
                            title={isCollapsed ? 'Contábil' : undefined}
                            className={`flex items-center gap-3 w-full px-4 py-3 transition-all duration-200 group ${
                                pathname === '/contabil' && !searchParams.get('tab')
                                    ? activeItemStyle
                                    : isContabilSubActive
                                        ? `${sectionActiveStyle} hover:bg-gray-100 dark:hover:bg-[rgba(212,168,92,0.06)]`
                                        : inactiveItemStyle
                            } ${isCollapsed ? 'justify-center px-0' : ''}`}
                            style={{ borderRadius: 3 }}
                        >
                            <Calculator size={19} className={`${pathname === '/contabil' && !searchParams.get('tab') ? 'text-[#0A0A0A]' : isContabilSubActive ? 'text-[#D4A85C]' : 'text-gray-400 dark:text-[#F5F0E4]/45 group-hover:text-[#D4A85C]'} shrink-0 transition-colors`} />
                            {!isCollapsed && <span className="whitespace-nowrap text-sm font-medium">Contábil</span>}
                            {!isCollapsed && (
                                <ChevronDown size={14} className={`ml-auto shrink-0 transition-transform duration-200 ${contabilOpen ? 'rotate-180' : ''} ${pathname === '/contabil' && !searchParams.get('tab') ? 'text-[#0A0A0A]' : 'text-gray-400 dark:text-[#F5F0E4]/30'}`} onClick={e => { e.stopPropagation(); setContabilOpen(v => !v); }} />
                            )}
                        </button>
                        <div className={`grid transition-all duration-200 ease-in-out ${contabilOpen && !isCollapsed ? 'grid-rows-[1fr] mt-0.5' : 'grid-rows-[0fr]'}`}>
                            <div className="overflow-hidden space-y-0.5">
                                {[
                                    { href: '/contabil?tab=dre', label: 'DRE', icon: TrendingUp, tab: 'dre' },
                                    { href: '/contabil?tab=balanco', label: 'Balanço Patrimonial', icon: Scale, tab: 'balanco' },
                                    { href: '/contabil?tab=plano', label: 'Plano de Contas', icon: BookOpen, tab: 'plano' },
                                    { href: '/contabil?tab=nfe', label: 'Notas Fiscais', icon: Receipt, tab: 'nfe' },
                                    { href: '/contabil?tab=razao', label: 'Livro Razão', icon: FileSpreadsheet, tab: 'razao' },
                                ].map(sub => {
                                    const isActive = pathname === '/contabil' && searchParams.get('tab') === sub.tab;
                                    const SubIcon = sub.icon;
                                    return (
                                        <Link key={sub.href} href={sub.href}
                                            className={`flex items-center gap-3 py-2 pl-9 pr-4 text-sm transition-all duration-200 group ${isActive ? activeItemStyle : inactiveItemStyle}`}
                                            style={{ borderRadius: 3 }}
                                        >
                                            <SubIcon size={15} className={`${isActive ? 'text-[#0A0A0A]' : 'text-gray-400 dark:text-[#F5F0E4]/45 group-hover:text-[#D4A85C]'} shrink-0 transition-colors`} />
                                            <span className="whitespace-nowrap font-medium">{sub.label}</span>
                                            {isActive && <div className="ml-auto shrink-0 w-1 h-1 bg-[#0A0A0A]" />}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Configurações */}
                    <Link
                        href="/configuracoes"
                        title={isCollapsed ? 'Configurações' : undefined}
                        className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 group ${pathname === '/configuracoes' ? activeItemStyle : inactiveItemStyle} ${isCollapsed ? 'justify-center px-0' : ''}`}
                        style={{ borderRadius: 3 }}
                    >
                        <Settings size={19} className={`${pathname === '/configuracoes' ? 'text-[#0A0A0A]' : 'text-gray-400 dark:text-[#F5F0E4]/45 group-hover:text-[#D4A85C]'} shrink-0 transition-colors`} />
                        {!isCollapsed && <span className="whitespace-nowrap text-sm font-medium">Configurações</span>}
                        {pathname === '/configuracoes' && !isCollapsed && <div className="ml-auto shrink-0 w-1 h-1 bg-[#0A0A0A]" />}
                    </Link>
                </nav>

                <div className={`p-5 border-t border-gray-200 dark:border-[rgba(212,168,92,0.14)] space-y-3 transition-all duration-300 ${isCollapsed ? 'px-3 flex flex-col items-center' : ''}`}>
                    {!isCollapsed ? (
                        <div className="flex items-center justify-between px-3">
                            <span
                                style={{
                                    fontFamily: 'var(--font-mono), ui-monospace, monospace',
                                    fontSize: 10,
                                    fontWeight: 500,
                                    letterSpacing: '0.22em',
                                    textTransform: 'uppercase',
                                    color: '#D4A85C',
                                }}
                            >Tema</span>
                            <ThemeToggle />
                        </div>
                    ) : (
                        <ThemeToggle />
                    )}
                    <button
                        onClick={handleSignOut}
                        title={isCollapsed ? "Sair do ERP" : undefined}
                        className={`flex items-center gap-3 w-full px-4 py-3 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300 transition-all ${isCollapsed ? 'justify-center px-0' : ''}`}
                        style={{ borderRadius: 3 }}
                    >
                        <LogOut size={19} className="shrink-0" />
                        {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">Sair do ERP</span>}
                    </button>
                    {!isCollapsed && (
                        <div
                            className="text-center whitespace-nowrap pt-1"
                            style={{
                                fontFamily: 'var(--font-mono), ui-monospace, monospace',
                                fontSize: 9,
                                color: 'rgba(245,240,228,0.35)',
                                letterSpacing: '0.24em',
                                textTransform: 'uppercase',
                            }}
                        >
                            FdB ERP · v1.0
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden sticky top-0 bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md border-b border-gray-200 dark:border-[rgba(212,168,92,0.14)] px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3 z-40">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 text-gray-500 dark:text-[#F5F0E4]/70 hover:text-[#D4A85C] active:scale-95 transition-transform"
                        aria-label="Abrir menu"
                    >
                        <Menu size={22} />
                    </button>
                    <Image
                        src="/logo_complete.svg"
                        alt="Fórmula"
                        width={120}
                        height={40}
                        className="h-7 sm:h-8 w-auto object-contain"
                        style={{ filter: "brightness(0) saturate(100%) invert(62%) sepia(34%) saturate(762%) hue-rotate(2deg) brightness(89%) contrast(85%)" }}
                    />
                    <ThemeToggle />
                </header>

                <main className="flex-1 overflow-auto bg-[#FFFFFF] dark:bg-[#0A0A0A] p-4 sm:p-6 lg:p-10 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-[#222222] scrollbar-track-transparent">
                    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
                        {children}
                    </div>
                    {/* Background Glow Effects */}
                    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] overflow-hidden">
                        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#A0792E]/5 rounded-full blur-[120px]" />
                        <div className="absolute bottom-[-10%] left-[10%] w-[400px] h-[400px] bg-[#A0792E]/5 rounded-full blur-[100px]" />
                    </div>
                </main>
            </div>
        </div>
    );
}
