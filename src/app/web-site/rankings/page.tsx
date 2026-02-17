"use client";

import { useEffect, useState, useMemo } from "react";
import { getProductsClient, Product } from "@/services/products";
import RankingHeader from "@/components/rankings/RankingHeader";
import RankingFilters from "@/components/rankings/RankingFilters";
import RankingCard from "@/components/rankings/RankingCard";
import ComparisonBar from "@/components/rankings/ComparisonBar";
import ComparisonModal from "@/components/rankings/ComparisonModal";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Pagination from "@/components/Pagination";
import { useRouter } from "next/navigation";
import { SettingsService } from "@/services/settingsService";

export default function RankingsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // Filters & Sorting
    const [activeFilter, setActiveFilter] = useState("mgte"); // mgte, iabcz, iqg, price
    const [activeCategory, setActiveCategory] = useState("all"); // all, bezerros, maternal, precocidade
    const [showSold, setShowSold] = useState(false);

    // Comparison
    const [comparisonList, setComparisonList] = useState<number[]>([]);
    const [isComparisonOpen, setIsComparisonOpen] = useState(false);

    const router = useRouter(); // Import useRouter

    useEffect(() => {
        async function loadData() {
            try {
                // Check Visibility
                const isEnabled = await SettingsService.getSetting('ranking_page_enabled');
                if (isEnabled === false) {
                    router.push('/'); // Redirect if disabled
                    return;
                }

                const data = await getProductsClient();
                // Filter only Animals (exclude Semen if needed, or keep all)
                // Assuming we want animals for ranking
                const animals = data.filter(p => p.category !== 'Sêmen');
                setProducts(animals);
            } catch (error) {
                console.error("Failed to load products", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    // Logic for Filtering and Sorting
    const sortedProducts = useMemo(() => {
        let items = [...products];

        // 1. Filter by Availability
        if (!showSold) {
            items = items.filter(p => p.tag !== 'Vendido' && p.details?.status !== 'Vendido');
        }

        // 2. Filter by Category
        if (activeCategory === 'bezerros') {
            // Filter for products that are likely "Bezerros" based on classification or details
            items = items.filter(p =>
                p.classificacao?.toLowerCase().includes('bezerro') ||
                p.category?.toLowerCase().includes('bezerro') ||
                p.details?.raca?.toLowerCase().includes('bezerro') // Check everywhere to be safe
            );
        }
        // 'maternal' and 'precocidade' are handled via sorting (activeFilter change), 
        // but we could also filter for specific indices threshold if required.
        // For now, we assume they are just sorting presets.

        // 3. Sorting
        items.sort((a, b) => {
            const getVal = (p: Product, key: string) => {
                // Handle specific keys
                if (key === 'price') {
                    // Clean price string "1.200,00" -> 1200.00
                    const priceStr = p.price === 'Sob Consulta' ? '0' : p.price;
                    return parseFloat(priceStr.replace(/\./g, '').replace(',', '.')) || 0;
                }
                // Handle indices
                const val = p[key as keyof Product] || p.details?.[key];
                return val ? parseFloat(val) : 0;
            };

            const valA = getVal(a, activeFilter);
            const valB = getVal(b, activeFilter);

            return valB - valA; // Descending
        });

        return items;
    }, [products, showSold, activeCategory, activeFilter]);

    // Pagination Logic
    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
    const paginatedProducts = sortedProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter, activeCategory, showSold]);

    // Comparison Handlers
    const toggleComparison = (id: number) => {
        setComparisonList(prev => {
            if (prev.includes(id)) return prev.filter(cur => cur !== id);
            if (prev.length >= 3) return prev; // Max 3
            return [...prev, id];
        });
    };

    const selectedProducts = products.filter(p => comparisonList.includes(p.id));

    // Handle Category Presets
    const handleCategoryChange = (cat: string) => {
        setActiveCategory(cat);
        if (cat === 'bezerros') setActiveFilter('mgte'); // Assuming correlation
        if (cat === 'maternal') setActiveFilter('iabcz');
        if (cat === 'precocidade') setActiveFilter('iqg');
        if (cat === 'all') setActiveFilter('mgte'); // Default
    };

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <RankingHeader />

            <RankingFilters
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryChange}
                showSold={showSold}
                onShowSoldChange={setShowSold}
            />

            <div className="container mx-auto px-4 max-w-6xl flex-grow pb-10">
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {paginatedProducts.map((product, index) => (
                            <RankingCard
                                key={product.id}
                                product={product}
                                rank={(currentPage - 1) * itemsPerPage + index + 1}
                                activeMetric={activeFilter}
                                isSelected={comparisonList.includes(product.id)}
                                onToggleSelect={() => toggleComparison(product.id)}
                            />
                        ))}

                        {sortedProducts.length === 0 && (
                            <div className="text-center py-20 text-gray-500">
                                Nenhum animal encontrado com os filtros selecionados.
                            </div>
                        )}

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>

            <ComparisonBar
                selectedProducts={selectedProducts}
                onClear={() => setComparisonList([])}
                onRemove={(id) => toggleComparison(id)}
                onCompare={() => setIsComparisonOpen(true)}
            />

            <ComparisonModal
                isOpen={isComparisonOpen}
                onClose={() => setIsComparisonOpen(false)}
                products={selectedProducts}
            />

            <Footer />
        </main>
    );
}
