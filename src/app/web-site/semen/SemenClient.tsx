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

            {/* Page Header */}
            <section className="bg-[#0a0a0a] py-12 border-b border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-gold/10 to-transparent"></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        Genética <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-200">Comprovada</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Touros testados e aprovados para produtividade, desempenho e confiabilidade genética.
                    </p>
                </div>
            </section>

            {/* Marketing Section: Aceleradora de Touros */}
            <section className="bg-gradient-to-br from-[#0a0a0a] to-[#111111] py-20 border-b border-brand-gold/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-gold/10 via-transparent to-transparent"></div>
                
                {/* Decorative element */}
                <div className="absolute left-1/2 top-10 -translate-x-1/2 w-[1px] h-12 bg-gradient-to-b from-transparent via-brand-gold/50 to-transparent"></div>
                
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <span className="text-brand-gold text-sm font-bold tracking-[0.2em] uppercase mb-4 block">
                        Exclusividade Fórmula do Boi
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-yellow-200 to-brand-gold mb-8 uppercase tracking-wider">
                        Aceleradora de Touros
                    </h2>
                    <div className="max-w-4xl mx-auto space-y-6">
                        <p className="text-gray-300 text-lg md:text-xl leading-relaxed">
                            A <strong className="text-white font-semibold">Aceleradora de Touros</strong> é o ecossistema de alta performance da Fórmula do Boi. Reuniu-se um plantel ultrarreservado com apenas <strong className="text-brand-gold">11 reprodutores</strong> selecionados a dedo, que representam o absoluto ápice da genética provada nacional.
                        </p>
                        <p className="text-gray-400 text-md leading-relaxed">
                            Nosso objetivo é elevar o teto produtivo do seu rebanho, oferecendo acesso democratizado a linhagens consagradas e proporcionando segurança real no resultado da sua fazenda.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-16 cursor-default">
                        <div className="bg-black/60 p-8 rounded-2xl border border-white/5 max-w-lg w-full backdrop-blur-md hover:border-brand-gold/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(197,160,89,0.1)] group">
                            <h3 className="text-2xl font-bold text-white mb-3 text-center">Parceria Oficial <span className="text-brand-gold">Central Bela Vista</span></h3>
                            <p className="text-gray-400 text-base leading-relaxed">
                                A excelência genética exige um suporte de classe mundial. Nossos reprodutores estão sob coleta contínua na <strong className="text-gray-200">Central Bela Vista</strong>, garantindo armazenamento no mais rigoroso controle de qualidade mundial e uma logística de envio direto para <span className="text-white">todo o território nacional</span>.
                            </p>
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
