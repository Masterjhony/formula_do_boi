"use client";

const WA_LINK = "https://wa.me/5531984143874?text=Ol%C3%A1%2C%20quero%20entrar%20no%20grupo%20Selo%20Ouro";

const leatherTextureStyle: React.CSSProperties = {
    backgroundImage: [
        "repeating-linear-gradient(62deg, transparent 0px, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)",
        "repeating-linear-gradient(-62deg, transparent 0px, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)",
        "repeating-linear-gradient(180deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 12px)",
    ].join(", "),
};

export default function WhatsappSection() {
    return (
        <section className="stitch-divider py-14 bg-[#0a0a0a] relative overflow-hidden">
            <div className="container mx-auto px-4 flex justify-center">

                {/* Anel de borda dourada */}
                <div
                    className="w-full max-w-5xl rounded-2xl p-[1.5px]"
                    style={{ background: "linear-gradient(135deg, #C9A961 0%, #7A5010 40%, #A0802A 70%, #6B4A0E 100%)" }}
                >
                    {/* Card couro escuro */}
                    <div
                        className="relative w-full rounded-2xl overflow-hidden"
                        style={{
                            background: "linear-gradient(135deg, #14110A 0%, #1F1A0E 50%, #14110A 100%)",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
                        }}
                    >
                        {/* Textura de couro */}
                        <div className="absolute inset-0" style={leatherTextureStyle} />

                        {/* Brilho radial */}
                        <div
                            className="absolute pointer-events-none"
                            style={{ top: "-50%", right: "-30%", width: "80%", height: "200%", background: "radial-gradient(ellipse at center, rgba(201,169,97,0.12) 0%, transparent 60%)" }}
                        />

                        {/* Conteúdo */}
                        <div className="relative z-10 px-8 md:px-14 py-10 md:py-14">

                            {/* Badge */}
                            <div
                                className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full"
                                style={{ background: "rgba(160,128,42,0.15)", border: "1px solid #A0802A" }}
                            >
                                <span style={{ color: "#C9A961", fontSize: 13 }}>★</span>
                                <span
                                    className="font-bold tracking-widest uppercase"
                                    style={{ fontSize: 11, color: "#C9A961", letterSpacing: "0.2em" }}
                                >
                                    Grupo Selo Ouro
                                </span>
                            </div>

                            {/* Título */}
                            <h2
                                className="font-display"
                                style={{ fontSize: "clamp(28px, 6vw, 48px)", fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.02em", color: "#F6F2EA", marginBottom: 16 }}
                            >
                                Onde a oferta chega{" "}
                                <em style={{ fontStyle: "italic", color: "#C9A961" }}>antes do leilão.</em>
                            </h2>

                            {/* Texto */}
                            <p style={{ color: "rgba(246,242,234,0.78)", fontSize: 16, lineHeight: 1.6, marginBottom: 24, maxWidth: "54ch" }}>
                                Ficha técnica, vídeo e condição direto no seu WhatsApp — antes do catálogo público.
                                Só genética que interessa pro criador sério. Sem spam, sem ruído.
                            </p>

                            {/* Bullets */}
                            <ul className="flex flex-col gap-2.5 mb-9">
                                {[
                                    "Ofertas exclusivas de touros, doadoras e embriões",
                                    "Primeira mão nos leilões com curadoria FdB × Bula",
                                    "Atendimento direto com o time comercial",
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-3" style={{ color: "rgba(246,242,234,0.88)", fontSize: 14 }}>
                                        <span className="flex-shrink-0 rounded-full" style={{ width: 6, height: 6, background: "#C9A961" }} />
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            <a
                                href={WA_LINK}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2.5 transition-all hover:-translate-y-0.5 active:scale-95"
                                style={{ background: "#A0802A", color: "#0A0A0A", padding: "18px 32px", borderRadius: 999, fontWeight: 700, fontSize: 15 }}
                            >
                                Quero entrar no grupo
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
