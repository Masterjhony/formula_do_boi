import { getProductsServer } from "@/services/products.server";
import MatrizesClient from "./MatrizesClient";

export default async function MatrizesPage() {
    const products = await getProductsServer();
    return <MatrizesClient products={products} />;
}
