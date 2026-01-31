"use client";

import ProductCard from "./ProductCard";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

interface ProductSectionProps {
    title: string;
    items: any[];
    link: string;
    linkText: string;
}

export default function ProductSection({ title, items, link, linkText }: ProductSectionProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
    };

    // Auto-play
    useEffect(() => {
        if (items.length === 0) return;
        const interval = setInterval(() => {
            nextSlide();
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [items.length]);

    if (items.length === 0) return null;

    return (
        <div className="mb-16 last:mb-0">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 gap-4 border-b border-gray-200 pb-4 text-center md:text-left">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">
                        {title}
                    </h3>
                    <div className="h-1 w-12 bg-brand-gold mt-2 rounded-full mx-auto md:mx-0"></div>
                </div>
                <Link
                    href={link}
                    className="group flex items-center gap-2 text-brand-gold font-bold hover:text-yellow-600 transition-colors uppercase text-sm tracking-widest"
                >
                    {linkText}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Desktop Grid */}
            <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {/* Mobile Carousel */}
            <div className="lg:hidden relative">
                <div className="overflow-hidden">
                    <div
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {items.map((product) => (
                            <div key={product.id} className="w-full flex-shrink-0 px-2 box-border">
                                <ProductCard product={product} />
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
                    {items.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? "bg-brand-gold w-6" : "bg-gray-300"
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
