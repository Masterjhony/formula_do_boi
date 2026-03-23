"use client";

import { useState, useMemo, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CatalogGrid from "@/components/CatalogGrid";
import { useRouter } from "next/navigation";
import { SettingsService } from "@/services/settingsService";

export default function SemenClient({ products }: { products: any[] }) {
    const router = useRouter();
    const [pageVisible, setPageVisible] = useState(false);

    useEffect(() => {
        async function checkVisibility() {
            try {
                const isEnabled = await SettingsService.getSetting('semen_page_enabled');
                if (isEnabled === false) {
                    router.push('/');
                    return;
                }
                setPageVisible(true);
            } catch (error) {
                console.error("Failed to load settings", error);
                setPageVisible(true);
            }
        }
        checkVisibility();
    }, [router]);

    const filteredProducts = useMemo(() => {
        return products.filter(item => item.category === "Sêmen");
    }, [products]);

    if (!pageVisible) {
        return null;
    }

    return (
        <main className="min-h-screen bg-[#0a0a0a]">
            <Header />

            {/* Premium Hero Section: Aceleradora de Touros */}
            <section className="relative w-full pt-20 pb-20 overflow-hidden bg-[#050505] flex items-center justify-center min-h-[60vh] border-b border-brand-gold/10">
                {/* Dynamic Backgrounds */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-full md:w-2/3 h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-gold/10 via-black/0 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#0a0a0a]"></div>
                </div>
                
                <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 backdrop-blur-md mb-8">
                        <span className="w-2 h-2 rounded-full bg-brand-gold animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_8px_rgba(197,160,89,0.8)]"></span>
                        <span className="text-brand-gold text-xs md:text-sm font-bold tracking-[0.2em] uppercase">
                            Exclusividade Fórmula do Boi
                        </span>
                    </div>

                    {/* Main Title */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-center mb-6 tracking-tight uppercase leading-[1.1]">
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-300 drop-shadow-sm">Aceleradora </span>
                        <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-[#fbdf8f] to-brand-gold drop-shadow-[0_0_20px_rgba(197,160,89,0.2)]">de Touros</span>
                    </h1>

                    {/* Description Text */}
                    <div className="max-w-3xl mx-auto space-y-6 text-center mt-6">
                        <p className="text-gray-300 text-lg md:text-xl font-light leading-relaxed">
                            O ecossistema de <strong className="text-white font-medium">alta performance</strong>. Reuniu-se um plantel ultrarreservado com apenas <strong className="text-brand-gold font-bold">11 reprodutores</strong> selecionados a dedo, representando o absoluto ápice da genética provada nacional.
                        </p>
                        <p className="text-gray-500 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
                            Elevando o teto produtivo do seu rebanho com linhagens consagradas e segurança real no resultado da sua fazenda.
                        </p>
                    </div>

                    {/* Callout Card (Central Bela Vista) */}
                    <div className="mt-16 w-full max-w-3xl mx-auto">
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-gold/40 to-yellow-600/40 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 group-hover:border-brand-gold/30 transition-colors duration-300 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6 text-left">
                                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                    <svg className="w-8 h-8 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div className="text-center md:text-left">
                                    <h3 className="text-xl font-bold text-white mb-2">Parceria Oficial <span className="text-brand-gold">Central Bela Vista</span></h3>
                                    <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                                        Nossos reprodutores estão sob coleta contínua na <strong className="text-gray-200">Bela Vista</strong>, garantindo armazenamento no mais rigoroso controle de qualidade mundial e uma logística de envio direto para todo o território nacional.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Products Grid (No Sidebar) */}
                        <div className="w-full">
                            <CatalogGrid
                                products={filteredProducts}
                                totalCount={filteredProducts.length}
                                onClearFilters={() => {}}
                                hasFilters={false}
                                theme="premium"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
