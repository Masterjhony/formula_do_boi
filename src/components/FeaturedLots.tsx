import ProductCard from "./ProductCard";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { EMBRYOS } from "../data/embryos";

interface FeaturedLotsProps {
    products: any[];
}

export default function FeaturedLots({ products }: FeaturedLotsProps) {
    // Combine products and embryos for the home page display, deduplicating by ID
    const combinedItems = [...EMBRYOS, ...products];
    const uniqueItemsMap = new Map();
    combinedItems.forEach(item => {
        uniqueItemsMap.set(item.id, item);
    });
    const uniqueItems = Array.from(uniqueItemsMap.values());

    // Filter for Bulls (Touros)
    // Assuming 'Touro' or 'Bezerro' or 'Garrote' might be in category or name, or just exclude Matriz/Embriao/Seman
    // Based on TourosClient, it filters: !p.category?.includes('Matriz') && p.category !== 'Sêmen' && p.category !== 'Embrião'
    const featuredProducts = uniqueItems
        .filter(p => !p.category?.includes('Matriz') && p.category !== 'Sêmen' && p.category !== 'Embrião')
        .sort((a, b) => a.id - b.id)
        .slice(0, 4);

    return (
        <section className="py-16 bg-[#0a0a0a] relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-gold/5 not-via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl -ml-20 -mb-20"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Star className="w-5 h-5 text-brand-gold fill-brand-gold" />
                            <span className="text-brand-gold font-bold uppercase tracking-widest text-xs">Oportunidades Únicas</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                            Genética em <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-200">Destaque</span>
                        </h2>
                        <p className="text-gray-400 max-w-xl">
                            Seleção exclusiva dos melhores animais disponíveis para negociação direta.
                            Genética, raça e qualidade garantida.
                        </p>
                    </div>

                    <Link href="/touros" className="group flex items-center gap-2 text-white font-semibold hover:text-brand-gold transition-colors">
                        Ver todos os Touros
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} featured={true} />
                    ))}
                </div>
            </div>
        </section>
    );
}

