import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DOADORAS, getDoadora, tipoEmbriaoShort } from "@/data/doadoras";
import { createClient } from "@/utils/supabase/server";
import CheckoutEmbriaoClient from "./CheckoutEmbriaoClient";

export const dynamicParams = false;

export async function generateStaticParams() {
    return DOADORAS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const doadora = getDoadora(slug);
    if (!doadora) return { title: "Pré-reserva · Fórmula do Boi" };

    const nome = doadora.nomeAbcz ?? doadora.rgd;
    const cruz = doadora.cruzamento ? ` × ${doadora.cruzamento}` : "";
    const tipo = tipoEmbriaoShort(doadora);
    return {
        title: `Pré-reserva Embriões ${tipo} da "${nome}"${cruz} — Fórmula do Boi`,
        description: `Solicite a pré-reserva do pacote ${nome}${cruz}. Embrião ${tipo}, ${doadora.quantidadeEmbrioes} unidades, prenhezes garantidas.`,
        robots: { index: false, follow: false },
    };
}

export default async function CheckoutEmbriaoPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const doadora = getDoadora(slug);
    if (!doadora) notFound();

    // Mesma guarda da página de detalhe: se admin desativou a doadora em
    // /web-admin/lotes-doadoras (active=false), o checkout também some.
    const supabase = await createClient();
    const { data: row } = await supabase
        .from("products")
        .select("active")
        .eq("tag", "SAFRA_VIS_2026")
        .eq("details->>registro", doadora.rgd)
        .maybeSingle();
    if (row && row.active === false) notFound();

    return <CheckoutEmbriaoClient doadora={doadora} />;
}
