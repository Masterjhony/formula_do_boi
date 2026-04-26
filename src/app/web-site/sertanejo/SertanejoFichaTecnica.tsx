"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { sertanejoLandingCss } from "./sertanejoLandingCss";

type Row = (string | number)[];

const indices: Row[] = [
    ["MGTe (Mérito Genético Total Econômico)", "20,81", "TOP 16%", "84%", "ANCP"],
    ["MGTe Cruzamento (CR)", "19,79", "TOP 22%", "76%", "ANCP"],
    ["MGTe Reposição (RE)", "23,13", "TOP 10%", "84%", "ANCP"],
    ["MGTe Completo (CO)", "24,95", "TOP 3%", "74%", "ANCP"],
    ["MGTe F1", "25,22", "TOP 2%", "75%", "ANCP"],
    ["iABCZ", "11,37", "DECA 2 · P% 16", "—", "PMGZ/ABCZ"],
];

const depsCrescimento: Row[] = [
    ["Peso ao Nascimento (PN-EDg) — PMGZ", "+0,18 kg", "83%", "DECA 6"],
    ["Peso à Desmama (PD-EDg) — PMGZ", "+3,68 kg", "83%", "DECA 4"],
    ["Peso ao Ano (PA-EDg) — PMGZ", "+5,15 kg", "79%", "DECA 4"],
    ["Peso ao Sobreano (PS-EDg) — PMGZ", "+8,93 kg", "82%", "DECA 3"],
    ["Peso 120 dias (DP120G) — ANCP", "+5,44 kg", "80%", "TOP 21%"],
    ["Peso 210 dias (DP210G) — ANCP", "+9,98 kg", "83%", "TOP 21%"],
    ["Peso 365 dias (DP365G) — ANCP", "+19,57 kg", "89%", "TOP 18%"],
    ["Peso 450 dias (DP450G) — ANCP", "+21,07 kg", "87%", "TOP 15%"],
];

const depsReprod: Row[] = [
    ["Idade ao Primeiro Parto (IPPg) — dias", "−8,65", "55%", "DECA 3"],
    ["Stayability (STAYg) — %", "+45,99", "21%", "DECA 2"],
    ["Perímetro Escrotal 450 (DPE450G) — ANCP", "+0,95", "83%", "TOP 20%"],
    ["Stayability (DSTAY54G) — ANCP", "+55,75", "85%", "TOP 18%"],
];

const depsCarcaca: Row[] = [
    ["Área de Olho de Lombo (AOLg) — PMGZ", "+1,810 cm²", "77%", "DECA 2"],
    ["Acabamento (ACABg) — PMGZ", "+4,469 mm", "68%", "DECA 1"],
    ["Marmoreio (MARg) — PMGZ", "+2,97 %", "55%", "DECA 1"],
    ["AOL (DAOLG) — ANCP", "+3,77", "86%", "TOP 7%"],
    ["Acabamento (DACABG) — ANCP", "+0,43", "84%", "TOP 12%"],
    ["Marmoreio (DMARG) — ANCP", "+0,44", "80%", "TOP 0,1%"],
];

const depsMorf: Row[] = [
    ["Estrutura Corporal (Eg)", "+2,145", "51%", "DECA 1"],
    ["Precocidade (Pg)", "+1,705", "51%", "DECA 3"],
    ["Musculosidade (Mg)", "+1,117", "51%", "DECA 4"],
    ["Frame (DFRAMEG) — ANCP", "+0,028", "76%", "TOP 44%"],
    ["Mocho (DMOCHOG) — ANCP", "+21,01", "95%", "TOP 93%"],
];

function Corners({ color = "var(--st-gold-deep)", size = 14 }: { color?: string; size?: number }) {
    const s: React.CSSProperties = { position: "absolute", width: size, height: size, borderColor: color, pointerEvents: "none" };
    return (
        <>
            <span style={{ ...s, top: 8, left: 8, borderTop: "1px solid", borderLeft: "1px solid" }} />
            <span style={{ ...s, top: 8, right: 8, borderTop: "1px solid", borderRight: "1px solid" }} />
            <span style={{ ...s, bottom: 8, left: 8, borderBottom: "1px solid", borderLeft: "1px solid" }} />
            <span style={{ ...s, bottom: 8, right: 8, borderBottom: "1px solid", borderRight: "1px solid" }} />
        </>
    );
}

function TagPill({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
    if (dark) {
        return (
            <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "8px 18px", border: "1px solid var(--st-rule-2)",
                background: "rgba(201,162,74,0.08)",
                fontFamily: "var(--st-mono)", fontSize: 10, letterSpacing: "0.28em",
                textTransform: "uppercase", color: "var(--st-gold-2)", fontWeight: 600,
                marginBottom: 24,
            }}>
                <span style={{ color: "var(--st-gold)" }}>●</span> {children}
            </div>
        );
    }
    return (
        <div className="tag-pill" style={{ marginBottom: 24 }}>{children}</div>
    );
}

function ClassChip({ value }: { value: string }) {
    const isTop = /^TOP/i.test(value);
    const isDeca = /^DECA/i.test(value);
    const decaNum = isDeca ? parseInt(value.replace(/[^\d]/g, ""), 10) : 0;
    let color = "var(--st-gold-deep)";
    let bg = "rgba(201,162,74,0.10)";
    if (isTop) {
        const pct = parseFloat(value.replace(/[^\d.,]/g, "").replace(",", "."));
        if (!isNaN(pct) && pct <= 5) {
            color = "var(--st-gold)";
            bg = "rgba(201,162,74,0.20)";
        }
    } else if (isDeca && decaNum <= 2) {
        color = "#7a9a55";
        bg = "rgba(122,154,85,0.15)";
    }
    return (
        <span className="mono" style={{
            display: "inline-block",
            padding: "5px 12px", fontSize: 10, letterSpacing: "0.18em",
            textTransform: "uppercase", border: `1px solid ${color}`,
            color, background: bg, fontWeight: 600,
        }}>{value}</span>
    );
}

function DataTable({ headers, rows, lastIsClass = true }: { headers: string[]; rows: Row[]; lastIsClass?: boolean }) {
    return (
        <div className="ft-table-wrap">
            <table className="ft-table">
                <thead>
                    <tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i}>
                            {row.map((cell, j) => (
                                <td key={j} className={j === 0 ? "ft-cell-label" : "ft-cell-value"}>
                                    {lastIsClass && j === row.length - 1 && j !== 0 && typeof cell === "string" && (cell.startsWith("TOP") || cell.startsWith("DECA"))
                                        ? <ClassChip value={cell} />
                                        : cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function SertanejoFichaTecnica() {
    useEffect(() => {
        // Inject Google Fonts
        const fontId = "sertanejo-v2-google-fonts";
        if (typeof document !== "undefined" && !document.getElementById(fontId)) {
            const pre1 = document.createElement("link");
            pre1.rel = "preconnect";
            pre1.href = "https://fonts.googleapis.com";
            document.head.appendChild(pre1);

            const pre2 = document.createElement("link");
            pre2.rel = "preconnect";
            pre2.href = "https://fonts.gstatic.com";
            pre2.crossOrigin = "anonymous";
            document.head.appendChild(pre2);

            const link = document.createElement("link");
            link.id = fontId;
            link.rel = "stylesheet";
            link.href = "https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap";
            document.head.appendChild(link);
        }

        const scriptId = "sertanejo-chartjs";
        let script = document.getElementById(scriptId) as HTMLScriptElement | null;
        const initIfReady = () => {
            if ((window as any).Chart) initCharts();
        };
        if (!script) {
            script = document.createElement("script");
            script.id = scriptId;
            script.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js";
            script.async = true;
            script.onload = initIfReady;
            document.body.appendChild(script);
        } else {
            initIfReady();
        }
    }, []);

    const initCharts = () => {
        const Chart = (window as any).Chart;
        if (!Chart) return;

        // ---- Bar chart ----
        const depCanvas = document.getElementById("ftDepChart") as HTMLCanvasElement | null;
        if (depCanvas) {
            const existing = Chart.getChart?.(depCanvas);
            if (existing) existing.destroy();
            const labels = ["Peso 450d (DP450G)", "Peso 365d (DP365G)", "Peso 210d (DP210G)", "Peso 120d (DP120G)", "AOL (DAOLG)", "Acabamento (DACABG)", "Marmoreio (DMARG)", "PE 450 (DPE450G)", "Stayability (DSTAY54G)", "MGTe"];
            const values = [21.07, 19.57, 9.98, 5.44, 3.77, 0.43, 0.44, 0.95, 55.75, 20.81];
            const tops = [15, 18, 21, 21, 7, 12, 0.1, 20, 18, 16];
            const max = Math.max(...values);
            const norm = values.map((v) => (v / max) * 100);

            new Chart(depCanvas.getContext("2d"), {
                type: "bar",
                data: {
                    labels,
                    datasets: [{
                        label: "DEP (normalizada)",
                        data: norm,
                        backgroundColor: tops.map((t) =>
                            t <= 5 ? "rgba(227, 194, 121, 1)"
                                : t <= 15 ? "rgba(201, 162, 74, 0.95)"
                                : t <= 25 ? "rgba(160, 115, 52, 0.85)"
                                : "rgba(138, 106, 38, 0.6)"
                        ),
                        borderColor: "rgba(201,162,74,0.6)",
                        borderWidth: 1,
                        borderRadius: 4,
                        borderSkipped: false,
                    }],
                },
                options: {
                    indexAxis: "y",
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: { padding: { right: 60 } },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: "rgba(10,9,8,0.92)",
                            borderColor: "rgba(201,162,74,0.45)",
                            borderWidth: 1,
                            titleColor: "#e3c279",
                            bodyColor: "#f4ede0",
                            padding: 12,
                            callbacks: {
                                label: (ctx: any) => `DEP: ${values[ctx.dataIndex]} · TOP ${tops[ctx.dataIndex]}%`,
                            },
                        },
                    },
                    scales: {
                        x: { display: false, max: 130 },
                        y: {
                            ticks: { font: { family: "JetBrains Mono", size: 12, weight: 600 }, color: "#1a1714" },
                            grid: { display: false },
                        },
                    },
                },
                plugins: [{
                    id: "topLabels",
                    afterDatasetsDraw(chart: any) {
                        const ctx = chart.ctx;
                        chart.data.datasets[0].data.forEach((_v: number, i: number) => {
                            const meta = chart.getDatasetMeta(0);
                            const bar = meta.data[i];
                            if (bar) {
                                ctx.save();
                                ctx.fillStyle = "#8a6a26";
                                ctx.font = "700 11px JetBrains Mono";
                                ctx.textAlign = "left";
                                ctx.textBaseline = "middle";
                                ctx.fillText(`TOP ${tops[i]}%`, bar.x + 8, bar.y);
                                ctx.restore();
                            }
                        });
                    },
                }],
            });
        }

        // ---- Radar chart ----
        const radarCanvas = document.getElementById("ftRadarChart") as HTMLCanvasElement | null;
        if (radarCanvas) {
            const existing = Chart.getChart?.(radarCanvas);
            if (existing) existing.destroy();
            new Chart(radarCanvas.getContext("2d"), {
                type: "radar",
                data: {
                    labels: ["Estrutura Corporal", "Precocidade", "Musculosidade", "Marmoreio", "AOL", "Acabamento"],
                    datasets: [
                        {
                            label: "Sertanejo (DECA)",
                            data: [10, 8, 7, 10, 9, 10],
                            backgroundColor: "rgba(201,162,74,0.18)",
                            borderColor: "#c9a24a",
                            borderWidth: 2,
                            pointBackgroundColor: "#e3c279",
                            pointBorderColor: "#1a1714",
                            pointBorderWidth: 2,
                            pointRadius: 5,
                        },
                        {
                            label: "Média da raça (DECA 5)",
                            data: [5, 5, 5, 5, 5, 5],
                            backgroundColor: "rgba(138,106,38,0.04)",
                            borderColor: "rgba(138,106,38,0.5)",
                            borderWidth: 1,
                            borderDash: [5, 5],
                            pointRadius: 0,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: { padding: 30 },
                    plugins: {
                        legend: {
                            labels: { font: { family: "JetBrains Mono", size: 11 }, color: "#1a1714", usePointStyle: true },
                        },
                    },
                    scales: {
                        r: {
                            min: 0, max: 10,
                            ticks: { display: false },
                            grid: { color: "rgba(138,106,38,0.18)" },
                            angleLines: { color: "rgba(138,106,38,0.18)" },
                            pointLabels: { font: { family: "JetBrains Mono", size: 11, weight: 600 }, color: "#1a1714" },
                        },
                    },
                },
            });
        }
    };

    return (
        <div className="sertanejo-v2-wrap">
            <style dangerouslySetInnerHTML={{ __html: sertanejoLandingCss }} />
            <style dangerouslySetInnerHTML={{ __html: fichaCss }} />

            {/* Promo bar */}
            <div className="sert-dark-leather" style={{
                padding: "8px 20px", textAlign: "center",
                borderBottom: "1px solid rgba(201,162,74,0.18)",
            }}>
                <span className="mono" style={{
                    fontSize: 9, letterSpacing: "0.36em", color: "var(--st-gold-2)",
                    textTransform: "uppercase", fontWeight: 500,
                }}>
                    Aceleradora de Touros · Lançamento 2026
                </span>
            </div>

            {/* Sticky Nav */}
            <nav className="sert-dark-leather" style={{
                position: "sticky", top: 0, zIndex: 50,
                borderBottom: "1px solid var(--st-rule-2)",
            }}>
                <div className="ft-wrap" style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "16px 0", gap: 16,
                }}>
                    <Link href="/sertanejo" style={{ display: "flex", alignItems: "center", gap: 12 }} aria-label="Voltar para Sertanejo">
                        <img src="/assets/sertanejo/logo-horizontal-white.png" alt="Fórmula do Boi" style={{ height: 30, width: "auto", display: "block" }} />
                    </Link>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <Link href="/sertanejo" className="mono nav-link-back" style={{
                            fontSize: 11, letterSpacing: "0.22em", color: "var(--st-bone-2)",
                            textTransform: "uppercase",
                            display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
                            border: "1px solid var(--st-rule)", transition: "all 0.2s",
                        }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--st-gold)";
                                (e.currentTarget as HTMLAnchorElement).style.color = "var(--st-gold-2)";
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--st-rule)";
                                (e.currentTarget as HTMLAnchorElement).style.color = "var(--st-bone-2)";
                            }}>
                            ← Voltar para Sertanejo
                        </Link>
                        <Link href="/sertanejo/checkout" className="btn btn-gold" style={{ padding: "11px 20px", fontSize: 10 }}>
                            Reservar dose
                        </Link>
                    </div>
                </div>
                <div style={{
                    height: 1,
                    background: "linear-gradient(90deg, transparent, var(--st-gold) 30%, var(--st-gold) 70%, transparent)",
                    opacity: 0.35,
                }} />
            </nav>

            {/* HERO */}
            <section className="ft-section sert-dark-leather">
                <div className="ft-wrap">
                    <TagPill dark>Ficha Técnica · Documento Oficial</TagPill>
                    <h1 className="serif-tight" style={{
                        fontSize: "clamp(48px, 8vw, 120px)", color: "var(--st-bone)",
                        marginBottom: 12, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 0.95,
                    }}>
                        Ficha <em style={{ color: "var(--st-gold-2)" }}>técnica.</em>
                    </h1>
                    <p style={{
                        fontSize: 17, color: "var(--st-txt)", maxWidth: 720,
                        fontWeight: 300, lineHeight: 1.6, marginBottom: 48,
                    }}>
                        Sertanejo TE Terra Brava · Reg. EPCF 2315 · Nelore PO. Avaliação genética
                        completa: ANCP (5ª AG · DEZ/2025) e PMGZ/ABCZ (Avaliação Genética 2026-1).
                    </p>

                    <div className="ft-hero-stats">
                        {([
                            ["MGTe", "20,81", "TOP 16%"],
                            ["iABCZ", "11,37", "DECA 2"],
                            ["AOL", "+3,77", "TOP 7%"],
                            ["Marmoreio", "+0,44", "TOP 0,1%"],
                            ["DEP Peso 450d", "+21,07", "TOP 15%"],
                            ["Stayability", "+55,75", "TOP 18%"],
                        ] as [string, string, string][]).map(([label, value, tier], i) => (
                            <div key={label} style={{
                                padding: "24px 22px", position: "relative",
                                borderRight: i % 3 === 2 ? "none" : "1px solid var(--st-rule-2)",
                                borderBottom: i < 3 ? "1px solid var(--st-rule-2)" : "none",
                            }}>
                                <div className="mono" style={{
                                    fontSize: 10, letterSpacing: "0.22em", color: "var(--st-gold-2)",
                                    textTransform: "uppercase", marginBottom: 10, fontWeight: 600,
                                }}>{label}</div>
                                <div className="serif-tight" style={{
                                    fontSize: "clamp(36px, 4vw, 56px)", color: "var(--st-bone)",
                                    fontWeight: 500, lineHeight: 1,
                                }}>{value}</div>
                                <div className="mono" style={{
                                    fontSize: 10, letterSpacing: "0.18em", color: "var(--st-gold)",
                                    textTransform: "uppercase", marginTop: 8,
                                }}>{tier}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* GENEALOGIA — light editorial */}
            <section className="ft-section ft-light">
                <div className="ft-wrap">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 56, flexWrap: "wrap", gap: 24 }}>
                        <div>
                            <TagPill>Genealogia · 3 Gerações</TagPill>
                            <h2 className="serif-tight" style={{
                                fontSize: "clamp(36px, 5vw, 72px)", color: "var(--st-ink-soft)",
                                maxWidth: 720, fontWeight: 500, letterSpacing: "-0.02em",
                            }}>
                                Linhagem <em style={{ color: "var(--st-gold-deep)" }}>Terra Brava.</em>
                            </h2>
                        </div>
                        <div className="mono" style={{
                            fontSize: 11, letterSpacing: "0.18em", color: "var(--st-gold-deep)",
                            textTransform: "uppercase", textAlign: "right",
                        }}>
                            Reg. EPCF 2315<br />
                            Nelore PO · TE
                        </div>
                    </div>

                    <div className="ft-gen-tree">
                        {/* Self */}
                        <div className="ft-gen-col ft-gen-self">
                            <GenNode strong gen="Touro · F0" name="Sertanejo Terra Brava" sub="EPCF 2315" mgte="20,81" top="TOP 16%" />
                        </div>
                        {/* Parents */}
                        <div className="ft-gen-col">
                            <GenNode gen="Pai" name="1070 da Terra Brava" sub="EPCF 1070" mgte="19,35" top="TOP 20%" />
                            <GenNode gen="Mãe" name="1381 FIV da Terra Brava" sub="EPCF 1381" mgte="22,43" top="TOP 13%" />
                        </div>
                        {/* Grandparents */}
                        <div className="ft-gen-col">
                            <GenNode small gen="Avô paterno" name="Bitelo DS" sub="TECO 105" mgte="14,29" top="TOP 33%" />
                            <GenNode small gen="Avó paterna" name="Harpa I FIV Terra Brava" sub="EPCF 108" mgte="17,09" top="TOP 25%" />
                            <GenNode small gen="Avô materno" name="D4685 da MN" sub="LBMN D4685" mgte="20,33" top="TOP 17%" />
                            <GenNode small gen="Avó materna" name="940 FIV Terra Brava" sub="EPCF 940" mgte="17,67" top="TOP 24%" />
                        </div>
                    </div>

                    {/* CTA inline */}
                    <div style={{
                        marginTop: 56, padding: "24px 28px",
                        border: "1px solid rgba(138,106,38,0.3)",
                        background: "rgba(255,253,247,0.6)",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        gap: 24, flexWrap: "wrap",
                    }}>
                        <div>
                            <div className="mono" style={{
                                fontSize: 10, letterSpacing: "0.22em", color: "var(--st-gold-deep)",
                                textTransform: "uppercase", marginBottom: 6, fontWeight: 600,
                            }}>Genética de elite comprovada</div>
                            <div className="serif" style={{ fontSize: 18, color: "var(--st-ink-soft)", fontStyle: "italic" }}>
                                Consulte o valor da dose e reserve agora.
                            </div>
                        </div>
                        <Link href="/sertanejo/checkout" className="btn btn-green">
                            ⛛ Ver valor da dose
                        </Link>
                    </div>
                </div>
            </section>

            {/* ÍNDICES GENÉTICOS — dark */}
            <section className="ft-section sert-dark-leather" style={{ borderTop: "1px solid var(--st-rule-2)" }}>
                <div className="ft-wrap">
                    <TagPill dark>Índices Genéticos</TagPill>
                    <h2 className="serif-tight" style={{
                        fontSize: "clamp(32px, 4.5vw, 60px)", color: "var(--st-bone)",
                        marginBottom: 14, fontWeight: 500,
                    }}>
                        Mérito <em style={{ color: "var(--st-gold-2)" }}>genético total.</em>
                    </h2>
                    <p style={{
                        fontSize: 15, color: "var(--st-txt)", maxWidth: 660,
                        fontWeight: 300, lineHeight: 1.6, marginBottom: 40,
                    }}>
                        Avaliação ANCP — 5ª AG DEZ/2025 e PMGZ/ABCZ — 2026-1. Consulta de cada
                        critério em condições de uso reais.
                    </p>
                    <DataTable
                        headers={["Índice", "Valor", "Classificação", "Acurácia", "Fonte"]}
                        rows={indices}
                    />
                </div>
            </section>

            {/* DEPs CRESCIMENTO — light */}
            <section className="ft-section ft-light">
                <div className="ft-wrap">
                    <TagPill>DEPs · Crescimento</TagPill>
                    <h2 className="serif-tight" style={{
                        fontSize: "clamp(32px, 4.5vw, 60px)", color: "var(--st-ink-soft)",
                        marginBottom: 14, fontWeight: 500,
                    }}>
                        Curva de <em style={{ color: "var(--st-gold-deep)" }}>peso e ganho.</em>
                    </h2>
                    <p style={{
                        fontSize: 15, color: "var(--st-ink-soft)", opacity: 0.75, maxWidth: 660,
                        lineHeight: 1.6, marginBottom: 40,
                    }}>
                        Fonte: PMGZ/ABCZ — Avaliação Genética 2026-1 e ANCP — 5ª AG DEZ/2025.
                    </p>
                    <DataTable
                        headers={["Característica", "DEP", "Acurácia", "Classificação"]}
                        rows={depsCrescimento}
                    />
                </div>
            </section>

            {/* DEPs REPRODUTIVAS — dark */}
            <section className="ft-section sert-dark-leather" style={{ borderTop: "1px solid var(--st-rule-2)" }}>
                <div className="ft-wrap">
                    <TagPill dark>DEPs · Reprodutivas</TagPill>
                    <h2 className="serif-tight" style={{
                        fontSize: "clamp(32px, 4.5vw, 60px)", color: "var(--st-bone)",
                        marginBottom: 14, fontWeight: 500,
                    }}>
                        Performance <em style={{ color: "var(--st-gold-2)" }}>reprodutiva.</em>
                    </h2>
                    <p style={{
                        fontSize: 15, color: "var(--st-txt)", maxWidth: 660,
                        fontWeight: 300, lineHeight: 1.6, marginBottom: 40,
                    }}>
                        Idade ao primeiro parto, stayability e perímetro escrotal — métricas que
                        definem rentabilidade no manejo.
                    </p>
                    <DataTable
                        headers={["Característica", "DEP", "Acurácia", "Classificação"]}
                        rows={depsReprod}
                    />
                </div>
            </section>

            {/* DEPs CARCAÇA — light */}
            <section className="ft-section ft-light">
                <div className="ft-wrap">
                    <TagPill>DEPs · Carcaça</TagPill>
                    <h2 className="serif-tight" style={{
                        fontSize: "clamp(32px, 4.5vw, 60px)", color: "var(--st-ink-soft)",
                        marginBottom: 14, fontWeight: 500,
                    }}>
                        AOL, acabamento e <em style={{ color: "var(--st-gold-deep)" }}>marmoreio.</em>
                    </h2>
                    <p style={{
                        fontSize: 15, color: "var(--st-ink-soft)", opacity: 0.75, maxWidth: 660,
                        lineHeight: 1.6, marginBottom: 40,
                    }}>
                        O frigorífico paga o que o Sertanejo entrega — carcaças pesadas, bem
                        acabadas, com marmoreio TOP 0,1% da raça.
                    </p>
                    <DataTable
                        headers={["Característica", "DEP", "Acurácia", "Classificação"]}
                        rows={depsCarcaca}
                    />
                </div>
            </section>

            {/* AVALIAÇÃO MORFOLÓGICA + RADAR — light */}
            <section className="ft-section ft-light" style={{ borderTop: "1px solid rgba(138,106,38,0.2)" }}>
                <div className="ft-wrap">
                    <TagPill>Avaliação Morfológica</TagPill>
                    <h2 className="serif-tight" style={{
                        fontSize: "clamp(32px, 4.5vw, 60px)", color: "var(--st-ink-soft)",
                        marginBottom: 40, fontWeight: 500,
                    }}>
                        Estrutura, precocidade e <em style={{ color: "var(--st-gold-deep)" }}>musculosidade.</em>
                    </h2>

                    <div className="ft-morf-grid">
                        <DataTable
                            headers={["Característica", "DEP", "Acurácia", "DECA"]}
                            rows={depsMorf}
                        />
                        <div style={{
                            position: "relative", padding: 24,
                            border: "1px solid rgba(138,106,38,0.3)",
                            background: "rgba(255,253,247,0.7)",
                            minHeight: 420,
                        }}>
                            <Corners color="var(--st-gold-deep)" />
                            <div className="mono" style={{
                                position: "absolute", top: 18, left: 24,
                                fontSize: 10, letterSpacing: "0.22em", color: "var(--st-gold-deep)",
                                textTransform: "uppercase", fontWeight: 600,
                            }}>Radar comparativo</div>
                            <div style={{ height: 380, marginTop: 30 }}>
                                <canvas id="ftRadarChart" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* DEPs GRÁFICAS — dark */}
            <section className="ft-section sert-dark-leather" style={{ borderTop: "1px solid var(--st-rule-2)" }}>
                <div className="ft-wrap">
                    <TagPill dark>DEPs Gráficas · ANCP</TagPill>
                    <h2 className="serif-tight" style={{
                        fontSize: "clamp(32px, 4.5vw, 60px)", color: "var(--st-bone)",
                        marginBottom: 14, fontWeight: 500,
                    }}>
                        Posição na <em style={{ color: "var(--st-gold-2)" }}>raça Nelore.</em>
                    </h2>
                    <p style={{
                        fontSize: 15, color: "var(--st-txt)", maxWidth: 660,
                        fontWeight: 300, lineHeight: 1.6, marginBottom: 48,
                    }}>
                        Barras horizontais — posição relativa nas principais DEPs frente à média
                        da raça. Tons mais claros indicam melhor posicionamento.
                    </p>
                    <div style={{
                        position: "relative",
                        padding: 24,
                        border: "1px solid var(--st-rule-2)",
                        background: "linear-gradient(180deg, rgba(28,24,22,0.7), rgba(20,17,15,0.85))",
                    }}>
                        <Corners color="var(--st-gold)" />
                        <div style={{ height: 480, marginTop: 14 }}>
                            <canvas id="ftDepChart" />
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA FINAL — dark */}
            <section className="ft-section sert-dark-leather" style={{ borderTop: "1px solid var(--st-rule-2)" }}>
                <div className="ft-wrap" style={{ textAlign: "center" }}>
                    <TagPill dark>Reservar agora</TagPill>
                    <h2 className="serif-tight" style={{
                        fontSize: "clamp(40px, 6vw, 88px)", color: "var(--st-bone)",
                        marginBottom: 20, fontWeight: 500,
                    }}>
                        Pronto para <em style={{ color: "var(--st-gold-2)" }}>investir.</em>
                    </h2>
                    <p style={{
                        fontSize: 16, color: "var(--st-txt)", maxWidth: 600,
                        margin: "0 auto 40px", fontWeight: 300, lineHeight: 1.6,
                    }}>
                        Genética comprovada, dados oficiais ANCP e PMGZ/ABCZ. Acelere sua próxima
                        safra de bezerros com o Sertanejo Terra Brava.
                    </p>
                    <div style={{
                        display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap",
                    }}>
                        <Link href="/sertanejo/checkout" className="btn btn-green">
                            ⛛ Ver valor da dose
                        </Link>
                        <a
                            href="/assets/sertanejo/SERTANEJO_PMGZ.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost-dark"
                        >
                            ↗ Ficha técnica oficial · PDF
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}

function GenNode({
    gen, name, sub, mgte, top, strong = false, small = false,
}: {
    gen: string; name: string; sub: string; mgte: string; top: string;
    strong?: boolean; small?: boolean;
}) {
    return (
        <div style={{
            position: "relative",
            padding: small ? "16px 18px" : strong ? "24px 22px" : "20px 20px",
            background: strong
                ? "linear-gradient(135deg, rgba(201,162,74,0.12), rgba(244,237,224,0.85))"
                : "rgba(255,253,247,0.7)",
            border: `1px solid ${strong ? "var(--st-gold-deep)" : "rgba(138,106,38,0.30)"}`,
            minHeight: small ? 96 : strong ? 130 : 110,
        }}>
            {strong && <Corners color="var(--st-gold-deep)" size={12} />}
            <div className="mono" style={{
                fontSize: 9, letterSpacing: "0.22em", color: "var(--st-gold-deep)",
                textTransform: "uppercase", marginBottom: 8, fontWeight: 600,
            }}>{gen}</div>
            <div className="serif" style={{
                fontSize: small ? 15 : strong ? 22 : 18,
                color: "var(--st-ink-soft)", fontWeight: 500, lineHeight: 1.2, marginBottom: 6,
            }}>{name}</div>
            <div className="mono" style={{
                fontSize: 10, color: "var(--st-ink-soft)", opacity: 0.55,
                letterSpacing: "0.10em", marginBottom: 10,
            }}>{sub}</div>
            <div style={{ display: "flex", gap: 12, fontSize: 10, fontFamily: "var(--st-mono)" }}>
                <span style={{ color: "var(--st-gold-deep)", fontWeight: 600 }}>MGTe {mgte}</span>
                <span style={{ color: "var(--st-ink-soft)", opacity: 0.55 }}>· {top}</span>
            </div>
        </div>
    );
}

const fichaCss = `
.sertanejo-v2-wrap .ft-wrap { max-width: 1200px; margin: 0 auto; padding: 0 clamp(20px, 5vw, 60px); }
.sertanejo-v2-wrap .ft-section { padding: clamp(60px, 8vw, 110px) 0; position: relative; }

.sertanejo-v2-wrap .ft-light { background: rgba(255,253,247,0.4); color: var(--st-ink-soft); }

.sertanejo-v2-wrap .ft-hero-stats {
  display: grid; grid-template-columns: repeat(3, 1fr);
  border: 1px solid var(--st-rule-2);
  background: rgba(0,0,0,0.25);
}
@media (max-width: 900px) {
  .sertanejo-v2-wrap .ft-hero-stats { grid-template-columns: repeat(2, 1fr); }
  .sertanejo-v2-wrap .ft-hero-stats > div { border-right: 1px solid var(--st-rule-2) !important; border-bottom: 1px solid var(--st-rule-2) !important; }
  .sertanejo-v2-wrap .ft-hero-stats > div:nth-child(2n) { border-right: none !important; }
  .sertanejo-v2-wrap .ft-hero-stats > div:nth-last-child(-n+2) { border-bottom: none !important; }
}
@media (max-width: 520px) {
  .sertanejo-v2-wrap .ft-hero-stats { grid-template-columns: 1fr; }
  .sertanejo-v2-wrap .ft-hero-stats > div { border-right: none !important; border-bottom: 1px solid var(--st-rule-2) !important; }
  .sertanejo-v2-wrap .ft-hero-stats > div:last-child { border-bottom: none !important; }
}

/* Genealogy tree */
.sertanejo-v2-wrap .ft-gen-tree {
  display: grid;
  grid-template-columns: 1fr 1fr 1.2fr;
  gap: 22px;
  align-items: stretch;
  position: relative;
}
.sertanejo-v2-wrap .ft-gen-col {
  display: flex; flex-direction: column; gap: 14px; justify-content: center;
}
.sertanejo-v2-wrap .ft-gen-self { justify-content: center; }
@media (max-width: 900px) {
  .sertanejo-v2-wrap .ft-gen-tree { grid-template-columns: 1fr; gap: 14px; }
}

/* Tables */
.sertanejo-v2-wrap .ft-table-wrap {
  border: 1px solid var(--st-rule-2);
  background: rgba(0,0,0,0.25);
  overflow-x: auto;
}
.sertanejo-v2-wrap .ft-light .ft-table-wrap {
  background: rgba(255,253,247,0.7);
  border-color: rgba(138,106,38,0.3);
}
.sertanejo-v2-wrap .ft-table {
  width: 100%; border-collapse: collapse; font-family: var(--st-sans);
  min-width: 600px;
}
.sertanejo-v2-wrap .ft-table th {
  text-align: left; font-family: var(--st-mono);
  font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--st-gold-2); font-weight: 600;
  padding: 16px 20px; border-bottom: 1px solid var(--st-rule-2);
  background: rgba(0,0,0,0.3);
}
.sertanejo-v2-wrap .ft-light .ft-table th {
  color: var(--st-gold-deep);
  border-bottom-color: rgba(138,106,38,0.3);
  background: rgba(255,253,247,0.5);
}
.sertanejo-v2-wrap .ft-table td {
  padding: 16px 20px;
  border-bottom: 1px solid var(--st-rule);
  font-size: 14px;
  vertical-align: middle;
}
.sertanejo-v2-wrap .ft-light .ft-table td {
  border-bottom-color: rgba(138,106,38,0.15);
  color: var(--st-ink-soft);
}
.sertanejo-v2-wrap .ft-table tr:last-child td { border-bottom: none; }
.sertanejo-v2-wrap .ft-table .ft-cell-label { color: var(--st-bone-2); font-weight: 400; }
.sertanejo-v2-wrap .ft-light .ft-table .ft-cell-label { color: var(--st-ink-soft); font-weight: 500; }
.sertanejo-v2-wrap .ft-table .ft-cell-value {
  font-family: var(--st-mono); font-weight: 600;
  color: var(--st-bone);
  font-feature-settings: "tnum", "lnum";
}
.sertanejo-v2-wrap .ft-light .ft-table .ft-cell-value { color: var(--st-ink-soft); }
.sertanejo-v2-wrap .ft-table tr:hover td { background: rgba(201,162,74,0.05); }

/* Morfo grid */
.sertanejo-v2-wrap .ft-morf-grid {
  display: grid; grid-template-columns: 1.2fr 1fr; gap: 32px; align-items: start;
}
@media (max-width: 1000px) {
  .sertanejo-v2-wrap .ft-morf-grid { grid-template-columns: 1fr; }
}
`;
