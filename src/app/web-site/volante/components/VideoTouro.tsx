'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export function VideoTouro() {
  return (
    <section
      id="video-touro"
      className="relative border-b border-bronze-500/20 px-[5vw] md:px-[6vw] py-16 md:py-20 lg:pt-20 lg:pb-24"
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, rgba(160,121,46,0.10), transparent 60%), #000000',
      }}
    >
      <div className="max-w-[1320px] mx-auto">
        {/* Kicker */}
        <div className="inline-flex items-center gap-3.5 font-mono text-[10px] md:text-[11px] tracking-[0.28em] md:tracking-[0.32em] uppercase text-bronze-300 mb-6">
          <span className="text-bronze-500 text-[8px] leading-none">●</span>
          Vídeo · Volante MRA
        </div>

        {/* Title */}
        <h2
          className="text-selo font-medium mb-9 max-w-3xl"
          style={{
            fontSize: 'clamp(24px, 4vw, 48px)',
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
          }}
        >
          Veja o touro <i className="italic text-bronze-300">em movimento.</i>
        </h2>

        {/* Video player wrap com cantos decorativos */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="relative max-w-[1080px] mx-auto border border-bronze-500/30 p-2 md:p-3.5"
          style={{
            background:
              'linear-gradient(180deg, rgba(20,17,15,0.6), rgba(10,10,10,0.6))',
          }}
        >
          <video
            controls
            playsInline
            preload="metadata"
            poster="/volante/volante-2.jpg"
            className="w-full h-auto block bg-ink object-cover"
            style={{ aspectRatio: '16 / 9' }}
          >
            <source src="/volante/volante-video.mp4" type="video/mp4" />
            Seu navegador não suporta vídeo HTML5.
          </video>

          {/* 4 cantos bronze */}
          <span
            aria-hidden="true"
            className="absolute top-0 left-0 w-3.5 h-3.5 pointer-events-none border-t border-l border-bronze-500"
          />
          <span
            aria-hidden="true"
            className="absolute top-0 right-0 w-3.5 h-3.5 pointer-events-none border-t border-r border-bronze-500"
          />
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-0 w-3.5 h-3.5 pointer-events-none border-b border-l border-bronze-500"
          />
          <span
            aria-hidden="true"
            className="absolute bottom-0 right-0 w-3.5 h-3.5 pointer-events-none border-b border-r border-bronze-500"
          />
        </motion.div>

        {/* Caption */}
        <p className="mt-4 md:mt-5 text-center font-mono text-[10px] tracking-[0.28em] uppercase text-gray-200">
          Vídeo institucional · Volante MRA · Aceleradora 2026
        </p>

        {/* Post-video CTA */}
        <div className="relative mt-12 md:mt-12 pt-9 md:pt-10 flex flex-col items-center gap-4 md:gap-5 text-center border-t border-bronze-500/20">
          <span
            aria-hidden="true"
            className="absolute -top-px left-1/2 -translate-x-1/2 w-14 h-px bg-bronze-500"
          />
          <p
            className="font-medium italic text-selo max-w-xl"
            style={{
              fontSize: 'clamp(16px, 1.7vw, 22px)',
              letterSpacing: '-0.01em',
              lineHeight: 1.35,
            }}
          >
            Viu o potencial.{' '}
            <b className="not-italic font-medium text-bronze-300">
              Agora garanta as suas doses.
            </b>
          </p>

          <Link
            href="/volante/checkout"
            className="inline-flex items-center justify-center gap-2.5 w-full md:w-auto px-5 md:px-6 py-3.5 text-xs font-bold uppercase tracking-[0.08em] bg-bronze-500 text-nelore border border-bronze-500 hover:bg-bronze-300 hover:border-bronze-300 hover:-translate-y-px transition-all"
          >
            Reservar dose
            <svg viewBox="0 0 14 10" fill="none" className="w-3.5 h-2.5">
              <path
                d="M1 5h12m0 0L9 1m4 4L9 9"
                stroke="currentColor"
                strokeWidth="1.4"
              />
            </svg>
          </Link>

          <p
            className="inline-flex items-center gap-2.5 font-mono uppercase font-medium text-[9.5px] md:text-[10.5px] tracking-[0.20em] md:tracking-[0.24em]"
            style={{ color: 'rgba(255,255,255,0.42)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-bronze-500 inline-block" />
            Pré-reserva gratuita · Sem compromisso
          </p>
        </div>
      </div>
    </section>
  )
}
