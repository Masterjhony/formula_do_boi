import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 600;

export type LeilaoPublicoSearch = {
    id: string;
    nome: string;
    data: string;
    tipo: string | null;
    img: string | null;
    leiloeira: string | null;
    criador: string | null;
};

function normalize(s: string) {
    return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
}

export async function GET() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const todayISO = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());

    const [{ data: bula }, { data: crono }] = await Promise.all([
        supabase
            .from("bula_leiloes")
            .select("id, nome, data, tipo, img, leiloeira, status")
            .gte("data", todayISO)
            .order("data", { ascending: true }),
        supabase
            .from("cronograma_leiloes")
            .select("id, nome, data, raca, leiloeira, criador")
            .gte("data", todayISO)
            .order("data", { ascending: true }),
    ]);

    const bulaList = bula ?? [];
    const cronoList = crono ?? [];
    const result: LeilaoPublicoSearch[] = [];
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
            img: b.img?.startsWith("http") ? b.img : null,
            leiloeira: b.leiloeira ?? match?.leiloeira ?? null,
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
            img: null,
            leiloeira: c.leiloeira ?? null,
            criador: c.criador ?? null,
        });
    }

    result.sort((a, b) => a.data.localeCompare(b.data));
    return NextResponse.json({ leiloes: result });
}
