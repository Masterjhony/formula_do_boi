import { Metadata } from "next";
import { getProductsServer } from "@/services/products.server";
import EmbrioesClient from "./EmbrioesClient";

export const metadata: Metadata = {
    title: "Catálogo de Embriões e Doadoras | Fórmula do Boi",
    description: "Embriões e doadoras de alta genética para o seu rebanho.",
    openGraph: {
        title: "Catálogo de Embriões e Doadoras | Fórmula do Boi",
        description: "Embriões e doadoras de alta genética para o seu rebanho.",
        images: ['/cattle/vaca_embrioes_og.webp'],
    },
};

export default async function EmbrioesPage() {
    const products = await getProductsServer();
    return <EmbrioesClient products={products} />;
}
