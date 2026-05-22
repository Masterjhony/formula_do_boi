"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
    type Doadora,
    type PedigreeNode,
    type Avaliacao,
    DOADORAS_CONDICOES,
} from "@/data/doadoras";

const BRONZE = "#A0792E";
const BRONZE_LIGHT = "#D4A85C";
const INK = "#161616";
const INK_2 = "#1f1f1f";
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
    const hasPedigree = !!doadora.pedigree;
    const hasAvaliacao = !!doadora.avaliacao;

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
                        {/* Foto / placeholder bronze — em mobile mantém 16/9, em desktop acompanha a altura da coluna de texto ao lado */}
                        <div
                            className="relative overflow-hidden order-first lg:order-first aspect-video lg:aspect-auto lg:h-full lg:min-h-[480px]"
                            style={{
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
                                <Link href={`/checkout-embriao/${doadora.slug}`} className="fdb-btn-primary-static">
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
                                            className="shrink-0"
                                            style={{ width: 10, height: 1, background: BRONZE, marginTop: 11 }}
                                        />
                                        {arg}
                                    </li>
                                ))}
                            </ul>

                            <Link href={`/checkout-embriao/${doadora.slug}`} className="fdb-btn-primary-static">
                                Solicitar pré-reserva
                                <span aria-hidden style={{ marginLeft: 6 }}>→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* GENEALOGIA ─────────────────────────── */}
            <section>
                <div className="container mx-auto px-4 py-14 md:py-20" style={{ maxWidth: 1300 }}>
                    <SectionLabel>04 · Genealogia</SectionLabel>

                    {hasPedigree && doadora.pedigree ? (
                        <>
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
                                — origem paterna e materna documentadas com RG oficial para cada ancestral
                                até a terceira geração (bisavós).
                            </p>

                            <PedigreeCinema doadora={doadora} />

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
                                Consulta pública ABCZ · RGD {doadora.rgd}
                                {doadora.idAbcz ? ` · ID ${doadora.idAbcz}` : ""}
                            </p>
                        </>
                    ) : (
                        <PedigreeEmValidacao doadora={doadora} />
                    )}
                </div>
            </section>

            {/* AVALIAÇÃO GENÉTICA ABCZ ─────────────────────────── */}
            {hasAvaliacao && doadora.avaliacao && (
                <section
                    style={{
                        background: INK_2,
                        borderTop: "1px solid rgba(212,168,92,0.10)",
                        borderBottom: "1px solid rgba(212,168,92,0.10)",
                    }}
                >
                    <div className="container mx-auto px-4 py-14 md:py-20" style={{ maxWidth: 1300 }}>
                        <SectionLabel>05 · Avaliação genética ABCZ · Corte {doadora.avaliacao.corte}</SectionLabel>
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
                            Resumo do índice oficial publicado pela ABCZ no corte {doadora.avaliacao.corte}.
                            A ficha técnica completa traz todas as DEPs por característica — crescimento,
                            maternas, reprodutivas, carcaça e morfológicas — com acurácia (AC), decil (DECA)
                            e percentil populacional (P%).
                        </p>

                        <AvaliacaoHeadline aval={doadora.avaliacao} />

                        <div className="mt-10" style={{ maxWidth: 720 }}>
                            {doadora.fichaTecnica ? (
                                <FichaTecnicaDownload
                                    href={doadora.fichaTecnica}
                                    corte={doadora.avaliacao.corte}
                                    rgd={doadora.rgd}
                                />
                            ) : (
                                <p
                                    style={{
                                        fontFamily: "var(--font-mono)",
                                        fontSize: 12,
                                        letterSpacing: "0.08em",
                                        color: "rgba(245,240,228,0.52)",
                                    }}
                                >
                                    Ficha técnica em validação na ABCZ.
                                </p>
                            )}
                        </div>
                    </div>
                </section>
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

/* Árvore "cinema mode" — espelha o pedigree da LP /atacante-matinha:
 * card-herói no topo → Pais → Avós, conectados por linhas SVG animadas
 * com reveal sequencial no scroll. Os bisavós (3ª geração) entram como
 * rodapé compacto dentro de cada card de avó, preservando a profundidade
 * de dados da doadora sem quebrar o layout de 3 fileiras do original. */

function PedigreeCinema({ doadora }: { doadora: Doadora }) {
    const ped = doadora.pedigree!;
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

    // Conta ancestrais com RG oficial (pais + avós + bisavós).
    const ancestraisComRg = useMemo(() => {
        let n = 0;
        const walk = (node?: PedigreeNode) => {
            if (!node) return;
            if (node.rg) n += 1;
            walk(node.pai);
            walk(node.mae);
        };
        walk(ped.pai);
        walk(ped.mae);
        return n;
    }, [ped]);

    const heroName = doadora.nomeAbcz ?? doadora.rgd;

    return (
        <div className="pedi-cinema" ref={rootRef}>
            {/* DOADORA — geração 0 */}
            <div className="pedi-cin-row pedi-row-hero">
                <article className="pedi-cin-card hero">
                    <div className="pedi-cin-tag">Doadora</div>
                    <div className="pedi-cin-name font-display">{heroName}</div>
                    <div className="pedi-cin-reg">RGD {doadora.rgd}</div>
                    <div className="pedi-cin-metric">
                        <div className="pedi-cin-metric-num font-display">
                            {fmtDecimal(doadora.iabcz.valor)}
                        </div>
                        <div className="pedi-cin-metric-label">
                            iABCZ · {doadora.iabcz.percentil}
                        </div>
                    </div>
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
                <PedigreeCinCard tier="parent" side="paterno" tag="Pai" node={ped.pai} />
                <PedigreeCinCard tier="parent" side="materno" tag="Mãe" node={ped.mae} />
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
                <PedigreeCinCard tier="grand" side="paterno" tag="Avô paterno" node={ped.pai.pai} />
                <PedigreeCinCard tier="grand" side="paterno" tag="Avó paterna" node={ped.pai.mae} />
                <PedigreeCinCard tier="grand" side="materno" tag="Avô materno" node={ped.mae.pai} />
                <PedigreeCinCard tier="grand" side="materno" tag="Avó materna" node={ped.mae.mae} />
            </div>

            {/* KPIs resumo */}
            <div className="pedi-cin-kpis">
                <div className="pedi-cin-kpi">
                    <div className="pedi-cin-kpi-num font-display">3</div>
                    <div className="pedi-cin-kpi-label">Gerações documentadas</div>
                </div>
                <div className="pedi-cin-kpi">
                    <div className="pedi-cin-kpi-num font-display">{ancestraisComRg}</div>
                    <div className="pedi-cin-kpi-label">Ancestrais com registro</div>
                </div>
                <div className="pedi-cin-kpi">
                    {doadora.avaliacao ? (
                        <>
                            <div className="pedi-cin-kpi-num font-display">
                                {fmtDecimal(doadora.avaliacao.fPct)}
                                <span className="cents">%</span>
                            </div>
                            <div className="pedi-cin-kpi-label">Consanguinidade (F)</div>
                        </>
                    ) : (
                        <>
                            <div className="pedi-cin-kpi-num font-display">
                                {doadora.classificacaoTop.replace(/^TOP\s*/i, "")}
                            </div>
                            <div className="pedi-cin-kpi-label">Classificação iABCZ</div>
                        </>
                    )}
                </div>
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
    node?: PedigreeNode;
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

function PedigreeAncLine({ label, node }: { label: string; node?: PedigreeNode }) {
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

/* ─── Pedigree fallback (em validação) ─────────────────────── */

function PedigreeEmValidacao({ doadora }: { doadora: Doadora }) {
    return (
        <>
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
                Os dados completos de pedigree (3 gerações com RGN) e a avaliação genética
                ABCZ detalhada estão em validação direta na ABCZ. Liberados após
                confirmação oficial.
            </p>

            <div
                className="card-engraved"
                style={{
                    background: INK_2,
                    border: "1px solid rgba(212,168,92,0.22)",
                    padding: "26px 24px",
                    maxWidth: 720,
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
        </>
    );
}

/* ─── Avaliação Genética ──────────────────────────────────── */

function AvaliacaoHeadline({ aval }: { aval: Avaliacao }) {
    return (
        <div
            className="grid grid-cols-2 lg:grid-cols-4 gap-0"
            style={{
                border: "1px solid rgba(212,168,92,0.22)",
                borderRadius: 4,
                overflow: "hidden",
                background: INK,
            }}
        >
            <Metric label="iABCZ" value={fmtDecimal(aval.iabcz)} badge={`Corte ABCZ ${aval.corte}`} />
            <Metric label="DECA" value={String(aval.deca)} badge="Decil da raça" divider />
            <Metric label="P%" value={String(aval.pPct)} badge="Percentil populacional" divider />
            <Metric label="F (endogamia)" value={`${fmtDecimal(aval.fPct)}%`} badge="Coef. endogamia" divider />
        </div>
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
    corte: string;
    rgd: string;
}) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            download={`ficha-tecnica-${rgd.replace(/\s+/g, "-")}.pdf`}
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
                    Todas as DEPs por característica + genealogia · corte {corte} · PDF
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

/* ─── Placeholder de foto ─────────────────────────────────── */

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
