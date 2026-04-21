"use client";

export default function SociedadeBulinha() {
    return (
        <section
            className="py-20 md:py-28 border-t border-b"
            style={{ background: "#FAFAF7", borderColor: "#E8E4DB" }}
        >
            <div className="container mx-auto px-4" style={{ maxWidth: 1200 }}>

                {/* Kicker */}
                <div
                    className="inline-block mb-3"
                    style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "#A0802A", fontWeight: 700 }}
                >
                    Novo capítulo
                </div>

                <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-9 md:gap-14 items-center">

                    {/* Texto */}
                    <div>
                        <h2
                            className="font-display"
                            style={{ fontSize: "clamp(38px, 10vw, 78px)", fontWeight: 400, lineHeight: 0.98, letterSpacing: "-0.03em", marginBottom: 26, color: "#1A1A1A" }}
                        >
                            <em style={{ fontStyle: "italic", color: "#A0802A" }}>Bulinha</em>
                            <br />agora é sócio.
                        </h2>

                        <p style={{ fontSize: 17, lineHeight: 1.6, marginBottom: 16, color: "#1A1A1A" }}>
                            Felipe "Bulinha" Andrade — fundador da{" "}
                            <strong>Bula Assessoria Pecuária</strong> e da{" "}
                            <strong>Bula Remates</strong> — entra na Fórmula do Boi como sócio e
                            Diretor Comercial de Marcas e Relacionamento.
                        </p>

                        <p style={{ fontSize: 15, lineHeight: 1.7, color: "#6B6558", marginBottom: 32 }}>
                            Mais de uma década curando P.O. do campo ao comprador. R$ 300 milhões em gado
                            assessorado. Uma leiloeira ativa. Tudo isso agora dentro da casa, sob a mesma
                            filosofia:{" "}
                            <em style={{ color: "#A0802A", fontStyle: "italic", fontWeight: 500 }}>
                                de criador, pra criador.
                            </em>
                        </p>

                        {/* Stats */}
                        <div
                            className="flex flex-wrap gap-x-9 gap-y-4"
                            style={{ paddingTop: 28, borderTop: "1px solid #E8E4DB" }}
                        >
                            {[
                                { value: "+10",     label: "anos de leiloeira" },
                                { value: "R$ 300M", label: "em gado assessorado" },
                                { value: "18",      label: "leilões em 2026" },
                            ].map(({ value, label }) => (
                                <div key={label} className="flex flex-col gap-1">
                                    <b
                                        className="font-display"
                                        style={{ fontSize: 28, fontWeight: 500, color: "#1A1A1A", letterSpacing: "-0.01em", lineHeight: 1 }}
                                    >
                                        {value}
                                    </b>
                                    <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.18em", color: "#6B6558", fontWeight: 600 }}>
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Portrait card */}
                    <div
                        className="relative rounded-2xl overflow-hidden flex items-end order-first lg:order-last"
                        style={{
                            aspectRatio: "4/5",
                            background: "linear-gradient(135deg, #0A0A0A 0%, #1F1A0E 100%)",
                            padding: 28,
                        }}
                    >
                        {/* Grande "B" de fundo */}
                        <div
                            aria-hidden
                            className="absolute font-display pointer-events-none select-none"
                            style={{
                                top: -60, right: -40,
                                fontSize: "clamp(280px, 70vw, 460px)",
                                fontWeight: 300,
                                fontStyle: "italic",
                                color: "rgba(201,169,97,0.12)",
                                lineHeight: 0.8,
                            }}
                        >
                            B
                        </div>

                        {/* Grain / couro */}
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.8 0 0 0 0 0.7 0 0 0 0 0.3 0 0 0 0.10 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
                                opacity: 0.5,
                                mixBlendMode: "overlay",
                            }}
                        />

                        {/* Foto */}
                        <img
                            src="/bulinha.png"
                            alt="Bulinha — Bula Remates"
                            className="absolute inset-0 w-full h-full object-cover object-top"
                            style={{ opacity: 0.85 }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />

                        {/* Gradiente na base para texto */}
                        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/85 to-transparent pointer-events-none" />

                        {/* Info */}
                        <div className="relative z-10">
                            <div
                                className="inline-block mb-4"
                                style={{
                                    fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase",
                                    color: "#C9A961", fontWeight: 700,
                                    padding: "6px 12px", border: "1px solid rgba(201,169,97,0.35)", borderRadius: 999,
                                }}
                            >
                                Sócio · Diretor Comercial
                            </div>
                            <div
                                className="font-display"
                                style={{ fontSize: 26, fontWeight: 500, marginBottom: 6, color: "#F6F2EA", lineHeight: 1.1, letterSpacing: "-0.01em" }}
                            >
                                Felipe &ldquo;Bulinha&rdquo;<br />Andrade
                            </div>
                            <div style={{ fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(246,242,234,0.70)", fontWeight: 600 }}>
                                Bula Assessoria · Bula Remates
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
