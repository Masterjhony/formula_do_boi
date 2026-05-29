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
 * Funil vertical contínuo — as bandas se encostam (a base de uma é o topo da
 * próxima), formando a silhueta clássica de funil que afunila de cima para
 * baixo. A largura de cada nível é proporcional à sua contagem. Conversão
 * entre etapas e % em relação ao topo aparecem numa trilha à direita.
 */
export function FunnelChart({ stages, totalForPct }: FunnelChartProps) {
    if (stages.length < 2) return null;

    const N = stages.length;
    const VB_W = 1000;
    const RAIL = 150;                 // trilha de conversão à direita
    const PAD_X = 12;
    const PAD_TOP = 4;
    const PAD_BOTTOM = 4;
    const BAND_H = 74;

    const funnelRight = VB_W - RAIL;
    const usableW = funnelRight - PAD_X * 2;
    const cx = PAD_X + usableW / 2;
    const MIN_W = usableW * 0.18;
    const VB_H = PAD_TOP + N * BAND_H + PAD_BOTTOM;

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
                            <stop offset="0%" stopColor={c} stopOpacity="0.95" />
                            <stop offset="100%" stopColor={c} stopOpacity="0.72" />
                        </linearGradient>
                    );
                })}
                <filter id="fc-txt" x="-20%" y="-30%" width="140%" height="160%">
                    <feDropShadow dx="0" dy="0.6" stdDeviation="0.8" floodColor="#000" floodOpacity="0.45" />
                </filter>
            </defs>

            {stages.map((stage, i) => {
                const isLast = i === N - 1;
                const y = PAD_TOP + i * BAND_H;
                const topW = widthFor(stage.count);
                const bottomW = isLast ? topW * 0.82 : widthFor(stages[i + 1].count);

                const topL = cx - topW / 2;
                const topR = cx + topW / 2;
                const botL = cx - bottomW / 2;
                const botR = cx + bottomW / 2;
                const path = `M ${topL} ${y} L ${topR} ${y} L ${botR} ${y + BAND_H} L ${botL} ${y + BAND_H} Z`;

                const c = stageColor(i, N);
                const darkText = c === BRAND.TECH_GREEN || c === BRAND.BRONZE_PALE;
                const ink = darkText ? '#15241A' : '#FFFFFF';

                const pctOfTop = base > 0 ? (stage.count / base) * 100 : 0;
                const convToNext = !isLast && stage.count > 0 ? (stages[i + 1].count / stage.count) * 100 : null;
                const convColor = convToNext === null
                    ? BRAND.BRONZE
                    : convToNext >= 50 ? BRAND.TECH_GREEN
                        : convToNext >= 25 ? BRAND.BRONZE_PALE
                            : BRAND.LOSS;

                const boundaryY = y + BAND_H;
                const railX = funnelRight + RAIL / 2;

                return (
                    <g key={stage.label}>
                        <path d={path} fill={`url(#fc-grad-${i})`} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

                        {/* Rótulo + contagem (com sombra para contraste) */}
                        <g filter="url(#fc-txt)">
                            <text x={cx} y={y + BAND_H / 2 - 9} textAnchor="middle" fontSize="10.5" fontWeight="700"
                                fill={ink} style={{ textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                                {stage.label}
                            </text>
                            <text x={cx} y={y + BAND_H / 2 + 19} textAnchor="middle" fontSize="27" fontWeight="900"
                                fill={ink} fontFamily="ui-monospace, 'JetBrains Mono', monospace" style={{ letterSpacing: '-0.02em' }}>
                                {stage.count.toLocaleString('pt-BR')}
                            </text>
                        </g>

                        {/* Trilha direita: % do topo (centro da banda) */}
                        <text x={railX} y={y + BAND_H / 2 - 4} textAnchor="middle" fontSize="13" fontWeight="800"
                            fill="currentColor" className="text-gray-700 dark:text-gray-200"
                            fontFamily="ui-monospace, 'JetBrains Mono', monospace">
                            {pctOfTop.toFixed(0)}%
                        </text>
                        <text x={railX} y={y + BAND_H / 2 + 9} textAnchor="middle" fontSize="7.5" fontWeight="600"
                            fill="currentColor" className="text-gray-400 dark:text-gray-500"
                            style={{ textTransform: 'uppercase', letterSpacing: '0.16em' }}>
                            do topo
                        </text>

                        {/* Conversão para a próxima etapa, na divisa das bandas */}
                        {convToNext !== null && (
                            <g>
                                <line x1={botR + 4} y1={boundaryY} x2={railX - 26} y2={boundaryY}
                                    stroke={convColor} strokeWidth="1" strokeOpacity="0.5" strokeDasharray="2 2" />
                                <text x={railX} y={boundaryY + 4} textAnchor="middle" fontSize="12.5" fontWeight="800"
                                    fill={convColor} fontFamily="ui-monospace, 'JetBrains Mono', monospace">
                                    ↓ {convToNext.toFixed(0)}%
                                </text>
                            </g>
                        )}
                    </g>
                );
            })}
        </svg>
    );
}
