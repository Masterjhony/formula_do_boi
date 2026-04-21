"use client";

import Link from "next/link";
import { LEILOES, type Leilao } from "@/data/leiloes";

const leatherTexture: React.CSSProperties = {
    backgroundImage: [
        "repeating-linear-gradient(62deg, transparent 0px, transparent 3px, rgba(255,255,255,0.012) 3px, rgba(255,255,255,0.012) 4px)",
        "repeating-linear-gradient(-62deg, transparent 0px, transparent 3px, rgba(255,255,255,0.012) 3px, rgba(255,255,255,0.012) 4px)",
    ].join(", "),
};

function getProximos(n: number): Leilao[] {
    const hoje = new Date();
    return LEILOES.filter((l) => {
        const d = new Date(2026, l.mesNum - 1, l.dia);
        return d >= hoje;
    }).slice(0, n);
}

export default function LeiloesSection() {
    const proximos = getProximos(3);

    return (
        <section
            id="leiloes"
            className="stitch-divider relative overflow-hidden scroll-mt-20"
            style={{ background: "#0A0A0A", color: "#F6F2EA", padding: "80px 20px" }}
        >
            {/* Textura de couro */}
            <div className="absolute inset-0 pointer-events-none" style={leatherTexture} />

            <div className="relative z-10" style={{ maxWidth: 1200, margin: "0 auto" }}>

                {/* Kicker */}
                <div
                    className="font-bold uppercase tracking-widest mb-3.5"
                    style={{ fontSize: 11, color: "#C9A961", letterSpacing: "0.22em" }}
                >
                    Agenda · Temporada 2026
                </div>

                {/* Título */}
                <h2
                    className="font-display"
                    style={{ fontSize: "clamp(28px, 6vw, 50px)", fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.02em", color: "#F6F2EA", marginBottom: 14 }}
                >
                    Próximos leilões com{" "}
                    <em style={{ fontStyle: "italic", color: "#C9A961" }}>curadoria Bula.</em>
                </h2>

                <p style={{ fontSize: 17, color: "rgba(246,242,234,0.70)", lineHeight: 1.6, maxWidth: "58ch", marginBottom: 8 }}>
                    Toda pista passa pelo nosso olho antes de ir pro criador. Filmagem dos lotes,
                    transmissão, crédito e logística — infraestrutura montada.
                </p>

                {/* Lista de leilões */}
                <div style={{ borderTop: "1px solid rgba(246,242,234,0.12)", marginTop: 8, marginBottom: 32 }}>
                    {proximos.map((ev, i) => (
                        <AgendaItem key={i} ev={ev} />
                    ))}
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        href="/agenda"
                        className="inline-flex items-center justify-center gap-2.5 transition-all hover:-translate-y-0.5 active:scale-95"
                        style={{ background: "#A0802A", color: "#0A0A0A", padding: "18px 28px", borderRadius: 999, fontWeight: 700, fontSize: 15 }}
                    >
                        Ver agenda completa ({LEILOES.length} leilões)
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M13 6l6 6-6 6"/>
                        </svg>
                    </Link>
                    <a
                        href="https://wa.me/5531984143874?text=Ol%C3%A1%2C%20gostaria%20de%20receber%20a%20agenda%20dos%20pr%C3%B3ximos%20leil%C3%B5es."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2.5"
                        style={{ background: "transparent", color: "#F6F2EA", padding: "18px 28px", borderRadius: 999, fontWeight: 600, fontSize: 15, border: "1.5px solid rgba(246,242,234,0.35)" }}
                    >
                        Receber agenda no WhatsApp
                    </a>
                </div>
            </div>
        </section>
    );
}

function AgendaItem({ ev }: { ev: Leilao }) {
    return (
        <div
            className="flex items-center gap-4 md:gap-6 transition-all hover:pl-2"
            style={{ padding: "22px 0", borderBottom: "1px solid rgba(246,242,234,0.12)" }}
        >
            {/* Data */}
            <div
                className="flex-shrink-0 text-center"
                style={{ width: 64, borderRight: "1px solid rgba(160,128,42,0.35)", paddingRight: 18 }}
            >
                <div
                    className="font-display"
                    style={{ fontSize: 36, fontWeight: 500, color: "#C9A961", lineHeight: 1, letterSpacing: "-0.02em" }}
                >
                    {ev.dia}
                </div>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(246,242,234,0.70)", fontWeight: 600, marginTop: 6 }}>
                    {ev.mes.slice(0, 3)}
                </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div
                    className="font-display"
                    style={{ fontSize: 18, fontWeight: 500, color: "#F6F2EA", marginBottom: 4, lineHeight: 1.2 }}
                >
                    {ev.criador}
                </div>
                <div style={{ fontSize: 12, color: "rgba(246,242,234,0.65)", letterSpacing: "0.02em" }}>
                    {ev.quantidade} animais &middot; {ev.diaSemana}
                    {ev.horario !== "—" ? `, ${ev.horario}` : ""} &middot; {ev.modelo}
                </div>
            </div>

            {/* Badge de tipo */}
            <div
                className="flex-shrink-0 hidden sm:block"
                style={{
                    fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em",
                    color: "#C9A961", fontWeight: 700,
                    padding: "5px 10px", border: "1px solid rgba(160,128,42,0.4)", borderRadius: 999,
                }}
            >
                {ev.categoria}
            </div>
        </div>
    );
}
