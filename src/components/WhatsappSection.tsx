"use client";

const WA_LINK = "https://wa.me/5531984143874?text=Ol%C3%A1%2C%20quero%20entrar%20no%20grupo%20Selo%20Ouro";

// Brandbook tokens
const BRONZE = "#A0792E";
const BRONZE_LIGHT = "#D4A85C";
const BRONZE_PALE = "#E8CB85";
const BRONZE_DEEP = "#6B4F1E";
const INK = "#0A0A0A";
const INK_2 = "#141414";
const FG = "#F5F0E4";


export default function WhatsappSection() {
    return (
        <section
            className="stitch-divider py-16 relative overflow-hidden"
            style={{ background: INK }}
        >
            <div className="container mx-auto px-4 flex justify-center">

                {/* Anel de borda bronze brandbook */}
                <div
                    className="w-full max-w-5xl p-[1px]"
                    style={{
                        background: `linear-gradient(135deg, ${BRONZE_PALE} 0%, ${BRONZE_DEEP} 40%, ${BRONZE} 70%, ${BRONZE_DEEP} 100%)`,
                        borderRadius: 4,
                    }}
                >
                    {/* Card brandbook — ink puro com hairline bronze */}
                    <div
                        className="relative w-full overflow-hidden"
                        style={{
                            background: INK_2,
                            boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
                            borderRadius: 4,
                        }}
                    >

                        {/* Brilho radial bronze */}
                        <div
                            className="absolute pointer-events-none"
                            style={{ top: "-50%", right: "-30%", width: "80%", height: "200%", background: `radial-gradient(ellipse at center, rgba(212,168,92,0.14) 0%, transparent 60%)` }}
                        />

                        {/* Dot grid overlay */}
                        <div
                            className="absolute inset-0 pointer-events-none opacity-30"
                            style={{
                                backgroundImage: "radial-gradient(circle at 1px 1px, rgba(232,203,133,0.10) 1px, transparent 0)",
                                backgroundSize: "24px 24px",
                            }}
                        />

                        {/* Conteúdo */}
                        <div className="relative z-10 px-8 md:px-14 py-12 md:py-16">

                            {/* Eyebrow brandbook */}
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
                                <span style={{ width: 6, height: 6, background: BRONZE, borderRadius: "50%" }} />
                                Grupo Selo Ouro · Acesso curado
                            </div>

                            {/* Título */}
                            <h2
                                className="font-display"
                                style={{
                                    fontSize: "clamp(32px, 6.2vw, 56px)",
                                    fontWeight: 500,
                                    lineHeight: 1.02,
                                    letterSpacing: "-0.025em",
                                    color: FG,
                                    marginBottom: 18,
                                    maxWidth: "20ch",
                                }}
                            >
                                A oferta chega antes{" "}
                                <span style={{ color: BRONZE_LIGHT }}>do leilão público.</span>
                            </h2>

                            {/* Texto */}
                            <p style={{
                                color: "rgba(245,240,228,0.78)",
                                fontSize: 17,
                                lineHeight: 1.55,
                                marginBottom: 28,
                                maxWidth: "54ch",
                                letterSpacing: "-0.005em",
                            }}>
                                Ficha técnica, vídeo e condição comercial direto no WhatsApp — antes
                                do catálogo público. Seleção curada para o criador seletor. Sem ruído.
                            </p>

                            {/* Bullets — brandbook mono caption */}
                            <ul className="flex flex-col gap-3 mb-10">
                                {[
                                    "Ofertas exclusivas de touros, doadoras e embriões",
                                    "Primeira mão nos leilões com curadoria FdB × Bula",
                                    "Atendimento direto com o time comercial",
                                ].map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-start gap-3"
                                        style={{
                                            color: "rgba(245,240,228,0.88)",
                                            fontSize: 14.5,
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        <span
                                            className="flex-shrink-0"
                                            style={{
                                                width: 8,
                                                height: 1,
                                                background: BRONZE,
                                                marginTop: 11,
                                            }}
                                        />
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            {/* CTA — sem adorno */}
                            <a
                                href={WA_LINK}
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
                                Solicitar acesso
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:translate-x-0.5">
                                    <path d="M5 12h14M13 6l6 6-6 6"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
