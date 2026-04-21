import Link from "next/link";

const leatherTexture: React.CSSProperties = {
    backgroundImage: [
        "repeating-linear-gradient(62deg, transparent 0px, transparent 3px, rgba(255,255,255,0.012) 3px, rgba(255,255,255,0.012) 4px)",
        "repeating-linear-gradient(-62deg, transparent 0px, transparent 3px, rgba(255,255,255,0.012) 3px, rgba(255,255,255,0.012) 4px)",
    ].join(", "),
};

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
            style={{ background: "linear-gradient(180deg, #0A0A0A 0%, #1A1609 100%)", color: "#F6F2EA", padding: "90px 20px" }}
        >
            {/* Textura de couro */}
            <div className="absolute inset-0 pointer-events-none" style={leatherTexture} />

            {/* Glow radial */}
            <div
                className="absolute pointer-events-none"
                style={{ bottom: -100, left: -100, width: 400, height: 400, background: "radial-gradient(circle, rgba(201,169,97,0.12) 0%, transparent 70%)" }}
            />

            <div className="relative z-10" style={{ maxWidth: 1200, margin: "0 auto" }}>

                {/* Kicker */}
                <div
                    className="mb-3.5"
                    style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.22em", color: "#C9A961", fontWeight: 700 }}
                >
                    Pra quem produz
                </div>

                {/* Título */}
                <h2
                    className="font-display"
                    style={{ fontSize: "clamp(28px, 6vw, 48px)", fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: 16 }}
                >
                    É criador? Coloque sua genética{" "}
                    <em style={{ fontStyle: "italic", color: "#C9A961" }}>na FdB.</em>
                </h2>

                <p style={{ color: "rgba(246,242,234,0.75)", fontSize: 16, lineHeight: 1.6, maxWidth: "54ch", marginBottom: 32 }}>
                    Você foca no gado. A gente no mercado. Infraestrutura comercial pronta —
                    time, tráfego, marketplace, leilão com a Bula. Sem exclusividade.
                </p>

                {/* Caminhos */}
                <div className="grid sm:grid-cols-2 gap-3.5 mb-8">
                    {PATHS.map(({ title, desc }) => (
                        <div
                            key={title}
                            className="rounded-xl"
                            style={{ padding: 22, background: "rgba(246,242,234,0.04)", border: "1px solid rgba(160,128,42,0.20)" }}
                        >
                            <div
                                className="font-display"
                                style={{ fontSize: 19, fontWeight: 500, color: "#C9A961", marginBottom: 6 }}
                            >
                                {title}
                            </div>
                            <div style={{ fontSize: 13, color: "rgba(246,242,234,0.70)", lineHeight: 1.55 }}>
                                {desc}
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA principal */}
                <a
                    href="https://wa.me/5531984143874?text=Ol%C3%A1%2C%20sou%20criador%20e%20quero%20comercializar%20minha%20gen%C3%A9tica%20com%20a%20FdB"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 transition-all hover:-translate-y-0.5 active:scale-95"
                    style={{ background: "#A0802A", color: "#0A0A0A", padding: "18px 32px", borderRadius: 999, fontWeight: 700, fontSize: 15 }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Falar com o time comercial
                </a>

                {/* Link secundário */}
                <div className="mt-4">
                    <Link
                        href="/venda-conosco"
                        className="transition-colors hover:text-[#C9A961]"
                        style={{ color: "rgba(246,242,234,0.45)", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase" }}
                    >
                        Como funciona →
                    </Link>
                </div>
            </div>
        </section>
    );
}
