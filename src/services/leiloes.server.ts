import { createClient } from '@supabase/supabase-js';
import { type Leilao } from '@/data/leiloes';

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const WEEKDAYS_SHORT = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

function categoria(nome: string, raca: string): string {
    const n = (nome || '').toLowerCase();
    if (/embri|aspira|doadoras/.test(n)) return 'Embriões / Aspirações';
    if (/sêmen|semen/.test(n)) return 'Sêmen P.O.';
    if (/touros|reprodutores|jovens/.test(n)) return 'Touros P.O.';
    if (/fêmeas|femeas|matrizes|novilhotas|novilhas|ventres/.test(n)) return 'Fêmeas P.O.';
    if (/bezerros|bezerras/.test(n)) return 'Bezerros P.O.';
    if (raca && /pintado/i.test(raca)) return 'Nelore Pintado';
    return 'P.O.';
}

function leiloeiraNice(s: string): string {
    const u = (s || '').trim().toUpperCase();
    const fixes: Record<string, string> = {
        'PROGRAMA LEILÕES': 'Programa Leilões',
        'PROGRAMA LEILOES': 'Programa Leilões',
        'BULA REMATES': 'Bula Remates',
        'CENTRAL LEILOES': 'Central Leilões',
        'CENTRAL': 'Central Leilões',
        'AGRESTE LEILÕES': 'Agreste Leilões',
        'CAPITALIZA': 'Capitaliza',
        'E-RURAL': 'E-Rural',
        'ERURAL': 'E-Rural',
        'BULA': 'Bula',
    };
    if (fixes[u]) return fixes[u];
    return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';
}

function modeloNice(p: string): 'Presencial' | 'Virtual' {
    const u = (p || '').trim().toUpperCase();
    if (!u) return 'Virtual';
    if (u === 'VIRTUAL') return 'Virtual';
    return 'Presencial';
}

function criadorNice(criador: string, nome: string): string {
    const src = (criador || nome || '').trim();
    if (!src) return '';
    if (src !== src.toUpperCase()) return src;
    const small = new Set(['de', 'do', 'da', 'dos', 'das', 'e', '&']);
    const upper = new Set(['PO', 'JMP', 'RG', 'ABS', 'MRA', 'MEAB', 'IPB', 'EAO', 'DNA', 'VC', 'MS', 'NB', 'MNO', 'CEIA', 'FLOC', 'C+4', 'PC', 'LS', 'FB']);
    return src.split(/\s+/).map((w) => {
        if (upper.has(w.toUpperCase())) return w.toUpperCase();
        if (small.has(w.toLowerCase())) return w.toLowerCase();
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    }).join(' ');
}

export async function getProximosLeiloes(limit: number): Promise<{ proximos: Leilao[]; total: number }> {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return { proximos: [], total: 0 };
    }
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
        .from('cronograma_leiloes')
        .select('data, hora, nome, criador, presencial, leiloeira, raca, qtd_animais')
        .gte('data', today)
        .order('data', { ascending: true });

    const rows = data ?? [];
    const all: Leilao[] = rows.map((r: Record<string, unknown>) => {
        const d = new Date((r.data as string) + 'T00:00:00');
        return {
            dia: d.getUTCDate(),
            mes: MONTHS[d.getUTCMonth()],
            mesNum: d.getUTCMonth() + 1,
            diaSemana: WEEKDAYS_SHORT[d.getUTCDay()],
            horario: (r.hora as string) || '—',
            criador: criadorNice((r.criador as string) || '', (r.nome as string) || ''),
            categoria: categoria((r.nome as string) || '', (r.raca as string) || ''),
            quantidade: (r.qtd_animais as number) || 0,
            modelo: modeloNice((r.presencial as string) || ''),
            leiloeira: leiloeiraNice((r.leiloeira as string) || ''),
            transmissao: '',
        };
    });

    return { proximos: all.slice(0, limit), total: all.length };
}
