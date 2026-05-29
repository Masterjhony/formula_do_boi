'use client'

import { motion } from 'framer-motion'

// Stats topo · MGTe + 2x2 (Peso · ACAB · AOL · STAY) ─ números reais do Volante MRA
const indiceGeral = {
  label: 'MGTe · Índice Geral',
  num: '27,01',
  sub: 'TOP 6%',
}

const stat2x2 = [
  { label: 'Peso · PE365g', num: '+1.635', sub: 'Elite · TOP 0,1%' },
  { label: 'ACAB · Acabamento', num: '+5,128', sub: 'Elite · TOP 0,1%' },
  { label: 'AOL · Área Olho Lombo', num: '+1,675', sub: 'Superior · TOP 17%' },
  { label: 'STAYg · Permanência', num: '+56,65%', sub: 'Elite · TOP 1%' },
]

// DEPs detail · 8 linhas (Cresc., Carcaça, Maternal, Reprod.) com largura de barra refletindo tier
const deps = [
  { code: 'PE365g',  val: '+1.635',  tier: 'Elite',    elite: true,  width: 96 },
  { code: 'PD210g',  val: '+10,83',  tier: 'Superior', elite: false, width: 80 },
  { code: 'DP210',   val: '+16,17',  tier: 'Superior', elite: false, width: 78 },
  { code: 'DP450',   val: '+30,76',  tier: 'Superior', elite: false, width: 80 },
  { code: 'AOL',     val: '+1,675',  tier: 'Superior', elite: false, width: 70 },
  { code: 'ACAB',    val: '+5,128',  tier: 'Elite',    elite: true,  width: 96 },
  { code: 'STAYg',   val: '+56,65%', tier: 'Elite',    elite: true,  width: 92 },
  { code: 'PES',     val: '+2,79',   tier: 'Elite',    elite: true,  width: 95 },
]

function StatHero() {
  return (
    <div
      className="border-b lg:border-b-0 lg:border-r border-bronze-500/30 flex flex-col justify-between gap-7 px-7 md:px-9 py-10 md:py-11 min-h-[220px] md:min-h-[280px]"
      style={{
        background:
          'linear-gradient(135deg, rgba(160,121,46,0.10), transparent)',
      }}
    >
      <div className="font-mono text-[10px] md:text-[11px] tracking-[0.24em] uppercase text-bronze-300 font-semibold">
        {indiceGeral.label}
      </div>
      <div>
        <div
          className="font-medium text-bronze-500 leading-none"
          style={{
            fontSize: 'clamp(56px, 9vw, 132px)',
            letterSpacing: '-0.02em',
          }}
        >
          {indiceGeral.num}
        </div>
        <div className="font-mono text-[11px] md:text-xs tracking-[0.22em] uppercase text-bronze-300 mt-3.5 font-semibold">
          {indiceGeral.sub}
        </div>
      </div>
    </div>
  )
}

function StatGrid() {
  return (
    <div
      className="border border-bronze-500/30 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr]"
      style={{ background: 'rgba(0,0,0,0.4)' }}
    >
      <StatHero />
      <div className="grid grid-cols-2">
        {stat2x2.map((s, idx) => (
          <div
            key={s.label}
            className={[
              'flex flex-col justify-between gap-3 px-4 md:px-6 py-5 md:py-6 min-h-[110px] md:min-h-[140px]',
              // border-right entre coluna 0 e 1
              idx % 2 === 0 ? 'border-r border-bronze-500/30' : '',
              // border-bottom entre linha 0 e 1
              idx < 2 ? 'border-b border-bronze-500/30' : '',
            ].join(' ')}
          >
            <div className="font-mono text-[9px] md:text-[10px] tracking-[0.24em] uppercase text-gray-200 font-medium">
              {s.label}
            </div>
            <div>
              <div
                className="font-medium text-selo"
                style={{
                  fontSize: 'clamp(22px, 3vw, 40px)',
                  letterSpacing: '-0.01em',
                  lineHeight: 1,
                }}
              >
                {s.num}
              </div>
              <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-bronze-300 mt-1.5 font-semibold">
                {s.sub}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

type DepRowProps = {
  code: string
  val: string
  tier: string
  elite: boolean
  width: number
  last?: boolean
}

function DepRow({ code, val, tier, elite, width, last }: DepRowProps) {
  return (
    <div
      className={[
        'grid items-center gap-3 md:gap-4 py-3.5 md:py-5',
        last ? '' : 'border-b border-bronze-500/18',
      ].join(' ')}
      style={{
        gridTemplateColumns: 'minmax(0,110px) 1fr minmax(0,70px) minmax(0,90px)',
      }}
    >
      <div className="font-mono font-semibold text-[11px] md:text-[13px] tracking-[0.16em] md:tracking-[0.18em] uppercase text-selo truncate">
        {code}
      </div>
      <div
        className="relative h-1.5"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <div
          className="absolute inset-y-0 left-0"
          style={{
            width: `${width}%`,
            background: elite
              ? 'linear-gradient(90deg, #A0792E, #E8CB85)'
              : 'linear-gradient(90deg, #6B4F1E, #D4A85C)',
          }}
        />
      </div>
      <div className="font-mono font-bold text-sm md:text-lg text-selo text-right">
        {val}
      </div>
      <div
        className={[
          'font-mono text-[9px] md:text-[10px] tracking-[0.16em] md:tracking-[0.18em] uppercase text-right',
          elite ? 'text-bronze-300' : 'text-gray-200',
        ].join(' ')}
      >
        {tier}
      </div>
    </div>
  )
}

export function Aval() {
  return (
    <section
      id="genetica"
      className="relative overflow-hidden border-b border-bronze-500/20 px-[5vw] md:px-[6vw] py-20 md:py-32 lg:py-40"
      style={{
        background:
          'linear-gradient(180deg, #000000, #3D2D11 30%, #3D2D11 70%, #000000)',
      }}
    >
      <div className="max-w-[1320px] mx-auto">
        {/* Aval head */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-14 md:mb-20"
        >
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-3.5 font-mono text-[10px] md:text-[11px] tracking-[0.28em] md:tracking-[0.32em] uppercase text-bronze-300 mb-6">
              <span className="text-bronze-500 text-[8px] leading-none">●</span>
              Avaliação Genética · ANCP · 2026
            </div>
            <h2
              className="text-selo font-medium"
              style={{
                fontSize: 'clamp(34px, 5.5vw, 80px)',
                letterSpacing: '-0.025em',
                lineHeight: 1.02,
              }}
            >
              Direcionado para{' '}
              <i className="italic text-bronze-300">crescimento</i> e carcaça.
            </h2>
          </div>

          <div
            className="font-mono text-[10px] md:text-[11px] tracking-[0.18em] uppercase text-gray-200 leading-loose text-left lg:text-right"
            style={{ lineHeight: 1.8 }}
          >
            Fonte ANCP
            <br />
            <b className="font-medium text-bronze-300">MRA · Botucatu/SP</b>
            <br />
            Avaliação 2026
            <br />
            Sumários · PMGZ · GenePlus · ANCP
          </div>
        </motion.div>

        {/* Stat grid */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <StatGrid />
        </motion.div>

        {/* DEPs detail · 2 colunas no desktop, 1 no mobile */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-14 md:mt-20 grid grid-cols-1 lg:grid-cols-2 gap-x-12 lg:gap-x-20"
        >
          {deps.map((d, i) => (
            <DepRow
              key={d.code}
              {...d}
              // última linha de cada coluna sem border-bottom
              last={i === deps.length - 1 || i === deps.length - 2}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
