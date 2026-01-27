"use client";

import { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tag } from "lucide-react";
import FilterSidebar, { commonFilters } from "@/components/FilterSidebar";
import CatalogGrid from "@/components/CatalogGrid";
import { PRODUCTS } from "@/data/products";

// Use only PRODUCTS (Nelore) and filter specifically for the requested logic
const allProducts = PRODUCTS;

export default function MatrizesPage() {
    const matrizesFilters = [
        {
            id: "tipo",
            title: "Tipo",
            icon: <Tag className="w-4 h-4" />,
            options: [
                { value: "parida", label: "Parida" },
                { value: "prenha", label: "Prenha" },
                { value: "parida_prenha", label: "Parida e Prenha" },
                { value: "doadora", label: "Doadora" },
            ],
        },
        ...commonFilters,
    ];

    // State for selected filters (even if limited, good to keep UI consistent)
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
        tipo: [],
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
            tipo: [],
            faixa_valor: [],
            forma_pagamento: [],
            logistica: [],
        });
    };

    const hasFilters = Object.values(selectedFilters).some((arr) => arr.length > 0);

    const filteredProducts = useMemo(() => {
        // Show all products with category 'Matriz PO'
        let items = allProducts.filter(p => p.category === 'Matriz PO');

        // Standard filter logic (in case user clears/changes logic in future or filters within the single item)
        if (!hasFilters) return items;

        return items.filter((product) => {
            // Check Tipo
            if (selectedFilters.tipo.length > 0) {
                const tipo = ((product.details as any)?.tipo || "").toLowerCase();
                const status = ((product.details as any)?.status || "").toLowerCase();
                const category = (product.category || "").toLowerCase();

                const matchesTipo = selectedFilters.tipo.some(filter => {
                    if (filter === "parida") return status.includes("parida");
                    if (filter === "prenha") return status.includes("prenhez") || status.includes("prenha");
                    if (filter === "parida_prenha") return status.includes("parida") && (status.includes("prenhez") || status.includes("prenha"));
                    if (filter === "doadora") return tipo.includes("doadora") || category.includes("doadora");
                    return false;
                });

                if (!matchesTipo) return false;
            }

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

            return true;
        });
    }, [selectedFilters, hasFilters]);

    return (
        <main className="min-h-screen bg-gray-50" >
            <Header />

            {/* Page Header */}
            <section className="bg-[#0a0a0a] py-12 border-b border-white/10 relative overflow-hidden" >
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-gold/10 to-transparent"></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        Matrizes de <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-200">Elite</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Seleção especial de doadoras e matrizes consagradas.
                    </p>
                </div>
            </section >

            {/* Main Content */}
            < section className="py-8" >
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar */}
                        <FilterSidebar
                            sections={matrizesFilters}
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
            </section >

            <Footer />
        </main >
    );
}
