import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MapPin, Share2, Heart, Clock, ShieldCheck, ArrowRight, ChevronRight, LayoutGrid, Info, MessageCircle } from "lucide-react";
import Link from "next/link";
// import { PRODUCTS } from "@/data/products"; // Using DB now
import { EMBRYOS } from "@/data/embryos";
import { getProductById, getNavigationData } from "@/services/products.server";
import { Metadata, ResolvingMetadata } from "next";
import ProductCard from "@/components/ProductCard";
import PaywallOverlay from "@/components/PaywallOverlay";
import PaywallLink from "@/components/PaywallLink";
import { getIsAuthenticated } from "@/lib/auth-helpers";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = {
    params: Promise<{ id: string }>
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params;

    // fetch data
    const numericId = Number(id);

    // Check DB first (Source of Truth)
    let product: any = await getProductById(numericId);

    // If not found in DB, check static EMBRYOS
    if (!product) {
        product = EMBRYOS.find((p) => p.id === numericId);
    }

    if (!product) {
        return {
            title: 'Lote não encontrado | Fórmula do Boi',
            description: 'O lote que você procura não foi encontrado.'
        }
    }

    // Helper to get a valid image URL
    const getThumbnail = (url: string) => {
        if (!url) return null;
        if (url.includes('cloudinary.com') && url.endsWith('.mp4')) {
            return url.replace('.mp4', '.jpg');
        }
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop();
            return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }
        if (url.endsWith('.mp4')) return null; // Can't use other videos as images
        if (url.startsWith('/')) return `https://app.formuladoboi.com${url}`;
        return url;
    };

    // Determine the image to use for preview
    let previewImage = null;

    // 1. Try to find a static image in the gallery first
    if (product.gallery && product.gallery.length > 0) {
        const firstImage = product.gallery.find((img: string) => img && !img.endsWith('.mp4'));
        if (firstImage) {
            previewImage = getThumbnail(firstImage);
        }
    }

    // 2. If no gallery image, try the main product image (converting video to thumb if possible)
    if (!previewImage && product.image) {
        previewImage = getThumbnail(product.image);
    }

    // 3. Fallback if still no image
    if (!previewImage) {
        previewImage = 'https://app.formuladoboi.com/icon.png';
    }

    // fallback to a default image if still empty (optional)
    const images = previewImage ? [previewImage] : [];

    const title = `Lote ${product.id} | ${product.name} - Fórmula do Boi`;
    const description = `Confira ${product.name}, ${product.details?.raca || 'Nelore PO'} localizado em ${product.location}. ${product.details?.breeder ? `Criador: ${product.details.breeder}.` : ''} Aproveite essa oportunidade!`;

    return {
        title: title,
        description: description,
        openGraph: {
            title: `Lote ${product.id} | ${product.name} - Fórmula do Boi`,
            description: description,
            url: `https://app.formuladoboi.com/lote/${product.id}`,
            siteName: 'Fórmula do Boi',
            images: images,
            locale: 'pt_BR',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            images: images,
        }
    }
}

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const numericId = Number(id);
    const isAuthenticated = await getIsAuthenticated();
    const redirectPath = `/lote/${numericId}`;

    // Check DB first (Source of Truth)
    let product: any = await getProductById(numericId, isAuthenticated);

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

    // Get Navigation Data
    const { nextProduct, relatedProducts } = await getNavigationData(numericId);

    // Determine category label for "Next" button
    let categoryLabel = 'Lote';
    let nextLabel = 'Próximo Lote';
    let seeMoreLabel = 'Veja mais Lotes';

    if (product.classificacao === 'matriz' || (product.category?.includes('Matriz') && product.classificacao !== 'embriao')) {
        categoryLabel = 'Matriz';
        nextLabel = 'Próxima Matriz';
        seeMoreLabel = 'Veja mais Matrizes';
    } else if (product.category?.includes('Touro')) {
        categoryLabel = 'Touro';
        nextLabel = 'Próximo Touro';
        seeMoreLabel = 'Veja mais Touros';
    } else if (product.classificacao === 'embriao' || product.category?.includes('Embrião') || product.category === 'DOADORA') {
        categoryLabel = 'Embrião';
        nextLabel = 'Próximo Embrião';
        seeMoreLabel = 'Veja mais Embriões';
    } else if (product.category?.includes('Sêmen')) {
        categoryLabel = 'Sêmen';
        nextLabel = 'Próximo Sêmen';
        seeMoreLabel = 'Veja mais Sêmen';
    }

    const paymentInfo = (() => {
        // When not authenticated, price data is stripped — return placeholder
        if (!isAuthenticated) {
            return { type: 'hidden' as const, label: '', value: '', multiplier: '' };
        }

        const isSemen = product.category === 'Sêmen';
        const isAvista =
            product.installments?.toLowerCase() === 'à vista' ||
            product.installments?.toLowerCase() === 'a vista' ||
            product.forma_pagamento === 'a_vista';

        if (isSemen || isAvista) {
            return {
                type: 'avista',
                label: isSemen ? '1 dose' : 'À Vista',
                value: product.price === 'Consultar' ? 'Consultar' : `R$ ${product.price}`
            };
        }

        const matchX = product.installments?.match(/^(\d+)\s*[xX]$/);
        if (matchX) {
            const numInstallments = parseInt(matchX[1], 10);
            let installmentValueStr = "Consultar";

            if (product.price && product.price !== 'Consultar') {
                const priceStr = String(product.price);
                let numPrice = 0;
                if (priceStr.includes(',') && priceStr.includes('.')) {
                    numPrice = parseFloat(priceStr.replace(/\./g, '').replace(',', '.'));
                } else if (priceStr.includes(',')) {
                    numPrice = parseFloat(priceStr.replace(',', '.'));
                } else {
                    numPrice = parseFloat(priceStr);
                }

                if (!isNaN(numPrice) && numPrice > 0 && numInstallments > 0) {
                    const installmentValue = numPrice / numInstallments;
                    installmentValueStr = installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }
            }

            return {
                type: 'parcelado_calculado',
                multiplier: `${numInstallments}x`,
                value: installmentValueStr === 'Consultar' ? 'Consultar' : `R$ ${installmentValueStr}`
            };
        }

        let multiplier = '30x';
        if (product.forma_pagamento && product.forma_pagamento.toLowerCase().includes('x')) {
            const match = product.forma_pagamento.match(/(\d+)x/i);
            if (match) multiplier = match[1] + 'x';
        }

        return {
            type: 'parcelado_padrao',
            multiplier: multiplier,
            value: product.installments === 'Consultar' ? 'Consultar' : `R$ ${product.installments}`
        };
    })();

    return (
        <main className="min-h-screen bg-gray-50">
            <Header />

            {/* Breadcrumb & Navigation */}
            <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/" className="hover:text-brand-gold">Home</Link>
                    <ChevronRight className="w-4 h-4" />
                    <Link href={`/${categoryLabel === 'Matriz' ? 'matrizes' : categoryLabel === 'Touro' ? 'touros' : categoryLabel === 'Embrião' ? 'embrioes' : 'semen'}`} className="hover:text-brand-gold">
                        {categoryLabel === 'Matriz' ? 'Matrizes' : categoryLabel === 'Touro' ? 'Touros' : categoryLabel === 'Embrião' ? 'Embriões' : 'Sêmen'}
                    </Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-gray-900 font-semibold truncate max-w-[200px]">{product.name}</span>
                </div>

                {nextProduct && (
                    <Link
                        href={`/lote/${nextProduct.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-brand-gold border border-brand-gold/30 rounded-lg hover:bg-brand-gold hover:text-white transition-all shadow-sm font-semibold text-sm group"
                    >
                        <span>{nextLabel}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                )}
            </div>

            <div className="container mx-auto px-4 pb-8">
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
                                    style={{ objectPosition: product.video_object_position || 'center center' }}
                                />
                            ) : (product.image?.includes('youtube.com') || product.image?.includes('youtu.be')) ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${product.image.includes('v=') ? product.image.split('v=')[1].split('&')[0] : product.image.split('/').pop()}?autoplay=1&mute=1&loop=1&playlist=${product.image.includes('v=') ? product.image.split('v=')[1].split('&')[0] : product.image.split('/').pop()}`}
                                    className="w-full h-full object-cover"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    style={{ objectPosition: product.video_object_position || 'center center' }}
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
                        {product.gallery && product.gallery.length > 1 && (
                            <div className="grid grid-cols-4 gap-4">
                                {product.gallery.map((img: string, i: number) => {
                                    const isVideo = img.includes('cloudinary.com') && img.endsWith('.mp4');
                                    const thumb = isVideo ? img.replace('.mp4', '.jpg') : img;

                                    return (
                                        <div key={i} className="aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-brand-gold transition-all">
                                            <img
                                                src={thumb}
                                                alt={`${product.name} thumb ${i + 1}`}
                                                className="w-full h-full object-cover hover:scale-110 transition-transform"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Info & Negotiation */}
                    <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm h-fit sticky top-24">
                        {/* Check if sold */}
                        {(product.tag === 'Vendido' || product.details?.status === 'Vendido') ? (
                            <div className="w-full bg-gradient-to-r from-brand-gold via-yellow-400 to-brand-gold text-brand-black text-center py-3 font-bold uppercase tracking-widest shadow-lg rounded-lg mb-6 border border-white/20">
                                VENDIDO
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider rounded-full border border-green-200 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                    Disponível para Negociação
                                </span>
                            </div>
                        )}

                        <h1 className="text-3xl font-bold text-gray-900 mb-2 uppercase">{product.name}</h1>
                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
                            <span className="font-bold text-gray-900 px-2 py-0.5 bg-gray-100 rounded text-xs">
                                {product.details?.registro ?
                                    product.details.registro :
                                    `FB-PO-${product.id.toString().padStart(3, '0')}`}
                            </span>
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" /> {product.location}
                            </span>
                        </div>

                        <PaywallOverlay isAuthenticated={isAuthenticated} redirectPath={redirectPath} className="rounded-lg">
                        <div className="border-t border-b border-gray-100 py-6 mb-6 space-y-4">
                            {isAuthenticated && product.special_price && product.price && product.price !== 'Consultar' && product.installments && product.installments?.toLowerCase() !== 'à vista' && product.forma_pagamento !== 'a_vista' && product.category !== 'Sêmen' ? (
                                <div className="space-y-4">
                                    {/* Opção À Vista */}
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1 font-medium">Valor para pagamento À Vista</p>
                                            <div className="flex items-baseline gap-2">
                                                <p className="text-4xl font-extrabold text-brand-black tracking-tight">R$ {product.price}</p>
                                                <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                                    Melhor Preço
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="relative py-2">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-200"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase tracking-widest">
                                            <span className="bg-white px-3 text-gray-400 font-medium">OU PARCELADO</span>
                                        </div>
                                    </div>

                                    {/* Opção Parcelada */}
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-sm text-gray-500 font-medium">Boleto Bancário</p>
                                            {product.downPaymentValue && (
                                                <span className="text-xs font-semibold text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded border border-brand-gold/20">
                                                    Entrada de R$ {product.downPaymentValue}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-baseline gap-2 text-brand-gold">
                                            <span className="text-3xl font-bold">
                                                {paymentInfo.type === 'parcelado_calculado' ? paymentInfo.multiplier : paymentInfo.type === 'parcelado_padrao' ? paymentInfo.multiplier : '30x'}
                                            </span>
                                            <span className="text-xl font-medium text-gray-600">de</span>
                                            <span className="text-3xl font-bold">{paymentInfo.type === 'parcelado_calculado' ? paymentInfo.value : `R$ ${product.installments}`}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">* Sujeito a análise de cadastro</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">
                                            {!isAuthenticated ? 'Valor' : paymentInfo.type === 'avista' ? 'À Vista' : 'Valor'}
                                        </p>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-4xl font-bold text-brand-black">
                                                {!isAuthenticated ? 'R$ •••••' : paymentInfo.value}
                                            </p>
                                        </div>
                                    </div>
                                    {isAuthenticated && (
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400">
                                            {paymentInfo.type === 'avista' ? 'Condição' : 'Valor Total'}
                                        </p>
                                        <p className="text-lg font-semibold text-gray-700">
                                            {paymentInfo.type === 'avista' ? paymentInfo.label : `R$ ${product.price}`}
                                        </p>
                                    </div>
                                    )}
                                </div>
                            )}
                        </div>
                        </PaywallOverlay>

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
                                        {!isAuthenticated ? 'Cadastre-se para ver condições' :
                                        product.forma_pagamento ?
                                            (product.downPaymentValue ?
                                                `Entrada de R$ ${product.downPaymentValue} + ${product.forma_pagamento?.replace('Entrada + ', '')}` :
                                                product.forma_pagamento?.replace('_', ' ').replace('x', ' parcelas')) :
                                            'Consulte condições'}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1 italic">
                                        A Formula do Boi atua como intermediária e não se responsabiliza pela adimplência dos pagamentos entre as partes.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 p-1.5 bg-white rounded-md border border-gray-200 text-brand-gold shrink-0">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-900 uppercase">Frete & Comissão</p>
                                    <p className="text-sm text-gray-600">Frete por conta do Comprador. <span className="font-medium text-green-700">Comissão de 4%</span> para o comprador e para o vendedor.</p>
                                </div>
                            </div>
                        </div>

                        {!(product.tag === 'Vendido' || product.details?.status === 'Vendido') && (
                            <div className="space-y-3 mb-8">
                                <PaywallLink
                                    isAuthenticated={isAuthenticated}
                                    redirectPath={redirectPath}
                                    href={`https://wa.me/5531984143874?text=${encodeURIComponent(`Olá, tenho interesse no animal ${product.name} (ID: ${product.id}). Gostaria de mais informações. Link: https://app.formuladoboi.com/lote/${product.id}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-4 bg-brand-gold hover:bg-yellow-600 text-brand-black font-bold text-lg rounded-lg uppercase tracking-wide transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                >
                                    Fazer uma Proposta
                                    <ArrowRight className="w-5 h-5" />
                                </PaywallLink>
                                <PaywallLink
                                    isAuthenticated={isAuthenticated}
                                    redirectPath={redirectPath}
                                    href={`https://wa.me/5531984143874?text=${encodeURIComponent(`Olá, tenho interesse em fazer uma proposta à vista no animal ${product.name} (ID: ${product.id}). Link: https://app.formuladoboi.com/lote/${product.id}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-3 bg-white border-2 border-brand-black text-brand-black font-bold rounded-lg hover:bg-gray-50 transition-colors uppercase tracking-wide text-sm flex items-center justify-center"
                                >
                                    Proposta à Vista
                                </PaywallLink>
                            </div>
                        )}

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
                            {product.details?.pdf && (
                                <PaywallLink
                                    isAuthenticated={isAuthenticated}
                                    redirectPath={redirectPath}
                                    href={product.details.pdf}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full mt-4 py-3 flex items-center justify-center gap-2 border border-brand-gold/50 text-brand-gold font-bold uppercase tracking-wide rounded-lg hover:bg-brand-gold hover:text-brand-black transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 2H7a2 2 0 00-2 2v15a2 2 0 002 2z" />
                                    </svg>
                                    Baixar Ficha Técnica
                                </PaywallLink>
                            )}
                        </div>
                    </div>
                </div>

                {/* WhatsApp Group Banner — Touro */}
                {categoryLabel === 'Touro' && (
                    <a
                        href="https://chat.whatsapp.com/JYxJPWfkoHHLZfosHlywN9"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-black border border-[#b8953a]/40 rounded-xl px-6 py-5 hover:border-[#b8953a]/80 transition-colors group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-full bg-[#b8953a]/15 flex items-center justify-center shrink-0">
                                <MessageCircle className="w-6 h-6 text-[#b8953a]" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-base leading-tight">Shopping de Touros Nelore P.O</p>
                                <p className="text-gray-400 text-sm mt-0.5">Receba ofertas de touros selecionados diretamente no seu WhatsApp.</p>
                            </div>
                        </div>
                        <span className="shrink-0 flex items-center gap-2 bg-[#b8953a] hover:bg-[#a07e2e] text-black font-bold text-sm px-5 py-2.5 rounded-lg transition-colors group-hover:bg-[#a07e2e]">
                            Entrar no Grupo
                            <ArrowRight className="w-4 h-4" />
                        </span>
                    </a>
                )}

                {/* WhatsApp Group Banner — Matriz */}
                {categoryLabel === 'Matriz' && (
                    <a
                        href="https://chat.whatsapp.com/E0KH0Z5IL4x1fvEzLtaX03"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-black border border-[#b8953a]/40 rounded-xl px-6 py-5 hover:border-[#b8953a]/80 transition-colors group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-full bg-[#b8953a]/15 flex items-center justify-center shrink-0">
                                <MessageCircle className="w-6 h-6 text-[#b8953a]" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-base leading-tight">Shopping de Matrizes Nelore P.O</p>
                                <p className="text-gray-400 text-sm mt-0.5">Acompanhe as melhores matrizes disponíveis em primeira mão.</p>
                            </div>
                        </div>
                        <span className="shrink-0 flex items-center gap-2 bg-[#b8953a] hover:bg-[#a07e2e] text-black font-bold text-sm px-5 py-2.5 rounded-lg transition-colors group-hover:bg-[#a07e2e]">
                            Entrar no Grupo
                            <ArrowRight className="w-4 h-4" />
                        </span>
                    </a>
                )}

                {/* Details Section */}
                <div className="mt-12 lg:mt-16 bg-white rounded-xl border border-gray-100 p-8 shadow-sm">

                    <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Detalhes do Animal</h2>
                    </div>

                    {/* Description / Comment - Added based on user request */}
                    {product.details?.comentario && (
                        <div className="mb-10 bg-brand-gold/5 border border-brand-gold/20 p-6 rounded-lg">
                            <h3 className="text-sm font-bold text-brand-gold uppercase tracking-wide mb-3 flex items-center gap-2">
                                <Info className="w-4 h-4" />
                                Informações Adicionais
                            </h3>
                            <p className="text-gray-700 whitespace-pre-line leading-relaxed text-base">
                                {product.details.comentario}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-sm">
                        {product.details?.registro && (
                            <div className="space-y-1">
                                <span className="text-gray-500 font-medium">Registro</span>
                                <p className="text-gray-900 font-semibold text-lg">{product.details.registro}</p>
                            </div>
                        )}
                        <div className="space-y-1">
                            <span className="text-gray-500 font-medium">Raça</span>
                            <p className="text-gray-900 font-semibold text-lg">{product.details?.raca || 'Nelore'}</p>
                        </div>
                        {isAuthenticated && (product.details?.breeder || product.details?.proprietario) && (
                            <div className="space-y-1">
                                <span className="text-gray-500 font-medium">Criador / Proprietário</span>
                                <p className="text-gray-900 font-semibold text-lg">{product.details?.breeder || product.details?.proprietario}</p>
                            </div>
                        )}
                        {product.details?.nascimento && (
                            <div className="space-y-1">
                                <span className="text-gray-500 font-medium">Nascimento</span>
                                <p className="text-gray-900 font-semibold text-lg">{product.details.nascimento}</p>
                            </div>
                        )}
                        {product.details?.tipo && (
                            <div className="space-y-1">
                                <span className="text-gray-500 font-medium">Tipo</span>
                                <p className="text-gray-900 font-semibold text-lg">{product.details.tipo}</p>
                            </div>
                        )}
                        <div className="space-y-1">
                            <span className="text-gray-500 font-medium">Pai</span>
                            <p className="text-brand-gold font-bold text-lg">{product.details?.pai || '-'}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-gray-500 font-medium">Mãe</span>
                            <p className="text-brand-gold font-bold text-lg">{product.details?.mae || '-'}</p>
                        </div>
                        {product.details?.peso && (
                            <div className="space-y-1">
                                <span className="text-gray-500 font-medium">Peso</span>
                                <p className="text-gray-900 font-semibold text-lg">{product.details.peso}</p>
                            </div>
                        )}
                        {isAuthenticated && (product.mgte || product.details?.mgte) && (
                            <div className="space-y-1">
                                <span className="text-gray-500 font-medium">Index (MGTe)</span>
                                <p className="text-gray-900 font-semibold text-lg text-brand-black bg-brand-gold/10 px-2 py-0.5 rounded w-fit">{product.mgte || product.details.mgte}</p>
                            </div>
                        )}
                        {isAuthenticated && (product.iabcz || product.details?.iabcz) && (
                            <div className="space-y-1">
                                <span className="text-gray-500 font-medium">Index (iABCZ)</span>
                                <p className="text-gray-900 font-semibold text-lg text-brand-black bg-brand-gold/10 px-2 py-0.5 rounded w-fit">{product.iabcz || product.details.iabcz}</p>
                            </div>
                        )}
                        {isAuthenticated && (product.iqg || product.details?.iqg) && (
                            <div className="space-y-1">
                                <span className="text-gray-500 font-medium">Index (IQG)</span>
                                <p className="text-gray-900 font-semibold text-lg text-brand-black bg-brand-gold/10 px-2 py-0.5 rounded w-fit">{product.iqg || product.details.iqg}</p>
                            </div>
                        )}
                        {isAuthenticated && product.details?.top && (
                            <div className="space-y-1">
                                <span className="text-gray-500 font-medium">Top (MGTe)</span>
                                <p className="text-gray-900 font-semibold text-lg">{product.details.top}</p>
                            </div>
                        )}
                        {!isAuthenticated && (
                            <div className="col-span-full mt-2">
                                <PaywallOverlay isAuthenticated={false} redirectPath={redirectPath} className="rounded-xl">
                                    <div className="grid grid-cols-2 gap-4 p-4">
                                        {['MGTe', 'iABCZ', 'IQG', 'Top'].map(label => (
                                            <div key={label} className="space-y-1">
                                                <span className="text-gray-500 text-sm font-medium">{label}</span>
                                                <p className="text-gray-900 font-semibold text-lg bg-brand-gold/10 px-2 py-0.5 rounded w-fit">••••</p>
                                            </div>
                                        ))}
                                    </div>
                                </PaywallOverlay>
                            </div>
                        )}
                    </div>

                    {/* Genealogy Tree — Placeholder for unauthenticated */}
                    {!isAuthenticated && (
                        <div className="mt-10 pt-8 border-t border-gray-100">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-8 flex items-center gap-2">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="5" r="2" /><circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="2" />
                                    <path d="M12 7v4M8.5 17.5l3.5-6.5M15.5 17.5L12 11" />
                                </svg>
                                Árvore Genealógica
                            </h3>
                            <PaywallOverlay isAuthenticated={false} redirectPath={redirectPath} className="rounded-xl">
                                <div className="py-6 px-4 space-y-4">
                                    <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                                        <div className="border-2 rounded-xl p-3 text-center bg-sky-50 border-sky-200">
                                            <p className="text-[11px] font-bold text-sky-500 uppercase mb-1">♂ Avô Pat.</p>
                                            <p className="font-bold text-gray-400 text-xs">••••••••</p>
                                        </div>
                                        <div className="border-2 rounded-xl p-3 text-center bg-rose-50 border-rose-200">
                                            <p className="text-[11px] font-bold text-rose-500 uppercase mb-1">♀ Avó Pat.</p>
                                            <p className="font-bold text-gray-400 text-xs">••••••••</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                                        <div className="border-2 rounded-xl p-3 text-center bg-sky-50 border-sky-200">
                                            <p className="text-xs font-bold text-sky-500 uppercase mb-1">♂ Pai</p>
                                            <p className="font-bold text-gray-900 text-sm">••••••••</p>
                                        </div>
                                        <div className="border-2 rounded-xl p-3 text-center bg-rose-50 border-rose-200">
                                            <p className="text-xs font-bold text-rose-500 uppercase mb-1">♀ Mãe</p>
                                            <p className="font-bold text-gray-900 text-sm">••••••••</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-center">
                                        <div className="bg-amber-50 border-2 border-brand-gold rounded-xl px-6 py-3 text-center">
                                            <p className="text-xs font-bold text-brand-gold uppercase mb-1">Animal</p>
                                            <p className="font-bold text-gray-900 text-sm truncate max-w-[180px]">{product.name}</p>
                                        </div>
                                    </div>
                                </div>
                            </PaywallOverlay>
                        </div>
                    )}

                    {/* Genealogy Tree */}
                    {(() => {
                        // Prefer rich genealogia_json; fall back to details.pai / details.mae
                        const g: any = product.genealogia_json ?? null;
                        const tree = {
                            pai:          g?.pai          ?? (product.details?.pai  ? { nome: product.details.pai  } : null),
                            mae:          g?.mae          ?? (product.details?.mae  ? { nome: product.details.mae  } : null),
                            avo_paterno:  g?.avo_paterno  ?? null,
                            avo_paterna:  g?.avo_paterna  ?? null,
                            avo_materno:  g?.avo_materno  ?? null,
                            avo_materna:  g?.avo_materna  ?? null,
                            bisavo_ppp:   g?.bisavo_ppp   ?? null,
                            bisavo_mpp:   g?.bisavo_mpp   ?? null,
                            bisavo_pmp:   g?.bisavo_pmp   ?? null,
                            bisavo_mmp:   g?.bisavo_mmp   ?? null,
                            bisavo_ppm:   g?.bisavo_ppm   ?? null,
                            bisavo_mpm:   g?.bisavo_mpm   ?? null,
                            bisavo_pmm:   g?.bisavo_pmm   ?? null,
                            bisavo_mmm:   g?.bisavo_mmm   ?? null,
                        };

                        if (!tree.pai && !tree.mae) return null;

                        const hasAvos = tree.avo_paterno || tree.avo_paterna || tree.avo_materno || tree.avo_materna;

                        // Small card for a single ancestor node
                        const Node = ({ node, label, male, compact = false }: {
                            node: { nome: string; rg?: string } | null;
                            label: string;
                            male: boolean;
                            compact?: boolean;
                        }) => {
                            if (!node) return (
                                <div className={`border-2 border-dashed border-gray-200 rounded-xl text-center ${compact ? 'p-2' : 'p-3'}`}>
                                    <p className="text-xs text-gray-400 italic">não informado</p>
                                </div>
                            );
                            const color = male
                                ? 'bg-sky-50 border-sky-200'
                                : 'bg-rose-50 border-rose-200';
                            const labelColor = male ? 'text-sky-500' : 'text-rose-500';
                            return (
                                <div className={`border-2 rounded-xl text-center ${color} ${compact ? 'p-2' : 'p-3'}`}>
                                    <p className={`font-bold uppercase tracking-wider ${labelColor} ${compact ? 'text-[10px] mb-0.5' : 'text-xs mb-1'}`}>
                                        {male ? '♂' : '♀'} {label}
                                    </p>
                                    <p className={`font-bold text-gray-900 leading-tight ${compact ? 'text-xs' : 'text-sm'}`}>{node.nome}</p>
                                    {node.rg && (
                                        <p className={`text-gray-500 mt-0.5 font-medium ${compact ? 'text-[10px]' : 'text-xs'}`}>{node.rg}</p>
                                    )}
                                </div>
                            );
                        };

                        // Grandparent card — shows only label, nome and RG
                        const AvoCard = ({ node, label, male }: {
                            node: { nome: string; rg?: string } | null;
                            label: string;
                            male: boolean;
                        }) => {
                            const color = male ? 'bg-sky-50 border-sky-200' : 'bg-rose-50 border-rose-200';
                            const labelColor = male ? 'text-sky-500' : 'text-rose-500';
                            if (!node) return (
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-3 text-center">
                                    <p className="text-xs text-gray-400 italic">não inf.</p>
                                </div>
                            );
                            return (
                                <div className={`border-2 rounded-lg p-2 text-center ${color}`}>
                                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${labelColor}`}>
                                        {male ? '♂' : '♀'} {label}
                                    </p>
                                    <p className="font-bold text-gray-900 text-xs leading-tight">{node.nome}</p>
                                    {node.rg && <p className="text-[10px] text-gray-500 mt-0.5">{node.rg}</p>}
                                </div>
                            );
                        };

                        return (
                            <div className="mt-10 pt-8 border-t border-gray-100">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-8 flex items-center gap-2">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="5" r="2" /><circle cx="5" cy="19" r="2" /><circle cx="19" cy="19" r="2" />
                                        <path d="M12 7v4M8.5 17.5l3.5-6.5M15.5 17.5L12 11" />
                                    </svg>
                                    Árvore Genealógica
                                </h3>

                                {/* Scroll horizontal no mobile para preservar os conectores visuais */}
                                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                                <div className="max-w-3xl mx-auto min-w-[520px] sm:min-w-0">

                                    {/* ── Nível 3: Avós (se existirem) ── */}
                                    {hasAvos && (
                                        <>
                                            <div className="grid grid-cols-2 gap-0">
                                                {/* Lado paterno: avô + avó do pai */}
                                                <div className="grid grid-cols-2 gap-0 pr-2">
                                                    <div className="relative pb-6 pr-1">
                                                        <AvoCard
                                                            node={tree.avo_paterno}
                                                            label="Avô Pat."
                                                            male={true}
                                                        />
                                                        <div className="absolute bottom-0 left-1/2 right-0 h-6 border-l-2 border-b-2 border-gray-200 rounded-bl-md" />
                                                    </div>
                                                    <div className="relative pb-6 pl-1">
                                                        <AvoCard
                                                            node={tree.avo_paterna}
                                                            label="Avó Pat."
                                                            male={false}
                                                        />
                                                        <div className="absolute bottom-0 left-0 right-1/2 h-6 border-r-2 border-b-2 border-gray-200 rounded-br-md" />
                                                    </div>
                                                </div>

                                                {/* Lado materno: avô + avó da mãe */}
                                                <div className="grid grid-cols-2 gap-0 pl-2">
                                                    <div className="relative pb-6 pr-1">
                                                        <AvoCard
                                                            node={tree.avo_materno}
                                                            label="Avô Mat."
                                                            male={true}
                                                        />
                                                        <div className="absolute bottom-0 left-1/2 right-0 h-6 border-l-2 border-b-2 border-gray-200 rounded-bl-md" />
                                                    </div>
                                                    <div className="relative pb-6 pl-1">
                                                        <AvoCard
                                                            node={tree.avo_materna}
                                                            label="Avó Mat."
                                                            male={false}
                                                        />
                                                        <div className="absolute bottom-0 left-0 right-1/2 h-6 border-r-2 border-b-2 border-gray-200 rounded-br-md" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Hastes verticais avós → pais */}
                                            <div className="grid grid-cols-2 gap-0">
                                                <div className="flex justify-center">
                                                    <div className="w-px h-5 bg-gray-200" />
                                                </div>
                                                <div className="flex justify-center">
                                                    <div className="w-px h-5 bg-gray-200" />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* ── Nível 2: Pai + Mãe ── */}
                                    <div className="grid grid-cols-2 gap-0">
                                        <div className="relative pb-7 pr-2">
                                            <Node node={tree.pai} label="Pai" male={true} />
                                            <div className="absolute bottom-0 left-1/2 right-0 h-7 border-l-2 border-b-2 border-gray-200 rounded-bl-lg" />
                                        </div>
                                        <div className="relative pb-7 pl-2">
                                            <Node node={tree.mae} label="Mãe" male={false} />
                                            <div className="absolute bottom-0 left-0 right-1/2 h-7 border-r-2 border-b-2 border-gray-200 rounded-br-lg" />
                                        </div>
                                    </div>

                                    {/* Haste vertical pais → animal */}
                                    <div className="flex justify-center">
                                        <div className="w-px h-5 bg-gray-200" />
                                    </div>

                                    {/* ── Nível 1: Animal ── */}
                                    <div className="flex justify-center">
                                        <div className="bg-amber-50 border-2 border-brand-gold rounded-xl px-6 py-4 text-center shadow-sm min-w-[200px] max-w-xs">
                                            <p className="text-xs font-bold text-brand-gold uppercase tracking-wider mb-1">Animal</p>
                                            <p className="font-bold text-gray-900 text-base leading-tight">{product.name}</p>
                                            {product.details?.registro && (
                                                <p className="text-xs text-gray-500 mt-1.5 font-medium">{product.details.registro}</p>
                                            )}
                                        </div>
                                    </div>

                                </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* Avaliação Genética — Placeholder for unauthenticated */}
                {!isAuthenticated && (
                    <div className="mt-10 pt-8 border-t border-gray-100">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                            <svg className="w-4 h-4 text-brand-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 12h4M18 12h4M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                            </svg>
                            Avaliação Genética
                        </h3>
                        <PaywallOverlay isAuthenticated={false} redirectPath={redirectPath} className="rounded-xl">
                            <div className="space-y-3 p-1">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {['iABCZ', 'DECA', 'P%', 'F'].map(label => (
                                        <div key={label} className="rounded-xl px-3 py-3 text-center border bg-white border-brand-gold/30 shadow-sm">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                                            <p className="text-2xl font-black text-gray-300 leading-none">••</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="rounded-xl border border-brand-gold/20 overflow-hidden">
                                    <div className="px-3 py-2 bg-black">
                                        <p className="text-xs font-bold uppercase tracking-wider text-brand-gold">Crescimento</p>
                                    </div>
                                    <div className="overflow-x-auto">
                                    <table className="w-full text-sm min-w-[300px]">
                                        <thead><tr className="border-b border-gray-100 bg-gray-50/60">
                                            <th className="text-left px-3 py-2 text-xs font-semibold text-gray-400 uppercase">Característica</th>
                                            <th className="text-right px-2 py-2 text-xs font-semibold text-gray-400 uppercase w-16">DEP</th>
                                            <th className="text-right px-2 py-2 text-xs font-semibold text-gray-400 uppercase w-14">AC%</th>
                                            <th className="text-right px-3 py-2 text-xs font-semibold text-gray-400 uppercase w-16">DECA</th>
                                        </tr></thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {['DP120', 'DP210', 'DP365'].map(n => (
                                                <tr key={n}>
                                                    <td className="px-3 py-2 text-gray-300 text-xs">{n}</td>
                                                    <td className="px-2 py-2 text-right text-gray-300 text-xs">••</td>
                                                    <td className="px-2 py-2 text-right text-gray-300 text-xs">••%</td>
                                                    <td className="px-3 py-2 text-right text-gray-300 text-xs">••</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    </div>
                                </div>
                            </div>
                        </PaywallOverlay>
                    </div>
                )}

                {/* Avaliação Genética */}
                {(() => {
                    const av: any = product.avaliacao_genetica_json ?? null;
                    if (!av) return null;

                    // Suporte ao schema novo (composem_iabcz / nao_composem_iabcz)
                    // e fallback para schema antigo (caracteristicas flat)
                    const composemData: any = av.composem_iabcz ?? av.caracteristicas ?? {};
                    const naoComposemData: any = av.nao_composem_iabcz ?? {};

                    const catMeta: Record<string, { label: string; headerBg: string; headerText: string; border: string }> = {
                        crescimento:  { label: 'Crescimento',  headerBg: 'bg-black', headerText: 'text-brand-gold', border: 'border-brand-gold/20' },
                        maternas:     { label: 'Maternas',     headerBg: 'bg-black', headerText: 'text-brand-gold', border: 'border-brand-gold/20' },
                        reprodutivas: { label: 'Reprodutivas', headerBg: 'bg-black', headerText: 'text-brand-gold', border: 'border-brand-gold/20' },
                        acabamento:   { label: 'Acabamento',   headerBg: 'bg-black', headerText: 'text-brand-gold', border: 'border-brand-gold/20' },
                        carcaca:      { label: 'Carcaça',      headerBg: 'bg-black', headerText: 'text-brand-gold', border: 'border-brand-gold/20' },
                        morfologicas: { label: 'Morfológicas', headerBg: 'bg-black', headerText: 'text-brand-gold', border: 'border-brand-gold/20' },
                    };

                    // Ordem de exibição dentro de cada bloco
                    const catOrder = ['crescimento', 'maternas', 'reprodutivas', 'acabamento', 'carcaca', 'morfologicas'];

                    const catsCompoem  = catOrder.filter(k => (composemData[k]?.length ?? 0) > 0);
                    const catsNaoComp  = catOrder.filter(k => (naoComposemData[k]?.length ?? 0) > 0);
                    const hasTopMetrics = av.iabcz != null || av.deca || av.percentil != null || av.f != null;

                    if (!hasTopMetrics && catsCompoem.length === 0 && catsNaoComp.length === 0) return null;

                    // Formata valor DEP: +12,34 / -3,45 / 0 / —
                    const fmtDep = (dep: number | null) => {
                        if (dep === null) return '—';
                        const s = Math.abs(dep) % 1 === 0 ? dep.toString() : dep.toFixed(2).replace('.', ',');
                        return dep > 0 ? `+${s}` : dep < 0 ? `${dep < 0 ? '-' : ''}${s.replace('-', '')}` : `${s}`;
                    };

                    // Tabela de características de uma categoria
                    const CatTable = ({ traits, catKey }: { traits: any[]; catKey: string }) => {
                        const meta = catMeta[catKey];
                        return (
                            <div className={`rounded-xl border ${meta.border} overflow-hidden`}>
                                <div className={`px-4 py-2.5 ${meta.headerBg}`}>
                                    <p className={`text-xs font-bold uppercase tracking-wider ${meta.headerText}`}>{meta.label}</p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100 bg-gray-50/60">
                                                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Característica</th>
                                                <th className="text-right px-3 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider w-20">DEP</th>
                                                <th className="text-right px-3 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider w-16">AC%</th>
                                                <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider w-24">DECA</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {traits.map((t: any, i: number) => (
                                                <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                                                    <td className="px-4 py-2.5 font-medium text-gray-800 text-sm leading-snug">{t.nome}</td>
                                                    <td className={`px-3 py-2.5 text-right font-mono font-bold text-sm tabular-nums ${
                                                        t.dep > 0 ? 'text-emerald-600' : t.dep < 0 ? 'text-red-500' : 'text-gray-500'
                                                    }`}>
                                                        {fmtDep(t.dep ?? null)}
                                                    </td>
                                                    <td className="px-3 py-2.5 text-right text-gray-500 font-medium text-sm tabular-nums">
                                                        {t.ac != null ? `${t.ac}%` : '—'}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-right">
                                                        {t.deca ? (
                                                            <span className="inline-block text-[11px] font-semibold bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 whitespace-nowrap">{t.deca}</span>
                                                        ) : <span className="text-gray-300">—</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    };

                    return (
                        <div className="mt-10 pt-8 border-t border-gray-100">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                                <svg className="w-4 h-4 text-brand-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 12h4M18 12h4M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                </svg>
                                Avaliação Genética
                            </h3>

                            {/* ── 4 cards de índices ── */}
                            {hasTopMetrics && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                                    {/* iABCZ */}
                                    <div className="rounded-2xl px-4 py-4 text-center border bg-white border-brand-gold/30 shadow-sm">
                                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">iABCZ</p>
                                        <p className="text-3xl font-black text-brand-gold leading-none tabular-nums">
                                            {av.iabcz != null ? String(av.iabcz).replace('.', ',') : '—'}
                                        </p>
                                    </div>
                                    {/* DECA */}
                                    <div className="rounded-2xl px-4 py-4 text-center border bg-white border-brand-gold/30 shadow-sm">
                                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">DECA</p>
                                        <p className="text-3xl font-black text-brand-gold leading-none tabular-nums">
                                            {av.deca ?? '—'}
                                        </p>
                                    </div>
                                    {/* P% */}
                                    <div className="rounded-2xl px-4 py-4 text-center border bg-white border-brand-gold/30 shadow-sm">
                                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">P%</p>
                                        <p className="text-3xl font-black text-brand-gold leading-none tabular-nums">
                                            {av.percentil != null ? String(av.percentil) : '—'}
                                        </p>
                                    </div>
                                    {/* F */}
                                    <div className="rounded-2xl px-4 py-4 text-center border bg-white border-brand-gold/30 shadow-sm">
                                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">F</p>
                                        <p className="text-3xl font-black text-brand-gold leading-none tabular-nums">
                                            {av.f != null ? `${String(av.f).replace('.', ',')}%` : '—'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* ── Bloco 1: Características que compõem o iABCZ ── */}
                            {catsCompoem.length > 0 && (
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2.5 h-2.5 rounded-sm bg-brand-gold shrink-0" />
                                        <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                                            Características que compõem o iABCZ
                                        </p>
                                    </div>
                                    <div className="space-y-3">
                                        {catsCompoem.map(k => (
                                            <CatTable key={k} catKey={k} traits={composemData[k]} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Bloco 2: Características que não compõem o iABCZ ── */}
                            {catsNaoComp.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2.5 h-2.5 rounded-sm bg-gray-400 shrink-0" />
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Características que não compõem o iABCZ
                                        </p>
                                    </div>
                                    <div className="space-y-3">
                                        {catsNaoComp.map(k => (
                                            <CatTable key={k} catKey={k} traits={naoComposemData[k]} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })()}

                {/* Related Products / See More Section */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16 pt-8 border-t border-gray-200">
                        <div className="flex items-center gap-3 mb-8">
                            <img src="/icon.svg" alt="Logo" className="w-8 h-8 opacity-80" />
                            <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">{seeMoreLabel}</h2>
                        </div>

                        {/* Scrollable Horizontal List (Carousel) */}
                        <div className="relative group">
                            <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-brand-gold/20 scrollbar-track-gray-100 hover:scrollbar-thumb-brand-gold/50 transition-colors px-1">
                                {relatedProducts.map((p) => (
                                    <div key={p.id} className="w-[280px] sm:w-[320px] flex-none snap-center first:pl-0 last:pr-4">
                                        <div className="h-full transform transition-transform hover:-translate-y-1 duration-300">
                                            <ProductCard product={p} isAuthenticated={isAuthenticated} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Gradient Fade for Scroll Hint */}
                            <div className="absolute right-0 top-0 bottom-8 w-24 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none lg:hidden"></div>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}

