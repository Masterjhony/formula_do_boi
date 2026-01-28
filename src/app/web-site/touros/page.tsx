import { getProductsServer } from "@/services/products";
import TourosClient from "./TourosClient";

export default async function TourosPage() {
    const products = await getProductsServer();
    return <TourosClient products={products} />;
}
