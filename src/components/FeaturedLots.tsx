import ProductCard from "./ProductCard";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

// Mock data for featured lots - in a real app this would come from props or an API
const featuredProducts = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?q=80&w=2500&auto=format&fit=crop",
        name: "Touro Nelore PO Elite - Lote 01",
        category: "Touros PO",
        location: "Goiânia, GO",
        installments: "30x R$ 1.200,00",
        price: "36.000,00",
        tag: "Grande Campeão"
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=2948&auto=format&fit=crop",
        name: "Matriz Nelore Pintado - Lote Especial",
        category: "Matrizes",
        location: "Uberaba, MG",
        installments: "30x R$ 2.500,00",
        price: "75.000,00",
        tag: "Destaque Genético"
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1595133642301-e29ad6687eb8?q=80&w=2608&auto=format&fit=crop",
        name: "Bezerros de Corte Premium - Lote 15",
        category: "Bezerros",
        location: "Campo Grande, MS",
        installments: "30x R$ 800,00",
        price: "24.000,00",
        tag: "Oportunidade"
    },
    {
        id: 5,
        image: "https://images.unsplash.com/photo-1551608688-693248881512?q=80&w=3387&auto=format&fit=crop",
        name: "Novilhas Reprodução - Lote 22",
        category: "Novilhas",
        location: "Sinop, MT",
        installments: "30x R$ 1.100,00",
        price: "33.000,00",
        tag: "Precoce"
    }
];

export default function FeaturedLots() {
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
                            Lotes em <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-200">Destaque</span>
                        </h2>
                        <p className="text-gray-400 max-w-xl">
                            Seleção exclusiva dos melhores animais disponíveis para lance imediato.
                            Genética, raça e qualidade garantida.
                        </p>
                    </div>

                    <Link href="/lotes" className="group flex items-center gap-2 text-white font-semibold hover:text-brand-gold transition-colors">
                        Ver todos os lotes
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
}
