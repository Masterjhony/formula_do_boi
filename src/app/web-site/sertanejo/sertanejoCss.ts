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
            font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
            color: var(--gold); margin-bottom: 12px; text-align: center;
        }
        .gen-tree-mobile .gen-level-nodes { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
        .gen-tree-mobile .gen-node { min-width: unset; padding: 14px 16px; }
        .gen-tree-mobile .gen-level-line {
            width: 2px; height: 24px; background: linear-gradient(to bottom, var(--gold), rgba(197,160,89,0.2));
            margin: 4px auto 12px auto;
        }
        .gen-tree-mobile .gen-pair {
            display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
        }
        .gen-tree-mobile .gen-pair .gen-node { min-width: unset; padding: 12px 8px; }

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

/* ========== FICHA HERO ========== */
        .ficha-hero { padding-top: 144px; padding-bottom: 48px; background: var(--bg-primary); border-bottom: 1px solid var(--border-light); }
        .ficha-hero-inner { display: grid; grid-template-columns: 280px 1fr; gap: 40px; align-items: center; }
        .ficha-hero-photo { aspect-ratio: 3/4; background: var(--bg-secondary); border-radius: var(--radius-card); border: 1px solid var(--border-light); overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .ficha-hero-photo img { width: 100%; height: 100%; object-fit: cover; }
        .ficha-hero-info h2 { font-weight: 900; font-size: 36px; text-transform: uppercase; margin-bottom: 8px; }
        .ficha-meta { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-top: 24px; }
        .ficha-meta-label { font-weight: 700; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--gold); margin-bottom: 4px; }
        .ficha-meta-value { font-weight: 700; font-size: 16px; }
        .ficha-meta-sub { font-size: 13px; color: var(--text-secondary); }

        /* ========== CARDS E TABELAS ========== */
        .card { background: var(--bg-primary); border-radius: var(--radius-card); box-shadow: var(--shadow-card); border: 1px solid var(--border-light); padding: 32px; margin-bottom: 32px; }
        .card h3 { font-weight: 900; font-size: 24px; text-transform: uppercase; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; }
        .card h3 .material-icons-outlined { color: var(--gold); font-size: 28px; }
        
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th { text-align: left; font-weight: 700; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--gold); padding: 12px 16px; border-bottom: 2px solid var(--border-light); background: rgba(197,160,89,0.04); }
        .data-table td { padding: 12px 16px; border-bottom: 1px solid rgba(0,0,0,0.05); font-size: 14px; }
        .data-table tr:last-child td { border-bottom: none; }
        .data-table .value { font-weight: 700; }
        .data-table .top-label { display: inline-block; background: rgba(197,160,89,0.1); color: var(--gold); font-weight: 700; font-size: 11px; padding: 3px 10px; border-radius: 999px; }
        .data-table .deca-label { display: inline-block; background: rgba(34,139,34,0.1); color: #228B22; font-weight: 700; font-size: 11px; padding: 3px 10px; border-radius: 999px; }

        /* ========== DEP BAR ========== */
        .dep-bars { display: flex; flex-direction: column; gap: 16px; }
        .dep-bar-item { display: grid; grid-template-columns: 160px 1fr 80px; gap: 12px; align-items: center; }
        .dep-bar-label { font-weight: 600; font-size: 13px; text-align: right; }
        .dep-bar-track { height: 28px; background: #f0f0ed; border-radius: 6px; position: relative; overflow: hidden; }
        .dep-bar-fill { position: absolute; top: 0; height: 100%; border-radius: 6px; display: flex; align-items: center; justify-content: flex-end; padding-right: 8px; font-weight: 700; font-size: 11px; color: #fff; min-width: 40px; transition: width 0.8s ease; }
        .dep-bar-fill.positive { background: linear-gradient(90deg, #4CAF50, #388E3C); left: 50%; }
        .dep-bar-fill.negative { background: linear-gradient(90deg, #e53935, #c62828); right: 50%; }
        .dep-bar-center { position: absolute; top: 0; bottom: 0; left: 50%; width: 2px; background: rgba(0,0,0,0.15); z-index: 1; }
        .dep-bar-rank { font-weight: 700; font-size: 12px; color: var(--gold); }

        /* ========== CHARTS ========== */
        .chart-container { position: relative; max-width: 500px; margin: 0 auto; }
        .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start; }

        /* ========== VIDEO DESTAQUE ========== */
        .video-destaque { background: #141413; padding: 64px 0; margin-top: 0; }
        .video-destaque-inner { display: grid; grid-template-columns: 280px 1fr; gap: 48px; align-items: center; max-width: 1100px; margin: 0 auto; padding: 0 24px; }
        .video-destaque-player { border-radius: 12px; overflow: hidden; aspect-ratio: 9/16; max-height: 520px; margin: 0 auto; box-shadow: 0 8px 40px rgba(0,0,0,0.4); position: relative; cursor: pointer; }
        .video-destaque-player video { width: 100%; height: 100%; object-fit: cover; display: block; }
        .video-destaque-play { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 64px; height: 64px; border-radius: 50%; background: rgba(197,160,89,0.9); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.2s, background 0.2s; }
        .video-destaque-play:hover { transform: translate(-50%, -50%) scale(1.1); background: var(--gold); }
        .video-destaque-play .material-icons-outlined { font-size: 32px; color: #fff; margin-left: 3px; }
        .video-destaque-play.hidden { display: none; }
        .video-destaque-text h2 { font-size: 28px; font-weight: 900; color: #fff; margin-bottom: 20px; line-height: 1.3; }
        .video-destaque-text p { color: rgba(255,255,255,0.75); font-size: 15px; line-height: 1.7; margin-bottom: 16px; }
        .video-destaque-text ul { list-style: none; padding: 0; margin: 0 0 20px; }
        .video-destaque-text ul li { color: rgba(255,255,255,0.85); font-size: 14px; line-height: 1.7; padding: 6px 0; padding-left: 24px; position: relative; }
        .video-destaque-text ul li::before { content: ''; position: absolute; left: 0; top: 14px; width: 8px; height: 8px; border-radius: 50%; background: var(--gold); }
        .video-destaque-badge { display: inline-block; background: var(--gold); color: #fff; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; padding: 6px 16px; border-radius: 20px; margin-bottom: 16px; }

        /* ========== CENTRAL INFO ========== */
        .central-info { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
        .central-label { font-weight: 700; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--gold); margin-bottom: 4px; }
        .central-value { font-weight: 600; font-size: 15px; }

        /* Table wrapper for horizontal scroll */
        .table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; margin: 0 -16px; padding: 0 16px; }
        .table-scroll .data-table { min-width: 540px; }

        /* ========== FORM SECTION ========== */
        .form-section { background: linear-gradient(135deg, #1a1a19 0%, #2d2d2a 100%); padding: 80px 0; }
        .form-section .section-header h2 { color: #fff; }
        .form-section .section-header p { color: rgba(255,255,255,0.6); margin-bottom: 32px; }
        .form-container { max-width: 700px; margin: 0 auto; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-card); padding: 48px 40px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 32px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group.full-width { grid-column: 1 / -1; }
        .form-group label { font-weight: 600; font-size: 13px; color: rgba(255,255,255,0.7); letter-spacing: 0.04em; text-transform: uppercase; }
        .form-group input, .form-group select { font-family: 'Montserrat', sans-serif; font-size: 15px; font-weight: 500; padding: 14px 16px; border-radius: var(--radius-btn); border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.06); color: #fff; transition: border-color 0.3s, box-shadow 0.3s; outline: none; width: 100%; }
        .form-group input::placeholder { color: rgba(255,255,255,0.3); }
        .form-group input:focus, .form-group select:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(197,160,89,0.15); }
        .form-group select option { background: #141413; color: #fff; }
        .form-note { text-align: center; margin-top: 20px; font-size: 13px; color: rgba(255,255,255,0.5); display: flex; align-items: center; justify-content: center; gap: 6px; }
        .form-note .material-icons-outlined { font-size: 16px; color: var(--gold); }

        /* ========== HERO TITLE ========== */
        .hero-title-name {
            font-weight: 900; font-size: 52px; line-height: 1.1;
            text-transform: uppercase; letter-spacing: -0.01em;
        }
        .hero-tagline {
            font-size: 20px; font-weight: 600; color: var(--text-dark);
            text-transform: uppercase; letter-spacing: 0.02em; line-height: 1.3;
        }

        /* ========== PHOTO CAROUSEL ========== */
        .photo-carousel-outer {
            position: relative; margin-bottom: 16px;
        }
        .photo-carousel-viewport {
            overflow: hidden; border-radius: var(--radius-card);
            box-shadow: var(--shadow-card); border: 1px solid var(--border-light);
            aspect-ratio: 16/10;
        }
        .photo-carousel-track {
            display: flex; transition: transform 0.55s cubic-bezier(0.4,0,0.2,1);
            height: 100%;
        }
        .photo-carousel-slide {
            flex: 0 0 100%; height: 100%; cursor: zoom-in;
            position: relative; overflow: hidden;
        }
        .photo-carousel-slide img {
            width: 100%; height: 100%; object-fit: cover; display: block;
        }
        .photo-carousel-dots {
            display: flex; justify-content: center; gap: 8px;
            margin-top: 16px;
        }
        .photo-dot {
            width: 8px; height: 8px; border-radius: 50%;
            background: rgba(197,160,89,0.25); border: none; cursor: pointer;
            padding: 0; transition: background 0.3s, transform 0.3s;
        }
        .photo-dot.active {
            background: var(--gold); transform: scale(1.4);
        }
        .photo-dot:hover { background: var(--gold-dark); }
        .photo-carousel-outer .carousel-arrow {
            top: 45%; transform: translateY(-50%);
        }

        /* ========== VIDEO FILTER COUNT BADGE ========== */
        .video-cat-count {
            display: inline-flex; align-items: center; justify-content: center;
            background: rgba(197,160,89,0.18); color: var(--gold);
            font-size: 11px; font-weight: 700;
            min-width: 20px; height: 20px; padding: 0 6px; border-radius: 999px;
            margin-left: 6px; line-height: 1;
            transition: background 0.25s, color 0.25s;
        }
        .video-cat-btn.active .video-cat-count,
        .video-cat-btn:hover .video-cat-count {
            background: rgba(255,255,255,0.25); color: #fff;
        }

        /* ========== DIFERENCIAIS CTAs ========== */
        .diferenciais-ctas {
            display: flex; gap: 16px; flex-wrap: wrap;
            justify-content: center; margin-top: 48px;
        }

        /* ========== VIDEO SECTIONS ========== */
        .video-section-block { margin-bottom: 48px; }
        .video-section-block:last-of-type { margin-bottom: 0; }
        .video-section-title {
            font-weight: 800; font-size: 18px; text-transform: uppercase;
            letter-spacing: 0.05em; margin-bottom: 20px;
            display: flex; align-items: center; color: var(--text-dark);
        }

        /* ========== RESPONSIVE ========== */
        @media (max-width: 1024px) {
            .hero-title-name { font-size: 40px; }
            .diff-grid { grid-template-columns: repeat(2, 1fr); }
            .pricing-grid { grid-template-columns: repeat(2, 1fr); }
            .ficha-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
            .hero-inner { grid-template-columns: 1fr; gap: 40px; }
            .hero-title-name { font-size: 32px; }
            .hero-tagline { font-size: 16px; }
            .hero { padding-top: 140px; padding-bottom: 60px; }
            .section-padding { padding: 60px 0; }
            .section-header h2 { font-size: 28px; }
            .gallery-grid { grid-template-columns: repeat(2, 1fr); }
            .diff-grid { grid-template-columns: 1fr; }
            .pricing-grid { grid-template-columns: 1fr; }
            .ficha-grid { grid-template-columns: 1fr; }
            .video-card { flex: 0 0 280px; }
            .video-carousel-outer .carousel-arrow { display: none; }
            .hero-ctas { flex-direction: column; }
            .diferenciais-ctas { flex-direction: column; align-items: center; }
            .btn-primary, .btn-secondary, .btn-checkout { width: 100%; text-align: center; }
            .header-inner { height: 60px; }
            .header-logo img { height: 34px; }
            .top-bar-inner span:last-child { display: none; }
            .genealogy-landing { display: none; }
            .gen-tree-mobile { display: block; }
            .photo-carousel-viewport { aspect-ratio: 4/3; }

            .ficha-hero-inner { grid-template-columns: 1fr; }
            .ficha-hero-photo { max-width: 280px; margin: 0 auto; }
            .ficha-hero-info h2 { font-size: 26px; text-align: center; }
            .ficha-hero-info { text-align: center; }
            .dep-bar-item { grid-template-columns: 100px 1fr 60px; }
            .dep-bar-label { font-size: 11px; }
            .genealogy { display: none; }
            .charts-row { grid-template-columns: 1fr; }
            .card { padding: 24px 12px; overflow: hidden; }
            .card h3 { font-size: 18px; flex-wrap: wrap; }
            .data-table { font-size: 13px; }
            .data-table th, .data-table td { padding: 10px 8px; }
            .video-destaque-inner { grid-template-columns: 1fr; gap: 32px; }
            .video-destaque-text h2 { font-size: 22px; }
            .form-grid { grid-template-columns: 1fr; }
            .form-container { padding: 32px 24px; }
            .chart-container canvas { max-height: 350px; }
        }
        @media (max-width: 480px) {
            .gallery-grid { grid-template-columns: 1fr; }
            .hero-title-name { font-size: 26px; }
            .photo-carousel-viewport { aspect-ratio: 1/1; }
        }
    `;
