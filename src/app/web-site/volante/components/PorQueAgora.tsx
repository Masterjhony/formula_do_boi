'use client'

import { motion } from 'framer-motion'
import { volante } from '../volante.data'
import { VolanteCta } from './VolanteCta'

type Pilar = { n: string; titulo: string; subtitulo: string; texto: string }

function UrgencyBadge() {
  return (
    <div
      role="note"
      className="flex items-start gap-3 mt-5 px-4 py-3.5"
      style={{
        border: '1px solid #6B4F1E',
        borderLeft: '3px solid #A0792E',
        background:
          'linear-gradient(90deg, rgba(160,121,46,0.16) 0%, rgba(160,121,46,0.04) 100%)',
      }}
    >
      <span
        aria-hidden="true"
        className="fdb-urgency-pulse block w-2 h-2 rounded-full bg-bronze-500 mt-1.5 shrink-0"
      />
      <span
        className="font-mono uppercase"
        style={{
          fontSize: '10.5px',
          letterSpacing: '0.06em',
          lineHeight: 1.55,
          color: 'rgba(255,255,255,0.82)',
        }}
      >
        Tabela especial vigente{' '}
        <b
          className="font-semibold text-bronze-300"
          style={{ letterSpacing: '0.06em' }}
        >
          até o encerramento da Aceleradora 2026
        </b>{' '}
        · Condição confirmada pelo curador
      </span>
    </div>
  )
}

function ReasonCard({ pilar, index }: { pilar: Pilar; index: number }) {
  const isLast = index === 2
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, delay: 0.1 * index }}
      className="p-7 md:p-9 border border-bronze-500/30 transition-colors hover:bg-bronze-500/[0.06]"
      style={{ background: 'rgba(20,17,15,0.6)' }}
    >
      <div className="font-mono font-medium uppercase text-bronze-300 text-[10px] md:text-[11px] tracking-[0.32em] mb-6">
        {pilar.n} — {pilar.titulo}
      </div>
      <h3
        className="font-semibold text-selo mb-3.5"
        style={{
          fontSize: 'clamp(19px, 1.8vw, 22px)',
          letterSpacing: '-0.01em',
          lineHeight: 1.2,
        }}
      >
        {pilar.subtitulo}
      </h3>
      <p
        className="text-gray-200"
        style={{ fontSize: 'clamp(14px, 1.2vw, 15px)', lineHeight: 1.65 }}
      >
        {pilar.texto}
      </p>
      {isLast && <UrgencyBadge />}
    </motion.div>
  )
}

export function PorQueAgora() {
  return (
    <section
      id="porque"
      className="relative overflow-hidden border-b border-bronze-500/20 px-[5vw] md:px-[6vw] py-20 md:py-32 lg:py-40"
      style={{
        background:
          'linear-gradient(180deg, #000000, #3D2D11 60%, #000000)',
      }}
    >
      {/* Foto sangrando · zona ampliada (60%) + mask em 7 stops para fade ultra-suave
          até a faixa bronze. Removido o overlay preto que criava linha visível. */}
      <div
        aria-hidden="true"
        className="hidden md:block absolute top-0 left-0 bottom-0 pointer-events-none"
        style={{
          width: '60%',
          backgroundImage: 'url(/volante/volante-3.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'left center',
          maskImage:
            'linear-gradient(270deg, transparent 0%, rgba(0,0,0,0.04) 12%, rgba(0,0,0,0.16) 28%, rgba(0,0,0,0.36) 45%, rgba(0,0,0,0.58) 62%, rgba(0,0,0,0.76) 80%, rgba(0,0,0,0.88) 100%)',
          WebkitMaskImage:
            'linear-gradient(270deg, transparent 0%, rgba(0,0,0,0.04) 12%, rgba(0,0,0,0.16) 28%, rgba(0,0,0,0.36) 45%, rgba(0,0,0,0.58) 62%, rgba(0,0,0,0.76) 80%, rgba(0,0,0,0.88) 100%)',
          filter:
            'brightness(0.55) contrast(1.20) saturate(0.75) sepia(0.05)',
          zIndex: 1,
        }}
      />
      {/* Véu bronze suave no meio · faz a foto "morrer" dentro da cor da seção
          em vez de cair num corte limpo. Tom igual ao bronze-900 do bg. */}
      <div
        aria-hidden="true"
        className="hidden md:block absolute top-0 bottom-0 pointer-events-none z-[2]"
        style={{
          left: '38%',
          width: '34%',
          background:
            'linear-gradient(90deg, transparent 0%, rgba(61,45,17,0.55) 50%, transparent 100%)',
          mixBlendMode: 'soft-light',
        }}
      />

      <div className="relative z-10 max-w-[1320px] mx-auto">
        {/* Head */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="max-w-[1000px] mb-14 md:mb-20"
        >
          <div className="inline-flex items-center gap-3.5 font-mono text-[10px] md:text-[11px] tracking-[0.28em] md:tracking-[0.32em] uppercase text-bronze-300 mb-6">
            <span className="text-bronze-500 text-[8px] leading-none">●</span>
            Por que agora
          </div>
          <h2
            className="text-selo font-medium"
            style={{
              fontSize: 'clamp(34px, 5.5vw, 80px)',
              letterSpacing: '-0.025em',
              lineHeight: 1.02,
            }}
          >
            Acelere o{' '}
            <i className="italic text-bronze-300">progresso genético</i> do seu
            plantel.
          </h2>
        </motion.div>

        {/* Grid 3 cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-9">
          {volante.pilares.map((p, i) => (
            <ReasonCard key={p.n} pilar={p} index={i} />
          ))}
        </div>

        {/* CTA final */}
        <div className="mt-14 md:mt-16 flex justify-center">
          <VolanteCta align="center" sub="Tabela 2026 válida só até o fim da Aceleradora" />
        </div>
      </div>
    </section>
  )
}
