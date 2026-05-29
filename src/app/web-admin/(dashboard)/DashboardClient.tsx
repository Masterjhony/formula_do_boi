'use client';

import Link from 'next/link';
import {
    PhoneCall, ListTodo, ArrowRight, Sparkles,
    TrendingUp, TrendingDown, Users, MessageSquare,
    Package, Dna, Flame,
} from 'lucide-react';
import './dashboard.css';

// ─── types ──────────────────────────────────────────────────────────────────

export type FunnelStep = { label: string; n: number; pct: number };

export type FeedItem = {
    id: string;
    kind: 'lead' | 'wpp' | 'task' | 'ai';
    text: string;
    when: string;
};

export type CatCount = { label: string; count: number };
export type ReservaStatusItem = { status: string; label: string; count: number; valor: number };

export type DashboardProps = {
    today: string;
    kpi: {
        activeLeads: number;
        hotLeads: number;
        totalLeads: number;
        leads7d: number;
        leadsSpark: number[];
    };
    funnel: FunnelStep[];
    feed: FeedItem[];
    formula: {
        produtosTotal: number;
        produtosByCategory: CatCount[];
        reservasAtivas: number;
        reservasValor: number;
        reservasByStatus: ReservaStatusItem[];
    };
};

// Item genérico de KPI — montado no root e passado ao componente <KPIs />.
export type KpiItem = {
    label: string;
    val: string;
    delta: string;
    dir?: 'up' | 'down';
    icon: React.ReactNode;
    spark: number[];
    color: string;
    tone: string;
    href: string;
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

// ─── KPIs ───────────────────────────────────────────────────────────────────

const KPI_GOLD = '#D4A85C', KPI_GREEN = '#5db87a', KPI_BLUE = '#6a8fd4', KPI_VIOLET = '#9b86c4';

function KPIs({ items }: { items: KpiItem[] }) {
    return (
        <div className="dcl-kpi-row">
            {items.map(it => (
                <Link key={it.label} href={it.href} className="dcl-kpi dcl-k-gold">
                    <div className="dcl-kpi-head">
                        <div className="dcl-kpi-label">{it.label}</div>
                        <div className={`dcl-kpi-ic dcl-${it.tone}`}>{it.icon}</div>
                    </div>
                    <div className="dcl-kpi-val">{it.val}</div>
                    <div className="dcl-kpi-delta">
                        <span className={it.dir === 'down' ? 'dcl-delta-dn' : 'dcl-delta-up'}>
                            {it.dir === 'down' ? <TrendingDown size={11} /> : <TrendingUp size={11} />}
                        </span>
                        <span>{it.delta}</span>
                    </div>
                    {it.spark?.length > 0 && <Sparkline data={it.spark} color={it.color} />}
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

function ActivityFeed({ items, href = '/leads' }: { items: FeedItem[]; href?: string }) {
    const kindToDot: Record<FeedItem['kind'], { cls: string; icon: React.ReactNode }> = {
        lead: { cls: 'dcl-b', icon: <PhoneCall size={11} /> },
        wpp: { cls: 'dcl-g', icon: <MessageSquare size={11} /> },
        task: { cls: 'dcl-v', icon: <ListTodo size={11} /> },
        ai: { cls: 'dcl-v', icon: <Sparkles size={11} /> },
    };
    return (
        <div className="dcl-card dcl-col-8">
            <div className="dcl-card-head">
                <div>
                    <h3>Atividade recente</h3>
                    <span className="dcl-sub">
                        <span className="dcl-status-pill" style={{ padding: '2px 8px', fontSize: 10.5 }}>
                            <span className="dcl-ping" />em tempo real
                        </span>
                    </span>
                </div>
                <Link href={href} className="dcl-link-btn">Ver tudo <ArrowRight size={13} /></Link>
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

// ─── Produtos & Reservas (operação Fórmula do Boi) ──────────────────────────

function ProdutosPanel({ items, total }: { items: CatCount[]; total: number }) {
    const max = Math.max(...items.map(i => i.count), 1);
    return (
        <div className="dcl-card dcl-col-6">
            <div className="dcl-card-head">
                <div>
                    <h3>Catálogo de produtos</h3>
                    <span className="dcl-sub">{fmtNum(total)} cards · distribuição por categoria</span>
                </div>
                <Link href="/products" className="dcl-link-btn"><Dna size={14} /></Link>
            </div>
            {items.length === 0 ? (
                <div style={{ color: 'var(--dcl-ink-3)', fontSize: 13, padding: '18px 0' }}>Nenhum produto cadastrado.</div>
            ) : items.map(it => {
                const pct = (it.count / max) * 100;
                return (
                    <div key={it.label} className="dcl-region-row">
                        <div className="dcl-n">{it.label}</div>
                        <div className="dcl-bar"><span style={{ width: pct + '%' }} /></div>
                        <div className="dcl-v">{fmtNum(it.count)}</div>
                    </div>
                );
            })}
        </div>
    );
}

function ReservasPanel({ items, total, valor }: { items: ReservaStatusItem[]; total: number; valor: number }) {
    const max = Math.max(...items.map(i => i.count), 1);
    return (
        <div className="dcl-card dcl-col-6">
            <div className="dcl-card-head">
                <div>
                    <h3>Reservas por etapa</h3>
                    <span className="dcl-sub">{fmtNum(total)} ativas · {fmtBRLCompact(valor)} em valor</span>
                </div>
                <Link href="/reservas" className="dcl-link-btn"><ArrowRight size={14} /></Link>
            </div>
            {items.length === 0 ? (
                <div style={{ color: 'var(--dcl-ink-3)', fontSize: 13, padding: '18px 0' }}>Nenhuma reserva ativa.</div>
            ) : items.map(it => {
                const pct = (it.count / max) * 100;
                return (
                    <div key={it.status} className="dcl-region-row">
                        <div className="dcl-n">{it.label}</div>
                        <div className="dcl-bar"><span style={{ width: pct + '%' }} /></div>
                        <div className="dcl-v">{fmtNum(it.count)}</div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Root ───────────────────────────────────────────────────────────────────

export default function DashboardClient(props: DashboardProps) {
    const totalFunnel = props.funnel[0]?.n ?? 0;
    const totalClosed = props.funnel[props.funnel.length - 1]?.n ?? 0;
    const convRate = totalFunnel > 0 ? (totalClosed / totalFunnel) * 100 : 0;

    const k = props.kpi;
    const f = props.formula;
    const plural = (n: number) => (n === 1 ? '' : 's');

    const kpis: KpiItem[] = [
        { label: 'Leads ativos', val: fmtNum(k.activeLeads), delta: `${k.hotLeads} quente${plural(k.hotLeads)}`, dir: 'up', icon: <PhoneCall size={12} />, spark: k.leadsSpark, color: KPI_BLUE, tone: 'blue', href: '/leads' },
        { label: 'Novos (7d)', val: fmtNum(k.leads7d), delta: 'últimos 7 dias', dir: 'up', icon: <Flame size={12} />, spark: k.leadsSpark, color: KPI_GREEN, tone: 'green', href: '/leads' },
        { label: 'Total no CRM', val: fmtNum(k.totalLeads), delta: 'todos os contatos', icon: <Users size={12} />, spark: k.leadsSpark, color: KPI_VIOLET, tone: 'violet', href: '/crm' },
        { label: 'Produtos', val: fmtNum(f.produtosTotal), delta: `${f.produtosByCategory.length} categoria${plural(f.produtosByCategory.length)}`, dir: 'up', icon: <Dna size={12} />, spark: [], color: KPI_GOLD, tone: 'gold', href: '/products' },
        { label: 'Reservas ativas', val: fmtNum(f.reservasAtivas), delta: fmtBRLCompact(f.reservasValor), dir: 'up', icon: <Package size={12} />, spark: [], color: KPI_GREEN, tone: 'green', href: '/reservas' },
    ];

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

            <KPIs items={kpis} />

            <div className="dcl-bento">
                <Funnel steps={props.funnel} totalConv={convRate} />
                <ActivityFeed items={props.feed} href="/leads" />
            </div>

            <div className="dcl-bento">
                <ProdutosPanel items={f.produtosByCategory} total={f.produtosTotal} />
                <ReservasPanel items={f.reservasByStatus} total={f.reservasAtivas} valor={f.reservasValor} />
            </div>
        </div>
    );
}
