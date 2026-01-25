"use client";

import { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FilterSidebar from "@/components/FilterSidebar";
import CatalogGrid from "@/components/CatalogGrid";
import { PRODUCTS } from "@/data/products";

// Use only PRODUCTS (Nelore)
const allProducts = PRODUCTS;

export default function TourosPage() {
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
        classificacao: [],
        faixa_valor: [],
        forma_pagamento: [],
        logistica: [],
    });

    const handleFilterChange = (sectionId: string, value: string, checked: boolean) => {
        setSelectedFilters((prev) => {
            const current = prev[sectionId] || [];
            if (checked) {
                return { ...prev, [sectionId]: [...current, value] };
            } else {
                return { ...prev, [sectionId]: current.filter((v) => v !== value) };
            }
        });
    };

    const handleClearFilters = () => {
        setSelectedFilters({
            classificacao: [],
            faixa_valor: [],
            forma_pagamento: [],
            logistica: [],
        });
    };

    const hasFilters = Object.values(selectedFilters).some((arr) => arr.length > 0);

    const parsePrice = (priceStr: string) => {
        return parseFloat(priceStr.replace(/\./g, "").replace(",", "."));
    };

    const checkPriceRange = (price: number, ranges: string[]) => {
        if (ranges.length === 0) return true;
        return ranges.some(range => {
            if (range === "ate_5k") return price <= 5000;
            if (range === "5k_10k") return price > 5000 && price <= 10000;
            if (range === "10k_20k") return price > 10000 && price <= 20000;
            if (range === "acima_20k") return price > 20000;
            return false;
        });
    };

    const filteredProducts = useMemo(() => {
        // Filter for "Touros" page (requested to contain all other animals except VIS 4596)
        // Excluding:
        // - ID 7 (VIS 4596 - belongs to Matrizes)
        // - Category 'Sêmen' (belongs to Semen)
        // - Category 'Embrião' (if any, belongs to Embryos)
        let items = allProducts.filter(p =>
            p.id !== 7 &&
            p.category !== 'Sêmen' &&
            p.category !== 'Embrião'
        );

        if (!hasFilters) return items;

        return items.filter((product) => {
            // Check Payment
            if (selectedFilters.forma_pagamento.length > 0 &&
                !selectedFilters.forma_pagamento.includes(product.forma_pagamento || "")) {
                return false;
            }

            // Check Logistics
            if (selectedFilters.logistica.length > 0 &&
                !selectedFilters.logistica.includes(product.logistica || "")) {
                return false;
            }

            // Check Price
            if (selectedFilters.faixa_valor.length > 0) {
                const price = parsePrice(product.price);
                if (!checkPriceRange(price, selectedFilters.faixa_valor)) {
                    return false;
                }
            }

            return true;
        });
    }, [selectedFilters, hasFilters]);

    return (
        <main className="min-h-screen bg-gray-50">
            <Header />

            {/* Page Header */}
            <section className="bg-[#0a0a0a] py-12 border-b border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-gold/10 to-transparent"></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        Touros <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-200">Melhoradores</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Reprodutores selecionados para máxima produtividade.
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar */}
                        <FilterSidebar
                            selectedFilters={selectedFilters}
                            onFilterChange={handleFilterChange}
                            onClearFilters={handleClearFilters}
                        />

                        {/* Products Grid */}
                        <CatalogGrid
                            products={filteredProducts}
                            totalCount={filteredProducts.length}
                            onClearFilters={handleClearFilters}
                            hasFilters={hasFilters}
                        />
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
