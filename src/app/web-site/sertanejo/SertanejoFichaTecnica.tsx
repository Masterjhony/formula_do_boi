"use client";

import React, { useEffect } from "react";

export default function SertanejoFichaTecnica() {
    useEffect(() => {
        // Load Chart.js dynamically
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js";
        script.async = true;
        script.onload = () => {
            initCharts();
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const initCharts = () => {
        if (!(window as any).Chart) return;
        
        // Horizontal Bar Chart
        const depCanvas = document.getElementById('depChart') as HTMLCanvasElement;
        if (depCanvas) {
            const depCtx = depCanvas.getContext('2d');
            const depLabels = ['Peso 450d (DP450G)', 'Peso 365d (DP365G)', 'Peso 210d (DP210G)', 'Peso 120d (DP120G)', 'AOL (DAOLG)', 'Acabamento (DACABG)', 'Marmoreio (DMARG)', 'PE 450 (DPE450G)', 'Stayability (DSTAY54G)', 'MGTe'];
            const depValues = [21.07, 19.57, 9.98, 5.44, 3.77, 0.43, 0.44, 0.95, 55.75, 20.81];
            const depTopPercent = [15, 18, 21, 21, 7, 12, 0.1, 20, 18, 16];
            const maxVal = Math.max(...depValues);
            const normalizedValues = depValues.map(v => (v / maxVal) * 100);

            new (window as any).Chart(depCtx, {
                type: 'bar',
                data: {
                    labels: depLabels,
                    datasets: [{
                        label: 'DEP (normalizada)',
                        data: normalizedValues,
                        backgroundColor: depTopPercent.map(t =>
                            t <= 5 ? 'rgba(197, 160, 89, 1)' :
                            t <= 15 ? 'rgba(197, 160, 89, 0.8)' :
                            t <= 25 ? 'rgba(197, 160, 89, 0.6)' :
                            'rgba(197, 160, 89, 0.4)'
                        ),
                        borderRadius: 6,
                        borderSkipped: false,
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context: any) {
                                    const idx = context.dataIndex;
                                    return `DEP: ${depValues[idx]} | TOP ${depTopPercent[idx]}%`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: { display: false, max: 110 },
                        y: {
                            ticks: { font: { family: 'Montserrat', size: 12, weight: '600' }, color: '#141413' },
                            grid: { display: false }
                        }
                    }
                },
                plugins: [{
                    id: 'customLabels',
                    afterDatasetsDraw: function(chart: any) {
                        const ctx = chart.ctx;
                        chart.data.datasets[0].data.forEach((value: any, index: number) => {
                            const meta = chart.getDatasetMeta(0);
                            const bar = meta.data[index];
                            if (bar) {
                                ctx.save();
                                ctx.fillStyle = '#C5A059';
                                ctx.font = '700 11px Montserrat';
                                ctx.textAlign = 'left';
                                ctx.textBaseline = 'middle';
                                ctx.fillText(`TOP ${depTopPercent[index]}%`, bar.x + 8, bar.y);
                                ctx.restore();
                            }
                        });
                    }
                }]
            });
        }

        // Radar Chart
        const radarCanvas = document.getElementById('radarChart') as HTMLCanvasElement;
        if (radarCanvas) {
            const radarCtx = radarCanvas.getContext('2d');
            new (window as any).Chart(radarCtx, {
                type: 'radar',
                data: {
                    labels: ['Estrutura Corporal', 'Precocidade', 'Musculosidade', 'Marmoreio', 'AOL', 'Acabamento'],
                    datasets: [{
                        label: 'Sertanejo (DECA)',
                        data: [10, 8, 7, 10, 9, 10], // Inversão: DECA 1 = melhor = 10
                        backgroundColor: 'rgba(197, 160, 89, 0.15)',
                        borderColor: '#C5A059',
                        borderWidth: 2,
                        pointBackgroundColor: '#C5A059',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                    }, {
                        label: 'Média da raça (DECA 5)',
                        data: [5, 5, 5, 5, 5, 5],
                        backgroundColor: 'rgba(107, 107, 107, 0.05)',
                        borderColor: 'rgba(107, 107, 107, 0.3)',
                        borderWidth: 1,
                        borderDash: [5, 5],
                        pointRadius: 0,
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            labels: { font: { family: 'Montserrat', size: 12 }, usePointStyle: true }
                        }
                    },
                    scales: {
                        r: {
                            min: 0, max: 10,
                            ticks: { stepSize: 2, font: { size: 10 }, backdropColor: 'transparent', display: false },
                            grid: { color: 'rgba(0,0,0,0.06)' },
                            angleLines: { color: 'rgba(0,0,0,0.06)' },
                            pointLabels: { font: { family: 'Montserrat', size: 11, weight: '600' } }
                        }
                    }
                }
            });
        }
    };

    return (
        <section className="ficha-preview section-padding" id="ficha-tecnica">
            <div className="container">
                <div className="section-header">
                    <div className="badge" style={{ marginBottom: "16px" }}>Dados Completos</div>
                    <h2>Ficha Técnica <span className="gold">Oficial</span></h2>
                </div>

                {/* GENEALOGIA */}
                <div className="card">
                    <h3><span className="material-icons-outlined">account_tree</span> <span className="gold">Genealogia</span></h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>Árvore genealógica em 3 gerações</p>
                    <div className="genealogy-landing">
                        <div className="gen-col">
                            <div className="gen-node main">
                                <div className="gen-name">Sertanejo Terra Brava</div>
                                <div className="gen-reg">EPCF 2315</div>
                                <div className="gen-mgte">MGTe: 20,81 · TOP 16%</div>
                            </div>
                        </div>
                        <div className="gen-connector">
                            <svg width="32" height="120"><line x1="0" y1="60" x2="32" y2="30" stroke="#C5A059" strokeWidth="2"/><line x1="0" y1="60" x2="32" y2="90" stroke="#C5A059" strokeWidth="2"/></svg>
                        </div>
                        <div className="gen-col" style={{ gap: "24px" }}>
                            <div className="gen-node">
                                <div className="gen-name">1070 da Terra Brava</div>
                                <div className="gen-reg">EPCF 1070 — Pai</div>
                                <div className="gen-mgte">MGTe: 19,35 · TOP 20%</div>
                            </div>
                            <div className="gen-node">
                                <div className="gen-name">1381 FIV da Terra Brava</div>
                                <div className="gen-reg">EPCF 1381 — Mãe</div>
                                <div className="gen-mgte">MGTe: 22,43 · TOP 13%</div>
                            </div>
                        </div>
                        <div className="gen-connector">
                            <svg width="32" height="240">
                                <line x1="0" y1="50" x2="32" y2="30" stroke="#C5A059" strokeWidth="1.5"/>
                                <line x1="0" y1="50" x2="32" y2="90" stroke="#C5A059" strokeWidth="1.5"/>
                                <line x1="0" y1="190" x2="32" y2="150" stroke="#C5A059" strokeWidth="1.5"/>
                                <line x1="0" y1="190" x2="32" y2="210" stroke="#C5A059" strokeWidth="1.5"/>
                            </svg>
                        </div>
                        <div className="gen-col" style={{ gap: "12px" }}>
                            <div className="gen-node"><div className="gen-name">Bitelo DS</div><div className="gen-reg">TECO 105 — Avô Paterno</div><div className="gen-mgte">MGTe: 14,29 · TOP 33%</div></div>
                            <div className="gen-node"><div className="gen-name">Harpa I FIV Terra Brava</div><div className="gen-reg">EPCF 108 — Avó Paterna</div><div className="gen-mgte">MGTe: 17,09 · TOP 25%</div></div>
                            <div className="gen-node"><div className="gen-name">D4685 da MN</div><div className="gen-reg">LBMN D4685 — Avô Materno</div><div className="gen-mgte">MGTe: 20,33 · TOP 17%</div></div>
                            <div className="gen-node"><div className="gen-name">940 FIV Terra Brava</div><div className="gen-reg">EPCF 940 — Avó Materna</div><div className="gen-mgte">MGTe: 17,67 · TOP 24%</div></div>
                        </div>
                    </div>

                    <div className="gen-tree-mobile">
                        <div className="gen-level">
                            <div className="gen-level-label">Touro</div>
                            <div className="gen-level-nodes">
                                <div className="gen-node main">
                                    <div className="gen-name">Sertanejo Terra Brava</div>
                                    <div className="gen-reg">EPCF 2315</div>
                                    <div className="gen-mgte">MGTe: 20,81 · TOP 16%</div>
                                </div>
                            </div>
                        </div>
                        <div className="gen-level-line"></div>
                        <div className="gen-level">
                            <div className="gen-level-label">Pais</div>
                            <div className="gen-level-nodes gen-pair">
                                <div className="gen-node">
                                    <div className="gen-name">1070 da Terra Brava</div>
                                    <div className="gen-reg">Pai</div>
                                    <div className="gen-mgte">MGTe: 19,35</div>
                                </div>
                                <div className="gen-node">
                                    <div className="gen-name">1381 FIV da Terra Brava</div>
                                    <div className="gen-reg">Mãe</div>
                                    <div className="gen-mgte">MGTe: 22,43</div>
                                </div>
                            </div>
                        </div>
                        <div className="gen-level-line"></div>
                        <div className="gen-level">
                            <div className="gen-level-label">Avós</div>
                            <div className="gen-level-nodes">
                                <div className="gen-pair" style={{ marginBottom: "8px" }}>
                                    <div className="gen-node">
                                        <div className="gen-name">Bitelo DS</div>
                                        <div className="gen-reg">Avô Paterno</div>
                                    </div>
                                    <div className="gen-node">
                                        <div className="gen-name">Harpa I FIV</div>
                                        <div className="gen-reg">Avó Paterna</div>
                                    </div>
                                </div>
                                <div className="gen-pair">
                                    <div className="gen-node">
                                        <div className="gen-name">D4685 da MN</div>
                                        <div className="gen-reg">Avô Materno</div>
                                    </div>
                                    <div className="gen-node">
                                        <div className="gen-name">940 FIV</div>
                                        <div className="gen-reg">Avó Materna</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ÍNDICES */}
                <div className="card">
                    <h3><span className="material-icons-outlined">stars</span> Índices <span className="gold">Genéticos</span></h3>
                    <div className="table-scroll"><table className="data-table">
                        <thead>
                            <tr>
                                <th>Índice</th>
                                <th>Valor</th>
                                <th>Classificação</th>
                                <th>Acurácia</th>
                                <th>Fonte</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="value">MGTe (Mérito Genético Total Econômico)</td>
                                <td className="value">20,81</td>
                                <td><span className="top-label">TOP 16%</span></td>
                                <td>84%</td>
                                <td>ANCP</td>
                            </tr>
                            <tr>
                                <td className="value">MGTe Cruzamento (CR)</td>
                                <td className="value">19,79</td>
                                <td><span className="top-label">TOP 22%</span></td>
                                <td>76%</td>
                                <td>ANCP</td>
                            </tr>
                            <tr>
                                <td className="value">MGTe Reposição (RE)</td>
                                <td className="value">23,13</td>
                                <td><span className="top-label">TOP 10%</span></td>
                                <td>84%</td>
                                <td>ANCP</td>
                            </tr>
                            <tr>
                                <td className="value">MGTe Completo (CO)</td>
                                <td className="value">24,95</td>
                                <td><span className="top-label">TOP 3%</span></td>
                                <td>74%</td>
                                <td>ANCP</td>
                            </tr>
                            <tr>
                                <td className="value">MGTe F1</td>
                                <td className="value">25,22</td>
                                <td><span className="top-label">TOP 2%</span></td>
                                <td>75%</td>
                                <td>ANCP</td>
                            </tr>
                            <tr>
                                <td className="value">iABCZ</td>
                                <td className="value">11,37</td>
                                <td><span className="deca-label">DECA 2 · P% 16</span></td>
                                <td>—</td>
                                <td>PMGZ/ABCZ</td>
                            </tr>
                        </tbody>
                    </table></div>
                </div>

                {/* DEPs CRESCIMENTO (PMGZ + ANCP) */}
                <div className="card">
                    <h3><span className="material-icons-outlined">trending_up</span> DEPs de <span className="gold">Crescimento</span></h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>Fonte: PMGZ/ABCZ — Avaliação Genética 2026-1 e ANCP — 5ª AG DEZ/2025</p>
                    <div className="table-scroll"><table className="data-table">
                        <thead>
                            <tr>
                                <th>Característica</th>
                                <th>DEP</th>
                                <th>Acurácia</th>
                                <th>Classificação</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Peso ao Nascimento (PN-EDg) — PMGZ</td>
                                <td className="value">+0,18 kg</td>
                                <td>83%</td>
                                <td><span className="deca-label">DECA 6</span></td>
                            </tr>
                            <tr>
                                <td>Peso à Desmama (PD-EDg) — PMGZ</td>
                                <td className="value">+3,68 kg</td>
                                <td>83%</td>
                                <td><span className="deca-label">DECA 4</span></td>
                            </tr>
                            <tr>
                                <td>Peso ao Ano (PA-EDg) — PMGZ</td>
                                <td className="value">+5,15 kg</td>
                                <td>79%</td>
                                <td><span className="deca-label">DECA 4</span></td>
                            </tr>
                            <tr>
                                <td>Peso ao Sobreano (PS-EDg) — PMGZ</td>
                                <td className="value">+8,93 kg</td>
                                <td>82%</td>
                                <td><span className="deca-label">DECA 3</span></td>
                            </tr>
                            <tr>
                                <td>Peso 120 dias (DP120G) — ANCP</td>
                                <td className="value">+5,44 kg</td>
                                <td>80%</td>
                                <td><span className="top-label">TOP 21%</span></td>
                            </tr>
                            <tr>
                                <td>Peso 210 dias (DP210G) — ANCP</td>
                                <td className="value">+9,98 kg</td>
                                <td>83%</td>
                                <td><span className="top-label">TOP 21%</span></td>
                            </tr>
                            <tr>
                                <td>Peso 365 dias (DP365G) — ANCP</td>
                                <td className="value">+19,57 kg</td>
                                <td>89%</td>
                                <td><span className="top-label">TOP 18%</span></td>
                            </tr>
                            <tr>
                                <td>Peso 450 dias (DP450G) — ANCP</td>
                                <td className="value">+21,07 kg</td>
                                <td>87%</td>
                                <td><span className="top-label">TOP 15%</span></td>
                            </tr>
                        </tbody>
                    </table></div>
                </div>

                {/* DEPs REPRODUTIVAS */}
                <div className="card">
                    <h3><span className="material-icons-outlined">favorite</span> DEPs <span className="gold">Reprodutivas</span></h3>
                    <div className="table-scroll"><table className="data-table">
                        <thead>
                            <tr>
                                <th>Característica</th>
                                <th>DEP</th>
                                <th>Acurácia</th>
                                <th>Classificação</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Idade ao Primeiro Parto (IPPg) — dias</td>
                                <td className="value">-8,65</td>
                                <td>55%</td>
                                <td><span className="deca-label">DECA 3</span></td>
                            </tr>
                            <tr>
                                <td>Stayability (STAYg) — %</td>
                                <td className="value">+45,99</td>
                                <td>21%</td>
                                <td><span className="deca-label">DECA 2</span></td>
                            </tr>
                            <tr>
                                <td>Perímetro Escrotal 450 (DPE450G) — ANCP</td>
                                <td className="value">+0,95</td>
                                <td>83%</td>
                                <td><span className="top-label">TOP 20%</span></td>
                            </tr>
                            <tr>
                                <td>Stayability (DSTAY54G) — ANCP</td>
                                <td className="value">+55,75</td>
                                <td>85%</td>
                                <td><span className="top-label">TOP 18%</span></td>
                            </tr>
                        </tbody>
                    </table></div>
                </div>

                {/* DEPs CARCAÇA */}
                <div className="card">
                    <h3><span className="material-icons-outlined">restaurant</span> DEPs de <span className="gold">Carcaça</span></h3>
                    <div className="table-scroll"><table className="data-table">
                        <thead>
                            <tr>
                                <th>Característica</th>
                                <th>DEP</th>
                                <th>Acurácia</th>
                                <th>Classificação</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Área de Olho de Lombo (AOLg) — PMGZ</td>
                                <td className="value">+1,810 cm²</td>
                                <td>77%</td>
                                <td><span className="deca-label">DECA 2</span></td>
                            </tr>
                            <tr>
                                <td>Acabamento (ACABg) — PMGZ</td>
                                <td className="value">+4,469 mm</td>
                                <td>68%</td>
                                <td><span className="deca-label">DECA 1</span></td>
                            </tr>
                            <tr>
                                <td>Marmoreio (MARg) — PMGZ</td>
                                <td className="value">+2,97 %</td>
                                <td>55%</td>
                                <td><span className="deca-label">DECA 1</span></td>
                            </tr>
                            <tr>
                                <td>AOL (DAOLG) — ANCP</td>
                                <td className="value">+3,77</td>
                                <td>86%</td>
                                <td><span className="top-label">TOP 7%</span></td>
                            </tr>
                            <tr>
                                <td>Acabamento (DACABG) — ANCP</td>
                                <td className="value">+0,43</td>
                                <td>84%</td>
                                <td><span className="top-label">TOP 12%</span></td>
                            </tr>
                            <tr>
                                <td>Marmoreio (DMARG) — ANCP</td>
                                <td className="value">+0,44</td>
                                <td>80%</td>
                                <td><span className="top-label">TOP 0,1%</span></td>
                            </tr>
                        </tbody>
                    </table></div>
                </div>

                {/* DEPs MORFOLÓGICAS E GRÁFICOS */}
                <div className="card">
                    <h3><span className="material-icons-outlined">straighten</span> Morfologia e <span className="gold">Gráficos</span></h3>
                    <div className="charts-row">
                        <div>
                            <div className="chart-container" style={{ maxWidth: "100%", height: "280px" }}>
                                <canvas id="radarChart"></canvas>
                            </div>
                        </div>
                        <div className="chart-container" style={{ maxWidth: "100%", height: "280px" }}>
                            <canvas id="depChart"></canvas>
                        </div>
                    </div>
                </div>

                <div className="ficha-cta" style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap", marginTop: "32px" }}>
                    <a href="#reserva" className="btn-checkout">
                        <span className="material-icons-outlined" style={{ fontSize: "18px" }}>shopping_cart</span>
                        Reservar Doses
                    </a>
                    <a href="/assets/sertanejo/SERTANEJO_PMGZ.pdf" target="_blank" rel="noopener noreferrer" className="btn-secondary" aria-label="Acessar ficha técnica oficial PMGZ">
                        <span className="material-icons-outlined" style={{ fontSize: "18px" }}>open_in_new</span>
                        Ficha Técnica Oficial em PDF
                    </a>
                </div>
            </div>
        </section>
    );
}
