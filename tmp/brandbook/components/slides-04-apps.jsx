/* Slides: Aplicações — Leilões, Sêmen, Embriões */

// ==================== LEILÕES ====================
window.SlideLeiloes = function SlideLeiloes() {
  return (
    <section data-screen-label="14 Aplicações — Leilões">
      <SlideMeta section="§ 09" title="APLICAÇÕES · LEILÕES PO" />
      <div className="slide-pad" style={{ paddingTop: 120 }}>
        <div className="eyebrow">— FRENTE DE NEGÓCIO 01 / 03</div>
        <div className="h-1" style={{ marginTop: 10, fontSize: 48 }}>Assessoria de leilões PO.</div>

        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, flex: 1 }}>
          {/* Catálogo de lote */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: 24, borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="flex items-center gap-3">
                <BullBronze width={28}/>
                <span className="mono-sm text-bronze">CATÁLOGO · PÁGINA DE LOTE</span>
              </div>
              <span className="mono-sm text-mute" style={{ fontSize: 10 }}>A4 · 210×297mm</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              <PhImg label="FOTO LOTE · 3/4 PERFIL" style={{ aspectRatio: '1/1.4' }}/>
              <div style={{ padding: 28, background: 'var(--ink)' }}>
                <div className="mono-sm text-bronze">LOTE 07</div>
                <div style={{ fontFamily: 'Space Grotesk', fontSize: 34, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1, marginTop: 6 }}>Dona<br/>Serena FIV</div>
                <div className="mono-sm text-mute" style={{ marginTop: 6, fontSize: 10 }}>REG. BR-42871 · NASC. 08/2022</div>
                <div className="hr" style={{ margin: '16px 0' }}/>
                <div className="mono-sm text-bronze" style={{ marginBottom: 8 }}>AVALIAÇÃO GENÉTICA</div>
                <div className="flex col gap-2">
                  {[
                    ['MGTe', '147.3', 82],
                    ['DEP.P365', '+14.8', 91],
                    ['DEP.PERÍM', '+1.12', 76],
                    ['IABCGc', '+0.68', 88],
                  ].map(([k,v,p]) => (
                    <div key={k}>
                      <div className="flex justify-between" style={{ fontFamily: 'JetBrains Mono', fontSize: 10 }}>
                        <span className="text-mute">{k}</span>
                        <span className="text-fg">{v}</span>
                      </div>
                      <div style={{ height: 2, background: 'rgba(232,203,133,0.1)', marginTop: 2 }}>
                        <div style={{ height: '100%', width: `${p}%`, background: 'var(--bronze)' }}/>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mono-sm" style={{ marginTop: 14, color: 'var(--bronze)', fontSize: 10 }}>TOP 0.3% RANKING NELORE</div>
              </div>
            </div>
          </div>

          {/* Post IG + WhatsApp */}
          <div className="flex col gap-4" style={{ minHeight: 0 }}>
            {/* IG post */}
            <div className="card" style={{ padding: 0, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <div style={{ padding: 12, borderBottom: '1px solid var(--line)' }}>
                <span className="mono-sm text-bronze">POST DIVULGAÇÃO · 1080×1350</span>
              </div>
              <div style={{ padding: 0, background: 'var(--black)', flex: 1, position: 'relative', minHeight: 0 }}>
                <div className="abs" style={{ top: 16, left: 16, right: 16 }}>
                  <div className="flex items-center justify-between">
                    <BullBronze width={28}/>
                    <span className="mono-sm text-bronze" style={{ fontSize: 9 }}>LEILÃO · 28.NOV.2025</span>
                  </div>
                </div>
                <PhImg label="NELORE · 3/4 BRONZE GLOW" style={{ position: 'absolute', inset: '48px 16px 96px', aspectRatio: 'auto' }}/>
                <div className="abs" style={{ bottom: 16, left: 16, right: 16 }}>
                  <div style={{ fontFamily: 'Space Grotesk', fontSize: 18, fontWeight: 500, color: 'var(--fg)', lineHeight: 1, letterSpacing: '-0.02em' }}>
                    Leilão Fórmula do Boi <span className="text-bronze">2025</span>
                  </div>
                  <div className="mono-sm text-bronze" style={{ marginTop: 6, fontSize: 9 }}>42 LOTES · PO · CURADORIA</div>
                </div>
              </div>
            </div>

            {/* WhatsApp banner */}
            <div className="card" style={{ padding: 0, flexShrink: 0 }}>
              <div style={{ padding: 12, borderBottom: '1px solid var(--line)' }}>
                <span className="mono-sm text-bronze">BANNER WHATSAPP · 1200×630</span>
              </div>
              <div style={{ padding: 18, background: 'linear-gradient(135deg, #0a0a0a 0%, #2a1f10 100%)', height: 140, position: 'relative', overflow: 'hidden' }}>
                <DNAStrand width={240} height={32} style={{ position: 'absolute', top: 10, right: 10, opacity: 0.4 }}/>
                <div style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1, marginTop: 8 }}>
                  Curadoria de<br/>
                  <span className="text-bronze">genética PO</span>
                </div>
                <div className="mono-sm text-mute" style={{ fontSize: 9, marginTop: 8 }}>FALE COM NOSSO TIME → WA.ME/...</div>
                <WordmarkBronze width={110} style={{ position: 'absolute', bottom: 14, right: 14 }}/>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SlideFoot num={14} label="LEILÕES PO" />
    </section>
  );
};

// ==================== SÊMEN ====================
window.SlideSemen = function SlideSemen() {
  return (
    <section data-screen-label="15 Aplicações — Sêmen">
      <SlideMeta section="§ 09" title="APLICAÇÕES · SÊMEN" />
      <div className="slide-pad" style={{ paddingTop: 140 }}>
        <div className="eyebrow">— FRENTE DE NEGÓCIO 02 / 03</div>
        <div className="h-1" style={{ marginTop: 16, fontSize: 56 }}>Comercialização de sêmen.</div>

        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 20, flex: 1 }}>
          {/* Ficha técnica touro */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: 18, borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between' }}>
              <span className="mono-sm text-bronze">FICHA TÉCNICA · TOURO</span>
              <span className="mono-sm text-mute" style={{ fontSize: 10 }}>A5</span>
            </div>
            <PhImg label="TOURO · CLOSE CARA" style={{ aspectRatio: '16/7' }}/>
            <div style={{ padding: 20 }}>
              <div className="flex justify-between items-baseline">
                <div>
                  <div style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1 }}>Imperador<br/>da Matinha</div>
                  <div className="mono-sm text-mute" style={{ marginTop: 4, fontSize: 10 }}>REG. BRGN-09921</div>
                </div>
                <div className="tag" style={{ padding: '4px 10px', fontSize: 9 }}>
                  <span className="pip"/>TOP 0.1%
                </div>
              </div>
              <div className="hr" style={{ margin: '14px 0' }}/>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  ['DEP.P365', '+18.2'], ['MGTe', '156.8'],
                  ['IABCGc', '+0.82'], ['PERÍM. ESC', '+1.41'],
                  ['PN30M', '+0.841'], ['STAY', '+0.36'],
                ].map(([k,v]) => (
                  <div key={k} style={{ padding: '8px 10px', background: 'var(--ink)' }}>
                    <div className="mono-sm text-mute" style={{ fontSize: 9 }}>{k}</div>
                    <div className="mono" style={{ color: 'var(--bronze)', fontSize: 14, fontWeight: 500 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div className="mono-sm text-mute" style={{ marginTop: 14, fontSize: 10 }}>VALOR/DOSE · R$ 480,00 · DISP. 1.200 DOSES</div>
            </div>
          </div>

          {/* Catálogo multi-touros */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: 16, borderBottom: '1px solid var(--line)' }}>
              <span className="mono-sm text-bronze">CATÁLOGO · LISTAGEM</span>
            </div>
            <div style={{ padding: 16 }}>
              {[
                ['IMPERADOR DA MATINHA', 'TOP 0.1%', '156.8'],
                ['JAVARI FIV', 'TOP 0.3%', '148.2'],
                ['REIZINHO DO NORTE', 'TOP 0.5%', '142.5'],
                ['AGUIA DA BAIXADA', 'TOP 0.8%', '138.9'],
              ].map(([n, t, v], i) => (
                <div key={n} style={{ display: 'grid', gridTemplateColumns: '36px 1fr auto', gap: 10, alignItems: 'center', padding: '12px 0', borderBottom: i<3 ? '1px solid var(--line)' : 'none' }}>
                  <PhImg style={{ aspectRatio: '1/1', height: 36 }}/>
                  <div>
                    <div className="mono" style={{ fontSize: 11, fontWeight: 500 }}>{n}</div>
                    <div className="mono-sm text-mute" style={{ fontSize: 9 }}>{t}</div>
                  </div>
                  <div className="mono" style={{ color: 'var(--bronze)', fontSize: 14 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Embalagem pipeta + Anúncio IG */}
          <div className="flex col gap-4">
            {/* Pipeta */}
            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: 14, borderBottom: '1px solid var(--line)' }}>
                <span className="mono-sm text-bronze">ID PIPETA · 48×12MM</span>
              </div>
              <div style={{ padding: 24, background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 300, height: 30, background: 'var(--ink-2)', border: '1px solid var(--line-strong)', display: 'flex', alignItems: 'center', padding: '0 10px', gap: 8, fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--bronze)', letterSpacing: '0.1em' }}>
                  <BullBronze width={14}/>
                  <span>FDB</span>
                  <span style={{ color: 'var(--fg)'}}>BRGN-09921</span>
                  <span className="text-mute">25/11</span>
                  <span className="text-mute">#1240</span>
                </div>
              </div>
            </div>
            {/* IG ad */}
            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: 14, borderBottom: '1px solid var(--line)' }}>
                <span className="mono-sm text-bronze">ANÚNCIO IG · 1080×1080</span>
              </div>
              <div style={{ aspectRatio: '1/1', background: 'var(--black)', padding: 20, position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontFamily: 'Space Grotesk', fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1 }}>
                  <span className="text-bronze">Top 0.1%</span><br/>
                  do ranking<br/>genético
                </div>
                <div style={{ marginTop: 16, fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--bronze)', letterSpacing: '0.1em' }}>MGTe 156.8 · DEP.P365 +18.2</div>
                <BullBronze width={60} style={{ position: 'absolute', bottom: 16, right: 16, opacity: 0.9 }}/>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SlideFoot num={15} label="SÊMEN" />
    </section>
  );
};

// ==================== EMBRIÕES ====================
window.SlideEmbrioes = function SlideEmbrioes() {
  return (
    <section data-screen-label="16 Aplicações — Embriões">
      <SlideMeta section="§ 09" title="APLICAÇÕES · EMBRIÕES" />
      <div className="slide-pad" style={{ paddingTop: 140 }}>
        <div className="eyebrow">— FRENTE DE NEGÓCIO 03 / 03</div>
        <div className="h-1" style={{ marginTop: 16, fontSize: 56 }}>Embriões FIV selecionados.</div>

        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 20, flex: 1 }}>
          {/* Proposta */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: 18, borderBottom: '1px solid var(--line)' }}>
              <span className="mono-sm text-bronze">PROPOSTA COMERCIAL · CAPA</span>
            </div>
            <div style={{ padding: 32, background: 'radial-gradient(ellipse at top right, rgba(212,168,92,0.18), transparent 60%), var(--ink)', height: 480, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <LogoBronze width={160}/>
                <div className="mono-sm text-bronze" style={{ marginTop: 32, fontSize: 10 }}>PROPOSTA COMERCIAL · 2025/11</div>
                <div style={{ fontFamily: 'Space Grotesk', fontSize: 36, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1, marginTop: 14 }}>
                  Produção de<br/>embriões FIV<br/><span className="text-bronze">Dona Serena × Imperador</span>
                </div>
              </div>
              <div>
                <div className="hr" style={{ marginBottom: 12 }}/>
                <div className="flex justify-between">
                  <div>
                    <div className="mono-sm text-mute" style={{ fontSize: 9 }}>CLIENTE</div>
                    <div className="mono" style={{ fontSize: 11 }}>FAZ. SANTA CLARA LTDA</div>
                  </div>
                  <div>
                    <div className="mono-sm text-mute" style={{ fontSize: 9 }}>VÁLIDA ATÉ</div>
                    <div className="mono" style={{ fontSize: 11 }}>30.DEZ.2025</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Certificado */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: 18, borderBottom: '1px solid var(--line)' }}>
              <span className="mono-sm text-bronze">CERTIFICADO GENÉTICO</span>
            </div>
            <div style={{ padding: 24, height: 480, display: 'flex', flexDirection: 'column' }}>
              <div className="flex items-start justify-between">
                <BullBronze width={40}/>
                <div className="mono-sm text-bronze" style={{ fontSize: 9, textAlign: 'right' }}>FDB-EMB<br/>#2025-0042</div>
              </div>
              <div className="mono-sm" style={{ marginTop: 18, letterSpacing: '0.2em', fontSize: 10, color: 'var(--bronze)' }}>CERTIFICADO DE ORIGEM GENÉTICA</div>
              <div style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.1, marginTop: 8 }}>Embrião FIV<br/>certificado</div>
              <div className="hr" style={{ marginTop: 18, marginBottom: 18 }}/>
              {/* Mini tree */}
              <div>
                <div className="mono-sm text-mute" style={{ fontSize: 9, marginBottom: 8 }}>PEDIGREE</div>
                <TreeGraphMini/>
              </div>
              <div style={{ flex: 1 }}/>
              <div style={{ paddingTop: 14, borderTop: '1px dashed var(--line-strong)' }}>
                <div className="mono-sm text-mute" style={{ fontSize: 9 }}>AUTENTICAÇÃO</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--bronze)', marginTop: 4, letterSpacing: '0.05em' }}>SHA-256 · 9f4a...b23e</div>
              </div>
            </div>
          </div>

          {/* Post divulgação */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: 14, borderBottom: '1px solid var(--line)' }}>
              <span className="mono-sm text-bronze">POST PRODUÇÃO · 1080×1350</span>
            </div>
            <div style={{ aspectRatio: '4/5', background: 'var(--black)', position: 'relative' }}>
              <PhImg label="LAB FIV · MICROSCÓPIO" style={{ position: 'absolute', inset: 0, aspectRatio: 'auto' }}/>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 40%, rgba(0,0,0,0.9) 100%)' }}/>
              <div style={{ position: 'absolute', top: 18, left: 18, right: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <BullBronze width={28}/>
                <span className="mono-sm text-bronze" style={{ fontSize: 9 }}>FIV · SESSÃO #47</span>
              </div>
              <div style={{ position: 'absolute', bottom: 18, left: 18, right: 18 }}>
                <div className="mono-sm text-bronze" style={{ fontSize: 9 }}>CRUZAMENTO SELECIONADO</div>
                <div style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1, marginTop: 6 }}>Dona Serena<br/>× Imperador</div>
                <div className="mono-sm text-mute" style={{ fontSize: 8, marginTop: 6 }}>24 EMBRIÕES VIÁVEIS · FEV/2026</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SlideFoot num={16} label="EMBRIÕES" />
    </section>
  );
};

function TreeGraphMini() {
  return (
    <svg width="100%" height="120" viewBox="0 0 260 120">
      <line x1="20" y1="60" x2="90" y2="30" stroke="#A0792E" strokeWidth="0.8"/>
      <line x1="20" y1="60" x2="90" y2="90" stroke="#A0792E" strokeWidth="0.8"/>
      <line x1="90" y1="30" x2="180" y2="15" stroke="#A0792E" strokeWidth="0.6" opacity="0.5"/>
      <line x1="90" y1="30" x2="180" y2="45" stroke="#A0792E" strokeWidth="0.6" opacity="0.5"/>
      <line x1="90" y1="90" x2="180" y2="75" stroke="#A0792E" strokeWidth="0.6" opacity="0.5"/>
      <line x1="90" y1="90" x2="180" y2="105" stroke="#A0792E" strokeWidth="0.6" opacity="0.5"/>
      {[[20,60,5,'EMB'],[90,30,4,'♀'],[90,90,4,'♂'],[180,15,3,''],[180,45,3,''],[180,75,3,''],[180,105,3,'']].map(([x,y,r,l],i)=>(
        <g key={i}>
          <circle cx={x} cy={y} r={r} fill="#0A0A0A" stroke="#A0792E" strokeWidth="1"/>
          {l && <text x={x} y={y+2} fontFamily="JetBrains Mono" fontSize="7" fill="#A0792E" textAnchor="middle">{l}</text>}
        </g>
      ))}
      <text x="20" y="85" fontFamily="JetBrains Mono" fontSize="7" fill="#9A928A" textAnchor="middle">G1</text>
      <text x="90" y="12" fontFamily="JetBrains Mono" fontSize="7" fill="#9A928A" textAnchor="middle">Dona Serena</text>
      <text x="90" y="112" fontFamily="JetBrains Mono" fontSize="7" fill="#9A928A" textAnchor="middle">Imperador</text>
    </svg>
  );
}

Object.assign(window, { SlideLeiloes, SlideSemen, SlideEmbrioes });
