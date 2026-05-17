"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const BRONZE = "#A0792E";
const BRONZE_LIGHT = "#D4A85C";
const INK = "#0A0A0A";
const INK_2 = "#141414";
const FG = "#F5F0E4";
const FG_MUTED_70 = "rgba(245,240,228,0.70)";
const FG_MUTED_55 = "rgba(245,240,228,0.55)";
const LINE_STRONG = "rgba(212,168,92,0.28)";
const TECH_GREEN = "#7FD4A0";

type Resumo = {
    code: string | null;
    doadora: string;
    cruzamento: string;
    quantidade: number;
    total: number;
};

function fmtBRL(n: number) {
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export default function ObrigadoClient() {
    const [resumo, setResumo] = useState<Resumo | null>(null);

    useEffect(() => {
        try {
            const raw = sessionStorage.getItem("checkout_embriao_last");
            if (raw) {
                const parsed = JSON.parse(raw) as Resumo;
                // Leitura inicial de sessionStorage após hydration — não dá pra
                // colocar em initializer porque causaria mismatch SSR/CSR.
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setResumo(parsed);
                sessionStorage.removeItem("checkout_embriao_last");
            }
        } catch {
            // ignora
        }
    }, []);

    return (
        <main className="min-h-screen" style={{ background: INK }}>
            <Header />

            <section
                className="relative overflow-hidden"
                style={{ background: INK, borderBottom: `1px solid ${LINE_STRONG}` }}
            >
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: "radial-gradient(ellipse at 50% 0%, rgba(212,168,92,0.16) 0%, transparent 60%)",
                    }}
                />
                <div
                    className="absolute inset-0 pointer-events-none opacity-50"
                    style={{
                        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(232,203,133,0.10) 1px, transparent 0)",
                        backgroundSize: "32px 32px",
                        maskImage: "radial-gradient(ellipse at top, black 0%, transparent 70%)",
                    }}
                />
                <div className="container mx-auto px-4 py-20 md:py-28 relative" style={{ maxWidth: 780 }}>
                    {/* Check mark */}
                    <div
                        className="mx-auto mb-8"
                        style={{
                            width: 84,
                            height: 84,
                            borderRadius: "50%",
                            background: "rgba(127,212,160,0.10)",
                            border: `1.5px solid ${TECH_GREEN}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={TECH_GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>

                    <div
                        className="text-center inline-flex items-center gap-3 mb-5 mx-auto"
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            letterSpacing: "0.24em",
                            textTransform: "uppercase",
                            color: BRONZE_LIGHT,
                            fontWeight: 500,
                        }}
                    >
                        <span style={{ width: 24, height: 1, background: BRONZE }} />
                        Pré-reserva recebida
                    </div>

                    <h1
                        className="font-display text-center mx-auto"
                        style={{
                            fontSize: "clamp(32px, 5.5vw, 64px)",
                            fontWeight: 500,
                            lineHeight: 1.02,
                            letterSpacing: "-0.025em",
                            color: FG,
                            marginBottom: 18,
                            maxWidth: "20ch",
                        }}
                    >
                        Recebemos sua{" "}
                        <span style={{ color: BRONZE_LIGHT }}>pré-reserva.</span>
                    </h1>

                    <p
                        className="mx-auto text-center"
                        style={{
                            color: FG_MUTED_70,
                            fontSize: 17,
                            lineHeight: 1.55,
                            maxWidth: "56ch",
                            marginBottom: 36,
                        }}
                    >
                        Um assessor da curadoria FdB × Bula vai entrar em contato em até
                        24h pelo WhatsApp para confirmar o pacote, condições e prazos de
                        retirada.
                    </p>

                    {resumo && (
                        <div
                            className="card-engraved mx-auto"
                            style={{
                                background: INK_2,
                                border: `1px solid ${LINE_STRONG}`,
                                borderRadius: 4,
                                padding: "clamp(20px, 3.5vw, 32px)",
                                maxWidth: 560,
                                marginBottom: 36,
                            }}
                        >
                            {resumo.code && (
                                <div
                                    style={{
                                        fontFamily: "var(--font-mono)",
                                        fontSize: 11,
                                        letterSpacing: "0.22em",
                                        textTransform: "uppercase",
                                        color: BRONZE_LIGHT,
                                        marginBottom: 6,
                                    }}
                                >
                                    Protocolo · {resumo.code}
                                </div>
                            )}
                            <div
                                className="font-display"
                                style={{
                                    fontSize: 22,
                                    fontWeight: 500,
                                    color: FG,
                                    letterSpacing: "-0.015em",
                                    lineHeight: 1.2,
                                    marginBottom: 14,
                                }}
                            >
                                {resumo.doadora} × {resumo.cruzamento}
                            </div>

                            <ResumoLinha label="Embriões" value={`${resumo.quantidade} unidades`} />
                            <ResumoLinha label="Total estimado" value={fmtBRL(resumo.total)} bold />
                        </div>
                    )}

                    {/* Próximos passos */}
                    <div
                        className="mx-auto"
                        style={{ maxWidth: 560, marginBottom: 40 }}
                    >
                        <div
                            style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 11,
                                letterSpacing: "0.22em",
                                textTransform: "uppercase",
                                color: BRONZE_LIGHT,
                                fontWeight: 500,
                                marginBottom: 16,
                                textAlign: "center",
                            }}
                        >
                            Próximos passos
                        </div>
                        <Passo index="01" title="Contato em até 24h" text="Um assessor entra em contato pelo WhatsApp para confirmar o cruzamento e tirar dúvidas." />
                        <Passo index="02" title="Proposta personalizada" text="Você recebe a proposta formal com prazos de produção, datas de transferência e condições de pagamento." divider />
                        <Passo index="03" title="Confirmação do pacote" text="Após o aceite, sua pré-reserva vira reserva confirmada e entra na fila de produção da safra." divider />
                    </div>

                    <div className="flex flex-wrap justify-center gap-3">
                        <Link href="/embrioes" className="fdb-btn-primary-static">
                            Ver outras doadoras
                            <span aria-hidden style={{ marginLeft: 6 }}>→</span>
                        </Link>
                        <Link href="/" className="fdb-btn-ghost-static">
                            Voltar ao início
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

function ResumoLinha({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
    return (
        <div
            className="flex items-baseline justify-between gap-3"
            style={{ padding: "10px 0", borderTop: `1px solid ${LINE_STRONG}` }}
        >
            <span
                style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10.5,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: FG_MUTED_55,
                }}
            >
                {label}
            </span>
            <span
                style={{
                    color: bold ? BRONZE_LIGHT : FG,
                    fontSize: bold ? 18 : 14,
                    fontWeight: bold ? 600 : 500,
                    textAlign: "right",
                }}
            >
                {value}
            </span>
        </div>
    );
}

function Passo({ index, title, text, divider }: { index: string; title: string; text: string; divider?: boolean }) {
    return (
        <div
            className="grid grid-cols-[auto_1fr] gap-4 py-4"
            style={{ borderTop: divider ? `1px solid ${LINE_STRONG}` : undefined }}
        >
            <div
                className="font-display"
                style={{
                    fontSize: 22,
                    color: BRONZE_LIGHT,
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    fontWeight: 500,
                    minWidth: 32,
                }}
            >
                {index}
            </div>
            <div>
                <div
                    className="font-display"
                    style={{
                        fontSize: 16,
                        fontWeight: 500,
                        color: FG,
                        letterSpacing: "-0.01em",
                        marginBottom: 4,
                    }}
                >
                    {title}
                </div>
                <p style={{ color: FG_MUTED_70, fontSize: 14, lineHeight: 1.5 }}>{text}</p>
            </div>
        </div>
    );
}
