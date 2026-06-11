'use client'

const NAV_LINKS = [
  { text: 'Início',    href: '/' },
  { text: 'Touros',    href: '/touros' },
  { text: 'Embriões',  href: '/embrioes' },
  { text: 'Leilões',   href: '/agenda' },
  { text: 'Grupo VIP', href: '/grupo-vip' },
]

const PARCEIROS = [
  'Bula Assessoria · Bula Remates',
  'Aceleradora de Touros',
  'Central Bela Vista',
  'Nelore Visual',
]

const WM_BASE = { width: 'clamp(360px, 48vw, 650px)' }
// Logo na cor do fundo (#0A0A0A) com contorno cinza escuro + sombreamento
const GRAY = '#2b2b2b'
const WM_LAYERS = [
  {
    filter: [
      `drop-shadow(0.3px 0 0 ${GRAY})`,
      `drop-shadow(-0.3px 0 0 ${GRAY})`,
      `drop-shadow(0 0.3px 0 ${GRAY})`,
      `drop-shadow(0 -0.3px 0 ${GRAY})`,
      `drop-shadow(0.22px 0.22px 0 ${GRAY})`,
      `drop-shadow(-0.22px -0.22px 0 ${GRAY})`,
      `drop-shadow(0.22px -0.22px 0 ${GRAY})`,
      `drop-shadow(-0.22px 0.22px 0 ${GRAY})`,
      'drop-shadow(5px 8px 7px rgba(43,43,43,0.45))',
    ].join(' '),
    opacity: 0.95,
  },
]

export default function Footer() {
  return (
    <footer className="footer">

      {/* Watermark — logo preta, contorno e sombreamento cinza */}
      <div className="footer-watermark" aria-hidden="true">
        {WM_LAYERS.map((l, i) => (
          <img
            key={i}
            src="/conan/assets/logos/logo-formula-bg.png"
            alt=""
            style={{ ...WM_BASE, ...l }}
          />
        ))}
      </div>

      {/* Vignette */}
      <div aria-hidden="true" className="footer-vignette" />

      {/* Conteúdo principal */}
      <div className="footer-inner">
        <div className="footer-grid">

          {/* Col 1: Marca */}
          <div className="footer-col">
            <img
              className="footer-brand-logo"
              src="/conan/assets/logos/logo-formula-vertical.png"
              alt="Fórmula do Boi"
            />
            <p className="footer-tagline">
              Curadoria de Nelore PO — sêmen top 0.1%, doadoras consagradas, embriões FIV selecionados e leilões com curadoria especializada.
            </p>
            <div className="footer-socials">
              <a
                className="footer-social"
                href="https://www.instagram.com/formuladoboi/"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Navegação */}
          <div className="footer-col">
            <h3 className="footer-heading">Navegação</h3>
            <ul className="footer-nav">
              {NAV_LINKS.map(l => (
                <li key={l.text}><a href={l.href}>{l.text}</a></li>
              ))}
            </ul>
          </div>

          {/* Col 3: Contato */}
          <div className="footer-col">
            <h3 className="footer-heading">Contato</h3>
            <ul className="footer-contact">
              <li>
                <svg className="footer-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>(31) 9414-9161<br />(31) 7565-9900</span>
              </li>
              <li>
                <svg className="footer-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-.9.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>formuladoboi@gmail.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Barra de parceiros */}
        <div className="footer-parceiros">
          <span className="footer-parceiros-label">Parceiros</span>
          {PARCEIROS.map(p => (
            <span className="footer-parceiros-item" key={p}>{p}</span>
          ))}
        </div>

      </div>
    </footer>
  )
}