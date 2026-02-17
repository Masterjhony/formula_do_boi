"use client";

import { Product } from "@/services/products";
import { X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ComparisonBarProps {
    selectedProducts: Product[];
    onClear: () => void;
    onRemove: (id: number) => void;
    onCompare: () => void;
}

export default function ComparisonBar({ selectedProducts, onClear, onRemove, onCompare }: ComparisonBarProps) {
    if (selectedProducts.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none"
            >
                <div className="container mx-auto pointer-events-auto">
                    <div className="bg-brand-black text-white rounded-2xl shadow-2xl p-4 flex items-center justify-between gap-4 max-w-4xl mx-auto border border-brand-gold/20">

                        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide py-1">
                            <div className="flex flex-col min-w-max">
                                <span className="text-xs text-gray-400 uppercase font-bold">Comparando</span>
                                <span className="text-lg font-bold text-brand-gold">{selectedProducts.length} <span className="text-white text-sm font-normal">animais</span></span>
                            </div>

                            <div className="h-8 w-px bg-white/10 mx-2 hidden sm:block"></div>

                            <div className="flex items-center gap-2">
                                {selectedProducts.map((p) => (
                                    <div key={p.id} className="relative group">
                                        <div className="w-10 h-10 rounded-full border-2 border-brand-gold overflow-hidden">
                                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                        </div>
                                        <button
                                            onClick={() => onRemove(p.id)}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={onClear}
                                className="text-xs text-gray-400 hover:text-white underline decoration-dotted hidden sm:block"
                            >
                                Limpar
                            </button>
                            <button
                                onClick={onCompare}
                                className="bg-brand-gold text-brand-black px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide hover:bg-white transition-colors flex items-center gap-2"
                            >
                                Comparar <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
