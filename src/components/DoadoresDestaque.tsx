import { ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { EMBRYOS } from "@/data/embryos";

interface DoadoresDestaqueProps {
    products: any[];
    isAuthenticated?: boolean;
}

export default function DoadoresDestaque({ products, isAuthenticated = true }: DoadoresDestaqueProps) {
    const embryosData = !isAuthenticated
        ? EMBRYOS.map((e) => ({
              ...e,
              price: null,
              installments: null,
              downPaymentValue: null,
              forma_pagamento: null,
              details: { ...e.details, breeder: null, proprietario: null, pdf: null },
          }))
        : EMBRYOS;

    const combined = [...embryosData, ...products];
    const seen = new Set<number>();
    const unique = combined.filter((p) => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
    });

    const doadoras = unique
        .filter((p) => p.category === "Embrião" || p.category === "DOADORA")
        .sort((a, b) => a.id - b.id)
        .slice(0, 4);

    if (doadoras.length === 0) return null;

    return (
        <section id="doadoras" className="stitch-divider py-20 bg-[#080808] border-t border-white/5 scroll-mt-20">
            <div className="container mx-auto px-4">
                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-gold/25 bg-brand-gold/6 mb-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                            <span className="text-brand-gold text-[10px] font-black tracking-[0.22em] uppercase">
                                Doadoras Fórmula do Boi
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none mb-3">
                            A doadora certa<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-200">
                                multiplica seu rebanho
                            </span>
                        </h2>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-md mb-4">
                            Uma matriz de elite não é custo — é alavanca. Cada embrião transferido
                            pode virar uma geração inteira de animais acima da média.
                        </p>
                        {/* Stat chips */}
                        <div className="flex flex-wrap gap-2">
                            {["Curadoria técnica individual", "Embriões de linhagens consagradas", "ANCP + Geneplus"].map((s) => (
                                <span key={s} className="text-[11px] text-gray-400 bg-white/[0.04] border border-white/8 px-3 py-1 rounded-full font-medium">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>

                    <a
                        href="https://wa.me/5531984143874?text=Ol%C3%A1%2C%20tenho%20interesse%20em%20doadoras%20e%20embri%C3%B5es%20Nelore%20P.O."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-bold text-brand-gold hover:text-yellow-400 uppercase tracking-widest transition-colors group whitespace-nowrap"
                    >
                        Consultar disponibilidade
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>

                {/* ── Cards ── */}
                <div className="no-scrollbar flex overflow-x-auto snap-x snap-mandatory gap-4 -mx-4 px-4 pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:snap-none sm:mx-0 sm:px-0 sm:pb-0 sm:gap-5 lg:grid-cols-4">
                    {doadoras.map((product) => (
                        <div key={product.id} className="shrink-0 w-[78vw] snap-start sm:w-auto">
                            <ProductCard
                                product={product}
                                theme="premium"
                                isAuthenticated={isAuthenticated}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
