/* Slides: Institucionais (10) + Redes sociais (11) + Tom de voz (12) + Closing */

// ==================== INSTITUCIONAIS ====================
window.SlideInstitucional = function SlideInstitucional() {
  return (
    <section data-screen-label="17 Institucionais">
      <SlideMeta section="§ 10" title="APLICAÇÕES INSTITUCIONAIS" />
      <div className="slide-pad" style={{ paddingTop: 120 }}>
        <div className="eyebrow">— INSTITUCIONAIS</div>
        <div className="h-1" style={{ marginTop: 10, fontSize: 44 }}>Papelaria e presença física.</div>

        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, flex: 1, minHeight: 0 }}>
          {/* Cartão de visita */}
          <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: 12, borderBottom: '1px solid var(--line)' }}>
              <span className="mono-sm text-bronze" style={{ fontSize: 10 }}>CARTÃO · 85×55MM</span>
            </div>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--ink)', flex: 1, justifyContent: 'center' }}>
              <div style={{ aspectRatio: '85/55', background: 'var(--black)', padding: 14, position: 'relative' }}>
                <LogoBronze width={90}/>
                <div className="abs" style={{ bottom: 12, left: 12 }}>
                  <div style={{ fontFamily: 'Space Grotesk', fontSize: 12, fontWeight: 500 }}>Leonardo Serafim</div>
                  <div className="mono-sm text-bronze" style={{ fontSize: 8, marginTop: 2 }}>DIR. GENÉTICA</div>
                </div>
              </div>
              <div style={{ aspectRatio: '85/55', background: 'var(--grad-gold)', padding: 14, position: 'relative' }}>
                <BullBronze width={44} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', filter: 'brightness(0)' }}/>
              </div>
            </div>
          </div>

          {/* Assinatura de email */}
          <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: 12, borderBottom: '1px solid var(--line)' }}>
              <span className="mono-sm text-bronze" style={{ fontSize: 10 }}>ASSINATURA EMAIL</span>
            </div>
            <div style={{ padding: 16, background: '#fafafa', color: '#111', fontFamily: 'Space Grotesk', flex: 1, display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 14, borderLeft: '2px solid #A0792E' }}>
                <img src="assets/bull-bronze.svg" style={{ width: 36 }}/>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>Bulinha</div>
                  <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: '#A0792E', letterSpacing: '0.12em', marginTop: 2 }}>CEO · FUNDADOR</div>
                  <div style={{ borderTop: '1px solid #ddd', margin: '8px 0 6px' }}/>
                  <div style={{ fontSize: 9, color: '#444', lineHeight: 1.6 }}>
                    FÓRMULA DO BOI<br/>
                    +55 67 9 9999-9999<br/>
                    formuladoboi.com.br
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Backdrop leilão */}
          <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: 12, borderBottom: '1px solid var(--line)' }}>
              <span className="mono-sm text-bronze" style={{ fontSize: 10 }}>BACKDROP · 3×2M</span>
            </div>
            <div style={{ flex: 1, background: 'radial-gradient(ellipse at 30% 30%, rgba(212,168,92,0.15), transparent 60%), #000', padding: 20, position: 'relative', minHeight: 0 }}>
              <DNAStrand width={240} height={30} style={{ position: 'absolute', top: 10, right: 10, opacity: 0.3 }}/>
              <LogoBronze width={130}/>
              <div style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 0.95, marginTop: 14 }}>
                Leilão Fórmula<br/>do Boi <span className="text-bronze">2025</span>
              </div>
              <div className="mono-sm text-bronze" style={{ marginTop: 10, fontSize: 9 }}>28.NOV · CAMPO GRANDE</div>
            </div>
          </div>

          {/* Slide comercial + camiseta stacked */}
          <div className="flex col gap-4" style={{ minHeight: 0 }}>
            <div className="card" style={{ padding: 0, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <div style={{ padding: 12, borderBottom: '1px solid var(--line)' }}>
                <span className="mono-sm text-bronze" style={{ fontSize: 10 }}>SLIDE · 16:9</span>
              </div>
              <div style={{ flex: 1, background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1510 100%)', padding: 16, position: 'relative', minHeight: 0 }}>
                <LogoBronze width={80}/>
                <div style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1, marginTop: 10 }}>
                  Programa de<br/>melhoramento<br/><span className="text-bronze">genético 2026</span>
                </div>
              </div>
            </div>
            <div className="card" style={{ padding: 0, flexShrink: 0 }}>
              <div style={{ padding: 12, borderBottom: '1px solid var(--line)' }}>
                <span className="mono-sm text-bronze" style={{ fontSize: 10 }}>CAMISETA EVENTO</span>
              </div>
              <div style={{ padding: 10, display: 'flex', justifyContent: 'center', background: 'var(--ink)' }}>
                <svg viewBox="0 0 180 200" style={{ width: 100 }}>
                  <path d="M30,30 L60,15 Q90,25 120,15 L150,30 L180,55 L160,75 L150,60 L150,190 L30,190 L30,60 L20,75 L0,55 Z" fill="#0a0a0a" stroke="#333" strokeWidth="1"/>
                  <image href="assets/bull-bronze.svg" x="70" y="70" width="40" height="40"/>
                  <text x="90" y="130" fontFamily="Space Grotesk" fontSize="8" fontWeight="500" fill="#A0792E" textAnchor="middle" letterSpacing="1">FÓRMULA DO BOI</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SlideFoot num={17} label="INSTITUCIONAIS" />
    </section>
  );
};

// ==================== REDES SOCIAIS ====================
window.SlideSocialGrid = function SlideSocialGrid() {
  const posts = [
    { kind: 'type', text: 'Top 0.1%\ndo ranking', eye: 'GENÉTICA' },
    { kind: 'photo', label: 'TOURO CLOSE', bg: 'var(--ink)' },
    { kind: 'data', text: 'MGTe\n156.8', eye: 'DADO' },
    { kind: 'photo', label: 'PELAGEM MACRO', bg: 'var(--ink)' },
    { kind: 'type', text: 'Leilão\n2025', eye: '28.NOV', gold: true },
    { kind: 'photo', label: 'LAB FIV', bg: 'var(--ink)' },
    { kind: 'quote', text: '"Não compramos\ntouro.\nContratamos\ngenética."' },
    { kind: 'photo', label: 'MANEJO TECH', bg: 'var(--ink)' },
    { kind: 'type', text: 'Dona Serena\nFIV', eye: 'LOTE 07' },
  ];

  const Post = ({ p, i }) => {
    if (p.kind === 'photo') return (
      <div style={{ aspectRatio: '1/1', background: p.bg, position: 'relative', overflow: 'hidden' }}>
        <PhImg label={p.label} style={{ position: 'absolute', inset: 0, aspectRatio: 'auto' }}/>
        <BullBronze width={20} style={{ position: 'absolute', top: 8, left: 8, opacity: 0.8 }}/>
      </div>
    );
    if (p.kind === 'quote') return (
      <div style={{ aspectRatio: '1/1', background: 'var(--ink-2)', padding: 16, border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <span className="mono-sm text-bronze" style={{ fontSize: 8 }}>QUOTE</span>
        <div style={{ fontFamily: 'Space Grotesk', fontSize: 13, fontWeight: 500, letterSpacing: '-0.015em', lineHeight: 1.1, whiteSpace: 'pre-line', color: 'var(--fg)' }}>{p.text}</div>
        <BullBronze width={14} style={{ opacity: 0.6 }}/>
      </div>
    );
    if (p.kind === 'data') return (
      <div style={{ aspectRatio: '1/1', background: 'var(--black)', padding: 14, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <span className="mono-sm text-bronze" style={{ fontSize: 8 }}>{p.eye}</span>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 36, fontWeight: 500, color: 'var(--bronze)', lineHeight: 0.95, whiteSpace: 'pre-line' }}>{p.text}</div>
        <div style={{ height: 2, background: 'var(--bronze)', width: '60%' }}/>
      </div>
    );
    return (
      <div style={{ aspectRatio: '1/1', background: p.gold ? 'var(--grad-gold)' : 'var(--ink)', color: p.gold ? 'var(--ink)' : 'var(--fg)', padding: 14, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <span className="mono-sm" style={{ fontSize: 8, color: p.gold ? 'var(--ink)' : 'var(--bronze)' }}>{p.eye}</span>
        <div style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 0.95, whiteSpace: 'pre-line' }}>{p.text}</div>
        <BullBronze width={14} style={{ opacity: p.gold ? 1 : 0.7, filter: p.gold ? 'brightness(0)' : 'none' }}/>
      </div>
    );
  };

  return (
    <section data-screen-label="18 Redes sociais">
      <SlideMeta section="§ 11" title="REDES SOCIAIS · INSTAGRAM" />
      <div className="slide-pad" style={{ paddingTop: 120 }}>
        <div className="eyebrow">— REDES SOCIAIS</div>
        <div className="h-1" style={{ marginTop: 10, fontSize: 44 }}>Feed com ritmo modular.</div>
        <div className="body-lg text-mute" style={{ marginTop: 8, maxWidth: 900, fontSize: 18 }}>
          Tipografia, fotografia, dado e citação em rotação. Bronze como fio condutor; respiro visual entre posts densos.
        </div>

        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, flex: 1, minHeight: 0 }}>
          {/* IG Grid 3x3 */}
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div className="mono-sm text-bronze" style={{ marginBottom: 10 }}>@FORMULADOBOI · GRID 3×3</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, padding: 2, background: 'var(--ink)', border: '1px solid var(--line)', maxWidth: 540 }}>
              {posts.map((p, i) => <Post key={i} p={p} i={i}/>)}
            </div>
          </div>

          {/* Stories + LinkedIn */}
          <div className="flex col gap-3" style={{ minHeight: 0 }}>
            <div>
              <div className="mono-sm text-bronze" style={{ marginBottom: 8 }}>STORIES / REELS · 1080×1920</div>
              <div className="flex gap-3">
                {[0,1,2].map(i => (
                  <div key={i} style={{ flex: 1, aspectRatio: '9/16', maxHeight: 260, background: i===0?'var(--black)':i===1?'var(--ink-2)':'var(--grad-gold)', padding: 10, position: 'relative', border: '1px solid var(--line)' }}>
                    {i === 0 && (<>
                      <BullBronze width={14}/>
                      <div style={{ position: 'absolute', top: '40%', left: 10, right: 10, fontFamily: 'Space Grotesk', fontSize: 14, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1 }}>Novo<br/>lote<br/><span className="text-bronze">disponível</span></div>
                      <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, height: 2, background: 'var(--bronze)' }}/>
                    </>)}
                    {i === 1 && (<>
                      <PhImg label="CLOSE" style={{ position: 'absolute', inset: 0, aspectRatio: 'auto' }}/>
                      <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--bronze)' }}>MGTe 156.8</div>
                    </>)}
                    {i === 2 && (<>
                      <span className="mono-sm" style={{ fontSize: 7, color: 'var(--ink)' }}>CAPA</span>
                      <div style={{ fontFamily: 'Space Grotesk', fontSize: 12, fontWeight: 600, color: 'var(--ink)', lineHeight: 1, marginTop: 60, letterSpacing: '-0.02em' }}>Leilão 2025</div>
                    </>)}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mono-sm text-bronze" style={{ marginBottom: 12 }}>LINKEDIN · CAPA 1584×396</div>
              <div style={{ aspectRatio: '4/1', background: 'linear-gradient(90deg, #000 0%, #1a1510 70%, #A0792E 100%)', padding: 20, position: 'relative' }}>
                <LogoBronze width={120}/>
                <div style={{ fontFamily: 'Space Grotesk', fontSize: 18, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 8 }}>Curadoria de genética Nelore PO</div>
                <BullBronze width={80} style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', opacity: 0.25, filter: 'brightness(0)' }}/>
              </div>
            </div>

            <div>
              <div className="mono-sm text-bronze" style={{ marginBottom: 12 }}>WHATSAPP BUSINESS · PERFIL</div>
              <div className="flex items-center gap-4">
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line-strong)' }}>
                  <BullBronze width={46}/>
                </div>
                <div>
                  <div style={{ fontFamily: 'Space Grotesk', fontSize: 18, fontWeight: 500 }}>Fórmula do Boi</div>
                  <div className="mono-sm text-bronze" style={{ fontSize: 10, marginTop: 2 }}>GENÉTICA NELORE PO · CURADORIA</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SlideFoot num={18} label="REDES SOCIAIS" />
    </section>
  );
};

// ==================== TOM DE VOZ / COPY ====================
window.SlideCopy = function SlideCopy() {
  return (
    <section data-screen-label="19 Tom de voz e copy">
      <SlideMeta section="§ 12" title="TOM DE VOZ & COPY" />
      <div className="slide-pad" style={{ paddingTop: 140 }}>
        <div className="eyebrow">— TOM DE VOZ · EXEMPLOS</div>
        <div className="h-1" style={{ marginTop: 16, fontSize: 56 }}>Assim falamos.</div>

        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, flex: 1 }}>
          {/* Column 1: Microcopy + CTAs */}
          <div className="flex col gap-4">
            <div>
              <div className="mono-sm text-bronze" style={{ marginBottom: 14 }}>MICROCOPY · UI E DOCUMENTOS</div>
              <div className="flex col gap-2">
                {[
                  ['FORMULÁRIO', 'Solicite sua curadoria', 'Preencha aí seus dados', 'Queremos entender seu rebanho'],
                  ['CONFIRMAÇÃO', 'Proposta enviada', 'Deu certo!', 'Recebida. Retornamos em até 24h.'],
                  ['ERRO', 'Dado não consta no registro', 'Algo deu errado 😔', 'Não localizamos esse registro.'],
                ].map(([ctx, right, wrong, sub]) => (
                  <div key={ctx} className="card" style={{ padding: 16 }}>
                    <div className="mono-sm text-mute" style={{ fontSize: 10, marginBottom: 8 }}>{ctx}</div>
                    <div className="flex items-center gap-3" style={{ marginBottom: 4 }}>
                      <span className="text-bronze mono">✓</span>
                      <span className="body" style={{ color: 'var(--fg)', fontWeight: 500 }}>{right}</span>
                    </div>
                    <div className="body-sm" style={{ marginLeft: 24, marginTop: -2 }}>{sub}</div>
                    <div className="flex items-center gap-3" style={{ marginTop: 8 }}>
                      <span style={{ color:'#E05050' }} className="mono">✕</span>
                      <span className="body-sm" style={{ textDecoration: 'line-through' }}>{wrong}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mono-sm text-bronze" style={{ marginBottom: 14 }}>CTAs — DIRETOS, SEM ADORNO</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {['Ver lote completo', 'Falar com curador', 'Baixar ficha técnica', 'Reservar dose', 'Solicitar proposta', 'Acessar catálogo'].map(c => (
                  <div key={c} style={{ padding: '12px 16px', background: 'var(--ink-2)', border: '1px solid var(--bronze)', fontFamily: 'Space Grotesk', fontSize: 14, fontWeight: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{c}</span>
                    <span className="text-bronze">→</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Captions + Abertura de proposta */}
          <div className="flex col gap-4">
            <div>
              <div className="mono-sm text-bronze" style={{ marginBottom: 14 }}>LEGENDAS DE POST · EXEMPLOS</div>
              <div className="flex col gap-3">
                {[
                  { eye: 'POST DE LOTE', body: 'Lote 07 — Dona Serena FIV. MGTe 147.3, top 0.3% do ranking nacional. Avaliação completa na bio.' },
                  { eye: 'POST DE SÊMEN', body: 'Imperador da Matinha. Top 0.1%. Disponibilidade limitada — 1.200 doses. Contato por DM.' },
                  { eye: 'POST INSTITUCIONAL', body: 'Curadoria não é opinião. É protocolo. Fale com nosso time para entender como selecionamos.' },
                ].map(c => (
                  <div key={c.eye} className="card" style={{ padding: 16, borderLeft: '2px solid var(--bronze)' }}>
                    <div className="mono-sm text-bronze" style={{ fontSize: 10, marginBottom: 6 }}>{c.eye}</div>
                    <div className="body" style={{ color: 'var(--fg)' }}>{c.body}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mono-sm text-bronze" style={{ marginBottom: 14 }}>ABERTURA DE PROPOSTA COMERCIAL</div>
              <div className="card card-md" style={{ fontFamily: 'Space Grotesk', fontSize: 17, lineHeight: 1.55, color: 'var(--fg)' }}>
                <div className="mono-sm text-mute" style={{ fontSize: 10, marginBottom: 10 }}>TEMPLATE</div>
                <p>Prezado [nome],</p>
                <p style={{ marginTop: 10 }}>Segue nossa proposta técnica para [projeto]. A análise genética foi feita sobre [N] matrizes e [N] touros; selecionamos [N] cruzamentos com maior probabilidade de performance dentro do seu perfil de rebanho.</p>
                <p style={{ marginTop: 10, color: 'var(--bronze)' }}>Todos os dados foram validados contra o banco GenePlus · Matrix. Anexos com DEPs, pedigree e cronograma.</p>
                <p style={{ marginTop: 10 }}>À disposição para detalhar cada ponto.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SlideFoot num={19} label="TOM DE VOZ" />
    </section>
  );
};

// ==================== CLOSING ====================
window.SlideClosing = function SlideClosing() {
  return (
    <section data-screen-label="20 Contato">
      <div className="abs inset-0" style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(212,168,92,0.2) 0%, transparent 60%)' }}/>
      <div className="abs inset-0 bg-grid-fine" style={{ opacity: 0.4 }}/>
      <SlideMeta section="—" title="CONTATO" />

      <div className="abs" style={{ left: 120, top: 240, right: 120 }}>
        <div className="mono-sm text-bronze" style={{ marginBottom: 32 }}>— FIM DO DOCUMENTO</div>
        <div className="h-display">
          Dúvidas?<br/>
          <span className="text-bronze">Fala com a gente.</span>
        </div>
      </div>

      <div className="abs" style={{ right: 120, bottom: 180 }}>
        <BullBronze width={180}/>
      </div>

      <SlideFoot num={20} label="CONTATO" />
    </section>
  );
};

Object.assign(window, { SlideInstitucional, SlideSocialGrid, SlideCopy, SlideClosing });
