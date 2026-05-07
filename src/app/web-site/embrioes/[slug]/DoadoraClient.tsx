"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { type Doadora, DOADORAS_CONDICOES } from "@/data/doadoras";

const BRONZE = "#A0792E";
const BRONZE_LIGHT = "#D4A85C";
const INK = "#0A0A0A";
const INK_2 = "#141414";
const FG = "#F5F0E4";

function fmtBRL(n: number) {
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function fmtDecimal(n: number) {
    return n.toString().replace(".", ",");
}

export default function DoadoraClient({ doadora }: { doadora: Doadora }) {
    const nome = doadora.nomeAbcz ?? doadora.rgd;
    const nomeHero = doadora.nomeAbcz ?? "Nome ABCZ a confirmar";

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
                <div className="container mx-auto px-4 py-14 md:py-20 relative" style={{ maxWidth: 1200 }}>
                    <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 md:gap-14 items-center">
                        {/* Foto / placeholder bronze */}
                        <div
                            className="relative overflow-hidden order-first lg:order-first"
                            style={{
                                aspectRatio: "16/9",
                                background: `linear-gradient(135deg, ${INK} 0%, #1F1A0E 100%)`,
                                border: "1px solid rgba(212,168,92,0.30)",
                                borderRadius: 4,
                            }}
                        >
                            {doadora.foto ? (
                                <img
                                    src={doadora.foto}
                                    alt={`Doadora ${nome} — Nelore PO Fêmea`}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ) : doadora.video ? (
                                <video
                                    src={doadora.video}
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    controls
                                    preload="metadata"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ) : (
                                <DoadoraPlaceholder rgd={doadora.rgd} />
                            )}

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
                                Embrião FIV · Nelore Visual × Fórmula do Boi
                            </div>

                            <h1
                                className="font-display"
                                style={{
                                    fontSize: "clamp(36px, 6vw, 72px)",
                                    fontWeight: 500,
                                    lineHeight: 1.0,
                                    letterSpacing: "-0.025em",
                                    color: FG,
                                    marginBottom: 14,
                                }}
                            >
                                {nomeHero}{" "}
                                <span style={{ color: BRONZE_LIGHT, fontWeight: 400 }}>
                                    × {doadora.cruzamento}
                                </span>
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
                                RGD {doadora.rgd} · {doadora.classificacaoTop} · {DOADORAS_CONDICOES.tipoEmbriao}
                            </div>

                            {/* Métricas — barra de 3 colunas */}
                            <div
                                className="grid grid-cols-3 gap-0 mb-7"
                                style={{
                                    border: "1px solid rgba(212,168,92,0.22)",
                                    borderRadius: 4,
                                    overflow: "hidden",
                                    background: INK_2,
                                }}
                            >
                                <Metric
                                    label="iABCZ"
                                    value={fmtDecimal(doadora.iabcz.valor)}
                                    badge={doadora.iabcz.percentil}
                                />
                                <Metric
                                    label="IQG"
                                    value={fmtDecimal(doadora.iqg.valor)}
                                    badge={doadora.iqg.top}
                                    divider
                                />
                                <Metric
                                    label="MGTe"
                                    value={fmtDecimal(doadora.mgte.valor)}
                                    badge={doadora.mgte.top}
                                    divider
                                />
                            </div>

                            <p
                                style={{
                                    color: "rgba(245,240,228,0.72)",
                                    fontSize: 16,
                                    lineHeight: 1.55,
                                    marginBottom: 22,
                                    maxWidth: "56ch",
                                }}
                            >
                                Doadora da safra Nelore Visual 2026, criada por {DOADORAS_CONDICOES.proprietario}{" "}
                                — {DOADORAS_CONDICOES.fazenda}, {DOADORAS_CONDICOES.municipio}.
                                Embrião VIT, pacote mínimo de {DOADORAS_CONDICOES.pacoteMinimo} unidades com{" "}
                                {DOADORAS_CONDICOES.prenhezesGarantidas} prenhezes garantidas.
                            </p>

                            <div className="flex flex-wrap gap-3">
                                <Link href="/grupo-vip" className="fdb-btn-primary-static">
                                    Solicitar pré-reserva
                                    <span aria-hidden style={{ marginLeft: 6 }}>→</span>
                                </Link>
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
                        Pacote {nome} × {doadora.cruzamento}.
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
                            <DataRow label="Quantidade" value={`${doadora.quantidadeEmbrioes} embriões VIT`} highlight />
                            <DataRow label="Valor por embrião" value={fmtBRL(doadora.precoEmbriao)} />
                            <DataRow label="Total do pacote" value={fmtBRL(doadora.pacoteTotal)} />
                            <DataRow label="Garantia" value={`${DOADORAS_CONDICOES.prenhezesGarantidas} prenhezes confirmadas`} />
                            <DataRow label="Pagamento" value={DOADORAS_CONDICOES.parcelamento} />
                            <DataRow label="Laboratório" value={DOADORAS_CONDICOES.laboratorio} />
                            <DataRow label="Avaliações" value={DOADORAS_CONDICOES.avaliacoesGeneticas.join(" · ")} last />
                        </div>

                        {/* Argumentos Nelore Visual */}
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
                                Por que essa base
                            </div>
                            <ul className="flex flex-col gap-3 mb-8">
                                {DOADORAS_CONDICOES.argumentos.map((arg) => (
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

                            <Link href="/grupo-vip" className="fdb-btn-primary-static">
                                Solicitar proposta
                                <span aria-hidden style={{ marginLeft: 6 }}>→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* GENEALOGIA / PEDIGREE ─────────────────────── */}
            <section>
                <div className="container mx-auto px-4 py-14 md:py-20" style={{ maxWidth: 1100 }}>
                    <SectionLabel>04 · Genealogia & DEPs</SectionLabel>
                    <h2
                        className="font-display mt-5"
                        style={{
                            fontSize: "clamp(28px, 4vw, 48px)",
                            fontWeight: 500,
                            color: FG,
                            letterSpacing: "-0.02em",
                            marginBottom: 14,
                        }}
                    >
                        Pedigree em validação.
                    </h2>
                    <p
                        style={{
                            color: "rgba(245,240,228,0.65)",
                            fontSize: 16,
                            lineHeight: 1.55,
                            marginBottom: 28,
                            maxWidth: "62ch",
                        }}
                    >
                        Os dados completos de pedigree (3 gerações com RGN, MGTe e percentil), reprodução
                        (filhos, partos, IPP, IDUP) e DEPs detalhados (PD-ED, PA-ED, AOL, ACAB, MAR) estão
                        em validação direta na ABCZ. Liberados após confirmação oficial.
                    </p>

                    <div
                        className="card-engraved"
                        style={{
                            background: INK_2,
                            border: "1px solid rgba(212,168,92,0.22)",
                            padding: "26px 24px",
                        }}
                    >
                        <div
                            style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 11,
                                letterSpacing: "0.22em",
                                textTransform: "uppercase",
                                color: BRONZE_LIGHT,
                                marginBottom: 14,
                                fontWeight: 500,
                            }}
                        >
                            ⚠ Pendências identificadas
                        </div>
                        <ul className="flex flex-col gap-2.5">
                            {doadora.pendencias.map((p) => (
                                <li
                                    key={p}
                                    className="flex items-start gap-3"
                                    style={{
                                        color: "rgba(245,240,228,0.78)",
                                        fontSize: 14.5,
                                        lineHeight: 1.5,
                                    }}
                                >
                                    <span
                                        aria-hidden
                                        style={{
                                            display: "inline-block",
                                            width: 8, height: 8,
                                            border: `1px solid ${BRONZE}`,
                                            marginTop: 7,
                                            flexShrink: 0,
                                        }}
                                    />
                                    {p}
                                </li>
                            ))}
                        </ul>
                        {doadora.idAbcz && (
                            <p
                                className="mt-5"
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: 12,
                                    color: "rgba(245,240,228,0.52)",
                                    letterSpacing: "0.06em",
                                }}
                            >
                                Consulta pública ABCZ · ID {doadora.idAbcz}
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* CTA FINAL ───────────────────────────────── */}
            <section
                style={{
                    background: INK,
                    borderTop: "1px solid rgba(212,168,92,0.18)",
                }}
            >
                <div className="container mx-auto px-4 py-14 md:py-20 text-center" style={{ maxWidth: 800 }}>
                    <SectionLabel>05 · Próximo passo</SectionLabel>
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
                        Pré-reserva pelo grupo VIP.
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
                        Curadoria FdB × Bula libera os pacotes para criadores validados antes do catálogo
                        público. Vagas limitadas por safra.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Link href="/grupo-vip" className="fdb-btn-primary-static">
                            Candidatar-me ao grupo VIP
                            <span aria-hidden style={{ marginLeft: 6 }}>→</span>
                        </Link>
                        <Link href="/grupo-vip" className="fdb-btn-ghost-static">
                            Falar com curador
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

function DoadoraPlaceholder({ rgd }: { rgd: string }) {
    return (
        <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ color: BRONZE_LIGHT }}
        >
            {/* Ícone vaca line art */}
            <svg
                width="84"
                height="84"
                viewBox="0 0 64 64"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                style={{ opacity: 0.55, marginBottom: 20 }}
                aria-hidden
            >
                <path d="M14 34c0-8 6-14 14-14h8c8 0 14 6 14 14v8c0 4-3 8-8 8H22c-5 0-8-4-8-8z" />
                <path d="M22 50v6M42 50v6M28 50v6M36 50v6" />
                <path d="M14 28l-4-4M50 28l4-4" />
                <path d="M28 32h.01M36 32h.01" />
                <path d="M30 40c1 1 3 1 4 0" />
            </svg>
            <div
                style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "rgba(212,168,92,0.65)",
                    marginBottom: 6,
                }}
            >
                Foto oficial em validação
            </div>
            <div
                className="font-display"
                style={{
                    fontSize: 28,
                    fontWeight: 500,
                    color: BRONZE_LIGHT,
                    letterSpacing: "-0.015em",
                }}
            >
                {rgd}
            </div>
        </div>
    );
}
