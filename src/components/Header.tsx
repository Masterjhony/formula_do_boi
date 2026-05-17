"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { SettingsService } from "@/services/settingsService";

const defaultNavItems = [
    { href: "/", label: "Início" },
    { href: "/touros", label: "Touros" },
    { href: "/embrioes", label: "Embriões" },
    { href: "/agenda", label: "Leilões" },
    { href: "/grupo-vip", label: "Grupo VIP" },
];

const CACHE_KEY = "header_settings_cache";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [navItems, setNavItems] = useState(defaultNavItems);
    const pathname = usePathname();

    const updateNavItems = (semenEnabled: unknown, tourosEnabled: unknown) => {
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

    useEffect(() => {
        const fetchSettings = async () => {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    updateNavItems(parsed.semenEnabled, parsed.tourosEnabled);
                } catch {
                    // ignore
                }
            }

            const semenEnabled = await SettingsService.getSetting("semen_page_enabled");
            const tourosEnabled = await SettingsService.getSetting("touros_page_enabled");
            localStorage.setItem(
                CACHE_KEY,
                JSON.stringify({ semenEnabled, tourosEnabled, timestamp: Date.now() }),
            );
            updateNavItems(semenEnabled, tourosEnabled);
        };

        fetchSettings();
    }, []);

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isMenuOpen]);

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname === href || pathname?.startsWith(`${href}/`);
    };

    return (
        <header
            className="relative z-40"
            style={{
                background: "rgba(10,10,10,0.96)",
            }}
        >
            {/* Radial bronze glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse at 50% -20%, rgba(212,168,92,0.14) 0%, rgba(10,10,10,0) 55%)",
                }}
            />

            <div className="relative">
                {/* ─────────── BAR 1 — LOGO CENTRALIZADO ─────────── */}
                <div className="container mx-auto px-4 lg:px-6">
                    <div className="relative grid grid-cols-[auto_1fr_auto] items-center min-h-[68px] lg:min-h-[104px] py-2">
                        {/* Left: hamburger mobile */}
                        <div className="flex items-center lg:justify-start">
                            <button
                                className="lg:hidden p-2 -ml-2 text-white hover:text-[var(--bronze-light)] transition-colors"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
                                aria-expanded={isMenuOpen}
                            >
                                {isMenuOpen ? (
                                    <X className="w-6 h-6" strokeWidth={2.25} />
                                ) : (
                                    <span className="flex flex-col justify-center gap-[6px] w-6">
                                        <span className="block h-[2px] w-6 bg-current rounded-full" />
                                        <span className="block h-[2px] w-6 bg-current rounded-full" />
                                        <span className="block h-[2px] w-6 bg-current rounded-full" />
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Center: LOGO centralizado */}
                        <div className="flex items-center justify-center">
                            <Link
                                href="/"
                                aria-label="Fórmula do Boi — Início"
                                className="group relative inline-flex items-center justify-center"
                            >
                                <div
                                    className="relative h-14 w-52 lg:h-[88px] lg:w-[360px] transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                                >
                                    <img
                                        src="/logo_complete.svg"
                                        alt="Fórmula do Boi"
                                        className="h-full w-full object-contain"
                                    />
                                </div>
                            </Link>
                        </div>

                        {/* Right: spacer */}
                        <div className="flex items-center justify-end">
                            <div className="lg:hidden w-10" aria-hidden="true" />
                            <div className="hidden lg:block w-10" aria-hidden="true" />
                        </div>
                    </div>
                </div>

                {/* ─────────── HAIRLINE GRADIENT BRONZE ─────────── */}
                <div className="relative h-px w-full overflow-hidden">
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                "linear-gradient(90deg, rgba(212,168,92,0) 0%, rgba(212,168,92,0.45) 50%, rgba(212,168,92,0) 100%)",
                        }}
                    />
                </div>

                {/* ─────────── BAR 2 — NAV (desktop) ─────────── */}
                <nav
                    className="hidden lg:block relative"
                    aria-label="Navegação principal"
                    style={{
                        background:
                            "linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.4) 100%)",
                    }}
                >
                    <div className="container mx-auto px-4 lg:px-6">
                        <ul className="flex items-center justify-center gap-2 py-2">
                            {navItems.map((item, idx) => {
                                const active = isActive(item.href);
                                return (
                                    <li key={item.href} className="flex items-center">
                                        {idx > 0 && (
                                            <span
                                                aria-hidden="true"
                                                className="text-[var(--bronze-light)]/25"
                                                style={{
                                                    fontFamily: "var(--font-mono)",
                                                    fontSize: 10,
                                                    letterSpacing: "0.2em",
                                                }}
                                            >
                                                ·
                                            </span>
                                        )}
                                        <Link
                                            href={item.href}
                                            className="group relative flex items-center px-5 py-2.5"
                                            aria-current={active ? "page" : undefined}
                                        >
                                            {/* pip topo */}
                                            <span
                                                aria-hidden="true"
                                                className={`absolute top-0 left-1/2 -translate-x-1/2 h-[4px] w-[4px] rounded-full bg-[var(--bronze-light)] transition-all duration-300 ease-out
                                                    ${active
                                                        ? "opacity-100 scale-100"
                                                        : "opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100"}
                                                `}
                                                style={{ boxShadow: "0 0 10px rgba(212,168,92,0.6)" }}
                                            />

                                            <span
                                                className={`relative transition-colors duration-200 ${active ? "text-[var(--bronze-light)]" : "text-[#F5F0E4] group-hover:text-[var(--bronze-light)]"}`}
                                                style={{
                                                    fontFamily: "var(--font-mono)",
                                                    fontSize: 11,
                                                    letterSpacing: "0.24em",
                                                    textTransform: "uppercase",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {item.label}
                                            </span>

                                            {/* underline animado center-out */}
                                            <span
                                                aria-hidden="true"
                                                className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] bg-[var(--bronze-light)] transition-all duration-300 ease-out
                                                    ${active ? "w-[32px]" : "w-0 group-hover:w-[32px]"}
                                                `}
                                                style={{ boxShadow: "0 0 8px rgba(212,168,92,0.45)" }}
                                            />
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </nav>

                {/* Bottom border bronze sutil */}
                <div
                    className="h-px w-full"
                    style={{ background: "rgba(212,168,92,0.14)" }}
                />
            </div>

            {/* ─────────── Mobile Drawer ─────────── */}
            <div
                className={`lg:hidden fixed inset-x-0 top-[68px] bottom-0 z-40 transition-opacity duration-300 ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                style={{
                    background: "rgba(10,10,10,0.98)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                }}
                aria-hidden={!isMenuOpen}
            >
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(ellipse at 50% 0%, rgba(212,168,92,0.12) 0%, rgba(10,10,10,0) 50%)",
                    }}
                />

                <nav
                    className="relative container mx-auto px-4 pt-6 pb-10 flex flex-col"
                    aria-label="Navegação principal (mobile)"
                >
                    <div className="flex items-center justify-center gap-3 pb-5">
                        <span className="h-px w-8 bg-[var(--bronze-light)]/30" />
                        <span
                            className="text-[var(--bronze-light)]"
                            style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 10,
                                letterSpacing: "0.3em",
                                textTransform: "uppercase",
                            }}
                        >
                            Curadoria · Nelore PO
                        </span>
                        <span className="h-px w-8 bg-[var(--bronze-light)]/30" />
                    </div>

                    {navItems.map((item, idx) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="group relative flex items-center gap-4 py-5 transition-transform duration-200 active:scale-[0.98]"
                                style={{
                                    borderBottom: "1px solid rgba(212,168,92,0.10)",
                                    opacity: isMenuOpen ? 1 : 0,
                                    transform: isMenuOpen ? "translateY(0)" : "translateY(8px)",
                                    transition: `opacity 320ms ease ${80 + idx * 50}ms, transform 320ms ease ${80 + idx * 50}ms, color 200ms ease`,
                                }}
                                aria-current={active ? "page" : undefined}
                            >
                                <span
                                    aria-hidden="true"
                                    className={`h-[6px] w-[6px] rounded-full transition-all duration-300 ${active ? "bg-[var(--bronze-light)] scale-100" : "bg-[var(--bronze-light)]/30 scale-75 group-hover:bg-[var(--bronze-light)] group-hover:scale-100"}`}
                                    style={
                                        active
                                            ? { boxShadow: "0 0 12px rgba(212,168,92,0.6)" }
                                            : undefined
                                    }
                                />
                                <span
                                    className={`flex-1 ${active ? "text-[var(--bronze-light)]" : "text-[#F5F0E4]"} group-hover:text-[var(--bronze-light)] transition-colors`}
                                    style={{
                                        fontFamily: "var(--font-mono)",
                                        fontSize: 14,
                                        letterSpacing: "0.22em",
                                        textTransform: "uppercase",
                                        fontWeight: 500,
                                    }}
                                >
                                    {item.label}
                                </span>
                                <span
                                    aria-hidden="true"
                                    className="text-[var(--bronze-light)]/40 group-hover:text-[var(--bronze-light)] group-hover:translate-x-1 transition-all duration-300"
                                    style={{
                                        fontFamily: "var(--font-mono)",
                                        fontSize: 14,
                                    }}
                                >
                                    →
                                </span>
                            </Link>
                        );
                    })}

                    <div className="mt-10 flex items-center justify-center gap-3">
                        <span className="h-px w-6 bg-[var(--bronze-light)]/20" />
                        <span
                            className="text-[var(--fg-muted)]"
                            style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 10,
                                letterSpacing: "0.3em",
                                textTransform: "uppercase",
                            }}
                        >
                            Genética de Elite
                        </span>
                        <span className="h-px w-6 bg-[var(--bronze-light)]/20" />
                    </div>
                </nav>
            </div>
        </header>
    );
}
