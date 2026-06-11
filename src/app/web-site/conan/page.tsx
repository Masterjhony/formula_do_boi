/* ============================================================
 * /conan · Landing de detalhe do touro "CONAN FIV TresMar".
 * Composição espelha o build Vite original (App.jsx) — design
 * portado da LP Volante MRA com os dados/fotos do CONAN.
 * ============================================================ */
import Brandbar from './components/Brandbar'
import Hero from './components/Hero'
import VideoPlayer from './components/VideoPlayer'
import MarqueeStats from './components/MarqueeStats'
import ValuesStrip from './components/ValuesStrip'
import Manifesto from './components/Manifesto'
import Apresentamos from './components/Apresentamos'
import AvaliacaoGenetica from './components/AvaliacaoGenetica'
import Pedigree from './components/Pedigree'
import Cinemastrip from './components/Cinemastrip'
import PerfilCompleto from './components/PerfilCompleto'
import DosesCounter from './components/DosesCounter'
import PorqueAgora from './components/PorqueAgora'
import Footer from './components/Footer'
import WAFloat from './components/WAFloat'

export default function ConanPage() {
  return (
    <>
      <Brandbar />
      <main>
        <Hero />
        <VideoPlayer />
        <MarqueeStats />
        <ValuesStrip />
        <Manifesto />
        <Apresentamos />
        <AvaliacaoGenetica />
        <Pedigree />
        <Cinemastrip />
        <PerfilCompleto />
        <DosesCounter />
        <PorqueAgora />
      </main>
      <Footer />
      <WAFloat />
    </>
  )
}
