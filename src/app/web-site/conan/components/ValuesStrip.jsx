'use client'

const VALUES = ['Curadoria', 'Precisão', 'Autoridade', 'Lealdade', 'Evolução']

export default function ValuesStrip() {
  return (
    <section className="values-strip" aria-label="Valores Fórmula do Boi">
      <div className="values-strip__inner">
        {VALUES.map(word => (
          <span className="values-strip__item" key={word}>
            <span className="values-strip__dot" aria-hidden="true" />
            {word}
          </span>
        ))}
      </div>
    </section>
  )
}