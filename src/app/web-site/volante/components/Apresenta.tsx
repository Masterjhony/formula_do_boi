'use client'

import { motion } from 'framer-motion'
import { volante } from '../volante.data'

type Indice = { sigla: string; valor: string; top: string; sumario: string }

// Trio MGTe / iABCZ / IQG — puxado de volante.indices (sigla, valor, top, sumario)
function TrioIndices({ indices }: { indices: Indice[] }) {
  return (
    <div
      className="mt-9 grid grid-cols-1 md:grid-cols-3 border border-bronze-500/30"
      style={{
        background:
          'linear-gradient(135deg, rgba(160,121,46,0.08), rgba(20,17,15,0.4))',
      }}
    >
      {indices.map((i, idx) => (
        <div
          key={i.sigla}
          className={[
            'flex flex-row md:flex-col items-center md:items-start justify-between md:justify-start gap-3 md:gap-2.5 px-5 md:px-4 py-4 md:py-5',
            idx < indices.length - 1
              ? 'border-b md:border-b-0 md:border-r border-bronze-500/30'
              : '',
          ].join(' ')}
        >
          <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-bronze-300 font-semibold">
            {i.sigla}
          </div>
          <div
            className="font-medium text-bronze-500 leading-none"
            style={{
              fontSize: 'clamp(32px, 4vw, 56px)',
              letterSpacing: '-0.02em',
            }}
          >
            {i.valor}
          </div>
          <div className="font-mono text-[9px] tracking-[0.18em] uppercase text-gray-200 font-medium hidden md:block">
            {i.top} · {i.sumario.split('·')[0].trim()}
          </div>
        </div>
      ))}
    </div>
  )
}

// 4 cantos decorativos bronze
function Corners() {
  return (
    <>
      <span
        aria-hidden="true"
        className="absolute top-2.5 left-2.5 w-4 h-4 border-t border-l border-bronze-500 pointer-events-none"
      />
      <span
        aria-hidden="true"
        className="absolute top-2.5 right-2.5 w-4 h-4 border-t border-r border-bronze-500 pointer-events-none"
      />
      <span
        aria-hidden="true"
        className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b border-l border-bronze-500 pointer-events-none"
      />
      <span
        aria-hidden="true"
        className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b border-r border-bronze-500 pointer-events-none"
      />
    </>
  )
}

export function Apresenta() {
  // Linhas do id-card: rótulo · valor · cor opcional
  const idRows: { label: string; value: string; accent?: boolean }[] = [
    { label: 'Matrícula', value: volante.registro },
    { label: 'Raça', value: volante.raca },
    { label: 'Nascimento', value: `${volante.nascimento.replaceAll(' ', '')} · ${volante.idade}` },
    {
      label: 'Disponibilidade',
      value: volante.disponibilidade,
      accent: true,
    },
    { label: 'Criador', value: volante.criador },
    { label: 'Proprietário', value: volante.proprietario },
    { label: 'Local', value: volante.local },
    { label: 'Peso · CE', value: `${volante.pesoAtual} · ${volante.circEscrotal} CE` },
    { label: 'Precocidade', value: volante.precocidade },
    { label: 'Sêmen', value: volante.semen },
    { label: 'Situação', value: volante.situacao, accent: true },
  ]

  return (
    <section
      id="touro"
      className="bg-nelore border-b border-bronze-500/20 px-[5vw] md:px-[6vw] py-20 md:py-32 lg:py-40"
    >
      <div className="max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-start">
        {/* Coluna esquerda · headline + lede + trio */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
        >
          {/* Kicker */}
          <div className="inline-flex items-center gap-3.5 font-mono text-[10px] md:text-[11px] tracking-[0.28em] md:tracking-[0.32em] uppercase text-bronze-300 mb-6">
            <span className="text-bronze-500 text-[8px] leading-none">●</span>
            O Touro
          </div>

          {/* H2 */}
          <h2
            className="text-selo font-medium"
            style={{
              fontSize: 'clamp(40px, 6vw, 88px)',
              letterSpacing: '-0.025em',
              lineHeight: 1,
              marginBottom: 22,
            }}
          >
            Volante <i className="italic text-bronze-300">MRA.</i>
          </h2>

          {/* Lede */}
          <p
            className="text-gray-200 max-w-md"
            style={{ fontSize: 'clamp(15px, 1.3vw, 16px)', lineHeight: 1.65 }}
          >
            {volante.registro} · Superprecoce. Resultado direto no campo, na balança e no bolso.
          </p>

          {/* Trio de índices */}
          <TrioIndices indices={volante.indices} />
        </motion.div>

        {/* Coluna direita · foto + ficha */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          {/* Foto com cantos e caption */}
          <div
            className="relative overflow-hidden border border-bronze-500/30"
            style={{
              aspectRatio: '4 / 5',
              backgroundImage: 'url(/volante/volante-pagina4.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter:
                'brightness(0.92) contrast(1.30) saturate(0.85) sepia(0.06)',
            }}
          >
            <Corners />

            {/* Caption flutuante */}
            <div
              className="absolute left-3 right-3 md:left-4 md:right-4 bottom-3 md:bottom-4 flex items-center justify-between gap-3 px-4 md:px-5 py-3 md:py-4 border border-bronze-500/30"
              style={{
                background:
                  'linear-gradient(180deg, rgba(0,0,0,0.4), rgba(0,0,0,0.85))',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              <div>
                <div className="font-mono text-[9px] md:text-[10px] tracking-[0.22em] uppercase text-bronze-300 mb-1">
                  Foto · Volante MRA
                </div>
                <div className="font-medium italic text-selo text-base md:text-lg">
                  Volante MRA
                </div>
              </div>
              <div className="font-mono text-[10px] md:text-[11px] tracking-[0.24em] uppercase text-bronze-300">
                Bela Vista
              </div>
            </div>
          </div>

          {/* Ficha técnica */}
          <div
            className="border border-bronze-500/30 border-t-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(20,17,15,0.6), rgba(10,10,10,0.6))',
            }}
          >
            {idRows.map((row, i) => (
              <div
                key={row.label}
                className={[
                  'grid grid-cols-1 md:grid-cols-[160px_1fr] gap-1 md:gap-6 items-baseline md:items-center px-5 md:px-6 py-3 md:py-4',
                  i < idRows.length - 1
                    ? 'border-b border-dashed border-bronze-500/20'
                    : '',
                ].join(' ')}
              >
                <div className="font-mono text-[9px] md:text-[10px] tracking-[0.24em] uppercase text-bronze-300 font-medium">
                  {row.label}
                </div>
                <div
                  className={[
                    'font-mono text-[13px] md:text-sm tracking-[0.04em]',
                    row.accent ? 'text-bronze-300' : 'text-selo',
                  ].join(' ')}
                >
                  {row.value}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
