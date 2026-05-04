"use client";

import Link from "next/link";

const BRONZE = "#A0792E";
const BRONZE_LIGHT = "#D4A85C";
const INK = "#0A0A0A";
const INK_2 = "#141414";
const FG = "#F5F0E4";

/**
 * ParceirosOperacionais — bloco institucional dos parceiros operacionais
 * (Aceleradora de Touros + Central Bela Vista). Aparece após SociedadeBulinha
 * na home e materializa o tripé de parceria FdB declarado no brandbook.
 *
 * TODO: substituir os blocos `LogoPlaceholder` por logos oficiais quando
 * recebidos:
 *   - Central Bela Vista: arquivo enviado no chat por Fabrício 2026-05-01
 *     (cabeças de boi vermelhas + wordmark). Salvar em /public/logo-bela-vista.png
 *   - Aceleradora de Touros: ainda não entregue.
 */
export default function ParceirosOperacionais() {
    return (
        <section
            className="py-20 md:py-28 relative overflow-hidden"
            style={{ background: INK }}
        >
            <div
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 1px 1px, rgba(232,203,133,0.08) 1px, transparent 0)",
                    backgroundSize: "32px 32px",
                    maskImage: "radial-gradient(ellipse at center, black 0%, transparent 70%)",
                }}
            />

            <div className="container mx-auto px-4 relative" style={{ maxWidth: 1200 }}>
                <div className="text-center mb-12 md:mb-16">
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
                        Parceiros operacionais
                        <span style={{ width: 24, height: 1, background: BRONZE }} />
                    </div>
                    <h2
                        className="font-display"
                        style={{
                            fontSize: "clamp(32px, 5vw, 64px)",
                            fontWeight: 500,
                            lineHeight: 1.0,
                            letterSpacing: "-0.025em",
                            color: FG,
                            maxWidth: "20ch",
                            margin: "0 auto",
                        }}
                    >
                        Construído com quem entende <span style={{ color: BRONZE_LIGHT }}>do mercado.</span>
                    </h2>
                    <p
                        style={{
                            color: "rgba(245,240,228,0.62)",
                            fontSize: 17,
                            lineHeight: 1.55,
                            marginTop: 18,
                            maxWidth: "58ch",
                            margin: "18px auto 0",
                        }}
                    >
                        Não fazemos sozinhos. A Fórmula do Boi opera ao lado de parceiros que são referência
                        em cada elo da cadeia — da seleção do reprodutor à coleta certificada.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-5 md:gap-7">
                    <ParceiroCard
                        eyebrow="Programa · Seleção e divulgação"
                        title="Aceleradora de Touros"
                        copy="Programa de aceleração de novos touros de elite. O Atacante da Matinha (RDM B 3224 MAT., MGTe 42,38 TOP 0,1%) é o lançamento atual da Aceleradora dentro da Fórmula do Boi — touro jovem com pré-reserva aberta na Procriar SP."
                        ctaLabel="Conhecer o Atacante"
                        ctaHref="/atacante"
                        logo={<LogoAceleradora />}
                    />
                    <ParceiroCard
                        eyebrow="Central · Coleta e processamento"
                        title="Central Bela Vista"
                        copy="Parceria operacional para coleta, congelamento e distribuição de sêmen com rastreabilidade total e certificação MAPA. Os reprodutores Fórmula do Boi estão sob coleta contínua na Bela Vista — controle de qualidade mundial e logística direta para o Brasil inteiro."
                        ctaLabel="Falar sobre logística"
                        ctaHref="/grupo-vip"
                        logo={<LogoBelaVista />}
                    />
                </div>
            </div>
        </section>
    );
}

function ParceiroCard({
    eyebrow,
    title,
    copy,
    ctaLabel,
    ctaHref,
    logo,
}: {
    eyebrow: string;
    title: string;
    copy: string;
    ctaLabel: string;
    ctaHref: string;
    logo: React.ReactNode;
}) {
    return (
        <article
            className="card-engraved relative flex flex-col"
            style={{
                background: INK_2,
                border: "1px solid rgba(212,168,92,0.20)",
                padding: "32px 28px",
                borderRadius: 4,
            }}
        >
            {/* Brackets */}
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
                        width: 12, height: 12,
                        borderColor: "rgba(212,168,92,0.40)",
                        borderStyle: "solid",
                        borderWidth: 0,
                        borderTopWidth: s.bt ? 1 : 0,
                        borderBottomWidth: s.bb ? 1 : 0,
                        borderLeftWidth: s.bl ? 1 : 0,
                        borderRightWidth: s.br ? 1 : 0,
                        top: s.top, bottom: s.bottom, left: s.left, right: s.right,
                    }}
                />
            ))}

            <div
                className="flex items-center justify-center mb-7"
                style={{
                    height: 96,
                    background: INK,
                    border: "1px solid rgba(212,168,92,0.16)",
                    borderRadius: 2,
                }}
            >
                {logo}
            </div>

            <div
                style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.20em",
                    textTransform: "uppercase",
                    color: BRONZE_LIGHT,
                    fontWeight: 500,
                    marginBottom: 10,
                }}
            >
                {eyebrow}
            </div>
            <h3
                className="font-display mb-4"
                style={{
                    fontSize: 30,
                    fontWeight: 500,
                    color: FG,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.05,
                }}
            >
                {title}
            </h3>
            <p
                style={{
                    color: "rgba(245,240,228,0.72)",
                    fontSize: 15,
                    lineHeight: 1.6,
                    marginBottom: 22,
                    flex: 1,
                }}
            >
                {copy}
            </p>

            <Link
                href={ctaHref}
                className="inline-flex items-center gap-2 self-start"
                style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: BRONZE_LIGHT,
                    fontWeight: 600,
                    paddingTop: 10,
                    borderTop: `1px solid rgba(212,168,92,0.28)`,
                    width: "100%",
                }}
            >
                {ctaLabel}
                <span aria-hidden style={{ marginLeft: "auto" }}>→</span>
            </Link>
        </article>
    );
}

/* Logos placeholder — line art bronze, brandbook V1.0.
   TODO: substituir pela logo oficial quando entregue. */
function LogoAceleradora() {
    return (
        <div className="flex items-center gap-3" aria-label="Logo Aceleradora de Touros — placeholder">
            <svg width="44" height="44" viewBox="0 0 64 64" fill="none" stroke={BRONZE} strokeWidth="1.4" aria-hidden>
                {/* cabeça de boi estilizada */}
                <path d="M14 28c0-9 7-16 18-16s18 7 18 16-7 16-18 16-18-7-18-16z" />
                <path d="M10 22l4 4M54 22l-4 4" />
                <circle cx="26" cy="30" r="1.5" fill={BRONZE} />
                <circle cx="38" cy="30" r="1.5" fill={BRONZE} />
                <path d="M28 38c1.5 1.5 4.5 1.5 6 0" />
                {/* setas de aceleração */}
                <path d="M16 52l8-4M24 56l8-4M32 52l8-4M40 56l8-4" strokeWidth="1.2" />
            </svg>
            <div className="text-left">
                <div
                    className="font-display"
                    style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: FG,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        lineHeight: 1,
                    }}
                >
                    Aceleradora
                </div>
                <div
                    style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 9.5,
                        letterSpacing: "0.20em",
                        textTransform: "uppercase",
                        color: BRONZE_LIGHT,
                        marginTop: 4,
                    }}
                >
                    de Touros
                </div>
            </div>
        </div>
    );
}

function LogoBelaVista() {
    return (
        <div className="flex items-center gap-3" aria-label="Logo Central Bela Vista — placeholder">
            <svg width="56" height="44" viewBox="0 0 80 60" fill="none" stroke={BRONZE} strokeWidth="1.4" aria-hidden>
                {/* arco/sol */}
                <path d="M14 30c0-12 11-22 26-22s26 10 26 22" strokeWidth="1.6" />
                {/* 3 cabeças de boi alinhadas */}
                <ellipse cx="22" cy="38" rx="8" ry="9" />
                <ellipse cx="40" cy="38" rx="8" ry="9" />
                <ellipse cx="58" cy="38" rx="8" ry="9" />
                <circle cx="20" cy="36" r="1" fill={BRONZE} />
                <circle cx="24" cy="36" r="1" fill={BRONZE} />
                <circle cx="38" cy="36" r="1" fill={BRONZE} />
                <circle cx="42" cy="36" r="1" fill={BRONZE} />
                <circle cx="56" cy="36" r="1" fill={BRONZE} />
                <circle cx="60" cy="36" r="1" fill={BRONZE} />
            </svg>
            <div className="text-left">
                <div
                    style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 9.5,
                        letterSpacing: "0.32em",
                        textTransform: "uppercase",
                        color: BRONZE_LIGHT,
                        marginBottom: 2,
                    }}
                >
                    Central
                </div>
                <div
                    className="font-display"
                    style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: FG,
                        letterSpacing: "-0.005em",
                        lineHeight: 1,
                    }}
                >
                    Bela Vista
                </div>
            </div>
        </div>
    );
}
