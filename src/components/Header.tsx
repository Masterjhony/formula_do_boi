"use client";

import Link from "next/link";
import { User, Menu, X, LogIn, LayoutDashboard, LogOut, Heart, Beef, FileText } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import SearchBar from "./SearchBar";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { SettingsService } from "@/services/settingsService";

const defaultNavItems = [
    { href: "/", label: "Início" },
    { href: "/rankings", label: "Rankings" },
    { href: "/matrizes", label: "Matrizes" },
    { href: "/touros", label: "Touros" },
    { href: "/embrioes", label: "Embriões" },
    { href: "/venda-conosco", label: "Venda Conosco" },
];

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [navItems, setNavItems] = useState(defaultNavItems);
    const supabase = createClient();
    const router = useRouter();
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            const topBreedersEnabled = await SettingsService.getSetting('top_breeders_enabled');
            const rankingEnabled = await SettingsService.getSetting('ranking_page_enabled');
            const semenEnabled = await SettingsService.getSetting('semen_page_enabled');

            setNavItems(prev => {
                let items = [...defaultNavItems];

                if (topBreedersEnabled === false) {
                    items = items.filter(item => item.href !== "/top-criadores");
                }

                if (rankingEnabled === false) {
                    items = items.filter(item => item.href !== "/rankings");
                }

                if (semenEnabled === false) {
                    items = items.filter(item => item.href !== "/semen");
                }

                return items;
            });
        };
        fetchSettings();
    }, []);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                setProfile(data);
            }
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single()
                    .then(({ data }) => setProfile(data));
            } else {
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Close user menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setIsUserMenuOpen(false);
        router.refresh();
    };

    const UserDropdown = () => (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-900 truncate">
                    {profile?.full_name || user?.user_metadata?.full_name || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                </p>
            </div>

            <div className="py-2">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-gold transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                >
                    <LayoutDashboard className="w-4 h-4" />
                    Visão Geral
                </Link>
                <Link
                    href="/dashboard/ads"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-gold transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                >
                    <User className="w-4 h-4" />
                    Meus Anúncios
                </Link>
                <Link
                    href="/dashboard/proposals"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-gold transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                >
                    <FileText className="w-4 h-4" />
                    Minhas Propostas
                </Link>
                <Link
                    href="/dashboard/favorites"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-gold transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                >
                    <Heart className="w-4 h-4" />
                    Meus Favoritos
                </Link>
                <Link
                    href="/dashboard/herds"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-gold transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                >
                    <Beef className="w-4 h-4" />
                    Dados do Rebanho
                </Link>
            </div>

            <div className="border-t border-gray-100 pt-2 pb-1">
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                    <LogOut className="w-4 h-4" />
                    Sair da Conta
                </button>
            </div>
        </div>
    );

    return (
        <header className="sticky top-0 z-50">
            {/* Top Bar */}
            <div className="bg-[#0a0a0a] border-b border-white/10">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between relative">
                    {/* Mobile Menu Button */}
                    <button
                        className="p-2 -ml-2 text-white/80 hover:text-white lg:hidden transition-colors"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group shrink-0">
                        <div className="relative h-16 w-60 lg:h-[72px] lg:w-72 transition-transform group-hover:scale-105 duration-300">
                            <img
                                src="/logo_complete.svg"
                                alt="Fórmula do Boi"
                                className="h-full w-full object-contain object-left"
                            />
                        </div>
                    </Link>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-full max-w-lg px-4">
                        <SearchBar />
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        {user ? (
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-white/10 transition-all group"
                                >
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-bold text-white leading-none">
                                            {(profile?.full_name || user?.user_metadata?.full_name || 'Usuário').split(' ')[0]}
                                        </p>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mt-0.5 group-hover:text-brand-gold transition-colors">
                                            Minha Conta
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center text-brand-black font-bold text-lg border-2 border-transparent group-hover:border-white/20 transition-all">
                                        {(profile?.full_name || user?.user_metadata?.full_name || user.email || '?').charAt(0).toUpperCase()}
                                    </div>
                                </button>

                                {isUserMenuOpen && <UserDropdown />}
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="flex items-center gap-2 px-5 py-2.5 bg-brand-gold text-[#0a0a0a] text-sm font-bold rounded-full hover:bg-yellow-400 transition-all transform hover:scale-105 shadow-lg shadow-brand-gold/20"
                            >
                                <LogIn className="w-4 h-4" />
                                <span>Entrar</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation Bar */}
            <nav className="hidden lg:block bg-brand-black border-y border-white/5 shadow-lg">
                <div className="container mx-auto px-4">
                    <ul className="flex items-center justify-center gap-1">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className="block px-4 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors uppercase tracking-wide"
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>

            {/* Mobile Navigation Menu */}
            {isMenuOpen && (
                <div className="lg:hidden bg-[#0a0a0a] border-t border-white/10 absolute w-full left-0 animate-in slide-in-from-top-2 shadow-xl h-[calc(100vh-80px)] overflow-y-auto z-50">
                    <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
                        {/* Mobile Search */}
                        <div className="mb-4">
                            <SearchBar />
                        </div>

                        {/* Mobile User Section */}
                        {user && (
                            <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-brand-gold flex items-center justify-center text-brand-black font-bold text-xl">
                                        {(profile?.full_name || user?.user_metadata?.full_name || user.email || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-white font-bold">{profile?.full_name || user?.user_metadata?.full_name || 'Usuário'}</p>
                                        <p className="text-xs text-gray-400">{user.email}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Link
                                        href="/dashboard"
                                        className="flex flex-col items-center justify-center gap-2 p-3 bg-white/5 rounded-lg text-white hover:bg-white/10 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <LayoutDashboard className="w-5 h-5 text-brand-gold" />
                                        <span className="text-xs font-medium">Painel</span>
                                    </Link>
                                    <Link
                                        href="/dashboard/favorites"
                                        className="flex flex-col items-center justify-center gap-2 p-3 bg-white/5 rounded-lg text-white hover:bg-white/10 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Heart className="w-5 h-5 text-brand-gold" />
                                        <span className="text-xs font-medium">Favoritos</span>
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Mobile Nav Items */}
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-base font-medium text-white/90 py-3 px-4 rounded-lg hover:bg-white/5 border-b border-white/5 transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}

                        <hr className="border-white/10 my-2" />

                        {!user && (
                            <Link
                                href="/login"
                                className="flex items-center gap-2 text-base font-medium text-white/90 py-3 px-4 rounded-lg hover:bg-white/5 transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <LogIn className="w-5 h-5" />
                                Entrar
                            </Link>
                        )}

                        {user && (
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-2 text-base font-medium text-red-400 py-3 px-4 rounded-lg hover:bg-red-500/10 transition-colors w-full text-left"
                            >
                                <LogOut className="w-5 h-5" />
                                Sair da Conta
                            </button>
                        )}

                        {/* Mobile CTA */}
                        <Link
                            href="/venda-conosco"
                            className="mt-4 text-center py-3 bg-brand-gold text-[#0a0a0a] font-bold rounded-lg"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Anunciar Agora
                        </Link>
                    </div>
                </div>
            )}

        </header>
    );
}
