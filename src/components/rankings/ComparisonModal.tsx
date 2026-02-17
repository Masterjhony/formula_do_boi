"use client";

import { Product } from "@/services/products";
import { X } from "lucide-react";
import { motion } from "framer-motion";

interface ComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    products: Product[];
}

export default function ComparisonModal({ isOpen, onClose, products }: ComparisonModalProps) {
    if (!isOpen) return null;

    // Helper to get raw value
    const getVal = (p: Product, key: string) => {
        const v = p[key as keyof Product] || p.details?.[key];
        return v ? parseFloat(v) : 0;
    };

    // Calculate max values for normalization (simple scale)
    const maxMGTe = Math.max(...products.map(p => getVal(p, 'mgte')), 30);
    const maxIABCZ = Math.max(...products.map(p => getVal(p, 'iabcz')), 30);
    const maxIQG = Math.max(...products.map(p => getVal(p, 'iqg')), 30);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col relative"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-black text-brand-black">Comparativo de Genética</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6 scrollbar-thin">
                    <div className="grid grid-cols-[1fr_repeat(auto-fit,minmax(200px,1fr))] gap-4 md:gap-8">

                        {/* Labels Column */}
                        <div className="flex flex-col gap-8 pt-[220px] md:pt-[220px]">
                            <div className="space-y-6">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Índices</h3>
                                <div className="h-8 flex items-center text-sm font-bold text-gray-700">MGTe</div>
                                <div className="h-8 flex items-center text-sm font-bold text-gray-700">iABCZ</div>
                                <div className="h-8 flex items-center text-sm font-bold text-gray-700">IQG</div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Genealogia</h3>
                                <div className="h-8 flex items-center text-sm font-medium text-gray-600">Pai</div>
                                <div className="h-8 flex items-center text-sm font-medium text-gray-600">Mãe</div>
                                <div className="h-8 flex items-center text-sm font-medium text-gray-600">RGD</div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Comercial</h3>
                                <div className="h-8 flex items-center text-sm font-medium text-gray-600">Preço</div>
                                <div className="h-8 flex items-center text-sm font-medium text-gray-600">Parcelas</div>
                            </div>
                        </div>

                        {/* Product Columns */}
                        {products.map((p) => (
                            <div key={p.id} className="flex flex-col gap-8 min-w-[200px]">
                                {/* Header (Image + Name) */}
                                <div className="h-[220px] flex flex-col items-center text-center">
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-gray-100 overflow-hidden mb-4 shadow-lg">
                                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                    </div>
                                    <h3 className="font-bold text-lg leading-tight mb-1">{p.name}</h3>
                                    <span className="text-xs text-gray-400">{p.breeder}</span>
                                </div>

                                {/* Indices Bars */}
                                <div className="space-y-6">
                                    {/* Spacer for label alignment */}
                                    <div className="hidden md:block h-5"></div>

                                    {/* MGTe */}
                                    <div className="h-8 flex flex-col justify-center">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span>{getVal(p, 'mgte') || '-'}</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div style={{ width: `${(getVal(p, 'mgte') / maxMGTe * 100)}%` }} className="h-full bg-brand-gold rounded-full" />
                                        </div>
                                    </div>
                                    {/* iABCZ */}
                                    <div className="h-8 flex flex-col justify-center">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span>{getVal(p, 'iabcz') || '-'}</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div style={{ width: `${(getVal(p, 'iabcz') / maxIABCZ * 100)}%` }} className="h-full bg-blue-500 rounded-full" />
                                        </div>
                                    </div>
                                    {/* IQG */}
                                    <div className="h-8 flex flex-col justify-center">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span>{getVal(p, 'iqg') || '-'}</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div style={{ width: `${(getVal(p, 'iqg') / maxIQG * 100)}%` }} className="h-full bg-green-500 rounded-full" />
                                        </div>
                                    </div>
                                </div>

                                {/* Genealogia Values */}
                                <div className="space-y-6 pt-6">
                                    <div className="hidden md:block h-4"></div>
                                    <div className="h-8 flex items-center text-sm text-gray-900 truncate" title={p.pai}>{p.pai || '-'}</div>
                                    <div className="h-8 flex items-center text-sm text-gray-900 truncate" title={p.mae}>{p.mae || '-'}</div>
                                    <div className="h-8 flex items-center text-sm text-gray-900 truncate">{p.registro || '-'}</div>
                                </div>

                                {/* Comercial Values */}
                                <div className="space-y-6 pt-6">
                                    <div className="hidden md:block h-4"></div>
                                    <div className="h-8 flex items-center text-sm font-bold text-brand-gold">{p.price}</div>
                                    <div className="h-8 flex items-center text-sm text-gray-900">{p.installments}</div>
                                </div>

                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
