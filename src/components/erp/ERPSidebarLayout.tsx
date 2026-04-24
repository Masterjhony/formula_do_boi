'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Wallet, Calculator, LogOut, Menu, X, Settings, ChevronLeft, ChevronRight, ArrowDownToLine, ArrowUpFromLine, BarChart3, Gavel, CheckCircle2 } from 'lucide-react';
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
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    
    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    return router.push('/login');
                }
                // Optional: Check if user has explicit ERP access
            } catch (error) {
                console.error('Error checking user:', error);
            } finally {
                setIsLoading(false);
            }
        };
        checkUser();
    }, [router, supabase]);

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

    const navItems = [
        { href: '/', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/financeiro', label: 'Financeiro', icon: Wallet },
        { href: '/financeiro/a-receber', label: 'A Receber', icon: ArrowDownToLine, indent: true },
        { href: '/financeiro/a-pagar', label: 'A Pagar', icon: ArrowUpFromLine, indent: true },
        { href: '/financeiro/fluxo-caixa', label: 'Fluxo de Caixa', icon: BarChart3, indent: true },
        { href: '/financeiro/conciliacao', label: 'Conciliação', icon: CheckCircle2, indent: true },
        { href: '/leiloes', label: 'Leilões', icon: Gavel },
        { href: '/contabil', label: 'Contábil', icon: Calculator },
        { href: '/configuracoes', label: 'Configurações', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] flex font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
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

                <div className={`px-6 py-5 transition-all duration-300 ${isCollapsed ? 'px-3' : ''}`}>
                    <div
                        className={`relative flex items-center gap-3 p-3.5 bg-gray-50 dark:bg-[rgba(245,240,228,0.02)] border border-gray-200 dark:border-[rgba(212,168,92,0.22)] ${isCollapsed ? 'p-2 justify-center' : ''}`}
                        style={{ borderRadius: 4 }}
                    >
                        {/* Brackets brandbook */}
                        {!isCollapsed && (
                            <>
                                <span aria-hidden style={{ position: 'absolute', top: 0, left: 0, width: 8, height: 8, borderTop: '1px solid #A0792E', borderLeft: '1px solid #A0792E' }} />
                                <span aria-hidden style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderBottom: '1px solid #A0792E', borderRight: '1px solid #A0792E' }} />
                            </>
                        )}
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
                        {!isCollapsed && (
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
                        )}
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto overflow-x-hidden">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        const indent = (item as any).indent;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                title={isCollapsed ? item.label : undefined}
                                className={`flex items-center gap-3 transition-all duration-200 group ${
                                    indent ? 'py-2 pl-9 pr-4 text-sm' : 'px-4 py-3'
                                } ${isActive
                                    ? 'bg-[#A0792E] text-[#0A0A0A] font-bold shadow-[0_0_0_1px_rgba(212,168,92,0.35),0_0_24px_rgba(160,121,46,0.25)]'
                                    : 'text-gray-600 dark:text-[#F5F0E4]/70 hover:bg-gray-100 dark:hover:bg-[rgba(212,168,92,0.06)] hover:text-gray-900 dark:hover:text-[#D4A85C]'
                                    } ${isCollapsed ? 'justify-center px-0 py-3' : ''}`}
                                style={{ borderRadius: 3, letterSpacing: '-0.005em' }}
                            >
                                <Icon size={indent ? 16 : 19} className={`${isActive ? 'text-[#0A0A0A]' : 'text-gray-400 dark:text-[#F5F0E4]/45 group-hover:text-[#D4A85C]'} transition-colors shrink-0`} />
                                {!isCollapsed && <span className="whitespace-nowrap text-sm font-medium">{item.label}</span>}
                                {isActive && !isCollapsed && <div className="ml-auto shrink-0 w-1 h-1 bg-[#0A0A0A]" />}
                            </Link>
                        );
                    })}
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
                <header className="lg:hidden bg-white dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-[rgba(212,168,92,0.14)] p-4 flex items-center justify-between z-40">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="text-gray-500 dark:text-[#F5F0E4]/70 hover:text-[#D4A85C]"
                    >
                        <Menu size={22} />
                    </button>
                    <Image
                        src="/logo_complete.svg"
                        alt="Fórmula"
                        width={120}
                        height={40}
                        className="h-9 w-auto object-contain"
                        style={{ filter: "brightness(0) saturate(100%) invert(62%) sepia(34%) saturate(762%) hue-rotate(2deg) brightness(89%) contrast(85%)" }}
                    />
                    <ThemeToggle />
                </header>

                <main className="flex-1 overflow-auto bg-gray-50 dark:bg-[#0A0A0A] p-6 lg:p-10 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-[#222222] scrollbar-track-transparent">
                    <div className="max-w-7xl mx-auto space-y-8">
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
