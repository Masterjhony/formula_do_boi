'use client'

import { useEffect, useState } from 'react'

const WA_URL = 'https://wa.me/5531975659900?text=Ol%C3%A1%21%20Tenho%20interesse%20no%20LOTE%2001%20%E2%80%94%20CONAN%20FIV%20TRESMAR.'

export default function WAFloat() {
  const [tooltipVisible, setTooltipVisible] = useState(false)

  useEffect(() => {
    if (window.innerWidth < 768) return
    const show = setTimeout(() => setTooltipVisible(true), 3000)
    const hide = setTimeout(() => setTooltipVisible(false), 8000)
    return () => { clearTimeout(show); clearTimeout(hide) }
  }, [])

  return (
    <div className="wa-float">
      {tooltipVisible && (
        <span className="wa-float__tooltip">Fale conosco sobre o Lote 01</span>
      )}
      <a
        className="wa-float__btn"
        href={WA_URL}
        target="_blank"
        rel="noopener"
        aria-label="Contato via WhatsApp"
      >
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.119.554 4.107 1.523 5.83L0 24l6.342-1.494A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.882 0-3.645-.497-5.17-1.366l-.371-.214-3.766.887.923-3.668-.236-.38A9.952 9.952 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
      </a>
    </div>
  )
}