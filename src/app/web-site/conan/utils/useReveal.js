import { useEffect, useRef, useState } from 'react'

// IntersectionObserver helper — adiciona .visible ao entrar na viewport.
export function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible')
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0, rootMargin: '0px 0px -80px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}
