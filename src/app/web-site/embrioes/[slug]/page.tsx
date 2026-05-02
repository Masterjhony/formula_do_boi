import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DOADORAS, getDoadora } from "@/data/doadoras";
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
    const title = `${nome} × ${doadora.cruzamento} — Embrião FIV · Fórmula do Boi`;
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

    return <DoadoraClient doadora={doadora} />;
}
