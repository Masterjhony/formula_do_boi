"use client";

import { useEffect, useState } from "react";
import BreederCard from "@/components/BreederCard";
import { BreedersService, Breeder } from "@/services/breedersService";
import { Loader2, Shield, Crown, TrendingUp, Search, Filter } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TopCriadoresPage() {
    const [breeders, setBreeders] = useState<Breeder[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("geral");

    useEffect(() => {
        async function fetchBreeders() {
            try {
                const data = await BreedersService.getTopBreeders();
                setBreeders(data);
            } catch (error) {
                console.error("Failed to load breeders", error);
            } finally {
                setLoading(false);
            }
        }
        fetchBreeders();
    }, []);

    return (
        <main className="min-h-screen bg-[#050505] text-white selection:bg-brand-gold selection:text-black flex flex-col">
            <Header />

            {/* Hero Section - Redesigned */}
            <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-40 mask-image-gradient-b" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-[#3a2a0d]/40 to-[#050505]" />
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center flex flex-col items-center">

                    {/* Subtle Element instead of giant badge */}
                    <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-1000">
                        <div className="inline-flex items-center justify-center p-2 rounded-full bg-brand-gold/10 border border-brand-gold/20 backdrop-blur-sm">
                            <Crown className="w-5 h-5 text-brand-gold mr-2" />
                            <span className="text-brand-gold text-xs font-bold uppercase tracking-widest">Elite da Pecuária</span>
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-6 font-display tracking-tight text-white animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
                        TOP <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-yellow-200 to-brand-gold">CRIADORES</span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-light tracking-wide animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 leading-relaxed">
                        Conheça os plantéis que estão redefinindo o padrão genético do Nelore no Brasil. Exclusividade, performance e tradição.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                        <button className="px-8 py-3 bg-brand-gold text-black font-bold uppercase tracking-wider rounded-sm hover:bg-white transition-colors">
                            Ranking Atual
                        </button>
                    </div>
                </div>
            </section>

            {/* Intro Section - Refined */}
            <section className="py-20 relative bg-[#0a0a0a]">
                {/* Texture/Grain Overlay */}
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay pointer-events-none"></div>

                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-3xl md:text-4xl font-display text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FAD058] to-[#D4AF37] mb-4 tracking-wide">
                        O QUE É SER UM TOP CRIADOR?
                    </h2>
                    <p className="text-[#888] font-display italic max-w-3xl mx-auto mb-16 text-lg">
                        "Excelência além dos índices. Parâmetros para ser reconhecido como referência no Fórmula do Boi."
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Premium Cards for Benefits */}
                        <div className="p-8 bg-gradient-to-b from-[#111] to-[#0a0a0a] rounded-sm border border-[#222] hover:border-[#D4AF37]/30 transition-all group shadow-xl">
                            <div className="w-14 h-14 mx-auto mb-6 relative flex items-center justify-center">
                                <div className="absolute inset-0 rotate-45 border border-[#D4AF37]/20 group-hover:border-[#D4AF37] transition-colors duration-500"></div>
                                <Crown className="w-6 h-6 text-[#D4AF37] relative z-10" />
                            </div>
                            <h3 className="text-xl font-display font-bold mb-3 text-white">Genética de Ponta</h3>
                            <p className="text-sm text-gray-500 font-light leading-relaxed">
                                Acesso aos melhores pedigrees e acasalamentos direcionados para resultados superiores.
                            </p>
                        </div>

                        <div className="p-8 bg-gradient-to-b from-[#111] to-[#0a0a0a] rounded-sm border border-[#222] hover:border-[#D4AF37]/30 transition-all group shadow-xl">
                            <div className="w-14 h-14 mx-auto mb-6 relative flex items-center justify-center">
                                <div className="absolute inset-0 rotate-45 border border-[#D4AF37]/20 group-hover:border-[#D4AF37] transition-colors duration-500"></div>
                                <TrendingUp className="w-6 h-6 text-[#D4AF37] relative z-10" />
                            </div>
                            <h3 className="text-xl font-display font-bold mb-3 text-white">Performance</h3>
                            <p className="text-sm text-gray-500 font-light leading-relaxed">
                                Animais avaliados com índices zootécnicos de destaque nos principais sumários.
                            </p>
                        </div>

                        <div className="p-8 bg-gradient-to-b from-[#111] to-[#0a0a0a] rounded-sm border border-[#222] hover:border-[#D4AF37]/30 transition-all group shadow-xl">
                            <div className="w-14 h-14 mx-auto mb-6 relative flex items-center justify-center">
                                <div className="absolute inset-0 rotate-45 border border-[#D4AF37]/20 group-hover:border-[#D4AF37] transition-colors duration-500"></div>
                                <Shield className="w-6 h-6 text-[#D4AF37] relative z-10" />
                            </div>
                            <h3 className="text-xl font-display font-bold mb-3 text-white">Confiabilidade</h3>
                            <p className="text-sm text-gray-500 font-light leading-relaxed">
                                Criadores selecionados com histórico comprovado de integridade e qualidade.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filter/Tabs Section */}
            <section className="pt-10 pb-12 bg-gradient-to-b from-[#0a0a0a] to-[#050505] relative border-t border-white/5">
                <div className="container mx-auto px-4 flex flex-col items-center">
                    <div className="h-px w-32 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent mb-8"></div>
                    <h2 className="text-3xl font-display font-bold mb-8 text-center text-white tracking-wider">
                        RANKING DE CRIADORES
                    </h2>

                    <div className="flex flex-wrap justify-center gap-4">
                        {['Rank Geral', 'Por Venda', 'Por Índice'].map((tab) => {
                            const id = tab.toLowerCase().replace(' ', '-');
                            const isActive = activeTab === id || (id === 'rank-geral' && activeTab === 'geral');

                            return (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id.replace('rank-', ''))}
                                    className={`px-8 py-2.5 text-sm font-display font-bold uppercase tracking-[0.15em] transition-all border ${isActive
                                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#FAD058] text-black border-transparent shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                                        : 'bg-transparent text-[#888] border-[#333] hover:text-[#D4AF37] hover:border-[#D4AF37]/50'
                                        }`}
                                >
                                    {tab}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Listing Section */}
            <section className="pb-24 pt-4 flex-grow">
                <div className="container mx-auto px-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
                        </div>
                    ) : breeders.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {breeders.map((breeder, index) => (
                                <div key={breeder.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${index * 100}ms` }}>
                                    <BreederCard breeder={breeder} rank={index + 1} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 max-w-2xl mx-auto">
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-500" />
                            </div>
                            <p className="text-xl text-white font-bold mb-2">Nenhum criador encontrado</p>
                            <p className="text-gray-500 text-sm">Tente ajustar os filtros ou volte mais tarde.</p>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}
