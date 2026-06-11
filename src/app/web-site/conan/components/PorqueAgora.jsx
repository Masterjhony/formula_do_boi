'use client'

import { getCheckoutUrl } from '../utils/checkoutUrl'

export default function PorqueAgora() {
  const checkoutUrl = getCheckoutUrl()
  return (
    <section className="porque-agora" id="porque">
      <div
        className="porque-agora__bg"
        aria-hidden="true"
        style={{ backgroundImage: 'url(/conan/assets/conan-frontal.jpg)' }}
      />
      <div className="porque-agora__bg-strip" aria-hidden="true" />

      <div className="porque-agora__inner">
        <div className="porque-agora__head">
          <div className="porque-agora__eyebrow">
            <span className="porque-agora__eyebrow-dot">●</span>Por que agora
          </div>
          <h2 className="porque-agora__title">
            Acelere o <i>progresso genético</i> do seu plantel.
          </h2>
        </div>

        <div className="porque-agora__grid">
          <div className="porque-agora__card">
            <div className="porque-agora__number">01 — Genética Elite</div>
            <h3 className="porque-agora__card-title">MGTe 35,12 · TOP 0,1%</h3>
            <p className="porque-agora__card-body">
              Elite em AOL, musculatura e permanência. Validado nos três principais sumários do país (PMGZ, GenePlus, ANCP).
            </p>
          </div>

          <div className="porque-agora__card">
            <div className="porque-agora__number">02 — Resultado direto</div>
            <h3 className="porque-agora__card-title">Mais arrobas em menos tempo</h3>
            <p className="porque-agora__card-body">
              Bezerros mais pesados ao desmame (+16 kg vs touro médio) e carcaças com melhor pagamento no frigorífico.
            </p>
          </div>

          <div className="porque-agora__card">
            <div className="porque-agora__number">03 — Condição única</div>
            <h3 className="porque-agora__card-title">Pacotes promocionais exclusivos</h3>
            <p className="porque-agora__card-body">
              Tabela 2026 válida apenas até encerramento da Aceleradora. Doses a partir de R$ 23,50.
            </p>
            <div className="porque-agora__note" role="note">
              <span className="porque-agora__note-dot" aria-hidden="true" />
              <span className="porque-agora__note-text">
                Tabela especial vigente <b>até o encerramento da Aceleradora 2026</b> · Condição confirmada pelo curador
              </span>
            </div>
          </div>
        </div>

        <div className="porque-agora__cta">
          <div className="hero-cta-group" style={{ alignItems: 'center', textAlign: 'center' }}>
            <a href={checkoutUrl} className="btn-primary fdb-cta-anim" target="_blank" rel="noopener">RESERVAR DOSE →</a>
            <p className="hero-cta-note">
              <span className="hero-cta-note__dot" />
              Tabela 2026 válida só até o fim da Aceleradora
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}