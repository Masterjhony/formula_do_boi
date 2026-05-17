import Link from "next/link";
import PremiumCatalogCard from "./PremiumCatalogCard";

// Brandbook tokens
const BRONZE = "#A0792E";
const BRONZE_LIGHT = "#D4A85C";
const BRONZE_PALE = "#E8CB85";
const INK = "#0A0A0A";
const INK_2 = "#141414";
const FG = "#F5F0E4";

interface SemenDestaqueProps {
    products: any[];
    isAuthenticated?: boolean;
}

export default function SemenDestaque({ products, isAuthenticated = true }: SemenDestaqueProps) {
    const semens = products
        .filter((p) =>
            p.category === "Sêmen" &&
            p.details?.status !== "Vendido" &&
            p.tag !== "Vendido"
        )
        .sort((a, b) => (b.display_order ?? 0) - (a.display_order ?? 0))
        .slice(0, 5);

    if (semens.length === 0) return null;

    const restantes = Math.max(0, 11 - semens.length);

    return (
        <section
            id="semen"
            className="stitch-divider scroll-mt-20 py-24 md:py-32 relative overflow-hidden"
            style={{ background: INK, borderTop: "1px solid rgba(212,168,92,0.12)" }}
        >
            {/* Dot grid brandbook */}
            <div
                className="absolute inset-0 pointer-events-none opacity-40"
                style={{
                    backgroundImage: "radial-gradient(circle at 1px 1px, rgba(232,203,133,0.08) 1px, transparent 0)",
                    backgroundSize: "28px 28px",
                    maskImage: "linear-gradient(180deg, black 0%, transparent 85%)",
                }}
            />

            <div className="container mx-auto px-4 relative" style={{ maxWidth: 1200 }}>

                {/* Eyebrow brandbook */}
                <div
                    className="inline-flex items-center gap-3 mb-4"
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
                    Aceleradora de Touros · Central Bela Vista
                </div>

                {/* Número grande display */}
                <div
                    className="font-display"
                    style={{
                        fontSize: "clamp(96px, 22vw, 200px)",
                        fontWeight: 500,
                        lineHeight: 0.85,
                        color: BRONZE_LIGHT,
                        marginBottom: 8,
                        letterSpacing: "-0.04em",
                    }}
                >
                    11
                </div>

                <div
                    style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 13,
                        textTransform: "uppercase",
                        letterSpacing: "0.22em",
                        color: FG,
                        fontWeight: 500,
                        marginBottom: 32,
                    }}
                >
                    Touros · Uma escalação · Curadoria fechada
                </div>

                {/* Descrição */}
                <div className="mb-12" style={{ maxWidth: "62ch" }}>
                    <p style={{
                        fontSize: 18,
                        lineHeight: 1.55,
                        color: "rgba(245,240,228,0.85)",
                        marginBottom: 16,
                        letterSpacing: "-0.005em",
                    }}>
                        <strong style={{ color: FG }}>Central comum trabalha com centenas de reprodutores ao mesmo tempo</strong>
                        {" "}— sem foco, sem comercial dedicado, sem história para contar.
                    </p>
                    <p style={{
                        fontSize: 18,
                        lineHeight: 1.55,
                        color: "rgba(245,240,228,0.85)",
                        letterSpacing: "-0.005em",
                    }}>
                        Selecionamos 11 por safra. Criador dentro da operação, divisão{" "}
                        <strong style={{ color: BRONZE_LIGHT }}>50/50 do lucro líquido</strong> e
                        marketing direcionado. Touro tratado como ativo, não commodity.
                    </p>
                </div>

                {/* Scroll horizontal */}
                <div
                    className="no-scrollbar flex overflow-x-auto gap-4 -mx-4 px-4 pb-4"
                    style={{ scrollSnapType: "x mandatory" }}
                >
                    {semens.map((product) => (
                        <div
                            key={product.id}
                            className="shrink-0 snap-start"
                            style={{ width: 260 }}
                        >
                            <PremiumCatalogCard
                                product={product}
                                isAuthenticated={isAuthenticated}
                            />
                        </div>
                    ))}

                    {/* Card "+N restantes" */}
                    {restantes > 0 && (
                        <div
                            className="shrink-0 flex flex-col items-center justify-center text-center snap-start"
                            style={{
                                width: 240,
                                padding: 30,
                                minHeight: 300,
                                background: INK_2,
                                border: `1px solid rgba(212,168,92,0.22)`,
                                borderRadius: 4,
                            }}
                        >
                            <div
                                className="font-display"
                                style={{
                                    fontSize: 48,
                                    color: BRONZE_LIGHT,
                                    marginBottom: 10,
                                    fontWeight: 500,
                                    letterSpacing: "-0.02em",
                                }}
                            >
                                +{restantes}
                            </div>
                            <div style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 11,
                                color: "rgba(245,240,228,0.62)",
                                marginBottom: 18,
                                letterSpacing: "0.12em",
                                textTransform: "uppercase",
                            }}>
                                na escalação
                            </div>
                            <Link
                                href="/semen"
                                style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: FG,
                                    fontFamily: "var(--font-mono)",
                                    letterSpacing: "0.08em",
                                    textTransform: "uppercase",
                                    borderBottom: `1px solid ${BRONZE}`,
                                    paddingBottom: 2,
                                }}
                            >
                                Ver catálogo →
                            </Link>
                        </div>
                    )}
                </div>

                {/* CTA link brandbook */}
                <Link
                    href="/semen"
                    className="group inline-flex items-center gap-2 mt-10 transition-all hover:gap-4"
                    style={{
                        color: FG,
                        fontWeight: 500,
                        fontSize: 14,
                        borderBottom: `1px solid ${BRONZE}`,
                        paddingBottom: 4,
                        letterSpacing: "0.02em",
                    }}
                >
                    Ver a escalação completa
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M13 6l6 6-6 6"/>
                    </svg>
                </Link>
            </div>
        </section>
    );
}
