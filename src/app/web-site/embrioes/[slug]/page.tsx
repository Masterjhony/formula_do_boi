import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { type Doadora, DOADORAS, getDoadora, tipoEmbriaoShort } from "@/data/doadoras";
import { createClient } from "@/utils/supabase/server";
import DoadoraClient from "./DoadoraClient";

export const dynamicParams = false;

export async function generateStaticParams() {
    return DOADORAS.map((d) => ({ slug: d.slug }));
}

// Deriva a imagem usada no preview social (WhatsApp / Facebook / Twitter).
// Prefere a `foto` oficial. Quando só há vídeo (Cloudinary), gera um frame
// estático 1200×630 via transformação de URL — sem regerar nada offline.
function ogImageFor(doadora: Doadora): string | null {
    if (doadora.foto) return doadora.foto;
    if (doadora.video) {
        const m = doadora.video.match(/^(.*\/video\/upload\/)(.+?)\.(mp4|mov|webm)$/i);
        if (m) {
            const [, base, idPart] = m;
            return `${base}so_2,w_1200,h_630,c_fill,g_auto,q_auto/${idPart}.jpg`;
        }
    }
    return null;
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const doadora = getDoadora(slug);
    if (!doadora) return { title: "Doadora não encontrada · Fórmula do Boi" };

    const nome = doadora.nomeAbcz ?? doadora.rgd;
    const tipo = tipoEmbriaoShort(doadora);
    const title = `Embriões ${tipo} da "${nome}" · Doadora Fórmula do Boi`;
    const description = `Embrião ${tipo} Nelore PO. ${doadora.classificacaoTop} · MGTe ${doadora.mgte.valor.toString().replace(".", ",")} ${doadora.mgte.top} · iABCZ ${doadora.iabcz.valor.toString().replace(".", ",")} ${doadora.iabcz.percentil}. Pacote 12 embriões com 4 prenhezes garantidas.`;
    const ogImage = ogImageFor(doadora);
    const imageAlt = `Doadora ${nome} — Nelore PO Fêmea`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "website",
            locale: "pt_BR",
            url: `/embrioes/${doadora.slug}`,
            siteName: "Fórmula do Boi",
            images: ogImage
                ? [{ url: ogImage, width: 1200, height: 630, alt: imageAlt, type: "image/jpeg" }]
                : undefined,
        },
        twitter: {
            card: ogImage ? "summary_large_image" : "summary",
            title,
            description,
            images: ogImage ? [ogImage] : undefined,
        },
    };
}

export default async function DoadoraPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const doadora = getDoadora(slug);
    if (!doadora) notFound();

    // Respeita o toggle de visibilidade do admin (web-admin /lotes-doadoras).
    // Se a linha correspondente em `products` (tag='SAFRA_VIS_2026', registro=rgd)
    // estiver com active=false, a página vira 404 — mesmo comportamento da
    // listagem em /embrioes.
    const supabase = await createClient();
    const { data: row } = await supabase
        .from('products')
        .select('active')
        .eq('tag', 'SAFRA_VIS_2026')
        .eq('details->>registro', doadora.rgd)
        .maybeSingle();
    if (row && row.active === false) notFound();

    return <DoadoraClient doadora={doadora} />;
}
