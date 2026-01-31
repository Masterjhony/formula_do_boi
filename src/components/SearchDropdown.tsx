"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SearchProduct {
    id: number;
    name: string;
    category: string;
    image: string;
    price: string;
    installments: string;
    location: string;
    forma_pagamento?: string;
}

interface SearchDropdownProps {
    results: SearchProduct[];
    onClose: () => void;
}

export default function SearchDropdown({ results, onClose }: SearchDropdownProps) {
    if (results.length === 0) return null;

    return (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-[70vh] overflow-y-auto z-50">
            <div className="p-2 grid gap-2">
                {results.map((product) => (
                    <Link
                        key={product.id}
                        href={`/lote/${product.id}`}
                        onClick={onClose}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                        {/* Image */}
                        <div className="w-16 h-16 rounded-md overflow-hidden shrink-0 relative">
                            {product.image.endsWith(".mp4") ? (
                                <video
                                    src={product.image}
                                    className="w-full h-full object-cover"
                                    muted
                                    playsInline
                                />
                            ) : (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-white font-medium truncate group-hover:text-brand-gold transition-colors">
                                {product.name}
                            </h3>
                            <p className="text-gray-400 text-xs uppercase tracking-wide">
                                {product.category} • {product.location.split("-")[0].trim()}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-brand-gold font-bold text-sm">
                                    {product.price === "Consultar" ? "Consultar" : `R$ ${product.price}`}
                                </span>
                            </div>
                        </div>

                        {/* Arrow */}
                        <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-brand-gold -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    </Link>
                ))}
            </div>

            <div className="p-3 bg-white/5 border-t border-white/10 text-center">
                <p className="text-xs text-gray-500">
                    Mostrando top {results.length} resultados
                </p>
            </div>
        </div>
    );
}
