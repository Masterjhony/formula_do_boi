'use client'

const ITEMS = [
  'MGTe 35,12',
  'TOP 0,1% NACIONAL',
  'IQGg 38,25 · TOP 0,5%',
  'iABCZg 36,5 · DECA 1',
  'PESO 680 KG · 36 CM CE',
  'AOL 7,67 · TOP 0,1%',
  'DP450 33,24 · TOP 3%',
  'DSTAY 90,46 · TOP 4%',
  'TMM 6,84 · TOP 1%',
  'PS 30,59 · DECA 1',
  'SUPERPRECOCE',
  'NELORE PO',
  'DECA 1',
  'PRÉ-RESERVA ABERTA',
  'ACELERADORA 2026',
]

export default function MarqueeStats() {
  const doubled = [...ITEMS, ...ITEMS]
  return (
    <div className="marquee-fdb" aria-hidden="true">
      <div className="marquee-fdb__track">
        {doubled.map((text, i) => (
          <span
            key={i}
            className={`marquee-fdb__item ${i % 2 === 0 ? 'marquee-fdb__item--bronze' : 'marquee-fdb__item--gray'}`}
          >
            {text}
            <span className="marquee-fdb__star">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}