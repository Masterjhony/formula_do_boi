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
    neloreFilter?: string | null;
    onNeloreFilterChange?: (filter: string | null) => void;
    isAuthenticated?: boolean;
    theme?: 'default' | 'premium';
}

export default function CatalogGrid({
    products,
    totalCount,
    onClearFilters,
    hasFilters,
    neloreFilter,
    onNeloreFilterChange,
    isAuthenticated = true,
    theme = 'premium',
}: CatalogGridProps) {
    return (
        <div className="flex-1">
            {/* Special Type Filter */}
            {onNeloreFilterChange && (
                <div className={`mb-6 p-1.5 border rounded-2xl inline-flex shadow-sm gap-1 ${theme === 'premium' ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-200'}`}>
                    <button
                        onClick={() => onNeloreFilterChange(null)}
                        className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${!neloreFilter
                                ? (theme === 'premium' ? 'bg-[#2a2a2a] text-white shadow-sm' : 'bg-gray-100 text-gray-900 shadow-sm')
                                : (theme === 'premium' ? 'text-gray-500 hover:text-white hover:bg-[#222]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50')
                            }`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => onNeloreFilterChange('Nelore Padrão')}
                        className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${neloreFilter === 'Nelore Padrão'
                                ? "bg-brand-gold text-brand-black shadow-sm"
                                : (theme === 'premium' ? 'text-gray-500 hover:text-white hover:bg-[#222]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50')
                            }`}
                    >
                        Nelore Padrão
                    </button>
                    <button
                        onClick={() => onNeloreFilterChange('Nelore Pintado')}
                        className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${neloreFilter === 'Nelore Pintado'
                                ? "bg-brand-gold text-brand-black shadow-sm"
                                : (theme === 'premium' ? 'text-gray-500 hover:text-white hover:bg-[#222]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50')
                            }`}
                    >
                        Nelore Pintado
                    </button>
                </div>
            )}

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
                <p className={theme === 'premium' ? 'text-gray-400' : 'text-gray-600'}>
                    Encontramos <span className={`font-semibold ${theme === 'premium' ? 'text-brand-gold' : 'text-gray-900'}`}>{totalCount}</span> animais disponíveis
                </p>
                {hasFilters && (
                    <button
                        onClick={onClearFilters}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors border ${theme === 'premium' ? 'text-gray-400 hover:text-white bg-[#1a1a1a] border-gray-800 hover:bg-[#222]' : 'text-gray-600 hover:text-gray-900 bg-white border-gray-200 hover:bg-gray-50'}`}
                    >
                        Limpar filtros
                    </button>
                )}
            </div>

            {/* Products Grid */}
            {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} isAuthenticated={isAuthenticated} theme={theme} />
                    ))}
                </div>
            ) : (
                <div className={`text-center py-16 rounded-xl border ${theme === 'premium' ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-200'}`}>
                    <div className={`${theme === 'premium' ? 'text-gray-600' : 'text-gray-400'} mb-4`}>
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
                    <h3 className={`text-lg font-semibold mb-2 ${theme === 'premium' ? 'text-white' : 'text-gray-900'}`}>
                        Nenhum animal encontrado
                    </h3>
                    <p className={`mb-4 ${theme === 'premium' ? 'text-gray-400' : 'text-gray-500'}`}>
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
