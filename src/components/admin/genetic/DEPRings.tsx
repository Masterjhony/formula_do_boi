'use client';

const BRAND = {
    BRONZE: '#A0792E',
    BRONZE_PALE: '#D4A85C',
    BRONZE_DEEP: '#6B4F1E',
    TECH_GREEN: '#7FD4A0',
    TECH_BLUE: '#1E3A5F',
    LOSS: '#A04545',
} as const;

export interface DEPRing {
    label: string;
    value: number | null;
    /** Optional: maximum reference for the ring fill (default 15). */
    max?: number;
}

interface DEPRingsProps {
    rings: DEPRing[];
    size?: number;
    /** Compact mode: smaller rings, smaller spacing */
    compact?: boolean;
    /** When all values are null, render a subtle empty badge instead of dashes (default: true). Set false to hide entirely. */
    showEmptyBadge?: boolean;
}

export function DEPRings({ rings, size = 38, compact = false, showEmptyBadge = true }: DEPRingsProps) {
    const allNull = rings.every(r => r.value === null || Number.isNaN(r.value as number));

    if (allNull) {
        if (!showEmptyBadge) return null;
        return (
            <span
                className="inline-flex items-center gap-1.5 px-2 py-1 border shrink-0"
                style={{
                    borderRadius: 3,
                    borderColor: 'rgba(160,121,46,0.20)',
                    backgroundColor: 'rgba(160,121,46,0.06)',
                    fontFamily: 'var(--font-mono), ui-monospace, monospace',
                    fontSize: 9,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: BRAND.BRONZE_PALE,
                    fontWeight: 600,
                }}
                title="Animal sem avaliação genética cadastrada"
            >
                <span
                    aria-hidden
                    className="w-1 h-1 rounded-full"
                    style={{ backgroundColor: BRAND.BRONZE_PALE, opacity: 0.6 }}
                />
                Sem avaliação
            </span>
        );
    }

    const gap = compact ? 'gap-2' : 'gap-3';
    return (
        <div className={`flex items-center ${gap}`}>
            {rings.map(({ label, value, max = 15 }) => {
                const v = value ?? 0;
                const pct = Math.min(Math.abs(v) / max * 100, 100);
                const color = v > 0
                    ? BRAND.TECH_GREEN
                    : v < 0
                        ? BRAND.LOSS
                        : BRAND.BRONZE_PALE;
                const display = value === null || Number.isNaN(value)
                    ? '—'
                    : v.toFixed(1);

                return (
                    <div key={label} className="flex flex-col items-center gap-1 min-w-0">
                        <DonutRing
                            percentage={pct}
                            value={display}
                            color={color}
                            size={size}
                            isPositive={v > 0}
                            hasValue={value !== null}
                        />
                        <span
                            className="text-[8px] font-bold uppercase truncate max-w-[60px]"
                            style={{
                                fontFamily: 'var(--font-mono), ui-monospace, monospace',
                                letterSpacing: '0.12em',
                                color: BRAND.BRONZE_PALE,
                            }}
                        >
                            {label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

function DonutRing({
    percentage,
    value,
    color,
    size,
    hasValue,
}: {
    percentage: number;
    value: string;
    color: string;
    size: number;
    isPositive: boolean;
    hasValue: boolean;
}) {
    const strokeWidth = Math.max(3, size * 0.09);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(160,121,46,0.14)"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {hasValue && (
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                    />
                )}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span
                    className="font-black tabular-nums leading-none"
                    style={{
                        fontFamily: 'var(--font-mono), ui-monospace, monospace',
                        fontSize: Math.round(size * 0.28),
                        color: hasValue ? color : 'rgba(160,121,46,0.4)',
                    }}
                >
                    {value}
                </span>
            </div>
        </div>
    );
}
