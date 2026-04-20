"use client";

import { useState } from "react";
import { ArrowRight, CalendarDays, Tv, Users, Tag } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LEILOES, type Leilao } from "@/data/leiloes";

const MESES = [...new Set(LEILOES.map((l) => l.mes))];

export default function AgendaPage() {
    const [mesSelecionado, setMesSelecionado] = useState("Todos");
    const abas = ["Todos", ...MESES];

    const lista =
        mesSelecionado === "Todos"
            ? LEILOES
            : LEILOES.filter((l) => l.mes === mesSelecionado);

    const grupos: Record<string, Leilao[]> = {};
    for (const l of lista) {
        if (!grupos[l.mes]) grupos[l.mes] = [];
        grupos[l.mes].push(l);
    }

    const total = LEILOES.reduce((a, b) => a + b.quantidade, 0);

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white">
            <Header />

            <section className="pt-32 pb-24">
                <div className="container mx-auto px-4">

                    {/* ── Header ── */}
                    <div className="mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-gold/25 bg-brand-gold/6 mb-5">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
                            <span className="text-brand-gold text-[10px] font-black tracking-[0.22em] uppercase">
                                Temporada 2026
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tight leading-none mb-4">
                            Agenda de<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-200">
                                Leilões
                            </span>
                        </h1>
                        <p className="text-gray-400 text-base mt-4">
                            {LEILOES.length} eventos · {total.toLocaleString("pt-BR")} animais curados pela Bula Remates × Fórmula do Boi
                        </p>
                    </div>

                    {/* ── Stats ── */}
                    <div className="flex gap-3 mb-10">
                        {[
                            { label: "Leilões", value: String(LEILOES.length) },
                            { label: "Animais", value: total.toLocaleString("pt-BR") },
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
                                <div className="flex items-center gap-3 mb-4">
                                    <CalendarDays className="w-4 h-4 text-brand-gold flex-shrink-0" />
                                    <span className="text-brand-gold text-xs font-black uppercase tracking-[0.2em]">{mes}</span>
                                    <div className="flex-1 h-px bg-gradient-to-r from-brand-gold/20 to-transparent" />
                                    <span className="text-[10px] text-gray-600 font-medium">
                                        {events.length} evento{events.length > 1 ? "s" : ""}
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {events.map((ev, i) => (
                                        <LeilaoCard key={i} ev={ev} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── CTA WhatsApp ── */}
                    <div className="mt-16 text-center">
                        <p className="text-gray-500 text-sm mb-5">Quer receber novidades dos leilões direto no seu WhatsApp?</p>
                        <a
                            href="https://wa.me/5531984143874?text=Ol%C3%A1%2C%20gostaria%20de%20receber%20a%20agenda%20dos%20pr%C3%B3ximos%20leil%C3%B5es."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-gold hover:bg-yellow-500 text-brand-black font-black uppercase tracking-widest text-sm rounded-lg transition-all hover:shadow-lg hover:shadow-brand-gold/20 group"
                        >
                            Receber agenda no WhatsApp
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}

function LeilaoCard({ ev }: { ev: Leilao }) {
    const isVirtual = ev.modelo === "Virtual";

    return (
        <div className="card-engraved group grid grid-cols-[64px_1fr] sm:grid-cols-[64px_1fr_auto] items-center gap-4 sm:gap-6 p-5 rounded-2xl border border-white/8 bg-[#0f0f0f] hover:border-brand-gold/25 hover:bg-[#141006] transition-all duration-300">
            <div className="card-engraved flex flex-col items-center justify-center w-16 h-16 rounded-xl border border-brand-gold/20 bg-brand-gold/6 flex-shrink-0">
                <span className="text-brand-gold font-black text-xl leading-none">{ev.dia}</span>
                <span className="text-brand-gold/70 text-[10px] font-bold uppercase tracking-wider mt-0.5">{ev.mes.slice(0, 3)}</span>
            </div>
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
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand-gold">
                        <Tag className="w-3 h-3" />
                        {ev.categoria}
                        <span className="text-gray-500 font-normal">· {ev.quantidade} animais</span>
                    </span>
                    <span className="text-[11px] text-gray-500">
                        <span className="text-gray-400">{ev.diaSemana}</span>
                        {ev.horario !== "—" && <span className="text-gray-600"> · {ev.horario}</span>}
                    </span>
                    <span className="text-[10px] text-gray-600 uppercase tracking-wider">
                        {ev.leiloeira} · {ev.transmissao}
                    </span>
                </div>
            </div>
            <div className="hidden sm:block w-1 h-12 rounded-full bg-brand-gold/0 group-hover:bg-brand-gold/40 transition-all duration-300" />
        </div>
    );
}
