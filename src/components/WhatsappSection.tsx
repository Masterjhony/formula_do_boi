"use client";

import { MessageCircle } from "lucide-react";

const WA_GROUP_LINK = "https://chat.whatsapp.com/JYxJPWfkoHHLZfosHlywN9?mode=gi_t";

// Leather texture: fine diamond crosshatch + grain lines
const leatherTextureStyle: React.CSSProperties = {
    backgroundImage: [
        "repeating-linear-gradient(62deg, transparent 0px, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)",
        "repeating-linear-gradient(-62deg, transparent 0px, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)",
        "repeating-linear-gradient(180deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 12px)",
    ].join(", "),
};

const cardGradient: React.CSSProperties = {
    background:
        "radial-gradient(ellipse 80% 120% at 50% -10%, #D9A81A 0%, #B8860B 30%, #8B6508 58%, #5C400A 85%, #3A2706 100%)",
    boxShadow:
        "0 20px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,215,60,0.35), inset 0 -1px 0 rgba(0,0,0,0.5)",
};

const topShineStyle: React.CSSProperties = {
    background:
        "linear-gradient(180deg, rgba(255,230,100,0.14) 0%, rgba(255,230,100,0.04) 40%, transparent 100%)",
    pointerEvents: "none",
};

const debossTitle: React.CSSProperties = {
    color: "rgba(255,255,255,0.92)",
    textShadow:
        "0 1px 0 rgba(255,220,80,0.12), 0 -1px 2px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.4)",
    letterSpacing: "0.06em",
};

const sealBadge: React.CSSProperties = {
    background:
        "linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 45%, #222 55%, #111 100%)",
    border: "1px solid rgba(212,160,23,0.6)",
    boxShadow:
        "0 1px 0 rgba(255,200,50,0.15) inset, 0 -1px 0 rgba(0,0,0,0.5) inset, 0 3px 10px rgba(0,0,0,0.4)",
};

const steelButton: React.CSSProperties = {
    background:
        "linear-gradient(180deg, #2c2c2c 0%, #1a1a1a 48%, #141414 52%, #0a0a0a 100%)",
    border: "1px solid rgba(212,160,23,0.55)",
    boxShadow:
        "0 1px 0 rgba(255,215,60,0.1) inset, 0 -1px 0 rgba(0,0,0,0.6) inset, 0 6px 20px rgba(0,0,0,0.5)",
    letterSpacing: "0.15em",
};

export default function WhatsappSection() {
    return (
        <section className="py-14 bg-[#0c0c0c] relative overflow-hidden">
            <div className="container mx-auto px-4 flex justify-center">

                {/* Gradient border ring */}
                <div
                    className="w-full max-w-5xl rounded-2xl p-[1.5px]"
                    style={{
                        background:
                            "linear-gradient(135deg, #D4A017 0%, #7A5010 40%, #C9A84C 70%, #6B4A0E 100%)",
                    }}
                >
                    {/* Leather card */}
                    <div className="relative w-full rounded-2xl overflow-hidden" style={cardGradient}>

                        {/* Leather texture */}
                        <div className="absolute inset-0" style={leatherTextureStyle} />

                        {/* Top-light shine */}
                        <div className="absolute inset-0" style={topShineStyle} />

                        {/* Content */}
                        <div className="relative z-10 px-10 py-9 text-center">

                            {/* Brushed metal seal */}
                            <div
                                className="inline-flex items-center gap-2 mb-5 px-5 py-[5px] rounded-md"
                                style={sealBadge}
                            >
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                    <circle cx="5" cy="5" r="4" stroke="rgba(212,160,23,0.7)" strokeWidth="1" />
                                    <circle cx="5" cy="5" r="2" fill="rgba(212,160,23,0.5)" />
                                </svg>
                                <span
                                    className="text-[11px] font-bold tracking-[0.22em] uppercase"
                                    style={{ color: "rgba(212,160,23,0.9)" }}
                                >
                                    Grupo Selo Ouro
                                </span>
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                    <circle cx="5" cy="5" r="4" stroke="rgba(212,160,23,0.7)" strokeWidth="1" />
                                    <circle cx="5" cy="5" r="2" fill="rgba(212,160,23,0.5)" />
                                </svg>
                            </div>

                            {/* Debossed title */}
                            <h2
                                className="text-xl md:text-2xl font-black uppercase mb-2"
                                style={debossTitle}
                            >
                                Acesso exclusivo às melhores ofertas de Nelore P.O.
                            </h2>

                            {/* Gold accent subtitle */}
                            <p
                                className="text-xs font-bold uppercase mb-3"
                                style={{
                                    color: "#FFD966",
                                    letterSpacing: "0.28em",
                                    textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                                }}
                            >
                                Academia do Nelore P.O. · Fórmula do Boi &amp; Bula Remates
                            </p>

                            <p className="text-white/60 text-sm max-w-lg mx-auto mb-7">
                                Sêmen selecionado, doadoras de elite e lotes de leilão antes de todo mundo —
                                só para quem está no grupo.
                            </p>

                            {/* Direct link button */}
                            <a
                                href={WA_GROUP_LINK}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-7 py-3 rounded-lg font-bold text-sm text-white transition-all hover:brightness-125 active:scale-95"
                                style={steelButton}
                            >
                                <MessageCircle className="w-4 h-4 opacity-80" />
                                Entrar no Grupo
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
