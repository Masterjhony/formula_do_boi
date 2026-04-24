'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    Gavel, Target, Trophy, PhoneCall, ListTodo,
    Filter, ArrowRight, Download, MoreHorizontal,
    Sparkles, CheckCircle2, Clock, MapPin,
    TrendingUp, TrendingDown, Plus, Users, MessageSquare,
    Crown, Medal,
} from 'lucide-react';
import './dashboard.css';

// ─── types ──────────────────────────────────────────────────────────────────

export type ProximoLeilao = {
    nome: string;
    tipo: string | null;
    animais: number;
    meta_bula: number;
    expectativa: number;
    horario: string | null;
    leiloeira: string | null;
    local: string | null;
    status: string;
    data: string; // ISO YYYY-MM-DD
    wk: string;   // Seg, Ter…
    day: string;  // 28
    mo: string;   // Abr
    targetTs: number | null; // ms (hora do leilão) para countdown
    diasParaProximo: number | null;
};

export type ProximoLeilaoRow = {
    id: string;
    d: string; m: string; wk: string;
    title: string; type: string;
    status: 'ok' | 'warn' | 'pend';
    statusLabel: string;
    pct: number;
    animais: number;
    expectativaLabel: string;
};

export type VgvPoint = { label: string; meta: number; vgv: number; prev: number };

export type FunnelStep = { label: string; n: number; pct: number };

export type FeedItem = {
    id: string;
    kind: 'lead' | 'wpp' | 'fechamento' | 'task' | 'ai';
    text: string;
    when: string;
};

export type TaskItem = {
    id: string;
    title: string;
    due: string;
    prio: 'hi' | 'md' | 'lo';
    status: string;
    done: boolean;
};

export type RegionItem = { uf: string; estado: string; vgv: number; lotes: number; pct: number };

export type AssessorItem = { nome: string; empresa: string; vgv: number; animais: number };
export type CompradorItem = { fazenda: string; uf: string; vgv: number; lotes: number };
export type LanceItem = { lote: string; fazenda: string; uf: string; vgv: number; leilao: string };

export type DashboardProps = {
    today: string;
    proximo: ProximoLeilao | null;
    upcoming: ProximoLeilaoRow[];
    kpi: {
        upcomingCount: number;
        confirmedCount: number;
        totalMetaBula: number;
        totalAnimaisUpcoming: number;
        totalVgvFechado: number;
        totalFechamentos: number;
        activeLeads: number;
        hotLeads: number;
        totalLeads: number;
        pendingTasks: number;
        overdueTasks: number;
        completionRate: number;
        vgvSpark: number[];
        metaSpark: number[];
        leadsSpark: number[];
    };
    vgv: VgvPoint[];
    funnel: FunnelStep[];
    feed: FeedItem[];
    tasks: TaskItem[];
    regions: RegionItem[];
    rankings: {
        assessores: AssessorItem[];
        compradores: CompradorItem[];
        lances: LanceItem[];
    };
    aiInsight: { projection: number; metaTotal: number; pct: number; hint: string };
};

// ─── helpers ────────────────────────────────────────────────────────────────

const fmtBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const fmtBRLCompact = (v: number) => {
    const abs = Math.abs(v);
    const sign = v < 0 ? '−' : '';
    if (abs >= 1_000_000) return `${sign}R$ ${(abs / 1_000_000).toFixed(2).replace('.', ',')}M`;
    if (abs >= 1_000) return `${sign}R$ ${(abs / 1_000).toFixed(0)}k`;
    return fmtBRL(v);
};
const fmtNum = (v: number) => v.toLocaleString('pt-BR');

function useCountdown(target: number | null) {
    const [now, setNow] = useState<number>(() => Date.now());
    useEffect(() => {
        if (target == null) return;
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, [target]);
    if (target == null) return { d: 0, h: 0, m: 0, s: 0, done: true };
    const ms = Math.max(0, target - now);
    return {
        d: Math.floor(ms / 86400000),
        h: Math.floor((ms % 86400000) / 3600000),
        m: Math.floor((ms % 3600000) / 60000),
        s: Math.floor((ms % 60000) / 1000),
        done: ms === 0,
    };
}

function pad2(n: number) { return String(n).padStart(2, '0'); }

// ─── Sparkline ──────────────────────────────────────────────────────────────

function Sparkline({ data, color, fill = true }: { data: number[]; color: string; fill?: boolean }) {
    const w = 58, h = 22, pad = 2;
    if (!data.length) return null;
    const min = Math.min(...data), max = Math.max(...data);
    const rng = max - min || 1;
    const pts = data.map((v, i) => {
        const x = pad + (i / Math.max(1, data.length - 1)) * (w - pad * 2);
        const y = h - pad - ((v - min) / rng) * (h - pad * 2);
        return [x, y] as const;
    });
    const path = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
    const fillPath = path + ` L${pts[pts.length - 1][0]},${h} L${pts[0][0]},${h} Z`;
    const gid = 'sp-' + color.replace(/[^a-z0-9]/gi, '');
    return (
        <svg className="dcl-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
            <defs>
                <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            {fill && <path d={fillPath} fill={`url(#${gid})`} />}
            <path d={path} fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// ─── Hero ───────────────────────────────────────────────────────────────────

function Hero({ data }: { data: ProximoLeilao | null }) {
    const { d, h, m, s, done } = useCountdown(data?.targetTs ?? null);
    if (!data) {
        return (
            <div className="dcl-hero" style={{ gridTemplateColumns: '1fr', textAlign: 'center' }}>
                <div>
                    <div className="dcl-hero-tags"><span className="dcl-tag dcl-dim">Nenhum leilão próximo cadastrado</span></div>
                    <h2 className="dcl-hero-title">Sem leilões agendados</h2>
                    <p style={{ color: 'var(--dcl-ink-3)', fontSize: 13, marginTop: 4 }}>Adicione um novo evento na página de Leilões.</p>
                </div>
            </div>
        );
    }
    const diasLabel = data.diasParaProximo === 0 ? 'hoje' : data.diasParaProximo === 1 ? 'amanhã' : `em ${data.diasParaProximo} dias`;
    const statusMap: Record<string, { cls: string; label: string }> = {
        confirmado: { cls: 'dcl-green', label: 'Confirmado' },
        negociacao: { cls: 'dcl-dim', label: 'Em negociação' },
        prospecto: { cls: 'dcl-dim', label: 'Prospecto' },
    };
    const st = statusMap[data.status] ?? statusMap.prospecto;
    return (
        <Link href="/leiloes" className="dcl-hero">
            <div className="dcl-date-block">
                <div className="dcl-wk">{data.wk}</div>
                <div className="dcl-day">{data.day}</div>
                <div className="dcl-mo">{data.mo}</div>
            </div>
            <div className="dcl-hero-body">
                <div className="dcl-hero-tags">
                    <span className="dcl-tag dcl-gold"><Gavel size={11} /><span>Próximo leilão</span></span>
                    <span className={`dcl-tag ${st.cls}`}>{data.status === 'confirmado' ? <CheckCircle2 size={11} /> : null}<span>{st.label}</span></span>
                    {data.horario && (
                        <span className="dcl-tag dcl-dim"><Clock size={11} />{diasLabel} · {data.horario}</span>
                    )}
                </div>
                <h2 className="dcl-hero-title">
                    {data.nome}
                    {data.tipo && <span className="dcl-sub"> · {data.tipo}</span>}
                </h2>
                <div className="dcl-hero-meta">
                    {data.animais > 0 && <><span>{fmtNum(data.animais)} animais catalogados</span><span className="dcl-dot" /></>}
                    {data.meta_bula > 0 && <><span>Meta: {fmtBRLCompact(data.meta_bula)}</span><span className="dcl-dot" /></>}
                    {data.expectativa > 0 && <><span>Expectativa: {fmtBRLCompact(data.expectativa)}</span><span className="dcl-dot" /></>}
                    {data.leiloeira && <><span>{data.leiloeira}</span><span className="dcl-dot" /></>}
                    {data.local && <span><MapPin size={12} style={{ verticalAlign: -2, marginRight: 4 }} />{data.local}</span>}
                </div>
            </div>
            <div className="dcl-countdown">
                <div className="dcl-cd-cell"><div className="dcl-n">{done ? '00' : pad2(d)}</div><div className="dcl-l">dias</div></div>
                <div className="dcl-cd-cell"><div className="dcl-n">{done ? '00' : pad2(h)}</div><div className="dcl-l">horas</div></div>
                <div className="dcl-cd-cell"><div className="dcl-n">{done ? '00' : pad2(m)}</div><div className="dcl-l">min</div></div>
                <div className="dcl-cd-cell"><div className="dcl-n">{done ? '00' : pad2(s)}</div><div className="dcl-l">seg</div></div>
            </div>
        </Link>
    );
}

// ─── KPIs ───────────────────────────────────────────────────────────────────

function KPIs({ k }: { k: DashboardProps['kpi'] }) {
    const GOLD = '#D4A85C', GREEN = '#5db87a', RED = '#e26a5b', BLUE = '#6a8fd4', VIOLET = '#9b86c4';
    const items = [
        { label: 'Próx. leilões', val: String(k.upcomingCount), unit: '', delta: `${k.confirmedCount} confirmado${k.confirmedCount === 1 ? '' : 's'}`, dir: 'up' as const, icon: <Gavel size={12} />, spark: k.metaSpark, color: GOLD, tone: 'gold', href: '/leiloes' },
        { label: 'Meta confirmada', val: fmtBRLCompact(k.totalMetaBula), unit: '', delta: `${fmtNum(k.totalAnimaisUpcoming)} animais`, dir: 'up' as const, icon: <Target size={12} />, spark: k.metaSpark, color: GREEN, tone: 'green', href: '/leiloes' },
        { label: 'VGV fechado', val: fmtBRLCompact(k.totalVgvFechado), unit: '', delta: `${k.totalFechamentos} fechamentos`, dir: 'up' as const, icon: <Trophy size={12} />, spark: k.vgvSpark, color: GOLD, tone: 'gold', href: '/leiloes/fechamento' },
        { label: 'Leads ativos', val: fmtNum(k.activeLeads), unit: '', delta: `${k.hotLeads} quente${k.hotLeads === 1 ? '' : 's'}`, dir: 'up' as const, icon: <PhoneCall size={12} />, spark: k.leadsSpark, color: BLUE, tone: 'blue', href: '/leads' },
        { label: 'Tarefas', val: String(k.pendingTasks), unit: '', delta: k.overdueTasks > 0 ? `${k.overdueTasks} em atraso` : `${k.completionRate}% concluído`, dir: k.overdueTasks > 0 ? 'dn' as const : 'up' as const, icon: <ListTodo size={12} />, spark: k.leadsSpark, color: k.overdueTasks > 0 ? RED : VIOLET, tone: k.overdueTasks > 0 ? 'red' : 'violet', href: '/tactical-plan' },
    ];
    return (
        <div className="dcl-kpi-row">
            {items.map(it => {
                const Body = (
                    <>
                        <div className="dcl-kpi-head">
                            <div className="dcl-kpi-label">{it.label}</div>
                            <div className={`dcl-kpi-ic dcl-${it.tone}`}>{it.icon}</div>
                        </div>
                        <div className="dcl-kpi-val">{it.val}{it.unit && <span className="dcl-unit">{it.unit}</span>}</div>
                        <div className="dcl-kpi-delta">
                            <span className={it.dir === 'up' ? 'dcl-delta-up' : 'dcl-delta-dn'}>
                                {it.dir === 'up' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                            </span>
                            <span>{it.delta}</span>
                        </div>
                        {it.spark?.length > 0 && <Sparkline data={it.spark} color={it.color} />}
                    </>
                );
                return <Link key={it.label} href={it.href} className="dcl-kpi dcl-k-gold">{Body}</Link>;
            })}
        </div>
    );
}

// ─── VGV Chart ──────────────────────────────────────────────────────────────

function VGVChart({ data, totalMeta, totalVgv, projection }: { data: VgvPoint[]; totalMeta: number; totalVgv: number; projection: number }) {
    const [hover, setHover] = useState<number | null>(null);
    const safe = data.length ? data : [{ label: '—', meta: 0, vgv: 0, prev: 0 }];
    const w = 820, h = 260, pad = { l: 48, r: 16, t: 16, b: 30 };
    const innerW = w - pad.l - pad.r, innerH = h - pad.t - pad.b;
    const allVals = safe.flatMap(p => [p.meta, p.vgv, p.prev]);
    const rawMax = Math.max(...allVals, 0.1);
    const max = Math.ceil(rawMax * 1.2 * 10) / 10;
    const xFor = (i: number) => pad.l + (i / Math.max(1, safe.length - 1)) * innerW;
    const yFor = (v: number) => pad.t + innerH - (v / max) * innerH;
    const mkArea = (arr: number[]) => {
        const p = arr.map((v, i) => (i === 0 ? 'M' : 'L') + xFor(i) + ',' + yFor(v)).join(' ');
        return p + ` L${xFor(arr.length - 1)},${pad.t + innerH} L${xFor(0)},${pad.t + innerH} Z`;
    };
    const mkLine = (arr: number[]) => arr.map((v, i) => (i === 0 ? 'M' : 'L') + xFor(i) + ',' + yFor(v)).join(' ');
    const yTicks = [0, max / 4, max / 2, (3 * max) / 4, max];
    const meta = safe.map(p => p.meta);
    const vgv = safe.map(p => p.vgv);
    const prev = safe.map(p => p.prev);
    const pctMeta = totalMeta > 0 ? (totalVgv / totalMeta) * 100 : 0;
    const prevSum = prev.reduce((a, b) => a + b, 0);
    const currSum = vgv.reduce((a, b) => a + b, 0);
    const deltaPct = prevSum > 0 ? ((currSum - prevSum) / prevSum) * 100 : 0;

    return (
        <div className="dcl-card dcl-col-8">
            <div className="dcl-card-head">
                <div>
                    <h3>Volume geral de vendas · R$</h3>
                    <span className="dcl-sub">Meta confirmada vs VGV fechado · comparação com ano anterior</span>
                </div>
                <div className="dcl-row">
                    <button className="dcl-timeframe" style={{ padding: 0 }}>
                        <span style={{ padding: '6px 11px', fontSize: 12, color: 'var(--dcl-ink-2)' }}>6M</span>
                    </button>
                    <button className="dcl-link-btn" title="Exportar"><Download size={14} /></button>
                    <button className="dcl-link-btn" title="Mais"><MoreHorizontal size={14} /></button>
                </div>
            </div>
            <div className="dcl-chart-stats">
                <div className="dcl-s">
                    <div className="dcl-n">{fmtBRLCompact(totalMeta)}</div>
                    <div className="dcl-l">Meta confirmada · acumulado</div>
                    <div className="dcl-d" style={{ color: deltaPct >= 0 ? 'var(--dcl-green)' : 'var(--dcl-red)' }}>
                        {deltaPct >= 0 ? '↑' : '↓'} {Math.abs(deltaPct).toFixed(1)}% vs período anterior
                    </div>
                </div>
                <div className="dcl-s">
                    <div className="dcl-n">{fmtBRLCompact(totalVgv)}</div>
                    <div className="dcl-l">VGV fechado ({pctMeta.toFixed(0)}% da meta)</div>
                    <div className="dcl-d" style={{ color: 'var(--dcl-gold)' }}>Projeção IA: {fmtBRLCompact(projection)}</div>
                </div>
                <div className="dcl-s" style={{ marginLeft: 'auto' }}>
                    <div className="dcl-chart-legend" style={{ marginTop: 16 }}>
                        <span><span className="dcl-sw" style={{ background: 'var(--dcl-gold)' }} />Meta</span>
                        <span><span className="dcl-sw" style={{ background: '#6a8fd4' }} />VGV</span>
                        <span><span className="dcl-sw" style={{ background: 'var(--dcl-ink-4)' }} />Ano anterior</span>
                    </div>
                </div>
            </div>
            <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 260, display: 'block' }}
                onMouseLeave={() => setHover(null)}
                onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * w;
                    const i = Math.round(((x - pad.l) / innerW) * (safe.length - 1));
                    if (i >= 0 && i < safe.length) setHover(i);
                }}>
                <defs>
                    <linearGradient id="dclGMeta" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#D4A85C" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#D4A85C" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="dclGVgv" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#6a8fd4" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#6a8fd4" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {yTicks.map(t => (
                    <g key={t}>
                        <line x1={pad.l} x2={w - pad.r} y1={yFor(t)} y2={yFor(t)} stroke="#1f1f26" strokeDasharray="2 4" />
                        <text x={pad.l - 10} y={yFor(t) + 3} fontSize="10" fill="#6b6b78" textAnchor="end" fontFamily="var(--font-mono), ui-monospace, monospace">{t >= 1 ? t.toFixed(1) + 'M' : (t * 1000).toFixed(0) + 'k'}</text>
                    </g>
                ))}
                <path d={mkLine(prev)} fill="none" stroke="#43434d" strokeWidth="1.3" strokeDasharray="4 4" />
                <path d={mkArea(vgv)} fill="url(#dclGVgv)" />
                <path d={mkLine(vgv)} fill="none" stroke="#6a8fd4" strokeWidth="2" />
                <path d={mkArea(meta)} fill="url(#dclGMeta)" />
                <path d={mkLine(meta)} fill="none" stroke="#D4A85C" strokeWidth="2" />
                {safe.map((_, i) => (
                    <g key={i}>
                        <circle cx={xFor(i)} cy={yFor(meta[i])} r={hover === i ? 4.5 : 2.5} fill="#D4A85C" />
                        <circle cx={xFor(i)} cy={yFor(vgv[i])} r={hover === i ? 4 : 2.3} fill="#6a8fd4" />
                    </g>
                ))}
                {safe.map((p, i) => (
                    <text key={p.label + i} x={xFor(i)} y={h - 10} fontSize="11" fill="#6b6b78" textAnchor="middle" fontFamily="var(--font-mono), ui-monospace, monospace">{p.label}</text>
                ))}
                {hover !== null && (
                    <g>
                        <line x1={xFor(hover)} x2={xFor(hover)} y1={pad.t} y2={pad.t + innerH} stroke="#D4A85C" strokeOpacity="0.35" strokeDasharray="2 3" />
                        <g transform={`translate(${Math.min(xFor(hover) + 12, w - 170)}, ${pad.t + 8})`}>
                            <rect width="156" height="68" rx="8" fill="#0d0d10" stroke="#1f1f26" />
                            <text x="12" y="20" fontSize="10.5" fill="#6b6b78" style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>{safe[hover].label}</text>
                            <circle cx="14" cy="37" r="3" fill="#D4A85C" />
                            <text x="24" y="40" fontSize="11" fill="#a8a8b3">Meta</text>
                            <text x="145" y="40" fontSize="11.5" fill="#eeeef1" textAnchor="end" fontFamily="var(--font-mono), ui-monospace, monospace">{fmtBRLCompact(safe[hover].meta * 1_000_000)}</text>
                            <circle cx="14" cy="55" r="3" fill="#6a8fd4" />
                            <text x="24" y="58" fontSize="11" fill="#a8a8b3">VGV</text>
                            <text x="145" y="58" fontSize="11.5" fill="#eeeef1" textAnchor="end" fontFamily="var(--font-mono), ui-monospace, monospace">{fmtBRLCompact(safe[hover].vgv * 1_000_000)}</text>
                        </g>
                    </g>
                )}
            </svg>
        </div>
    );
}

// ─── AI Insight ─────────────────────────────────────────────────────────────

function AIInsight({ ai }: { ai: DashboardProps['aiInsight'] }) {
    const pct = Math.max(0, Math.min(120, ai.pct));
    return (
        <div className="dcl-card dcl-ai-card dcl-col-4">
            <div className="dcl-ai-head">
                <div className="dcl-ai-mark"><Sparkles size={14} /></div>
                <div className="dcl-ai-title">Leitura <span className="dcl-serif">inteligente</span></div>
                <span className="dcl-pill dcl-warn" style={{ marginLeft: 'auto' }}>Beta</span>
            </div>
            <div className="dcl-ai-body">
                <p style={{ margin: '0 0 10px' }}>
                    Com o ritmo atual, projeção de fechar <span className="dcl-hl">{fmtBRLCompact(ai.projection)}</span> no período — <span className="dcl-hl" style={{ color: ai.pct >= 100 ? 'var(--dcl-green)' : 'var(--dcl-red)' }}>{ai.pct >= 100 ? '+' : ''}{(ai.pct - 100).toFixed(1)}% vs meta</span>.
                </p>
                <p style={{ margin: 0, color: 'var(--dcl-ink-3)', fontSize: 12.5 }}>{ai.hint}</p>
            </div>
            <div className="dcl-ai-prog">
                <div>
                    <div className="dcl-ai-prog-label dcl-mono" style={{ marginBottom: 6 }}>Projeção · {Math.round(pct)}% da meta</div>
                    <div style={{ position: 'relative', height: 8, borderRadius: 99, background: 'var(--dcl-bg-card-2)', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.min(100, pct)}%`, background: 'linear-gradient(90deg,#6a8fd4,#D4A85C)', borderRadius: 99 }} />
                        <div style={{ position: 'absolute', left: '100%', top: -4, bottom: -4, width: 1, background: 'var(--dcl-green)', transform: 'translateX(-1px)' }} />
                    </div>
                </div>
            </div>
            <div className="dcl-ai-chips">
                <Link href="/leads" className="dcl-ai-chip">Ver leads sugeridos</Link>
                <Link href="/leiloes" className="dcl-ai-chip">Simular cenário</Link>
            </div>
        </div>
    );
}

// ─── Agenda ─────────────────────────────────────────────────────────────────

function Agenda({ rows }: { rows: ProximoLeilaoRow[] }) {
    return (
        <div className="dcl-card dcl-col-8">
            <div className="dcl-card-head">
                <div>
                    <h3>Próximos leilões</h3>
                    <span className="dcl-sub">Preview dos {rows.length} próximos eventos</span>
                </div>
                <div className="dcl-row">
                    <Link href="/leiloes" className="dcl-link-btn"><Filter size={13} /> Filtrar</Link>
                    <Link href="/leiloes" className="dcl-link-btn">Ver agenda completa <ArrowRight size={13} /></Link>
                </div>
            </div>
            {rows.length === 0 ? (
                <div style={{ color: 'var(--dcl-ink-3)', fontSize: 13, padding: '18px 0' }}>Nenhum leilão agendado.</div>
            ) : rows.map((r, i) => (
                <Link href={`/leiloes/${r.id}`} key={r.id + i} className="dcl-agenda-row">
                    <div className="dcl-agenda-date"><div className="dcl-d">{r.d}</div><div className="dcl-m">{r.m}</div></div>
                    <div>
                        <div className="dcl-agenda-title">
                            {r.title}
                            {i === 0 && <span className="dcl-pill dcl-warn" style={{ marginLeft: 10, verticalAlign: 2 }}>PRÓXIMO</span>}
                        </div>
                        <div className="dcl-agenda-meta">
                            <span>{r.type || '—'}</span>
                            <span className="dcl-dot" />
                            <span className="dcl-mono">{fmtNum(r.animais)} animais</span>
                            {r.expectativaLabel && (<><span className="dcl-dot" /><span>{r.expectativaLabel}</span></>)}
                        </div>
                    </div>
                    <div className="dcl-agenda-bars">
                        <div style={{ textAlign: 'right' }}>
                            <div className="dcl-mono" style={{ fontSize: 11, color: 'var(--dcl-ink-2)' }}>{r.pct}%</div>
                            <div className="dcl-bar-mini" style={{ marginTop: 4 }}><span style={{ width: r.pct + '%' }} /></div>
                        </div>
                        <span className={`dcl-pill dcl-${r.status}`}>{r.statusLabel}</span>
                    </div>
                </Link>
            ))}
        </div>
    );
}

// ─── Funnel ─────────────────────────────────────────────────────────────────

function Funnel({ steps, totalConv }: { steps: FunnelStep[]; totalConv: number }) {
    return (
        <div className="dcl-card dcl-col-4">
            <div className="dcl-card-head">
                <div>
                    <h3>Funil de leads</h3>
                    <span className="dcl-sub">Últimos leads · conversão {totalConv.toFixed(1)}%</span>
                </div>
                <Link href="/crm" className="dcl-link-btn"><ArrowRight size={14} /></Link>
            </div>
            <div className="dcl-funnel">
                {steps.length === 0 ? (
                    <div style={{ color: 'var(--dcl-ink-3)', fontSize: 13 }}>Sem dados de leads.</div>
                ) : steps.map((s, i) => (
                    <div key={s.label}>
                        <div className="dcl-funnel-step">
                            <div className="dcl-fn-label"><span>{s.label}</span></div>
                            <div><span className="dcl-fn-label"><span className="dcl-cnt dcl-mono">{fmtNum(s.n)}</span></span></div>
                        </div>
                        <div className="dcl-fn-bar"><span style={{ width: Math.max(2, s.pct) + '%' }} /></div>
                        <div className="dcl-fn-foot">
                            <span className="dcl-fn-pct">{s.pct.toFixed(1)}%</span>
                            {i > 0 && (
                                <span className="dcl-fn-pct" style={{ color: 'var(--dcl-ink-4)' }}>
                                    ↓ {fmtNum(Math.max(0, steps[i - 1].n - s.n))}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Activity Feed ──────────────────────────────────────────────────────────

function ActivityFeed({ items }: { items: FeedItem[] }) {
    const kindToDot: Record<FeedItem['kind'], { cls: string; icon: React.ReactNode }> = {
        lead: { cls: 'dcl-b', icon: <PhoneCall size={11} /> },
        wpp: { cls: 'dcl-g', icon: <MessageSquare size={11} /> },
        fechamento: { cls: 'dcl-a', icon: <Gavel size={11} /> },
        task: { cls: 'dcl-v', icon: <ListTodo size={11} /> },
        ai: { cls: 'dcl-v', icon: <Sparkles size={11} /> },
    };
    return (
        <div className="dcl-card dcl-col-5">
            <div className="dcl-card-head">
                <div>
                    <h3>Atividade recente</h3>
                    <span className="dcl-sub">
                        <span className="dcl-status-pill" style={{ padding: '2px 8px', fontSize: 10.5 }}>
                            <span className="dcl-ping" />em tempo real
                        </span>
                    </span>
                </div>
                <Link href="/leads" className="dcl-link-btn">Ver tudo <ArrowRight size={13} /></Link>
            </div>
            <div className="dcl-feed">
                {items.length === 0 ? (
                    <div style={{ color: 'var(--dcl-ink-3)', fontSize: 13, padding: '10px 0' }}>Nenhuma atividade recente.</div>
                ) : items.map((f) => {
                    const dot = kindToDot[f.kind];
                    return (
                        <div key={f.id} className="dcl-feed-item">
                            <div className={`dcl-feed-dot ${dot.cls}`}>{dot.icon}</div>
                            <div className="dcl-feed-text" dangerouslySetInnerHTML={{ __html: f.text }} />
                            <div className="dcl-feed-time">{f.when}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Tasks ──────────────────────────────────────────────────────────────────

function Tasks({ items, pending, overdue }: { items: TaskItem[]; pending: number; overdue: number }) {
    const prioLabel: Record<TaskItem['prio'], string> = { hi: 'Alta', md: 'Média', lo: 'Baixa' };
    return (
        <div className="dcl-card dcl-col-3">
            <div className="dcl-card-head">
                <div>
                    <h3>Tarefas</h3>
                    <span className="dcl-sub">{pending} pendentes · {overdue} em atraso</span>
                </div>
                <Link href="/tactical-plan" className="dcl-link-btn"><Plus size={14} /></Link>
            </div>
            {items.length === 0 ? (
                <div style={{ color: 'var(--dcl-ink-3)', fontSize: 13 }}>Sem tarefas pendentes.</div>
            ) : items.map(t => (
                <div key={t.id} className={`dcl-task${t.done ? ' dcl-done' : ''}`}>
                    <div className="dcl-task-box" />
                    <div>
                        <div className="dcl-task-title">{t.title}</div>
                        <div className="dcl-task-meta">
                            <span>{t.due}</span>
                            <span>·</span>
                            <span>{t.status}</span>
                        </div>
                    </div>
                    <span className={`dcl-prio dcl-${t.prio}`}>{prioLabel[t.prio]}</span>
                </div>
            ))}
        </div>
    );
}

// ─── Regions ────────────────────────────────────────────────────────────────

function RegionPanel({ regions }: { regions: RegionItem[] }) {
    const max = Math.max(...regions.map(r => r.vgv), 1);
    return (
        <div className="dcl-card dcl-col-4">
            <div className="dcl-card-head">
                <div>
                    <h3>Compradores por estado</h3>
                    <span className="dcl-sub">VGV total realizado por UF</span>
                </div>
                <Link href="/leiloes/fechamento" className="dcl-link-btn"><MapPin size={14} /></Link>
            </div>
            {regions.length === 0 ? (
                <div style={{ color: 'var(--dcl-ink-3)', fontSize: 13 }}>Sem dados regionais.</div>
            ) : regions.slice(0, 8).map(r => {
                const pct = (r.vgv / max) * 100;
                return (
                    <div key={r.uf} className="dcl-region-row">
                        <div className="dcl-n">{r.estado || r.uf}</div>
                        <div className="dcl-bar"><span style={{ width: pct + '%' }} /></div>
                        <div className="dcl-v">{fmtBRLCompact(r.vgv)}</div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Rankings (extras) ─────────────────────────────────────────────────────

function RankAssessores({ rows }: { rows: AssessorItem[] }) {
    return (
        <div className="dcl-card dcl-col-4">
            <div className="dcl-card-head">
                <div>
                    <h3>Top assessores</h3>
                    <span className="dcl-sub">VGV acumulado nos fechamentos</span>
                </div>
                <Crown size={14} style={{ color: 'var(--dcl-gold)' }} />
            </div>
            {rows.length === 0 ? <div style={{ color: 'var(--dcl-ink-3)', fontSize: 13 }}>Sem dados.</div> : rows.map((r, i) => (
                <div key={r.nome + i} className="dcl-rank-row">
                    <div className={`dcl-rank-pos${i > 2 ? ' dcl-mut' : ''}`}>{i + 1}</div>
                    <div>
                        <div className="dcl-rank-name">{r.nome}</div>
                        <div className="dcl-rank-meta">
                            {r.empresa && <span>{r.empresa}</span>}
                            {r.empresa && <span className="dcl-dot" style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--dcl-ink-4)' }} />}
                            <span>{fmtNum(r.animais)} animais</span>
                        </div>
                    </div>
                    <div>
                        <div className="dcl-rank-v">{fmtBRLCompact(r.vgv)}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function RankCompradores({ rows }: { rows: CompradorItem[] }) {
    return (
        <div className="dcl-card dcl-col-4">
            <div className="dcl-card-head">
                <div>
                    <h3>Top compradores</h3>
                    <span className="dcl-sub">Fazendas com maior VGV</span>
                </div>
                <Users size={14} style={{ color: 'var(--dcl-gold)' }} />
            </div>
            {rows.length === 0 ? <div style={{ color: 'var(--dcl-ink-3)', fontSize: 13 }}>Sem dados.</div> : rows.map((r, i) => (
                <div key={r.fazenda + i} className="dcl-rank-row">
                    <div className={`dcl-rank-pos${i > 2 ? ' dcl-mut' : ''}`}>{i + 1}</div>
                    <div>
                        <div className="dcl-rank-name">{r.fazenda}</div>
                        <div className="dcl-rank-meta">
                            {r.uf && <span>{r.uf}</span>}
                            {r.uf && <span className="dcl-dot" style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--dcl-ink-4)' }} />}
                            <span>{fmtNum(r.lotes)} lotes</span>
                        </div>
                    </div>
                    <div>
                        <div className="dcl-rank-v">{fmtBRLCompact(r.vgv)}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function RankLances({ rows }: { rows: LanceItem[] }) {
    return (
        <div className="dcl-card dcl-col-4">
            <div className="dcl-card-head">
                <div>
                    <h3>Maiores lances</h3>
                    <span className="dcl-sub">Arrematações de destaque</span>
                </div>
                <Medal size={14} style={{ color: 'var(--dcl-gold)' }} />
            </div>
            {rows.length === 0 ? <div style={{ color: 'var(--dcl-ink-3)', fontSize: 13 }}>Sem dados.</div> : rows.map((r, i) => (
                <div key={r.lote + i} className="dcl-rank-row">
                    <div className={`dcl-rank-pos${i > 2 ? ' dcl-mut' : ''}`}>{i + 1}</div>
                    <div>
                        <div className="dcl-rank-name">Lote {r.lote} · {r.fazenda}</div>
                        <div className="dcl-rank-meta">
                            <span>{r.leilao}</span>
                            {r.uf && <><span className="dcl-dot" style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--dcl-ink-4)' }} /><span>{r.uf}</span></>}
                        </div>
                    </div>
                    <div>
                        <div className="dcl-rank-v">{fmtBRLCompact(r.vgv)}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Root ───────────────────────────────────────────────────────────────────

export default function DashboardClient(props: DashboardProps) {
    const totalMeta = useMemo(() => props.vgv.reduce((s, p) => s + p.meta, 0) * 1_000_000, [props.vgv]);
    const totalVgv = useMemo(() => props.vgv.reduce((s, p) => s + p.vgv, 0) * 1_000_000, [props.vgv]);
    const totalFunnel = props.funnel[0]?.n ?? 0;
    const totalClosed = props.funnel[props.funnel.length - 1]?.n ?? 0;
    const convRate = totalFunnel > 0 ? (totalClosed / totalFunnel) * 100 : 0;

    return (
        <div className="dcl-root">
            <div className="dcl-pagehead">
                <div>
                    <h1>Visão <span className="dcl-serif">geral</span></h1>
                    <div className="dcl-sub">{props.today}</div>
                </div>
                <div className="dcl-pagehead-right">
                    <div className="dcl-status-pill"><span className="dcl-ping" /> Sistema ativo</div>
                </div>
            </div>

            <Hero data={props.proximo} />
            <KPIs k={props.kpi} />

            <div className="dcl-bento">
                <VGVChart data={props.vgv} totalMeta={totalMeta || props.kpi.totalMetaBula} totalVgv={totalVgv || props.kpi.totalVgvFechado} projection={props.aiInsight.projection} />
                <AIInsight ai={props.aiInsight} />
            </div>

            <div className="dcl-bento">
                <Agenda rows={props.upcoming} />
                <Funnel steps={props.funnel} totalConv={convRate} />
            </div>

            <div className="dcl-bento">
                <ActivityFeed items={props.feed} />
                <Tasks items={props.tasks} pending={props.kpi.pendingTasks} overdue={props.kpi.overdueTasks} />
                <RegionPanel regions={props.regions} />
            </div>

            <div className="dcl-bento">
                <RankAssessores rows={props.rankings.assessores} />
                <RankCompradores rows={props.rankings.compradores} />
                <RankLances rows={props.rankings.lances} />
            </div>
        </div>
    );
}
