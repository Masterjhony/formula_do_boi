import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DOADORAS, getDoadora } from "@/data/doadoras";
import { createClient } from "@/utils/supabase/server";
import DoadoraClient from "./DoadoraClient";

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
    if (!doadora) return { title: "Doadora não encontrada · Fórmula do Boi" };

    const nome = doadora.nomeAbcz ?? doadora.rgd;
    const cruzamentoSuffix = doadora.cruzamento ? ` × ${doadora.cruzamento}` : "";
    const title = `${nome}${cruzamentoSuffix} — Embrião FIV · Fórmula do Boi`;
    const description = `Embrião VIT Nelore PO. ${doadora.classificacaoTop} · MGTe ${doadora.mgte.valor.toString().replace(".", ",")} ${doadora.mgte.top} · iABCZ ${doadora.iabcz.valor.toString().replace(".", ",")} ${doadora.iabcz.percentil}. Pacote 12 embriões com 4 prenhezes garantidas.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "website",
            locale: "pt_BR",
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
