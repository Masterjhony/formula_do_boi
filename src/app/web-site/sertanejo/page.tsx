"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { sertanejoLandingCss } from "./sertanejoLandingCss";

const URL_PREFIX = "https://res.cloudinary.com/dkh2nsugb";

const galleryImages = [
    `${URL_PREFIX}/image/upload/v1774271579/sertanejo-01_bqpxlz.jpg`,
    `${URL_PREFIX}/image/upload/v1774271579/sertanejo-02_jjtpii.jpg`,
    `${URL_PREFIX}/image/upload/v1774271579/sertanejo-03_ufxuxb.jpg`,
    `${URL_PREFIX}/image/upload/v1774271580/sertanejo-04_a2avtq.jpg`,
    `${URL_PREFIX}/image/upload/v1774271579/sertanejo-05_ossjx0.jpg`,
    `${URL_PREFIX}/image/upload/v1774271579/sertanejo-06_j9zje5.jpg`,
];

const introVideoSrc = `${URL_PREFIX}/video/upload/v1774293296/intro_sertantejo_t6bxhk.mp4`;

const touroVideos = [
    { src: `${URL_PREFIX}/video/upload/v1774271582/WhatsApp_Video_2026-03-21_at_12.21.06_tqodqe.mp4`, label: "Touro Sertanejo — Vídeo 1" },
    { src: `${URL_PREFIX}/video/upload/v1774271587/WhatsApp_Video_2026-03-21_at_12.21.08_zhdbrd.mp4`, label: "Touro Sertanejo — Vídeo 2" },
    { src: `${URL_PREFIX}/video/upload/v1774271582/WhatsApp_Video_2026-03-21_at_12.21.09_guttwd.mp4`, label: "Touro Sertanejo — Vídeo 3" },
    { src: `${URL_PREFIX}/video/upload/v1774271581/WhatsApp_Video_2026-03-21_at_12.21.10_yjekne.mp4`, label: "Touro Sertanejo — Vídeo 4" },
    { src: `${URL_PREFIX}/video/upload/v1774271583/WhatsApp_Video_2026-03-21_at_12.21.11_g5simf.mp4`, label: "Touro Sertanejo — Vídeo 5" },
];

const progenieMachosVideos = [
    { src: `${URL_PREFIX}/video/upload/v1774271585/WhatsApp_Video_2026-03-21_at_12.21.12_jaugxz.mp4`, label: "Progênie Macho — Vídeo 1" },
    { src: `${URL_PREFIX}/video/upload/v1774284099/Progenie_Macho_1_gsawbw.mp4`, label: "Progênie Macho — Vídeo 2" },
    { src: `${URL_PREFIX}/video/upload/v1774284178/Progenie_Macho_2_roevvo.mp4`, label: "Progênie Macho — Vídeo 3" },
    { src: `${URL_PREFIX}/video/upload/v1774284179/Progenie_Macho_4_oqa6mh.mp4`, label: "Progênie Macho — Vídeo 4" },
];

const progenieFemeasVideos = [
    { src: `${URL_PREFIX}/video/upload/v1774281612/Progenie_femea_terra_brava_1_bo8cfu.mp4`, label: "Progênie Fêmea — Vídeo 1" },
    { src: `${URL_PREFIX}/video/upload/v1774281614/Progenie_femea_terra_brava_2_oruwcg.mp4`, label: "Progênie Fêmea — Vídeo 2" },
    { src: `${URL_PREFIX}/video/upload/v1774281616/progenie_femea_terra_brava_3_eziifa.mp4`, label: "Progênie Fêmea — Vídeo 3" },
    { src: `${URL_PREFIX}/video/upload/v1774281619/Progenie_femea_terra_brava_4_ct83mc.mp4`, label: "Progênie Fêmea — Vídeo 4" },
    { src: `${URL_PREFIX}/video/upload/v1774281619/Progenie_femea_terra_brava_5_ocquo6.mp4`, label: "Progênie Fêmea — Vídeo 5" },
];

const CHECKOUT_URL = "/sertanejo/checkout";
const FICHA_URL = "/sertanejo/ficha-tecnica";

// === Reusable Corners ===
function Corners({ color = "var(--st-gold)", size = 18 }: { color?: string; size?: number }) {
    const s: React.CSSProperties = { position: "absolute", width: size, height: size, borderColor: color, pointerEvents: "none" };
    return (
        <>
            <span style={{ ...s, top: 10, left: 10, borderTop: "1px solid", borderLeft: "1px solid" }} />
            <span style={{ ...s, top: 10, right: 10, borderTop: "1px solid", borderRight: "1px solid" }} />
            <span style={{ ...s, bottom: 10, left: 10, borderBottom: "1px solid", borderLeft: "1px solid" }} />
            <span style={{ ...s, bottom: 10, right: 10, borderBottom: "1px solid", borderRight: "1px solid" }} />
        </>
    );
}

export default function SertanejoLanding() {
    // photo carousel
    const [photoIndex, setPhotoIndex] = useState(0);
    const photoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // lightbox + video modal
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [modalVideoSrc, setModalVideoSrc] = useState<string | null>(null);

    // intro video
    const introVideoRef = useRef<HTMLVideoElement>(null);
    const [introPlaying, setIntroPlaying] = useState(false);

    const startPhotoAutoPlay = () => {
        if (photoIntervalRef.current) clearInterval(photoIntervalRef.current);
        photoIntervalRef.current = setInterval(() => {
            setPhotoIndex((prev) => (prev + 1) % galleryImages.length);
        }, 4000);
    };

    const navigatePhoto = (dir: number) => {
        setPhotoIndex((prev) => (prev + dir + galleryImages.length) % galleryImages.length);
        startPhotoAutoPlay();
    };

    useEffect(() => {
        startPhotoAutoPlay();

        // Inject Google Fonts (Space Grotesk + JetBrains Mono)
        const id = "sertanejo-v2-google-fonts";
        if (typeof document !== "undefined" && !document.getElementById(id)) {
            const pre1 = document.createElement("link");
            pre1.rel = "preconnect";
            pre1.href = "https://fonts.googleapis.com";
            document.head.appendChild(pre1);

            const pre2 = document.createElement("link");
            pre2.rel = "preconnect";
            pre2.href = "https://fonts.gstatic.com";
            pre2.crossOrigin = "anonymous";
            document.head.appendChild(pre2);

            const link = document.createElement("link");
            link.id = id;
            link.rel = "stylesheet";
            link.href = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap";
            document.head.appendChild(link);
        }

        return () => {
            if (photoIntervalRef.current) clearInterval(photoIntervalRef.current);
        };
    }, []);

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
        document.body.style.overflow = "hidden";
    };
    const closeLightbox = () => {
        setLightboxOpen(false);
        document.body.style.overflow = "";
    };
    const navigateLightbox = (dir: number) => {
        setLightboxIndex((prev) => (prev + dir + galleryImages.length) % galleryImages.length);
    };

    const openVideo = (src: string) => {
        setModalVideoSrc(src);
        document.body.style.overflow = "hidden";
    };
    const closeVideo = () => {
        setModalVideoSrc(null);
        document.body.style.overflow = "";
    };

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (lightboxOpen) {
                if (e.key === "Escape") closeLightbox();
                if (e.key === "ArrowLeft") navigateLightbox(-1);
                if (e.key === "ArrowRight") navigateLightbox(1);
            }
            if (modalVideoSrc && e.key === "Escape") closeVideo();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [lightboxOpen, modalVideoSrc]);

    const toggleIntro = () => {
        const v = introVideoRef.current;
        if (!v) return;
        if (v.paused) {
            v.play();
            setIntroPlaying(true);
            v.controls = true;
        } else {
            v.pause();
            setIntroPlaying(false);
            v.controls = false;
        }
    };

    return (
        <div className="sertanejo-v2-wrap">
            <style dangerouslySetInnerHTML={{ __html: sertanejoLandingCss }} />

            {/* Top promo bar */}
            <div className="sert-dark-leather" style={{
                padding: "8px 20px", textAlign: "center",
                borderBottom: "1px solid rgba(201,162,74,0.18)",
            }}>
                <span className="mono" style={{
                    fontSize: 9, letterSpacing: "0.36em", color: "var(--st-gold-2)",
                    textTransform: "uppercase", fontWeight: 500,
                }}>
                    Aceleradora de Touros · Lançamento 2026
                </span>
            </div>

            {/* Sticky nav */}
            <nav className="sert-dark-leather" style={{
                position: "sticky", top: 0, zIndex: 50,
                borderBottom: "1px solid var(--st-rule-2)",
            }}>
                <div className="sert-wrap" style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "16px 0",
                    paddingLeft: "clamp(20px, 5vw, 40px)", paddingRight: "clamp(20px, 5vw, 40px)",
                }}>
                    <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12 }} aria-label="Fórmula do Boi — Página inicial">
                        <img src="/assets/sertanejo/logo-horizontal-white.png" alt="Fórmula do Boi" style={{ height: 30, width: "auto", display: "block" }} />
                    </Link>

                    <div className="nav-center" style={{ display: "flex", gap: 28 }}>
                        {[
                            ["Touro", "touro"],
                            ["Diferenciais", "diferenciais"],
                            ["Genética", "genetica"],
                            ["Galeria", "galeria"],
                            ["Pacotes", "pacotes"],
                        ].map(([n, id]) => (
                            <a key={id} href={`#${id}`} className="mono" style={{
                                color: "var(--st-bone-2)", fontSize: 11, letterSpacing: "0.22em",
                                textTransform: "uppercase", fontWeight: 400,
                                padding: "6px 0", borderBottom: "1px solid transparent",
                                transition: "all 0.2s",
                            }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLAnchorElement).style.color = "var(--st-gold-2)";
                                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--st-gold)";
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLAnchorElement).style.color = "var(--st-bone-2)";
                                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "transparent";
                                }}
                            >{n}</a>
                        ))}
                    </div>

                    <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
                        <Link href="/" className="mono nav-pre" style={{
                            fontSize: 10, letterSpacing: "0.22em", color: "var(--st-bone-2)",
                            textTransform: "uppercase", display: "flex", alignItems: "center",
                            gap: 8, opacity: 0.75,
                        }}>← Voltar ao site</Link>
                        <Link href={CHECKOUT_URL} className="btn btn-gold" style={{ padding: "11px 20px", fontSize: 10 }}>
                            Reservar dose
                        </Link>
                    </div>
                </div>
                <div style={{
                    height: 1,
                    background: "linear-gradient(90deg, transparent, var(--st-gold) 30%, var(--st-gold) 70%, transparent)",
                    opacity: 0.35,
                }} />
            </nav>

            {/* HERO */}
            <section className="sert-section" style={{ paddingTop: "clamp(40px, 6vw, 80px)", paddingBottom: 0 }}>
                <div className="sert-wrap" style={{ position: "relative" }}>
                    <div className="mono" style={{
                        position: "absolute", left: -10, top: "50%", transform: "translateY(-50%) rotate(-90deg)",
                        transformOrigin: "left center", fontSize: 10, letterSpacing: "0.4em",
                        color: "var(--st-gold-deep)", textTransform: "uppercase", whiteSpace: "nowrap", opacity: 0.7,
                    }}>EPCF 2315 · NELORE PO · CENTRAL SEMEX</div>
                    <div className="mono" style={{
                        position: "absolute", right: -10, top: "50%", transform: "translateY(-50%) rotate(90deg)",
                        transformOrigin: "right center", fontSize: 10, letterSpacing: "0.4em",
                        color: "var(--st-gold-deep)", textTransform: "uppercase", whiteSpace: "nowrap", opacity: 0.7,
                    }}>MGTE TOP 16% · iABCZ 11,37 · DECA 2</div>

                    <div className="hero-grid" style={{
                        display: "grid", gridTemplateColumns: "1.3fr 1fr",
                        gap: "clamp(20px, 4vw, 60px)", alignItems: "center",
                        marginBottom: 60,
                    }}>
                        <div>
                            <div className="tag-pill" style={{ marginBottom: 28 }}>
                                Aceleradora · Lançamento Sertanejo
                            </div>

                            <h1 className="serif-tight" style={{
                                fontSize: "clamp(56px, 10vw, 160px)", color: "var(--st-ink-soft)",
                                lineHeight: 0.88, marginBottom: 8,
                            }}>Sertanejo</h1>
                            <h1 className="serif-tight" style={{
                                fontSize: "clamp(48px, 8.5vw, 140px)", color: "var(--st-gold-deep)",
                                fontStyle: "italic", lineHeight: 0.88, marginBottom: 32,
                                fontWeight: 500, letterSpacing: "-0.02em",
                            }}>da Terra Brava.</h1>

                            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                                <span style={{ width: 60, height: 1, background: "var(--st-gold-deep)", opacity: 0.5 }} />
                                <span style={{ color: "var(--st-gold-deep)", fontSize: 12 }}>✦</span>
                                <span style={{ width: 60, height: 1, background: "var(--st-gold-deep)", opacity: 0.5 }} />
                            </div>

                            <p className="serif" style={{
                                fontSize: "clamp(20px, 2.2vw, 30px)", lineHeight: 1.4, fontWeight: 400,
                                maxWidth: 540, marginBottom: 14, color: "var(--st-ink-soft)",
                            }}>
                                O touro que está <em style={{ color: "var(--st-gold-deep)" }}>transformando</em> o rebanho brasileiro.
                            </p>
                            <p style={{
                                fontSize: 15, color: "var(--st-ink-soft)", maxWidth: 480,
                                marginBottom: 36, opacity: 0.75, lineHeight: 1.65,
                            }}>
                                Nelore PO, MGTe TOP 16%, iABCZ 11,37 (DECA 2). Genética comprovada com excelentes
                                avaliações em crescimento e carcaça.
                            </p>

                            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                                <Link href={CHECKOUT_URL} className="btn btn-green">⛛ Reservar dose</Link>
                                <Link href={FICHA_URL} className="btn btn-outline-dark">⌑ Ficha técnica</Link>
                            </div>
                        </div>

                        <div style={{ position: "relative" }}>
                            <div className="img-vignette" style={{
                                aspectRatio: "4 / 5",
                                backgroundImage: `url("${galleryImages[0]}")`,
                                backgroundSize: "cover", backgroundPosition: "center",
                                border: "1px solid rgba(138,106,38,0.3)",
                                position: "relative",
                                boxShadow: "0 30px 80px rgba(50,35,15,0.18)",
                                cursor: "pointer",
                            }} onClick={() => openLightbox(0)}>
                                <Corners color="var(--st-gold-deep)" />
                                <div style={{
                                    position: "absolute", top: 16, left: 16,
                                    background: "rgba(244,237,224,0.95)",
                                    border: "1px solid rgba(138,106,38,0.35)",
                                    padding: "8px 12px",
                                }}>
                                    <div className="mono" style={{ fontSize: 9, letterSpacing: "0.22em", color: "var(--st-gold-deep)", textTransform: "uppercase", fontWeight: 600 }}>EPCF 2315</div>
                                    <div className="serif" style={{ fontSize: 14, color: "var(--st-ink-soft)", fontStyle: "italic", marginTop: 2 }}>Nelore PO</div>
                                </div>
                                <div style={{
                                    position: "absolute", bottom: 16, right: 16,
                                    background: "linear-gradient(180deg, rgba(10,9,8,0.6), rgba(10,9,8,0.92))",
                                    padding: "12px 16px", backdropFilter: "blur(8px)",
                                    border: "1px solid var(--st-rule-2)",
                                }}>
                                    <div className="mono" style={{ fontSize: 9, letterSpacing: "0.22em", color: "var(--st-gold-2)", textTransform: "uppercase" }}>Touro · Aceleradora</div>
                                    <div className="serif" style={{ fontSize: 18, color: "var(--st-bone)", fontStyle: "italic", marginTop: 2 }}>Sertanejo TE</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hero-stats" style={{
                        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0,
                        borderTop: "1px solid var(--st-gold-deep)", borderLeft: "1px solid var(--st-gold-deep)",
                        background: "rgba(255,253,247,0.4)",
                    }}>
                        {[
                            ["MGTe", "20,81", "TOP 16%"],
                            ["iABCZ", "11,37", "DECA 2"],
                            ["DEP Peso 450d", "+21,07", "TOP 15%"],
                            ["AOL", "1,81 cm²", "TOP 7%"],
                        ].map(([l, v, t]) => (
                            <div key={l} style={{
                                padding: "24px 20px",
                                borderRight: "1px solid var(--st-gold-deep)",
                                borderBottom: "1px solid var(--st-gold-deep)",
                                textAlign: "left",
                            }}>
                                <div className="mono" style={{ fontSize: 10, letterSpacing: "0.22em", color: "var(--st-gold-deep)", textTransform: "uppercase", fontWeight: 600 }}>{l}</div>
                                <div className="serif-tight" style={{ fontSize: "clamp(36px, 4vw, 56px)", color: "var(--st-ink-soft)", marginTop: 6, fontWeight: 500 }}>{v}</div>
                                <div className="mono" style={{ fontSize: 10, color: "var(--st-gold-deep)", letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 4 }}>{t}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* MARQUEE */}
            <div style={{
                borderTop: "1px solid rgba(138,106,38,0.25)",
                borderBottom: "1px solid rgba(138,106,38,0.25)",
                padding: "14px 0", overflow: "hidden",
                background: "rgba(255,253,247,0.5)",
            }}>
                <div style={{ display: "flex", gap: 56, animation: "sertanejo-marquee 60s linear infinite", whiteSpace: "nowrap" }}>
                    {[
                        "MGTe TOP 16%", "iABCZ 11,37 · DECA 2", "DEP Peso +21,07kg",
                        "AOL 1,81 cm² · TOP 7%", "Acabamento +4,47mm", "Marmoreio TOP 0,1%",
                        "Central Semex · MAPA", "Genotipado", "Avaliação Genômica",
                    ].concat([
                        "MGTe TOP 16%", "iABCZ 11,37 · DECA 2", "DEP Peso +21,07kg",
                        "AOL 1,81 cm² · TOP 7%", "Acabamento +4,47mm", "Marmoreio TOP 0,1%",
                        "Central Semex · MAPA", "Genotipado", "Avaliação Genômica",
                        "MGTe TOP 16%", "iABCZ 11,37 · DECA 2", "DEP Peso +21,07kg",
                        "AOL 1,81 cm² · TOP 7%", "Acabamento +4,47mm", "Marmoreio TOP 0,1%",
                        "Central Semex · MAPA", "Genotipado", "Avaliação Genômica",
                    ]).map((s, i) => (
                        <span key={i} className="mono" style={{
                            fontSize: 11, letterSpacing: "0.28em",
                            color: i % 3 === 0 ? "var(--st-gold-deep)" : "var(--st-ink-soft)",
                            textTransform: "uppercase", flexShrink: 0,
                        }}>
                            {s} <span style={{ color: "var(--st-gold)", marginLeft: 56 }}>✦</span>
                        </span>
                    ))}
                </div>
            </div>

            {/* MANIFESTO */}
            <section id="touro" className="sert-section sert-dark-leather" style={{
                color: "var(--st-bone)",
                borderTop: "1px solid var(--st-rule-2)",
                borderBottom: "1px solid var(--st-rule-2)",
            }}>
                <div className="sert-wrap">
                    <div className="manifesto-grid" style={{
                        display: "grid", gridTemplateColumns: "420px 1fr",
                        gap: "clamp(40px, 6vw, 80px)", alignItems: "center",
                    }}>
                        <div style={{ position: "relative" }}>
                            <div className="img-vignette" style={{
                                aspectRatio: "4 / 5",
                                border: "1px solid var(--st-rule-2)",
                                position: "relative", overflow: "hidden", background: "#000",
                                cursor: "pointer",
                            }} onClick={toggleIntro}>
                                <video
                                    ref={introVideoRef}
                                    src={introVideoSrc}
                                    poster={galleryImages[1]}
                                    playsInline
                                    preload="metadata"
                                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                />
                                <Corners color="var(--st-gold)" />
                                {!introPlaying && (
                                    <div style={{
                                        position: "absolute", top: "50%", left: "50%",
                                        transform: "translate(-50%, -50%)",
                                        width: 64, height: 64, borderRadius: "50%",
                                        background: "linear-gradient(180deg, var(--st-gold-2), var(--st-gold))",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                                        pointerEvents: "none",
                                    }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--st-ink)"><path d="M8 5l11 7-11 7V5z" /></svg>
                                    </div>
                                )}
                                <div style={{
                                    position: "absolute", bottom: 16, left: 16, right: 16,
                                    background: "linear-gradient(180deg, rgba(10,9,8,0.5), rgba(10,9,8,0.92))",
                                    padding: "12px 16px", backdropFilter: "blur(8px)",
                                    border: "1px solid var(--st-rule-2)",
                                    pointerEvents: "none",
                                }}>
                                    <div className="serif" style={{ fontSize: 16, color: "var(--st-bone)", fontStyle: "italic" }}>TERRA BRAVA</div>
                                    <div className="mono" style={{ fontSize: 9, letterSpacing: "0.22em", color: "var(--st-gold)", textTransform: "uppercase", marginTop: 2 }}>Apresentação · Sertanejo</div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="tag-pill" style={{
                                background: "rgba(201,162,74,0.10)",
                                borderColor: "var(--st-rule-2)",
                                color: "var(--st-gold-2)",
                                marginBottom: 28,
                            }}>Destaque genético</div>

                            <h2 className="serif-tight" style={{ fontSize: "clamp(40px, 6vw, 84px)", color: "var(--st-bone)", marginBottom: 28 }}>
                                O Fenômeno está <em style={{ color: "var(--st-gold-2)" }}>de volta.</em>
                            </h2>

                            <p style={{ fontSize: 17, lineHeight: 1.7, color: "var(--st-txt)", maxWidth: 600, fontWeight: 300, marginBottom: 36 }}>
                                Sertanejo é a personificação da eficiência produtiva e qualidade racial. Com produção
                                amplamente comprovada no campo, o reprodutor retorna à central Semex para atender à
                                alta demanda de criadores que buscam padronização e carcaça moderna.
                            </p>

                            <div style={{ display: "grid", gap: 22, marginBottom: 40 }}>
                                {([
                                    ["Genética de Elite", "Irmão próprio da renomada doadora 2321 — matriz de ícones como Rolex e Qatar Terra Brava."],
                                    ["Performance Reprodutiva", "Índices de prenhez acima da média, garantindo rentabilidade no manejo."],
                                    ["Atributos Físicos", "Volume muscular excepcional no posterior, carcaça profunda e padrão racial impecável transmitido com alta fidelidade à progênie."],
                                ] as [string, string][]).map(([t, d]) => (
                                    <div key={t} style={{ display: "grid", gridTemplateColumns: "14px 1fr", gap: 14, alignItems: "start" }}>
                                        <span style={{ width: 8, height: 8, marginTop: 8, background: "var(--st-gold)", display: "inline-block", boxShadow: "0 0 12px var(--st-gold)" }} />
                                        <div>
                                            <div className="serif" style={{ fontSize: 18, color: "var(--st-bone)", fontWeight: 500, marginBottom: 4 }}>{t}</div>
                                            <div style={{ fontSize: 14, color: "var(--st-txt)", lineHeight: 1.6, fontWeight: 300 }}>{d}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <blockquote style={{
                                borderLeft: "1px solid var(--st-gold)", paddingLeft: 20,
                                fontStyle: "italic", fontFamily: "var(--st-serif)",
                                fontSize: 20, color: "var(--st-gold-2)",
                            }}>
                                &quot;Sertanejo Terra Brava: aí é máquina.&quot;
                            </blockquote>
                        </div>
                    </div>
                </div>
            </section>

            {/* DIFERENCIAIS */}
            <section id="diferenciais" className="sert-section">
                <div className="sert-wrap" style={{ textAlign: "center" }}>
                    <div className="tag-pill" style={{ marginBottom: 32 }}>Diferenciais</div>

                    <h2 className="serif-tight" style={{ fontSize: "clamp(40px, 6vw, 88px)", color: "var(--st-ink-soft)", marginBottom: 16 }}>
                        Por que escolher o <em style={{ color: "var(--st-gold-deep)" }}>Sertanejo?</em>
                    </h2>

                    <p style={{ fontSize: 16, color: "var(--st-ink-soft)", opacity: 0.7, maxWidth: 640, margin: "0 auto 64px" }}>
                        Resultados comprovados em avaliações genéticas oficiais ANCP e PMGZ/ABCZ.
                    </p>

                    <div className="diff-grid" style={{
                        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 56,
                    }}>
                        {([
                            ["↗", "MGTe TOP 16%", "Mérito Genético Total Econômico de 20,81 pontos com acurácia de 84% — elite da raça Nelore."],
                            ["⤢", "Crescimento Superior", "DEP de Peso aos 450 dias de +21,07 kg (TOP 15%) e Peso Sobreano de +8,93 kg (DECA 3 PMGZ)."],
                            ["⊞", "Carcaça de Elite", "AOL de 1,81 cm² (TOP 7%), acabamento de gordura +4,47mm e marmoreio TOP 0,1%."],
                            ["✓", "Central Semex", "Coletado na Central Semex com aprovação MAPA. Genotipado e com avaliação genômica completa."],
                        ] as [string, string, string][]).map(([icon, title, desc], i) => (
                            <div key={i} className="sert-card" style={{ padding: 32, position: "relative" }}>
                                <div style={{ position: "absolute", top: 0, left: 0, width: 24, height: 1, background: "var(--st-gold)" }} />
                                <div style={{ position: "absolute", top: 0, left: 0, width: 1, height: 24, background: "var(--st-gold)" }} />

                                <div style={{
                                    width: 56, height: 56, borderRadius: "50%",
                                    background: "rgba(201,162,74,0.15)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    margin: "0 auto 24px",
                                    color: "var(--st-gold-deep)", fontSize: 22,
                                }}>{icon}</div>
                                <h3 className="mono" style={{
                                    fontSize: 13, letterSpacing: "0.18em", color: "var(--st-ink-soft)",
                                    textTransform: "uppercase", fontWeight: 700, marginBottom: 14, lineHeight: 1.3,
                                }}>{title}</h3>
                                <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--st-ink-soft)", opacity: 0.75 }}>{desc}</p>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                        <Link href={CHECKOUT_URL} className="btn btn-green">⛛ Ver valor da dose</Link>
                        <Link href={FICHA_URL} className="btn btn-outline-dark">⌑ Ficha técnica oficial</Link>
                    </div>
                </div>
            </section>

            {/* GENETIC EVAL */}
            <section id="genetica" className="sert-section" style={{ borderTop: "1px solid rgba(138,106,38,0.2)" }}>
                <div className="sert-wrap">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 60, flexWrap: "wrap", gap: 24 }}>
                        <div>
                            <div className="tag-pill" style={{ marginBottom: 24 }}>Avaliação Genética · ANCP / PMGZ</div>
                            <h2 className="serif-tight" style={{ fontSize: "clamp(36px, 5.5vw, 80px)", color: "var(--st-ink-soft)", maxWidth: 800 }}>
                                Direcionado para <em style={{ color: "var(--st-gold-deep)" }}>crescimento</em><br />
                                e carcaça moderna.
                            </h2>
                        </div>
                        <div className="mono" style={{ fontSize: 11, color: "var(--st-gold-deep)", letterSpacing: "0.18em", textTransform: "uppercase", textAlign: "right", opacity: 0.8 }}>
                            Fonte: ANCP · PMGZ/ABCZ<br />
                            Avaliação Genômica completa<br />
                            Genotipado · MAPA
                        </div>
                    </div>

                    <div className="genstat-grid" style={{
                        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                        borderTop: "1px solid var(--st-gold-deep)", borderLeft: "1px solid var(--st-gold-deep)",
                        marginBottom: 80,
                    }}>
                        {([
                            ["20,81", "MGTe", "Acurácia 84%"],
                            ["11,37", "iABCZ", "DECA 2"],
                            ["+21,07", "DEP Peso 450d", "TOP 15% · kg"],
                            ["1,81", "AOL", "TOP 7% · cm²"],
                            ["+4,47", "Acabamento", "mm de gordura"],
                            ["0,1%", "Marmoreio", "TOP da raça"],
                        ] as [string, string, string][]).map(([n, label, sub], i) => (
                            <div key={i} style={{
                                padding: "36px 28px",
                                borderRight: "1px solid var(--st-gold-deep)",
                                borderBottom: "1px solid var(--st-gold-deep)",
                                minHeight: 200,
                                background: i === 0 ? "rgba(201,162,74,0.08)" : "transparent",
                                display: "flex", flexDirection: "column", justifyContent: "space-between",
                                position: "relative",
                            }}>
                                <div className="mono" style={{ fontSize: 10, letterSpacing: "0.22em", color: "var(--st-gold-deep)", textTransform: "uppercase", fontWeight: 600 }}>{label}</div>
                                <div>
                                    <div className="serif-tight" style={{ fontSize: "clamp(48px, 6vw, 92px)", color: "var(--st-ink-soft)", fontWeight: 500 }}>{n}</div>
                                    <div className="mono" style={{ fontSize: 11, color: "var(--st-gold-deep)", letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 8 }}>{sub}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div>
                        <div className="mono" style={{ fontSize: 11, letterSpacing: "0.22em", color: "var(--st-gold-deep)", textTransform: "uppercase", marginBottom: 20, fontWeight: 600 }}>
                            DEPs &amp; Percentis
                        </div>
                        <div className="deps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0 60px" }}>
                            {([
                                ["PESO 450d", "+21,07", "15%", 85],
                                ["PESO SOBREANO", "+8,93", "DECA 3", 78],
                                ["AOL", "1,81", "7%", 93],
                                ["ACABAMENTO", "+4,47", "TOP", 88],
                                ["MARMOREIO", "TOP 0,1%", "Elite", 99],
                                ["iABCZ", "11,37", "DECA 2", 90],
                            ] as [string, string, string, number][]).map(([code, val, tier, bar], i, arr) => (
                                <div key={code} style={{
                                    padding: "20px 0",
                                    borderBottom: i < arr.length - 1 ? "1px solid rgba(138,106,38,0.18)" : "none",
                                    display: "grid", gridTemplateColumns: "150px 1fr 80px 80px",
                                    alignItems: "center", gap: 16,
                                }}>
                                    <div className="mono" style={{ color: "var(--st-ink-soft)", fontSize: 12, letterSpacing: "0.16em", fontWeight: 600 }}>{code}</div>
                                    <div style={{ position: "relative", height: 5, background: "rgba(138,106,38,0.10)" }}>
                                        <div style={{
                                            position: "absolute", top: 0, left: 0, height: "100%",
                                            width: `${bar}%`,
                                            background: "linear-gradient(90deg, var(--st-gold-deep), var(--st-gold-2))",
                                        }} />
                                    </div>
                                    <div className="serif-tight" style={{ color: "var(--st-ink-soft)", fontSize: 22, textAlign: "right", fontWeight: 500 }}>{val}</div>
                                    <div className="mono" style={{ fontSize: 10, color: "var(--st-gold-deep)", letterSpacing: "0.18em", textTransform: "uppercase", textAlign: "right" }}>TOP {tier}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* PEDIGREE */}
            <section className="sert-section" style={{ paddingTop: 80, paddingBottom: 80 }}>
                <div className="sert-wrap">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, flexWrap: "wrap", gap: 24 }}>
                        <div>
                            <div className="tag-pill" style={{ marginBottom: 20 }}>Pedigree</div>
                            <h2 className="serif-tight" style={{ fontSize: "clamp(36px, 5vw, 72px)", color: "var(--st-ink-soft)", maxWidth: 700 }}>
                                Linhagem <em style={{ color: "var(--st-gold-deep)" }}>Terra Brava.</em>
                            </h2>
                        </div>
                        <div className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: "var(--st-gold-deep)", textTransform: "uppercase", textAlign: "right" }}>
                            Sertanejo TE Terra Brava<br />
                            Reg. EPCF 2315 · Nelore PO
                        </div>
                    </div>

                    <div className="pedigree-grid" style={{
                        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0,
                        borderTop: "1px solid rgba(138,106,38,0.3)", borderLeft: "1px solid rgba(138,106,38,0.3)",
                    }}>
                        {([
                            { gen: "Geração F0", name: "Sertanejo TE", sub: "Terra Brava · EPCF 2315", strong: true },
                            { gen: "Pai", name: "Lordi POI Terra Brava", sub: "Reg. EPCF 1180 · Nelore PO", strong: false },
                            { gen: "Avô paterno", name: "Galeão FIV TE", sub: "CFCAJ 1840", strong: false },
                            { gen: "Avó paterna", name: "Yapa FIV", sub: "CFCAJ 2098", strong: false },
                            { gen: "Mãe", name: "Doadora 2321", sub: "Matriz · Terra Brava", strong: false },
                            { gen: "Avô materno", name: "Naviraí FIV", sub: "B 4421", strong: false },
                            { gen: "Avó materna", name: "Ondina TE", sub: "B 3224", strong: false },
                            { gen: "Irmãos próprios", name: "Rolex · Qatar", sub: "Linhagem Terra Brava", strong: true },
                        ]).map((p, i) => (
                            <div key={i} style={{
                                padding: "24px 20px",
                                borderRight: "1px solid rgba(138,106,38,0.3)",
                                borderBottom: "1px solid rgba(138,106,38,0.3)",
                                background: p.strong ? "rgba(201,162,74,0.10)" : "transparent",
                                minHeight: 130,
                                position: "relative",
                            }}>
                                <div className="mono" style={{ fontSize: 9, letterSpacing: "0.22em", color: "var(--st-gold-deep)", textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>{p.gen}</div>
                                <div className="serif" style={{ fontSize: 19, color: "var(--st-ink-soft)", fontWeight: 500, lineHeight: 1.2, marginBottom: 6 }}>{p.name}</div>
                                <div className="mono" style={{ fontSize: 10, color: "var(--st-ink-soft)", opacity: 0.6, letterSpacing: "0.10em" }}>{p.sub}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* GALLERY */}
            <section id="galeria" className="sert-section" style={{
                background: "rgba(255,253,247,0.4)",
                borderTop: "1px solid rgba(138,106,38,0.2)",
                borderBottom: "1px solid rgba(138,106,38,0.2)",
            }}>
                <div className="sert-wrap" style={{ textAlign: "center" }}>
                    <div className="tag-pill" style={{ marginBottom: 32 }}>Galeria</div>
                    <h2 className="serif-tight" style={{ fontSize: "clamp(40px, 6.5vw, 96px)", color: "var(--st-ink-soft)", marginBottom: 14 }}>
                        Conheça o <em style={{ color: "var(--st-gold-deep)" }}>Sertanejo</em>
                    </h2>
                    <p style={{ fontSize: 14, color: "var(--st-ink-soft)", opacity: 0.7, marginBottom: 56 }}>
                        Fotos e vídeos do Sertanejo Terra Brava <span style={{ color: "var(--st-gold-deep)" }}>›</span> Nelore PO, registro EPCF 2315
                    </p>

                    {/* Featured photo */}
                    <div style={{
                        position: "relative", aspectRatio: "16 / 9", marginBottom: 24,
                        border: "1px solid rgba(138,106,38,0.3)", overflow: "hidden", cursor: "pointer",
                    }} onClick={() => openLightbox(photoIndex)}>
                        <div style={{
                            backgroundImage: `url("${galleryImages[photoIndex]}")`,
                            backgroundSize: "cover", backgroundPosition: "center",
                            position: "absolute", inset: 0,
                            transition: "background-image 0.4s",
                        }} />
                        <Corners color="var(--st-gold-deep)" />

                        <div className="mono" style={{
                            position: "absolute", top: 20, left: 20,
                            padding: "6px 12px", background: "rgba(10,9,8,0.7)",
                            color: "var(--st-gold-2)", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase",
                            border: "1px solid var(--st-rule-2)",
                        }}>
                            {String(photoIndex + 1).padStart(2, "0")} / {String(galleryImages.length).padStart(2, "0")}
                        </div>

                        <button onClick={(e) => { e.stopPropagation(); navigatePhoto(-1); }} style={{
                            position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)",
                            width: 44, height: 44, borderRadius: "50%",
                            background: "rgba(255,253,247,0.85)", border: "1px solid rgba(138,106,38,0.3)",
                            cursor: "pointer", fontSize: 16, color: "var(--st-ink-soft)",
                        }} aria-label="Foto anterior">‹</button>
                        <button onClick={(e) => { e.stopPropagation(); navigatePhoto(1); }} style={{
                            position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)",
                            width: 44, height: 44, borderRadius: "50%",
                            background: "rgba(255,253,247,0.85)", border: "1px solid rgba(138,106,38,0.3)",
                            cursor: "pointer", fontSize: 16, color: "var(--st-ink-soft)",
                        }} aria-label="Próxima foto">›</button>
                    </div>

                    {/* Thumbs */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${galleryImages.length}, 1fr)`,
                        gap: 12, marginBottom: 80,
                    }}>
                        {galleryImages.map((p, i) => (
                            <button key={i} onClick={() => { setPhotoIndex(i); startPhotoAutoPlay(); }} style={{
                                aspectRatio: "4 / 3", position: "relative", overflow: "hidden",
                                backgroundImage: `url("${p}")`, backgroundSize: "cover", backgroundPosition: "center",
                                border: i === photoIndex ? "2px solid var(--st-gold-deep)" : "1px solid rgba(138,106,38,0.2)",
                                padding: 0, cursor: "pointer",
                                opacity: i === photoIndex ? 1 : 0.7,
                                transition: "opacity 0.2s",
                            }} aria-label={`Foto ${i + 1}`} />
                        ))}
                    </div>

                    {/* Video sections */}
                    <VideoSection title="Vídeos do Touro" color="var(--st-gold)" videos={touroVideos} thumbs={galleryImages} onPlay={openVideo} />
                    <VideoSection title="Vídeos de Progênie Macho" color="#7a9a55" videos={progenieMachosVideos} thumbs={galleryImages} onPlay={openVideo} />
                    <VideoSection title="Vídeos de Progênie Fêmea" color="#c95a5a" videos={progenieFemeasVideos} thumbs={galleryImages} onPlay={openVideo} />
                </div>
            </section>

            {/* PRICING */}
            <section id="pacotes" className="sert-section sert-dark-leather" style={{
                color: "var(--st-bone)", borderTop: "1px solid var(--st-rule-2)",
            }}>
                <div className="sert-wrap">
                    <div style={{ textAlign: "center", marginBottom: 64 }}>
                        <div className="tag-pill" style={{
                            background: "rgba(201,162,74,0.10)",
                            borderColor: "var(--st-rule-2)",
                            color: "var(--st-gold-2)",
                            marginBottom: 28,
                        }}>Tabela de sêmen · 2026</div>
                        <h2 className="serif-tight" style={{ fontSize: "clamp(40px, 6vw, 88px)", color: "var(--st-bone)", marginBottom: 18 }}>
                            Reserve a sua <em style={{ color: "var(--st-gold-2)" }}>safra de bezerros.</em>
                        </h2>
                        <p style={{ fontSize: 16, color: "var(--st-txt)", maxWidth: 560, margin: "0 auto", lineHeight: 1.6, fontWeight: 300 }}>
                            Estoque limitado. Pagamento parcelado em até 6× sem juros no boleto ou cartão.
                        </p>
                    </div>

                    <div className="pricing-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0 }}>
                        {([
                            {
                                name: "Convencional", tag: "Standard", price: "180", unit: "por dose",
                                includes: ["Dose convencional 0,25mL", "Genotipado e avaliado", "Coletado em Central Semex/MAPA", "Mín. 10 doses"],
                                featured: false,
                            },
                            {
                                name: "Sexado Macho", tag: "Sex 90%", price: "380", unit: "por dose",
                                includes: ["Sêmen sexado 90% machos", "Para acasalamentos terminais", "Coletado em Central Semex/MAPA", "Mín. 5 doses"],
                                featured: true,
                            },
                            {
                                name: "Lote Reprodutor", tag: "Programa", price: "14.500", unit: "100 doses",
                                includes: ["100 doses convencionais", "Suporte técnico Fórmula do Boi", "Acompanhamento de prenhez", "Logística inclusa"],
                                featured: false,
                            },
                        ]).map((p, i) => (
                            <div key={p.name} style={{
                                padding: "48px 36px",
                                background: p.featured ? "rgba(201,162,74,0.08)" : "transparent",
                                border: "1px solid var(--st-rule-2)",
                                borderLeftWidth: i === 0 ? 1 : 0,
                                position: "relative",
                                minHeight: 480,
                                display: "flex", flexDirection: "column",
                            }}>
                                {p.featured && (
                                    <div style={{
                                        position: "absolute", top: -1, left: 0, right: 0, height: 3,
                                        background: "linear-gradient(90deg, var(--st-gold-deep), var(--st-gold), var(--st-gold-deep))",
                                    }} />
                                )}
                                <Corners color={p.featured ? "var(--st-gold)" : "var(--st-rule-2)"} />

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
                                    <div>
                                        <div className="serif" style={{ fontSize: 28, color: "var(--st-bone)", fontStyle: "italic", marginBottom: 4 }}>{p.name}</div>
                                        <div className="mono" style={{ fontSize: 10, letterSpacing: "0.22em", color: "var(--st-gold-2)", textTransform: "uppercase" }}>{p.tag}</div>
                                    </div>
                                    {p.featured && (
                                        <div className="mono" style={{
                                            fontSize: 9, letterSpacing: "0.22em", color: "var(--st-gold)",
                                            textTransform: "uppercase", border: "1px solid var(--st-gold-deep)", padding: "5px 10px",
                                        }}>Mais procurado</div>
                                    )}
                                </div>

                                <div style={{ marginBottom: 32, paddingBottom: 28, borderBottom: "1px solid var(--st-rule-2)" }}>
                                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                                        <span className="mono" style={{ fontSize: 13, color: "var(--st-txt)" }}>R$</span>
                                        <span className="serif-tight" style={{ fontSize: "clamp(48px, 6vw, 84px)", color: "var(--st-bone)", fontWeight: 500, lineHeight: 1 }}>{p.price}</span>
                                    </div>
                                    <div className="mono" style={{ fontSize: 10, letterSpacing: "0.22em", color: "var(--st-gold-2)", textTransform: "uppercase", marginTop: 4 }}>{p.unit}</div>
                                </div>

                                <ul style={{ flex: 1, marginBottom: 28 }}>
                                    {p.includes.map((it) => (
                                        <li key={it} style={{ display: "grid", gridTemplateColumns: "14px 1fr", gap: 12, padding: "10px 0", alignItems: "start" }}>
                                            <span style={{ color: "var(--st-gold)", fontSize: 11, marginTop: 4 }}>✦</span>
                                            <span style={{ fontSize: 13, color: "var(--st-txt)", lineHeight: 1.5, fontWeight: 300 }}>{it}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link href={CHECKOUT_URL} className={p.featured ? "btn btn-green" : "btn btn-ghost-dark"} style={{
                                    width: "100%", justifyContent: "center",
                                }}>
                                    {p.featured ? "Reservar agora" : "Quero esta opção"} →
                                </Link>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        marginTop: 48, padding: 24, border: "1px solid var(--st-rule-2)",
                        display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 24, alignItems: "center",
                    }}>
                        <span style={{ fontSize: 22, color: "var(--st-gold)" }}>⚖</span>
                        <div>
                            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.22em", color: "var(--st-gold-2)", textTransform: "uppercase", marginBottom: 4, fontWeight: 600 }}>
                                Garantia Fórmula do Boi
                            </div>
                            <div style={{ fontSize: 13, color: "var(--st-txt)", lineHeight: 1.6, fontWeight: 300 }}>
                                Reposição em caso de baixa congelabilidade laudada por veterinário. Logística refrigerada
                                acompanhada por nosso time. Suporte direto com o criador.
                            </div>
                        </div>
                        <Link href={FICHA_URL} className="mono" style={{
                            fontSize: 11, letterSpacing: "0.18em", color: "var(--st-gold-2)",
                            textTransform: "uppercase", whiteSpace: "nowrap",
                        }}>Ficha técnica →</Link>
                    </div>
                </div>
            </section>

            {/* LIGHTBOX */}
            <div className={`lightbox ${lightboxOpen ? "active" : ""}`} onClick={(e) => { if (e.target === e.currentTarget) closeLightbox(); }}>
                <button className="lightbox-close" onClick={closeLightbox} aria-label="Fechar">×</button>
                <button className="lightbox-nav lightbox-prev" onClick={() => navigateLightbox(-1)} aria-label="Foto anterior">‹</button>
                <img src={galleryImages[lightboxIndex]} alt={`Foto ampliada ${lightboxIndex + 1}`} />
                <button className="lightbox-nav lightbox-next" onClick={() => navigateLightbox(1)} aria-label="Próxima foto">›</button>
            </div>

            {/* VIDEO MODAL */}
            <div className={`video-modal ${modalVideoSrc ? "active" : ""}`} onClick={(e) => { if (e.target === e.currentTarget) closeVideo(); }}>
                <div className="video-modal-inner">
                    <button className="video-modal-close" onClick={closeVideo} aria-label="Fechar vídeo">×</button>
                    {modalVideoSrc && <video src={modalVideoSrc} controls autoPlay playsInline />}
                </div>
            </div>
        </div>
    );
}

// === Video Section component ===
function VideoSection({
    title, color, videos, thumbs, onPlay,
}: {
    title: string;
    color: string;
    videos: { src: string; label: string }[];
    thumbs: string[];
    onPlay: (src: string) => void;
}) {
    return (
        <div style={{ textAlign: "left", marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                <h3 className="mono" style={{
                    fontSize: 13, letterSpacing: "0.22em", color: "var(--st-ink-soft)",
                    textTransform: "uppercase", fontWeight: 700,
                }}>{title}</h3>
            </div>
            <div className="thumb-row" style={{
                display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16,
            }}>
                {videos.map((v, i) => (
                    <VideoThumb key={v.src} videoSrc={v.src} label={v.label} poster={thumbs[i % thumbs.length]} accent={color} onPlay={onPlay} />
                ))}
            </div>
        </div>
    );
}

function VideoThumb({
    videoSrc, label, poster, accent, onPlay,
}: {
    videoSrc: string; label: string; poster: string; accent: string;
    onPlay: (src: string) => void;
}) {
    const ref = useRef<HTMLVideoElement>(null);
    const [hovering, setHovering] = useState(false);
    const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const onEnter = () => {
        hoverTimeout.current = setTimeout(() => {
            if (ref.current) {
                ref.current.currentTime = 0;
                ref.current.play().catch(() => {});
                setHovering(true);
            }
        }, 250);
    };
    const onLeave = () => {
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
        if (ref.current) {
            ref.current.pause();
            ref.current.currentTime = 0;
        }
        setHovering(false);
    };

    return (
        <div
            style={{
                aspectRatio: "4 / 3", position: "relative", overflow: "hidden",
                border: "1px solid rgba(138,106,38,0.2)", cursor: "pointer",
                background: `url("${poster}") center/cover no-repeat`,
            }}
            onClick={() => onPlay(videoSrc)}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
        >
            <video
                ref={ref}
                src={videoSrc}
                muted
                playsInline
                preload="none"
                style={{
                    position: "absolute", inset: 0, width: "100%", height: "100%",
                    objectFit: "cover", opacity: hovering ? 1 : 0, transition: "opacity 0.2s",
                }}
            />
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.15)" }} />
            <div style={{
                position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                width: 48, height: 48, borderRadius: "50%",
                background: "linear-gradient(180deg, var(--st-gold-2), var(--st-gold))",
                display: hovering ? "none" : "flex",
                alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--st-ink)"><path d="M8 5l11 7-11 7V5z" /></svg>
            </div>
            <div style={{
                position: "absolute", bottom: 8, left: 8, right: 8,
                padding: "5px 10px", background: "rgba(10,9,8,0.85)",
                fontFamily: "var(--st-mono)", fontSize: 10, color: "var(--st-bone)", letterSpacing: "0.12em",
                display: "flex", alignItems: "center", gap: 6,
            }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: accent }} />
                {label}
            </div>
        </div>
    );
}
