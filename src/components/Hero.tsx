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

const CLD = "https://res.cloudinary.com/dkh2nsugb/video/upload";
const VID = "v1775523013/hero-agro-hero-optimized_f2oh1q";

// Poster: frame do vídeo servido como imagem — carrega imediatamente
const POSTER = `${CLD}/f_jpg,q_75,w_1280,so_0/${VID}.jpg`;

// Bitrate baixo = buffer enche rápido = playback fluido sem travar
// MP4 primeiro: H264 tem decodificação por hardware em todos os dispositivos
const SRC_MP4  = `${CLD}/f_mp4,w_1024,q_auto:low,vc_h264,br_700k/${VID}.mp4`;
const SRC_WEBM = `${CLD}/f_webm,w_1024,q_auto:low,vc_vp9,br_500k/${VID}.webm`;

export default function Hero() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoReady, setVideoReady] = useState(false);
    const [videoFailed, setVideoFailed] = useState(false);

    return (
        <section className="relative w-full min-h-screen bg-brand-black overflow-hidden flex flex-col" style={{ isolation: "isolate", contain: "layout style" }}>
            {/* ── Poster estático — aparece imediatamente, some quando vídeo inicia ── */}
            <img
                src={POSTER}
                aria-hidden
                className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${videoReady ? "opacity-0 pointer-events-none" : "opacity-100"}`}
                style={{ transform: "translateZ(0)" }}
            />

            {/* ── Vídeo — fade-in sobre o poster quando pronto ── */}
            {!videoFailed && (
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    loop
                    playsInline
                    disablePictureInPicture
                    preload="auto"
                    className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${videoReady ? "opacity-100" : "opacity-0"}`}
                    style={{ transform: "translateZ(0)" }}
                    onCanPlay={() => setVideoReady(true)}
                    onError={() => setVideoFailed(true)}
                >
                    <source src={SRC_MP4} type="video/mp4" />
                    <source src={SRC_WEBM} type="video/webm" />
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
