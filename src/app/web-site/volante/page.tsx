/* ============================================================
 * /volante · Página de detalhe do card de sêmen "Volante MRA"
 * (catálogo /semen → card com customLink "/volante").
 * Composição espelha o build Vite original (Volante.jsx).
 * ============================================================ */
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { VideoTouro } from './components/VideoTouro'
import { MarqueeStats } from './components/MarqueeStats'
import { ValuesStrip } from './components/ValuesStrip'
import { Manifesto } from './components/Manifesto'
import { Apresenta } from './components/Apresenta'
import { Aval } from './components/Aval'
import { Pedigree } from './components/Pedigree'
import { Cinemastrip } from './components/Cinemastrip'
import { PerfilCompleto } from './components/PerfilCompleto'
import { DosesCounter } from './components/DosesCounter'
import { PorQueAgora } from './components/PorQueAgora'

export default function VolantePage() {
  return (
    <div className="volante-scope bg-nelore min-h-screen">
      <Header />
      <Hero />
      <VideoTouro />
      <MarqueeStats />
      <ValuesStrip />
      <Manifesto />
      <Apresenta />
      <Aval />
      <Pedigree />
      <Cinemastrip />
      <PerfilCompleto />
      <DosesCounter />
      <PorQueAgora />
      <Footer />
    </div>
  )
}
