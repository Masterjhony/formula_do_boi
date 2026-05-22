"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const BRONZE = "#A0792E";
const BRONZE_LIGHT = "#D4A85C";
const INK = "#161616";
const INK_2 = "#1f1f1f";
const FG = "#F5F0E4";

type GenealogyNode = { nome?: string; rg?: string } | null | undefined;

interface ProductLike {
    id: number;
    name: string;
    category?: string;
    location?: string;
    image?: string;
    gallery?: string[];
    price?: string;
    installments?: string;
    forma_pagamento?: string;
    tag?: string;
    video_object_position?: string;
    details?: any;
    registro?: string;
    raca?: string;
    nascimento?: string;
    breeder?: string;
    proprietario?: string;
    pdf?: string;
    iabcz?: string;
    mgte?: string;
    iqg?: string;
    genealogia_json?: any;
    avaliacao_genetica_json?: any;
}

function fmtBRL(n: number) {
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function parsePriceToNumber(raw: string | undefined): number | null {
    if (!raw) return null;
    const s = String(raw).trim();
    if (!s || s.toLowerCase() === "consultar") return null;
    let n: number;
    if (s.includes(",") && s.includes(".")) {
        n = parseFloat(s.replace(/\./g, "").replace(",", "."));
    } else if (s.includes(",")) {
        n = parseFloat(s.replace(",", "."));
    } else {
        n = parseFloat(s);
    }
    return Number.isFinite(n) ? n : null;
}

function extractQuantidade(name: string): number | null {
    const m = name.match(/(\d+)\s*EMBRI/i);
    return m ? Number(m[1]) : null;
}

export default function EmbriaoLoteView({ product }: { product: ProductLike }) {
    const isSold = product.tag === "Vendido" || product.details?.status === "Vendido";
    const registro = product.registro || product.details?.registro || "";
    const proprietario = product.breeder || product.proprietario || product.details?.breeder || product.details?.proprietario || "";
    const totalPrice = parsePriceToNumber(product.price);
    const quantidade = extractQuantidade(product.name);
    const unitPrice = totalPrice && quantidade ? totalPrice / quantidade : null;
    const installments = product.installments || product.forma_pagamento || "";
    const formaPagamento = installments
        ? installments.toLowerCase().includes("à vista") || installments.toLowerCase().includes("a vista") || product.forma_pagamento === "a_vista"
            ? "À vista"
            : installments
        : "";

    const whatsappHref = `https://wa.me/5531984143874?text=${encodeURIComponent(
        `Olá, tenho interesse no pacote ${product.name} (ID: ${product.id}). Gostaria de mais informações. Link: https://formuladoboi.com/lote/${product.id}`
    )}`;

    const hasGenealogy = !!product.genealogia_json && (product.genealogia_json.pai || product.genealogia_json.mae);
    const hasAvaliacao = !!product.avaliacao_genetica_json;
    const fichaPdf = product.pdf || product.details?.pdf || "";

    // Map flat genealogia_json -> nested PedigreeNode shape used by the new layout
    const g = product.genealogia_json ?? {};
    const pedigree = hasGenealogy
        ? {
              pai: g.pai
                  ? {
                        nome: g.pai?.nome ?? "—",
                        rg: g.pai?.rg ?? "",
                        pai: g.avo_paterno
                            ? { nome: g.avo_paterno?.nome ?? "—", rg: g.avo_paterno?.rg ?? "", pai: g.bisavo_ppp ?? undefined, mae: g.bisavo_mpp ?? undefined }
                            : undefined,
                        mae: g.avo_paterna
                            ? { nome: g.avo_paterna?.nome ?? "—", rg: g.avo_paterna?.rg ?? "", pai: g.bisavo_pmp ?? undefined, mae: g.bisavo_mmp ?? undefined }
                            : undefined,
                    }
                  : undefined,
              mae: g.mae
                  ? {
                        nome: g.mae?.nome ?? "—",
                        rg: g.mae?.rg ?? "",
                        pai: g.avo_materno
                            ? { nome: g.avo_materno?.nome ?? "—", rg: g.avo_materno?.rg ?? "", pai: g.bisavo_ppm ?? undefined, mae: g.bisavo_mpm ?? undefined }
                            : undefined,
                        mae: g.avo_materna
                            ? { nome: g.avo_materna?.nome ?? "—", rg: g.avo_materna?.rg ?? "", pai: g.bisavo_pmm ?? undefined, mae: g.bisavo_mmm ?? undefined }
                            : undefined,
                    }
                  : undefined,
          }
        : null;

    return (
        <main className="min-h-screen" style={{ background: INK }}>
            <Header />

            {/* HERO ─────────────────────────────────────── */}
            <section
                className="relative overflow-hidden"
                style={{ background: INK, borderBottom: "1px solid rgba(212,168,92,0.18)" }}
            >
                <div
                    className="absolute inset-0 pointer-events-none opacity-50"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at 1px 1px, rgba(232,203,133,0.10) 1px, transparent 0)",
                        backgroundSize: "32px 32px",
                        maskImage: "radial-gradient(ellipse at top, black 0%, transparent 70%)",
                    }}
                />
                <div className="container mx-auto px-4 py-10 md:py-14 relative" style={{ maxWidth: 1400 }}>
                    <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 md:gap-10 items-stretch">
                        {/* Mídia */}
                        <div
                            className="relative overflow-hidden order-first lg:order-first aspect-video lg:aspect-auto lg:h-full lg:min-h-[480px]"
                            style={{
                                background: `linear-gradient(135deg, ${INK} 0%, #1F1A0E 100%)`,
                                border: "1px solid rgba(212,168,92,0.30)",
                                borderRadius: 4,
                            }}
                        >
                            <MediaPlayer product={product} />

                            {[
                                { top: 12, left: 12, bt: 1, bl: 1 },
                                { top: 12, right: 12, bt: 1, br: 1 },
                                { bottom: 12, left: 12, bb: 1, bl: 1 },
                                { bottom: 12, right: 12, bb: 1, br: 1 },
                            ].map((s, i) => (
                                <span
                                    key={i}
                                    aria-hidden
                                    style={{
                                        position: "absolute",
                                        width: 14, height: 14,
                                        borderColor: BRONZE,
                                        borderStyle: "solid",
                                        borderWidth: 0,
                                        borderTopWidth: s.bt ? 1 : 0,
                                        borderBottomWidth: s.bb ? 1 : 0,
                                        borderLeftWidth: s.bl ? 1 : 0,
                                        borderRightWidth: s.br ? 1 : 0,
                                        top: s.top, bottom: s.bottom, left: s.left, right: s.right,
                                        zIndex: 5,
                                    }}
                                />
                            ))}
                        </div>

                        {/* Texto hero */}
                        <div>
                            <div
                                className="inline-flex items-center gap-3 mb-5"
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: 11,
                                    letterSpacing: "0.24em",
                                    textTransform: "uppercase",
                                    color: BRONZE_LIGHT,
                                    fontWeight: 500,
                                }}
                            >
                                <span style={{ width: 24, height: 1, background: BRONZE }} />
                                Embrião FIV · Fórmula do Boi
                            </div>

                            <h1
                                className="font-display"
                                style={{
                                    fontSize: "clamp(32px, 5.5vw, 64px)",
                                    fontWeight: 500,
                                    lineHeight: 1.02,
                                    letterSpacing: "-0.025em",
                                    color: FG,
                                    marginBottom: 14,
                                }}
                            >
                                {product.name}
                            </h1>

                            <div
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: 13,
                                    letterSpacing: "0.16em",
                                    textTransform: "uppercase",
                                    color: "rgba(245,240,228,0.62)",
                                    marginBottom: 28,
                                }}
                            >
                                {registro ? `RGD ${registro}` : `LOTE ${product.id}`}
                                {product.location ? ` · ${product.location}` : ""}
                                {isSold ? " · Vendido" : ""}
                            </div>

                            {/* Métricas — barra de 3 colunas (só renderiza se houver alguma) */}
                            {(product.iabcz || product.iqg || product.mgte) && (
                                <div
                                    className="grid grid-cols-3 gap-0 mb-7"
                                    style={{
                                        border: "1px solid rgba(212,168,92,0.22)",
                                        borderRadius: 4,
                                        overflow: "hidden",
                                        background: INK_2,
                                    }}
                                >
                                    <Metric label="iABCZ" value={product.iabcz || "—"} badge="Índice" />
                                    <Metric label="IQG" value={product.iqg || "—"} badge="Qualidade" divider />
                                    <Metric label="MGTe" value={product.mgte || "—"} badge="Gen. total" divider />
                                </div>
                            )}

                            <p
                                style={{
                                    color: "rgba(245,240,228,0.72)",
                                    fontSize: 16,
                                    lineHeight: 1.55,
                                    marginBottom: 22,
                                    maxWidth: "56ch",
                                }}
                            >
                                Pacote de embriões VIT Nelore PO{proprietario ? `, criação de ${proprietario}` : ""}
                                {product.location ? ` — ${product.location}` : ""}.
                                {product.details?.comentario ? "" : " Genealogia verificada e rastreabilidade total."}
                            </p>

                            <div className="flex flex-wrap gap-3">
                                {!isSold && (
                                    <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="fdb-btn-primary-static">
                                        Fazer proposta
                                        <span aria-hidden style={{ marginLeft: 6 }}>→</span>
                                    </a>
                                )}
                                <Link href="/embrioes" className="fdb-btn-ghost-static">
                                    ← Voltar ao catálogo
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* PACOTE COMERCIAL ─────────────────────────── */}
            <section style={{ background: INK_2, borderBottom: "1px solid rgba(212,168,92,0.10)" }}>
                <div className="container mx-auto px-4 py-14 md:py-20" style={{ maxWidth: 1200 }}>
                    <SectionLabel>03 · Pacote comercial</SectionLabel>
                    <h2
                        className="font-display mt-5"
                        style={{
                            fontSize: "clamp(28px, 4vw, 48px)",
                            fontWeight: 500,
                            color: FG,
                            letterSpacing: "-0.02em",
                            marginBottom: 30,
                            maxWidth: "26ch",
                        }}
                    >
                        Condições do pacote.
                    </h2>

                    <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-10">
                        {/* Tabela de condições */}
                        <div
                            className="card-engraved"
                            style={{
                                background: INK,
                                border: "1px solid rgba(212,168,92,0.22)",
                                padding: 0,
                                overflow: "hidden",
                            }}
                        >
                            {quantidade && (
                                <DataRow label="Quantidade" value={`${quantidade} embriões VIT`} highlight />
                            )}
                            {unitPrice && (
                                <DataRow label="Valor por embrião" value={fmtBRL(unitPrice)} />
                            )}
                            {totalPrice && (
                                <DataRow label="Total do pacote" value={fmtBRL(totalPrice)} />
                            )}
                            {formaPagamento && (
                                <DataRow label="Pagamento" value={formaPagamento} />
                            )}
                            {product.location && (
                                <DataRow label="Localização" value={product.location} />
                            )}
                            {registro && (
                                <DataRow label="Registro" value={registro} />
                            )}
                            <DataRow label="Intermediação" value="Fórmula do Boi" last />
                        </div>

                        {/* Garantias / observações */}
                        <div>
                            <div
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: 11,
                                    letterSpacing: "0.22em",
                                    textTransform: "uppercase",
                                    color: BRONZE_LIGHT,
                                    fontWeight: 500,
                                    marginBottom: 14,
                                }}
                            >
                                Garantias & observações
                            </div>
                            <ul className="flex flex-col gap-3 mb-8">
                                {[
                                    "Embrião VIT (vitrificado) com rastreabilidade até a doadora.",
                                    "Genealogia oficial conforme registro genealógico definitivo (RGD).",
                                    "Frete por conta do comprador. Comissão de 4% para comprador e vendedor.",
                                    "A Fórmula do Boi atua como intermediária e não se responsabiliza pela adimplência entre as partes.",
                                ].map((arg) => (
                                    <li
                                        key={arg}
                                        className="flex items-start gap-3"
                                        style={{
                                            color: "rgba(245,240,228,0.85)",
                                            fontSize: 15,
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        <span
                                            aria-hidden
                                            className="flex-shrink-0"
                                            style={{ width: 10, height: 1, background: BRONZE, marginTop: 11 }}
                                        />
                                        {arg}
                                    </li>
                                ))}
                            </ul>

                            {!isSold && (
                                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="fdb-btn-primary-static">
                                    Solicitar proposta
                                    <span aria-hidden style={{ marginLeft: 6 }}>→</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {product.details?.comentario && (
                        <div
                            className="mt-10 card-engraved"
                            style={{
                                background: INK,
                                border: "1px solid rgba(212,168,92,0.20)",
                                padding: "22px 24px",
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: 11,
                                    letterSpacing: "0.22em",
                                    textTransform: "uppercase",
                                    color: BRONZE_LIGHT,
                                    fontWeight: 500,
                                    marginBottom: 12,
                                }}
                            >
                                Informações adicionais
                            </div>
                            <p
                                style={{
                                    color: "rgba(245,240,228,0.82)",
                                    fontSize: 15.5,
                                    lineHeight: 1.6,
                                    whiteSpace: "pre-line",
                                }}
                            >
                                {product.details.comentario}
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* GENEALOGIA ─────────────────────────── */}
            {pedigree && (
                <section>
                    <div className="container mx-auto px-4 py-14 md:py-20" style={{ maxWidth: 1300 }}>
                        <SectionLabel>04 · Genealogia</SectionLabel>
                        <h2
                            className="font-display mt-5"
                            style={{
                                fontSize: "clamp(28px, 4vw, 48px)",
                                fontWeight: 500,
                                color: FG,
                                letterSpacing: "-0.02em",
                                marginBottom: 14,
                                maxWidth: "22ch",
                            }}
                        >
                            Pedigree de três gerações.
                        </h2>
                        <p
                            style={{
                                color: "rgba(245,240,228,0.65)",
                                fontSize: 16,
                                lineHeight: 1.55,
                                marginBottom: 36,
                                maxWidth: "62ch",
                            }}
                        >
                            Linhagem registrada junto à Associação Brasileira dos Criadores de Zebu (ABCZ){" "}
                            — origem paterna e materna documentadas com RG oficial até a terceira geração (bisavós).
                        </p>

                        <PedigreeCinema
                            pedigree={pedigree}
                            heroName={product.name}
                            rgd={registro}
                            av={product.avaliacao_genetica_json}
                        />

                        {registro && (
                            <p
                                className="mt-8"
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: 11,
                                    letterSpacing: "0.18em",
                                    textTransform: "uppercase",
                                    color: "rgba(245,240,228,0.50)",
                                }}
                            >
                                Consulta pública ABCZ · RGD {registro}
                            </p>
                        )}
                    </div>
                </section>
            )}

            {/* AVALIAÇÃO GENÉTICA ─────────────────────────── */}
            {(hasAvaliacao || fichaPdf) && (
                <AvaliacaoSection
                    av={product.avaliacao_genetica_json}
                    pdf={fichaPdf}
                    rgd={registro}
                />
            )}

            <Footer />

            <style jsx global>{`
                .fdb-btn-primary-static {
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
                .fdb-btn-primary-static:hover {
                    transform: translateY(-1px);
                    background: ${BRONZE_LIGHT};
                }
                .fdb-btn-ghost-static {
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
                .fdb-btn-ghost-static:hover {
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

function MediaPlayer({ product }: { product: ProductLike }) {
    const url = product.image || "";
    const objectPosition = product.video_object_position || "center center";

    if (url.endsWith(".mp4") || url.includes("cloudinary.com")) {
        const src = url.endsWith(".mp4") ? url : url;
        return (
            <video
                src={src}
                autoPlay
                muted
                loop
                playsInline
                controls
                preload="metadata"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition }}
            />
        );
    }
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const videoId = url.includes("v=") ? url.split("v=")[1].split("&")[0] : url.split("/").pop();
        return (
            <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        );
    }
    if (url) {
        return (
            <img
                src={url}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition }}
            />
        );
    }
    return (
        <div className="absolute inset-0 flex items-center justify-center" style={{ color: BRONZE_LIGHT, opacity: 0.5 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase" }}>
                Sem mídia
            </span>
        </div>
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="inline-flex items-center gap-3"
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
            {children}
        </div>
    );
}

function Metric({
    label, value, badge, divider,
}: { label: string; value: string; badge: string; divider?: boolean }) {
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
                    fontSize: "clamp(22px, 2.6vw, 32px)",
                    fontWeight: 500,
                    color: FG,
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                }}
            >
                {value}
            </div>
            <div
                style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.15em",
                    color: "rgba(245,240,228,0.55)",
                    marginTop: 4,
                }}
            >
                {badge}
            </div>
        </div>
    );
}

function DataRow({
    label, value, highlight, last,
}: { label: string; value: string; highlight?: boolean; last?: boolean }) {
    return (
        <div
            className="flex items-baseline justify-between gap-4 px-5 py-4"
            style={{
                borderBottom: last ? undefined : "1px solid rgba(212,168,92,0.12)",
                background: highlight ? "rgba(212,168,92,0.04)" : undefined,
            }}
        >
            <span
                style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "rgba(245,240,228,0.55)",
                    fontWeight: 500,
                }}
            >
                {label}
            </span>
            <span
                style={{
                    color: FG,
                    fontSize: highlight ? 17 : 15,
                    fontWeight: highlight ? 600 : 400,
                    textAlign: "right",
                }}
            >
                {value}
            </span>
        </div>
    );
}

/* ─── Pedigree (cinema mode — espelha as doadoras novas / atacante) ─ */

type PedNode = { nome?: string; rg?: string; pai?: PedNode; mae?: PedNode };

/* Árvore "cinema mode" idêntica à de /embrioes/[slug] e à LP do atacante:
 * card-herói no topo → Pais → Avós, conectados por linhas SVG animadas
 * com reveal sequencial no scroll. Os bisavós (3ª geração) entram como
 * rodapé compacto dentro de cada card de avó. */

function PedigreeCinema({
    pedigree,
    heroName,
    rgd,
    av,
}: {
    pedigree: { pai?: PedNode; mae?: PedNode };
    heroName: string;
    rgd?: string;
    av?: any;
}) {
    const rootRef = useRef<HTMLDivElement>(null);

    // Reveal sequencial quando a árvore entra na viewport (scrollytelling).
    useEffect(() => {
        const el = rootRef.current;
        if (!el) return;
        if (typeof IntersectionObserver === "undefined") {
            el.classList.add("in");
            return;
        }
        const io = new IntersectionObserver(
            (entries) => {
                for (const e of entries) {
                    if (e.isIntersecting) {
                        el.classList.add("in");
                        io.disconnect();
                        break;
                    }
                }
            },
            { threshold: 0.18, rootMargin: "0px 0px -10% 0px" },
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    const iabczVal = av && av.iabcz != null ? String(av.iabcz).replace(".", ",") : null;

    return (
        <div className="pedi-cinema" ref={rootRef}>
            {/* DOADORA — geração 0 */}
            <div className="pedi-cin-row pedi-row-hero">
                <article className="pedi-cin-card hero">
                    <div className="pedi-cin-tag">Doadora</div>
                    <div className="pedi-cin-name font-display">{heroName}</div>
                    <div className="pedi-cin-reg">{rgd ? `RGD ${rgd}` : "Registro pendente"}</div>
                    {iabczVal && (
                        <div className="pedi-cin-metric">
                            <div className="pedi-cin-metric-num font-display">{iabczVal}</div>
                            <div className="pedi-cin-metric-label">
                                iABCZ{av?.deca != null ? ` · DECA ${av.deca}` : ""}
                            </div>
                        </div>
                    )}
                </article>
            </div>

            {/* Conector Doadora → Pais */}
            <svg
                className="pedi-cin-svg pedi-cin-svg-1"
                viewBox="0 0 1000 80"
                preserveAspectRatio="none"
                aria-hidden
            >
                <path className="cin-line" d="M500,0 V40 H180 V80" />
                <path className="cin-line" d="M500,0 V40 H820 V80" />
            </svg>

            {/* PAIS — geração 1 */}
            <div className="pedi-cin-row pedi-row-pais">
                <PedigreeCinCard tier="parent" side="paterno" tag="Pai" node={pedigree.pai} />
                <PedigreeCinCard tier="parent" side="materno" tag="Mãe" node={pedigree.mae} />
            </div>

            {/* Conector Pais → Avós */}
            <svg
                className="pedi-cin-svg pedi-cin-svg-2"
                viewBox="0 0 1000 80"
                preserveAspectRatio="none"
                aria-hidden
            >
                <path className="cin-line" d="M180,0 V40 H80 V80" />
                <path className="cin-line" d="M180,0 V40 H300 V80" />
                <path className="cin-line" d="M820,0 V40 H700 V80" />
                <path className="cin-line" d="M820,0 V40 H920 V80" />
            </svg>

            {/* AVÓS — geração 2 (bisavós no rodapé de cada card) */}
            <div className="pedi-cin-row pedi-row-avos">
                <PedigreeCinCard tier="grand" side="paterno" tag="Avô paterno" node={pedigree.pai?.pai} />
                <PedigreeCinCard tier="grand" side="paterno" tag="Avó paterna" node={pedigree.pai?.mae} />
                <PedigreeCinCard tier="grand" side="materno" tag="Avô materno" node={pedigree.mae?.pai} />
                <PedigreeCinCard tier="grand" side="materno" tag="Avó materna" node={pedigree.mae?.mae} />
            </div>

            <style jsx global>{`
                .pedi-cinema {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: stretch;
                }
                .pedi-cin-row {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    position: relative;
                    z-index: 2;
                }
                .pedi-row-hero {
                    justify-content: center;
                }
                .pedi-row-pais {
                    justify-content: space-between;
                    padding: 0 12%;
                }
                .pedi-row-avos {
                    justify-content: space-between;
                    gap: 14px;
                }

                .pedi-cin-card {
                    position: relative;
                    padding: 20px 22px;
                    background: linear-gradient(
                        180deg,
                        rgba(31, 31, 31, 0.92),
                        rgba(22, 22, 22, 0.85)
                    );
                    border: 1px solid rgba(212, 168, 92, 0.22);
                    border-radius: 4px;
                    min-width: 200px;
                    max-width: 320px;
                    flex: 1;
                    opacity: 0;
                    transform: translateY(24px) scale(0.96);
                    transition: opacity 0.8s ease, transform 0.8s ease,
                        border-color 0.25s ease, background 0.25s ease;
                }
                .pedi-cin-card.hero {
                    min-width: 340px;
                    max-width: 460px;
                    padding: 30px 34px;
                    border: 1px solid ${BRONZE};
                    background: linear-gradient(
                        135deg,
                        rgba(160, 121, 46, 0.16),
                        rgba(31, 31, 31, 0.85)
                    );
                    box-shadow: 0 30px 80px -24px rgba(160, 121, 46, 0.4);
                }
                .pedi-cin-card::before {
                    content: "";
                    position: absolute;
                    inset: 0;
                    border: 1px solid transparent;
                    border-radius: 4px;
                    background: linear-gradient(
                            135deg,
                            ${BRONZE},
                            transparent 50%
                        )
                        border-box;
                    -webkit-mask: linear-gradient(#000 0 0) padding-box,
                        linear-gradient(#000 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    pointer-events: none;
                }
                .pedi-cin-card:hover::before {
                    opacity: 1;
                }
                .pedi-cin-card:hover {
                    border-color: ${BRONZE};
                    background: linear-gradient(
                        180deg,
                        rgba(160, 121, 46, 0.1),
                        rgba(31, 31, 31, 0.85)
                    );
                }

                .pedi-cin-tag {
                    font-family: var(--font-mono);
                    font-size: 9px;
                    letter-spacing: 0.26em;
                    text-transform: uppercase;
                    color: ${BRONZE_LIGHT};
                    font-weight: 600;
                    margin-bottom: 10px;
                }
                .pedi-cin-card.hero .pedi-cin-tag {
                    font-size: 10px;
                    letter-spacing: 0.28em;
                }
                .pedi-cin-name {
                    font-weight: 500;
                    font-size: 17px;
                    color: ${FG};
                    letter-spacing: -0.01em;
                    line-height: 1.22;
                    margin-bottom: 5px;
                    word-break: break-word;
                }
                .pedi-cin-card.hero .pedi-cin-name {
                    font-size: clamp(26px, 3vw, 32px);
                    line-height: 1.05;
                }
                .pedi-cin-reg {
                    font-family: var(--font-mono);
                    font-size: 10px;
                    color: rgba(245, 240, 228, 0.5);
                    letter-spacing: 0.06em;
                }
                .pedi-cin-metric {
                    border-top: 1px solid rgba(212, 168, 92, 0.2);
                    margin-top: 16px;
                    padding-top: 14px;
                }
                .pedi-cin-metric-num {
                    font-weight: 500;
                    font-size: 48px;
                    color: ${BRONZE};
                    line-height: 1;
                    letter-spacing: -0.02em;
                }
                .pedi-cin-metric-label {
                    font-family: var(--font-mono);
                    font-size: 9px;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    color: ${BRONZE_LIGHT};
                    margin-top: 8px;
                    font-weight: 500;
                }

                /* Bisavós — rodapé compacto dentro de cada card de avó */
                .pedi-cin-anc {
                    border-top: 1px solid rgba(212, 168, 92, 0.14);
                    margin-top: 14px;
                    padding-top: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 9px;
                }
                .pedi-cin-anc-tag {
                    display: block;
                    font-family: var(--font-mono);
                    font-size: 8px;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    color: rgba(212, 168, 92, 0.72);
                    font-weight: 600;
                    margin-bottom: 3px;
                }
                .pedi-cin-anc-name {
                    font-size: 12px;
                    color: rgba(245, 240, 228, 0.8);
                    line-height: 1.3;
                }
                .pedi-cin-anc-rg {
                    font-family: var(--font-mono);
                    font-size: 9px;
                    color: rgba(245, 240, 228, 0.42);
                    margin-left: 6px;
                    letter-spacing: 0.04em;
                    white-space: nowrap;
                }

                /* Linhas SVG animadas (stroke-dashoffset) */
                .pedi-cin-svg {
                    width: 100%;
                    height: 72px;
                    display: block;
                    margin: -1px 0;
                    pointer-events: none;
                }
                .pedi-cin-svg .cin-line {
                    fill: none;
                    stroke: ${BRONZE};
                    stroke-width: 1;
                    stroke-linecap: square;
                    stroke-dasharray: 600;
                    stroke-dashoffset: 600;
                    transition: stroke-dashoffset 1.2s ease 0.3s;
                    opacity: 0.85;
                    filter: drop-shadow(0 0 4px rgba(160, 121, 46, 0.4));
                }

                /* Reveal: quando o container entra na viewport */
                .pedi-cinema.in .pedi-cin-card {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
                .pedi-cinema.in .pedi-cin-card.hero {
                    transition-delay: 0.1s;
                }
                .pedi-cinema.in .pedi-row-pais .pedi-cin-card {
                    transition-delay: 0.7s;
                }
                .pedi-cinema.in .pedi-row-avos .pedi-cin-card:nth-child(1) {
                    transition-delay: 1.4s;
                }
                .pedi-cinema.in .pedi-row-avos .pedi-cin-card:nth-child(2) {
                    transition-delay: 1.5s;
                }
                .pedi-cinema.in .pedi-row-avos .pedi-cin-card:nth-child(3) {
                    transition-delay: 1.6s;
                }
                .pedi-cinema.in .pedi-row-avos .pedi-cin-card:nth-child(4) {
                    transition-delay: 1.7s;
                }
                .pedi-cinema.in .pedi-cin-svg-1 .cin-line {
                    stroke-dashoffset: 0;
                    transition-delay: 0.5s;
                }
                .pedi-cinema.in .pedi-cin-svg-2 .cin-line {
                    stroke-dashoffset: 0;
                    transition-delay: 1.1s;
                }

                /* Highlight de linhagem no hover */
                .pedi-cinema:has([data-side="paterno"]:hover)
                    [data-side="materno"],
                .pedi-cinema:has([data-side="materno"]:hover)
                    [data-side="paterno"] {
                    opacity: 0.4;
                    transition: opacity 0.25s ease;
                }

                /* KPIs */
                .pedi-cin-kpis {
                    margin-top: 56px;
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    border: 1px solid rgba(212, 168, 92, 0.22);
                    border-radius: 4px;
                    overflow: hidden;
                    background: linear-gradient(
                        135deg,
                        rgba(160, 121, 46, 0.05),
                        rgba(31, 31, 31, 0.4)
                    );
                }
                .pedi-cin-kpi {
                    padding: 28px 24px;
                    border-right: 1px solid rgba(212, 168, 92, 0.16);
                    text-align: center;
                }
                .pedi-cin-kpi:last-child {
                    border-right: none;
                }
                .pedi-cin-kpi-num {
                    font-weight: 500;
                    font-size: clamp(36px, 4.5vw, 56px);
                    color: ${BRONZE};
                    letter-spacing: -0.02em;
                    line-height: 1;
                }
                .pedi-cin-kpi-num .cents {
                    font-size: 0.55em;
                    color: ${BRONZE_LIGHT};
                }
                .pedi-cin-kpi-label {
                    font-family: var(--font-mono);
                    font-size: 10px;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    color: rgba(245, 240, 228, 0.55);
                    margin-top: 12px;
                    font-weight: 500;
                }

                @media (max-width: 760px) {
                    .pedi-row-pais,
                    .pedi-row-avos {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 10px;
                        padding: 0;
                    }
                    .pedi-cin-card {
                        min-width: 0;
                        max-width: none;
                        width: 100%;
                        padding: 16px 15px;
                    }
                    .pedi-cin-card.hero {
                        min-width: 0;
                        max-width: none;
                        width: 100%;
                        padding: 24px 22px;
                    }
                    .pedi-cin-card.hero .pedi-cin-name {
                        font-size: 24px;
                    }
                    .pedi-cin-card.hero .pedi-cin-metric-num {
                        font-size: 40px;
                    }
                    .pedi-cin-name {
                        font-size: 14px;
                    }
                    .pedi-cin-svg {
                        height: 36px;
                    }
                    .pedi-cin-kpis {
                        grid-template-columns: 1fr;
                    }
                    .pedi-cin-kpi {
                        border-right: none;
                        border-bottom: 1px solid rgba(212, 168, 92, 0.16);
                    }
                    .pedi-cin-kpi:last-child {
                        border-bottom: none;
                    }
                }
            `}</style>
        </div>
    );
}

function PedigreeCinCard({
    tier,
    side,
    tag,
    node,
}: {
    tier: "parent" | "grand";
    side: "paterno" | "materno";
    tag: string;
    node?: PedNode;
}) {
    const showBisavos = tier === "grand" && !!(node?.pai || node?.mae);

    return (
        <article className={`pedi-cin-card ${tier}`} data-side={side}>
            <div className="pedi-cin-tag">{tag}</div>
            <div
                className="pedi-cin-name font-display"
                style={{ color: node ? FG : "rgba(245,240,228,0.32)" }}
            >
                {node?.nome ?? "—"}
            </div>
            <div className="pedi-cin-reg">
                {node?.rg ? `RG ${node.rg}` : "Registro pendente"}
            </div>

            {showBisavos && (
                <div className="pedi-cin-anc">
                    <PedigreeAncLine label="Bisavô" node={node?.pai} />
                    <PedigreeAncLine label="Bisavó" node={node?.mae} />
                </div>
            )}
        </article>
    );
}

function PedigreeAncLine({ label, node }: { label: string; node?: PedNode }) {
    if (!node) return null;
    return (
        <div>
            <span className="pedi-cin-anc-tag">{label}</span>
            <span className="pedi-cin-anc-name">
                {node.nome}
                {node.rg ? <span className="pedi-cin-anc-rg">RG {node.rg}</span> : null}
            </span>
        </div>
    );
}

/* ─── Avaliação Genética ──────────────────────────────────── */

/* Resumo dos índices oficiais + card de download da ficha técnica.
 * A listagem completa de DEPs por característica vive no PDF da ABCZ
 * (mesmo modelo das doadoras novas em /embrioes/[slug]). */

function AvaliacaoSection({ av, pdf, rgd }: { av?: any; pdf?: string; rgd?: string }) {
    if (!pdf) return null;

    return (
        <section
            style={{
                background: INK_2,
                borderTop: "1px solid rgba(212,168,92,0.10)",
                borderBottom: "1px solid rgba(212,168,92,0.10)",
            }}
        >
            <div className="container mx-auto px-4 py-14 md:py-20" style={{ maxWidth: 1300 }}>
                <SectionLabel>05 · Ficha técnica</SectionLabel>
                <h2
                    className="font-display mt-5"
                    style={{
                        fontSize: "clamp(28px, 4vw, 48px)",
                        fontWeight: 500,
                        color: FG,
                        letterSpacing: "-0.02em",
                        marginBottom: 14,
                        maxWidth: "22ch",
                    }}
                >
                    Avaliação genética oficial.
                </h2>
                <p
                    style={{
                        color: "rgba(245,240,228,0.65)",
                        fontSize: 16,
                        lineHeight: 1.55,
                        marginBottom: 36,
                        maxWidth: "62ch",
                    }}
                >
                    Todas as DEPs por característica e a genealogia oficial publicadas pela
                    ABCZ estão reunidas na ficha técnica completa.
                </p>

                <div style={{ maxWidth: 720 }}>
                    <FichaTecnicaDownload href={pdf} corte={av?.corte} rgd={rgd || ""} />
                </div>
            </div>
        </section>
    );
}

/* Card de download da ficha técnica oficial — substitui a listagem
 * detalhada das DEPs. O PDF da ABCZ traz todas as características. */

function FichaTecnicaDownload({
    href,
    corte,
    rgd,
}: {
    href: string;
    corte?: string;
    rgd: string;
}) {
    const fileBase = (rgd || "ficha").trim().replace(/\s+/g, "-") || "ficha";
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            download={`ficha-tecnica-${fileBase}.pdf`}
            className="fdb-ficha-download"
        >
            <span aria-hidden className="fdb-ficha-icon">
                <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                    <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
                    <path d="M12 11v6m-3-3 3 3 3-3" />
                </svg>
            </span>

            <span className="fdb-ficha-text">
                <span className="fdb-ficha-label">Ficha técnica oficial · ABCZ</span>
                <span className="fdb-ficha-title font-display">
                    Avaliação genética completa
                </span>
                <span className="fdb-ficha-meta">
                    Todas as DEPs por característica + genealogia
                    {corte ? ` · corte ${corte}` : ""} · PDF
                </span>
            </span>

            <span className="fdb-ficha-cta">
                Baixar PDF
                <span aria-hidden style={{ marginLeft: 6 }}>↓</span>
            </span>

            <style jsx global>{`
                .fdb-ficha-download {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    padding: 22px 24px;
                    background: ${INK};
                    border: 1px solid rgba(212, 168, 92, 0.28);
                    border-radius: 4px;
                    text-decoration: none;
                    transition: border-color 160ms ease, background 160ms ease,
                        transform 160ms ease;
                }
                .fdb-ficha-download:hover {
                    border-color: ${BRONZE};
                    background: rgba(212, 168, 92, 0.05);
                    transform: translateY(-1px);
                }
                .fdb-ficha-icon {
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 58px;
                    height: 58px;
                    border: 1px solid rgba(212, 168, 92, 0.35);
                    border-radius: 4px;
                    color: ${BRONZE_LIGHT};
                    background: rgba(212, 168, 92, 0.06);
                }
                .fdb-ficha-text {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    flex: 1;
                    min-width: 0;
                }
                .fdb-ficha-label {
                    font-family: var(--font-mono);
                    font-size: 10px;
                    letter-spacing: 0.22em;
                    text-transform: uppercase;
                    color: ${BRONZE_LIGHT};
                    font-weight: 500;
                }
                .fdb-ficha-title {
                    font-size: clamp(19px, 2.4vw, 24px);
                    font-weight: 500;
                    color: ${FG};
                    letter-spacing: -0.015em;
                    line-height: 1.15;
                }
                .fdb-ficha-meta {
                    font-size: 13px;
                    color: rgba(245, 240, 228, 0.58);
                    line-height: 1.4;
                }
                .fdb-ficha-cta {
                    flex-shrink: 0;
                    display: inline-flex;
                    align-items: center;
                    background: ${BRONZE};
                    color: ${INK};
                    padding: 12px 22px;
                    border-radius: 2px;
                    font-family: var(--font-mono);
                    font-size: 12px;
                    font-weight: 600;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    transition: background 150ms ease;
                }
                .fdb-ficha-download:hover .fdb-ficha-cta {
                    background: ${BRONZE_LIGHT};
                }
                @media (max-width: 640px) {
                    .fdb-ficha-download {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 16px;
                    }
                    .fdb-ficha-cta {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>
        </a>
    );
}
