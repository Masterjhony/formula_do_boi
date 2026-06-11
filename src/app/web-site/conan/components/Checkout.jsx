'use client'

import { useEffect, useState } from 'react'
import Brandbar from './Brandbar'
import Footer from './Footer'

const MONO = '"JetBrains Mono", ui-monospace, monospace'
const DISPLAY = '"Space Grotesk", system-ui, sans-serif'

const DOSES_OPTS = [
  { value: '', label: 'Selecione…' },
  { value: '1-100', label: '1 a 100 doses' },
  { value: '101-200', label: '101 a 200 doses' },
  { value: '201-500', label: '201 a 500 doses' },
  { value: '500+', label: 'Acima de 500 doses' },
  { value: 'indef', label: 'Quero orientação do curador' },
]
const SEMEN_OPTS = [
  { value: 'convencional', label: 'Convencional' },
  { value: 'sexado', label: 'Sexado' },
  { value: 'ambos', label: 'Ambos' },
  { value: 'indef', label: 'Decidir com o curador' },
]
const ESTACAO_OPTS = [
  { value: '', label: 'Selecione…' },
  { value: '2026-1', label: '1º semestre 2026' },
  { value: '2026-2', label: '2º semestre 2026' },
  { value: '2027', label: '2027' },
  { value: 'indef', label: 'A definir' },
]
const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']
const UF_NOMES = {
  AC:'Acre',AL:'Alagoas',AP:'Amapá',AM:'Amazonas',BA:'Bahia',CE:'Ceará',DF:'Distrito Federal',ES:'Espírito Santo',
  GO:'Goiás',MA:'Maranhão',MT:'Mato Grosso',MS:'Mato Grosso do Sul',MG:'Minas Gerais',PA:'Pará',PB:'Paraíba',
  PR:'Paraná',PE:'Pernambuco',PI:'Piauí',RJ:'Rio de Janeiro',RN:'Rio Grande do Norte',RS:'Rio Grande do Sul',
  RO:'Rondônia',RR:'Roraima',SC:'Santa Catarina',SP:'São Paulo',SE:'Sergipe',TO:'Tocantins',
}

// estilos base (inline, fiéis ao checkout Volante)
const labelStyle = {
  display: 'block', fontFamily: MONO, fontSize: '10.5px', letterSpacing: '0.22em',
  textTransform: 'uppercase', color: '#D4A85C', marginBottom: '8px', fontWeight: 500,
}
const fieldBase = {
  width: '100%', background: '#2a2a2a', border: '1px solid rgba(212,168,92,0.28)',
  borderRadius: '2px', color: '#F5F0E4', fontSize: '16px', padding: '14px 16px',
  minHeight: '50px', outline: 'none', transition: 'border-color .25s, background .25s',
}
const selectStyle = {
  ...fieldBase,
  padding: '14px 40px 14px 16px', appearance: 'none',
  background: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23D4A85C' stroke-width='2' fill='none'/%3E%3C/svg%3E\") right 16px center no-repeat #2a2a2a",
}
const stepStyle = {
  display: 'inline-flex', alignItems: 'center', gap: '12px', fontFamily: MONO,
  fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#D4A85C', fontWeight: 500,
}
const hintStyle = { fontSize: '12px', color: 'rgba(245,240,228,0.55)', marginTop: '6px' }
const kpiRow = {
  display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px',
  padding: '8px 0', borderBottom: '1px solid rgba(212,168,92,0.14)',
}
const kpiKey = { fontFamily: MONO, fontSize: '10.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,240,228,0.55)' }
const kpiVal = { color: '#F5F0E4', fontSize: '14px', fontWeight: 500, textAlign: 'right' }

export default function Checkout() {
  const [doses, setDoses] = useState('')
  const [matrizes, setMatrizes] = useState('')
  const [semen, setSemen] = useState('convencional')
  const [estacao, setEstacao] = useState('')
  const [nome, setNome] = useState('')
  const [whats, setWhats] = useState('')
  const [email, setEmail] = useState('')
  const [estado, setEstado] = useState('')
  const [cidade, setCidade] = useState('')

  useEffect(() => { document.title = 'Pré-reserva · CONAN FIV TresMar — Fórmula do Boi' }, [])

  const dosesLabel = DOSES_OPTS.find(o => o.value === doses && o.value)?.label || '—'
  const semenLabel = SEMEN_OPTS.find(o => o.value === semen)?.label || '—'

  function onSubmit(e) {
    e.preventDefault()
    const linhas = [
      'Pré-reserva — CONAN FIV TresMar (Lote 01)',
      `Nome: ${nome || '—'}`,
      `WhatsApp: ${whats || '—'}`,
      email ? `E-mail: ${email}` : null,
      `Doses: ${dosesLabel}`,
      matrizes ? `Matrizes: ${matrizes}` : null,
      `Tipo de sêmen: ${semenLabel}`,
      estacao ? `Estação: ${ESTACAO_OPTS.find(o => o.value === estacao)?.label}` : null,
      (estado || cidade) ? `Local: ${[cidade, estado].filter(Boolean).join(' / ')}` : null,
    ].filter(Boolean)
    const msg = encodeURIComponent(linhas.join('\n'))
    window.open(`https://wa.me/5531994149161?text=${msg}`, '_blank', 'noopener')
  }

  return (
    <div className="ck-page">
      <style>{`.ck-input:focus,.ck-select:focus{border-color:#D4A85C!important;background:#303030!important}`}</style>

      <Brandbar />

      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden', background: '#161616', borderBottom: '1px solid rgba(212,168,92,0.28)' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(at 50% 0%, rgba(212,168,92,0.14) 0%, transparent 60%)' }} />
        <div className="ck-container" style={{ paddingTop: '56px', paddingBottom: '40px', position: 'relative', maxWidth: '1100px' }}>
          <a href="/conan" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: MONO, fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,240,228,0.7)', marginBottom: '22px', textDecoration: 'none' }}>← Voltar ao CONAN FIV TresMar</a>
          <div style={{ ...stepStyle, marginBottom: '20px', letterSpacing: '0.24em' }}>
            <span style={{ width: '24px', height: '1px', background: '#A0792E' }} />
            Pré-reserva · Sêmen · Aceleradora 2026
          </div>
          <h1 style={{ fontSize: 'clamp(34px, 5.6vw, 64px)', fontWeight: 500, lineHeight: 1.02, letterSpacing: '-0.025em', color: '#F5F0E4', marginBottom: '16px', maxWidth: '20ch', fontFamily: DISPLAY }}>
            Pré-reserva <span style={{ color: '#D4A85C' }}>CONAN FIV TresMar.</span>
          </h1>
          <p style={{ color: 'rgba(245,240,228,0.7)', fontSize: '16px', lineHeight: 1.55, maxWidth: '60ch' }}>
            Queremos entender seu rebanho. Preencha os campos abaixo — o curador retorna em até 24h com proposta técnica e cronograma para a sua estação reprodutiva. Pré-reserva sem custo.
          </p>
        </div>
      </section>

      {/* CORPO */}
      <section style={{ background: '#1f1f1f', borderBottom: '1px solid rgba(212,168,92,0.14)' }}>
        <div className="ck-container" style={{ paddingTop: '56px', paddingBottom: '80px', maxWidth: '1100px' }}>
          <div className="ck-grid">

            {/* FORM */}
            <form className="card-engraved ck-order-2 ck-lg-order-1" onSubmit={onSubmit}
              style={{ background: '#161616', border: '1px solid rgba(212,168,92,0.28)', padding: 'clamp(24px, 4vw, 40px)', borderRadius: '4px' }}>

              <div style={stepStyle}><span style={{ width: '22px', height: '1px', background: '#A0792E' }} />01 · Reserva</div>

              <div className="ck-fields" style={{ marginTop: '24px' }}>
                <div className="ck-span2">
                  <label style={labelStyle}>Doses que pretende reservar *</label>
                  <select className="ck-select" required value={doses} onChange={e => setDoses(e.target.value)} style={selectStyle}>
                    {DOSES_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Quantidade de matrizes</label>
                  <input className="ck-input" inputMode="numeric" placeholder="Ex: 300" value={matrizes} onChange={e => setMatrizes(e.target.value)} style={fieldBase} />
                  <div style={hintStyle}>Aproximado tudo bem — usado pra dimensionar a proposta</div>
                </div>
                <div>
                  <label style={labelStyle}>Tipo de sêmen</label>
                  <select className="ck-select" value={semen} onChange={e => setSemen(e.target.value)} style={selectStyle}>
                    {SEMEN_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Estação reprodutiva</label>
                  <select className="ck-select" value={estacao} onChange={e => setEstacao(e.target.value)} style={selectStyle}>
                    {ESTACAO_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '36px' }}>
                <div style={stepStyle}><span style={{ width: '22px', height: '1px', background: '#A0792E' }} />02 · Contato</div>
              </div>

              <div className="ck-fields" style={{ marginTop: '24px' }}>
                <div className="ck-span2">
                  <label style={labelStyle}>Nome completo *</label>
                  <input className="ck-input" required placeholder="Seu nome completo" value={nome} onChange={e => setNome(e.target.value)} style={fieldBase} />
                </div>
                <div>
                  <label style={labelStyle}>WhatsApp *</label>
                  <input className="ck-input" required inputMode="tel" type="tel" placeholder="(31) 99999-9999" value={whats} onChange={e => setWhats(e.target.value)} style={fieldBase} />
                </div>
                <div>
                  <label style={labelStyle}>E-mail</label>
                  <input className="ck-input" type="email" placeholder="voce@exemplo.com (opcional)" value={email} onChange={e => setEmail(e.target.value)} style={fieldBase} />
                  <div style={hintStyle}>Opcional — podemos confirmar pelo WhatsApp</div>
                </div>
                <div>
                  <label style={labelStyle}>Estado</label>
                  <select className="ck-select" value={estado} onChange={e => { setEstado(e.target.value); setCidade('') }} style={selectStyle}>
                    <option value="">Selecione…</option>
                    {UFS.map(uf => <option key={uf} value={uf}>{UF_NOMES[uf]}</option>)}
                  </select>
                  <div style={hintStyle}>Opcional</div>
                </div>
                <div>
                  <label style={labelStyle}>Cidade</label>
                  <input
                    className="ck-input"
                    placeholder={estado ? 'Sua cidade' : 'Selecione o estado primeiro'}
                    value={cidade}
                    disabled={!estado}
                    onChange={e => setCidade(e.target.value)}
                    style={{ ...fieldBase, opacity: estado ? 1 : 0.55, cursor: estado ? 'text' : 'not-allowed' }}
                  />
                  <div style={hintStyle}>{estado ? 'Opcional' : 'Selecione o estado primeiro'}</div>
                </div>
              </div>

              <p style={{ marginTop: '24px', fontSize: '12.5px', color: 'rgba(245,240,228,0.55)', lineHeight: 1.5 }}>
                Ao enviar você autoriza o contato do time Fórmula do Boi via WhatsApp ou e-mail. Não compartilhamos seus dados.
              </p>

              <button type="submit" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', marginTop: '28px', background: '#A0792E', color: '#161616', border: '1px solid #A0792E', padding: '16px 24px', borderRadius: '2px', fontFamily: MONO, fontWeight: 600, fontSize: '13px', letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', boxShadow: 'rgba(212,168,92,0.35) 0px 0px 0px 1px, rgba(212,168,92,0.18) 0px 0px 60px' }}>
                Enviar pré-reserva<span aria-hidden="true" style={{ marginLeft: '4px' }}>→</span>
              </button>
              <p style={{ marginTop: '14px', fontFamily: MONO, fontSize: '10.5px', letterSpacing: '0.14em', color: 'rgba(245,240,228,0.55)', textTransform: 'uppercase', textAlign: 'center' }}>
                Pré-reserva sem custo · Confirmação por WhatsApp
              </p>
            </form>

            {/* ASIDE */}
            <aside className="card-engraved ck-order-1 ck-lg-order-2 ck-sticky"
              style={{ background: '#161616', border: '1px solid rgba(212,168,92,0.28)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ aspectRatio: '16 / 10', background: 'linear-gradient(135deg, #161616 0%, #1f1a0e 100%)', borderBottom: '1px solid rgba(212,168,92,0.28)', position: 'relative', overflow: 'hidden' }}>
                <video src="/conan/assets/conan-video.mp4" poster="/conan/assets/conan-frontal.jpg" autoPlay loop muted playsInline aria-label="CONAN FIV TresMar"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <span style={{ position: 'absolute', top: '12px', left: '12px', fontFamily: MONO, fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#161616', background: '#A0792E', padding: '4px 8px', fontWeight: 600 }}>TOP 0,1%</span>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ fontSize: '22px', fontWeight: 500, color: '#F5F0E4', letterSpacing: '-0.015em', lineHeight: 1.15, marginBottom: '4px', fontFamily: DISPLAY }}>CONAN FIV TresMar</div>
                <div style={{ fontFamily: MONO, fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,240,228,0.55)', marginBottom: '18px' }}>LCF 1265 · Nelore PO</div>

                <div style={kpiRow}><span style={kpiKey}>MGTe · ANCP</span><span style={kpiVal}>35,12</span></div>
                <div style={kpiRow}><span style={kpiKey}>iABCZg · PMGZ</span><span style={kpiVal}>36,5</span></div>
                <div style={kpiRow}><span style={kpiKey}>IQGg · GENEPLUS</span><span style={kpiVal}>38,25</span></div>
                <div style={kpiRow}><span style={kpiKey}>Genômica</span><span style={kpiVal}>DECA 1 · TOP 0,1%</span></div>
                <div style={kpiRow}><span style={kpiKey}>Doses pretendidas</span><span style={{ ...kpiVal, fontSize: '12.5px', fontWeight: 400 }}>{dosesLabel}</span></div>
                <div style={kpiRow}><span style={kpiKey}>Tipo de sêmen</span><span style={{ ...kpiVal, fontSize: '12.5px', fontWeight: 400 }}>{semenLabel}</span></div>

                <div style={{ marginTop: '16px', padding: '14px 16px', borderWidth: '1px', borderStyle: 'solid', borderColor: '#A0792E rgba(212,168,92,0.28) rgba(212,168,92,0.28)', borderRadius: '3px', background: 'linear-gradient(rgba(212,168,92,0.07) 0%, rgba(212,168,92,0.02) 100%)' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 500, color: '#F5F0E4', letterSpacing: '-0.01em', fontFamily: DISPLAY }}>Frete grátis</span>
                    <span style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#D4A85C' }}>Incluso</span>
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,228,0.7)', marginTop: '6px' }}>Entrega das doses sem custo</div>
                </div>
                <p style={{ marginTop: '16px', fontFamily: MONO, fontSize: '10px', letterSpacing: '0.12em', color: 'rgba(245,240,228,0.55)', lineHeight: 1.5, textTransform: 'uppercase' }}>
                  Pré-reserva sem custo. Valores e condições confirmados pelo curador conforme volume e estação.
                </p>
              </div>
            </aside>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}