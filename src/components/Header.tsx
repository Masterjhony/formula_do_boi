"use client";

import Link from "next/link";
import { Search, User, Menu, X, LogIn } from "lucide-react";
import { useState } from "react";

const navItems = [
    { href: "/", label: "Início" },
    { href: "/catalogo", label: "Catálogo" },
    { href: "/venda-conosco", label: "Venda Conosco" },
];



export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50">
            {/* Top Bar */}
            <div className="bg-[#0a0a0a] border-b border-white/10">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
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
                    <div className="hidden md:flex flex-1 max-w-lg mx-8">
                        <div className="relative w-full group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-brand-gold/20 p-1.5 rounded-full">
                                <Search className="w-4 h-4 text-brand-gold" />
                            </div>
                            <input
                                type="text"
                                placeholder="O que você está procurando?"
                                className="w-full pl-14 pr-4 py-3 bg-white/5 border-2 border-brand-gold/30 rounded-full focus:outline-none focus:border-brand-gold focus:bg-white/10 transition-all text-sm text-white placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">

                        <button className="hidden lg:flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                            <User className="w-5 h-5" />
                            <span className="text-sm font-medium">Minha Conta</span>
                        </button>

                        <Link
                            href="/entrar"
                            className="flex items-center gap-2 px-5 py-2.5 bg-brand-gold text-[#0a0a0a] text-sm font-bold rounded-full hover:bg-yellow-400 transition-all transform hover:scale-105 shadow-lg shadow-brand-gold/20"
                        >
                            <LogIn className="w-4 h-4" />
                            <span>Entrar</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Navigation Bar */}
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
                <div className="lg:hidden bg-[#0a0a0a] border-t border-white/10 absolute w-full left-0 animate-in slide-in-from-top-2 shadow-xl">
                    <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
                        {/* Mobile Search */}
                        <div className="relative w-full mb-4">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-brand-gold/20 p-1.5 rounded-full">
                                <Search className="w-4 h-4 text-brand-gold" />
                            </div>
                            <input
                                type="text"
                                placeholder="O que você está procurando?"
                                className="w-full pl-14 pr-4 py-3 bg-white/5 border-2 border-brand-gold/30 rounded-full text-white placeholder:text-gray-400"
                            />
                        </div>

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
