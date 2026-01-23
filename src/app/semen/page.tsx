"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CatalogGrid from "@/components/CatalogGrid";
import { EMBRYOS } from "@/data/embryos";

export default function SemenPage() {
    // Filter only Semen
    const semen = EMBRYOS.filter(item => item.category === "Sêmen");

    return (
        <main className="min-h-screen bg-gray-50">
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

            {/* Main Content */}
            <section className="py-8">
                <div className="container mx-auto px-4">
                    <CatalogGrid
                        products={semen}
                        totalCount={semen.length}
                        onClearFilters={() => { }}
                        hasFilters={false}
                    />
                </div>
            </section>

            <Footer />
        </main>
    );
}
