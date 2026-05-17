// Brandbook tokens
const BRONZE = "#A0792E";
const BRONZE_LIGHT = "#D4A85C";
const BRONZE_PALE = "#E8CB85";
const INK = "#0A0A0A";
const FG = "#F5F0E4";

const WA_LINK =
    "https://wa.me/5531984143874?text=Ol%C3%A1%2C%20quero%20entrar%20no%20grupo%20Selo%20Ouro";

// Hero hero image — golden-hour Nelore (Cloudinary)
const HERO_BASE = "https://res.cloudinary.com/dny0ibgbn/image/upload";
const HERO_ID = "v1778985663/IMGbonita_q5tw3w";
const HERO_DESKTOP = `${HERO_BASE}/f_auto,q_auto:good,w_2400/${HERO_ID}.png`;
const HERO_TABLET = `${HERO_BASE}/f_auto,q_auto:good,w_1600/${HERO_ID}.png`;
const HERO_MOBILE = `${HERO_BASE}/f_auto,q_auto:good,w_960/${HERO_ID}.png`;
const HERO_LQIP = `${HERO_BASE}/f_auto,q_30,w_60,e_blur:600/${HERO_ID}.png`;

export default function Hero() {
    return (
        <section
            className="relative flex items-end overflow-hidden"
            style={{
                minHeight: "92vh",
                padding: "120px 20px 56px",
                color: FG,
                background: INK,
            }}
        >
            {/* LQIP placeholder — blurred bg pra evitar flash de preto puro */}
            <img
                src={HERO_LQIP}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover object-center scale-110"
                style={{ filter: "blur(20px)" }}
            />

            {/* Foto hero responsiva */}
            <picture>
                <source media="(min-width: 1280px)" srcSet={HERO_DESKTOP} />
                <source media="(min-width: 768px)" srcSet={HERO_TABLET} />
                <img
                    src={HERO_MOBILE}
                    alt="Nelores PO em pasto ao pôr do sol"
                    fetchPriority="high"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ objectPosition: "center 35%" }}
                />
            </picture>

            {/* Overlay 1 — horizontal: darken na esquerda pra legibilidade do texto,
                                          deixa o lado direito (vacas + céu) respirar */}
            <div
                className="absolute inset-0 pointer-events-none hidden md:block"
                style={{
                    background:
                        "linear-gradient(90deg, rgba(10,10,10,0.82) 0%, rgba(10,10,10,0.55) 35%, rgba(10,10,10,0.18) 65%, rgba(10,10,10,0) 100%)",
                }}
            />

            {/* Overlay 1 mobile — uniforme um pouco mais escuro */}
            <div
                className="absolute inset-0 pointer-events-none md:hidden"
                style={{
                    background:
                        "linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.75) 100%)",
                }}
            />

            {/* Overlay 2 — vertical: fade pro INK em cima (transição c/ header)
                                       e embaixo (transição c/ próxima section) */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0) 18%, rgba(10,10,10,0) 65%, rgba(10,10,10,0.92) 100%)",
                }}
            />

            {/* Glow bronze sutil no topo — brandbook tint-radial */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(ellipse at 50% 0%, rgba(212,168,92,0.14) 0%, rgba(10,10,10,0) 55%)",
                }}
            />

            {/* Dot grid brandbook — bem discreto, só no canto inferior esquerdo */}
            <div
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 1px 1px, rgba(232,203,133,0.12) 1px, transparent 0)",
                    backgroundSize: "28px 28px",
                    maskImage:
                        "linear-gradient(135deg, black 0%, transparent 45%)",
                    WebkitMaskImage:
                        "linear-gradient(135deg, black 0%, transparent 45%)",
                }}
            />

            {/* Conteúdo */}
            <div
                className="relative z-10 w-full"
                style={{ maxWidth: 1200, margin: "0 auto" }}
            >
                {/* Eyebrow brandbook — mono uppercase tracking 0.24em */}
                <div
                    className="inline-flex items-center gap-3 mb-6"
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
                    Curadoria · Nelore PO
                </div>

                {/* Título — hierarquia brandbook H1 display */}
                <h1
                    className="font-display"
                    style={{
                        fontWeight: 500,
                        fontSize: "clamp(42px, 9.2vw, 96px)",
                        lineHeight: 0.96,
                        letterSpacing: "-0.03em",
                        marginBottom: 20,
                        maxWidth: "16ch",
                        color: FG,
                        textShadow: "0 2px 40px rgba(0,0,0,0.45)",
                    }}
                >
                    Genética de elite.
                    <br />
                    <span style={{ color: BRONZE_LIGHT }}>Precisão de dados.</span>
                </h1>

                {/* Subtítulo */}
                <p
                    style={{
                        fontSize: "clamp(16px, 2.1vw, 20px)",
                        lineHeight: 1.5,
                        color: "rgba(245,240,228,0.86)",
                        marginBottom: 28,
                        maxWidth: "54ch",
                        letterSpacing: "-0.005em",
                        textShadow: "0 1px 20px rgba(0,0,0,0.45)",
                    }}
                >
                    Curadoria de Nelore PO de alto padrão, sêmen top 0.1% e embriões FIV
                    selecionados. O filtro de confiança entre o topo do ranking e o
                    pecuarista seletor.
                </p>

                {/* Mono data chips — brandbook signature */}
                <div
                    className="flex flex-wrap items-center gap-3 mb-9"
                    style={{ fontFamily: "var(--font-mono)" }}
                >
                    {[
                        { k: "MGTe", v: "156.8" },
                        { k: "DEP.P365", v: "+18.2" },
                        { k: "TOP", v: "0.1%" },
                    ].map(({ k, v }) => (
                        <span
                            key={k}
                            className="inline-flex items-center gap-2 backdrop-blur-sm"
                            style={{
                                padding: "6px 10px",
                                border: "1px solid rgba(212,168,92,0.32)",
                                borderRadius: 2,
                                fontSize: 11,
                                letterSpacing: "0.12em",
                                textTransform: "uppercase",
                                color: BRONZE_LIGHT,
                                background: "rgba(10,10,10,0.55)",
                            }}
                        >
                            <span style={{ color: "rgba(245,240,228,0.6)" }}>{k}</span>
                            <span style={{ color: BRONZE_PALE, fontWeight: 500 }}>{v}</span>
                        </span>
                    ))}
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap gap-3 mb-12">
                    <a
                        href={WA_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center justify-center gap-2.5 transition-all hover:-translate-y-0.5 active:scale-95"
                        style={{
                            background: BRONZE,
                            color: INK,
                            padding: "16px 26px",
                            borderRadius: 2,
                            fontWeight: 600,
                            fontSize: 14,
                            letterSpacing: "0.02em",
                            border: `1px solid ${BRONZE}`,
                            boxShadow:
                                "0 0 0 1px rgba(212,168,92,0.35), 0 10px 40px rgba(212,168,92,0.22)",
                        }}
                    >
                        Acessar Grupo Selo Ouro
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="transition-transform group-hover:translate-x-0.5"
                        >
                            <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                    </a>
                    <a
                        href="#semen"
                        className="group inline-flex items-center justify-center gap-2.5 transition-all backdrop-blur-sm hover:border-[rgba(245,240,228,0.45)]"
                        style={{
                            background: "rgba(10,10,10,0.35)",
                            color: FG,
                            padding: "16px 26px",
                            borderRadius: 2,
                            fontWeight: 500,
                            fontSize: 14,
                            letterSpacing: "0.02em",
                            border: "1px solid rgba(245,240,228,0.28)",
                        }}
                    >
                        Ver catálogo
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="transition-transform group-hover:translate-x-0.5"
                        >
                            <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                    </a>
                </div>

                {/* Trust row — brandbook hairline divider */}
                <div
                    className="flex flex-wrap gap-x-10 gap-y-5 items-start"
                    style={{
                        paddingTop: 28,
                        borderTop: "1px solid rgba(212,168,92,0.22)",
                        position: "relative",
                    }}
                >
                    {/* Hairline decoration — bronze tick */}
                    <span
                        aria-hidden
                        style={{
                            position: "absolute",
                            top: -1,
                            left: 0,
                            width: 48,
                            height: 1,
                            background: BRONZE,
                        }}
                    />
                    {[
                        { value: "+10", label: "anos no PO" },
                        { value: "R$ 300M", label: "em gado assessorado" },
                        { value: "18", label: "leilões em 2026" },
                    ].map(({ value, label }) => (
                        <div key={label} className="flex flex-col gap-1">
                            <b
                                className="font-display"
                                style={{
                                    fontSize: 24,
                                    fontWeight: 500,
                                    color: BRONZE_LIGHT,
                                    letterSpacing: "-0.015em",
                                    lineHeight: 1,
                                }}
                            >
                                {value}
                            </b>
                            <span
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: 10.5,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.2em",
                                    color: "rgba(245,240,228,0.7)",
                                    fontWeight: 500,
                                }}
                            >
                                {label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
