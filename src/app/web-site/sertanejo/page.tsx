"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { sertanejoCss } from "./sertanejoCss";

const URL_PREFIX = 'https://res.cloudinary.com/dkh2nsugb';
const galleryImages = [
    `${URL_PREFIX}/image/upload/v1774271579/sertanejo-01_bqpxlz.jpg`,
    `${URL_PREFIX}/image/upload/v1774271579/sertanejo-02_jjtpii.jpg`,
    `${URL_PREFIX}/image/upload/v1774271579/sertanejo-03_ufxuxb.jpg`,
    `${URL_PREFIX}/image/upload/v1774271580/sertanejo-04_a2avtq.jpg`,
    `${URL_PREFIX}/image/upload/v1774271579/sertanejo-05_ossjx0.jpg`,
    `${URL_PREFIX}/image/upload/v1774271579/sertanejo-06_j9zje5.jpg`
];

const touroVideos = [
    { src: `${URL_PREFIX}/video/upload/v1774271582/WhatsApp_Video_2026-03-21_at_12.21.06_tqodqe.mp4`, label: "Touro Sertanejo — Vídeo 1" },
    { src: `${URL_PREFIX}/video/upload/v1774271587/WhatsApp_Video_2026-03-21_at_12.21.08_zhdbrd.mp4`, label: "Touro Sertanejo — Vídeo 2" },
    { src: `${URL_PREFIX}/video/upload/v1774271582/WhatsApp_Video_2026-03-21_at_12.21.09_guttwd.mp4`, label: "Touro Sertanejo — Vídeo 3" },
    { src: `${URL_PREFIX}/video/upload/v1774271581/WhatsApp_Video_2026-03-21_at_12.21.10_yjekne.mp4`, label: "Touro Sertanejo — Vídeo 4" },
    { src: `${URL_PREFIX}/video/upload/v1774271583/WhatsApp_Video_2026-03-21_at_12.21.11_g5simf.mp4`, label: "Touro Sertanejo — Vídeo 5" },
];

const progenieMachosVideos = [
    { src: `${URL_PREFIX}/video/upload/v1774271585/WhatsApp_Video_2026-03-21_at_12.21.12_jaugxz.mp4`, label: "Progênie Macho — Vídeo 1", dotColor: "#4CAF50" },
    { src: `${URL_PREFIX}/video/upload/v1774284099/Progenie_Macho_1_gsawbw.mp4`, label: "Progênie Macho — Vídeo 2", dotColor: "#4CAF50" },
    { src: `${URL_PREFIX}/video/upload/v1774284178/Progenie_Macho_2_roevvo.mp4`, label: "Progênie Macho — Vídeo 3", dotColor: "#4CAF50" },
    { src: `${URL_PREFIX}/video/upload/v1774284179/Progenie_Macho_4_oqa6mh.mp4`, label: "Progênie Macho — Vídeo 4", dotColor: "#4CAF50" },
];

const progenieFemeasVideos = [
    { src: `${URL_PREFIX}/video/upload/v1774281612/Progenie_femea_terra_brava_1_bo8cfu.mp4`, label: "Progênie Fêmea — Vídeo 1", dotColor: "#E91E63" },
    { src: `${URL_PREFIX}/video/upload/v1774281614/Progenie_femea_terra_brava_2_oruwcg.mp4`, label: "Progênie Fêmea — Vídeo 2", dotColor: "#E91E63" },
    { src: `${URL_PREFIX}/video/upload/v1774281616/progenie_femea_terra_brava_3_eziifa.mp4`, label: "Progênie Fêmea — Vídeo 3", dotColor: "#E91E63" },
    { src: `${URL_PREFIX}/video/upload/v1774281619/Progenie_femea_terra_brava_4_ct83mc.mp4`, label: "Progênie Fêmea — Vídeo 4", dotColor: "#E91E63" },
    { src: `${URL_PREFIX}/video/upload/v1774281619/Progenie_femea_terra_brava_5_ocquo6.mp4`, label: "Progênie Fêmea — Vídeo 5", dotColor: "#E91E63" },
];

const CHECKOUT_URL = "/sertanejo/checkout";

export default function SertanejoLanding() {
    const [scrolled, setScrolled] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [photoIndex, setPhotoIndex] = useState(0);
    const photoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [modalVideoSrc, setModalVideoSrc] = useState<string | null>(null);
    const [introPlaying, setIntroPlaying] = useState(false);
    const introVideoRef = useRef<HTMLVideoElement>(null);

    const startPhotoAutoPlay = () => {
        if (photoIntervalRef.current) clearInterval(photoIntervalRef.current);
        photoIntervalRef.current = setInterval(() => {
            setPhotoIndex(prev => (prev + 1) % galleryImages.length);
        }, 3500);
    };

    const navigatePhoto = (dir: number) => {
        setPhotoIndex(prev => (prev + dir + galleryImages.length) % galleryImages.length);
        startPhotoAutoPlay();
    };

    useEffect(() => {
        startPhotoAutoPlay();
        return () => {
            if (photoIntervalRef.current) clearInterval(photoIntervalRef.current);
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        const link = document.createElement("link");
        link.href = "https://fonts.googleapis.com/icon?family=Material+Icons+Outlined";
        link.rel = "stylesheet";
        document.head.appendChild(link);
        return () => window.removeEventListener("scroll", handleScroll);
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

    const handleVideoModal = (src: string) => {
        setModalVideoSrc(src);
        document.body.style.overflow = "hidden";
    };

    const closeVideoModal = () => {
        setModalVideoSrc(null);
        document.body.style.overflow = "";
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightboxOpen) {
                if (e.key === "Escape") closeLightbox();
                if (e.key === "ArrowLeft") navigateLightbox(-1);
                if (e.key === "ArrowRight") navigateLightbox(1);
            }
            if (modalVideoSrc && e.key === "Escape") closeVideoModal();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [lightboxOpen, modalVideoSrc]);

    const VideoThumb = ({ videoItem }: { videoItem: any }) => {
        const vidRef = useRef<HTMLVideoElement>(null);
        const [isPlayingPreview, setIsPlayingPreview] = useState(false);
        let hoverTimeout: NodeJS.Timeout;

        const onMouseEnter = () => {
            hoverTimeout = setTimeout(() => {
                if (vidRef.current) {
                    vidRef.current.currentTime = 0;
                    vidRef.current.play().catch(() => { });
                    setIsPlayingPreview(true);
                }
            }, 300);
        };

        const onMouseLeave = () => {
            clearTimeout(hoverTimeout);
            if (vidRef.current) {
                vidRef.current.pause();
                vidRef.current.currentTime = 0;
                setIsPlayingPreview(false);
            }
        };

        return (
            <div className="video-card">
                <div
                    className="video-thumb"
                    onClick={() => handleVideoModal(videoItem.src)}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                >
                    <video ref={vidRef} preload="metadata" muted playsInline src={videoItem.src}></video>
                    <div className={`play-btn ${isPlayingPreview ? 'hidden' : ''}`}><span className="material-icons-outlined">play_arrow</span></div>
                </div>
                <div className="video-card-label">
                    <span className="cat-dot" style={{ background: videoItem.dotColor || 'var(--gold)' }}></span>
                    {videoItem.label}
                </div>
            </div>
        );
    };

    const VideoCarouselSection = ({ title, accentColor, videos }: { title: string, accentColor: string, videos: any[] }) => {
        const ref = useRef<HTMLDivElement>(null);
        const [canLeft, setCanLeft] = useState(false);
        const [canRight, setCanRight] = useState(true);
        const [dragging, setDragging] = useState(false);
        const [dragStartX, setDragStartX] = useState(0);
        const [dragScrollLeft, setDragScrollLeft] = useState(0);

        const handleScroll = () => {
            if (!ref.current) return;
            setCanLeft(ref.current.scrollLeft > 10);
            setCanRight(ref.current.scrollLeft < ref.current.scrollWidth - ref.current.clientWidth - 10);
        };

        const scroll = (amount: number) => ref.current?.scrollBy({ left: amount, behavior: "smooth" });

        const onMouseDown = (e: React.MouseEvent) => {
            if (!ref.current) return;
            setDragging(true);
            setDragStartX(e.pageX - ref.current.offsetLeft);
            setDragScrollLeft(ref.current.scrollLeft);
        };

        const onMouseLeave = () => setDragging(false);
        const onMouseUp = () => setDragging(false);
        const onMouseMove = (e: React.MouseEvent) => {
            if (!dragging || !ref.current) return;
            e.preventDefault();
            const x = e.pageX - ref.current.offsetLeft;
            ref.current.scrollLeft = dragScrollLeft - (x - dragStartX);
        };

        return (
            <div className="video-section-block">
                <h3 className="video-section-title">
                    <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: accentColor, marginRight: "10px", verticalAlign: "middle", flexShrink: 0 }}></span>
                    {title}
                </h3>
                <div className="video-carousel-outer">
                    <button
                        className={`carousel-arrow left ${!canLeft ? "disabled" : ""}`}
                        onClick={() => scroll(-372)}
                        aria-label="Vídeo anterior"
                    >
                        <span className="material-icons-outlined">chevron_left</span>
                    </button>
                    <div
                        className="video-carousel"
                        ref={ref}
                        onScroll={handleScroll}
                        onMouseDown={onMouseDown}
                        onMouseLeave={onMouseLeave}
                        onMouseUp={onMouseUp}
                        onMouseMove={onMouseMove}
                        style={{ cursor: dragging ? "grabbing" : "auto" }}
                    >
                        {videos.map((vid, idx) => (
                            <VideoThumb key={idx} videoItem={vid} />
                        ))}
                    </div>
                    <button
                        className={`carousel-arrow right ${!canRight ? "disabled" : ""}`}
                        onClick={() => scroll(372)}
                        aria-label="Próximo vídeo"
                    >
                        <span className="material-icons-outlined">chevron_right</span>
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="sertanejo-wrap">
            <style dangerouslySetInnerHTML={{ __html: sertanejoCss }} />
            <div className="top-bar">
                <div className="container top-bar-inner">
                    <img src="/assets/sertanejo/logo-icon.png" alt="Fórmula do Boi" style={{ height: "22px", width: "auto" }} />
                    <span>FÓRMULA DO BOI</span>
                    <span style={{ fontSize: "10px", letterSpacing: "2px", color: "rgba(197,160,89,0.5)", marginLeft: "4px" }}>ACELERADORA DE TOUROS</span>
                </div>
            </div>

            <header className={`header ${scrolled ? "scrolled" : ""}`} id="header">
                <div className="header-inner">
                    <Link href="/" className="header-logo" aria-label="Fórmula do Boi — Página inicial">
                        <img src="/assets/sertanejo/logo_header.svg" alt="Fórmula do Boi" />
                    </Link>
                    <Link href="/" className="header-back" aria-label="Voltar para o site">
                        <span className="material-icons-outlined" style={{ fontSize: "18px" }}>arrow_back</span>
                        Voltar ao site
                    </Link>
                </div>
            </header>

            {/* HERO */}
            <section className="hero" id="hero">
                <div className="container hero-inner">
                    <div className="hero-content">
                        <div className="badge">Aceleradora de Touros Fórmula do Boi</div>
                        <h1 className="hero-title-name">Sertanejo <span className="gold">da Terra Brava</span></h1>
                        <p className="hero-tagline">O touro que está <strong>transformando</strong> o rebanho brasileiro</p>
                        <p className="hero-subtitle">
                            Nelore PO, MGTe TOP 16%, iABCZ 11,37 (DECA 2).
                            Genética comprovada com excelentes avaliações em crescimento e carcaça.
                        </p>
                        <div className="hero-ctas">
                            <Link href={CHECKOUT_URL} className="btn-checkout" aria-label="Ver valor da dose">
                                <span className="material-icons-outlined" style={{ fontSize: "18px" }}>shopping_cart</span>
                                Ver Valor da Dose
                            </Link>
                            <Link href="/sertanejo/ficha-tecnica" className="btn-secondary" aria-label="Ver ficha técnica completa">
                                <span className="material-icons-outlined" style={{ fontSize: "18px" }}>description</span>
                                Ver Ficha Técnica
                            </Link>
                        </div>
                    </div>
                    <div className="hero-image">
                        <img src={galleryImages[3]} alt="Touro Sertanejo Terra Brava" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "16px" }} />
                    </div>
                </div>
            </section>

            {/* DESTAQUE GENÉTICO */}
            <div className="video-destaque" style={{ paddingTop: "80px", paddingBottom: "80px", borderBottom: "1px solid var(--border-light)" }}>
                <div className="video-destaque-inner" style={{ maxWidth: "1000px", gap: "64px", margin: "0 auto", alignItems: "center" }}>
                    <div className="video-destaque-player" style={{ maxWidth: "320px", width: "100%", margin: "0 auto" }} onClick={() => {
                        const video = introVideoRef.current;
                        if (video) {
                            if (video.paused) {
                                video.play();
                                setIntroPlaying(true);
                                video.controls = true;
                            } else {
                                video.pause();
                                setIntroPlaying(false);
                                video.controls = false;
                            }
                        }
                    }}>
                        <video ref={introVideoRef} src="https://res.cloudinary.com/dkh2nsugb/video/upload/v1774293296/intro_sertantejo_t6bxhk.mp4" playsInline preload="metadata"></video>
                        <button className={`video-destaque-play ${introPlaying ? 'hidden' : ''}`}>
                            <span className="material-icons-outlined">play_arrow</span>
                        </button>
                    </div>
                    <div className="video-destaque-text" style={{ paddingRight: "16px" }}>
                        <span className="video-destaque-badge" style={{ color: "#141413" }}>Destaque Genético</span>
                        <h2 style={{ fontSize: "36px", lineHeight: "1.2", marginBottom: "24px" }}>O Fenômeno Está <span className="gold">de Volta</span></h2>
                        <p style={{ fontSize: "16px", lineHeight: "1.8", color: "rgba(255,255,255,0.85)", marginBottom: "24px" }}>Sertanejo é a personificação da eficiência produtiva e qualidade racial. Com produção amplamente comprovada no campo, o reprodutor retorna à central Semex para atender à alta demanda de criadores que buscam padronização e carcaça moderna.</p>
                        <ul style={{ marginBottom: "32px" }}>
                            <li style={{ fontSize: "15px", lineHeight: "1.8", marginBottom: "12px", color: "rgba(255,255,255,0.85)" }}><strong style={{ color: "#fff" }}>Genética de Elite:</strong> Irmão próprio da renomada doadora 2321 — matriz de ícones como Rolex e Qatar Terra Brava.</li>
                            <li style={{ fontSize: "15px", lineHeight: "1.8", marginBottom: "12px", color: "rgba(255,255,255,0.85)" }}><strong style={{ color: "#fff" }}>Performance Reprodutiva:</strong> Índices de prenhez acima da média, garantindo rentabilidade no manejo.</li>
                            <li style={{ fontSize: "15px", lineHeight: "1.8", marginBottom: "12px", color: "rgba(255,255,255,0.85)" }}><strong style={{ color: "#fff" }}>Atributos Físicos:</strong> Volume muscular excepcional no posterior, carcaça profunda e padrão racial impecável transmitido com alta fidelidade à progênie.</li>
                        </ul>
                        <p style={{ fontStyle: "italic", fontWeight: "bold", color: "var(--gold)", fontSize: "18px" }}>&quot;Sertanejo Terra Brava: aí é máquina!&quot;</p>
                    </div>
                </div>
            </div>

            {/* MIDIA */}
            <section className="media-section section-padding" id="midia">
                <div className="container">
                    <div className="section-header">
                        <div className="badge" style={{ marginBottom: "16px" }}>Galeria</div>
                        <h2>Conheça o <span className="gold">Sertanejo</span></h2>
                        <p>Fotos e vídeos do Sertanejo Terra Brava — Nelore PO, registro EPCF 2315</p>
                    </div>

                    {/* PHOTO CAROUSEL */}
                    <div className="photo-carousel-outer">
                        <button className="carousel-arrow left" onClick={() => navigatePhoto(-1)} aria-label="Foto anterior">
                            <span className="material-icons-outlined">chevron_left</span>
                        </button>
                        <div className="photo-carousel-viewport">
                            <div
                                className="photo-carousel-track"
                                style={{ transform: `translateX(-${photoIndex * 100}%)` }}
                            >
                                {galleryImages.map((src, i) => (
                                    <div key={i} className="photo-carousel-slide" onClick={() => openLightbox(i)} role="button">
                                        <img src={src} alt={`Touro Sertanejo — Foto ${i + 1}`} loading="lazy" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button className="carousel-arrow right" onClick={() => navigatePhoto(1)} aria-label="Próxima foto">
                            <span className="material-icons-outlined">chevron_right</span>
                        </button>
                        <div className="photo-carousel-dots">
                            {galleryImages.map((_, i) => (
                                <button
                                    key={i}
                                    className={`photo-dot ${i === photoIndex ? 'active' : ''}`}
                                    onClick={() => { setPhotoIndex(i); startPhotoAutoPlay(); }}
                                    aria-label={`Ir para foto ${i + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* VIDEO SECTIONS */}
                    <div className="section-header" style={{ marginTop: "64px", marginBottom: "40px" }}>
                        <h2>Vídeos do <span className="gold">Sertanejo</span></h2>
                    </div>

                    <VideoCarouselSection
                        title="Vídeos do Touro"
                        accentColor="var(--gold)"
                        videos={touroVideos}
                    />
                    <VideoCarouselSection
                        title="Vídeos de Progênie Macho"
                        accentColor="#4CAF50"
                        videos={progenieMachosVideos}
                    />
                    <VideoCarouselSection
                        title="Vídeos de Progênie Fêmea"
                        accentColor="#E91E63"
                        videos={progenieFemeasVideos}
                    />

                    {/* CTA APÓS VÍDEOS */}
                    <div style={{ textAlign: "center", marginTop: "48px" }}>
                        <Link href={CHECKOUT_URL} className="btn-checkout">
                            <span className="material-icons-outlined" style={{ fontSize: "18px" }}>shopping_cart</span>
                            Ver Valor da Dose
                        </Link>
                    </div>
                </div>
            </section>

            {/* DIFERENCIAIS */}
            <section className="diferenciais section-padding" id="diferenciais">
                <div className="container">
                    <div className="section-header">
                        <div className="badge" style={{ marginBottom: "16px" }}>Diferenciais</div>
                        <h2>Por que escolher o <span className="gold">Sertanejo?</span></h2>
                        <p>Resultados comprovados em avaliações genéticas oficiais ANCP e PMGZ/ABCZ</p>
                    </div>
                    <div className="diff-grid">
                        <div className="diff-card">
                            <div className="diff-icon"><span className="material-icons-outlined">trending_up</span></div>
                            <h3>MGTe TOP 16%</h3>
                            <p>Mérito Genético Total Econômico de 20.81 pontos com acurácia de 84% — elite da raça Nelore.</p>
                        </div>
                        <div className="diff-card">
                            <div className="diff-icon"><span className="material-icons-outlined">fitness_center</span></div>
                            <h3>Crescimento Superior</h3>
                            <p>DEP de Peso aos 450 dias de +21,07 kg (TOP 15%) e Peso Sobreano de +8,93 kg (DECA 3 PMGZ).</p>
                        </div>
                        <div className="diff-card">
                            <div className="diff-icon"><span className="material-icons-outlined">restaurant</span></div>
                            <h3>Carcaça de Elite</h3>
                            <p>AOL de 1,81 cm² (TOP 7%), acabamento de gordura +4,47mm e marmoreio TOP 0,1%.</p>
                        </div>
                        <div className="diff-card">
                            <div className="diff-icon"><span className="material-icons-outlined">verified</span></div>
                            <h3>Central Semex</h3>
                            <p>Coletado na Central Semex com aprovação MAPA. Genotipado e com avaliação genômica completa.</p>
                        </div>
                    </div>

                    {/* CTA APÓS DIFERENCIAIS */}
                    <div className="diferenciais-ctas">
                        <Link href={CHECKOUT_URL} className="btn-checkout">
                            <span className="material-icons-outlined" style={{ fontSize: "18px" }}>shopping_cart</span>
                            Ver Valor da Dose
                        </Link>
                        <Link href="/sertanejo/ficha-tecnica" className="btn-secondary">
                            <span className="material-icons-outlined" style={{ fontSize: "18px" }}>description</span>
                            Ficha Técnica Oficial
                        </Link>
                    </div>
                </div>
            </section>

            <footer className="footer">
                <div className="container footer-inner">
                    <div className="footer-logo">
                        <img src="/assets/sertanejo/logo-icon.png" alt="Fórmula do Boi" style={{ height: "24px", width: "auto", filter: "brightness(1.2)" }} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ color: "rgba(255,255,255,0.5)" }}>FÓRMULA DO BOI &copy; 2026</span>
                            <span style={{ color: "rgba(197,160,89,0.4)", fontSize: "10px", letterSpacing: "1.5px" }}>ACELERADORA DE TOUROS</span>
                        </div>
                    </div>
                </div>
            </footer>

            <div className="bottom-bar">
                <div className="container bottom-bar-inner">
                    <img src="/assets/sertanejo/logo-icon.png" alt="Fórmula do Boi" style={{ height: "16px", width: "auto" }} />
                    <span>formuladoboi.com</span>
                </div>
            </div>

            {/* LIGHTBOX */}
            <div className={`lightbox ${lightboxOpen ? "active" : ""}`} onClick={(e) => { if (e.target === e.currentTarget) closeLightbox(); }}>
                <button className="lightbox-close" onClick={closeLightbox}>&times;</button>
                <button className="lightbox-nav lightbox-prev" onClick={() => navigateLightbox(-1)}>&#8249;</button>
                <img id="lightbox-img" src={galleryImages[lightboxIndex]} alt="Foto ampliada" />
                <button className="lightbox-nav lightbox-next" onClick={() => navigateLightbox(1)}>&#8250;</button>
            </div>

            {/* VIDEO MODAL */}
            <div className={`video-modal ${modalVideoSrc ? "active" : ""}`} onClick={(e) => { if (e.target === e.currentTarget) closeVideoModal(); }}>
                <div className="video-modal-inner">
                    <button className="video-modal-close" onClick={closeVideoModal}>&times;</button>
                    {modalVideoSrc && <video id="modalVideo" src={modalVideoSrc} controls autoPlay playsInline></video>}
                </div>
            </div>
        </div>
    );
}
