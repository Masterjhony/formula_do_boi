"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Home, Tag, Dna } from "lucide-react";

interface FilterSection {
    id: string;
    title: string;
    icon: React.ReactNode;
    options: { value: string; label: string }[];
}

const filterSections: FilterSection[] = [
    {
        id: "classificacao",
        title: "Classificação",
        icon: <Home className="w-4 h-4" />,
        options: [
            { value: "reposicao", label: "Reposição" },
            { value: "genetica", label: "Genética" },
        ],
    },
    {
        id: "categoria",
        title: "Categoria",
        icon: <Tag className="w-4 h-4" />,
        options: [
            { value: "venda_direta", label: "Venda Direta" },
            { value: "shopping", label: "Shopping" },
            { value: "venda_permanente", label: "Venda permanente" },
            { value: "semen_genex", label: "Sêmen Genex" },
        ],
    },
    {
        id: "racas",
        title: "Raças",
        icon: <Dna className="w-4 h-4" />,
        options: [
            { value: "nelore", label: "Nelore" },
            { value: "nelore_mocho", label: "Nelore Mocho" },
            { value: "nelore_pintado", label: "Nelore Pintado" },
            { value: "brahman", label: "Brahman" },
            { value: "tabapua", label: "Tabapuã" },
            { value: "gir", label: "Gir" },
        ],
    },
];

interface FilterSidebarProps {
    selectedFilters: Record<string, string[]>;
    onFilterChange: (sectionId: string, value: string, checked: boolean) => void;
    onClearFilters: () => void;
}

export default function FilterSidebar({
    selectedFilters,
    onFilterChange,
    onClearFilters,
}: FilterSidebarProps) {
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        classificacao: true,
        categoria: true,
        racas: true,
    });
    const [showMoreRacas, setShowMoreRacas] = useState(false);

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
                {filterSections.map((section, index) => {
                    const isExpanded = expandedSections[section.id];
                    const visibleOptions =
                        section.id === "racas" && !showMoreRacas
                            ? section.options.slice(0, 4)
                            : section.options;

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
                                    {visibleOptions.map((option) => (
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

                                    {/* Ver mais button for Raças */}
                                    {section.id === "racas" && section.options.length > 4 && (
                                        <button
                                            onClick={() => setShowMoreRacas(!showMoreRacas)}
                                            className="flex items-center gap-1 text-sm text-brand-gold hover:text-yellow-600 font-medium mt-2 transition-colors"
                                        >
                                            {showMoreRacas ? "Ver menos" : "Ver mais"}
                                            {showMoreRacas ? (
                                                <ChevronUp className="w-3 h-3" />
                                            ) : (
                                                <ChevronDown className="w-3 h-3" />
                                            )}
                                        </button>
                                    )}
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
