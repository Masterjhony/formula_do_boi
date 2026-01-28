import ProductCard from "./ProductCard";

import { EMBRYOS } from "@/data/embryos";

interface ProductGridProps {
    products: any[];
}

export default function ProductGrid({ products }: ProductGridProps) {
    const allProducts = [...EMBRYOS, ...products].sort((a, b) => a.id - b.id);

    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 uppercase tracking-tight">
                            Catálogo <span className="text-brand-gold">Oficial</span>
                        </h2>
                        <div className="h-1 w-20 bg-brand-gold mt-2 rounded-full"></div>
                        <p className="text-gray-500 mt-4 max-w-xl">
                            Explore nosso plantel completo. Animais inspecionados e garantidos pela Fórmula do Boi.
                        </p>
                    </div>

                    <button className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:border-brand-gold hover:text-brand-gold transition-colors">
                        Ver Filtros
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {allProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
}
