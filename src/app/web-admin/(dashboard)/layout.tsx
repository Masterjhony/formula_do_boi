'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, LogOut, Menu, X, User, Settings, Activity, Calendar, ChevronLeft, ChevronRight, MessageCircle, MapPin, GitBranch } from 'lucide-react';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function AdminLayout({
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

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profile?.role !== 'admin') {
                    // Not an admin, redirect to dashboard or home
                    return router.push('/dashboard');
                }
            } catch (error) {
                console.error('Error checking admin:', error);
            } finally {
                setIsLoading(false);
            }
        };
        checkUser();
    }, [router, supabase]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-[#0A0A0A] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
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
        { href: '/products', label: 'Cards (Animais)', icon: Package },
        { href: '/animal-availability', label: 'Disponibilidade', icon: MapPin },
        { href: '/breeders', label: 'Criadores', icon: User },
        { href: '/users', label: 'Usuários', icon: User },
        { href: '/analytics', label: 'Analytics', icon: Activity },
        { href: '/crm', label: 'CRM de Vendas', icon: User }, // Using User/Target icon; let's use User or maybe an Inbox icon but User is imported
        { href: '/tactical-plan', label: 'Projetos', icon: Calendar },
        { href: '/genealogia', label: 'Genealogia', icon: GitBranch },
        { href: '/whatsapp', label: 'WhatsApp', icon: MessageCircle },
        { href: '/settings', label: 'Configurações', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] flex font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-[#111111] border-r border-gray-200 dark:border-[#222222] transform transition-all duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:relative lg:translate-x-0 flex flex-col ${isCollapsed ? 'lg:w-20' : 'lg:w-72'} w-72`}
            >
                <div className={`p-8 border-b border-gray-200 dark:border-[#222222] flex justify-center items-center relative transition-all duration-300 ${isCollapsed ? 'px-4' : ''}`}>
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
                        className="lg:hidden absolute right-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X size={24} />
                    </button>
                    {/* Desktop Collapse Toggle */}
                    <button
                        className="hidden lg:flex absolute -right-3 top-10 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-full p-1 text-gray-500 hover:text-black dark:hover:text-white z-50 shadow-md transition-colors"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>
                </div>

                <div className={`px-6 py-6 transition-all duration-300 ${isCollapsed ? 'px-3' : ''}`}>
                    <div className={`flex items-center gap-3 p-4 bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#222222]/50 shadow-inner ${isCollapsed ? 'p-2 justify-center' : ''}`}>
                        <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-[#B8860B] to-[#9A7209] flex items-center justify-center text-black font-bold text-lg shadow-lg shadow-[#B8860B]/20">
                            A
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 overflow-hidden">
                                <h3 className="text-gray-900 dark:text-white text-sm font-bold truncate">Administrador</h3>
                                <p className="text-gray-500 text-xs truncate">Gestão Global</p>
                            </div>
                        )}
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto overflow-x-hidden">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                title={isCollapsed ? item.label : undefined}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-black font-bold shadow-lg shadow-[#B8860B]/20'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1A1A1A] hover:text-gray-900 dark:hover:text-white'
                                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                            >
                                <Icon size={20} className={`${isActive ? 'text-black' : 'text-gray-400 dark:text-gray-500 group-hover:text-[#B8860B]'} transition-colors shrink-0`} />
                                {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                                {isActive && !isCollapsed && <div className="ml-auto shrink-0 w-1.5 h-1.5 rounded-full bg-black/40" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className={`p-6 border-t border-gray-200 dark:border-[#222222] space-y-4 transition-all duration-300 ${isCollapsed ? 'px-3 flex flex-col items-center' : ''}`}>
                    {!isCollapsed ? (
                        <div className="flex items-center justify-between px-4">
                            <span className="text-sm font-medium text-gray-500">Tema</span>
                            <ThemeToggle />
                        </div>
                    ) : (
                        <ThemeToggle />
                    )}
                    <button
                        onClick={handleSignOut}
                        title={isCollapsed ? "Sair do Painel" : undefined}
                        className={`flex items-center gap-3 w-full px-4 py-3.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300 rounded-xl transition-all ${isCollapsed ? 'justify-center px-0' : ''}`}
                    >
                        <LogOut size={20} className="shrink-0" />
                        {!isCollapsed && <span className="font-medium whitespace-nowrap">Sair do Painel</span>}
                    </button>
                    {!isCollapsed && (
                        <div className="text-center mt-4 text-[10px] text-gray-400 dark:text-gray-700 uppercase tracking-widest whitespace-nowrap">
                            Fórmula do Boi v1.0
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-[#222222] p-4 flex items-center justify-between z-40">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                        <Menu size={24} />
                    </button>
                    <Image
                        src="/logo_complete.svg"
                        alt="Fórmula"
                        width={120}
                        height={40}
                        className="h-8 w-auto object-contain"
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
                        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#B8860B]/5 rounded-full blur-[120px]" />
                        <div className="absolute bottom-[-10%] left-[10%] w-[400px] h-[400px] bg-[#B8860B]/5 rounded-full blur-[100px]" />
                    </div>
                </main>
            </div>
        </div>
    );
}
