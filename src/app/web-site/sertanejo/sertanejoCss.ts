export const sertanejoCss = `
        /* ========== RESET & BASE ========== */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }
        body {
            font-family: 'Montserrat', sans-serif;
            font-weight: 400;
            font-size: 16px;
            line-height: 1.6;
            color: #141413;
            background: #FFFFFF;
            -webkit-font-smoothing: antialiased;
        }
        img { max-width: 100%; height: auto; display: block; }
        a { text-decoration: none; color: inherit; }
        ul { list-style: none; }

        /* ========== VARIABLES ========== */
        :root {
            --gold: #C5A059;
            --gold-dark: #A8853A;
            --gold-gradient: linear-gradient(135deg, #C5A059, #A8853A);
            --bg-primary: #FFFFFF;
            --bg-secondary: #FAF9F5;
            --bg-tertiary: #FAFAFA;
            --text-dark: #141413;
            --text-secondary: #6B6B6B;
            --border-light: rgba(197, 160, 89, 0.15);
            --shadow-card: 0 4px 20px rgba(0,0,0,0.08);
            --radius-card: 16px;
            --radius-btn: 8px;
            --max-width: 1200px;
        }

        /* ========== UTILITIES ========== */
        .container { max-width: var(--max-width); margin: 0 auto; padding: 0 24px; }
        .gold { color: var(--gold); }
        .section-padding { padding: 80px 0; }

        /* ========== HEADER ========== */
        .header {
            position: fixed; top: 44px; left: 0; right: 0; z-index: 1000;
            background: rgba(255,255,255,0.97);
            -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
            transition: box-shadow 0.3s;
        }
        .header.scrolled { box-shadow: 0 2px 20px rgba(0,0,0,0.08); }
        .header-inner {
            max-width: var(--max-width); margin: 0 auto; padding: 0 24px;
            display: flex; align-items: center; justify-content: space-between;
            height: 72px;
        }
        .header-logo { display: flex; align-items: center; gap: 12px; }
        .header-logo img { height: 44px; width: auto; }
        .header-back {
            font-weight: 600; font-size: 14px; color: var(--text-secondary);
            display: flex; align-items: center; gap: 6px; transition: color 0.2s;
        }
        .header-back:hover { color: var(--gold); }

        /* ========== BADGE ========== */
        .badge {
            display: inline-flex; align-items: center; gap: 6px;
            background: rgba(197,160,89,0.1); color: var(--gold);
            font-weight: 700; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;
            padding: 8px 18px; border-radius: 999px;
        }
        .badge::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: var(--gold); }

        /* ========== BUTTONS ========== */
        .btn-primary {
            display: inline-flex; align-items: center; justify-content: center; gap: 8px;
            background: var(--gold-gradient); color: #fff;
            font-family: 'Montserrat', sans-serif;
            font-weight: 700; font-size: 14px; letter-spacing: 0.08em; text-transform: uppercase;
            padding: 16px 32px; border-radius: var(--radius-btn); border: none; cursor: pointer;
            transition: transform 0.2s, filter 0.2s;
        }
        .btn-primary:hover { transform: translateY(-2px); filter: brightness(0.92); }
        .btn-secondary {
            display: inline-flex; align-items: center; justify-content: center; gap: 8px;
            background: transparent; color: var(--gold);
            font-family: 'Montserrat', sans-serif;
            font-weight: 700; font-size: 14px; letter-spacing: 0.08em; text-transform: uppercase;
            padding: 16px 32px; border-radius: var(--radius-btn);
            border: 2px solid var(--gold); cursor: pointer;
            transition: transform 0.2s, background 0.2s, color 0.2s;
        }
        .btn-secondary:hover { background: var(--gold); color: #fff; transform: translateY(-2px); }

        /* ========== GREEN CTA BUTTON ========== */
        .btn-checkout {
            display: inline-flex; align-items: center; justify-content: center; gap: 8px;
            background: linear-gradient(135deg, #2E7D32, #1B5E20); color: #fff;
            font-family: 'Montserrat', sans-serif;
            font-weight: 700; font-size: 14px; letter-spacing: 0.08em; text-transform: uppercase;
            padding: 16px 36px; border-radius: var(--radius-btn); border: none; cursor: pointer;
            transition: transform 0.2s, filter 0.2s; box-shadow: 0 4px 16px rgba(46,125,50,0.3);
        }
        .btn-checkout:hover { transform: translateY(-2px); filter: brightness(1.1); }

        /* ========== GENEALOGY (Landing Page) ========== */
        .genealogy-landing {
            display: flex; align-items: center; justify-content: center; gap: 0;
            overflow-x: auto; padding: 20px 0;
        }
        .gen-col { display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .gen-node {
            background: var(--bg-secondary); border: 1px solid var(--border-light);
            border-radius: 12px; padding: 16px 20px; min-width: 200px; text-align: center;
            transition: transform 0.2s;
        }
        .gen-node:hover { transform: translateY(-2px); }
        .gen-node.main { border: 2px solid var(--gold); background: rgba(197,160,89,0.08); }
        .gen-name { font-weight: 700; font-size: 14px; color: var(--text-dark); margin-bottom: 4px; }
        .gen-reg { font-size: 12px; color: var(--text-secondary); }
        .gen-mgte { font-size: 11px; color: var(--gold); font-weight: 600; margin-top: 4px; }
        .gen-connector { display: flex; align-items: center; }
        /* Mobile genealogy tree */
        .gen-tree-mobile { display: none; }
        .gen-tree-mobile .gen-level { margin-bottom: 0; }
        .gen-tree-mobile .gen-level-label {
            font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
            color: var(--gold); margin-bottom: 8px; padding-left: 4px;
        }
        .gen-tree-mobile .gen-level-nodes { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
        .gen-tree-mobile .gen-node { min-width: unset; padding: 14px 16px; }
        .gen-tree-mobile .gen-level-line {
            width: 2px; height: 20px; background: linear-gradient(to bottom, var(--gold), rgba(197,160,89,0.2));
            margin: 0 auto 0 32px;
        }
        .gen-tree-mobile .gen-pair {
            display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
        }
        .gen-tree-mobile .gen-pair .gen-node { min-width: unset; }

        /* ========== HERO ========== */
        .hero {
            padding-top: 164px; padding-bottom: 80px;
            background: var(--bg-secondary);
        }
        .hero-inner {
            display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
        }
        .hero-content { display: flex; flex-direction: column; gap: 24px; }
        .hero h1 {
            font-weight: 900; font-size: 48px; line-height: 1.1;
            text-transform: uppercase; letter-spacing: -0.01em;
        }
        .hero-subtitle {
            font-size: 18px; color: var(--text-secondary); line-height: 1.6; max-width: 480px;
        }
        .hero-ctas { display: flex; gap: 16px; flex-wrap: wrap; }
        .hero-image {
            position: relative; border-radius: var(--radius-card); overflow: hidden;
            background: var(--bg-tertiary); aspect-ratio: 4/3;
            display: flex; align-items: center; justify-content: center;
            box-shadow: var(--shadow-card); border: 1px solid var(--border-light);
        }
        .hero-image .placeholder-img {
            width: 100%; height: 100%; object-fit: cover;
        }
        .hero-image .placeholder-text {
            color: var(--text-secondary); font-weight: 600; font-size: 14px; text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        /* ========== MEDIA SECTION ========== */
        .media-section { background: var(--bg-primary); }
        .section-header { text-align: center; margin-bottom: 48px; }
        .section-header h2 {
            font-weight: 900; font-size: 36px; text-transform: uppercase; margin-bottom: 12px;
        }
        .section-header p { font-size: 16px; color: var(--text-secondary); max-width: 600px; margin: 0 auto; }

        .gallery-grid {
            display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px;
        }
        .gallery-item {
            border-radius: var(--radius-card); overflow: hidden; cursor: pointer;
            aspect-ratio: 4/3; background: var(--bg-tertiary);
            display: flex; align-items: center; justify-content: center;
            border: 1px solid var(--border-light); transition: transform 0.2s, box-shadow 0.2s;
            position: relative;
        }
        .gallery-item:hover { transform: translateY(-4px); box-shadow: var(--shadow-card); }
        .gallery-item img { width: 100%; height: 100%; object-fit: cover; }
        .gallery-item .placeholder-label {
            color: var(--text-secondary); font-weight: 600; font-size: 13px;
            text-transform: uppercase; letter-spacing: 0.05em;
        }

        /* ========== VIDEO CAROUSEL ========== */
        .video-categories { display: flex; justify-content: center; gap: 12px; margin-bottom: 32px; flex-wrap: wrap; }
        .video-cat-btn {
            font-family: 'Montserrat', sans-serif;
            font-weight: 700; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase;
            padding: 10px 24px; border-radius: 999px; border: 2px solid var(--border-light);
            background: transparent; color: var(--text-secondary); cursor: pointer;
            transition: all 0.25s;
        }
        .video-cat-btn.active,
        .video-cat-btn:hover {
            background: var(--gold); color: #fff; border-color: var(--gold);
        }
        .video-carousel-outer { position: relative; }
        .video-carousel {
            display: flex; gap: 16px; overflow-x: auto; -webkit-scroll-snap-type: mandatory; scroll-snap-type: x mandatory;
            scroll-behavior: smooth; -webkit-overflow-scrolling: touch;
            padding: 8px 4px 16px; scrollbar-width: none;
        }
        .video-carousel::-webkit-scrollbar { display: none; }
        .video-card {
            flex: 0 0 340px; -webkit-scroll-snap-align: start; scroll-snap-align: start;
            border-radius: var(--radius-card); overflow: hidden;
            background: #000; border: 1px solid var(--border-light);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .video-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-card); }
        .video-thumb {
            position: relative; aspect-ratio: 16/9; cursor: pointer; overflow: hidden;
            background: #111;
        }
        .video-thumb video {
            width: 100%; height: 100%; object-fit: cover;
            pointer-events: none;
        }
        .video-thumb .play-btn {
            position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
            width: 56px; height: 56px; border-radius: 50%;
            background: rgba(197,160,89,0.9); color: #fff;
            display: flex; align-items: center; justify-content: center;
            font-size: 28px; transition: transform 0.2s, background 0.2s;
            box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        }
        .video-thumb:hover .play-btn { transform: translate(-50%,-50%) scale(1.1); background: var(--gold); }
        .video-thumb .play-btn.hidden { display: none; }
        .video-card-label {
            padding: 12px 16px; background: #141413; color: rgba(255,255,255,0.7);
            font-size: 13px; font-weight: 600;
            display: flex; align-items: center; gap: 8px;
        }
        .video-card-label .cat-dot {
            width: 8px; height: 8px; border-radius: 50%; background: var(--gold);
        }
        /* Carousel arrows */
        .carousel-arrow {
            position: absolute; top: 50%; transform: translateY(-60%);
            width: 44px; height: 44px; border-radius: 50%;
            background: rgba(255,255,255,0.95); border: 1px solid var(--border-light);
            box-shadow: 0 2px 12px rgba(0,0,0,0.1);
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; z-index: 10; color: var(--text-dark);
            transition: background 0.2s, color 0.2s;
        }
        .carousel-arrow:hover { background: var(--gold); color: #fff; }
        .carousel-arrow.left { left: -16px; }
        .carousel-arrow.right { right: -16px; }
        .carousel-arrow.disabled { opacity: 0.3; pointer-events: none; }

        /* Video modal */
        .video-modal {
            display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.92); z-index: 2000;
            align-items: center; justify-content: center; padding: 24px;
        }
        .video-modal.active { display: flex; }
        .video-modal-inner {
            width: 100%; max-width: 900px; aspect-ratio: 16/9;
            border-radius: 12px; overflow: hidden; position: relative;
        }
        .video-modal-inner video { width: 100%; height: 100%; object-fit: contain; background: #000; }
        .video-modal-close {
            position: absolute; top: 16px; right: 16px;
            width: 40px; height: 40px; border-radius: 50%; background: rgba(0,0,0,0.6);
            color: #fff; border: none; cursor: pointer; font-size: 22px;
            display: flex; align-items: center; justify-content: center;
            z-index: 10;
        }
        .video-modal-close:hover { background: var(--gold); }

        /* ========== DIFERENCIAIS ========== */
        .diferenciais { background: var(--bg-secondary); }
        .diff-grid {
            display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;
        }
        .diff-card {
            background: var(--bg-primary); border-radius: var(--radius-card);
            padding: 36px 28px; text-align: center;
            border: 1px solid var(--border-light); box-shadow: var(--shadow-card);
            transition: transform 0.2s;
        }
        .diff-card:hover { transform: translateY(-4px); }
        .diff-icon {
            width: 60px; height: 60px; border-radius: 50%;
            background: rgba(197,160,89,0.1); color: var(--gold);
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 20px; font-size: 28px;
        }
        .diff-card h3 { font-weight: 700; font-size: 16px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.02em; }
        .diff-card p { font-size: 14px; color: var(--text-secondary); line-height: 1.5; }

        /* ========== PREÇOS ========== */
        .precos { background: var(--bg-primary); }
        .pricing-grid {
            display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;
        }
        .pricing-card {
            background: var(--bg-primary); border-radius: var(--radius-card);
            padding: 32px 24px; text-align: center; position: relative;
            border: 1px solid var(--border-light); box-shadow: var(--shadow-card);
            display: flex; flex-direction: column; gap: 16px;
            transition: transform 0.2s;
        }
        .pricing-card:hover { transform: translateY(-4px); }
        .pricing-card.featured {
            border: 2px solid var(--gold);
            box-shadow: 0 8px 30px rgba(197,160,89,0.2);
        }
        .pricing-badge {
            position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
            background: var(--gold-gradient); color: #fff;
            font-weight: 700; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
            padding: 6px 18px; border-radius: 999px; white-space: nowrap;
        }
        .pricing-qty {
            font-weight: 900; font-size: 14px; text-transform: uppercase;
            letter-spacing: 0.1em; color: var(--text-secondary);
        }
        .pricing-price {
            font-weight: 900; font-size: 36px; color: var(--text-dark);
        }
        .pricing-price small { font-size: 14px; font-weight: 600; color: var(--text-secondary); }
        .pricing-detail { font-size: 13px; color: var(--text-secondary); }
        .pricing-card .btn-primary { width: 100%; font-size: 12px; padding: 14px 20px; }
        .pricing-note {
            text-align: center; margin-top: 32px; font-size: 14px; color: var(--text-secondary);
        }

        /* ========== FICHA PREVIEW ========== */
        .ficha-preview { background: var(--bg-secondary); }
        .ficha-grid {
            display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px;
        }
        .ficha-item {
            background: var(--bg-primary); border-radius: var(--radius-card);
            padding: 28px 24px; border: 1px solid var(--border-light);
            box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }
        .ficha-item-label {
            font-weight: 700; font-size: 12px; letter-spacing: 0.1em;
            text-transform: uppercase; color: var(--gold); margin-bottom: 8px;
        }
        .ficha-item-value { font-weight: 700; font-size: 22px; color: var(--text-dark); }
        .ficha-item-sub { font-size: 13px; color: var(--text-secondary); margin-top: 4px; }
        .ficha-cta { text-align: center; }

        /* ========== SOCIAL PROOF ========== */
        .social-proof { background: var(--bg-primary); }
        .proof-inner {
            text-align: center; max-width: 700px; margin: 0 auto;
        }
        .proof-quote {
            font-size: 22px; font-weight: 600; line-height: 1.5;
            color: var(--text-dark); margin-bottom: 24px; font-style: italic;
        }
        .proof-author { font-size: 14px; color: var(--text-secondary); font-weight: 600; margin-bottom: 32px; }
        .proof-badges { display: flex; justify-content: center; gap: 24px; flex-wrap: wrap; }
        .proof-badge {
            display: flex; align-items: center; gap: 8px;
            background: rgba(197,160,89,0.08); padding: 12px 24px; border-radius: 999px;
            font-weight: 700; font-size: 13px; color: var(--gold);
            letter-spacing: 0.05em; text-transform: uppercase;
        }

        /* ========== CTA FINAL ========== */
        .cta-final {
            background: linear-gradient(135deg, #1a1a19 0%, #2d2d2a 100%);
            padding: 80px 0; text-align: center; color: #fff;
        }
        .cta-final h2 {
            font-weight: 900; font-size: 36px; text-transform: uppercase; margin-bottom: 16px;
        }
        .cta-final p {
            font-size: 16px; color: rgba(255,255,255,0.7); margin-bottom: 36px; max-width: 500px; margin-left: auto; margin-right: auto;
        }
        .cta-final .cta-buttons { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; }
        .cta-final .btn-secondary { border-color: rgba(255,255,255,0.3); color: #fff; }
        .cta-final .btn-secondary:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.5); }

        /* ========== FOOTER ========== */
        .footer {
            background: #141413; color: rgba(255,255,255,0.5); padding: 40px 0;
            font-size: 13px;
        }
        .footer-inner {
            display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;
        }
        .footer-logo { display: flex; align-items: center; gap: 10px; }
        .footer-logo img { height: 28px; filter: brightness(0) invert(1); opacity: 0.5; }
        .footer-links { display: flex; gap: 24px; }
        .footer-links a { color: rgba(255,255,255,0.5); transition: color 0.2s; }
        .footer-links a:hover { color: var(--gold); }

        /* ========== TOP & BOTTOM BARS ========== */
        .top-bar {
            background: #000; padding: 10px 0; text-align: center;
            position: fixed; top: 0; left: 0; right: 0; z-index: 1100;
        }
        .top-bar-inner {
            display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .top-bar-inner span {
            color: #C5A059; font-family: var(--font); font-weight: 700;
            font-size: 13px; letter-spacing: 3px; text-transform: uppercase;
        }
        .bottom-bar {
            background: #000; padding: 14px 0; text-align: center;
        }
        .bottom-bar-inner {
            display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .bottom-bar-inner span {
            color: rgba(197,160,89,0.6); font-family: var(--font); font-weight: 500;
            font-size: 12px; letter-spacing: 2px;
        }

        /* ========== LIGHTBOX ========== */
        .lightbox {
            display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.92); z-index: 2000;
            align-items: center; justify-content: center; padding: 40px;
        }
        .lightbox.active { display: flex; }
        .lightbox img {
            max-width: 90vw; max-height: 85vh; border-radius: 8px;
            object-fit: contain;
        }
        .lightbox-close {
            position: absolute; top: 24px; right: 32px;
            color: #fff; font-size: 36px; cursor: pointer; background: none; border: none;
            font-family: 'Montserrat', sans-serif; font-weight: 300;
            width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;
        }
        .lightbox-close:hover { color: var(--gold); }
        .lightbox-nav {
            position: absolute; top: 50%; transform: translateY(-50%);
            color: #fff; font-size: 48px; cursor: pointer; background: none; border: none;
            padding: 16px; transition: color 0.2s;
        }
        .lightbox-nav:hover { color: var(--gold); }
        .lightbox-prev { left: 16px; }
        .lightbox-next { right: 16px; }

        /* ========== RESPONSIVE ========== */
        @media (max-width: 1024px) {
            .hero h1 { font-size: 36px; }
            .diff-grid { grid-template-columns: repeat(2, 1fr); }
            .pricing-grid { grid-template-columns: repeat(2, 1fr); }
            .ficha-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
            .hero-inner { grid-template-columns: 1fr; gap: 40px; }
            .hero h1 { font-size: 30px; }
            .hero { padding-top: 140px; padding-bottom: 60px; }
            .section-padding { padding: 60px 0; }
            .section-header h2 { font-size: 28px; }
            .gallery-grid { grid-template-columns: repeat(2, 1fr); }
            .diff-grid { grid-template-columns: 1fr; }
            .pricing-grid { grid-template-columns: 1fr; }
            .ficha-grid { grid-template-columns: 1fr; }
            .video-card { flex: 0 0 280px; }
            .carousel-arrow { display: none; }
            .hero-ctas { flex-direction: column; }
            .btn-primary, .btn-secondary, .btn-checkout { width: 100%; text-align: center; }
            .header-inner { height: 60px; }
            .header-logo img { height: 34px; }
            .top-bar-inner span:last-child { display: none; }
            .genealogy-landing { display: none; }
            .gen-tree-mobile { display: block; }
        }
        @media (max-width: 480px) {
            .gallery-grid { grid-template-columns: 1fr; }
            .hero h1 { font-size: 26px; }
        }
    `;
