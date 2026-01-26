"use client";

import { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tag, Globe } from "lucide-react";
import FilterSidebar, { commonFilters } from "@/components/FilterSidebar";
import CatalogGrid from "@/components/CatalogGrid";
import { EMBRYOS } from "@/data/embryos";

export default function EmbrioesPage() {
    const embrioesFilters = [
        {
            id: "procedencia",
            title: "Procedência",
            icon: <Globe className="w-4 h-4" />,
            options: [
                { value: "nacional", label: "Nacional" },
                { value: "importado", label: "Importado" },
                { value: "propria", label: "Própria" },
                { value: "parceiros", label: "Parceiros" },
            ],
        },
        ...commonFilters,
    ];

    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
        procedencia: [],
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
            procedencia: [],
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
        // Filter only items that are moved from Touros (not Semen)
        let items = EMBRYOS.filter(item => item.category !== "Sêmen");

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

            // Check Procedência
            if (selectedFilters.procedencia.length > 0) {
                const procedencia = ((product.details as any)?.procedencia || "").toLowerCase();
                // If data is missing, we might assume check logic or skip. 
                // Assuming data will be populated later.
                if (!selectedFilters.procedencia.includes(procedencia)) {
                    return false;
                }
            }

            // Check Price
            if (selectedFilters.faixa_valor.length > 0) {
                if (product.price === "Consultar") return false;
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
                        Embriões de <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-200">Elite</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Genética de ponta para elevar o patamar do seu rebanho.
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar */}
                        <FilterSidebar
                            sections={embrioesFilters}
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
