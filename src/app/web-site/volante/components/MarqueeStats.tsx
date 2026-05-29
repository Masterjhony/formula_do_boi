const stats = [
  { t: 'MGTe 27,01', gold: true },
  { t: 'TOP 6% NACIONAL' },
  { t: 'PESO +1.635 ELITE', gold: true },
  { t: 'ACAB +5,128 ELITE' },
  { t: 'STAY +56,65% ELITE', gold: true },
  { t: 'PES +2,79 ELITE' },
  { t: 'SUPERPRECOCE · 12,13', gold: true },
  { t: '886 KG · 41 CM CE' },
  { t: 'DECA 1', gold: true },
  { t: 'NELORE PO' },
  { t: 'PRÉ-RESERVA ABERTA', gold: true },
  { t: 'ACELERADORA 2026' },
]

// Duplicado 2× → animação translateX(0 → -50%) faz loop perfeito.
const loop = [...stats, ...stats]

export function MarqueeStats() {
  return (
    <div
      aria-hidden="true"
      className="bg-ink border-y border-bronze-500/20 py-3 md:py-4 overflow-hidden"
    >
      <div
        className="marquee-track-fdb inline-flex whitespace-nowrap will-change-transform"
        style={{
          gap: 60,
          animation: 'marquee-fdb 60s linear infinite',
        }}
      >
        {loop.map((it, i) => (
          <span
            key={i}
            className={[
              'shrink-0 font-mono text-[11px] md:text-xs uppercase tracking-[0.22em] md:tracking-[0.28em]',
              it.gold ? 'text-bronze-300' : 'text-gray-200',
            ].join(' ')}
          >
            {it.t}
            <span className="ml-[36px] md:ml-[60px] text-bronze-700">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
