import { createClient } from "@supabase/supabase-js";
import { AgendaClient } from "./AgendaClient";

export const revalidate = 3600;

async function getLeiloesPublicos() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data } = await supabase
        .from("bula_leiloes")
        .select("id, nome, data, tipo, animais, img, horario, transmissao, modelo, leiloeira, status")
        .order("data", { ascending: true });
    return data ?? [];
}

export default async function AgendaPage() {
    const leiloes = await getLeiloesPublicos();
    return <AgendaClient leiloes={leiloes} />;
}
