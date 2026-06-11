import Link from 'next/link'
import type { Metadata } from 'next'
import Brandbar from '../components/Brandbar'
import Footer from '../components/Footer'

/* ============================================================
 * /conan/obrigado · Confirmação de pré-reserva
 * Destino do redirect após o POST /api/lead-conan.
 * Mesma identidade visual da LP (conan.css herdado do layout
 * pai). Sem custo, sem pixel de conversão — confirmação simples
 * + próximo passo (WhatsApp).
 * ============================================================ */

const BRONZE = '#A0792E'
const BRONZE_LIGHT = '#D4A85C'
const SELO = '#F5F0E4'
const INK = '#161616'
const INK_2 = '#1f1f1f'

const FONT_MONO = '"JetBrains Mono", ui-monospace, monospace'
const FONT_DISPLAY = '"Space Grotesk", system-ui, sans-serif'

const BRONZE_BORDER = 'rgba(212,168,92,0.28)'
const TEXT_DIM = 'rgba(245,240,228,0.70)'
const TEXT_MUTED = 'rgba(245,240,228,0.55)'

const WA_URL =
  'https://wa.me/5531975659900?text=Acabei%20de%20fazer%20a%20pr%C3%A9-reserva%20do%20CONAN%20FIV%20TresMar.'

export const metadata: Metadata = {
  title: 'Pré-reserva confirmada · CONAN FIV TresMar — Fórmula do Boi',
  description:
    'Recebemos sua pré-reserva do CONAN FIV TresMar. O curador retorna em até 24h pelo WhatsApp.',
  robots: { index: false, follow: false },
}

export default function ConanObrigado() {
  return (
    <div className="ck-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: INK }}>
      <Brandbar />

      {/* CONTEÚDO */}
      <section
        style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', background: INK_2 }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: 'radial-gradient(ellipse at 50% 0%, rgba(212,168,92,0.14) 0%, transparent 60%)',
          }}
        />
        <div
          className="ck-container"
          style={{ paddingTop: '80px', paddingBottom: '80px', position: 'relative', textAlign: 'center', maxWidth: '720px' }}
        >
          {/* selo */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              border: `1px solid ${BRONZE}`,
              background: 'linear-gradient(180deg, rgba(212,168,92,0.12) 0%, rgba(212,168,92,0.02) 100%)',
              boxShadow: '0 0 60px rgba(212,168,92,0.18)',
              marginBottom: '32px',
            }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none">
              <path d="M5 12.5l4.5 4.5L19 7" stroke={BRONZE_LIGHT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
              fontFamily: FONT_MONO,
              fontSize: '11px',
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: BRONZE_LIGHT,
              fontWeight: 500,
            }}
          >
            <span style={{ width: '24px', height: '1px', background: BRONZE }} />
            Pré-reserva recebida
            <span style={{ width: '24px', height: '1px', background: BRONZE }} />
          </div>

          <h1
            style={{
              fontSize: 'clamp(30px, 5vw, 52px)',
              fontWeight: 500,
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              color: SELO,
              marginBottom: '18px',
              fontFamily: FONT_DISPLAY,
            }}
          >
            Sua pré-reserva do{' '}
            <span style={{ color: BRONZE_LIGHT }}>CONAN FIV TresMar</span> está garantida.
          </h1>

          <p style={{ color: TEXT_DIM, fontSize: '16px', lineHeight: 1.6, maxWidth: '52ch', margin: '0 auto 14px' }}>
            O curador da Central Bela Vista vai te chamar no WhatsApp em até 24h com a
            proposta técnica e o cronograma para a sua estação reprodutiva. Pré-reserva sem
            custo e sem compromisso.
          </p>

          <p
            style={{
              fontFamily: FONT_MONO,
              fontSize: '11px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: TEXT_MUTED,
              marginBottom: '36px',
            }}
          >
            Fique de olho no WhatsApp · Confirmação pelo número (31) 97565-9900
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                background: BRONZE,
                color: INK,
                border: `1px solid ${BRONZE}`,
                padding: '15px 28px',
                borderRadius: '2px',
                fontFamily: FONT_MONO,
                fontWeight: 600,
                fontSize: '13px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                boxShadow: '0 0 0 1px rgba(212,168,92,0.35), 0 0 60px rgba(212,168,92,0.18)',
              }}
            >
              Falar agora no WhatsApp
              <span aria-hidden="true">→</span>
            </a>
            <Link
              href="/conan"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: `1px solid ${BRONZE_BORDER}`,
                color: SELO,
                padding: '15px 28px',
                borderRadius: '2px',
                fontFamily: FONT_MONO,
                fontWeight: 500,
                fontSize: '12px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              Voltar ao CONAN FIV TresMar
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
