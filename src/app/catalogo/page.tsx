"use client";

import { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FilterSidebar from "@/components/FilterSidebar";
import CatalogGrid from "@/components/CatalogGrid";
import { PRODUCTS } from "@/data/products";

// Extended products for the catalog
const catalogProducts = [
    ...PRODUCTS,
    {
        id: 7,
        name: "Novilha Nelore SGN - 2724",
        category: "Novilha PO",
        location: "Itapetininga - SP",
        image: "/cattle/boi_nelore_elite.jpg",
        price: "850,00",
        installments: "25.500,00",
        tag: "DECA 1",
    },
    {
        id: 8,
        name: "Touro Sindi MIGC - 56",
        category: "Touro Elite",
        location: "São Luiz do Norte - GO",
        image: "/cattle/boi_reprodutor.jpg",
        price: "450,00",
        installments: "13.500,00",
        tag: "IABCZ: 35.6",
    },
    {
        id: 9,
        name: "Matriz Nelore NBS - 746",
        category: "Matriz PO",
        location: "Fazenda Porangaba - GO",
        image: "/cattle/boi_nelore_detalhe.jpg",
        price: "1.000,00",
        installments: "30.000,00",
        tag: "PREMIUM",
    },
];

export default function CatalogoPage() {
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
        classificacao: [],
        categoria: [],
        racas: [],
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
            categoria: [],
            racas: [],
        });
    };

    const hasFilters = Object.values(selectedFilters).some((arr) => arr.length > 0);

    // Simple filtering simulation - in real app this would filter by actual product properties
    const filteredProducts = useMemo(() => {
        if (!hasFilters) return catalogProducts;

        // For demo purposes, just show a subset when filters are active
        return catalogProducts.filter((_, index) => {
            const activeFilterCount = Object.values(selectedFilters).flat().length;
            return index < catalogProducts.length - activeFilterCount;
        });
    }, [selectedFilters, hasFilters]);

    return (
        <main className="min-h-screen bg-gray-50">
            <Header />

            {/* Page Header */}
            {/* Page Header */}
            <section className="bg-[#0a0a0a] py-12 border-b border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-gold/10 to-transparent"></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        Catálogo de <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-200">Lotes</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Encontre o animal ideal para seu plantel. Filtre por categoria, raça e muito mais.
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
