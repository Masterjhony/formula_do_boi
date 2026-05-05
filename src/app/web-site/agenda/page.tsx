import { createClient } from "@supabase/supabase-js";
import { AgendaClient, type LeilaoPublico } from "./AgendaClient";

export const revalidate = 3600;

function normalize(s: string) {
    return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}

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

    const [{ data: bula }, { data: crono }] = await Promise.all([
        supabase
            .from("bula_leiloes")
            .select("id, nome, data, tipo, animais, img, horario, transmissao, modelo, leiloeira, status, catalogo_url")
            .gte("data", todayISO)
            .order("data", { ascending: true }),
        supabase
            .from("cronograma_leiloes")
            .select("id, nome, data, dia_semana, hora, raca, qtd_animais, presencial, leiloeira, criador, catalogo_url")
            .gte("data", todayISO)
            .order("data", { ascending: true }),
    ]);

    const bulaList = bula ?? [];
    const cronoList = crono ?? [];

    const result: LeilaoPublico[] = [];
    const usedCronoIds = new Set<string>();

    for (const b of bulaList) {
        const sameDate = cronoList.filter((c) => c.data === b.data);
        let match: typeof cronoList[number] | undefined;
        if (sameDate.length === 1) {
            match = sameDate[0];
        } else if (sameDate.length > 1) {
            const bNorm = normalize(b.nome).slice(0, 6);
            match = sameDate.find((c) => normalize(c.nome).includes(bNorm))
                ?? sameDate.find((c) => normalize(c.criador || "").includes(bNorm))
                ?? sameDate[0];
        }
        if (match) usedCronoIds.add(match.id);

        result.push({
            id: b.id,
            nome: b.nome,
            data: b.data,
            tipo: b.tipo ?? match?.raca ?? null,
            animais: b.animais ?? match?.qtd_animais ?? null,
            img: b.img?.startsWith("http") ? b.img : null,
            horario: b.horario ?? match?.hora ?? null,
            transmissao: b.transmissao ?? null,
            modelo: b.modelo ?? match?.presencial ?? null,
            leiloeira: b.leiloeira ?? match?.leiloeira ?? null,
            status: b.status ?? null,
            catalogo_url: b.catalogo_url ?? match?.catalogo_url ?? null,
            criador: match?.criador ?? null,
        });
    }

    for (const c of cronoList) {
        if (usedCronoIds.has(c.id)) continue;
        result.push({
            id: c.id,
            nome: c.nome,
            data: c.data,
            tipo: c.raca ?? null,
            animais: c.qtd_animais ?? null,
            img: null,
            horario: c.hora ?? null,
            transmissao: null,
            modelo: c.presencial ?? null,
            leiloeira: c.leiloeira ?? null,
            status: null,
            catalogo_url: c.catalogo_url ?? null,
            criador: c.criador ?? null,
        });
    }

    return result.sort((a, b) => a.data.localeCompare(b.data));
}

export default async function AgendaPage() {
    const leiloes = await getLeiloesPublicos();
    return <AgendaClient leiloes={leiloes} />;
}
