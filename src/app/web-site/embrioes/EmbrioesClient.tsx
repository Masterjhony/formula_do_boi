"use client";

import { useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CatalogGrid from "@/components/CatalogGrid";
import { EMBRYOS } from "@/data/embryos";
import { Product } from "@/services/products";

interface EmbrioesClientProps {
    products: Product[];
}

export default function EmbrioesClient({ products: dbProducts }: EmbrioesClientProps) {
    const allProducts = useMemo(() => {
        const dbIds = new Set(dbProducts.map(p => p.id));
        const staticKeep = EMBRYOS.filter(e => !dbIds.has(e.id));

        return [...dbProducts, ...staticKeep].filter(p => {
            const cat = p.category || '';
            const type = p.classificacao || '';
            return (cat.includes('Embrião') || cat === 'DOADORA' || type === 'embriao') && !cat.includes('Sêmen');
        });
    }, [dbProducts]);

    const filteredProducts = allProducts;

    return (
        <main className="min-h-screen bg-[#0a0a0a]">
            <Header />

            {/* Page Header Premium */}
            <section className="bg-gradient-to-br from-[#0a0a0a] to-[#121212] py-20 border-b border-brand-gold/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-gold/10 via-transparent to-transparent"></div>
                <div className="absolute left-1/2 top-10 -translate-x-1/2 w-[1px] h-12 bg-gradient-to-b from-transparent via-brand-gold/50 to-transparent"></div>

                <div className="container mx-auto px-4 text-center relative z-10">
                    <span className="text-brand-gold text-sm font-bold tracking-[0.2em] uppercase mb-4 block">
                        Multiplicação Genética
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-yellow-200 to-brand-gold mb-6 uppercase tracking-wider">
                        Embriões de Elite
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed mb-10">
                        O futuro do seu rebanho começa aqui. Acesso exclusivo a prenhezes e embriões das principais doadoras do Brasil, proporcionando resultados excepcionais e encurtando o caminho para a seleção de ponta.
                    </p>
                    
                    {/* Premium Badges */}
                    <div className="flex flex-wrap justify-center gap-4 mt-8">
                        <div className="flex items-center gap-2 bg-black/60 border border-brand-gold/20 py-2.5 px-5 rounded-full backdrop-blur-md shadow-lg shadow-brand-gold/5">
                            <svg className="w-4 h-4 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            <span className="text-gray-200 text-xs font-bold uppercase tracking-widest">Genética Provada</span>
                        </div>
                        <div className="flex items-center gap-2 bg-black/60 border border-brand-gold/20 py-2.5 px-5 rounded-full backdrop-blur-md shadow-lg shadow-brand-gold/5">
                            <svg className="w-4 h-4 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            <span className="text-gray-200 text-xs font-bold uppercase tracking-widest">Linhagens Consagradas</span>
                        </div>
                        <div className="flex items-center gap-2 bg-black/60 border border-brand-gold/20 py-2.5 px-5 rounded-full backdrop-blur-md shadow-lg shadow-brand-gold/5">
                            <svg className="w-4 h-4 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            <span className="text-gray-200 text-xs font-bold uppercase tracking-widest">Alto Valor Agregado</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12">
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
