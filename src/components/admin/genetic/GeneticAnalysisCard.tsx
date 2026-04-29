'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Info, FileText, Sparkles, ArrowUp, ArrowDown, Minus } from 'lucide-react';

// ── Brandbook V1.0 ──────────────────────────────────────────────────────────────
const BRAND = {
    BRONZE: '#A0792E',
    BRONZE_DEEP: '#6B4F1E',
    BRONZE_PALE: '#D4A85C',
    TECH_GREEN: '#7FD4A0',
    TECH_BLUE: '#1E3A5F',
    INK: '#0A0A0A',
} as const;

// ── Types (match avaliacao_genetica_json schema) ───────────────────────────────

interface GeneticTrait {
    nome: string;
    dep: number | null;
    ac: number | null;
    deca: string | null;
}

interface ComposemBlock {
    crescimento?: GeneticTrait[];
    maternas?: GeneticTrait[];
    reprodutivas?: GeneticTrait[];
    acabamento?: GeneticTrait[];
    carcaca?: GeneticTrait[];
    morfologicas?: GeneticTrait[];
}

export interface AvaliacaoGenetica {
    iabcz?: number | null;
    deca?: string | null;
    percentil?: number | null;
    f?: number | null;
    composem_iabcz?: ComposemBlock | null;
    nao_composem_iabcz?: ComposemBlock | null;
}

export interface GeneticProduct {
    id: string | number;
    name?: string | null;
    registro?: string | null;
    avaliacao_genetica_json?: AvaliacaoGenetica | null;
    iabcz?: string | number | null;
    mgte?: string | number | null;
    iqg?: string | number | null;
    nascimento?: string | null;
    pai?: string | null;
    mae?: string | null;
    details?: Record<string, unknown> | null;
}

const AXES = ['Crescimento', 'Conformidade', 'Fertilidade', 'Precocidade', 'Carcaça', 'Leite'] as const;
type Axis = typeof AXES[number];

type Method = 'dep' | 'deca';

// ── Aggregation helpers ────────────────────────────────────────────────────────

function meanOf(traits: GeneticTrait[] | undefined, predicate?: (t: GeneticTrait) => boolean): number {
    if (!traits || traits.length === 0) return 0;
    const filtered = predicate ? traits.filter(predicate) : traits;
    if (filtered.length === 0) return 0;
    const valid = filtered.map(t => t.dep).filter((d): d is number => typeof d === 'number');
    if (valid.length === 0) return 0;
    return valid.reduce((s, v) => s + v, 0) / valid.length;
}

function meanDeca(traits: GeneticTrait[] | undefined, predicate?: (t: GeneticTrait) => boolean): number {
    if (!traits || traits.length === 0) return 0;
    const filtered = predicate ? traits.filter(predicate) : traits;
    const valid = filtered
        .map(t => t.deca ? Number(String(t.deca).replace(/\D/g, '')) : NaN)
        .filter(n => Number.isFinite(n) && n > 0);
    if (valid.length === 0) return 0;
    // DECA is 1=best, 10=worst — invert so larger is better (0..10 scale)
    const meanRaw = valid.reduce((s, v) => s + v, 0) / valid.length;
    return Math.max(0, 11 - meanRaw);
}

function valueForAxis(
    g: AvaliacaoGenetica | null | undefined,
    axis: Axis,
    method: Method,
): number {
    if (!g) return 0;
    const c = g.composem_iabcz ?? {};
    const fn = method === 'deca' ? meanDeca : meanOf;
    switch (axis) {
        case 'Crescimento':
            return fn(c.crescimento);
        case 'Conformidade':
            return fn(c.morfologicas, t => !/precoc/i.test(t.nome));
        case 'Fertilidade':
            return fn(c.reprodutivas);
        case 'Precocidade': {
            const fromMorf = fn(c.morfologicas, t => /precoc/i.test(t.nome));
            if (fromMorf !== 0) return fromMorf;
            return fn(c.reprodutivas, t => /precoc/i.test(t.nome));
        }
        case 'Carcaça':
            return ([...(c.carcaca ?? []), ...(c.acabamento ?? [])].length > 0)
                ? fn([...(c.carcaca ?? []), ...(c.acabamento ?? [])])
                : 0;
        case 'Leite': {
            const leite = fn(c.maternas, t => /leite/i.test(t.nome));
            return leite !== 0 ? leite : fn(c.maternas);
        }
    }
}

function hasGeneticData(g: AvaliacaoGenetica | null | undefined): boolean {
    if (!g || !g.composem_iabcz) return false;
    const c = g.composem_iabcz;
    return Object.values(c).some(arr => Array.isArray(arr) && arr.length > 0);
}

// ── Component ──────────────────────────────────────────────────────────────────

interface GeneticAnalysisCardProps {
    product: GeneticProduct;
    catalogProducts?: GeneticProduct[];
}

export function GeneticAnalysisCard({ product, catalogProducts = [] }: GeneticAnalysisCardProps) {
    const [method, setMethod] = useState<Method>('dep');

    const data = useMemo(() => {
        const animal: Record<Axis, number> = {} as Record<Axis, number>;
        const catalog: Record<Axis, number> = {} as Record<Axis, number>;

        const otherProducts = catalogProducts.filter(p => p.id !== product.id && hasGeneticData(p.avaliacao_genetica_json));

        for (const axis of AXES) {
            animal[axis] = valueForAxis(product.avaliacao_genetica_json, axis, method);
            const otherValues = otherProducts.map(p => valueForAxis(p.avaliacao_genetica_json, axis, method)).filter(v => v !== 0);
            catalog[axis] = otherValues.length > 0
                ? otherValues.reduce((s, v) => s + v, 0) / otherValues.length
                : 0;
        }

        const allValues = AXES.flatMap(a => [animal[a], catalog[a]]).map(Math.abs);
        const maxValue = Math.max(...allValues, 1);

        return { animal, catalog, maxValue, otherCount: otherProducts.length };
    }, [product, catalogProducts, method]);

    const has = hasGeneticData(product.avaliacao_genetica_json);

    if (!has) {
        return (
            <div className="rounded-2xl border border-gray-200 dark:border-[rgba(212,168,92,0.20)] bg-white dark:bg-[#0A0A0A] p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center" style={{ backgroundColor: `${BRAND.BRONZE}14`, color: BRAND.BRONZE }}>
                    <Sparkles size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Análise genética não disponível</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
                        Cadastre um PDF de avaliação genética e processe pela página de Genealogia para liberar o comparativo.
                    </p>
                </div>
                <Link
                    href="/genealogia"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                    style={{
                        borderRadius: 3,
                        backgroundColor: `${BRAND.BRONZE}1A`,
                        color: BRAND.BRONZE,
                    }}
                >
                    <FileText size={12} />
                    Ir para extração de PDF
                </Link>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-200 dark:border-[rgba(212,168,92,0.20)] bg-white dark:bg-[#0A0A0A] overflow-hidden">

            {/* Brand hairline */}
            <div className="relative">
                <span aria-hidden className="absolute top-0 left-0 block" style={{ width: 48, height: 1, background: BRAND.BRONZE }} />
            </div>

            <div className="p-5 space-y-4">

                {/* Header */}
                <div>
                    <p
                        className="text-[10px] font-bold uppercase mb-2"
                        style={{
                            fontFamily: 'var(--font-mono), ui-monospace, monospace',
                            letterSpacing: '0.22em',
                            color: BRAND.BRONZE_PALE,
                        }}
                    >
                        § Análise Genética
                    </p>
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">Comparativo genético</h3>
                        <button
                            type="button"
                            title="Comparativo entre o animal e a média dos demais animais com avaliação no catálogo."
                            className="text-gray-400 hover:text-[#A0792E] transition-colors"
                            aria-label="Sobre o comparativo"
                        >
                            <Info size={13} />
                        </button>
                    </div>
                </div>

                {/* Method selector */}
                <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 block mb-1.5">Método</label>
                    <div className="relative">
                        <select
                            value={method}
                            onChange={e => setMethod(e.target.value as Method)}
                            className="w-full appearance-none px-3 py-2 pr-9 text-xs font-medium rounded-sm border border-gray-200 dark:border-[rgba(212,168,92,0.20)] bg-gray-50 dark:bg-[#111] text-gray-900 dark:text-white hover:border-[#A0792E]/50 focus:outline-none focus:border-[#A0792E] transition-colors"
                            style={{ borderRadius: 3 }}
                        >
                            <option value="dep">DEP (Diferença Esperada na Progênie)</option>
                            <option value="deca">DECA (Classificação invertida)</option>
                        </select>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0792E] pointer-events-none text-xs">▾</span>
                    </div>
                </div>

                {/* Radar Chart */}
                <RadarChart animal={data.animal} catalog={data.catalog} maxValue={data.maxValue} />

                {/* Legend */}
                <div className="flex items-center justify-center gap-5 text-[10px]">
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: BRAND.TECH_GREEN }} />
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Selecionado</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 border-t-2 border-dashed" style={{ borderColor: BRAND.BRONZE_PALE }} />
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Média do catálogo</span>
                    </span>
                </div>

                {/* Comparison Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-[#1E1E1E]">
                                {['Característica', 'Selecionado', 'Catálogo', 'Diferença'].map((h, i) => (
                                    <th
                                        key={h}
                                        className={`py-2 text-[9px] font-bold uppercase tracking-widest text-gray-400 ${i === 0 ? 'text-left' : 'text-right'}`}
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
                                const trendColor = trend === 'up' ? BRAND.TECH_GREEN : trend === 'down' ? '#A04545' : '#9CA3AF';
                                return (
                                    <tr key={axis}>
                                        <td className="py-2.5 font-semibold text-gray-700 dark:text-gray-300">{axis}</td>
                                        <td
                                            className="py-2.5 text-right tabular-nums font-bold text-gray-900 dark:text-white"
                                            style={{ fontFamily: 'var(--font-mono), ui-monospace, monospace' }}
                                        >
                                            {a.toFixed(1)}
                                        </td>
                                        <td
                                            className="py-2.5 text-right tabular-nums text-gray-500"
                                            style={{ fontFamily: 'var(--font-mono), ui-monospace, monospace' }}
                                        >
                                            {c.toFixed(1)}
                                        </td>
                                        <td
                                            className="py-2.5 text-right tabular-nums font-bold"
                                            style={{
                                                fontFamily: 'var(--font-mono), ui-monospace, monospace',
                                                color: trendColor,
                                            }}
                                        >
                                            <span className="inline-flex items-center gap-0.5 justify-end">
                                                <TrendIcon size={10} />
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
                    * Valores agregados a partir das características que <strong>compõem o iABCZ</strong>. Comparativo computado contra {data.otherCount} animal{data.otherCount !== 1 ? 'is' : ''} com avaliação no catálogo.
                </p>

                {/* CTA */}
                <Link
                    href={`/products/${product.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all hover:shadow-md group"
                    style={{
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${BRAND.BRONZE}, ${BRAND.BRONZE_PALE})`,
                        color: '#0A0A0A',
                    }}
                >
                    <FileText size={13} />
                    Ver relatório completo
                </Link>
            </div>
        </div>
    );
}

// ── Radar SVG ──────────────────────────────────────────────────────────────────

function RadarChart({
    animal,
    catalog,
    maxValue,
}: {
    animal: Record<Axis, number>;
    catalog: Record<Axis, number>;
    maxValue: number;
}) {
    const VB = 320;
    const cx = VB / 2;
    const cy = VB / 2 + 4;
    const R = 95;

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
        <svg viewBox={`0 0 ${VB} ${VB}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet" style={{ maxHeight: 320 }}>
            <defs>
                <radialGradient id="radar-bronze" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={BRAND.BRONZE_PALE} stopOpacity="0.05" />
                    <stop offset="100%" stopColor={BRAND.BRONZE} stopOpacity="0" />
                </radialGradient>
                <linearGradient id="radar-animal-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BRAND.TECH_GREEN} stopOpacity="0.45" />
                    <stop offset="100%" stopColor={BRAND.TECH_GREEN} stopOpacity="0.18" />
                </linearGradient>
            </defs>

            {/* Subtle background tint */}
            <circle cx={cx} cy={cy} r={R} fill="url(#radar-bronze)" />

            {/* Concentric grid hexagons */}
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

            {/* Spokes */}
            {AXES.map((_, i) => {
                const angle = angleFor(i);
                const x = cx + R * Math.cos(angle);
                const y = cy + R * Math.sin(angle);
                return (
                    <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(212,168,92,0.10)" strokeWidth="0.5" />
                );
            })}

            {/* Catalog polygon (dashed outline) */}
            <polygon
                points={polygonPoints(catalog)}
                fill="none"
                stroke={BRAND.BRONZE_PALE}
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity="0.85"
            />
            {/* Catalog dots */}
            {AXES.map((axis, i) => {
                const angle = angleFor(i);
                const v = Math.max(0, catalog[axis] / maxValue);
                const x = cx + R * v * Math.cos(angle);
                const y = cy + R * v * Math.sin(angle);
                return <circle key={`c-${i}`} cx={x} cy={y} r="2.5" fill={BRAND.BRONZE_PALE} opacity="0.85" />;
            })}

            {/* Animal polygon (filled) */}
            <polygon
                points={polygonPoints(animal)}
                fill="url(#radar-animal-fill)"
                stroke={BRAND.TECH_GREEN}
                strokeWidth="2"
                strokeLinejoin="round"
            />
            {/* Animal dots with halo */}
            {AXES.map((axis, i) => {
                const angle = angleFor(i);
                const v = Math.max(0, animal[axis] / maxValue);
                const x = cx + R * v * Math.cos(angle);
                const y = cy + R * v * Math.sin(angle);
                return (
                    <g key={`a-${i}`}>
                        <circle cx={x} cy={y} r="5.5" fill={BRAND.TECH_GREEN} opacity="0.18" />
                        <circle cx={x} cy={y} r="3.5" fill={BRAND.TECH_GREEN} stroke="#0A0A0A" strokeWidth="1" />
                    </g>
                );
            })}

            {/* Axis labels */}
            {AXES.map((axis, i) => {
                const angle = angleFor(i);
                const labelR = R + 22;
                const x = cx + labelR * Math.cos(angle);
                const y = cy + labelR * Math.sin(angle);
                return (
                    <text
                        key={axis}
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="11"
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
