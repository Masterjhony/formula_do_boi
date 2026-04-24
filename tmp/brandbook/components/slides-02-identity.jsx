/* Slides: Logo system (05) + Palette (06) */

// ==================== 05 LOGO SYSTEM ====================
window.SlideLogoOverview = function SlideLogoOverview() {
  return (
    <section data-screen-label="05 Logo — Overview">
      <SlideMeta section="§ 04" title="SISTEMA DE LOGO" />
      <div className="slide-pad" style={{ paddingTop: 140 }}>
        <div className="flex justify-between items-end">
          <div>
            <div className="eyebrow">— LOGO</div>
            <div className="h-1" style={{ marginTop: 16, fontSize: 56 }}>O símbolo é patrimônio.</div>
            <div className="body-lg text-mute" style={{ marginTop: 16, maxWidth: 900 }}>
              Cabeça de boi em line art + wordmark condensado bold. Preserve proporções e espaçamento em toda aplicação.
            </div>
          </div>
          <div className="mono-sm text-mute" style={{ textAlign: 'right' }}>
            VERSÕES OFICIAIS<br/>
            <span className="text-bronze">04 variações</span>
          </div>
        </div>

        {/* Primary hero display */}
        <div className="card" style={{ marginTop: 28, padding: 0, display: 'grid', gridTemplateColumns: '2fr 1fr' }}>
          <div className="flex items-center justify-center" style={{ padding: 48, borderRight: '1px solid var(--line)', background: 'radial-gradient(ellipse at center, rgba(212,168,92,0.08), transparent 70%)' }}>
            <LogoBronze width={520} />
          </div>
          <div style={{ padding: 32 }}>
            <div className="mono-sm text-bronze" style={{ marginBottom: 12 }}>ASSINATURA PRINCIPAL</div>
            <div className="h-4" style={{ fontSize: 28 }}>Lockup horizontal bronze</div>
            <div className="body-sm" style={{ marginTop: 8 }}>Versão oficial para fundo escuro. Usada em materiais institucionais, capas e assinaturas digitais.</div>

            <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[['ARQUIVO', 'logo-bronze.svg'], ['COR', '#A0792E'], ['MIN. DIGITAL', '180px'], ['MIN. IMPRESSO', '28mm']].map(([k,v]) => (
                <div key={k}>
                  <div className="mono-sm text-mute" style={{ fontSize: 10 }}>{k}</div>
                  <div className="mono" style={{ fontSize: 13, color: 'var(--fg)' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4 variations */}
        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {[
            { name: 'Símbolo', file: 'Bull isolado', el: <BullBronze width={90}/>, bg: 'var(--ink-2)' },
            { name: 'Wordmark', file: 'Typography', el: <WordmarkBronze width={180}/>, bg: 'var(--ink-2)' },
            { name: 'Monocromo branco', file: 'Sobre fundo escuro', el: <LogoWhite width={210}/>, bg: 'var(--ink)' },
            { name: 'Monocromo preto', file: 'Sobre fundo claro', el: <LogoBlack width={210}/>, bg: '#E8E8E8' },
          ].map(v => (
            <div key={v.name} className="card" style={{ padding: 0 }}>
              <div style={{ background: v.bg, padding: '24px 12px', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {v.el}
              </div>
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--line)' }}>
                <div className="mono" style={{ fontSize: 13 }}>{v.name}</div>
                <div className="body-sm" style={{ fontSize: 12 }}>{v.file}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <SlideFoot num={5} label="LOGO · VERSÕES" />
    </section>
  );
};

// ==================== LOGO — protection + minimum ====================
window.SlideLogoRules = function SlideLogoRules() {
  return (
    <section data-screen-label="06 Logo — Proteção e tamanhos">
      <SlideMeta section="§ 04" title="LOGO · ÁREA DE PROTEÇÃO" />
      <div className="slide-pad" style={{ paddingTop: 150 }}>
        <div className="eyebrow">— ÁREA DE PROTEÇÃO & TAMANHO MÍNIMO</div>
        <div className="h-2" style={{ marginTop: 16 }}>Respire. Não cerque.</div>

        <div className="flex gap-10" style={{ marginTop: 40, flex: 1 }}>
          {/* Protection area */}
          <div className="card" style={{ flex: 1.3, padding: 40, position: 'relative' }}>
            <div className="mono-sm text-bronze">ÁREA DE PROTEÇÃO</div>
            <div className="h-4" style={{ marginTop: 8 }}>Distância mínima = <span className="text-bronze">X</span></div>
            <div className="body-sm" style={{ marginTop: 6, maxWidth: 460 }}>X equivale à altura do chifre do símbolo. Mantenha esse espaço livre de texto, imagens ou borda.</div>

            <div style={{ marginTop: 28, background: 'var(--ink)', padding: 60, position: 'relative', border: '1px dashed var(--line-strong)' }}>
              {/* protection rectangle */}
              <div style={{ position: 'absolute', inset: 28, border: '1px dashed var(--bronze)', opacity: 0.5 }}/>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <LogoBronze width={380} />
              </div>
              {/* X markers */}
              <div style={{ position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)', fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--bronze)', letterSpacing: '0.1em' }}>X</div>
              <div style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--bronze)', letterSpacing: '0.1em' }}>X</div>
              <div style={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--bronze)' }}>X</div>
              <div style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--bronze)' }}>X</div>
            </div>
          </div>

          {/* Min size */}
          <div className="card" style={{ flex: 1, padding: 40 }}>
            <div className="mono-sm text-bronze">TAMANHO MÍNIMO</div>
            <div className="h-4" style={{ marginTop: 8 }}>Legibilidade do símbolo primeiro.</div>
            <div className="body-sm" style={{ marginTop: 6 }}>Abaixo desses limites, substitua pelo símbolo isolado.</div>

            <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 28 }}>
              <div className="flex items-end gap-6" style={{ paddingBottom: 20, borderBottom: '1px solid var(--line)' }}>
                <LogoBronze width={180} />
                <div className="flex col gap-1">
                  <div className="mono-sm text-mute">DIGITAL</div>
                  <div className="mono-lg text-bronze">180 px</div>
                  <div className="body-sm">largura mínima em telas</div>
                </div>
              </div>
              <div className="flex items-end gap-6" style={{ paddingBottom: 20, borderBottom: '1px solid var(--line)' }}>
                <LogoBronze width={130} />
                <div className="flex col gap-1">
                  <div className="mono-sm text-mute">IMPRESSO</div>
                  <div className="mono-lg text-bronze">28 mm</div>
                  <div className="body-sm">largura mínima em papel</div>
                </div>
              </div>
              <div className="flex items-end gap-6">
                <BullBronze width={60} />
                <div className="flex col gap-1">
                  <div className="mono-sm text-mute">FAVICON / APP</div>
                  <div className="mono-lg text-bronze">símbolo</div>
                  <div className="body-sm">abaixo de 24 px use apenas o bull</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SlideFoot num={6} label="LOGO · REGRAS" />
    </section>
  );
};

// ==================== LOGO — Do's and Don'ts ====================
window.SlideLogoMisuse = function SlideLogoMisuse() {
  const dont = [
    { label: 'Não distorça', transform: 'scaleX(1.5)' },
    { label: 'Não rotacione', transform: 'rotate(-18deg)' },
    { label: 'Não mude a cor', filter: 'hue-rotate(100deg) saturate(2)' },
    { label: 'Não adicione sombra', filter: 'drop-shadow(0 0 18px #D4A85C)' },
    { label: 'Não aplique em fundo conflitante', bg: '#7FD4A0' },
    { label: 'Não reorganize os elementos', stacked: true },
  ];
  return (
    <section data-screen-label="07 Logo — Uso incorreto">
      <SlideMeta section="§ 04" title="LOGO · USO INCORRETO" />
      <div className="slide-pad" style={{ paddingTop: 150 }}>
        <div className="flex items-end justify-between">
          <div>
            <div className="eyebrow">— USOS INCORRETOS</div>
            <div className="h-2" style={{ marginTop: 16 }}>O que nunca fazer com a logo.</div>
          </div>
          <div className="mono-sm text-bronze">06 ERROS COMUNS</div>
        </div>

        <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {dont.map((d, i) => (
            <div key={i} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ background: d.bg || 'var(--ink-2)', padding: 40, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {d.stacked ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <WordmarkBronze width={160}/>
                    <BullBronze width={60}/>
                  </div>
                ) : (
                  <div style={{ transform: d.transform, filter: d.filter }}>
                    <LogoBronze width={220}/>
                  </div>
                )}
                <div style={{ position: 'absolute', top: 12, left: 12, fontFamily: 'JetBrains Mono', fontSize: 11, color: '#E05050', letterSpacing: '0.2em', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, border: '1px solid #E05050', borderRadius: '50%', display: 'inline-block', position: 'relative' }}>
                    <span style={{ position: 'absolute', inset: 1, background: '#E05050', transform: 'rotate(45deg) scaleX(1.2) scaleY(0.08)' }}/>
                  </span>
                  NÃO
                </div>
              </div>
              <div style={{ padding: '14px 18px', borderTop: '1px solid var(--line)' }}>
                <div className="mono" style={{ fontSize: 13 }}>{d.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card card-md" style={{ marginTop: 32, background: 'var(--ink)', borderColor: 'var(--bronze)', borderLeft: '3px solid var(--bronze)' }}>
          <div className="flex items-center gap-4">
            <span className="mono-sm text-bronze">REGRA</span>
            <span className="body-lg" style={{ color: 'var(--fg)' }}>A logo é indivisível. Se a aplicação exige adaptação, solicite à marca — não improvise.</span>
          </div>
        </div>
      </div>
      <SlideFoot num={7} label="LOGO · USO INCORRETO" />
    </section>
  );
};

// ==================== 06 PALETTE — OVERVIEW ====================
window.SlidePalette = function SlidePalette() {
  const primary = [
    { name: 'Bronze Fórmula', hex: '#A0792E', rgb: '160 121 46', cmyk: '22 40 100 40', pantone: '4505 C', fg: '#fff' },
    { name: 'Preto Nelore', hex: '#000000', rgb: '0 0 0', cmyk: '0 0 0 100', pantone: 'Black 6 C', fg: '#A0792E' },
    { name: 'Branco Selo', hex: '#FFFFFF', rgb: '255 255 255', cmyk: '0 0 0 0', pantone: '—', fg: '#000' },
  ];
  const bronzeScale = [
    { name: 'Bronze 900', hex: '#3D2D11', fg: '#E8CB85'},
    { name: 'Bronze 700', hex: '#6B4F1E', fg: '#E8CB85'},
    { name: 'Bronze 500', hex: '#A0792E', fg: '#fff'},
    { name: 'Bronze 300', hex: '#D4A85C', fg: '#000'},
    { name: 'Bronze 100', hex: '#E8CB85', fg: '#000'},
  ];
  const neutrals = [
    { name: 'Ink', hex: '#0A0A0A', fg: '#fff' },
    { name: 'Ink 2', hex: '#141414', fg: '#fff' },
    { name: 'Gray 600', hex: '#4A4A4A', fg: '#fff' },
    { name: 'Gray 200', hex: '#C8C8C8', fg: '#000' },
    { name: 'Gray 100', hex: '#E8E8E8', fg: '#000' },
  ];
  const tech = [
    { name: 'Tech Green', hex: '#7FD4A0', role: 'Biotech · vida · campo', fg: '#000' },
    { name: 'Tech Blue', hex: '#1E3A5F', role: 'Dados · precisão · institucional', fg: '#fff' },
  ];

  const Swatch = ({ s, tall = false }) => (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ height: tall ? 180 : 120, background: s.hex, color: s.fg, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: s.hex === '#FFFFFF' || s.hex === '#E8E8E8' || s.hex === '#C8C8C8' ? '1px solid var(--line)' : 'none' }}>
        <div className="mono-sm" style={{ fontSize: 10 }}>{s.name}</div>
        <div>
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 500, fontSize: 22, letterSpacing: '-0.02em' }}>{s.hex}</div>
        </div>
      </div>
      {(s.rgb || s.role) && (
        <div style={{ padding: '10px 4px 0', fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--fg-muted)', letterSpacing: '0.05em' }}>
          {s.rgb && <div>RGB {s.rgb}</div>}
          {s.cmyk && <div>CMYK {s.cmyk}</div>}
          {s.pantone && <div>PMS {s.pantone}</div>}
          {s.role && <div style={{ color: 'var(--bronze)' }}>{s.role}</div>}
        </div>
      )}
    </div>
  );

  return (
    <section data-screen-label="08 Paleta de cores">
      <SlideMeta section="§ 05" title="PALETA DE CORES" />
      <div className="slide-pad" style={{ paddingTop: 150 }}>
        <div className="flex justify-between items-end">
          <div>
            <div className="eyebrow">— PALETA DE CORES</div>
            <div className="h-1" style={{ marginTop: 16, fontSize: 64 }}>Ouro envelhecido + preto absoluto.</div>
            <div className="body-lg text-mute" style={{ marginTop: 16, maxWidth: 900 }}>
              Bronze principal e preto como base. Escala bronze para hierarquia. Tech Green e Tech Blue como apoio em dashboards e infográficos.
            </div>
          </div>
        </div>

        {/* Primary row */}
        <div style={{ marginTop: 40 }}>
          <div className="mono-sm text-bronze" style={{ marginBottom: 14 }}>PRIMÁRIAS</div>
          <div className="flex gap-4">
            {primary.map(s => <Swatch key={s.name} s={s} tall />)}
          </div>
        </div>

        <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: '2fr 1.4fr', gap: 40 }}>
          <div>
            <div className="mono-sm text-bronze" style={{ marginBottom: 14 }}>ESCALA BRONZE</div>
            <div className="flex gap-3">
              {bronzeScale.map(s => <Swatch key={s.name} s={s} />)}
            </div>
          </div>
          <div>
            <div className="mono-sm text-bronze" style={{ marginBottom: 14 }}>TECH — APOIO</div>
            <div className="flex gap-4">
              {tech.map(s => <Swatch key={s.name} s={s} />)}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
          <div className="mono-sm text-bronze" style={{ marginBottom: 14 }}>NEUTRAS</div>
          <div className="flex gap-3">
            {neutrals.map(s => <Swatch key={s.name} s={s} />)}
          </div>
        </div>
      </div>
      <SlideFoot num={8} label="PALETA" />
    </section>
  );
};

// Palette — combinations + WCAG
window.SlidePaletteWCAG = function SlidePaletteWCAG() {
  const combos = [
    { bg: '#000000', fg: '#A0792E', name: 'Preto × Bronze', ratio: '5.2', aa: true, aaa: false, label: 'USO PRINCIPAL' },
    { bg: '#000000', fg: '#E8CB85', name: 'Preto × Bronze Pale', ratio: '11.4', aa: true, aaa: true, label: 'HEADLINES' },
    { bg: '#0A0A0A', fg: '#F5F0E4', name: 'Ink × Ink Light', ratio: '15.1', aa: true, aaa: true, label: 'CORPO' },
    { bg: '#A0792E', fg: '#000000', name: 'Bronze × Preto', ratio: '5.2', aa: true, aaa: false, label: 'BOTÕES' },
    { bg: '#FFFFFF', fg: '#000000', name: 'Branco × Preto', ratio: '21', aa: true, aaa: true, label: 'IMPRESSO' },
    { bg: '#FFFFFF', fg: '#6B4F1E', name: 'Branco × Bronze 700', ratio: '7.3', aa: true, aaa: true, label: 'LINK · CLARO' },
    { bg: '#1E3A5F', fg: '#E8CB85', name: 'Tech Blue × Bronze Pale', ratio: '8.2', aa: true, aaa: true, label: 'DASHBOARD' },
    { bg: '#000000', fg: '#7FD4A0', name: 'Preto × Tech Green', ratio: '10.1', aa: true, aaa: true, label: 'HIGHLIGHT POSITIVO' },
  ];
  const fail = [
    { bg: '#A0792E', fg: '#E8CB85', name: 'Bronze × Bronze Pale', ratio: '2.1' },
    { bg: '#FFFFFF', fg: '#D4A85C', name: 'Branco × Bronze 300', ratio: '2.0' },
  ];

  const Combo = ({ c, failed }) => (
    <div style={{ background: c.bg, color: c.fg, padding: 20, position: 'relative', border: c.bg === '#FFFFFF' ? '1px solid var(--line)' : 'none', minHeight: 130, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div className="mono-sm" style={{ fontSize: 10, opacity: 0.6 }}>{c.name}</div>
        <div style={{ fontFamily: 'Space Grotesk', fontWeight: 500, fontSize: 26, letterSpacing: '-0.02em', marginTop: 6 }}>
          {c.label || 'Aa'}
        </div>
      </div>
      <div className="flex items-center justify-between" style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.08em' }}>
        <span>{c.ratio}:1</span>
        <span>{failed ? '✕ FAIL' : (c.aaa ? 'AAA' : c.aa ? 'AA' : 'AA LARGE')}</span>
      </div>
    </div>
  );

  return (
    <section data-screen-label="09 Paleta — Acessibilidade">
      <SlideMeta section="§ 05" title="PALETA · COMBINAÇÕES WCAG" />
      <div className="slide-pad" style={{ paddingTop: 150 }}>
        <div className="eyebrow">— COMBINAÇÕES ACESSÍVEIS</div>
        <div className="h-2" style={{ marginTop: 16 }}>Aprovadas para corpo e texto funcional.</div>
        <div className="body text-mute" style={{ marginTop: 10, maxWidth: 900 }}>Contraste medido em WCAG 2.2. AA = 4.5:1 · AAA = 7:1. Use AAA para texto corrido; AA mínimo para títulos grandes.</div>

        <div style={{ marginTop: 32 }}>
          <div className="mono-sm text-bronze" style={{ marginBottom: 14 }}>APROVADAS ✓</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {combos.map((c, i) => <Combo key={i} c={c} />)}
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
          <div className="mono-sm" style={{ color: '#E05050', marginBottom: 14 }}>EVITAR ✕</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {fail.map((c, i) => <Combo key={i} c={c} failed />)}
            <div style={{ padding: 20, border: '1px dashed var(--line-strong)' }}>
              <div className="mono-sm text-bronze">REGRA</div>
              <div className="body" style={{ marginTop: 8 }}>Bronze sobre bronze é ornamento. Não é texto legível.</div>
            </div>
            <div style={{ padding: 20, border: '1px dashed var(--line-strong)' }}>
              <div className="mono-sm text-bronze">FERRAMENTA</div>
              <div className="body" style={{ marginTop: 8 }}>Use Stark, Contrast ou WebAIM para validar cada aplicação nova.</div>
            </div>
          </div>
        </div>
      </div>
      <SlideFoot num={9} label="PALETA · WCAG" />
    </section>
  );
};

Object.assign(window, { SlideLogoOverview, SlideLogoRules, SlideLogoMisuse, SlidePalette, SlidePaletteWCAG });
