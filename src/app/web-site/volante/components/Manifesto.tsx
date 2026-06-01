'use client'

import { motion } from 'framer-motion'
import { volante } from '../volante.data'
import { VolanteCta } from './VolanteCta'

export function Manifesto() {
  const m = volante.manifesto

  return (
    <section
      id="manifesto"
      className="relative overflow-hidden border-b border-bronze-500/20 px-[5vw] md:px-[6vw] py-20 md:py-32 lg:py-40"
      style={{
        background:
          'radial-gradient(circle at 20% 30%, rgba(160,121,46,0.08), transparent 45%), #000000',
      }}
    >
      {/* Padrão topografia (Brandbook §07.05) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.14] mix-blend-screen z-[1]"
      >
        <svg
          viewBox="0 0 1200 600"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <g fill="none" stroke="#A0792E" strokeWidth="0.6" opacity="0.4">
            <path d="M0,80 Q300,120 600,90 T1200,110" />
            <path d="M0,160 Q300,200 600,170 T1200,190" />
            <path d="M0,240 Q300,280 600,250 T1200,270" />
            <path d="M0,320 Q300,360 600,330 T1200,350" />
            <path d="M0,400 Q300,440 600,410 T1200,430" />
            <path d="M0,480 Q300,520 600,490 T1200,510" />
          </g>
        </svg>
      </div>

      {/* Conteúdo */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 max-w-[1320px] mx-auto"
      >
        {/* Kicker */}
        <div className="inline-flex items-center gap-3.5 font-mono text-[10px] md:text-[11px] tracking-[0.28em] md:tracking-[0.32em] uppercase text-bronze-300 mb-8 md:mb-12">
          <span className="text-bronze-500 text-[8px] leading-none">●</span>
          Manifesto
        </div>

        {/* Grid · texto à esquerda · foto enquadrada à direita */}
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-center">
          {/* Coluna de texto */}
          <div>
            <h2
              className="text-selo font-medium"
              style={{
                fontSize: 'clamp(32px, 5.5vw, 76px)',
                letterSpacing: '-0.025em',
                lineHeight: 1.02,
                marginBottom: 24,
              }}
            >
              {m.tituloInicio}{' '}
              <i className="italic text-bronze-300">{m.tituloItalico}</i>
            </h2>

            <p
              className="text-gray-200 max-w-xl"
              style={{ fontSize: 'clamp(15px, 1.4vw, 17px)', lineHeight: 1.7 }}
            >
              O{' '}
              <b className="text-bronze-300 font-medium">{m.nomeDestaque}</b>
              {m.paragrafoPrincipal}
            </p>
            <p
              className="mt-4 md:mt-5 text-gray-200 max-w-xl"
              style={{ fontSize: 'clamp(15px, 1.4vw, 17px)', lineHeight: 1.7 }}
            >
              {m.paragrafoSecundario}
            </p>

            <div className="mt-9 md:mt-10">
              <VolanteCta sub="Sêmen convencional · Pré-reserva aberta" />
            </div>
          </div>

          {/* Coluna da foto · imagem clara do touro com moldura bronze */}
          <div
            className="relative overflow-hidden border border-bronze-500/30"
            style={{ aspectRatio: '3 / 4' }}
          >
            <img
              src="/volante/volante-frontal.jpg"
              alt="Volante MRA — Nelore PO no campo"
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                objectPosition: 'center center',
                filter: 'brightness(0.96) contrast(1.08) saturate(0.92) sepia(0.04)',
              }}
            />
            {/* Fade inferior pra caption */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.78) 100%)',
              }}
            />

            {/* 4 cantos bronze */}
            <span aria-hidden="true" className="absolute top-2.5 left-2.5 w-4 h-4 border-t border-l border-bronze-500 pointer-events-none" />
            <span aria-hidden="true" className="absolute top-2.5 right-2.5 w-4 h-4 border-t border-r border-bronze-500 pointer-events-none" />
            <span aria-hidden="true" className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b border-l border-bronze-500 pointer-events-none" />
            <span aria-hidden="true" className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b border-r border-bronze-500 pointer-events-none" />

            {/* Caption */}
            <div className="absolute left-4 right-4 bottom-4 flex items-end justify-between gap-3">
              <div className="font-medium italic text-selo text-base md:text-lg">
                Volante MRA
              </div>
              <div className="font-mono text-[9px] md:text-[10px] tracking-[0.24em] uppercase text-bronze-300">
                Nelore PO
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
