'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Info, FileText, Sparkles, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import type { GeneticProduct, AvaliacaoGenetica } from './GeneticAnalysisCard';

const BRAND = {
    BRONZE: '#A0792E',
    BRONZE_DEEP: '#6B4F1E',
    BRONZE_PALE: '#D4A85C',
    TECH_GREEN: '#7FD4A0',
    TECH_BLUE: '#1E3A5F',
    LOSS: '#A04545',
} as const;

const AXES = ['Crescimento', 'Conformidade', 'Fertilidade', 'Precocidade', 'Carcaça', 'Leite'] as const;
type Axis = typeof AXES[number];
type Method = 'dep' | 'deca';

// ── Aggregation helpers ────────────────────────────────────────────────────────

interface Trait {
    nome: string;
    dep: number | null;
    ac: number | null;
    deca: string | null;
}

function meanOf(traits: Trait[] | undefined, predicate?: (t: Trait) => boolean): number {
    if (!traits || traits.length === 0) return 0;
    const filtered = predicate ? traits.filter(predicate) : traits;
    const valid = filtered.map(t => t.dep).filter((d): d is number => typeof d === 'number');
    if (valid.length === 0) return 0;
    return valid.reduce((s, v) => s + v, 0) / valid.length;
}

function meanDeca(traits: Trait[] | undefined, predicate?: (t: Trait) => boolean): number {
    if (!traits || traits.length === 0) return 0;
    const filtered = predicate ? traits.filter(predicate) : traits;
    const valid = filtered
        .map(t => t.deca ? Number(String(t.deca).replace(/\D/g, '')) : NaN)
        .filter(n => Number.isFinite(n) && n > 0);
    if (valid.length === 0) return 0;
    const meanRaw = valid.reduce((s, v) => s + v, 0) / valid.length;
    return Math.max(0, 11 - meanRaw);
}

export function valueForAxis(g: AvaliacaoGenetica | null | undefined, axis: Axis, method: Method): number {
    if (!g) return 0;
    const c = g.composem_iabcz ?? {};
    const fn = method === 'deca' ? meanDeca : meanOf;
    switch (axis) {
        case 'Crescimento':
            return fn(c.crescimento as Trait[] | undefined);
        case 'Conformidade':
            return fn(c.morfologicas as Trait[] | undefined, t => !/precoc/i.test(t.nome));
        case 'Fertilidade':
            return fn(c.reprodutivas as Trait[] | undefined);
        case 'Precocidade': {
            const v = fn(c.morfologicas as Trait[] | undefined, t => /precoc/i.test(t.nome));
            return v !== 0 ? v : fn(c.reprodutivas as Trait[] | undefined, t => /precoc/i.test(t.nome));
        }
        case 'Carcaça':
            return fn([...(c.carcaca as Trait[] ?? []), ...(c.acabamento as Trait[] ?? [])]);
        case 'Leite': {
            const leite = fn(c.maternas as Trait[] | undefined, t => /leite/i.test(t.nome));
            return leite !== 0 ? leite : fn(c.maternas as Trait[] | undefined);
        }
    }
}

function hasGeneticData(p: GeneticProduct): boolean {
    const c = p.avaliacao_genetica_json?.composem_iabcz;
    if (!c) return false;
    return Object.values(c).some(arr => Array.isArray(arr) && arr.length > 0);
}

function aggregateAcrossProducts(products: GeneticProduct[], method: Method): Record<Axis, number> {
    const result = {} as Record<Axis, number>;
    const valid = products.filter(hasGeneticData);
    for (const axis of AXES) {
        if (valid.length === 0) {
            result[axis] = 0;
            continue;
        }
        const values = valid.map(p => valueForAxis(p.avaliacao_genetica_json, axis, method)).filter(v => v !== 0);
        result[axis] = values.length > 0
            ? values.reduce((s, v) => s + v, 0) / values.length
            : 0;
    }
    return result;
}

// ── Component ──────────────────────────────────────────────────────────────────

interface GeneticSidePanelProps {
    selectedProducts: GeneticProduct[];
    catalogProducts: GeneticProduct[];
}

export function GeneticSidePanel({ selectedProducts, catalogProducts }: GeneticSidePanelProps) {
    const [method, setMethod] = useState<Method>('dep');

    const data = useMemo(() => {
        const selected = selectedProducts.filter(hasGeneticData);
        const isMulti = selected.length > 0;

        // If selection exists: catalog = all products NOT in selection.
        // If no selection: show all catalog as "Selecionados" — falls back to a generic profile of the lot.
        const catalogPool = isMulti
            ? catalogProducts.filter(p => !selectedProducts.some(sp => sp.id === p.id) && hasGeneticData(p))
            : catalogProducts.filter(hasGeneticData);

        const animal = isMulti
            ? aggregateAcrossProducts(selected, method)
            : aggregateAcrossProducts(catalogProducts, method);
        const catalog = aggregateAcrossProducts(catalogPool, method);

        const allValues = AXES.flatMap(a => [animal[a], catalog[a]]).map(Math.abs);
        const maxValue = Math.max(...allValues, 1);

        return {
            animal,
            catalog,
            maxValue,
            isMulti,
            selectedCount: selected.length,
            catalogCount: catalogPool.length,
        };
    }, [selectedProducts, catalogProducts, method]);

    const hasAnyData = catalogProducts.some(hasGeneticData);

    if (!hasAnyData) {
        return <EmptyPanel />;
    }

    const linkHref = data.isMulti && selectedProducts.length === 1
        ? `/products/${selectedProducts[0].id}`
        : '/genealogia';

    return (
        <div className="rounded-2xl border border-gray-200 dark:border-[rgba(212,168,92,0.20)] bg-white dark:bg-[#0A0A0A] overflow-hidden flex flex-col">

            {/* Brand hairline */}
            <div className="relative">
                <span aria-hidden className="absolute top-0 left-0 block" style={{ width: 48, height: 1, background: BRAND.BRONZE }} />
            </div>

            <div className="p-4 space-y-3.5">

                {/* Header */}
                <div>
                    <p
                        className="text-[10px] font-bold uppercase mb-1.5"
                        style={{
                            fontFamily: 'var(--font-mono), ui-monospace, monospace',
                            letterSpacing: '0.22em',
                            color: BRAND.BRONZE_PALE,
                        }}
                    >
                        § Análise Genética
                    </p>
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">Comparativo genético</h3>
                        <button
                            type="button"
                            title={`Comparativo entre ${data.isMulti ? 'os animais selecionados' : 'a média do catálogo'} e o restante do catálogo.`}
                            className="text-gray-400 hover:text-[#A0792E] transition-colors"
                            aria-label="Sobre o comparativo"
                        >
                            <Info size={12} />
                        </button>
                    </div>
                </div>

                {/* Status badge */}
                <div
                    className="rounded-sm px-2.5 py-1.5 text-[10px] font-semibold"
                    style={{
                        backgroundColor: data.isMulti ? `${BRAND.TECH_GREEN}1A` : `${BRAND.BRONZE}10`,
                        color: data.isMulti ? BRAND.TECH_GREEN : BRAND.BRONZE,
                        borderRadius: 3,
                    }}
                >
                    {data.isMulti ? (
                        <>
                            <span className="font-bold">{data.selectedCount}</span> selecionado{data.selectedCount > 1 ? 's' : ''} · comparado com {data.catalogCount} do catálogo
                        </>
                    ) : (
                        <>Selecione animais para comparar · usando média geral ({data.catalogCount} animais)</>
                    )}
                </div>

                {/* Method selector */}
                <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 block mb-1">Método</label>
                    <div className="relative">
                        <select
                            value={method}
                            onChange={e => setMethod(e.target.value as Method)}
                            className="w-full appearance-none px-2.5 py-1.5 pr-8 text-[11px] font-medium border border-gray-200 dark:border-[rgba(212,168,92,0.20)] bg-gray-50 dark:bg-[#111] text-gray-900 dark:text-white hover:border-[#A0792E]/50 focus:outline-none focus:border-[#A0792E] transition-colors"
                            style={{ borderRadius: 3 }}
                        >
                            <option value="dep">DEP (Diferença Esperada na Progênie)</option>
                            <option value="deca">DECA (Classificação invertida)</option>
                        </select>
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A0792E] pointer-events-none text-[10px]">▾</span>
                    </div>
                </div>

                {/* Radar Chart (compact) */}
                <RadarChartCompact animal={data.animal} catalog={data.catalog} maxValue={data.maxValue} />

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 text-[9px]">
                    <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: BRAND.TECH_GREEN }} />
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Selecionados</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-0.5 border-t-2 border-dashed" style={{ borderColor: BRAND.BRONZE_PALE }} />
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Catálogo</span>
                    </span>
                </div>

                {/* Comparison Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-[11px]">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-[#1E1E1E]">
                                {['Característica', 'Sel.', 'Cat.', 'Dif.'].map((h, i) => (
                                    <th
                                        key={h}
                                        className={`py-1.5 text-[8px] font-bold uppercase tracking-widest text-gray-400 ${i === 0 ? 'text-left' : 'text-right'}`}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-[#1A1A1A]">
                            {AXES.map(axis => {
                                const a = data.animal[axis];
                                const c = data.catalog[axis];
                                const diff = a - c;
                                const trend = Math.abs(diff) < 0.05 ? 'flat' : diff > 0 ? 'up' : 'down';
                                const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus;
                                const trendColor = trend === 'up' ? BRAND.TECH_GREEN : trend === 'down' ? BRAND.LOSS : '#9CA3AF';
                                return (
                                    <tr key={axis}>
                                        <td className="py-1.5 font-semibold text-gray-700 dark:text-gray-300 truncate">{axis}</td>
                                        <td
                                            className="py-1.5 text-right tabular-nums font-bold text-gray-900 dark:text-white"
                                            style={{ fontFamily: 'var(--font-mono), ui-monospace, monospace' }}
                                        >
                                            {a.toFixed(1)}
                                        </td>
                                        <td
                                            className="py-1.5 text-right tabular-nums text-gray-500"
                                            style={{ fontFamily: 'var(--font-mono), ui-monospace, monospace' }}
                                        >
                                            {c.toFixed(1)}
                                        </td>
                                        <td
                                            className="py-1.5 text-right tabular-nums font-bold"
                                            style={{
                                                fontFamily: 'var(--font-mono), ui-monospace, monospace',
                                                color: trendColor,
                                            }}
                                        >
                                            <span className="inline-flex items-center gap-0.5 justify-end">
                                                <TrendIcon size={9} />
                                                {diff >= 0 ? '+' : ''}{diff.toFixed(1)}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <p className="text-[9px] text-gray-400 dark:text-gray-500 leading-relaxed">
                    * Valores agregados das características que <strong>compõem o iABCZ</strong> · {method === 'dep' ? 'DEP padronizado (DP-i)' : 'DECA invertida (10 = topo)'}
                </p>

                {/* CTA */}
                <Link
                    href={linkHref}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-all hover:shadow-md group"
                    style={{
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${BRAND.BRONZE}, ${BRAND.BRONZE_PALE})`,
                        color: '#0A0A0A',
                    }}
                >
                    <FileText size={12} />
                    Ver relatório completo
                </Link>
            </div>
        </div>
    );
}

// ── Empty State ────────────────────────────────────────────────────────────────

function EmptyPanel() {
    return (
        <div className="rounded-2xl border border-gray-200 dark:border-[rgba(212,168,92,0.20)] bg-white dark:bg-[#0A0A0A] p-5 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center" style={{ backgroundColor: `${BRAND.BRONZE}14`, color: BRAND.BRONZE }}>
                <Sparkles size={18} />
            </div>
            <div>
                <p
                    className="text-[10px] font-bold uppercase mb-1"
                    style={{
                        fontFamily: 'var(--font-mono), ui-monospace, monospace',
                        letterSpacing: '0.22em',
                        color: BRAND.BRONZE_PALE,
                    }}
                >
                    § Análise Genética
                </p>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Sem avaliações no catálogo</h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                    Cadastre PDFs de avaliação genética e processe pela página de Genealogia para liberar o comparativo.
                </p>
            </div>
            <Link
                href="/genealogia"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all"
                style={{
                    borderRadius: 3,
                    backgroundColor: `${BRAND.BRONZE}1A`,
                    color: BRAND.BRONZE,
                }}
            >
                <FileText size={11} />
                Ir para extração
            </Link>
        </div>
    );
}

// ── Compact Radar Chart ────────────────────────────────────────────────────────

function RadarChartCompact({
    animal,
    catalog,
    maxValue,
}: {
    animal: Record<Axis, number>;
    catalog: Record<Axis, number>;
    maxValue: number;
}) {
    const VB = 280;
    const cx = VB / 2;
    const cy = VB / 2 + 4;
    const R = 80;

    const angleFor = (i: number) => (i * 60 - 90) * (Math.PI / 180);

    const polygonPoints = (values: Record<Axis, number>) =>
        AXES.map((axis, i) => {
            const angle = angleFor(i);
            const v = Math.max(0, values[axis] / maxValue);
            const x = cx + R * v * Math.cos(angle);
            const y = cy + R * v * Math.sin(angle);
            return `${x},${y}`;
        }).join(' ');

    return (
        <svg viewBox={`0 0 ${VB} ${VB}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet" style={{ maxHeight: 280 }}>
            <defs>
                <radialGradient id="sp-radar-bronze" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={BRAND.BRONZE_PALE} stopOpacity="0.05" />
                    <stop offset="100%" stopColor={BRAND.BRONZE} stopOpacity="0" />
                </radialGradient>
                <linearGradient id="sp-animal-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BRAND.TECH_GREEN} stopOpacity="0.45" />
                    <stop offset="100%" stopColor={BRAND.TECH_GREEN} stopOpacity="0.18" />
                </linearGradient>
            </defs>

            <circle cx={cx} cy={cy} r={R} fill="url(#sp-radar-bronze)" />

            {[0.25, 0.5, 0.75, 1].map((scale, i) => (
                <polygon
                    key={i}
                    points={AXES.map((_, axIdx) => {
                        const angle = angleFor(axIdx);
                        return `${cx + R * scale * Math.cos(angle)},${cy + R * scale * Math.sin(angle)}`;
                    }).join(' ')}
                    fill="none"
                    stroke={i === 3 ? 'rgba(212,168,92,0.18)' : 'rgba(212,168,92,0.08)'}
                    strokeWidth={i === 3 ? 1 : 0.5}
                    strokeDasharray={i < 3 ? '2 3' : ''}
                />
            ))}

            {AXES.map((_, i) => {
                const angle = angleFor(i);
                return (
                    <line
                        key={i}
                        x1={cx} y1={cy}
                        x2={cx + R * Math.cos(angle)} y2={cy + R * Math.sin(angle)}
                        stroke="rgba(212,168,92,0.10)" strokeWidth="0.5"
                    />
                );
            })}

            {/* Catalog */}
            <polygon
                points={polygonPoints(catalog)}
                fill="none"
                stroke={BRAND.BRONZE_PALE}
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity="0.85"
            />
            {AXES.map((axis, i) => {
                const angle = angleFor(i);
                const v = Math.max(0, catalog[axis] / maxValue);
                const x = cx + R * v * Math.cos(angle);
                const y = cy + R * v * Math.sin(angle);
                return <circle key={`c-${i}`} cx={x} cy={y} r="2.2" fill={BRAND.BRONZE_PALE} opacity="0.85" />;
            })}

            {/* Animal */}
            <polygon
                points={polygonPoints(animal)}
                fill="url(#sp-animal-fill)"
                stroke={BRAND.TECH_GREEN}
                strokeWidth="2"
                strokeLinejoin="round"
            />
            {AXES.map((axis, i) => {
                const angle = angleFor(i);
                const v = Math.max(0, animal[axis] / maxValue);
                const x = cx + R * v * Math.cos(angle);
                const y = cy + R * v * Math.sin(angle);
                return (
                    <g key={`a-${i}`}>
                        <circle cx={x} cy={y} r="4.5" fill={BRAND.TECH_GREEN} opacity="0.18" />
                        <circle cx={x} cy={y} r="2.8" fill={BRAND.TECH_GREEN} stroke="#0A0A0A" strokeWidth="0.8" />
                    </g>
                );
            })}

            {/* Axis labels */}
            {AXES.map((axis, i) => {
                const angle = angleFor(i);
                const labelR = R + 18;
                const x = cx + labelR * Math.cos(angle);
                const y = cy + labelR * Math.sin(angle);
                return (
                    <text
                        key={axis}
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="10"
                        fontWeight="700"
                        fill="currentColor"
                        className="text-gray-700 dark:text-gray-300"
                        style={{ letterSpacing: '-0.005em' }}
                    >
                        {axis}
                    </text>
                );
            })}
        </svg>
    );
}
