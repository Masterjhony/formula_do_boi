"use client";

import Link from "next/link";
import { useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CatalogGrid from "@/components/CatalogGrid";
import { EMBRYOS } from "@/data/embryos";
import { DOADORAS, DOADORAS_CONDICOES } from "@/data/doadoras";
import { Product } from "@/services/products";

const BRONZE = "#A0792E";
const BRONZE_LIGHT = "#D4A85C";
const INK = "#0A0A0A";
const INK_2 = "#141414";
const FG = "#F5F0E4";

interface EmbrioesClientProps {
    products: Product[];
}

function fmtBRL(n: number) {
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}
function fmtDecimal(n: number) {
    return n.toString().replace(".", ",");
}

export default function EmbrioesClient({ products: dbProducts }: EmbrioesClientProps) {
    const allProducts = useMemo(() => {
        const dbIds = new Set(dbProducts.map((p) => p.id));
        const staticKeep = EMBRYOS.filter((e) => !dbIds.has(e.id));
        return [...dbProducts, ...staticKeep].filter((p) => {
            const cat = p.category || "";
            const type = p.classificacao || "";
            return (
                (cat.includes("Embrião") || cat === "DOADORA" || type === "embriao") &&
                !cat.includes("Sêmen")
            );
        });
    }, [dbProducts]);

    return (
        <main className="min-h-screen" style={{ background: INK }}>
            <Header />

            {/* HERO BRANDBOOK ─────────────────────────────── */}
            <section
                className="relative overflow-hidden"
                style={{ background: INK, borderBottom: "1px solid rgba(212,168,92,0.18)" }}
            >
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background:
                            "radial-gradient(ellipse at 50% 0%, rgba(212,168,92,0.16) 0%, transparent 60%)",
                    }}
                />
                <div className="container mx-auto px-4 pt-20 pb-12 relative" style={{ maxWidth: 1200 }}>
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
                        <span style={{ width: 6, height: 6, background: BRONZE, borderRadius: "50%" }} />
                        Marketplace · Embriões FIV
                    </div>
                    <h1
                        className="font-display"
                        style={{
                            fontSize: "clamp(40px, 7vw, 88px)",
                            fontWeight: 500,
                            lineHeight: 0.98,
                            letterSpacing: "-0.03em",
                            color: FG,
                            marginBottom: 22,
                            maxWidth: "18ch",
                        }}
                    >
                        Embriões FIV <span style={{ color: BRONZE_LIGHT }}>selecionados.</span>
                    </h1>
                    <p
                        style={{
                            color: "rgba(245,240,228,0.78)",
                            fontSize: 18,
                            lineHeight: 1.55,
                            maxWidth: "62ch",
                            letterSpacing: "-0.005em",
                        }}
                    >
                        Cruzamentos curados, pedigree autenticado, embrião VIT com rastreabilidade total.
                        Pacote mínimo de {DOADORAS_CONDICOES.pacoteMinimo} unidades — {DOADORAS_CONDICOES.prenhezesGarantidas} prenhezes garantidas.
                    </p>
                </div>
            </section>

            {/* SAFRA NELORE VISUAL 2026 ───────────────────── */}
            <section
                style={{
                    background: INK_2,
                    borderBottom: "1px solid rgba(212,168,92,0.10)",
                }}
            >
                <div className="container mx-auto px-4 py-14 md:py-20" style={{ maxWidth: 1280 }}>
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10">
                        <div>
                            <div
                                className="inline-flex items-center gap-3 mb-4"
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: 11,
                                    letterSpacing: "0.22em",
                                    textTransform: "uppercase",
                                    color: BRONZE_LIGHT,
                                    fontWeight: 500,
                                }}
                            >
                                <span style={{ width: 24, height: 1, background: BRONZE }} />
                                Safra 2026 · Nelore Visual × FdB
                            </div>
                            <h2
                                className="font-display"
                                style={{
                                    fontSize: "clamp(28px, 4vw, 48px)",
                                    fontWeight: 500,
                                    color: FG,
                                    letterSpacing: "-0.02em",
                                    maxWidth: "26ch",
                                }}
                            >
                                Cinco doadoras de elite. {DOADORAS_CONDICOES.fazenda}, {DOADORAS_CONDICOES.municipio}.
                            </h2>
                        </div>
                        <p
                            style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 12,
                                letterSpacing: "0.10em",
                                color: "rgba(245,240,228,0.55)",
                                maxWidth: "32ch",
                            }}
                        >
                            Cruzamentos selecionados pelo time FdB × Bula. Genealogia em validação ABCZ.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {DOADORAS.map((d) => {
                            const nome = d.nomeAbcz ?? d.rgd;
                            return (
                                <Link
                                    key={d.slug}
                                    href={`/embrioes/${d.slug}`}
                                    className="group block"
                                >
                                    <article
                                        className="card-engraved overflow-hidden"
                                        style={{
                                            background: INK,
                                            border: "1px solid rgba(212,168,92,0.20)",
                                            transition: "border-color 200ms ease, transform 200ms ease",
                                        }}
                                    >
                                        {/* Imagem placeholder ou vídeo */}
                                        <div
                                            className="relative overflow-hidden"
                                            style={{
                                                aspectRatio: "4/5",
                                                background: `linear-gradient(135deg, ${INK} 0%, #1F1A0E 100%)`,
                                                borderBottom: "1px solid rgba(212,168,92,0.18)",
                                            }}
                                        >
                                            {d.video ? (
                                                <video
                                                    src={d.video}
                                                    autoPlay
                                                    muted
                                                    loop
                                                    playsInline
                                                    preload="metadata"
                                                    className="absolute inset-0 w-full h-full object-contain"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <svg
                                                        width="64"
                                                        height="64"
                                                        viewBox="0 0 64 64"
                                                        fill="none"
                                                        stroke={BRONZE_LIGHT}
                                                        strokeWidth="1"
                                                        style={{ opacity: 0.5, marginBottom: 12 }}
                                                        aria-hidden
                                                    >
                                                        <path d="M14 34c0-8 6-14 14-14h8c8 0 14 6 14 14v8c0 4-3 8-8 8H22c-5 0-8-4-8-8z" />
                                                        <path d="M22 50v6M42 50v6M28 50v6M36 50v6" />
                                                        <path d="M14 28l-4-4M50 28l4-4" />
                                                    </svg>
                                                    <div
                                                        className="font-display"
                                                        style={{
                                                            fontSize: 22,
                                                            fontWeight: 500,
                                                            color: BRONZE_LIGHT,
                                                            letterSpacing: "-0.015em",
                                                        }}
                                                    >
                                                        {d.rgd}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Badge top */}
                                            <span
                                                style={{
                                                    position: "absolute",
                                                    top: 12,
                                                    left: 12,
                                                    fontFamily: "var(--font-mono)",
                                                    fontSize: 10,
                                                    letterSpacing: "0.18em",
                                                    textTransform: "uppercase",
                                                    color: INK,
                                                    background: BRONZE,
                                                    padding: "4px 8px",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {d.classificacaoTop}
                                            </span>
                                        </div>

                                        {/* Body */}
                                        <div className="p-5">
                                            <div
                                                className="font-display mb-1"
                                                style={{
                                                    fontSize: 20,
                                                    fontWeight: 500,
                                                    color: FG,
                                                    letterSpacing: "-0.015em",
                                                    lineHeight: 1.15,
                                                }}
                                            >
                                                {nome}
                                            </div>
                                            <div
                                                style={{
                                                    fontFamily: "var(--font-mono)",
                                                    fontSize: 11,
                                                    letterSpacing: "0.16em",
                                                    textTransform: "uppercase",
                                                    color: "rgba(245,240,228,0.55)",
                                                    marginBottom: 14,
                                                }}
                                            >
                                                × {d.cruzamento}
                                            </div>

                                            {/* Métricas mono */}
                                            <div className="grid grid-cols-3 gap-2 mb-5">
                                                {[
                                                    { l: "iABCZ", v: fmtDecimal(d.iabcz.valor) },
                                                    { l: "IQG", v: fmtDecimal(d.iqg.valor) },
                                                    { l: "MGTe", v: fmtDecimal(d.mgte.valor) },
                                                ].map((m) => (
                                                    <div key={m.l}>
                                                        <div
                                                            style={{
                                                                fontFamily: "var(--font-mono)",
                                                                fontSize: 9.5,
                                                                letterSpacing: "0.20em",
                                                                textTransform: "uppercase",
                                                                color: BRONZE_LIGHT,
                                                                marginBottom: 3,
                                                            }}
                                                        >
                                                            {m.l}
                                                        </div>
                                                        <div
                                                            className="font-display"
                                                            style={{
                                                                fontSize: 18,
                                                                fontWeight: 500,
                                                                color: FG,
                                                                lineHeight: 1,
                                                            }}
                                                        >
                                                            {m.v}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Preço */}
                                            <div
                                                className="flex items-baseline justify-between"
                                                style={{
                                                    paddingTop: 14,
                                                    borderTop: "1px solid rgba(212,168,92,0.16)",
                                                }}
                                            >
                                                <div>
                                                    <div
                                                        style={{
                                                            fontFamily: "var(--font-mono)",
                                                            fontSize: 10,
                                                            letterSpacing: "0.18em",
                                                            textTransform: "uppercase",
                                                            color: "rgba(245,240,228,0.50)",
                                                        }}
                                                    >
                                                        Embrião VIT
                                                    </div>
                                                    <div
                                                        className="font-display"
                                                        style={{
                                                            fontSize: 22,
                                                            fontWeight: 500,
                                                            color: BRONZE_LIGHT,
                                                            letterSpacing: "-0.015em",
                                                        }}
                                                    >
                                                        {fmtBRL(d.precoEmbriao)}
                                                    </div>
                                                </div>
                                                <span
                                                    style={{
                                                        fontFamily: "var(--font-mono)",
                                                        fontSize: 10,
                                                        letterSpacing: "0.16em",
                                                        textTransform: "uppercase",
                                                        color: BRONZE_LIGHT,
                                                    }}
                                                >
                                                    Ver ficha →
                                                </span>
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CATÁLOGO GERAL (Supabase + EMBRYOS estáticos) ── */}
            {allProducts.length > 0 && (
                <section style={{ background: INK }}>
                    <div className="container mx-auto px-4 py-14 md:py-20" style={{ maxWidth: 1280 }}>
                        <div
                            className="inline-flex items-center gap-3 mb-6"
                            style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 11,
                                letterSpacing: "0.22em",
                                textTransform: "uppercase",
                                color: BRONZE_LIGHT,
                                fontWeight: 500,
                            }}
                        >
                            <span style={{ width: 24, height: 1, background: BRONZE }} />
                            Outras doadoras · catálogo geral
                        </div>
                        <h2
                            className="font-display mb-8"
                            style={{
                                fontSize: "clamp(24px, 3vw, 40px)",
                                fontWeight: 500,
                                color: FG,
                                letterSpacing: "-0.018em",
                            }}
                        >
                            Doadoras consagradas no rebanho FdB.
                        </h2>
                        <CatalogGrid
                            products={allProducts}
                            totalCount={allProducts.length}
                            onClearFilters={() => {}}
                            hasFilters={false}
                            theme="premium"
                        />
                    </div>
                </section>
            )}

            <Footer />
        </main>
    );
}
