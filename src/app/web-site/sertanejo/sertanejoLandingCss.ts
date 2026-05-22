export const sertanejoLandingCss = `
:root {
  /* Brandbook neutros — Ink Nelore + escala Ink. Variáveis com nome legado mantidas para compatibilidade. */
  --st-ink: #161616;
  --st-leather: #1f1f1f;
  --st-leather-2: #2a2a2a;
  --st-leather-3: #363636;
  --st-bone: #f4ede0;
  --st-bone-2: #e8d9b0;
  --st-bone-bg: #f4ede0;
  --st-bone-bg-2: #ebe1cf;
  --st-bone-deep: #d9c9a8;
  --st-ink-soft: #1a1714;
  --st-gold: #A0792E;
  --st-gold-2: #D4A85C;
  --st-gold-deep: #6B4F1E;
  --st-copper: #6B4F1E;
  --st-rule: rgba(160,121,46,0.22);
  --st-rule-2: rgba(160,121,46,0.45);
  --st-txt: #d8cfbe;
  --st-txt-dim: #8e8478;
  --st-green: #5a7c3f;
  --st-green-2: #7a9a55;
  /* Brandbook fonts: Space Grotesk + JetBrains Mono. No serif. */
  --st-serif: "Space Grotesk", "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  --st-sans: "Space Grotesk", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --st-mono: "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace;
}

.sertanejo-v2-wrap, .sertanejo-v2-wrap *, .sertanejo-v2-wrap *::before, .sertanejo-v2-wrap *::after { box-sizing: border-box; }
.sertanejo-v2-wrap {
  font-family: var(--st-sans);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  /* Brandbook: branco selo puro com glow bronze sutil — sem couro/pergaminho */
  background-color: #ffffff;
  background-image:
    radial-gradient(ellipse at 20% 5%, rgba(160,121,46,0.08), transparent 55%),
    radial-gradient(ellipse at 90% 95%, rgba(160,121,46,0.05), transparent 55%);
  color: var(--st-ink-soft);
  position: relative;
  isolation: isolate;
  overflow-x: hidden;
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
  border: 1px solid rgba(107,79,30,0.25);
  position: relative;
}

/* Brandbook: dark sections — ink puro, glow bronze sutil, sem textura de couro.
   A classe foi mantida com o nome legado para não quebrar markup existente. */
.sertanejo-v2-wrap .sert-dark-leather {
  background-color: #161616;
  background-image:
    radial-gradient(ellipse 80% 60% at 0% 0%, rgba(160,121,46,0.10), transparent 60%),
    radial-gradient(ellipse 80% 60% at 100% 100%, rgba(160,121,46,0.06), transparent 60%);
  position: relative;
  isolation: isolate;
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
  box-shadow: 0 0 0 1px var(--st-gold-deep) inset, 0 1px 0 rgba(255,255,255,0.4) inset, 0 6px 20px rgba(160,121,46,0.18);
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
.sertanejo-v2-wrap .btn-outline-dark:hover { background: rgba(160,121,46,0.10); }
.sertanejo-v2-wrap .btn-ghost-dark {
  background: transparent; color: var(--st-bone);
  border: 1px solid var(--st-rule-2);
}
.sertanejo-v2-wrap .btn-ghost-dark:hover { background: rgba(160,121,46,0.10); border-color: var(--st-gold); }

/* Tag pill */
.sertanejo-v2-wrap .tag-pill {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 18px;
  border: 1px solid rgba(107,79,30,0.30);
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
  position: absolute; background: transparent; border: 1px solid rgba(160,121,46,0.4);
  color: var(--st-bone); cursor: pointer;
  width: 48px; height: 48px;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; font-family: var(--st-serif);
}
.sertanejo-v2-wrap .lightbox-close { top: 24px; right: 24px; }
.sertanejo-v2-wrap .lightbox-prev { left: 24px; top: 50%; transform: translateY(-50%); }
.sertanejo-v2-wrap .lightbox-next { right: 24px; top: 50%; transform: translateY(-50%); }
.sertanejo-v2-wrap .lightbox-nav:hover, .sertanejo-v2-wrap .lightbox-close:hover { background: rgba(160,121,46,0.15); }

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
  background: transparent; border: 1px solid rgba(160,121,46,0.4);
  color: var(--st-bone); width: 44px; height: 44px;
  font-size: 22px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.sertanejo-v2-wrap .video-modal-close:hover { background: rgba(160,121,46,0.15); }
`;
