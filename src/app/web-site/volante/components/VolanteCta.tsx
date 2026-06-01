'use client'

import Link from 'next/link'

/* ============================================================
 * CTA reutilizável do /volante · botão chamativo e animado
 * (pulso + glow dourado + shine sweep via classe global
 * `.fdb-cta-anim` em volante.css). Usado em todas as seções
 * para o briefing "CTA em todas as sessões".
 * ============================================================ */
type Props = {
  label?: string
  /** Microtexto de segurança abaixo do botão (null pra ocultar). */
  sub?: string | null
  /** Alinhamento do bloco. */
  align?: 'start' | 'center'
  /** Largura total no mobile. */
  className?: string
}

export function VolanteCta({
  label = 'Reservar dose',
  sub = 'Pré-reserva gratuita · Curador confirma em até 24h',
  align = 'start',
  className = '',
}: Props) {
  return (
    <div
      className={[
        'flex flex-col gap-3.5 w-full md:w-auto',
        align === 'center' ? 'items-center text-center' : 'items-start',
        className,
      ].join(' ')}
    >
      <Link
        href="/volante/checkout"
        className="fdb-cta-anim group/cta inline-flex items-center justify-center gap-3 w-full md:w-auto px-7 md:px-9 py-4 text-[13px] md:text-sm font-bold uppercase tracking-[0.10em] bg-bronze-500 text-nelore border border-bronze-500 rounded-[2px]"
      >
        <span className="relative z-10">{label}</span>
        <svg
          viewBox="0 0 14 10"
          fill="none"
          className="relative z-10 w-3.5 h-2.5 transition-transform duration-200 group-hover/cta:translate-x-1"
        >
          <path d="M1 5h12m0 0L9 1m4 4L9 9" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </Link>
      {sub && (
        <p
          className="inline-flex items-center gap-2.5 font-mono uppercase font-medium text-[9.5px] md:text-[10.5px] tracking-[0.20em] md:tracking-[0.24em]"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-bronze-500 inline-block shrink-0" />
          {sub}
        </p>
      )}
    </div>
  )
}
