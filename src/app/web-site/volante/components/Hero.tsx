'use client'

import { motion } from 'framer-motion'
import { volante } from '../volante.data'
import { VolanteCta } from './VolanteCta'

export function Hero() {
  const ladder = volante.tabela
  const bestRow = ladder[ladder.length - 1]
  const menorPreco = bestRow.preco.replace('R$ ', '')

  const ix = Object.fromEntries(volante.indices.map((i) => [i.sigla, i.valor]))

  return (
    <section
      id="topo"
      className="relative w-full overflow-hidden border-b border-bronze-500/20 flex items-end"
      style={{ minHeight: '620px', height: '100svh' }}
    >
      {/* Mídia de fundo · vídeo no desktop, foto no mobile */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0 hidden md:block pointer-events-none select-none"
        style={{ filter: 'brightness(0.9) contrast(1.05) saturate(0.95) sepia(0.03)' }}
        src="/volante/volante-hero.mp4"
        poster={volante.fotoHero}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        disablePictureInPicture
        tabIndex={-1}
        aria-hidden="true"
      />
      <img
        src={volante.fotoHero}
        alt={`${volante.nome} — ${volante.registro}`}
        className="absolute inset-0 w-full h-full object-cover z-0 md:hidden"
        style={{
          objectPosition: 'center 35%',
          filter: 'brightness(0.9) contrast(1.05) saturate(0.95) sepia(0.03)',
        }}
      />

      {/* Overlay institucional · clareado pra preservar a silhueta do cupim no Nelore preto.
          Topo: fade leve pra eyebrow. Meio: limpo (cupim visível). Base: rampa pra legibilidade do bloco de texto. */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.05) 18%, rgba(0,0,0,0.12) 42%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.80) 80%, rgba(0,0,0,0.96) 100%), radial-gradient(ellipse at 28% 60%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.34) 90%)',
        }}
      />

      {/* Grain overlay (Brandbook §08) */}
      <div
        className="absolute inset-0 z-20 pointer-events-none opacity-25 mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='1'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.06 0'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>\")",
          backgroundSize: '200px 200px',
        }}
      />

      {/* Rails verticais (desktop) */}
      <div
        className="hidden lg:block absolute top-0 bottom-0 left-9 w-px z-20 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, transparent, rgba(160,121,46,0.32), transparent)' }}
      />
      <div
        className="hidden lg:block absolute top-0 bottom-0 right-9 w-px z-20 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, transparent, rgba(160,121,46,0.32), transparent)' }}
      />

      {/* V-labels rotacionados (desktop) */}
      <div
        className="hidden lg:block absolute z-20 font-mono text-[10px] tracking-[0.4em] uppercase whitespace-nowrap text-bronze-500 pointer-events-none"
        style={{
          top: '50%',
          left: '18px',
          transform: 'translateY(-50%) rotate(-90deg)',
          transformOrigin: 'left center',
        }}
      >
        {volante.registro} · CENTRAL BELA VISTA · NASC. {volante.nascimento}
      </div>
      <div
        className="hidden lg:block absolute z-20 font-mono text-[10px] tracking-[0.4em] uppercase whitespace-nowrap text-bronze-500 pointer-events-none"
        style={{
          top: '50%',
          right: '18px',
          transform: 'translateY(-50%) rotate(90deg)',
          transformOrigin: 'right center',
        }}
      >
        MGTE {ix.MGTe} · TOP 6% · ELITE ACAB · STAY · PES
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-30 w-full max-w-[1480px] mx-auto px-[6vw] pb-14 md:pb-20 lg:pb-24 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-3.5 font-mono text-[10px] md:text-xs tracking-[0.28em] md:tracking-[0.36em] uppercase text-bronze-300 mb-4">
            <span className="block w-7 md:w-12 h-px bg-bronze-500" />
            ● {volante.edicao}
          </div>

          {/* Tagline italic */}
          <div
            className="font-medium italic text-bronze-300 mb-4 md:mb-5"
            style={{ fontSize: 'clamp(18px, 1.8vw, 22px)', letterSpacing: '-0.005em' }}
          >
            Genética de elite.{' '}
            <span className="text-gray-200 not-italic">Precisão de dados.</span>
          </div>

          {/* H1 stacked */}
          <h1
            className="text-selo font-medium"
            style={{
              fontSize: 'clamp(56px, 11vw, 168px)',
              letterSpacing: '-0.03em',
              lineHeight: 0.9,
              marginBottom: 28,
              textShadow: '0 8px 40px rgba(0,0,0,0.6)',
            }}
          >
            <span className="block">Volante</span>
            <span className="block text-bronze-300">MRA.</span>
          </h1>

          {/* Hero foot · lede */}
          <div className="mt-7">
            <p
              className="text-gray-100 max-w-xl"
              style={{ fontSize: 'clamp(15px, 1.4vw, 19px)', lineHeight: 1.55 }}
            >
              Touro Nelore PO{' '}
              <b className="text-bronze-300 font-medium">superprecoce</b>. MGTe{' '}
              {ix.MGTe} · iABCZ {ix.iABCZ} · IQG {ix.IQG} —{' '}
              <b className="text-bronze-300 font-medium">elite em Peso, ACAB e STAY</b>.
            </p>
          </div>

          {/* M01 · Hero price hint */}
          <div
            className="flex flex-wrap items-center gap-x-3.5 gap-y-2 mt-5 font-mono uppercase font-medium"
            style={{
              fontSize: '10.5px',
              letterSpacing: '0.14em',
              color: 'rgba(232,203,133,0.82)',
            }}
          >
            <span className="hidden md:inline-block w-[18px] h-px bg-bronze-700" />
            <span>
              Doses a partir de{' '}
              <b className="text-bronze-300 font-semibold">R$&nbsp;{menorPreco}</b>
            </span>
            <span className="text-bronze-700">·</span>
            <span className="text-bronze-300">Frete grátis a partir de 100 doses</span>
            <span className="text-bronze-700">·</span>
            <span>Sem compromisso na pré-reserva</span>
          </div>

          {/* M01 · Hero price ladder */}
          <div
            className="relative mt-5 w-full max-w-full md:max-w-[420px] border border-bronze-500/40"
            style={{
              background:
                'linear-gradient(135deg, rgba(160,121,46,0.16), rgba(10,10,10,0.82))',
              backdropFilter: 'blur(3px)',
              WebkitBackdropFilter: 'blur(3px)',
            }}
            aria-label="Tabela de preços por volume"
          >
            <span className="absolute -top-2.5 left-3 px-2.5 py-0.5 bg-nelore font-mono text-[8.5px] md:text-[9px] tracking-[0.22em] md:tracking-[0.28em] uppercase text-bronze-300 font-semibold">
              Tabela Aceleradora 2026
            </span>
            {ladder.map((row, idx) => {
              const isBest = idx === ladder.length - 1
              const isFirst = idx === 0
              const isLast = idx === ladder.length - 1
              return (
                <div
                  key={row.faixa}
                  className={[
                    'flex justify-between items-baseline gap-4 px-3.5 md:px-4 py-2 md:py-2.5 font-mono',
                    !isLast ? 'border-b border-dashed border-bronze-500/20' : '',
                    isFirst ? 'pt-3.5' : '',
                    isLast ? 'pb-3.5 border-t border-bronze-700' : '',
                  ].join(' ')}
                  style={
                    isBest
                      ? {
                          background:
                            'linear-gradient(90deg, rgba(160,121,46,0.18) 0%, rgba(160,121,46,0.02) 100%)',
                        }
                      : {}
                  }
                >
                  <span
                    className={[
                      'uppercase font-medium tracking-[0.12em] md:tracking-[0.14em] text-[9.5px] md:text-[10.5px]',
                      isBest ? 'text-bronze-300' : '',
                    ].join(' ')}
                    style={!isBest ? { color: 'rgba(232,203,133,0.78)' } : {}}
                  >
                    {row.volume}
                  </span>
                  <span
                    className={[
                      'font-bold tracking-wide text-[13px] md:text-sm',
                      isBest ? 'text-bronze-300' : 'text-selo',
                    ].join(' ')}
                  >
                    {row.preco.replace('R$ ', 'R$ ')}
                  </span>
                </div>
              )
            })}
          </div>

          {/* CTA principal · abaixo da tabela (briefing), animado e chamativo */}
          <div className="mt-6">
            <VolanteCta sub="Pré-reserva gratuita · Curador confirma em até 24h" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
