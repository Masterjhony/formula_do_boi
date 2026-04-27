export const atacanteCss = `
:root {
  --ink: #0a0908;
  --leather: #14110f;
  --leather-2: #1c1816;
  --leather-3: #2a221d;
  --bone: #f4ede0;
  --bone-2: #e8d9b0;
  --gold: #c9a24a;
  --gold-2: #e3c279;
  --gold-deep: #8a6a26;
  --copper: #a07334;
  --rule: rgba(201, 162, 74, 0.22);
  --rule-2: rgba(201, 162, 74, 0.45);
  --txt: #d8cfbe;
  --txt-dim: #8e8478;
  /* Brandbook fonts: Space Grotesk + JetBrains Mono. No serif. */
  --serif-atacante: "Space Grotesk", "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  --sans-atacante: "Space Grotesk", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --mono-atacante: "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace;
}

.atacante-wrap, .atacante-wrap *, .atacante-wrap *::before, .atacante-wrap *::after { box-sizing: border-box; }
.atacante-wrap {
  background: var(--ink); color: var(--txt);
  font-family: var(--sans-atacante);
  -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility;
  overflow-x: hidden;
  width: 100%;
  max-width: 100vw;
}
.atacante-wrap a { text-decoration: none; color: inherit; }
.atacante-wrap ul { list-style: none; padding: 0; margin: 0; }
.atacante-wrap img { max-width: 100%; display: block; }

.atacante-wrap .leather-bg {
  background-color: var(--leather);
  background-image:
    radial-gradient(ellipse at 20% 10%, rgba(201,162,74,0.06), transparent 40%),
    radial-gradient(ellipse at 90% 90%, rgba(201,162,74,0.04), transparent 50%),
    url("/assets/atacante/leather-texture.png");
  background-size: auto, auto, 600px 600px;
  background-blend-mode: normal, normal, overlay;
  background-repeat: no-repeat, no-repeat, repeat;
}

/* "serif" classes now use Space Grotesk (per brandbook). The italic variants
   keep emphasis via font-style: italic with the same Space Grotesk family. */
.atacante-wrap .serif { font-family: var(--serif-atacante); font-weight: 500; letter-spacing: -0.01em; }
.atacante-wrap .serif-tight { font-family: var(--serif-atacante); font-weight: 600; letter-spacing: -0.025em; line-height: 0.95; }
.atacante-wrap .mono { font-family: var(--mono-atacante); }


.atacante-wrap .kicker {
  font-family: var(--mono-atacante);
  font-size: 11px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--gold);
  font-weight: 500;
}
.atacante-wrap .label {
  font-family: var(--mono-atacante);
  font-size: 10px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--txt-dim);
  font-weight: 500;
}

.atacante-wrap .btn {
  display: inline-flex; align-items: center; gap: 12px;
  padding: 16px 26px;
  font-family: var(--mono-atacante);
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  cursor: pointer;
  border: none;
  transition: all 0.25s ease;
  text-decoration: none;
}
.atacante-wrap .btn-gold {
  background: linear-gradient(180deg, var(--gold-2), var(--gold));
  color: var(--ink);
  font-weight: 600;
  box-shadow:
    0 0 0 1px var(--gold-deep) inset,
    0 1px 0 rgba(255,255,255,0.4) inset,
    0 8px 30px rgba(201,162,74,0.18);
}
.atacante-wrap .btn-gold:hover {
  background: linear-gradient(180deg, var(--gold), var(--gold-2));
  transform: translateY(-1px);
  box-shadow:
    0 0 0 1px var(--gold-deep) inset,
    0 1px 0 rgba(255,255,255,0.5) inset,
    0 12px 40px rgba(201,162,74,0.32);
}
.atacante-wrap .btn-ghost {
  background: transparent;
  color: var(--bone-2);
  border: 1px solid var(--rule-2);
}
.atacante-wrap .btn-ghost:hover {
  background: rgba(201,162,74,0.08);
  border-color: var(--gold);
  color: var(--gold-2);
}

.atacante-wrap input, .atacante-wrap textarea, .atacante-wrap select {
  font-family: var(--sans-atacante);
  background: rgba(0,0,0,0.4);
  color: var(--bone);
  border: 1px solid var(--rule);
  padding: 12px 14px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
}
.atacante-wrap input:focus, .atacante-wrap textarea:focus, .atacante-wrap select:focus {
  border-color: var(--gold);
}
.atacante-wrap input::placeholder { color: var(--txt-dim); }

.atacante-wrap .ticker-num {
  font-family: var(--serif-atacante);
  font-weight: 400;
  font-feature-settings: "tnum", "lnum";
  line-height: 1;
}

.atacante-wrap ::selection { background: var(--gold); color: var(--ink); }

.atacante-wrap .reveal { opacity: 1; }
.atacante-wrap .reveal.in { opacity: 1; }

@keyframes atacante-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
@keyframes atacante-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes atacante-slide-in { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

.atacante-wrap .img-warm { filter: contrast(1.05) saturate(0.92) brightness(0.96); }
.atacante-wrap .img-vignette { position: relative; }
.atacante-wrap .img-vignette::after {
  content: ""; position: absolute; inset: 0;
  background: radial-gradient(ellipse at center, transparent 50%, rgba(10,9,8,0.55) 100%);
  pointer-events: none;
}

.atacante-wrap .gold-foil {
  background: linear-gradient(135deg, #8a6a26 0%, #e3c279 30%, #fbe8a8 50%, #c9a24a 70%, #8a6a26 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
}

.atacante-wrap .no-scrollbar::-webkit-scrollbar { display: none; }
.atacante-wrap .no-scrollbar { scrollbar-width: none; }

/* ===== Brand bar (sticky) ===== */
.atacante-wrap .at-brand-bar {
  position: sticky; top: 0; z-index: 60;
  background: rgba(10,9,8,0.92);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border-bottom: 1px solid var(--rule);
}
.atacante-wrap .at-brand-bar-inner {
  max-width: 1480px; margin: 0 auto;
  padding: 14px clamp(16px, 4vw, 36px);
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px;
}
.atacante-wrap .at-brand-bar-stitch {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold) 30%, var(--gold) 70%, transparent);
  opacity: 0.35;
}
.atacante-wrap .at-brand-logo { height: 28px; width: auto; display: block; }
.atacante-wrap .at-brand-back {
  font-family: var(--mono-atacante);
  font-size: 10px; letter-spacing: 0.22em; color: var(--bone-2);
  text-transform: uppercase;
  display: flex; align-items: center; gap: 8px;
  padding: 8px 14px; border: 1px solid var(--rule);
  transition: all 0.2s;
}
.atacante-wrap .at-brand-back:hover { border-color: var(--gold); color: var(--gold-2); }
.atacante-wrap .at-brand-cta {
  padding: 10px 18px; font-size: 10px; letter-spacing: 0.22em;
}

/* ===== Responsive section padding ===== */
/* These rules cascade to override inline padding via !important */

@media (max-width: 1024px) {
  .atacante-wrap .grid-2-col { grid-template-columns: 1fr !important; gap: 60px !important; }
  .atacante-wrap .grid-3-col { grid-template-columns: 1fr !important; }
  .atacante-wrap .grid-4-col { grid-template-columns: repeat(2, 1fr) !important; }
  .atacante-wrap .grid-5-col { grid-template-columns: repeat(2, 1fr) !important; }
  .atacante-wrap .ped-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
  .atacante-wrap .calc-grid { grid-template-columns: 1fr !important; }
  .atacante-wrap .nav-center { display: none !important; }

  /* Section padding overrides (override inline 160px 80px / 120px 80px) */
  .atacante-wrap .pad-side-big {
    padding-left: clamp(20px, 5vw, 40px) !important;
    padding-right: clamp(20px, 5vw, 40px) !important;
    padding-top: clamp(60px, 10vw, 120px) !important;
    padding-bottom: clamp(60px, 10vw, 120px) !important;
  }
  /* Inner pads (e.g., calculator panels with padding: 40) */
  .atacante-wrap .at-inner-pad { padding: clamp(24px, 4vw, 36px) !important; }
}

@media (max-width: 768px) {
  /* Hide vertical rotated rails — they take up edge space and feel cramped */
  .atacante-wrap .at-vert-rail { display: none !important; }
  .atacante-wrap .at-vert-label { display: none !important; }

  /* Hero — switch from full-bleed bg+overlay to STACKED magazine layout:
     [bull image block]
     [title + text + buttons block] */
  .atacante-wrap .at-hero {
    height: auto !important;
    min-height: 0 !important;
    padding: 0 !important;
    overflow: visible !important;
    background: var(--ink) !important;
    display: flex !important;
    flex-direction: column !important;
  }

  /* Bull image becomes a flow block with explicit aspect ratio.
     cover + center 35% favors the bull body in a 4:3 frame. */
  .atacante-wrap .at-hero-bg {
    position: relative !important;
    inset: auto !important;
    width: 100% !important;
    aspect-ratio: 4 / 3 !important;
    background-size: cover !important;
    background-position: center 38% !important;
    transform: none !important;
    filter: contrast(1.05) saturate(0.9) brightness(0.95) !important;
    flex: 0 0 auto;
  }

  /* The dark vignette overlay becomes a soft fade only at the bottom of the image. */
  .atacante-wrap .at-hero-grad {
    position: absolute !important;
    top: auto !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    height: 60% !important;
    inset: auto 0 0 0 !important;
    background:
      linear-gradient(180deg,
        rgba(10,9,8,0) 0%,
        rgba(10,9,8,0.15) 50%,
        rgba(10,9,8,0.65) 100%) !important;
    pointer-events: none;
    z-index: 1;
  }

  /* Text content: now sits BELOW the image in normal flow */
  .atacante-wrap .at-hero-content {
    position: static !important;
    height: auto !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 36px 22px 56px !important;
    background: var(--ink) !important;
  }
  .atacante-wrap .at-hero-h1 {
    font-size: clamp(54px, 16vw, 88px) !important;
    line-height: 0.92 !important;
  }
  .atacante-wrap .at-hero-kicker {
    margin-bottom: 18px !important;
  }
  .atacante-wrap .at-hero-kicker > span:first-child {
    width: 36px !important;
  }
  .atacante-wrap .at-hero-foot {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 22px !important;
    margin-top: 22px !important;
  }
  .atacante-wrap .at-hero-foot p { font-size: 15px !important; max-width: none !important; }
  .atacante-wrap .at-hero-foot .btn { width: 100%; justify-content: center; }
  .atacante-wrap .at-hero-foot > div:last-child {
    width: 100%; flex-direction: column; gap: 10px !important;
  }
  /* Hide the "Rolar" scroll indicator on mobile (hero is no longer 100vh) */
  .atacante-wrap .at-hero-scroll { display: none !important; }

  /* Carcaça split → stack */
  .atacante-wrap .at-carcaca-grid {
    grid-template-columns: 1fr !important;
    min-height: 0 !important;
  }
  .atacante-wrap .at-carcaca-img { min-height: 280px !important; aspect-ratio: 4 / 3; }
  .atacante-wrap .at-carcaca-img-fade { background: linear-gradient(180deg, transparent 50%, var(--ink)) !important; }
  .atacante-wrap .at-carcaca-text {
    padding: clamp(48px, 10vw, 80px) clamp(20px, 5vw, 40px) !important;
  }

  /* Gallery: side thumbs → bottom thumbs */
  .atacante-wrap .at-gallery-grid { grid-template-columns: 1fr !important; }
  .atacante-wrap .at-gallery-thumbs {
    flex-direction: row !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    max-height: none !important;
  }
  .atacante-wrap .at-gallery-thumbs button { flex: 0 0 96px; }

  /* DEPs row internal grid: tighter */
  .atacante-wrap .at-deps-row {
    grid-template-columns: 92px 1fr 64px !important;
    gap: 10px !important;
  }
  .atacante-wrap .at-deps-row .at-deps-tier { display: none !important; }

  /* NumbersHero: hide source aside on small */
  .atacante-wrap .at-numbers-source { display: none !important; }

  /* SemenPricing: full-width tiers */
  .atacante-wrap .grid-4-col { grid-template-columns: 1fr 1fr !important; }
  .atacante-wrap .grid-5-col { grid-template-columns: 1fr 1fr !important; }

  /* Calculator panels: drop side border, stack pads */
  .atacante-wrap .at-calc-right { border-left: none !important; border-top: 1px solid var(--rule-2) !important; }

  /* Closing CTA stat row */
  .atacante-wrap .at-closing-stats {
    flex-direction: column !important;
    gap: 36px !important;
    margin-top: 56px !important;
  }
}

@media (max-width: 640px) {
  .atacante-wrap .grid-4-col { grid-template-columns: 1fr !important; }
  .atacante-wrap .grid-5-col { grid-template-columns: 1fr !important; }

  /* Hero: tighter scroll indicator + ensure h1 fits */
  .atacante-wrap .at-hero-kicker {
    font-size: 10px !important;
    letter-spacing: 0.24em !important;
  }
  .atacante-wrap .at-hero-kicker span { width: 32px !important; }

  /* Brand bar tighter */
  .atacante-wrap .at-brand-back-label { display: none !important; }
  .atacante-wrap .at-brand-cta { padding: 8px 12px !important; font-size: 9px !important; }
  .atacante-wrap .at-brand-logo { height: 22px !important; }

  /* Identity inner ticker */
  .atacante-wrap .at-id-ticker { font-size: 64px !important; }

  /* NumbersHero: stack stats vertically */
  .atacante-wrap .grid-5-col {
    grid-template-columns: 1fr !important;
  }
  .atacante-wrap .grid-5-col > div { min-height: 180px !important; padding: 28px 20px !important; }

  /* Pedigree nodes: smaller */
  .atacante-wrap .at-ped-node { padding: 14px 16px !important; min-height: 0 !important; }

  /* Section padding super compact */
  .atacante-wrap .pad-side-big {
    padding-left: 18px !important;
    padding-right: 18px !important;
    padding-top: 56px !important;
    padding-bottom: 56px !important;
  }

  /* Drawer: full-width on mobile */
  .atacante-wrap .at-drawer { width: 100vw !important; }
  .atacante-wrap .at-drawer-pad { padding: 24px !important; }
  .atacante-wrap .at-drawer-header { padding: 22px 24px !important; }
}
`;
