'use client';

import { useMemo, useState } from 'react';
import { CRMLead } from '@/app/web-admin/actions/crm-leads';
import { Users, CheckCircle2, XCircle, TrendingUp, MapPin, BarChart2 } from 'lucide-react';

interface CRMChartProps {
    leads: CRMLead[];
    stages?: string[];
}

const MONTHS_PT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const STAGE_COLORS: Record<string, string> = {
    Lead: '#ec4899',
    Qualificado: '#f97316',
    Proposta: '#3b82f6',
    'Negociação': '#a855f7',
    Fechado: '#22c55e',
    Perdido: '#ef4444',
    'Sem Status': '#6b7280',
};

const COLOR_PALETTE = ['#ec4899', '#f97316', '#3b82f6', '#a855f7', '#22c55e', '#ef4444', '#6b7280', '#14b8a6', '#f59e0b', '#8b5cf6'];

function getStageColor(stage: string, index: number): string {
    return STAGE_COLORS[stage] || COLOR_PALETTE[index % COLOR_PALETTE.length];
}

const SOURCE_LABELS: Record<string, string> = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    google: 'Google',
    whatsapp: 'WhatsApp',
    indicacao: 'Indicação',
    site: 'Site',
    'google-ads': 'Google Ads',
    'facebook-ads': 'Facebook Ads',
};

function LineChart({ data, color = '#B8860B' }: { data: number[]; color?: string }) {
    if (data.length < 2) return <div className="h-20 flex items-center justify-center text-xs text-gray-400">Sem dados</div>;

    const W = 600;
    const H = 90;
    const pad = { t: 8, b: 8, l: 4, r: 4 };
    const max = Math.max(...data, 1);
    const gradId = `lg-${color.replace('#', '')}`;

    const pts = data.map((v, i) => ({
        x: pad.l + (i / (data.length - 1)) * (W - pad.l - pad.r),
        y: pad.t + (1 - v / max) * (H - pad.t - pad.b),
    }));

    let line = '';
    let area = '';
    pts.forEach((p, i) => {
        if (i === 0) { line = `M${p.x} ${p.y}`; return; }
        const pr = pts[i - 1];
        const cx1 = pr.x + (p.x - pr.x) * 0.5;
        const cx2 = p.x - (p.x - pr.x) * 0.5;
        line += ` C${cx1} ${pr.y},${cx2} ${p.y},${p.x} ${p.y}`;
    });
    area = `${line} L${pts[pts.length - 1].x} ${H - pad.b} L${pts[0].x} ${H - pad.b} Z`;

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height: '90px' }}>
            <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                </linearGradient>
            </defs>
            <path d={area} fill={`url(#${gradId})`} />
            <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map((p, i) => data[i] > 0 && (
                <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color} opacity="0.8" />
            ))}
        </svg>
    );
}

const card = 'bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#222] p-4';

export function CRMChart({ leads, stages }: CRMChartProps) {
    const [monthOffset, setMonthOffset] = useState(0);

    const now = new Date();
    const monthTabs = [0, 1, 2].map(offset => {
        const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
        return { label: offset === 0 ? 'Mês corrente' : MONTHS_PT[d.getMonth()], year: d.getFullYear(), month: d.getMonth() };
    });

    const activeStages = useMemo(
        () => stages?.length ? stages : ['Lead', 'Qualificado', 'Proposta', 'Negociação', 'Fechado', 'Perdido', 'Sem Status'],
        [stages]
    );

    // KPIs
    const fechados = leads.filter(l => l.status === 'Fechado').length;
    const perdidos = leads.filter(l => l.status === 'Perdido').length;
    const semStatus = leads.filter(l => l.status === 'Sem Status').length;
    const emAberto = leads.length - fechados - perdidos - semStatus;
    const taxaGeral = leads.length > 0 ? Math.round((fechados / leads.length) * 100) : 0;

    // Stage counts
    const stageCounts = useMemo(() =>
        activeStages.map((stage, i) => ({
            stage, color: getStageColor(stage, i),
            count: leads.filter(l => l.status === stage).length,
        })), [leads, activeStages]
    );
    const maxStage = Math.max(...stageCounts.map(s => s.count), 1);

    // Monthly stats
    const tab = monthTabs[monthOffset];
    const monthLeads = useMemo(() => leads.filter(l => {
        const raw = l.data_entrada || l.created_at;
        if (!raw) return false;
        const d = new Date(raw);
        return d.getFullYear() === tab.year && d.getMonth() === tab.month;
    }), [leads, tab]);

    const mStats = useMemo(() => {
        const mFechados = monthLeads.filter(l => l.status === 'Fechado').length;
        const mPerdidos = monthLeads.filter(l => l.status === 'Perdido').length;
        return {
            novos: monthLeads.length,
            fechados: mFechados,
            perdidos: mPerdidos,
            emAberto: monthLeads.length - mFechados - mPerdidos,
            taxa: monthLeads.length > 0 ? Math.round((mFechados / monthLeads.length) * 100) : 0,
        };
    }, [monthLeads]);

    // Daily last 30 days
    const daily = useMemo(() => {
        const days: number[] = [];
        const labels: string[] = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
            const next = new Date(d); next.setDate(d.getDate() + 1);
            days.push(leads.filter(l => {
                const raw = l.data_entrada || l.created_at;
                if (!raw) return false;
                const ld = new Date(raw);
                return ld >= d && ld < next;
            }).length);
            labels.push(d.getDate().toString());
        }
        return { days, labels };
    }, [leads]);

    // Top estados
    const topEstados = useMemo(() => {
        const c: Record<string, number> = {};
        leads.forEach(l => { if (l.estado) c[l.estado] = (c[l.estado] || 0) + 1; });
        return Object.entries(c).sort(([, a], [, b]) => b - a).slice(0, 7);
    }, [leads]);
    const maxEstado = topEstados[0]?.[1] || 1;

    // Source breakdown
    const sourceCounts = useMemo(() => {
        const c: Record<string, number> = {};
        leads.forEach(l => {
            const k = l.source?.toLowerCase() || '';
            const src = SOURCE_LABELS[k] || l.source || 'Sem origem';
            c[src] = (c[src] || 0) + 1;
        });
        return Object.entries(c).sort(([, a], [, b]) => b - a).slice(0, 7);
    }, [leads]);
    const maxSource = sourceCounts[0]?.[1] || 1;

    // Responsáveis
    const responsaveis = useMemo(() => {
        const c: Record<string, number> = {};
        leads.forEach(l => { const r = l.responsavel || 'Sem responsável'; c[r] = (c[r] || 0) + 1; });
        return Object.entries(c).sort(([, a], [, b]) => b - a).slice(0, 6);
    }, [leads]);
    const maxResp = responsaveis[0]?.[1] || 1;

    // Prioridade
    const prioridades = useMemo(() => {
        const c: Record<string, number> = {};
        leads.forEach(l => { const p = l.prioridade || 'Normal'; c[p] = (c[p] || 0) + 1; });
        return Object.entries(c).sort(([, a], [, b]) => b - a);
    }, [leads]);

    return (
        <div className="flex flex-col gap-4 overflow-auto pb-2">

            {/* Row 1: KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                    { label: 'Total de leads', value: leads.length, icon: Users, bg: 'bg-blue-50 dark:bg-blue-500/10', color: 'text-blue-500' },
                    { label: 'Em aberto', value: emAberto, icon: TrendingUp, bg: 'bg-orange-50 dark:bg-orange-500/10', color: 'text-orange-500' },
                    { label: 'Fechados', value: fechados, icon: CheckCircle2, bg: 'bg-green-50 dark:bg-green-500/10', color: 'text-green-500' },
                    { label: 'Perdidos', value: perdidos, icon: XCircle, bg: 'bg-red-50 dark:bg-red-500/10', color: 'text-red-500' },
                    { label: 'Taxa de fechamento', value: `${taxaGeral}%`, icon: BarChart2, bg: 'bg-yellow-50 dark:bg-yellow-500/10', color: 'text-yellow-600' },
                ].map(({ label, value, icon: Icon, bg, color }) => (
                    <div key={label} className={`${card} flex items-center gap-3`}>
                        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                            <Icon size={18} className={color} />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
                            <p className="text-xs text-gray-500 leading-tight">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Row 2: Pipeline por etapa */}
            <div className={card}>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Pipeline por etapa</h3>
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {stageCounts.map(({ stage, count, color }) => (
                        <div key={stage} className="flex-1 min-w-[80px] bg-gray-50 dark:bg-[#111] rounded-lg p-3 flex flex-col items-center gap-1.5 border border-gray-100 dark:border-[#2a2a2a]">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{count}</p>
                            <p className="text-[10px] text-gray-500 text-center leading-tight truncate w-full text-center">{stage}</p>
                            <div className="w-full h-1 rounded-full bg-gray-200 dark:bg-[#222] overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${(count / maxStage) * 100}%`, backgroundColor: color }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Row 3: Monthly stats */}
            <div className={card}>
                <div className="flex gap-1 mb-4 border-b border-gray-200 dark:border-[#222]">
                    {monthTabs.map((t, i) => (
                        <button
                            key={i}
                            onClick={() => setMonthOffset(i)}
                            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                                monthOffset === i
                                    ? 'border-[#B8860B] text-gray-900 dark:text-white'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                        { label: 'Novos leads', value: mStats.novos, color: 'text-gray-900 dark:text-white' },
                        { label: 'Em aberto', value: mStats.emAberto, color: 'text-orange-500' },
                        { label: 'Fechados', value: mStats.fechados, color: 'text-green-500' },
                        { label: 'Perdidos', value: mStats.perdidos, color: 'text-red-500' },
                        { label: 'Taxa fechamento', value: `${mStats.taxa}%`, color: 'text-[#B8860B]' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="bg-gray-50 dark:bg-[#111] rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">{label}</p>
                            <p className={`text-2xl font-bold ${color}`}>{value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Row 4: Line chart + Source */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className={`${card} lg:col-span-2`}>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Leads por dia</h3>
                        <span className="text-xs text-gray-400">Últimos 30 dias · máx {Math.max(...daily.days)}</span>
                    </div>
                    <LineChart data={daily.days} color="#B8860B" />
                    <div className="flex justify-between mt-1 px-1">
                        {daily.labels.map((lbl, i) => (i % 5 === 0 || i === 29) && (
                            <span key={i} className="text-[10px] text-gray-400">{lbl}</span>
                        ))}
                    </div>
                </div>

                <div className={card}>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Por origem</h3>
                    {sourceCounts.length === 0 ? (
                        <p className="text-xs text-gray-400">Sem dados de origem</p>
                    ) : (
                        <div className="flex flex-col gap-2.5">
                            {sourceCounts.map(([src, count]) => (
                                <div key={src}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-600 dark:text-gray-300 truncate max-w-[130px]">{src}</span>
                                        <span className="text-gray-500 font-medium">{count}</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 dark:bg-[#222] rounded-full overflow-hidden">
                                        <div className="h-full rounded-full bg-[#B8860B]" style={{ width: `${(count / maxSource) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Row 5: Estados + Responsáveis + Prioridade */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className={card}>
                    <div className="flex items-center gap-2 mb-3">
                        <MapPin size={14} className="text-orange-400" />
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Top estados</h3>
                    </div>
                    {topEstados.length === 0 ? (
                        <p className="text-xs text-gray-400">Sem dados de localização</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {topEstados.map(([estado, count]) => (
                                <div key={estado} className="flex items-center gap-2">
                                    <span className="text-xs text-gray-600 dark:text-gray-300 w-8 shrink-0 font-medium">{estado}</span>
                                    <div className="flex-1 h-2 bg-gray-100 dark:bg-[#222] rounded-full overflow-hidden">
                                        <div className="h-full rounded-full bg-orange-400" style={{ width: `${(count / maxEstado) * 100}%` }} />
                                    </div>
                                    <span className="text-xs text-gray-500 w-6 text-right shrink-0">{count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={card}>
                    <div className="flex items-center gap-2 mb-3">
                        <Users size={14} className="text-blue-400" />
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Responsáveis</h3>
                    </div>
                    {responsaveis.length === 0 ? (
                        <p className="text-xs text-gray-400">Sem dados</p>
                    ) : (
                        <div className="flex flex-col gap-2.5">
                            {responsaveis.map(([resp, count]) => (
                                <div key={resp} className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-[#B8860B]/20 text-[#B8860B] text-xs font-bold flex items-center justify-center shrink-0">
                                        {resp.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-xs mb-0.5">
                                            <span className="text-gray-600 dark:text-gray-300 truncate max-w-[110px]">{resp}</span>
                                            <span className="text-gray-500 font-medium">{count}</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-100 dark:bg-[#222] rounded-full overflow-hidden">
                                            <div className="h-full rounded-full bg-blue-400" style={{ width: `${(count / maxResp) * 100}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={card}>
                    <div className="flex items-center gap-2 mb-3">
                        <BarChart2 size={14} className="text-purple-400" />
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Por prioridade</h3>
                    </div>
                    {prioridades.length === 0 ? (
                        <p className="text-xs text-gray-400">Sem dados</p>
                    ) : (
                        <div className="flex flex-col gap-2.5">
                            {prioridades.map(([prio, count]) => {
                                const maxP = prioridades[0][1];
                                const color = prio === 'Alta' ? '#ef4444' : prio === 'Média' ? '#f97316' : '#6b7280';
                                return (
                                    <div key={prio} className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                        <div className="flex-1">
                                            <div className="flex justify-between text-xs mb-0.5">
                                                <span className="text-gray-600 dark:text-gray-300">{prio}</span>
                                                <span className="text-gray-500 font-medium">{count}</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-100 dark:bg-[#222] rounded-full overflow-hidden">
                                                <div className="h-full rounded-full" style={{ width: `${(count / maxP) * 100}%`, backgroundColor: color }} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
