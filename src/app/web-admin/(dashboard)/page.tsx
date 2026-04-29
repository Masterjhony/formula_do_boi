import { createClient } from '@/utils/supabase/server';
import DashboardClient, {
    type DashboardProps,
    type ProximoLeilao,
    type ProximoLeilaoRow,
    type VgvPoint,
    type FunnelStep,
    type FeedItem,
    type TaskItem,
    type RegionItem,
    type LeilaoTopItem,
    type CompradorItem,
    type LanceItem,
} from './DashboardClient';

const MONTH_ABBR = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const WEEK_ABBR = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function daysFromNow(dateStr: string | null | undefined): number | null {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y) return null;
    const dt = new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return Math.ceil((dt.getTime() - today.getTime()) / 86400000);
}

function parseLeilaoDate(iso: string | null | undefined, horario?: string | null) {
    if (!iso) return null;
    const [y, m, d] = iso.split('-').map(Number);
    if (!y) return null;
    let hh = 20, mm = 0;
    if (horario) {
        const mMatch = horario.match(/(\d{1,2})[:h](\d{2})?/i);
        if (mMatch) { hh = Number(mMatch[1]); mm = Number(mMatch[2] ?? 0); }
    }
    const dt = new Date(y, m - 1, d, hh, mm, 0, 0);
    return {
        dia: String(d).padStart(2, '0'),
        mes: MONTH_ABBR[m - 1],
        semana: WEEK_ABBR[dt.getDay()],
        ts: dt.getTime(),
    };
}

function truncate(s: string | null | undefined, n: number) {
    if (!s) return '';
    return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

function timeAgo(iso: string | null | undefined): string {
    if (!iso) return '—';
    const then = new Date(iso).getTime();
    const diff = Date.now() - then;
    if (diff < 60_000) return 'agora';
    const min = Math.floor(diff / 60_000);
    if (min < 60) return `${min} min`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h`;
    const days = Math.floor(hr / 24);
    return `${days}d`;
}

function formatDue(due: string | null | undefined): string {
    const d = daysFromNow(due);
    if (d == null) return 'Sem prazo';
    if (d < 0) return `Atrasada ${Math.abs(d)} dia${Math.abs(d) === 1 ? '' : 's'}`;
    if (d === 0) return 'Hoje';
    if (d === 1) return 'Amanhã';
    if (d < 7) return `Em ${d} dias`;
    const [, m, dd] = (due as string).split('-').map(Number);
    return `${String(dd).padStart(2, '0')}/${MONTH_ABBR[(m || 1) - 1]}`;
}

// ───────────────────────────────────────────────────────────────────────────

export default async function AdminDashboard() {
    const supabase = await createClient();

    const [
        { data: leads },
        { data: tasks },
        { data: leiloes },
        { data: fechamentos },
    ] = await Promise.all([
        supabase.from('crm_leads')
            .select('id, nome, status, prioridade, data_estimada_fechamento, created_at')
            .order('created_at', { ascending: false }),
        supabase.from('tactical_tasks')
            .select('id, title, status, priority, due_date, created_at')
            .order('position', { ascending: true }),
        supabase.from('bula_leiloes')
            .select('id, nome, data, tipo, animais, expectativa, meta_bula, realizado_bula, status, horario, modelo, leiloeira, local, transmissao')
            .order('data', { ascending: true }),
        supabase.from('bula_leilao_fechamento')
            .select('id, nome, data, local, lotes_ofertados, lotes_vendidos, animais_vendidos, vgv_total, ticket_medio, maior_lance, compradores_unicos, estados_alcancados, por_assessor, por_estado, compradores, lances')
            .order('data', { ascending: false })
            .limit(30),
    ]);

    const now = new Date();

    // ── Leilões ─────────────────────────────────────────────────────────────
    const allLeiloes = leiloes ?? [];
    const todayStr = now.toISOString().split('T')[0];
    const upcomingLeiloes = allLeiloes
        .filter(l => (l.data ?? '') >= todayStr && l.status !== 'concluido')
        .sort((a, b) => (a.data ?? '').localeCompare(b.data ?? ''));
    const pastLeiloes = allLeiloes.filter(l => (l.data ?? '') < todayStr || l.status === 'concluido');

    const confirmedCount = upcomingLeiloes.filter(l => l.status === 'confirmado').length;

    const totalAnimaisUpcoming = upcomingLeiloes.reduce((s, l) => s + (l.animais ?? 0), 0);
    const totalMetaBula = upcomingLeiloes
        .filter(l => l.status === 'confirmado')
        .reduce((s, l) => s + (Number(l.meta_bula) || 0), 0);

    const proximoRaw = upcomingLeiloes[0] ?? null;
    const proxParsed = proximoRaw ? parseLeilaoDate(proximoRaw.data, proximoRaw.horario) : null;
    const proximo: ProximoLeilao | null = proximoRaw && proxParsed ? {
        nome: proximoRaw.nome || 'Sem nome',
        tipo: proximoRaw.tipo,
        animais: Number(proximoRaw.animais) || 0,
        meta_bula: Number(proximoRaw.meta_bula) || 0,
        expectativa: Number(proximoRaw.expectativa) || 0,
        horario: proximoRaw.horario,
        leiloeira: proximoRaw.leiloeira,
        local: proximoRaw.local,
        status: proximoRaw.status || 'prospecto',
        data: proximoRaw.data,
        wk: proxParsed.semana,
        day: proxParsed.dia,
        mo: proxParsed.mes,
        targetTs: proxParsed.ts,
        diasParaProximo: daysFromNow(proximoRaw.data),
    } : null;

    const upcoming: ProximoLeilaoRow[] = upcomingLeiloes.slice(0, 6).map((l) => {
        const p = parseLeilaoDate(l.data);
        const meta = Number(l.meta_bula) || 0;
        const exp = Number(l.expectativa) || 0;
        const base = Math.max(meta, exp, 1);
        const pct = Math.round((meta / base) * 100);
        let status: 'ok' | 'warn' | 'pend' = 'pend';
        let statusLabel = 'Em montagem';
        if (l.status === 'confirmado') { status = 'ok'; statusLabel = 'Confirmado'; }
        else if (l.status === 'negociacao') { status = 'warn'; statusLabel = 'Em negociação'; }
        return {
            id: l.id,
            d: p?.dia ?? '—', m: p?.mes ?? '—', wk: p?.semana ?? '—',
            title: l.nome || 'Sem nome',
            type: [l.tipo, l.leiloeira].filter(Boolean).join(' · '),
            status, statusLabel,
            pct: Math.max(0, Math.min(100, pct)),
            animais: Number(l.animais) || 0,
            expectativaLabel: exp > 0 ? `Exp: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(exp)}` : '',
        };
    });

    // ── Fechamentos (aggregates) ────────────────────────────────────────────
    const allFechamentos = fechamentos ?? [];
    const totalVgvFechado = allFechamentos.reduce((s, f) => s + (Number(f.vgv_total) || 0), 0);

    // VGV chart: last 6 calendar months
    const vgvSeries: VgvPoint[] = (() => {
        const months: { key: string; label: string; year: number; month: number }[] = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
                label: MONTH_ABBR[d.getMonth()],
                year: d.getFullYear(),
                month: d.getMonth(),
            });
        }
        const metaByMonth = new Map<string, number>();
        for (const l of upcomingLeiloes) {
            if (l.status !== 'confirmado') continue;
            const k = (l.data ?? '').slice(0, 7);
            metaByMonth.set(k, (metaByMonth.get(k) || 0) + (Number(l.meta_bula) || 0));
        }
        for (const l of pastLeiloes) {
            const k = (l.data ?? '').slice(0, 7);
            metaByMonth.set(k, (metaByMonth.get(k) || 0) + (Number(l.meta_bula) || Number(l.realizado_bula) || 0));
        }
        const vgvByMonth = new Map<string, number>();
        for (const f of allFechamentos) {
            const k = (f.data ?? '').slice(0, 7);
            vgvByMonth.set(k, (vgvByMonth.get(k) || 0) + (Number(f.vgv_total) || 0));
        }
        return months.map(({ key, label, year, month }) => {
            const prevKey = `${year - 1}-${String(month + 1).padStart(2, '0')}`;
            return {
                label,
                meta: (metaByMonth.get(key) || 0) / 1_000_000,
                vgv: (vgvByMonth.get(key) || 0) / 1_000_000,
                prev: (vgvByMonth.get(prevKey) || 0) / 1_000_000,
            };
        });
    })();

    const vgvSpark = vgvSeries.map(p => p.vgv);
    const metaSpark = vgvSeries.map(p => p.meta);

    // Rankings
    const compradorMap = new Map<string, CompradorItem>();
    const ufMap = new Map<string, RegionItem>();
    const allLances: LanceItem[] = [];

    for (const f of allFechamentos) {
        for (const c of ((f.compradores ?? []) as Array<{ fazenda?: string; comprador?: string; uf?: string; vgv?: number; lotes?: number }>)) {
            const key = (c.fazenda || c.comprador || '').trim().toUpperCase();
            if (!key) continue;
            const cur = compradorMap.get(key) ?? { fazenda: c.fazenda || c.comprador || '', uf: c.uf || '', vgv: 0, lotes: 0 };
            cur.vgv += Number(c.vgv) || 0;
            cur.lotes += Number(c.lotes) || 0;
            if (!cur.uf && c.uf) cur.uf = c.uf;
            compradorMap.set(key, cur);
        }
        for (const u of ((f.por_estado ?? []) as Array<{ uf?: string; estado?: string; lotes?: number; vgv?: number }>)) {
            const key = (u.uf || '').trim().toUpperCase();
            if (!key) continue;
            const cur = ufMap.get(key) ?? { uf: u.uf || '', estado: u.estado || '', lotes: 0, vgv: 0, pct: 0 };
            cur.lotes += Number(u.lotes) || 0;
            cur.vgv += Number(u.vgv) || 0;
            ufMap.set(key, cur);
        }
        for (const l of ((f.lances ?? []) as Array<{ lote?: string; fazenda?: string; comprador?: string; uf?: string; vgv?: number }>)) {
            if (!l.vgv) continue;
            allLances.push({
                lote: l.lote || '—',
                fazenda: l.fazenda || l.comprador || '—',
                uf: l.uf || '',
                vgv: Number(l.vgv) || 0,
                leilao: f.nome || '—',
            });
        }
    }

    const topLeiloes: LeilaoTopItem[] = [...allFechamentos]
        .sort((a, b) => (Number(b.vgv_total) || 0) - (Number(a.vgv_total) || 0))
        .slice(0, 5)
        .map(f => ({
            nome: f.nome || '—',
            data: f.data || '',
            vgv: Number(f.vgv_total) || 0,
            lotesVendidos: Number(f.lotes_vendidos) || 0,
            animais: Number(f.animais_vendidos) || 0,
        }));
    const topCompradores = [...compradorMap.values()].sort((a, b) => b.vgv - a.vgv).slice(0, 5);
    const topUFs = [...ufMap.values()].sort((a, b) => b.vgv - a.vgv).slice(0, 8);
    const topLances = allLances.sort((a, b) => b.vgv - a.vgv).slice(0, 5);

    // ── Leads / funnel ──────────────────────────────────────────────────────
    const allLeads = leads ?? [];
    const totalLeads = allLeads.length;
    const leadsByStatus: Record<string, number> = {};
    for (const l of allLeads) leadsByStatus[l.status || 'Sem status'] = (leadsByStatus[l.status || 'Sem status'] || 0) + 1;
    const hotLeads = allLeads.filter(l => l.prioridade === 'Alta').length;
    const activeLeads = totalLeads - (leadsByStatus['Fechado'] || 0);

    // Funnel order: novo → qualificado → proposta → negociação → fechado
    const funnelOrder: { label: string; keys: string[] }[] = [
        { label: 'Capturados', keys: Object.keys(leadsByStatus) }, // total
        { label: 'Qualificados', keys: ['Qualificado', 'Proposta', 'Negociação', 'Fechado'] },
        { label: 'Em proposta', keys: ['Proposta', 'Negociação', 'Fechado'] },
        { label: 'Em negociação', keys: ['Negociação', 'Fechado'] },
        { label: 'Fechados', keys: ['Fechado'] },
    ];
    const funnel: FunnelStep[] = funnelOrder.map((s, i) => {
        const n = i === 0
            ? totalLeads
            : s.keys.reduce((sum, k) => sum + (leadsByStatus[k] || 0), 0);
        const pct = totalLeads > 0 ? (n / totalLeads) * 100 : 0;
        return { label: s.label, n, pct };
    });

    // Leads sparkline: leads criados por dia nos últimos 10 dias
    const nowTs = now.getTime();
    const leadsSpark: number[] = (() => {
        const out = new Array(10).fill(0);
        for (const l of allLeads) {
            const ts = new Date(l.created_at).getTime();
            const daysAgo = Math.floor((nowTs - ts) / 86400000);
            if (daysAgo >= 0 && daysAgo < 10) out[9 - daysAgo]++;
        }
        return out;
    })();

    // ── Tarefas ─────────────────────────────────────────────────────────────
    const allTasks = tasks ?? [];
    const totalTasks = allTasks.length;
    const tasksByStatus: Record<string, number> = {};
    for (const t of allTasks) tasksByStatus[t.status || 'Sem status'] = (tasksByStatus[t.status || 'Sem status'] || 0) + 1;
    const completedTasks = tasksByStatus['Completa'] || 0;
    const pendingTasks = totalTasks - completedTasks;
    const overdueTasks = allTasks.filter(t => {
        const d = daysFromNow(t.due_date);
        return d !== null && d < 0 && t.status !== 'Completa';
    }).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const topTasks: TaskItem[] = allTasks
        .filter(t => t.status !== 'Completa')
        .slice(0, 6)
        .map((t, i) => ({
            id: String(t.id ?? i),
            title: t.title || 'Tarefa sem título',
            due: formatDue(t.due_date),
            prio: t.priority === 'Alta' ? 'hi' : t.priority === 'Média' ? 'md' : 'lo',
            status: t.status || '—',
            done: t.status === 'Completa',
        }));

    // ── Feed ────────────────────────────────────────────────────────────────
    const feed: FeedItem[] = [];
    for (const f of allFechamentos.slice(0, 3)) {
        feed.push({
            id: `f-${f.id}`,
            kind: 'fechamento',
            text: `Leilão <b>${truncate(f.nome, 40)}</b> fechou com <b>${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(Number(f.vgv_total) || 0)}</b> em VGV · ${f.lotes_vendidos || 0} lotes`,
            when: timeAgo(f.data ? f.data + 'T20:00:00' : null),
        });
    }
    for (const l of allLeads.slice(0, 4)) {
        feed.push({
            id: `l-${l.id}`,
            kind: 'lead',
            text: `<b>${truncate(l.nome, 30) || 'Lead'}</b> entrou no CRM${l.status ? ` · status <b>${l.status}</b>` : ''}${l.prioridade === 'Alta' ? ' · <b>prioridade alta</b>' : ''}`,
            when: timeAgo(l.created_at),
        });
    }
    feed.sort((a, b) => (a.when === 'agora' ? -1 : 0) - (b.when === 'agora' ? -1 : 0));
    const feedTop = feed.slice(0, 7);

    // ── AI insight ──────────────────────────────────────────────────────────
    const pctMeta = totalMetaBula > 0 ? (totalVgvFechado / totalMetaBula) * 100 : 0;
    const projection = totalVgvFechado > 0 && totalMetaBula > 0
        ? totalVgvFechado + (totalMetaBula - totalVgvFechado) * Math.min(1.1, Math.max(0.5, totalVgvFechado / totalMetaBula + 0.1))
        : Math.max(totalMetaBula, totalVgvFechado);
    const aiHint = upcomingLeiloes.length > 0
        ? `${upcomingLeiloes.length} leilão(ões) no pipeline · próximo: ${proximo?.nome ?? '—'} (${proximo?.diasParaProximo ?? '?'} dias). Priorize follow-up com os ${hotLeads} leads quentes.`
        : `Sem leilões agendados no pipeline. ${activeLeads} leads ativos aguardam contato — ${hotLeads} prioridade alta.`;

    const today = now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    const todayFmt = today.charAt(0).toUpperCase() + today.slice(1);

    const props: DashboardProps = {
        today: todayFmt,
        proximo,
        upcoming,
        kpi: {
            upcomingCount: upcomingLeiloes.length,
            confirmedCount,
            totalMetaBula,
            totalAnimaisUpcoming,
            totalVgvFechado,
            totalFechamentos: allFechamentos.length,
            activeLeads,
            hotLeads,
            totalLeads,
            pendingTasks,
            overdueTasks,
            completionRate,
            vgvSpark,
            metaSpark,
            leadsSpark,
        },
        vgv: vgvSeries,
        funnel,
        feed: feedTop,
        tasks: topTasks,
        regions: topUFs,
        rankings: {
            topLeiloes,
            compradores: topCompradores,
            lances: topLances,
        },
        aiInsight: {
            projection,
            metaTotal: totalMetaBula,
            pct: pctMeta,
            hint: aiHint,
        },
    };

    return <DashboardClient {...props} />;
}
