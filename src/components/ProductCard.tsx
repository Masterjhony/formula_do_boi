import Link from "next/link";
import { MapPin, Info } from "lucide-react";
import Image from "next/image";

interface ProductProps {
    id: number;
    image: string;
    name: string;
    category: string;
    location: string;
    installments: string;
    price: string;
    tag?: string;
}

interface ProductCardProps {
    product: ProductProps;
    featured?: boolean;
}

export default function ProductCard({ product, featured = false }: ProductCardProps) {
    return (
        <div
            className={`group bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full relative
            ${featured
                    ? 'border-2 border-brand-gold shadow-[0_0_15px_rgba(197,160,89,0.2)]'
                    : 'border border-gray-100 hover:border-brand-gold/30'
                }`}
        >
            {/* Image Container */}
            <Link href={`/lote/${product.id}`} className="block relative aspect-[4/3] overflow-hidden bg-gray-100">
                {product.tag && (
                    <div className={`absolute top-3 left-3 z-10 px-3 py-1 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider rounded-sm
                        ${featured
                            ? 'bg-brand-gold text-brand-black shadow-md'
                            : 'bg-brand-black/80 text-brand-gold'
                        }`}>
                        {product.tag}
                    </div>
                )}
                <div className="w-full h-full relative">
                    {/* Using standard img for prototype simplicity, but handling local paths correcty */}
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                </div>

                {/* Quick action overlay (desktop) */}
                <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent flex justify-end pointer-events-none">
                    <div className="bg-white text-brand-black p-2 rounded-full shadow-lg hover:bg-brand-gold transition-colors pointer-events-auto">
                        <Info className="w-5 h-5" />
                    </div>
                </div>
            </Link>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                <div className="mb-2 flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border border-gray-200 px-2 py-0.5 rounded-full">
                        {product.category}
                    </span>
                </div>

                <Link href={`/lote/${product.id}`}>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-gold transition-colors line-clamp-1 mb-1">
                        {product.name}
                    </h3>
                </Link>

                <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-4">
                    <MapPin className="w-3.5 h-3.5" />
                    {product.location}
                </div>

                <div className="mt-auto border-t border-gray-50 pt-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-brand-gold font-semibold uppercase tracking-wide">
                            Lance Atual / Valor
                        </span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-sm text-gray-500 font-medium">30x</span>
                            <span className="text-xl font-bold text-gray-900">R$ {product.price}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1">
                            Total: R$ {product.installments}
                        </span>
                    </div>

                    <Link href={`/lote/${product.id}`} className={`block w-full mt-4 py-2.5 text-center text-sm font-semibold rounded-lg transition-colors
                        ${featured
                            ? 'bg-brand-gold text-brand-black hover:bg-brand-black hover:text-brand-gold'
                            : 'bg-brand-black text-white group-hover:bg-brand-gold group-hover:text-brand-black'
                        }`}>
                        Dar Lance
                    </Link>
                </div>
            </div>
        </div>
    );
}

