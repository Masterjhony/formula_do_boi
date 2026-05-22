"use client";

import { useState, useRef } from "react";
import Link from "next/link";

const BRONZE = "#A0792E";
const BRONZE_LIGHT = "#D4A85C";
const INK = "#161616";
const FG = "#F5F0E4";

interface ProductProps {
    id: number;
    image: string;
    name: string;
    category: string;
    location: string;
    installments: string;
    price: string;
    tag?: string;
    forma_pagamento?: string;
    downPaymentValue?: string;
    customLink?: string;
    video_object_position?: string;
    iabcz?: string;
    mgte?: string;
    iqg?: string;
    special_price?: boolean;
    gallery?: string[];
    details?: {
        registro?: string;
        raca?: string;
        nascimento?: string;
        pai?: string;
        mae?: string;
        peso?: string;
        comentario?: string;
        mgte?: string;
        iabcz?: string;
        iqg?: string;
        status?: string;
        reproductive_status?: string;
        tipo?: string;
        breeder?: string;
        proprietario?: string;
        pdf?: string;
        customLink?: string;
    };
}

interface PremiumCatalogCardProps {
    product: ProductProps;
    isAuthenticated?: boolean;
}

function normalize(str?: string) {
    return (str || "").trim();
}

function getBadgeLabel(product: ProductProps): string | null {
    const explicit = normalize(product.tag);
    if (explicit && explicit.toLowerCase() !== "vendido") return explicit.toUpperCase();
    const registro = normalize(product.details?.registro);
    if (registro) return registro.toUpperCase();
    return null;
}

function getCruzamento(product: ProductProps): string | null {
    const pai = normalize(product.details?.pai);
    if (pai) return pai.toUpperCase();
    return null;
}

function getTipoLabel(product: ProductProps, isSemen: boolean, isEmbryo: boolean): string {
    if (isSemen) return "1 DOSE";
    if (isEmbryo) {
        const detalhe = normalize(product.details?.tipo);
        if (detalhe && detalhe.toLowerCase() !== "embriao") return detalhe.toUpperCase();
        return "EMBRIÃO VIT";
    }
    return normalize(product.category).toUpperCase();
}

function formatBRL(raw: string): string {
    const safe = normalize(raw);
    if (!safe || safe === "null" || safe === "Consultar" || safe === "Sob Consulta") return "Sob consulta";
    return `R$ ${safe}`;
}

export default function PremiumCatalogCard({ product, isAuthenticated = true }: PremiumCatalogCardProps) {
    const animalCode = `FB-PO-${product.id.toString().padStart(3, "0")}`;
    const isSemen = product.category === "Sêmen";
    const isEmbryo = product.category?.includes("Embrião") || product.details?.tipo === "embriao" || product.category === "DOADORA";

    let displayTitle = product.name;
    if (isSemen || isEmbryo) {
        displayTitle = displayTitle
            .replace(/^S[êe]men(\s+de)?\s+/i, "")
            .replace(/^S[EÊ]MEN\s+-\s+/i, "")
            .replace(/^Embri[ãa]o(\s+de)?\s+/i, "")
            .replace(/^Dose(\s+de)?\s+/i, "")
            .replace(/^Lote(\s+de)?\s+/i, "")
            .trim();
    }

    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handleMouseEnter = () => {
        if (videoRef.current) {
            const p = videoRef.current.play();
            if (p !== undefined) p.catch(() => {});
            setIsPlaying(true);
        }
    };
    const handleMouseLeave = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            setIsPlaying(false);
        }
    };

    const badge = getBadgeLabel(product) || animalCode;
    const cruzamento = getCruzamento(product);
    const tipoLabel = getTipoLabel(product, isSemen, isEmbryo);

    const iabcz = product.iabcz || product.details?.iabcz;
    const iqg = product.iqg || product.details?.iqg;
    const mgte = product.mgte || product.details?.mgte;
    const hasMetrics = !!(iabcz || iqg || mgte);

    const isAvista =
        product.installments?.toLowerCase() === "à vista" ||
        product.installments?.toLowerCase() === "a vista" ||
        product.forma_pagamento === "a_vista";

    const isSertanejo = isSemen && /sertanejo/i.test(product.name);

    const sold = product.tag === "Vendido" || product.details?.status === "Vendido";

    const targetHref = product.customLink || product.details?.customLink || `/lote/${product.id}`;

    let priceNode: React.ReactNode = null;
    if (!isAuthenticated) {
        priceNode = (
            <span
                className="font-display"
                style={{ fontSize: 18, fontWeight: 500, color: BRONZE_LIGHT, letterSpacing: "-0.015em" }}
            >
                Cadastre-se
            </span>
        );
    } else if (isSertanejo) {
        priceNode = (
            <span
                className="font-display"
                style={{ fontSize: 22, fontWeight: 500, color: BRONZE_LIGHT, letterSpacing: "-0.015em" }}
            >
                R$ 24,50<span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 500, marginLeft: 4, color: "rgba(245,240,228,0.55)" }}>/dose</span>
            </span>
        );
    } else if (isAvista || isSemen) {
        priceNode = (
            <span
                className="font-display"
                style={{ fontSize: 22, fontWeight: 500, color: BRONZE_LIGHT, letterSpacing: "-0.015em" }}
            >
                {formatBRL(product.price)}
            </span>
        );
    } else {
        const matchX = product.installments?.match(/^(\d+)\s*[xX]$/);
        if (matchX && product.price && product.price !== "Consultar") {
            priceNode = (
                <span
                    className="font-display"
                    style={{ fontSize: 22, fontWeight: 500, color: BRONZE_LIGHT, letterSpacing: "-0.015em" }}
                >
                    {formatBRL(product.price)}
                </span>
            );
        } else if (product.installments && product.installments !== "Consultar") {
            const multiplier = product.forma_pagamento?.match(/(\d+)x/i)?.[1] || "30";
            priceNode = (
                <span
                    className="font-display"
                    style={{ fontSize: 18, fontWeight: 500, color: BRONZE_LIGHT, letterSpacing: "-0.015em" }}
                >
                    {multiplier}× R$ {product.installments}
                </span>
            );
        } else {
            priceNode = (
                <span
                    className="font-display"
                    style={{ fontSize: 20, fontWeight: 500, color: BRONZE_LIGHT, letterSpacing: "-0.015em" }}
                >
                    Sob consulta
                </span>
            );
        }
    }

    const isVideo = product.image?.endsWith(".mp4");
    const isYouTube = product.image?.includes("youtube.com") || product.image?.includes("youtu.be");

    return (
        <Link
            href={targetHref}
            className="group block h-full"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <article
                className="card-engraved overflow-hidden h-full flex flex-col"
                style={{
                    background: INK,
                    border: "1px solid rgba(212,168,92,0.20)",
                    transition: "border-color 200ms ease, transform 200ms ease, box-shadow 200ms ease",
                }}
            >
                {/* Image */}
                <div
                    className="relative overflow-hidden"
                    style={{
                        aspectRatio: "16/9",
                        background: `linear-gradient(135deg, ${INK} 0%, #1F1A0E 100%)`,
                        borderBottom: "1px solid rgba(212,168,92,0.18)",
                    }}
                >
                    {isVideo ? (
                        <>
                            {(() => {
                                const galleryPoster = product.gallery?.find(
                                    (g) => typeof g === "string" && !g.toLowerCase().endsWith(".mp4")
                                );
                                const poster = galleryPoster || product.image.replace(".mp4", ".jpg");
                                const videoSrc = `${product.image}#t=0.1`;
                                return (
                                    <video
                                        ref={videoRef}
                                        src={videoSrc}
                                        poster={poster}
                                        muted
                                        loop
                                        playsInline
                                        preload="metadata"
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                        style={{ objectPosition: product.video_object_position || "center center" }}
                                    />
                                );
                            })()}
                            <div
                                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isPlaying ? "opacity-0" : "opacity-100"}`}
                            >
                                <div
                                    className="rounded-full p-3"
                                    style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(212,168,92,0.40)", backdropFilter: "blur(4px)" }}
                                >
                                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill={BRONZE_LIGHT}>
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </div>
                        </>
                    ) : isYouTube ? (
                        <img
                            src={`https://img.youtube.com/vi/${product.image.includes("v=") ? product.image.split("v=")[1].split("&")[0] : product.image.split("/").pop()}/hqdefault.jpg`}
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            style={{ objectPosition: product.video_object_position || "center center" }}
                        />
                    ) : product.image ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            style={{ objectPosition: product.video_object_position || "center center" }}
                        />
                    ) : null}

                    {/* Top-left badge */}
                    {badge && (
                        <span
                            style={{
                                position: "absolute",
                                top: 12,
                                left: 12,
                                fontFamily: "var(--font-mono)",
                                fontSize: 10,
                                letterSpacing: "0.18em",
                                textTransform: "uppercase",
                                color: INK,
                                background: BRONZE,
                                padding: "4px 8px",
                                fontWeight: 600,
                            }}
                        >
                            {badge}
                        </span>
                    )}

                    {sold && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                            <div
                                className="w-full py-3 text-center transform -rotate-12 shadow-lg"
                                style={{
                                    background: "rgba(160,121,46,0.92)",
                                    borderTop: "1px solid rgba(245,240,228,0.20)",
                                    borderBottom: "1px solid rgba(245,240,228,0.20)",
                                    backdropFilter: "blur(4px)",
                                }}
                            >
                                <span className="font-display" style={{ fontSize: 22, fontWeight: 600, color: INK, letterSpacing: "0.18em" }}>
                                    VENDIDO
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Body */}
                <div className="p-5 flex flex-col flex-1">
                    <div
                        className="font-display mb-1"
                        style={{
                            fontSize: 20,
                            fontWeight: 500,
                            color: FG,
                            letterSpacing: "-0.015em",
                            lineHeight: 1.15,
                        }}
                        title={displayTitle}
                    >
                        {displayTitle}
                    </div>

                    <div
                        style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            letterSpacing: "0.16em",
                            textTransform: "uppercase",
                            color: "rgba(245,240,228,0.55)",
                            marginBottom: 14,
                            minHeight: 14,
                        }}
                    >
                        {cruzamento ? `× ${cruzamento}` : product.location}
                    </div>

                    {isAuthenticated && hasMetrics && (
                        <div className="grid grid-cols-3 gap-2 mb-5">
                            {[
                                { l: "iABCZ", v: iabcz },
                                { l: "IQG", v: iqg },
                                { l: "MGTe", v: mgte },
                            ].map((m) =>
                                m.v ? (
                                    <div key={m.l}>
                                        <div
                                            style={{
                                                fontFamily: "var(--font-mono)",
                                                fontSize: 9.5,
                                                letterSpacing: "0.20em",
                                                textTransform: "uppercase",
                                                color: BRONZE_LIGHT,
                                                marginBottom: 3,
                                            }}
                                        >
                                            {m.l}
                                        </div>
                                        <div
                                            className="font-display"
                                            style={{
                                                fontSize: 18,
                                                fontWeight: 500,
                                                color: FG,
                                                lineHeight: 1,
                                            }}
                                        >
                                            {m.v}
                                        </div>
                                    </div>
                                ) : (
                                    <div key={m.l} />
                                )
                            )}
                        </div>
                    )}

                    {/* Price + CTA */}
                    <div
                        className="flex items-baseline justify-between mt-auto"
                        style={{
                            paddingTop: 14,
                            borderTop: "1px solid rgba(212,168,92,0.16)",
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: 10,
                                    letterSpacing: "0.18em",
                                    textTransform: "uppercase",
                                    color: "rgba(245,240,228,0.50)",
                                }}
                            >
                                {tipoLabel}
                            </div>
                            {priceNode}
                        </div>
                        <span
                            style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 10,
                                letterSpacing: "0.16em",
                                textTransform: "uppercase",
                                color: BRONZE_LIGHT,
                            }}
                        >
                            Ver ficha →
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
}
