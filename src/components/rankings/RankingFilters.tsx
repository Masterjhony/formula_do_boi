"use client";

import { useState } from "react";
import { Filter, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RankingFiltersProps {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    activeCategory: string;
    onCategoryChange: (category: string) => void;
    showSold: boolean;
    onShowSoldChange: (show: boolean) => void;
}

export default function RankingFilters({
    activeFilter,
    onFilterChange,
    activeCategory,
    onCategoryChange,
    showSold,
    onShowSoldChange
}: RankingFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);

    const indices = [
        { id: "mgte", label: "MGTe" },
        { id: "iabcz", label: "iABCZ" },
        { id: "iqg", label: "IQG" },
        { id: "price", label: "Valor" },
    ];

    const categories = [
        { id: "all", label: "Todos" },
        { id: "bezerros", label: "Bezerros Pesados" },
        { id: "maternal", label: "Maternal" },
        { id: "precocidade", label: "Precocidade" },
    ];

    return (
        <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 py-4 mb-8">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">

                {/* Mobile Filter Toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden w-full flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 shadow-sm"
                >
                    <span className="flex items-center gap-2"><Filter className="w-4 h-4" /> Filtros e Ordenação</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Filters Content */}
                <motion.div
                    initial={false}
                    animate={{ height: isOpen ? 'auto' : 'auto' }}
                    className={`${isOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row items-center w-full gap-6`}
                >
                    {/* Primary Sort (Indices) */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:block">Ordenar por:</span>
                        <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto overflow-x-auto scrollbar-hide">
                            {indices.map((index) => (
                                <button
                                    key={index.id}
                                    onClick={() => onFilterChange(index.id)}
                                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap flex-1 md:flex-none
                                        ${activeFilter === index.id
                                            ? "bg-white text-brand-black shadow-sm"
                                            : "text-gray-500 hover:text-gray-900"
                                        }`}
                                >
                                    {index.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-8 w-px bg-gray-200 hidden md:block" />

                    {/* Secondary Filter (Categories) */}
                    <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto scrollbar-hide pb-2 md:pb-0">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => onCategoryChange(cat.id)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border transition-all whitespace-nowrap
                                    ${activeCategory === cat.id
                                        ? "bg-brand-gold text-brand-black border-brand-gold"
                                        : "bg-transparent text-gray-500 border-gray-200 hover:border-brand-gold/50"
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={showSold}
                                    onChange={(e) => onShowSoldChange(e.target.checked)}
                                />
                                <div className={`w-10 h-5 rounded-full shadow-inner transition-colors ${showSold ? 'bg-brand-gold' : 'bg-gray-300'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${showSold ? 'translate-x-5' : ''}`}></div>
                            </div>
                            <span className="text-xs font-medium text-gray-600">Exibir Vendidos</span>
                        </label>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
