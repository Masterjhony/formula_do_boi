"use client";

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

function fmtDep(n: number | null | undefined) {
    if (n === null || n === undefined) return "—";
    const abs = Math.abs(n);
    const s = abs % 1 === 0 ? abs.toString() : abs.toFixed(2).replace(".", ",");
    return n > 0 ? `+${s}` : n < 0 ? `-${s}` : s;
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
                            {product.pdf || product.details?.pdf ? (
                                <a
                                    href={product.pdf || product.details?.pdf}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="fdb-btn-ghost-static"
                                    style={{ marginLeft: 8 }}
                                >
                                    Baixar ficha técnica
                                </a>
                            ) : null}
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

                        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
                            {pedigree.pai && <PedigreeBranch side="paterna" root={pedigree.pai} />}
                            {pedigree.mae && <PedigreeBranch side="materna" root={pedigree.mae} />}
                        </div>

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
            {hasAvaliacao && (
                <AvaliacaoSection av={product.avaliacao_genetica_json} />
            )}

            {/* CTA FINAL ───────────────────────────────── */}
            <section
                style={{
                    background: INK,
                    borderTop: "1px solid rgba(212,168,92,0.18)",
                }}
            >
                <div className="container mx-auto px-4 py-14 md:py-20 text-center" style={{ maxWidth: 800 }}>
                    <SectionLabel>{hasAvaliacao ? "06" : pedigree ? "05" : "04"} · Próximo passo</SectionLabel>
                    <h2
                        className="font-display mt-5"
                        style={{
                            fontSize: "clamp(32px, 5vw, 56px)",
                            fontWeight: 500,
                            color: FG,
                            letterSpacing: "-0.025em",
                            marginBottom: 18,
                        }}
                    >
                        Falar com o curador.
                    </h2>
                    <p
                        style={{
                            color: "rgba(245,240,228,0.72)",
                            fontSize: 16,
                            lineHeight: 1.55,
                            marginBottom: 28,
                            maxWidth: "52ch",
                            margin: "0 auto 28px",
                        }}
                    >
                        Conduzimos a negociação direto com o vendedor. Frete, comissão e fluxo de pagamento
                        ficam por nossa conta — você fala com quem entende da genética.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {!isSold && (
                            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="fdb-btn-primary-static">
                                Fazer proposta
                                <span aria-hidden style={{ marginLeft: 6 }}>→</span>
                            </a>
                        )}
                        <Link href="/grupo-vip" className="fdb-btn-ghost-static">
                            Entrar no grupo VIP
                        </Link>
                    </div>
                </div>
            </section>

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

/* ─── Pedigree ─────────────────────────────────────────────── */

type PedNode = { nome?: string; rg?: string; pai?: PedNode; mae?: PedNode };

function PedigreeBranch({ side, root }: { side: "paterna" | "materna"; root: PedNode }) {
    const isPaterna = side === "paterna";
    const headerLabel = isPaterna ? "Origem paterna" : "Origem materna";
    const rootLabel = isPaterna ? "Pai" : "Mãe";
    const avoLabel = isPaterna ? "Avô paterno" : "Avô materno";
    const avoaLabel = isPaterna ? "Avó paterna" : "Avó materna";

    return (
        <div
            className="card-engraved relative"
            style={{
                background: INK_2,
                border: "1px solid rgba(212,168,92,0.22)",
                overflow: "hidden",
            }}
        >
            <div
                className="px-5 py-3"
                style={{
                    borderBottom: "1px solid rgba(212,168,92,0.18)",
                    background: "rgba(212,168,92,0.04)",
                }}
            >
                <div
                    style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: BRONZE_LIGHT,
                        fontWeight: 600,
                    }}
                >
                    {headerLabel}
                </div>
            </div>

            <PedigreeRowCard tier="parent" tierLabel={rootLabel} node={root} />

            <div
                className="grid grid-cols-2"
                style={{ borderTop: "1px solid rgba(212,168,92,0.12)" }}
            >
                <PedigreeRowCard tier="grand" tierLabel={avoLabel} node={root.pai} />
                <PedigreeRowCard tier="grand" tierLabel={avoaLabel} node={root.mae} leftBorder />
            </div>

            <div
                className="grid grid-cols-2 md:grid-cols-4"
                style={{ borderTop: "1px solid rgba(212,168,92,0.12)" }}
            >
                <PedigreeRowCard tier="great" tierLabel="Bisavô" node={root.pai?.pai} />
                <PedigreeRowCard tier="great" tierLabel="Bisavó" node={root.pai?.mae} leftBorder />
                <PedigreeRowCard tier="great" tierLabel="Bisavô" node={root.mae?.pai} leftBorder />
                <PedigreeRowCard tier="great" tierLabel="Bisavó" node={root.mae?.mae} leftBorder />
            </div>
        </div>
    );
}

function PedigreeRowCard({
    tier, tierLabel, node, leftBorder,
}: {
    tier: "parent" | "grand" | "great";
    tierLabel: string;
    node?: PedNode;
    leftBorder?: boolean;
}) {
    const isParent = tier === "parent";
    const isGreat = tier === "great";

    const padX = isParent ? "px-5" : isGreat ? "px-3.5" : "px-4";
    const padY = isParent ? "py-5" : isGreat ? "py-3.5" : "py-4";

    const labelColor = isParent ? BRONZE_LIGHT : "rgba(212,168,92,0.78)";
    const nameSize = isParent ? "clamp(20px, 2vw, 26px)" : isGreat ? 13 : 16;
    const nameColor = node?.nome ? FG : "rgba(245,240,228,0.32)";
    const rgSize = isParent ? 12 : isGreat ? 10 : 11;

    return (
        <div
            className={`${padX} ${padY}`}
            style={{
                borderLeft: leftBorder ? "1px solid rgba(212,168,92,0.12)" : undefined,
                background: isParent ? "rgba(212,168,92,0.03)" : undefined,
            }}
        >
            <div
                style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: isGreat ? 9 : 10,
                    letterSpacing: "0.20em",
                    textTransform: "uppercase",
                    color: labelColor,
                    fontWeight: 500,
                    marginBottom: isParent ? 8 : 5,
                }}
            >
                {tierLabel}
            </div>
            <div
                className={isParent ? "font-display" : undefined}
                style={{
                    fontSize: nameSize,
                    fontWeight: isParent ? 500 : 400,
                    color: nameColor,
                    letterSpacing: isParent ? "-0.015em" : 0,
                    lineHeight: isParent ? 1.1 : 1.25,
                    wordBreak: "break-word",
                }}
            >
                {node?.nome ?? "—"}
            </div>
            <div
                style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: rgSize,
                    letterSpacing: "0.08em",
                    color: "rgba(245,240,228,0.45)",
                    marginTop: 4,
                }}
            >
                {node?.rg ? `RG ${node.rg}` : ""}
            </div>
        </div>
    );
}

/* ─── Avaliação Genética ──────────────────────────────────── */

function AvaliacaoSection({ av }: { av: any }) {
    const composem = av.composem_iabcz ?? av.caracteristicas ?? {};
    const naoComposem = av.nao_composem_iabcz ?? {};
    const catOrder = ["crescimento", "maternas", "reprodutivas", "acabamento", "carcaca", "morfologicas"];
    const catsCompoem = catOrder.filter((k) => (composem[k]?.length ?? 0) > 0);
    const catsNaoComp = catOrder.filter((k) => (naoComposem[k]?.length ?? 0) > 0);
    const hasTopMetrics = av.iabcz != null || av.deca != null || av.percentil != null || av.f != null;

    if (!hasTopMetrics && catsCompoem.length === 0 && catsNaoComp.length === 0) return null;

    return (
        <section
            style={{
                background: INK_2,
                borderTop: "1px solid rgba(212,168,92,0.10)",
                borderBottom: "1px solid rgba(212,168,92,0.10)",
            }}
        >
            <div className="container mx-auto px-4 py-14 md:py-20" style={{ maxWidth: 1300 }}>
                <SectionLabel>05 · Avaliação genética ABCZ{av.corte ? ` · Corte ${av.corte}` : ""}</SectionLabel>
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
                    Diferenças esperadas na progênie.
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
                    DEPs oficiais publicadas pela ABCZ. Cada característica vem acompanhada de acurácia (AC) e decil dentro da raça (DECA).
                </p>

                {hasTopMetrics && (
                    <div
                        className="grid grid-cols-2 lg:grid-cols-4 gap-0"
                        style={{
                            border: "1px solid rgba(212,168,92,0.22)",
                            borderRadius: 4,
                            overflow: "hidden",
                            background: INK,
                        }}
                    >
                        <Metric label="iABCZ" value={av.iabcz != null ? String(av.iabcz).replace(".", ",") : "—"} badge={av.corte ? `Corte ABCZ ${av.corte}` : "Índice geral"} />
                        <Metric label="DECA" value={av.deca != null ? String(av.deca) : "—"} badge="Decil da raça" divider />
                        <Metric label="P%" value={av.percentil != null ? String(av.percentil) : "—"} badge="Percentil populacional" divider />
                        <Metric label="F (endogamia)" value={av.f != null ? `${String(av.f).replace(".", ",")}%` : "—"} badge="Coef. endogamia" divider />
                    </div>
                )}

                {catsCompoem.length > 0 && (
                    <div className="mt-10">
                        <GroupSubheader>Características que compõem o iABCZ</GroupSubheader>
                        {catsCompoem.map((k) => (
                            <DepGroup key={k} title={catLabel(k)} rows={composem[k]} />
                        ))}
                    </div>
                )}

                {catsNaoComp.length > 0 && (
                    <div className="mt-10">
                        <GroupSubheader>Características que não compõem o iABCZ</GroupSubheader>
                        {catsNaoComp.map((k) => (
                            <DepGroup key={k} title={catLabel(k)} rows={naoComposem[k]} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

function catLabel(k: string): string {
    const m: Record<string, string> = {
        crescimento: "Crescimento",
        maternas: "Maternas",
        reprodutivas: "Reprodutivas",
        acabamento: "Acabamento",
        carcaca: "Carcaça",
        morfologicas: "Morfológicas",
    };
    return m[k] ?? k;
}

function GroupSubheader({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="mb-4"
            style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: BRONZE_LIGHT,
                fontWeight: 600,
                paddingBottom: 8,
                borderBottom: "1px solid rgba(212,168,92,0.18)",
            }}
        >
            {children}
        </div>
    );
}

function DepGroup({ title, rows }: { title: string; rows: any[] }) {
    if (!rows || rows.length === 0) return null;
    return (
        <div className="mb-6">
            <div
                style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.24em",
                    textTransform: "uppercase",
                    color: "rgba(245,240,228,0.55)",
                    fontWeight: 500,
                    marginBottom: 10,
                }}
            >
                {title}
            </div>
            <div
                className="card-engraved"
                style={{
                    background: INK,
                    border: "1px solid rgba(212,168,92,0.16)",
                    overflow: "hidden",
                }}
            >
                {rows.map((r: any, i: number) => (
                    <DepRow key={i} row={r} last={i === rows.length - 1} />
                ))}
            </div>
        </div>
    );
}

function DepRow({ row, last }: { row: any; last?: boolean }) {
    const dep: number | null = row.dep ?? null;
    const ac: number | null = row.ac ?? null;
    const deca: number | null = row.deca ?? null;
    const decaIsTop = deca !== null && deca <= 2;
    const decaColor =
        deca === 1 ? BRONZE_LIGHT : decaIsTop ? "rgba(212,168,92,0.78)" : "rgba(245,240,228,0.55)";
    const depColor = dep != null && dep >= 0 ? FG : "rgba(245,240,228,0.85)";
    const label = row.nome ?? row.label ?? row.code ?? "—";
    const code = row.code ?? "";
    const unit = row.unit ?? "";

    return (
        <div
            className="grid grid-cols-[1fr_auto] items-center gap-4 sm:gap-6 px-4 sm:px-5 py-3.5"
            style={{
                borderBottom: last ? undefined : "1px solid rgba(212,168,92,0.10)",
            }}
        >
            <div className="min-w-0">
                <div className="flex items-baseline gap-3 flex-wrap">
                    {code && (
                        <span
                            style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 11,
                                color: BRONZE_LIGHT,
                                fontWeight: 600,
                                letterSpacing: "0.10em",
                                flexShrink: 0,
                            }}
                        >
                            {code}
                        </span>
                    )}
                    <span
                        style={{
                            color: "rgba(245,240,228,0.82)",
                            fontSize: 13.5,
                            lineHeight: 1.3,
                        }}
                    >
                        {label}
                    </span>
                </div>
                <div
                    className="flex flex-wrap gap-x-4 gap-y-1 mt-2"
                    style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        letterSpacing: "0.10em",
                        color: "rgba(245,240,228,0.50)",
                    }}
                >
                    {ac != null && <span>AC {ac}%</span>}
                    {deca != null && <span style={{ color: decaColor, fontWeight: 600 }}>DECA {deca}</span>}
                </div>
            </div>

            <div className="text-right whitespace-nowrap">
                <span
                    className="font-display"
                    style={{
                        fontSize: "clamp(20px, 2.2vw, 26px)",
                        color: depColor,
                        fontWeight: 500,
                        letterSpacing: "-0.01em",
                    }}
                >
                    {fmtDep(dep)}
                </span>
                {unit && (
                    <span
                        style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            color: "rgba(245,240,228,0.50)",
                            marginLeft: 5,
                            letterSpacing: "0.06em",
                        }}
                    >
                        {unit}
                    </span>
                )}
            </div>
        </div>
    );
}
