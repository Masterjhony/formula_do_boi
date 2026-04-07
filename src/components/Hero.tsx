"use client";

import { useRef, useState } from "react";
import { Beef, Dna, Trophy, ArrowRight, ChevronDown } from "lucide-react";

const MODELS = [
    {
        Icon: Beef,
        tag: "01",
        label: "Touros & Sêmen",
        sub: "Reprodutores Nelore P.O. certificados",
        href: "#touros",
        cta: "Explorar",
    },
    {
        Icon: Dna,
        tag: "02",
        label: "Doadoras & Embriões",
        sub: "Genética feminina de alto desempenho",
        href: "#doadoras",
        cta: "Explorar",
    },
    {
        Icon: Trophy,
        tag: "03",
        label: "Leilões P.O.",
        sub: "Curadoria especializada Bula Remates",
        href: "#leiloes",
        cta: "Ver Agenda",
    },
];

export default function Hero() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoReady, setVideoReady] = useState(false);
    const [videoFailed, setVideoFailed] = useState(false);

    return (
        <section className="relative w-full min-h-screen bg-brand-black overflow-hidden flex flex-col" style={{ isolation: "isolate", contain: "layout style" }}>
            {/* ── Animated cinematic fallback (hidden once video loads) ── */}
            {!videoReady && (
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-[#07080a]" />
                    <div className="absolute -top-1/4 -left-1/4 w-[80vw] h-[80vh] rounded-full
                        bg-[radial-gradient(ellipse,rgba(197,160,89,0.18)_0%,transparent_65%)]
                        animate-[drift-a_18s_ease-in-out_infinite]" />
                    <div className="absolute top-1/3 -right-1/4 w-[70vw] h-[70vh] rounded-full
                        bg-[radial-gradient(ellipse,rgba(197,160,89,0.13)_0%,transparent_60%)]
                        animate-[drift-b_22s_ease-in-out_infinite]" />
                    <div className="absolute -bottom-1/4 left-1/4 w-[60vw] h-[60vh] rounded-full
                        bg-[radial-gradient(ellipse,rgba(160,100,20,0.14)_0%,transparent_55%)]
                        animate-[drift-c_26s_ease-in-out_infinite]" />
                    <div className="absolute inset-0 opacity-[0.025]"
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(197,160,89,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(197,160,89,0.8) 1px,transparent 1px)",
                            backgroundSize: "90px 90px",
                        }}
                    />
                </div>
            )}

            {/* ── Video background — Cloudinary CDN, bitrate controlado ── */}
            {!videoFailed && (
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    loop
                    playsInline
                    disablePictureInPicture
                    preload="auto"
                    className={`absolute inset-0 w-full h-full object-cover ${videoReady ? "opacity-100" : "opacity-0"}`}
                    style={{ transform: "translateZ(0)", willChange: "auto", transition: "opacity 800ms ease" }}
                    onCanPlay={() => setVideoReady(true)}
                    onError={() => setVideoFailed(true)}
                >
                    {/* WebM/VP9 — menor bitrate, prioridade em Chrome/Firefox */}
                    <source
                        src="https://res.cloudinary.com/dkh2nsugb/video/upload/f_webm,w_1280,q_30,vc_vp9,br_900k/v1775526049/hero-nelore-option-1-optimized_uortpl.webm"
                        type="video/webm"
                    />
                    {/* MP4/H264 — fallback Safari/iOS */}
                    <source
                        src="https://res.cloudinary.com/dkh2nsugb/video/upload/f_mp4,w_1280,q_35,vc_h264,br_1100k/v1775526049/hero-nelore-option-1-optimized_uortpl.mp4"
                        type="video/mp4"
                    />
                </video>
            )}

            {/* ── Dark overlay — sem blur para não travar compositing ── */}
            <div className={`absolute inset-0 transition-opacity duration-[1200ms] pointer-events-none ${videoReady ? "bg-black/50" : "bg-black/20"}`} />
            {/* bottom fade to next section */}
            <div className="absolute bottom-0 inset-x-0 h-56 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />

            {/* ── Content ── */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center container mx-auto px-4 py-24 text-center">

                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-gold/30 bg-[rgba(15,12,5,0.75)] mb-10">
                    <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse shadow-[0_0_6px_rgba(197,160,89,0.8)]" />
                    <span className="text-brand-gold text-xs font-bold tracking-[0.22em] uppercase">
                        Genética · Curadoria · Estratégia
                    </span>
                </div>

                {/* Headline */}
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-[1.02] tracking-tight text-white mb-5 max-w-5xl">
                    O Ecossistema{" "}
                    <br className="hidden sm:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-yellow-200 to-brand-gold">
                        Nelore P.O.
                    </span>
                </h1>

                {/* Sub */}
                <p className="text-gray-300 text-lg md:text-xl font-light max-w-xl mb-16 leading-relaxed">
                    Genética certificada. Curadoria especializada.
                    <br />
                    Estratégia para o criador sério.
                </p>

                {/* ── 3 Model Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
                    {MODELS.map(({ Icon, tag, label, sub, href, cta }) => (
                        <a
                            key={href}
                            href={href}
                            className="group relative flex flex-col gap-3 p-6 rounded-2xl border border-white/10 bg-[rgba(0,0,0,0.65)] text-left
                                hover:border-brand-gold/40 hover:bg-[rgba(20,14,2,0.75)] hover:shadow-[0_0_30px_-6px_rgba(197,160,89,0.2)]
                                transition-colors duration-300"
                        >
                            {/* Gold top accent */}
                            <div className="absolute top-0 inset-x-6 h-px bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex items-start justify-between">
                                <div className="w-11 h-11 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold group-hover:bg-brand-gold/15 transition-colors">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black text-gray-600 tracking-[0.2em]">{tag}</span>
                            </div>

                            <div>
                                <p className="text-white font-black text-base uppercase tracking-wide leading-tight mb-1">{label}</p>
                                <p className="text-gray-400 text-xs leading-relaxed">{sub}</p>
                            </div>

                            <div className="flex items-center gap-1.5 text-brand-gold text-xs font-bold uppercase tracking-widest mt-auto">
                                {cta}
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </a>
                    ))}
                </div>
            </div>

            {/* ── Scroll indicator ── */}
            <div className="relative z-10 flex justify-center pb-8 animate-bounce">
                <ChevronDown className="w-5 h-5 text-white/25" />
            </div>
        </section>
    );
}
