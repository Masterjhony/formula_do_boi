'use client'

import { useEffect, useRef, useState } from 'react'
import { volante } from '../volante.data'
import { VolanteCta } from './VolanteCta'

/* ============================================================
 * Pedigree do Volante MRA · espelha 1:1 a seção do Atacante.
 *
 * Para atualizar números/registros dos ancestrais, edite o objeto
 * `tree` abaixo. Onde estiver "—" significa: dado ANCP ainda não
 * foi preenchido (mantém a estrutura visual e fácil de editar).
 * ============================================================ */
const tree = {
  touro: {
    tag: 'Touro',
    nameFirst: 'Volante',
    nameAccent: 'MRA',
    reg: '10701 · 10701-P MRA',
    num: '27,01',
    label: 'MGTe · TOP 6%',
  },
  pai: {
    tag: 'Pai',
    name: 'REM Hermoso FIV GEN.ADT',
    reg: '—',
    num: '—',
    label: 'Linhagem REM',
  },
  mae: {
    tag: 'Mãe',
    name: '9535 FIV MRA',
    reg: '—',
    num: '—',
    label: 'Linhagem MRA · FIV',
  },
  avos: [
    {
      tag: 'Avô paterno',
      side: 'paterno',
      name: 'REM Espião 007',
      reg: '—',
      num: '—',
      label: 'Linhagem REM',
    },
    {
      tag: 'Avó paterna',
      side: 'paterno',
      name: 'REM Votuporanga',
      reg: '—',
      num: '—',
      label: 'Linhagem REM',
    },
    {
      tag: 'Avô materno',
      side: 'materno',
      name: 'REM Embaixador',
      reg: '—',
      num: '—',
      label: 'Linhagem REM',
    },
    {
      tag: 'Avó materna',
      side: 'materno',
      name: 'Acilda MRA',
      reg: '—',
      num: '—',
      label: 'Linhagem MRA',
    },
  ],
}

const kpis = [
  { num: '3', cents: null, label: 'Sumários nacionais validados' },
  { num: '5', cents: '/8', label: 'DEPs em faixa Elite (TOP 1% ou superior)' },
  { num: '3', cents: null, label: 'Gerações de seleção genômica' },
]

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
      <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M12 12v6m-3-3 3 3 3-3" />
    </svg>
  )
}

export function Pedigree() {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  // Trigger `.in` quando a seção entra na viewport · 18% threshold, com leve undershoot
  useEffect(() => {
    if (!ref.current) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true)
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.18, rootMargin: '0px 0px -10% 0px' }
    )
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])

  return (
    <section
      id="linhagem"
      className="relative border-b border-bronze-500/20 px-[5vw] md:px-[6vw] py-20 md:py-32 lg:py-40"
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, rgba(160,121,46,0.06), transparent 50%), #000000',
      }}
    >
      <div className="max-w-[1320px] mx-auto">
        {/* Header */}
        <div className="inline-flex items-center gap-3.5 font-mono text-[10px] md:text-[11px] tracking-[0.28em] md:tracking-[0.32em] uppercase text-bronze-300 mb-6">
          <span className="text-bronze-500 text-[8px] leading-none">●</span>
          Linhagem · Pedigree
        </div>
        <h2
          className="text-selo font-medium max-w-3xl"
          style={{
            fontSize: 'clamp(34px, 5.5vw, 80px)',
            letterSpacing: '-0.025em',
            lineHeight: 1,
          }}
        >
          Construído sobre{' '}
          <i className="italic text-bronze-300">sangue selecionado.</i>
        </h2>
        <p
          className="mt-4 text-gray-200 max-w-2xl"
          style={{ fontSize: '16px', lineHeight: 1.65 }}
        >
          Três gerações de matrizes e touros de elite. Linhagem{' '}
          <b className="text-bronze-300 font-medium">REM</b> consolidada no
          lado paterno,{' '}
          <b className="text-bronze-300 font-medium">MRA</b> no materno.
        </p>

        {/* PEDIGREE CINEMA MODE */}
        <div
          ref={ref}
          className={['pedi-cinema', inView ? 'in' : ''].join(' ')}
          data-pedigree=""
        >
          {/* TOURO · geração 0 */}
          <div className="pedi-cin-row pedi-row-touro">
            <article className="pedi-cin-card touro" data-side="touro">
              <div className="pedi-cin-tag">{tree.touro.tag}</div>
              <div className="pedi-cin-name">
                {tree.touro.nameFirst}{' '}
                <span className="pedi-accent">{tree.touro.nameAccent}</span>
              </div>
              <div className="pedi-cin-reg">{tree.touro.reg}</div>
              <div className="pedi-cin-metric">
                <div className="pedi-cin-metric-num">{tree.touro.num}</div>
                <div className="pedi-cin-metric-label">{tree.touro.label}</div>
              </div>
            </article>
          </div>

          {/* CONECTOR Touro → Pais */}
          <svg
            className="pedi-cin-svg pedi-cin-svg-1"
            viewBox="0 0 1000 80"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path className="cin-line" d="M500,0 V40 H180 V80" />
            <path className="cin-line" d="M500,0 V40 H820 V80" />
          </svg>

          {/* PAIS · geração 1 */}
          <div className="pedi-cin-row pedi-row-pais">
            <article
              className="pedi-cin-card pai"
              data-side="paterno"
              data-gen="1"
            >
              <div className="pedi-cin-tag">{tree.pai.tag}</div>
              <div className="pedi-cin-name">{tree.pai.name}</div>
              <div className="pedi-cin-reg">{tree.pai.reg}</div>
              <div className="pedi-cin-metric">
                <div className="pedi-cin-metric-num">{tree.pai.num}</div>
                <div className="pedi-cin-metric-label">{tree.pai.label}</div>
              </div>
            </article>
            <article
              className="pedi-cin-card mae"
              data-side="materno"
              data-gen="1"
            >
              <div className="pedi-cin-tag">{tree.mae.tag}</div>
              <div className="pedi-cin-name">{tree.mae.name}</div>
              <div className="pedi-cin-reg">{tree.mae.reg}</div>
              <div className="pedi-cin-metric">
                <div className="pedi-cin-metric-num">{tree.mae.num}</div>
                <div className="pedi-cin-metric-label">{tree.mae.label}</div>
              </div>
            </article>
          </div>

          {/* CONECTOR Pais → Avós */}
          <svg
            className="pedi-cin-svg pedi-cin-svg-2"
            viewBox="0 0 1000 80"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path className="cin-line" d="M180,0 V40 H80 V80" />
            <path className="cin-line" d="M180,0 V40 H300 V80" />
            <path className="cin-line" d="M820,0 V40 H700 V80" />
            <path className="cin-line" d="M820,0 V40 H920 V80" />
          </svg>

          {/* AVÓS · geração 2 */}
          <div className="pedi-cin-row pedi-row-avos">
            {tree.avos.map((a, i) => (
              <article
                key={i}
                className="pedi-cin-card avo"
                data-side={a.side}
                data-gen="2"
              >
                <div className="pedi-cin-tag">{a.tag}</div>
                <div className="pedi-cin-name">{a.name}</div>
                <div className="pedi-cin-reg">{a.reg}</div>
                <div className="pedi-cin-metric">
                  <div className="pedi-cin-metric-num">{a.num}</div>
                  <div className="pedi-cin-metric-label">{a.label}</div>
                </div>
              </article>
            ))}
          </div>

          {/* KPIs · 3 cells */}
          <div className="pedi-cin-kpis">
            {kpis.map((k, i) => (
              <div key={i} className="pedi-cin-kpi">
                <div className="pedi-cin-kpi-num">
                  {k.num}
                  {k.cents && <span className="cents">{k.cents}</span>}
                </div>
                <div className="pedi-cin-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Downloads · 3 PDFs oficiais */}
        <div className="fdb-downloads">
          <div className="fdb-downloads-head">
            Avaliações genéticas oficiais · Download
          </div>
          <div className="fdb-downloads-grid">
            {volante.downloads.map((d) => (
              <a
                key={d.titulo}
                href={d.url}
                target="_blank"
                rel="noreferrer"
                className="fdb-download-card"
              >
                <DownloadIcon />
                <div className="min-w-0">
                  <div className="fdb-download-label">{d.titulo}</div>
                  <div className="fdb-download-name">{d.destaque}</div>
                  <div className="fdb-download-meta">{d.meta}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* M08 · CTA pós-pedigree */}
        <div className="fdb-pedigree-cta-block">
          <div className="fdb-pedigree-cta-divider" />
          <p className="fdb-pedigree-cta-headline">
            Genética <i>validada.</i> Reserve as suas doses.
          </p>
          <VolanteCta align="center" sub="Pré-reserva gratuita · Frete grátis a partir de 100 doses" />
        </div>
      </div>
    </section>
  )
}
