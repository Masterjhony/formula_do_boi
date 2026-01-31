import ProductCard from "./ProductCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EMBRYOS } from "@/data/embryos";
import ProductSection from "./ProductSection";

interface ProductGridProps {
    products: any[];
}

export default function ProductGrid({ products }: ProductGridProps) {
    // Combine products and embryos, deduplicating by ID
    const combinedItems = [...EMBRYOS, ...products];
    const uniqueItemsMap = new Map();
    combinedItems.forEach(item => {
        uniqueItemsMap.set(item.id, item);
    });
    const uniqueItems = Array.from(uniqueItemsMap.values());

    // Filter categories
    const touros = uniqueItems
        .filter(p => !p.category?.includes('Matriz') && p.category !== 'Sêmen' && p.category !== 'Embrião')
        .sort((a, b) => a.id - b.id)
        .slice(0, 4);

    const matrizes = uniqueItems
        .filter(p => p.category?.includes('Matriz'))
        .sort((a, b) => a.id - b.id)
        .slice(0, 4);

    const embrioes = uniqueItems
        .filter(p => p.category === 'Embrião')
        .sort((a, b) => a.id - b.id)
        .slice(0, 4);

    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 uppercase tracking-tight mb-4">
                        Catálogo <span className="text-brand-gold">Oficial</span>
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Explore nosso plantel completo. Animais inspecionados e garantidos pela Fórmula do Boi.
                    </p>
                </div>

                <ProductSection title="Touros" items={touros} link="/touros" linkText="Ver todos os Touros" />
                <ProductSection title="Matrizes" items={matrizes} link="/matrizes" linkText="Ver todas as Matrizes" />
                <ProductSection title="Embriões" items={embrioes} link="/embrioes" linkText="Ver todos os Embriões" />
            </div>
        </section>
    );
}
