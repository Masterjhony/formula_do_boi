import ProductCard from "./ProductCard";

interface Product {
    id: number;
    image: string;
    name: string;
    category: string;
    location: string;
    installments: string;
    price: string;
    tag?: string;
    details?: {
        registro?: string;
        raca?: string;
        nascimento?: string;
        pai?: string;
        mae?: string;
        peso?: string;
        comentario?: string;
        mgte?: string;
        status?: string;
        tipo?: string;
        pdf?: string;
    };
}

interface CatalogGridProps {
    products: Product[];
    totalCount: number;
    onClearFilters: () => void;
    hasFilters: boolean;
}

export default function CatalogGrid({
    products,
    totalCount,
    onClearFilters,
    hasFilters,
}: CatalogGridProps) {
    return (
        <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600">
                    Encontramos <span className="font-semibold text-gray-900">{totalCount}</span> animais disponíveis
                </p>
                {hasFilters && (
                    <button
                        onClick={onClearFilters}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Limpar filtros
                    </button>
                )}
            </div>

            {/* Products Grid */}
            {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <div className="text-gray-400 mb-4">
                        <svg
                            className="w-16 h-16 mx-auto"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Nenhum animal encontrado
                    </h3>
                    <p className="text-gray-500 mb-4">
                        Tente ajustar os filtros para encontrar mais resultados.
                    </p>
                    <button
                        onClick={onClearFilters}
                        className="px-6 py-2 bg-brand-gold text-brand-black font-medium rounded-lg hover:bg-yellow-400 transition-colors"
                    >
                        Limpar filtros
                    </button>
                </div>
            )}
        </div>
    );
}
