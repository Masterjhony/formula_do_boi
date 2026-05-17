"use client";

import Link from "next/link";
import { Instagram, Phone, Mail, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { SettingsService } from "@/services/settingsService";

export default function Footer() {
    const [showTopBreeders, setShowTopBreeders] = useState(false);
    const [showSemen, setShowSemen] = useState(false);
    const [showTouros, setShowTouros] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            const topBreedersEnabled = await SettingsService.getSetting('top_breeders_enabled');
            const semenEnabled = await SettingsService.getSetting('semen_page_enabled');
            const tourosEnabled = await SettingsService.getSetting('touros_page_enabled');

            setShowTopBreeders(topBreedersEnabled === true);
            setShowSemen(semenEnabled === true);
            setShowTouros(tourosEnabled !== false);
        };
        fetchSettings();
    }, []);

    return (
        <>
        <footer className="relative bg-[#0A0A0A] text-[#F5F0E4] pt-10 pb-3 md:pt-14 md:pb-4 overflow-hidden" style={{ borderTop: "1px solid rgba(212,168,92,0.22)" }}>

            {/* Deep Relief / Intaglio Watermark
                Luz vem do topo-esquerda. Cada traço é um sulco cavado:
                - Sombra escura na borda superior-esquerda (dentro do sulco, sem luz)
                - Realce metálico na borda inferior-direita (parede do sulco pega a luz)
                - Piso do sulco = levemente mais escuro que o fundo
            */}
            <div
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
                style={{ transform: 'translateY(-4%)' }}
            >
                {/* Shadow 1 — sombra profunda no topo-esquerdo do sulco (a aresta bloqueia a luz) */}
                <img
                    src="/logo_complete.svg"
                    alt=""
                    className="absolute w-[480px] md:w-[820px] lg:w-[1000px] object-contain"
                    style={{
                        filter: 'brightness(0)',
                        opacity: 0.85,
                        transform: 'translate(-2.5px, -3px)',
                    }}
                />
                {/* Shadow 2 — sombra difusa mais larga para profundidade extra */}
                <img
                    src="/logo_complete.svg"
                    alt=""
                    className="absolute w-[480px] md:w-[820px] lg:w-[1000px] object-contain"
                    style={{
                        filter: 'brightness(0) blur(1.5px)',
                        opacity: 0.5,
                        transform: 'translate(-3.5px, -4px)',
                    }}
                />
                {/* Highlight 1 — realce metálico na borda inferior-direita (luz pega a parede do sulco) */}
                <img
                    src="/logo_complete.svg"
                    alt=""
                    className="absolute w-[480px] md:w-[820px] lg:w-[1000px] object-contain"
                    style={{
                        filter: 'brightness(0.45) sepia(0.2) saturate(0.3)',
                        opacity: 0.28,
                        transform: 'translate(2px, 2.5px)',
                    }}
                />
                {/* Highlight 2 — realce mais fino e definido, borda nítida */}
                <img
                    src="/logo_complete.svg"
                    alt=""
                    className="absolute w-[480px] md:w-[820px] lg:w-[1000px] object-contain"
                    style={{
                        filter: 'brightness(0.55) sepia(0.15) saturate(0.2)',
                        opacity: 0.12,
                        transform: 'translate(1px, 1px)',
                    }}
                />
                {/* Body — piso do sulco, tom ligeiramente mais escuro que #080808 */}
                <img
                    src="/logo_complete.svg"
                    alt=""
                    className="absolute w-[480px] md:w-[820px] lg:w-[1000px] object-contain"
                    style={{
                        filter: 'brightness(0.035)',
                        opacity: 1,
                    }}
                />
            </div>

            {/* Vignette depth overlay */}
            <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 120% 100% at 50% 50%, transparent 30%, rgba(0,0,0,0.5) 100%)'
                }}
            />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6 md:gap-12 md:mb-8">
                    {/* Brand Column */}
                    <div className="space-y-4 md:space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
                        <div className="flex flex-col items-center md:items-start">
                            {/* Brand Logo */}
                            <div className="relative h-24 w-72 md:h-24 md:w-80 lg:h-32 lg:w-96 mb-4 md:mb-6">
                                <img
                                    src="/logo_complete.svg"
                                    alt="Fórmula do Boi"
                                    className="h-full w-full object-contain object-center md:object-left"
                                />
                            </div>
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: "rgba(245,240,228,0.62)", maxWidth: "36ch" }}>
                            Curadoria de Nelore PO — sêmen top 0.1%, doadoras consagradas, embriões FIV selecionados e leilões com curadoria especializada.
                        </p>
                        <div className="flex gap-3">
                            <a
                                href="https://www.instagram.com/formuladoboi/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center transition-colors hover:bg-[#A0792E] hover:text-[#0A0A0A]"
                                style={{
                                    width: 38, height: 38,
                                    border: "1px solid rgba(212,168,92,0.35)",
                                    color: "#D4A85C",
                                    borderRadius: 2,
                                }}
                            >
                                <Instagram className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Links Column */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <h3 className="mb-4 md:mb-6" style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            letterSpacing: "0.24em",
                            textTransform: "uppercase",
                            color: "#D4A85C",
                            fontWeight: 500,
                        }}>Navegação</h3>
                        <ul className="space-y-2.5 md:space-y-3 text-sm" style={{ color: "rgba(245,240,228,0.62)" }}>
                            <li><Link href="/" className="hover:text-[#D4A85C] transition-colors">Início</Link></li>
                            {showTouros && (
                                <li><Link href="/touros" className="hover:text-[#D4A85C] transition-colors">Touros</Link></li>
                            )}
                            {showSemen && (
                                <li><Link href="/semen" className="hover:text-[#D4A85C] transition-colors">Sêmen</Link></li>
                            )}
                            <li><Link href="/embrioes" className="hover:text-[#D4A85C] transition-colors">Doadoras & Embriões</Link></li>
                            <li><Link href="/agenda" className="hover:text-[#D4A85C] transition-colors">Leilões</Link></li>
                            <li><Link href="/grupo-vip" className="hover:text-[#D4A85C] transition-colors">Grupo VIP</Link></li>
                            {showTopBreeders && (
                                <li><Link href="/top-criadores" className="hover:text-[#D4A85C] transition-colors">Top Criadores</Link></li>
                            )}
                            <li><Link href="/quem-somos" className="hover:text-[#D4A85C] transition-colors">Quem Somos</Link></li>
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <h3 className="mb-4 md:mb-6" style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            letterSpacing: "0.24em",
                            textTransform: "uppercase",
                            color: "#D4A85C",
                            fontWeight: 500,
                        }}>Contato</h3>
                        <ul className="space-y-3 md:space-y-4 text-sm" style={{ color: "rgba(245,240,228,0.70)" }}>
                            <li className="flex flex-col md:flex-row items-center md:items-start gap-3">
                                <Phone className="w-4 h-4 mt-0.5" style={{ color: "#A0792E" }} />
                                <span>(31) 9414-9161<br />(31) 7565-9900</span>
                            </li>
                            <li className="flex flex-col md:flex-row items-center md:items-start gap-3">
                                <Mail className="w-4 h-4 mt-0.5" style={{ color: "#A0792E" }} />
                                <span>formuladoboi@gmail.com</span>
                            </li>
                            <li className="flex flex-col md:flex-row items-center md:items-start gap-3">
                                <MapPin className="w-4 h-4 mt-0.5" style={{ color: "#A0792E" }} />
                                <span>
                                    Rua Magi Salomon, 246 · Apt 100<br />
                                    Salgado Filho · Belo Horizonte / MG<br />
                                    CEP 30.550-190
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Parceiros — strip institucional brandbook */}
                <div
                    className="flex flex-col md:flex-row items-center justify-center gap-5 md:gap-10"
                    style={{
                        borderTop: "1px solid rgba(212,168,92,0.14)",
                        padding: "12px 0 0",
                    }}
                >
                    <span
                        style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            letterSpacing: "0.28em",
                            textTransform: "uppercase",
                            color: "rgba(245,240,228,0.42)",
                            fontWeight: 500,
                        }}
                    >
                        Parceiros
                    </span>
                    {[
                        { name: "Bula Assessoria · Bula Remates" },
                        { name: "Aceleradora de Touros" },
                        { name: "Central Bela Vista" },
                        { name: "Nelore Visual" },
                    ].map((p) => (
                        <span
                            key={p.name}
                            style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 10.5,
                                letterSpacing: "0.16em",
                                textTransform: "uppercase",
                                color: "rgba(245,240,228,0.68)",
                                fontWeight: 500,
                            }}
                        >
                            {p.name}
                        </span>
                    ))}
                </div>
            </div>
        </footer>
        </>
    );
}
