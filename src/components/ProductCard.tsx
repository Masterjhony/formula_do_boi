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
    // Generate an animal code based on ID
    const animalCode = `FB-PO-${product.id.toString().padStart(3, '0')}`;

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
                {/* Animal Code Badge (Top Right - replacing former tag position) */}
                <div className={`absolute top-3 right-3 z-10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm shadow-md
                    ${featured
                        ? 'bg-brand-gold text-brand-black'
                        : 'bg-black/80 text-white backdrop-blur-sm border border-white/20'
                    }`}>
                    {animalCode}
                </div>

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
                            Condição Especial
                        </span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-sm text-gray-500 font-medium">30x</span>
                            <span className="text-xl font-bold text-gray-900">R$ {product.price}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1">
                            Total: R$ {product.installments}
                        </span>
                    </div>

                    <a
                        href={`https://wa.me/553175659900?text=${encodeURIComponent(`Olá, tenho interesse no animal ${product.name} (ID: ${product.id}).`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`block w-full mt-4 py-2.5 text-center text-sm font-bold uppercase tracking-wide rounded-lg transition-all shadow-sm hover:shadow-md
                        ${featured
                                ? 'bg-brand-gold text-brand-black hover:bg-brand-black hover:text-brand-gold'
                                : 'bg-brand-black text-white hover:bg-brand-gold hover:text-brand-black'
                            }`}>
                        Fazer uma proposta
                    </a>

                    <a
                        href={`https://wa.me/553175659900?text=${encodeURIComponent(`Olá, gostaria de saber o valor à vista do animal ${product.name} (ID: ${product.id}).`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full mt-2 block text-center text-xs font-medium text-gray-500 hover:text-brand-gold transition-colors underline decoration-dotted underline-offset-2"
                    >
                        Ver proposta à vista
                    </a>
                </div>
            </div>
        </div>
    );
}

