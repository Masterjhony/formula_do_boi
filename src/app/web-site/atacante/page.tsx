"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { atacanteCss } from "./atacanteCss";

const ASSET = (p: string) => `/assets/atacante/${p}`;

// === Reveal hook ===
function useReveal() {
    const ref = useRef<HTMLElement | null>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    (e.target as HTMLElement).classList.add("in");
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.15 });
        io.observe(el);
        return () => io.disconnect();
    }, []);
    return ref;
}

function ArrowIcon() {
    return (
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
            <path d="M1 5h12m0 0L9 1m4 4L9 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
        </svg>
    );
}

function Corners({ color = "var(--gold)", size = 18 }: { color?: string; size?: number }) {
    const s: React.CSSProperties = { position: "absolute", width: size, height: size, borderColor: color, pointerEvents: "none" };
    return (
        <>
            <span style={{ ...s, top: 10, left: 10, borderTop: "1px solid", borderLeft: "1px solid" }} />
            <span style={{ ...s, top: 10, right: 10, borderTop: "1px solid", borderRight: "1px solid" }} />
            <span style={{ ...s, bottom: 10, left: 10, borderBottom: "1px solid", borderLeft: "1px solid" }} />
            <span style={{ ...s, bottom: 10, right: 10, borderBottom: "1px solid", borderRight: "1px solid" }} />
        </>
    );
}

// ===== Brand Bar (sticky, with FdB logo) =====
function BrandBar({ onReserve }: { onReserve: () => void }) {
    return (
        <div className="at-brand-bar">
            <div className="at-brand-bar-inner">
                <Link href="/" aria-label="Fórmula do Boi — Voltar para a página inicial" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <img
                        src="/assets/sertanejo/logo-horizontal-white.png"
                        alt="Fórmula do Boi"
                        className="at-brand-logo"
                    />
                </Link>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Link href="/" className="at-brand-back" aria-label="Voltar para o site">
                        <span>←</span>
                        <span className="at-brand-back-label">Voltar ao site</span>
                    </Link>
                    <button onClick={onReserve} className="btn btn-gold at-brand-cta" aria-label="Reservar dose">
                        Reservar dose
                    </button>
                </div>
            </div>
            <div className="at-brand-bar-stitch" />
        </div>
    );
}

// ===== Hero =====
function Hero({ onReserve }: { onReserve: () => void }) {
    const [t, setT] = useState(0);
    useEffect(() => {
        const onScroll = () => setT(Math.min(window.scrollY / 600, 1));
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <section className="at-hero" style={{ position: "relative", height: "100vh", minHeight: 720, overflow: "hidden" }}>
            <div
                className="at-hero-bg"
                style={{
                    position: "absolute", inset: 0,
                    backgroundImage: `url("${ASSET("touro-04.jpeg")}")`,
                    backgroundSize: "cover", backgroundPosition: "center 30%",
                    transform: `scale(${1.05 + t * 0.05}) translateY(${t * -30}px)`,
                    transition: "transform 0.05s linear",
                    filter: "contrast(1.05) saturate(0.85) brightness(0.78)",
                }}
            />
            <div
                className="at-hero-grad"
                style={{
                    position: "absolute", inset: 0,
                    background: `
                        linear-gradient(180deg, rgba(10,9,8,0.7) 0%, rgba(10,9,8,0.15) 35%, rgba(10,9,8,0.55) 75%, rgba(10,9,8,0.95) 100%),
                        radial-gradient(ellipse at 30% 50%, rgba(10,9,8,0) 0%, rgba(10,9,8,0.45) 80%)
                    `,
                }}
            />

            <div className="at-vert-rail" style={{ position: "absolute", left: 36, top: 0, bottom: 0, width: 1, background: "linear-gradient(180deg, transparent, var(--rule), transparent)" }} />
            <div className="at-vert-rail" style={{ position: "absolute", right: 36, top: 0, bottom: 0, width: 1, background: "linear-gradient(180deg, transparent, var(--rule), transparent)" }} />

            <div className="mono at-vert-label" style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%) rotate(-90deg)", transformOrigin: "left center", fontSize: 10, letterSpacing: "0.4em", color: "var(--gold)", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                RDM B 3224 MAT. · PROCRIAR SP · NASC. 01.08.2024
            </div>
            <div className="mono at-vert-label" style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%) rotate(90deg)", transformOrigin: "right center", fontSize: 10, letterSpacing: "0.4em", color: "var(--gold)", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                MGTE 42,38 · TOP 0,1% · ELITE PESO · PE · AOL
            </div>

            <div
                className="at-hero-content"
                style={{
                    position: "relative", zIndex: 2, height: "100%",
                    display: "flex", flexDirection: "column", justifyContent: "flex-end",
                    padding: "0 80px 80px",
                    maxWidth: 1480, margin: "0 auto",
                }}
            >
                <div className="at-hero-kicker" style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28, opacity: 1 - t }}>
                    <span style={{ width: 60, height: 1, background: "var(--gold)", display: "inline-block" }} />
                    <span className="mono" style={{ fontSize: 11, letterSpacing: "0.32em", color: "var(--gold-2)", textTransform: "uppercase" }}>
                        Aceleradora de Touros · Lançamento 2026
                    </span>
                </div>

                <h1 className="serif-tight at-hero-h1" style={{
                    fontSize: "clamp(64px, 13vw, 220px)", color: "var(--bone)",
                    textShadow: "0 8px 40px rgba(0,0,0,0.6)", marginBottom: 16,
                }}>
                    <span style={{ display: "block" }}>Atacante</span>
                    <span style={{ display: "block", fontStyle: "italic", color: "var(--bone-2)" }}>da Matinha</span>
                </h1>

                <div className="at-hero-foot" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 60, flexWrap: "wrap", marginTop: 24 }}>
                    <p style={{ color: "var(--bone-2)", fontSize: 18, lineHeight: 1.55, maxWidth: 520, fontWeight: 300 }}>
                        Touro jovem Nelore PO. Resultado direto no campo, na balança e no bolso.
                        Pacotes de sêmen exclusivos para o lançamento — pré-reserva aberta.
                    </p>

                    <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                        <button className="btn btn-gold" onClick={onReserve}>
                            Reservar agora
                            <ArrowIcon />
                        </button>
                        <a href="#touro" className="btn btn-ghost">Conhecer o touro</a>
                    </div>
                </div>
            </div>

            <div className="at-hero-scroll" style={{
                position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                opacity: 1 - t * 2,
            }}>
                <span className="mono" style={{ fontSize: 9, letterSpacing: "0.4em", color: "var(--gold)", textTransform: "uppercase" }}>Rolar</span>
                <div style={{ width: 1, height: 32, background: "linear-gradient(180deg, var(--gold), transparent)" }} />
            </div>
        </section>
    );
}

// ===== Marquee =====
function Marquee() {
    const items = [
        "MGTE 42,38", "TOP 0,1% DA RAÇA", "PESO +24% ELITE", "AOL +25% ELITE",
        "PE +21% ELITE", "IPP MÃE 24M", "CONSANG. 5,13%", "PROCRIAR SP",
        "5º INTRA-REBANHO", "NELORE PO",
    ];
    const list = [...items, ...items, ...items];
    return (
        <div style={{
            borderTop: "1px solid var(--rule)",
            borderBottom: "1px solid var(--rule)",
            background: "rgba(0,0,0,0.5)",
            padding: "16px 0", overflow: "hidden",
        }}>
            <div style={{
                display: "flex", gap: 60,
                animation: "atacante-marquee 60s linear infinite",
                whiteSpace: "nowrap",
            }}>
                {list.map((s, i) => (
                    <span key={i} className="mono" style={{
                        fontSize: 12, letterSpacing: "0.28em",
                        color: i % 3 === 0 ? "var(--gold)" : "var(--txt)",
                        textTransform: "uppercase", flexShrink: 0,
                    }}>
                        {s} <span style={{ color: "var(--gold-deep)", marginLeft: 60 }}>✦</span>
                    </span>
                ))}
            </div>
        </div>
    );
}

// ===== Identity =====
function Identity() {
    const ref = useReveal() as React.RefObject<HTMLElement>;
    // Reduced to essentials — less info density per chefe's feedback.
    const data: [string, string][] = [
        ["Matrícula", "RDM B 3224 MAT."],
        ["Raça", "Nelore PO"],
        ["Nascimento", "01.08.2024"],
        ["Criador", "Nelore Visual"],
        ["Central", "Procriar SP"],
        ["Sêmen", "Convencional · Sexado"],
        ["Situação", "Pré-reserva aberta"],
    ];
    return (
        <section id="touro" ref={ref} className="reveal pad-side-big" style={{ padding: "160px 80px", position: "relative" }}>
            <div style={{ maxWidth: 1480, margin: "0 auto" }}>
                <div className="grid-2-col" style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 100, alignItems: "start" }}>
                    <div style={{ position: "sticky", top: 120 }}>
                        <div className="kicker" style={{ marginBottom: 24 }}>01 — Apresentamos</div>
                        <h2 className="serif-tight" style={{ fontSize: "clamp(44px, 6vw, 96px)", color: "var(--bone)", marginBottom: 24 }}>
                            Um indivíduo<br />
                            <span style={{ fontStyle: "italic", color: "var(--gold-2)" }}>diferenciado.</span>
                        </h2>

                        <p style={{ fontSize: 16, lineHeight: 1.65, color: "var(--txt)", maxWidth: 460, fontWeight: 300 }}>
                            Resultado direto no campo, na balança e no bolso.
                        </p>

                        <div style={{ marginTop: 40, display: "flex", gap: 22, alignItems: "center" }}>
                            <div className="ticker-num at-id-ticker" style={{ fontSize: 72, color: "var(--gold)", lineHeight: 0.9, fontWeight: 600 }}>
                                5,13<span style={{ fontSize: 28 }}>%</span>
                            </div>
                            <div>
                                <div className="label">Consanguinidade</div>
                                <div style={{ color: "var(--txt)", fontSize: 12, marginTop: 4, fontWeight: 400 }}>Sangue selecionado</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="img-vignette" style={{
                            position: "relative", aspectRatio: "4 / 5",
                            backgroundImage: `url("${ASSET("touro-03.jpeg")}")`,
                            backgroundSize: "cover", backgroundPosition: "center",
                            border: "1px solid var(--rule-2)",
                            filter: "contrast(1.05) saturate(0.92)",
                        }}>
                            <Corners color="var(--gold)" />
                            <div style={{
                                position: "absolute", bottom: 24, left: 24, right: 24,
                                background: "linear-gradient(180deg, rgba(10,9,8,0.4), rgba(10,9,8,0.85))",
                                backdropFilter: "blur(8px)",
                                border: "1px solid var(--rule-2)",
                                padding: "20px 24px",
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                            }}>
                                <div>
                                    <div className="label" style={{ marginBottom: 4 }}>Foto · Nelore Visual</div>
                                    <div className="serif" style={{ fontSize: 22, color: "var(--bone)", fontStyle: "italic" }}>RDM B 3224 MAT.</div>
                                </div>
                                <div className="mono" style={{ color: "var(--gold)", fontSize: 12, letterSpacing: "0.2em" }}>01 / 08</div>
                            </div>
                        </div>

                        <div style={{
                            marginTop: 4, border: "1px solid var(--rule-2)", borderTop: "none",
                            background: "linear-gradient(180deg, rgba(28,24,22,0.4), rgba(20,17,15,0.7))",
                        }}>
                            {data.map(([k, v], i) => (
                                <div key={k} style={{
                                    display: "grid", gridTemplateColumns: "180px 1fr",
                                    padding: "14px 24px",
                                    borderBottom: i < data.length - 1 ? "1px dashed var(--rule)" : "none",
                                    alignItems: "center", gap: 24,
                                }}>
                                    <div className="label">{k}</div>
                                    <div className="mono" style={{ fontSize: 14, color: "var(--bone)", letterSpacing: "0.04em" }}>{v}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ===== NumbersHero =====
function NumbersHero() {
    const ref = useReveal() as React.RefObject<HTMLElement>;
    // Layout: ONE hero stat (MGTe) + 4 compact secondary stats — matches V3 PDF.
    const heroStat = { n: "42,38", label: "MGTe · Índice Geral", sub: "TOP 0,1%" };
    const stats = [
        { n: "+24%", label: "Peso", sub: "Elite" },
        { n: "+25%", label: "AOL", sub: "Elite" },
        { n: "+21%", label: "PE", sub: "Elite" },
        { n: "5º", label: "Intra-rebanho", sub: "+15%" },
    ];
    return (
        <section id="genética" ref={ref} className="reveal pad-side-big" style={{
            padding: "140px 80px",
            background: "linear-gradient(180deg, var(--ink), var(--leather) 30%, var(--leather) 70%, var(--ink))",
            borderTop: "1px solid var(--rule)",
            borderBottom: "1px solid var(--rule)",
        }}>
            <div style={{ maxWidth: 1480, margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 80, flexWrap: "wrap", gap: 30 }}>
                    <div>
                        <div className="kicker" style={{ marginBottom: 24 }}>02 — Avaliação Genética · ANCP · Abr/2026</div>
                        <h2 className="serif-tight" style={{ fontSize: "clamp(40px, 5.5vw, 88px)", color: "var(--bone)" }}>
                            Direcionado para <span style={{ fontStyle: "italic", color: "var(--gold-2)" }}>crescimento</span><br />
                            e carcaça.
                        </h2>
                    </div>
                    <div className="mono at-numbers-source" style={{ fontSize: 11, color: "var(--txt-dim)", letterSpacing: "0.18em", textTransform: "uppercase", textAlign: "right" }}>
                        Fonte ANCP<br />Procriar SP<br />Base 1ª AG · Abr/2026
                    </div>
                </div>

                {/* Hero stat (MGTe) — single big number, right-side floats secondary stats below */}
                <div className="at-stats-grid" style={{
                    display: "grid",
                    gridTemplateColumns: "1.4fr 1fr",
                    gap: 0,
                    border: "1px solid var(--rule-2)",
                }}>
                    <div className="at-stat-hero" style={{
                        padding: "44px 36px",
                        borderRight: "1px solid var(--rule-2)",
                        background: "linear-gradient(135deg, rgba(201,162,74,0.10), transparent)",
                        display: "flex", flexDirection: "column", justifyContent: "space-between",
                        minHeight: 280, gap: 28,
                    }}>
                        <div>
                            <div className="label">{heroStat.label}</div>
                        </div>
                        <div>
                            <div className="ticker-num gold-foil" style={{
                                fontSize: "clamp(64px, 8.5vw, 132px)", color: "var(--gold)", letterSpacing: "-0.02em",
                            }}>{heroStat.n}</div>
                            <div className="mono" style={{
                                fontSize: 11, color: "var(--gold-2)", letterSpacing: "0.22em",
                                textTransform: "uppercase", marginTop: 14, fontWeight: 600,
                            }}>{heroStat.sub}</div>
                        </div>
                    </div>

                    {/* 2x2 secondary stats grid */}
                    <div className="at-stat-grid-2" style={{
                        display: "grid", gridTemplateColumns: "1fr 1fr",
                    }}>
                        {stats.map((s, i) => (
                            <div key={i} style={{
                                padding: "20px 22px",
                                borderRight: i % 2 === 0 ? "1px solid var(--rule-2)" : "none",
                                borderBottom: i < 2 ? "1px solid var(--rule-2)" : "none",
                                display: "flex", flexDirection: "column", justifyContent: "space-between",
                                minHeight: 140, gap: 12,
                            }}>
                                <div className="mono" style={{
                                    fontSize: 10, letterSpacing: "0.22em", color: "var(--txt-dim)",
                                    textTransform: "uppercase", fontWeight: 500,
                                }}>{s.label}</div>
                                <div>
                                    <div className="ticker-num" style={{
                                        fontSize: "clamp(28px, 3vw, 40px)", color: "var(--bone)",
                                        fontWeight: 600, letterSpacing: "-0.01em",
                                    }}>{s.n}</div>
                                    <div className="mono" style={{
                                        fontSize: 9, color: "var(--gold)", letterSpacing: "0.22em",
                                        textTransform: "uppercase", marginTop: 6, fontWeight: 600,
                                    }}>{s.sub}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <p style={{
                    marginTop: 36, fontSize: 14, color: "var(--txt-dim)", maxWidth: 640,
                    lineHeight: 1.6, fontFamily: "var(--mono-atacante)",
                    letterSpacing: "0.02em",
                }}>
                    AOL e acabamento entre os melhores da população — exatamente o que o mercado exige.
                </p>
            </div>
        </section>
    );
}

// ===== DEPs Detail =====
function DEPsDetail() {
    const ref = useReveal() as React.RefObject<HTMLElement>;
    const deps = [
        { code: "PESO", val: "+24%", pct: "0,5%", tier: "Elite", bar: 95 },
        { code: "PE", val: "+21%", pct: "0,5%", tier: "Elite", bar: 92 },
        { code: "AOL", val: "+25%", pct: "0,5%", tier: "Elite", bar: 96 },
        { code: "GPD", val: "Sup.", pct: "—", tier: "Superior", bar: 80 },
        { code: "MARMOREIO", val: "−1%", pct: "20%", tier: "Superior", bar: 60 },
        { code: "ACABAM.", val: "−15%", pct: "3%", tier: "Regular", bar: 50 },
        { code: "IPP MÃE", val: "24m", pct: "—", tier: "Maternal", bar: 78 },
        { code: "STAY", val: "95,70", pct: "0,5%", tier: "Reprod.", bar: 94 },
    ];

    return (
        <section ref={ref} className="reveal pad-side-big" style={{ padding: "120px 80px", background: "var(--ink)" }}>
            <div style={{ maxWidth: 1480, margin: "0 auto" }}>
                <div className="kicker" style={{ marginBottom: 24 }}>02.1 — DEPs &amp; Percentis</div>

                <div className="grid-2-col" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0 80px" }}>
                    {deps.map((d, i) => (
                        <div key={d.code} className="at-deps-row" style={{
                            padding: "24px 0",
                            borderBottom: i < deps.length - 1 ? "1px solid var(--rule)" : "none",
                            display: "grid", gridTemplateColumns: "120px 1fr 80px 80px",
                            alignItems: "center", gap: 16,
                        }}>
                            <div className="mono" style={{ color: "var(--bone)", fontSize: 14, letterSpacing: "0.16em", fontWeight: 600 }}>{d.code}</div>
                            <div style={{ position: "relative", height: 6, background: "rgba(255,255,255,0.04)" }}>
                                <div style={{
                                    position: "absolute", top: 0, left: 0, height: "100%",
                                    width: `${d.bar}%`,
                                    background: d.bar > 85
                                        ? "linear-gradient(90deg, var(--gold-deep), var(--gold-2))"
                                        : "linear-gradient(90deg, var(--leather-3), var(--copper))",
                                }} />
                            </div>
                            <div className="ticker-num" style={{ color: "var(--bone)", fontSize: 22, textAlign: "right" }}>{d.val}</div>
                            <div className="mono at-deps-tier" style={{
                                fontSize: 10, color: d.bar > 85 ? "var(--gold)" : "var(--txt-dim)",
                                letterSpacing: "0.18em", textTransform: "uppercase", textAlign: "right",
                            }}>{d.tier}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ===== Pedigree =====
type PedigreeNode = { name: string; mat: string; mgte: string; top: string };

function Pedigree() {
    const ref = useReveal() as React.RefObject<HTMLElement>;
    const tree: Record<string, PedigreeNode> = {
        self:     { name: "B3224 MAT.",            mat: "RDM B3224", mgte: "42,38", top: "0,1%" },
        pai:      { name: "HITLER MAT.",           mat: "RDM A6962", mgte: "39,27", top: "0,1%" },
        mae:      { name: "GARTA MAT.",            mat: "RDM A5372", mgte: "33,02", top: "0,5%" },
        avoP_pat: { name: "REM HORUS GEN ADT",     mat: "REMP 602",  mgte: "34,28", top: "0,1%" },
        avoP_mat: { name: "ENDIRA MAT.",           mat: "RDM A2167", mgte: "27,73", top: "5%" },
        avoM_pat: { name: "REM HERMOSO FIV GEN ADT", mat: "REMP 816", mgte: "30,90", top: "1%" },
        avoM_mat: { name: "CORA MAT.",             mat: "RDM A307",  mgte: "23,76", top: "12%" },
    };

    const Node = ({ d, big, side }: { d: PedigreeNode; big?: boolean; side?: string }) => (
        <div style={{
            padding: big ? "22px 24px" : "14px 18px",
            background: big
                ? "linear-gradient(135deg, rgba(201,162,74,0.12), rgba(28,24,22,0.7))"
                : "rgba(20,17,15,0.6)",
            border: `1px solid ${big ? "var(--gold)" : "var(--rule)"}`,
            position: "relative",
            minHeight: big ? 100 : 78,
        }}>
            {big && <Corners color="var(--gold)" size={12} />}
            <div className="mono" style={{
                fontSize: 9, letterSpacing: "0.22em",
                color: side ? "var(--gold-2)" : "var(--txt-dim)",
                textTransform: "uppercase", marginBottom: 6,
            }}>
                {side || "Touro"}
            </div>
            <div className="serif" style={{ fontSize: big ? 20 : 14, color: "var(--bone)", marginBottom: 8, fontWeight: 500, letterSpacing: "0.01em" }}>
                {d.name}
            </div>
            <div className="mono" style={{ fontSize: 10, color: "var(--txt-dim)", letterSpacing: "0.1em" }}>{d.mat}</div>
            <div style={{ marginTop: 10, display: "flex", gap: 12, fontFamily: "var(--mono-atacante)", fontSize: 10 }}>
                <span style={{ color: "var(--gold)" }}>MGTe {d.mgte}</span>
                <span style={{ color: "var(--txt-dim)" }}>· TOP {d.top}</span>
            </div>
        </div>
    );

    return (
        <section id="linhagem" ref={ref} className="reveal leather-bg pad-side-big" style={{
            padding: "160px 80px",
            borderTop: "1px solid var(--rule)",
            borderBottom: "1px solid var(--rule)",
        }}>
            <div style={{ maxWidth: 1480, margin: "0 auto" }}>
                <div style={{ marginBottom: 80 }}>
                    <div className="kicker" style={{ marginBottom: 24 }}>03 — Linhagem · Pedigree ANCP</div>
                    <h2 className="serif-tight" style={{ fontSize: "clamp(40px, 5.5vw, 88px)", color: "var(--bone)", maxWidth: 900 }}>
                        Construído sobre <span style={{ fontStyle: "italic", color: "var(--gold-2)" }}>sangue selecionado.</span>
                    </h2>
                </div>

                <div className="ped-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1.5fr", gap: 40, alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <Node d={tree.self} big side="Touro · 01" />
                        <div style={{ flex: 1, height: 1, background: "var(--gold)", minWidth: 30 }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Node d={tree.pai} side="Pai · 02" />
                            <div style={{ flex: 1, height: 1, background: "var(--rule-2)", minWidth: 20 }} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Node d={tree.mae} side="Mãe · 02" />
                            <div style={{ flex: 1, height: 1, background: "var(--rule-2)", minWidth: 20 }} />
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <Node d={tree.avoP_pat} side="Avô Pat · 03" />
                        <Node d={tree.avoP_mat} side="Avó Pat · 03" />
                        <div style={{ height: 16 }} />
                        <Node d={tree.avoM_pat} side="Avô Mat · 03" />
                        <Node d={tree.avoM_mat} side="Avó Mat · 03" />
                    </div>
                </div>

                <div style={{ marginTop: 48, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
                    <p className="mono" style={{ fontSize: 11, color: "var(--txt-dim)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                        Base ANCP · 1ª AG — Abr/2026 · Consanguinidade 5,13%
                    </p>
                    <a href="#sêmen" className="mono" style={{ fontSize: 11, color: "var(--gold)", letterSpacing: "0.22em", textTransform: "uppercase" }}>
                        Ver pacotes de sêmen →
                    </a>
                </div>
            </div>
        </section>
    );
}

// ===== Carcaça =====
function Carcaca() {
    const ref = useReveal() as React.RefObject<HTMLElement>;
    return (
        <section id="carcaça" ref={ref} className="reveal" style={{ background: "var(--ink)" }}>
            <div className="at-carcaca-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 720 }}>
                <div className="at-carcaca-img" style={{
                    backgroundImage: `url("${ASSET("touro-07.jpeg")}")`,
                    backgroundSize: "cover", backgroundPosition: "center",
                    filter: "contrast(1.05) saturate(0.85) brightness(0.85)",
                    position: "relative", minHeight: 360,
                }}>
                    <div className="at-carcaca-img-fade" style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 60%, var(--ink))" }} />
                    <div className="mono" style={{ position: "absolute", top: 40, left: 40, fontSize: 10, letterSpacing: "0.32em", color: "var(--gold)", textTransform: "uppercase" }}>
                        Perfil · Anatômico
                    </div>
                </div>

                <div className="at-carcaca-text" style={{ padding: "120px 80px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div className="kicker" style={{ marginBottom: 24 }}>04 — Carcaça &amp; Frigorífico</div>
                    <h2 className="serif-tight" style={{ fontSize: "clamp(36px, 4.5vw, 72px)", color: "var(--bone)", marginBottom: 32 }}>
                        Mais arrobas em<br />
                        <span style={{ fontStyle: "italic", color: "var(--gold-2)" }}>menos tempo.</span>
                    </h2>
                    <p style={{ fontSize: 17, lineHeight: 1.7, color: "var(--txt)", marginBottom: 48, fontWeight: 300, maxWidth: 480 }}>
                        Carcaças pesadas, bem acabadas e eficientes. AOL e acabamento entre os melhores
                        da população — exatamente o que o mercado exige e o frigorífico paga.
                    </p>

                    <div style={{
                        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0,
                        borderTop: "1px solid var(--rule-2)", borderLeft: "1px solid var(--rule-2)",
                    }}>
                        {[
                            ["+25%", "AOL · Elite"],
                            ["+24%", "Peso · Elite"],
                            ["5º", "Intra-rebanho"],
                        ].map(([n, l]) => (
                            <div key={l} style={{ padding: "32px 24px", borderRight: "1px solid var(--rule-2)", borderBottom: "1px solid var(--rule-2)" }}>
                                <div className="ticker-num gold-foil" style={{ fontSize: 56 }}>{n}</div>
                                <div className="label" style={{ marginTop: 12 }}>{l}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

// ===== Gallery =====
function Gallery() {
    const ref = useReveal() as React.RefObject<HTMLElement>;
    const [active, setActive] = useState(0);
    const imgs = ["touro-02.jpeg", "touro-04.jpeg", "touro-03.jpeg", "touro-07.jpeg", "touro-08.jpeg", "touro-05.jpeg"];

    return (
        <section ref={ref} className="reveal pad-side-big" style={{ padding: "160px 80px", background: "var(--leather)" }}>
            <div style={{ maxWidth: 1480, margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 60, flexWrap: "wrap", gap: 24 }}>
                    <div>
                        <div className="kicker" style={{ marginBottom: 24 }}>05 — Galeria</div>
                        <h2 className="serif-tight" style={{ fontSize: "clamp(36px, 4.5vw, 72px)", color: "var(--bone)" }}>
                            <span style={{ fontStyle: "italic", color: "var(--gold-2)" }}>Ele,</span> em detalhe.
                        </h2>
                    </div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--txt-dim)", letterSpacing: "0.18em" }}>
                        <span style={{ color: "var(--gold)" }}>{String(active + 1).padStart(2, "0")}</span> / {String(imgs.length).padStart(2, "0")} · Foto Nelore Visual
                    </div>
                </div>

                <div className="at-gallery-grid" style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 32 }}>
                    <div className="img-vignette" style={{
                        position: "relative", aspectRatio: "16 / 9",
                        backgroundImage: `url("${ASSET(imgs[active])}")`,
                        backgroundSize: "cover", backgroundPosition: "center",
                        border: "1px solid var(--rule-2)",
                        transition: "background-image 0.4s",
                    }}>
                        <Corners color="var(--gold)" />
                    </div>
                    <div className="no-scrollbar at-gallery-thumbs" style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 600, overflowY: "auto" }}>
                        {imgs.map((src, i) => (
                            <button key={src} onClick={() => setActive(i)} style={{
                                aspectRatio: "16 / 9",
                                backgroundImage: `url("${ASSET(src)}")`,
                                backgroundSize: "cover", backgroundPosition: "center",
                                border: i === active ? "1px solid var(--gold)" : "1px solid var(--rule)",
                                cursor: "pointer", padding: 0,
                                opacity: i === active ? 1 : 0.55, transition: "all 0.2s",
                            }} aria-label={`Foto ${i + 1}`} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

// ===== Sêmen Pricing =====
type Tier = { range: string; label: string; price: number; discount: string | null; max: number; highlight?: boolean };

function SemenPricing({ onReserve }: { onReserve: (data?: { doses: number; type: string; total: number }) => void }) {
    const ref = useReveal() as React.RefObject<HTMLElement>;
    const tiers: Tier[] = [
        { range: "1 — 100",   label: "Dose inicial", price: 29.5, discount: null,    max: 100 },
        { range: "101 — 200", label: "Dose padrão",  price: 27.5, discount: "−7%",   max: 200 },
        { range: "201 — 500", label: "Volume",       price: 25.5, discount: "−14%",  highlight: true, max: 500 },
        { range: "501+",      label: "Atacado",      price: 23.5, discount: "−20%",  max: 1000 },
    ];

    const [doses, setDoses] = useState(120);
    const [type, setType] = useState<"conv" | "sex">("conv");

    const tier = useMemo(() => {
        if (doses <= 100) return tiers[0];
        if (doses <= 200) return tiers[1];
        if (doses <= 500) return tiers[2];
        return tiers[3];
    }, [doses]);

    const sexedMultiplier = type === "sex" ? 1.6 : 1;
    const pricePerDose = tier.price * sexedMultiplier;
    const total = pricePerDose * doses;

    return (
        <section id="sêmen" ref={ref} className="reveal pad-side-big" style={{
            padding: "160px 80px",
            background: "var(--ink)",
            borderTop: "1px solid var(--rule)",
        }}>
            <div style={{ maxWidth: 1480, margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 60, flexWrap: "wrap", gap: 24 }}>
                    <div>
                        <div className="kicker" style={{ marginBottom: 24 }}>06 — Pacotes de Sêmen · Condição Especial</div>
                        <h2 className="serif-tight" style={{ fontSize: "clamp(40px, 5.5vw, 88px)", color: "var(--bone)", maxWidth: 900 }}>
                            Tabela <span style={{ fontStyle: "italic", color: "var(--gold-2)" }}>promocional</span><br />
                            válida para este lançamento.
                        </h2>
                    </div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--gold)", letterSpacing: "0.22em", textTransform: "uppercase" }}>
                        ✦ Pré-reserva aberta
                    </div>
                </div>

                <div className="grid-4-col" style={{
                    display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
                    borderTop: "1px solid var(--rule-2)", borderLeft: "1px solid var(--rule-2)",
                    marginBottom: 80,
                }}>
                    {tiers.map((t, i) => (
                        <div key={i} style={{
                            padding: "26px 22px",
                            borderRight: "1px solid var(--rule-2)",
                            borderBottom: "1px solid var(--rule-2)",
                            background: t.highlight ? "linear-gradient(180deg, rgba(201,162,74,0.10), rgba(201,162,74,0.02))" : "transparent",
                            position: "relative",
                            minHeight: 180,
                            display: "flex", flexDirection: "column", justifyContent: "space-between",
                            gap: 18,
                        }}>
                            {t.highlight && (
                                <div style={{
                                    position: "absolute", top: -1, left: -1, right: -1, height: 2,
                                    background: "linear-gradient(90deg, var(--gold-deep), var(--gold-2), var(--gold-deep))",
                                }} />
                            )}
                            {t.highlight && (
                                <div className="mono" style={{
                                    position: "absolute", top: 10, right: 14, fontSize: 9,
                                    letterSpacing: "0.24em", color: "var(--gold)", textTransform: "uppercase",
                                }}>
                                    ★
                                </div>
                            )}

                            <div className="mono" style={{
                                fontSize: 11, color: "var(--gold-2)", letterSpacing: "0.18em",
                                textTransform: "uppercase", fontWeight: 600,
                            }}>{t.range}</div>

                            <div>
                                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                                    <span className="mono" style={{ fontSize: 12, color: "var(--gold)", fontWeight: 600 }}>R$</span>
                                    <span className="ticker-num" style={{ fontSize: 38, color: "var(--bone)", fontWeight: 600, letterSpacing: "-0.01em" }}>{t.price.toFixed(2).replace(".", ",")}</span>
                                </div>
                                <div className="mono" style={{ fontSize: 10, color: "var(--txt-dim)", letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 4 }}>
                                    {t.discount ? <span style={{ color: "var(--gold)", fontWeight: 600 }}>{t.discount} · </span> : null}
                                    {t.label}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Calculator */}
                <div className="calc-grid" style={{
                    display: "grid", gridTemplateColumns: "1.2fr 1fr",
                    border: "1px solid var(--rule-2)",
                    background: "linear-gradient(180deg, rgba(28,24,22,0.4), rgba(20,17,15,0.85))",
                    position: "relative",
                }}>
                    <Corners color="var(--gold)" />

                    <div className="at-inner-pad" style={{ padding: 40 }}>
                        <div className="kicker" style={{ marginBottom: 16 }}>Calculadora de Doses</div>
                        <h3 className="serif" style={{ fontSize: 32, color: "var(--bone)", marginBottom: 32, fontWeight: 400 }}>
                            Monte seu pacote.
                        </h3>

                        <div className="label" style={{ marginBottom: 12 }}>Tipo de sêmen</div>
                        <div style={{ display: "flex", gap: 0, marginBottom: 36, border: "1px solid var(--rule-2)" }}>
                            {[
                                { v: "conv" as const, label: "Convencional", sub: "×1" },
                                { v: "sex" as const, label: "Sexado", sub: "×1.6" },
                            ].map((o) => (
                                <button key={o.v} onClick={() => setType(o.v)} style={{
                                    flex: 1, padding: "18px 20px", cursor: "pointer",
                                    background: type === o.v ? "rgba(201,162,74,0.12)" : "transparent",
                                    color: type === o.v ? "var(--gold-2)" : "var(--txt)",
                                    border: "none",
                                    borderRight: o.v === "conv" ? "1px solid var(--rule-2)" : "none",
                                    fontFamily: "var(--mono-atacante)", fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase",
                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                }}>
                                    <span>{o.label}</span>
                                    <span style={{ opacity: 0.6, fontSize: 10 }}>{o.sub}</span>
                                </button>
                            ))}
                        </div>

                        <div className="label" style={{ marginBottom: 12 }}>Quantidade de doses</div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 16 }}>
                            <span className="ticker-num" style={{ fontSize: 72, color: "var(--gold-2)", lineHeight: 1 }}>{doses}</span>
                            <span className="mono" style={{ fontSize: 12, color: "var(--txt-dim)", letterSpacing: "0.22em", textTransform: "uppercase" }}>doses</span>
                        </div>
                        <input
                            type="range" min={1} max={1000} value={doses}
                            onChange={(e) => setDoses(+e.target.value)}
                            style={{ width: "100%", accentColor: "var(--gold)" }}
                        />

                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
                            {[50, 100, 250, 500, 800].map((n) => (
                                <button key={n} onClick={() => setDoses(n)} className="mono" style={{
                                    padding: "8px 14px", background: "transparent",
                                    border: "1px solid var(--rule)", color: "var(--txt)",
                                    fontSize: 11, letterSpacing: "0.16em", cursor: "pointer",
                                }}>{n}</button>
                            ))}
                        </div>
                    </div>

                    <div className="at-inner-pad at-calc-right" style={{
                        padding: 40, background: "rgba(0,0,0,0.4)",
                        borderLeft: "1px solid var(--rule-2)",
                        display: "flex", flexDirection: "column", justifyContent: "space-between",
                    }}>
                        <div>
                            <div className="kicker" style={{ marginBottom: 24 }}>Resumo · Pré-orçamento</div>
                            {([
                                ["Touro", "B 3224 MAT."],
                                ["Tipo", type === "conv" ? "Convencional" : "Sexado"],
                                ["Doses", `${doses}`],
                                ["Faixa aplicada", tier.range],
                                ["Preço por dose", `R$ ${pricePerDose.toFixed(2).replace(".", ",")}`],
                                ["Desconto", tier.discount || "—"],
                            ] as [string, string][]).map(([k, v]) => (
                                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px dashed var(--rule)" }}>
                                    <span className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: "var(--txt-dim)", textTransform: "uppercase" }}>{k}</span>
                                    <span className="mono" style={{ fontSize: 13, color: "var(--bone)" }}>{v}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: 32 }}>
                            <div className="label" style={{ marginBottom: 8 }}>Total estimado</div>
                            <div className="ticker-num gold-foil" style={{ fontSize: 48, lineHeight: 1, fontWeight: 500 }}>
                                R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <button
                                onClick={() => onReserve({ doses, type, total })}
                                className="btn btn-gold"
                                style={{ width: "100%", marginTop: 24, justifyContent: "center" }}
                            >
                                Reservar este pacote
                                <ArrowIcon />
                            </button>
                            <p className="mono" style={{ fontSize: 9, color: "var(--txt-dim)", letterSpacing: "0.18em", marginTop: 12, lineHeight: 1.6 }}>
                                Valores promocionais sujeitos à confirmação. Sêmen sexado pode variar conforme central. Frete e impostos não inclusos.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ===== Closing CTA =====
function ClosingCTA({ onReserve }: { onReserve: () => void }) {
    const ref = useReveal() as React.RefObject<HTMLElement>;
    return (
        <section id="reservar" ref={ref} className="reveal pad-side-big" style={{
            position: "relative", overflow: "hidden", padding: "160px 80px",
        }}>
            <div style={{
                position: "absolute", inset: 0,
                backgroundImage: `url("${ASSET("touro-04.jpeg")}")`,
                backgroundSize: "cover", backgroundPosition: "center 35%",
                filter: "contrast(1.05) saturate(0.6) brightness(0.5)",
            }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, var(--ink) 0%, rgba(10,9,8,0.4) 50%, var(--ink) 100%)" }} />

            <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
                <div className="kicker" style={{ marginBottom: 24, color: "var(--gold-2)" }}>07 — Acelere o progresso genético</div>
                <h2 className="serif-tight" style={{ fontSize: "clamp(48px, 8vw, 140px)", color: "var(--bone)", marginBottom: 32 }}>
                    Resultado <span style={{ fontStyle: "italic", color: "var(--gold-2)" }}>no campo,</span><br />
                    na balança e <span style={{ fontStyle: "italic", color: "var(--gold-2)" }}>no bolso.</span>
                </h2>
                <p style={{ fontSize: 19, lineHeight: 1.6, color: "var(--bone-2)", maxWidth: 680, margin: "0 auto 48px", fontWeight: 300 }}>
                    Genética Nelore Visual dentro do seu rebanho. Pacotes promocionais exclusivos
                    deste lançamento — pensados para quem decide rápido.
                </p>

                <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                    <button onClick={onReserve} className="btn btn-gold" style={{ padding: "20px 36px", fontSize: 13 }}>
                        Reservar agora
                        <ArrowIcon />
                    </button>
                    <a href="#sêmen" className="btn btn-ghost" style={{ padding: "20px 36px", fontSize: 13 }}>
                        Ver tabela completa
                    </a>
                </div>

                <div className="at-closing-stats" style={{ marginTop: 64, display: "flex", justifyContent: "center", gap: 56, flexWrap: "wrap" }}>
                    {([
                        ["01", "Genética Elite", "MGTe 42,38 · TOP 0,1%"],
                        ["02", "Resultado Direto", "Carcaças que o frigorífico paga"],
                        ["03", "Condição Única", "Pacotes exclusivos do lançamento"],
                    ] as [string, string, string][]).map(([n, t, s]) => (
                        <div key={n} style={{ textAlign: "center", maxWidth: 240 }}>
                            <div className="mono" style={{ fontSize: 12, color: "var(--gold)", letterSpacing: "0.32em" }}>{n}</div>
                            <div className="serif" style={{ fontSize: 20, color: "var(--bone)", marginTop: 10, fontStyle: "italic" }}>{t}</div>
                            <div className="mono" style={{ fontSize: 11, color: "var(--txt-dim)", marginTop: 8, letterSpacing: "0.16em", textTransform: "uppercase" }}>{s}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ===== Reserve Drawer =====
function Field({ label, v, on, placeholder, type = "text" }: { label: string; v: string; on: (v: string) => void; placeholder?: string; type?: string }) {
    return (
        <div>
            <div className="label" style={{ marginBottom: 8 }}>{label}</div>
            <input type={type} value={v} onChange={(e) => on(e.target.value)} placeholder={placeholder} />
        </div>
    );
}

function ReserveDrawer({ open, onClose, prefill }: { open: boolean; onClose: () => void; prefill: { doses: number; type: string; total: number } | null }) {
    const [step, setStep] = useState(1);
    const [data, setData] = useState({
        name: "", whatsapp: "", city: "", uf: "", farm: "",
        doses: prefill?.doses || 100, type: prefill?.type || "conv",
        notes: "",
    });
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (prefill) setData((d) => ({ ...d, doses: prefill.doses, type: prefill.type }));
    }, [prefill]);

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
            setStep(1);
            setDone(false);
        } else {
            document.body.style.overflow = "";
        }
    }, [open]);

    const submit = () => {
        setDone(true);
        const msg = encodeURIComponent(
            `Olá! Quero reservar sêmen do touro Atacante da Matinha (B 3224 MAT.).\n\n` +
            `Nome: ${data.name}\n` +
            `Cidade: ${data.city}/${data.uf}\n` +
            `Fazenda: ${data.farm}\n` +
            `Doses: ${data.doses} (${data.type === "conv" ? "Convencional" : "Sexado"})\n` +
            `${data.notes ? "Obs: " + data.notes : ""}`
        );
        setTimeout(() => window.open(`https://wa.me/5566999778899?text=${msg}`, "_blank"), 600);
    };

    if (!open) return null;

    return (
        <div
            style={{
                position: "fixed", inset: 0, zIndex: 100,
                background: "rgba(10,9,8,0.85)",
                backdropFilter: "blur(8px)",
                display: "flex", justifyContent: "flex-end",
                animation: "atacante-fade-in 0.3s ease",
            }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="leather-bg at-drawer"
                style={{
                    width: "min(560px, 100vw)", height: "100%", overflowY: "auto",
                    borderLeft: "1px solid var(--gold)",
                    animation: "atacante-slide-in 0.4s cubic-bezier(0.2,0.7,0.2,1)",
                }}
            >
                <div className="at-drawer-header" style={{
                    padding: "28px 36px", borderBottom: "1px solid var(--rule)",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    position: "sticky", top: 0, background: "rgba(20,17,15,0.95)", backdropFilter: "blur(8px)", zIndex: 1,
                }}>
                    <div>
                        <div className="kicker">Pré-reserva</div>
                        <div className="serif" style={{ fontSize: 22, color: "var(--bone)", marginTop: 4 }}>Atacante da Matinha</div>
                    </div>
                    <button onClick={onClose} style={{ background: "transparent", border: "1px solid var(--rule)", color: "var(--bone)", width: 38, height: 38, cursor: "pointer", fontSize: 18 }}>×</button>
                </div>

                {done ? (
                    <div style={{ padding: "80px 40px", textAlign: "center" }}>
                        <div className="ticker-num gold-foil" style={{ fontSize: 96, lineHeight: 1 }}>✓</div>
                        <h3 className="serif" style={{ fontSize: 28, color: "var(--bone)", marginTop: 24 }}>Reserva enviada</h3>
                        <p style={{ color: "var(--txt)", marginTop: 16, fontWeight: 300, lineHeight: 1.6 }}>
                            Estamos te redirecionando para o WhatsApp para finalizar com nosso time comercial.
                            Sua posição na lista de pré-reserva já está garantida.
                        </p>
                        <button onClick={onClose} className="btn btn-ghost" style={{ marginTop: 32 }}>Fechar</button>
                    </div>
                ) : (
                    <>
                        <div style={{ padding: "20px 36px", borderBottom: "1px solid var(--rule)", display: "flex", gap: 18, flexWrap: "wrap" }}>
                            {["Pacote", "Contato", "Confirmar"].map((s, i) => (
                                <div key={s} className="mono" style={{
                                    fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase",
                                    color: step >= i + 1 ? "var(--gold)" : "var(--txt-dim)",
                                    display: "flex", alignItems: "center", gap: 8,
                                }}>
                                    <span style={{
                                        width: 20, height: 20, borderRadius: "50%",
                                        border: `1px solid ${step >= i + 1 ? "var(--gold)" : "var(--rule)"}`,
                                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 10, color: step > i + 1 ? "var(--ink)" : "inherit",
                                        background: step > i + 1 ? "var(--gold)" : "transparent",
                                    }}>{step > i + 1 ? "✓" : i + 1}</span>
                                    {s}
                                </div>
                            ))}
                        </div>

                        <div className="at-drawer-pad" style={{ padding: 36 }}>
                            {step === 1 && (
                                <div>
                                    <h3 className="serif" style={{ fontSize: 26, color: "var(--bone)", marginBottom: 24 }}>Quantidade &amp; tipo</h3>
                                    <div style={{ marginBottom: 24 }}>
                                        <div className="label" style={{ marginBottom: 8 }}>Tipo de sêmen</div>
                                        <div style={{ display: "flex", gap: 0, border: "1px solid var(--rule-2)" }}>
                                            {[
                                                { v: "conv", label: "Convencional" },
                                                { v: "sex", label: "Sexado" },
                                            ].map((o) => (
                                                <button key={o.v} onClick={() => setData({ ...data, type: o.v })} style={{
                                                    flex: 1, padding: "14px", cursor: "pointer",
                                                    background: data.type === o.v ? "rgba(201,162,74,0.12)" : "transparent",
                                                    color: data.type === o.v ? "var(--gold-2)" : "var(--txt)",
                                                    border: "none", fontFamily: "var(--mono-atacante)",
                                                    fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase",
                                                }}>{o.label}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: 24 }}>
                                        <div className="label" style={{ marginBottom: 8 }}>Doses</div>
                                        <input type="number" min={1} value={data.doses} onChange={(e) => setData({ ...data, doses: +e.target.value })} />
                                        <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                                            {[50, 100, 250, 500].map((n) => (
                                                <button key={n} onClick={() => setData({ ...data, doses: n })} className="mono" style={{
                                                    padding: "6px 12px", background: "transparent", border: "1px solid var(--rule)",
                                                    color: "var(--txt)", fontSize: 11, cursor: "pointer",
                                                }}>{n}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <button onClick={() => setStep(2)} className="btn btn-gold" style={{ width: "100%", justifyContent: "center" }}>
                                        Continuar
                                        <ArrowIcon />
                                    </button>
                                </div>
                            )}

                            {step === 2 && (
                                <div>
                                    <h3 className="serif" style={{ fontSize: 26, color: "var(--bone)", marginBottom: 24 }}>Seu contato</h3>
                                    <div style={{ display: "grid", gap: 16 }}>
                                        <Field label="Nome completo" v={data.name} on={(v) => setData({ ...data, name: v })} />
                                        <Field label="WhatsApp com DDD" v={data.whatsapp} on={(v) => setData({ ...data, whatsapp: v })} placeholder="(00) 90000-0000" />
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: 16 }}>
                                            <Field label="Cidade" v={data.city} on={(v) => setData({ ...data, city: v })} />
                                            <Field label="UF" v={data.uf} on={(v) => setData({ ...data, uf: v.toUpperCase().slice(0, 2) })} />
                                        </div>
                                        <Field label="Fazenda / Selo" v={data.farm} on={(v) => setData({ ...data, farm: v })} />
                                    </div>
                                    <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
                                        <button onClick={() => setStep(1)} className="btn btn-ghost">Voltar</button>
                                        <button
                                            onClick={() => setStep(3)}
                                            className="btn btn-gold"
                                            style={{ flex: 1, justifyContent: "center", opacity: !data.name || !data.whatsapp ? 0.5 : 1 }}
                                            disabled={!data.name || !data.whatsapp}
                                        >
                                            Revisar
                                            <ArrowIcon />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div>
                                    <h3 className="serif" style={{ fontSize: 26, color: "var(--bone)", marginBottom: 24 }}>Confirme sua reserva</h3>
                                    <div style={{ border: "1px solid var(--rule-2)", padding: 24, marginBottom: 24 }}>
                                        {([
                                            ["Nome", data.name],
                                            ["WhatsApp", data.whatsapp],
                                            ["Cidade", `${data.city}/${data.uf}`],
                                            ["Fazenda", data.farm || "—"],
                                            ["Tipo", data.type === "conv" ? "Convencional" : "Sexado"],
                                            ["Doses", String(data.doses)],
                                        ] as [string, string][]).map(([k, v]) => (
                                            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed var(--rule)" }}>
                                                <span className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: "var(--txt-dim)", textTransform: "uppercase" }}>{k}</span>
                                                <span className="mono" style={{ fontSize: 13, color: "var(--bone)" }}>{v}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginBottom: 24 }}>
                                        <div className="label" style={{ marginBottom: 8 }}>Observações (opcional)</div>
                                        <textarea value={data.notes} onChange={(e) => setData({ ...data, notes: e.target.value })} rows={3} />
                                    </div>
                                    <div style={{ display: "flex", gap: 12 }}>
                                        <button onClick={() => setStep(2)} className="btn btn-ghost">Voltar</button>
                                        <button onClick={submit} className="btn btn-gold" style={{ flex: 1, justifyContent: "center" }}>
                                            Confirmar via WhatsApp
                                            <ArrowIcon />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ===== Main =====
export default function AtacanteMatinhaPage() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [prefill, setPrefill] = useState<{ doses: number; type: string; total: number } | null>(null);

    useEffect(() => {
        const id = "atacante-google-fonts";
        if (!document.getElementById(id)) {
            const preconnect1 = document.createElement("link");
            preconnect1.rel = "preconnect";
            preconnect1.href = "https://fonts.googleapis.com";
            document.head.appendChild(preconnect1);

            const preconnect2 = document.createElement("link");
            preconnect2.rel = "preconnect";
            preconnect2.href = "https://fonts.gstatic.com";
            preconnect2.crossOrigin = "anonymous";
            document.head.appendChild(preconnect2);

            const link = document.createElement("link");
            link.id = id;
            link.rel = "stylesheet";
            link.href = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap";
            document.head.appendChild(link);
        }
    }, []);

    const router = useRouter();
    const openReserve = (data?: { doses: number; type: string; total: number }) => {
        // Redireciona para o checkout dedicado /atacante/checkout (padrão Sertanejo).
        // Prefill via query string para o checkout pré-selecionar a faixa correspondente
        // ao volume de doses clicado.
        const query = data?.doses ? `?doses=${data.doses}` : "";
        router.push(`/atacante/checkout${query}`);
        // Mantém o drawer como fallback (não dispara — drawerOpen continua false).
        setPrefill(data || null);
    };

    return (
        <div className="atacante-wrap">
            <style dangerouslySetInnerHTML={{ __html: atacanteCss }} />
            <BrandBar onReserve={() => openReserve()} />
            <Hero onReserve={() => openReserve()} />
            <Marquee />
            <Identity />
            <NumbersHero />
            <DEPsDetail />
            <Pedigree />
            <Carcaca />
            <Gallery />
            <SemenPricing onReserve={openReserve} />
            <ClosingCTA onReserve={() => openReserve()} />
            <ReserveDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} prefill={prefill} />
        </div>
    );
}
