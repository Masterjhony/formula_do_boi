import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DOADORAS, getDoadora } from "@/data/doadoras";
import EmbriaoCheckout from "./EmbriaoCheckout";

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
    const d = getDoadora(slug);
    if (!d) return { title: "Doadora não encontrada · Fórmula do Boi" };

    const nome = d.nomeAbcz ?? d.rgd;
    return {
        title: `Reserva — ${nome} × ${d.cruzamento} · Fórmula do Boi`,
        description: `Reserve seu pacote de embriões VIT (mínimo 12 embriões · 4 prenhezes garantidas) da doadora ${nome} (${d.rgd}) × ${d.cruzamento}.`,
        robots: { index: false, follow: true },
    };
}

export default async function DoadoraCheckoutPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const doadora = getDoadora(slug);
    if (!doadora) notFound();

    return <EmbriaoCheckout doadora={doadora} />;
}
