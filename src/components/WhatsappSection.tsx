"use client";

import { trackEvent } from "@/lib/posthog-client";

const WA_LINK = "https://wa.me/5531984143874?text=Ol%C3%A1%2C%20quero%20entrar%20no%20grupo%20Selo%20Ouro";

// Brandbook tokens
const BRONZE = "#A0792E";
const BRONZE_LIGHT = "#D4A85C";
const INK = "#0A0A0A";
const INK_2 = "#141414";
const FG = "#F5F0E4";


export default function WhatsappSection() {
    return (
        <section
            className="stitch-divider py-24 md:py-32 relative overflow-hidden"
            style={{ background: INK }}
        >
            {/* Dot grid sutil brandbook */}
            <div
                className="absolute inset-0 pointer-events-none opacity-40"
                style={{
                    backgroundImage: "radial-gradient(circle at 1px 1px, rgba(232,203,133,0.08) 1px, transparent 0)",
                    backgroundSize: "32px 32px",
                    maskImage: "radial-gradient(ellipse at center, black 0%, transparent 70%)",
                }}
            />

            {/* Glow bronze */}
            <div
                className="absolute pointer-events-none"
                style={{ top: "-20%", right: "-15%", width: "60%", height: "120%", background: "radial-gradient(ellipse at center, rgba(212,168,92,0.10) 0%, transparent 60%)" }}
            />

            <div className="container mx-auto px-4 relative" style={{ maxWidth: 1200 }}>

                <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 md:gap-16 items-center">

                    {/* Coluna texto */}
                    <div>
                        {/* Eyebrow brandbook */}
                        <div
                            className="inline-flex items-center gap-3 mb-7"
                            style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 12,
                                letterSpacing: "0.24em",
                                textTransform: "uppercase",
                                color: BRONZE_LIGHT,
                                fontWeight: 500,
                            }}
                        >
                            <span style={{ width: 32, height: 1, background: BRONZE, display: "inline-block" }} />
                            Grupo Selo Ouro · Acesso curado
                        </div>

                        {/* Título */}
                        <h2
                            className="font-display"
                            style={{
                                fontSize: "clamp(40px, 7.5vw, 68px)",
                                fontWeight: 500,
                                lineHeight: 1.0,
                                letterSpacing: "-0.025em",
                                color: FG,
                                marginBottom: 24,
                            }}
                        >
                            A oferta chega antes{" "}
                            <span style={{ color: BRONZE_LIGHT }}>do leilão público.</span>
                        </h2>

                        {/* Texto */}
                        <p style={{
                            color: "rgba(245,240,228,0.78)",
                            fontSize: 17,
                            lineHeight: 1.6,
                            marginBottom: 36,
                            maxWidth: "52ch",
                            letterSpacing: "-0.005em",
                        }}>
                            Ficha técnica, vídeo e condição comercial direto no WhatsApp — antes
                            do catálogo público. Seleção curada para o criador seletor. Sem ruído.
                        </p>

                        {/* Spec list — estilo editorial brandbook */}
                        <ul
                            className="flex flex-col mb-10 relative"
                            style={{ paddingTop: 24, borderTop: "1px solid rgba(212,168,92,0.22)" }}
                        >
                            <span
                                aria-hidden
                                style={{
                                    position: "absolute", top: -1, left: 0,
                                    width: 48, height: 1, background: BRONZE,
                                }}
                            />
                            {[
                                { num: "01", text: "Ofertas exclusivas de touros, doadoras e embriões" },
                                { num: "02", text: "Primeira mão nos leilões com curadoria FdB × Bula" },
                                { num: "03", text: "Atendimento direto com o time comercial" },
                            ].map(({ num, text }) => (
                                <li
                                    key={num}
                                    className="flex items-baseline gap-5 py-3"
                                    style={{
                                        borderBottom: "1px solid rgba(212,168,92,0.10)",
                                    }}
                                >
                                    <span
                                        className="font-display flex-shrink-0"
                                        style={{
                                            fontFamily: "var(--font-mono)",
                                            fontSize: 11,
                                            letterSpacing: "0.2em",
                                            color: BRONZE_LIGHT,
                                            fontWeight: 500,
                                            width: 24,
                                        }}
                                    >
                                        {num}
                                    </span>
                                    <span style={{
                                        color: "rgba(245,240,228,0.88)",
                                        fontSize: 15,
                                        lineHeight: 1.5,
                                        letterSpacing: "-0.005em",
                                    }}>
                                        {text}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        {/* CTA */}
                        <a
                            href={WA_LINK}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackEvent('whatsapp_cta_click', { location: 'whatsapp_section', destination: 'wa.me' })}
                            className="group inline-flex items-center gap-2.5 transition-all hover:-translate-y-0.5 active:scale-95"
                            style={{
                                background: BRONZE,
                                color: INK,
                                padding: "16px 28px",
                                borderRadius: 2,
                                fontWeight: 600,
                                fontSize: 14,
                                letterSpacing: "0.02em",
                                boxShadow: "0 0 0 1px rgba(212,168,92,0.35), 0 0 60px rgba(212,168,92,0.18)",
                            }}
                        >
                            Solicitar acesso pelo WhatsApp
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:translate-x-0.5">
                                <path d="M5 12h14M13 6l6 6-6 6"/>
                            </svg>
                        </a>
                    </div>

                    {/* Coluna visual — mockup conversa WhatsApp */}
                    <div
                        className="relative overflow-hidden order-first lg:order-last"
                        style={{
                            background: `linear-gradient(135deg, ${INK_2} 0%, #1A1610 100%)`,
                            padding: 28,
                            borderRadius: 4,
                            border: "1px solid rgba(212,168,92,0.22)",
                            boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
                        }}
                    >
                        {/* Brackets brandbook decorativos */}
                        {[
                            { top: 10, left: 10, bt: 1, bl: 1 },
                            { top: 10, right: 10, bt: 1, br: 1 },
                            { bottom: 10, left: 10, bb: 1, bl: 1 },
                            { bottom: 10, right: 10, bb: 1, br: 1 },
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
                                    zIndex: 12,
                                }}
                            />
                        ))}

                        {/* "F" decorativo de fundo */}
                        <div
                            aria-hidden
                            className="absolute font-display pointer-events-none select-none"
                            style={{
                                top: -80, right: -50,
                                fontSize: "clamp(280px, 50vw, 420px)",
                                fontWeight: 300,
                                color: "rgba(212,168,92,0.06)",
                                lineHeight: 0.8,
                                letterSpacing: "-0.06em",
                            }}
                        >
                            F
                        </div>

                        {/* Header do "telefone" */}
                        <div
                            className="relative z-10 flex items-center gap-3 pb-4 mb-5"
                            style={{ borderBottom: "1px solid rgba(212,168,92,0.18)" }}
                        >
                            <div style={{
                                width: 40, height: 40, borderRadius: "50%",
                                background: `linear-gradient(135deg, ${BRONZE_LIGHT}, ${BRONZE})`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: INK, fontWeight: 700, fontSize: 13,
                                letterSpacing: "-0.02em",
                                fontFamily: "var(--font-display)",
                            }}>
                                FdB
                            </div>
                            <div className="flex-1 min-w-0">
                                <div style={{
                                    color: FG, fontSize: 14, fontWeight: 600,
                                    letterSpacing: "-0.01em",
                                }}>
                                    Fórmula do Boi · Selo Ouro
                                </div>
                                <div style={{
                                    fontFamily: "var(--font-mono)", fontSize: 10,
                                    letterSpacing: "0.18em", textTransform: "uppercase",
                                    color: BRONZE_LIGHT, marginTop: 3, fontWeight: 500,
                                }}>
                                    Curadoria privada
                                </div>
                            </div>
                            <span style={{
                                width: 7, height: 7, borderRadius: "50%",
                                background: "#22C55E",
                                boxShadow: "0 0 10px rgba(34,197,94,0.6)",
                            }} />
                        </div>

                        {/* Mensagens */}
                        <div className="relative z-10 flex flex-col gap-3">
                            {/* msg 1 — oferta */}
                            <div style={{
                                background: "rgba(212,168,92,0.08)",
                                border: "1px solid rgba(212,168,92,0.22)",
                                padding: "12px 14px",
                                borderRadius: 8,
                                borderTopLeftRadius: 2,
                                maxWidth: "92%",
                            }}>
                                <div style={{
                                    fontFamily: "var(--font-mono)", fontSize: 9.5,
                                    color: BRONZE_LIGHT, letterSpacing: "0.2em",
                                    textTransform: "uppercase", marginBottom: 8, fontWeight: 500,
                                }}>
                                    Oferta · 24h antes do catálogo
                                </div>
                                <div style={{ color: FG, fontSize: 13.5, lineHeight: 1.5 }}>
                                    Doadora <b style={{ color: BRONZE_LIGHT }}>FIV registrada</b>, filha de Maximus FIV. DEP top 10%. Ficha técnica e vídeo abaixo.
                                </div>
                            </div>

                            {/* msg 2 — anexo PDF */}
                            <div style={{
                                background: "rgba(245,240,228,0.04)",
                                border: "1px solid rgba(245,240,228,0.08)",
                                padding: "10px 12px",
                                borderRadius: 8,
                                maxWidth: "75%",
                                display: "flex", alignItems: "center", gap: 12,
                            }}>
                                <span style={{
                                    width: 34, height: 34, borderRadius: 4,
                                    background: BRONZE,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: INK, fontWeight: 700, fontSize: 10,
                                    fontFamily: "var(--font-mono)", letterSpacing: "0.05em",
                                    flexShrink: 0,
                                }}>PDF</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        color: FG, fontSize: 12.5, fontWeight: 500,
                                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                    }}>
                                        Ficha-tecnica-doadora.pdf
                                    </div>
                                    <div style={{
                                        fontFamily: "var(--font-mono)", fontSize: 10,
                                        color: "rgba(245,240,228,0.5)", marginTop: 3,
                                        letterSpacing: "0.05em",
                                    }}>
                                        2.4 MB · genealogia + DEPs
                                    </div>
                                </div>
                            </div>

                            {/* msg 3 — condição comercial */}
                            <div style={{
                                background: "rgba(212,168,92,0.08)",
                                border: "1px solid rgba(212,168,92,0.22)",
                                padding: "12px 14px",
                                borderRadius: 8,
                                borderTopLeftRadius: 2,
                                maxWidth: "88%",
                            }}>
                                <div style={{ color: FG, fontSize: 13.5, lineHeight: 1.5 }}>
                                    Condição Selo Ouro: <b style={{ color: BRONZE_LIGHT }}>30+30+30</b> sem juros. Reserva antes de abrir pro leilão público?
                                </div>
                            </div>

                            {/* resposta usuário */}
                            <div
                                className="self-end"
                                style={{
                                    background: BRONZE,
                                    color: INK,
                                    padding: "10px 14px",
                                    borderRadius: 8,
                                    borderTopRightRadius: 2,
                                    fontSize: 13.5,
                                    fontWeight: 600,
                                    maxWidth: "62%",
                                    letterSpacing: "-0.005em",
                                }}
                            >
                                Quero. Pode reservar.
                            </div>
                        </div>

                        {/* Carimbo rodapé */}
                        <div
                            className="relative z-10 mt-6 pt-4"
                            style={{
                                borderTop: "1px solid rgba(212,168,92,0.12)",
                                fontFamily: "var(--font-mono)",
                                fontSize: 9.5,
                                letterSpacing: "0.22em",
                                textTransform: "uppercase",
                                color: "rgba(245,240,228,0.42)",
                                textAlign: "center",
                                fontWeight: 500,
                            }}
                        >
                            Simulação · conversa real do grupo
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
