import { Metadata } from "next";
import { getProductsServer } from "@/services/products.server";
import TourosClient from "./TourosClient";

export const metadata: Metadata = {
    title: "Catálogo de Touros Nelore PO | Fórmula do Boi",
    description: "Touros Nelore PO de alta performance genética para evolução do seu rebanho e maior produtividade.",
    openGraph: {
        title: "Catálogo de Touros Nelore PO | Fórmula do Boi",
        description: "Touros Nelore PO de alta performance genética para evolução do seu rebanho e maior produtividade.",
        images: ['/cattle/boi_nelore_elite.jpg'],
    },
};

export default async function TourosPage() {
    const products = await getProductsServer();
    return <TourosClient products={products} />;
}
