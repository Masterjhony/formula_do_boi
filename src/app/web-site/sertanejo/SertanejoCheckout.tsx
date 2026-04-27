"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sertanejoLandingCss } from "./sertanejoLandingCss";

type Tier = {
    range: string;
    rangeLabel: string;
    price: string;
    cents: string;
    sub: string;
    note: string;
    badge?: string;
    accent?: "gold" | "green";
    featured?: boolean;
    suggestedDoses: number;
};

const TIERS: Tier[] = [
    { range: "1 – 99 doses", rangeLabel: "1-99", price: "R$ 35", cents: ",00", sub: "/dose", note: "Preço unitário padrão", suggestedDoses: 50 },
    { range: "100 – 399 doses", rangeLabel: "100-399", price: "R$ 31", cents: ",50", sub: "/dose", note: "10% de desconto", badge: "Mais procurado", featured: true, accent: "gold", suggestedDoses: 200 },
    { range: "400 – 999 doses", rangeLabel: "400-999", price: "R$ 28", cents: ",00", sub: "/dose", note: "20% de desconto", suggestedDoses: 600 },
    { range: "1.000+ doses", rangeLabel: "1000+", price: "R$ 24", cents: ",50", sub: "/dose", note: "30% de desconto", badge: "Atacado", accent: "green", suggestedDoses: 1200 },
];

function getUtmParams() {
    if (typeof window === "undefined") return {};
    const params = new URLSearchParams(window.location.search);
    return {
        utm_source: params.get("utm_source") || "site",
        utm_medium: params.get("utm_medium") || "organic",
        utm_campaign: params.get("utm_campaign") || "sertanejo/checkout",
        utm_content: params.get("utm_content") || "formulario_principal",
    };
}

function Corners({ color = "var(--st-gold)", size = 14 }: { color?: string; size?: number }) {
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

function TagPill({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "8px 18px", border: "1px solid var(--st-rule-2)",
            background: "rgba(201,162,74,0.08)",
            fontFamily: "var(--st-mono)", fontSize: 10, letterSpacing: "0.28em",
            textTransform: "uppercase", color: "var(--st-gold-2)", fontWeight: 600,
            marginBottom: 32,
        }}>
            <span style={{ color: "var(--st-gold)" }}>●</span> {children}
        </div>
    );
}

export default function SertanejoCheckout() {
    const router = useRouter();
    const [estados, setEstados] = useState<{ sigla: string; nome: string }[]>([]);
    const [cidades, setCidades] = useState<{ id: number; nome: string }[]>([]);
    const [selectedUf, setSelectedUf] = useState("");
    const [selectedCidade, setSelectedCidade] = useState("");
    const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
    const [doses, setDoses] = useState<string>("");

    useEffect(() => {
        // Inject Google Fonts (Space Grotesk + JetBrains Mono)
        const id = "sertanejo-v2-google-fonts";
        if (typeof document !== "undefined" && !document.getElementById(id)) {
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
            link.id = id;
            link.rel = "stylesheet";
            link.href = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap";
            document.head.appendChild(link);
        }

        fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
            .then((res) => res.json())
            .then((data) => setEstados(data))
            .catch(() => {});
    }, []);

    const handleUfChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const uf = e.target.value;
        setSelectedUf(uf);
        setSelectedCidade("");
        setCidades([]);
        if (uf) {
            fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`)
                .then((res) => res.json())
                .then((data) => setCidades(data))
                .catch(() => {});
        }
    };

    const handleCpfInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        let v = e.target.value.replace(/\D/g, "");
        if (v.length > 11) v = v.slice(0, 11);
        if (v.length > 9) {
            v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
        } else if (v.length > 6) {
            v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
        } else if (v.length > 3) {
            v = v.replace(/(\d{3})(\d{1,3})/, "$1.$2");
        }
        e.target.value = v;
    };

    const handleSelectTier = (t: Tier) => {
        setSelectedTier(t);
        if (!doses) setDoses(String(t.suggestedDoses));
        setTimeout(() => {
            document.getElementById("reserva")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const btn = form.querySelector(".ck-submit") as HTMLButtonElement;
        const baseData = Object.fromEntries(new FormData(form).entries());

        const rawCpf = String(baseData.cpf || "").replace(/\D/g, "");
        let cpfFormatado = baseData.cpf as string;
        if (rawCpf.length === 11) {
            cpfFormatado = rawCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
        }

        const data = {
            ...baseData,
            cpf: cpfFormatado,
            cidade: `${selectedCidade}/${selectedUf}`,
            faixa_selecionada: selectedTier?.range || "",
            preco_dose: selectedTier ? `${selectedTier.price}${selectedTier.cents}` : "",
            ...getUtmParams(),
        };

        if (btn) {
            btn.disabled = true;
            btn.dataset.state = "loading";
            btn.innerHTML = "ENVIANDO…";
        }

        try {
            const res = await fetch("/api/checkout-semen", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Erro no servidor");

            if (btn) {
                btn.dataset.state = "ok";
                btn.innerHTML = "✓ RESERVA ENVIADA";
                btn.style.background = "linear-gradient(180deg, #7a9a55, #5a7c3f)";
                btn.style.color = "#fff";
            }
            form.reset();

            setTimeout(() => {
                router.push("/sertanejo/obrigado");
            }, 800);
        } catch {
            if (btn) {
                btn.dataset.state = "err";
                btn.innerHTML = "ERRO — TENTE NOVAMENTE";
                btn.style.background = "#b71c1c";
                btn.style.color = "#fff";
                btn.disabled = false;
            }
            setTimeout(() => {
                if (btn && btn.dataset.state === "err") {
                    btn.innerHTML = "ENVIAR RESERVA";
                    btn.style.background = "";
                    btn.style.color = "";
                    btn.dataset.state = "";
                }
            }, 4000);
        }
    };

    const reserved = 2500;
    const total = 5000;
    const pct = useMemo(() => (reserved / total) * 100, []);
    const ufList = useMemo(() => estados, [estados]);

    return (
        <div className="sertanejo-v2-wrap" style={{ minHeight: "100vh" }}>
            <style dangerouslySetInnerHTML={{ __html: sertanejoLandingCss }} />
            <style dangerouslySetInnerHTML={{ __html: checkoutExtraCss }} />

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
                <div className="ck-wrap" style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "16px 0",
                }}>
                    <Link href="/sertanejo" style={{ display: "flex", alignItems: "center", gap: 12 }} aria-label="Fórmula do Boi — Voltar para Sertanejo">
                        <img src="/assets/sertanejo/logo-horizontal-white.png" alt="Fórmula do Boi" style={{ height: 30, width: "auto", display: "block" }} />
                    </Link>
                    <Link href="/sertanejo" className="mono nav-link-back" style={{
                        fontSize: 11, letterSpacing: "0.22em", color: "var(--st-bone-2)",
                        textTransform: "uppercase",
                        display: "flex", alignItems: "center", gap: 10, padding: "10px 16px",
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
                </div>
                <div style={{
                    height: 1,
                    background: "linear-gradient(90deg, transparent, var(--st-gold) 30%, var(--st-gold) 70%, transparent)",
                    opacity: 0.35,
                }} />
            </nav>

            {/* STOCK PROGRESS */}
            <section className="ck-section sert-dark-leather">
                <div className="ck-wrap">
                    <TagPill>Aceleradora · Reserva Sertanejo</TagPill>

                    <h1 className="serif-tight" style={{
                        fontSize: "clamp(40px, 7vw, 96px)", color: "var(--st-bone)",
                        marginBottom: 12, fontWeight: 500, letterSpacing: "-0.02em",
                    }}>
                        Reserve suas <em style={{ color: "var(--st-gold-2)" }}>doses.</em>
                    </h1>
                    <p style={{
                        fontSize: 17, color: "var(--st-txt)", marginBottom: 56, maxWidth: 680,
                        fontWeight: 300, lineHeight: 1.6,
                    }}>
                        Sertanejo TE Terra Brava · Nelore PO · MGTe TOP 16%. Estoque limitado de doses
                        convencionais para a temporada de monta 2026.
                    </p>

                    <div style={{
                        display: "flex", alignItems: "flex-end", gap: 40,
                        marginBottom: 24, flexWrap: "wrap",
                    }}>
                        <div>
                            <div className="mono" style={{
                                fontSize: 10, letterSpacing: "0.24em", color: "var(--st-gold-2)",
                                textTransform: "uppercase", marginBottom: 8, fontWeight: 600,
                            }}>Doses Reservadas</div>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                                <span className="serif-tight" style={{
                                    fontSize: "clamp(48px, 7vw, 96px)", color: "var(--st-gold-2)",
                                    fontWeight: 500, lineHeight: 1,
                                }}>{reserved.toLocaleString("pt-BR")}</span>
                                <span style={{ color: "var(--st-txt)", fontSize: 18, fontWeight: 300 }}>
                                    de <span style={{ color: "var(--st-bone)" }}>{total.toLocaleString("pt-BR")}</span> doses
                                </span>
                            </div>
                        </div>
                        <div style={{ marginLeft: "auto", textAlign: "right" }}>
                            <div className="mono" style={{
                                fontSize: 10, letterSpacing: "0.24em", color: "var(--st-gold-2)",
                                textTransform: "uppercase", marginBottom: 8, fontWeight: 600,
                            }}>Disponíveis</div>
                            <div className="serif-tight" style={{
                                fontSize: 36, color: "var(--st-bone)", fontWeight: 500,
                            }}>
                                {(total - reserved).toLocaleString("pt-BR")}
                            </div>
                        </div>
                    </div>

                    <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>

                    <div style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        marginTop: 28, flexWrap: "wrap", gap: 16,
                    }}>
                        <span className="mono" style={{
                            display: "inline-flex", alignItems: "center", gap: 8,
                            padding: "8px 16px", background: "rgba(220, 100, 80, 0.15)",
                            border: "1px solid rgba(220,100,80,0.4)",
                            fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase",
                            color: "#f0a090", fontWeight: 700,
                        }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#e07060", boxShadow: "0 0 8px #e07060" }} />
                            Doses Limitadas
                        </span>
                        <span className="mono" style={{
                            fontSize: 11, color: "var(--st-txt)", letterSpacing: "0.16em",
                            fontStyle: "italic",
                            display: "inline-flex", alignItems: "center", gap: 8,
                        }}>
                            <span style={{ color: "var(--st-gold)" }}>ⓘ</span>
                            Touro em quarentena · entrega prevista a partir de Maio/2026
                        </span>
                    </div>
                </div>
            </section>

            {/* PRICING TIERS */}
            <section className="ck-section sert-dark-leather" style={{ borderTop: "1px solid var(--st-rule-2)" }}>
                <div className="ck-wrap" style={{ textAlign: "center" }}>
                    <TagPill>Tabela de preços</TagPill>

                    <h2 className="serif-tight" style={{
                        fontSize: "clamp(36px, 5.5vw, 72px)", color: "var(--st-bone)",
                        marginBottom: 14, fontWeight: 500,
                    }}>
                        Invista em <em style={{ color: "var(--st-gold-2)" }}>genética de elite.</em>
                    </h2>
                    <p style={{
                        fontSize: 16, color: "var(--st-txt)", maxWidth: 560,
                        margin: "0 auto 64px", fontWeight: 300, lineHeight: 1.6,
                    }}>
                        Quanto maior o volume, maior o desconto. Escolha a faixa ideal para o seu rebanho.
                    </p>

                    <div className="pricing-grid" style={{
                        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginTop: 24,
                    }}>
                        {TIERS.map((t, i) => {
                            const active = selectedTier?.rangeLabel === t.rangeLabel;
                            return (
                                <div
                                    key={i}
                                    className={`pricing-card ${t.featured ? "featured" : ""} ${active ? "selected" : ""}`}
                                >
                                    <Corners color={t.featured || active ? "var(--st-gold)" : "var(--st-rule-2)"} size={14} />
                                    {t.badge && (
                                        <span className={`badge ${t.accent === "green" ? "badge-green" : "badge-gold"}`}>
                                            {t.badge}
                                        </span>
                                    )}

                                    <div className="mono" style={{
                                        fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase",
                                        color: "var(--st-gold-2)", marginBottom: 24, fontWeight: 600,
                                    }}>{t.range}</div>

                                    <div style={{ marginBottom: 8 }}>
                                        <span className="serif-tight" style={{
                                            fontSize: "clamp(36px, 4.2vw, 56px)", color: "var(--st-bone)", fontWeight: 600,
                                        }}>{t.price}</span>
                                        <span className="serif" style={{
                                            fontSize: 22, color: "var(--st-bone)", fontWeight: 400,
                                        }}>{t.cents}</span>
                                        <span className="mono" style={{
                                            fontSize: 12, color: "var(--st-txt)", marginLeft: 4,
                                        }}>{t.sub}</span>
                                    </div>

                                    <div className="mono" style={{
                                        fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
                                        color: "var(--st-gold)", marginBottom: 28,
                                    }}>{t.note}</div>

                                    <button
                                        type="button"
                                        onClick={() => handleSelectTier(t)}
                                        className="btn"
                                        style={{
                                            width: "100%",
                                            background: t.featured
                                                ? "linear-gradient(180deg, var(--st-gold-2), var(--st-gold))"
                                                : "transparent",
                                            color: t.featured ? "var(--st-ink)" : "var(--st-bone)",
                                            border: t.featured ? "1px solid var(--st-gold-deep)" : "1px solid var(--st-rule-2)",
                                            fontWeight: 600,
                                        }}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" />
                                            <path d="M3 4h2l2.7 12.3a2 2 0 0 0 2 1.7h7.7a2 2 0 0 0 2-1.5L22 8H6" />
                                        </svg>
                                        Reservar
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{
                        marginTop: 56, padding: "20px 24px", display: "flex",
                        flexDirection: "column", gap: 8, alignItems: "center",
                        borderTop: "1px solid var(--st-rule)",
                        fontSize: 13, color: "var(--st-txt)",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                            <span style={{ color: "var(--st-gold-2)" }}>🚛</span>
                            Frete e logística facilitada pelo Fórmula do Boi.{" "}
                            <span style={{ color: "var(--st-bone)", fontWeight: 500 }}>Entrega em todo o Brasil.</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                            <span style={{ color: "var(--st-gold-2)" }}>💳</span>
                            <span className="mono" style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--st-gold-2)" }}>Condições:</span>
                            À vista, 8× no boleto ou 12× no cartão.
                        </div>
                    </div>
                </div>
            </section>

            {/* RESERVE FORM */}
            <section id="reserva" className="ck-section sert-dark-leather" style={{ borderTop: "1px solid var(--st-rule-2)" }}>
                <div className="ck-wrap" style={{ maxWidth: 880, textAlign: "center" }}>
                    <TagPill>Reserva</TagPill>

                    <h2 className="serif-tight" style={{
                        fontSize: "clamp(32px, 4.8vw, 64px)", color: "var(--st-bone)",
                        marginBottom: 14, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.05,
                    }}>
                        Reserve suas doses direto com<br />
                        <em style={{ color: "var(--st-gold-2)" }}>um consultor Fórmula do Boi.</em>
                    </h2>
                    <p style={{ fontSize: 15, color: "var(--st-txt)", marginBottom: 48, fontWeight: 300 }}>
                        Preencha o formulário abaixo e um especialista entrará em contato.
                    </p>

                    <form onSubmit={handleSubmit} style={{
                        position: "relative", textAlign: "left",
                        padding: "clamp(28px, 4vw, 48px)",
                        background: "linear-gradient(180deg, rgba(28,24,22,0.7), rgba(20,17,15,0.85))",
                        border: "1px solid var(--st-rule-2)",
                    }}>
                        <Corners color="var(--st-gold)" size={14} />

                        {selectedTier && (
                            <div style={{
                                marginBottom: 28, padding: "14px 18px",
                                background: "rgba(201,162,74,0.08)",
                                border: "1px solid var(--st-rule-2)",
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                gap: 16, flexWrap: "wrap",
                            }}>
                                <div>
                                    <div className="mono" style={{ fontSize: 9, letterSpacing: "0.22em", color: "var(--st-gold-2)", textTransform: "uppercase", fontWeight: 600 }}>
                                        Faixa selecionada
                                    </div>
                                    <div className="serif" style={{ fontSize: 18, color: "var(--st-bone)", fontStyle: "italic", marginTop: 2 }}>
                                        {selectedTier.range} · {selectedTier.price}{selectedTier.cents} {selectedTier.sub}
                                    </div>
                                </div>
                                <div className="mono" style={{ fontSize: 10, letterSpacing: "0.22em", color: "var(--st-gold)", textTransform: "uppercase" }}>
                                    {selectedTier.note}
                                </div>
                            </div>
                        )}

                        <div style={{ display: "grid", gap: 22 }}>
                            <div>
                                <label className="ck-label" htmlFor="nome">Nome completo</label>
                                <input className="ck-input" id="nome" name="nome" placeholder="Seu nome completo" required />
                            </div>

                            <div className="form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                <div>
                                    <label className="ck-label" htmlFor="fazenda">Nome da fazenda</label>
                                    <input className="ck-input" id="fazenda" name="fazenda" placeholder="Fazenda exemplo" required />
                                </div>
                                <div>
                                    <label className="ck-label" htmlFor="cpf">CPF / CNPJ</label>
                                    <input className="ck-input" id="cpf" name="cpf" placeholder="000.000.000-00" maxLength={14} onChange={handleCpfInput} required />
                                </div>
                            </div>

                            <div className="form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                <div>
                                    <label className="ck-label" htmlFor="telefone">WhatsApp / telefone</label>
                                    <input type="tel" className="ck-input" id="telefone" name="telefone" placeholder="(00) 00000-0000" required />
                                </div>
                                <div>
                                    <label className="ck-label" htmlFor="animais">Número de animais no rebanho</label>
                                    <input type="number" className="ck-input" id="animais" name="animais" placeholder="Ex: 500" min={1} required />
                                </div>
                            </div>

                            <div className="form-grid-3" style={{ display: "grid", gridTemplateColumns: "110px 1fr 1fr", gap: 16 }}>
                                <div>
                                    <label className="ck-label" htmlFor="uf">UF</label>
                                    <select id="uf" name="uf" className="ck-input" value={selectedUf} onChange={handleUfChange} required>
                                        <option value="" disabled>UF</option>
                                        {ufList.map((est) => (
                                            <option key={est.sigla} value={est.sigla}>{est.sigla}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="ck-label" htmlFor="cidade_nome">Cidade</label>
                                    <select id="cidade_nome" name="cidade_nome" className="ck-input"
                                        value={selectedCidade}
                                        onChange={(e) => setSelectedCidade(e.target.value)}
                                        required disabled={!selectedUf}>
                                        <option value="" disabled>Selecione…</option>
                                        {cidades.map((c) => (
                                            <option key={c.id} value={c.nome}>{c.nome}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="ck-label" htmlFor="doses">Doses para reserva</label>
                                    <input type="number" className="ck-input" id="doses" name="doses"
                                        placeholder="Ex: 200" min={1} required
                                        value={doses}
                                        onChange={(e) => setDoses(e.target.value)} />
                                </div>
                            </div>

                            <div>
                                <label className="ck-label" htmlFor="parcelamento">Condição de parcelamento</label>
                                <select id="parcelamento" name="parcelamento" className="ck-input" defaultValue="" required>
                                    <option value="" disabled>Selecione…</option>
                                    <option value="avista">À vista (boleto / Pix)</option>
                                    <option value="8x-boleto">8× sem juros no boleto</option>
                                    <option value="12x-cartao">12× no cartão</option>
                                    <option value="conversar">Quero conversar com o consultor</option>
                                </select>
                            </div>
                        </div>

                        <button type="submit" className="btn ck-submit" style={{
                            width: "100%", marginTop: 36, padding: "20px 26px", fontSize: 12, fontWeight: 700,
                            background: "linear-gradient(180deg, var(--st-gold-2), var(--st-gold))",
                            color: "var(--st-ink)", border: "1px solid var(--st-gold-deep)",
                            letterSpacing: "0.22em", textTransform: "uppercase",
                            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 12,
                            cursor: "pointer",
                        }}>
                            ENVIAR RESERVA
                        </button>

                        <div style={{
                            marginTop: 22, textAlign: "center",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                            fontSize: 12, color: "var(--st-gold-2)", fontStyle: "italic",
                        }}>
                            <span>🛡</span>
                            Um consultor Fórmula do Boi entrará em contato para confirmar sua reserva.
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
}

const checkoutExtraCss = `
.sertanejo-v2-wrap .ck-wrap { max-width: 1180px; margin: 0 auto; padding: 0 clamp(20px, 5vw, 60px); }
.sertanejo-v2-wrap .ck-section { padding: clamp(60px, 8vw, 110px) 0; position: relative; }

.sertanejo-v2-wrap .ck-input {
  width: 100%; background: rgba(0,0,0,0.45);
  border: 1px solid var(--st-rule);
  padding: 14px 16px; color: var(--st-bone);
  font-family: var(--st-sans); font-size: 14px; outline: none;
  transition: border-color 0.2s, background 0.2s;
}
.sertanejo-v2-wrap .ck-input:focus { border-color: var(--st-gold); background: rgba(0,0,0,0.6); }
.sertanejo-v2-wrap .ck-input::placeholder { color: var(--st-txt-dim); }
.sertanejo-v2-wrap select.ck-input { appearance: none; cursor: pointer; }
.sertanejo-v2-wrap select.ck-input:disabled { opacity: 0.5; cursor: not-allowed; }

.sertanejo-v2-wrap .ck-label {
  display: block; font-family: var(--st-mono); font-size: 10px;
  letter-spacing: 0.24em; text-transform: uppercase;
  color: var(--st-gold-2); margin-bottom: 8px; font-weight: 600;
}

.sertanejo-v2-wrap .pricing-card {
  position: relative; padding: 36px 28px; text-align: center;
  background: linear-gradient(180deg, rgba(28,24,22,0.85), rgba(20,17,15,0.92));
  border: 1px solid var(--st-rule);
  transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
}
.sertanejo-v2-wrap .pricing-card:hover {
  transform: translateY(-4px);
  border-color: var(--st-gold);
  box-shadow: 0 30px 60px rgba(0,0,0,0.4);
}
.sertanejo-v2-wrap .pricing-card.featured {
  border-color: var(--st-gold);
  background: linear-gradient(180deg, rgba(50,38,18,0.85), rgba(30,22,10,0.95));
  box-shadow: 0 0 0 1px var(--st-gold-deep), 0 30px 60px rgba(0,0,0,0.5);
}
.sertanejo-v2-wrap .pricing-card.featured::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, var(--st-gold-deep), var(--st-gold), var(--st-gold-deep));
}
.sertanejo-v2-wrap .pricing-card.selected {
  border-color: var(--st-gold);
  box-shadow: 0 0 0 1px var(--st-gold-deep), 0 30px 60px rgba(0,0,0,0.5);
}

.sertanejo-v2-wrap .badge {
  position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
  padding: 6px 16px; font-family: var(--st-mono); font-size: 10px;
  letter-spacing: 0.22em; text-transform: uppercase; font-weight: 700;
  white-space: nowrap;
}
.sertanejo-v2-wrap .badge-gold {
  background: linear-gradient(180deg, var(--st-gold-2), var(--st-gold));
  color: var(--st-ink); border: 1px solid var(--st-gold-deep);
}
.sertanejo-v2-wrap .badge-green {
  background: #5a7c3f; color: white; border: 1px solid #3d5a25;
}

.sertanejo-v2-wrap .progress-track {
  position: relative; height: 18px; border-radius: 999px;
  background: rgba(138,106,38,0.15); border: 1px solid rgba(138,106,38,0.3);
  overflow: hidden;
}
.sertanejo-v2-wrap .progress-fill {
  position: absolute; top: 0; bottom: 0; left: 0;
  background: linear-gradient(90deg, var(--st-gold-deep), var(--st-gold), var(--st-gold-2));
  box-shadow: 0 0 20px rgba(201,162,74,0.4) inset;
  transition: width 0.4s ease;
}

.sertanejo-v2-wrap .ck-submit:hover { transform: translateY(-1px); }

@media (max-width: 1000px) {
  .sertanejo-v2-wrap .pricing-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .sertanejo-v2-wrap .form-grid-2 { grid-template-columns: 1fr !important; }
  .sertanejo-v2-wrap .form-grid-3 { grid-template-columns: 1fr !important; }
}
@media (max-width: 600px) {
  .sertanejo-v2-wrap .pricing-grid { grid-template-columns: 1fr !important; }
  .sertanejo-v2-wrap .nav-link-back { display: none !important; }
}
`;
