'use client'

import { getCheckoutUrl } from '../utils/checkoutUrl'

export default function Hero() {
  const checkoutUrl = getCheckoutUrl()
  return (
    <section id="hero" className="hero-section">
      <div className="hero-section__bg">
        <video
          className="hero-section__video"
          src="/conan/assets/video-conan-hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          poster="/conan/assets/hero-poster.jpg"
        />
        <div className="hero-section__overlay" />
      </div>

      <div className="hero-section__content">
        {/* eyebrow */}
        <div className="hero-eyebrow">
          <span className="hero-eyebrow__line" />
          ● Aceleradora 2026 · Lançamento
        </div>

        {/* subtitle */}
        <div className="hero-sub2">
          Genética de elite. <span className="plain">Precisão de dados.</span>
        </div>

        {/* title */}
        <h1 className="hero-title2">
          <span>Conan FIV</span>
          <span className="accent">TresMar.</span>
        </h1>

        {/* lede */}
        <p className="hero-lede2">
          Touro Nelore PO <b>superprecoce</b>. TOP 0,1% MGTe ANCP · DECA 1 PMGZ · TOP 0,5% GENEPLUS — <b>elite em Peso, AOL e Precocidade</b>.
        </p>

        {/* meta line */}
        <div className="hero-meta">
          <span className="hero-meta__line" />
          <span>Doses a partir de <b>R$&nbsp;23,50</b></span>
          <span className="hero-meta__sep">·</span>
          <span className="hero-meta__hl">Frete grátis a partir de 100 doses</span>
          <span className="hero-meta__sep">·</span>
          <span>Sem compromisso na pré-reserva</span>
        </div>

        {/* price card */}
        <div className="hero-pricecard" aria-label="Tabela de preços por volume">
          <span className="hero-pricecard__badge">Tabela Aceleradora 2026</span>
          <div className="hero-pricerow">
            <span className="hero-pricerow__faixa">30 → 100 doses</span>
            <span className="hero-pricerow__val">R$ 29,50</span>
          </div>
          <div className="hero-pricerow">
            <span className="hero-pricerow__faixa">101 → 200 doses</span>
            <span className="hero-pricerow__val">R$ 27,50</span>
          </div>
          <div className="hero-pricerow">
            <span className="hero-pricerow__faixa">201 → 500 doses</span>
            <span className="hero-pricerow__val">R$ 25,50</span>
          </div>
          <div className="hero-pricerow hero-pricerow--best">
            <span className="hero-pricerow__faixa">500+ doses</span>
            <span className="hero-pricerow__val">R$ 23,50</span>
          </div>
        </div>

        {/* CTA */}
        <div className="hero-cta-group">
          <a href={checkoutUrl} className="btn-primary fdb-cta-anim">RESERVAR DOSE →</a>
          <p className="hero-cta-note">
            <span className="hero-cta-note__dot" />
            Pré-reserva gratuita · Curador confirma em até 24h
          </p>
        </div>
      </div>
    </section>
  )
}