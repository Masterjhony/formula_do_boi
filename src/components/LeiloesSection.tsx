import Link from "next/link";
import { type Leilao } from "@/data/leiloes";
import { getProximosLeiloes } from "@/services/leiloes.server";

const BRONZE = "#A0792E";
const BRONZE_LIGHT = "#D4A85C";
const INK = "#0A0A0A";
const FG = "#F5F0E4";

export const revalidate = 3600;

export default async function LeiloesSection() {
    const { proximos, total } = await getProximosLeiloes(3);

    return (
        <section
            id="leiloes"
            className="stitch-divider relative overflow-hidden scroll-mt-20"
            style={{ background: INK, color: FG, padding: "96px 20px", borderTop: "1px solid rgba(212,168,92,0.12)" }}
        >
            <div
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                    backgroundImage: "radial-gradient(circle at 1px 1px, rgba(232,203,133,0.08) 1px, transparent 0)",
                    backgroundSize: "28px 28px",
                }}
            />

            <div className="relative z-10" style={{ maxWidth: 1200, margin: "0 auto" }}>

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
                    Agenda · Temporada 2026
                </div>

                <h2
                    className="font-display"
                    style={{
                        fontSize: "clamp(32px, 6.2vw, 60px)",
                        fontWeight: 500,
                        lineHeight: 1.0,
                        letterSpacing: "-0.03em",
                        color: FG,
                        marginBottom: 18,
                        maxWidth: "18ch",
                    }}
                >
                    Próximos leilões com{" "}
                    <span style={{ color: BRONZE_LIGHT }}>curadoria Bula.</span>
                </h2>

                <p style={{
                    fontSize: 18,
                    color: "rgba(245,240,228,0.72)",
                    lineHeight: 1.55,
                    maxWidth: "60ch",
                    marginBottom: 16,
                    letterSpacing: "-0.005em",
                }}>
                    Toda pista passa pelo nosso olho antes de chegar ao criador. Filmagem dos lotes,
                    transmissão, crédito e logística — infraestrutura montada.
                </p>

                <div style={{
                    borderTop: "1px solid rgba(212,168,92,0.22)",
                    marginTop: 32,
                    marginBottom: 36,
                    position: "relative",
                }}>
                    <span aria-hidden style={{
                        position: "absolute", top: -1, left: 0,
                        width: 48, height: 1, background: BRONZE,
                    }} />
                    {proximos.map((ev, i) => (
                        <AgendaItem key={i} ev={ev} />
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        href="/agenda"
                        className="group inline-flex items-center justify-center gap-2.5 transition-all hover:-translate-y-0.5 active:scale-95"
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
                        Ver agenda completa
                        <span style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            letterSpacing: "0.1em",
                            opacity: 0.75,
                            marginLeft: 4,
                        }}>
                            ({total} leilões)
                        </span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:translate-x-0.5">
                            <path d="M5 12h14M13 6l6 6-6 6"/>
                        </svg>
                    </Link>
                    <a
                        href="https://wa.me/5531984143874?text=Ol%C3%A1%2C%20gostaria%20de%20receber%20a%20agenda%20dos%20pr%C3%B3ximos%20leil%C3%B5es."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2.5"
                        style={{
                            background: "transparent",
                            color: FG,
                            padding: "16px 28px",
                            borderRadius: 2,
                            fontWeight: 500,
                            fontSize: 14,
                            letterSpacing: "0.02em",
                            border: "1px solid rgba(245,240,228,0.22)",
                        }}
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
            className="flex items-center gap-4 md:gap-6 transition-all hover:pl-2 group"
            style={{ padding: "24px 0", borderBottom: "1px solid rgba(212,168,92,0.14)" }}
        >
            <div
                className="flex-shrink-0 text-center"
                style={{ width: 72, borderRight: `1px solid ${BRONZE}40`, paddingRight: 20 }}
            >
                <div
                    className="font-display"
                    style={{
                        fontSize: 40,
                        fontWeight: 500,
                        color: BRONZE_LIGHT,
                        lineHeight: 1,
                        letterSpacing: "-0.025em",
                    }}
                >
                    {ev.dia}
                </div>
                <div style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10.5,
                    textTransform: "uppercase",
                    letterSpacing: "0.22em",
                    color: "rgba(245,240,228,0.62)",
                    fontWeight: 500,
                    marginTop: 8,
                }}>
                    {ev.mes.slice(0, 3)}
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <div
                    className="font-display"
                    style={{
                        fontSize: 20,
                        fontWeight: 500,
                        color: FG,
                        marginBottom: 6,
                        lineHeight: 1.2,
                        letterSpacing: "-0.015em",
                    }}
                >
                    {ev.criador}
                </div>
                <div style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11.5,
                    color: "rgba(245,240,228,0.58)",
                    letterSpacing: "0.04em",
                }}>
                    {ev.quantidade > 0 ? `${ev.quantidade} animais · ` : ""}{ev.diaSemana}
                    {ev.horario && ev.horario !== "—" ? ` · ${ev.horario}` : ""}
                    {ev.modelo ? ` · ${ev.modelo}` : ""}
                </div>
            </div>

            <div
                className="flex-shrink-0 hidden sm:block"
                style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10.5,
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                    color: BRONZE_LIGHT,
                    fontWeight: 500,
                    padding: "6px 10px",
                    border: "1px solid rgba(212,168,92,0.35)",
                }}
            >
                {ev.categoria}
            </div>
        </div>
    );
}
