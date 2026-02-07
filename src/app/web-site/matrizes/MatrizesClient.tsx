"use client";

import { useState, useMemo, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tag, User } from "lucide-react";
import FilterSidebar, { commonFilters } from "@/components/FilterSidebar";
import CatalogGrid from "@/components/CatalogGrid";
import { Product } from "@/services/products";
import Pagination from "@/components/Pagination";

interface MatrizesClientProps {
    products: Product[];
}

const ITEMS_PER_PAGE = 12;

export default function MatrizesClient({ products: allProducts }: MatrizesClientProps) {
    // Extract unique breeders for filter options
    const breederOptions = useMemo(() => {
        const breeders = new Set<string>();
        allProducts.forEach(p => {
            if (!p.category?.includes('Matriz')) return;
            const breeder = (p.details as any)?.proprietario || (p.details as any)?.breeder;
            if (breeder) breeders.add(breeder.trim());
        });
        return Array.from(breeders).sort().map(b => ({ value: b, label: b }));
    }, [allProducts]);

    const matrizesFilters = [
        {
            id: "criador",
            title: "Criador / Proprietário",
            icon: <User className="w-4 h-4" />,
            options: breederOptions,
        },
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

    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
        criador: [],
        tipo: [],
        faixa_valor: [],
        iabcz: [],
        mgte: [],
        iqg: [],
        forma_pagamento: [],
        logistica: [],
    });

    const [currentPage, setCurrentPage] = useState(1);

    const handleFilterChange = (sectionId: string, value: string, checked: boolean) => {
        setSelectedFilters((prev) => {
            const current = prev[sectionId] || [];
            if (checked) {
                return { ...prev, [sectionId]: [...current, value] };
            } else {
                return { ...prev, [sectionId]: current.filter((v) => v !== value) };
            }
        });
        setCurrentPage(1); // Reset to first page on filter change
    };

    const handleClearFilters = () => {
        setSelectedFilters({
            criador: [],
            tipo: [],
            faixa_valor: [],
            iabcz: [],
            mgte: [],
            iqg: [],
            forma_pagamento: [],
            logistica: [],
        });
        setCurrentPage(1); // Reset to first page on clear
    };

    const hasFilters = Object.values(selectedFilters).some((arr) => arr.length > 0);

    const parsePrice = (priceStr: string) => {
        return parseFloat(priceStr.replace(/\./g, "").replace(",", "."));
    };

    const cleanNumberString = (str: string) => {
        // Extract the first number found in the string (e.g. "iABCZ 13.60" -> "13.60")
        const match = str.match(/[\d\.]+/);
        return match ? parseFloat(match[0]) : null;
    };

    const checkRange = (value: number, ranges: string[]) => {
        if (ranges.length === 0) return true;
        return ranges.some(range => {
            if (range === "acima_30") return value > 30;
            if (range === "25_30") return value >= 25 && value <= 30; // Specific for MGTe
            if (range === "20_30") return value >= 20 && value <= 30; // For iABCZ / IQG
            if (range === "20_25") return value >= 20 && value <= 25; // Specific for MGTe
            if (range === "10_20") return value >= 10 && value <= 20;
            if (range === "abaixo_20") return value < 20; // Specific for MGTe
            if (range === "abaixo_10") return value < 10;
            return false;
        });
    };

    const filteredProducts = useMemo(() => {
        // Show all products with category containing 'Matriz'
        let items = allProducts.filter(p => p.category?.includes('Matriz'));

        if (!hasFilters) return items;

        return items.filter((product) => {
            // Check Breeder
            if (selectedFilters.criador.length > 0) {
                const breeder = (product.details as any)?.proprietario || (product.details as any)?.breeder;
                if (!breeder || !selectedFilters.criador.includes(breeder.trim())) {
                    return false;
                }
            }

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

            // Check Price
            if (selectedFilters.faixa_valor.length > 0) {
                if (product.price === "Sob Consulta" || product.price === "Consultar") return false;
                const price = parsePrice(product.price);

                const matchesPrice = selectedFilters.faixa_valor.some(range => {
                    if (range === "ate_5k") return price <= 5000;
                    if (range === "5k_10k") return price > 5000 && price <= 10000;
                    if (range === "10k_20k") return price > 10000 && price <= 20000;
                    if (range === "acima_20k") return price > 20000;
                    return false;
                });

                if (!matchesPrice) return false;
            }

            // Check iABCZ
            if (selectedFilters.iabcz.length > 0) {
                const valStr = (product as any).iabcz || (product.details as any)?.iabcz || "";
                const val = cleanNumberString(valStr);
                if (val === null || !checkRange(val, selectedFilters.iabcz)) return false;
            }

            // Check MGTe
            if (selectedFilters.mgte.length > 0) {
                const valStr = (product as any).mgte || (product.details as any)?.mgte || "";
                const val = cleanNumberString(valStr);
                if (val === null || !checkRange(val, selectedFilters.mgte)) return false;
            }

            // Check IQG
            if (selectedFilters.iqg.length > 0) {
                const valStr = (product as any).iqg || (product.details as any)?.iqg || "";
                const val = cleanNumberString(valStr);
                if (val === null || !checkRange(val, selectedFilters.iqg)) return false;
            }

            return true;
        });
    }, [selectedFilters, hasFilters, allProducts]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const displayedProducts = filteredProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

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
                        <div className="flex-1">
                            <CatalogGrid
                                products={displayedProducts}
                                totalCount={filteredProducts.length}
                                onClearFilters={handleClearFilters}
                                hasFilters={hasFilters}
                            />

                            {/* Pagination */}
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </div>
                </div>
            </section >

            <Footer />
        </main >
    );
}
