"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CatalogGrid from "@/components/CatalogGrid";
import { EMBRYOS } from "@/data/embryos";

export default function EmbrioesSemenPage() {
    return (
        <main className="min-h-screen bg-gray-50">
            <Header />

            {/* Page Header */}
            <section className="bg-[#0a0a0a] py-12 border-b border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-gold/10 to-transparent"></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        Embriões & <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-200">Sêmen</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Genética de ponta para elevar o patamar do seu rebanho.
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-8">
                <div className="container mx-auto px-4">
                    {/* Reuse CatalogGrid but without sidebar for now as requested filters are cattle specific */}
                    <CatalogGrid
                        products={EMBRYOS}
                        totalCount={EMBRYOS.length}
                        onClearFilters={() => { }}
                        hasFilters={false}
                    />
                </div>
            </section>

            <Footer />
        </main>
    );
}
