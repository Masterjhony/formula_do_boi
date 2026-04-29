import { createClient } from '@/utils/supabase/server';
import {
    Users, Target, MessageSquare, ArrowRight, TrendingUp, CheckCircle2,
    Sparkles, ChevronRight, Send, Activity, Trophy, Lightbulb, BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import { FunnelChart } from '@/components/charts/FunnelChart';

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

const card = 'rounded-2xl border border-gray-200 dark:border-[#1E1E1E] bg-white dark:bg-[#0A0A0A]';
const labelCls = 'text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400';
const dataCls = 'font-mono tabular-nums';

const fmtPct = (v: number) => `${v.toFixed(0)}%`;

const fmtBRL = (v: number) => {
    if (!v) return 'R$ 0';
    if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(2).replace('.', ',')}M`;
    if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}k`;
    return `R$ ${v.toLocaleString('pt-BR')}`;
};

const fmtDateBR = (d: string) => {
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y.slice(2)}`;
};

interface Comprador { fazenda: string; comprador?: string; cidade?: string; uf?: string; lotes: number; animais: number; vgv: number }
interface Fechamento {
    id: string; nome: string; data: string;
    vgv_total: number; comissao_assessoria: number;
    receita_bula: number | null; sobra_bruta: number | null;
    compradores: Comprador[] | null;
}

export default async function VendasMarketingPage() {
    const supabase = await createClient();

    const [
        { data: leads },
        { data: whatsappMessages },
        { data: fechamentosRaw },
    ] = await Promise.all([
        supabase.from('crm_leads')
            .select('id, nome, status, prioridade, data_estimada_fechamento, created_at, valor_estimado, origem, source')
            .order('created_at', { ascending: false }),
        supabase.from('whatsapp_messages')
            .select('id, status, created_at')
            .order('created_at', { ascending: false })
            .limit(500),
        supabase.from('bula_leilao_fechamento')
            .select('id, nome, data, vgv_total, comissao_assessoria, receita_bula, sobra_bruta, compradores')
            .order('data', { ascending: false })
            .limit(8),
    ]);

    const allLeads = leads ?? [];
    const totalLeads = allLeads.length;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const start30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const start7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const leadsMonth = allLeads.filter(l => new Date(l.created_at) >= startOfMonth).length;
    const leads7d = allLeads.filter(l => new Date(l.created_at) >= start7d).length;
    const leads30d = allLeads.filter(l => new Date(l.created_at) >= start30d).length;
    const start30dMs = start30d.getTime();
    const prevWindow30 = allLeads.filter(l => {
        const t = new Date(l.created_at).getTime();
        return t >= start30dMs - 30 * 86400000 && t < start30dMs;
    }).length;
    const trendDelta = prevWindow30 > 0 ? ((leads30d - prevWindow30) / prevWindow30) * 100 : 0;

    const closedLeads = allLeads.filter(l => l.status === 'Fechado').length;
    const lostLeads = allLeads.filter(l => l.status === 'Perdido').length;
    const activeLeads = totalLeads - closedLeads - lostLeads;
    const conversionRate = totalLeads > 0 ? (closedLeads / totalLeads) * 100 : 0;

    const pipelineValue = allLeads
        .filter(l => l.status !== 'Fechado' && l.status !== 'Perdido')
        .reduce((s, l) => s + (Number(l.valor_estimado) || 0), 0);

    const nowMs = now.getTime();
    const closingSoon = allLeads.filter(l => {
        if (!l.data_estimada_fechamento) return false;
        const diff = Math.ceil((new Date(l.data_estimada_fechamento).getTime() - nowMs) / 86400000);
        return diff >= 0 && diff <= 7;
    }).length;

    // ── Funnel: counts per stage ──
    const funnelCounts = FUNNEL_PIPELINE.map(s => allLeads.filter(l => l.status === s).length);
    const funnelTop = funnelCounts[0] || 1;

    // ── Origem ──
    const leadsByOrigem: Record<string, number> = {};
    for (const l of allLeads) {
        const o = (l.origem || l.source || 'Direta') as string;
        leadsByOrigem[o] = (leadsByOrigem[o] || 0) + 1;
    }
    const topOrigens = Object.entries(leadsByOrigem).sort(([, a], [, b]) => b - a).slice(0, 5);

    const recentLeads = allLeads.slice(0, 6);

    // ── WhatsApp ──
    const allWpp = whatsappMessages ?? [];
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const wppToday = allWpp.filter(m => m.created_at >= todayStart).length;
    const wpp30d = allWpp.filter(m => new Date(m.created_at) >= start30d).length;
    const wppSentRate = allWpp.length > 0
        ? (allWpp.filter(m => m.status === 'sent').length / allWpp.length) * 100
        : 0;

    // ── Fechamentos: ROI por leilão ──
    const fechamentos = (fechamentosRaw ?? []) as Fechamento[];
    const roiData = fechamentos
        .filter(f => f.vgv_total > 0)
        .map(f => {
            const investido = Number(f.comissao_assessoria) || 0;
            const retorno = Number(f.receita_bula) || 0;
            const roi = investido > 0 ? (retorno / investido) * 100 : 0;
            return { ...f, investido, retorno, roi };
        });
    const maxVgv = Math.max(...roiData.map(r => r.vgv_total), 1);
    const totalVgv = roiData.reduce((s, r) => s + r.vgv_total, 0);
    const totalReceita = roiData.reduce((s, r) => s + r.retorno, 0);
    const totalInvestido = roiData.reduce((s, r) => s + r.investido, 0);
    const roiMedio = totalInvestido > 0 ? (totalReceita / totalInvestido) * 100 : 0;

    // ── Buyer profile (compradores agregados) ──
    const buyerMap = new Map<string, { name: string; vgv: number; lotes: number; animais: number; leiloes: number; uf: string }>();
    for (const f of fechamentos) {
        for (const c of (f.compradores ?? [])) {
            if (!c.fazenda) continue;
            const cur = buyerMap.get(c.fazenda) ?? { name: c.fazenda, vgv: 0, lotes: 0, animais: 0, leiloes: 0, uf: c.uf || '' };
            cur.vgv += Number(c.vgv) || 0;
            cur.lotes += Number(c.lotes) || 0;
            cur.animais += Number(c.animais) || 0;
            cur.leiloes += 1;
            buyerMap.set(c.fazenda, cur);
        }
    }
    const topBuyers = [...buyerMap.values()].sort((a, b) => b.vgv - a.vgv).slice(0, 5);
    const maxBuyerVgv = topBuyers[0]?.vgv || 1;

    // ── Insights derivados ──
    const insights: { kind: 'positive' | 'attention' | 'opportunity'; title: string; body: string; cta: string; href: string }[] = [];

    if (closingSoon > 0) {
        insights.push({
            kind: 'positive',
            title: `${closingSoon} ${closingSoon === 1 ? 'lead' : 'leads'} fecha${closingSoon === 1 ? '' : 'ndo'} em 7 dias`,
            body: `Pipeline de ${fmtBRL(pipelineValue)} em valor estimado. Priorize atendimento desses contatos.`,
            cta: 'Abrir CRM',
            href: '/crm',
        });
    }

    if (conversionRate < 15 && totalLeads > 20) {
        insights.push({
            kind: 'attention',
            title: 'Taxa de conversão abaixo de 15%',
            body: `Apenas ${closedLeads} de ${totalLeads} leads fecharam. Revise critérios de qualificação ou processo comercial.`,
            cta: 'Ver funil',
            href: '/crm',
        });
    } else if (conversionRate >= 25) {
        insights.push({
            kind: 'positive',
            title: `Conversão sólida em ${fmtPct(conversionRate)}`,
            body: `${closedLeads} fechamentos sobre ${totalLeads} leads totais — performance acima da média do setor.`,
            cta: 'Ver detalhes',
            href: '/crm',
        });
    }

    if (trendDelta >= 20) {
        insights.push({
            kind: 'positive',
            title: `Captação em alta · +${trendDelta.toFixed(0)}%`,
            body: `${leads30d} leads nos últimos 30d versus ${prevWindow30} no período anterior.`,
            cta: 'Ver origem',
            href: '/crm',
        });
    } else if (trendDelta <= -20 && prevWindow30 > 5) {
        insights.push({
            kind: 'attention',
            title: `Captação em queda · ${trendDelta.toFixed(0)}%`,
            body: `${leads30d} leads versus ${prevWindow30} no período anterior. Avalie investimento em mídia.`,
            cta: 'Revisar campanhas',
            href: '/crm',
        });
    }

    if (roiMedio > 100 && totalReceita > 0) {
        insights.push({
            kind: 'opportunity',
            title: `ROI médio de leilões em ${roiMedio.toFixed(0)}%`,
            body: `Receita de ${fmtBRL(totalReceita)} sobre ${fmtBRL(totalInvestido)} em comissões — replicar modelo nos próximos eventos.`,
            cta: 'Ver leilões',
            href: '/leiloes',
        });
    }

    if (insights.length === 0) {
        insights.push({
            kind: 'opportunity',
            title: 'Pipeline equilibrado',
            body: `${activeLeads} leads em negociação distribuídos entre as etapas. Mantenha cadência de contatos.`,
            cta: 'Abrir CRM',
            href: '/crm',
        });
    }

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-5 border-b border-gray-200 dark:border-[#1E1E1E]">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl border" style={{ borderColor: `${BRAND.BRONZE}4D`, backgroundColor: `${BRAND.BRONZE}14` }}>
                        <BarChart3 className="w-5 h-5" style={{ color: BRAND.BRONZE }} />
                    </div>
                    <div>
                        <p className={labelCls}>§ Vendas & Marketing</p>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Visão geral</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Pipeline comercial, ROI de leilões e captação digital.</p>
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

            {/* Hero KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {([
                    {
                        label: 'Pipeline ativo', value: activeLeads.toLocaleString('pt-BR'), sub: `${leads7d} novos em 7d · ${leadsMonth} no mês`,
                        icon: Users, accent: BRAND.BRONZE, big: true,
                    },
                    {
                        label: 'Pipeline em valor', value: fmtBRL(pipelineValue), sub: `${closingSoon} fechando em 7d`,
                        icon: Target, accent: BRAND.BRONZE_PALE,
                    },
                    {
                        label: 'Conversão', value: fmtPct(conversionRate), sub: `${closedLeads} fechados · ${lostLeads} perdidos`,
                        icon: CheckCircle2, accent: BRAND.TECH_GREEN,
                    },
                    {
                        label: 'WhatsApp 30d', value: wpp30d.toLocaleString('pt-BR'), sub: `${wppToday} hoje · ${fmtPct(wppSentRate)} entrega`,
                        icon: MessageSquare, accent: BRAND.TECH_BLUE,
                    },
                ]).map(({ label, value, sub, icon: Icon, accent, big }) => (
                    <div key={label} className={`${card} p-5 relative overflow-hidden transition-all hover:shadow-md`}
                        style={big ? { borderColor: `${accent}4D`, background: `linear-gradient(135deg, ${accent}10, transparent 60%)` } : undefined}>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${accent}1F`, color: accent }}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <span className={labelCls}>{label}</span>
                        </div>
                        <p className={`text-3xl font-black text-gray-900 dark:text-white leading-none ${dataCls}`}>{value}</p>
                        <p className="text-[11px] text-gray-500 mt-2">{sub}</p>
                    </div>
                ))}
            </div>

            {/* Conversion Funnel + Buyer Profile */}
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4">

                {/* Funil de Conversão */}
                <div className={`${card} p-5`}>
                    <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                        <div>
                            <p className={labelCls}>Funil de conversão</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                                {totalLeads} leads · <span className={`${dataCls} text-[#A0792E]`}>{conversionRate.toFixed(0)}%</span> fecham
                            </p>
                        </div>
                        <span className="text-[10px] px-2.5 py-1 rounded-full" style={{ backgroundColor: `${BRAND.LOSS}1F`, color: BRAND.LOSS }}>
                            <span className={dataCls}>{lostLeads}</span> perdidos
                        </span>
                    </div>

                    <FunnelChart
                        stages={FUNNEL_PIPELINE.map((stage, i) => ({ label: stage, count: funnelCounts[i] }))}
                        totalForPct={totalLeads || funnelTop}
                    />
                </div>

                {/* Top Compradores (perfil) */}
                <div className={`${card} p-5`}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className={labelCls}>Top Compradores</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">Fazendas por VGV acumulado</p>
                        </div>
                        <Trophy size={14} style={{ color: BRAND.BRONZE }} />
                    </div>

                    {topBuyers.length === 0 ? (
                        <div className="py-8 text-center">
                            <p className="text-xs text-gray-400">Sem fechamentos registrados</p>
                            <Link href="/leiloes" className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: BRAND.BRONZE }}>
                                Cadastrar leilão <ArrowRight size={10} />
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {topBuyers.map((b, i) => (
                                <div key={b.name} className="space-y-1.5">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span
                                                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0"
                                                style={{
                                                    backgroundColor: i === 0 ? BRAND.BRONZE : i === 1 ? '#C8C8C8' : i === 2 ? BRAND.BRONZE_DEEP : `${BRAND.BRONZE}1F`,
                                                    color: i === 0 ? '#000' : i === 2 ? '#fff' : i === 1 ? '#1A1A1A' : BRAND.BRONZE,
                                                }}
                                            >
                                                {i + 1}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{b.name}</p>
                                                <p className={`text-[9px] text-gray-500 ${dataCls}`}>
                                                    {b.uf && `${b.uf} · `}{b.lotes} lote{b.lotes !== 1 ? 's' : ''} · {b.animais} animais
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-black whitespace-nowrap ${dataCls}`} style={{ color: BRAND.BRONZE }}>
                                            {fmtBRL(b.vgv)}
                                        </span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-gray-100 dark:bg-[#1A1A1A] overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{
                                                width: `${(b.vgv / maxBuyerVgv) * 100}%`,
                                                background: i === 0
                                                    ? `linear-gradient(90deg, ${BRAND.BRONZE}, ${BRAND.BRONZE_PALE})`
                                                    : BRAND.BRONZE,
                                                opacity: 1 - i * 0.12,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ROI por Leilão */}
            {roiData.length > 0 && (
                <div className={`${card} p-5`}>
                    <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                        <div>
                            <p className={labelCls}>ROI por leilão</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                                {roiData.length} fechamentos · VGV total{' '}
                                <span className={`${dataCls} text-[#A0792E]`}>{fmtBRL(totalVgv)}</span>
                            </p>
                        </div>
                        {roiMedio > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: `${BRAND.TECH_GREEN}14` }}>
                                <TrendingUp size={12} style={{ color: BRAND.TECH_GREEN }} />
                                <span className={`text-xs font-bold ${dataCls}`} style={{ color: BRAND.TECH_GREEN }}>
                                    ROI médio {roiMedio.toFixed(0)}%
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        {roiData.map(r => {
                            const vgvPct = (r.vgv_total / maxVgv) * 100;
                            const investidoPct = maxVgv > 0 ? (r.investido / maxVgv) * 100 : 0;
                            const retornoPct = maxVgv > 0 ? (r.retorno / maxVgv) * 100 : 0;
                            return (
                                <div key={r.id} className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-3 items-center group">
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{r.nome}</p>
                                        <p className={`text-[9px] text-gray-500 ${dataCls}`}>{fmtDateBR(r.data)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        {/* VGV */}
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-3 rounded-sm bg-gray-50 dark:bg-[#111] overflow-hidden">
                                                <div className="h-full rounded-sm transition-all duration-700"
                                                    style={{ width: `${vgvPct}%`, background: `linear-gradient(90deg, ${BRAND.BRONZE_DEEP}, ${BRAND.BRONZE})` }} />
                                            </div>
                                            <span className={`text-[10px] w-20 text-right text-gray-700 dark:text-gray-300 font-bold ${dataCls}`}>
                                                {fmtBRL(r.vgv_total)}
                                            </span>
                                        </div>
                                        {/* Investido vs Retorno (só se > 0) */}
                                        {(r.investido > 0 || r.retorno > 0) && (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 rounded-sm bg-gray-50 dark:bg-[#111] overflow-hidden">
                                                        <div className="h-full rounded-sm" style={{ width: `${investidoPct}%`, backgroundColor: BRAND.LOSS, opacity: 0.7 }} />
                                                    </div>
                                                    <span className={`text-[9px] w-20 text-right ${dataCls}`} style={{ color: BRAND.LOSS }}>
                                                        −{fmtBRL(r.investido)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 rounded-sm bg-gray-50 dark:bg-[#111] overflow-hidden">
                                                        <div className="h-full rounded-sm" style={{ width: `${retornoPct}%`, backgroundColor: BRAND.TECH_GREEN }} />
                                                    </div>
                                                    <span className={`text-[9px] w-20 text-right ${dataCls}`} style={{ color: BRAND.TECH_GREEN }}>
                                                        +{fmtBRL(r.retorno)}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0.5 sm:w-16">
                                        {r.roi > 0 ? (
                                            <span className={`text-sm font-black ${dataCls}`} style={{ color: BRAND.TECH_GREEN }}>
                                                {r.roi.toFixed(0)}%
                                            </span>
                                        ) : (
                                            <span className="text-sm text-gray-400">—</span>
                                        )}
                                        <span className={labelCls}>ROI</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-[#1A1A1A] text-[10px] text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-sm" style={{ background: `linear-gradient(90deg, ${BRAND.BRONZE_DEEP}, ${BRAND.BRONZE})` }} />
                            VGV
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: BRAND.LOSS, opacity: 0.7 }} />
                            Comissão
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: BRAND.TECH_GREEN }} />
                            Receita Bula
                        </span>
                    </div>
                </div>
            )}

            {/* Insights automáticos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {insights.slice(0, 3).map((ins, i) => {
                    const accent = ins.kind === 'positive' ? BRAND.TECH_GREEN : ins.kind === 'attention' ? BRAND.LOSS : BRAND.BRONZE;
                    const Icon = ins.kind === 'positive' ? TrendingUp : ins.kind === 'attention' ? Activity : Lightbulb;
                    return (
                        <Link
                            key={i}
                            href={ins.href}
                            className={`${card} p-4 group transition-all hover:shadow-md flex flex-col gap-2`}
                            style={{ borderColor: `${accent}4D` }}
                        >
                            <div className="flex items-start gap-2">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}1F`, color: accent }}>
                                    <Icon size={13} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={labelCls}>Insight automático</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 leading-tight">{ins.title}</p>
                                </div>
                            </div>
                            <p className="text-[11px] text-gray-500 leading-relaxed flex-1">{ins.body}</p>
                            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: accent }}>
                                {ins.cta}
                                <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Leads recentes + Origem */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Leads recentes */}
                <div className={`${card} lg:col-span-2 overflow-hidden flex flex-col`}>
                    <div className="p-5 border-b border-gray-100 dark:border-[#1E1E1E] flex items-center justify-between">
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
                            <p className="text-xs">Nenhum lead cadastrado ainda</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-[#1E1E1E]">
                            {recentLeads.map(l => {
                                const created = new Date(l.created_at);
                                const diasAtras = Math.floor((now.getTime() - created.getTime()) / 86400000);
                                const prioColor = l.prioridade === 'Alta' ? BRAND.LOSS : l.prioridade === 'Média' ? BRAND.BRONZE : BRAND.TECH_BLUE;
                                return (
                                    <Link href="/crm" key={l.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors group">
                                        <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                                            style={{ backgroundColor: `${BRAND.BRONZE}14`, color: BRAND.BRONZE }}>
                                            {(l.nome || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{l.nome || 'Sem nome'}</p>
                                            <p className={`text-[10px] text-gray-500 truncate ${dataCls}`}>
                                                {[l.status, l.origem, diasAtras === 0 ? 'hoje' : `${diasAtras}d`].filter(Boolean).join(' · ')}
                                            </p>
                                        </div>
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

                {/* Origem */}
                <div className={`${card} overflow-hidden flex flex-col`}>
                    <div className="p-5 border-b border-gray-100 dark:border-[#1E1E1E] flex items-center gap-2">
                        <Activity size={14} style={{ color: BRAND.BRONZE }} />
                        <div>
                            <p className={labelCls}>Origem</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">Captação por canal</p>
                        </div>
                    </div>
                    <div className="p-5 flex-1 space-y-2.5">
                        {topOrigens.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">Sem dados de origem</p>
                        ) : (
                            topOrigens.map(([origem, count]) => {
                                const pct = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
                                return (
                                    <div key={origem}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[140px]">{origem}</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className={`text-xs font-bold ${dataCls}`} style={{ color: BRAND.BRONZE }}>{count}</span>
                                                <span className={`text-[9px] text-gray-500 ${dataCls}`}>({pct.toFixed(0)}%)</span>
                                            </div>
                                        </div>
                                        <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-[#1A1A1A] overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${BRAND.BRONZE_DEEP}, ${BRAND.BRONZE})` }} />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Módulos do sistema (atalhos discretos) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Link href="/crm" className={`${card} p-4 group flex items-center gap-3 transition-all hover:shadow-md`}>
                    <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${BRAND.BRONZE}14`, color: BRAND.BRONZE }}>
                        <Users className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">CRM · Pipeline de vendas</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Kanban, qualificação e atividades por responsável</p>
                    </div>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" style={{ color: BRAND.BRONZE }} />
                </Link>

                <Link href="/whatsapp" className={`${card} p-4 group flex items-center gap-3 transition-all hover:shadow-md`}>
                    <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${BRAND.TECH_GREEN}14`, color: BRAND.TECH_GREEN }}>
                        <Send className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Automação WhatsApp</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Fluxos de boas-vindas e disparos por gatilho</p>
                    </div>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" style={{ color: BRAND.TECH_GREEN }} />
                </Link>
            </div>

        </div>
    );
}
