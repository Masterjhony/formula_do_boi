'use client'

export default function Cinemastrip() {
  return (
    <section
      className="cinemastrip"
      aria-label="CONAN FIV TresMar · Pelagem branca de tipicidade"
      style={{ backgroundImage: 'url(/conan/assets/conan-pasto.jpg)' }}
    >
      <div className="cinemastrip__overlay" aria-hidden="true" />
      <p className="cinemastrip__quote">
        Genética que se vê <i>no campo.</i><br />
        E se mede no <i>frigorífico.</i>
      </p>
    </section>
  )
}