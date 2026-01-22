import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MapPin, Share2, Heart, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PRODUCTS } from "@/data/products";

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = PRODUCTS.find((p) => p.id === Number(id));

    if (!product) {
        return (
            <main className="min-h-screen bg-gray-50">
                <Header />
                <div className="container mx-auto px-4 py-20 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Lote não encontrado</h1>
                    <Link href="/" className="text-brand-gold hover:underline">Voltar para Home</Link>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <Header />

            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-3 text-xs text-gray-500">
                    <Link href="/" className="hover:text-brand-gold">Home</Link> /
                    <Link href="/" className="hover:text-brand-gold ml-1">Leilões</Link> /
                    <span className="text-gray-900 ml-1 font-medium">Lote {id}</span>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

                    {/* Left Column: Images */}
                    <div className="space-y-4">
                        <div className="aspect-[4/3] bg-gray-200 rounded-xl overflow-hidden relative group">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button className="p-2 bg-white/90 backdrop-blur rounded-full hover:bg-brand-gold hover:text-white transition-colors">
                                    <Share2 className="w-5 h-5" />
                                </button>
                                <button className="p-2 bg-white/90 backdrop-blur rounded-full hover:text-red-500 transition-colors">
                                    <Heart className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {product.gallery?.map((img, i) => (
                                <div key={i} className="aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-brand-gold transition-all">
                                    <img
                                        src={img}
                                        alt={`${product.name} thumb ${i + 1}`}
                                        className="w-full h-full object-cover hover:scale-110 transition-transform"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Info & Bidding */}
                    <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm h-fit sticky top-24">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-brand-gold/10 text-brand-gold text-xs font-bold uppercase tracking-wider rounded-full border border-brand-gold/20">
                                Lote em Leilão
                            </span>
                            <span className="flex items-center gap-1 text-xs text-red-600 font-semibold animate-pulse">
                                <Clock className="w-3 h-3" />
                                Encerra em 2h 15m
                            </span>
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 mb-2 uppercase">{product.name}</h1>
                        <p className="text-gray-500 text-sm mb-6 flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> {product.location}
                        </p>

                        <div className="border-t border-b border-gray-100 py-6 mb-6 space-y-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Lance Atual (30 parcelas)</p>
                                    <p className="text-4xl font-bold text-brand-black">R$ {product.price}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400">Valor Total</p>
                                    <p className="text-lg font-semibold text-gray-700">R$ {product.installments}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <button className="w-full py-4 bg-brand-gold hover:bg-yellow-600 text-brand-black font-bold text-lg rounded-lg uppercase tracking-wide transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                Dar Lance Agora
                            </button>
                            <button className="w-full py-3 bg-transparent border-2 border-brand-black text-brand-black font-bold rounded-lg hover:bg-gray-50 transition-colors uppercase tracking-wide">
                                Proposta à Vista
                            </button>
                        </div>

                        <div className="space-y-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-green-600" />
                                <span>Animal com registro genealógico definitivo (RGD)</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-green-600" />
                                <span>Exame andrológico/ginecológico positivo</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="mt-12 lg:mt-16 bg-white rounded-xl border border-gray-100 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">Detalhes do Animal</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-sm">
                        <div className="space-y-1">
                            <span className="text-gray-500 font-medium">Registro</span>
                            <p className="text-gray-900 font-semibold text-lg">{product.details.registro}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-gray-500 font-medium">Raça</span>
                            <p className="text-gray-900 font-semibold text-lg">{product.details.raca}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-gray-500 font-medium">Nascimento</span>
                            <p className="text-gray-900 font-semibold text-lg">{product.details.nascimento}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-gray-500 font-medium">Pai</span>
                            <p className="text-brand-gold font-bold text-lg">{product.details.pai}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-gray-500 font-medium">Mãe</span>
                            <p className="text-brand-gold font-bold text-lg">{product.details.mae}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-gray-500 font-medium">Peso</span>
                            <p className="text-gray-900 font-semibold text-lg">{product.details.peso}</p>
                        </div>
                    </div>

                    <div className="mt-10">
                        <h3 className="font-bold text-lg mb-4">Comentários do Técnico</h3>
                        <p className="text-gray-600 leading-relaxed">
                            {product.details.comentario}
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
