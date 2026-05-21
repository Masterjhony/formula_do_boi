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
    visInactiveRegistros?: string[];
}

function fmtBRL(n: number) {
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}
function fmtDecimal(n: number) {
    return n.toString().replace(".", ",");
}

export default function EmbrioesClient({ products: dbProducts, visInactiveRegistros = [] }: EmbrioesClientProps) {
    const visInactiveSet = useMemo(() => new Set(visInactiveRegistros), [visInactiveRegistros]);
    const visibleDoadoras = useMemo(
        () => DOADORAS.filter((d) => !visInactiveSet.has(d.rgd)),
        [visInactiveSet]
    );

    const allProducts = useMemo(() => {
        const dbIds = new Set(dbProducts.map((p) => p.id));
        const staticKeep = EMBRYOS.filter((e) => !dbIds.has(e.id));
        const visRegistros = new Set(DOADORAS.map((d) => d.rgd));
        return [...dbProducts, ...staticKeep].filter((p) => {
            const cat = p.category || "";
            const type = p.classificacao || "";
            const reg = (p as any).registro ?? (p as any).details?.registro ?? "";
            // VIS doadoras seeded in DB já aparecem na seção "Safra 2026" acima
            // (renderizada do array DOADORAS) — não duplicar no catálogo geral.
            if (p.tag === "SAFRA_VIS_2026" || visRegistros.has(reg)) return false;
            return (
                (cat.includes("Embrião") || cat === "DOADORA" || type === "embriao") &&
                !cat.includes("Sêmen")
            );
        });
    }, [dbProducts]);

    // Soma toda doadora exibida na página: cards da Safra (DOADORAS visíveis)
    // + cards do catálogo geral (Supabase + EMBRYOS estáticos). Cresce sozinho
    // quando admin adiciona produto novo.
    const totalDoadorasDisponiveis = visibleDoadoras.length + allProducts.length;

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
                <div
                    className="absolute inset-0 pointer-events-none opacity-50"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at 1px 1px, rgba(232,203,133,0.10) 1px, transparent 0)",
                        backgroundSize: "32px 32px",
                        maskImage: "radial-gradient(ellipse at top, black 0%, transparent 70%)",
                    }}
                />
                <div className="container mx-auto px-4 pt-20 pb-14 relative text-center" style={{ maxWidth: 1200 }}>
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
                        Marketplace · Embriões FIV · Central de Embriões
                    </div>
                    <h1
                        className="font-display mx-auto"
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
                        className="mx-auto"
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

                    {/* Stats strip */}
                    <div
                        className="mt-12 mx-auto grid grid-cols-3 gap-0"
                        style={{
                            maxWidth: 760,
                            border: "1px solid rgba(212,168,92,0.22)",
                            borderRadius: 4,
                            overflow: "hidden",
                            background: INK_2,
                        }}
                    >
                        <HeroStat label="Doadoras disponíveis" value={String(totalDoadorasDisponiveis)} />
                        <HeroStat label="Pacote mínimo" value={`${DOADORAS_CONDICOES.pacoteMinimo} embriões`} divider />
                        <HeroStat
                            label="Prenhezes garantidas"
                            value={`${DOADORAS_CONDICOES.prenhezesGarantidas} por pacote`}
                            divider
                        />
                    </div>
                </div>
            </section>

            {/* 01 · GARANTIAS / COMO FUNCIONA ──────────────── */}
            <section
                style={{
                    background: INK_2,
                    borderBottom: "1px solid rgba(212,168,92,0.10)",
                }}
            >
                <div className="container mx-auto px-4 py-14 md:py-20" style={{ maxWidth: 1280 }}>
                    <div className="grid md:grid-cols-[0.9fr_1.1fr] gap-10 md:gap-14 items-start">
                        {/* Coluna esquerda — label + headline + texto */}
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
                                01 · Curadoria & garantias
                            </div>
                            <h2
                                className="font-display"
                                style={{
                                    fontSize: "clamp(28px, 4vw, 48px)",
                                    fontWeight: 500,
                                    color: FG,
                                    letterSpacing: "-0.02em",
                                    marginBottom: 18,
                                    maxWidth: "22ch",
                                }}
                            >
                                Genética <span style={{ color: BRONZE_LIGHT }}>auditável</span>, prenhez garantida.
                            </h2>
                            <p
                                style={{
                                    color: "rgba(245,240,228,0.72)",
                                    fontSize: 16,
                                    lineHeight: 1.6,
                                    marginBottom: 18,
                                    maxWidth: "52ch",
                                }}
                            >
                                Cada cruzamento aqui foi desenhado em conjunto entre o time
                                Fórmula do Boi e a Bula Remates. Pedigree validado pela ABCZ
                                até a terceira geração, embrião VIT com lote identificado.
                            </p>
                            <p
                                style={{
                                    color: "rgba(245,240,228,0.62)",
                                    fontSize: 15,
                                    lineHeight: 1.6,
                                    maxWidth: "52ch",
                                }}
                            >
                                Pacote mínimo de {DOADORAS_CONDICOES.pacoteMinimo} unidades com{" "}
                                {DOADORAS_CONDICOES.prenhezesGarantidas} prenhezes confirmadas —
                                {DOADORAS_CONDICOES.parcelamento.toLowerCase()}.
                            </p>
                        </div>

                        {/* Coluna direita — três pilares numerados */}
                        <div
                            className="card-engraved"
                            style={{
                                background: INK,
                                border: "1px solid rgba(212,168,92,0.22)",
                                overflow: "hidden",
                            }}
                        >
                            <PilarRow
                                index="I"
                                title="Pedigree validado pela ABCZ"
                                text="Origem paterna e materna documentadas com RG oficial para cada ancestral até a terceira geração. Avaliação genética por corte ABCZ disponível na ficha."
                            />
                            <PilarRow
                                index="II"
                                title="Embrião VIT com rastreabilidade"
                                text="Vitrificação em laboratório acreditado e identificação por lote — você sabe exatamente qual doadora produziu cada embrião do seu pacote."
                                divider
                            />
                            <PilarRow
                                index="III"
                                title={`${DOADORAS_CONDICOES.prenhezesGarantidas} prenhezes garantidas`}
                                text={`Cada pacote de ${DOADORAS_CONDICOES.pacoteMinimo} embriões vem com garantia contratual de ${DOADORAS_CONDICOES.prenhezesGarantidas} prenhezes confirmadas — risco coberto pela curadoria, não pelo comprador.`}
                                divider
                                last
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* SAFRA NELORE VISUAL 2026 ───────────────────── */}
            {visibleDoadoras.length > 0 && (
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
                                02 · Safra 2026 · Nelore Visual × FdB
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
                                Doadoras de elite. {DOADORAS_CONDICOES.fazenda}, {DOADORAS_CONDICOES.municipio}.
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
                        {visibleDoadoras.map((d) => {
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
                                                aspectRatio: "16/9",
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
                                                    className="absolute inset-0 w-full h-full object-cover"
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

                                            {/* Condições do pacote */}
                                            <div
                                                className="flex flex-col gap-2 mb-5"
                                                style={{
                                                    paddingTop: 14,
                                                    borderTop: "1px solid rgba(212,168,92,0.16)",
                                                }}
                                            >
                                                <CardSpec
                                                    label="Pacote mínimo"
                                                    value={`${DOADORAS_CONDICOES.pacoteMinimo} embriões VIT`}
                                                />
                                                <CardSpec label="Pagamento" value="Até 10× sem juros" />
                                                <CardSpec
                                                    label="Localização"
                                                    value={DOADORAS_CONDICOES.municipio}
                                                />
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
            )}

            {/* CATÁLOGO GERAL (Supabase + EMBRYOS estáticos) ── */}
            {allProducts.length > 0 && (
                <section style={{ background: INK }}>
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
                                    03 · Outras doadoras · catálogo geral
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
                                    Doadoras consagradas no rebanho FdB.
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
                                Linhagens já provadas em campo, com produção comercial e
                                histórico de progênies registradas.
                            </p>
                        </div>
                        <CatalogGrid
                            products={allProducts}
                            totalCount={allProducts.length}
                            onClearFilters={() => {}}
                            hasFilters={false}
                            theme="premium"
                            cardVariant="premium-genetic"
                        />
                    </div>
                </section>
            )}

            {/* 04 · CTA FINAL ──────────────────────────────── */}
            <section
                style={{
                    background: INK_2,
                    borderTop: "1px solid rgba(212,168,92,0.18)",
                }}
            >
                <div className="container mx-auto px-4 py-14 md:py-20 text-center" style={{ maxWidth: 800 }}>
                    <div
                        className="inline-flex items-center gap-3 mb-5"
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
                        04 · Próximo passo
                    </div>
                    <h2
                        className="font-display"
                        style={{
                            fontSize: "clamp(32px, 5vw, 56px)",
                            fontWeight: 500,
                            color: FG,
                            letterSpacing: "-0.025em",
                            marginBottom: 18,
                        }}
                    >
                        Pré-reserva pelo grupo VIP.
                    </h2>
                    <p
                        className="mx-auto"
                        style={{
                            color: "rgba(245,240,228,0.72)",
                            fontSize: 16,
                            lineHeight: 1.55,
                            marginBottom: 28,
                            maxWidth: "52ch",
                        }}
                    >
                        Curadoria FdB × Bula libera os pacotes para criadores validados antes do
                        catálogo público. Vagas limitadas por safra.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Link href="/grupo-vip" className="fdb-btn-primary-embrioes">
                            Candidatar-me ao grupo VIP
                            <span aria-hidden style={{ marginLeft: 6 }}>→</span>
                        </Link>
                        <Link href="/grupo-vip" className="fdb-btn-ghost-embrioes">
                            Falar com curador
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />

            <style jsx global>{`
                .fdb-btn-primary-embrioes {
                    display: inline-flex; align-items: center; justify-content: center;
                    background: ${BRONZE};
                    color: ${INK};
                    padding: 14px 26px;
                    border-radius: 2px;
                    font-family: var(--font-mono);
                    font-size: 12px;
                    font-weight: 600;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    transition: transform 150ms ease, background 150ms ease;
                    box-shadow: 0 0 0 1px rgba(212,168,92,0.35), 0 0 60px rgba(212,168,92,0.18);
                    text-decoration: none;
                }
                .fdb-btn-primary-embrioes:hover {
                    transform: translateY(-1px);
                    background: ${BRONZE_LIGHT};
                }
                .fdb-btn-ghost-embrioes {
                    display: inline-flex; align-items: center; justify-content: center;
                    background: transparent;
                    color: ${BRONZE_LIGHT};
                    padding: 14px 26px;
                    border: 1px solid rgba(212,168,92,0.40);
                    border-radius: 2px;
                    font-family: var(--font-mono);
                    font-size: 12px;
                    font-weight: 500;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    text-decoration: none;
                    transition: border-color 150ms ease, color 150ms ease;
                }
                .fdb-btn-ghost-embrioes:hover {
                    border-color: ${BRONZE_LIGHT};
                    color: ${FG};
                }
            `}</style>
        </main>
    );
}

/* ─────────────────────────────────────────────────────────────
 * Sub-componentes
 * ───────────────────────────────────────────────────────────── */

function HeroStat({ label, value, divider }: { label: string; value: string; divider?: boolean }) {
    return (
        <div
            className="px-4 py-5"
            style={{
                borderLeft: divider ? "1px solid rgba(212,168,92,0.16)" : undefined,
            }}
        >
            <div
                style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.20em",
                    textTransform: "uppercase",
                    color: BRONZE_LIGHT,
                    fontWeight: 500,
                    marginBottom: 6,
                }}
            >
                {label}
            </div>
            <div
                className="font-display"
                style={{
                    fontSize: "clamp(20px, 2.4vw, 28px)",
                    fontWeight: 500,
                    color: FG,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.05,
                }}
            >
                {value}
            </div>
        </div>
    );
}

function CardSpec({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-baseline justify-between gap-3">
            <span
                style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9.5,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "rgba(245,240,228,0.50)",
                    flexShrink: 0,
                }}
            >
                {label}
            </span>
            <span
                style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11.5,
                    color: "rgba(245,240,228,0.85)",
                    textAlign: "right",
                    letterSpacing: "0.02em",
                }}
            >
                {value}
            </span>
        </div>
    );
}

function PilarRow({
    index,
    title,
    text,
    divider,
}: {
    index: string;
    title: string;
    text: string;
    divider?: boolean;
    last?: boolean;
}) {
    return (
        <div
            className="grid grid-cols-[auto_1fr] gap-5 px-6 py-6"
            style={{
                borderTop: divider ? "1px solid rgba(212,168,92,0.14)" : undefined,
            }}
        >
            <div
                className="font-display"
                style={{
                    fontSize: 28,
                    color: BRONZE_LIGHT,
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    fontWeight: 500,
                    minWidth: 36,
                }}
            >
                {index}
            </div>
            <div>
                <div
                    className="font-display"
                    style={{
                        fontSize: 18,
                        fontWeight: 500,
                        color: FG,
                        letterSpacing: "-0.015em",
                        marginBottom: 6,
                    }}
                >
                    {title}
                </div>
                <p
                    style={{
                        color: "rgba(245,240,228,0.72)",
                        fontSize: 14.5,
                        lineHeight: 1.55,
                    }}
                >
                    {text}
                </p>
            </div>
        </div>
    );
}
