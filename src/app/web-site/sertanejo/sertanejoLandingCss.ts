export const sertanejoLandingCss = `
:root {
  --st-ink: #0a0908;
  --st-leather: #14110f;
  --st-leather-2: #1c1816;
  --st-leather-3: #2a221d;
  --st-bone: #f4ede0;
  --st-bone-2: #e8d9b0;
  --st-bone-bg: #f4ede0;
  --st-bone-bg-2: #ebe1cf;
  --st-bone-deep: #d9c9a8;
  --st-ink-soft: #1a1714;
  --st-gold: #c9a24a;
  --st-gold-2: #e3c279;
  --st-gold-deep: #8a6a26;
  --st-copper: #a07334;
  --st-rule: rgba(201,162,74,0.22);
  --st-rule-2: rgba(201,162,74,0.45);
  --st-txt: #d8cfbe;
  --st-txt-dim: #8e8478;
  --st-green: #5a7c3f;
  --st-green-2: #7a9a55;
  --st-serif: "Bodoni Moda", "Playfair Display", "Didot", "Times New Roman", serif;
  --st-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --st-mono: "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace;
}

.sertanejo-v2-wrap, .sertanejo-v2-wrap *, .sertanejo-v2-wrap *::before, .sertanejo-v2-wrap *::after { box-sizing: border-box; }
.sertanejo-v2-wrap {
  font-family: var(--st-sans);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  background-color: var(--st-bone-bg);
  background-image:
    radial-gradient(ellipse at 20% 5%, rgba(201,162,74,0.18), transparent 55%),
    radial-gradient(ellipse at 90% 95%, rgba(138,106,38,0.12), transparent 55%),
    radial-gradient(circle at 60% 40%, rgba(217,201,168,0.20), transparent 60%),
    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='420' height='420'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.55  0 0 0 0 0.43  0 0 0 0 0.21  0 0 0 0.18 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>"),
    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='800'><filter id='c'><feTurbulence type='turbulence' baseFrequency='0.012 0.018' numOctaves='3' seed='4'/><feColorMatrix values='0 0 0 0 0.41  0 0 0 0 0.31  0 0 0 0 0.13  0 0 0 0.12 0'/></filter><rect width='100%25' height='100%25' filter='url(%23c)'/></svg>");
  color: var(--st-ink-soft);
  position: relative;
  isolation: isolate;
  overflow-x: hidden;
}

/* Body subtle scuffs */
.sertanejo-v2-wrap::before {
  content: '';
  position: absolute; inset: 0; pointer-events: none; z-index: 0;
  background:
    radial-gradient(ellipse 60% 40% at 0% 0%, rgba(138,106,38,0.10), transparent 60%),
    radial-gradient(ellipse 50% 50% at 100% 100%, rgba(138,106,38,0.08), transparent 60%);
}
.sertanejo-v2-wrap > * { position: relative; z-index: 1; }

.sertanejo-v2-wrap a { text-decoration: none; color: inherit; }
.sertanejo-v2-wrap ul { list-style: none; padding: 0; margin: 0; }
.sertanejo-v2-wrap img { max-width: 100%; display: block; }

.sertanejo-v2-wrap .serif { font-family: var(--st-serif); font-weight: 400; letter-spacing: -0.01em; }
.sertanejo-v2-wrap .serif-tight { font-family: var(--st-serif); font-weight: 500; letter-spacing: -0.03em; line-height: 0.92; }
.sertanejo-v2-wrap .mono { font-family: var(--st-mono); }

.sertanejo-v2-wrap .sert-section { padding: clamp(60px, 8vw, 120px) clamp(20px, 5vw, 80px); position: relative; }
.sertanejo-v2-wrap .sert-wrap { max-width: 1280px; margin: 0 auto; }

.sertanejo-v2-wrap .sert-card {
  background: linear-gradient(180deg, rgba(255,253,247,0.9), rgba(244,237,224,0.7));
  border: 1px solid rgba(138,106,38,0.25);
  position: relative;
}

/* Dark leather sections */
.sertanejo-v2-wrap .sert-dark-leather {
  background-color: #0a0908;
  background-image:
    radial-gradient(ellipse 80% 60% at 0% 0%, rgba(201,162,74,0.10), transparent 60%),
    radial-gradient(ellipse 80% 60% at 100% 100%, rgba(160,115,52,0.07), transparent 60%),
    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='420' height='420'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch' seed='3'/><feColorMatrix values='0 0 0 0 0.50  0 0 0 0 0.38  0 0 0 0 0.18  0 0 0 0.07 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>"),
    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><filter id='c'><feTurbulence type='turbulence' baseFrequency='0.020 0.026' numOctaves='3' seed='7'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%25' height='100%25' filter='url(%23c)'/></svg>"),
    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='1200'><filter id='m'><feTurbulence type='turbulence' baseFrequency='0.004 0.008' numOctaves='2' seed='2'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.45 0'/></filter><rect width='100%25' height='100%25' filter='url(%23m)'/></svg>");
  position: relative;
  isolation: isolate;
}
.sertanejo-v2-wrap .sert-dark-leather::after {
  content: '';
  position: absolute; inset: 0;
  pointer-events: none;
  box-shadow:
    inset 0 30px 60px -20px rgba(0,0,0,0.7),
    inset 0 -30px 60px -20px rgba(0,0,0,0.7);
  z-index: 0;
}
.sertanejo-v2-wrap .sert-dark-leather > * { position: relative; z-index: 1; }

/* Buttons */
.sertanejo-v2-wrap .btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 12px;
  padding: 16px 26px;
  font-family: var(--st-mono); font-size: 12px; letter-spacing: 0.22em;
  text-transform: uppercase; cursor: pointer; border: none;
  transition: all 0.25s ease; text-decoration: none;
}
.sertanejo-v2-wrap .btn-gold {
  background: linear-gradient(180deg, var(--st-gold-2), var(--st-gold));
  color: var(--st-ink); font-weight: 600;
  box-shadow: 0 0 0 1px var(--st-gold-deep) inset, 0 1px 0 rgba(255,255,255,0.4) inset, 0 6px 20px rgba(201,162,74,0.18);
}
.sertanejo-v2-wrap .btn-gold:hover { transform: translateY(-1px); }
.sertanejo-v2-wrap .btn-green {
  background: linear-gradient(180deg, var(--st-green-2), var(--st-green));
  color: white; font-weight: 600;
  box-shadow: 0 0 0 1px #3d5a25 inset, 0 1px 0 rgba(255,255,255,0.25) inset, 0 6px 20px rgba(90,124,63,0.25);
}
.sertanejo-v2-wrap .btn-green:hover { transform: translateY(-1px); }
.sertanejo-v2-wrap .btn-outline-dark {
  background: transparent; color: var(--st-ink-soft);
  border: 1px solid var(--st-gold-deep);
}
.sertanejo-v2-wrap .btn-outline-dark:hover { background: rgba(201,162,74,0.10); }
.sertanejo-v2-wrap .btn-ghost-dark {
  background: transparent; color: var(--st-bone);
  border: 1px solid var(--st-rule-2);
}
.sertanejo-v2-wrap .btn-ghost-dark:hover { background: rgba(201,162,74,0.10); border-color: var(--st-gold); }

/* Tag pill */
.sertanejo-v2-wrap .tag-pill {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 18px;
  border: 1px solid rgba(138,106,38,0.30);
  background: rgba(255,253,247,0.5);
  font-family: var(--st-mono);
  font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase;
  color: var(--st-gold-deep); font-weight: 500;
}
.sertanejo-v2-wrap .tag-pill::before {
  content: '●'; color: var(--st-gold); font-size: 10px;
}

/* Image vignette */
.sertanejo-v2-wrap .img-vignette { position: relative; }
.sertanejo-v2-wrap .img-vignette::after {
  content: ""; position: absolute; inset: 0;
  background: radial-gradient(ellipse at center, transparent 50%, rgba(10,9,8,0.55) 100%);
  pointer-events: none;
}

/* Marquee animation */
@keyframes sertanejo-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

@keyframes sertanejo-fade-in { from { opacity: 0; } to { opacity: 1; } }

/* Ticker number */
.sertanejo-v2-wrap .ticker-num {
  font-family: var(--st-serif);
  font-feature-settings: "tnum", "lnum";
  line-height: 1;
}

/* Selection */
.sertanejo-v2-wrap ::selection { background: var(--st-gold); color: var(--st-ink); }

/* Responsive grids */
@media (max-width: 1100px) {
  .sertanejo-v2-wrap .nav-center { display: none !important; }
  .sertanejo-v2-wrap .hero-grid { grid-template-columns: 1fr !important; }
  .sertanejo-v2-wrap .manifesto-grid { grid-template-columns: 1fr !important; }
  .sertanejo-v2-wrap .hero-stats { grid-template-columns: repeat(2, 1fr) !important; }
  .sertanejo-v2-wrap .diff-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .sertanejo-v2-wrap .pricing-grid { grid-template-columns: 1fr !important; }
  .sertanejo-v2-wrap .pedigree-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .sertanejo-v2-wrap .genstat-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .sertanejo-v2-wrap .thumb-row { grid-template-columns: repeat(2, 1fr) !important; }
  .sertanejo-v2-wrap .deps-grid { grid-template-columns: 1fr !important; }
}
@media (max-width: 600px) {
  .sertanejo-v2-wrap .hero-stats { grid-template-columns: 1fr !important; }
  .sertanejo-v2-wrap .diff-grid { grid-template-columns: 1fr !important; }
  .sertanejo-v2-wrap .pedigree-grid { grid-template-columns: 1fr !important; }
  .sertanejo-v2-wrap .genstat-grid { grid-template-columns: 1fr !important; }
  .sertanejo-v2-wrap .thumb-row { grid-template-columns: 1fr !important; }
  .sertanejo-v2-wrap .nav-pre { display: none !important; }
}

/* Lightbox */
.sertanejo-v2-wrap .lightbox {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(10,9,8,0.96);
  display: none; align-items: center; justify-content: center;
  padding: 40px;
}
.sertanejo-v2-wrap .lightbox.active { display: flex; animation: sertanejo-fade-in 0.25s ease; }
.sertanejo-v2-wrap .lightbox img { max-width: 92%; max-height: 92vh; object-fit: contain; }
.sertanejo-v2-wrap .lightbox-close,
.sertanejo-v2-wrap .lightbox-nav {
  position: absolute; background: transparent; border: 1px solid rgba(201,162,74,0.4);
  color: var(--st-bone); cursor: pointer;
  width: 48px; height: 48px;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; font-family: var(--st-serif);
}
.sertanejo-v2-wrap .lightbox-close { top: 24px; right: 24px; }
.sertanejo-v2-wrap .lightbox-prev { left: 24px; top: 50%; transform: translateY(-50%); }
.sertanejo-v2-wrap .lightbox-next { right: 24px; top: 50%; transform: translateY(-50%); }
.sertanejo-v2-wrap .lightbox-nav:hover, .sertanejo-v2-wrap .lightbox-close:hover { background: rgba(201,162,74,0.15); }

/* Video modal */
.sertanejo-v2-wrap .video-modal {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(10,9,8,0.96);
  display: none; align-items: center; justify-content: center;
  padding: 40px;
}
.sertanejo-v2-wrap .video-modal.active { display: flex; animation: sertanejo-fade-in 0.25s ease; }
.sertanejo-v2-wrap .video-modal-inner {
  position: relative; width: min(900px, 100%); aspect-ratio: 16 / 9;
  background: #000; border: 1px solid var(--st-rule-2);
}
.sertanejo-v2-wrap .video-modal-inner video { width: 100%; height: 100%; object-fit: contain; }
.sertanejo-v2-wrap .video-modal-close {
  position: absolute; top: -56px; right: 0;
  background: transparent; border: 1px solid rgba(201,162,74,0.4);
  color: var(--st-bone); width: 44px; height: 44px;
  font-size: 22px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.sertanejo-v2-wrap .video-modal-close:hover { background: rgba(201,162,74,0.15); }
`;
