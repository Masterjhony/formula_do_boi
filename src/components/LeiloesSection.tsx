"use client";

import { useState } from "react";
import { ArrowRight, Handshake, CalendarDays, ExternalLink, Tv, Users, Tag } from "lucide-react";

type Leilao = {
    dia: number;
    mes: string;
    mesNum: number;
    diaSemana: string;
    horario: string;
    criador: string;
    categoria: string;
    quantidade: number;
    modelo: "Presencial" | "Virtual";
    leiloeira: string;
    transmissao: string;
};

const LEILOES: Leilao[] = [
    { dia: 9,  mes: "Abril",    mesNum: 4,  diaSemana: "Quinta",  horario: "13:00", criador: "Toka Jakaré / 3 Nascentes", categoria: "Fêmeas P.O.",  quantidade: 80,  modelo: "Presencial", leiloeira: "Bula",      transmissao: "RuralPlay"     },
    { dia: 11, mes: "Abril",    mesNum: 4,  diaSemana: "Sábado",  horario: "13:00", criador: "Nelore IPB",                 categoria: "Fêmeas P.O.",  quantidade: 30,  modelo: "Presencial", leiloeira: "Bula",      transmissao: "AgroBrasil"    },
    { dia: 14, mes: "Abril",    mesNum: 4,  diaSemana: "Terça",   horario: "19:30", criador: "Cachoeirão",                 categoria: "Fêmeas P.O.",  quantidade: 30,  modelo: "Presencial", leiloeira: "Bula",      transmissao: "RuralPlay"     },
    { dia: 13, mes: "Maio",     mesNum: 5,  diaSemana: "Quarta",  horario: "19:00", criador: "Grupo Ribalta",              categoria: "Touros P.O.",  quantidade: 70,  modelo: "Presencial", leiloeira: "LeiloBoI",  transmissao: "Canal do Boi"  },
    { dia: 21, mes: "Maio",     mesNum: 5,  diaSemana: "Quinta",  horario: "19:00", criador: "Nelore Tresmar",             categoria: "Touros P.O.",  quantidade: 60,  modelo: "Virtual",    leiloeira: "Bula",      transmissao: "Canal do Boi"  },
    { dia: 24, mes: "Maio",     mesNum: 5,  diaSemana: "Domingo", horario: "09:30", criador: "Nelore MEAB & Modelo",       categoria: "Fêmeas P.O.",  quantidade: 45,  modelo: "Virtual",    leiloeira: "Bula",      transmissao: "ERural/RP"     },
    { dia: 3,  mes: "Junho",    mesNum: 6,  diaSemana: "Quarta",  horario: "19:00", criador: "Nelore Cachoeirão",          categoria: "Touros P.O.",  quantidade: 45,  modelo: "Presencial", leiloeira: "Bula",      transmissao: "Canal do Boi"  },
    { dia: 4,  mes: "Junho",    mesNum: 6,  diaSemana: "Quinta",  horario: "12:00", criador: "Nelore MNO",                 categoria: "Touros P.O.",  quantidade: 50,  modelo: "Presencial", leiloeira: "Capitaliza", transmissao: "RuralPlay"    },
    { dia: 11, mes: "Junho",    mesNum: 6,  diaSemana: "Quinta",  horario: "19:00", criador: "Nelore Tresmar",             categoria: "Fêmeas P.O.",  quantidade: 35,  modelo: "Presencial", leiloeira: "Bula",      transmissao: "Canal do Boi"  },
    { dia: 16, mes: "Junho",    mesNum: 6,  diaSemana: "Terça",   horario: "19:30", criador: "Nelore Kriz",                categoria: "Fêmeas P.O.",  quantidade: 50,  modelo: "Virtual",    leiloeira: "Bula",      transmissao: "Canal do Boi"  },
    { dia: 20, mes: "Junho",    mesNum: 6,  diaSemana: "Sábado",  horario: "12:00", criador: "Rio Bonito",                 categoria: "Touros P.O.",  quantidade: 80,  modelo: "Presencial", leiloeira: "Bula",      transmissao: "RuralPlay"     },
    { dia: 28, mes: "Junho",    mesNum: 6,  diaSemana: "Domingo", horario: "12:00", criador: "Nelore IPB",                 categoria: "Touros IPB",   quantidade: 70,  modelo: "Presencial", leiloeira: "Capitaliza", transmissao: "AgroBrasil"   },
    { dia: 7,  mes: "Julho",    mesNum: 7,  diaSemana: "Terça",   horario: "19:30", criador: "Nelore Kriz",                categoria: "Touros P.O.",  quantidade: 60,  modelo: "Virtual",    leiloeira: "Bula",      transmissao: "Canal do Boi"  },
    { dia: 25, mes: "Julho",    mesNum: 7,  diaSemana: "Sábado",  horario: "12:00", criador: "Neloraço P.O.",              categoria: "Touros P.O.",  quantidade: 50,  modelo: "Presencial", leiloeira: "Bula",      transmissao: "RuralPlay"     },
    { dia: 30, mes: "Julho",    mesNum: 7,  diaSemana: "Quinta",  horario: "19:00", criador: "Fazenda São Geraldo",        categoria: "Fêmeas P.O.",  quantidade: 30,  modelo: "Virtual",    leiloeira: "Bula",      transmissao: "RuralPlay"     },
    { dia: 1,  mes: "Agosto",   mesNum: 8,  diaSemana: "Sábado",  horario: "12:00", criador: "Fazenda São Geraldo",        categoria: "Touros P.O.",  quantidade: 120, modelo: "Presencial", leiloeira: "Bula",      transmissao: "RuralPlay"     },
    { dia: 29, mes: "Agosto",   mesNum: 8,  diaSemana: "Sábado",  horario: "12:00", criador: "Melhoradores",               categoria: "Touros P.O.",  quantidade: 50,  modelo: "Presencial", leiloeira: "Bula",      transmissao: "RuralPlay"     },
    { dia: 21, mes: "Novembro", mesNum: 11, diaSemana: "Sábado",  horario: "—",     criador: "Fazendas C+4 / Camparino",   categoria: "Touros & Fêmeas", quantidade: 100, modelo: "Presencial", leiloeira: "Bula",   transmissao: "Canal Leilões" },
];

const MESES = [...new Set(LEILOES.map((l) => l.mes))];

export default function LeiloesSection() {
    const [mesSelecionado, setMesSelecionado] = useState("Todos");
    const abas = ["Todos", ...MESES];

    const lista = mesSelecionado === "Todos"
        ? LEILOES
        : LEILOES.filter((l) => l.mes === mesSelecionado);

    // Agrupar por mês para exibição quando "Todos"
    const grupos: Record<string, Leilao[]> = {};
    for (const l of lista) {
        if (!grupos[l.mes]) grupos[l.mes] = [];
        grupos[l.mes].push(l);
    }

    const totalAnimais = LEILOES.reduce((a, b) => a + b.quantidade, 0);

    return (
        <section id="leiloes" className="stitch-divider py-24 bg-[#050505] border-t border-white/5 scroll-mt-20">
            <div className="container mx-auto px-4">

                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-gold/25 bg-brand-gold/6 mb-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
                            <span className="text-brand-gold text-[10px] font-black tracking-[0.22em] uppercase">
                                Temporada 2025
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none mb-4">
                            Agenda de<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-200">
                                Leilões
                            </span>
                        </h2>
                    </div>

                    <a
                        href="https://bulaassessoria.com.br/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-bold text-brand-gold hover:text-yellow-400 uppercase tracking-widest transition-colors group whitespace-nowrap"
                    >
                        <Handshake className="w-4 h-4" />
                        Bula Remates
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                </div>

                {/* ── Stats ── */}
                <div className="flex justify-center gap-3 mb-10">
                    {[
                        { label: "Leilões", value: "18" },
                        { label: "Animais", value: totalAnimais.toLocaleString("pt-BR") },
                    ].map((s) => (
                        <div key={s.label} className="card-engraved rounded-2xl border border-white/8 bg-[#0f0f0f] px-8 py-5 text-center w-40 md:w-52">
                            <p className="text-3xl md:text-4xl font-black text-brand-gold leading-none mb-1.5">{s.value}</p>
                            <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* ── Filtro de meses ── */}
                <div className="flex gap-2 flex-wrap mb-10">
                    {abas.map((mes) => (
                        <button
                            key={mes}
                            onClick={() => setMesSelecionado(mes)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border transition-all ${
                                mesSelecionado === mes
                                    ? "bg-brand-gold text-brand-black border-brand-gold"
                                    : "border-white/10 text-gray-400 hover:border-brand-gold/30 hover:text-brand-gold"
                            }`}
                        >
                            {mes}
                        </button>
                    ))}
                </div>

                {/* ── Lista agrupada por mês ── */}
                <div className="space-y-10">
                    {Object.entries(grupos).map(([mes, events]) => (
                        <div key={mes}>
                            {/* Separador de mês */}
                            <div className="flex items-center gap-3 mb-4">
                                <CalendarDays className="w-4 h-4 text-brand-gold flex-shrink-0" />
                                <span className="text-brand-gold text-xs font-black uppercase tracking-[0.2em]">{mes}</span>
                                <div className="flex-1 h-px bg-gradient-to-r from-brand-gold/20 to-transparent" />
                                <span className="text-[10px] text-gray-600 font-medium">{events.length} evento{events.length > 1 ? "s" : ""}</span>
                            </div>

                            <div className="space-y-3">
                                {events.map((ev, i) => (
                                    <LeilaoCard key={i} ev={ev} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Parceria Bula ── */}
                <div className="mt-16 relative rounded-3xl border border-brand-gold/15 bg-gradient-to-br from-brand-gold/[0.04] via-transparent to-transparent overflow-hidden">
                    <div className="absolute top-0 right-0 w-72 h-72 bg-brand-gold/[0.04] rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-8">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-gold/30 bg-brand-gold/8 mb-5 w-fit">
                                <Handshake className="w-4 h-4 text-brand-gold" />
                                <span className="text-brand-gold text-xs font-bold tracking-[0.15em] uppercase">Parceria Oficial</span>
                            </div>
                            <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-3">
                                Bula Remates <span className="text-brand-gold">×</span> Fórmula do Boi
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed max-w-lg">
                                Mais de <span className="text-white font-medium">10 anos de dedicação</span> e curadoria especializada do campo ao comprador — filmagem dos lotes, transmissão, crédito e logística.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                            <a
                                href="https://bulaassessoria.com.br/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-gold hover:bg-yellow-500 text-brand-black font-bold uppercase tracking-widest text-sm rounded-lg transition-all hover:shadow-lg hover:shadow-brand-gold/20 group"
                            >
                                Conhecer a Bula
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </a>
                            <a
                                href="https://wa.me/5531984143874?text=Ol%C3%A1%2C%20gostaria%20de%20receber%20a%20agenda%20dos%20pr%C3%B3ximos%20leil%C3%B5es."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/15 hover:border-brand-gold/40 text-white hover:text-brand-gold font-semibold uppercase tracking-widest text-sm rounded-lg transition-all hover:bg-white/5"
                            >
                                Receber Agenda
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function LeilaoCard({ ev }: { ev: Leilao }) {
    const isVirtual = ev.modelo === "Virtual";

    return (
        <div className="card-engraved group grid grid-cols-[64px_1fr] sm:grid-cols-[64px_1fr_auto] items-center gap-4 sm:gap-6 p-5 rounded-2xl border border-white/8 bg-[#0f0f0f] hover:border-brand-gold/25 hover:bg-[#141006] transition-all duration-300">

            {/* Data chip */}
            <div className="card-engraved flex flex-col items-center justify-center w-16 h-16 rounded-xl border border-brand-gold/20 bg-brand-gold/6 flex-shrink-0">
                <span className="text-brand-gold font-black text-xl leading-none">{ev.dia}</span>
                <span className="text-brand-gold/70 text-[10px] font-bold uppercase tracking-wider mt-0.5">{ev.mes.slice(0, 3)}</span>
            </div>

            {/* Info */}
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <p className="text-white font-black text-base uppercase tracking-wide leading-tight truncate">
                        {ev.criador}
                    </p>
                    {isVirtual ? (
                        <span className="flex-shrink-0 inline-flex items-center gap-1 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/15 text-gray-300">
                            <Tv className="w-2.5 h-2.5" /> Virtual
                        </span>
                    ) : (
                        <span className="flex-shrink-0 inline-flex items-center gap-1 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full bg-brand-gold/10 border border-brand-gold/25 text-brand-gold">
                            <Users className="w-2.5 h-2.5" /> Presencial
                        </span>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    {/* Categoria */}
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand-gold">
                        <Tag className="w-3 h-3" />
                        {ev.categoria}
                        <span className="text-gray-500 font-normal">· {ev.quantidade} animais</span>
                    </span>

                    {/* Meta */}
                    <span className="text-[11px] text-gray-500">
                        <span className="text-gray-400">{ev.diaSemana}</span>
                        {ev.horario !== "—" && <span className="text-gray-600"> · {ev.horario}</span>}
                    </span>

                    {/* Leiloeira + transmissão */}
                    <span className="text-[10px] text-gray-600 uppercase tracking-wider">
                        {ev.leiloeira} · {ev.transmissao}
                    </span>
                </div>
            </div>

            {/* Linha dourada no hover — desktop */}
            <div className="hidden sm:block w-1 h-12 rounded-full bg-brand-gold/0 group-hover:bg-brand-gold/40 transition-all duration-300" />
        </div>
    );
}
