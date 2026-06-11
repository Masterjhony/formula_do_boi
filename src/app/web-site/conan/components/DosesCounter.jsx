'use client'

export default function DosesCounter() {
  return (
    <aside className="doses-counter" aria-label="Pré-reservas em andamento">
      <div className="doses-counter__rule doses-counter__rule--left" aria-hidden="true" />
      <div className="doses-counter__rule doses-counter__rule--right" aria-hidden="true" />
      <div className="doses-counter__row">
        <span className="doses-counter__dot">●</span>
        <span className="doses-counter__text">
          Criadores de todo o Brasil já estão <b>posicionando doses</b> para a Aceleradora 2026
        </span>
      </div>
    </aside>
  )
}