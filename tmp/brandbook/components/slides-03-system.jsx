/* Slides: Typography (07) + Grafismos (08) + Fotografia (09) */

// ==================== 07 TYPOGRAPHY ====================
window.SlideTypeOverview = function SlideTypeOverview() {
  return (
    <section data-screen-label="10 Tipografia — Famílias">
      <SlideMeta section="§ 06" title="TIPOGRAFIA" />
      <div className="slide-pad" style={{ paddingTop: 150 }}>
        <div className="eyebrow">— SISTEMA TIPOGRÁFICO</div>
        <div className="h-1" style={{ marginTop: 16, fontSize: 64 }}>Três vozes. Uma hierarquia.</div>

        <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Space Grotesk hero */}
          <div className="card" style={{ padding: 40, gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
            <div>
              <div className="mono-sm text-bronze">PRIMÁRIA · DISPLAY + BODY</div>
              <div style={{ fontFamily: 'Space Grotesk', fontSize: 160, fontWeight: 500, lineHeight: 0.9, letterSpacing: '-0.03em', marginTop: 12, color: 'var(--fg)' }}>Aa</div>
              <div className="mono" style={{ marginTop: 8 }}>Space Grotesk</div>
              <div className="body-sm" style={{ marginTop: 8 }}>Sans-serif geométrica com caráter técnico. Pesos: 400, 500, 600, 700.</div>
            </div>
            <div>
              <div style={{ fontFamily: 'Space Grotesk', fontSize: 28, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
                ABCDEFGHIJKLMNOPQRSTUVWXYZ<br/>
                abcdefghijklmnopqrstuvwxyz<br/>
                0123456789 — & % @ § © ® ™
              </div>
              <div className="hr" style={{ marginTop: 20, marginBottom: 20 }}/>
              <div style={{ display: 'flex', gap: 24 }}>
                {['Regular 400', 'Medium 500', 'SemiBold 600', 'Bold 700'].map(w => (
                  <div key={w} style={{ fontFamily: 'Space Grotesk', fontWeight: w.endsWith('400')?400:w.endsWith('500')?500:w.endsWith('600')?600:700 }}>
                    <div style={{ fontSize: 28, letterSpacing: '-0.02em' }}>Nelore</div>
                    <div className="mono-sm text-mute" style={{ marginTop: 4 }}>{w}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* JetBrains Mono */}
          <div className="card" style={{ padding: 32 }}>
            <div className="mono-sm text-bronze">MONOESPAÇADA · DADOS</div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 120, fontWeight: 500, lineHeight: 0.9, marginTop: 10, color: 'var(--fg)' }}>Aa</div>
            <div className="mono" style={{ marginTop: 8 }}>JetBrains Mono</div>
            <div className="body-sm" style={{ marginTop: 6 }}>Para DEPs, identificadores, dados tabulares. Pesos 400/500.</div>
            <div style={{ marginTop: 20, fontFamily: 'JetBrains Mono', fontSize: 14, lineHeight: 1.7, color: 'var(--fg)' }}>
              DEP.PN30M  +0.841<br/>
              MGTe       147.3<br/>
              PO / REG   BR-42871<br/>
              PERC.      TOP 0.3%
            </div>
          </div>

          {/* Wordmark note */}
          <div className="card" style={{ padding: 32 }}>
            <div className="mono-sm text-bronze">WORDMARK · PROTEGIDO</div>
            <WordmarkBronze width={280} style={{ marginTop: 16 }}/>
            <div className="body-sm" style={{ marginTop: 16 }}>
              A tipografia do wordmark "FÓRMULA DO BOI" é condensada bold customizada. Nunca a recrie em outra fonte. Use apenas os arquivos oficiais vetorizados.
            </div>
            <div className="mono-sm text-mute" style={{ marginTop: 16, fontSize: 10 }}>
              ARQUIVO → wordmark-bronze.svg
            </div>
          </div>
        </div>
      </div>
      <SlideFoot num={10} label="TIPOGRAFIA · FAMÍLIAS" />
    </section>
  );
};

// Typography scale
window.SlideTypeScale = function SlideTypeScale() {
  const scale = [
    ['H1 · DISPLAY', 96, 500, -0.03, 'Space Grotesk', 'Genética de elite.'],
    ['H2 · HERO', 64, 500, -0.025, 'Space Grotesk', 'Curadoria do top 0.1%'],
    ['H3 · TÍTULO', 44, 500, -0.02, 'Space Grotesk', 'Lote 07 — Dona Serena'],
    ['H4 · SUBTÍTULO', 32, 500, -0.015, 'Space Grotesk', 'Avaliação genética completa'],
    ['BODY · LG', 22, 400, -0.005, 'Space Grotesk', 'Parágrafos em destaque e abertura.'],
    ['BODY · BASE', 16, 400, 0, 'Space Grotesk', 'Corpo padrão para leituras longas.'],
    ['CAPTION', 13, 500, 0.05, 'JetBrains Mono', 'DEP · PN30M · +0.841 · TOP 0.3%'],
  ];
  return (
    <section data-screen-label="11 Tipografia — Escala">
      <SlideMeta section="§ 06" title="TIPOGRAFIA · ESCALA" />
      <div className="slide-pad" style={{ paddingTop: 140 }}>
        <div className="eyebrow">— ESCALA TIPOGRÁFICA</div>
        <div className="h-2" style={{ marginTop: 12, fontSize: 52 }}>Hierarquia modular ratio 1.33.</div>

        <div style={{ marginTop: 24 }}>
          {scale.map(([label, size, weight, track, family, sample]) => (
            <div key={label} style={{ display: 'grid', gridTemplateColumns: '220px 1fr 160px', gap: 32, alignItems: 'baseline', padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
              <div>
                <div className="mono-sm text-bronze">{label}</div>
                <div className="mono-sm text-mute" style={{ fontSize: 10, marginTop: 2 }}>{family}</div>
              </div>
              <div style={{ fontFamily: family, fontSize: Math.min(size, 64), fontWeight: weight, letterSpacing: `${track}em`, lineHeight: 1.05, color: 'var(--fg)' }}>
                {sample}
              </div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--fg-muted)', textAlign: 'right' }}>
                {size}px · w{weight}<br/>
                track {track}em
              </div>
            </div>
          ))}
        </div>
      </div>
      <SlideFoot num={11} label="TIPOGRAFIA · ESCALA" />
    </section>
  );
};

// ==================== 08 GRAFISMOS ====================

// DNA pattern big
const DNABig = ({ width=300, height=180, color='var(--bronze)' }) => {
  const count = 20;
  const pts = [];
  for (let i = 0; i < count; i++) {
    const x = (i / (count - 1)) * width;
    const a = Math.sin((i / (count-1)) * Math.PI * 3) * (height/2 - 8);
    pts.push({ x, top: a + height/2, bot: -a + height/2 });
  }
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={`M ${pts.map(p => `${p.x},${p.top}`).join(' L ')}`} stroke={color} strokeWidth="1.2" fill="none"/>
      <path d={`M ${pts.map(p => `${p.x},${p.bot}`).join(' L ')}`} stroke={color} strokeWidth="1.2" fill="none" opacity="0.6"/>
      {pts.map((p, i) => (
        <line key={i} x1={p.x} y1={p.top} x2={p.x} y2={p.bot} stroke={color} strokeWidth="0.6" opacity="0.25"/>
      ))}
      {pts.map((p, i) => (
        <React.Fragment key={'d'+i}>
          <circle cx={p.x} cy={p.top} r="2.2" fill={color}/>
          <circle cx={p.x} cy={p.bot} r="2.2" fill={color} opacity="0.7"/>
        </React.Fragment>
      ))}
    </svg>
  );
};

const HeatmapGrid = ({ w=300, h=180, cols=16, rows=9 }) => {
  const cells = [];
  for (let r=0; r<rows; r++) for (let c=0; c<cols; c++) {
    const cx = c/cols, cy = r/rows;
    const d = Math.sqrt((cx-0.4)**2+(cy-0.5)**2);
    const v = Math.max(0, 1 - d*1.8 + Math.sin(c*0.6+r*0.5)*0.15);
    cells.push({ c, r, v });
  }
  const cw = w/cols, ch = h/rows;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {cells.map((c,i) => (
        <rect key={i} x={c.c*cw+1} y={c.r*ch+1} width={cw-2} height={ch-2} fill="#A0792E" opacity={Math.max(0.05, Math.min(1, c.v))}/>
      ))}
    </svg>
  );
};

const DEPPattern = ({ w=300, h=180 }) => {
  const bars = [0.82, 0.64, 0.91, 0.45, 0.73, 0.58, 0.89, 0.38];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {bars.map((b, i) => (
        <g key={i} transform={`translate(10, ${10 + i*20})`}>
          <rect x="0" y="0" width={w-20} height="3" fill="rgba(232,203,133,0.12)"/>
          <rect x="0" y="0" width={(w-20)*b} height="3" fill="#A0792E"/>
          <circle cx={(w-20)*b} cy="1.5" r="3" fill="#E8CB85"/>
        </g>
      ))}
    </svg>
  );
};

const TreeGraph = ({ w=300, h=180 }) => {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <line x1="20" y1="90" x2="110" y2="40" stroke="#A0792E" strokeWidth="0.8"/>
      <line x1="20" y1="90" x2="110" y2="140" stroke="#A0792E" strokeWidth="0.8"/>
      <line x1="110" y1="40" x2="220" y2="20" stroke="#A0792E" strokeWidth="0.8" opacity="0.5"/>
      <line x1="110" y1="40" x2="220" y2="60" stroke="#A0792E" strokeWidth="0.8" opacity="0.5"/>
      <line x1="110" y1="140" x2="220" y2="120" stroke="#A0792E" strokeWidth="0.8" opacity="0.5"/>
      <line x1="110" y1="140" x2="220" y2="160" stroke="#A0792E" strokeWidth="0.8" opacity="0.5"/>
      {[[20,90,5],[110,40,4],[110,140,4],[220,20,3],[220,60,3],[220,120,3],[220,160,3]].map(([x,y,r],i)=>(
        <circle key={i} cx={x} cy={y} r={r} fill="#0A0A0A" stroke="#A0792E" strokeWidth="1"/>
      ))}
      {[[22,94],[113,44],[113,144],[222,24],[222,64],[222,124],[222,164]].map(([x,y],i) => (
        <text key={'t'+i} x={x+8} y={y+2} fontFamily="JetBrains Mono" fontSize="8" fill="#9A928A">{['G1','G2.1','G2.2','G3.1','G3.2','G3.3','G3.4'][i]}</text>
      ))}
    </svg>
  );
};

const TopoLines = ({ w=300, h=180 }) => {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {[0,1,2,3,4,5,6,7].map(i => (
        <path key={i} d={`M 0 ${30 + i*18} Q ${w*0.3} ${20 + i*18 + Math.sin(i)*12}, ${w*0.6} ${30 + i*18} T ${w} ${30 + i*18 - Math.cos(i)*8}`} stroke="#A0792E" strokeWidth="0.6" fill="none" opacity={0.18 + i*0.08}/>
      ))}
    </svg>
  );
};

const GridDots = ({ w=300, h=180 }) => {
  const cols=24, rows=14;
  const cw=w/cols, ch=h/rows;
  const dots = [];
  for (let r=0; r<rows; r++) for (let c=0; c<cols; c++) {
    const mid = Math.abs(r - rows/2)/(rows/2);
    const opac = Math.max(0.1, 1 - mid*1.1);
    dots.push({x:c*cw+cw/2, y:r*ch+ch/2, o: opac * (0.4 + Math.random()*0.6)});
  }
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {dots.map((d,i) => <circle key={i} cx={d.x} cy={d.y} r="1" fill="#A0792E" opacity={d.o}/>)}
    </svg>
  );
};

window.SlideGraphicsLib = function SlideGraphicsLib() {
  const patterns = [
    { name: 'DNA · Hélice', desc: 'Headers, cabeçalhos de documento, divisores', el: <DNABig/> },
    { name: 'Barras DEP · Percentil', desc: 'Infográficos genéticos, fichas técnicas', el: <DEPPattern/> },
    { name: 'Heatmap · Matriz', desc: 'Dashboards, análises de performance', el: <HeatmapGrid/> },
    { name: 'Genealogia · Árvore', desc: 'Pedigree, linhagens, relatórios de lote', el: <TreeGraph/> },
    { name: 'Topografia · Isolinhas', desc: 'Fundos sutis, referência ao campo', el: <TopoLines/> },
    { name: 'Grid · Pontos modulados', desc: 'Backgrounds técnicos, passagens de slide', el: <GridDots/> },
  ];
  return (
    <section data-screen-label="12 Grafismos e padrões">
      <SlideMeta section="§ 07" title="GRAFISMOS & PADRÕES" />
      <div className="slide-pad" style={{ paddingTop: 150 }}>
        <div className="eyebrow">— BIBLIOTECA DE GRAFISMOS</div>
        <div className="h-1" style={{ marginTop: 16, fontSize: 60 }}>Sistema visual auxiliar.</div>
        <div className="body-lg text-mute" style={{ marginTop: 12, maxWidth: 900 }}>
          Seis famílias de padrões geométricos, sempre em bronze sobre preto. Linhas finas, glow sutil, feeling de dashboard genético.
        </div>

        <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {patterns.map((p, i) => (
            <div key={i} className="card" style={{ padding: 0 }}>
              <div style={{ background: 'var(--ink)', padding: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, borderBottom: '1px solid var(--line)' }}>
                {p.el}
              </div>
              <div style={{ padding: '16px 20px' }}>
                <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                  <span className="mono-sm text-bronze" style={{ fontSize: 10 }}>0{i+1}</span>
                  <span className="mono" style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</span>
                </div>
                <div className="body-sm">{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <SlideFoot num={12} label="GRAFISMOS" />
    </section>
  );
};

// ==================== 09 FOTOGRAFIA ====================
window.SlidePhoto = function SlidePhoto() {
  const doPhotos = [
    'CLOSE-UP · PELAGEM + MUSCULATURA',
    'OLHAR · CONTRASTE ALTO',
    'MANEJO TECH · IATF · ULTRASSOM',
    'LAB FIV · COLETA · MICROSCOPIA',
    'DADOS SOBREPOSTOS · DEP · MGTe',
  ];
  const dontPhotos = [
    'TOURO POSANDO DE CORPO INTEIRO',
    'PÔR-DO-SOL EM CURRAL · CLICHÊ',
    'CAUBÓI · CHAPEADO · RURAL-ROMÂNTICO',
    'CORES QUENTES SATURADAS · PÔSTERES',
  ];
  return (
    <section data-screen-label="13 Fotografia">
      <SlideMeta section="§ 08" title="FOTOGRAFIA" />
      <div className="slide-pad" style={{ paddingTop: 130 }}>
        <div className="eyebrow">— DIREÇÃO DE ARTE</div>
        <div className="h-1" style={{ marginTop: 10, fontSize: 52 }}>Matéria e dado.</div>
        <div className="body-lg text-mute" style={{ marginTop: 10, maxWidth: 900 }}>
          Close alto contraste + cena de tecnologia em campo + laboratório. Sempre com profundidade; evite planos genéricos de animal posando.
        </div>

        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20 }}>
          {/* Do's */}
          <div>
            <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
              <span className="text-bronze mono">✓</span>
              <span className="mono-sm text-bronze">USE — DIREÇÃO CORRETA</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridAutoRows: '210px', gap: 10 }}>
              {doPhotos.slice(0,3).map((p, i) => (
                <PhImg key={i} label={p} style={{ aspectRatio: 'auto', height: '100%' }}/>
              ))}
              <PhImg label={doPhotos[3]} style={{ aspectRatio: 'auto', height: '100%', gridColumn: 'span 2' }}/>
              <div style={{ position: 'relative' }}>
                <PhImg label={doPhotos[4]} style={{ aspectRatio: 'auto', height: '100%' }}/>
                <div style={{ position: 'absolute', left: 8, bottom: 8, right: 8, fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--bronze)', background: 'rgba(0,0,0,0.6)', padding: 6, border: '1px solid var(--line-strong)' }}>
                  <div>DEP.PN30M +0.841</div>
                  <div>MGTe 147.3 · TOP 0.3%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Don'ts */}
          <div>
            <div className="flex items-center gap-3" style={{ marginBottom: 14 }}>
              <span style={{ color:'#E05050' }} className="mono">✕</span>
              <span className="mono-sm" style={{ color:'#E05050' }}>EVITE — CLICHÊS</span>
            </div>
            <div className="flex col gap-3">
              {dontPhotos.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, border: '1px dashed var(--line)', borderRadius: 2 }}>
                  <span style={{ color:'#E05050' }} className="mono">✕</span>
                  <span className="body" style={{ color: 'var(--fg-muted)' }}>{p}</span>
                </div>
              ))}
            </div>

            <div className="card card-md" style={{ marginTop: 16, borderLeft: '2px solid var(--bronze)' }}>
              <div className="mono-sm text-bronze">TRATAMENTO</div>
              <div className="body" style={{ marginTop: 10, color: 'var(--fg)' }}>
                Contraste alto · desaturação sutil · warm shadows (bronze) · blacks profundos (não cinza).
              </div>
              <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {['Exp −0.3', 'Contraste +30', 'Sat −15', 'Shadow +12', 'Warm +8', 'Grain +4'].map(k => (
                  <div key={k} className="mono-sm" style={{ fontSize: 10, padding: '6px 8px', background: 'var(--ink)', border: '1px solid var(--line)' }}>{k}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <SlideFoot num={13} label="FOTOGRAFIA" />
    </section>
  );
};

Object.assign(window, { SlideTypeOverview, SlideTypeScale, SlideGraphicsLib, SlidePhoto });
