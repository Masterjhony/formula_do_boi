"use client";

import { Product } from "@/services/products";
import { Trophy, ArrowUpRight, BarChart2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useRef } from "react";

interface RankingCardProps {
    product: Product;
    rank: number;
    activeMetric: string;
    isSelected: boolean;
    onToggleSelect: () => void;
}

export default function RankingCard({ product, rank, activeMetric, isSelected, onToggleSelect }: RankingCardProps) {
    const isTop3 = rank <= 3;
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handleMouseEnter = () => {
        if (videoRef.current) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch((error: any) => console.log("Play prevented", error));
            }
            setIsPlaying(true);
        }
    };

    const handleMouseLeave = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            setIsPlaying(false);
        }
    };

    // Helper to get metric value safely
    const getMetricValue = (key: string) => {
        const val = product[key as keyof Product] || product.details?.[key];
        return val ? parseFloat(val) : 0;
    };

    // Determine badge color based on rank
    const rankBadgeColor =
        rank === 1 ? "bg-[#E8CB85] text-black border-[#A0792E]" : // Gold
            rank === 2 ? "bg-[#C0C0C0] text-black border-[#A9A9A9]" : // Silver
                rank === 3 ? "bg-[#CD7F32] text-white border-[#8B4513]" : // Bronze
                    "bg-gray-100 text-gray-500 border-gray-200"; // Others

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3, delay: rank * 0.05 }}
            className={`group relative bg-white rounded-lg overflow-hidden border transition-all duration-300 h-full flex flex-col md:flex-row
                ${isSelected
                    ? "border-brand-gold shadow-[0_0_0_2px_rgba(197,160,89,1)]"
                    : "border-gray-100 hover:border-brand-gold/30 hover:shadow-lg"
                }`}
        >
            {/* Rank Badge - Smaller */}
            <div className={`absolute top-0 left-0 z-20 px-2 py-0.5 rounded-br-lg font-black text-sm italic border-b border-r shadow-sm ${rankBadgeColor}`}>
                #{rank}
            </div>

            {/* Image Section - More Compact Width (w-48 instead of w-72) */}
            <div
                className="w-full md:w-48 relative aspect-[4/3] md:aspect-auto overflow-hidden bg-gray-100 shrink-0"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {product.image?.endsWith('.mp4') ? (
                    <>
                        <video
                            ref={videoRef}
                            src={product.image}
                            poster={product.image.replace('.mp4', '.jpg')}
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                            style={{ objectPosition: product.video_object_position || 'center center' }}
                        />
                        {/* Play Icon Overlay - Smaller */}
                        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
                            <div className="bg-black/30 backdrop-blur-sm rounded-full p-1.5 border border-white/30">
                                <svg className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24">
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
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-red-600/90 rounded-lg p-1 px-2 flex items-center gap-1.5 shadow-md scale-75">
                                <svg className="w-3 h-3 text-white fill-white" viewBox="0 0 24 24">
                                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                </svg>
                            </div>
                        </div>
                    </>
                ) : (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r pointer-events-none" />

                {/* Animal Name on Image (Mobile) */}
                <div className="absolute bottom-0 left-0 p-2 w-full md:hidden pointer-events-none">
                    <h3 className="text-white font-bold text-sm truncate">{product.name}</h3>
                    <p className="text-gray-200 text-[9px]">{product.registro}</p>
                </div>
            </div>

            {/* Content Section - Very Compact Padding */}
            <div className="flex-1 p-3 flex flex-col justify-between min-h-[140px]">
                <div>
                    <div className="flex justify-between items-start mb-1">
                        <div className="hidden md:block">
                            <h3 className="text-base font-bold text-gray-900 group-hover:text-brand-gold transition-colors line-clamp-1 leading-tight">{product.name}</h3>
                            <p className="text-gray-400 text-[9px] font-mono">{product.registro}</p>
                        </div>

                        {/* Comparison Checkbox */}
                        <button
                            onClick={onToggleSelect}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold transition-all shrink-0
                                ${isSelected
                                    ? "bg-brand-gold text-brand-black"
                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                }`}
                        >
                            {isSelected ? <CheckCircle className="w-2.5 h-2.5" /> : <BarChart2 className="w-2.5 h-2.5" />}
                            {isSelected ? "Comparando" : "Comparar"}
                        </button>
                    </div>

                    {/* Metricas Destaque - Compact Grid */}
                    <div className="grid grid-cols-3 gap-1.5 mb-1.5">
                        {['mgte', 'iabcz', 'iqg'].map((metric) => {
                            const val = getMetricValue(metric);
                            const isActive = activeMetric === metric;
                            return (
                                <div key={metric} className={`p-1 rounded-md text-center border ${isActive ? 'bg-brand-gold/10 border-brand-gold/30' : 'bg-gray-50 border-gray-100'}`}>
                                    <div className="text-[8px] text-gray-500 uppercase font-bold tracking-tight">{metric}</div>
                                    <div className={`font-black text-xs md:text-sm ${isActive ? 'text-brand-gold' : 'text-gray-700'}`}>
                                        {val || '-'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Badges / Destaques - Tiny */}
                    <div className="flex flex-wrap gap-1 mb-1">
                        {isTop3 && (
                            <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-yellow-100 text-yellow-800 text-[8px] font-bold uppercase">
                                <Trophy className="w-2 h-2" /> Top 3
                            </span>
                        )}
                        {product.details?.top && (
                            <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-gray-100 text-gray-800 text-[8px] font-bold uppercase">
                                TOP {product.details.top}
                            </span>
                        )}
                        {product.breeder && (
                            <span className="px-1 py-0.5 rounded bg-gray-50 text-gray-500 text-[8px] font-bold uppercase border border-gray-100 truncate max-w-[120px]">
                                {product.breeder}
                            </span>
                        )}
                    </div>
                </div>

                {/* Footer Actions - Compact */}
                <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-gray-100">
                    <div className="flex flex-col">
                        <span className="text-[8px] text-gray-400 uppercase font-bold">Investimento</span>
                        <div className="font-bold text-gray-900 text-xs md:text-sm">
                            {product.category === 'Sêmen' ? `R$ ${product.price}` : product.installments}
                            <span className="text-[9px] text-gray-500 font-normal ml-0.5">
                                {product.category === 'Sêmen' ? '/ dose' : ''}
                            </span>
                        </div>
                    </div>

                    <Link
                        href={`/lote/${product.id}`}
                        className="inline-flex items-center gap-1 bg-brand-black text-white px-2.5 py-1 rounded-md text-[9px] md:text-xs font-bold uppercase hover:bg-brand-gold hover:text-brand-black transition-colors"
                    >
                        Ver Detalhes <ArrowUpRight className="w-2.5 h-2.5" />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
