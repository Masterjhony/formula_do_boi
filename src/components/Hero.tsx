"use client";

import { useRef, useState, useEffect, useCallback } from "react";

const CLD = "https://res.cloudinary.com/dkh2nsugb/video/upload";
const VID = "v1775568904/cam_1_lifky2";
const POSTER = `${CLD}/f_jpg,q_75,w_1280,so_0/${VID}.jpg`;
const SRC_MP4  = `${CLD}/f_mp4,w_960,q_auto:low,vc_h264,br_600k/${VID}.mp4`;
const SRC_WEBM = `${CLD}/f_webm,w_960,q_auto:low,vc_vp9,br_400k/${VID}.webm`;

const WA_LINK = "https://wa.me/5531984143874?text=Ol%C3%A1%2C%20quero%20entrar%20no%20grupo%20Selo%20Ouro";

// Brandbook tokens
const BRONZE = "#A0792E";
const BRONZE_LIGHT = "#D4A85C";
const BRONZE_PALE = "#E8CB85";
const INK = "#0A0A0A";
const FG = "#F5F0E4";

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
            style={{ minHeight: "92vh", padding: "120px 20px 56px", color: FG, background: INK }}
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

            {/* Gradient overlay — deep ink */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(180deg, rgba(10,10,10,0.45) 0%, rgba(10,10,10,0.78) 55%, rgba(10,10,10,0.98) 100%)" }}
            />

            {/* Radial bronze glow (brandbook tint-radial) */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(212,168,92,0.18) 0%, rgba(10,10,10,0) 60%)" }}
            />

            {/* Dot grid brandbook pattern */}
            <div
                className="absolute inset-0 pointer-events-none opacity-40"
                style={{
                    backgroundImage: "radial-gradient(circle at 1px 1px, rgba(232,203,133,0.14) 1px, transparent 0)",
                    backgroundSize: "28px 28px",
                    maskImage: "linear-gradient(180deg, transparent 0%, black 40%, black 85%, transparent 100%)",
                }}
            />

            {/* Conteúdo */}
            <div className="relative z-10 w-full" style={{ maxWidth: 1200, margin: "0 auto" }}>

                {/* Eyebrow brandbook — mono uppercase tracking 0.24em */}
                <div
                    className="inline-flex items-center gap-3 mb-6"
                    style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        letterSpacing: "0.24em",
                        textTransform: "uppercase",
                        color: BRONZE_LIGHT,
                        fontWeight: 500,
                    }}
                >
                    <span style={{ width: 32, height: 1, background: BRONZE, display: "inline-block", flexShrink: 0 }} />
                    <span style={{ width: 6, height: 6, background: BRONZE, borderRadius: "50%" }} />
                    Curadoria · Nelore PO
                </div>

                {/* Título — hierarquia brandbook H1 display */}
                <h1
                    className="font-display"
                    style={{
                        fontWeight: 500,
                        fontSize: "clamp(42px, 9.2vw, 96px)",
                        lineHeight: 0.96,
                        letterSpacing: "-0.03em",
                        marginBottom: 20,
                        maxWidth: "16ch",
                        color: FG,
                    }}
                >
                    Genética de elite.<br/>
                    <span style={{ color: BRONZE_LIGHT }}>Precisão de dados.</span>
                </h1>

                {/* Subtítulo — body-lg brandbook */}
                <p
                    style={{
                        fontSize: "clamp(16px, 2.1vw, 20px)",
                        lineHeight: 1.5,
                        color: "rgba(245,240,228,0.82)",
                        marginBottom: 28,
                        maxWidth: "54ch",
                        letterSpacing: "-0.005em",
                    }}
                >
                    Curadoria de Nelore PO de alto padrão, sêmen top 0.1% e embriões FIV
                    selecionados. O filtro de confiança entre o topo do ranking e o pecuarista seletor.
                </p>

                {/* Mono data chips — brandbook signature */}
                <div
                    className="flex flex-wrap items-center gap-3 mb-9"
                    style={{ fontFamily: "var(--font-mono)" }}
                >
                    {[
                        { k: "MGTe", v: "156.8" },
                        { k: "DEP.P365", v: "+18.2" },
                        { k: "TOP", v: "0.1%" },
                    ].map(({ k, v }) => (
                        <span
                            key={k}
                            className="inline-flex items-center gap-2"
                            style={{
                                padding: "6px 10px",
                                border: "1px solid rgba(212,168,92,0.28)",
                                borderRadius: 2,
                                fontSize: 11,
                                letterSpacing: "0.12em",
                                textTransform: "uppercase",
                                color: BRONZE_LIGHT,
                                background: "rgba(10,10,10,0.35)",
                            }}
                        >
                            <span style={{ color: "rgba(245,240,228,0.55)" }}>{k}</span>
                            <span style={{ color: BRONZE_PALE, fontWeight: 500 }}>{v}</span>
                        </span>
                    ))}
                </div>

                {/* CTAs — sem adorno, brandbook style */}
                <div className="flex flex-wrap gap-3 mb-12">
                    <a
                        href={WA_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center justify-center gap-2.5 transition-all hover:-translate-y-0.5 active:scale-95"
                        style={{
                            background: BRONZE,
                            color: INK,
                            padding: "16px 26px",
                            borderRadius: 2,
                            fontWeight: 600,
                            fontSize: 14,
                            letterSpacing: "0.02em",
                            border: `1px solid ${BRONZE}`,
                            boxShadow: "0 0 0 1px rgba(212,168,92,0.35), 0 0 60px rgba(212,168,92,0.18)",
                        }}
                    >
                        Acessar Grupo Selo Ouro
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:translate-x-0.5">
                            <path d="M5 12h14M13 6l6 6-6 6"/>
                        </svg>
                    </a>
                    <a
                        href="#semen"
                        className="group inline-flex items-center justify-center gap-2.5 transition-all"
                        style={{
                            background: "transparent",
                            color: FG,
                            padding: "16px 26px",
                            borderRadius: 2,
                            fontWeight: 500,
                            fontSize: 14,
                            letterSpacing: "0.02em",
                            border: "1px solid rgba(245,240,228,0.22)",
                        }}
                    >
                        Ver catálogo
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:translate-x-0.5">
                            <path d="M5 12h14M13 6l6 6-6 6"/>
                        </svg>
                    </a>
                </div>

                {/* Trust row — brandbook hairline divider */}
                <div
                    className="flex flex-wrap gap-x-10 gap-y-5 items-start"
                    style={{
                        paddingTop: 28,
                        borderTop: "1px solid rgba(212,168,92,0.22)",
                        position: "relative",
                    }}
                >
                    {/* Hairline decoration — bronze tick */}
                    <span
                        aria-hidden
                        style={{
                            position: "absolute",
                            top: -1, left: 0,
                            width: 48, height: 1,
                            background: BRONZE,
                        }}
                    />
                    {[
                        { value: "+10",     label: "anos no PO" },
                        { value: "R$ 300M", label: "em gado assessorado" },
                        { value: "18",      label: "leilões em 2026" },
                    ].map(({ value, label }) => (
                        <div key={label} className="flex flex-col gap-1">
                            <b
                                className="font-display"
                                style={{
                                    fontSize: 24,
                                    fontWeight: 500,
                                    color: BRONZE_LIGHT,
                                    letterSpacing: "-0.015em",
                                    lineHeight: 1,
                                }}
                            >
                                {value}
                            </b>
                            <span
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: 10.5,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.2em",
                                    color: "rgba(245,240,228,0.65)",
                                    fontWeight: 500,
                                }}
                            >
                                {label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
