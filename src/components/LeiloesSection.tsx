"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Tv, Users, Tag } from "lucide-react";
import { LEILOES, type Leilao } from "@/data/leiloes";

function getProximos(n: number): Leilao[] {
    const hoje = new Date();
    return LEILOES.filter((l) => {
        const d = new Date(2026, l.mesNum - 1, l.dia);
        return d >= hoje;
    }).slice(0, n);
}

export default function LeiloesSection() {
    const proximos = getProximos(3);
    const total = LEILOES.reduce((a, b) => a + b.quantidade, 0);

    return (
        <section id="leiloes" className="stitch-divider py-24 bg-[#050505] border-t border-white/5 scroll-mt-20">
            <div className="container mx-auto px-4">

                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-gold/25 bg-brand-gold/6 mb-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
                            <span className="text-brand-gold text-[10px] font-black tracking-[0.22em] uppercase">
                                Temporada 2026
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none mb-2">
                            Próximos<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-200">
                                Leilões
                            </span>
                        </h2>
                        <p className="text-gray-500 text-sm mt-3">
                            {LEILOES.length} eventos · {total.toLocaleString("pt-BR")} animais na temporada
                        </p>
                    </div>

                    <Link
                        href="/agenda"
                        className="inline-flex items-center gap-2 text-sm font-bold text-brand-gold hover:text-yellow-400 uppercase tracking-widest transition-colors group whitespace-nowrap"
                    >
                        <CalendarDays className="w-4 h-4" />
                        Agenda completa
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* ── 3 próximos ── */}
                <div className="space-y-3">
                    {proximos.map((ev, i) => (
                        <LeilaoCard key={i} ev={ev} />
                    ))}
                </div>

                {/* ── CTA agenda completa ── */}
                <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
                    <Link
                        href="/agenda"
                        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-gold hover:bg-yellow-500 text-brand-black font-black uppercase tracking-widest text-sm rounded-lg transition-all hover:shadow-lg hover:shadow-brand-gold/20 group w-full sm:w-auto"
                    >
                        Ver agenda completa
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <a
                        href="https://wa.me/5531984143874?text=Ol%C3%A1%2C%20gostaria%20de%20receber%20a%20agenda%20dos%20pr%C3%B3ximos%20leil%C3%B5es."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-white/15 hover:border-brand-gold/40 text-white hover:text-brand-gold font-semibold uppercase tracking-widest text-sm rounded-lg transition-all hover:bg-white/5 w-full sm:w-auto"
                    >
                        Receber agenda no WhatsApp
                    </a>
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

            {/* Linha dourada no hover — desktop */}
            <div className="hidden sm:block w-1 h-12 rounded-full bg-brand-gold/0 group-hover:bg-brand-gold/40 transition-all duration-300" />
        </div>
    );
}
