"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import { SettingsService } from "@/services/settingsService";

const defaultNavItems = [
    { href: "/", label: "Início" },
    { href: "/touros", label: "Touros" },
    { href: "/embrioes", label: "Embriões" },
    { href: "/agenda", label: "Leilões" },
    { href: "/venda-conosco", label: "Contato" },
];

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [navItems, setNavItems] = useState(defaultNavItems);

    const CACHE_KEY = 'header_settings_cache';

    useEffect(() => {
        const fetchSettings = async () => {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    updateNavItems(parsed.semenEnabled, parsed.tourosEnabled);
                } catch (e) {
                    // ignore
                }
            }

            const semenEnabled = await SettingsService.getSetting('semen_page_enabled');
            const tourosEnabled = await SettingsService.getSetting('touros_page_enabled');
            localStorage.setItem(CACHE_KEY, JSON.stringify({ semenEnabled, tourosEnabled, timestamp: Date.now() }));
            updateNavItems(semenEnabled, tourosEnabled);
        };

        fetchSettings();
    }, []);

    const updateNavItems = (semenEnabled: any, tourosEnabled: any) => {
        setNavItems(() => {
            const items = [defaultNavItems[0]];
            if (semenEnabled === true) items.push({ href: "/semen", label: "Sêmen" });
            if (tourosEnabled !== false) items.push(defaultNavItems[1]);
            items.push(defaultNavItems[2]);
            items.push(defaultNavItems[3]);
            items.push(defaultNavItems[4]);
            return items;
        });
    };

    return (
        <>
        <header className="sticky top-0 z-50">
            {/* Top Bar */}
            <div className="bg-[#0A0A0A]" style={{ borderBottom: "1px solid rgba(212,168,92,0.14)" }}>
                <div className="container mx-auto px-4 h-20 flex items-center justify-between relative">

                    {/* ── MOBILE: hamburger à esquerda ── */}
                    <button
                        className="lg:hidden p-2 -ml-1 text-white hover:text-brand-gold transition-colors flex-shrink-0"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Abrir menu"
                    >
                        {isMenuOpen ? (
                            <X className="w-6 h-6" strokeWidth={2.5} />
                        ) : (
                            <span className="flex flex-col justify-center gap-[6px] w-6">
                                <span className="block h-[2px] w-6 bg-white rounded-full" />
                                <span className="block h-[2px] w-6 bg-white rounded-full" />
                                <span className="block h-[2px] w-6 bg-white rounded-full" />
                            </span>
                        )}
                    </button>

                    {/* Logo
                        – mobile: absolutamente centralizada
                        – desktop: posição normal no fluxo (à esquerda) */}
                    <Link
                        href="/"
                        className="
                            absolute left-1/2 -translate-x-1/2
                            lg:static lg:left-auto lg:translate-x-0
                            flex items-center group shrink-0
                        "
                    >
                        <div className="relative h-16 w-52 lg:h-[72px] lg:w-72 transition-transform group-hover:scale-105 duration-300">
                            <img
                                src="/logo_complete.svg"
                                alt="Fórmula do Boi"
                                className="h-full w-full object-contain lg:object-left"
                            />
                        </div>
                    </Link>

                    {/* Search Bar — só desktop, centralizada absolutamente */}
                    <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-full max-w-lg px-4">
                        <SearchBar />
                    </div>

                    {/* Espaçador direito no mobile para manter logo centrada */}
                    <div className="w-8 flex-shrink-0 lg:hidden" aria-hidden="true" />

                    {/* Espaçador direito no desktop (onde ficava o botão Entrar) */}
                    <div className="hidden lg:block w-[88px]" aria-hidden="true" />
                </div>
            </div>

            {/* Navigation Bar — desktop */}
            <nav
                className="hidden lg:block"
                style={{
                    background: "#0A0A0A",
                    borderBottom: "1px solid rgba(212,168,92,0.14)",
                }}
            >
                <div className="container mx-auto px-4">
                    <ul className="flex items-center justify-center gap-1">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className="block px-5 py-3.5 transition-colors hover:text-[#D4A85C]"
                                    style={{
                                        fontFamily: "var(--font-mono)",
                                        fontSize: 11,
                                        letterSpacing: "0.22em",
                                        textTransform: "uppercase",
                                        fontWeight: 500,
                                        color: "#F5F0E4",
                                    }}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>

            {/* Mobile Navigation Drawer */}
            {isMenuOpen && (
                <div className="lg:hidden bg-[#0a0a0a] border-t border-white/10 absolute w-full left-0 animate-in slide-in-from-top-2 shadow-xl h-[calc(100vh-80px)] overflow-y-auto z-50">
                    <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
                        {/* Mobile Search */}
                        <div className="mb-4">
                            <SearchBar />
                        </div>

                        {/* Nav Links */}
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

                        {/* Mobile CTA */}
                        <Link
                            href="/venda-conosco"
                            className="mt-2 text-center py-3.5"
                            style={{
                                background: "#A0792E",
                                color: "#0A0A0A",
                                fontFamily: "var(--font-mono)",
                                fontSize: 12,
                                letterSpacing: "0.16em",
                                textTransform: "uppercase",
                                fontWeight: 600,
                                borderRadius: 2,
                            }}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Solicitar proposta →
                        </Link>
                    </div>
                </div>
            )}
        </header>
        </>
    );
}
