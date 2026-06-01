"use client";

import { useEffect, useRef, useState } from "react";
import GrupoVipQuiz from "./GrupoVipQuiz";

const BRONZE = "#A0792E";
const BRONZE_LIGHT = "#D4A85C";
const BRONZE_PALE = "#E8CB85";
const INK = "#0A0A0A";
const INK_2 = "#141414";
const FG = "#F5F0E4";
const FG_MUTED_70 = "rgba(245,240,228,0.70)";
const FG_MUTED_55 = "rgba(245,240,228,0.55)";
const LINE = "rgba(212,168,92,0.14)";
const LINE_STRONG = "rgba(212,168,92,0.28)";

type Props = { waGroupLink: string };

export default function GrupoVipContent({ waGroupLink }: Props) {
    return (
        <>
            {/* Animação dos CTAs — bounce + glow pulsante, pausa no hover e
                respeita prefers-reduced-motion. O floating usa só o glow porque
                seu transform já é controlado pela lógica de visibilidade. */}
            <style jsx global>{`
                @keyframes grupoCtaBounce {
                    0%, 100% {
                        transform: translateY(0);
                        box-shadow: 0 0 0 1px rgba(212, 168, 92, 0.35), 0 0 30px rgba(212, 168, 92, 0.22);
                    }
                    50% {
                        transform: translateY(-5px);
                        box-shadow: 0 0 0 1px rgba(212, 168, 92, 0.65), 0 12px 46px rgba(212, 168, 92, 0.5);
                    }
                }
                @keyframes grupoCtaGlow {
                    0%, 100% {
                        box-shadow: 0 0 0 1px rgba(212, 168, 92, 0.35), 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 40px rgba(212, 168, 92, 0.22);
                    }
                    50% {
                        box-shadow: 0 0 0 1px rgba(212, 168, 92, 0.7), 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 70px rgba(212, 168, 92, 0.55);
                    }
                }
                .grupo-cta {
                    animation: grupoCtaBounce 2s ease-in-out infinite;
                    will-change: transform;
                    text-decoration: none;
                }
                .grupo-cta:hover {
                    animation-play-state: paused;
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 0 0 1px rgba(212, 168, 92, 0.7), 0 14px 52px rgba(212, 168, 92, 0.55);
                }
                .grupo-cta-float {
                    animation: grupoCtaGlow 2s ease-in-out infinite;
                }
                @media (prefers-reduced-motion: reduce) {
                    .grupo-cta,
                    .grupo-cta-float {
                        animation: none;
                    }
                }
            `}</style>
            <HeroSection />
            <GroupOfferSection />
            <DiferenciaisSection />
            <PilaresSection />
            <PhotoDivider />
            <StatsSection />
            <NetworkingBanner />
            <QuizSection waGroupLink={waGroupLink} />
            <FloatingCta />
        </>
    );
}

/* ──────────────────────────── CTA REUTILIZÁVEL ──────────────────────────── */
/* CTA padrão da LP — leva ao formulário (#formulario), onde o lead entra no
   funil do grupo. Texto fixo conforme briefing: "Quero entrar no grupo de
   WhatsApp". Animação vem da classe global `grupo-cta`. */
function GroupCta({ marginTop = 40 }: { marginTop?: number }) {
    return (
        <div className="flex justify-center" style={{ marginTop }}>
            <a
                href="#formulario"
                aria-label="Quero entrar no grupo de WhatsApp"
                className="grupo-cta inline-flex items-center justify-center gap-2.5"
                style={{
                    background: BRONZE,
                    color: INK,
                    padding: "16px 30px",
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: 14,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    border: `1px solid ${BRONZE}`,
                    textAlign: "center",
                }}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Quero entrar no grupo de WhatsApp
            </a>
        </div>
    );
}

/* ──────────────────────────── HERO ──────────────────────────── */
function HeroSection() {
    return (
        <section
            className="relative flex items-center overflow-hidden"
            style={{
                minHeight: "92vh",
                background: INK,
                color: FG,
                padding: "80px 20px",
            }}
        >
            {/* Background photo */}
            <img
                src="/lp/login-bg.jpg"
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: "center 30%" }}
            />
            {/* Gradient overlay */}
            <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.82) 60%, rgba(10,10,10,0.98) 100%)",
                }}
            />
            {/* Radial bronze glow */}
            <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(ellipse at 50% 0%, rgba(212,168,92,0.18) 0%, rgba(10,10,10,0) 60%)",
                }}
            />
            {/* Dot grid */}
            <div
                aria-hidden
                className="absolute inset-0 pointer-events-none opacity-40"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 1px 1px, rgba(232,203,133,0.14) 1px, transparent 0)",
                    backgroundSize: "28px 28px",
                    maskImage:
                        "linear-gradient(180deg, transparent 0%, black 40%, black 85%, transparent 100%)",
                }}
            />

            <div
                className="relative z-10 w-full mx-auto text-center"
                style={{ maxWidth: 980 }}
            >
                {/* Eyebrow */}
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
                    <span
                        style={{
                            width: 32,
                            height: 1,
                            background: BRONZE,
                            display: "inline-block",
                            flexShrink: 0,
                        }}
                    />
                    <span
                        style={{
                            width: 6,
                            height: 6,
                            background: BRONZE,
                            borderRadius: "50%",
                        }}
                    />
                    Comunidade · Nelore PO
                    <span
                        style={{
                            width: 6,
                            height: 6,
                            background: BRONZE,
                            borderRadius: "50%",
                        }}
                    />
                    <span
                        style={{
                            width: 32,
                            height: 1,
                            background: BRONZE,
                            display: "inline-block",
                            flexShrink: 0,
                        }}
                    />
                </div>

                <h1
                    className="font-display mx-auto"
                    style={{
                        fontWeight: 500,
                        fontSize: "clamp(36px, 7.5vw, 88px)",
                        lineHeight: 0.98,
                        letterSpacing: "-0.03em",
                        marginBottom: 24,
                        maxWidth: "18ch",
                        color: FG,
                        textWrap: "balance",
                    }}
                >
                    Cada dia sem a{" "}
                    <span style={{ color: BRONZE_LIGHT }}>genética certa</span>
                    <br />
                    é dinheiro que você não recupera.
                </h1>

                <p
                    className="mx-auto"
                    style={{
                        fontSize: "clamp(15px, 1.8vw, 19px)",
                        lineHeight: 1.6,
                        color: "rgba(245,240,228,0.82)",
                        marginBottom: 36,
                        maxWidth: "62ch",
                        letterSpacing: "-0.005em",
                    }}
                >
                    A Fórmula do Boi conecta criadores, investidores e
                    apaixonados por Nelore PO onde{" "}
                    <strong style={{ color: BRONZE_PALE, fontWeight: 600 }}>
                        genética de elite
                    </strong>
                    , dados reais e negócios acontecem todos os dias.
                </p>

                {/* CTA */}
                <div className="mb-9">
                    <GroupCta marginTop={0} />
                </div>

                {/* Social proof / trust */}
                <div
                    className="mx-auto inline-flex items-center gap-3"
                    style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11.5,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "rgba(245,240,228,0.65)",
                        padding: "10px 18px",
                        border: `1px solid ${LINE_STRONG}`,
                        borderRadius: 2,
                        background: "rgba(10,10,10,0.45)",
                    }}
                >
                    <span
                        style={{
                            width: 6,
                            height: 6,
                            background: BRONZE,
                            borderRadius: "50%",
                        }}
                    />
                    +400 criadores e investidores já fazem parte
                </div>
            </div>
        </section>
    );
}

/* ──────────────────────────── EYEBROW + SECTION HEAD ──────────────────────────── */
function SectionEyebrow({
    children,
    align = "left",
}: {
    children: React.ReactNode;
    align?: "left" | "center";
}) {
    return (
        <div
            className="inline-flex items-center gap-3 mb-3"
            style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: BRONZE_LIGHT,
                fontWeight: 500,
                justifyContent: align === "center" ? "center" : "flex-start",
            }}
        >
            <span
                style={{
                    width: 28,
                    height: 1,
                    background: BRONZE,
                    display: "inline-block",
                }}
            />
            <span>{children}</span>
        </div>
    );
}

/* ──────────────────────────── O QUE VOCÊ ENCONTRA NO GRUPO ──────────────────────────── */
const OFFER_CARDS = [
    {
        title: "Sêmen dos Touros FDB",
        desc:
            "Comercialização direta de sêmen dos reprodutores da Fórmula do Boi — touros provados, com genealogia e DEPs verificados.",
        icon: (
            <svg viewBox="0 0 24 24" width="24" height="24" fill={BRONZE_LIGHT}>
                <path d="M12 2a5 5 0 100 10A5 5 0 0012 2zm0 12c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z" />
            </svg>
        ),
    },
    {
        title: "Embriões de elite",
        desc:
            "Acesso às melhores doadoras do mercado. Embriões com procedência verificada e potencial genético comprovado.",
        icon: (
            <svg viewBox="0 0 24 24" width="24" height="24" fill={BRONZE_LIGHT}>
                <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2h-1V1h-2zm3 18H5V8h14v11z" />
            </svg>
        ),
    },
    {
        title: "Melhores leilões de PO",
        desc:
            "Curadoria dos principais leilões de Nelore PO do país. Saiba antes de todo mundo quais animais valem a disputa.",
        icon: (
            <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke={BRONZE_LIGHT}
                strokeWidth="2"
            >
                <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" />
            </svg>
        ),
    },
    {
        title: "Conteúdo de genética Nelore PO",
        desc:
            "Análises de DEPs, tendências de mercado, manejo e informações estratégicas para quem leva PO a sério.",
        icon: (
            <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke={BRONZE_LIGHT}
                strokeWidth="2"
            >
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
    },
];

function GroupOfferSection() {
    return (
        <section
            className="relative"
            style={{
                background: INK,
                borderTop: `1px solid ${LINE}`,
                padding: "96px 20px 80px",
            }}
        >
            <div className="container mx-auto" style={{ maxWidth: 1180 }}>
                <div className="text-center mb-14">
                    <div style={{ textAlign: "center" }}>
                        <SectionEyebrow align="center">
                            O que está dentro do grupo
                        </SectionEyebrow>
                    </div>
                    <h2
                        className="font-display mx-auto"
                        style={{
                            fontWeight: 500,
                            fontSize: "clamp(28px, 4.2vw, 48px)",
                            lineHeight: 1.05,
                            letterSpacing: "-0.025em",
                            color: FG,
                            marginBottom: 12,
                            maxWidth: "24ch",
                            textWrap: "balance",
                        }}
                    >
                        Tudo que move o mercado de{" "}
                        <span style={{ color: BRONZE_LIGHT }}>Nelore PO</span>{" "}
                        em um só lugar
                    </h2>
                    <p
                        className="mx-auto"
                        style={{
                            color: FG_MUTED_70,
                            fontSize: 16,
                            lineHeight: 1.6,
                            maxWidth: "58ch",
                        }}
                    >
                        Acesso direto às melhores oportunidades de genética PO
                        do Brasil, curadas e verificadas pela equipe da Fórmula
                        do Boi.
                    </p>
                </div>

                <div
                    className="grid gap-5"
                    style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
                >
                    {OFFER_CARDS.map((c) => (
                        <article
                            key={c.title}
                            className="brackets group"
                            style={{
                                background: INK_2,
                                border: `1px solid ${LINE}`,
                                borderRadius: 4,
                                padding: "32px 28px",
                                position: "relative",
                                transition:
                                    "border-color .35s ease, transform .35s ease",
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.borderColor =
                                    LINE_STRONG;
                                (e.currentTarget as HTMLElement).style.transform =
                                    "translateY(-2px)";
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.borderColor =
                                    LINE;
                                (e.currentTarget as HTMLElement).style.transform =
                                    "translateY(0)";
                            }}
                        >
                            <span className="bl" />
                            <div
                                className="inline-flex items-center justify-center mb-5"
                                style={{
                                    width: 48,
                                    height: 48,
                                    border: `1px solid ${LINE_STRONG}`,
                                    background: "rgba(160,121,46,0.08)",
                                    borderRadius: 2,
                                }}
                            >
                                {c.icon}
                            </div>
                            <h3
                                className="font-display"
                                style={{
                                    fontWeight: 500,
                                    fontSize: 20,
                                    lineHeight: 1.2,
                                    letterSpacing: "-0.01em",
                                    color: FG,
                                    marginBottom: 10,
                                }}
                            >
                                {c.title}
                            </h3>
                            <p
                                style={{
                                    fontSize: 14.5,
                                    lineHeight: 1.6,
                                    color: FG_MUTED_70,
                                }}
                            >
                                {c.desc}
                            </p>
                        </article>
                    ))}
                </div>

                <GroupCta />
            </div>
        </section>
    );
}

/* ──────────────────────────── DIFERENCIAIS ──────────────────────────── */
const DIFERENCIAIS = [
    {
        title: "Parcelamento em até 30x no boleto",
        desc:
            "Invista em genética sem comprometer o caixa: até 30 parcelas em boleto bancário em compras de animais.",
        icon: (
            <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke={BRONZE_LIGHT}
                strokeWidth="2"
            >
                <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
    },
    {
        title: "Conteúdo personalizado sobre PO",
        desc:
            "Material por perfil — do iniciante ao criador experiente — com foco prático e aplicado à realidade do mercado.",
        icon: (
            <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke={BRONZE_LIGHT}
                strokeWidth="2"
            >
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
        ),
    },
    {
        title: "Aulões semanais exclusivos",
        desc:
            "Análises e técnicas toda semana — aulas preparadas por especialistas em genética Nelore PO direto pra dentro do grupo.",
        icon: (
            <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke={BRONZE_LIGHT}
                strokeWidth="2"
            >
                <path d="M15 10l4.553-2.069A1 1 0 0121 8.87V15.13a1 1 0 01-1.447.899L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
        ),
    },
];

function DiferenciaisSection() {
    return (
        <section
            className="relative"
            style={{ background: INK, padding: "80px 20px" }}
        >
            <div className="container mx-auto" style={{ maxWidth: 1180 }}>
                <div className="text-center mb-14">
                    <div style={{ textAlign: "center" }}>
                        <SectionEyebrow align="center">
                            Por que entrar agora
                        </SectionEyebrow>
                    </div>
                    <h2
                        className="font-display mx-auto"
                        style={{
                            fontWeight: 500,
                            fontSize: "clamp(28px, 4.2vw, 48px)",
                            lineHeight: 1.05,
                            letterSpacing: "-0.025em",
                            color: FG,
                            marginBottom: 12,
                            maxWidth: "26ch",
                            textWrap: "balance",
                        }}
                    >
                        Mais do que um grupo —{" "}
                        <span style={{ color: BRONZE_LIGHT }}>
                            uma vantagem competitiva
                        </span>
                    </h2>
                    <p
                        className="mx-auto"
                        style={{
                            color: FG_MUTED_70,
                            fontSize: 16,
                            maxWidth: "52ch",
                        }}
                    >
                        Benefícios exclusivos para quem faz parte da Fórmula do
                        Boi.
                    </p>
                </div>

                <div
                    className="grid gap-5"
                    style={{
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    }}
                >
                    {DIFERENCIAIS.map((c) => (
                        <article
                            key={c.title}
                            style={{
                                background: INK_2,
                                border: `1px solid ${LINE}`,
                                borderRadius: 4,
                                padding: "32px 28px",
                                position: "relative",
                                overflow: "hidden",
                            }}
                        >
                            <span
                                aria-hidden
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: 1,
                                    background: BRONZE,
                                }}
                            />
                            <div
                                className="inline-flex items-center justify-center mb-5"
                                style={{
                                    width: 48,
                                    height: 48,
                                    border: `1px solid ${LINE_STRONG}`,
                                    background: "rgba(160,121,46,0.08)",
                                    borderRadius: 2,
                                }}
                            >
                                {c.icon}
                            </div>
                            <h3
                                className="font-display"
                                style={{
                                    fontWeight: 500,
                                    fontSize: 20,
                                    lineHeight: 1.2,
                                    letterSpacing: "-0.01em",
                                    color: FG,
                                    marginBottom: 10,
                                }}
                            >
                                {c.title}
                            </h3>
                            <p
                                style={{
                                    fontSize: 14.5,
                                    lineHeight: 1.6,
                                    color: FG_MUTED_70,
                                }}
                            >
                                {c.desc}
                            </p>
                        </article>
                    ))}
                </div>

                <GroupCta />
            </div>
        </section>
    );
}

/* ──────────────────────────── 3 PILARES ──────────────────────────── */
const PILARES = [
    {
        n: "01",
        title: "Conhecimento",
        desc:
            "Conteúdo técnico, aulões e análises de genética Nelore PO que aceleram sua curva de aprendizado e qualificam cada decisão de compra.",
    },
    {
        n: "02",
        title: "Produtos de altíssima qualidade",
        desc:
            "Sêmen dos touros FDB, embriões das melhores doadoras e acesso aos principais leilões PO — verificado e curado antes de chegar até você.",
    },
    {
        n: "03",
        title: "Contatos qualificados",
        desc:
            "Rede seleta de criadores, investidores e especialistas que abrem portas, geram negócios e elevam o nível do que você pode alcançar no PO.",
    },
];

function PilaresSection() {
    return (
        <section
            className="relative"
            style={{
                background: INK,
                borderTop: `1px solid ${LINE}`,
                padding: "96px 20px",
            }}
        >
            <div className="container mx-auto" style={{ maxWidth: 1180 }}>
                <div
                    className="brackets"
                    style={{
                        background: INK_2,
                        border: `1px solid ${LINE}`,
                        borderRadius: 4,
                        overflow: "hidden",
                        position: "relative",
                    }}
                >
                    <span className="bl" />

                    {/* Header strip */}
                    <div
                        className="text-center"
                        style={{
                            padding: "56px 32px 40px",
                            borderBottom: `1px solid ${LINE}`,
                            position: "relative",
                        }}
                    >
                        <div style={{ textAlign: "center" }}>
                            <SectionEyebrow align="center">
                                Três atributos · Uma vantagem
                            </SectionEyebrow>
                        </div>
                        <h2
                            className="font-display mx-auto"
                            style={{
                                fontWeight: 500,
                                fontSize: "clamp(26px, 3.8vw, 42px)",
                                lineHeight: 1.05,
                                letterSpacing: "-0.025em",
                                color: FG,
                                marginBottom: 10,
                                maxWidth: "28ch",
                                textWrap: "balance",
                            }}
                        >
                            O que você leva ao entrar para o{" "}
                            <span style={{ color: BRONZE_LIGHT }}>
                                grupo seleto
                            </span>
                        </h2>
                        <p
                            className="mx-auto"
                            style={{
                                color: FG_MUTED_70,
                                fontSize: 15,
                                maxWidth: "50ch",
                            }}
                        >
                            Três atributos que transformam a forma como você
                            atua no mercado de Nelore PO.
                        </p>
                    </div>

                    {/* Pillars grid */}
                    <div
                        className="grid"
                        style={{
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(260px, 1fr))",
                        }}
                    >
                        {PILARES.map((p, i) => (
                            <div
                                key={p.n}
                                className="text-center"
                                style={{
                                    padding: "48px 36px",
                                    borderLeft:
                                        i > 0 ? `1px solid ${LINE}` : "none",
                                    position: "relative",
                                }}
                            >
                                <div
                                    className="font-mono"
                                    style={{
                                        fontFamily: "var(--font-mono)",
                                        fontSize: 12,
                                        letterSpacing: "0.24em",
                                        textTransform: "uppercase",
                                        color: BRONZE,
                                        marginBottom: 18,
                                    }}
                                >
                                    <span
                                        style={{
                                            display: "inline-block",
                                            padding: "4px 10px",
                                            border: `1px solid ${LINE_STRONG}`,
                                            borderRadius: 2,
                                        }}
                                    >
                                        Pilar {p.n}
                                    </span>
                                </div>
                                <h3
                                    className="font-display"
                                    style={{
                                        fontWeight: 500,
                                        fontSize: "clamp(20px, 2vw, 26px)",
                                        lineHeight: 1.15,
                                        letterSpacing: "-0.02em",
                                        color: FG,
                                        marginBottom: 14,
                                        maxWidth: "20ch",
                                        marginInline: "auto",
                                        textWrap: "balance",
                                    }}
                                >
                                    {p.title}
                                </h3>
                                <p
                                    style={{
                                        fontSize: 14.5,
                                        lineHeight: 1.65,
                                        color: FG_MUTED_70,
                                        maxWidth: "36ch",
                                        marginInline: "auto",
                                    }}
                                >
                                    {p.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <GroupCta />
            </div>
        </section>
    );
}

/* ──────────────────────────── PHOTO DIVIDER ──────────────────────────── */
function PhotoDivider() {
    return (
        <div
            className="relative w-full overflow-hidden"
            style={{ height: "clamp(280px, 38vw, 460px)", background: INK }}
        >
            <img
                src="/lp/DJI_20231108093924_0025_D.jpg"
                alt="Rebanho Nelore PO — vista aérea"
                className="w-full h-full object-cover"
                style={{ objectPosition: "center 45%" }}
                loading="lazy"
            />
            <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "linear-gradient(180deg, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.05) 14%, rgba(10,10,10,0.05) 86%, rgba(10,10,10,0.95) 100%)",
                }}
            />
            <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 1px 1px, rgba(232,203,133,0.10) 1px, transparent 0)",
                    backgroundSize: "32px 32px",
                    mixBlendMode: "screen",
                }}
            />
        </div>
    );
}

/* ──────────────────────────── STATS ──────────────────────────── */
function StatsSection() {
    const [count, setCount] = useState(0);
    const [statesCount, setStatesCount] = useState(0);
    const rootRef = useRef<HTMLDivElement>(null);
    const startedRef = useRef(false);

    useEffect(() => {
        if (!rootRef.current) return;
        const node = rootRef.current;
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting && !startedRef.current) {
                        startedRef.current = true;
                        const target1 = 400;
                        const target2 = 12;
                        const duration = 1500;
                        const start = performance.now();
                        const tick = (t: number) => {
                            const p = Math.min((t - start) / duration, 1);
                            const eased = 1 - Math.pow(1 - p, 3);
                            setCount(Math.floor(target1 * eased));
                            setStatesCount(Math.floor(target2 * eased));
                            if (p < 1) requestAnimationFrame(tick);
                        };
                        requestAnimationFrame(tick);
                    }
                });
            },
            { threshold: 0.3 }
        );
        io.observe(node);
        return () => io.disconnect();
    }, []);

    const items: { value: string; label: string }[] = [
        { value: `+${count}`, label: "Criadores no grupo" },
        { value: "Sempre", label: "Negócios fechados" },
        { value: `+${statesCount}`, label: "Estados representados" },
    ];

    return (
        <section
            ref={rootRef}
            className="relative"
            style={{
                background: INK,
                padding: "72px 20px",
                borderBottom: `1px solid ${LINE}`,
            }}
        >
            <div
                className="container mx-auto flex flex-wrap items-start justify-around gap-10"
                style={{ maxWidth: 1180, position: "relative" }}
            >
                <span
                    aria-hidden
                    style={{
                        position: "absolute",
                        top: -36,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 48,
                        height: 1,
                        background: BRONZE,
                    }}
                />
                {items.map((it) => (
                    <div
                        key={it.label}
                        className="text-center"
                        style={{ minWidth: 180 }}
                    >
                        <div
                            className="font-display"
                            style={{
                                fontWeight: 500,
                                fontSize: "clamp(40px, 5vw, 64px)",
                                lineHeight: 1,
                                color: BRONZE_LIGHT,
                                letterSpacing: "-0.025em",
                                marginBottom: 10,
                            }}
                        >
                            {it.value}
                        </div>
                        <div
                            style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 11,
                                letterSpacing: "0.22em",
                                textTransform: "uppercase",
                                color: FG_MUTED_55,
                                fontWeight: 500,
                            }}
                        >
                            {it.label}
                        </div>
                    </div>
                ))}
            </div>

            <GroupCta />
        </section>
    );
}

/* ──────────────────────────── NETWORKING BANNER ──────────────────────────── */
const NETWORKING_TAGS = [
    "Criadores de referência nacional",
    "Investidores do setor",
    "Especialistas em genética PO",
    "Fazendas de elite em +12 estados",
];

function NetworkingBanner() {
    return (
        <section
            className="relative overflow-hidden"
            style={{
                background: INK,
                padding: "88px 20px",
                borderBottom: `1px solid ${LINE}`,
            }}
        >
            <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(ellipse at 50% 0%, rgba(212,168,92,0.10) 0%, rgba(10,10,10,0) 60%)",
                }}
            />
            <div
                className="container mx-auto text-center relative"
                style={{ maxWidth: 1000 }}
            >
                <div style={{ textAlign: "center" }}>
                    <SectionEyebrow align="center">
                        Networking de elite
                    </SectionEyebrow>
                </div>
                <h2
                    className="font-display mx-auto"
                    style={{
                        fontWeight: 500,
                        fontSize: "clamp(26px, 4vw, 44px)",
                        lineHeight: 1.1,
                        letterSpacing: "-0.025em",
                        color: FG,
                        marginBottom: 16,
                        maxWidth: "26ch",
                        textWrap: "balance",
                    }}
                >
                    Amplie sua rede com os{" "}
                    <span style={{ color: BRONZE_LIGHT }}>
                        grandes nomes da pecuária
                    </span>{" "}
                    de elite do Brasil
                </h2>
                <p
                    className="mx-auto"
                    style={{
                        color: FG_MUTED_70,
                        fontSize: 16,
                        lineHeight: 1.65,
                        maxWidth: "58ch",
                        marginBottom: 36,
                    }}
                >
                    O grupo da Fórmula do Boi reúne criadores, investidores e
                    especialistas que movem o mercado de Nelore PO. Estar aqui
                    é estar onde as decisões são tomadas.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    {NETWORKING_TAGS.map((t) => (
                        <span
                            key={t}
                            className="inline-flex items-center gap-2"
                            style={{
                                padding: "8px 14px",
                                border: `1px solid ${LINE_STRONG}`,
                                borderRadius: 2,
                                fontFamily: "var(--font-mono)",
                                fontSize: 11,
                                letterSpacing: "0.18em",
                                textTransform: "uppercase",
                                color: BRONZE_LIGHT,
                                background: "rgba(160,121,46,0.06)",
                            }}
                        >
                            <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke={BRONZE}
                                strokeWidth="3"
                            >
                                <path d="M5 12l5 5 9-9" />
                            </svg>
                            {t}
                        </span>
                    ))}
                </div>

                <GroupCta />
            </div>
        </section>
    );
}

/* ──────────────────────────── QUIZ SECTION ──────────────────────────── */
function QuizSection({ waGroupLink }: { waGroupLink: string }) {
    return (
        <section
            id="formulario"
            className="relative"
            style={{
                background: INK,
                padding: "96px 20px 120px",
            }}
        >
            <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(232,203,133,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(232,203,133,0.05) 1px, transparent 1px)",
                    backgroundSize: "80px 80px",
                    maskImage:
                        "radial-gradient(ellipse at center, black 30%, transparent 70%)",
                }}
            />
            <div
                className="container mx-auto relative"
                style={{ maxWidth: 720 }}
            >
                <div className="text-center mb-12">
                    <div style={{ textAlign: "center" }}>
                        <SectionEyebrow align="center">
                            Seu próximo passo
                        </SectionEyebrow>
                    </div>
                    <h2
                        className="font-display mx-auto"
                        style={{
                            fontWeight: 500,
                            fontSize: "clamp(28px, 4.2vw, 48px)",
                            lineHeight: 1.05,
                            letterSpacing: "-0.025em",
                            color: FG,
                            marginBottom: 12,
                            maxWidth: "22ch",
                            textWrap: "balance",
                        }}
                    >
                        Entre para a{" "}
                        <span style={{ color: BRONZE_LIGHT }}>
                            Fórmula do Boi
                        </span>
                    </h2>
                    <p
                        className="mx-auto"
                        style={{
                            color: FG_MUTED_70,
                            fontSize: 16,
                            maxWidth: "50ch",
                        }}
                    >
                        Responda algumas perguntas rápidas para recebermos você
                        da melhor forma.
                    </p>
                </div>

                <GrupoVipQuiz waGroupLink={waGroupLink} />
            </div>
        </section>
    );
}

/* ──────────────────────────── FLOATING CTA ──────────────────────────── */
function FloatingCta() {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 600);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);
    return (
        <a
            href="#formulario"
            aria-label="Quero entrar no grupo de WhatsApp"
            className="grupo-cta-float fixed z-50 hidden md:inline-flex items-center gap-2.5 transition-all"
            style={{
                bottom: 24,
                right: 24,
                background: BRONZE,
                color: INK,
                padding: "14px 22px",
                borderRadius: 2,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 600,
                border: `1px solid ${BRONZE}`,
                boxShadow:
                    "0 0 0 1px rgba(212,168,92,0.35), 0 8px 32px rgba(0,0,0,0.6), 0 0 60px rgba(212,168,92,0.22)",
                opacity: visible ? 1 : 0,
                pointerEvents: visible ? "auto" : "none",
                transform: visible ? "translateY(0)" : "translateY(16px)",
            }}
        >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Entrar no grupo de WhatsApp
        </a>
    );
}
