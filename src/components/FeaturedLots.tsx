"use client";

import ProductCard from "./ProductCard";
import Link from "next/link";
import { ArrowRight, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { EMBRYOS } from "../data/embryos";
import { useState, useEffect } from "react";

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

    // Filter for Embriões only
    const featuredProducts = uniqueItems
        .filter(p => p.category === 'Embrião')
        .sort((a, b) => a.id - b.id)
        .slice(0, 4);

    // Carousel Logic
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredProducts.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + featuredProducts.length) % featuredProducts.length);
    };

    // Auto-play
    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [featuredProducts.length]);

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
                            Seleção exclusiva dos melhores embriões disponíveis para negociação.
                        </p>
                    </div>


                </div>

                {/* Desktop Grid */}
                <div className="hidden lg:grid grid-cols-4 gap-6">
                    {featuredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} featured={true} />
                    ))}
                </div>

                {/* Mobile Carousel */}
                <div className="lg:hidden relative">
                    <div className="overflow-hidden">
                        <div
                            className="flex transition-transform duration-500 ease-in-out"
                            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                        >
                            {featuredProducts.map((product) => (
                                <div key={product.id} className="w-full flex-shrink-0 px-2 box-border">
                                    <ProductCard product={product} featured={true} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    <button
                        onClick={prevSlide}
                        className="absolute top-1/2 left-0 -translate-y-1/2 -ml-2 p-2 bg-brand-black/50 hover:bg-brand-black/80 text-white rounded-full backdrop-blur-sm transition-all z-20"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute top-1/2 right-0 -translate-y-1/2 -mr-2 p-2 bg-brand-black/50 hover:bg-brand-black/80 text-white rounded-full backdrop-blur-sm transition-all z-20"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Dots Indicators */}
                    <div className="flex justify-center gap-2 mt-6">
                        {featuredProducts.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? "bg-brand-gold w-6" : "bg-white/30"
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

