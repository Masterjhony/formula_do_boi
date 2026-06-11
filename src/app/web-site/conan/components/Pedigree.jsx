'use client'

import { useEffect, useRef } from 'react'
import { getCheckoutUrl } from '../utils/checkoutUrl'

const DATA = {
  touro: {
    nomeBase:    'CONAN FIV',
    nomeAcento:  'TRESMAR',
    registro:    'LCF 1265 · Nelore TresMar · 20 meses',
    metricNum:   '35,12',
    metricLabel: 'MGTe · TOP 0,1% ANCP',
  },
  pai: {
    nome:        'REM CH LÍDER GEN.ADT',
    registro:    'REM GLADIADOR / REMP513H',
    metricNum:   '—',
    metricLabel: 'Linhagem REM · Avaliado',
  },
  mae: {
    nome:        '8830P FIV JMP',
    registro:    'ESPARTANO MAT. / 4828S FIV JMP',
    metricNum:   '—',
    metricLabel: 'Linhagem JMP · FIV',
  },
  avos: [
    { role: 'Avô paterno', nome: 'REM GLADIADOR GEN.ADT', registro: 'REM',  metricNum: '—', metricLabel: 'Linhagem REM',  side: 'paterno' },
    { role: 'Avó paterna', nome: 'REMP513H',               registro: 'REMP', metricNum: '—', metricLabel: 'Linhagem REM',  side: 'paterno' },
    { role: 'Avô materno', nome: 'ESPARTANO MAT.',          registro: 'MAT.', metricNum: '—', metricLabel: 'Linhagem MAT.', side: 'materno' },
    { role: 'Avó materna', nome: '4828S FIV JMP',           registro: 'JMP',  metricNum: '—', metricLabel: 'Linhagem JMP',  side: 'materno' },
  ],
  kpis: [
    { num: 'TOP 0,1%', sup: null, label: 'MGTe ANCP — ranking genômico' },
    { num: 'DECA 1',   sup: null, label: 'PMGZ — categoria elite' },
    { num: '3',        sup: null, label: 'Sumários nacionais validados' },
  ],
}

export default function Pedigree() {
  const cinemaRef = useRef(null)
  const checkoutUrl = getCheckoutUrl()

  useEffect(() => {
    const el = cinemaRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in')
          obs.disconnect()
        }
      },
      { threshold: 0, rootMargin: '0px 0px -80px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section className="pedigree-section" id="linhagem">
      <div className="pedigree-section__inner">
        <div className="section-label" style={{ marginBottom: '16px' }}>Linhagem · Pedigree</div>
        <h2 className="pedigree-section__title">Construído sobre <i>sangue selecionado.</i></h2>
        <p className="pedigree-section__subtitle">Três gerações de matrizes e touros de elite. Avaliação genômica confirmada.</p>

        <div className="pedi-cinema" ref={cinemaRef}>

          {/* ── LINHA 1: TOURO ── */}
          <div className="pedi-cin-row pedi-row-touro">
            <article className="pedi-cin-card touro" data-side="touro">
              <div className="pedi-cin-tag">Touro</div>
              <div className="pedi-cin-name">
                {DATA.touro.nomeBase} <span className="pedi-accent">{DATA.touro.nomeAcento}</span>
              </div>
              <div className="pedi-cin-reg">{DATA.touro.registro}</div>
              <div className="pedi-cin-metric">
                <div className="pedi-cin-metric-num">{DATA.touro.metricNum}</div>
                <div className="pedi-cin-metric-label">{DATA.touro.metricLabel}</div>
              </div>
            </article>
          </div>

          {/* ── SVG 1: Touro → Pais ── */}
          <svg className="pedi-cin-svg pedi-cin-svg-1" viewBox="0 0 1000 80" preserveAspectRatio="none" aria-hidden="true">
            <path className="cin-line" d="M500,0 V40 H180 V80" />
            <path className="cin-line" d="M500,0 V40 H820 V80" />
          </svg>

          {/* ── LINHA 2: PAI + MÃE ── */}
          <div className="pedi-cin-row pedi-row-pais">
            <article className="pedi-cin-card pai" data-side="paterno" data-gen="1">
              <div className="pedi-cin-tag">Pai</div>
              <div className="pedi-cin-name">{DATA.pai.nome}</div>
              <div className="pedi-cin-reg">{DATA.pai.registro}</div>
              <div className="pedi-cin-metric">
                <div className="pedi-cin-metric-num">{DATA.pai.metricNum}</div>
                <div className="pedi-cin-metric-label">{DATA.pai.metricLabel}</div>
              </div>
            </article>
            <article className="pedi-cin-card mae" data-side="materno" data-gen="1">
              <div className="pedi-cin-tag">Mãe</div>
              <div className="pedi-cin-name">{DATA.mae.nome}</div>
              <div className="pedi-cin-reg">{DATA.mae.registro}</div>
              <div className="pedi-cin-metric">
                <div className="pedi-cin-metric-num">{DATA.mae.metricNum}</div>
                <div className="pedi-cin-metric-label">{DATA.mae.metricLabel}</div>
              </div>
            </article>
          </div>

          {/* ── SVG 2: Pais → Avós ── */}
          <svg className="pedi-cin-svg pedi-cin-svg-2" viewBox="0 0 1000 80" preserveAspectRatio="none" aria-hidden="true">
            <path className="cin-line" d="M180,0 V40 H90 V80" />
            <path className="cin-line" d="M180,0 V40 H280 V80" />
            <path className="cin-line" d="M820,0 V40 H720 V80" />
            <path className="cin-line" d="M820,0 V40 H910 V80" />
          </svg>

          {/* ── LINHA 3: AVÓS ── */}
          <div className="pedi-cin-row pedi-row-avos">
            {DATA.avos.map((a, i) => (
              <article key={i} className="pedi-cin-card avo" data-side={a.side} data-gen="2">
                <div className="pedi-cin-tag">{a.role}</div>
                <div className="pedi-cin-name">{a.nome}</div>
                <div className="pedi-cin-reg">{a.registro}</div>
                <div className="pedi-cin-metric">
                  <div className="pedi-cin-metric-num">{a.metricNum}</div>
                  <div className="pedi-cin-metric-label">{a.metricLabel}</div>
                </div>
              </article>
            ))}
          </div>

          {/* ── KPIs ── */}
          <div className="pedi-cin-kpis">
            {DATA.kpis.map((k, i) => (
              <div key={i} className="pedi-cin-kpi">
                <div className="pedi-cin-kpi-num">
                  {k.num}{k.sup && <span className="cents">{k.sup}</span>}
                </div>
                <div className="pedi-cin-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>

          {/* ── CTA BLOCK ── */}
          <div className="pedi-cin-cta-block">
            <div className="pedi-cin-cta-divider" />
            <p className="pedi-cin-cta-headline">Genética <i>validada.</i> Reserve as suas doses.</p>
            <a href={checkoutUrl} className="btn-primary fdb-cta-anim">
              RESERVAR DOSE →
            </a>
          </div>

        </div>
      </div>
    </section>
  )
}