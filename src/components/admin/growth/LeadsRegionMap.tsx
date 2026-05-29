'use client';

import { useMemo, useState } from 'react';

const BRAND = {
    BRONZE: '#A0792E',
    BRONZE_DEEP: '#6B4F1E',
    BRONZE_PALE: '#D4A85C',
    TECH_GREEN: '#7FD4A0',
    TECH_BLUE: '#1E3A5F',
} as const;

// ── Cartograma do Brasil: posição (linha, coluna) de cada UF numa grade 6×9 ──
// Arranjo aproximadamente geográfico (oeste→leste, norte→sul).
type Cell = { uf: string; nome: string; row: number; col: number };
const GRID: Cell[] = [
    { uf: 'RR', nome: 'Roraima', row: 0, col: 2 },
    { uf: 'AP', nome: 'Amapá', row: 0, col: 4 },
    { uf: 'AM', nome: 'Amazonas', row: 1, col: 1 },
    { uf: 'PA', nome: 'Pará', row: 1, col: 2 },
    { uf: 'MA', nome: 'Maranhão', row: 1, col: 3 },
    { uf: 'CE', nome: 'Ceará', row: 1, col: 4 },
    { uf: 'RN', nome: 'Rio Grande do Norte', row: 1, col: 5 },
    { uf: 'AC', nome: 'Acre', row: 2, col: 0 },
    { uf: 'RO', nome: 'Rondônia', row: 2, col: 1 },
    { uf: 'TO', nome: 'Tocantins', row: 2, col: 2 },
    { uf: 'PI', nome: 'Piauí', row: 2, col: 3 },
    { uf: 'PE', nome: 'Pernambuco', row: 2, col: 4 },
    { uf: 'PB', nome: 'Paraíba', row: 2, col: 5 },
    { uf: 'MT', nome: 'Mato Grosso', row: 3, col: 1 },
    { uf: 'GO', nome: 'Goiás', row: 3, col: 2 },
    { uf: 'BA', nome: 'Bahia', row: 3, col: 3 },
    { uf: 'AL', nome: 'Alagoas', row: 3, col: 4 },
    { uf: 'SE', nome: 'Sergipe', row: 3, col: 5 },
    { uf: 'MS', nome: 'Mato Grosso do Sul', row: 4, col: 1 },
    { uf: 'DF', nome: 'Distrito Federal', row: 4, col: 2 },
    { uf: 'MG', nome: 'Minas Gerais', row: 4, col: 3 },
    { uf: 'ES', nome: 'Espírito Santo', row: 4, col: 4 },
    { uf: 'SP', nome: 'São Paulo', row: 5, col: 2 },
    { uf: 'RJ', nome: 'Rio de Janeiro', row: 5, col: 3 },
    { uf: 'PR', nome: 'Paraná', row: 6, col: 1 },
    { uf: 'SC', nome: 'Santa Catarina', row: 7, col: 1 },
    { uf: 'RS', nome: 'Rio Grande do Sul', row: 8, col: 1 },
];
const GRID_COLS = 6;
const GRID_ROWS = 9;

export const UF_REGIAO: Record<string, string> = {
    AC: 'Norte', AP: 'Norte', AM: 'Norte', PA: 'Norte', RO: 'Norte', RR: 'Norte', TO: 'Norte',
    AL: 'Nordeste', BA: 'Nordeste', CE: 'Nordeste', MA: 'Nordeste', PB: 'Nordeste', PE: 'Nordeste', PI: 'Nordeste', RN: 'Nordeste', SE: 'Nordeste',
    DF: 'Centro-Oeste', GO: 'Centro-Oeste', MT: 'Centro-Oeste', MS: 'Centro-Oeste',
    ES: 'Sudeste', MG: 'Sudeste', RJ: 'Sudeste', SP: 'Sudeste',
    PR: 'Sul', RS: 'Sul', SC: 'Sul',
};

const REGIOES = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'] as const;
const REGIAO_COR: Record<string, string> = {
    Norte: BRAND.TECH_GREEN,
    Nordeste: BRAND.BRONZE_PALE,
    'Centro-Oeste': BRAND.BRONZE,
    Sudeste: BRAND.TECH_BLUE,
    Sul: BRAND.BRONZE_DEEP,
};

interface Props {
    byUf: Record<string, number>;
    unknownCount?: number;
}

/** Mapa (cartograma) de leads por UF + rollup por macrorregião. */
export function LeadsRegionMap({ byUf, unknownCount = 0 }: Props) {
    const [hover, setHover] = useState<string | null>(null);

    const max = useMemo(() => Math.max(1, ...Object.values(byUf)), [byUf]);
    const total = useMemo(() => Object.values(byUf).reduce((s, n) => s + n, 0), [byUf]);

    const regioes = useMemo(() => {
        const acc: Record<string, number> = Object.fromEntries(REGIOES.map(r => [r, 0]));
        for (const [uf, n] of Object.entries(byUf)) {
            const r = UF_REGIAO[uf];
            if (r) acc[r] += n;
        }
        return REGIOES.map(r => ({ regiao: r, count: acc[r] })).sort((a, b) => b.count - a.count);
    }, [byUf]);
    const regiaoMax = Math.max(1, ...regioes.map(r => r.count));
    const topUf = useMemo(
        () => Object.entries(byUf).sort(([, a], [, b]) => b - a)[0],
        [byUf],
    );

    const tileStyle = (count: number, isHover: boolean): React.CSSProperties => {
        if (count <= 0) {
            // Estado sem leads — recua para não virar "buraco", mas mantém a silhueta do Brasil.
            return {
                backgroundColor: 'rgba(160,121,46,0.05)',
                borderColor: 'rgba(160,121,46,0.10)',
                color: 'rgba(148,151,158,0.55)',
            };
        }
        const t = count / max;            // 0..1
        const alpha = 0.28 + t * 0.72;    // piso mais alto para legibilidade
        return {
            backgroundColor: `rgba(160,121,46,${alpha.toFixed(3)})`,
            borderColor: isHover ? '#D4A85C' : `rgba(160,121,46,${Math.min(1, alpha + 0.2).toFixed(3)})`,
            color: t > 0.5 ? '#161616' : '#F5F0E4',
        };
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 items-start">
            {/* Cartograma */}
            <div className="w-full max-w-[330px] mx-auto lg:mx-0">
                <div
                    className="grid gap-[5px]"
                    style={{
                        gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
                        gridTemplateRows: `repeat(${GRID_ROWS}, auto)`,
                    }}
                >
                    {GRID.map(cell => {
                        const count = byUf[cell.uf] ?? 0;
                        const isHover = hover === cell.uf;
                        return (
                            <div
                                key={cell.uf}
                                onMouseEnter={() => setHover(cell.uf)}
                                onMouseLeave={() => setHover(null)}
                                title={`${cell.nome} (${cell.uf}) · ${count} lead${count === 1 ? '' : 's'}`}
                                className="relative rounded-[5px] border flex flex-col items-center justify-center aspect-square transition-transform duration-150 cursor-default"
                                style={{
                                    gridColumnStart: cell.col + 1,
                                    gridRowStart: cell.row + 1,
                                    transform: isHover ? 'scale(1.12)' : undefined,
                                    boxShadow: isHover && count > 0 ? '0 4px 14px rgba(0,0,0,0.35)' : undefined,
                                    zIndex: isHover ? 3 : 1,
                                    ...tileStyle(count, isHover),
                                }}
                            >
                                <span className="text-[10px] font-black leading-none tracking-tight">{cell.uf}</span>
                                {count > 0 && (
                                    <span className="text-[10px] font-bold leading-none mt-0.5 font-mono tabular-nums">{count}</span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Legenda de intensidade */}
                <div className="flex items-center gap-2 mt-4">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-gray-400">Menos</span>
                    <div className="flex-1 h-2 rounded-full" style={{ background: 'linear-gradient(90deg, rgba(160,121,46,0.28), rgba(160,121,46,1))' }} />
                    <span className="text-[9px] uppercase tracking-wider font-bold text-gray-400">Mais</span>
                    <span className="text-[9px] text-gray-400 ml-1 font-mono">pico {max}</span>
                </div>
                <p className="text-[9px] text-gray-400 mt-1.5">Cartograma · cada quadro é um estado, intensidade = volume de leads</p>
            </div>

            {/* Rollup por macrorregião */}
            <div className="flex flex-col">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
                    Por macrorregião
                </p>
                <div className="space-y-2.5">
                    {regioes.map(({ regiao, count }) => {
                        const pct = total > 0 ? (count / total) * 100 : 0;
                        const barPct = (count / regiaoMax) * 100;
                        const cor = REGIAO_COR[regiao];
                        return (
                            <div key={regiao}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: cor }} />
                                        {regiao}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-bold font-mono" style={{ color: cor }}>{count}</span>
                                        <span className="text-[9px] text-gray-500 font-mono">({pct.toFixed(0)}%)</span>
                                    </div>
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-[#262626] overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${barPct}%`, backgroundColor: cor }} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-auto pt-4 text-[10px] text-gray-500 space-y-1">
                    {topUf && (
                        <p>
                            UF líder: <span className="font-bold font-mono" style={{ color: BRAND.BRONZE }}>{topUf[0]}</span>
                            {' '}com <span className="font-mono">{topUf[1]}</span> lead{topUf[1] === 1 ? '' : 's'}
                        </p>
                    )}
                    <p className="font-mono">{total} leads localizados</p>
                    {unknownCount > 0 && (
                        <p className="text-gray-400">{unknownCount} sem UF informada</p>
                    )}
                </div>
            </div>
        </div>
    );
}
