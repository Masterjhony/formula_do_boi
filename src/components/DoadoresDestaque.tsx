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
        <section
            id="doadoras"
            className="stitch-divider scroll-mt-20 py-20 md:py-28 relative overflow-hidden"
            style={{ background: "#F6F2EA" }}
        >
            {/* Glow accent */}
            <div
                className="absolute pointer-events-none"
                style={{ top: -100, right: -150, width: 400, height: 400, background: "radial-gradient(circle, rgba(160,128,42,0.08) 0%, transparent 70%)" }}
            />

            <div className="container mx-auto px-4 relative" style={{ maxWidth: 1200 }}>

                {/* Kicker */}
                <div
                    className="mb-3"
                    style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "#A0802A", fontWeight: 700 }}
                >
                    Doadoras & Embriões
                </div>

                {/* Citação-gancho */}
                <blockquote
                    className="font-display"
                    style={{ borderLeft: "3px solid #A0802A", paddingLeft: 18, marginBottom: 22, fontStyle: "italic", fontSize: 17, color: "#6B6558", maxWidth: "40ch" }}
                >
                    &#8220;P.O. é só pra milionário.&#8221;
                </blockquote>

                {/* Título */}
                <h2
                    className="font-display"
                    style={{ fontSize: "clamp(28px, 6vw, 50px)", fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.02em", color: "#1A1A1A", marginBottom: 16 }}
                >
                    Genética de elite{" "}
                    <em style={{ fontStyle: "italic", color: "#A0802A" }}>a partir de</em>
                </h2>

                {/* Bandeira de preço */}
                <div
                    className="inline-flex flex-col items-start gap-0.5 rounded-xl mb-7"
                    style={{ background: "#1A1A1A", color: "#F6F2EA", padding: "14px 20px" }}
                >
                    <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.2em", color: "#C9A961", fontWeight: 700 }}>
                        30x de
                    </span>
                    <span className="font-display" style={{ fontSize: 30, fontWeight: 500, letterSpacing: "-0.01em" }}>
                        R$ 293
                        <small style={{ fontSize: 14, color: "rgba(246,242,234,0.7)", fontWeight: 400, fontFamily: "inherit" }}>
                            {" "}/ mês
                        </small>
                    </span>
                </div>

                {/* Lead */}
                <p style={{ fontSize: 17, color: "#6B6558", lineHeight: 1.6, maxWidth: "58ch", marginBottom: 40 }}>
                    Pacote de 10 embriões de doadoras consagradas. Você coloca receptora, a genética de
                    elite entra no seu rebanho. A porta de entrada do P.O. é mais larga do que te contaram.
                </p>

                {/* Grid de cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
                    {doadoras.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            theme="default"
                            isAuthenticated={isAuthenticated}
                        />
                    ))}
                </div>

                {/* Link */}
                <a
                    href="https://wa.me/5531984143874?text=Ol%C3%A1%2C%20tenho%20interesse%20em%20doadoras%20e%20embri%C3%B5es%20Nelore%20P.O."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 transition-all hover:gap-4"
                    style={{ color: "#1A1A1A", fontWeight: 700, fontSize: 14, borderBottom: "2px solid #A0802A", paddingBottom: 2 }}
                >
                    Ver todas as doadoras
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M13 6l6 6-6 6"/>
                    </svg>
                </a>
            </div>
        </section>
    );
}
