import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MapPin, Share2, Heart, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
// import { PRODUCTS } from "@/data/products"; // Using DB now
import { EMBRYOS } from "@/data/embryos";
import { getProductById } from "@/services/products";

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const numericId = Number(id);

    // Try to find in DB first
    let product: any = await getProductById(numericId);

    // If not found in DB, check static EMBRYOS
    if (!product) {
        product = EMBRYOS.find((p) => p.id === numericId);
    }

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



            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

                    {/* Left Column: Images */}
                    <div className="space-y-4">
                        <div className="aspect-[4/3] bg-gray-200 rounded-xl overflow-hidden relative group">
                            {product.image?.endsWith('.mp4') ? (
                                <video
                                    src={product.image}
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    controls
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            )}
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
                            {product.gallery?.map((img: string, i: number) => (
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

                    {/* Right Column: Info & Negotiation */}
                    <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm h-fit sticky top-24">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider rounded-full border border-green-200 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                Disponível para Negociação
                            </span>
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 mb-2 uppercase">{product.name}</h1>
                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
                            <span className="font-bold text-gray-900 px-2 py-0.5 bg-gray-100 rounded text-xs">
                                {'registro' in product.details && product.details.registro ?
                                    product.details.registro :
                                    `FB-PO-${product.id.toString().padStart(3, '0')}`}
                            </span>
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" /> {product.location}
                            </span>
                        </div>

                        <div className="border-t border-b border-gray-100 py-6 mb-6 space-y-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">
                                        {'forma_pagamento' in product && product.forma_pagamento ?
                                            (product.forma_pagamento === 'a_vista' ? 'À Vista' : `Condição Especial (${product.forma_pagamento.replace('parcelado_', '').replace('x', '')} parcelas)`)
                                            : 'Valor'}
                                    </p>
                                    <p className="text-4xl font-bold text-brand-black">
                                        {(() => {
                                            if (product.price === 'Consultar') return 'Consultar';
                                            if (product.category === 'Sêmen') return `R$ ${product.price}`;

                                            // Extract count
                                            let count = 1;
                                            if ('forma_pagamento' in product && product.forma_pagamento) {
                                                const match = product.forma_pagamento.match(/(\d+)x/);
                                                if (match) count = parseInt(match[1]);
                                            }

                                            if (count > 1) return `${count}x R$ ${product.installments}`;
                                            return `R$ ${product.price}`;
                                        })()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400">
                                        {product.category === 'Sêmen' ? 'Condição' : 'Valor Total'}
                                    </p>
                                    <p className="text-lg font-semibold text-gray-700">
                                        {product.category === 'Sêmen' ? product.installments : `R$ ${product.price}`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Conditions Info Block */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6 space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 p-1.5 bg-white rounded-md border border-gray-200 text-brand-gold shrink-0">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-900 uppercase">Localização do Animal</p>
                                    <p className="text-sm text-gray-600">{product.location} - <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(product.location)}`} target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">Ver no mapa</a></p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 p-1.5 bg-white rounded-md border border-gray-200 text-brand-gold shrink-0">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-900 uppercase">Condições de Pagamento</p>
                                    <p className="text-sm text-gray-600">
                                        {'forma_pagamento' in product ?
                                            product.forma_pagamento?.replace('_', ' ').replace('x', ' parcelas') :
                                            'Consulte condições'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 p-1.5 bg-white rounded-md border border-gray-200 text-brand-gold shrink-0">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-900 uppercase">Frete & Comissão</p>
                                    <p className="text-sm text-gray-600">Frete facilitado para todo Brasil. <span className="font-medium text-green-700">Comissão de 4%</span> para o comprador e para o vendedor.</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 mb-8">
                            <a
                                href={`https://wa.me/553175659900?text=${encodeURIComponent(`Olá, tenho interesse no animal ${product.name} (ID: ${product.id}). Gostaria de mais informações. Link: https://app.formuladoboi.com/lote/${product.id}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-4 bg-brand-gold hover:bg-yellow-600 text-brand-black font-bold text-lg rounded-lg uppercase tracking-wide transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                                Fazer uma Proposta
                                <ArrowRight className="w-5 h-5" />
                            </a>
                            <a
                                href={`https://wa.me/553175659900?text=${encodeURIComponent(`Olá, tenho interesse em fazer uma proposta à vista no animal ${product.name} (ID: ${product.id}). Link: https://app.formuladoboi.com/lote/${product.id}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3 bg-white border-2 border-brand-black text-brand-black font-bold rounded-lg hover:bg-gray-50 transition-colors uppercase tracking-wide text-sm flex items-center justify-center"
                            >
                                Proposta à Vista
                            </a>
                        </div>

                        <div className="space-y-4 text-sm text-gray-600 border-t border-gray-100 pt-6">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-green-600" />
                                <span>Animal com registro genealógico definitivo (RGD)</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-green-600" />
                                <span>Exame andrológico/ginecológico positivo</span>
                            </div>

                            {/* PDF Button if available */}
                            {'pdf' in product.details && (
                                <a
                                    href={product.details.pdf}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full mt-4 py-3 flex items-center justify-center gap-2 border border-brand-gold/50 text-brand-gold font-bold uppercase tracking-wide rounded-lg hover:bg-brand-gold hover:text-brand-black transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 2H7a2 2 0 00-2 2v15a2 2 0 002 2z" />
                                    </svg>
                                    Baixar Ficha Técnica
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="mt-12 lg:mt-16 bg-white rounded-xl border border-gray-100 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">Detalhes do Animal</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-sm">
                        {'registro' in product.details && (
                            <div className="space-y-1">
                                <span className="text-gray-500 font-medium">Registro</span>
                                <p className="text-gray-900 font-semibold text-lg">{product.details.registro}</p>
                            </div>
                        )}
                        <div className="space-y-1">
                            <span className="text-gray-500 font-medium">Raça</span>
                            <p className="text-gray-900 font-semibold text-lg">{product.details.raca}</p>
                        </div>
                        {(('breeder' in product.details && product.details.breeder) || ('proprietario' in product.details && product.details.proprietario)) && (
                            <div className="space-y-1">
                                <span className="text-gray-500 font-medium">Criador / Proprietário</span>
                                <p className="text-gray-900 font-semibold text-lg">{product.details.breeder || product.details.proprietario}</p>
                            </div>
                        )}
                        {'nascimento' in product.details && (
                            <div className="space-y-1">
                                <span className="text-gray-500 font-medium">Nascimento</span>
                                <p className="text-gray-900 font-semibold text-lg">{product.details.nascimento}</p>
                            </div>
                        )}
                        {'tipo' in product.details && (
                            <div className="space-y-1">
                                <span className="text-gray-500 font-medium">Tipo</span>
                                <p className="text-gray-900 font-semibold text-lg">{product.details.tipo}</p>
                            </div>
                        )}
                        <div className="space-y-1">
                            <span className="text-gray-500 font-medium">Pai</span>
                            <p className="text-brand-gold font-bold text-lg">{product.details.pai}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-gray-500 font-medium">Mãe</span>
                            <p className="text-brand-gold font-bold text-lg">{product.details.mae}</p>
                        </div>
                        {'peso' in product.details && (
                            <div className="space-y-1">
                                <span className="text-gray-500 font-medium">Peso</span>
                                <p className="text-gray-900 font-semibold text-lg">{product.details.peso}</p>
                            </div>
                        )}
                        {'mgte' in product.details && (
                            <div className="space-y-1">
                                <span className="text-gray-500 font-medium">Index (MGTe)</span>
                                <p className="text-gray-900 font-semibold text-lg">{product.details.mgte}</p>
                            </div>
                        )}
                        {'top' in product.details && (
                            <div className="space-y-1">
                                <span className="text-gray-500 font-medium">Top (MGTe)</span>
                                <p className="text-gray-900 font-semibold text-lg">{product.details.top}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
