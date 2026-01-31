import { getProductsServer } from "@/services/products.server";
import TourosClient from "./TourosClient";

export default async function TourosPage() {
    const products = await getProductsServer();
    return <TourosClient products={products} />;
}
