"use client";

import { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, Activity, User } from "lucide-react";
import FilterSidebar, { commonFilters } from "@/components/FilterSidebar";
import CatalogGrid from "@/components/CatalogGrid";
import Pagination from "@/components/Pagination";
import { Product } from "@/services/products";

interface TourosClientProps {
    products: Product[];
}

export default function TourosClient({ products: allProducts }: TourosClientProps) {
    // Extract unique breeders for filter options
    const breederOptions = useMemo(() => {
        const breeders = new Set<string>();
        allProducts.forEach(p => {
            // Only consider Touros for this list to avoid clutter if mixed data passed
            if (p.category?.includes('Matriz') || p.category === 'Sêmen' || p.category === 'Embrião') return;

            const breeder = p.details?.breeder || p.details?.proprietario;
            if (breeder) breeders.add(breeder.trim());
        });
        return Array.from(breeders).sort().map(b => ({ value: b, label: b }));
    }, [allProducts]);

    const tourosFilters = [
        {
            id: "criador",
            title: "Criador / Proprietário",
            icon: <User className="w-4 h-4" />,
            options: breederOptions,
        },
        {
            id: "idade",
            title: "Idade",
            icon: <Calendar className="w-4 h-4" />,
            options: [
                { value: "12_24", label: "12 a 24 meses" },
                { value: "24_36", label: "24 a 36 meses" },
                { value: "36_48", label: "36 a 48 meses" },
                { value: "acima_48", label: "Acima de 48 meses" },
            ],
        },
        {
            id: "indice",
            title: "Índice (RGD Top %)",
            icon: <Activity className="w-4 h-4" />,
            options: [
                { value: "0.1", label: "Top 0.1%" },
                { value: "0.5", label: "Top 0.5%" },
                { value: "1.0", label: "Top 1%" },
                { value: "5.0", label: "Top 5%" },
                { value: "10.0", label: "Top 10%" },
            ],
        },
        ...commonFilters,
    ];

    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
        criador: [],
        idade: [],
        indice: [],
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
            criador: [],
            idade: [],
            indice: [],
            faixa_valor: [],
            forma_pagamento: [],
            logistica: [],
        });
    };

    const hasFilters = Object.values(selectedFilters).some((arr) => arr.length > 0);

    const parsePrice = (priceStr: string) => {
        if (!priceStr) return 0;
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
        // Filter for "Touros" page 
        let items = allProducts.filter(p =>
            !p.category?.includes('Matriz') &&
            p.category !== 'Sêmen' &&
            p.category !== 'Embrião' &&
            p.category !== 'DOADORA'
        );

        if (!hasFilters) return items;

        return items.filter((product) => {
            // Check Breeder/Owner
            if (selectedFilters.criador.length > 0) {
                const breeder = product.details?.breeder || product.details?.proprietario;
                if (!breeder || !selectedFilters.criador.includes(breeder.trim())) {
                    return false;
                }
            }

            // Check Payment
            if (selectedFilters.forma_pagamento.length > 0 &&
                !selectedFilters.forma_pagamento.includes(product.forma_pagamento || "")) {
                return false;
            }

            // Check Idade 
            if (selectedFilters.idade.length > 0) {
                const nascimento = (product.details as any)?.nascimento;
                if (!nascimento) return false;

                const [day, month, year] = nascimento.split('/');
                const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                const now = new Date();
                const ageMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());

                const matchesIdade = selectedFilters.idade.some(filter => {
                    if (filter === "12_24") return ageMonths >= 12 && ageMonths <= 24;
                    if (filter === "24_36") return ageMonths > 24 && ageMonths <= 36;
                    if (filter === "36_48") return ageMonths > 36 && ageMonths <= 48;
                    if (filter === "acima_48") return ageMonths > 48;
                    return false;
                });
                if (!matchesIdade) return false;
            }

            // Check Indice
            if (selectedFilters.indice.length > 0) {
                const topVal = (product.details as any)?.top;
                if (!topVal) return false;
                const productTop = parseFloat(topVal.replace('%', '').replace(',', '.'));

                const matchesIndice = selectedFilters.indice.some(filter => {
                    const filterTop = parseFloat(filter);
                    return productTop <= filterTop;
                });
                if (!matchesIndice) return false;
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
    }, [selectedFilters, hasFilters, allProducts]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 12;

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

    // Reset to page 1 when filters change
    useMemo(() => {
        setCurrentPage(1);
    }, [selectedFilters]);

    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

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
                            sections={tourosFilters}
                            selectedFilters={selectedFilters}
                            onFilterChange={handleFilterChange}
                            onClearFilters={handleClearFilters}
                        />

                        {/* Products Grid */}
                        <div className="flex-1">
                            <CatalogGrid
                                products={paginatedProducts}
                                totalCount={filteredProducts.length}
                                onClearFilters={handleClearFilters}
                                hasFilters={hasFilters}
                            />
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
