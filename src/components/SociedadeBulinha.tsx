"use client";

// Brandbook tokens
const BRONZE = "#A0792E";
const BRONZE_LIGHT = "#D4A85C";
const BRONZE_PALE = "#E8CB85";
const INK = "#0A0A0A";
const INK_2 = "#141414";
const FG = "#F5F0E4";

export default function SociedadeBulinha() {
    return (
        <section
            className="py-24 md:py-32 relative overflow-hidden"
            style={{ background: INK_2 }}
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
                style={{ top: "-30%", left: "-10%", width: "60%", height: "120%", background: "radial-gradient(ellipse at center, rgba(212,168,92,0.08) 0%, transparent 60%)" }}
            />

            <div className="container mx-auto px-4 relative" style={{ maxWidth: 1200 }}>

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
                    Novo capítulo · Sociedade 2026
                </div>

                <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 md:gap-16 items-center">

                    {/* Texto */}
                    <div>
                        <h2
                            className="font-display"
                            style={{
                                fontSize: "clamp(40px, 9vw, 80px)",
                                fontWeight: 500,
                                lineHeight: 0.98,
                                letterSpacing: "-0.03em",
                                marginBottom: 28,
                                color: FG,
                            }}
                        >
                            Bulinha <span style={{ color: BRONZE_LIGHT }}>é sócio.</span><br />
                            A mesa fica completa.
                        </h2>

                        <p style={{
                            fontSize: 18,
                            lineHeight: 1.55,
                            marginBottom: 18,
                            color: "rgba(245,240,228,0.82)",
                            maxWidth: "58ch",
                            letterSpacing: "-0.005em",
                        }}>
                            Felipe &ldquo;Bulinha&rdquo; Andrade — fundador da{" "}
                            <strong style={{ color: FG }}>Bula Assessoria Pecuária</strong> e da{" "}
                            <strong style={{ color: FG }}>Bula Remates</strong> — entra na Fórmula do Boi como sócio e
                            Diretor Comercial de Marcas e Relacionamento.
                        </p>

                        <p style={{
                            fontSize: 15,
                            lineHeight: 1.65,
                            color: "rgba(245,240,228,0.62)",
                            marginBottom: 36,
                            maxWidth: "58ch",
                        }}>
                            Mais de uma década curando PO do campo ao comprador. R$ 300 milhões em gado
                            assessorado. Uma leiloeira ativa. Tudo agora sob a mesma filosofia:{" "}
                            <em style={{ color: BRONZE_LIGHT, fontStyle: "italic", fontWeight: 500 }}>
                                curadoria não é opinião. É protocolo.
                            </em>
                        </p>

                        {/* Stats — brandbook hairline */}
                        <div
                            className="flex flex-wrap gap-x-10 gap-y-5 items-start relative"
                            style={{ paddingTop: 28, borderTop: "1px solid rgba(212,168,92,0.22)" }}
                        >
                            <span
                                aria-hidden
                                style={{
                                    position: "absolute", top: -1, left: 0,
                                    width: 48, height: 1, background: BRONZE,
                                }}
                            />
                            {[
                                { value: "+10",     label: "anos de leiloeira" },
                                { value: "R$ 300M", label: "em gado assessorado" },
                                { value: "18",      label: "leilões em 2026" },
                            ].map(({ value, label }) => (
                                <div key={label} className="flex flex-col gap-1">
                                    <b
                                        className="font-display"
                                        style={{
                                            fontSize: 30,
                                            fontWeight: 500,
                                            color: BRONZE_LIGHT,
                                            letterSpacing: "-0.015em",
                                            lineHeight: 1,
                                        }}
                                    >
                                        {value}
                                    </b>
                                    <span style={{
                                        fontFamily: "var(--font-mono)",
                                        fontSize: 10.5,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.2em",
                                        color: "rgba(245,240,228,0.60)",
                                        fontWeight: 500,
                                    }}>
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Portrait card */}
                    <div
                        className="relative overflow-hidden flex items-end order-first lg:order-last"
                        style={{
                            aspectRatio: "4/5",
                            background: `linear-gradient(135deg, ${INK} 0%, #1F1A0E 100%)`,
                            padding: 28,
                            borderRadius: 4,
                            border: `1px solid rgba(212,168,92,0.22)`,
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

                        {/* Grande "B" de fundo */}
                        <div
                            aria-hidden
                            className="absolute font-display pointer-events-none select-none"
                            style={{
                                top: -60, right: -40,
                                fontSize: "clamp(280px, 70vw, 460px)",
                                fontWeight: 300,
                                color: "rgba(212,168,92,0.10)",
                                lineHeight: 0.8,
                                letterSpacing: "-0.06em",
                            }}
                        >
                            B
                        </div>

                        {/* Grain / couro */}
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.8 0 0 0 0 0.7 0 0 0 0 0.3 0 0 0 0.10 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
                                opacity: 0.4,
                                mixBlendMode: "overlay",
                            }}
                        />

                        {/* Foto */}
                        <img
                            src="/bulinha.png"
                            alt="Bulinha — Bula Remates"
                            className="absolute inset-0 w-full h-full object-cover object-top"
                            style={{ opacity: 0.88 }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />

                        {/* Gradiente na base para texto */}
                        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none" />

                        {/* Info */}
                        <div className="relative z-10">
                            <div
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: 10.5,
                                    letterSpacing: "0.22em",
                                    textTransform: "uppercase",
                                    color: BRONZE_LIGHT,
                                    fontWeight: 500,
                                    padding: "6px 10px",
                                    border: `1px solid rgba(212,168,92,0.35)`,
                                    display: "inline-block",
                                    marginBottom: 14,
                                }}
                            >
                                Sócio · Dir. Comercial
                            </div>
                            <div
                                className="font-display"
                                style={{
                                    fontSize: 28,
                                    fontWeight: 500,
                                    marginBottom: 6,
                                    color: FG,
                                    lineHeight: 1.08,
                                    letterSpacing: "-0.02em",
                                }}
                            >
                                Felipe &ldquo;Bulinha&rdquo;<br />Andrade
                            </div>
                            <div style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 11,
                                letterSpacing: "0.18em",
                                textTransform: "uppercase",
                                color: "rgba(245,240,228,0.58)",
                                fontWeight: 500,
                            }}>
                                Bula Assessoria · Bula Remates
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
