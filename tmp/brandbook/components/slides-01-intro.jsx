/* Slides 00-05: Cover, TOC, Manifesto, Positioning, Personality, Logo, Palette */
const { useState } = React;

// ==================== 00 COVER ====================
window.SlideCover = function SlideCover() {
  return (
    <section data-screen-label="00 Capa">
      {/* Radial gold glow */}
      <div className="abs inset-0" style={{ background: 'radial-gradient(ellipse at 50% 70%, rgba(212,168,92,0.18) 0%, transparent 55%)' }} />
      {/* Fine grid */}
      <div className="abs inset-0 bg-grid-fine" style={{ opacity: 0.5 }} />

      {/* Meta */}
      <div className="slide-meta">
        <div className="flex items-center gap-4">
          <span className="dot">●</span>
          <span>BRAND GUIDELINES</span>
          <span style={{opacity:0.3}}>/</span>
          <span>v1.0 · 2025</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-bronze">CONFIDENCIAL</span>
        </div>
      </div>

      {/* DNA decoration top-right */}
      <div className="abs" style={{ top: 180, right: 120, opacity: 0.55 }}>
        <DNAStrand width={520} height={60} />
      </div>

      {/* Hero content */}
      <div className="abs" style={{ left: 120, top: 260, right: 120, bottom: 180 }}>
        <div className="flex col gap-8">
          <LogoBronze width={380} />
          <div className="hr-bronze" style={{ width: 220 }} />
          <div>
            <div className="eyebrow" style={{ marginBottom: 20 }}>BRANDBOOK · SISTEMA DE IDENTIDADE</div>
            <div className="h-display text-fg" style={{ fontSize: 132 }}>
              Genética de elite.<br/>
              <span className="text-bronze">Precisão de dados.</span>
            </div>
          </div>
          <div className="body-lg text-mute" style={{ maxWidth: 840, marginTop: 8 }}>
            Guia completo da identidade visual, verbal e de aplicação da Fórmula do Boi — curadoria de Nelore PO de alto padrão, sêmen top 0.1% e embriões FIV selecionados.
          </div>
        </div>
      </div>

      {/* Bull outline decoration bottom right */}
      <div className="abs" style={{ right: -80, bottom: -80, opacity: 0.08 }}>
        <BullBronze width={520} />
      </div>

      {/* Foot */}
      <div className="slide-foot">
        <div className="flex items-center gap-4">
          <span>© 2025 FÓRMULA DO BOI</span>
          <span style={{opacity:0.3}}>/</span>
          <span>BRANDBOOK · v1.0 · CONFIDENCIAL</span>
        </div>
        <div className="flex items-center gap-4">
          <Crosshair size={16} />
          <span className="num">00 / 48</span>
        </div>
      </div>
    </section>
  );
};

// ==================== 01 TOC ====================
window.SlideTOC = function SlideTOC() {
  const sections = [
    ['01', 'Manifesto', 'Propósito, visão, missão, valores'],
    ['02', 'Posicionamento', 'O lugar que ocupamos no mercado'],
    ['03', 'Personalidade', 'Arquétipo, adjetivos, tom de voz'],
    ['04', 'Sistema de logo', 'Versões, proteção, uso correto'],
    ['05', 'Paleta de cores', 'Primárias, tech, neutras, WCAG'],
    ['06', 'Tipografia', 'Space Grotesk · JetBrains Mono'],
    ['07', 'Grafismos e padrões', 'DNA, DEP, heatmap, topografia'],
    ['08', 'Fotografia', 'Direção de arte e tratamento'],
    ['09', 'Aplicações', 'Leilões, Sêmen, Embriões'],
    ['10', 'Institucionais', 'Cartão, email, papelaria, evento'],
    ['11', 'Redes sociais', 'Grid IG, stories, LinkedIn'],
    ['12', 'Tom de voz e copy', 'Microcopy, CTAs, legendas'],
  ];
  return (
    <section data-screen-label="01 Sumário">
      <SlideMeta section="ÍNDICE" title="SUMÁRIO" />
      <div className="slide-pad" style={{ paddingTop: 150 }}>
        <div className="flex col gap-4" style={{ marginBottom: 40 }}>
          <div className="eyebrow">SUMÁRIO</div>
          <div className="h-1" style={{ fontSize: 72, lineHeight: 0.95 }}>
            12 capítulos.<br/>
            <span className="text-bronze">Um sistema.</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 80, rowGap: 0, marginTop: 8 }}>
          {sections.map(([num, title, sub], i) => (
            <a href="#" key={num} style={{
              display: 'grid',
              gridTemplateColumns: '64px 1fr auto',
              alignItems: 'center',
              padding: '14px 0',
              borderBottom: '1px solid var(--line)',
              gap: 20,
              textDecoration: 'none',
              color: 'inherit'
            }}>
              <span className="mono text-bronze" style={{ fontSize: 15 }}>{num}</span>
              <div>
                <div className="h-4" style={{ fontSize: 22, lineHeight: 1.2 }}>{title}</div>
                {sub && <div className="body-sm text-mute" style={{ marginTop: 2, fontSize: 14 }}>{sub}</div>}
              </div>
              <span className="mono text-mute" style={{ fontSize: 12 }}>→</span>
            </a>
          ))}
        </div>
      </div>
      <SlideFoot num={1} label="ÍNDICE" />
    </section>
  );
};

// ==================== 02 SECTION DIVIDER — MANIFESTO ====================
window.SlideDivider = function SlideDivider({ num, title, subtitle, kicker, slideNum = 0, decor }) {
  return (
    <section data-screen-label={`${String(slideNum).padStart(2,'0')} ${title}`}>
      <div className="abs inset-0 tint-radial" />
      <div className="abs inset-0 bg-grid-fine" style={{ opacity: 0.35 }} />
      <SlideMeta section={`§ ${num}`} title={title.toUpperCase()} />

      <div className="abs" style={{ left: 120, top: 220, right: 120 }}>
        <div className="mono-sm text-bronze" style={{ marginBottom: 32 }}>— CAPÍTULO {num}</div>
        <div className="h-display" style={{ lineHeight: 0.9 }}>
          {title}
        </div>
        {subtitle && (
          <div className="body-lg text-mute" style={{ maxWidth: 760, marginTop: 40 }}>
            {subtitle}
          </div>
        )}
      </div>

      {decor}

      {/* Corner bracket */}
      <div className="abs" style={{ right: 120, bottom: 180, width: 180, height: 180 }}>
        <Brackets size={20} offset={0} style={{ width: '100%', height: '100%' }}>
          <div className="flex items-center justify-center" style={{ width: '100%', height: '100%' }}>
            <div className="mono-sm text-bronze" style={{ textAlign: 'center', lineHeight: 1.6 }}>
              CAP.<br/><span style={{ fontSize: 32, letterSpacing: 0 }}>{num}</span>
            </div>
          </div>
        </Brackets>
      </div>

      <SlideFoot num={slideNum} label={title.toUpperCase()} />
    </section>
  );
};

// ==================== 01 MANIFESTO ====================
window.SlideManifesto = function SlideManifesto() {
  return (
    <section data-screen-label="02 Manifesto">
      <SlideMeta section="§ 01" title="MANIFESTO" />
      <div className="slide-pad" style={{ paddingTop: 150 }}>
        <div className="flex items-start gap-16 grow">
          {/* Left: manifesto text */}
          <div style={{ flex: 1.4 }}>
            <div className="eyebrow" style={{ marginBottom: 32 }}>— MANIFESTO</div>
            <div className="h-1" style={{ fontSize: 64, lineHeight: 1.08, textWrap: 'balance' }}>
              A evolução do Nelore não acontece por acaso.<br/>
              <span className="text-bronze">Acontece por escolha.</span>
            </div>
            <div className="body-lg text-mute" style={{ marginTop: 40, maxWidth: 720, lineHeight: 1.55 }}>
              Somos curadores. Lemos DEPs como outros leem poesia. Enxergamos na pelagem, no aprumo e no índice MGTe o resultado de décadas de seleção — e o ponto de partida da próxima geração.
              <br/><br/>
              Unimos o olhar do criador tradicional à precisão do dado. Porque o futuro da pecuária brasileira não será decidido no pasto. Será decidido <span className="text-bronze">antes dele</span>.
            </div>
          </div>

          {/* Right: pilares */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
            {[
              ['PROPÓSITO', 'Elevar o padrão genético do rebanho brasileiro entregando seleção de elite a quem sabe o que está comprando.'],
              ['VISÃO', 'Ser a referência nacional em curadoria de genética Nelore PO — o filtro de confiança entre o top 0,1% e o pecuarista seletor.'],
              ['MISSÃO', 'Intermediar, avaliar e viabilizar acesso ao que há de mais avançado em genética bovina — com transparência, dados e acompanhamento.'],
            ].map(([label, text]) => (
              <div key={label} className="card card-md" style={{ borderLeft: '2px solid var(--bronze)' }}>
                <div className="mono-sm text-bronze" style={{ marginBottom: 10 }}>{label}</div>
                <div className="body" style={{ color: 'var(--fg)', lineHeight: 1.5 }}>{text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Values bar */}
        <div style={{ marginTop: 48, borderTop: '1px solid var(--line-strong)', paddingTop: 24 }}>
          <div className="flex items-center gap-8">
            <span className="mono-sm text-mute">VALORES —</span>
            {['CURADORIA', 'PRECISÃO', 'AUTORIDADE', 'LEALDADE', 'EVOLUÇÃO'].map((v, i) => (
              <React.Fragment key={v}>
                <span className="mono" style={{ color: 'var(--fg)', letterSpacing: '0.15em' }}>{v}</span>
                {i < 4 && <span className="text-bronze">●</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      <SlideFoot num={2} label="MANIFESTO" />
    </section>
  );
};

// ==================== 02 POSITIONING ====================
window.SlidePositioning = function SlidePositioning() {
  return (
    <section data-screen-label="03 Posicionamento">
      <SlideMeta section="§ 02" title="POSICIONAMENTO" />
      <div className="slide-pad" style={{ paddingTop: 150 }}>
        <div className="eyebrow">— POSICIONAMENTO</div>

        <div className="h-1" style={{ fontSize: 68, marginTop: 32, maxWidth: 1400, lineHeight: 1.05 }}>
          A curadoria de <span className="text-bronze">genética de elite</span> do Nelore — onde a tradição do PO encontra a precisão do dado.
        </div>

        <div className="flex gap-10" style={{ marginTop: 64, flex: 1 }}>
          {/* Matrix: tradition x precision */}
          <div style={{ flex: 1.2 }}>
            <div className="mono-sm text-bronze" style={{ marginBottom: 16 }}>MATRIZ DE POSICIONAMENTO</div>
            <div className="card" style={{ padding: 32, height: 520, position: 'relative' }}>
              {/* Quadrant chart */}
              <svg width="100%" height="100%" viewBox="0 0 500 460" preserveAspectRatio="none">
                {/* axes */}
                <line x1="250" y1="20" x2="250" y2="440" stroke="var(--line-strong)" strokeWidth="1"/>
                <line x1="20" y1="230" x2="480" y2="230" stroke="var(--line-strong)" strokeWidth="1"/>
                {/* fine grid */}
                {[0.25, 0.5, 0.75].map(p => <line key={'h'+p} x1="20" y1={20 + p*420} x2="480" y2={20 + p*420} stroke="var(--line)" strokeDasharray="2 4"/>)}
                {[0.25, 0.5, 0.75].map(p => <line key={'v'+p} x1={20 + p*460} y1="20" x2={20 + p*460} y2="440" stroke="var(--line)" strokeDasharray="2 4"/>)}

                {/* competitors */}
                {[
                  {x: 120, y: 330, label: 'Comerciais de larga escala', mute: true},
                  {x: 410, y: 100, label: 'Centrais de sêmen globais', mute: true},
                  {x: 160, y: 110, label: 'Criadores tradicionais PO', mute: true},
                  {x: 370, y: 340, label: 'Agtechs puras', mute: true},
                ].map(c => (
                  <g key={c.label}>
                    <circle cx={c.x} cy={c.y} r="5" fill="none" stroke="var(--fg-muted)" strokeWidth="1"/>
                    <text x={c.x + 12} y={c.y + 4} fill="var(--fg-muted)" fontSize="11" fontFamily="JetBrains Mono">{c.label}</text>
                  </g>
                ))}
                {/* us */}
                <circle cx="340" cy="160" r="42" fill="none" stroke="var(--bronze)" strokeWidth="1" opacity="0.4"/>
                <circle cx="340" cy="160" r="22" fill="none" stroke="var(--bronze)" strokeWidth="1" opacity="0.7"/>
                <circle cx="340" cy="160" r="7" fill="var(--bronze)"/>
                <text x="340" y="215" textAnchor="middle" fill="var(--bronze)" fontSize="14" fontFamily="Space Grotesk" fontWeight="500">FÓRMULA DO BOI</text>

                {/* axis labels */}
                <text x="250" y="15" textAnchor="middle" fill="var(--fg-muted)" fontSize="10" fontFamily="JetBrains Mono" letterSpacing="0.15em">+ PRECISÃO DE DADOS</text>
                <text x="250" y="455" textAnchor="middle" fill="var(--fg-muted)" fontSize="10" fontFamily="JetBrains Mono" letterSpacing="0.15em">− DADOS</text>
                <text x="18" y="234" textAnchor="end" fill="var(--fg-muted)" fontSize="10" fontFamily="JetBrains Mono" letterSpacing="0.15em">COMMODITY</text>
                <text x="482" y="234" textAnchor="start" fill="var(--fg-muted)" fontSize="10" fontFamily="JetBrains Mono" letterSpacing="0.15em">ELITE / PO</text>
              </svg>
            </div>
          </div>

          {/* Right column: positioning statement + audience */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card card-md">
              <div className="mono-sm text-bronze" style={{ marginBottom: 12 }}>STATEMENT OFICIAL</div>
              <div className="body-lg" style={{ color: 'var(--fg)', lineHeight: 1.4, fontSize: 22 }}>
                "Para o pecuarista seletor que não aceita o aleatório, a Fórmula do Boi é a curadoria especializada em genética Nelore PO — combinando o rigor do avaliador com a inteligência de dados das melhores centrais do mundo."
              </div>
            </div>

            <div className="card card-md" style={{ flex: 1 }}>
              <div className="mono-sm text-bronze" style={{ marginBottom: 16 }}>PÚBLICO-ALVO</div>
              <div className="flex col gap-3">
                {[
                  ['Pecuarista seletor de alto padrão', 'foco em PO registrado'],
                  ['Criador profissional de Nelore', 'linhagens premium'],
                  ['Central de reprodução', 'sêmen e FIV'],
                  ['Investidor em genética bovina', 'capital em ativos vivos'],
                ].map(([t, s]) => (
                  <div key={t} className="flex items-baseline gap-3">
                    <span className="text-bronze" style={{ fontSize: 10 }}>■</span>
                    <div>
                      <div className="body" style={{ fontWeight: 500 }}>{t}</div>
                      <div className="body-sm">{s}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mono-sm" style={{ marginTop: 20, color: 'var(--bronze)', paddingTop: 14, borderTop: '1px dashed var(--line-strong)' }}>
                NÃO ATENDEMOS GADO COMERCIAL
              </div>
            </div>
          </div>
        </div>
      </div>
      <SlideFoot num={3} label="POSICIONAMENTO" />
    </section>
  );
};

// ==================== 03 PERSONALITY ====================
window.SlidePersonality = function SlidePersonality() {
  return (
    <section data-screen-label="04 Personalidade">
      <SlideMeta section="§ 03" title="PERSONALIDADE" />
      <div className="slide-pad" style={{ paddingTop: 150 }}>
        <div className="flex gap-16">
          <div style={{ flex: 1 }}>
            <div className="eyebrow">— PERSONALIDADE</div>
            <div className="h-1" style={{ marginTop: 24, fontSize: 64, lineHeight: 1.05 }}>
              Sábio + Criador.<br/>
              <span className="text-bronze">Autoridade que evolui.</span>
            </div>
            <div className="body-lg text-mute" style={{ marginTop: 28, maxWidth: 640 }}>
              Duas matrizes arquetípicas guiam nossa expressão. Juntas, descrevem uma marca que conhece profundamente o que já existe — e tem rigor para construir o próximo patamar.
            </div>
          </div>

          <div style={{ flex: 1.1 }}>
            <div className="flex gap-4">
              {[
                ['SÁBIO', 'Conhecimento, análise, discernimento. Lê dados, identifica padrões, antecipa tendências.'],
                ['CRIADOR', 'Vontade de construir. Combina matrizes, desenha cruzamentos, faz acontecer.'],
              ].map(([name, desc]) => (
                <div key={name} className="card card-md" style={{ flex: 1, borderTop: '2px solid var(--bronze)' }}>
                  <div className="mono-sm text-bronze" style={{ marginBottom: 10 }}>ARQUÉTIPO</div>
                  <div className="h-3" style={{ fontSize: 36 }}>{name}</div>
                  <div className="body" style={{ marginTop: 12, color: 'var(--fg-muted)' }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Adjectives + tone of voice grid */}
        <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 40 }}>
          <div>
            <div className="mono-sm text-bronze" style={{ marginBottom: 18 }}>SOMOS / NÃO SOMOS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                ['Técnico', 'técnico-difícil'],
                ['Confiante', 'arrogante'],
                ['Preciso', 'frio'],
                ['Premium', 'inacessível'],
                ['Direto', 'seco'],
                ['Criterioso', 'esnobe'],
              ].map(([y, n]) => (
                <React.Fragment key={y}>
                  <div className="flex items-center gap-3 card" style={{ padding: '14px 18px' }}>
                    <span className="text-bronze mono">✓</span>
                    <span className="body" style={{ fontWeight: 500 }}>{y}</span>
                  </div>
                  <div className="flex items-center gap-3" style={{ padding: '14px 18px', border: '1px dashed var(--line)', borderRadius: 4 }}>
                    <span className="text-mute mono">✕</span>
                    <span className="body text-mute" style={{ textDecoration: 'line-through' }}>{n}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div>
            <div className="mono-sm text-bronze" style={{ marginBottom: 18 }}>TOM DE VOZ</div>
            <div className="card card-md" style={{ height: '100%' }}>
              {[
                ['FORMAL', 85, 'Profissional, evita gírias. Usa termos técnicos do setor (DEP, MGTe, PO) sem traduzir.'],
                ['ANALÍTICO', 92, 'Sustenta afirmações com dado. Números antes de adjetivos.'],
                ['CONFIANTE', 78, 'Afirma. Não pede licença. Não infantiliza o cliente.'],
                ['CONCISO', 82, 'Frases curtas. Uma ideia por vez. O supérfluo sai.'],
              ].map(([label, v, desc]) => (
                <div key={label} style={{ marginBottom: 16 }}>
                  <div className="flex justify-between items-center">
                    <span className="mono" style={{ fontWeight: 500, letterSpacing: '0.1em' }}>{label}</span>
                    <span className="mono text-bronze">{v}/100</span>
                  </div>
                  <div style={{ height: 2, background: 'rgba(232,203,133,0.1)', margin: '6px 0 8px', position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, width: `${v}%`, background: 'var(--bronze)' }}/>
                  </div>
                  <div className="body-sm">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <SlideFoot num={4} label="PERSONALIDADE" />
    </section>
  );
};

Object.assign(window, {
  SlideCover, SlideTOC, SlideDivider,
  SlideManifesto, SlidePositioning, SlidePersonality
});
