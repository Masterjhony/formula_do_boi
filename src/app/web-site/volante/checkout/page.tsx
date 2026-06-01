'use client'

/* ============================================================
 * /volante/checkout · Pré-reserva
 * Cópia 1:1 do checkout do Atacante da Matinha (formuladoboi.com)
 * Cada CTA "Reservar dose" da LP /volante aponta pra cá.
 * ============================================================ */

import Link from 'next/link'
import type { CSSProperties } from 'react'

const BRONZE = '#A0792E'
const BRONZE_LIGHT = '#D4A85C'
const SELO = '#F5F0E4'
const INK = '#161616'
const INK_2 = '#1f1f1f'
const INK_FIELD = '#2a2a2a'

const FONT_MONO = '"JetBrains Mono", ui-monospace, monospace'
const FONT_DISPLAY = '"Space Grotesk", system-ui, sans-serif'

const BRONZE_BORDER = 'rgba(212,168,92,0.28)'
const BRONZE_HAIR = 'rgba(212,168,92,0.14)'
const TEXT_DIM = 'rgba(245,240,228,0.70)'
const TEXT_MUTED = 'rgba(245,240,228,0.55)'

const SELECT_ARROW =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23D4A85C' stroke-width='2' fill='none'/%3E%3C/svg%3E\")"

const fieldStyle: CSSProperties = {
  width: '100%',
  background: INK_FIELD,
  border: `1px solid ${BRONZE_BORDER}`,
  borderRadius: '2px',
  color: SELO,
  fontFamily: 'var(--font-sans, inherit)',
  fontSize: '16px',
  padding: '14px 16px',
  minHeight: '50px',
  outline: 'none',
  transition: 'border-color .25s ease, background .25s ease',
}

const selectStyle: CSSProperties = {
  ...fieldStyle,
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  backgroundImage: SELECT_ARROW,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 16px center',
  paddingRight: '40px',
}

const labelStyle: CSSProperties = {
  display: 'block',
  fontFamily: FONT_MONO,
  fontSize: '10.5px',
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: BRONZE_LIGHT,
  marginBottom: '8px',
  fontWeight: 500,
}

const helperStyle: CSSProperties = {
  fontSize: '12px',
  color: TEXT_MUTED,
  marginTop: '6px',
}

const sectionLabel: CSSProperties = {
  fontFamily: FONT_MONO,
  fontSize: '11px',
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: BRONZE_LIGHT,
  fontWeight: 500,
}

const sideRow: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '8px 0',
  borderBottom: `1px solid ${BRONZE_HAIR}`,
}

const sideLabel: CSSProperties = {
  fontFamily: FONT_MONO,
  fontSize: '10.5px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: TEXT_MUTED,
}

const sideValue: CSSProperties = {
  color: SELO,
  fontSize: '14px',
  fontWeight: 500,
  textAlign: 'right',
}

const ESTADOS: [string, string][] = [
  ['AC', 'Acre'], ['AL', 'Alagoas'], ['AP', 'Amapá'], ['AM', 'Amazonas'],
  ['BA', 'Bahia'], ['CE', 'Ceará'], ['DF', 'Distrito Federal'], ['ES', 'Espírito Santo'],
  ['GO', 'Goiás'], ['MA', 'Maranhão'], ['MT', 'Mato Grosso'], ['MS', 'Mato Grosso do Sul'],
  ['MG', 'Minas Gerais'], ['PA', 'Pará'], ['PB', 'Paraíba'], ['PR', 'Paraná'],
  ['PE', 'Pernambuco'], ['PI', 'Piauí'], ['RJ', 'Rio de Janeiro'], ['RN', 'Rio Grande do Norte'],
  ['RS', 'Rio Grande do Sul'], ['RO', 'Rondônia'], ['RR', 'Roraima'], ['SC', 'Santa Catarina'],
  ['SP', 'São Paulo'], ['SE', 'Sergipe'], ['TO', 'Tocantins'],
]

export default function VolanteCheckout() {
  return (
    <main className="volante-scope min-h-screen" style={{ background: INK }}>
      {/* ============ HEADER · brandbar igual à LP ============ */}
      <header className="brandbar relative z-40">
        <div className="brandbar-inner">
          <div className="brand-lockup">
            <Link href="/volante" aria-label="Fórmula do Boi — Volante MRA">
              <img
                className="brand-logo"
                src="/volante/logo-formula-do-boi-03.png"
                alt="Fórmula do Boi"
              />
            </Link>
          </div>
        </div>
        <div className="relative h-px w-full overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(212,168,92,0) 0%, rgba(212,168,92,0.45) 50%, rgba(212,168,92,0) 100%)',
            }}
          />
        </div>
        <nav
          className="hidden lg:block relative"
          aria-label="Navegação principal"
          style={{
            background:
              'linear-gradient(180deg, rgba(22,22,22,0) 0%, rgba(22,22,22,0.4) 100%)',
          }}
        >
          <div className="container mx-auto px-4 lg:px-6">
            <ul className="flex items-center justify-center gap-2 py-1">
              {[
                { href: '/semen', label: 'Sêmen' },
                { href: '/embrioes', label: 'Embriões' },
                { href: '/grupo-vip', label: 'Grupo VIP' },
              ].map((item, i) => (
                <li key={item.href} className="flex items-center">
                  {i > 0 && (
                    <span
                      aria-hidden="true"
                      className="relative flex items-center justify-center mx-2"
                    >
                      <span
                        className="block h-px w-2.5"
                        style={{
                          background:
                            'linear-gradient(90deg, rgba(212,168,92,0) 0%, rgba(212,168,92,0.35) 100%)',
                        }}
                      />
                      <span
                        className="block w-[5px] h-[5px] rotate-45 mx-1.5"
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(212,168,92,0.95) 0%, rgba(160,121,46,0.45) 100%)',
                          boxShadow:
                            '0 0 8px rgba(212,168,92,0.5), inset 0 0 1px rgba(245,240,228,0.55)',
                        }}
                      />
                      <span
                        className="block h-px w-2.5"
                        style={{
                          background:
                            'linear-gradient(90deg, rgba(212,168,92,0.35) 0%, rgba(212,168,92,0) 100%)',
                        }}
                      />
                    </span>
                  )}
                  <Link className="group relative flex items-center px-5 py-1.5" href={item.href}>
                    <span
                      aria-hidden="true"
                      className="absolute top-0 left-1/2 -translate-x-1/2 h-[4px] w-[4px] rounded-full bg-[var(--bronze-light)] transition-all duration-300 ease-out opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100"
                      style={{ boxShadow: '0 0 10px rgba(212,168,92,0.6)' }}
                    />
                    <span
                      className="relative transition-colors duration-200 text-[#F5F0E4] group-hover:text-[var(--bronze-light)]"
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: '11px',
                        letterSpacing: '0.24em',
                        textTransform: 'uppercase',
                        fontWeight: 500,
                      }}
                    >
                      {item.label}
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] bg-[var(--bronze-light)] transition-all duration-300 ease-out w-0 group-hover:w-[32px]"
                      style={{ boxShadow: '0 0 8px rgba(212,168,92,0.45)' }}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
        <div className="h-px w-full" style={{ background: 'rgba(212,168,92,0.14)' }} />
      </header>

      {/* ============ HERO ============ */}
      <section
        className="relative overflow-hidden"
        style={{ background: INK, borderBottom: `1px solid ${BRONZE_BORDER}` }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(212,168,92,0.14) 0%, transparent 60%)',
          }}
        />
        <div className="container mx-auto px-4 pt-14 pb-10 relative" style={{ maxWidth: '1100px' }}>
          <Link
            href="/volante"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: FONT_MONO,
              fontSize: '11px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: TEXT_DIM,
              marginBottom: '22px',
              textDecoration: 'none',
            }}
          >
            ← Voltar ao Volante MRA
          </Link>
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
            Pré-reserva · Sêmen · Aceleradora 2026
          </div>
          <h1
            className="font-display"
            style={{
              fontSize: 'clamp(34px, 5.6vw, 64px)',
              fontWeight: 500,
              lineHeight: 1.02,
              letterSpacing: '-0.025em',
              color: SELO,
              marginBottom: '16px',
              maxWidth: '20ch',
              fontFamily: FONT_DISPLAY,
            }}
          >
            Pré-reserva <span style={{ color: BRONZE_LIGHT }}>Volante MRA.</span>
          </h1>
          <p
            style={{
              color: TEXT_DIM,
              fontSize: '16px',
              lineHeight: 1.55,
              maxWidth: '60ch',
            }}
          >
            Queremos entender seu rebanho. Preencha os campos abaixo — o curador retorna em
            até 24h com proposta técnica e cronograma para a sua estação reprodutiva.
            Pré-reserva sem custo.
          </p>
        </div>
      </section>

      {/* ============ FORM + SIDEBAR ============ */}
      <section style={{ background: INK_2, borderBottom: `1px solid ${BRONZE_HAIR}` }}>
        <div className="container mx-auto px-4 py-14 md:py-20" style={{ maxWidth: '1100px' }}>
          <div className="grid lg:grid-cols-[1fr_0.65fr] gap-8 lg:gap-12 items-start">
            {/* ===== Form ===== */}
            <form
              className="card-engraved"
              style={{
                background: INK,
                border: `1px solid ${BRONZE_BORDER}`,
                padding: 'clamp(24px, 4vw, 40px)',
                borderRadius: '4px',
              }}
              onSubmit={(e) => e.preventDefault()}
            >
              <style>{`
                .checkout-summary-mobile { display: none; }
                @media (max-width: 1023px) {
                  .checkout-summary-mobile {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 14px;
                    margin-bottom: 28px;
                    border: 1px solid rgba(212,168,92,0.28);
                    border-left: 3px solid #A0792E;
                    background: linear-gradient(90deg, rgba(212,168,92,0.08) 0%, rgba(212,168,92,0) 100%);
                    border-radius: 3px;
                    position: relative;
                    overflow: hidden;
                  }
                  .checkout-summary-mobile .csm-thumb {
                    position: relative;
                    width: 72px; height: 72px;
                    flex-shrink: 0;
                    overflow: hidden;
                    border: 1px solid rgba(212,168,92,0.28);
                    border-radius: 2px;
                    background: #2a2a2a;
                  }
                  .checkout-summary-mobile .csm-thumb video,
                  .checkout-summary-mobile .csm-thumb img {
                    position: absolute; inset: 0;
                    width: 100%; height: 100%;
                    object-fit: cover;
                  }
                  .checkout-summary-mobile .csm-thumb-badge {
                    position: absolute; top: 4px; left: 4px;
                    font-family: "JetBrains Mono", ui-monospace, monospace;
                    font-size: 8.5px;
                    letter-spacing: 0.16em;
                    text-transform: uppercase;
                    color: #161616;
                    background: #A0792E;
                    padding: 2px 5px;
                    font-weight: 600;
                    border-radius: 1px;
                  }
                  .checkout-summary-mobile .csm-info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    min-width: 0;
                    flex: 1;
                  }
                  .checkout-summary-mobile .csm-name {
                    font-family: "Space Grotesk", system-ui, sans-serif;
                    font-size: 15px;
                    font-weight: 500;
                    color: #F5F0E4;
                    letter-spacing: -0.005em;
                    line-height: 1.15;
                  }
                  .checkout-summary-mobile .csm-meta {
                    font-family: "JetBrains Mono", ui-monospace, monospace;
                    font-size: 9.5px;
                    letter-spacing: 0.16em;
                    text-transform: uppercase;
                    color: rgba(245,240,228,0.55);
                  }
                  .checkout-summary-mobile .csm-badges {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px 12px;
                    margin-top: 4px;
                  }
                  .checkout-summary-mobile .csm-badge {
                    font-family: "JetBrains Mono", ui-monospace, monospace;
                    font-size: 9px;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    color: #D4A85C;
                    font-weight: 600;
                  }
                  .checkout-summary-mobile .csm-badge::before {
                    content: "✓";
                    color: #A0792E;
                    margin-right: 4px;
                    font-weight: 700;
                  }
                }
                .ck-input:focus, .ck-select:focus {
                  border-color: ${BRONZE_LIGHT} !important;
                  background: #303030 !important;
                }
              `}</style>

              <div className="checkout-summary-mobile" aria-label="Resumo do pedido">
                <div className="csm-thumb">
                  <video
                    src="/volante/volante-video.mp4"
                    poster="/volante/volante-corpo.jpg"
                    autoPlay
                    loop
                    muted
                    playsInline
                    aria-hidden="true"
                  />
                  <span className="csm-thumb-badge">TOP 6%</span>
                </div>
                <div className="csm-info">
                  <span className="csm-name">Volante MRA</span>
                  <span className="csm-meta">MGTe 27,01 · Nelore PO</span>
                  <div className="csm-badges">
                    <span className="csm-badge">Pré-reserva gratuita</span>
                    <span className="csm-badge">Frete incluso</span>
                  </div>
                </div>
              </div>

              {/* 01 · Reserva */}
              <div className="inline-flex items-center gap-3" style={sectionLabel}>
                <span style={{ width: '22px', height: '1px', background: BRONZE }} />
                01 · Reserva
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                <div style={{ marginBottom: '4px', gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Doses que pretende reservar *</label>
                  <select className="ck-select" style={selectStyle} defaultValue="">
                    <option value="">Selecione…</option>
                    <option value="1-100">1 a 100 doses</option>
                    <option value="101-200">101 a 200 doses</option>
                    <option value="201-500">201 a 500 doses</option>
                    <option value="500+">Acima de 500 doses</option>
                    <option value="indef">Quero orientação do curador</option>
                  </select>
                </div>

                <div style={{ marginBottom: '4px' }}>
                  <label style={labelStyle}>Quantidade de matrizes</label>
                  <input
                    className="ck-input"
                    type="text"
                    inputMode="numeric"
                    placeholder="Ex: 300"
                    style={fieldStyle}
                  />
                  <div style={helperStyle}>
                    Aproximado tudo bem — usado pra dimensionar a proposta
                  </div>
                </div>

                <div style={{ marginBottom: '4px' }}>
                  <label style={labelStyle}>Tipo de sêmen</label>
                  <select className="ck-select" style={selectStyle} defaultValue="convencional">
                    <option value="convencional">Convencional</option>
                    <option value="sexado">Sexado</option>
                    <option value="ambos">Ambos</option>
                    <option value="indef">Decidir com o curador</option>
                  </select>
                </div>

                <div style={{ marginBottom: '4px' }}>
                  <label style={labelStyle}>Estação reprodutiva</label>
                  <select className="ck-select" style={selectStyle} defaultValue="">
                    <option value="">Selecione…</option>
                    <option value="2026-1">1º semestre 2026</option>
                    <option value="2026-2">2º semestre 2026</option>
                    <option value="2027">2027</option>
                    <option value="indef">A definir</option>
                  </select>
                </div>
              </div>

              {/* 02 · Contato */}
              <div style={{ marginTop: '36px' }}>
                <div className="inline-flex items-center gap-3" style={sectionLabel}>
                  <span style={{ width: '22px', height: '1px', background: BRONZE }} />
                  02 · Contato
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                <div style={{ marginBottom: '4px', gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Nome completo *</label>
                  <input
                    className="ck-input"
                    type="text"
                    placeholder="Seu nome completo"
                    style={fieldStyle}
                  />
                </div>

                <div style={{ marginBottom: '4px' }}>
                  <label style={labelStyle}>WhatsApp *</label>
                  <input
                    className="ck-input"
                    type="tel"
                    inputMode="tel"
                    placeholder="(31) 99999-9999"
                    style={fieldStyle}
                  />
                </div>

                <div style={{ marginBottom: '4px' }}>
                  <label style={labelStyle}>E-mail</label>
                  <input
                    className="ck-input"
                    type="email"
                    placeholder="voce@exemplo.com (opcional)"
                    style={fieldStyle}
                  />
                  <div style={helperStyle}>Opcional — podemos confirmar pelo WhatsApp</div>
                </div>

                <div style={{ marginBottom: '4px' }}>
                  <label style={labelStyle}>Estado</label>
                  <select className="ck-select" style={selectStyle} defaultValue="">
                    <option value="">Selecione…</option>
                    {ESTADOS.map(([uf, nome]) => (
                      <option key={uf} value={uf}>
                        {nome}
                      </option>
                    ))}
                  </select>
                  <div style={helperStyle}>Opcional</div>
                </div>

                <div style={{ marginBottom: '4px' }}>
                  <label style={labelStyle}>Cidade</label>
                  <select
                    disabled
                    style={{
                      ...selectStyle,
                      opacity: 0.55,
                      cursor: 'not-allowed',
                    }}
                    defaultValue=""
                  >
                    <option value="">Selecione o estado primeiro</option>
                  </select>
                  <div style={helperStyle}>Selecione o estado primeiro</div>
                </div>
              </div>

              <p
                style={{
                  marginTop: '24px',
                  fontSize: '12.5px',
                  color: TEXT_MUTED,
                  lineHeight: 1.5,
                }}
              >
                Ao enviar você autoriza o contato do time Fórmula do Boi via WhatsApp ou
                e-mail. Não compartilhamos seus dados.
              </p>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2.5 transition-all"
                style={{
                  width: '100%',
                  marginTop: '28px',
                  background: BRONZE,
                  color: INK,
                  border: `1px solid ${BRONZE}`,
                  padding: '16px 24px',
                  borderRadius: '2px',
                  fontFamily: FONT_MONO,
                  fontWeight: 600,
                  fontSize: '13px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  opacity: 1,
                  boxShadow:
                    '0 0 0 1px rgba(212,168,92,0.35), 0 0 60px rgba(212,168,92,0.18)',
                }}
              >
                Enviar pré-reserva
                <span aria-hidden="true" style={{ marginLeft: '4px' }}>
                  →
                </span>
              </button>

              <p
                style={{
                  marginTop: '14px',
                  fontFamily: FONT_MONO,
                  fontSize: '10.5px',
                  letterSpacing: '0.14em',
                  color: TEXT_MUTED,
                  textTransform: 'uppercase',
                  textAlign: 'center',
                }}
              >
                Pré-reserva sem custo · Confirmação por WhatsApp
              </p>
            </form>

            {/* ===== Sidebar ===== */}
            <aside
              className="card-engraved"
              style={{
                background: INK,
                border: `1px solid ${BRONZE_BORDER}`,
                borderRadius: '4px',
                overflow: 'hidden',
                position: 'sticky',
                top: '24px',
              }}
            >
              <div
                style={{
                  aspectRatio: '16 / 10',
                  background: 'linear-gradient(135deg, #161616 0%, #1F1A0E 100%)',
                  borderBottom: `1px solid ${BRONZE_BORDER}`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <video
                  src="/volante/volante-video.mp4"
                  poster="/volante/volante-corpo.jpg"
                  autoPlay
                  loop
                  muted
                  playsInline
                  aria-label="Volante MRA"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    fontFamily: FONT_MONO,
                    fontSize: '10px',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: INK,
                    background: BRONZE,
                    padding: '4px 8px',
                    fontWeight: 600,
                  }}
                >
                  TOP 6%
                </span>
              </div>

              <div className="p-6">
                <div
                  className="font-display"
                  style={{
                    fontSize: '22px',
                    fontWeight: 500,
                    color: SELO,
                    letterSpacing: '-0.015em',
                    lineHeight: 1.15,
                    marginBottom: '4px',
                    fontFamily: FONT_DISPLAY,
                  }}
                >
                  Volante MRA
                </div>
                <div
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: '11px',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: TEXT_MUTED,
                    marginBottom: '18px',
                  }}
                >
                  MRA 10701 · Nelore PO
                </div>

                {([
                  ['MGTe', '27,01'],
                  ['iABCZ', '22,53'],
                  ['IQG', '25,18'],
                  ['Central', 'Bela Vista'],
                  ['Doses pretendidas', '—'],
                  ['Tipo de sêmen', 'Convencional'],
                ] as [string, string][]).map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-3" style={sideRow}>
                    <span style={sideLabel}>{k}</span>
                    <span style={k === 'Doses pretendidas' || k === 'Tipo de sêmen' ? { ...sideValue, fontSize: '12.5px', fontWeight: 400 } : sideValue}>
                      {v}
                    </span>
                  </div>
                ))}

                <div
                  style={{
                    marginTop: '16px',
                    padding: '14px 16px',
                    border: `1px solid ${BRONZE_BORDER}`,
                    borderTop: `1px solid ${BRONZE}`,
                    borderRadius: '3px',
                    background:
                      'linear-gradient(180deg, rgba(212,168,92,0.07) 0%, rgba(212,168,92,0.02) 100%)',
                  }}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span
                      className="font-display"
                      style={{
                        fontSize: '16px',
                        fontWeight: 500,
                        color: SELO,
                        letterSpacing: '-0.01em',
                        fontFamily: FONT_DISPLAY,
                      }}
                    >
                      Frete grátis
                    </span>
                    <span
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: '10px',
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        color: BRONZE_LIGHT,
                      }}
                    >
                      Incluso
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_MONO,
                      fontSize: '10px',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: TEXT_DIM,
                      marginTop: '6px',
                    }}
                  >
                    Entrega das doses sem custo
                  </div>
                </div>

                <p
                  style={{
                    marginTop: '16px',
                    fontFamily: FONT_MONO,
                    fontSize: '10px',
                    letterSpacing: '0.12em',
                    color: TEXT_MUTED,
                    lineHeight: 1.5,
                    textTransform: 'uppercase',
                  }}
                >
                  Pré-reserva sem custo. Valores e condições confirmados pelo curador
                  conforme volume e estação.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer
        className="relative bg-[#161616] text-[#F5F0E4] pt-10 pb-3 md:pt-14 md:pb-4 overflow-hidden"
        style={{ borderTop: '1px solid rgba(212,168,92,0.22)' }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          style={{ transform: 'translateY(-4%)' }}
        >
          {[
            { filter: 'invert(1) brightness(0.18) blur(3px)', opacity: 0.55, transform: 'translate(3px, 4px)' },
            { filter: 'invert(1) brightness(0.22) blur(1px)', opacity: 0.7, transform: 'translate(1.5px, 2px)' },
            { filter: 'invert(1) brightness(0.18)', opacity: 0.4, transform: 'translate(-1.5px, -2px)' },
            { filter: 'invert(1) brightness(0.04)', opacity: 1 },
          ].map((s, i) => (
            <img
              key={i}
              src="/volante/logo-formula-fundo.png"
              alt=""
              className="absolute object-contain"
              style={{ width: 'clamp(360px, 48vw, 650px)', ...s }}
            />
          ))}
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 120% 100% at 50% 50%, transparent 30%, rgba(0,0,0,0.5) 100%)',
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6 md:gap-12 md:mb-8">
            <div className="space-y-4 md:space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex flex-col items-center md:items-start">
                <img
                  src="/volante/logo-formula-do-boi-vertical.png"
                  alt="Fórmula do Boi"
                  className="w-auto mb-4 md:mb-6"
                  style={{ height: '40px' }}
                />
              </div>
              <p
                className="text-[15px] md:text-base leading-relaxed"
                style={{ color: 'rgba(245,240,228,0.68)', maxWidth: '38ch' }}
              >
                Curadoria de Nelore PO — sêmen top 0.1%, doadoras consagradas, embriões
                FIV selecionados e leilões com curadoria especializada.
              </p>
              <div className="flex gap-3">
                <a
                  href="https://www.instagram.com/formuladoboi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center transition-colors hover:bg-[#A0792E] hover:text-[#161616]"
                  style={{
                    width: '38px',
                    height: '38px',
                    border: '1px solid rgba(212,168,92,0.35)',
                    color: BRONZE_LIGHT,
                    borderRadius: '2px',
                  }}
                  aria-label="Instagram"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                    aria-hidden="true"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <h3
                className="mb-5 md:mb-7"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: '13px',
                  letterSpacing: '0.26em',
                  textTransform: 'uppercase',
                  color: BRONZE_LIGHT,
                  fontWeight: 500,
                }}
              >
                Navegação
              </h3>
              <ul
                className="space-y-3 md:space-y-3.5 text-[15px] md:text-base"
                style={{ color: 'rgba(245,240,228,0.72)' }}
              >
                <li>
                  <Link className="hover:text-[#D4A85C] transition-colors" href="/semen">
                    Sêmen
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[#D4A85C] transition-colors" href="/embrioes">
                    Embriões
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[#D4A85C] transition-colors" href="/grupo-vip">
                    Grupo VIP
                  </Link>
                </li>
              </ul>
            </div>

            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <h3
                className="mb-5 md:mb-7"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: '13px',
                  letterSpacing: '0.26em',
                  textTransform: 'uppercase',
                  color: BRONZE_LIGHT,
                  fontWeight: 500,
                }}
              >
                Contato
              </h3>
              <ul
                className="space-y-4 md:space-y-5 text-[15px] md:text-base"
                style={{ color: 'rgba(245,240,228,0.78)' }}
              >
                <li className="flex flex-col md:flex-row items-center md:items-start gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-[18px] h-[18px] mt-0.5 shrink-0"
                    aria-hidden="true"
                    style={{ color: BRONZE }}
                  >
                    <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
                  </svg>
                  <span>
                    (31) 9414-9161
                    <br />
                    (31) 7565-9900
                  </span>
                </li>
                <li className="flex flex-col md:flex-row items-center md:items-start gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-[18px] h-[18px] mt-0.5 shrink-0"
                    aria-hidden="true"
                    style={{ color: BRONZE }}
                  >
                    <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                  </svg>
                  <span>formuladoboi@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div
            className="flex flex-col md:flex-row items-center justify-center gap-5 md:gap-10"
            style={{ borderTop: '1px solid rgba(212,168,92,0.14)', padding: '16px 0 0' }}
          >
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: '11px',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'rgba(245,240,228,0.48)',
                fontWeight: 500,
              }}
            >
              Parceiros
            </span>
            {[
              'Bula Assessoria · Bula Remates',
              'Aceleradora de Touros',
              'Central Bela Vista',
              'Nelore Visual',
            ].map((p) => (
              <span
                key={p}
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: '12px',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'rgba(245,240,228,0.74)',
                  fontWeight: 500,
                }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </main>
  )
}
