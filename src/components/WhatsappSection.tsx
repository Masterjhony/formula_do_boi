"use client";

import { useState } from "react";
import { MessageCircle, X, ArrowRight } from "lucide-react";

const whatsappGroups = [
    {
        name: "Academia do Nelore P.O | Fórmula do Boi e Bula Remates",
        link: "https://chat.whatsapp.com/JYxJPWfkoHHLZfosHlywN9?mode=gi_t"
    }
];

// Leather texture: fine diamond crosshatch + grain lines
const leatherTextureStyle: React.CSSProperties = {
    backgroundImage: [
        // fine diagonal grain lines going NE
        "repeating-linear-gradient(62deg, transparent 0px, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)",
        // fine diagonal grain lines going NW — creates diamond/weave
        "repeating-linear-gradient(-62deg, transparent 0px, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)",
        // subtle horizontal specular line every ~12px for depth
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

// Deboss: text appears pressed into the leather surface
const debossTitle: React.CSSProperties = {
    color: "rgba(255,255,255,0.92)",
    textShadow:
        "0 1px 0 rgba(255,220,80,0.12), 0 -1px 2px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.4)",
    letterSpacing: "0.06em",
};

// Brushed metal seal badge
const sealBadge: React.CSSProperties = {
    background:
        "linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 45%, #222 55%, #111 100%)",
    border: "1px solid rgba(212,160,23,0.6)",
    boxShadow:
        "0 1px 0 rgba(255,200,50,0.15) inset, 0 -1px 0 rgba(0,0,0,0.5) inset, 0 3px 10px rgba(0,0,0,0.4)",
};

// Brushed steel button
const steelButton: React.CSSProperties = {
    background:
        "linear-gradient(180deg, #2c2c2c 0%, #1a1a1a 48%, #141414 52%, #0a0a0a 100%)",
    border: "1px solid rgba(212,160,23,0.55)",
    boxShadow:
        "0 1px 0 rgba(255,215,60,0.1) inset, 0 -1px 0 rgba(0,0,0,0.6) inset, 0 6px 20px rgba(0,0,0,0.5)",
    letterSpacing: "0.15em",
};

export default function WhatsappSection() {
    const [showModal, setShowModal] = useState(false);

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
                                    Fórmula do Boi
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
                                Entre no grupo para receber ofertas exclusivas
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
                                Acesso exclusivo ao grupo &lsquo;Selo Ouro&rsquo;
                            </p>

                            <p className="text-white/60 text-sm max-w-lg mx-auto mb-7">
                                Tenha acesso a ofertas exclusivas e oportunidades selecionadas no nosso grupo de WhatsApp.
                            </p>

                            {/* Brushed steel button */}
                            <button
                                onClick={() => setShowModal(true)}
                                className="inline-flex items-center gap-2 px-7 py-3 rounded-lg font-bold text-sm text-white transition-all hover:brightness-125 active:scale-95"
                                style={steelButton}
                            >
                                <MessageCircle className="w-4 h-4 opacity-80" />
                                Acessar Grupo
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* WhatsApp Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0a0a0a]">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-green-500" />
                                Grupo VIP WhatsApp
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-gray-400 text-sm mb-4">
                                Entre no nosso grupo exclusivo para acompanhar as ofertas e novidades em primeira mão.
                            </p>
                            {whatsappGroups.map((group, index) => (
                                <a
                                    key={index}
                                    href={group.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-green-500/10 border border-white/5 hover:border-green-500/50 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <MessageCircle className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-white group-hover:text-green-400 transition-colors">
                                            {group.name}
                                        </h4>
                                        <p className="text-xs text-gray-500 truncate">{group.link}</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
