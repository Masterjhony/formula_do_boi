import ProductCard from "./ProductCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EMBRYOS } from "@/data/embryos";

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
    const matrizes = uniqueItems
        .filter(p => p.category?.includes('Matriz'))
        .sort((a, b) => a.id - b.id)
        .slice(0, 4);

    const embrioes = uniqueItems
        .filter(p => p.category === 'Embrião')
        .sort((a, b) => a.id - b.id)
        .slice(0, 4);

    const semen = uniqueItems
        .filter(p => p.category === 'Sêmen')
        .sort((a, b) => a.id - b.id)
        .slice(0, 4);

    const renderSection = (title: string, items: any[], link: string, linkText: string) => {
        if (items.length === 0) return null;
        return (
            <div className="mb-16 last:mb-0">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b border-gray-200 pb-4">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">
                            {title}
                        </h3>
                        <div className="h-1 w-12 bg-brand-gold mt-2 rounded-full"></div>
                    </div>
                    <Link
                        href={link}
                        className="group flex items-center gap-2 text-brand-gold font-bold hover:text-yellow-600 transition-colors uppercase text-sm tracking-widest"
                    >
                        {linkText}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        );
    };

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

                {renderSection("Matrizes", matrizes, "/matrizes", "Ver todas as Matrizes")}
                {renderSection("Embriões", embrioes, "/embrioes", "Ver todos os Embriões")}
                {renderSection("Sêmen", semen, "/semen", "Ver todo Sêmen")}
            </div>
        </section>
    );
}
