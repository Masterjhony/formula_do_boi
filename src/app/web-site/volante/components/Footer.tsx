/* ============================================================
 * Footer · estrutura idêntica ao Atacante (classes semânticas)
 * Watermark intaglio: logo na cor do fundo + sombras cinza escuro
 * ============================================================ */
import Link from 'next/link'

const WM_GLYPH = '/volante/logo-formula-fundo.png'
const WM_WIDTH = 'clamp(360px, 48vw, 650px)'

export function Footer() {
  return (
    <footer className="footer">
      {/* Watermark intaglio · logo na cor da página com sombras pra criar relevo */}
      <div className="footer-watermark" aria-hidden="true">
        {/* Sombra inferior-direita (mais escura, blur maior) — base do "carimbo" */}
        <img
          src={WM_GLYPH}
          alt=""
          style={{
            width: WM_WIDTH,
            filter: 'invert(1) brightness(0.18) blur(3px)',
            opacity: 0.55,
            transform: 'translate(3px, 4px)',
          }}
        />
        {/* Sombra média (deslocada um pouco) */}
        <img
          src={WM_GLYPH}
          alt=""
          style={{
            width: WM_WIDTH,
            filter: 'invert(1) brightness(0.22) blur(1px)',
            opacity: 0.7,
            transform: 'translate(1.5px, 2px)',
          }}
        />
        {/* Highlight sutil acima/esquerda (cinza um pouco mais claro que o fundo) */}
        <img
          src={WM_GLYPH}
          alt=""
          style={{
            width: WM_WIDTH,
            filter: 'invert(1) brightness(0.18)',
            opacity: 0.4,
            transform: 'translate(-1.5px, -2px)',
          }}
        />
        {/* Corpo principal · cor do fundo (#0A0A0A) · "tampa" o miolo deixando só as bordas com sombra */}
        <img
          src={WM_GLYPH}
          alt=""
          style={{
            width: WM_WIDTH,
            filter: 'invert(1) brightness(0.04)',
            opacity: 1,
          }}
        />
      </div>

      {/* Vignette · escurece bordas */}
      <div aria-hidden="true" className="footer-vignette" />

      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand col */}
          <div className="footer-col">
            <img
              src="/volante/logo-formula-do-boi-vertical.png"
              alt="Fórmula do Boi"
              className="footer-brand-logo"
            />
            <p className="footer-tagline">
              Curadoria de Nelore PO — sêmen top 0.1%, doadoras consagradas,
              embriões FIV selecionados e leilões com curadoria especializada.
            </p>
            <div className="footer-socials">
              <a
                href="https://www.instagram.com/formuladoboi/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social"
                aria-label="Instagram"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Nav col */}
          <div className="footer-col">
            <h3 className="footer-heading">Navegação</h3>
            <ul className="footer-nav">
              <li><Link href="/">Início</Link></li>
              <li><Link href="/touros">Touros</Link></li>
              <li><Link href="/embrioes">Embriões</Link></li>
              <li><Link href="/agenda">Leilões</Link></li>
              <li><Link href="/grupo-vip">Grupo VIP</Link></li>
            </ul>
          </div>

          {/* Contact col */}
          <div className="footer-col">
            <h3 className="footer-heading">Contato</h3>
            <ul className="footer-contact">
              <li>
                <svg
                  className="footer-contact-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>(31) 9414-9161<br />(31) 7565-9900</span>
              </li>
              <li>
                <svg
                  className="footer-contact-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-.9.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>formuladoboi@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Parceiros strip */}
        <div className="footer-parceiros">
          <span className="footer-parceiros-label">Parceiros</span>
          <span className="footer-parceiros-item">Bula Assessoria · Bula Remates</span>
          <span className="footer-parceiros-item">Aceleradora de Touros</span>
          <span className="footer-parceiros-item">Central Bela Vista</span>
          <span className="footer-parceiros-item">Nelore Visual</span>
        </div>
      </div>
    </footer>
  )
}
