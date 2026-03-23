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

const videosData = [
    { cat: "touro", src: `${URL_PREFIX}/video/upload/v1774271582/WhatsApp_Video_2026-03-21_at_12.21.06_tqodqe.mp4`, label: "Touro Sertanejo — Vídeo 1" },
    { cat: "touro", src: `${URL_PREFIX}/video/upload/v1774271587/WhatsApp_Video_2026-03-21_at_12.21.08_zhdbrd.mp4`, label: "Touro Sertanejo — Vídeo 2" },
    { cat: "touro", src: `${URL_PREFIX}/video/upload/v1774271582/WhatsApp_Video_2026-03-21_at_12.21.09_guttwd.mp4`, label: "Touro Sertanejo — Vídeo 3" },
    { cat: "touro", src: `${URL_PREFIX}/video/upload/v1774271581/WhatsApp_Video_2026-03-21_at_12.21.10_yjekne.mp4`, label: "Touro Sertanejo — Vídeo 4" },
    { cat: "touro", src: `${URL_PREFIX}/video/upload/v1774271583/WhatsApp_Video_2026-03-21_at_12.21.11_g5simf.mp4`, label: "Touro Sertanejo — Vídeo 5" },
    { cat: "progenie-machos", src: `${URL_PREFIX}/video/upload/v1774271585/WhatsApp_Video_2026-03-21_at_12.21.12_jaugxz.mp4`, label: "Progênie Macho — Vídeo 1", dotColor: "#4CAF50" },
];

export default function SertanejoLanding() {
    const [scrolled, setScrolled] = useState(false);
    
    // Lightbox State
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Video Carousel State
    const [activeVideoCat, setActiveVideoCat] = useState("todos");
    const carouselRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    // Video Modal State
    const [modalVideoSrc, setModalVideoSrc] = useState<string | null>(null);

    // Drag-to-scroll state
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    // Filter videos manually here instead of display: none
    const filteredVideos = videosData.filter(v => activeVideoCat === "todos" || v.cat === activeVideoCat);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);

        const link = document.createElement("link");
        link.href = "https://fonts.googleapis.com/icon?family=Material+Icons+Outlined";
        link.rel = "stylesheet";
        document.head.appendChild(link);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const handleCarouselScroll = () => {
        if (!carouselRef.current) return;
        setCanScrollLeft(carouselRef.current.scrollLeft > 10);
        setCanScrollRight(
            carouselRef.current.scrollLeft < carouselRef.current.scrollWidth - carouselRef.current.clientWidth - 10
        );
    };

    const scrollCarousel = (amount: number) => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: amount, behavior: "smooth" });
        }
    };

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

    // Handle Drag to scroll
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!carouselRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - carouselRef.current.offsetLeft);
        setScrollLeft(carouselRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !carouselRef.current) return;
        e.preventDefault();
        const x = e.pageX - carouselRef.current.offsetLeft;
        const walk = (x - startX); 
        carouselRef.current.scrollLeft = scrollLeft - walk;
    };

    const VideoThumb = ({ videoItem }: { videoItem: any }) => {
        const vidRef = useRef<HTMLVideoElement>(null);
        const [isPlayingPreview, setIsPlayingPreview] = useState(false);
        let hoverTimeout: NodeJS.Timeout;

        const onMouseEnter = () => {
            hoverTimeout = setTimeout(() => {
                if (vidRef.current) {
                    vidRef.current.currentTime = 0;
                    vidRef.current.play().catch(() => {});
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
                    <Link href="/semen" className="header-back" aria-label="Voltar para Sêmen">
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
                        <h1>O touro que está <span className="gold">transformando</span> o rebanho brasileiro</h1>
                        <p className="hero-subtitle">
                            Sertanejo Terra Brava — Nelore PO, MGTe TOP 16%, iABCZ 11,37 (DECA 2).
                            Genética comprovada com excelentes avaliações em crescimento e carcaça.
                        </p>
                        <div className="hero-ctas">
                            <Link href="/sertanejo/checkout" className="btn-checkout" aria-label="Reservar doses de sêmen">
                                <span className="material-icons-outlined" style={{ fontSize: "18px" }}>shopping_cart</span>
                                Ver Detalhes e Propor
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

            {/* MIDIA */}
            <section className="media-section section-padding" id="midia">
                <div className="container">
                    <div className="section-header">
                        <div className="badge" style={{ marginBottom: "16px" }}>Galeria</div>
                        <h2>Conheça o <span className="gold">Sertanejo</span></h2>
                        <p>Fotos e vídeos do Sertanejo Terra Brava — Nelore PO, registro EPCF 2315</p>
                    </div>

                    <div className="gallery-grid">
                        {galleryImages.map((src, i) => (
                            <div key={i} className="gallery-item" onClick={() => openLightbox(i)} role="button">
                                <img src={src} alt="Touro Sertanejo" loading="lazy" />
                            </div>
                        ))}
                    </div>

                    <div className="section-header" style={{ marginTop: "48px" }}>
                        <h2>Vídeos do <span className="gold">Sertanejo</span></h2>
                        <p>Arraste para o lado para ver mais vídeos</p>
                    </div>

                    <div className="video-categories">
                        {["todos", "touro", "progenie-machos", "progenie-femeas"].map(cat => (
                            <button
                                key={cat}
                                className={`video-cat-btn ${activeVideoCat === cat ? "active" : ""}`}
                                onClick={() => {
                                    setActiveVideoCat(cat);
                                    setTimeout(() => handleCarouselScroll(), 100);
                                }}
                            >
                                {cat === "progenie-machos" ? "Progênie Machos" : cat === "progenie-femeas" ? "Progênie Fêmeas" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="video-carousel-outer">
                        <button 
                            className={`carousel-arrow left ${!canScrollLeft ? "disabled" : ""}`} 
                            onClick={() => scrollCarousel(-372)}
                        >
                            <span className="material-icons-outlined">chevron_left</span>
                        </button>
                        <div 
                            className="video-carousel" 
                            id="videoCarousel" 
                            ref={carouselRef} 
                            onScroll={handleCarouselScroll}
                            onMouseDown={handleMouseDown}
                            onMouseLeave={handleMouseLeave}
                            onMouseUp={handleMouseUp}
                            onMouseMove={handleMouseMove}
                            style={{ cursor: isDragging ? 'grabbing' : 'auto' }}
                        >
                            {filteredVideos.map((vid, idx) => (
                                <VideoThumb key={idx} videoItem={vid} />
                            ))}
                        </div>
                        <button 
                            className={`carousel-arrow right ${!canScrollRight ? "disabled" : ""}`} 
                            onClick={() => scrollCarousel(372)}
                        >
                            <span className="material-icons-outlined">chevron_right</span>
                        </button>
                    </div>

                    <div style={{ textAlign: "center", marginTop: "48px" }}>
                        <Link href="/sertanejo/checkout" className="btn-checkout">
                            <span className="material-icons-outlined" style={{ fontSize: "18px" }}>shopping_cart</span>
                            Reservar Doses Agora
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
