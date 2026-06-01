"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { EMBRYOS } from "@/data/embryos";
import { DOADORAS, DOADORAS_CONDICOES, tipoEmbriaoShort } from "@/data/doadoras";
import { Product } from "@/services/products";

const BRONZE = "#A0792E";
const BRONZE_LIGHT = "#D4A85C";
const INK = "#161616";
const FG = "#F5F0E4";

interface EmbrioesClientProps {
    products: Product[];
    visInactiveRegistros?: string[];
    /** RGD → raça do produto (coluna `raca` em `products`) para as doadoras VIS. */
    visRacaByRegistro?: Record<string, string>;
}

function fmtBRL(n: number) {
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}
function fmtDecimal(n: number) {
    return n.toString().replace(".", ",");
}

/* ─────────────────────────────────────────────────────────────
 * Pelagem — critério único de filtragem (Nelore Padrão × Pintado).
 * Fonte da verdade: o campo `raca` do produto no Supabase (coluna
 * `products.raca`, espelhada em `details.raca`, que é o campo
 * editado pelo formulário de admin). "Nelore Pintado" → pintado;
 * qualquer outro valor (ou vazio) → padrão.
 * ───────────────────────────────────────────────────────────── */
type Pelagem = "padrao" | "pintado";

function toPelagem(raca?: string | null): Pelagem {
    return (raca ?? "").toLowerCase().includes("pintad") ? "pintado" : "padrao";
}

const PELAGEM_LABEL: Record<Pelagem, string> = {
    padrao: "Nelore Padrão",
    pintado: "Nelore Pintado",
};

/* ─────────────────────────────────────────────────────────────
 * Modelo unificado de card — uma doadora VIS Safra 2026 e um
 * produto do catálogo geral viram a MESMA forma, pra todos os
 * cards conviverem num grid só.
 * ───────────────────────────────────────────────────────────── */
type CatalogItem = {
    key: string;
    href: string;
    media: string | null;
    isVideo: boolean;
    isYouTube: boolean;
    poster: string | null;
    code: string;
    badge: string;
    origin: "safra" | "catalogo";
    originLabel: string;
    pelagem: Pelagem;
    name: string;
    cruzamento: string | null;
    metrics: { label: string; value: string }[];
    /** Condições do pacote exibidas no card: pacote mínimo, pagamento, localização. */
    specs: { label: string; value: string }[];
    priceCaption: string;
    price: string;
};

function youTubeId(url: string): string {
    if (url.includes("v=")) return url.split("v=")[1].split("&")[0];
    return url.split("/").pop() || "";
}

function safraToItem(
    d: (typeof DOADORAS)[number],
    visRacaByRegistro: Record<string, string>
): CatalogItem {
    return {
        key: `safra-${d.slug}`,
        href: `/embrioes/${d.slug}`,
        media: d.video,
        isVideo: !!d.video,
        isYouTube: false,
        poster: d.foto,
        code: d.rgd,
        badge: d.classificacaoTop,
        origin: "safra",
        originLabel: d.originLabel ?? "Safra 2026 · Nelore Visual",
        pelagem: toPelagem(visRacaByRegistro[d.rgd]),
        name: d.nomeAbcz ?? d.rgd,
        cruzamento: d.cruzamento,
        metrics: [
            { label: "iABCZ", value: fmtDecimal(d.iabcz.valor) },
            { label: "IQG", value: fmtDecimal(d.iqg.valor) },
            { label: "MGTe", value: fmtDecimal(d.mgte.valor) },
        ],
        specs: [
            { label: "Pacote mínimo", value: `${d.quantidadeEmbrioes} embriões ${tipoEmbriaoShort(d)}` },
            { label: "Pagamento", value: d.parcelamentoCardLabel ?? "Até 10× sem juros" },
            { label: "Localização", value: DOADORAS_CONDICOES.municipio },
        ],
        priceCaption: `Por embrião ${tipoEmbriaoShort(d)}`,
        price: fmtBRL(d.precoEmbriao),
    };
}

/** Normaliza a forma de pagamento de um produto do catálogo para exibição. */
function tidyPagamento(raw?: string): string {
    const s = (raw ?? "").trim();
    if (!s) return "Consultar condições";
    if (/^a[_ -]?vista$/i.test(s)) return "À vista";
    return s.replace(/(\d+)\s*x/gi, "$1×");
}

function cleanCatalogName(raw: string): string {
    return (raw || "")
        .replace(/\s*[-–—]\s*pacote.*$/i, "")
        .replace(/^Embri[ãa]o(\s+de)?\s+/i, "")
        .replace(/^Lote(\s+de)?\s+/i, "")
        .trim();
}

/** Forma comum a um produto vindo do Supabase e a um item estático de EMBRYOS. */
type CatalogDetails = {
    registro?: string;
    raca?: string;
    pai?: string;
    iabcz?: string;
    iqg?: string;
    mgte?: string;
    customLink?: string;
};
type CatalogProduct = {
    id: number;
    name: string;
    category?: string;
    classificacao?: string;
    image?: string;
    gallery?: string[];
    price?: string;
    installments?: string;
    forma_pagamento?: string;
    location?: string;
    tag?: string;
    customLink?: string;
    registro?: string;
    raca?: string;
    pai?: string;
    iabcz?: string;
    iqg?: string;
    mgte?: string;
    details?: CatalogDetails | null;
};

function catalogToItem(p: CatalogProduct): CatalogItem {
    const details: CatalogDetails = p.details ?? {};
    const media: string | null = p.image || null;
    const isVideo = typeof media === "string" && media.toLowerCase().endsWith(".mp4");
    const isYouTube =
        typeof media === "string" && (media.includes("youtube.com") || media.includes("youtu.be"));

    const galleryPoster: string | undefined = Array.isArray(p.gallery)
        ? p.gallery.find((g: string) => typeof g === "string" && !g.toLowerCase().endsWith(".mp4"))
        : undefined;
    const poster = isVideo ? galleryPoster ?? media!.replace(/\.mp4$/i, ".jpg") : null;

    const registro = (p.registro || details.registro || "").trim();
    const tag = (p.tag || "").trim();
    const badge =
        tag && tag.toLowerCase() !== "vendido"
            ? tag.toUpperCase()
            : registro
              ? registro.toUpperCase()
              : `FB-PO-${String(p.id).padStart(3, "0")}`;

    const pai = (p.pai || details.pai || "").trim();

    const iabcz = (p.iabcz || details.iabcz || "").trim();
    const iqg = (p.iqg || details.iqg || "").trim();
    const mgte = (p.mgte || details.mgte || "").trim();
    const metrics = [
        iabcz && { label: "iABCZ", value: iabcz },
        iqg && { label: "IQG", value: iqg },
        mgte && { label: "MGTe", value: mgte },
    ].filter(Boolean) as { label: string; value: string }[];

    const pkgMatch = (p.name || "").match(/(\d+)\s*embri/i);
    const priceCaption = pkgMatch ? `Pacote · ${pkgMatch[1]} embriões` : "Embrião VIT";

    const rawPrice = (p.price || "").trim();
    const noPrice = !rawPrice || /^(null|consultar|sob consulta)$/i.test(rawPrice);
    const price = noPrice ? "Sob consulta" : `R$ ${rawPrice}`;

    const pacote = pkgMatch ? `${pkgMatch[1]} embriões` : "Pacote de embriões";
    const pagamento = tidyPagamento(p.forma_pagamento);
    const localizacao = (p.location || "").trim() || "Consultar";

    return {
        key: `catalogo-${p.id}`,
        href: p.customLink || details.customLink || `/lote/${p.id}`,
        media,
        isVideo,
        isYouTube,
        poster,
        code: registro || badge,
        badge,
        origin: "catalogo",
        originLabel: "Catálogo Fórmula do Boi",
        pelagem: toPelagem(p.raca || details.raca),
        name: cleanCatalogName(p.name) || p.name,
        cruzamento: pai ? pai.toUpperCase() : null,
        metrics,
        specs: [
            { label: "Pacote mínimo", value: pacote },
            { label: "Pagamento", value: pagamento },
            { label: "Localização", value: localizacao },
        ],
        priceCaption,
        price,
    };
}

export default function EmbrioesClient({
    products: dbProducts,
    visInactiveRegistros = [],
    visRacaByRegistro = {},
}: EmbrioesClientProps) {
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
            const meta = p as { registro?: string; details?: { registro?: string } | null };
            const reg = meta.registro ?? meta.details?.registro ?? "";
            // VIS doadoras seeded no DB já entram via array DOADORAS — não duplicar.
            if (p.tag === "SAFRA_VIS_2026" || visRegistros.has(reg)) return false;
            return (
                (cat.includes("Embrião") || cat === "DOADORA" || type === "embriao") &&
                !cat.includes("Sêmen")
            );
        });
    }, [dbProducts]);

    // Catálogo único — Safra 2026 (curadoria FdB × Bula) primeiro, catálogo geral na sequência.
    const safraItems = useMemo(
        () => visibleDoadoras.map((d) => safraToItem(d, visRacaByRegistro)),
        [visibleDoadoras, visRacaByRegistro]
    );
    const catalogoItems = useMemo(() => allProducts.map(catalogToItem), [allProducts]);
    const allItems = useMemo(() => [...safraItems, ...catalogoItems], [safraItems, catalogoItems]);

    // Filtro por pelagem — Nelore Padrão (pelo branco) × Nelore Pintado.
    const padraoItems = useMemo(() => allItems.filter((i) => i.pelagem === "padrao"), [allItems]);
    const pintadoItems = useMemo(() => allItems.filter((i) => i.pelagem === "pintado"), [allItems]);

    const [filter, setFilter] = useState<"all" | Pelagem>("all");
    const showFilters = padraoItems.length > 0 && pintadoItems.length > 0;
    const visibleItems =
        filter === "all" ? allItems : allItems.filter((i) => i.pelagem === filter);

    return (
        <main className="min-h-screen" style={{ background: INK }}>
            <Header />

            {/* HERO ────────────────────────────────────────── */}
            <section
                className="relative overflow-hidden flex items-center"
                style={{
                    background: INK,
                    borderBottom: "1px solid rgba(212,168,92,0.18)",
                    minHeight: "clamp(560px, 78vh, 780px)",
                }}
            >
                {/* Vídeo de fundo — pasto Nelore ao entardecer */}
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    poster="/cattle/embrioes-hero-nelore.webp"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    style={{ objectPosition: "center 42%" }}
                >
                    <source
                        src="https://res.cloudinary.com/dny0ibgbn/video/upload/v1780252444/video_de_fundo_jmvezn.mp4"
                        type="video/mp4"
                    />
                </video>
                {/* Véu escuro — garante a legibilidade do texto sobre a foto */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background:
                            "linear-gradient(180deg, rgba(22,22,22,0.88) 0%, rgba(22,22,22,0.50) 34%, rgba(22,22,22,0.56) 58%, rgba(22,22,22,0.94) 100%)",
                    }}
                />
                {/* Brilho bronze no topo — assinatura da marca */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background:
                            "radial-gradient(ellipse at 50% 0%, rgba(212,168,92,0.20) 0%, transparent 58%)",
                    }}
                />
                <div className="container mx-auto px-4 py-20 relative text-center" style={{ maxWidth: 1200 }}>
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
                        Marketplace · Nelore PO · Central de Embriões
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
                            maxWidth: "22ch",
                            textShadow: "0 2px 32px rgba(0,0,0,0.6)",
                        }}
                    >
                        Comece no Nelore PO{" "}
                        <span style={{ color: BRONZE_LIGHT, display: "block" }}>
                            através de embriões.
                        </span>
                    </h1>
                    <p
                        className="mx-auto"
                        style={{
                            color: "rgba(245,240,228,0.86)",
                            fontSize: 18,
                            lineHeight: 1.55,
                            maxWidth: "62ch",
                            letterSpacing: "-0.005em",
                            textShadow: "0 1px 18px rgba(0,0,0,0.7)",
                        }}
                    >
                        Forme um plantel de Nelore PO de elite a partir do embrião — genética
                        de ponta sem o custo de comprar matrizes prontas. Doadoras selecionadas,
                        pedigree autenticado pela ABCZ e rastreabilidade total: pacote mínimo de{" "}
                        {DOADORAS_CONDICOES.pacoteMinimo} unidades, {DOADORAS_CONDICOES.prenhezesGarantidas} prenhezes garantidas em contrato.
                    </p>
                </div>
            </section>

            {/* 01 · CATÁLOGO ÚNICO DE EMBRIÕES ──────────────── */}
            {allItems.length > 0 && (
                <section style={{ background: INK }}>
                    <div className="container mx-auto px-4 py-14 md:py-20" style={{ maxWidth: 1280 }}>
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">
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
                                    01 · Catálogo de embriões
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
                                    Doadoras de elite, pacote por pacote.
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
                                Safra 2026 Nelore Visual e linhagens consagradas FdB —
                                tudo num catálogo só.
                            </p>
                        </div>

                        {/* Filtro de origem + contador */}
                        <div
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
                            style={{
                                paddingBottom: 18,
                                borderBottom: "1px solid rgba(212,168,92,0.14)",
                            }}
                        >
                            {showFilters ? (
                                <div className="flex flex-wrap gap-2">
                                    <FilterChip
                                        active={filter === "all"}
                                        onClick={() => setFilter("all")}
                                        label="Todos"
                                        count={allItems.length}
                                    />
                                    <FilterChip
                                        active={filter === "padrao"}
                                        onClick={() => setFilter("padrao")}
                                        label="Nelore Padrão"
                                        count={padraoItems.length}
                                    />
                                    <FilterChip
                                        active={filter === "pintado"}
                                        onClick={() => setFilter("pintado")}
                                        label="Nelore Pintado"
                                        count={pintadoItems.length}
                                    />
                                </div>
                            ) : (
                                <span />
                            )}
                            <p
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: 11,
                                    letterSpacing: "0.14em",
                                    textTransform: "uppercase",
                                    color: "rgba(245,240,228,0.50)",
                                }}
                            >
                                {visibleItems.length}{" "}
                                {visibleItems.length === 1 ? "doadora" : "doadoras"} no catálogo
                            </p>
                        </div>

                        {/* GRID ÚNICO — todos os cards juntos */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {visibleItems.map((item) => (
                                <EmbriaoCard key={item.key} item={item} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <Footer />

            <style jsx global>{`
                .embriao-card {
                    background: ${INK};
                    border: 1px solid rgba(212, 168, 92, 0.2);
                    transition: border-color 200ms ease, transform 200ms ease, box-shadow 200ms ease;
                }
                .group:hover .embriao-card {
                    border-color: rgba(212, 168, 92, 0.55);
                    transform: translateY(-2px);
                    box-shadow: 0 0 0 1px rgba(212, 168, 92, 0.25), 0 18px 50px rgba(0, 0, 0, 0.55);
                }
                .group:hover .embriao-card .embriao-cta {
                    color: ${FG};
                }
            `}</style>
        </main>
    );
}

/* ─────────────────────────────────────────────────────────────
 * Sub-componentes
 * ───────────────────────────────────────────────────────────── */

function FilterChip({
    active,
    onClick,
    label,
    count,
}: {
    active: boolean;
    onClick: () => void;
    label: string;
    count: number;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 500,
                padding: "8px 14px",
                borderRadius: 2,
                cursor: "pointer",
                transition: "background 150ms ease, border-color 150ms ease, color 150ms ease",
                background: active ? BRONZE : "transparent",
                color: active ? INK : "rgba(245,240,228,0.68)",
                border: `1px solid ${active ? BRONZE : "rgba(212,168,92,0.28)"}`,
            }}
        >
            {label}
            <span style={{ marginLeft: 7, opacity: active ? 0.7 : 0.5 }}>{count}</span>
        </button>
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

function EmbriaoCard({ item }: { item: CatalogItem }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [playing, setPlaying] = useState(false);

    const handleEnter = () => {
        const v = videoRef.current;
        if (v) {
            const p = v.play();
            if (p !== undefined) p.catch(() => {});
            setPlaying(true);
        }
    };
    const handleLeave = () => {
        const v = videoRef.current;
        if (v) {
            v.pause();
            v.currentTime = 0;
            setPlaying(false);
        }
    };

    return (
        <Link
            href={item.href}
            className="group block h-full"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
        >
            <article className="embriao-card card-engraved overflow-hidden h-full flex flex-col">
                {/* Mídia */}
                <div
                    className="relative overflow-hidden"
                    style={{
                        aspectRatio: "16/9",
                        background: `linear-gradient(135deg, ${INK} 0%, #1F1A0E 100%)`,
                        borderBottom: "1px solid rgba(212,168,92,0.18)",
                    }}
                >
                    {item.isVideo && item.media ? (
                        <>
                            <video
                                ref={videoRef}
                                src={`${item.media}#t=0.1`}
                                poster={item.poster || undefined}
                                muted
                                loop
                                playsInline
                                preload="metadata"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                            <div
                                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${playing ? "opacity-0" : "opacity-100"}`}
                            >
                                <div
                                    className="rounded-full p-3"
                                    style={{
                                        background: "rgba(0,0,0,0.4)",
                                        border: "1px solid rgba(212,168,92,0.40)",
                                        backdropFilter: "blur(4px)",
                                    }}
                                >
                                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill={BRONZE_LIGHT}>
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </div>
                        </>
                    ) : item.isYouTube && item.media ? (
                        <img
                            src={`https://img.youtube.com/vi/${youTubeId(item.media)}/hqdefault.jpg`}
                            alt={item.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                    ) : item.media ? (
                        <img
                            src={item.media}
                            alt={item.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <svg
                                width="60"
                                height="60"
                                viewBox="0 0 64 64"
                                fill="none"
                                stroke={BRONZE_LIGHT}
                                strokeWidth="1"
                                style={{ opacity: 0.5, marginBottom: 10 }}
                                aria-hidden
                            >
                                <path d="M14 34c0-8 6-14 14-14h8c8 0 14 6 14 14v8c0 4-3 8-8 8H22c-5 0-8-4-8-8z" />
                                <path d="M22 50v6M42 50v6M28 50v6M36 50v6" />
                                <path d="M14 28l-4-4M50 28l4-4" />
                            </svg>
                            <div
                                className="font-display"
                                style={{
                                    fontSize: 20,
                                    fontWeight: 500,
                                    color: BRONZE_LIGHT,
                                    letterSpacing: "-0.015em",
                                }}
                            >
                                {item.code}
                            </div>
                        </div>
                    )}

                    {/* Badge classificação / registro */}
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
                        {item.badge}
                    </span>

                    {/* Badge de pelagem — espelha o filtro Padrão × Pintado */}
                    <span
                        style={{
                            position: "absolute",
                            top: 12,
                            right: 12,
                            fontFamily: "var(--font-mono)",
                            fontSize: 9,
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            color: BRONZE_LIGHT,
                            background: "rgba(22,22,22,0.72)",
                            border: "1px solid rgba(212,168,92,0.38)",
                            padding: "3px 7px",
                            fontWeight: 500,
                            backdropFilter: "blur(4px)",
                        }}
                    >
                        {PELAGEM_LABEL[item.pelagem]}
                    </span>
                </div>

                {/* Corpo */}
                <div className="p-5 flex flex-col flex-1">
                    {/* Origem — preserva a identidade Safra × Catálogo no grid único */}
                    <div
                        className="inline-flex items-center gap-2 mb-2.5"
                        style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 9.5,
                            letterSpacing: "0.16em",
                            textTransform: "uppercase",
                            color: BRONZE_LIGHT,
                        }}
                    >
                        <span style={{ width: 5, height: 5, background: BRONZE, borderRadius: "50%" }} />
                        {item.originLabel}
                    </div>

                    <div
                        className="font-display mb-1"
                        style={{
                            fontSize: 20,
                            fontWeight: 500,
                            color: FG,
                            letterSpacing: "-0.015em",
                            lineHeight: 1.15,
                        }}
                        title={item.name}
                    >
                        {item.name}
                    </div>
                    <div
                        style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            letterSpacing: "0.16em",
                            textTransform: "uppercase",
                            color: "rgba(245,240,228,0.55)",
                            marginBottom: 14,
                            minHeight: 14,
                        }}
                    >
                        {item.cruzamento ? `× ${item.cruzamento}` : `RGD ${item.code}`}
                    </div>

                    {/* Métricas genéticas */}
                    {item.metrics.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mb-5">
                            {item.metrics.map((m) => (
                                <div key={m.label}>
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
                                        {m.label}
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
                                        {m.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Condições do pacote — pacote mínimo, pagamento e localização */}
                    <div
                        className="flex flex-col gap-2 mb-5"
                        style={{
                            paddingTop: 14,
                            borderTop: "1px solid rgba(212,168,92,0.16)",
                        }}
                    >
                        {item.specs.map((s) => (
                            <CardSpec key={s.label} label={s.label} value={s.value} />
                        ))}
                    </div>

                    {/* Preço + CTA */}
                    <div
                        className="flex items-end justify-between mt-auto"
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
                                {item.priceCaption}
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
                                {item.price}
                            </div>
                        </div>
                        <span
                            className="embriao-cta"
                            style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 10,
                                letterSpacing: "0.16em",
                                textTransform: "uppercase",
                                color: BRONZE_LIGHT,
                                transition: "color 200ms ease",
                                whiteSpace: "nowrap",
                            }}
                        >
                            Ver ficha →
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
}
