'use client'

import { getCheckoutUrl } from '../utils/checkoutUrl'

const STATS = [
  { label: 'iABCZ', value: '36,5',  sub: 'DECA 1 · PMGZ' },
  { label: 'IQG',   value: '38,25', sub: 'TOP 0,5% · Geneplus' },
  { label: 'MGTe',  value: '35,12', sub: 'TOP 0,1% · ANCP' },
]

const SPEC = [
  { label: 'Matrícula',    value: 'RG LCF 1265' },
  { label: 'Raça',         value: 'Nelore PO' },
  { label: 'Nascimento',   value: '15/09/2024 · 20 meses' },
  { label: 'Sexo',         value: 'Macho' },
  { label: 'Criatório',    value: 'Nelore TresMar' },
  { label: 'Peso · CE',    value: '680 kg · 36 cm CE' },
  { label: 'Av. Genômica', value: 'Confirmada' },
  { label: 'Sêmen',        value: 'Convencional' },
  { label: 'Evento',       value: '3º Leilão Virtual TR3SMAR · Lote 01' },
  { label: 'Situação',     value: 'Pré-reserva aberta', hl: true },
]

export default function Apresentamos() {
  const checkoutUrl = getCheckoutUrl()
  return (
    <section className="apresentamos" id="touro">
      <div className="apresentamos__inner">
        {/* coluna esquerda */}
        <div>
          <div className="touro__eyebrow">
            <span className="touro__eyebrow-dot">●</span>O Touro
          </div>
          <h2 className="touro__title">CONAN FIV <i>TresMar.</i></h2>
          <p className="touro__sub">
            LCF 1265 · CONAN FIV TRESMAR · Superprecoce. Resultado direto no campo, na balança e no bolso.
          </p>

          <div className="touro__stats">
            {STATS.map(s => (
              <div className="touro__stat" key={s.label}>
                <div className="touro__stat-label">{s.label}</div>
                <div className="touro__stat-val">{s.value}</div>
                <div className="touro__stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="touro__cta-wrap">
            <div className="hero-cta-group">
              <a href={checkoutUrl} className="btn-primary fdb-cta-anim">RESERVAR DOSE →</a>
              <p className="hero-cta-note">
                <span className="hero-cta-note__dot" />
                Pré-reserva gratuita · Curador confirma em até 24h
              </p>
            </div>
          </div>
        </div>

        {/* coluna direita */}
        <div>
          <div
            className="touro__photo"
            style={{ backgroundImage: 'url(/conan/assets/conan-retrato.jpg)' }}
          >
            <span className="touro__corner touro__corner--tl" aria-hidden="true" />
            <span className="touro__corner touro__corner--tr" aria-hidden="true" />
            <span className="touro__corner touro__corner--bl" aria-hidden="true" />
            <span className="touro__corner touro__corner--br" aria-hidden="true" />
            <div className="touro__photo-cap">
              <div>
                <div className="touro__photo-cap-kicker">Foto · CONAN FIV TresMar</div>
                <div className="touro__photo-cap-name">CONAN FIV TresMar</div>
              </div>
              <div className="touro__photo-cap-tag">Nelore TresMar</div>
            </div>
          </div>

          <div className="touro__spec">
            {SPEC.map(row => (
              <div className="touro__spec-row" key={row.label}>
                <div className="touro__spec-label">{row.label}</div>
                <div className={`touro__spec-val${row.hl ? ' touro__spec-val--hl' : ''}`}>{row.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}