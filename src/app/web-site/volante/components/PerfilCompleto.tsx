'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

/* ============================================================
 * Perfil Completo · 5 categorias com ícones SVG inline.
 * Mesmas paths SVG do Atacante; descrições adaptadas pro Volante.
 * ============================================================ */
const cells: { title: string; desc: string; icon: ReactNode }[] = [
  {
    title: 'Crescimento',
    desc: 'PE365g +1.635 · DP210 +16,17',
    icon: (
      <>
        <path d="M3 17l6-6 4 4 8-8" />
        <path d="M14 7h7v7" />
      </>
    ),
  },
  {
    title: 'Carcaça',
    desc: 'AOL +1,675 · ACAB +5,128',
    icon: (
      <>
        <path d="M12 2v20M2 12h20" />
        <circle cx="12" cy="12" r="9" />
      </>
    ),
  },
  {
    title: 'Maternal',
    desc: 'STAYg +56,65% · TOP 1%',
    icon: (
      <>
        <path d="M9 11a3 3 0 1 1 6 0v1H9v-1Z" />
        <path d="M5 21V11a7 7 0 0 1 14 0v10" />
      </>
    ),
  },
  {
    title: 'Reprodução',
    desc: 'PES +2,79 · CE 41 cm',
    icon: (
      <>
        <path d="M4 4h16v16H4z" />
        <path d="M4 12h8M12 4v16" />
      </>
    ),
  },
  {
    title: 'Sanidade',
    desc: 'Central Bela Vista · MAPA',
    icon: <path d="M12 2 4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4Z" />,
  },
]

export function PerfilCompleto() {
  return (
    <motion.section
      id="perfil"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7 }}
      className="bg-nelore border-b border-bronze-500/20 px-[5vw] md:px-[6vw] py-20 md:py-32 lg:py-40"
    >
      <div className="max-w-[1320px] mx-auto">
        {/* Kicker */}
        <div className="inline-flex items-center gap-3.5 font-mono text-[10px] md:text-[11px] tracking-[0.28em] md:tracking-[0.32em] uppercase text-bronze-300 mb-6">
          <span className="text-bronze-500 text-[8px] leading-none">●</span>
          Perfil Completo
        </div>

        {/* H2 */}
        <h2
          className="text-selo font-medium max-w-3xl"
          style={{
            fontSize: 'clamp(32px, 5.5vw, 76px)',
            letterSpacing: '-0.025em',
            lineHeight: 1.02,
            marginBottom: 24,
          }}
        >
          Não só desempenho. Um touro{' '}
          <i className="italic text-bronze-300">equilibrado.</i>
        </h2>

        {/* Lede */}
        <p
          className="text-gray-200 max-w-2xl mb-16 md:mb-20"
          style={{ fontSize: 'clamp(15px, 1.4vw, 17px)', lineHeight: 1.65 }}
        >
          Bons indicadores maternais e reprodutivos — construindo um rebanho
          funcional, produtivo e sustentável ao longo das gerações.
        </p>

        {/* Grid · 5 colunas desktop / 2 colunas tablet / 1 mobile (CSS responde) */}
        <div className="fdb-perfil-grid">
          {cells.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: 0.08 * i }}
              className="fdb-perfil-cell"
            >
              <svg
                className="icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                {c.icon}
              </svg>
              <div>
                <div className="title">{c.title}</div>
                <div className="desc">{c.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
