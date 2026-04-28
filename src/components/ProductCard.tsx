"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { MapPin, Info } from "lucide-react";

// Add forma_pagamento to interface
interface ProductProps {
    id: number;
    image: string;
    name: string;
    category: string;
    location: string;
    installments: string;
    price: string;
    tag?: string;
    forma_pagamento?: string; // Added field
    downPaymentValue?: string; // Added field for Entrada
    customLink?: string; // Custom route override
    video_object_position?: string;
    iabcz?: string;
    mgte?: string;
    iqg?: string;
    special_price?: boolean;
    details?: {
        registro?: string;
        raca?: string;
        nascimento?: string;
        pai?: string;
        mae?: string;
        peso?: string;
        comentario?: string;
        mgte?: string;
        iabcz?: string;
        iqg?: string;
        status?: string;
        reproductive_status?: string;
        tipo?: string;
        breeder?: string;
        proprietario?: string;
        pdf?: string;
        customLink?: string;
    };
}

interface ProductCardProps {
    product: ProductProps;
    featured?: boolean;
    isAuthenticated?: boolean;
    theme?: 'default' | 'premium';
}

export default function ProductCard({ product, featured = false, isAuthenticated = true, theme = 'premium' }: ProductCardProps) {
    // Generate an animal code based on ID
    const animalCode = `FB-PO-${product.id.toString().padStart(3, '0')}`;

    const isSemen = product.category === 'Sêmen';
    const isEmbryo = product.category?.includes('Embrião') || product.details?.tipo === 'embriao';
    const isSemenOrEmbryo = isSemen || isEmbryo;

    let displayTitle = product.name;
    if (isSemenOrEmbryo) {
        displayTitle = displayTitle
            .replace(/^S[êe]men(\s+de)?\s+/i, '')
            .replace(/^S[EÊ]MEN\s+-\s+/i, '')
            .replace(/^Embri[ãa]o(\s+de)?\s+/i, '')
            .replace(/^Dose(\s+de)?\s+/i, '')
            .replace(/^Lote(\s+de)?\s+/i, '')
            .trim();
    }

    // Video optimization refs and state
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handleMouseEnter = () => {
        if (videoRef.current) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch((error: any) => {
                    // Auto-play was prevented
                    console.log("Video preview play prevented:", error);
                });
            }
            setIsPlaying(true);
        }
    };

    const handleMouseLeave = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0; // Reset to start for next preview
            setIsPlaying(false);
        }
    };

    // Skip payment calculation when not authenticated — data is null and never rendered
    const paymentInfo = (() => {
        if (!isAuthenticated) {
            return { type: 'hidden' as const, label: '', value: '', multiplier: '' };
        }

        const isSemen = product.category === 'Sêmen';
        const isAvista =
            product.installments?.toLowerCase() === 'à vista' ||
            product.installments?.toLowerCase() === 'a vista' ||
            product.forma_pagamento === 'a_vista';

        const safePriceStr = String(product.price || '').trim();
        const displayPrice = (safePriceStr === 'null' || !safePriceStr || safePriceStr === 'Consultar' || safePriceStr === 'Sob Consulta') ? 'Consultar' : `R$ ${safePriceStr}`;

        if (isSemen && product.name.toUpperCase().includes('SERTANEJO')) {
            return { type: 'sertanejo_tiers', label: '', value: '', multiplier: '' };
        }

        if (isSemen || isAvista) {
            return {
                type: 'avista',
                label: (displayPrice === 'Consultar') ? '' : (isSemen ? '1 dose' : 'À Vista'),
                value: displayPrice
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
                value: `R$ ${installmentValueStr}`
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
            value: `R$ ${product.installments}`
        };
    })();

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`card-engraved group rounded-xl overflow-hidden transition-all duration-300 flex flex-col h-full relative
            ${theme === 'premium' ? 'bg-[#151515] hover:shadow-[0_0_20px_rgba(197,160,89,0.15)]' : 'bg-white hover:shadow-xl'}
            ${featured
                    ? 'border-2 border-brand-gold shadow-[0_0_15px_rgba(197,160,89,0.2)]'
                    : `border ${theme === 'premium' ? 'border-brand-gold/10 hover:border-brand-gold/30' : 'border-gray-100 hover:border-brand-gold/30'}`
                }`}
        >
            {/* Image Container */}
            <Link href={product.customLink || product.details?.customLink || `/lote/${product.id}`} className={`block relative aspect-[4/3] overflow-hidden ${theme === 'premium' ? 'bg-[#0a0a0a]' : 'bg-gray-100'}`}>
                {/* Animal Code Badge (Top Right - replacing former tag position) */}
                <div className={`absolute top-3 right-3 z-10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm shadow-md
                    ${featured
                        ? 'bg-brand-gold text-brand-black'
                        : 'bg-black/80 text-white backdrop-blur-sm border border-white/20'
                    }`}>
                    {product.details?.registro || animalCode}
                </div>

                {/* Sold Overlay Banner */}
                {(product.tag === 'Vendido' || product.details?.status === 'Vendido') && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                        <div className="w-full bg-brand-gold/90 backdrop-blur-sm py-3 text-center transform -rotate-12 shadow-lg border-y border-white/20">
                            <span className="text-2xl font-black text-brand-black tracking-[0.2em] uppercase drop-shadow-sm">
                                VENDIDO
                            </span>
                        </div>
                    </div>
                )}


                <div className="w-full h-full relative flex items-center justify-center bg-black">
                    {/* Check if image is a video */}
                    {product.image?.endsWith('.mp4') ? (
                        <>
                            <video
                                ref={videoRef}
                                src={product.image}
                                poster={product.image.replace('.mp4', '.jpg')}
                                muted
                                loop
                                playsInline
                                preload="none"
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                style={{ objectPosition: product.video_object_position || 'center center' }}
                            />
                            {/* Play Icon Overlay - Visible when paused/not hovered */}
                            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
                                <div className="bg-black/30 backdrop-blur-sm rounded-full p-3 border border-white/30">
                                    <svg className="w-8 h-8 text-white fill-white" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </div>
                        </>
                    ) : (product.image?.includes('youtube.com') || product.image?.includes('youtu.be')) ? (
                        <>
                            <img
                                src={`https://img.youtube.com/vi/${product.image.includes('v=') ? product.image.split('v=')[1].split('&')[0] : product.image.split('/').pop()}/hqdefault.jpg`}
                                alt={product.name}
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                                style={{ objectPosition: product.video_object_position || 'center center' }}
                            />
                            {/* YouTube Icon Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="bg-red-600/90 rounded-xl p-2 px-4 flex items-center gap-2 shadow-lg">
                                    <svg className="w-4 h-4 text-white fill-white" viewBox="0 0 24 24">
                                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                    </svg>
                                    <span className="text-white text-xs font-bold">Assistir</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                            style={{ objectPosition: product.video_object_position || 'center center' }}
                        />
                    )}
                </div>

                {/* Quick action overlay (desktop) */}
                <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent flex justify-end pointer-events-none">
                    <div className={`${theme === 'premium' ? 'bg-brand-gold text-brand-black' : 'bg-white text-brand-black'} p-2 rounded-full shadow-lg hover:bg-brand-gold transition-colors pointer-events-auto`}>
                        <Info className="w-5 h-5" />
                    </div>
                </div>
            </Link >

            {/* Content */}
            < div className="p-5 flex flex-col flex-1" >
                <div className="mb-2 flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded-full ${theme === 'premium' ? 'text-gray-400 border-gray-700' : 'text-gray-400 border-gray-200'}`}>
                        {product.category}
                    </span>
                    {isAuthenticated && (product.details?.breeder || product.details?.proprietario) && (
                        <span className="text-[10px] font-bold text-brand-gold uppercase tracking-wider border border-brand-gold/20 px-2 py-0.5 rounded-full bg-brand-gold/5 truncate max-w-[120px]">
                            {product.details?.breeder || product.details?.proprietario}
                        </span>
                    )}
                    {(product.tag === 'Vendido' || product.details?.status === 'Vendido') && (
                        null
                    )}
                </div>

                <Link href={product.customLink || product.details?.customLink || `/lote/${product.id}`}>
                    <h3 className={`text-lg font-bold group-hover:text-brand-gold transition-colors line-clamp-1 mb-1 ${theme === 'premium' ? 'text-white' : 'text-gray-900'}`} title={displayTitle}>
                        {displayTitle}
                    </h3>
                </Link>

                <div className={`flex items-center gap-1.5 text-xs mb-4 ${theme === 'premium' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <MapPin className="w-3.5 h-3.5" />
                    {product.location}
                </div>

                {/* Technical Details Mini-Sheet */}
                {
                    product.details && (product.details.pai || product.details.mae) && (
                        <div className={`mb-4 rounded-lg p-2 text-xs border ${theme === 'premium' ? 'bg-[#1c1c1c] border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                            <div className="grid grid-cols-2 gap-y-1 gap-x-2">
                                {product.details.registro && (
                                    <div className={`col-span-2 flex justify-between border-b pb-1 mb-1 ${theme === 'premium' ? 'border-gray-800' : 'border-gray-200'}`}>
                                        <span className={`${theme === 'premium' ? 'text-gray-500' : 'text-gray-400'}`}>RGD</span>
                                        <span className={`font-semibold ${theme === 'premium' ? 'text-gray-300' : 'text-gray-700'}`}>{product.details.registro}</span>
                                    </div>
                                )}
                                {product.details.pai && (
                                    <div className="flex flex-col">
                                        <span className={`text-[10px] uppercase ${theme === 'premium' ? 'text-gray-500' : 'text-gray-400'}`}>Pai</span>
                                        <span className={`font-semibold truncate ${theme === 'premium' ? 'text-gray-200' : 'text-gray-900'}`} title={product.details.pai}>{product.details.pai}</span>
                                    </div>
                                )}
                                {product.details.mae && (
                                    <div className="flex flex-col">
                                        <span className={`text-[10px] uppercase ${theme === 'premium' ? 'text-gray-500' : 'text-gray-400'}`}>Mãe</span>
                                        <span className={`font-semibold truncate ${theme === 'premium' ? 'text-gray-200' : 'text-gray-900'}`} title={product.details.mae}>{product.details.mae}</span>
                                    </div>
                                )}
                            </div>

                            {/* Extra Details for Matrizes */}
                            {(product.details.mgte || product.details.status || product.iabcz || product.mgte || product.iqg) && (
                                <div className={`mt-2 pt-2 border-t grid grid-cols-1 gap-1 ${theme === 'premium' ? 'border-gray-800' : 'border-gray-200'}`}>
                                    {isAuthenticated && (product.mgte || product.details.mgte) && (
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="font-bold text-gray-500 uppercase">MGTe</span>
                                            <span className="font-bold text-brand-black bg-brand-gold/20 px-1.5 py-0.5 rounded">{product.mgte || product.details.mgte}</span>
                                        </div>
                                    )}
                                    {isAuthenticated && product.iabcz && (
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="font-bold text-gray-500 uppercase">iABCZ</span>
                                            <span className="font-bold text-brand-black bg-brand-gold/20 px-1.5 py-0.5 rounded">{product.iabcz}</span>
                                        </div>
                                    )}
                                    {isAuthenticated && product.iqg && (
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="font-bold text-gray-500 uppercase">IQG</span>
                                            <span className="font-bold text-brand-black bg-brand-gold/20 px-1.5 py-0.5 rounded">{product.iqg}</span>
                                        </div>
                                    )}
                                    {product.details.status && (
                                        <div className="text-[10px] text-gray-600 italic">
                                            {product.details.status}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                }

                {!isAuthenticated ? (
                    <div className="mt-auto border-t border-gray-50 pt-4 text-center">
                        <p className="text-[11px] font-semibold text-gray-500 mb-3 leading-snug">
                            Veja preço e condições — cadastro grátis
                        </p>
                        <Link
                            href={`/auth/signup?redirect=/lote/${product.id}`}
                            className={`block w-full py-2.5 text-center text-sm font-bold uppercase tracking-wide rounded-lg transition-all shadow-sm hover:shadow-md active:scale-[0.98]
                            ${featured
                                    ? 'bg-brand-gold text-brand-black hover:bg-brand-black hover:text-brand-gold'
                                    : 'bg-brand-black text-white hover:bg-brand-gold hover:text-brand-black'
                                }`}
                        >
                            Criar Conta Grátis
                        </Link>
                        <Link
                            href={`/login?next=/lote/${product.id}`}
                            className="w-full mt-2 block text-center text-xs font-medium text-gray-500 hover:text-brand-gold transition-colors underline decoration-dotted underline-offset-2"
                        >
                            Já tenho conta
                        </Link>
                    </div>
                ) : (
                <div className={`mt-auto border-t pt-4 ${theme === 'premium' ? 'border-gray-800' : 'border-gray-50'}`}>
                    <div className="flex flex-col">
                        <span className="text-xs text-brand-gold font-semibold uppercase tracking-wide">
                            Condição Especial
                        </span>
                        <div className="flex flex-col gap-0.5">
                            {/* Casos onde há parcelamento e preço à vista definidos */}
                            {paymentInfo.type === 'sertanejo_tiers' ? (
                                <div className="flex flex-col gap-0 w-full mt-1">
                                    <div className={`flex justify-between border-b pb-1 ${theme === 'premium' ? 'border-gray-800' : 'border-gray-200'}`}>
                                        <span className={`text-[11px] ${theme === 'premium' ? 'text-gray-400' : 'text-gray-600'}`}>0-99 doses</span>
                                        <span className={`text-[13px] font-bold ${theme === 'premium' ? 'text-white' : 'text-gray-900'}`}>R$ 35,00<span className="text-[10px] font-normal ml-1 text-gray-500">/ dose</span></span>
                                    </div>
                                    <div className={`flex justify-between border-b py-1 ${theme === 'premium' ? 'border-gray-800' : 'border-gray-200'}`}>
                                        <span className={`text-[11px] ${theme === 'premium' ? 'text-gray-400' : 'text-gray-600'}`}>100-399 doses</span>
                                        <span className={`text-[13px] font-bold ${theme === 'premium' ? 'text-white' : 'text-gray-900'}`}>R$ 31,50<span className="text-[10px] font-normal ml-1 text-gray-500">/ dose</span></span>
                                    </div>
                                    <div className={`flex justify-between border-b py-1 ${theme === 'premium' ? 'border-gray-800' : 'border-gray-200'}`}>
                                        <span className={`text-[11px] ${theme === 'premium' ? 'text-gray-400' : 'text-gray-600'}`}>400-999 doses</span>
                                        <span className={`text-[13px] font-bold ${theme === 'premium' ? 'text-white' : 'text-gray-900'}`}>R$ 28,00<span className="text-[10px] font-normal ml-1 text-gray-500">/ dose</span></span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span className={`text-[11px] ${theme === 'premium' ? 'text-gray-400' : 'text-gray-600'}`}>+1000 doses</span>
                                        <span className={`text-[13px] font-bold ${theme === 'premium' ? 'text-brand-gold' : 'text-brand-gold'}`}>R$ 24,50<span className="text-[10px] font-normal ml-1 text-gray-500">/ dose</span></span>
                                    </div>
                                </div>
                            ) : product.category !== 'Sêmen' && product.special_price && product.installments?.toLowerCase() !== 'à vista' && product.forma_pagamento !== 'a_vista' && product.price && product.price !== 'Consultar' ? (
                                <div className="flex flex-col">
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-xl font-bold ${theme === 'premium' ? 'text-white' : 'text-gray-900'}`}>
                                            R$ {product.price}
                                        </span>
                                        <span className={`text-sm font-medium ${theme === 'premium' ? 'text-gray-400' : 'text-gray-500'}`}>À Vista</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 w-full my-0.5">
                                        <div className={`h-px flex-1 ${theme === 'premium' ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                                        <span className={`text-[10px] font-medium uppercase ${theme === 'premium' ? 'text-gray-600' : 'text-gray-400'}`}>OU</span>
                                        <div className={`h-px flex-1 ${theme === 'premium' ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                                    </div>
                                    <div className="flex items-center gap-1 text-base text-brand-gold">
                                        <span className="font-bold">
                                            {paymentInfo.type === 'parcelado_calculado' ? paymentInfo.multiplier : paymentInfo.type === 'parcelado_padrao' ? paymentInfo.multiplier : '30x'}
                                        </span>
                                        <span className={`text-xs font-medium ${theme === 'premium' ? 'text-gray-400' : 'text-gray-500'}`}>de</span>
                                        <span className="font-bold">{paymentInfo.type === 'parcelado_calculado' ? paymentInfo.value : `R$ ${product.installments}`}</span>
                                        <span className={`text-[10px] font-medium ml-1 ${theme === 'premium' ? 'text-gray-500' : 'text-gray-400'}`}>no boleto</span>
                                    </div>
                                </div>
                            ) : (
                                /* Fallback para visualização padrão (Sêmen ou Sem Parcelas) */
                                <div className="flex items-baseline gap-1">
                                    {paymentInfo.type !== 'avista' && (
                                        <span className={`text-sm font-medium ${theme === 'premium' ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {paymentInfo.multiplier}
                                        </span>
                                    )}
                                    <span className={`text-xl font-bold ${theme === 'premium' ? 'text-white' : 'text-gray-900'}`}>
                                        {paymentInfo.value}
                                    </span>
                                    {paymentInfo.type === 'avista' && (
                                        <span className={`text-sm font-medium ml-1 ${theme === 'premium' ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {paymentInfo.label}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {product.downPaymentValue && (
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-xs font-semibold text-brand-gold uppercase tracking-wide bg-brand-gold/10 px-2 py-0.5 rounded-full border border-brand-gold/20">
                                    Entrada: R$ {product.downPaymentValue}
                                </span>
                            </div>
                        )}
                    </div>

                    {isSemenOrEmbryo ? (
                        <Link
                            href={product.customLink || product.details?.customLink || `/lote/${product.id}`}
                            className={`block w-full mt-4 py-2.5 text-center text-sm font-bold uppercase tracking-wide rounded-lg transition-all shadow-sm hover:shadow-md
                            ${featured
                                    ? 'bg-brand-gold text-brand-black hover:bg-brand-black hover:text-brand-gold'
                                    : 'bg-brand-black text-white hover:bg-brand-gold hover:text-brand-black'
                                }`}
                        >
                            {isSemen ? 'Ver detalhes do touro' : 'Ver detalhes do lote'}
                        </Link>
                    ) : (
                        <>
                            <a
                                href={`https://wa.me/5531984143874?text=${encodeURIComponent(`Olá, tenho interesse no animal ${product.name} (ID: ${product.id}). Link: https://app.formuladoboi.com/lote/${product.id}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`block w-full mt-4 py-2.5 text-center text-sm font-bold uppercase tracking-wide rounded-lg transition-all shadow-sm hover:shadow-md
                                ${featured
                                        ? 'bg-brand-gold text-brand-black hover:bg-brand-black hover:text-brand-gold'
                                        : 'bg-brand-black text-white hover:bg-brand-gold hover:text-brand-black'
                                    }`}
                            >
                                Fazer uma proposta
                            </a>

                            <a
                                href={`https://wa.me/5531984143874?text=${encodeURIComponent(`Olá, gostaria de saber o valor à vista do animal ${product.name} (ID: ${product.id}). Link: https://app.formuladoboi.com/lote/${product.id}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full mt-2 block text-center text-xs font-medium text-gray-500 hover:text-brand-gold transition-colors underline decoration-dotted underline-offset-2"
                            >
                                Ver proposta à vista
                            </a>
                        </>
                    )}

                    {/* PDF Button if available */}
                    {product.details?.pdf && (
                        <a
                            href={product.details.pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full mt-3 py-2 flex items-center justify-center gap-2 border border-brand-gold/50 text-brand-gold text-xs font-bold uppercase tracking-wide rounded-lg hover:bg-brand-gold hover:text-brand-black transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 2H7a2 2 0 00-2 2v15a2 2 0 002 2z" />
                            </svg>
                            Baixar Ficha Técnica
                        </a>
                    )}
                </div>
                )}
            </div >
        </div >
    );
}
