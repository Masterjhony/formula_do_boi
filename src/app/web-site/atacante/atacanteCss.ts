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
  --serif-atacante: "Bodoni Moda", "Playfair Display", "Didot", "Times New Roman", serif;
  --sans-atacante: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --mono-atacante: "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace;
}

.atacante-wrap, .atacante-wrap * { box-sizing: border-box; }
.atacante-wrap { background: var(--ink); color: var(--txt); font-family: var(--sans-atacante); -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; overflow-x: hidden; }
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

.atacante-wrap .serif { font-family: var(--serif-atacante); font-weight: 400; letter-spacing: -0.01em; }
.atacante-wrap .serif-tight { font-family: var(--serif-atacante); font-weight: 500; letter-spacing: -0.03em; line-height: 0.92; }
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

@media (max-width: 1024px) {
  .atacante-wrap .grid-2-col { grid-template-columns: 1fr !important; gap: 60px !important; }
  .atacante-wrap .grid-3-col { grid-template-columns: 1fr !important; }
  .atacante-wrap .grid-4-col { grid-template-columns: repeat(2, 1fr) !important; }
  .atacante-wrap .grid-5-col { grid-template-columns: repeat(2, 1fr) !important; }
  .atacante-wrap .ped-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
  .atacante-wrap .pad-side { padding-left: 32px !important; padding-right: 32px !important; }
  .atacante-wrap .pad-side-big { padding-left: 32px !important; padding-right: 32px !important; }
  .atacante-wrap .calc-grid { grid-template-columns: 1fr !important; }
  .atacante-wrap .nav-center { display: none !important; }
}

@media (max-width: 640px) {
  .atacante-wrap .grid-4-col { grid-template-columns: 1fr 1fr !important; }
  .atacante-wrap .grid-5-col { grid-template-columns: 1fr 1fr !important; }
  .atacante-wrap .pad-side { padding-left: 20px !important; padding-right: 20px !important; }
  .atacante-wrap .pad-side-big { padding-left: 20px !important; padding-right: 20px !important; }
  .atacante-wrap .nav-pre { display: none !important; }
}
`;
