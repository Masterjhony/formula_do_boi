import { createClient } from "@supabase/supabase-js";
import { AgendaClient, type LeilaoPublico } from "./AgendaClient";

export const revalidate = 600;

// A agenda do site é um ESPELHO EXATO da planilha "ESCALA LEILÕES 2026".
// Fonte única: cronograma_leiloes, alimentada pelo sync do Google Sheets
// (scripts/sync_cronograma_from_sheets.py). Sem bula_leiloes e sem edição
// manual — o que está na planilha é o que aparece no site.
async function getLeiloesPublicos(): Promise<LeilaoPublico[]> {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Hoje em São Paulo (YYYY-MM-DD) — só mostramos leilões a partir de hoje.
    // Usa Intl.DateTimeFormat porque parsear o output de toLocaleString
    // (que vem com vírgula) quebra com RangeError no build da Vercel.
    const todayISO = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());

    const { data: crono } = await supabase
        .from("cronograma_leiloes")
        .select("id, nome, data, dia_semana, hora, raca, qtd_animais, presencial, leiloeira, criador, catalogo_url, img")
        .gte("data", todayISO)
        .order("data", { ascending: true });

    return (crono ?? []).map((c): LeilaoPublico => ({
        id: c.id,
        nome: c.nome,
        data: c.data,
        tipo: c.raca ?? null,
        animais: c.qtd_animais ?? null,
        img: c.img?.startsWith("http") ? c.img : null,
        horario: c.hora ?? null,
        transmissao: null,
        modelo: c.presencial ?? null,
        leiloeira: c.leiloeira ?? null,
        status: null,
        catalogo_url: c.catalogo_url ?? null,
        criador: c.criador ?? null,
    }));
}

export default async function AgendaPage() {
    const leiloes = await getLeiloesPublicos();
    return <AgendaClient leiloes={leiloes} />;
}
