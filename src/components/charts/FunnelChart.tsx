'use client';

const BRAND = {
    BRONZE: '#A0792E',
    BRONZE_DEEP: '#6B4F1E',
    BRONZE_MID: '#8B6826',
    BRONZE_PALE: '#D4A85C',
    TECH_GREEN: '#7FD4A0',
    TECH_BLUE: '#1E3A5F',
    LOSS: '#A04545',
} as const;

export interface FunnelStage {
    label: string;
    count: number;
}

interface FunnelChartProps {
    stages: FunnelStage[];
    /** Base para o % de cada etapa em relação ao topo. Default: contagem da 1ª etapa. */
    totalForPct?: number;
}

/** Progressão de cor: Bronze profundo → Bronze → Bronze claro → Tech Blue → Tech Green. */
function stageColor(i: number, total: number): string {
    if (i === total - 1) return BRAND.TECH_GREEN;
    if (total === 5) {
        return [BRAND.BRONZE_DEEP, BRAND.BRONZE_MID, BRAND.BRONZE, BRAND.TECH_BLUE, BRAND.TECH_GREEN][i] ?? BRAND.BRONZE;
    }
    const palette = [BRAND.BRONZE_DEEP, BRAND.BRONZE, BRAND.BRONZE_PALE, BRAND.TECH_BLUE, BRAND.TECH_GREEN];
    return palette[Math.min(Math.floor((i / Math.max(total - 1, 1)) * (palette.length - 1)), palette.length - 1)];
}

/**
 * Funil vertical afunilado — cada etapa é um trapézio cuja largura no topo é
 * proporcional à sua contagem e cuja base afunila para a contagem da etapa
 * seguinte, formando a silhueta clássica de funil. A taxa de conversão entre
 * etapas aparece num chip centralizado no intervalo.
 */
export function FunnelChart({ stages, totalForPct }: FunnelChartProps) {
    if (stages.length < 2) return null;

    const N = stages.length;
    const VB_W = 1000;
    const PAD_X = 8;
    const BAND_H = 66;
    const GAP = 34;            // espaço entre bandas para o chip de conversão
    const PAD_TOP = 6;
    const PAD_BOTTOM = 6;
    const VB_H = PAD_TOP + N * BAND_H + (N - 1) * GAP + PAD_BOTTOM;

    const usableW = VB_W - PAD_X * 2;
    const MIN_W = usableW * 0.14;  // largura mínima — etapa pequena ainda visível
    const cx = VB_W / 2;

    const counts = stages.map(s => s.count);
    const maxCount = Math.max(...counts, 1);
    const base = totalForPct && totalForPct > 0 ? totalForPct : (counts[0] || 1);

    const widthFor = (c: number) => MIN_W + (Math.max(c, 0) / maxCount) * (usableW - MIN_W);

    return (
        <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            className="w-full h-auto"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Funil de conversão"
        >
            <defs>
                {stages.map((_, i) => {
                    const c = stageColor(i, N);
                    return (
                        <linearGradient key={i} id={`fc-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={c} stopOpacity="1" />
                            <stop offset="100%" stopColor={c} stopOpacity="0.82" />
                        </linearGradient>
                    );
                })}
                <filter id="fc-glow-last" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {stages.map((stage, i) => {
                const isLast = i === N - 1;
                const y = PAD_TOP + i * (BAND_H + GAP);

                const topW = widthFor(stage.count);
                const bottomW = isLast ? topW * 0.86 : widthFor(stages[i + 1].count);

                const topL = cx - topW / 2;
                const topR = cx + topW / 2;
                const botL = cx - bottomW / 2;
                const botR = cx + bottomW / 2;

                const path = `M ${topL} ${y} L ${topR} ${y} L ${botR} ${y + BAND_H} L ${botL} ${y + BAND_H} Z`;

                const pctOfTop = base > 0 ? (stage.count / base) * 100 : 0;
                const convToNext = !isLast && stage.count > 0
                    ? (stages[i + 1].count / stage.count) * 100
                    : null;
                const convColor = convToNext === null
                    ? BRAND.BRONZE
                    : convToNext >= 50 ? BRAND.TECH_GREEN
                        : convToNext >= 25 ? BRAND.BRONZE
                            : BRAND.LOSS;

                return (
                    <g key={stage.label}>
                        <path
                            d={path}
                            fill={`url(#fc-grad-${i})`}
                            filter={isLast ? 'url(#fc-glow-last)' : undefined}
                        />
                        <path d={path} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />

                        {/* Rótulo da etapa */}
                        <text
                            x={cx}
                            y={y + BAND_H / 2 - 10}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="700"
                            fill="#fff"
                            fillOpacity="0.9"
                            style={{ textTransform: 'uppercase', letterSpacing: '0.14em' }}
                        >
                            {stage.label}
                        </text>
                        {/* Contagem (mono, destaque) */}
                        <text
                            x={cx}
                            y={y + BAND_H / 2 + 18}
                            textAnchor="middle"
                            fontSize="26"
                            fontWeight="900"
                            fill="#fff"
                            fontFamily="ui-monospace, 'JetBrains Mono', monospace"
                            style={{ letterSpacing: '-0.02em' }}
                        >
                            {stage.count.toLocaleString('pt-BR')}
                        </text>
                        {/* % em relação ao topo — à direita da banda */}
                        <text
                            x={topR + 12}
                            y={y + BAND_H / 2 + 4}
                            textAnchor="start"
                            fontSize="11"
                            fontWeight="700"
                            fill="currentColor"
                            className="text-gray-400 dark:text-gray-500"
                            fontFamily="ui-monospace, 'JetBrains Mono', monospace"
                        >
                            {pctOfTop.toFixed(0)}%
                        </text>

                        {/* Chip de conversão para a próxima etapa, no intervalo */}
                        {convToNext !== null && (
                            <g transform={`translate(${cx}, ${y + BAND_H + GAP / 2})`}>
                                <text
                                    x={0}
                                    y={2}
                                    textAnchor="middle"
                                    fontSize="13"
                                    fontWeight="800"
                                    fill={convColor}
                                    fontFamily="ui-monospace, 'JetBrains Mono', monospace"
                                >
                                    ↓ {convToNext.toFixed(0)}%
                                </text>
                                <text
                                    x={0}
                                    y={15}
                                    textAnchor="middle"
                                    fontSize="7.5"
                                    fill="currentColor"
                                    className="text-gray-500 dark:text-gray-400"
                                    fontWeight="600"
                                    style={{ textTransform: 'uppercase', letterSpacing: '0.18em' }}
                                >
                                    conversão
                                </text>
                            </g>
                        )}
                    </g>
                );
            })}
        </svg>
    );
}
