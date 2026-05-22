"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, FileText, Tv, Users, Tag } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const MESES_PT = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const DIAS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const ASSESSOR_PHONE = "553184143874";

function assessorLink(text: string) {
    return `https://wa.me/${ASSESSOR_PHONE}?text=${encodeURIComponent(text)}`;
}

export interface LeilaoPublico {
    id: string;
    nome: string;
    data: string;
    tipo?: string | null;
    animais?: number | null;
    img?: string | null;
    horario?: string | null;
    transmissao?: string | null;
    modelo?: string | null;
    leiloeira?: string | null;
    status?: string | null;
    catalogo_url?: string | null;
    criador?: string | null;
}

function parse(l: LeilaoPublico) {
    const [y, m, d] = (l.data ?? "").split("-").map(Number);
    const date = y && m && d ? new Date(y, m - 1, d) : null;
    return {
        ...l,
        dia: date ? date.getDate() : "?",
        mes: date ? MESES_PT[date.getMonth()] : "—",
        mesAbrev: date ? MESES_PT[date.getMonth()].slice(0, 3).toUpperCase() : "—",
        diaSemana: date ? DIAS_PT[date.getDay()] : "",
    };
}

type Parsed = ReturnType<typeof parse>;

function LeilaoCard({ ev }: { ev: Parsed }) {
    const isVirtual = ev.modelo?.toLowerCase() === "virtual";
    const isConfirmado = ev.status?.toLowerCase() === "confirmado";
    const hasImage = !!ev.img;
    const hasCatalogo = !!ev.catalogo_url;

    const badges = (
        <>
            {isVirtual ? (
                <span className="flex-shrink-0 inline-flex items-center gap-1 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/15 text-gray-300">
                    <Tv className="w-2.5 h-2.5" /> Virtual
                </span>
            ) : (
                <span className="flex-shrink-0 inline-flex items-center gap-1 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full bg-brand-gold/10 border border-brand-gold/25 text-brand-gold">
                    <Users className="w-2.5 h-2.5" /> Presencial
                </span>
            )}
            {isConfirmado && (
                <span className="flex-shrink-0 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/25 text-green-400">
                    Confirmado
                </span>
            )}
            {hasCatalogo ? (
                <span className="flex-shrink-0 inline-flex items-center gap-1 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full bg-brand-gold/15 border border-brand-gold/40 text-brand-gold">
                    <FileText className="w-2.5 h-2.5" /> Catálogo
                </span>
            ) : (
                <span className="flex-shrink-0 inline-flex items-center gap-1 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/12 text-gray-400">
                    <Clock3 className="w-2.5 h-2.5" /> Catálogo em breve
                </span>
            )}
        </>
    );

    const meta = (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {ev.tipo && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand-gold">
                    <Tag className="w-3 h-3" />
                    {ev.tipo}
                    {!!ev.animais && (
                        <span className="text-gray-500 font-normal">· {ev.animais} animais</span>
                    )}
                </span>
            )}
            {ev.criador && !ev.tipo && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gold/70">
                    {ev.criador}
                </span>
            )}
            {ev.diaSemana && (
                <span className="text-[11px] text-gray-500">
                    <span className="text-gray-400">{ev.diaSemana}</span>
                    {ev.horario && <span className="text-gray-600"> · {ev.horario}</span>}
                </span>
            )}
            {(ev.leiloeira || ev.transmissao) && (
                <span className="text-[10px] text-gray-600 uppercase tracking-wider">
                    {[ev.leiloeira, ev.transmissao].filter(Boolean).join(" · ")}
                </span>
            )}
        </div>
    );

    const href = `/agenda/${ev.id}`;
    const ariaLabel = `Ver detalhes do leilão ${ev.nome}`;

    if (hasImage) {
        return (
            <Link
                href={href}
                aria-label={ariaLabel}
                className="card-engraved group flex items-stretch rounded-2xl border border-white/8 bg-[#1b1b1b] hover:border-brand-gold/25 hover:bg-[#141006] transition-all duration-300 overflow-hidden cursor-pointer"
            >
                {/* Image panel */}
                <div className="relative w-28 sm:w-36 flex-shrink-0 bg-[#181818] self-stretch flex items-center justify-center">
                    <img
                        src={ev.img!}
                        alt={ev.nome}
                        className="w-full h-full object-contain"
                    />
                    {/* Date badge overlaid */}
                    <div className="absolute bottom-2 left-2 flex flex-col items-center justify-center w-12 h-12 rounded-lg border border-brand-gold/40 bg-black/75 backdrop-blur-sm">
                        <span className="text-brand-gold font-black text-lg leading-none">{ev.dia}</span>
                        <span className="text-brand-gold/70 text-[9px] font-bold uppercase tracking-wider">{ev.mesAbrev}</span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex items-center gap-4 sm:gap-6 p-5 min-w-0">
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <p className="text-white font-black text-base uppercase tracking-wide leading-tight truncate">
                                {ev.nome}
                            </p>
                            {badges}
                        </div>
                        {meta}
                    </div>
                    <div className="hidden sm:block w-1 h-12 rounded-full bg-brand-gold/0 group-hover:bg-brand-gold/40 transition-all duration-300 flex-shrink-0" />
                </div>
            </Link>
        );
    }

    return (
        <Link
            href={href}
            aria-label={ariaLabel}
            className="card-engraved group grid grid-cols-[64px_1fr] sm:grid-cols-[64px_1fr_auto] items-center gap-4 sm:gap-6 p-5 rounded-2xl border border-white/8 bg-[#1b1b1b] hover:border-brand-gold/25 hover:bg-[#141006] transition-all duration-300 cursor-pointer"
        >
            <div className="card-engraved flex flex-col items-center justify-center w-16 h-16 rounded-xl border border-brand-gold/20 bg-brand-gold/6 flex-shrink-0">
                <span className="text-brand-gold font-black text-xl leading-none">{ev.dia}</span>
                <span className="text-brand-gold/70 text-[10px] font-bold uppercase tracking-wider mt-0.5">{ev.mesAbrev}</span>
            </div>
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <p className="text-white font-black text-base uppercase tracking-wide leading-tight truncate">
                        {ev.nome}
                    </p>
                    {badges}
                </div>
                {meta}
            </div>
            <div className="hidden sm:block w-1 h-12 rounded-full bg-brand-gold/0 group-hover:bg-brand-gold/40 transition-all duration-300" />
        </Link>
    );
}

export function AgendaClient({ leiloes }: { leiloes: LeilaoPublico[] }) {
    const parsed = leiloes.map(parse);
    const total = parsed.reduce((a, b) => a + (b.animais ?? 0), 0);
    const meses = [...new Set(parsed.map((l) => l.mes).filter((m) => m !== "—"))];

    const [mesSelecionado, setMesSelecionado] = useState("Todos");
    const abas = ["Todos", ...meses];

    const lista = mesSelecionado === "Todos" ? parsed : parsed.filter((l) => l.mes === mesSelecionado);

    const grupos: Record<string, Parsed[]> = {};
    for (const l of lista) {
        if (!grupos[l.mes]) grupos[l.mes] = [];
        grupos[l.mes].push(l);
    }

    return (
        <main className="min-h-screen bg-[var(--ink)] text-[var(--fg)]">
            <Header />

            {/* HERO BRANDBOOK ─────────────────────────────── */}
            <section
                className="relative overflow-hidden"
                style={{
                    background: "var(--ink)",
                    borderBottom: "1px solid rgba(212,168,92,0.18)",
                }}
            >
                {/* Radial bronze glow */}
                <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background:
                            "radial-gradient(ellipse at 50% 0%, rgba(212,168,92,0.16) 0%, transparent 60%)",
                    }}
                />
                {/* Faint grid texture pra dar densidade ao espaço vazio */}
                <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none opacity-[0.05]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(212,168,92,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,92,0.5) 1px, transparent 1px)",
                        backgroundSize: "56px 56px",
                        maskImage:
                            "radial-gradient(ellipse at 50% 30%, black 35%, transparent 75%)",
                        WebkitMaskImage:
                            "radial-gradient(ellipse at 50% 30%, black 35%, transparent 75%)",
                    }}
                />

                <div
                    className="container mx-auto px-4 pt-16 pb-12 md:pt-20 md:pb-14 relative"
                    style={{ maxWidth: 1200 }}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 lg:gap-16 items-end">
                        {/* Lado esquerdo — eyebrow + título + descrição */}
                        <div>
                            <div
                                className="inline-flex items-center gap-3 mb-6"
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: 12,
                                    letterSpacing: "0.24em",
                                    textTransform: "uppercase",
                                    color: "var(--bronze-light)",
                                    fontWeight: 500,
                                }}
                            >
                                <span
                                    className="animate-pulse"
                                    style={{
                                        width: 6,
                                        height: 6,
                                        background: "var(--bronze)",
                                        borderRadius: "50%",
                                    }}
                                />
                                Temporada 2026 · Curadoria Bula × Fórmula do Boi
                            </div>
                            <h1
                                className="font-display"
                                style={{
                                    fontSize: "clamp(40px, 7vw, 88px)",
                                    fontWeight: 500,
                                    lineHeight: 0.98,
                                    letterSpacing: "-0.03em",
                                    color: "var(--fg)",
                                    marginBottom: 22,
                                    maxWidth: "14ch",
                                }}
                            >
                                Agenda de{" "}
                                <span style={{ color: "var(--bronze-light)" }}>leilões.</span>
                            </h1>
                            <p
                                style={{
                                    color: "rgba(245,240,228,0.78)",
                                    fontSize: 18,
                                    lineHeight: 1.55,
                                    maxWidth: "56ch",
                                    letterSpacing: "-0.005em",
                                }}
                            >
                                {parsed.length} eventos selecionados · {total.toLocaleString("pt-BR")} animais
                                curados, com catálogo, leiloeira e transmissão verificados pelo nosso time.
                            </p>
                        </div>

                        {/* Lado direito — stats compactos em coluna */}
                        <div className="flex lg:flex-col gap-3 lg:gap-3">
                            {[
                                { label: "Leilões", value: String(parsed.length) },
                                { label: "Animais", value: total.toLocaleString("pt-BR") },
                            ].map((s) => (
                                <div
                                    key={s.label}
                                    className="flex-1 lg:flex-none rounded-2xl px-6 py-5 lg:px-8 lg:py-6 text-center lg:text-left lg:min-w-[180px]"
                                    style={{
                                        background:
                                            "linear-gradient(180deg, rgba(31,31,31,0.85) 0%, rgba(22,22,22,0.85) 100%)",
                                        border: "1px solid rgba(212,168,92,0.18)",
                                        boxShadow:
                                            "inset 0 1px 0 rgba(245,240,228,0.04), 0 1px 0 rgba(0,0,0,0.4)",
                                    }}
                                >
                                    <p
                                        className="font-display"
                                        style={{
                                            color: "var(--bronze-light)",
                                            fontSize: "clamp(28px, 3.4vw, 40px)",
                                            fontWeight: 500,
                                            lineHeight: 1,
                                            letterSpacing: "-0.02em",
                                            marginBottom: 6,
                                        }}
                                    >
                                        {s.value}
                                    </p>
                                    <p
                                        style={{
                                            fontFamily: "var(--font-mono)",
                                            fontSize: 10,
                                            letterSpacing: "0.22em",
                                            textTransform: "uppercase",
                                            color: "rgba(245,240,228,0.55)",
                                            fontWeight: 500,
                                        }}
                                    >
                                        {s.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CONTEÚDO ─────────────────────────────── */}
            <section className="pt-10 pb-24">
                <div className="container mx-auto px-4" style={{ maxWidth: 1200 }}>

                    {/* Month filter */}
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

                    {/* Lista */}
                    {parsed.length === 0 ? (
                        <p className="text-center text-gray-500 py-16">Nenhum leilão cadastrado ainda.</p>
                    ) : (
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
                                        {events.map((ev) => (
                                            <LeilaoCard key={ev.id} ev={ev} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* CTA */}
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

            {/* FAB — Fale com nosso assessor */}
            <a
                href={assessorLink("Olá! Vim pela agenda de leilões e gostaria de falar com um assessor.")}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Fale com nosso assessor no WhatsApp"
                className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 group flex items-center gap-0 sm:gap-3 pl-2 pr-2 sm:pr-5 py-2 rounded-full border border-brand-gold/40 bg-[#1b1b1b]/95 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.6),0_0_0_1px_rgba(160,121,46,0.18)] hover:border-brand-gold/70 hover:bg-[#141006] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300"
            >
                <span className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#25D366] shadow-inner shadow-black/20">
                    <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 animate-ping" aria-hidden />
                    <svg
                        viewBox="0 0 32 32"
                        className="relative w-6 h-6 sm:w-7 sm:h-7 text-white"
                        fill="currentColor"
                        aria-hidden
                    >
                        <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.464-1.348.115-.302.13-.59.13-.918 0-.187-.043-.36-.115-.53-.158-.43-1.275-.733-1.461-.847z"/>
                        <path d="M16.063 0C7.232 0 .06 7.172.06 16c0 2.745.7 5.43 2.025 7.797L0 32l8.467-2.022A15.9 15.9 0 0 0 16.063 32C24.892 32 32 24.828 32 16S24.892 0 16.063 0zm0 29.275c-2.32 0-4.58-.617-6.582-1.792l-.473-.28-4.91 1.173 1.187-4.778-.302-.487a13.21 13.21 0 0 1-1.978-6.99c0-7.318 5.96-13.276 13.058-13.276 7.097 0 13.057 5.96 13.057 13.276 0 7.318-5.96 13.155-13.057 13.155z"/>
                    </svg>
                </span>
                <span className="hidden sm:flex flex-col leading-tight pr-1 max-w-0 group-hover:max-w-[260px] opacity-0 group-hover:opacity-100 overflow-hidden whitespace-nowrap transition-all duration-300">
                    <span className="text-[9px] font-black uppercase tracking-[0.22em] text-brand-gold/80">
                        Fale com nosso
                    </span>
                    <span className="text-sm font-black uppercase tracking-wide text-white">
                        Assessor
                    </span>
                </span>
            </a>
        </main>
    );
}
