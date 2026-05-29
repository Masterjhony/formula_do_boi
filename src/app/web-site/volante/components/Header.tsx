/* ============================================================
 * Brandbar · espelha o lockup oficial do Atacante:
 *   [ FdB logo ]       [ Reservar dose → ]
 * ============================================================ */
import Link from 'next/link'

export function Header() {
  return (
    <header className="brandbar sticky top-0 z-50">
      <div className="brandbar-inner">
        <div className="brand-lockup">
          <Link href="/" aria-label="Fórmula do Boi — Voltar para a página inicial">
            <img
              className="brand-logo"
              src="/volante/logo-formula-do-boi-03.png"
              alt="Fórmula do Boi"
            />
          </Link>
        </div>

        <Link href="/volante/checkout" className="brand-cta">
          Reservar dose
          <svg viewBox="0 0 14 10" fill="none">
            <path
              d="M1 5h12m0 0L9 1m4 4L9 9"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="square"
            />
          </svg>
        </Link>
      </div>
    </header>
  )
}
