import Link from "next/link";

// Brandbook tokens
const BRONZE = "#A0792E";
const BRONZE_LIGHT = "#D4A85C";
const BRONZE_PALE = "#E8CB85";
const INK = "#0A0A0A";
const INK_2 = "#141414";
const FG = "#F5F0E4";

const PATHS = [
    {
        title: "Seu touro na Aceleradora",
        desc: "Divisão 50/50 do lucro líquido. FdB banca comercial, marketing, tributos. Você recebe o rateio de coleta + sua parte.",
    },
    {
        title: "Sua doadora no Marketplace",
        desc: "Listagem com vídeo, ficha técnica e funil WhatsApp. Taxa por animal — sem comissão sobre venda.",
    },
];

export default function VendaConoscoSection() {
    return (
        <section
            className="stitch-divider relative overflow-hidden"
            style={{
                background: INK_2,
                color: FG,
                padding: "96px 20px",
                borderTop: "1px solid rgba(212,168,92,0.12)",
            }}
        >
            {/* Glow radial */}
            <div
                className="absolute pointer-events-none"
                style={{ bottom: -100, left: -100, width: 500, height: 500, background: "radial-gradient(circle, rgba(212,168,92,0.14) 0%, transparent 70%)" }}
            />

            {/* Dot grid */}
            <div
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                    backgroundImage: "radial-gradient(circle at 1px 1px, rgba(232,203,133,0.08) 1px, transparent 0)",
                    backgroundSize: "28px 28px",
                }}
            />

            <div className="relative z-10" style={{ maxWidth: 1200, margin: "0 auto" }}>

                {/* Eyebrow brandbook */}
                <div
                    className="inline-flex items-center gap-3 mb-5"
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
                    Para quem produz
                </div>

                {/* Título */}
                <h2
                    className="font-display"
                    style={{
                        fontSize: "clamp(32px, 6.2vw, 56px)",
                        fontWeight: 500,
                        lineHeight: 1.02,
                        letterSpacing: "-0.03em",
                        marginBottom: 18,
                        maxWidth: "20ch",
                        color: FG,
                    }}
                >
                    É criador? Coloque sua genética{" "}
                    <span style={{ color: BRONZE_LIGHT }}>na FdB.</span>
                </h2>

                <p style={{
                    color: "rgba(245,240,228,0.75)",
                    fontSize: 18,
                    lineHeight: 1.55,
                    maxWidth: "58ch",
                    marginBottom: 40,
                    letterSpacing: "-0.005em",
                }}>
                    Você foca no gado. Nós no mercado. Infraestrutura comercial pronta —
                    time, tráfego, marketplace, leilão com a Bula. Sem exclusividade.
                </p>

                {/* Caminhos */}
                <div className="grid sm:grid-cols-2 gap-4 mb-10">
                    {PATHS.map(({ title, desc }) => (
                        <div
                            key={title}
                            style={{
                                padding: 26,
                                background: "rgba(245,240,228,0.03)",
                                border: "1px solid rgba(212,168,92,0.22)",
                                borderRadius: 4,
                                position: "relative",
                            }}
                        >
                            {/* Brackets brandbook top */}
                            <span aria-hidden style={{
                                position: "absolute", top: 0, left: 0,
                                width: 12, height: 12,
                                borderTop: `1px solid ${BRONZE}`,
                                borderLeft: `1px solid ${BRONZE}`,
                            }} />
                            <span aria-hidden style={{
                                position: "absolute", bottom: 0, right: 0,
                                width: 12, height: 12,
                                borderBottom: `1px solid ${BRONZE}`,
                                borderRight: `1px solid ${BRONZE}`,
                            }} />

                            <div
                                className="font-display"
                                style={{
                                    fontSize: 22,
                                    fontWeight: 500,
                                    color: BRONZE_LIGHT,
                                    marginBottom: 10,
                                    letterSpacing: "-0.015em",
                                    lineHeight: 1.15,
                                }}
                            >
                                {title}
                            </div>
                            <div style={{
                                fontSize: 14,
                                color: "rgba(245,240,228,0.70)",
                                lineHeight: 1.55,
                            }}>
                                {desc}
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA principal — brandbook sem adorno */}
                <a
                    href="https://wa.me/5531984143874?text=Ol%C3%A1%2C%20sou%20criador%20e%20quero%20comercializar%20minha%20gen%C3%A9tica%20com%20a%20FdB"
                    target="_blank"
                    rel="noopener noreferrer"
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
                    Solicitar proposta
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:translate-x-0.5">
                        <path d="M5 12h14M13 6l6 6-6 6"/>
                    </svg>
                </a>

                {/* Link secundário */}
                <div className="mt-5">
                    <Link
                        href="/venda-conosco"
                        className="transition-colors hover:text-[#D4A85C]"
                        style={{
                            color: "rgba(245,240,228,0.50)",
                            fontSize: 11.5,
                            fontFamily: "var(--font-mono)",
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                        }}
                    >
                        Como funciona →
                    </Link>
                </div>
            </div>
        </section>
    );
}
