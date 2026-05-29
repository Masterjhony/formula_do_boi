import { volante } from '../volante.data'

export function ValuesStrip() {
  return (
    <div
      aria-label="Valores Fórmula do Boi"
      className="bg-ink border-y border-bronze-500/20 px-[5vw] md:px-[6vw] py-4 md:py-5"
    >
      <div className="flex items-center justify-center flex-wrap gap-x-5 md:gap-x-9 gap-y-2">
        {volante.valoresMarca.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-2 md:gap-3 font-mono font-semibold uppercase text-bronze-300 text-[9px] md:text-[11px] tracking-[0.28em] md:tracking-[0.4em]"
          >
            <span className="block w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-bronze-500" />
            {v}
          </span>
        ))}
      </div>
    </div>
  )
}
