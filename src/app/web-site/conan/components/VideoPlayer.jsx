'use client'

import { useReveal } from '../utils/useReveal'
import { getCheckoutUrl } from '../utils/checkoutUrl'

export default function VideoPlayer() {
  const { ref } = useReveal()
  const checkoutUrl = getCheckoutUrl()
  return (
    <section className="video-player reveal" ref={ref} id="video-touro">
      <div className="video-player__inner">

        <div className="video-player__eyebrow">
          <span className="video-player__eyebrow-dot" aria-hidden="true">●</span>
          Vídeo · CONAN FIV TresMar
        </div>

        <h2 className="video-player__title">Veja o touro <i>em movimento.</i></h2>

        <div className="video-player__frame">
          <div className="video-player__clip">
            <video
              className="video-player__video"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="/conan/assets/conan-pasto.jpg"
              onLoadedMetadata={(e) => { e.currentTarget.currentTime = 4 }}
            >
              <source src="/conan/assets/conan-video.mp4" type="video/mp4" />
            </video>
          </div>
          <span aria-hidden="true" className="video-player__corner video-player__corner--tl" />
          <span aria-hidden="true" className="video-player__corner video-player__corner--tr" />
          <span aria-hidden="true" className="video-player__corner video-player__corner--bl" />
          <span aria-hidden="true" className="video-player__corner video-player__corner--br" />
        </div>

        <p className="video-player__cap">Vídeo institucional · CONAN FIV TresMar · Aceleradora 2026</p>

        <div className="video-player__post">
          <span aria-hidden="true" className="video-player__post-tick" />
          <p className="video-player__post-line">
            Viu o potencial. <b>Agora garanta as suas doses.</b>
          </p>
          <div className="video-player__cta-wrap">
            <a href={checkoutUrl} className="btn-primary fdb-cta-anim">RESERVAR DOSE →</a>
            <p className="video-player__note">
              <span className="video-player__note-dot" aria-hidden="true" />
              Pré-reserva gratuita · Sem compromisso
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}