'use client'

import { useEffect, useRef } from 'react'
import { getCheckoutUrl } from '../utils/checkoutUrl'

const HERO = { label: 'MGTe · Índice Geral', numero: '35,12', rank: 'TOP 0,1%' }

const DESTAQUES = [
  { label: 'DAOL · ANCP',    valor: '+7,67',  sub: 'Elite · TOP 0,1%' },
  { label: 'TMM · GENEPLUS', valor: '+6,84',  sub: 'Elite · TOP 1%' },
  { label: 'DP450 · ANCP',   valor: '+33,24', sub: 'Superior · TOP 3%' },
  { label: 'PS-ED · PMGZ',   valor: '+30,59', sub: 'Elite · DECA 1' },
]

const BARS = [
  { name: 'DAOL',   valor: '+7,67',  pct: 76.7, elite: true,  rank: 'Elite' },
  { name: 'DSTAY',  valor: '+90,46', pct: 90.5, elite: false, rank: 'Superior' },
  { name: 'DP450',  valor: '+33,24', pct: 66.5, elite: false, rank: 'Superior' },
  { name: 'D3P',    valor: '+89,34', pct: 89.3, elite: false, rank: 'Superior' },
  { name: 'DP365',  valor: '+31,03', pct: 62.1, elite: false, rank: 'Superior' },
  { name: 'MP120',  valor: '+4,37',  pct: 54.6, elite: false, rank: 'Superior' },
  { name: 'DPE365', valor: '+1,61',  pct: 53.7, elite: false, rank: 'Superior' },
  { name: 'DACAB',  valor: '+0,59',  pct: 39.3, elite: false, rank: 'Superior' },
]

export default function AvaliacaoGenetica() {
  const sectionRef = useRef(null)
  const checkoutUrl = getCheckoutUrl()

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        el.querySelectorAll('.aval-bar-fill[data-pct]').forEach(fill => {
          const pct = fill.getAttribute('data-pct')
          fill.style.transition = 'width 1s ease 0.3s'
          fill.style.width = pct + '%'
        })
        obs.disconnect()
      },
      { threshold: 0, rootMargin: '0px 0px -80px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section className="aval-section" id="genetica" ref={sectionRef}>
      <div className="aval-wrap">

        {/* header */}
        <div className="aval-head">
          <div className="aval-head-left">
            <div className="aval-kicker">
              <span className="aval-kicker-dot">●</span>
              Avaliação Genética · ANCP · 2026
            </div>
            <h2 className="aval-h2">
              Direcionado para <i className="aval-acento">crescimento</i> e carcaça.
            </h2>
          </div>
          <div className="aval-fonte">
            Fonte ANCP · GENEPLUS · PMGZ<br />
            <strong className="aval-fonte-destaque">Nelore TresMar · Botucatu/SP</strong><br />
            Avaliação 2026<br />
            Sumários ANCP · PMGZ · GenePlus
          </div>
        </div>

        {/* featured grid */}
        <div className="aval-feat">
          <div className="aval-feat-main">
            <div className="aval-feat-main-label">{HERO.label}</div>
            <div>
              <div className="aval-feat-main-num">{HERO.numero}</div>
              <div className="aval-feat-main-rank">{HERO.rank}</div>
            </div>
          </div>
          <div className="aval-feat-grid">
            {DESTAQUES.map((d, i) => (
              <div
                key={d.label}
                className={[
                  'aval-feat-cell',
                  i % 2 === 0 ? 'aval-feat-cell--br' : '',
                  i < 2 ? 'aval-feat-cell--bb' : '',
                ].join(' ')}
              >
                <div className="aval-feat-cell-label">{d.label}</div>
                <div>
                  <div className="aval-feat-cell-num">{d.valor}</div>
                  <div className="aval-feat-cell-sub">{d.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* bars */}
        <div className="aval-bars">
          {BARS.map(b => (
            <div className="aval-bar-row" key={b.name}>
              <div className="aval-bar-name">{b.name}</div>
              <div className="aval-bar-track">
                <div
                  className={`aval-bar-fill${b.elite ? ' aval-bar-fill--elite' : ''}`}
                  data-pct={b.pct}
                  style={{ width: '0%' }}
                />
              </div>
              <div className="aval-bar-val">{b.valor}</div>
              <div className={`aval-bar-rank${b.elite ? ' aval-bar-rank--elite' : ''}`}>{b.rank}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="aval-cta">
          <div className="hero-cta-group" style={{ alignItems: 'center', textAlign: 'center' }}>
            <a href={checkoutUrl} className="btn-primary fdb-cta-anim" target="_blank" rel="noopener">RESERVAR DOSE →</a>
            <p className="hero-cta-note">
              <span className="hero-cta-note__dot" />
              Dados validados · Reserve as suas doses
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}