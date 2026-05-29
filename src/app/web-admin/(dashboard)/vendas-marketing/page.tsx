import { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import {
    Users, Target, MessageSquare, ArrowRight, TrendingUp, TrendingDown, CheckCircle2,
    Sparkles, ChevronRight, Activity, Trophy, Lightbulb, BarChart3,
    Crown, Zap, Megaphone, Hourglass, Flame, Calendar, DollarSign, MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { FunnelChart } from '@/components/charts/FunnelChart';
import { GrowthDateFilter } from '@/components/admin/growth/GrowthDateFilter';
import { LeadsRegionMap } from '@/components/admin/growth/LeadsRegionMap';

// ── Brandbook V1.0 ──────────────────────────────────────────────────────────────
const BRAND = {
    BRONZE: '#A0792E',
    BRONZE_DEEP: '#6B4F1E',
    BRONZE_PALE: '#D4A85C',
    TECH_GREEN: '#7FD4A0',
    TECH_BLUE: '#1E3A5F',
    LOSS: '#A04545',
} as const;

const FUNNEL_PIPELINE = ['Lead', 'Qualificado', 'Proposta', 'Negociação', 'Fechado'];
const STALLED_STAGES = ['Qualificado', 'Proposta', 'Negociação'];
const STALLED_DAYS = 30;

const card = 'rounded-2xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#161616]';
const labelCls = 'text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400';
const dataCls = 'font-mono tabular-nums';

const fmtPct = (v: number) => `${v.toFixed(0)}%`;
const fmtSignedPct = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(0)}%`;

const fmtBRL = (v: number) => {
    if (!v) return 'R$ 0';
    if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(2).replace('.', ',')}M`;
    if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}k`;
    return `R$ ${v.toLocaleString('pt-BR')}`;
};

// BRL exato (sem abreviar k/M) — pra valores de investimento, CPL e CP MQL
const fmtMoney = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });

const fmtDateBR = (d: string) => {
    const [y, m, day] = d.slice(0, 10).split('-');
    return `${day}/${m}/${y.slice(2)}`;
};

const DAY = 86400000;

// Distribui timestamps em N baldes uniformes ao longo de [startMs, endMs].
function buildSeries(timestamps: number[], startMs: number, endMs: number, buckets = 30): number[] {
    const span = Math.max(endMs - startMs, 1);
    const out = new Array(buckets).fill(0);
    for (const t of timestamps) {
        if (t < startMs || t > endMs) continue;
        let idx = Math.floor(((t - startMs) / span) * buckets);
        if (idx >= buckets) idx = buckets - 1;
        if (idx < 0) idx = 0;
        out[idx] += 1;
    }
    return out;
}

// ── Normalização estado → UF (aceita sigla ou nome por extenso) ──────────────
const UF_SET = new Set([
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]);
const NAME_TO_UF: Record<string, string> = {
    'acre': 'AC', 'alagoas': 'AL', 'amapa': 'AP', 'amazonas': 'AM', 'bahia': 'BA',
    'ceara': 'CE', 'distrito federal': 'DF', 'espirito santo': 'ES', 'goias': 'GO',
    'maranhao': 'MA', 'mato grosso': 'MT', 'mato grosso do sul': 'MS', 'minas gerais': 'MG',
    'para': 'PA', 'paraiba': 'PB', 'parana': 'PR', 'pernambuco': 'PE', 'piaui': 'PI',
    'rio de janeiro': 'RJ', 'rio grande do norte': 'RN', 'rio grande do sul': 'RS',
    'rondonia': 'RO', 'roraima': 'RR', 'santa catarina': 'SC', 'sao paulo': 'SP',
    'sergipe': 'SE', 'tocantins': 'TO',
};
function normalizeUf(estado: string | null | undefined): string | null {
    if (!estado) return null;
    const raw = estado.toString().trim();
    if (!raw) return null;
    const upper = raw.toUpperCase();
    if (raw.length === 2 && UF_SET.has(upper)) return upper;
    const key = raw.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    return NAME_TO_UF[key] ?? (UF_SET.has(upper) ? upper : null);
}

// Rótulos amigáveis pros enums do quiz (`public/lp/index.html`)
const MOMENTO_LABELS: Record<string, string> = {
    'nao-trabalho-quero-aprender': 'Quer aprender',
    'pecuaria-de-corte':           'Corte',
    'corte-e-po':                  'Corte + P.O.',
    'criador-renomado-po':         'Criador P.O.',
};

// ── Sparkline server-side (pure SVG) ─────────────────────────────────────────
function Sparkline({ data, color, height = 44 }: { data: number[]; color: string; height?: number }) {
    if (data.length === 0) return null;
    const max = Math.max(...data, 1);
    const w = 100;
    const stepX = data.length > 1 ? w / (data.length - 1) : 0;
    const points = data.map((v, i) => `${(i * stepX).toFixed(2)},${(height - (v / max) * height).toFixed(2)}`).join(' ');
    const lastX = (data.length - 1) * stepX;
    const lastY = height - (data[data.length - 1] / max) * height;
    const id = `spk-${color.replace(/[^a-z0-9]/gi, '')}`;
    return (
        <svg viewBox={`0 0 ${w} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
            <defs>
                <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={`0,${height} ${points} ${w},${height}`} fill={`url(#${id})`} />
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
            />
            <circle cx={lastX} cy={lastY} r="1.6" fill={color} />
        </svg>
    );
}

// Snapshot do Meta Ads — espelho da tabela `meta_ads_insights`
interface MetaInsightRow {
    scope: string; campaign_id: string; campaign_name: string | null;
    account_name: string | null;
    period: string; date_start: string | null; date_stop: string | null;
    investimento: number | string; leads: number;
    cpl: number | string | null; impressions: number; clicks: number;
    cpc: number | string | null; ctr: number | string | null; reach: number | null;
    captured_at: string;
}

type SearchParams = Record<string, string | string[] | undefined>;

export default async function VendasMarketingPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
    const sp = await searchParams;
    const range = typeof sp.range === 'string' ? sp.range : '';
    const from = typeof sp.from === 'string' ? sp.from : '';
    const to = typeof sp.to === 'string' ? sp.to : '';

    const supabase = await createClient();
    const now = new Date();
    const nowMs = now.getTime();

    // ───── Janela de análise (filtro de data) ─────
    const startOfMonthMs = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    let rangeStartMs: number | null;
    let rangeEndMs = nowMs;
    let periodLabel: string;

    if (from && to) {
        rangeStartMs = new Date(`${from}T00:00:00`).getTime();
        rangeEndMs = new Date(`${to}T23:59:59`).getTime();
        periodLabel = `${fmtDateBR(from)} – ${fmtDateBR(to)}`;
    } else {
        switch (range) {
            case '7d':  rangeStartMs = nowMs - 7 * DAY;  periodLabel = 'Últimos 7 dias'; break;
            case '90d': rangeStartMs = nowMs - 90 * DAY; periodLabel = 'Últimos 90 dias'; break;
            case 'mes': rangeStartMs = startOfMonthMs;   periodLabel = 'Este mês'; break;
            case 'tudo': rangeStartMs = null;            periodLabel = 'Todo o histórico'; break;
            default:    rangeStartMs = nowMs - 30 * DAY; periodLabel = 'Últimos 30 dias'; break;
        }
    }

    const fetchSinceISO = new Date(rangeStartMs ?? nowMs - 365 * DAY).toISOString();

    const [
        { data: leads },
        { data: whatsappMessages },
        { data: metaInsightsRaw },
    ] = await Promise.all([
        supabase.from('crm_leads').select(`
            id, nome, status, prioridade, data_estimada_fechamento, created_at, updated_at,
            valor_estimado, origem, source, medium, campaign,
            is_mql, momento_pecuaria, quantidade_animais,
            estado, cidade, responsavel, celular, telefone
        `).order('created_at', { ascending: false }),
        supabase.from('whatsapp_messages')
            .select('id, status, direction, created_at')
            .gte('created_at', fetchSinceISO)
            .order('created_at', { ascending: false })
            .limit(4000),
        supabase.from('meta_ads_insights')
            .select('scope, campaign_id, campaign_name, account_name, period, date_start, date_stop, investimento, leads, cpl, impressions, clicks, cpc, ctr, reach, captured_at')
            .eq('period', 'lifetime'),
    ]);

    const allLeads = leads ?? [];

    // ───── Filtro pelo período ─────
    const inPeriod = (iso: string) => {
        const t = new Date(iso).getTime();
        return (rangeStartMs === null || t >= rangeStartMs) && t <= rangeEndMs;
    };
    const pLeads = allLeads.filter(l => inPeriod(l.created_at));
    const totalLeads = pLeads.length;

    const earliestLeadMs = allLeads.length
        ? Math.min(...allLeads.map(l => new Date(l.created_at).getTime()))
        : nowMs - 30 * DAY;
    const seriesStartMs = rangeStartMs ?? earliestLeadMs;

    // Janela anterior equivalente (para o delta de tendência)
    const winMs = rangeEndMs - seriesStartMs;
    const prevStartMs = seriesStartMs - winMs;
    const prevWindow = rangeStartMs === null
        ? 0
        : allLeads.filter(l => {
            const t = new Date(l.created_at).getTime();
            return t >= prevStartMs && t < seriesStartMs;
        }).length;
    const trendDelta = prevWindow > 0 ? ((totalLeads - prevWindow) / prevWindow) * 100 : 0;

    // Stats absolutos de contexto (independem do filtro)
    const leads7d = allLeads.filter(l => new Date(l.created_at).getTime() >= nowMs - 7 * DAY).length;
    const leadsMonth = allLeads.filter(l => new Date(l.created_at).getTime() >= startOfMonthMs).length;

    // ───── Série diária do período ─────
    const dailyLeads = buildSeries(pLeads.map(l => new Date(l.created_at).getTime()), seriesStartMs, rangeEndMs, 30);
    const dailyAvg = dailyLeads.reduce((s, n) => s + n, 0) / 30;

    // ───── Status / pipeline (período) ─────
    const closedLeads = pLeads.filter(l => l.status === 'Fechado').length;
    const lostLeads = pLeads.filter(l => l.status === 'Perdido').length;
    const activeLeads = totalLeads - closedLeads - lostLeads;
    const conversionRate = totalLeads > 0 ? (closedLeads / totalLeads) * 100 : 0;

    const pipelineValue = pLeads
        .filter(l => l.status !== 'Fechado' && l.status !== 'Perdido')
        .reduce((s, l) => s + (Number(l.valor_estimado) || 0), 0);

    // closingSoon e aging são saúde de pipeline (não-coorte): calculados sobre todos
    const closingSoon = allLeads.filter(l => {
        if (!l.data_estimada_fechamento) return false;
        const diff = Math.ceil((new Date(l.data_estimada_fechamento).getTime() - nowMs) / DAY);
        return diff >= 0 && diff <= 7;
    }).length;

    // ───── MQL (período) ─────
    const mqlPeriod = pLeads.filter(l => !!l.is_mql);
    const mqlCount = mqlPeriod.length;
    const mqlShare = totalLeads > 0 ? (mqlCount / totalLeads) * 100 : 0;
    const mqlClosed = mqlPeriod.filter(l => l.status === 'Fechado').length;
    const mqlLost   = mqlPeriod.filter(l => l.status === 'Perdido').length;
    const mqlActive = mqlCount - mqlClosed - mqlLost;
    const mqlConv = mqlCount > 0 ? (mqlClosed / mqlCount) * 100 : 0;
    // Para CP MQL pareado ao investimento lifetime do Meta Ads
    const mqlAllTime = allLeads.filter(l => !!l.is_mql).length;

    // ───── Velocity (lead → fechado, em dias) — período ─────
    const closedWithDates = pLeads.filter(l => l.status === 'Fechado' && l.created_at && l.updated_at);
    const velocityDays = closedWithDates.length > 0
        ? closedWithDates.reduce((s, l) => {
            const days = (new Date(l.updated_at).getTime() - new Date(l.created_at).getTime()) / DAY;
            return s + Math.max(days, 0);
        }, 0) / closedWithDates.length
        : 0;

    // ───── Funil tradicional (status canônicos) ─────
    const funnelCounts = FUNNEL_PIPELINE.map(s => pLeads.filter(l => l.status === s).length);
    const funnelTop = funnelCounts[0] || 1;

    // ───── Funil de aquisição (Captados → MQL → Negociação → Cliente) ─────
    const negociacaoOuPlus = pLeads.filter(l => ['Negociação', 'Proposta', 'Fechado'].includes(l.status)).length;
    const acquisitionFunnel = [
        { label: 'Captados', count: totalLeads },
        { label: 'MQL', count: mqlCount },
        { label: 'Em negociação', count: negociacaoOuPlus },
        { label: 'Cliente', count: closedLeads },
    ];

    // ───── Aging — leads parados > 30d em etapas intermediárias (global) ─────
    const stalledByStage: Record<string, number> = Object.fromEntries(STALLED_STAGES.map(s => [s, 0]));
    const stalledMs = STALLED_DAYS * DAY;
    for (const l of allLeads) {
        if (!STALLED_STAGES.includes(l.status)) continue;
        const ref = new Date(l.updated_at || l.created_at).getTime();
        if (nowMs - ref >= stalledMs) stalledByStage[l.status] += 1;
    }
    const totalStalled = Object.values(stalledByStage).reduce((s, n) => s + n, 0);

    // ───── Canais & campanhas (período) ─────
    const channelCounts: Record<string, number> = {};
    for (const l of pLeads) {
        const k = (l.source || l.origem || 'direta').toString().toLowerCase();
        channelCounts[k] = (channelCounts[k] || 0) + 1;
    }
    const topChannels = Object.entries(channelCounts).sort(([, a], [, b]) => b - a).slice(0, 5);
    const channelsTotal = topChannels.reduce((s, [, n]) => s + n, 0) || 1;

    const campaignCounts: Record<string, number> = {};
    for (const l of pLeads) {
        const c = (l.campaign || '').toString().trim();
        if (!c || c === '(not set)' || c === '(historical-no-utm)') continue;
        campaignCounts[c] = (campaignCounts[c] || 0) + 1;
    }
    const topCampaigns = Object.entries(campaignCounts).sort(([, a], [, b]) => b - a).slice(0, 5);
    const maxCampaign = topCampaigns[0]?.[1] || 1;

    // ───── Audiência — momento_pecuaria (período) ─────
    const momentoCounts: Record<string, number> = {};
    let momentoTotal = 0;
    for (const l of pLeads) {
        const k = (l.momento_pecuaria || '').toString();
        if (!k) continue;
        momentoCounts[k] = (momentoCounts[k] || 0) + 1;
        momentoTotal += 1;
    }
    const momentoSorted = Object.entries(momentoCounts).sort(([, a], [, b]) => b - a);

    // ───── Leads por região — UF (período) ─────
    const byUf: Record<string, number> = {};
    let unknownUf = 0;
    for (const l of pLeads) {
        const uf = normalizeUf(l.estado);
        if (uf) byUf[uf] = (byUf[uf] || 0) + 1;
        else unknownUf += 1;
    }

    // ───── Porte do rebanho — distribuição por quantidade_animais (período) ─────
    const HERD_BUCKETS: { label: string; min: number; max: number; mql: boolean }[] = [
        { label: 'Até 50 cab.',    min: 1,    max: 50,       mql: false },
        { label: '51–100 cab.',    min: 51,   max: 100,      mql: false },
        { label: '101–300 cab.',   min: 101,  max: 300,      mql: true  },
        { label: '301–1.000 cab.', min: 301,  max: 1000,     mql: true  },
        { label: 'Acima de 1.000', min: 1001, max: Infinity, mql: true  },
    ];
    const herdCounts = HERD_BUCKETS.map(b => ({
        ...b,
        count: pLeads.filter(l => {
            const n = Number(l.quantidade_animais) || 0;
            return n >= b.min && n <= b.max;
        }).length,
    }));
    const herdInformed = herdCounts.reduce((s, b) => s + b.count, 0);
    const herdUnknown = Math.max(totalLeads - herdInformed, 0);
    const herdMqlGrade = herdCounts.filter(b => b.mql).reduce((s, b) => s + b.count, 0);
    const herdMqlShare = herdInformed > 0 ? (herdMqlGrade / herdInformed) * 100 : 0;
    const maxHerd = Math.max(...herdCounts.map(b => b.count), 1);

    // ───── WhatsApp engagement (período) ─────
    const allWpp = whatsappMessages ?? [];
    const wppPeriod = allWpp.filter(m => inPeriod(m.created_at));
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const wppToday = allWpp.filter(m => new Date(m.created_at).getTime() >= todayStart).length;
    const wppTotal = wppPeriod.length;
    const wppOut = wppPeriod.filter(m => m.direction === 'outbound' || !m.direction).length;
    const wppIn  = wppPeriod.filter(m => m.direction === 'inbound').length;
    const wppSentRate = wppPeriod.length > 0
        ? (wppPeriod.filter(m => m.status === 'sent').length / wppPeriod.length) * 100
        : 0;
    const wppReplyRate = wppOut > 0 ? (wppIn / wppOut) * 100 : 0;
    const dailyWpp = buildSeries(wppPeriod.map(m => new Date(m.created_at).getTime()), seriesStartMs, rangeEndMs, 30);

    // ───── Desempenho por responsável (período) ─────
    const repMap = new Map<string, { name: string; total: number; closed: number; pipeline: number }>();
    for (const l of pLeads) {
        const name = (l.responsavel || '').toString().trim();
        if (!name) continue;
        const cur = repMap.get(name) ?? { name, total: 0, closed: 0, pipeline: 0 };
        cur.total += 1;
        if (l.status === 'Fechado') cur.closed += 1;
        else if (l.status !== 'Perdido') cur.pipeline += Number(l.valor_estimado) || 0;
        repMap.set(name, cur);
    }
    const reps = [...repMap.values()]
        .map(r => ({ ...r, conv: r.total > 0 ? (r.closed / r.total) * 100 : 0 }))
        .sort((a, b) => b.closed - a.closed || b.total - a.total)
        .slice(0, 6);
    const maxRepTotal = Math.max(...reps.map(r => r.total), 1);

    // ───── Hot leads / recentes (período) ─────
    const hotLeads = mqlPeriod
        .filter(l => l.status !== 'Fechado' && l.status !== 'Perdido')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
    const recentLeads = pLeads.slice(0, 6);

    // ───── Meta Ads — investimento / leads / CPL / CP MQL ─────
    const metaRows = (metaInsightsRaw ?? []) as MetaInsightRow[];
    const metaAccount = metaRows.find(r => r.scope === 'account') ?? null;
    const metaCampaigns = metaRows
        .filter(r => r.scope === 'campaign')
        .sort((a, b) => Number(b.investimento) - Number(a.investimento));
    const metaMaxInvest = Math.max(...metaCampaigns.map(c => Number(c.investimento)), 1);
    const cpMql = metaAccount && mqlAllTime > 0 ? Number(metaAccount.investimento) / mqlAllTime : null;

    // ───── Insights derivados ─────
    const insights: { kind: 'positive' | 'attention' | 'opportunity'; title: string; body: string; cta: string; href: string }[] = [];

    if (mqlCount > 0 && mqlConv >= 25) {
        insights.push({
            kind: 'positive',
            title: `MQLs convertem ${fmtPct(mqlConv)}`,
            body: `${mqlClosed} de ${mqlCount} MQLs viraram cliente — ${(mqlConv / Math.max(conversionRate, 1)).toFixed(1)}× a conversão geral. Priorize captação no perfil ≥100 cabeças.`,
            cta: 'Ver MQLs', href: '/crm',
        });
    }
    if (closingSoon > 0) {
        insights.push({
            kind: 'opportunity',
            title: `${closingSoon} ${closingSoon === 1 ? 'lead' : 'leads'} fecha${closingSoon === 1 ? '' : 'ndo'} em 7 dias`,
            body: `Pipeline de ${fmtBRL(pipelineValue)}. Priorize esses contatos hoje.`,
            cta: 'Abrir CRM', href: '/crm',
        });
    }
    if (totalStalled >= 5) {
        insights.push({
            kind: 'attention',
            title: `${totalStalled} leads parados há +${STALLED_DAYS} dias`,
            body: `Sem movimento em Qualificado/Proposta/Negociação. Cadência de contato está quebrando o pipeline.`,
            cta: 'Revisar pipeline', href: '/crm',
        });
    }
    if (trendDelta >= 20) {
        insights.push({
            kind: 'positive',
            title: `Captação acelerando · ${fmtSignedPct(trendDelta)}`,
            body: `${totalLeads} leads no período versus ${prevWindow} no período anterior.`,
            cta: 'Ver canais', href: '/crm',
        });
    } else if (trendDelta <= -20 && prevWindow > 5) {
        insights.push({
            kind: 'attention',
            title: `Captação em queda · ${fmtSignedPct(trendDelta)}`,
            body: `${totalLeads} leads versus ${prevWindow} no período anterior. Avalie investimento em mídia.`,
            cta: 'Revisar campanhas', href: '/crm',
        });
    }
    if (cpMql != null && cpMql > 0) {
        insights.push({
            kind: 'opportunity',
            title: `CP MQL em ${fmtMoney(cpMql)}`,
            body: `${mqlAllTime} MQLs sobre ${fmtMoney(Number(metaAccount!.investimento))} investidos em mídia. Acompanhe versus o ticket médio fechado.`,
            cta: 'Ver mídia', href: '#investimento-midia',
        });
    }
    if (insights.length === 0) {
        insights.push({
            kind: 'opportunity',
            title: 'Pipeline equilibrado',
            body: `${activeLeads} leads em negociação. Mantenha cadência de contatos.`,
            cta: 'Abrir CRM', href: '/crm',
        });
    }

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col gap-4 pb-5 border-b border-gray-200 dark:border-[#2A2A2A]">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl border" style={{ borderColor: `${BRAND.BRONZE}4D`, backgroundColor: `${BRAND.BRONZE}14` }}>
                            <BarChart3 className="w-5 h-5" style={{ color: BRAND.BRONZE }} />
                        </div>
                        <div>
                            <p className={labelCls}>§ Vendas & Marketing</p>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Painel de Growth</h1>
                            <p className="text-sm text-gray-500 mt-0.5">Aquisição, conversão, monetização e engajamento — uma página, contexto completo.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/crm" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all hover:shadow-sm"
                            style={{ borderColor: `${BRAND.BRONZE}4D`, color: BRAND.BRONZE, backgroundColor: `${BRAND.BRONZE}0F` }}>
                            <Users size={13} /> Abrir CRM
                        </Link>
                        <Link href="/whatsapp" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all hover:shadow-sm"
                            style={{ borderColor: `${BRAND.TECH_GREEN}4D`, color: BRAND.TECH_GREEN, backgroundColor: `${BRAND.TECH_GREEN}0F` }}>
                            <MessageSquare size={13} /> WhatsApp
                        </Link>
                    </div>
                </div>

                {/* Filtro de data */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <Suspense fallback={<div className="h-8" />}>
                        <GrowthDateFilter />
                    </Suspense>
                    <span className="text-[11px] text-gray-500">
                        Período: <span className="font-bold text-gray-700 dark:text-gray-300">{periodLabel}</span>
                        {' · '}<span className={dataCls}>{totalLeads}</span> leads
                    </span>
                </div>
            </div>

            {/* Hero KPIs — pivotados pra growth */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {([
                    {
                        label: `Leads · ${periodLabel}`,
                        value: totalLeads.toLocaleString('pt-BR'),
                        deltaPct: trendDelta,
                        sub: `${leads7d} em 7d · ${leadsMonth} no mês · ${prevWindow} no período anterior`,
                        icon: Users, accent: BRAND.BRONZE, big: true,
                    },
                    {
                        label: 'MQLs · período',
                        value: mqlCount.toLocaleString('pt-BR'),
                        sub: `${fmtPct(mqlShare)} dos novos · ${mqlActive} no pipeline · ≥100 cab.`,
                        icon: Crown, accent: BRAND.BRONZE_PALE,
                    },
                    {
                        label: 'Conversão MQL → Cliente',
                        value: mqlCount > 0 ? fmtPct(mqlConv) : '—',
                        sub: mqlCount > 0
                            ? `${mqlClosed}/${mqlCount} MQLs · ${fmtPct(conversionRate)} geral`
                            : 'Sem MQLs no período',
                        icon: CheckCircle2, accent: BRAND.TECH_GREEN,
                    },
                    {
                        label: 'Velocity · Lead → Fechado',
                        value: closedLeads > 0 ? `${velocityDays.toFixed(0)}d` : '—',
                        sub: closedLeads > 0
                            ? `Média de ${closedLeads} fechamentos · pipeline ${fmtBRL(pipelineValue)}`
                            : 'Sem fechamentos no período',
                        icon: Zap, accent: BRAND.TECH_BLUE,
                    },
                ]).map(({ label, value, sub, icon: Icon, accent, big, deltaPct }) => {
                    const TrendIcon = (deltaPct ?? 0) >= 0 ? TrendingUp : TrendingDown;
                    const deltaColor = (deltaPct ?? 0) >= 0 ? BRAND.TECH_GREEN : BRAND.LOSS;
                    return (
                        <div key={label} className={`${card} p-5 relative overflow-hidden transition-all hover:shadow-md`}
                            style={big ? { borderColor: `${accent}4D`, background: `linear-gradient(135deg, ${accent}10, transparent 60%)` } : undefined}>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: `${accent}1F`, color: accent }}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <span className={labelCls}>{label}</span>
                                {deltaPct !== undefined && prevWindow > 0 && (
                                    <span className="ml-auto inline-flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded"
                                        style={{ color: deltaColor, backgroundColor: `${deltaColor}14` }}>
                                        <TrendIcon size={10} />
                                        {fmtSignedPct(deltaPct)}
                                    </span>
                                )}
                            </div>
                            <p className={`text-3xl font-black text-gray-900 dark:text-white leading-none ${dataCls}`}>{value}</p>
                            <p className="text-[11px] text-gray-500 mt-2">{sub}</p>
                        </div>
                    );
                })}
            </div>

            {/* Tendência diária + Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
                <div className={`${card} p-5`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Calendar size={14} style={{ color: BRAND.BRONZE }} />
                            <div>
                                <p className={labelCls}>Tendência · {periodLabel}</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                                    Pico:{' '}
                                    <span className={`${dataCls} text-[#A0792E]`}>{Math.max(...dailyLeads)}</span>
                                    {' '}leads/intervalo · Média:{' '}
                                    <span className={dataCls}>{dailyAvg.toFixed(1)}</span>
                                </p>
                            </div>
                        </div>
                        <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: BRAND.BRONZE }}>
                            {totalLeads} no período
                        </span>
                    </div>
                    <Sparkline data={dailyLeads} color={BRAND.BRONZE} height={56} />
                    <div className="flex justify-between mt-2 text-[9px] text-gray-400 font-mono">
                        <span>{fmtDateBR(new Date(seriesStartMs).toISOString())}</span>
                        <span>{fmtDateBR(new Date((seriesStartMs + rangeEndMs) / 2).toISOString())}</span>
                        <span>{fmtDateBR(new Date(rangeEndMs).toISOString())}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    {insights.slice(0, 3).map((ins, i) => {
                        const accent = ins.kind === 'positive' ? BRAND.TECH_GREEN : ins.kind === 'attention' ? BRAND.LOSS : BRAND.BRONZE;
                        const Icon = ins.kind === 'positive' ? TrendingUp : ins.kind === 'attention' ? Activity : Lightbulb;
                        return (
                            <Link key={i} href={ins.href} className={`${card} p-3 group transition-all hover:shadow-md flex items-start gap-2.5`}
                                style={{ borderColor: `${accent}4D` }}>
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}1F`, color: accent }}>
                                    <Icon size={13} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-bold text-gray-900 dark:text-white leading-tight">{ins.title}</p>
                                    <p className="text-[10px] text-gray-500 leading-relaxed mt-0.5">{ins.body}</p>
                                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider mt-1.5" style={{ color: accent }}>
                                        {ins.cta} <ArrowRight size={9} />
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Funil de Aquisição — Captados → MQL → Negociação → Cliente */}
            <div className={`${card} p-5`}>
                <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                    <div>
                        <p className={labelCls}>Funil de aquisição · {periodLabel}</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                            <span className={`${dataCls} text-[#A0792E]`}>{totalLeads}</span> leads captados ·
                            {' '}<span className={`${dataCls}`} style={{ color: BRAND.BRONZE_PALE }}>{mqlCount}</span> qualificados como MQL ·
                            {' '}<span className={`${dataCls}`} style={{ color: BRAND.TECH_GREEN }}>{closedLeads}</span> clientes
                        </p>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded-full" style={{ backgroundColor: `${BRAND.LOSS}1F`, color: BRAND.LOSS }}>
                        <span className={dataCls}>{lostLeads}</span> perdidos
                    </span>
                </div>
                <FunnelChart stages={acquisitionFunnel} />
            </div>

            {/* Funil tradicional CRM + Aging */}
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4">
                <div className={`${card} p-5`}>
                    <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                        <div>
                            <p className={labelCls}>Pipeline comercial</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                                {totalLeads} leads · <span className={`${dataCls} text-[#A0792E]`}>{conversionRate.toFixed(0)}%</span> fecham
                            </p>
                        </div>
                        <span className={`text-[10px] px-2.5 py-1 rounded-full ${dataCls}`}
                            style={{ backgroundColor: `${BRAND.BRONZE}14`, color: BRAND.BRONZE }}>
                            {activeLeads} ativos
                        </span>
                    </div>
                    <FunnelChart
                        stages={FUNNEL_PIPELINE.map((stage, i) => ({ label: stage, count: funnelCounts[i] }))}
                        totalForPct={totalLeads || funnelTop}
                    />
                </div>

                {/* Aging — leads parados */}
                <div className={`${card} p-5`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Hourglass size={14} style={{ color: BRAND.LOSS }} />
                            <div>
                                <p className={labelCls}>Aging do funil</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                                    Sem movimento há +{STALLED_DAYS}d
                                </p>
                            </div>
                        </div>
                        <span className={`text-[10px] font-bold ${dataCls}`} style={{ color: BRAND.LOSS }}>
                            {totalStalled} parados
                        </span>
                    </div>
                    {totalStalled === 0 ? (
                        <div className="py-8 text-center">
                            <CheckCircle2 size={20} className="mx-auto mb-2 opacity-40" style={{ color: BRAND.TECH_GREEN }} />
                            <p className="text-xs text-gray-400">Pipeline saudável — nenhum lead estagnado.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {STALLED_STAGES.map(stage => {
                                const count = stalledByStage[stage] || 0;
                                const stageTotal = allLeads.filter(l => l.status === stage).length;
                                const pct = stageTotal > 0 ? (count / stageTotal) * 100 : 0;
                                return (
                                    <div key={stage}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{stage}</span>
                                            <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
                                                <span className={`${dataCls} font-bold`} style={{ color: count > 0 ? BRAND.LOSS : BRAND.TECH_GREEN }}>
                                                    {count}
                                                </span>
                                                <span className={dataCls}>/ {stageTotal}</span>
                                                <span className={`${dataCls}`}>({pct.toFixed(0)}%)</span>
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-[#262626] overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-700"
                                                style={{ width: `${pct}%`, backgroundColor: pct > 30 ? BRAND.LOSS : BRAND.BRONZE, opacity: 0.85 }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Leads por região — mapa */}
            <div className={`${card} p-5`}>
                <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <MapPin size={14} style={{ color: BRAND.BRONZE }} />
                        <div>
                            <p className={labelCls}>Leads por região · {periodLabel}</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                                Distribuição geográfica da captação
                            </p>
                        </div>
                    </div>
                    <Link href="/crm" className="text-[10px] font-bold uppercase tracking-wider hover:opacity-80 transition-opacity flex items-center gap-1" style={{ color: BRAND.BRONZE }}>
                        Abrir CRM <ArrowRight size={10} />
                    </Link>
                </div>
                {Object.keys(byUf).length === 0 ? (
                    <div className="py-8 text-center">
                        <MapPin size={20} className="mx-auto mb-2 opacity-30" style={{ color: BRAND.BRONZE }} />
                        <p className="text-xs text-gray-400">Nenhum lead com UF informada no período.</p>
                    </div>
                ) : (
                    <LeadsRegionMap byUf={byUf} unknownCount={unknownUf} />
                )}
            </div>

            {/* Aquisição — Canais + Campanhas + Audiência */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Canais */}
                <div className={`${card} overflow-hidden flex flex-col`}>
                    <div className="p-5 border-b border-gray-100 dark:border-[#2A2A2A] flex items-center gap-2">
                        <Activity size={14} style={{ color: BRAND.BRONZE }} />
                        <div>
                            <p className={labelCls}>Canais</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">Captação por origem</p>
                        </div>
                    </div>
                    <div className="p-5 flex-1 space-y-2.5">
                        {topChannels.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">Sem dados de canal.</p>
                        ) : (
                            topChannels.map(([source, count]) => {
                                const pct = (count / channelsTotal) * 100;
                                return (
                                    <div key={source}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[180px]">
                                                {source}
                                            </span>
                                            <div className="flex items-center gap-1.5">
                                                <span className={`text-xs font-bold ${dataCls}`} style={{ color: BRAND.BRONZE }}>{count}</span>
                                                <span className={`text-[9px] text-gray-500 ${dataCls}`}>({pct.toFixed(0)}%)</span>
                                            </div>
                                        </div>
                                        <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-[#262626] overflow-hidden">
                                            <div className="h-full rounded-full"
                                                style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${BRAND.BRONZE_DEEP}, ${BRAND.BRONZE})` }} />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Campanhas */}
                <div className={`${card} overflow-hidden flex flex-col`}>
                    <div className="p-5 border-b border-gray-100 dark:border-[#2A2A2A] flex items-center gap-2">
                        <Megaphone size={14} style={{ color: BRAND.BRONZE_PALE }} />
                        <div>
                            <p className={labelCls}>Top campanhas</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">Por volume de leads</p>
                        </div>
                    </div>
                    <div className="p-5 flex-1 space-y-2.5">
                        {topCampaigns.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">Sem campanhas com UTM marcadas.</p>
                        ) : (
                            topCampaigns.map(([cmp, count]) => {
                                const pct = (count / maxCampaign) * 100;
                                return (
                                    <div key={cmp}>
                                        <div className="flex justify-between items-center mb-1 gap-2">
                                            <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 truncate flex-1" title={cmp}>
                                                {cmp}
                                            </span>
                                            <span className={`text-xs font-bold ${dataCls}`} style={{ color: BRAND.BRONZE }}>{count}</span>
                                        </div>
                                        <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-[#262626] overflow-hidden">
                                            <div className="h-full rounded-full"
                                                style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${BRAND.BRONZE_PALE}, ${BRAND.BRONZE})` }} />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Audiência — momento_pecuaria */}
                <div className={`${card} overflow-hidden flex flex-col`}>
                    <div className="p-5 border-b border-gray-100 dark:border-[#2A2A2A] flex items-center gap-2">
                        <Sparkles size={14} style={{ color: BRAND.TECH_BLUE }} />
                        <div>
                            <p className={labelCls}>Audiência</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">Momento na pecuária</p>
                        </div>
                    </div>
                    <div className="p-5 flex-1 space-y-2.5">
                        {momentoSorted.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">Aguardando coleta de dados.</p>
                        ) : (
                            momentoSorted.map(([key, count]) => {
                                const pct = momentoTotal > 0 ? (count / momentoTotal) * 100 : 0;
                                const label = MOMENTO_LABELS[key] ?? key;
                                return (
                                    <div key={key}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[160px]">{label}</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className={`text-xs font-bold ${dataCls}`} style={{ color: BRAND.TECH_BLUE }}>{count}</span>
                                                <span className={`text-[9px] text-gray-500 ${dataCls}`}>({pct.toFixed(0)}%)</span>
                                            </div>
                                        </div>
                                        <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-[#262626] overflow-hidden">
                                            <div className="h-full rounded-full"
                                                style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${BRAND.TECH_BLUE}, ${BRAND.BRONZE})` }} />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Investimento em Mídia — Meta Ads */}
            <div id="investimento-midia" className={`${card} p-5 scroll-mt-20`}>
                <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <DollarSign size={14} style={{ color: BRAND.BRONZE }} />
                        <div>
                            <p className={labelCls}>Investimento em mídia · Meta Ads</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                                Facebook &amp; Instagram Ads{metaAccount?.account_name ? ` · ${metaAccount.account_name}` : ''}
                            </p>
                        </div>
                    </div>
                    {metaAccount && (
                        <span className="text-[10px] uppercase tracking-wider font-bold flex items-center gap-1" style={{ color: BRAND.BRONZE }}>
                            <Calendar size={10} /> Atualizado {fmtDateBR(metaAccount.captured_at)}
                        </span>
                    )}
                </div>

                {!metaAccount ? (
                    <div className="py-8 text-center">
                        <DollarSign size={20} className="mx-auto mb-2 opacity-30" style={{ color: BRAND.BRONZE }} />
                        <p className="text-xs text-gray-400">Dados do Meta Ads ainda não carregados.</p>
                    </div>
                ) : (
                    <>
                        {/* KPIs */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                            {([
                                { label: 'Investimento total', value: fmtMoney(Number(metaAccount.investimento)), accent: BRAND.LOSS },
                                { label: 'Leads gerados', value: Number(metaAccount.leads).toLocaleString('pt-BR'), accent: BRAND.BRONZE },
                                { label: 'CPL · custo por lead', value: metaAccount.cpl != null ? fmtMoney(Number(metaAccount.cpl)) : '—', accent: BRAND.TECH_GREEN },
                                { label: 'CP MQL · custo por MQL', value: cpMql != null ? fmtMoney(cpMql) : '—', accent: BRAND.BRONZE_PALE },
                            ]).map(({ label, value, accent }) => (
                                <div key={label} className="rounded-xl border border-gray-100 dark:border-[#262626] p-3.5">
                                    <p className={`${labelCls} mb-1.5`}>{label}</p>
                                    <p className={`text-2xl font-black ${dataCls}`} style={{ color: accent }}>{value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Por campanha */}
                        <div className="space-y-3">
                            {metaCampaigns.map(c => {
                                const invest = Number(c.investimento);
                                const pct = (invest / metaMaxInvest) * 100;
                                return (
                                    <div key={c.campaign_id}>
                                        <div className="flex justify-between items-center mb-1 gap-2">
                                            <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 truncate flex-1" title={c.campaign_name ?? ''}>
                                                {c.campaign_name ?? 'Campanha'}
                                            </span>
                                            <span className={`text-[10px] ${dataCls} text-gray-500 whitespace-nowrap`}>
                                                {Number(c.leads).toLocaleString('pt-BR')} leads · CPL {c.cpl != null ? fmtMoney(Number(c.cpl)) : '—'}
                                            </span>
                                            <span className={`text-xs font-bold ${dataCls} w-24 text-right`} style={{ color: BRAND.BRONZE }}>
                                                {fmtMoney(invest)}
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-[#262626] overflow-hidden">
                                            <div className="h-full rounded-full"
                                                style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${BRAND.BRONZE_DEEP}, ${BRAND.BRONZE})` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <p className="text-[10px] text-gray-400 mt-4 pt-3 border-t border-gray-100 dark:border-[#262626]">
                            CPL = Investimento ÷ Leads · CP MQL = Investimento ÷ MQLs (≥100 cab., {mqlAllTime} no total) · período lifetime
                            {metaAccount.date_start && metaAccount.date_stop && (
                                <> · {fmtDateBR(metaAccount.date_start)}–{fmtDateBR(metaAccount.date_stop)}</>
                            )}
                            {' · '}snapshot manual do Meta Ads
                        </p>
                    </>
                )}
            </div>

            {/* Qualificação + Time comercial */}
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-4">
                {/* Porte do rebanho */}
                <div className={`${card} p-5`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Target size={14} style={{ color: BRAND.BRONZE }} />
                            <div>
                                <p className={labelCls}>Qualificação</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">Porte do rebanho</p>
                            </div>
                        </div>
                        <span className={`text-[10px] ${dataCls} text-gray-500`}>
                            {herdInformed} informados
                        </span>
                    </div>
                    {herdInformed === 0 ? (
                        <p className="text-xs text-gray-400 italic">Nenhum lead com porte de rebanho informado.</p>
                    ) : (
                        <>
                            <div className="space-y-2.5">
                                {herdCounts.map(b => {
                                    const pct = (b.count / maxHerd) * 100;
                                    const share = herdInformed > 0 ? (b.count / herdInformed) * 100 : 0;
                                    return (
                                        <div key={b.label}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                                    {b.label}
                                                    {b.mql && (
                                                        <span className="text-[8px] font-black uppercase tracking-wider px-1 py-0.5 rounded"
                                                            style={{ backgroundColor: `${BRAND.TECH_GREEN}1F`, color: BRAND.TECH_GREEN }}>
                                                            MQL
                                                        </span>
                                                    )}
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`text-xs font-bold ${dataCls}`} style={{ color: b.mql ? BRAND.TECH_GREEN : BRAND.BRONZE }}>{b.count}</span>
                                                    <span className={`text-[9px] text-gray-500 ${dataCls}`}>({share.toFixed(0)}%)</span>
                                                </div>
                                            </div>
                                            <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-[#262626] overflow-hidden">
                                                <div className="h-full rounded-full"
                                                    style={{
                                                        width: `${pct}%`,
                                                        background: b.mql
                                                            ? `linear-gradient(90deg, ${BRAND.BRONZE}, ${BRAND.TECH_GREEN})`
                                                            : `linear-gradient(90deg, ${BRAND.BRONZE_DEEP}, ${BRAND.BRONZE})`,
                                                    }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-[#262626]">
                                <span className="text-[10px] text-gray-500">Porte MQL · ≥100 cabeças</span>
                                <span className={`text-xs font-black ${dataCls}`} style={{ color: BRAND.TECH_GREEN }}>
                                    {fmtPct(herdMqlShare)}
                                </span>
                            </div>
                            {herdUnknown > 0 && (
                                <p className="text-[9px] text-gray-400 mt-2">
                                    {herdUnknown} {herdUnknown === 1 ? 'lead sem porte informado' : 'leads sem porte informado'}
                                </p>
                            )}
                        </>
                    )}
                </div>

                {/* Desempenho por responsável */}
                <div className={`${card} p-5`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Trophy size={14} style={{ color: BRAND.BRONZE }} />
                            <div>
                                <p className={labelCls}>Time comercial</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">Desempenho por responsável</p>
                            </div>
                        </div>
                        <Link href="/crm" className="text-[10px] font-bold uppercase tracking-wider hover:opacity-80 transition-opacity flex items-center gap-1" style={{ color: BRAND.BRONZE }}>
                            Abrir CRM <ArrowRight size={10} />
                        </Link>
                    </div>

                    {reps.length === 0 ? (
                        <div className="py-8 text-center">
                            <Users size={20} className="mx-auto mb-2 opacity-30" style={{ color: BRAND.BRONZE }} />
                            <p className="text-xs text-gray-400">Nenhum lead atribuído a um responsável.</p>
                            <Link href="/crm" className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: BRAND.BRONZE }}>
                                Distribuir leads <ArrowRight size={10} />
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {reps.map((r, i) => (
                                    <div key={r.name} className="space-y-1.5">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0"
                                                    style={{
                                                        backgroundColor: i === 0 ? BRAND.BRONZE : i === 1 ? '#C8C8C8' : i === 2 ? BRAND.BRONZE_DEEP : `${BRAND.BRONZE}1F`,
                                                        color: i === 0 ? '#000' : i === 2 ? '#fff' : i === 1 ? '#262626' : BRAND.BRONZE,
                                                    }}>
                                                    {i + 1}
                                                </span>
                                                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{r.name}</p>
                                            </div>
                                            <span className={`text-[10px] text-gray-500 whitespace-nowrap ${dataCls}`}>
                                                {r.closed} fechado{r.closed !== 1 ? 's' : ''} · pipe {fmtBRL(r.pipeline)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-[#262626] overflow-hidden">
                                                <div className="h-full rounded-full transition-all duration-700"
                                                    style={{
                                                        width: `${(r.total / maxRepTotal) * 100}%`,
                                                        background: `linear-gradient(90deg, ${BRAND.BRONZE_DEEP}, ${BRAND.BRONZE})`,
                                                    }} />
                                            </div>
                                            <span className={`text-[10px] text-gray-500 w-16 text-right ${dataCls}`}>
                                                {r.total} lead{r.total !== 1 ? 's' : ''}
                                            </span>
                                            <span className={`text-xs font-black w-12 text-right ${dataCls}`}
                                                style={{ color: r.conv >= 20 ? BRAND.TECH_GREEN : r.conv > 0 ? BRAND.BRONZE : '#9CA3AF' }}>
                                                {fmtPct(r.conv)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-[#262626] text-[9px] text-gray-500 flex-wrap">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-sm" style={{ background: `linear-gradient(90deg, ${BRAND.BRONZE_DEEP}, ${BRAND.BRONZE})` }} />
                                    Leads atribuídos
                                </span>
                                <span>· % = conversão p/ Fechado · pipe = valor estimado em aberto</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* WhatsApp engagement */}
            <div className={`${card} p-5`}>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                        <MessageSquare size={14} style={{ color: BRAND.TECH_GREEN }} />
                        <div>
                            <p className={labelCls}>WhatsApp · Engajamento · {periodLabel}</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                                <span className={`${dataCls} text-[#A0792E]`}>{wppTotal}</span> mensagens · {wppToday} hoje
                            </p>
                        </div>
                    </div>
                    <Link href="/whatsapp" className="text-[10px] font-bold uppercase tracking-wider hover:opacity-80 transition-opacity flex items-center gap-1"
                        style={{ color: BRAND.TECH_GREEN }}>
                        Abrir Central <ArrowRight size={10} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
                    <div>
                        <Sparkline data={dailyWpp} color={BRAND.TECH_GREEN} height={56} />
                        <div className="flex justify-between mt-2 text-[9px] text-gray-400 font-mono">
                            <span>{fmtDateBR(new Date(seriesStartMs).toISOString())}</span>
                            <span>{fmtDateBR(new Date((seriesStartMs + rangeEndMs) / 2).toISOString())}</span>
                            <span>{fmtDateBR(new Date(rangeEndMs).toISOString())}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { label: 'Disparados (out)', value: wppOut, color: BRAND.BRONZE },
                            { label: 'Recebidos (in)',  value: wppIn,  color: BRAND.TECH_BLUE },
                            { label: 'Taxa de entrega', value: fmtPct(wppSentRate), color: BRAND.TECH_GREEN, isText: true },
                            { label: 'Taxa de resposta', value: fmtPct(wppReplyRate), color: BRAND.BRONZE_PALE, isText: true },
                        ].map(({ label, value, color, isText }) => (
                            <div key={label} className="rounded-xl border border-gray-100 dark:border-[#262626] p-3">
                                <p className={`${labelCls} mb-1`}>{label}</p>
                                <p className={`text-xl font-black ${dataCls}`} style={{ color }}>
                                    {isText ? value : Number(value).toLocaleString('pt-BR')}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Hot leads + Leads recentes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Hot leads — MQL ativos */}
                <div className={`${card} overflow-hidden flex flex-col`}>
                    <div className="p-5 border-b border-gray-100 dark:border-[#2A2A2A] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Flame size={14} style={{ color: BRAND.LOSS }} />
                            <div>
                                <p className={labelCls}>Hot leads</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">MQLs ativos · prioridade máxima</p>
                            </div>
                        </div>
                        <Link href="/crm" className="text-[10px] font-bold uppercase tracking-wider hover:opacity-80 transition-opacity flex items-center gap-1" style={{ color: BRAND.BRONZE }}>
                            Ver todos <ArrowRight size={10} />
                        </Link>
                    </div>
                    {hotLeads.length === 0 ? (
                        <div className="p-10 text-center text-gray-400">
                            <Crown className="w-7 h-7 mx-auto mb-2 opacity-30" />
                            <p className="text-xs">Nenhum MQL ativo no período.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-[#2A2A2A]">
                            {hotLeads.map(l => {
                                const created = new Date(l.created_at);
                                const diasAtras = Math.floor((nowMs - created.getTime()) / DAY);
                                return (
                                    <Link href="/crm" key={l.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-[#1d1d1d] transition-colors group">
                                        <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                                            style={{ background: `linear-gradient(135deg, ${BRAND.BRONZE}, ${BRAND.BRONZE_PALE})`, color: '#000' }}>
                                            <Crown size={14} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{l.nome || 'Sem nome'}</p>
                                            <p className={`text-[10px] text-gray-500 truncate ${dataCls}`}>
                                                {[l.status, l.quantidade_animais && `${l.quantidade_animais} cab.`, l.estado, diasAtras === 0 ? 'hoje' : `${diasAtras}d`].filter(Boolean).join(' · ')}
                                            </p>
                                        </div>
                                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" style={{ color: BRAND.BRONZE }} />
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Leads recentes */}
                <div className={`${card} overflow-hidden flex flex-col`}>
                    <div className="p-5 border-b border-gray-100 dark:border-[#2A2A2A] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles size={14} style={{ color: BRAND.BRONZE }} />
                            <div>
                                <p className={labelCls}>Leads recentes</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">Últimos {recentLeads.length} cadastros</p>
                            </div>
                        </div>
                        <Link href="/crm" className="text-[10px] font-bold uppercase tracking-wider hover:opacity-80 transition-opacity flex items-center gap-1" style={{ color: BRAND.BRONZE }}>
                            Ver todos <ArrowRight size={10} />
                        </Link>
                    </div>
                    {recentLeads.length === 0 ? (
                        <div className="p-10 text-center text-gray-400">
                            <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-xs">Nenhum lead cadastrado no período.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-[#2A2A2A]">
                            {recentLeads.map(l => {
                                const created = new Date(l.created_at);
                                const diasAtras = Math.floor((nowMs - created.getTime()) / DAY);
                                const prioColor = l.prioridade === 'Alta' ? BRAND.LOSS : l.prioridade === 'Média' ? BRAND.BRONZE : BRAND.TECH_BLUE;
                                return (
                                    <Link href="/crm" key={l.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-[#1d1d1d] transition-colors group">
                                        <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                                            style={{ backgroundColor: `${BRAND.BRONZE}14`, color: BRAND.BRONZE }}>
                                            {(l.nome || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{l.nome || 'Sem nome'}</p>
                                            <p className={`text-[10px] text-gray-500 truncate ${dataCls}`}>
                                                {[l.status, l.source || l.origem, diasAtras === 0 ? 'hoje' : `${diasAtras}d`].filter(Boolean).join(' · ')}
                                            </p>
                                        </div>
                                        {l.is_mql && (
                                            <span className="inline-flex items-center gap-0.5 text-[8px] font-black uppercase px-1.5 py-0.5 rounded"
                                                style={{ background: `linear-gradient(90deg, ${BRAND.BRONZE}, ${BRAND.BRONZE_PALE})`, color: '#000' }}>
                                                <Crown size={8} /> MQL
                                            </span>
                                        )}
                                        {l.prioridade && (
                                            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border"
                                                style={{ color: prioColor, borderColor: `${prioColor}40`, backgroundColor: `${prioColor}10` }}>
                                                {l.prioridade}
                                            </span>
                                        )}
                                        <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:translate-x-0.5 transition-transform" style={{ color: BRAND.BRONZE }} />
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Atalhos discretos para módulos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Link href="/crm" className={`${card} p-4 group flex items-center gap-3 transition-all hover:shadow-md`}>
                    <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${BRAND.BRONZE}14`, color: BRAND.BRONZE }}>
                        <Users className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">CRM · Pipeline</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Kanban, qualificação, MQLs</p>
                    </div>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" style={{ color: BRAND.BRONZE }} />
                </Link>

                <Link href="/whatsapp" className={`${card} p-4 group flex items-center gap-3 transition-all hover:shadow-md`}>
                    <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${BRAND.TECH_GREEN}14`, color: BRAND.TECH_GREEN }}>
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Central WhatsApp</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Inbox, templates e campanhas</p>
                    </div>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" style={{ color: BRAND.TECH_GREEN }} />
                </Link>
            </div>

        </div>
    );
}
