/* Shared slide primitives for Brandbook FDB */
const { useState, useEffect, useRef } = React;

// ==================== CHROME ====================
window.SlideMeta = function SlideMeta({ section, title, showBrand = true }) {
  return (
    <div className="slide-meta">
      <div className="flex items-center gap-4">
        {showBrand && (
          <>
            <span className="dot">●</span>
            <span>FÓRMULA DO BOI</span>
            <span style={{opacity:0.3}}>/</span>
            <span>BRAND GUIDELINES</span>
            <span style={{opacity:0.3}}>/</span>
            <span>v1.0</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-4">
        {section && <span className="text-bronze">§ {section}</span>}
        {title && <span>{title}</span>}
      </div>
    </div>
  );
};

window.SlideFoot = function SlideFoot({ num, total = 48, label }) {
  return (
    <div className="slide-foot">
      <div className="flex items-center gap-4">
        <span>© 2025 FÓRMULA DO BOI</span>
        <span style={{opacity:0.3}}>/</span>
        <span>CONFIDENCIAL · USO INTERNO</span>
      </div>
      <div className="flex items-center gap-4">
        {label && <span>{label}</span>}
        <span className="num">{String(num).padStart(2,'0')} / {String(total).padStart(2,'0')}</span>
      </div>
    </div>
  );
};

// Corner brackets decoration
window.Brackets = function Brackets({ children, color = 'var(--bronze)', size = 16, thickness = 1, offset = 0, style }) {
  const arm = {
    position: 'absolute', width: size, height: size,
    borderColor: color, borderStyle: 'solid'
  };
  return (
    <div style={{ position: 'relative', ...style }}>
      <div style={{...arm, top: offset, left: offset, borderTopWidth: thickness, borderLeftWidth: thickness}} />
      <div style={{...arm, top: offset, right: offset, borderTopWidth: thickness, borderRightWidth: thickness}} />
      <div style={{...arm, bottom: offset, left: offset, borderBottomWidth: thickness, borderLeftWidth: thickness}} />
      <div style={{...arm, bottom: offset, right: offset, borderBottomWidth: thickness, borderRightWidth: thickness}} />
      {children}
    </div>
  );
};

// Logo components
window.LogoFull = function LogoFull({ color = '#A0792E', width = 480, style }) {
  return <img src="assets/logo-bronze.svg" style={{ width, filter: color === '#A0792E' ? 'none' : `brightness(0) saturate(100%) ${color === '#FFFFFF' ? 'invert(100%)' : ''}`, ...style }} />;
};

window.LogoBronze = function LogoBronze({ width = 480, style }) {
  return <img src="assets/logo-bronze.svg" style={{ width, display: 'block', ...style }} />;
};
window.LogoWhite = function LogoWhite({ width = 480, style }) {
  return <img src="assets/logo-white.svg" style={{ width, display: 'block', ...style }} />;
};
window.LogoBlack = function LogoBlack({ width = 480, style }) {
  return <img src="assets/logo-black.svg" style={{ width, display: 'block', ...style }} />;
};
window.LogoGold = function LogoGold({ width = 480, style }) {
  return <img src="assets/logo-gold-gradient.svg" style={{ width, display: 'block', ...style }} />;
};
window.BullBronze = function BullBronze({ width = 200, style }) {
  return <img src="assets/bull-bronze.svg" style={{ width, display: 'block', ...style }} />;
};
window.BullWhite = function BullWhite({ width = 200, style }) {
  return <img src="assets/bull-white.svg" style={{ width, display: 'block', ...style }} />;
};
window.WordmarkBronze = function WordmarkBronze({ width = 420, style }) {
  return <img src="assets/wordmark-bronze.svg" style={{ width, display: 'block', ...style }} />;
};
window.WordmarkWhite = function WordmarkWhite({ width = 420, style }) {
  return <img src="assets/wordmark-white.svg" style={{ width, display: 'block', ...style }} />;
};

// Placeholder image with label
window.PhImg = function PhImg({ label, tone = 'dark', aspect, style, children }) {
  return (
    <div className="ph-img" style={{ aspectRatio: aspect, ...style }}>
      {children}
      {label && <div className="ph-label">◉ {label}</div>}
    </div>
  );
};

// Tag / pill
window.Tag = function Tag({ children, color = 'var(--bronze)' }) {
  return (
    <span className="tag" style={{ color, borderColor: 'rgba(232,203,133,0.3)' }}>
      <span className="pip" style={{ background: color }} />
      {children}
    </span>
  );
};

// Decorative DNA strand SVG (pure geometry)
window.DNAStrand = function DNAStrand({ width = 600, height = 80, color = 'var(--bronze)', count = 30, style }) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const x = (i / (count - 1)) * width;
    const a = Math.sin((i / count) * Math.PI * 4) * (height / 2 - 4);
    const b = -a;
    pts.push({ x, a: a + height/2, b: b + height/2 });
  }
  return (
    <svg width={width} height={height} style={style}>
      <path d={`M ${pts.map(p => `${p.x},${p.a}`).join(' L ')}`} stroke={color} strokeWidth="1" fill="none" opacity="0.8"/>
      <path d={`M ${pts.map(p => `${p.x},${p.b}`).join(' L ')}`} stroke={color} strokeWidth="1" fill="none" opacity="0.5"/>
      {pts.map((p, i) => i % 2 === 0 && (
        <line key={i} x1={p.x} y1={p.a} x2={p.x} y2={p.b} stroke={color} strokeWidth="0.5" opacity="0.3" />
      ))}
      {pts.map((p, i) => i % 3 === 0 && (
        <React.Fragment key={'d'+i}>
          <circle cx={p.x} cy={p.a} r="1.5" fill={color} opacity="0.9" />
          <circle cx={p.x} cy={p.b} r="1.5" fill={color} opacity="0.6" />
        </React.Fragment>
      ))}
    </svg>
  );
};

// DEP bar (genetic evaluation bar)
window.DEPBar = function DEPBar({ label, value, percentile, color = 'var(--bronze)' }) {
  const pct = Math.max(0, Math.min(100, percentile));
  return (
    <div className="flex col" style={{ gap: 6 }}>
      <div className="flex justify-between items-center">
        <span className="mono-sm text-mute">{label}</span>
        <span className="mono" style={{ color: 'var(--fg)', fontWeight: 500 }}>{value}</span>
      </div>
      <div style={{ position: 'relative', height: 4, background: 'rgba(232,203,133,0.08)' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: color }} />
        <div style={{ position: 'absolute', left: '50%', top: -2, bottom: -2, width: 1, background: 'rgba(255,255,255,0.1)' }} />
      </div>
      <div className="flex justify-between">
        <span className="mono-sm text-mute" style={{ fontSize: 10 }}>0</span>
        <span className="mono-sm" style={{ fontSize: 10, color: 'var(--bronze)' }}>TOP {100 - Math.round(pct)}%</span>
        <span className="mono-sm text-mute" style={{ fontSize: 10 }}>100</span>
      </div>
    </div>
  );
};

// Cross-hairs registration mark
window.Crosshair = function Crosshair({ size = 24, color = 'var(--bronze)', style }) {
  return (
    <svg width={size} height={size} style={style}>
      <circle cx={size/2} cy={size/2} r={size/2 - 2} fill="none" stroke={color} strokeWidth="0.8" opacity="0.7"/>
      <line x1={size/2} y1="0" x2={size/2} y2={size} stroke={color} strokeWidth="0.6" opacity="0.7"/>
      <line x1="0" y1={size/2} x2={size} y2={size/2} stroke={color} strokeWidth="0.6" opacity="0.7"/>
    </svg>
  );
};
