import { Metadata } from "next";
import { getProductsServer } from "@/services/products.server";
import EmbrioesClient from "./EmbrioesClient";

export const metadata: Metadata = {
    title: "Catálogo de Embriões e Doadoras | Fórmula do Boi",
    description: "Embriões e doadoras de alta genética para o seu rebanho.",
    openGraph: {
        title: "Catálogo de Embriões e Doadoras | Fórmula do Boi",
        description: "Embriões e doadoras de alta genética para o seu rebanho.",
        images: ['/cattle/boi_09.jpeg'], // Check if there's a better image
    },
};

export default async function EmbrioesPage() {
    const products = await getProductsServer();
    return <EmbrioesClient products={products} />;
}
