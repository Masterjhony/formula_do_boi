'use client';

import { useState, useMemo } from 'react';
import {
    TacticalObjective, TacticalKeyResult,
    createObjective, deleteObjective,
    createKeyResult, updateKeyResult, deleteKeyResult,
} from '@/app/web-admin/actions/tactical-strategic';
import {
    Target, Plus, Trash2, Edit2, Check, X,
    ChevronDown, ChevronRight, TrendingUp, TrendingDown,
    Minus, AlertTriangle, CheckCircle2, Clock, Zap,
} from 'lucide-react';

const COLORS = ['#B8860B', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#F59E0B', '#06B6D4'];
const QUARTERS = ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026', 'Q1 2027'];

// ── Quarter pacing ─────────────────────────────────────────────────────────────

function computeQuarterPacing(quarter: string) {
    const match = quarter.match(/Q(\d)\s+(\d{4})/);
    if (!match) return null;
    const q = parseInt(match[1]);
    const year = parseInt(match[2]);
    const startMonth = (q - 1) * 3;
    const start = new Date(year, startMonth, 1);
    const end = new Date(year, startMonth + 3, 0);
    const now = new Date();
    const totalDays = Math.round((end.getTime() - start.getTime()) / 86400000);

    if (now < start) return { pct: 0, daysElapsed: 0, totalDays, phase: 'future' as const };
    if (now > end) return { pct: 100, daysElapsed: totalDays, totalDays, phase: 'past' as const };

    const daysElapsed = Math.round((now.getTime() - start.getTime()) / 86400000);
    return { pct: Math.round((daysElapsed / totalDays) * 100), daysElapsed, totalDays, phase: 'active' as const };
}

// ── Objective status ───────────────────────────────────────────────────────────

type ObjStatus = 'completed' | 'ahead' | 'on_track' | 'at_risk' | 'behind' | 'not_started';

function getObjectiveStatus(progress: number, quarterPct: number, phase: string): ObjStatus {
    if (progress >= 100) return 'completed';
    if (phase === 'future') return 'not_started';
    const gap = progress - quarterPct;
    if (gap >= 5) return 'ahead';
    if (gap >= -10) return 'on_track';
    if (gap >= -25) return 'at_risk';
    return 'behind';
}

const STATUS_CFG: Record<ObjStatus, {
    label: string; bg: string; text: string; border: string; stroke: string;
    icon: React.ReactNode; iconLg: React.ReactNode;
}> = {
    completed: {
        label: 'Concluído',
        bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-500/30', stroke: '#10B981',
        icon: <CheckCircle2 size={11} />, iconLg: <CheckCircle2 size={14} />,
    },
    ahead: {
        label: 'Na Frente',
        bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-500/30', stroke: '#3B82F6',
        icon: <TrendingUp size={11} />, iconLg: <TrendingUp size={14} />,
    },
    on_track: {
        label: 'No Ritmo',
        bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-500/30', stroke: '#10B981',
        icon: <TrendingUp size={11} />, iconLg: <TrendingUp size={14} />,
    },
    at_risk: {
        label: 'Em Risco',
        bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-500/30', stroke: '#F59E0B',
        icon: <AlertTriangle size={11} />, iconLg: <AlertTriangle size={14} />,
    },
    behind: {
        label: 'Atrasado',
        bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400',
        border: 'border-red-200 dark:border-red-500/30', stroke: '#EF4444',
        icon: <TrendingDown size={11} />, iconLg: <TrendingDown size={14} />,
    },
    not_started: {
        label: 'Não Iniciado',
        bg: 'bg-gray-50 dark:bg-gray-500/10', text: 'text-gray-500 dark:text-gray-400',
        border: 'border-gray-200 dark:border-gray-500/20', stroke: '#9CA3AF',
        icon: <Clock size={11} />, iconLg: <Clock size={14} />,
    },
};

// ── SVG ring ───────────────────────────────────────────────────────────────────

function ProgressRing({ pct, color, size = 68, sw = 5.5 }: {
    pct: number; color: string; size?: number; sw?: number;
}) {
    const r = (size - sw) / 2;
    const circ = 2 * Math.PI * r;
    const clamped = Math.min(100, Math.max(0, pct));
    const dash = (clamped / 100) * circ;
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke="#f3f4f6" strokeWidth={sw} className="dark:stroke-[#222]" />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={color} strokeWidth={sw}
                strokeDasharray={`${dash.toFixed(2)} ${(circ - dash).toFixed(2)}`}
                strokeLinecap="round" />
        </svg>
    );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function barColor(pct: number) {
    if (pct >= 70) return 'bg-emerald-500';
    if (pct >= 40) return 'bg-amber-500';
    return 'bg-red-500';
}

function krBadge(pct: number) {
    if (pct >= 70) return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20';
    if (pct >= 40) return 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20';
    return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20';
}

// ── Props ──────────────────────────────────────────────────────────────────────

interface Props {
    objectives: TacticalObjective[];
    onObjectivesChange: (objs: TacticalObjective[]) => void;
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function OKRView({ objectives, onObjectivesChange }: Props) {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [showNewObj, setShowNewObj] = useState(false);
    const [newObjTitle, setNewObjTitle] = useState('');
    const [newObjDesc, setNewObjDesc] = useState('');
    const [newObjQuarter, setNewObjQuarter] = useState('Q2 2026');
    const [newObjColor, setNewObjColor] = useState(COLORS[0]);
    const [addingKRForObj, setAddingKRForObj] = useState<string | null>(null);
    const [newKRTitle, setNewKRTitle] = useState('');
    const [newKRTarget, setNewKRTarget] = useState('100');
    const [newKRUnit, setNewKRUnit] = useState('%');
    const [editKR, setEditKR] = useState<{ id: string; current: string } | null>(null);

    const toggleExpanded = (id: string) => setExpanded(p => ({ ...p, [id]: !p[id] }));

    async function handleAddObjective() {
        if (!newObjTitle.trim()) return;
        const obj = await createObjective({
            title: newObjTitle.trim(),
            description: newObjDesc.trim() || undefined,
            quarter: newObjQuarter,
            color: newObjColor,
        });
        onObjectivesChange([...objectives, { ...obj, key_results: [] }]);
        setNewObjTitle(''); setNewObjDesc(''); setShowNewObj(false);
    }

    async function handleDeleteObjective(id: string) {
        if (!confirm('Excluir este Objetivo e todos os seus KRs?')) return;
        await deleteObjective(id);
        onObjectivesChange(objectives.filter(o => o.id !== id));
    }

    async function handleAddKR(objectiveId: string) {
        if (!newKRTitle.trim()) return;
        const kr = await createKeyResult({
            objective_id: objectiveId,
            title: newKRTitle.trim(),
            target_value: parseFloat(newKRTarget) || 100,
            unit: newKRUnit,
        });
        onObjectivesChange(objectives.map(o =>
            o.id === objectiveId
                ? { ...o, key_results: [...(o.key_results || []), { ...kr, progress: 0 }] }
                : o
        ));
        setNewKRTitle(''); setNewKRTarget('100'); setNewKRUnit('%');
        setAddingKRForObj(null);
    }

    async function handleUpdateKRValue(kr: TacticalKeyResult, rawValue: string) {
        const current_value = parseFloat(rawValue);
        if (isNaN(current_value)) return;
        const updated = await updateKeyResult(kr.id, { current_value });
        const progress = kr.target_value > 0
            ? Math.min(100, Math.round((current_value / kr.target_value) * 100))
            : 0;
        onObjectivesChange(objectives.map(o => ({
            ...o,
            key_results: (o.key_results || []).map(k =>
                k.id === kr.id ? { ...updated, progress } : k
            ),
        })));
        setEditKR(null);
    }

    async function handleDeleteKR(objectiveId: string, krId: string) {
        await deleteKeyResult(krId);
        onObjectivesChange(objectives.map(o =>
            o.id === objectiveId
                ? { ...o, key_results: (o.key_results || []).filter(k => k.id !== krId) }
                : o
        ));
    }

    // ── Derived data ───────────────────────────────────────────────────────────

    const enriched = useMemo(() => objectives.map(obj => {
        const krs = obj.key_results || [];
        const progress = krs.length > 0
            ? Math.round(krs.reduce((a, kr) => a + (kr.progress ?? 0), 0) / krs.length)
            : 0;
        const pacing = computeQuarterPacing(obj.quarter);
        const status = getObjectiveStatus(progress, pacing?.pct ?? 0, pacing?.phase ?? 'active');
        const gap = pacing ? progress - pacing.pct : 0;
        return { ...obj, krs, progress, pacing, status, gap };
    }), [objectives]);

    const overallPct = useMemo(() => {
        const all = objectives.flatMap(o => o.key_results || []);
        return all.length ? Math.round(all.reduce((a, kr) => a + (kr.progress ?? 0), 0) / all.length) : 0;
    }, [objectives]);

    const statusCounts = useMemo(() => {
        const c: Record<ObjStatus, number> = {
            completed: 0, ahead: 0, on_track: 0, at_risk: 0, behind: 0, not_started: 0,
        };
        enriched.forEach(o => c[o.status]++);
        return c;
    }, [enriched]);

    // Most urgent objective (behind > at_risk > none)
    const focusObj = useMemo(() => {
        const behind = enriched.filter(o => o.status === 'behind');
        if (behind.length) return behind.sort((a, b) => a.gap - b.gap)[0];
        const risk = enriched.filter(o => o.status === 'at_risk');
        if (risk.length) return risk.sort((a, b) => a.gap - b.gap)[0];
        return null;
    }, [enriched]);

    // Global pacing for the quarter timeline bar (use Q2 2026 as reference)
    const globalPacing = useMemo(() => computeQuarterPacing('Q2 2026'), []);

    // ── Empty state ────────────────────────────────────────────────────────────

    if (objectives.length === 0 && !showNewObj) {
        return (
            <div className="h-full flex flex-col">
                <Header overallPct={0} onNew={() => setShowNewObj(true)} />
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#222222] flex items-center justify-center mb-4">
                        <Target size={28} className="text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="font-semibold text-gray-500 dark:text-gray-400">Nenhum objetivo definido.</p>
                    <p className="text-sm text-gray-400 mt-1">Defina OKRs para acompanhar o progresso estratégico.</p>
                </div>
                {showNewObj && <NewObjForm
                    title={newObjTitle} setTitle={setNewObjTitle}
                    desc={newObjDesc} setDesc={setNewObjDesc}
                    quarter={newObjQuarter} setQuarter={setNewObjQuarter}
                    color={newObjColor} setColor={setNewObjColor}
                    onSave={handleAddObjective}
                    onCancel={() => { setShowNewObj(false); setNewObjTitle(''); setNewObjDesc(''); }}
                />}
            </div>
        );
    }

    // ── Main render ────────────────────────────────────────────────────────────

    return (
        <div className="h-full overflow-y-auto custom-scrollbar pr-1 space-y-4">

            {/* Top row: header + button */}
            <Header overallPct={overallPct} onNew={() => setShowNewObj(true)} objCount={objectives.length} />

            {/* New objective form */}
            {showNewObj && <NewObjForm
                title={newObjTitle} setTitle={setNewObjTitle}
                desc={newObjDesc} setDesc={setNewObjDesc}
                quarter={newObjQuarter} setQuarter={setNewObjQuarter}
                color={newObjColor} setColor={setNewObjColor}
                onSave={handleAddObjective}
                onCancel={() => { setShowNewObj(false); setNewObjTitle(''); setNewObjDesc(''); }}
            />}

            {/* Quarter timeline */}
            {globalPacing && objectives.length > 0 && (
                <div className="bg-white dark:bg-[#161616] rounded-2xl border border-gray-200 dark:border-[#222222] p-4">
                    <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Q2 2026</span>
                            <span className="text-[10px] text-gray-400 bg-gray-50 dark:bg-[#1A1A1A] px-2 py-0.5 rounded-full border border-gray-100 dark:border-[#2a2a2a]">
                                Dia {globalPacing.daysElapsed} de {globalPacing.totalDays}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-gray-400">
                            <span className="flex items-center gap-1">
                                <span className="inline-block w-3 h-1.5 rounded-full bg-gray-300 dark:bg-[#333]" />
                                Tempo: {globalPacing.pct}%
                            </span>
                            <span className="flex items-center gap-1">
                                <span className={`inline-block w-3 h-1.5 rounded-full ${overallPct >= globalPacing.pct - 10 ? 'bg-emerald-500' : overallPct >= globalPacing.pct - 25 ? 'bg-amber-500' : 'bg-red-500'}`} />
                                OKRs: {overallPct}%
                            </span>
                        </div>
                    </div>
                    {/* Stacked bar: time (gray) + OKR progress (colored) */}
                    <div className="relative h-3 bg-gray-100 dark:bg-[#111] rounded-full overflow-hidden">
                        <div className="absolute left-0 top-0 h-full bg-gray-200 dark:bg-[#2a2a2a] rounded-full transition-all"
                            style={{ width: `${globalPacing.pct}%` }} />
                        <div className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${overallPct >= globalPacing.pct - 10 ? 'bg-emerald-500' : overallPct >= globalPacing.pct - 25 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${overallPct}%`, opacity: 0.85 }} />
                        {/* Expected marker */}
                        <div className="absolute top-0 h-full w-0.5 bg-gray-400 dark:bg-gray-500 opacity-60"
                            style={{ left: `${globalPacing.pct}%` }} />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1.5">
                        {overallPct >= globalPacing.pct
                            ? `✓ Progresso ${overallPct - globalPacing.pct}pp acima do ritmo esperado`
                            : `△ Progresso ${globalPacing.pct - overallPct}pp abaixo do ritmo esperado`}
                    </p>
                </div>
            )}

            {/* Status pills */}
            {objectives.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                    {(Object.entries(statusCounts) as [ObjStatus, number][])
                        .filter(([, cnt]) => cnt > 0)
                        .map(([status, cnt]) => {
                            const cfg = STATUS_CFG[status];
                            return (
                                <div key={status} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                                    {cfg.icon} {cnt} {cfg.label}
                                </div>
                            );
                        })}
                </div>
            )}

            {/* 2-column layout: objectives left, insights right */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 pb-4">

                {/* ── Objectives column ──────────────────────────────────── */}
                <div className="xl:col-span-2 space-y-4">
                    {enriched.map(obj => {
                        const isExpanded = expanded[obj.id] !== false;
                        const cfg = STATUS_CFG[obj.status];

                        return (
                            <div key={obj.id}
                                className="bg-white dark:bg-[#161616] rounded-2xl border border-gray-200 dark:border-[#222222] overflow-hidden shadow-sm"
                                style={{ borderLeftColor: obj.color, borderLeftWidth: '4px' }}
                            >
                                {/* Objective header */}
                                <div className="p-5">
                                    <div className="flex items-start gap-4">

                                        {/* Progress ring */}
                                        <div className="relative shrink-0">
                                            <ProgressRing pct={obj.progress} color={cfg.stroke} size={72} sw={5.5} />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-base font-black text-gray-800 dark:text-gray-200 leading-none">{obj.progress}%</span>
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                                                <h3 className="font-bold text-gray-900 dark:text-white leading-snug flex-1 min-w-0">
                                                    {obj.title}
                                                </h3>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="text-xs text-gray-400 bg-gray-50 dark:bg-[#111] px-2 py-0.5 rounded-md border border-gray-100 dark:border-[#2a2a2a] font-medium">
                                                        {obj.quarter}
                                                    </span>
                                                    <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                                                        {cfg.icon} {cfg.label}
                                                    </span>
                                                    <button onClick={() => handleDeleteObjective(obj.id)}
                                                        className="p-1 text-gray-300 hover:text-red-500 transition-colors">
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </div>
                                            {obj.description && (
                                                <p className="text-xs text-gray-500 mb-2 leading-relaxed">{obj.description}</p>
                                            )}

                                            {/* Pace analysis bar */}
                                            {obj.pacing && obj.pacing.phase === 'active' && (
                                                <div className="mt-2">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-[10px] text-gray-400">Ritmo esperado · {obj.pacing.pct}%</span>
                                                        <div className={`flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded ${
                                                            obj.gap >= 0
                                                                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                                                                : obj.gap >= -15
                                                                    ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10'
                                                                    : 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10'
                                                        }`}>
                                                            {obj.gap >= 0 ? <TrendingUp size={10} /> : obj.gap >= -15 ? <Minus size={10} /> : <TrendingDown size={10} />}
                                                            {obj.gap >= 0 ? '+' : ''}{obj.gap}pp
                                                        </div>
                                                    </div>
                                                    <div className="relative h-2 bg-gray-100 dark:bg-[#111] rounded-full overflow-hidden">
                                                        {/* Expected pace ghost */}
                                                        <div className="absolute top-0 left-0 h-full bg-gray-200 dark:bg-[#2a2a2a] rounded-full"
                                                            style={{ width: `${obj.pacing.pct}%` }} />
                                                        {/* Actual progress */}
                                                        <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ${
                                                            obj.status === 'behind' ? 'bg-red-500'
                                                                : obj.status === 'at_risk' ? 'bg-amber-500'
                                                                    : 'bg-emerald-500'
                                                        }`} style={{ width: `${obj.progress}%` }} />
                                                        {/* Expected marker line */}
                                                        <div className="absolute top-0 h-full w-px bg-gray-500 dark:bg-gray-400 opacity-50"
                                                            style={{ left: `${obj.pacing.pct}%` }} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* KR toggle strip */}
                                <button
                                    onClick={() => toggleExpanded(obj.id)}
                                    className="w-full px-5 py-2.5 flex items-center gap-2 bg-gray-50/80 dark:bg-[#0E0E0E]/80 border-t border-gray-100 dark:border-[#1E1E1E] hover:bg-gray-100 dark:hover:bg-[#1A1A1A] transition-colors"
                                >
                                    {isExpanded ? <ChevronDown size={13} className="text-gray-400" /> : <ChevronRight size={13} className="text-gray-400" />}
                                    <span className="text-xs text-gray-500 font-medium">
                                        {obj.krs.length} resultado{obj.krs.length !== 1 ? 's' : ''}-chave
                                    </span>
                                    {obj.krs.filter(k => (k.progress ?? 0) === 0).length > 0 && (
                                        <span className="ml-auto text-[10px] text-red-500 dark:text-red-400">
                                            {obj.krs.filter(k => (k.progress ?? 0) === 0).length} sem progresso
                                        </span>
                                    )}
                                </button>

                                {/* KRs */}
                                {isExpanded && (
                                    <div className="px-5 pb-4 pt-3.5 space-y-2 bg-gray-50/40 dark:bg-[#0E0E0E]/40">
                                        {obj.krs.length === 0 && addingKRForObj !== obj.id && (
                                            <p className="text-sm text-gray-400 py-3 text-center">Nenhum resultado-chave.</p>
                                        )}

                                        {obj.krs.map((kr, idx) => {
                                            const pct = kr.progress ?? 0;
                                            return (
                                                <div key={kr.id}
                                                    className="group bg-white dark:bg-[#161616] rounded-xl p-3.5 border border-gray-100 dark:border-[#222] hover:border-gray-200 dark:hover:border-[#2a2a2a] transition-colors">
                                                    <div className="flex items-start gap-2.5">
                                                        <span className="text-[11px] font-bold text-gray-300 dark:text-gray-600 mt-0.5 w-4 shrink-0 text-right">
                                                            {idx + 1}
                                                        </span>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                                <span className="text-sm text-gray-700 dark:text-gray-300 leading-snug">{kr.title}</span>
                                                                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                                                    {editKR?.id === kr.id ? (
                                                                        <div className="flex items-center gap-1.5">
                                                                            <input
                                                                                type="number" autoFocus
                                                                                value={editKR.current}
                                                                                onChange={e => setEditKR({ id: kr.id, current: e.target.value })}
                                                                                className="w-16 px-2 py-1 text-xs bg-gray-50 dark:bg-[#111] border border-[#B8860B] rounded-lg outline-none text-gray-900 dark:text-white"
                                                                            />
                                                                            <span className="text-xs text-gray-400">/{kr.target_value}{kr.unit}</span>
                                                                            <button onClick={() => handleUpdateKRValue(kr, editKR.current)} className="text-emerald-500 hover:text-emerald-400"><Check size={13} /></button>
                                                                            <button onClick={() => setEditKR(null)} className="text-gray-400"><X size={13} /></button>
                                                                        </div>
                                                                    ) : (
                                                                        <>
                                                                            <button
                                                                                onClick={() => setEditKR({ id: kr.id, current: String(kr.current_value ?? 0) })}
                                                                                className="text-xs text-gray-400 hover:text-[#B8860B] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                            >
                                                                                <Edit2 size={10} />
                                                                                {kr.current_value ?? 0}{kr.unit}/{kr.target_value}{kr.unit}
                                                                            </button>
                                                                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md border ${krBadge(pct)}`}>
                                                                                {pct}%
                                                                            </span>
                                                                            <button
                                                                                onClick={() => handleDeleteKR(obj.id, kr.id)}
                                                                                className="p-0.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                            ><Trash2 size={11} /></button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="relative h-1.5 bg-gray-100 dark:bg-[#1A1A1A] rounded-full overflow-hidden">
                                                                <div className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${barColor(pct)}`}
                                                                    style={{ width: `${pct}%` }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Add KR */}
                                        {addingKRForObj === obj.id ? (
                                            <div className="flex gap-2 flex-wrap pt-1">
                                                <input
                                                    autoFocus value={newKRTitle}
                                                    onChange={e => setNewKRTitle(e.target.value)}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') handleAddKR(obj.id);
                                                        if (e.key === 'Escape') { setAddingKRForObj(null); setNewKRTitle(''); }
                                                    }}
                                                    placeholder="Ex: Atingir 50 leads qualificados/mês"
                                                    className="flex-1 min-w-[200px] px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#B8860B] text-gray-900 dark:text-white"
                                                />
                                                <input type="number" value={newKRTarget} onChange={e => setNewKRTarget(e.target.value)} placeholder="Meta"
                                                    className="w-20 px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#B8860B] text-gray-900 dark:text-white" />
                                                <input value={newKRUnit} onChange={e => setNewKRUnit(e.target.value)} placeholder="Und."
                                                    className="w-14 px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#B8860B] text-gray-900 dark:text-white" />
                                                <button onClick={() => handleAddKR(obj.id)} disabled={!newKRTitle.trim()}
                                                    className="px-3 py-2 bg-[#B8860B] text-black rounded-lg text-sm font-bold disabled:opacity-50">
                                                    <Check size={14} />
                                                </button>
                                                <button onClick={() => { setAddingKRForObj(null); setNewKRTitle(''); }}
                                                    className="px-3 py-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg text-sm">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => { setAddingKRForObj(obj.id); setNewKRTitle(''); }}
                                                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-gray-200 dark:border-[#272727] text-xs text-gray-400 hover:text-[#B8860B] hover:border-[#B8860B]/40 transition-all mt-0.5"
                                            >
                                                <Plus size={13} /> Adicionar Resultado-Chave
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* ── Strategic Insights Sidebar ─────────────────────────── */}
                <div className="space-y-4">

                    {/* Overall health ring */}
                    <div className="bg-white dark:bg-[#161616] rounded-2xl border border-gray-200 dark:border-[#222222] p-5">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">
                            Saúde dos OKRs
                        </p>
                        <div className="flex flex-col items-center mb-4">
                            <div className="relative mb-2">
                                <ProgressRing
                                    pct={overallPct}
                                    color={overallPct >= 70 ? '#10B981' : overallPct >= 40 ? '#F59E0B' : '#EF4444'}
                                    size={88} sw={7}
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-xl font-black text-gray-900 dark:text-white leading-none">{overallPct}%</span>
                                    <span className="text-[9px] text-gray-400 uppercase tracking-wide mt-0.5">geral</span>
                                </div>
                            </div>
                        </div>

                        {/* Per-objective mini bars */}
                        <div className="space-y-2.5">
                            {enriched.map(obj => (
                                <div key={obj.id} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: obj.color }} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mb-1">{obj.title}</p>
                                        <div className="relative h-1.5 bg-gray-100 dark:bg-[#1A1A1A] rounded-full overflow-hidden">
                                            <div className={`absolute left-0 top-0 h-full rounded-full transition-all ${barColor(obj.progress)}`}
                                                style={{ width: `${obj.progress}%` }} />
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-500 w-7 text-right shrink-0">{obj.progress}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Focus now */}
                    {focusObj && (
                        <div className={`rounded-2xl border p-4 ${focusObj.status === 'behind' ? 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20' : 'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <Zap size={14} className={focusObj.status === 'behind' ? 'text-red-500' : 'text-amber-500'} />
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${focusObj.status === 'behind' ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}`}>
                                    Foco Imediato
                                </span>
                            </div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-snug mb-1.5">
                                {focusObj.title}
                            </p>
                            <p className={`text-xs font-medium ${focusObj.status === 'behind' ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}`}>
                                {Math.abs(focusObj.gap)}pp abaixo do ritmo esperado
                            </p>
                            {focusObj.krs.filter(k => (k.progress ?? 0) < 25).length > 0 && (
                                <div className="mt-3 pt-3 border-t border-current opacity-20 pointer-events-none" />
                            )}
                            {focusObj.krs.filter(k => (k.progress ?? 0) < 25).length > 0 && (
                                <div className="-mt-px">
                                    <p className={`text-[10px] font-semibold mb-1.5 ${focusObj.status === 'behind' ? 'text-red-600 dark:text-red-500' : 'text-amber-600 dark:text-amber-500'}`}>
                                        KRs críticos:
                                    </p>
                                    {focusObj.krs.filter(k => (k.progress ?? 0) < 25).slice(0, 3).map(kr => (
                                        <div key={kr.id} className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 mb-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                                            <span className="truncate">{kr.title}</span>
                                            <span className="shrink-0 text-gray-400">{kr.progress ?? 0}%</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Status distribution */}
                    <div className="bg-white dark:bg-[#161616] rounded-2xl border border-gray-200 dark:border-[#222222] p-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                            Distribuição de Status
                        </p>
                        <div className="space-y-2.5">
                            {(Object.entries(statusCounts) as [ObjStatus, number][])
                                .filter(([, cnt]) => cnt > 0)
                                .map(([status, cnt]) => {
                                    const cfg = STATUS_CFG[status];
                                    const total = objectives.length;
                                    const pct = Math.round((cnt / total) * 100);
                                    return (
                                        <div key={status}>
                                            <div className="flex items-center justify-between mb-1">
                                                <div className={`flex items-center gap-1.5 text-xs font-medium ${cfg.text}`}>
                                                    {cfg.iconLg} {cfg.label}
                                                </div>
                                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{cnt}/{total}</span>
                                            </div>
                                            <div className="relative h-1.5 bg-gray-100 dark:bg-[#1A1A1A] rounded-full overflow-hidden">
                                                <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${pct}%`, backgroundColor: cfg.stroke }} />
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>

                    {/* All-green celebration */}
                    {objectives.length > 0 && enriched.every(o => o.status === 'on_track' || o.status === 'ahead' || o.status === 'completed') && (
                        <div className="bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-4 text-center">
                            <p className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">🎯 Todos no ritmo!</p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">Continue o excelente trabalho.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Header({ overallPct, onNew, objCount }: { overallPct: number; onNew: () => void; objCount?: number }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#B8860B]/10 border border-[#B8860B]/25 flex items-center justify-center shrink-0">
                    <Target size={17} className="text-[#B8860B]" />
                </div>
                <div>
                    <h2 className="font-bold text-gray-900 dark:text-white text-base">Objetivos & Resultados-Chave</h2>
                    <p className="text-xs text-gray-500">
                        {objCount !== undefined ? `${objCount} objetivo${objCount !== 1 ? 's' : ''} · ` : ''}
                        progresso geral{' '}
                        <span className={`font-bold ${overallPct >= 70 ? 'text-emerald-600 dark:text-emerald-400' : overallPct >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                            {overallPct}%
                        </span>
                    </p>
                </div>
            </div>
            <button
                onClick={onNew}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-black rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-[#B8860B]/25 transition-all hover:-translate-y-0.5 shrink-0"
            >
                <Plus size={15} /> Novo Objetivo
            </button>
        </div>
    );
}

interface NewObjFormProps {
    title: string; setTitle: (v: string) => void;
    desc: string; setDesc: (v: string) => void;
    quarter: string; setQuarter: (v: string) => void;
    color: string; setColor: (v: string) => void;
    onSave: () => void; onCancel: () => void;
}

function NewObjForm({ title, setTitle, desc, setDesc, quarter, setQuarter, color, setColor, onSave, onCancel }: NewObjFormProps) {
    return (
        <div className="bg-white dark:bg-[#161616] rounded-2xl p-5 border border-[#B8860B]/30 shadow-lg space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Plus size={15} className="text-[#B8860B]" /> Novo Objetivo
            </h3>
            <input
                autoFocus value={title} onChange={e => setTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') onSave(); if (e.key === 'Escape') onCancel(); }}
                placeholder="Ex: Dominar o mercado de genética Nelore PO no Triângulo Mineiro"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#2a2a2a] rounded-xl outline-none focus:ring-2 focus:ring-[#B8860B] text-sm text-gray-900 dark:text-white"
            />
            <textarea
                value={desc} onChange={e => setDesc(e.target.value)}
                placeholder="Descrição (opcional)" rows={2}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#2a2a2a] rounded-xl outline-none focus:ring-2 focus:ring-[#B8860B] text-sm text-gray-900 dark:text-white resize-none"
            />
            <div className="flex gap-4 flex-wrap items-center">
                <select value={quarter} onChange={e => setQuarter(e.target.value)}
                    className="px-3 py-2 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#2a2a2a] rounded-lg text-sm outline-none text-gray-900 dark:text-white">
                    {QUARTERS.map(q => <option key={q}>{q}</option>)}
                </select>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Cor:</span>
                    {COLORS.map(c => (
                        <button key={c} onClick={() => setColor(c)}
                            className={`w-5 h-5 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : 'opacity-70 hover:opacity-100'}`}
                            style={{ backgroundColor: c }} />
                    ))}
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={onSave} disabled={!title.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-black rounded-lg font-bold text-sm disabled:opacity-50">
                    Criar Objetivo
                </button>
                <button onClick={onCancel}
                    className="px-4 py-2 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg text-sm transition-colors">
                    Cancelar
                </button>
            </div>
        </div>
    );
}
