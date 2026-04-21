import Link from "next/link";
import ProductCard from "./ProductCard";

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
            className="stitch-divider scroll-mt-20 py-20 md:py-28 bg-white border-t"
            style={{ borderColor: "#E8E4DB" }}
        >
            <div className="container mx-auto px-4" style={{ maxWidth: 1200 }}>

                {/* Kicker */}
                <div
                    className="mb-2"
                    style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "#A0802A", fontWeight: 700 }}
                >
                    Aceleradora de Touros · Central Bela Vista
                </div>

                {/* Número grande */}
                <div
                    className="font-display"
                    style={{ fontStyle: "italic", fontSize: "clamp(80px, 22vw, 180px)", fontWeight: 300, lineHeight: 0.85, color: "#A0802A", marginBottom: 8, letterSpacing: "-0.04em" }}
                >
                    11
                </div>

                <div
                    style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.2em", color: "#2A2A2A", fontWeight: 600, marginBottom: 28 }}
                >
                    Touros · Uma escalação
                </div>

                {/* Descrição */}
                <div className="mb-9" style={{ maxWidth: "58ch" }}>
                    <p style={{ fontSize: 16, lineHeight: 1.65, color: "#1A1A1A", marginBottom: 14 }}>
                        <strong>Central comum trabalha com centenas de reprodutores ao mesmo tempo</strong> —
                        sem foco, sem comercial dedicado, sem história pra contar.
                    </p>
                    <p style={{ fontSize: 16, lineHeight: 1.65, color: "#1A1A1A" }}>
                        Nós selecionamos 11 por safra. Com o criador dentro da operação, divisão{" "}
                        <strong>50/50 do lucro líquido</strong> e marketing direcionado. É touro tratado
                        como ativo, não commodity.
                    </p>
                </div>

                {/* Scroll horizontal */}
                <div
                    className="no-scrollbar flex overflow-x-auto gap-3.5 -mx-4 px-4 pb-4"
                    style={{ scrollSnapType: "x mandatory" }}
                >
                    {semens.map((product) => (
                        <div
                            key={product.id}
                            className="shrink-0 snap-start"
                            style={{ width: 260 }}
                        >
                            <ProductCard
                                product={product}
                                theme="default"
                                isAuthenticated={isAuthenticated}
                            />
                        </div>
                    ))}

                    {/* Card "+N restantes" */}
                    {restantes > 0 && (
                        <div
                            className="shrink-0 flex flex-col items-center justify-center text-center snap-start rounded-xl border"
                            style={{ width: 240, padding: 30, minHeight: 300, background: "#F6F2EA", borderColor: "#E8E4DB" }}
                        >
                            <div
                                className="font-display"
                                style={{ fontSize: 36, color: "#A0802A", marginBottom: 8, fontStyle: "italic" }}
                            >
                                +{restantes}
                            </div>
                            <div style={{ fontSize: 13, color: "#6B6558", marginBottom: 14 }}>
                                reprodutores na escalação
                            </div>
                            <Link
                                href="/semen"
                                style={{ fontSize: 13, fontWeight: 700, color: "#1A1A1A" }}
                            >
                                Ver catálogo →
                            </Link>
                        </div>
                    )}
                </div>

                {/* Link */}
                <Link
                    href="/semen"
                    className="inline-flex items-center gap-2 mt-7 transition-all hover:gap-4"
                    style={{ color: "#1A1A1A", fontWeight: 700, fontSize: 14, borderBottom: "2px solid #A0802A", paddingBottom: 2 }}
                >
                    Ver a escalação completa
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M13 6l6 6-6 6"/>
                    </svg>
                </Link>
            </div>
        </section>
    );
}
