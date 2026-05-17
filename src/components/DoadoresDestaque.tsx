import Link from "next/link";
import PremiumCatalogCard from "./PremiumCatalogCard";
import { EMBRYOS } from "@/data/embryos";

// Brandbook tokens
const BRONZE = "#A0792E";
const BRONZE_LIGHT = "#D4A85C";
const BRONZE_PALE = "#E8CB85";
const INK = "#0A0A0A";
const INK_2 = "#141414";
const FG = "#F5F0E4";

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
            className="stitch-divider scroll-mt-20 py-24 md:py-32 relative overflow-hidden"
            style={{ background: INK_2, borderTop: "1px solid rgba(212,168,92,0.12)" }}
        >
            {/* Glow bronze */}
            <div
                className="absolute pointer-events-none"
                style={{ top: -100, right: -150, width: 500, height: 500, background: "radial-gradient(circle, rgba(212,168,92,0.10) 0%, transparent 70%)" }}
            />

            {/* Dot grid */}
            <div
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                    backgroundImage: "radial-gradient(circle at 1px 1px, rgba(232,203,133,0.07) 1px, transparent 0)",
                    backgroundSize: "28px 28px",
                }}
            />

            <div className="container mx-auto px-4 relative" style={{ maxWidth: 1200 }}>

                {/* Eyebrow brandbook */}
                <div
                    className="inline-flex items-center gap-3 mb-6"
                    style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        letterSpacing: "0.24em",
                        textTransform: "uppercase",
                        color: BRONZE_LIGHT,
                        fontWeight: 500,
                    }}
                >
                    <span style={{ width: 32, height: 1, background: BRONZE, display: "inline-block" }} />
                    Doadoras · Embriões FIV · Top 0.3%
                </div>

                {/* Citação-gancho — brandbook style */}
                <blockquote
                    className="font-display"
                    style={{
                        borderLeft: `2px solid ${BRONZE}`,
                        paddingLeft: 22,
                        marginBottom: 28,
                        fontStyle: "italic",
                        fontSize: 19,
                        color: "rgba(245,240,228,0.55)",
                        maxWidth: "40ch",
                        fontWeight: 400,
                        lineHeight: 1.4,
                    }}
                >
                    &ldquo;PO é só pra milionário.&rdquo;
                </blockquote>

                {/* Título */}
                <h2
                    className="font-display"
                    style={{
                        fontSize: "clamp(32px, 6.2vw, 60px)",
                        fontWeight: 500,
                        lineHeight: 1.0,
                        letterSpacing: "-0.03em",
                        color: FG,
                        marginBottom: 22,
                        maxWidth: "14ch",
                    }}
                >
                    Genética de elite{" "}
                    <span style={{ color: BRONZE_LIGHT }}>a partir de</span>
                </h2>

                {/* Bandeira de preço */}
                <div
                    className="inline-flex flex-col items-start gap-0.5 mb-8"
                    style={{
                        background: INK,
                        color: FG,
                        padding: "16px 22px",
                        border: `1px solid ${BRONZE}`,
                        borderRadius: 4,
                    }}
                >
                    <span style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10.5,
                        textTransform: "uppercase",
                        letterSpacing: "0.22em",
                        color: BRONZE_LIGHT,
                        fontWeight: 500,
                    }}>
                        30x de
                    </span>
                    <span className="font-display" style={{
                        fontSize: 34,
                        fontWeight: 500,
                        letterSpacing: "-0.015em",
                        color: FG,
                    }}>
                        R$ 293
                        <small style={{
                            fontSize: 15,
                            color: "rgba(245,240,228,0.60)",
                            fontWeight: 400,
                            fontFamily: "inherit",
                            marginLeft: 4,
                        }}>
                            / mês
                        </small>
                    </span>
                </div>

                {/* Lead */}
                <p style={{
                    fontSize: 18,
                    color: "rgba(245,240,228,0.80)",
                    lineHeight: 1.55,
                    maxWidth: "60ch",
                    marginBottom: 48,
                    letterSpacing: "-0.005em",
                }}>
                    Pacote de 10 embriões de doadoras consagradas. Você coloca receptora,
                    a genética de elite entra no rebanho. A porta de entrada do PO é mais
                    larga do que te contaram.
                </p>

                {/* Grid de cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                    {doadoras.map((product) => (
                        <PremiumCatalogCard
                            key={product.id}
                            product={product}
                            isAuthenticated={isAuthenticated}
                        />
                    ))}
                </div>

                {/* CTAs brandbook */}
                <div className="flex flex-wrap items-center gap-6">
                    <Link
                        href="/embrioes"
                        className="group inline-flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                        style={{
                            background: BRONZE,
                            color: INK,
                            padding: "14px 22px",
                            borderRadius: 2,
                            fontWeight: 600,
                            fontSize: 14,
                            letterSpacing: "0.02em",
                            border: `1px solid ${BRONZE}`,
                        }}
                    >
                        Ver todos os Embriões
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:translate-x-0.5">
                            <path d="M5 12h14M13 6l6 6-6 6"/>
                        </svg>
                    </Link>
                    <a
                        href="https://wa.me/5531984143874?text=Ol%C3%A1%2C%20tenho%20interesse%20em%20doadoras%20e%20embri%C3%B5es%20Nelore%20P.O."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-2 transition-all hover:gap-4"
                        style={{
                            color: FG,
                            fontWeight: 500,
                            fontSize: 14,
                            borderBottom: `1px solid ${BRONZE}`,
                            paddingBottom: 4,
                            letterSpacing: "0.02em",
                        }}
                    >
                        Falar com curador
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M13 6l6 6-6 6"/>
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
}
