"use client";

import Link from "next/link";
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { SettingsService } from "@/services/settingsService";

export default function Footer() {
    const [showTopBreeders, setShowTopBreeders] = useState(false);
    const [showSemen, setShowSemen] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            const topBreedersEnabled = await SettingsService.getSetting('top_breeders_enabled');
            const semenEnabled = await SettingsService.getSetting('semen_page_enabled');

            // Only show if explicitly not false (or however we want to handle defaults)
            // Since we want to avoid flicker, default state is false (hidden).
            // We update to true only if check passes.
            setShowTopBreeders(topBreedersEnabled === true);
            setShowSemen(semenEnabled === true);
        };
        fetchSettings();
    }, []);

    return (
        <>
        <footer className="relative bg-[#080808] text-white pt-10 pb-6 md:pt-16 md:pb-8 border-t border-yellow-900/40 overflow-hidden">

            {/* Debossed Stamp Watermark — three-layer technique */}
            <div
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
                style={{ transform: 'translateY(-4%)' }}
            >
                {/* Layer 1 — cast shadow (offset down-right, pure black) */}
                <img
                    src="/logo_complete.svg"
                    alt=""
                    className="absolute w-[480px] md:w-[820px] lg:w-[1000px] object-contain"
                    style={{
                        filter: 'brightness(0)',
                        opacity: 0.55,
                        transform: 'translate(3px, 4px)',
                    }}
                />
                {/* Layer 2 — debossed body (the stamp itself, very dark warm tone) */}
                <img
                    src="/logo_complete.svg"
                    alt=""
                    className="w-[480px] md:w-[820px] lg:w-[1000px] object-contain"
                    style={{
                        filter: 'brightness(0.08) sepia(0.4)',
                        opacity: 0.92,
                    }}
                />
                {/* Layer 3 — rim highlight (offset up-left, barely-there warm gold) */}
                <img
                    src="/logo_complete.svg"
                    alt=""
                    className="absolute w-[480px] md:w-[820px] lg:w-[1000px] object-contain"
                    style={{
                        filter: 'sepia(1) saturate(5) brightness(0.7)',
                        opacity: 0.07,
                        transform: 'translate(-2px, -3px)',
                    }}
                />
            </div>

            {/* Vignette depth overlay */}
            <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 120% 100% at 50% 50%, transparent 25%, rgba(0,0,0,0.6) 100%)'
                }}
            />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 md:gap-12 md:mb-12">
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
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Ecossistema completo de genética Nelore P.O. — touros, sêmen, doadoras, embriões e leilões com curadoria especializada.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://www.instagram.com/formuladoboi/" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-full hover:bg-brand-gold hover:text-brand-black transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links Column */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <h3 className="text-lg font-bold mb-3 md:mb-6 text-brand-gold uppercase tracking-wider">Navegação</h3>
                        <ul className="space-y-2 md:space-y-4 text-sm text-gray-400">
                            <li><Link href="/" className="hover:text-white transition-colors">Início</Link></li>
                            <li><Link href="/touros" className="hover:text-white transition-colors">Touros</Link></li>
                            {showSemen && (
                                <li><Link href="/semen" className="hover:text-white transition-colors">Sêmen</Link></li>
                            )}
                            <li><Link href="/embrioes" className="hover:text-white transition-colors">Doadoras & Embriões</Link></li>
                            {showTopBreeders && (
                                <li><Link href="/top-criadores" className="hover:text-white transition-colors">Top Criadores</Link></li>
                            )}
                            <li><Link href="/quem-somos" className="hover:text-white transition-colors">Quem Somos</Link></li>
                            <li><Link href="/venda-conosco" className="hover:text-white transition-colors">Venda Conosco</Link></li>
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <h3 className="text-lg font-bold mb-3 md:mb-6 text-brand-gold uppercase tracking-wider">Contato</h3>
                        <ul className="space-y-2 md:space-y-4 text-sm text-gray-400">
                            <li className="flex flex-col md:flex-row items-center md:items-start gap-3">
                                <Phone className="w-5 h-5 mt-0.5 text-brand-gold" />
                                <span>(31) 9414-9161<br />(31) 7565-9900</span>
                            </li>
                            <li className="flex flex-col md:flex-row items-center md:items-start gap-3">
                                <Mail className="w-5 h-5 mt-0.5 text-brand-gold" />
                                <span>formuladoboi@gmail.com</span>
                            </li>
                            <li className="flex flex-col md:flex-row items-center md:items-start gap-3">
                                <MapPin className="w-5 h-5 mt-0.5 text-brand-gold" />
                                <span>Belo Horizonte - MG</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-6 md:pt-8 border-t border-yellow-900/30 text-center text-xs text-gray-500 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p>&copy; 2024 Fórmula do Boi. Todos os direitos reservados.</p>
                    <p>Desenvolvido com tecnologia de ponta.</p>
                </div>
            </div>
        </footer>
        </>
    );
}
