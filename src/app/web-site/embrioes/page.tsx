import { Metadata } from "next";
import { getProductsServer } from "@/services/products.server";
import { createClient } from "@/utils/supabase/server";
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

    // VIS doadoras Safra 2026: o admin controla visibilidade via `active` em `products`.
    // Lemos TODOS (incluindo inactive) e devolvemos pro client a lista de RGDs ocultos
    // pra ele filtrar a seção "Safra 2026" (renderizada do array DOADORAS estático).
    const supabase = await createClient();
    const { data: visRows } = await supabase
        .from('products')
        .select('details, active')
        .eq('tag', 'SAFRA_VIS_2026');
    const visInactiveRegistros = (visRows ?? [])
        .filter((r: any) => r.active === false)
        .map((r: any) => r.details?.registro)
        .filter(Boolean) as string[];

    return <EmbrioesClient products={products} visInactiveRegistros={visInactiveRegistros} />;
}
