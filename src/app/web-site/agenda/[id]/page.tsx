import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    Clock3,
    Download,
    FileText,
    MapPin,
    Tag,
    Tv,
    Users,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const revalidate = 600;

const BRONZE = "#A0792E";
const BRONZE_LIGHT = "#D4A85C";
const INK = "#0A0A0A";
const INK_2 = "#141414";
const FG = "#F5F0E4";

type LeilaoDetalhe = {
    id: string;
    nome: string;
    data: string;
    tipo: string | null;
    animais: number | null;
    img: string | null;
    horario: string | null;
    transmissao: string | null;
    modelo: string | null;
    leiloeira: string | null;
    status: string | null;
    catalogo_url: string | null;
    criador: string | null;
    local: string | null;
};

const MESES_PT = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const DIAS_PT = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

const ASSESSOR_PHONE = "553184143874";

function assessorLink(text: string) {
    return `https://wa.me/${ASSESSOR_PHONE}?text=${encodeURIComponent(text)}`;
}

async function getLeilao(id: string): Promise<LeilaoDetalhe | null> {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: bula } = await supabase
        .from("bula_leiloes")
        .select("id, nome, data, tipo, animais, img, horario, transmissao, modelo, leiloeira, status, catalogo_url, local")
        .eq("id", id)
        .maybeSingle();

    if (bula) {
        return {
            id: bula.id,
            nome: bula.nome,
            data: bula.data,
            tipo: bula.tipo ?? null,
            animais: bula.animais ?? null,
            img: bula.img?.startsWith("http") ? bula.img : null,
            horario: bula.horario ?? null,
            transmissao: bula.transmissao ?? null,
            modelo: bula.modelo ?? null,
            leiloeira: bula.leiloeira ?? null,
            status: bula.status ?? null,
            catalogo_url: bula.catalogo_url ?? null,
            criador: null,
            local: bula.local ?? null,
        };
    }

    const { data: crono } = await supabase
        .from("cronograma_leiloes")
        .select("id, nome, data, dia_semana, hora, raca, qtd_animais, presencial, leiloeira, criador, catalogo_url")
        .eq("id", id)
        .maybeSingle();

    if (crono) {
        return {
            id: crono.id,
            nome: crono.nome,
            data: crono.data,
            tipo: crono.raca ?? null,
            animais: crono.qtd_animais ?? null,
            img: null,
            horario: crono.hora ?? null,
            transmissao: null,
            modelo: crono.presencial ?? null,
            leiloeira: crono.leiloeira ?? null,
            status: null,
            catalogo_url: crono.catalogo_url ?? null,
            criador: crono.criador ?? null,
            local: null,
        };
    }

    return null;
}

function parseData(iso: string) {
    const [y, m, d] = (iso ?? "").split("-").map(Number);
    if (!y || !m || !d) return null;
    const date = new Date(y, m - 1, d);
    return {
        dia: d,
        mes: MESES_PT[m - 1],
        mesAbrev: MESES_PT[m - 1].slice(0, 3).toUpperCase(),
        ano: y,
        diaSemana: DIAS_PT[date.getDay()],
        completa: `${String(d).padStart(2, "0")} de ${MESES_PT[m - 1]} de ${y}`,
    };
}

function inferFileMeta(url: string) {
    try {
        const u = new URL(url);
        const path = u.pathname.split("/").filter(Boolean).pop() || "";
        const decoded = decodeURIComponent(path);
        const ext = (decoded.split(".").pop() || "").toLowerCase();
        const isPdf = ext === "pdf";
        const isImage = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext);
        return {
            filename: decoded || "catalogo",
            ext: ext || "link",
            isPdf,
            isImage,
            host: u.hostname.replace(/^www\./, ""),
        };
    } catch {
        return { filename: "catalogo", ext: "link", isPdf: false, isImage: false, host: "" };
    }
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    const leilao = await getLeilao(id);
    if (!leilao) return { title: "Leilão não encontrado · Fórmula do Boi" };

    const d = parseData(leilao.data);
    const titleParts = [leilao.nome, d?.completa].filter(Boolean).join(" — ");
    const description = [
        leilao.tipo,
        leilao.criador,
        leilao.local,
        d ? `${d.diaSemana}, ${d.completa}` : null,
    ].filter(Boolean).join(" · ");

    return {
        title: `${titleParts} · Leilão · Fórmula do Boi`,
        description: description || "Detalhes do leilão na agenda Bula Remates × Fórmula do Boi.",
        openGraph: {
            title: titleParts,
            description: description || "Agenda Bula Remates × Fórmula do Boi.",
            images: leilao.img ? [leilao.img] : ["/cattle/boi_nelore_elite.jpg"],
        },
    };
}

export default async function LeilaoDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const leilao = await getLeilao(id);
    if (!leilao) notFound();

    const d = parseData(leilao.data);
    const isVirtual = leilao.modelo?.toLowerCase() === "virtual";
    const isConfirmado = leilao.status?.toLowerCase() === "confirmado";
    const catalogo = leilao.catalogo_url ? inferFileMeta(leilao.catalogo_url) : null;
    const catalogoDisplayTitle = `Catálogo oficial · ${leilao.nome}`;
    const catalogoPreviewUrl = catalogo && !catalogo.isImage
        ? `${leilao.catalogo_url}#toolbar=0&navpanes=0&statusbar=0&view=FitH`
        : leilao.catalogo_url;

    const assessorMsg = d
        ? `Olá! Vim pela página do leilão ${leilao.nome} (${d.dia} de ${d.mes}) e gostaria de saber mais.`
        : `Olá! Vim pela página do leilão ${leilao.nome} e gostaria de saber mais.`;

    const infoItems = [
        leilao.tipo && { icon: <Tag className="w-3.5 h-3.5" />, label: "Categoria", value: leilao.tipo },
        leilao.animais ? { icon: <Users className="w-3.5 h-3.5" />, label: "Animais", value: leilao.animais.toLocaleString("pt-BR") } : null,
        leilao.criador && { icon: <Users className="w-3.5 h-3.5" />, label: "Criador", value: leilao.criador },
        leilao.local && { icon: <MapPin className="w-3.5 h-3.5" />, label: "Local", value: leilao.local },
        leilao.horario && { icon: <Clock3 className="w-3.5 h-3.5" />, label: "Horário", value: leilao.horario },
        leilao.leiloeira && { icon: <CalendarDays className="w-3.5 h-3.5" />, label: "Leiloeira", value: leilao.leiloeira },
        leilao.transmissao && { icon: <Tv className="w-3.5 h-3.5" />, label: "Transmissão", value: leilao.transmissao },
        leilao.modelo && { icon: isVirtual ? <Tv className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />, label: "Modalidade", value: leilao.modelo },
    ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string }[];

    return (
        <main className="min-h-screen" style={{ background: INK, color: FG }}>
            <Header />

            {/* HERO ───────────────────────────────────────────── */}
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
                <div className="container mx-auto px-4 pt-20 pb-12 relative" style={{ maxWidth: 1200 }}>
                    <Link
                        href="/agenda"
                        className="inline-flex items-center gap-2 mb-8 transition-colors hover:text-white"
                        style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            letterSpacing: "0.22em",
                            textTransform: "uppercase",
                            color: "rgba(245,240,228,0.55)",
                            fontWeight: 500,
                        }}
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Voltar para a agenda
                    </Link>

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
                        Agenda · Leilão
                        {d && (
                            <>
                                <span style={{ width: 1, height: 12, background: "rgba(212,168,92,0.35)" }} />
                                <span>{d.diaSemana} · {d.completa}</span>
                            </>
                        )}
                    </div>

                    <h1
                        className="font-display"
                        style={{
                            fontSize: "clamp(36px, 6vw, 76px)",
                            fontWeight: 500,
                            lineHeight: 0.98,
                            letterSpacing: "-0.03em",
                            color: FG,
                            marginBottom: 22,
                            maxWidth: "22ch",
                        }}
                    >
                        {leilao.nome}
                    </h1>

                    <div className="flex flex-wrap items-center gap-2 mb-8">
                        {isVirtual ? (
                            <Badge tone="muted" icon={<Tv className="w-3 h-3" />}>Virtual</Badge>
                        ) : leilao.modelo ? (
                            <Badge tone="gold" icon={<Users className="w-3 h-3" />}>{leilao.modelo}</Badge>
                        ) : null}
                        {isConfirmado && <Badge tone="green">Confirmado</Badge>}
                        {catalogo ? (
                            <Badge tone="gold-strong" icon={<FileText className="w-3 h-3" />}>Catálogo disponível</Badge>
                        ) : (
                            <Badge tone="muted" icon={<Clock3 className="w-3 h-3" />}>Catálogo em breve</Badge>
                        )}
                    </div>

                    {/* Grid principal: data + info */}
                    <div className="grid lg:grid-cols-[260px_1fr] gap-6 lg:gap-10 items-start">
                        {/* Bloco de data */}
                        <div
                            className="card-engraved flex flex-col items-center justify-center text-center mx-auto lg:mx-0 w-full max-w-[260px]"
                            style={{
                                background: `linear-gradient(160deg, ${INK_2} 0%, #1a1407 100%)`,
                                border: "1px solid rgba(212,168,92,0.28)",
                                padding: "32px 20px",
                            }}
                        >
                            {d ? (
                                <>
                                    <span
                                        style={{
                                            fontFamily: "var(--font-mono)",
                                            fontSize: 10,
                                            letterSpacing: "0.24em",
                                            textTransform: "uppercase",
                                            color: BRONZE_LIGHT,
                                            opacity: 0.8,
                                        }}
                                    >
                                        {d.diaSemana}
                                    </span>
                                    <span
                                        className="font-display"
                                        style={{
                                            fontSize: 88,
                                            fontWeight: 500,
                                            lineHeight: 1,
                                            color: BRONZE_LIGHT,
                                            letterSpacing: "-0.04em",
                                            marginTop: 6,
                                        }}
                                    >
                                        {d.dia}
                                    </span>
                                    <span
                                        style={{
                                            fontFamily: "var(--font-mono)",
                                            fontSize: 13,
                                            letterSpacing: "0.22em",
                                            textTransform: "uppercase",
                                            color: BRONZE,
                                            fontWeight: 600,
                                            marginTop: 6,
                                        }}
                                    >
                                        {d.mes}
                                    </span>
                                    <span
                                        style={{
                                            fontFamily: "var(--font-mono)",
                                            fontSize: 11,
                                            letterSpacing: "0.18em",
                                            color: "rgba(245,240,228,0.45)",
                                            marginTop: 4,
                                        }}
                                    >
                                        {d.ano}
                                    </span>
                                    {leilao.horario && (
                                        <span
                                            className="flex items-center gap-1.5"
                                            style={{
                                                fontFamily: "var(--font-mono)",
                                                fontSize: 11,
                                                letterSpacing: "0.16em",
                                                color: FG,
                                                marginTop: 16,
                                                paddingTop: 16,
                                                borderTop: "1px solid rgba(212,168,92,0.18)",
                                                width: "100%",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Clock3 className="w-3.5 h-3.5" style={{ color: BRONZE_LIGHT }} />
                                            {leilao.horario}
                                        </span>
                                    )}
                                </>
                            ) : (
                                <span
                                    style={{
                                        fontFamily: "var(--font-mono)",
                                        fontSize: 12,
                                        letterSpacing: "0.18em",
                                        textTransform: "uppercase",
                                        color: "rgba(245,240,228,0.55)",
                                    }}
                                >
                                    Data a definir
                                </span>
                            )}
                        </div>

                        {/* Info grid */}
                        <div>
                            {leilao.img && (
                                <div
                                    className="mb-6 overflow-hidden"
                                    style={{
                                        border: "1px solid rgba(212,168,92,0.20)",
                                        background: INK_2,
                                    }}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={leilao.img}
                                        alt={leilao.nome}
                                        className="w-full object-contain"
                                        style={{ maxHeight: 360 }}
                                    />
                                </div>
                            )}

                            {infoItems.length > 0 && (
                                <dl className="grid sm:grid-cols-2 gap-3">
                                    {infoItems.map((it) => (
                                        <div
                                            key={it.label}
                                            className="card-engraved flex items-start gap-3 px-4 py-3"
                                            style={{
                                                background: INK_2,
                                                border: "1px solid rgba(212,168,92,0.14)",
                                            }}
                                        >
                                            <span className="mt-0.5" style={{ color: BRONZE_LIGHT }}>{it.icon}</span>
                                            <div className="min-w-0">
                                                <dt
                                                    style={{
                                                        fontFamily: "var(--font-mono)",
                                                        fontSize: 10,
                                                        letterSpacing: "0.22em",
                                                        textTransform: "uppercase",
                                                        color: "rgba(245,240,228,0.45)",
                                                        marginBottom: 2,
                                                    }}
                                                >
                                                    {it.label}
                                                </dt>
                                                <dd className="text-sm" style={{ color: FG }}>
                                                    {it.value}
                                                </dd>
                                            </div>
                                        </div>
                                    ))}
                                </dl>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* CATÁLOGO ANEXO ─────────────────────────────────── */}
            {catalogo && leilao.catalogo_url && (
                <section
                    style={{
                        background: `linear-gradient(180deg, ${INK} 0%, ${INK_2} 100%)`,
                        borderBottom: "1px solid rgba(212,168,92,0.10)",
                    }}
                >
                    <div className="container mx-auto px-4 py-12 md:py-16" style={{ maxWidth: 1100 }}>
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
                            <div>
                                <div
                                    className="inline-flex items-center gap-3 mb-3"
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
                                    Anexo · Catálogo
                                </div>
                                <h2
                                    className="font-display"
                                    style={{
                                        fontSize: "clamp(24px, 3.2vw, 36px)",
                                        fontWeight: 500,
                                        color: FG,
                                        letterSpacing: "-0.02em",
                                        maxWidth: "28ch",
                                        lineHeight: 1.1,
                                    }}
                                >
                                    Catálogo oficial do leilão.
                                </h2>
                            </div>
                            {!catalogo.isImage && (
                                <p
                                    style={{
                                        fontFamily: "var(--font-mono)",
                                        fontSize: 11,
                                        letterSpacing: "0.10em",
                                        color: "rgba(245,240,228,0.45)",
                                        maxWidth: "32ch",
                                    }}
                                >
                                    Navegue o catálogo abaixo ou baixe em PDF para consultar offline.
                                </p>
                            )}
                        </div>

                        {/* Card unificado: header + preview */}
                        <div
                            className="overflow-hidden"
                            style={{
                                background: INK,
                                border: "1px solid rgba(212,168,92,0.28)",
                                borderRadius: 4,
                                boxShadow: "0 24px 60px -28px rgba(0,0,0,0.65)",
                            }}
                        >
                            {/* Header */}
                            <div
                                className="flex items-center gap-4 px-5 py-4"
                                style={{
                                    borderBottom: "1px solid rgba(212,168,92,0.18)",
                                    background:
                                        "linear-gradient(180deg, rgba(212,168,92,0.06) 0%, rgba(212,168,92,0.00) 100%)",
                                }}
                            >
                                <div
                                    className="flex items-center justify-center flex-shrink-0"
                                    style={{
                                        width: 44,
                                        height: 52,
                                        background: BRONZE,
                                        color: INK,
                                        fontFamily: "var(--font-mono)",
                                        fontSize: 10,
                                        fontWeight: 700,
                                        letterSpacing: "0.12em",
                                        borderRadius: 2,
                                    }}
                                >
                                    .{catalogo.ext.toUpperCase().slice(0, 4)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div
                                        className="font-display"
                                        style={{
                                            fontSize: 16,
                                            fontWeight: 500,
                                            color: FG,
                                            letterSpacing: "-0.01em",
                                            lineHeight: 1.25,
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden",
                                        }}
                                    >
                                        {catalogoDisplayTitle}
                                    </div>
                                    <div
                                        className="flex items-center gap-2 mt-1"
                                        style={{
                                            fontFamily: "var(--font-mono)",
                                            fontSize: 10,
                                            letterSpacing: "0.18em",
                                            textTransform: "uppercase",
                                            color: "rgba(245,240,228,0.45)",
                                        }}
                                    >
                                        <FileText className="w-3 h-3" style={{ color: BRONZE_LIGHT }} />
                                        Documento PDF
                                        {d && (
                                            <>
                                                <span style={{ width: 1, height: 10, background: "rgba(212,168,92,0.25)" }} />
                                                <span>{d.dia} {d.mes.slice(0, 3)} {d.ano}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                                    <a
                                        href={leilao.catalogo_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-3.5 py-2 transition-all hover:bg-white/5"
                                        style={{
                                            fontFamily: "var(--font-mono)",
                                            fontSize: 10,
                                            letterSpacing: "0.18em",
                                            textTransform: "uppercase",
                                            color: BRONZE_LIGHT,
                                            border: "1px solid rgba(212,168,92,0.35)",
                                            fontWeight: 600,
                                            borderRadius: 2,
                                        }}
                                    >
                                        <ArrowRight className="w-3 h-3" />
                                        Nova aba
                                    </a>
                                    <a
                                        href={leilao.catalogo_url}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-3.5 py-2 transition-all hover:opacity-90"
                                        style={{
                                            fontFamily: "var(--font-mono)",
                                            fontSize: 10,
                                            letterSpacing: "0.18em",
                                            textTransform: "uppercase",
                                            color: INK,
                                            background: BRONZE,
                                            fontWeight: 700,
                                            borderRadius: 2,
                                        }}
                                    >
                                        <Download className="w-3 h-3" />
                                        Baixar
                                    </a>
                                </div>
                            </div>

                            {/* Preview */}
                            <div
                                className="relative"
                                style={{
                                    background: INK_2,
                                    height: "min(82vh, 920px)",
                                    minHeight: 520,
                                }}
                            >
                                {catalogo.isImage ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                        src={leilao.catalogo_url}
                                        alt={`Catálogo do leilão ${leilao.nome}`}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <iframe
                                        src={catalogoPreviewUrl ?? leilao.catalogo_url}
                                        title={`Catálogo · ${leilao.nome}`}
                                        className="absolute inset-0 w-full h-full"
                                        style={{ border: "none", background: INK_2 }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* CTAs mobile */}
                        <div className="flex sm:hidden flex-col gap-2 mt-4">
                            <a
                                href={leilao.catalogo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-4 py-3 transition-all"
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: 11,
                                    letterSpacing: "0.18em",
                                    textTransform: "uppercase",
                                    color: INK,
                                    background: BRONZE,
                                    fontWeight: 700,
                                    borderRadius: 2,
                                }}
                            >
                                <Download className="w-3.5 h-3.5" />
                                Baixar catálogo
                            </a>
                            <a
                                href={leilao.catalogo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-4 py-3 transition-all"
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: 11,
                                    letterSpacing: "0.18em",
                                    textTransform: "uppercase",
                                    color: BRONZE_LIGHT,
                                    border: "1px solid rgba(212,168,92,0.35)",
                                    fontWeight: 600,
                                    borderRadius: 2,
                                }}
                            >
                                <ArrowRight className="w-3.5 h-3.5" />
                                Abrir em nova aba
                            </a>
                        </div>
                    </div>
                </section>
            )}

            {/* CTA ASSESSOR ──────────────────────────────────── */}
            <section style={{ background: INK }}>
                <div className="container mx-auto px-4 py-16 md:py-20 text-center" style={{ maxWidth: 1200 }}>
                    <div
                        className="inline-flex items-center gap-3 mb-5"
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
                        Assessoria Bula × FdB
                    </div>
                    <h3
                        className="font-display mb-6"
                        style={{
                            fontSize: "clamp(24px, 3.4vw, 36px)",
                            fontWeight: 500,
                            color: FG,
                            letterSpacing: "-0.02em",
                            maxWidth: "32ch",
                            margin: "0 auto 22px",
                            lineHeight: 1.1,
                        }}
                    >
                        Conduzimos sua participação do estudo do catálogo ao lance final.
                    </h3>
                    <a
                        href={assessorLink(assessorMsg)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-3.5 transition-all hover:shadow-lg hover:shadow-brand-gold/20 hover:opacity-95"
                        style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 12,
                            letterSpacing: "0.22em",
                            textTransform: "uppercase",
                            color: INK,
                            background: BRONZE,
                            fontWeight: 700,
                        }}
                    >
                        Falar com assessor
                        <ArrowRight className="w-4 h-4" />
                    </a>
                </div>
            </section>

            <Footer />
        </main>
    );
}

type BadgeTone = "muted" | "gold" | "gold-strong" | "green";

function Badge({ children, icon, tone }: { children: React.ReactNode; icon?: React.ReactNode; tone: BadgeTone }) {
    const styles: Record<BadgeTone, React.CSSProperties> = {
        muted: {
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(245,240,228,0.7)",
        },
        gold: {
            background: "rgba(212,168,92,0.10)",
            border: "1px solid rgba(212,168,92,0.30)",
            color: BRONZE_LIGHT,
        },
        "gold-strong": {
            background: "rgba(212,168,92,0.18)",
            border: "1px solid rgba(212,168,92,0.50)",
            color: BRONZE_LIGHT,
        },
        green: {
            background: "rgba(34,197,94,0.10)",
            border: "1px solid rgba(34,197,94,0.30)",
            color: "#4ade80",
        },
    };

    return (
        <span
            className="inline-flex items-center gap-1.5 px-3 py-1"
            style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.20em",
                textTransform: "uppercase",
                fontWeight: 600,
                ...styles[tone],
            }}
        >
            {icon}
            {children}
        </span>
    );
}
