import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GrupoVipContent from "@/components/lp/GrupoVipContent";

export const revalidate = 60;

export const metadata: Metadata = {
    title: "Grupo VIP · Fórmula do Boi — Nelore PO de alta performance",
    description:
        "Entre no grupo da Fórmula do Boi e acesse curadoria de Nelore PO, sêmen top 0.1%, embriões FIV e os principais leilões do país.",
    openGraph: {
        title: "Grupo VIP · Fórmula do Boi",
        description:
            "Genética de elite, dados reais e negócios todos os dias. Curadoria de Nelore PO para criadores, investidores e apaixonados pelo PO.",
        type: "website",
        locale: "pt_BR",
        images: ["/FORMULA DO BOI_LOGO-01.png"],
    },
};

const DEFAULT_WA_LINK = "https://chat.whatsapp.com/JYxJPWfkoHHLZfosHlywN9?mode=gi_t";

async function getWhatsappGroupLink(): Promise<string> {
    try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key =
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!url || !key) return DEFAULT_WA_LINK;
        const supabase = createClient(url, key);
        const { data } = await supabase
            .from("site_settings")
            .select("value")
            .eq("key", "whatsapp_group_link")
            .single();
        if (!data?.value) return DEFAULT_WA_LINK;
        if (typeof data.value === "string") return data.value;
        return (data.value as Record<string, string>).url || DEFAULT_WA_LINK;
    } catch {
        return DEFAULT_WA_LINK;
    }
}

export default async function GrupoVipPage() {
    const waGroupLink = await getWhatsappGroupLink();

    return (
        <main className="min-h-screen bg-ink text-fg">
            <Header />
            <GrupoVipContent waGroupLink={waGroupLink} />
            <Footer />
        </main>
    );
}
