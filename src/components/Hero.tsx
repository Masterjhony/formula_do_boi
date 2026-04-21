"use client";

import { useRef, useState, useEffect, useCallback } from "react";

const CLD = "https://res.cloudinary.com/dkh2nsugb/video/upload";
const VID = "v1775568904/cam_1_lifky2";
const POSTER = `${CLD}/f_jpg,q_75,w_1280,so_0/${VID}.jpg`;
const SRC_MP4  = `${CLD}/f_mp4,w_960,q_auto:low,vc_h264,br_600k/${VID}.mp4`;
const SRC_WEBM = `${CLD}/f_webm,w_960,q_auto:low,vc_vp9,br_400k/${VID}.webm`;

const WA_LINK = "https://wa.me/5531984143874?text=Ol%C3%A1%2C%20quero%20entrar%20no%20grupo%20Selo%20Ouro";

export default function Hero() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoReady, setVideoReady] = useState(false);
    const [videoFailed, setVideoFailed] = useState(false);

    const handlePlaying = useCallback(() => setVideoReady(true), []);
    const handleError   = useCallback(() => setVideoFailed(true), []);

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        const tryPlay = () => v.play().catch(() => setVideoFailed(true));
        if (v.readyState >= 3) {
            tryPlay();
        } else {
            v.addEventListener("canplaythrough", tryPlay, { once: true });
            return () => v.removeEventListener("canplaythrough", tryPlay);
        }
    }, []);

    return (
        <section
            className="relative flex items-end overflow-hidden"
            style={{ minHeight: "92vh", padding: "120px 20px 48px", color: "#F6F2EA", background: "#0A0A0A" }}
        >
            {/* Poster */}
            <img
                src={POSTER}
                alt=""
                aria-hidden
                fetchPriority="high"
                className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${videoReady ? "opacity-0 pointer-events-none" : "opacity-100"}`}
            />

            {/* Vídeo */}
            {!videoFailed && (
                <video
                    ref={videoRef}
                    autoPlay muted loop playsInline disablePictureInPicture preload="auto"
                    className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${videoReady ? "opacity-100" : "opacity-0"}`}
                    onPlaying={handlePlaying}
                    onError={handleError}
                >
                    <source src={SRC_MP4}  type="video/mp4" />
                    <source src={SRC_WEBM} type="video/webm" />
                </video>
            )}

            {/* Gradient overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(180deg, rgba(10,10,10,0.35) 0%, rgba(10,10,10,0.72) 60%, rgba(10,10,10,0.96) 100%)" }}
            />

            {/* Leather grain */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.8 0 0 0 0 0.7 0 0 0 0 0.3 0 0 0 0.12 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
                    opacity: 0.35,
                    mixBlendMode: "overlay",
                }}
            />

            {/* Conteúdo */}
            <div className="relative z-10 w-full" style={{ maxWidth: 1200, margin: "0 auto" }}>

                {/* Kicker */}
                <div
                    className="inline-flex items-center gap-2.5 mb-5"
                    style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "#C9A961", fontWeight: 600 }}
                >
                    <span style={{ width: 28, height: 1, background: "#C9A961", display: "inline-block", flexShrink: 0 }} />
                    De criador, pra criador
                </div>

                {/* Título */}
                <h1
                    className="font-display"
                    style={{ fontWeight: 400, fontSize: "clamp(38px, 9vw, 84px)", lineHeight: 1.02, letterSpacing: "-0.025em", marginBottom: 22, maxWidth: "14ch" }}
                >
                    Genética Nelore P.O. sem{" "}
                    <em style={{ fontStyle: "italic", color: "#C9A961", fontWeight: 400 }}>intermediário caro.</em>
                </h1>

                {/* Subtítulo */}
                <p style={{ fontSize: "clamp(15px, 2.5vw, 18px)", lineHeight: 1.55, color: "rgba(246,242,234,0.80)", marginBottom: 32, maxWidth: "52ch" }}>
                    Sêmen dos 11 melhores reprodutores da safra, embriões de doadoras consagradas e
                    leilões com curadoria Bula Remates. Direto no WhatsApp. Sem ruído de vitrine.
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap gap-3 mb-10">
                    <a
                        href={WA_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2.5 transition-all hover:-translate-y-0.5 active:scale-95"
                        style={{ background: "#A0802A", color: "#0A0A0A", padding: "18px 28px", borderRadius: 999, fontWeight: 700, fontSize: 15, border: "2px solid #A0802A" }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        Entrar no Grupo Selo Ouro
                    </a>
                    <a
                        href="#semen"
                        className="inline-flex items-center justify-center gap-2.5 transition-all hover:border-opacity-80"
                        style={{ background: "transparent", color: "#F6F2EA", padding: "18px 28px", borderRadius: 999, fontWeight: 600, fontSize: 15, border: "1.5px solid rgba(246,242,234,0.35)" }}
                    >
                        Ver a escalação
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M13 6l6 6-6 6"/>
                        </svg>
                    </a>
                </div>

                {/* Trust row */}
                <div
                    className="flex flex-wrap gap-x-8 gap-y-4"
                    style={{ paddingTop: 28, borderTop: "1px solid rgba(246,242,234,0.12)" }}
                >
                    {[
                        { value: "+10",     label: "anos no P.O." },
                        { value: "R$ 300M", label: "em gado assessorado" },
                        { value: "18",      label: "leilões em 2026" },
                    ].map(({ value, label }) => (
                        <div key={label} className="flex flex-col gap-0.5">
                            <b
                                className="font-display"
                                style={{ fontSize: 22, fontWeight: 500, color: "#C9A961", letterSpacing: "-0.01em" }}
                            >
                                {value}
                            </b>
                            <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(246,242,234,0.70)", fontWeight: 500 }}>
                                {label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
