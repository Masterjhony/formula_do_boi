import { ArrowRight, Handshake, CalendarDays, MapPin, ExternalLink } from "lucide-react";

// Upcoming auctions — update as events are scheduled
const AGENDA: {
    data: string;
    titulo: string;
    local: string;
    descricao: string;
    link?: string;
}[] = [
    // Example entry — replace or add real events:
    // {
    //   data: "15 MAR",
    //   titulo: "Leilão Nelore P.O. — Ciclo Primavera",
    //   local: "Uberaba — MG",
    //   descricao: "Lotes selecionados de touros e matrizes PO com curadoria Fórmula do Boi × Bula Remates.",
    //   link: "https://bulaassessoria.com.br/",
    // },
];

export default function LeiloesSection() {
    const hasEvents = AGENDA.length > 0;

    return (
        <section id="leiloes" className="py-20 bg-[#050505] border-t border-white/5 scroll-mt-20">
            <div className="container mx-auto px-4">
                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-gold/25 bg-brand-gold/6 mb-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                            <span className="text-brand-gold text-[10px] font-black tracking-[0.22em] uppercase">
                                Leilões de P.O.
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none mb-4">
                            Agenda de<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-200">
                                Leilões
                            </span>
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {["Curadoria especializada", "Parceria Bula Remates", "Lotes Nelore P.O. selecionados"].map((s) => (
                                <span key={s} className="text-[11px] text-gray-400 bg-white/[0.04] border border-white/8 px-3 py-1 rounded-full font-medium">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>

                    <a
                        href="https://bulaassessoria.com.br/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-bold text-brand-gold hover:text-yellow-400 uppercase tracking-widest transition-colors group whitespace-nowrap"
                    >
                        Bula Remates
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>

                {/* ── Agenda ou Empty State ── */}
                {hasEvents ? (
                    <div className="space-y-4">
                        {AGENDA.map((ev, i) => (
                            <div key={i} className="group flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 rounded-2xl border border-white/8 bg-[#0f0f0f] hover:border-brand-gold/25 transition-all">
                                {/* Date chip */}
                                <div className="flex-shrink-0 w-20 h-20 rounded-xl border border-brand-gold/20 bg-brand-gold/6 flex flex-col items-center justify-center">
                                    <CalendarDays className="w-5 h-5 text-brand-gold mb-1" />
                                    <span className="text-brand-gold font-black text-sm tracking-wider">{ev.data}</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-black text-lg uppercase tracking-wide mb-1">{ev.titulo}</p>
                                    <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-2">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {ev.local}
                                    </div>
                                    <p className="text-gray-400 text-sm leading-relaxed">{ev.descricao}</p>
                                </div>
                                {ev.link && (
                                    <a
                                        href={ev.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 border border-brand-gold/30 text-brand-gold text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-brand-gold hover:text-brand-black transition-all group-hover:border-brand-gold/60"
                                    >
                                        Detalhes
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Empty state — visually premium */
                    <div className="relative rounded-3xl border border-brand-gold/15 bg-gradient-to-br from-brand-gold/[0.04] via-transparent to-transparent overflow-hidden">
                        <div className="absolute top-0 right-0 w-72 h-72 bg-brand-gold/[0.04] rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

                        <div className="relative z-10 grid lg:grid-cols-2 gap-0">
                            {/* Left */}
                            <div className="p-10 md:p-14 flex flex-col justify-center">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-gold/30 bg-brand-gold/8 mb-8 w-fit">
                                    <Handshake className="w-4 h-4 text-brand-gold" />
                                    <span className="text-brand-gold text-xs font-bold tracking-[0.15em] uppercase">Parceria Oficial</span>
                                </div>

                                <h3 className="text-3xl md:text-4xl font-black text-white uppercase leading-tight tracking-tight mb-5">
                                    Bula Remates{" "}
                                    <span className="text-brand-gold">×</span>{" "}
                                    Fórmula do Boi
                                </h3>

                                <p className="text-gray-400 leading-relaxed mb-4 text-base">
                                    Mais de{" "}
                                    <span className="text-white font-medium">10 anos de dedicação</span> e{" "}
                                    <span className="text-white font-medium">R$30 milhões comercializados</span> em 2021.
                                    Leilões com curadoria do campo ao comprador.
                                </p>

                                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                                    Próximas datas serão divulgadas em breve. Entre no grupo de WhatsApp para receber a agenda em primeira mão.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <a
                                        href="https://bulaassessoria.com.br/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-brand-gold hover:bg-yellow-500 text-brand-black font-bold uppercase tracking-widest text-sm rounded-lg transition-all hover:shadow-lg hover:shadow-brand-gold/20 group"
                                    >
                                        Conhecer a Bula Remates
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </a>
                                    <a
                                        href="https://wa.me/5531984143874?text=Ol%C3%A1%2C%20gostaria%20de%20receber%20a%20agenda%20dos%20pr%C3%B3ximos%20leil%C3%B5es."
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 px-7 py-3 border border-white/15 hover:border-brand-gold/40 text-white hover:text-brand-gold font-semibold uppercase tracking-widest text-sm rounded-lg transition-all hover:bg-white/5"
                                    >
                                        Receber Agenda
                                    </a>
                                </div>
                            </div>

                            {/* Right — highlights */}
                            <div className="p-10 md:p-14 border-t lg:border-t-0 lg:border-l border-white/8 flex flex-col justify-center gap-5">
                                {[
                                    { n: "01", label: "Filmagem e catalogação dos lotes", desc: "Cada animal registrado com qualidade e apresentado da forma certa." },
                                    { n: "02", label: "Transmissão e leiloeiro especializado", desc: "Infraestrutura completa para leilões presenciais e online." },
                                    { n: "03", label: "Análise de crédito e contratos", desc: "Processo seguro do interesse até o fechamento do negócio." },
                                    { n: "04", label: "Pós-venda e logística", desc: "Suporte na entrega com parceiros homologados." },
                                ].map((item) => (
                                    <div key={item.n} className="flex gap-4 items-start">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold text-xs font-black">
                                            {item.n}
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold text-sm mb-0.5">{item.label}</p>
                                            <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
