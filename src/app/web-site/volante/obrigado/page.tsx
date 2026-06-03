import Link from 'next/link'
import type { Metadata } from 'next'

/* ============================================================
 * /volante/obrigado · Confirmação de pré-reserva
 * Destino do redirect após o POST /api/lead-volante.
 * Mesma identidade visual do checkout (volante.css herdado do
 * layout pai). Sem custo, sem pixel de conversão — confirmação
 * simples + próximo passo (WhatsApp).
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

export const metadata: Metadata = {
  title: 'Pré-reserva confirmada · Volante MRA — Fórmula do Boi',
  description: 'Recebemos sua pré-reserva do Volante MRA. O curador retorna em até 24h pelo WhatsApp.',
  robots: { index: false, follow: false },
}

export default function VolanteObrigado() {
  return (
    <main
      className="volante-scope min-h-screen flex flex-col"
      style={{ background: INK }}
    >
      {/* HEADER · brandbar enxuta */}
      <header className="relative z-40">
        <div className="container mx-auto px-4 py-5 flex items-center justify-center">
          <Link href="/volante" aria-label="Fórmula do Boi — Volante MRA">
            <img
              src="/volante/logo-formula-do-boi-03.png"
              alt="Fórmula do Boi"
              style={{ height: '34px', width: 'auto' }}
            />
          </Link>
        </div>
        <div className="h-px w-full" style={{ background: 'rgba(212,168,92,0.14)' }} />
      </header>

      {/* CONTEÚDO */}
      <section
        className="flex-1 relative overflow-hidden flex items-center"
        style={{ background: INK_2 }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(212,168,92,0.14) 0%, transparent 60%)',
          }}
        />
        <div
          className="container mx-auto px-4 py-20 md:py-28 relative text-center"
          style={{ maxWidth: '720px' }}
        >
          {/* selo */}
          <div
            className="inline-flex items-center justify-center mb-8"
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              border: `1px solid ${BRONZE}`,
              background:
                'linear-gradient(180deg, rgba(212,168,92,0.12) 0%, rgba(212,168,92,0.02) 100%)',
              boxShadow: '0 0 60px rgba(212,168,92,0.18)',
            }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none">
              <path
                d="M5 12.5l4.5 4.5L19 7"
                stroke={BRONZE_LIGHT}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div
            className="inline-flex items-center gap-3 mb-5"
            style={{
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
            <span style={{ color: BRONZE_LIGHT }}>Volante MRA</span> está garantida.
          </h1>

          <p
            style={{
              color: TEXT_DIM,
              fontSize: '16px',
              lineHeight: 1.6,
              maxWidth: '52ch',
              margin: '0 auto 14px',
            }}
          >
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
            Fique de olho no WhatsApp · Confirmação pelo número (31) 9414-9161
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/553194149161?text=Acabei%20de%20fazer%20a%20pr%C3%A9-reserva%20do%20Volante%20MRA"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto"
              style={{
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
              href="/volante"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto"
              style={{
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
              Voltar ao Volante MRA
            </Link>
          </div>
        </div>
      </section>

      {/* RODAPÉ enxuto */}
      <footer
        className="text-center py-6"
        style={{ borderTop: '1px solid rgba(212,168,92,0.14)', background: INK }}
      >
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: '10.5px',
            letterSpacing: '0.20em',
            textTransform: 'uppercase',
            color: 'rgba(245,240,228,0.48)',
          }}
        >
          Fórmula do Boi · Curadoria de Nelore PO
        </span>
      </footer>
    </main>
  )
}
