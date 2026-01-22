import ProductCard from "./ProductCard";

import { PRODUCTS } from "@/data/products";

export default function ProductGrid() {
    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 uppercase tracking-tight">
                            Lotes em <span className="text-brand-gold">Destaque</span>
                        </h2>
                        <div className="h-1 w-20 bg-brand-gold mt-2 rounded-full"></div>
                        <p className="text-gray-500 mt-4 max-w-xl">
                            Confira a seleção especial de animais de alta genética disponíveis para arremate imediato ou leilão.
                        </p>
                    </div>

                    <button className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:border-brand-gold hover:text-brand-gold transition-colors">
                        Ver Todos os Lotes
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {PRODUCTS.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
}
