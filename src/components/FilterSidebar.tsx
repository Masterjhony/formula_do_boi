"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Home, Tag, DollarSign, Wallet, Truck } from "lucide-react";

export interface FilterSection {
    id: string;
    title: string;
    icon: React.ReactNode;
    options: { value: string; label: string }[];
}

export const commonFilters: FilterSection[] = [
    {
        id: "faixa_valor",
        title: "Faixa de Valor",
        icon: <DollarSign className="w-4 h-4" />,
        options: [
            { value: "ate_5k", label: "Até R$ 5.000" },
            { value: "5k_10k", label: "R$ 5.000 - R$ 10.000" },
            { value: "10k_20k", label: "R$ 10.000 - R$ 20.000" },
            { value: "acima_20k", label: "Acima de R$ 20.000" },
        ],
    },
    {
        id: "forma_pagamento",
        title: "Forma de Pagamento",
        icon: <Wallet className="w-4 h-4" />,
        options: [
            { value: "a_vista", label: "À Vista" },
            { value: "parcelado_12x", label: "Parcelado (12x)" },
            { value: "parcelado_24x", label: "Parcelado (24x)" },
            { value: "parcelado_30x", label: "Parcelado (30x)" },
        ],
    },
    {
        id: "logistica",
        title: "Logística / Frete",
        icon: <Truck className="w-4 h-4" />,
        options: [
            { value: "frete_gratis", label: "Frete Grátis" },
            { value: "frete_compartilhado", label: "Frete Compartilhado" },
            { value: "retira_fazenda", label: "Buscar na Fazenda" },
        ],
    },
];

const defaultFilters: FilterSection[] = [
    {
        id: "tipo",
        title: "Tipo",
        icon: <Tag className="w-4 h-4" />,
        options: [
            { value: "parida", label: "Parida" },
            { value: "prenha", label: "Prenha" },
            { value: "parida_prenha", label: "Parida e Prenha" },
            { value: "doadora", label: "Doadora" },
        ],
    },
    ...commonFilters,
];

interface FilterSidebarProps {
    sections?: FilterSection[];
    selectedFilters: Record<string, string[]>;
    onFilterChange: (sectionId: string, value: string, checked: boolean) => void;
    onClearFilters: () => void;
}

export default function FilterSidebar({
    sections = defaultFilters,
    selectedFilters,
    onFilterChange,
    onClearFilters,
}: FilterSidebarProps) {
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        tipo: true,
        classificacao: true,
        id: true,
        procedencia: true,
        faixa_valor: true,
        forma_pagamento: false,
        logistica: false,
    });

    const toggleSection = (sectionId: string) => {
        setExpandedSections((prev) => ({
            ...prev,
            [sectionId]: !prev[sectionId],
        }));
    };

    const hasActiveFilters = Object.values(selectedFilters).some((arr) => arr.length > 0);

    return (
        <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {sections.map((section, index) => {
                    const isExpanded = expandedSections[section.id];

                    return (
                        <div
                            key={section.id}
                            className={index > 0 ? "border-t border-gray-100" : ""}
                        >
                            {/* Section Header */}
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-2 text-gray-700 font-semibold">
                                    {section.icon}
                                    <span>{section.title}</span>
                                </div>
                                {isExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-gray-400" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                )}
                            </button>

                            {/* Section Options */}
                            {isExpanded && (
                                <div className="px-4 pb-4 space-y-2">
                                    {section.options.map((option) => (
                                        <label
                                            key={option.value}
                                            className="flex items-center gap-3 cursor-pointer group"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={
                                                    selectedFilters[section.id]?.includes(option.value) ||
                                                    false
                                                }
                                                onChange={(e) =>
                                                    onFilterChange(
                                                        section.id,
                                                        option.value,
                                                        e.target.checked
                                                    )
                                                }
                                                className="w-4 h-4 rounded border-gray-300 text-brand-gold focus:ring-brand-gold cursor-pointer"
                                            />
                                            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                                                {option.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
                <button
                    onClick={onClearFilters}
                    className="w-full mt-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Limpar todos os filtros
                </button>
            )}
        </aside>
    );
}
