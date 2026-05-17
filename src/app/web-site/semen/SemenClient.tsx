"use client";

import { useState, useMemo, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CatalogGrid from "@/components/CatalogGrid";
import { useRouter } from "next/navigation";
import { SettingsService } from "@/services/settingsService";

const BRONZE = "#A0792E";
const BRONZE_LIGHT = "#D4A85C";
const INK = "#0A0A0A";
const INK_2 = "#141414";
const FG = "#F5F0E4";

export default function SemenClient({ products }: { products: any[] }) {
    const router = useRouter();
    const [pageVisible, setPageVisible] = useState(false);

    useEffect(() => {
        async function checkVisibility() {
            try {
                const isEnabled = await SettingsService.getSetting("semen_page_enabled");
                if (isEnabled === false) {
                    router.push("/");
                    return;
                }
                setPageVisible(true);
            } catch (error) {
                console.error("Failed to load settings", error);
                setPageVisible(true);
            }
        }
        checkVisibility();
    }, [router]);

    const filteredProducts = useMemo(
        () => products.filter((item) => item.category === "Sêmen"),
        [products]
    );

    const reprodutoresCount = filteredProducts.length || 11;

    if (!pageVisible) return null;

    return (
        <main className="min-h-screen" style={{ background: INK }}>
            <Header />

            {/* HERO ─────────────────────────────────────── */}
            <section
                className="relative overflow-hidden"
                style={{ background: INK, borderBottom: "1px solid rgba(212,168,92,0.18)" }}
            >
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background:
                            "radial-gradient(ellipse at 50% 0%, rgba(212,168,92,0.16) 0%, transparent 60%)",
                    }}
                />
                <div
                    className="absolute inset-0 pointer-events-none opacity-50"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at 1px 1px, rgba(232,203,133,0.10) 1px, transparent 0)",
                        backgroundSize: "32px 32px",
                        maskImage: "radial-gradient(ellipse at top, black 0%, transparent 70%)",
                    }}
                />
                <div className="container mx-auto px-4 pt-20 pb-14 relative text-center" style={{ maxWidth: 1200 }}>
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
                        <span style={{ width: 6, height: 6, background: BRONZE, borderRadius: "50%" }} />
                        Marketplace · Sêmen · Aceleradora de Touros
                    </div>

                    <h1
                        className="font-display mx-auto"
                        style={{
                            fontSize: "clamp(40px, 7vw, 88px)",
                            fontWeight: 500,
                            lineHeight: 0.98,
                            letterSpacing: "-0.03em",
                            color: FG,
                            marginBottom: 22,
                            maxWidth: "18ch",
                        }}
                    >
                        Aceleradora <span style={{ color: BRONZE_LIGHT }}>de Touros.</span>
                    </h1>

                    <p
                        className="mx-auto"
                        style={{
                            color: "rgba(245,240,228,0.78)",
                            fontSize: 18,
                            lineHeight: 1.55,
                            maxWidth: "62ch",
                            letterSpacing: "-0.005em",
                        }}
                    >
                        Plantel ultrarreservado com {reprodutoresCount} reprodutores selecionados
                        a dedo, representando o absoluto ápice da genética provada nacional —
                        para elevar o teto produtivo do seu rebanho com segurança real no resultado.
                    </p>

                    {/* Stats strip */}
                    <div
                        className="mt-12 mx-auto grid grid-cols-3 gap-0"
                        style={{
                            maxWidth: 760,
                            border: "1px solid rgba(212,168,92,0.22)",
                            borderRadius: 4,
                            overflow: "hidden",
                            background: INK_2,
                        }}
                    >
                        <HeroStat label="Reprodutores" value={String(reprodutoresCount)} />
                        <HeroStat label="Plantel" value="Ultra-reservado" divider />
                        <HeroStat label="Genética" value="Provada" divider />
                    </div>
                </div>
            </section>

            {/* PARCERIA CENTRAL BELA VISTA ──────────────── */}
            <section
                style={{
                    background: INK_2,
                    borderBottom: "1px solid rgba(212,168,92,0.10)",
                }}
            >
                <div className="container mx-auto px-4 py-14 md:py-20" style={{ maxWidth: 1280 }}>
                    <div className="grid md:grid-cols-[0.9fr_1.1fr] gap-10 md:gap-14 items-start">
                        {/* Coluna esquerda — label, headline, parágrafo */}
                        <div>
                            <div
                                className="inline-flex items-center gap-3 mb-4"
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: 11,
                                    letterSpacing: "0.22em",
                                    textTransform: "uppercase",
                                    color: BRONZE_LIGHT,
                                    fontWeight: 500,
                                }}
                            >
                                <span style={{ width: 24, height: 1, background: BRONZE }} />
                                01 · Parceria oficial
                            </div>
                            <h2
                                className="font-display"
                                style={{
                                    fontSize: "clamp(28px, 4vw, 48px)",
                                    fontWeight: 500,
                                    color: FG,
                                    letterSpacing: "-0.02em",
                                    marginBottom: 18,
                                    maxWidth: "20ch",
                                }}
                            >
                                Coleta e logística pela <span style={{ color: BRONZE_LIGHT }}>Central Bela Vista</span>.
                            </h2>
                            <p
                                style={{
                                    color: "rgba(245,240,228,0.72)",
                                    fontSize: 16,
                                    lineHeight: 1.6,
                                    marginBottom: 18,
                                    maxWidth: "52ch",
                                }}
                            >
                                Nossos reprodutores ficam sob coleta contínua na Central Bela Vista,
                                referência nacional em armazenamento de sêmen sob o mais rigoroso
                                controle de qualidade mundial.
                            </p>
                            <p
                                style={{
                                    color: "rgba(245,240,228,0.62)",
                                    fontSize: 15,
                                    lineHeight: 1.6,
                                    maxWidth: "52ch",
                                }}
                            >
                                Logística de envio direto para todo o território nacional, com
                                rastreabilidade de lote e termo de garantia em cada despacho.
                            </p>
                        </div>

                        {/* Coluna direita — três pilares numerados */}
                        <div
                            className="card-engraved"
                            style={{
                                background: INK,
                                border: "1px solid rgba(212,168,92,0.22)",
                                overflow: "hidden",
                            }}
                        >
                            <PilarRow
                                index="I"
                                title="Controle de qualidade mundial"
                                text="Sêmen processado e armazenado nos padrões internacionais aplicados pela Bela Vista — concentração, motilidade e morfologia auditadas a cada coleta."
                            />
                            <PilarRow
                                index="II"
                                title="Logística nacional"
                                text="Envio direto, com botijão dedicado, para qualquer município do Brasil. Acompanhamento de tracking e suporte técnico até a chegada."
                                divider
                            />
                            <PilarRow
                                index="III"
                                title="Rastreabilidade de lote"
                                text="Cada dose vem com identificação de touro, lote, data de coleta e laudo. Sem misturas, sem regravações — só genética que você consegue auditar."
                                divider
                                last
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* CATÁLOGO ─────────────────────────────────── */}
            <section style={{ background: INK }}>
                <div className="container mx-auto px-4 py-14 md:py-20" style={{ maxWidth: 1280 }}>
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10">
                        <div>
                            <div
                                className="inline-flex items-center gap-3 mb-4"
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: 11,
                                    letterSpacing: "0.22em",
                                    textTransform: "uppercase",
                                    color: BRONZE_LIGHT,
                                    fontWeight: 500,
                                }}
                            >
                                <span style={{ width: 24, height: 1, background: BRONZE }} />
                                02 · Plantel completo
                            </div>
                            <h2
                                className="font-display"
                                style={{
                                    fontSize: "clamp(28px, 4vw, 48px)",
                                    fontWeight: 500,
                                    color: FG,
                                    letterSpacing: "-0.02em",
                                    maxWidth: "26ch",
                                }}
                            >
                                Reprodutores ativos na aceleradora.
                            </h2>
                        </div>
                        <p
                            style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 12,
                                letterSpacing: "0.10em",
                                color: "rgba(245,240,228,0.55)",
                                maxWidth: "32ch",
                            }}
                        >
                            Plantel curado pela Fórmula do Boi. Doses comercializadas com
                            laudo e garantia de procedência.
                        </p>
                    </div>

                    {filteredProducts.length > 0 ? (
                        <CatalogGrid
                            products={filteredProducts}
                            totalCount={filteredProducts.length}
                            onClearFilters={() => {}}
                            hasFilters={false}
                            theme="premium"
                            cardVariant="premium-genetic"
                        />
                    ) : (
                        <div
                            className="text-center py-16 card-engraved"
                            style={{
                                background: INK_2,
                                border: "1px solid rgba(212,168,92,0.20)",
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: 11,
                                    letterSpacing: "0.22em",
                                    textTransform: "uppercase",
                                    color: BRONZE_LIGHT,
                                    marginBottom: 10,
                                }}
                            >
                                Catálogo em atualização
                            </div>
                            <p style={{ color: "rgba(245,240,228,0.65)", fontSize: 15 }}>
                                Em breve novos reprodutores liberados para coleta.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}

/* ─────────────────────────────────────────────────────────────
 * Sub-componentes
 * ───────────────────────────────────────────────────────────── */

function HeroStat({ label, value, divider }: { label: string; value: string; divider?: boolean }) {
    return (
        <div
            className="px-4 py-5"
            style={{
                borderLeft: divider ? "1px solid rgba(212,168,92,0.16)" : undefined,
            }}
        >
            <div
                style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.20em",
                    textTransform: "uppercase",
                    color: BRONZE_LIGHT,
                    fontWeight: 500,
                    marginBottom: 6,
                }}
            >
                {label}
            </div>
            <div
                className="font-display"
                style={{
                    fontSize: "clamp(20px, 2.4vw, 28px)",
                    fontWeight: 500,
                    color: FG,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.05,
                }}
            >
                {value}
            </div>
        </div>
    );
}

function PilarRow({
    index,
    title,
    text,
    divider,
    last,
}: {
    index: string;
    title: string;
    text: string;
    divider?: boolean;
    last?: boolean;
}) {
    return (
        <div
            className="grid grid-cols-[auto_1fr] gap-5 px-6 py-6"
            style={{
                borderTop: divider ? "1px solid rgba(212,168,92,0.14)" : undefined,
                borderBottom: last ? undefined : undefined,
            }}
        >
            <div
                className="font-display"
                style={{
                    fontSize: 28,
                    color: BRONZE_LIGHT,
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    fontWeight: 500,
                    minWidth: 36,
                }}
            >
                {index}
            </div>
            <div>
                <div
                    className="font-display"
                    style={{
                        fontSize: 18,
                        fontWeight: 500,
                        color: FG,
                        letterSpacing: "-0.015em",
                        marginBottom: 6,
                    }}
                >
                    {title}
                </div>
                <p
                    style={{
                        color: "rgba(245,240,228,0.72)",
                        fontSize: 14.5,
                        lineHeight: 1.55,
                    }}
                >
                    {text}
                </p>
            </div>
        </div>
    );
}
