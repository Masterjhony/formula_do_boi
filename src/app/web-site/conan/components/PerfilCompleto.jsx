'use client'

import { getCheckoutUrl } from '../utils/checkoutUrl'

const CELLS = [
  {
    title: 'Crescimento',
    desc: 'DP450 +33,24 · DP365 +31,03',
    icon: <><path d="M3 17l6-6 4 4 8-8" /><path d="M14 7h7v7" /></>,
  },
  {
    title: 'Carcaça',
    desc: 'DAOL +7,67 · TMM +6,84',
    icon: <><path d="M12 2v20M2 12h20" /><circle cx="12" cy="12" r="9" /></>,
  },
  {
    title: 'Maternal',
    desc: 'DSTAY +90,46 · TOP 4%',
    icon: <><path d="M9 11a3 3 0 1 1 6 0v1H9v-1Z" /><path d="M5 21V11a7 7 0 0 1 14 0v10" /></>,
  },
  {
    title: 'Reprodução',
    desc: 'PS-ED +30,59 · CE 36 cm',
    icon: <><path d="M4 4h16v16H4z" /><path d="M4 12h8M12 4v16" /></>,
  },
  {
    title: 'Sanidade',
    desc: 'Av. genômica confirmada · MAPA',
    icon: <path d="M12 2 4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4Z" />,
  },
]

export default function PerfilCompleto() {
  const checkoutUrl = getCheckoutUrl()
  return (
    <section className="perfil" id="perfil">
      <div className="perfil__inner">
        <div className="perfil__eyebrow">
          <span className="perfil__eyebrow-dot">●</span>Perfil Completo
        </div>
        <h2 className="perfil__title">
          Não só desempenho. Um touro <i>equilibrado.</i>
        </h2>
        <p className="perfil__sub">
          Bons indicadores maternais e reprodutivos — construindo um rebanho funcional, produtivo e sustentável ao longo das gerações.
        </p>

        <div className="fdb-perfil-grid">
          {CELLS.map(c => (
            <div className="fdb-perfil-cell" key={c.title}>
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                {c.icon}
              </svg>
              <div>
                <div className="title">{c.title}</div>
                <div className="desc">{c.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="perfil__cta">
          <div className="hero-cta-group" style={{ alignItems: 'center', textAlign: 'center' }}>
            <a href={checkoutUrl} className="btn-primary fdb-cta-anim" target="_blank" rel="noopener">RESERVAR DOSE →</a>
            <p className="hero-cta-note">
              <span className="hero-cta-note__dot" />
              Touro equilibrado · Pré-reserva aberta
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}