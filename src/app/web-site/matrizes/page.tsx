import { Metadata } from "next";
import { getProductsServer } from "@/services/products.server";
import MatrizesClient from "./MatrizesClient";

export const metadata: Metadata = {
    title: "Catálogo de Matrizes Nelore PO | Fórmula do Boi",
    description: "Matrizes Nelore PO selecionadas, com genética comprovada, prontas para reprodução e valorização do seu plantel.",
    openGraph: {
        title: "Catálogo de Matrizes Nelore PO | Fórmula do Boi",
        description: "Matrizes Nelore PO selecionadas, com genética comprovada, prontas para reprodução e valorização do seu plantel.",
        images: ['/cattle/boi_09.jpeg'],
    },
};

export default async function MatrizesPage() {
    const products = await getProductsServer();
    return <MatrizesClient products={products} />;
}
