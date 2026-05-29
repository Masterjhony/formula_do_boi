'use client'

import { motion } from 'framer-motion'

export function DosesCounter() {
  return (
    <motion.aside
      aria-label="Pré-reservas em andamento"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className="relative flex items-center justify-center flex-wrap gap-4 md:gap-7 px-[6vw] py-7 md:py-9 border-y border-bronze-500/20 overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 50% 50%, rgba(160,121,46,0.10), transparent 60%), #0A0A0A',
      }}
    >
      {/* Linhas bronze decorativas laterais (desktop) — réplica do ::before/::after */}
      <div
        aria-hidden="true"
        className="hidden md:block absolute top-1/2 -translate-y-1/2 h-px w-20 pointer-events-none"
        style={{
          left: '6vw',
          background:
            'linear-gradient(90deg, transparent, #A0792E, transparent)',
        }}
      />
      <div
        aria-hidden="true"
        className="hidden md:block absolute top-1/2 -translate-y-1/2 h-px w-20 pointer-events-none"
        style={{
          right: '6vw',
          background:
            'linear-gradient(90deg, transparent, #A0792E, transparent)',
        }}
      />

      {/* Inner · stack vertical no mobile, baseline horizontal no desktop */}
      <div className="flex flex-col md:flex-row items-center md:items-baseline gap-2 md:gap-[18px] relative z-10">
        <span
          className="font-medium text-bronze-300 leading-none"
          style={{
            fontSize: 'clamp(36px, 5vw, 56px)',
            letterSpacing: '-0.02em',
          }}
        >
          ●
        </span>
        <span
          className="font-mono font-medium uppercase text-gray-200 text-center md:text-left max-w-[260px] md:max-w-[280px]"
          style={{
            fontSize: 'clamp(10.5px, 1vw, 12px)',
            letterSpacing: '0.20em',
            lineHeight: 1.5,
          }}
        >
          Criadores de todo o Brasil já estão{' '}
          <b className="text-bronze-300 font-semibold">posicionando doses</b>{' '}
          para a Aceleradora 2026
        </span>
      </div>
    </motion.aside>
  )
}
