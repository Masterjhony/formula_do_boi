'use client'

import { getCheckoutUrl } from '../utils/checkoutUrl'

export default function Manifesto() {
  const checkoutUrl = getCheckoutUrl()
  return (
    <section className="manifesto" id="manifesto">
      <div className="manifesto__inner">
        <div className="manifesto__eyebrow">
          <span className="manifesto__eyebrow-dot">●</span>Manifesto
        </div>

        <div className="manifesto__grid">
          {/* texto */}
          <div>
            <h2 className="manifesto__title">
              Eficiência, desempenho e <i>retorno consistente.</i>
            </h2>
            <p className="manifesto__text">
              O <b>CONAN FIV TresMar</b> chega como um dos grandes destaques da nova geração Nelore, criado pela TresMar. Não é apenas um bom animal — é um indivíduo diferenciado, entregando resultado no campo, na balança e no bolso.
            </p>
            <p className="manifesto__text">
              Curadoria de genética PO. Avaliação ANCP, GENEPLUS e PMGZ completa. Sêmen convencional disponível em pré-reserva.
            </p>

            <div className="manifesto__cta-wrap">
              <div className="hero-cta-group">
                <a href={checkoutUrl} className="btn-primary fdb-cta-anim">RESERVAR DOSE →</a>
                <p className="hero-cta-note">
                  <span className="hero-cta-note__dot" />
                  Sêmen convencional · Pré-reserva aberta
                </p>
              </div>
            </div>
          </div>

          {/* foto */}
          <div className="manifesto__photo">
            <img src="/conan/assets/conan-frontal.jpg" alt="CONAN FIV TresMar — Nelore PO no campo" />
            <div className="manifesto__photo-grad" aria-hidden="true" />
            <span className="manifesto__corner manifesto__corner--tl" aria-hidden="true" />
            <span className="manifesto__corner manifesto__corner--tr" aria-hidden="true" />
            <span className="manifesto__corner manifesto__corner--bl" aria-hidden="true" />
            <span className="manifesto__corner manifesto__corner--br" aria-hidden="true" />
            <div className="manifesto__caption">
              <div className="manifesto__caption-name">CONAN FIV TresMar</div>
              <div className="manifesto__caption-tag">Nelore PO</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}