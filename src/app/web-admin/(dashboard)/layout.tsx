'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, LogOut, Menu, X, User } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
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
        { href: '/breeders', label: 'Criadores', icon: User },
        { href: '/users', label: 'Usuários', icon: User },
    ];

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex font-sans text-gray-100">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#111111] border-r border-[#222222] transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:relative lg:translate-x-0 flex flex-col`}
            >
                <div className="p-8 border-b border-[#222222] flex justify-center items-center relative">
                    <Link href="/" className="block relative h-24 w-full max-w-[240px]">
                        {/* Ensure you have this logo, otherwise fallback to text */}
                        <Image
                            src="/logo_complete.svg"
                            alt="Fórmula do Boi"
                            fill
                            className="object-contain"
                            priority
                        />
                    </Link>
                    <button
                        className="lg:hidden absolute right-4 text-gray-400 hover:text-white"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="px-6 py-6">
                    <div className="flex items-center gap-3 p-4 bg-[#1A1A1A] rounded-2xl border border-[#222222]/50 shadow-inner">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B8860B] to-[#9A7209] flex items-center justify-center text-black font-bold text-lg shadow-lg shadow-[#B8860B]/20">
                            A
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <h3 className="text-white text-sm font-bold truncate">Administrador</h3>
                            <p className="text-gray-500 text-xs truncate">Gestão Global</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-black font-bold shadow-lg shadow-[#B8860B]/20'
                                    : 'text-gray-400 hover:bg-[#1A1A1A] hover:text-white'
                                    }`}
                            >
                                <Icon size={20} className={`${isActive ? 'text-black' : 'text-gray-500 group-hover:text-[#B8860B]'} transition-colors`} />
                                <span>{item.label}</span>
                                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-black/40" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-[#222222]">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-3.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Sair do Painel</span>
                    </button>
                    <div className="text-center mt-4 text-[10px] text-gray-700 uppercase tracking-widest">
                        Fórmula do Boi v1.0
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden bg-[#111111] border-b border-[#222222] p-4 flex items-center justify-between z-40">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="text-gray-400 hover:text-white"
                    >
                        <Menu size={24} />
                    </button>
                    <Image
                        src="/logo_complete.svg"
                        alt="Fórmula"
                        width={120}
                        height={40}
                        className="h-8 w-auto object-contain"
                    />
                    <div className="w-6" /> {/* Spacer */}
                </header>

                <main className="flex-1 overflow-auto bg-[#0A0A0A] p-6 lg:p-10 scrollbar-thin scrollbar-thumb-[#222222] scrollbar-track-transparent">
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
