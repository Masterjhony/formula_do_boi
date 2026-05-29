import { createClient } from '@/utils/supabase/server';
import DashboardClient, {
    type DashboardProps,
    type FunnelStep,
    type FeedItem,
    type CatCount,
    type ReservaStatusItem,
} from './DashboardClient';

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

// ───────────────────────────────────────────────────────────────────────────

export default async function AdminDashboard() {
    const supabase = await createClient();

    const [
        { data: leads },
        { data: produtos },
        { data: reservas },
        { data: reservaCols },
    ] = await Promise.all([
        supabase.from('crm_leads')
            .select('id, nome, status, prioridade, data_estimada_fechamento, created_at')
            .order('created_at', { ascending: false }),
        supabase.from('products').select('id, category'),
        supabase.from('product_reservations')
            .select('id, status, total_value, created_at')
            .is('archived_at', null),
        supabase.from('reserva_kanban_columns')
            .select('id, title, position')
            .order('position', { ascending: true }),
    ]);

    const now = new Date();

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
    const leads7d = allLeads.filter(l => (nowTs - new Date(l.created_at).getTime()) < 7 * 86400000).length;

    // ── Feed (leads) ──────────────────────────────────────────────────────────
    const feed: FeedItem[] = [];
    for (const l of allLeads.slice(0, 10)) {
        feed.push({
            id: `l-${l.id}`,
            kind: 'lead',
            text: `<b>${truncate(l.nome, 30) || 'Lead'}</b> entrou no CRM${l.status ? ` · status <b>${l.status}</b>` : ''}${l.prioridade === 'Alta' ? ' · <b>prioridade alta</b>' : ''}`,
            when: timeAgo(l.created_at),
        });
    }

    // ── Produtos & Reservas (operação Fórmula do Boi) ───────────────────────
    const allProdutos = produtos ?? [];
    const produtoCatMap = new Map<string, number>();
    for (const p of allProdutos) {
        const cat = (p.category || '').trim() || 'Sem categoria';
        produtoCatMap.set(cat, (produtoCatMap.get(cat) || 0) + 1);
    }
    const produtosByCategory: CatCount[] = [...produtoCatMap.entries()]
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

    const allReservas = reservas ?? [];
    const cols = reservaCols ?? [];
    const colTitle = new Map(cols.map(c => [c.id, c.title]));
    const firstColId = cols[0]?.id ?? 'nova';
    const reservaStatusMap = new Map<string, { count: number; valor: number }>();
    for (const r of allReservas) {
        const st = r.status || firstColId;
        const cur = reservaStatusMap.get(st) ?? { count: 0, valor: 0 };
        cur.count += 1;
        cur.valor += Number(r.total_value) || 0;
        reservaStatusMap.set(st, cur);
    }
    const reservasByStatus: ReservaStatusItem[] = [...reservaStatusMap.entries()]
        .map(([status, v]) => ({
            status,
            label: colTitle.get(status) || status,
            count: v.count,
            valor: v.valor,
        }))
        .sort((a, b) => {
            const ia = cols.findIndex(c => c.id === a.status);
            const ib = cols.findIndex(c => c.id === b.status);
            return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
        });
    const reservasAtivas = allReservas.length;
    const reservasValor = allReservas.reduce((s, r) => s + (Number(r.total_value) || 0), 0);

    const today = now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    const todayFmt = today.charAt(0).toUpperCase() + today.slice(1);

    const props: DashboardProps = {
        today: todayFmt,
        kpi: {
            activeLeads,
            hotLeads,
            totalLeads,
            leads7d,
            leadsSpark,
        },
        funnel,
        feed,
        formula: {
            produtosTotal: allProdutos.length,
            produtosByCategory,
            reservasAtivas,
            reservasValor,
            reservasByStatus,
        },
    };

    return <DashboardClient {...props} />;
}
