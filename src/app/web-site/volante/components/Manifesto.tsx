'use client'

import { motion } from 'framer-motion'
import { volante } from '../volante.data'

export function Manifesto() {
  const m = volante.manifesto

  return (
    <section
      id="manifesto"
      className="relative overflow-hidden border-b border-bronze-500/20 px-[5vw] md:px-[6vw] py-20 md:py-32 lg:py-40"
      style={{
        background:
          'radial-gradient(circle at 20% 30%, rgba(160,121,46,0.06), transparent 40%), #000000',
      }}
    >
      {/* Foto sangrando · desktop: lateral direita.
          Zona ampliada (60%) + mask em 7 stops para fade ultra-suave
          até a área escura à esquerda. Sem overlay preto que cortaria. */}
      <div
        aria-hidden="true"
        className="hidden md:block absolute top-0 right-0 bottom-0 pointer-events-none"
        style={{
          width: '60%',
          backgroundImage: 'url(/volante/volante-4.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'right center',
          maskImage:
            'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.04) 12%, rgba(0,0,0,0.16) 28%, rgba(0,0,0,0.36) 45%, rgba(0,0,0,0.58) 62%, rgba(0,0,0,0.76) 80%, rgba(0,0,0,0.88) 100%)',
          WebkitMaskImage:
            'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.04) 12%, rgba(0,0,0,0.16) 28%, rgba(0,0,0,0.36) 45%, rgba(0,0,0,0.58) 62%, rgba(0,0,0,0.76) 80%, rgba(0,0,0,0.88) 100%)',
          filter: 'brightness(0.55) contrast(1.20) saturate(0.75) sepia(0.05)',
          zIndex: 1,
        }}
      />
      {/* Véu bronze suave no miolo da transição · soft-light blend
          puxa o tom da seção pra dentro da foto na zona de fade */}
      <div
        aria-hidden="true"
        className="hidden md:block absolute top-0 bottom-0 pointer-events-none z-[2]"
        style={{
          left: '28%',
          width: '34%',
          background:
            'linear-gradient(90deg, transparent 0%, rgba(61,45,17,0.55) 50%, transparent 100%)',
          mixBlendMode: 'soft-light',
        }}
      />

      {/* Mobile · foto full-bleed com fade de cima pra baixo */}
      <div
        aria-hidden="true"
        className="md:hidden absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/volante/volante-4.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          maskImage:
            'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0.5) 100%)',
          WebkitMaskImage:
            'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0.5) 100%)',
          filter: 'brightness(0.4) contrast(1.20) saturate(0.75) sepia(0.05)',
          zIndex: 1,
        }}
      />
      <div
        aria-hidden="true"
        className="md:hidden absolute inset-0 pointer-events-none z-[2]"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.85) 100%)',
        }}
      />

      {/* Padrão topografia (Brandbook §07.05) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.18] mix-blend-screen z-[3]"
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
        <div className="inline-flex items-center gap-3.5 font-mono text-[10px] md:text-[11px] tracking-[0.28em] md:tracking-[0.32em] uppercase text-bronze-300 mb-8 md:mb-10">
          <span className="text-bronze-500 text-[8px] leading-none">●</span>
          Manifesto
        </div>

        {/* Grid · 1fr / 1.3fr no desktop · empilha no mobile */}
        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-10 lg:gap-24 items-end">
          <div>
            <h2
              className="text-selo font-medium"
              style={{
                fontSize: 'clamp(32px, 6vw, 80px)',
                letterSpacing: '-0.025em',
                lineHeight: 1.02,
                marginBottom: 24,
              }}
            >
              {m.tituloInicio}{' '}
              <i className="italic text-bronze-300">{m.tituloItalico}</i>
            </h2>
          </div>

          <div className="max-w-xl">
            <p
              className="text-gray-200"
              style={{ fontSize: 'clamp(15px, 1.4vw, 17px)', lineHeight: 1.7 }}
            >
              O{' '}
              <b className="text-bronze-300 font-medium">{m.nomeDestaque}</b>
              {m.paragrafoPrincipal}
            </p>
            <p
              className="mt-4 md:mt-5 text-gray-200"
              style={{ fontSize: 'clamp(15px, 1.4vw, 17px)', lineHeight: 1.7 }}
            >
              {m.paragrafoSecundario}
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
