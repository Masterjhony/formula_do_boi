'use client'

import { getCheckoutUrl } from '../utils/checkoutUrl'

export default function Brandbar() {
  const checkoutUrl = getCheckoutUrl()
  return (
    <header className="brandbar">
      <div className="brandbar__inner">
        <a href="#hero" className="brandbar__logo-link" aria-label="Fórmula do Boi">
          <img
            src="/conan/assets/logos/logo-conan-amarela.png"
            alt="Fórmula do Boi — logo"
            className="brandbar__logo-img"
          />
        </a>
        <a href={checkoutUrl} className="btn-primary brandbar__cta">
          RESERVAR DOSE →
        </a>
      </div>
    </header>
  )
}