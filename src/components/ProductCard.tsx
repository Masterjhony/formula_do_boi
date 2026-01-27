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

interface ProductCardProps {
    product: ProductProps;
    featured?: boolean;
}

export default function ProductCard({ product, featured = false }: ProductCardProps) {
    // Generate an animal code based on ID
    const animalCode = `FB-PO-${product.id.toString().padStart(3, '0')}`;

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

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
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
                    {product.details?.registro || animalCode}
                </div>

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
                    ) : (
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                    )}
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

                {/* Technical Details Mini-Sheet */}
                {product.details && (product.details.pai || product.details.mae) && (
                    <div className="mb-4 bg-gray-50 rounded-lg p-2 text-xs border border-gray-100">
                        <div className="grid grid-cols-2 gap-y-1 gap-x-2">
                            {product.details.registro && (
                                <div className="col-span-2 flex justify-between border-b border-gray-200 pb-1 mb-1">
                                    <span className="text-gray-400">RGD</span>
                                    <span className="font-semibold text-gray-700">{product.details.registro}</span>
                                </div>
                            )}
                            {product.details.pai && (
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-400 uppercase">Pai</span>
                                    <span className="font-semibold text-gray-900 truncate" title={product.details.pai}>{product.details.pai}</span>
                                </div>
                            )}
                            {product.details.mae && (
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-400 uppercase">Mãe</span>
                                    <span className="font-semibold text-gray-900 truncate" title={product.details.mae}>{product.details.mae}</span>
                                </div>
                            )}
                        </div>

                        {/* Extra Details for Matrizes */}
                        {(product.details.mgte || product.details.status) && (
                            <div className="mt-2 pt-2 border-t border-gray-200 grid grid-cols-1 gap-1">
                                {product.details.mgte && (
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="font-bold text-gray-500 uppercase">MGTe</span>
                                        <span className="font-bold text-brand-black bg-brand-gold/20 px-1.5 py-0.5 rounded">{product.details.mgte}</span>
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
                )}

                <div className="mt-auto border-t border-gray-50 pt-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-brand-gold font-semibold uppercase tracking-wide">
                            Condição Especial
                        </span>
                        <div className="flex items-baseline gap-1">
                            {product.category !== 'Sêmen' && product.installments !== 'À Vista' && (
                                <span className="text-sm text-gray-500 font-medium">
                                    {product.forma_pagamento && product.forma_pagamento.includes('x')
                                        ? product.forma_pagamento.match(/(\d+)x/)?.[1] + 'x'
                                        : '30x'}
                                </span>
                            )}
                            <span className="text-xl font-bold text-gray-900">
                                {product.category === 'Sêmen' || product.installments === 'À Vista'
                                    ? `R$ ${product.price}`
                                    : `R$ ${product.installments}`}
                            </span>
                            {(product.category === 'Sêmen' || product.installments === 'À Vista') && (
                                <span className="text-sm text-gray-500 font-medium ml-1">
                                    {product.category === 'Sêmen' ? '1 dose' : 'À Vista'}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1">
                            {product.category === 'Sêmen' ? product.installments : `Total: R$ ${product.price}`}
                        </span>
                    </div>

                    <a
                        href={`https://wa.me/553175659900?text=${encodeURIComponent(`Olá, tenho interesse no animal ${product.name} (ID: ${product.id}). Link: https://app.formuladoboi.com/lote/${product.id}`)}`}
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
                        href={`https://wa.me/553175659900?text=${encodeURIComponent(`Olá, gostaria de saber o valor à vista do animal ${product.name} (ID: ${product.id}). Link: https://app.formuladoboi.com/lote/${product.id}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full mt-2 block text-center text-xs font-medium text-gray-500 hover:text-brand-gold transition-colors underline decoration-dotted underline-offset-2"
                    >
                        Ver proposta à vista
                    </a>

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
            </div>
        </div>
    );
}
