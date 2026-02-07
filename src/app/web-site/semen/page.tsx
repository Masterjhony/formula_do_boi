"use client";

import { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Globe, User } from "lucide-react";
import FilterSidebar, { commonFilters } from "@/components/FilterSidebar";
import CatalogGrid from "@/components/CatalogGrid";
import { EMBRYOS } from "@/data/embryos";

export default function SemenPage() {
    // Extract unique breeders for filter options
    const breederOptions = useMemo(() => {
        const breeders = new Set<string>();
        EMBRYOS.forEach(p => {
            if (p.category !== "Sêmen") return;
            // Check details.proprietario or details.breeder
            const breeder = (p.details as any)?.proprietario || (p.details as any)?.breeder;
            if (breeder) breeders.add(breeder.trim());
        });
        return Array.from(breeders).sort().map(b => ({ value: b, label: b }));
    }, []);

    const semenFilters = [
        {
            id: "criador",
            title: "Criador / Proprietário",
            icon: <User className="w-4 h-4" />,
            options: breederOptions,
        },
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
        criador: [],
        procedencia: [],
        faixa_valor: [],
        iabcz: [],
        mgte: [],
        iqg: [],
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
            criador: [],
            procedencia: [],
            faixa_valor: [],
            iabcz: [],
            mgte: [],
            iqg: [],
            forma_pagamento: [],
            logistica: [],
        });
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
        // Filter only Sêmen
        let items = EMBRYOS.filter(item => item.category === "Sêmen");

        if (!hasFilters) return items;

        return items.filter((product) => {
            // Check Breeder
            if (selectedFilters.criador.length > 0) {
                const breeder = (product.details as any)?.proprietario || (product.details as any)?.breeder;
                if (!breeder || !selectedFilters.criador.includes(breeder.trim())) {
                    return false;
                }
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

            // Check Procedência
            if (selectedFilters.procedencia.length > 0) {
                const procedencia = ((product.details as any)?.procedencia || "").toLowerCase();
                if (!selectedFilters.procedencia.includes(procedencia)) {
                    return false;
                }
            }

            // Check Price
            if (selectedFilters.faixa_valor.length > 0) {
                const productPriceStr = product.price || "0";
                if (productPriceStr === "Consultar" || productPriceStr === "Sob Consulta") return false;

                const price = parsePrice(productPriceStr);
                if (!checkPriceRange(price, selectedFilters.faixa_valor)) {
                    return false;
                }
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
    }, [selectedFilters, hasFilters]);

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
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar */}
                        <FilterSidebar
                            sections={semenFilters}
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
