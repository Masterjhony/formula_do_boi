import { Metadata } from "next";
import { getProductsServer } from "@/services/products.server";
import { createClient } from "@/utils/supabase/server";
import EmbrioesClient from "./EmbrioesClient";

// Preview social: retrato da doadora JATY MAT. (RDM B3610, TOP 0,1% em iABCZ/IQG/MGTe),
// nossa doadora-vitrine. Frame extraído do vídeo oficial e enquadrado em 1200×630.
const OG_IMAGE = "/cattle/embrioes-og-doadora-jaty.jpg";
const OG_ALT = "Doadora JATY MAT. — Nelore PO Fêmea, TOP 0,1% iABCZ · Fórmula do Boi";

export const metadata: Metadata = {
    title: "Catálogo de Embriões e Doadoras | Fórmula do Boi",
    description: "Embriões e doadoras de alta genética para o seu rebanho.",
    openGraph: {
        title: "Catálogo de Embriões e Doadoras | Fórmula do Boi",
        description: "Embriões e doadoras de alta genética para o seu rebanho.",
        type: "website",
        locale: "pt_BR",
        url: "/embrioes",
        siteName: "Fórmula do Boi",
        images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: OG_ALT, type: "image/jpeg" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Catálogo de Embriões e Doadoras | Fórmula do Boi",
        description: "Embriões e doadoras de alta genética para o seu rebanho.",
        images: [OG_IMAGE],
    },
};

export default async function EmbrioesPage() {
    const products = await getProductsServer();

    // VIS doadoras Safra 2026: o admin controla visibilidade via `active` em `products`.
    // Lemos TODOS (incluindo inactive) e devolvemos pro client:
    //  (a) a lista de RGDs ocultos — filtra a seção renderizada do array DOADORAS;
    //  (b) a pelagem de cada doadora — classificada pelo campo `raca` do produto
    //      (mesmo critério de Nelore Padrão × Pintado usado no catálogo).
    type VisRow = {
        details: { registro?: string; raca?: string } | null;
        active: boolean | null;
        raca: string | null;
    };
    const supabase = await createClient();
    const { data } = await supabase
        .from('products')
        .select('details, active, raca')
        .eq('tag', 'SAFRA_VIS_2026');
    const visRows = (data ?? []) as VisRow[];

    const visInactiveRegistros = visRows
        .filter((r) => r.active === false)
        .map((r) => r.details?.registro)
        .filter(Boolean) as string[];

    const visRacaByRegistro: Record<string, string> = {};
    for (const r of visRows) {
        const registro = r.details?.registro;
        const raca = r.raca || r.details?.raca;
        if (registro && raca) visRacaByRegistro[registro] = raca;
    }

    return (
        <EmbrioesClient
            products={products}
            visInactiveRegistros={visInactiveRegistros}
            visRacaByRegistro={visRacaByRegistro}
        />
    );
}
