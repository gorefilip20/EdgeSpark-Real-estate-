import { Hono } from "hono";

const staticRoutes = new Hono();

// Page registry — maps URL slugs to HTML content
const pages: Record<string, string> = {};

// Helper to register a page
function reg(name: string, html: string) { pages[name] = html; }

// ============================================
// LANDING PAGE (full version)
// ============================================
reg("home", `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>EdgeSpark — Real Estate Investing, Explained</title>
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<meta name="description" content="EdgeSpark by Evarestus Company Ltd. We buy undervalued Nigerian properties, add value, and resell — generating short-cycle returns for joint-venture partners.">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html{font-size:16px;scroll-behavior:smooth;-webkit-font-smoothing:antialiased}
body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;color:#1C1917;background:#FAFAF9;line-height:1.6}
:root{--gold:#C9A24B;--navy:#0F1729;--bg:#FAFAF9;--surface:#FFF;--fg:#1C1917;--fg2:#57534E;--muted:#A8A29E;--border:#E7E5E4;--serif:'Fraunces',Georgia,serif;--sans:'Plus Jakarta Sans',system-ui,sans-serif}
a{text-decoration:none;color:inherit}
.container{max-width:1200px;margin:0 auto;padding:0 1.5rem}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.skip-link{position:absolute;top:-100%;left:1.5rem;z-index:9999;padding:.75rem 1.5rem;background:var(--gold);color:#061222;font-weight:600;font-size:.875rem;border-radius:0 0 8px 8px;transition:top .12s}
.skip-link:focus{top:0}

/* NAV */
.nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:1rem 0;background:rgba(250,249,247,.95);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);transition:all .2s}
.nav.scrolled{padding:.75rem 0;box-shadow:0 1px 20px rgba(0,0,0,.06)}
.nav-inner{display:flex;align-items:center;justify-content:space-between;max-width:1200px;margin:0 auto;padding:0 1.5rem}
.brand{display:flex;align-items:center;gap:.75rem;text-decoration:none}
.brand-mark{width:40px;height:40px;background:var(--navy);display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:1.1rem;color:var(--gold);font-weight:700}
.brand-name{font-weight:700;font-size:.95rem;color:var(--fg)}
.brand-sub{font-size:.7rem;color:var(--muted);letter-spacing:.04em;text-transform:uppercase;font-weight:500}
.nav-links{display:flex;align-items:center;gap:1.5rem}
.nav-links a{font-size:.875rem;font-weight:500;color:var(--fg2);transition:color .2s}
.nav-links a:hover{color:var(--fg)}
.nav-cta{background:var(--navy)!important;color:#fff!important;padding:.6rem 1.4rem;font-weight:600;border-radius:8px}
.nav-cta:hover{background:#142d4a!important}
.burger{display:none;background:none;border:none;cursor:pointer;padding:4px}
.burger span{display:block;width:22px;height:2px;background:var(--fg);margin:5px 0;transition:all .2s}

/* HERO */
.hero{min-height:100vh;display:flex;align-items:flex-end;padding-bottom:4rem;background:linear-gradient(135deg,#061222 0%,#0f2847 50%,#162d4a 100%);position:relative;overflow:hidden}
.hero::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 50%,rgba(6,18,34,.6) 100%)}
.hero::before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px);background-size:60px 60px}
.hero-content{position:relative;z-index:2;max-width:1200px;margin:0 auto;padding:0 1.5rem;width:100%}
.hero-badge{display:inline-flex;align-items:center;gap:.5rem;padding:.4rem 1rem;background:rgba(184,150,62,.12);border:1px solid rgba(184,150,62,.25);font-size:.75rem;font-weight:600;color:#D4B96A;letter-spacing:.04em;text-transform:uppercase;margin-bottom:2rem;border-radius:4px}
.hero-title{font-family:var(--serif);font-size:clamp(2.5rem,5vw,4.5rem);line-height:1.05;color:#fff;max-width:700px;margin-bottom:1.5rem;letter-spacing:-.025em}
.hero-title em{font-style:italic;color:#D4B96A}
.hero-desc{font-size:1.125rem;line-height:1.7;color:rgba(255,255,255,.6);max-width:520px;margin-bottom:2.5rem}
.hero-actions{display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:4rem}
.btn-primary{display:inline-flex;align-items:center;gap:.5rem;padding:.85rem 2rem;background:var(--gold);color:#061222;font-weight:600;font-size:.9rem;border:none;cursor:pointer;transition:all .25s;border-radius:8px;text-decoration:none}
.btn-primary:hover{background:#D4B96A;transform:translateY(-2px);box-shadow:0 8px 24px rgba(184,150,62,.25)}
.btn-secondary{display:inline-flex;align-items:center;gap:.5rem;padding:.85rem 2rem;background:transparent;color:rgba(255,255,255,.8);font-weight:500;font-size:.9rem;border:1px solid rgba(255,255,255,.2);cursor:pointer;transition:all .25s;border-radius:8px;text-decoration:none}
.btn-secondary:hover{border-color:rgba(255,255,255,.5);color:#fff}
.hero-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border-top:1px solid rgba(255,255,255,.1)}
.hero-stat{padding:1.5rem 1.5rem 0 0;border-right:1px solid rgba(255,255,255,.08)}
.hero-stat:last-child{border-right:none}
.hero-stat-value{font-family:var(--serif);font-size:2rem;color:#fff;line-height:1;margin-bottom:.35rem;font-variant-numeric:tabular-nums}
.hero-stat-label{font-size:.75rem;color:rgba(255,255,255,.4);letter-spacing:.03em}

/* TRUST BAR */
.trust-bar{background:var(--navy);border-bottom:1px solid rgba(255,255,255,.08)}
.trust-inner{display:flex;align-items:center;justify-content:center;gap:3rem;padding:1rem 0;flex-wrap:wrap}
.trust-item{display:flex;align-items:center;gap:.5rem;font-size:.875rem;color:rgba(255,255,255,.5);white-space:nowrap}
.trust-item strong{color:rgba(255,255,255,.75)}
.trust-dot{width:4px;height:4px;background:var(--gold);border-radius:50%;flex-shrink:0}

/* SECTIONS */
.section{padding:5rem 0}
.section-alt{background:var(--surface)}
.split{display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center}
.split-reverse{direction:rtl}.split-reverse>*{direction:ltr}
.type-overline{font-family:var(--sans);font-size:.6875rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--gold)}
.type-h1{font-family:var(--serif);font-size:clamp(1.8rem,3.5vw,2.8rem);line-height:1.15;letter-spacing:-.015em;color:var(--fg)}
.type-body{font-size:1.125rem;line-height:1.7;color:var(--fg2)}

/* STAT STRIP */
.stat-strip{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--border);border:1px solid var(--border)}
.stat-cell{background:var(--surface);padding:2rem}
.stat-cell:nth-child(3),.stat-cell:nth-child(4){background:var(--bg)}
.stat-number{font-family:var(--serif);font-size:2.5rem;color:var(--fg);line-height:1;margin-bottom:.5rem;font-variant-numeric:tabular-nums}
.stat-label{font-size:.875rem;color:var(--muted);line-height:1.4}

/* CHECK LIST */
.check-list{list-style:none}
.check-list li{display:flex;gap:1rem;padding:1.25rem 0;border-bottom:1px solid var(--border)}
.check-list li:last-child{border-bottom:none}
.check-num{font-family:var(--serif);font-size:1.5rem;color:var(--gold);line-height:1;flex-shrink:0;width:2rem}
.check-list h4{font-size:1rem;font-weight:600;color:var(--fg);margin-bottom:.25rem}
.check-list p{font-size:.875rem;color:var(--muted);margin:0}

/* STEPS */
.steps-row{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid var(--border);background:var(--surface)}
.step-item{padding:2.5rem 2rem;border-right:1px solid var(--border)}
.step-item:last-child{border-right:none}
.step-num{font-family:var(--serif);font-size:3rem;color:transparent;-webkit-text-stroke:1.5px rgba(184,150,62,.2);line-height:1;margin-bottom:1rem}
.step-item h3{font-size:1rem;font-weight:700;color:var(--fg);margin-bottom:.75rem}
.step-item p{font-size:.875rem;color:var(--muted);line-height:1.6}

/* PROPERTY CARD */
.property-card{background:var(--surface);border:1px solid var(--border);display:grid;grid-template-columns:1fr 1fr;overflow:hidden;border-radius:12px}
.property-image{background:linear-gradient(135deg,#1a2a40,#0f1e30);min-height:320px;display:flex;align-items:center;justify-content:center}
.property-image svg{stroke:rgba(255,255,255,.2)}
.property-details{padding:2.5rem;display:flex;flex-direction:column;justify-content:center}
.property-tag{display:inline-block;padding:.25rem .75rem;background:rgba(201,162,75,.1);color:var(--gold);font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-bottom:1rem;width:fit-content;border-radius:4px}
.property-details h3{font-family:var(--serif);font-size:1.5rem;color:var(--fg);margin-bottom:.5rem}
.property-location{display:flex;align-items:center;gap:.4rem;font-size:.875rem;color:var(--muted);margin-bottom:1.5rem}
.property-specs{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;padding-top:1.5rem;border-top:1px solid var(--border);margin-bottom:1.5rem}
.property-spec label{display:block;font-size:.65rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.25rem}
.property-spec span{font-size:1rem;font-weight:600;color:var(--fg)}
.property-price{font-family:var(--serif);font-size:1.8rem;color:var(--fg);margin-bottom:1.5rem;font-variant-numeric:tabular-nums}
.property-price small{font-family:var(--sans);font-size:.8rem;color:var(--muted);font-weight:400;margin-left:.5rem}

/* DEAL TABLE */
.deal-card{background:var(--surface);border:1px solid var(--border);overflow:hidden;border-radius:12px}
.deal-header{display:flex;justify-content:space-between;align-items:center;padding:1.5rem 2rem;border-bottom:1px solid var(--border)}
.deal-header h3{font-family:var(--serif);font-size:1.125rem}
.deal-header span{font-size:.75rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;font-weight:500}
.deal-table{width:100%;border-collapse:collapse}
.deal-table th{text-align:left;padding:.75rem 2rem;font-size:.7rem;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;background:var(--bg);border-bottom:1px solid var(--border)}
.deal-table td{padding:1rem 2rem;border-bottom:1px solid var(--border);font-size:.9rem;font-variant-numeric:tabular-nums}
.deal-table tr:last-child td{border-bottom:none}
.deal-table .row-hl{background:var(--bg)}
.deal-table .row-profit{background:#f0f7ef}
.deal-table .row-profit td{font-weight:600;color:#16A34A}
.deal-table td:last-child{color:var(--muted);font-size:.8rem}
.deal-footer{padding:1.25rem 2rem;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center}
.deal-footer span{font-size:.875rem;color:var(--muted)}
.deal-footer strong{color:var(--fg)}

/* PROTECTION */
.protection-list{list-style:none;counter-reset:protection}
.protection-list li{counter-increment:protection;display:grid;grid-template-columns:3rem 1fr;gap:1.5rem;padding:2rem 0;border-bottom:1px solid var(--border);align-items:start}
.protection-list li:last-child{border-bottom:none}
.protection-list li::before{content:counter(protection,decimal-leading-zero);font-family:var(--serif);font-size:1.5rem;color:var(--gold);line-height:1}
.protection-list h3{font-size:1rem;font-weight:600;color:var(--fg);margin-bottom:.35rem}
.protection-list p{font-size:.875rem;color:var(--fg2)}

/* FUND BARS */
.fund-bar{margin-bottom:1.5rem}
.fund-bar-header{display:flex;justify-content:space-between;margin-bottom:.5rem}
.fund-bar-header b{font-size:.875rem;font-weight:600}
.fund-bar-header span{font-size:.875rem;color:var(--muted);font-variant-numeric:tabular-nums}
.fund-track{height:8px;background:var(--bg);border-radius:9999px;overflow:hidden}
.fund-fill{height:100%;background:var(--gold);border-radius:9999px}
.callout{padding:1.5rem 2rem;background:var(--bg);border-left:3px solid var(--gold)}
.callout strong{font-size:1rem;color:var(--fg);display:block;margin-bottom:.25rem}
.callout p{font-size:.875rem;color:var(--fg2)}

/* EDU CARDS */
.edu-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem}
.edu-card{background:var(--surface);border:1px solid var(--border);padding:1.5rem;text-decoration:none;border-radius:12px;transition:border-color .12s,box-shadow .12s}
.edu-card:hover{border-color:var(--primary,#C9A24B);box-shadow:0 4px 12px rgba(0,0,0,.08)}
.edu-card-icon{width:40px;height:40px;background:rgba(201,162,75,.1);display:flex;align-items:center;justify-content:center;margin-bottom:1rem;border-radius:8px}
.edu-card-icon svg{stroke:var(--gold)}
.edu-card h3{font-size:1rem;font-weight:700;color:var(--fg);margin-bottom:.5rem}
.edu-card p{font-size:.875rem;color:var(--muted);line-height:1.6;margin-bottom:1rem}
.edu-link{font-size:.875rem;font-weight:600;color:var(--gold)}

/* CTA BAND */
.cta-band{background:var(--navy);padding:4rem;border-radius:12px;color:#fff;position:relative;overflow:hidden}
.cta-band h2{font-family:var(--serif);font-size:2.25rem;margin-bottom:1rem}
.cta-band p{color:rgba(255,255,255,.7);margin-bottom:2rem;max-width:600px;line-height:1.7}
.cta-actions{display:flex;gap:1rem;flex-wrap:wrap}

/* TEAM */
.team-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1.5rem}
.founder-card{background:var(--surface);border:1px solid var(--border);padding:2rem;border-radius:12px}
.founder-top{display:flex;gap:1rem;align-items:center;margin-bottom:1rem}
.founder-avatar{width:56px;height:56px;background:var(--navy);display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:1.2rem;color:var(--gold);flex-shrink:0;border-radius:50%}
.founder-name{font-size:1rem;font-weight:700;color:var(--fg)}
.founder-role{font-size:.875rem;color:var(--gold)}
.founder-bio{font-size:.875rem;color:var(--fg2);line-height:1.6;margin-bottom:1rem}
.founder-contact a{display:flex;align-items:center;gap:.5rem;font-size:.875rem;color:var(--muted);padding:.25rem 0;transition:color .2s}
.founder-contact a:hover{color:var(--gold)}

/* FAQ */
.faq{max-width:720px;margin:0 auto}
.faq-item{border-bottom:1px solid var(--border)}
.faq-q{display:flex;justify-content:space-between;align-items:center;width:100%;padding:1.5rem 0;text-align:left;font-size:1rem;font-weight:600;color:var(--fg);cursor:pointer;background:none;border:none;font-family:var(--sans)}
.faq-q:hover{color:var(--gold)}
.faq-icon{width:20px;height:20px;flex-shrink:0;transition:transform .2s}
.faq-item.open .faq-icon{transform:rotate(45deg)}
.faq-a{max-height:0;overflow:hidden;transition:max-height .3s ease}
.faq-item.open .faq-a{max-height:300px}
.faq-a p{padding-bottom:1.5rem;font-size:.875rem;color:var(--fg2);line-height:1.7}

/* CONTACT */
.contact-layout{display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:start}
.contact-info-item{display:flex;gap:1rem;margin-bottom:1.5rem}
.contact-info-icon{width:40px;height:40px;background:rgba(201,162,75,.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;border-radius:8px}
.contact-info-icon svg{stroke:var(--gold)}
.contact-info-label{font-size:.875rem;font-weight:600;color:var(--fg)}
.contact-info-value{font-size:.875rem;color:var(--muted)}
.form-group{margin-bottom:1.25rem}
.form-label{display:block;font-size:.875rem;font-weight:500;color:var(--fg);margin-bottom:.5rem}
.form-input,.form-select,.form-textarea{width:100%;padding:.75rem 1rem;font-size:1rem;color:var(--fg);background:var(--surface);border:1px solid var(--border);border-radius:8px;transition:border-color .12s}
.form-input:focus,.form-select:focus,.form-textarea:focus{outline:none;border-color:var(--gold);box-shadow:0 0 0 3px rgba(201,162,75,.15)}
.form-textarea{min-height:120px;resize:vertical}
.form-note{font-size:.75rem;color:var(--muted);margin-top:.75rem;text-align:center}
.form-success{display:none;padding:1rem 1.5rem;background:#f0f7ef;color:#16A34A;font-size:.875rem;font-weight:500;border-radius:8px;text-align:center;margin-top:1rem}
.form-success.visible{display:block}
.disclaimer{margin-top:2rem;padding:1rem 1.5rem;background:var(--bg);border-left:2px solid var(--gold);font-size:.875rem;color:var(--muted)}

/* TESTIMONIALS */
.testimonial-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem}
.testimonial-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:2rem;display:flex;flex-direction:column;gap:1.25rem;transition:border-color .12s,box-shadow .12s}
.testimonial-card:hover{border-color:var(--gold);box-shadow:0 4px 12px rgba(0,0,0,.08)}
.testimonial-stars{display:flex;gap:2px}
.testimonial-text{font-size:.875rem;line-height:1.7;color:var(--fg2);flex:1}
.testimonial-author{display:flex;align-items:center;gap:.75rem}
.testimonial-avatar{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,rgba(201,162,75,.15),rgba(201,162,75,.3));display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;color:var(--gold);flex-shrink:0}
.testimonial-name{font-weight:600;font-size:.875rem;color:var(--fg)}
.testimonial-role{font-size:.75rem;color:var(--muted)}

/* NEWSLETTER */
.footer-newsletter{display:flex;align-items:center;gap:2rem;padding:2rem 0;border-bottom:1px solid rgba(255,255,255,.08);flex-wrap:wrap}
.footer-newsletter-text h4{font-size:.875rem;font-weight:600;color:rgba(255,255,255,.7);margin-bottom:.25rem;text-transform:none;letter-spacing:0}
.footer-newsletter-text p{font-size:.75rem;color:rgba(255,255,255,.4);line-height:1.6;margin:0}
.footer-newsletter-form{display:flex;gap:.5rem}
.footer-newsletter-input{padding:.65rem 1rem;font-size:.875rem;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:8px;color:#fff;width:260px;transition:border-color .2s}
.footer-newsletter-input::placeholder{color:rgba(255,255,255,.3)}
.footer-newsletter-input:focus{outline:none;border-color:var(--gold);box-shadow:0 0 0 3px rgba(201,162,75,.15)}
.footer-newsletter-success{display:none;font-size:.875rem;color:var(--gold);margin-top:.5rem;width:100%}
.footer-newsletter-success.visible{display:block}

/* FOOTER */
.footer{background:var(--navy);color:rgba(255,255,255,.5);padding:4rem 0 2rem}
.footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:3rem;padding-bottom:3rem;border-bottom:1px solid rgba(255,255,255,.08)}
.footer h4{font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.35);margin-bottom:1.25rem}
.footer a{display:block;font-size:.875rem;color:rgba(255,255,255,.5);padding:.3rem 0;transition:color .2s}
.footer a:hover{color:var(--gold)}
.footer-bottom{display:flex;justify-content:space-between;padding-top:2rem;font-size:.75rem;color:rgba(255,255,255,.25)}
.footer-disclaimer{margin-top:2rem;padding:1.5rem 2rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);font-size:.75rem;color:rgba(255,255,255,.3);line-height:1.6}
.footer-reg{font-size:.75rem;line-height:1.6;color:rgba(255,255,255,.3);margin-bottom:1rem}

/* REVEAL */
.reveal{opacity:0;transform:translateY(20px);transition:opacity .6s ease-out,transform .6s ease-out}
.reveal.visible{opacity:1;transform:translateY(0)}
.reveal-d1{transition-delay:100ms}.reveal-d2{transition-delay:200ms}.reveal-d3{transition-delay:300ms}

@media(max-width:768px){
  .nav-links{display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:var(--navy);flex-direction:column;justify-content:center;gap:2.5rem;z-index:99}
  .nav-links.open{display:flex}
  .nav-links a{font-size:1.25rem;color:rgba(255,255,255,.8)}
  .nav-cta{background:var(--gold)!important;color:var(--navy)!important}
  .burger{display:block;z-index:101}
  .hero-stats{grid-template-columns:repeat(2,1fr)}
  .hero-stat{padding:1.25rem 1rem;border-right:none;border-bottom:1px solid rgba(255,255,255,.08)}
  .split,.split-reverse,.contact-layout,.team-grid,.footer-grid,.edu-grid,.testimonial-grid{grid-template-columns:1fr}
  .footer-newsletter{flex-direction:column;align-items:flex-start;gap:1rem}
  .footer-newsletter-input{width:100%}.footer-newsletter-form{width:100%}
  .steps-row,.stat-strip{grid-template-columns:1fr}
  .property-card{grid-template-columns:1fr}
  .hero{padding-bottom:2rem}
  .hero-title{font-size:2.25rem}
  .section{padding:3rem 0}
}
</style>
</head>
<body>
<a href="#main" class="skip-link">Skip to content</a>

<header class="nav" id="nav">
  <div class="nav-inner">
    <a href="/" class="brand"><span class="brand-mark"><svg viewBox="0 0 40 40" width="40" height="40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="6" fill="#0F1729"/><path d="M20 8L10 19h20z" fill="#C9A24B"/><rect x="14" y="21" width="12" height="11" rx="1" fill="#C9A24B"/><rect x="17.5" y="24" width="5" height="8" rx=".5" fill="#0F1729"/></svg></span><span class="brand-text"><span class="brand-name">EdgeSpark</span></span></a>
    <nav class="nav-links" id="navLinks">
      <a href="#opportunity">Opportunity</a>
      <a href="#how">How It Works</a>
      <a href="#properties">Properties</a>
      <a href="#protection">Protection</a>
      <a href="#learn">Learn</a>
      <a href="#team">Team</a>
      <a href="/api/public/page/properties">Properties</a><a href="/api/public/page/calculator">Calculator</a><a href="/api/public/page/partner">Partner</a><a href="/api/public/page/register" class="nav-cta">Get Started</a>
    </nav>
    <button class="burger" id="burger" aria-label="Toggle menu"><span></span><span></span><span></span></button>
  </div>
</header>

<main id="main">

<!-- HERO -->
<section class="hero">
  <div class="hero-content">
    <span class="hero-badge">CAC-Registered &middot; RC 8864759 &middot; Enugu, Nigeria</span>
    <h1 class="hero-title">Real estate that's <em>simple, verified,</em> and built to teach.</h1>
    <p class="hero-desc">We buy already-built properties across Nigeria's growing cities — below market value, straight from sellers who need liquidity. You approve every deal before any money moves.</p>
    <div class="hero-actions">
      <a href="#how" class="btn-primary">See How It Works</a>
      <a href="#learn" class="btn-secondary">Learn the Basics</a>
    </div>
    <div class="hero-stats">
      <div class="hero-stat"><div class="hero-stat-value">2–4 mo</div><div class="hero-stat-label">Average deal cycle</div></div>
      <div class="hero-stat"><div class="hero-stat-value">37%+</div><div class="hero-stat-label">Target return per deal</div></div>
      <div class="hero-stat"><div class="hero-stat-value">60–80%</div><div class="hero-stat-label">Investor profit share</div></div>
      <div class="hero-stat"><div class="hero-stat-value">100%</div><div class="hero-stat-label">Title-verified assets</div></div>
    </div>
  </div>
</section>

<!-- TRUST BAR -->
<div class="trust-bar"><div class="container"><div class="trust-inner">
  <div class="trust-item"><span class="trust-dot"></span><strong>CAC Incorporated</strong> &middot; Companies & Allied Matters Act 2020</div>
  <div class="trust-item"><span class="trust-dot"></span><strong>RC 8864759</strong> &middot; TIN 33563751-0001</div>
  <div class="trust-item"><span class="trust-dot"></span><strong>Lawyer-verified titles</strong> on every acquisition</div>
</div></div></div>

<!-- OPPORTUNITY -->
<section class="section" id="opportunity">
  <div class="container">
    <div class="split">
      <div class="reveal"><span class="type-overline">The Opportunity</span><h2 class="type-h1" style="margin-top:.75rem">Nigeria's $1 Trillion Housing Gap</h2><p class="type-body" style="margin-top:1rem">Nigeria faces an estimated 28 million housing-unit deficit — one of the largest in the world. For investors, that gap is a massive, undersupplied market with durable demand for affordable, mid-market homes.</p></div>
      <div class="stat-strip reveal reveal-d1">
        <div class="stat-cell"><div class="stat-number">28M+</div><div class="stat-label">Housing-unit deficit</div></div>
        <div class="stat-cell"><div class="stat-number">$1T</div><div class="stat-label">Market opportunity</div></div>
        <div class="stat-cell"><div class="stat-number">2–4mo</div><div class="stat-label">Average deal cycle</div></div>
        <div class="stat-cell"><div class="stat-number">37%+</div><div class="stat-label">Target return</div></div>
      </div>
    </div>
  </div>
</section>

<!-- WHY IT MATTERS -->
<section class="section section-alt">
  <div class="container">
    <div class="split split-reverse">
      <div class="reveal"><span class="type-overline">Why This Matters For You</span><h2 class="type-h1" style="margin-top:.75rem">Below-market homes from motivated sellers</h2><p class="type-body" style="margin-top:1rem">Nigeria's cities are full of already-built properties owned by sellers who need quick liquidity — real buildings, often priced <strong>20–40% below market</strong> simply because the owner needs cash fast.</p>
        <ul class="check-list" style="margin-top:2rem">
          <li><span class="check-num">1</span><div><h4>Real estate arbitrage, not speculation</h4><p>Buy under value, improve, resell at market — a short, measurable cycle.</p></div></li>
          <li><span class="check-num">2</span><div><h4>Capital tied to a physical asset</h4><p>Every dollar is backed by a title-verified building with a clear resale path.</p></div></li>
          <li><span class="check-num">3</span><div><h4>Demand that stays strong for decades</h4><p>A 28M-unit deficit means the buyer side is never in question.</p></div></li>
        </ul>
      </div>
      <div style="position:relative" class="reveal reveal-d1">
        <div style="background:linear-gradient(135deg,#1a2a40,#0f1e30);min-height:400px;border-radius:12px;display:flex;align-items:center;justify-content:center">
          <div style="text-align:center;color:rgba(255,255,255,.3);padding:2rem"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg><p style="margin-top:1rem;font-size:.875rem">Property photography</p></div>
        </div>
        <div style="position:absolute;bottom:-20px;left:1.5rem;right:1.5rem;background:var(--surface);padding:1.25rem 1.5rem;box-shadow:0 8px 24px rgba(0,0,0,.12);border-radius:8px"><strong style="font-size:.875rem">Real assets, real neighborhoods</strong><p style="font-size:.875rem;color:var(--muted);margin-top:.25rem">Every deal is backed by a tangible, verified property — never a promise.</p></div>
      </div>
    </div>
  </div>
</section>

<!-- HOW IT WORKS -->
<section class="section" id="how">
  <div class="container">
    <div class="reveal" style="margin-bottom:3rem"><span class="type-overline">The Business Model</span><h2 class="type-h1" style="margin-top:.75rem">How It Works — In Four Clear Steps</h2><p class="type-body" style="margin-top:.75rem;max-width:600px">Our model is simple, repeatable, and designed to protect your capital at every stage.</p></div>
    <div class="steps-row reveal reveal-d1">
      <div class="step-item"><div class="step-num">1</div><h3>Find</h3><p>Source underpriced properties from motivated sellers across Nigerian cities.</p></div>
      <div class="step-item"><div class="step-num">2</div><h3>Verify</h3><p>Full title verification at the Land Registry with a qualified lawyer. No money moves until it's clear.</p></div>
      <div class="step-item"><div class="step-num">3</div><h3>Improve</h3><p>Light cosmetic upgrades — paint, gate repairs, landscaping — to boost perceived value.</p></div>
      <div class="step-item"><div class="step-num">4</div><h3>Resell</h3><p>Sell at full market value within 2–4 months. Profit split per JV terms.</p></div>
    </div>
  </div>
</section>

<!-- PROPERTIES -->
<section class="section section-alt" id="properties">
  <div class="container">
    <div class="reveal" style="margin-bottom:3rem"><span class="type-overline">Available Properties</span><h2 class="type-h1" style="margin-top:.75rem">Browse Our Properties</h2><p class="type-body" style="margin-top:.75rem;max-width:600px">Every property below is title-verified, physically inspected, and backed by a complete Deal Analyzer.</p></div>
    <div class="property-card reveal reveal-d1">
      <div class="property-image"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke-width="1.5"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg></div>
      <div class="property-details">
        <span class="property-tag">Available</span>
        <h3>3-Bedroom Bungalow — Trans-Ekulu</h3>
        <div class="property-location"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>Trans-Ekulu, Enugu, Nigeria</div>
        <div class="property-specs"><div class="property-spec"><label>Bedrooms</label><span>3</span></div><div class="property-spec"><label>Bathrooms</label><span>2</span></div><div class="property-spec"><label>Plot Size</label><span>450 sqm</span></div></div>
        <div class="property-price">&#8358;15,000,000 <small>≈ $11,005 USD</small></div>
        <a href="/api/public/page/register" class="btn-primary" style="width:fit-content">Request Details</a>
      </div>
    </div>
  </div>
</section>

<!-- DEAL ANALYZER -->
<section class="section">
  <div class="container">
    <div class="split">
      <div class="reveal"><span class="type-overline">Illustrative Deal</span><h2 class="type-h1" style="margin-top:.75rem">See the math on a single deal</h2><p class="type-body" style="margin-top:1rem">Transparency is the whole point. Before you commit, you receive a complete Deal Analyzer for the specific property.</p>
        <div class="disclaimer" style="margin-top:1.5rem">Illustrative only. Real figures come from the Deal Analyzer for each specific property.</div>
      </div>
      <div class="deal-card reveal reveal-d1">
        <div class="deal-header"><h3>Deal Analyzer</h3><span>Illustrative example</span></div>
        <table class="deal-table">
          <thead><tr><th>Item</th><th>Amount</th><th>Note</th></tr></thead>
          <tbody>
            <tr><td>Purchase Price</td><td>&#8358;15,000,000</td><td>Below-market acquisition</td></tr>
            <tr><td>Renovation & Costs</td><td>&#8358;2,500,000</td><td>Legal, touch-ups, fees</td></tr>
            <tr class="row-hl"><td><strong>Total Investment</strong></td><td><strong>&#8358;17,500,000</strong></td><td>All-in cost</td></tr>
            <tr><td>Resale Price</td><td>&#8358;24,000,000</td><td>Market-rate sale</td></tr>
            <tr class="row-profit"><td>Gross Profit</td><td>&#8358;6,500,000</td><td>≈ 37% return</td></tr>
          </tbody>
        </table>
        <div class="deal-footer"><span>Profit Split: <strong>Investor 60–80%</strong> · Operator 20–40%</span><span>Agreed per deal</span></div>
      </div>
    </div>
  </div>
</section>

<!-- PROTECTION -->
<section class="section section-alt" id="protection">
  <div class="container">
    <div class="split">
      <div class="reveal"><span class="type-overline">Capital Protection</span><h2 class="type-h1" style="margin-top:.75rem">Four Layers Protecting Your Capital</h2><p class="type-body" style="margin-top:1rem">Multiple safeguards built into our model — your capital is never exposed to avoidable errors, fraud, or opacity.</p></div>
      <div class="reveal reveal-d1">
        <ol class="protection-list">
          <li><div><h3>Title-Verified Assets</h3><p>Full title check at the Land Registry before capital is committed.</p></div></li>
          <li><div><h3>Written JV Agreement</h3><p>Lawyer-drafted agreement defines all terms before money changes hands.</p></div></li>
          <li><div><h3>Full Transparency</h3><p>Complete Deal Analyzer before you invest — no hidden fees.</p></div></li>
          <li><div><h3>Start Small, Build Trust</h3><p>Begin with a single deal. Scale when you're confident.</p></div></li>
        </ol>
      </div>
    </div>
  </div>
</section>

<!-- USE OF FUNDS -->
<section class="section">
  <div class="container">
    <div class="split">
      <div class="reveal"><span class="type-overline">Use of Funds</span><h2 class="type-h1" style="margin-top:.75rem">Where every dollar goes</h2><p class="type-body" style="margin-top:1rem">The majority of every dollar goes directly into property acquisition.</p></div>
      <div class="reveal reveal-d1">
        <div class="fund-bar"><div class="fund-bar-header"><b>Property Acquisitions</b><span>70%</span></div><div class="fund-track"><div class="fund-fill" style="width:70%"></div></div></div>
        <div class="fund-bar"><div class="fund-bar-header"><b>Renovation & Value-Add</b><span>15%</span></div><div class="fund-track"><div class="fund-fill" style="width:15%"></div></div></div>
        <div class="fund-bar"><div class="fund-bar-header"><b>Legal & Title Verification</b><span>8%</span></div><div class="fund-track"><div class="fund-fill" style="width:8%"></div></div></div>
        <div class="fund-bar"><div class="fund-bar-header"><b>Operations & Marketing</b><span>7%</span></div><div class="fund-track"><div class="fund-fill" style="width:7%"></div></div></div>
        <div class="callout"><strong>The Ask — Seed Round: $100,000 – $200,000</strong><p>Deployed through a Joint Venture structure with profit-sharing on each verified deal. Target: 3–5 deals in Year 1.</p></div>
      </div>
    </div>
  </div>
</section>

<!-- LEARNING HUB -->
<section class="section section-alt" id="learn">
  <div class="container">
    <div class="reveal" style="text-align:center;margin-bottom:3rem"><span class="type-overline">Learn Before You Invest</span><h2 class="type-h1" style="margin-top:.75rem">Real Estate Investing, Explained</h2><p class="type-body" style="margin-top:.75rem;max-width:600px;margin:0 auto">Informed partners make the best partners. Our Learning Hub breaks down how value-add real estate works.</p></div>
    <div class="edu-grid">
      <a href="#" class="edu-card reveal"><div class="edu-card-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg></div><h3>Buy · Add Value · Resell</h3><p>The value-add model in plain English.</p><span class="edu-link">Read the guide →</span></a>
      <a href="#" class="edu-card reveal reveal-d1"><div class="edu-card-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke-width="2"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h4"/></svg></div><h3>How to Read a Deal Analyzer</h3><p>Understand every line of the financial breakdown.</p><span class="edu-link">Read the guide →</span></a>
      <a href="#" class="edu-card reveal reveal-d2"><div class="edu-card-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div><h3>What Is a Joint Venture?</h3><p>How profit-sharing and per-deal approval work.</p><span class="edu-link">Read the guide →</span></a>
      <a href="#" class="edu-card reveal"><div class="edu-card-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M12 2l8 4v6c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-4z"/></svg></div><h3>Title Verification 101</h3><p>Why Land Registry checks matter.</p><span class="edu-link">Read the guide →</span></a>
      <a href="#" class="edu-card reveal reveal-d1"><div class="edu-card-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg></div><h3>Understanding the Risks</h3><p>An honest look at what can go wrong.</p><span class="edu-link">Read the guide →</span></a>
      <a href="#" class="edu-card reveal reveal-d2"><div class="edu-card-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></div><h3>Investor Glossary</h3><p>Every term defined simply.</p><span class="edu-link">Browse terms →</span></a>
    </div>
    <div style="text-align:center;margin-top:3rem" class="reveal"><a href="#" class="btn-primary" style="background:var(--navy);color:#fff">Visit the Full Learning Hub →</a></div>
  </div>
</section>

<!-- TESTIMONIALS -->
<section class="section section-alt" id="testimonials">
  <div class="container">
    <div class="reveal" style="text-align:center;margin-bottom:3rem"><span class="type-overline">What Investors Say</span><h2 class="type-h1" style="margin-top:.75rem">Trusted by investors across Nigeria</h2></div>
    <div class="testimonial-grid">
      <div class="testimonial-card reveal">
        <div class="testimonial-stars"><svg width="16" height="16" viewBox="0 0 24 24" fill="#C9A24B" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg width="16" height="16" viewBox="0 0 24 24" fill="#C9A24B" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg width="16" height="16" viewBox="0 0 24 24" fill="#C9A24B" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg width="16" height="16" viewBox="0 0 24 24" fill="#C9A24B" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg width="16" height="16" viewBox="0 0 24 24" fill="#C9A24B" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>
        <p class="testimonial-text">"The Deal Analyzer gave me complete visibility into the numbers. I could see exactly where my capital was going and what the projected return looked like before committing."</p>
        <div class="testimonial-author"><div class="testimonial-avatar">AO</div><div><div class="testimonial-name">Adaeze O.</div><div class="testimonial-role">Joint Venture Partner</div></div></div>
      </div>
      <div class="testimonial-card reveal reveal-d1">
        <div class="testimonial-stars"><svg width="16" height="16" viewBox="0 0 24 24" fill="#C9A24B" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg width="16" height="16" viewBox="0 0 24 24" fill="#C9A24B" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg width="16" height="16" viewBox="0 0 24 24" fill="#C9A24B" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg width="16" height="16" viewBox="0 0 24 24" fill="#C9A24B" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg width="16" height="16" viewBox="0 0 24 24" fill="#C9A24B" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>
        <p class="testimonial-text">"What convinced me was the transparency. Every naira is accounted for, and I received updates at each stage of the renovation. This is how real estate investment should work."</p>
        <div class="testimonial-author"><div class="testimonial-avatar">CE</div><div><div class="testimonial-name">Chukwuemeka E.</div><div class="testimonial-role">Real Estate Investor</div></div></div>
      </div>
      <div class="testimonial-card reveal reveal-d2">
        <div class="testimonial-stars"><svg width="16" height="16" viewBox="0 0 24 24" fill="#C9A24B" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg width="16" height="16" viewBox="0 0 24 24" fill="#C9A24B" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg width="16" height="16" viewBox="0 0 24 24" fill="#C9A24B" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg width="16" height="16" viewBox="0 0 24 24" fill="#C9A24B" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg width="16" height="16" viewBox="0 0 24 24" fill="#C9A24B" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>
        <p class="testimonial-text">"As a diaspora investor, I was skeptical about investing in Nigerian real estate remotely. EdgeSpark's per-deal model and documentation made me feel completely in control."</p>
        <div class="testimonial-author"><div class="testimonial-avatar">NK</div><div><div class="testimonial-name">Nkechi K.</div><div class="testimonial-role">Diaspora Investor</div></div></div>
      </div>
    </div>
  </div>
</section>

<!-- CTA BAND -->
<section class="section">
  <div class="container">
    <div class="cta-band reveal">
      <h2>This is not a blind fund.</h2>
      <p>You review the property, the title report, the renovation plan, and the projected resale price — then you decide. No obligation, no pressure.</p>
      <div class="cta-actions">
        <a href="/api/public/page/register" class="btn-primary">Get Started</a>
        <a href="#how" class="btn-secondary" style="color:rgba(255,255,255,.8);border-color:rgba(255,255,255,.2)">Learn the Model First</a>
      </div>
    </div>
  </div>
</section>

<!-- TEAM -->
<section class="section section-alt" id="team">
  <div class="container">
    <div class="reveal" style="text-align:center;margin-bottom:3rem"><span class="type-overline">The Founding Team</span><h2 class="type-h1" style="margin-top:.75rem">Meet the Founders</h2><p class="type-body" style="margin-top:.75rem;max-width:600px;margin:0 auto">Two founders with complementary strengths covering the full deal lifecycle.</p></div>
    <div class="team-grid">
      <div class="founder-card reveal"><div class="founder-top"><div class="founder-avatar">EU</div><div><div class="founder-name">Evarestus Chinecherem Ugwuokanya</div><div class="founder-role">Founder & Managing Director</div></div></div><p class="founder-bio">Leads deal sourcing, property acquisition, and all on-the-ground operations across Nigerian cities.</p><div class="founder-contact"><a href="mailto:evarestuschinecherem@gmail.com">evarestuschinecherem@gmail.com</a></div></div>
      <div class="founder-card reveal reveal-d1"><div class="founder-top"><div class="founder-avatar">BI</div><div><div class="founder-name">Benjamin Chisom Ikwuagwu</div><div class="founder-role">Co-Founder</div></div></div><p class="founder-bio">Drives financial analysis, investor relations, and deal structuring for full transparency.</p><div class="founder-contact"><a href="mailto:Benjamin.c.ikwuagwu@gmail.com">Benjamin.c.ikwuagwu@gmail.com</a></div></div>
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="section" id="faq">
  <div class="container">
    <div class="reveal" style="text-align:center;margin-bottom:3rem"><span class="type-overline">Common Questions</span><h2 class="type-h1" style="margin-top:.75rem">Answers, up front</h2></div>
    <div class="faq reveal">
      <div class="faq-item"><button class="faq-q" aria-expanded="false">Do I have to commit to multiple deals at once?<svg class="faq-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg></button><div class="faq-a"><p>No. Each deal is independent. Start with a single deal to prove the model.</p></div></div>
      <div class="faq-item"><button class="faq-q" aria-expanded="false">How is my capital protected?<svg class="faq-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg></button><div class="faq-a"><p>Four layers: title verification, written JV agreement, full Deal Analyzer transparency, and a start-small approach.</p></div></div>
      <div class="faq-item"><button class="faq-q" aria-expanded="false">What return can I expect?<svg class="faq-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg></button><div class="faq-a"><p>Target 37%+ per deal, 2–4 month cycle, 60–80% investor share. All investments carry risk.</p></div></div>
      <div class="faq-item"><button class="faq-q" aria-expanded="false">What if the title doesn't check out?<svg class="faq-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg></button><div class="faq-a"><p>We walk away. No money moves until the title is confirmed clear.</p></div></div>
      <div class="faq-item"><button class="faq-q" aria-expanded="false">Where does EdgeSpark operate?<svg class="faq-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg></button><div class="faq-a"><p>Enugu, Nigeria, with networks spanning Enugu, Anambra, Abia, and surrounding states.</p></div></div>
    </div>
  </div>
</section>

<!-- CONTACT -->
<section class="section section-alt" id="contact">
  <div class="container">
    <div class="contact-layout">
      <div class="reveal"><span class="type-overline">Get In Touch</span><h2 class="type-h1" style="margin-top:.75rem">Request the full deck</h2><p class="type-body" style="margin-top:1rem">Tell us about yourself and we'll share the complete pitch deck — no obligation.</p>
        <div style="margin-top:2rem">
          <div class="contact-info-item"><div class="contact-info-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div><div><div class="contact-info-label">Head Office</div><div class="contact-info-value">Enugu, Nigeria</div></div></div>
          <div class="contact-info-item"><div class="contact-info-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg></div><div><div class="contact-info-label">Email</div><div class="contact-info-value">evarestuschinecherem@gmail.com</div></div></div>
        </div>
      </div>
      <form class="reveal reveal-d1" id="contactForm">
        <div class="form-group"><label class="form-label">Full Name</label><input class="form-input" type="text" required placeholder="Your name"></div>
        <div class="form-group"><label class="form-label">Email Address</label><input class="form-input" type="email" required placeholder="you@email.com"></div>
        <div class="form-group"><label class="form-label">Phone (optional)</label><input class="form-input" type="tel" placeholder="+234 ..."></div>
        <div class="form-group"><label class="form-label">Message</label><textarea class="form-textarea" placeholder="Tell us what you'd like to know..."></textarea></div>
        <button type="submit" class="btn-primary" style="width:100%;justify-content:center">Send & Request the Deck</button>
        <p class="form-note">We'll respond within 2 business days.</p>
        <div class="form-success" id="contactSuccess">Thank you! We'll be in touch shortly.</div>
      </form>
    </div>
  </div>
</section>

</main>

<!-- FOOTER -->
<footer class="footer">
  <div class="container">
    <div class="footer-newsletter">
      <div class="footer-newsletter-text" style="flex:1;min-width:240px"><h4>Stay informed</h4><p>Market insights and new deal alerts — no spam, unsubscribe anytime.</p></div>
      <form class="footer-newsletter-form" id="newsletterForm"><input class="footer-newsletter-input" type="email" placeholder="Your email address" required><button type="submit" class="btn-primary" style="white-space:nowrap;padding:.65rem 1.25rem;font-size:.875rem">Subscribe</button></form>
      <div class="footer-newsletter-success" id="nlSuccess">Thanks for subscribing!</div>
    </div>
    <div class="footer-grid">
      <div><div class="brand" style="margin-bottom:1rem"><span class="brand-mark"><svg viewBox="0 0 40 40" width="40" height="40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="6" fill="#0F1729"/><path d="M20 8L10 19h20z" fill="#C9A24B"/><rect x="14" y="21" width="12" height="11" rx="1" fill="#C9A24B"/><rect x="17.5" y="24" width="5" height="8" rx=".5" fill="#0F1729"/></svg></span><span class="brand-text"><span class="brand-name" style="color:#fff">EdgeSpark</span></span></div><p style="font-size:.85rem;line-height:1.7;max-width:300px;margin-bottom:1rem">A real estate investment vehicle operated by Evarestus Company Ltd.</p><p class="footer-reg">Evarestus Company Ltd<br>RC 8864759 · CAC Registered<br>Enugu, Nigeria</p></div>
      <div><h4>Explore</h4><a href="#opportunity">The Opportunity</a><a href="#how">How It Works</a><a href="#protection">Capital Protection</a><a href="#team">Our Team</a></div>
      <div><h4>Learn</h4><a href="#">Buy · Add Value · Resell</a><a href="#">Deal Analyzer Guide</a><a href="#">Joint Ventures 101</a><a href="#">Investor Glossary</a></div>
      <div><h4>Contact</h4><a href="mailto:evarestuschinecherem@gmail.com">Email Us</a><a href="#contact">Request the Deck</a></div>
    </div>
    <div class="footer-disclaimer"><strong>Disclaimer:</strong> This website is for informational purposes and does not constitute legal or investment advice. All investments carry risk.</div>
    <div class="footer-bottom"><span>&copy; 2026 Evarestus Company Ltd. All rights reserved.</span><span>EdgeSpark</span></div>
  </div>
</footer>

<script>
const nav=document.getElementById('nav');
window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',window.scrollY>40));
document.getElementById('burger')?.addEventListener('click',()=>document.getElementById('navLinks').classList.toggle('open'));
document.querySelectorAll('.faq-q').forEach(b=>b.addEventListener('click',()=>{const i=b.closest('.faq-item');document.querySelectorAll('.faq-item.open').forEach(x=>x.classList.remove('open'));i.classList.toggle('open');b.setAttribute('aria-expanded',i.classList.contains('open'));}));
const obs=new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting)x.target.classList.add('visible')}),{threshold:.1,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
document.getElementById('contactForm')?.addEventListener('submit',async e=>{e.preventDefault();const f=e.target;try{const r=await fetch('/api/public/contacts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:f[0].value,email:f[1].value,phone:f[2].value||undefined,message:f[3].value||undefined})});if(r.ok){document.getElementById('contactSuccess').classList.add('visible');f.reset();}}catch{}});
document.getElementById('newsletterForm')?.addEventListener('submit',async e=>{e.preventDefault();const f=e.target;const email=f.querySelector('input[type="email"]').value;try{const r=await fetch('/api/public/contacts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Newsletter Subscriber',email:email,message:'Newsletter signup'})});if(r.ok){document.getElementById('nlSuccess').classList.add('visible');f.style.display='none';}}catch{}});
</script>
</body></html>`);

// Register page (simplified for now — full version in edgespark-site/register.html)
reg("register", `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Register — EdgeSpark</title><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;color:#1C1917;background:#FAFAF9}.auth-layout{display:flex;min-height:100vh}.auth-brand{display:none;flex:1;background:#0F1729;padding:4rem;flex-direction:column;justify-content:center;color:#fff}.auth-form{flex:1;display:flex;align-items:center;justify-content:center;padding:4rem 2rem;background:#FAFAF9}.auth-form-inner{width:100%;max-width:420px}.brand{display:flex;align-items:center;gap:.75rem;margin-bottom:2rem;text-decoration:none}.brand-mark{width:40px;height:40px;background:#0F1729;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-size:1.1rem;color:#C9A24B;font-weight:700}.brand-name{font-weight:700;font-size:.95rem;color:#1C1917}h1{font-family:'Fraunces',serif;font-size:2.25rem;margin-bottom:.5rem}.form-group{margin-bottom:1.25rem}label{display:block;font-size:.875rem;font-weight:500;margin-bottom:.5rem}input{width:100%;padding:.75rem 1rem;font-size:1rem;border:1px solid #E7E5E4;border-radius:8px;background:#fff;transition:border-color .12s}input:focus{outline:none;border-color:#C9A24B;box-shadow:0 0 0 3px rgba(201,162,75,.15)}.btn{width:100%;padding:.85rem;background:#C9A24B;color:#061222;font-weight:600;font-size:.9rem;border:none;border-radius:8px;cursor:pointer;margin-top:1rem;transition:all .25s}.btn:hover{background:#D4B96A}.error{padding:.75rem 1rem;background:#fef2f2;border:1px solid #fecaca;color:#DC2626;font-size:.875rem;border-radius:8px;margin-bottom:1.25rem;display:none}.error.visible{display:block}.footer-link{text-align:center;font-size:.875rem;color:#57534E;margin-top:1.5rem}.footer-link a{color:#C9A24B;font-weight:600}@media(min-width:769px){.auth-brand{display:flex}}.strength{display:flex;gap:4px;margin-top:.5rem}.strength-bar{flex:1;height:3px;background:#E7E5E4;border-radius:9999px;transition:background .12s}.strength-bar.active{background:#C9A24B}.strength-bar.strong{background:#16A34A}</style></head><body><div class="auth-layout"><div class="auth-brand"><div style="position:relative;z-index:2;max-width:400px"><span style="font-size:.6875rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#D4B96A;display:block;margin-bottom:1.5rem">Start Investing</span><h2 style="font-family:'Fraunces',serif;font-size:2.25rem;line-height:1.15;margin-bottom:1.5rem">Real estate investing, made transparent.</h2><p style="color:rgba(255,255,255,.6);line-height:1.7">Create your EdgeSpark account to browse verified deals, express interest, and track your investment journey.</p></div></div><div class="auth-form"><div class="auth-form-inner"><div class="auth-header"><a href="/" class="brand"><span class="brand-mark"><svg viewBox="0 0 40 40" width="40" height="40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="6" fill="#0F1729"/><path d="M20 8L10 19h20z" fill="#C9A24B"/><rect x="14" y="21" width="12" height="11" rx="1" fill="#C9A24B"/><rect x="17.5" y="24" width="5" height="8" rx=".5" fill="#0F1729"/></svg></span><span class="brand-text"><span class="brand-name">EdgeSpark</span></span></a><h1>Create your account</h1><p style="font-size:.875rem;color:#57534E">Join EdgeSpark to access verified investment opportunities.</p></div><div class="error" id="regError"></div><form id="regForm"><div class="form-group"><label for="name">Full Name</label><input type="text" id="name" required placeholder="Your full name" autocomplete="name"></div><div class="form-group"><label for="email">Email Address</label><input type="email" id="email" required placeholder="you@email.com" autocomplete="email"></div><div class="form-group"><label for="phone">Phone (optional)</label><input type="tel" id="phone" placeholder="+234 ..." autocomplete="tel"></div><div class="form-group"><label for="pw">Password</label><input type="password" id="pw" required placeholder="Minimum 8 characters" minlength="8" autocomplete="new-password"><div class="strength" id="strength"><div class="strength-bar"></div><div class="strength-bar"></div><div class="strength-bar"></div><div class="strength-bar"></div></div></div><div class="form-group"><label for="pw2">Confirm Password</label><input type="password" id="pw2" required placeholder="Re-enter password" autocomplete="new-password"></div><button type="submit" class="btn" id="regBtn">Create Account</button></form><div class="footer-link">Already have an account? <a href="/api/public/page/login">Sign in</a></div></div></div></div><script>document.getElementById('pw')?.addEventListener('input',()=>{const v=document.getElementById('pw').value;let s=0;if(v.length>=8)s++;if(/[A-Z]/.test(v))s++;if(/[0-9]/.test(v))s++;if(/[^A-Za-z0-9]/.test(v))s++;document.querySelectorAll('.strength-bar').forEach((b,i)=>{b.classList.toggle('active',i<s);b.classList.toggle('strong',s===4&&i<s);});});document.getElementById('regForm')?.addEventListener('submit',async e=>{e.preventDefault();const btn=document.getElementById('regBtn');const err=document.getElementById('regError');if(document.getElementById('pw').value!==document.getElementById('pw2').value){err.textContent='Passwords do not match.';err.classList.add('visible');return;}btn.disabled=true;btn.textContent='Creating account...';err.classList.remove('visible');try{const r=await fetch('/api/public/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:document.getElementById('name').value,email:document.getElementById('email').value,phone:document.getElementById('phone').value||undefined,password:document.getElementById('pw').value})});const d=await r.json();if(r.ok&&d.ok){localStorage.setItem('edge_token',d.token);localStorage.setItem('edge_user',JSON.stringify(d.user));window.location.href='/api/public/page/dashboard';}else{err.textContent=d.error==='email_already_registered'?'An account with this email exists. Try signing in.':'Something went wrong.';err.classList.add('visible');}}catch{err.textContent='Network error.';err.classList.add('visible');}finally{btn.disabled=false;btn.textContent='Create Account';}});</script></body></html>`);

// Login page
reg("login", `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Login — EdgeSpark</title><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;color:#1C1917;background:#FAFAF9}.auth-layout{display:flex;min-height:100vh}.auth-brand{display:none;flex:1;background:#0F1729;padding:4rem;flex-direction:column;justify-content:center;color:#fff}.auth-form{flex:1;display:flex;align-items:center;justify-content:center;padding:4rem 2rem;background:#FAFAF9}.auth-form-inner{width:100%;max-width:420px}.brand{display:flex;align-items:center;gap:.75rem;margin-bottom:2rem;text-decoration:none}.brand-mark{width:40px;height:40px;background:#0F1729;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-size:1.1rem;color:#C9A24B;font-weight:700}.brand-name{font-weight:700;font-size:.95rem;color:#1C1917}h1{font-family:'Fraunces',serif;font-size:2.25rem;margin-bottom:.5rem}.form-group{margin-bottom:1.25rem}label{display:block;font-size:.875rem;font-weight:500;margin-bottom:.5rem}input{width:100%;padding:.75rem 1rem;font-size:1rem;border:1px solid #E7E5E4;border-radius:8px;background:#fff;transition:border-color .12s}input:focus{outline:none;border-color:#C9A24B;box-shadow:0 0 0 3px rgba(201,162,75,.15)}.btn{width:100%;padding:.85rem;background:#C9A24B;color:#061222;font-weight:600;font-size:.9rem;border:none;border-radius:8px;cursor:pointer;margin-top:1rem;transition:all .25s}.btn:hover{background:#D4B96A}.error{padding:.75rem 1rem;background:#fef2f2;border:1px solid #fecaca;color:#DC2626;font-size:.875rem;border-radius:8px;margin-bottom:1.25rem;display:none}.error.visible{display:block}.footer-link{text-align:center;font-size:.875rem;color:#57534E;margin-top:1.5rem}.footer-link a{color:#C9A24B;font-weight:600}@media(min-width:769px){.auth-brand{display:flex}}</style></head><body><div class="auth-layout"><div class="auth-brand"><div style="position:relative;z-index:2;max-width:400px"><span style="font-size:.6875rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#D4B96A;display:block;margin-bottom:1.5rem">Welcome Back</span><h2 style="font-family:'Fraunces',serif;font-size:2.25rem;line-height:1.15;margin-bottom:1.5rem">Pick up where you left off.</h2><p style="color:rgba(255,255,255,.6);line-height:1.7">Sign in to view your deal interests and track investment opportunities.</p></div></div><div class="auth-form"><div class="auth-form-inner"><div class="auth-header"><a href="/" class="brand"><span class="brand-mark"><svg viewBox="0 0 40 40" width="40" height="40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="6" fill="#0F1729"/><path d="M20 8L10 19h20z" fill="#C9A24B"/><rect x="14" y="21" width="12" height="11" rx="1" fill="#C9A24B"/><rect x="17.5" y="24" width="5" height="8" rx=".5" fill="#0F1729"/></svg></span><span class="brand-text"><span class="brand-name">EdgeSpark</span></span></a><h1>Sign in</h1><p style="font-size:.875rem;color:#57534E">Enter your email and password.</p></div><div class="error" id="loginError"></div><form id="loginForm"><div class="form-group"><label for="email">Email Address</label><input type="email" id="email" required placeholder="you@email.com" autocomplete="email"></div><div class="form-group"><label for="pw">Password</label><input type="password" id="pw" required placeholder="Enter password" autocomplete="current-password"></div><button type="submit" class="btn" id="loginBtn">Sign In</button></form><div class="footer-link">Don't have an account? <a href="/api/public/page/register">Create one</a></div></div></div></div><script>(function(){const t=localStorage.getItem('edge_token');if(t)window.location.href='/api/public/page/dashboard';})();document.getElementById('loginForm')?.addEventListener('submit',async e=>{e.preventDefault();const btn=document.getElementById('loginBtn');const err=document.getElementById('loginError');btn.disabled=true;btn.textContent='Signing in...';err.classList.remove('visible');try{const r=await fetch('/api/public/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:document.getElementById('email').value,password:document.getElementById('pw').value})});const d=await r.json();if(r.ok&&d.ok){localStorage.setItem('edge_token',d.token);localStorage.setItem('edge_user',JSON.stringify(d.user));window.location.href=d.user.role==='admin'?'/api/public/page/admin':'/api/public/page/dashboard';}else{err.textContent=d.error==='invalid_credentials'?'Incorrect email or password.':'Something went wrong.';err.classList.add('visible');}}catch{err.textContent='Network error.';err.classList.add('visible');}finally{btn.disabled=false;btn.textContent='Sign In';}});</script></body></html>`);

// Dashboard page (simplified — uses API)
reg("dashboard", `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Dashboard — EdgeSpark</title><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;color:#1C1917;background:#FAFAF9}a{text-decoration:none;color:inherit}.dash-layout{display:grid;grid-template-columns:260px 1fr;min-height:100vh}.dash-sidebar{background:#0F1729;color:rgba(255,255,255,.7);padding:1.5rem;display:flex;flex-direction:column;position:sticky;top:0;height:100vh}.dash-nav-item{display:flex;align-items:center;gap:.75rem;padding:.75rem 1rem;border-radius:8px;font-size:.875rem;color:rgba(255,255,255,.6);cursor:pointer;transition:all .12s;margin-bottom:.25rem}.dash-nav-item:hover{background:rgba(255,255,255,.08);color:rgba(255,255,255,.9)}.dash-nav-item.active{background:rgba(255,255,255,.12);color:#fff;font-weight:600}.dash-main{background:var(--bg,#FAFAF9);padding:2rem}.dash-title{font-family:'Fraunces',serif;font-size:2.25rem;color:#1C1917}.dash-subtitle{font-size:.875rem;color:#57534E;margin-top:.25rem}.dash-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:2rem}.dash-stat{background:#fff;border:1px solid #E7E5E4;padding:1.25rem 1.5rem;border-radius:12px}.dash-stat-value{font-family:'Fraunces',serif;font-size:1.8rem;font-variant-numeric:tabular-nums}.dash-stat-label{font-size:.75rem;color:#A8A29E;margin-top:.25rem}.deal-card{display:grid;grid-template-columns:140px 1fr auto;gap:1.25rem;padding:1.25rem;background:#fff;border:1px solid #E7E5E4;border-radius:12px;margin-bottom:1rem;cursor:pointer;transition:border-color .12s}.deal-card:hover{border-color:#C9A24B}.deal-thumb{width:140px;height:100px;background:linear-gradient(135deg,#1a2a40,#0f1e30);border-radius:8px;display:flex;align-items:center;justify-content:center}.deal-thumb svg{stroke:rgba(255,255,255,.2)}.deal-info{display:flex;flex-direction:column;justify-content:center}.deal-title{font-weight:700;margin-bottom:.25rem}.deal-meta{font-size:.875rem;color:#A8A29E}.deal-price{font-family:'Fraunces',serif;font-size:1.125rem;display:flex;flex-direction:column;align-items:flex-end;justify-content:center;font-variant-numeric:tabular-nums}.deal-price small{font-size:.75rem;color:#A8A29E}.deal-status{display:inline-block;padding:.25rem .75rem;border-radius:4px;font-size:.7rem;font-weight:600;text-transform:uppercase;background:#f0f7ef;color:#16A34A}.dash-bottom{display:none;position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #E7E5E4;z-index:50}.dash-tab{display:flex;flex-direction:column;align-items:center;padding:.5rem;font-size:.65rem;color:#A8A29E;text-decoration:none}.dash-tab.active{color:#C9A24B}@media(max-width:768px){.dash-layout{grid-template-columns:1fr}.dash-sidebar{display:none}.dash-main{padding:1rem;padding-bottom:80px}.dash-bottom{display:flex;justify-content:space-around}.dash-stats{grid-template-columns:repeat(2,1fr)}.deal-card{grid-template-columns:1fr}}</style></head><body><div class="dash-layout"><aside class="dash-sidebar"><a href="/" class="brand"><span class="brand-mark" style="width:40px;height:40px;background:#0F1729;display:flex;align-items:center;justify-content:center;line-height:0"><svg viewBox="0 0 40 40" width="40" height="40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="6" fill="#0F1729"/><path d="M20 8L10 19h20z" fill="#C9A24B"/><rect x="14" y="21" width="12" height="11" rx="1" fill="#C9A24B"/><rect x="17.5" y="24" width="5" height="8" rx=".5" fill="#0F1729"/></svg></span><span class="brand-text"><span class="brand-name" style="color:#fff">EdgeSpark</span></span></a><nav style="flex:1;margin-top:2rem"><div class="dash-nav-item active" onclick="showView('deals')">Deals</div><div class="dash-nav-item" onclick="showView('profile')">Profile</div><div style="height:1px;background:rgba(255,255,255,.08);margin:1rem 0"></div><div class="dash-nav-item" onclick="signOut()">Sign Out</div></nav><div style="padding-top:1rem;border-top:1px solid rgba(255,255,255,.08)"><div style="display:flex;align-items:center;gap:.75rem"><div style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;color:#fff" id="avatar">--</div><div><div style="font-size:.875rem;color:rgba(255,255,255,.8)" id="userName">Loading...</div><div style="font-size:.7rem;color:rgba(255,255,255,.4)">Investor</div></div></div></div></aside><main class="dash-main"><div id="view-deals"><div class="dash-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem"><div><h1 class="dash-title">Available Deals</h1><p class="dash-subtitle" id="welcomeMsg">Welcome back</p></div></div><div class="dash-stats" id="dealStats"><div class="dash-stat"><div class="dash-stat-value" id="statTotal">-</div><div class="dash-stat-label">Total Deals</div></div><div class="dash-stat"><div class="dash-stat-value" id="statActive">-</div><div class="dash-stat-label">Active</div></div><div class="dash-stat"><div class="dash-stat-value" id="statPending">-</div><div class="dash-stat-label">Pending</div></div><div class="dash-stat"><div class="dash-stat-value" id="statDone">-</div><div class="dash-stat-label">Completed</div></div></div><div id="dealList"><p style="color:#A8A29E;text-align:center;padding:4rem 0">Loading deals...</p></div></div><div id="view-detail" style="display:none"><a onclick="showView('deals')" style="display:inline-flex;align-items:center;gap:.5rem;font-size:.875rem;color:#57534E;cursor:pointer;margin-bottom:1.5rem">← Back to Deals</a><div id="dealDetail"></div></div><div id="view-profile" style="display:none"><h1 class="dash-title" style="margin-bottom:2rem">Profile</h1><div style="background:#fff;border:1px solid #E7E5E4;padding:2rem;border-radius:12px;max-width:960px"><h3 style="font-size:1rem;font-weight:700;margin-bottom:1.5rem">Personal Information</h3><div class="form-group"><label>Full Name</label><input type="text" id="profileName"></div><div class="form-group"><label>Email</label><input type="email" id="profileEmail" disabled style="opacity:.6"></div><div class="form-group"><label>Phone</label><input type="tel" id="profilePhone"></div><button class="btn" style="width:fit-content" onclick="saveProfile()">Save Changes</button></div></div></main></div><nav class="dash-bottom"><a class="dash-tab active" onclick="showView('deals')">Deals</a><a class="dash-tab" onclick="showView('profile')">Profile</a><a class="dash-tab" onclick="signOut()">Sign Out</a></nav><script>const token=localStorage.getItem('edge_token');const user=JSON.parse(localStorage.getItem('edge_user')||'{}');if(!token)window.location.href='/api/public/page/login';document.getElementById('userName').textContent=user.name||'Investor';document.getElementById('avatar').textContent=(user.name||'IN').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();document.getElementById('welcomeMsg').textContent='Welcome back, '+(user.name?.split(' ')[0]||'Investor');function showView(v){['deals','detail','profile'].forEach(x=>{document.getElementById('view-'+x).style.display=x===v?'block':'none';});if(v==='profile')loadProfile();if(v==='deals')loadDeals();}function signOut(){localStorage.removeItem('edge_token');localStorage.removeItem('edge_user');window.location.href='/api/public/page/login';}function formatNgn(n){return new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(n);}async function loadDeals(){try{const r=await fetch('/api/public/deals',{headers:{Authorization:'Bearer '+token}});const d=await r.json();if(!d.ok)throw new Error();document.getElementById('statTotal').textContent=d.total;document.getElementById('statActive').textContent=d.items.length;const list=document.getElementById('dealList');if(d.items.length===0){list.innerHTML='<p style="color:#A8A29E;text-align:center;padding:4rem 0">No deals available yet.</p>';return;}list.innerHTML=d.items.map(deal=>'<div class="deal-card" onclick="showDeal(\\''+deal.slug+'\\')"><div class="deal-thumb"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-width="1.5"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg></div><div class="deal-info"><div class="deal-title">'+deal.title+'</div><div class="deal-meta">'+(deal.bedrooms||'?')+' bed · '+(deal.bathrooms||'?')+' bath · '+(deal.city||'Nigeria')+'</div><span class="deal-status">Active</span></div><div class="deal-price">'+formatNgn(deal.projected_resale_ngn)+'<small>Resale target</small></div></div>').join('');}catch{document.getElementById('dealList').innerHTML='<p style="color:#DC2626;text-align:center;padding:4rem 0">Couldn'\''t load deals.</p>';}}async function showDeal(slug){showView('detail');const el=document.getElementById('dealDetail');el.innerHTML='<p style="color:#A8A29E">Loading...</p>';try{const r=await fetch('/api/public/deals/'+slug,{headers:{Authorization:'Bearer '+token}});const d=await r.json();if(!d.ok)throw new Error();const deal=d.deal;el.innerHTML='<h1 class="dash-title" style="margin-bottom:.5rem">'+deal.title+'</h1><p class="dash-subtitle" style="margin-bottom:2rem">'+(deal.address||deal.city||'Nigeria')+'</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:2rem;margin-bottom:2rem"><div style="background:linear-gradient(135deg,#1a2a40,#0f1e30);min-height:280px;border-radius:12px;display:flex;align-items:center;justify-content:center"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.2)" stroke-width="1.5"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg></div><div><h3 style="font-size:1rem;font-weight:700;margin-bottom:1rem">Property Details</h3><div style="display:grid;gap:.75rem;font-size:.875rem"><div style="display:flex;justify-content:space-between"><span style="color:#A8A29E">Location</span><span>'+(deal.city||'Nigeria')+', '+(deal.state||'')+'</span></div><div style="display:flex;justify-content:space-between"><span style="color:#A8A29E">Bedrooms</span><span>'+(deal.bedrooms||'-')+'</span></div><div style="display:flex;justify-content:space-between"><span style="color:#A8A29E">Bathrooms</span><span>'+(deal.bathrooms||'-')+'</span></div></div></div></div><h3 style="font-size:1rem;font-weight:700;margin-bottom:1rem">Deal Analyzer</h3><div class="deal-card" style="grid-template-columns:1fr;cursor:default;border-radius:12px"><div class="deal-header" style="display:flex;justify-content:space-between;padding:1.5rem 2rem;border-bottom:1px solid #E7E5E4"><h3 style="font-family:\'Fraunces\',serif;font-size:1.125rem">Deal Analyzer</h3><span style="font-size:.75rem;color:#A8A29E;text-transform:uppercase;letter-spacing:.06em">Example</span></div><table class="deal-table"><thead><tr><th>Item</th><th>Amount</th><th>Note</th></tr></thead><tbody><tr><td>Purchase Price</td><td>'+formatNgn(deal.purchase_price_ngn)+'</td><td>Below-market</td></tr><tr><td>Renovation</td><td>'+formatNgn(deal.renovation_costs_ngn+(deal.legal_fees_ngn||0))+'</td><td>Legal + touch-ups</td></tr><tr class="row-hl"><td><strong>Total Investment</strong></td><td><strong>'+formatNgn(deal.total_investment_ngn)+'</strong></td><td>All-in</td></tr><tr><td>Resale Price</td><td>'+formatNgn(deal.projected_resale_ngn)+'</td><td>Market-rate</td></tr><tr class="row-profit"><td>Gross Profit</td><td>'+formatNgn(deal.gross_profit_ngn)+'</td><td>'+(deal.return_percentage?'≈ '+deal.return_percentage+'%':'')+'</td></tr></tbody></table></div><div style="margin-top:2rem"><button class="btn" onclick="expressInterest(\\''+deal.id+'\\')">Express Interest</button></div>';el.innerHTML=el.innerHTML;}catch{el.innerHTML='<p style="color:#DC2626">Deal not found.</p>';}}async function expressInterest(dealId){if(!confirm('Express interest in this deal?'))return;try{await fetch('/api/public/deals/'+dealId+'/interest',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({})});alert('Interest submitted!');loadDeals();}catch{alert('Error submitting interest.');}}async function loadProfile(){try{const r=await fetch('/api/public/auth/me',{headers:{Authorization:'Bearer '+token}});const d=await r.json();if(d.ok){document.getElementById('profileName').value=d.user.name||'';document.getElementById('profileEmail').value=d.user.email||'';document.getElementById('profilePhone').value=d.user.phone||'';}}catch{}}function saveProfile(){alert('Profile saved!');}</script></body></html>`);

// Admin page (enhanced with interest/partner management)
reg("admin", `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Admin — EdgeSpark</title><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;color:#1C1917;background:#FAFAF9}a{text-decoration:none;color:inherit}
.dash-layout{display:grid;grid-template-columns:1fr;min-height:100vh}
.dash-sidebar{display:none}
.dash-main{padding:1rem;padding-bottom:80px}
.dash-title{font-family:'Fraunces',serif;font-size:1.75rem;color:#1C1917}
.dash-subtitle{font-size:.875rem;color:#57534E;margin-top:.25rem}
.dash-stats{display:grid;grid-template-columns:repeat(2,1fr);gap:.75rem;margin-bottom:1.5rem}
.dash-stat{background:#fff;border:1px solid #E7E5E4;padding:1rem;border-radius:12px}
.dash-stat-value{font-family:'Fraunces',serif;font-size:1.5rem;font-variant-numeric:tabular-nums}
.dash-stat-label{font-size:.7rem;color:#A8A29E;margin-top:.25rem}
.data-table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #E7E5E4;border-radius:12px;overflow:hidden;font-size:.8rem}
.data-table th{text-align:left;padding:.6rem .75rem;font-size:.65rem;font-weight:600;color:#A8A29E;text-transform:uppercase;letter-spacing:.04em;background:#FAFAF9;border-bottom:1px solid #E7E5E4}
.data-table td{padding:.6rem .75rem;border-bottom:1px solid #E7E5E4}
.data-table tr:last-child td{border-bottom:none}
.badge{display:inline-block;padding:.2rem .5rem;border-radius:4px;font-size:.65rem;font-weight:600;text-transform:uppercase}
.badge-active{background:#f0f7ef;color:#16A34A}.badge-pending{background:#fef3c7;color:#D97706}.badge-new{background:#eff6ff;color:#2563EB}
.btn{padding:.6rem 1.2rem;background:#C9A24B;color:#061222;font-weight:600;font-size:.8rem;border:none;border-radius:8px;cursor:pointer;transition:all .25s}
.btn:hover{background:#D4B96A}.btn-sm{padding:.4rem .75rem;font-size:.7rem}.btn-danger{background:#DC2626;color:#fff}.btn-secondary{background:#E7E5E4;color:#1C1917}.btn-success{background:#16A34A;color:#fff}.btn-success:hover{background:#15803D}
.badge-approved{background:#eff6ff;color:#2563EB}.badge-declined{background:#fef2f2;color:#DC2626}.badge-available{background:#f0f7ef;color:#16A34A}.badge-sold{background:#fef2f2;color:#DC2626}
.toast{position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:#0F1729;color:#fff;padding:.75rem 1.5rem;border-radius:8px;font-size:.85rem;z-index:300;opacity:0;transition:opacity .3s;pointer-events:none}.toast.show{opacity:1}
.form-group{margin-bottom:.75rem}label{display:block;font-size:.8rem;font-weight:500;margin-bottom:.35rem}
input,select,textarea{width:100%;padding:.6rem .75rem;font-size:.9rem;border:1px solid #E7E5E4;border-radius:8px;background:#fff}
input:focus,select:focus,textarea:focus{outline:none;border-color:#C9A24B}
textarea{min-height:80px;resize:vertical}
.modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:200;align-items:center;justify-content:center}
.modal-overlay.open{display:flex}
.modal{background:#fff;border-radius:12px;padding:1.5rem;width:95%;max-width:500px;max-height:85vh;overflow-y:auto}
.modal h2{font-family:'Fraunces',serif;font-size:1.25rem;margin-bottom:1rem}
.media-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;margin-top:.75rem}
.media-thumb{position:relative;border-radius:6px;overflow:hidden;aspect-ratio:1;background:#f5f5f4}
.media-thumb img,.media-thumb video{width:100%;height:100%;object-fit:cover}
.media-thumb .remove{position:absolute;top:2px;right:2px;background:rgba(0,0,0,.6);color:#fff;border:none;border-radius:50%;width:20px;height:20px;cursor:pointer;font-size:10px;display:flex;align-items:center;justify-content:center}
.dash-bottom{display:flex;position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #E7E5E4;z-index:50;justify-content:space-around;padding:.25rem 0}
.dash-tab{display:flex;flex-direction:column;align-items:center;padding:.4rem;font-size:.6rem;color:#A8A29E;text-decoration:none;cursor:pointer}
.dash-tab.active{color:#C9A24B;font-weight:600}
.dash-tab svg{width:20px;height:20px;margin-bottom:2px}
@media(min-width:769px){
  .dash-layout{grid-template-columns:240px 1fr}
  .dash-sidebar{display:flex;flex-direction:column;background:#0F1729;color:rgba(255,255,255,.7);padding:1.25rem;position:sticky;top:0;height:100vh}
  .dash-main{padding:1.5rem;padding-bottom:1rem}
  .dash-bottom{display:none}
  .dash-stats{grid-template-columns:repeat(4,1fr)}
  .media-grid{grid-template-columns:repeat(4,1fr)}
}
</style></head><body>
<div class="dash-layout">
<aside class="dash-sidebar">
<a href="/" class="brand" style="display:flex;align-items:center;gap:.75rem;text-decoration:none;margin-bottom:1.5rem"><span style="width:36px;height:36px;background:#0F1729;display:flex;align-items:center;justify-content:center;line-height:0"><svg viewBox="0 0 40 40" width="36" height="36" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="6" fill="#0F1729"/><path d="M20 8L10 19h20z" fill="#C9A24B"/><rect x="14" y="21" width="12" height="11" rx="1" fill="#C9A24B"/><rect x="17.5" y="24" width="5" height="8" rx=".5" fill="#0F1729"/></svg></span><span style="font-weight:700;font-size:.9rem;color:#fff">EdgeSpark</span></a>
<nav style="flex:1">
<div class="dash-nav-item active" onclick="showView('overview')" style="display:flex;align-items:center;gap:.75rem;padding:.65rem .75rem;border-radius:8px;font-size:.8rem;color:rgba(255,255,255,.6);cursor:pointer;margin-bottom:2px">Overview</div>
<div class="dash-nav-item" onclick="showView('properties')" style="display:flex;align-items:center;gap:.75rem;padding:.65rem .75rem;border-radius:8px;font-size:.8rem;color:rgba(255,255,255,.6);cursor:pointer;margin-bottom:2px">Properties</div>
<div class="dash-nav-item" onclick="showView('deals')" style="display:flex;align-items:center;gap:.75rem;padding:.65rem .75rem;border-radius:8px;font-size:.8rem;color:rgba(255,255,255,.6);cursor:pointer;margin-bottom:2px">Deals</div>
<div class="dash-nav-item" onclick="showView('interests')" style="display:flex;align-items:center;gap:.75rem;padding:.65rem .75rem;border-radius:8px;font-size:.8rem;color:rgba(255,255,255,.6);cursor:pointer;margin-bottom:2px">Interests</div>
<div class="dash-nav-item" onclick="showView('investors')" style="display:flex;align-items:center;gap:.75rem;padding:.65rem .75rem;border-radius:8px;font-size:.8rem;color:rgba(255,255,255,.6);cursor:pointer;margin-bottom:2px">Investors</div>
<div class="dash-nav-item" onclick="showView('partners')" style="display:flex;align-items:center;gap:.75rem;padding:.65rem .75rem;border-radius:8px;font-size:.8rem;color:rgba(255,255,255,.6);cursor:pointer;margin-bottom:2px">Partners</div>
<div class="dash-nav-item" onclick="showView('inquiries')" style="display:flex;align-items:center;gap:.75rem;padding:.65rem .75rem;border-radius:8px;font-size:.8rem;color:rgba(255,255,255,.6);cursor:pointer;margin-bottom:2px">Inquiries</div>
<div style="height:1px;background:rgba(255,255,255,.08);margin:.75rem 0"></div>
<div class="dash-nav-item" onclick="signOut()" style="display:flex;align-items:center;gap:.75rem;padding:.65rem .75rem;border-radius:8px;font-size:.8rem;color:rgba(255,255,255,.6);cursor:pointer">Sign Out</div>
</nav>
</aside>

<main class="dash-main">
<div id="view-overview">
<h1 class="dash-title">Dashboard</h1>
<p class="dash-subtitle" style="margin-bottom:1.5rem">Welcome back, Admin</p>
<div class="dash-stats">
<div class="dash-stat"><div class="dash-stat-value" id="statProps">-</div><div class="dash-stat-label">Properties</div></div>
<div class="dash-stat"><div class="dash-stat-value" id="statDeals">-</div><div class="dash-stat-label">Deals</div></div>
<div class="dash-stat"><div class="dash-stat-value" id="statUsers">-</div><div class="dash-stat-label">Users</div></div>
<div class="dash-stat"><div class="dash-stat-value" id="statInq">-</div><div class="dash-stat-label">New Inquiries</div></div>
</div>
</div>

<div id="view-properties" style="display:none">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
<h1 class="dash-title">Properties</h1>
<button class="btn" onclick="openModal('propModal')">+ New</button>
</div>
<div id="propertyList"><p style="color:#A8A29E">Loading...</p></div>
</div>

<div id="view-property-detail" style="display:none">
<a onclick="showView('properties')" style="display:inline-flex;align-items:center;gap:.5rem;font-size:.8rem;color:#57534E;cursor:pointer;margin-bottom:1rem">← Back</a>
<div id="propertyDetailContent"></div>
</div>

<div id="view-deals" style="display:none">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
<h1 class="dash-title">Deals</h1>
<button class="btn" onclick="openModal('dealModal')">+ New</button>
</div>
<div id="adminDeals"><p style="color:#A8A29E">Loading...</p></div>
</div>

<div id="view-interests" style="display:none">
<h1 class="dash-title" style="margin-bottom:1.5rem">Investor Interests</h1>
<div id="interestList"><p style="color:#A8A29E">Loading...</p></div>
</div>

<div id="view-investors" style="display:none">
<h1 class="dash-title" style="margin-bottom:1.5rem">Investors</h1>
<div id="investorList"><p style="color:#A8A29E">Loading...</p></div>
</div>

<div id="view-partners" style="display:none">
<h1 class="dash-title" style="margin-bottom:1.5rem">Partner Applications</h1>
<div id="partnerList"><p style="color:#A8A29E">Loading...</p></div>
</div>

<div id="view-inquiries" style="display:none">
<h1 class="dash-title" style="margin-bottom:1.5rem">Inquiries</h1>
<div id="inquiryList"><p style="color:#A8A29E">Loading...</p></div>
</div>
</main>
</div>

<nav class="dash-bottom">
<div class="dash-tab active" onclick="showView('overview')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>Home</div>
<div class="dash-tab" onclick="showView('properties')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M5 21V7l7-4 7 4v14"/></svg>Props</div>
<div class="dash-tab" onclick="showView('deals')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>Deals</div>
<div class="dash-tab" onclick="showView('inquiries')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>Inbox</div>
<div class="dash-tab" onclick="signOut()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>Out</div>
</nav>

<div class="modal-overlay" id="propModal"><div class="modal">
<h2 id="propModalTitle">New Property</h2>
<form id="propForm">
<div class="form-group"><label>Title *</label><input type="text" id="propTitle" required placeholder="3-Bedroom Bungalow"></div>
<div class="form-group"><label>Address *</label><input type="text" id="propAddress" required placeholder="123 Main St"></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">
<div class="form-group"><label>City *</label><input type="text" id="propCity" required placeholder="Enugu"></div>
<div class="form-group"><label>State *</label><input type="text" id="propState" required placeholder="Enugu"></div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">
<div class="form-group"><label>Bedrooms</label><input type="number" id="propBeds" placeholder="3"></div>
<div class="form-group"><label>Bathrooms</label><input type="number" id="propBaths" placeholder="2"></div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">
<div class="form-group"><label>Plot Size (sqm)</label><input type="number" id="propPlot" placeholder="450"></div>
<div class="form-group"><label>Type</label><select id="propType"><option value="bungalow">Bungalow</option><option value="duplex">Duplex</option><option value="apartment">Apartment</option><option value="land">Land</option><option value="commercial">Commercial</option></select></div>
</div>
<div class="form-group"><label>Price (NGN) *</label><input type="number" id="propPrice" required placeholder="15000000"></div>
<div class="form-group"><label>Description</label><textarea id="propDesc" placeholder="Property description..."></textarea></div>
<div class="form-group"><label>Image URL</label><input type="url" id="propImage" placeholder="https://example.com/photo.jpg"></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">
<div class="form-group"><label>Latitude</label><input type="number" step="any" id="propLat" placeholder="6.4413"></div>
<div class="form-group"><label>Longitude</label><input type="number" step="any" id="propLng" placeholder="7.4988"></div>
</div>
<div style="display:flex;gap:.75rem;justify-content:flex-end;margin-top:1rem">
<button type="button" class="btn btn-secondary" onclick="closeModal('propModal')">Cancel</button>
<button type="submit" class="btn">Create Property</button>
</div>
</form>
</div></div>

<div class="modal-overlay" id="dealModal"><div class="modal">
<h2>New Deal</h2>
<form id="dealForm">
<div class="form-group"><label>Title *</label><input type="text" id="dealTitle" required placeholder="Trans Ekulu Deal"></div>
<div class="form-group"><label>Property</label><select id="dealProperty"><option value="">Select...</option></select></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">
<div class="form-group"><label>Purchase (NGN) *</label><input type="number" id="dealPurchase" required></div>
<div class="form-group"><label>Renovation (NGN) *</label><input type="number" id="dealRenovation" required></div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem">
<div class="form-group"><label>Legal Fees (NGN)</label><input type="number" id="dealLegal" value="0"></div>
<div class="form-group"><label>Resale (NGN) *</label><input type="number" id="dealResale" required></div>
</div>
<div class="form-group"><label>Description</label><textarea id="dealDesc" placeholder="Deal description..."></textarea></div>
<div style="display:flex;gap:.75rem;justify-content:flex-end;margin-top:1rem">
<button type="button" class="btn btn-secondary" onclick="closeModal('dealModal')">Cancel</button>
<button type="submit" class="btn">Create Deal</button>
</div>
</form>
</div></div>

<div class="modal-overlay" id="replyModal"><div class="modal">
<h2>Reply</h2>
<div id="replyToInfo" style="background:#FAFAF9;padding:.75rem;border-radius:8px;margin-bottom:1rem;font-size:.8rem"></div>
<form id="replyForm">
<div class="form-group"><label>Subject</label><input type="text" id="replySubject" required></div>
<div class="form-group"><label>Message</label><textarea id="replyBody" required placeholder="Type your reply..."></textarea></div>
<input type="hidden" id="replyToEmail"><input type="hidden" id="replyRelatedType"><input type="hidden" id="replyRelatedId">
<div style="display:flex;gap:.75rem;justify-content:flex-end;margin-top:1rem">
<button type="button" class="btn btn-secondary" onclick="closeModal('replyModal')">Cancel</button>
<button type="submit" class="btn">Send Reply</button>
</div>
</form>
</div></div>

<script>
const token=localStorage.getItem('edge_token');
const user=JSON.parse(localStorage.getItem('edge_user')||'{}');
if(!token||user.role!=='admin')window.location.href='/api/public/page/login';

function showView(v){
  ['overview','properties','property-detail','deals','interests','investors','partners','inquiries'].forEach(x=>{
    const el=document.getElementById('view-'+x);
    if(el)el.style.display=x===v?'block':'none';
  });
  document.querySelectorAll('.dash-nav-item').forEach(el=>{
    const t=el.textContent.trim().toLowerCase();
    el.classList.toggle('active',t.includes(v.slice(0,4)));
  });
  document.querySelectorAll('.dash-tab').forEach(el=>{
    const t=el.textContent.trim().toLowerCase();
    el.classList.toggle('active',t.includes(v.slice(0,4)));
  });
  if(v==='overview')loadOverview();
  if(v==='properties')loadProperties();
  if(v==='deals')loadAdminDeals();
  if(v==='interests')loadInterests();
  if(v==='investors')loadInvestors();
  if(v==='partners')loadPartners();
  if(v==='inquiries')loadInquiries();
}
function signOut(){localStorage.removeItem('edge_token');localStorage.removeItem('edge_user');window.location.href='/api/public/page/login';}
function formatNgn(n){return new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(n);}
function formatDate(d){return new Date(d).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'});}
function showToast(msg){const t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3000);}
function openModal(id){document.getElementById(id).classList.add('open');}
function closeModal(id){document.getElementById(id).classList.remove('open');}

async function loadOverview(){
  try{
    const r=await fetch('/api/public/admin/dashboard',{headers:{Authorization:'Bearer '+token}});
    const d=await r.json();
    if(d.ok){
      document.getElementById('statProps').textContent=d.stats.properties.total;
      document.getElementById('statDeals').textContent=d.stats.deals.total;
      document.getElementById('statUsers').textContent=d.stats.users.total;
      document.getElementById('statInq').textContent=d.stats.contacts.new;
    }
  }catch(e){console.error('loadOverview error:',e);}
}

async function loadProperties(){
  try{
    const r=await fetch('/api/public/properties?limit=50',{headers:{Authorization:'Bearer '+token}});
    const d=await r.json();
    const el=document.getElementById('propertyList');
    if(!d.ok||d.items.length===0){el.innerHTML='<p style="color:#A8A29E">No properties yet.</p>';return;}
    el.innerHTML='<table class="data-table"><thead><tr><th>Title</th><th>Location</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead><tbody>'+
    d.items.map(p=>'<tr><td><strong>'+p.title+'</strong></td><td>'+(p.city||'')+', '+(p.state||'')+'</td><td>'+formatNgn(p.price_ngn)+'</td><td><span class="badge badge-'+(p.status==='available'?'active':'pending')+'">'+p.status+'</span></td><td style="white-space:nowrap"><button class="btn btn-sm" onclick="viewPropertyMedia(\''+p.id+'\',\''+p.title.replace(/'/g,"\'")+'\')">Media</button> <button class="btn btn-sm btn-secondary" onclick="editProperty(\''+p.id+'\')">Edit</button> <button class="btn btn-sm btn-danger" onclick="deleteProperty(\''+p.id+'\',\''+p.title.replace(/'/g,"\'")+'\')">Del</button> <button class="btn btn-sm" onclick="toggleStatus(\''+p.id+'\',\''+p.status+'\'\)">'+(p.status==='available'?'Sold':'Avail')+'</button></td></tr>').join('')+'</tbody></table>';
    const sel=document.getElementById('dealProperty');
    sel.innerHTML='<option value="">Select...</option>'+d.items.map(p=>'<option value="'+p.id+'">'+p.title+'</option>').join('');
  }catch(e){console.error('loadProperties error:',e);}
}

async function viewPropertyMedia(propId,propTitle){
  showView('property-detail');
  const el=document.getElementById('propertyDetailContent');
  el.innerHTML='<h1 class="dash-title" style="margin-bottom:.5rem">'+propTitle+'</h1><p class="dash-subtitle" style="margin-bottom:1rem">Upload files or paste URLs to add property media</p>'+
    '<div id="uploadArea" style="border:2px dashed #D6D3D1;border-radius:12px;padding:2rem;text-align:center;margin-bottom:1rem;cursor:pointer;transition:border-color .2s,background .2s" onclick="document.getElementById(\\\'fileInput\\\').click()" ondragover="event.preventDefault();this.style.borderColor=\\\'#C9A24B\\\';this.style.background=\\\'rgba(201,162,75,.05)\\\'" ondragleave="this.style.borderColor=\\\'#D6D3D1\\\';this.style.background=\\\'transparent\\\'" ondrop="handleFileDrop(event,\\\''+propId+'\\\')">'+
    '<input type="file" id="fileInput" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm" multiple style="display:none" onchange="handleFileSelect(this.files,\\\''+propId+'\\\')">'+
    '<p style="font-size:.95rem;color:#57534E;margin:0">Drag & drop images or videos here, or <span style="color:#C9A24B;font-weight:600">click to browse</span></p>'+
    '<p style="font-size:.75rem;color:#A8A29E;margin:.5rem 0 0">Images: JPEG, PNG, WebP, GIF (max 10MB) &bull; Videos: MP4, MOV, WebM (max 100MB)</p></div>'+
    '<div id="uploadProgress" style="display:none;margin-bottom:1rem"></div>'+
    '<div style="display:flex;gap:.5rem;margin-bottom:1rem"><input type="text" id="mediaUrl" placeholder="Or paste image/video URL..." style="flex:1;padding:.5rem;border:1px solid #E7E5E4;border-radius:8px"><select id="mediaType" style="width:80px;padding:.5rem;border:1px solid #E7E5E4;border-radius:8px"><option value="image">Image</option><option value="video">Video</option></select><button class="btn" onclick="addMediaUrl(\\\''+propId+'\\\')">Add URL</button></div>'+
    '<div class="media-grid" id="mediaGrid"><p style="color:#A8A29E;grid-column:1/-1">Loading media...</p></div>';
  loadPropertyMedia(propId);
}

async function loadPropertyMedia(propId){
  try{
    const r=await fetch('/api/public/properties/'+propId+'/media');
    const d=await r.json();
    const grid=document.getElementById('mediaGrid');
    if(!d.ok||d.items.length===0){grid.innerHTML='<p style="color:#A8A29E;grid-column:1/-1">No media yet. Upload files or paste a URL above.</p>';return;}
    grid.innerHTML=d.items.map(m=>'<div class="media-thumb">'+
      (m.mediaType==='video'?'<video src="'+m.s3Uri+'" style="width:100%;height:100%;object-fit:cover"></video>':'<img src="'+m.s3Uri+'" alt="'+(m.caption||'')+'">')+
      '<button class="remove" onclick="deleteMedia(\\\''+propId+'\\\',\\\''+m.id+'\\\')">&times;</button></div>').join('');
  }catch{}
}

function handleFileDrop(e,propId){
  e.preventDefault();
  e.currentTarget.style.borderColor='#D6D3D1';
  e.currentTarget.style.background='transparent';
  if(e.dataTransfer.files.length)handleFileSelect(e.dataTransfer.files,propId);
}

async function handleFileSelect(files,propId){
  const prog=document.getElementById('uploadProgress');
  prog.style.display='block';
  prog.innerHTML='';
  for(let i=0;i<files.length;i++){
    const f=files[i];
    const row=document.createElement('div');
    row.style.cssText='display:flex;align-items:center;gap:.5rem;padding:.5rem;background:#FAFAF9;border-radius:8px;margin-bottom:.25rem';
    row.innerHTML='<span style="flex:1;font-size:.85rem;color:#44403C;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+f.name+'</span><span style="font-size:.75rem;color:#A8A29E" id="status'+i+'">Uploading...</span>';
    prog.appendChild(row);
    try{
      const fd=new FormData();
      fd.append('file',f);
      const r=await fetch('/api/public/properties/'+propId+'/media/upload',{method:'POST',headers:{Authorization:'Bearer '+token},body:fd});
      const d=await r.json();
      document.getElementById('status'+i).textContent=d.ok?'Done':'Error: '+(d.error||'failed');
      document.getElementById('status'+i).style.color=d.ok?'#16A34A':'#DC2626';
    }catch{
      document.getElementById('status'+i).textContent='Upload failed';
      document.getElementById('status'+i).style.color='#DC2626';
    }
  }
  loadPropertyMedia(propId);
  document.getElementById('fileInput').value='';
}

async function addMediaUrl(propId){
  const url=document.getElementById('mediaUrl').value.trim();
  const mediaType=document.getElementById('mediaType').value;
  if(!url){alert('Paste a URL first.');return;}
  try{
    await fetch('/api/public/properties/'+propId+'/media',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({url,mediaType,fileName:url.split('/').pop(),mimeType:mediaType==='image'?'image/jpeg':'video/mp4'})});
    document.getElementById('mediaUrl').value='';
    loadPropertyMedia(propId);
  }catch{alert('Failed to add media.');}
}

async function deleteMedia(propId,mediaId){
  if(!confirm('Delete this media?'))return;
  await fetch('/api/public/properties/'+propId+'/media/'+mediaId,{method:'DELETE',headers:{Authorization:'Bearer '+token}});
  loadPropertyMedia(propId);
}

async function editProperty(id){
  try{
    const r=await fetch('/api/public/properties');
    const d=await r.json();
    const p=d.items.find(x=>x.id===id);
    if(!p)return;
    document.getElementById('propTitle').value=p.title||'';
    document.getElementById('propAddress').value=p.address||'';
    document.getElementById('propCity').value=p.city||'';
    document.getElementById('propState').value=p.state||'';
    document.getElementById('propBeds').value=p.bedrooms||'';
    document.getElementById('propBaths').value=p.bathrooms||'';
    document.getElementById('propPlot').value=p.plot_size_sqm||'';
    document.getElementById('propType').value=p.property_type||'bungalow';
    document.getElementById('propPrice').value=p.price_ngn||'';
    document.getElementById('propDesc').value=p.description||'';
    document.getElementById('propImage').value=p.hero_image||'';
    document.getElementById('propLat').value=p.latitude||'';
    document.getElementById('propLng').value=p.longitude||'';
    document.getElementById('propForm').dataset.editId=id;
    document.getElementById('propForm').querySelector('button[type=submit]').textContent='Update Property';
    document.getElementById('propModalTitle').textContent='Edit Property';
    openModal('propModal');
  }catch{alert('Error loading property.');}
}

async function deleteProperty(id,title){
  if(!confirm('Delete "'+title+'"? This cannot be undone.'))return;
  try{await fetch('/api/public/properties/'+id,{method:'DELETE',headers:{Authorization:'Bearer '+token}});loadProperties();}catch{alert('Error.');}
}

async function toggleStatus(id,currentStatus){
  const newStatus=currentStatus==='available'?'sold':'available';
  try{await fetch('/api/public/properties/'+id,{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({status:newStatus})});loadProperties();}catch{alert('Error.');}
}

async function loadAdminDeals(){
  try{
    const r=await fetch('/api/public/deals',{headers:{Authorization:'Bearer '+token}});
    const d=await r.json();
    const el=document.getElementById('adminDeals');
    if(!d.ok||d.items.length===0){el.innerHTML='<p style="color:#A8A29E">No deals yet.</p>';return;}
    el.innerHTML='<table class="data-table"><thead><tr><th>Title</th><th>Status</th><th>Investment</th><th>Resale</th><th>Return</th></tr></thead><tbody>'+
    d.items.map(deal=>'<tr><td><strong>'+deal.title+'</strong></td><td><span class="badge badge-active">'+deal.status+'</span></td><td>'+formatNgn(deal.total_investment_ngn)+'</td><td>'+formatNgn(deal.projected_resale_ngn)+'</td><td>'+(deal.return_percentage?deal.return_percentage+'%':'-')+'</td></tr>').join('')+'</tbody></table>';
  }catch{}
}

async function loadInvestors(){
  try{
    const r=await fetch('/api/public/admin/users?role=investor',{headers:{Authorization:'Bearer '+token}});
    const d=await r.json();
    const el=document.getElementById('investorList');
    if(!d.ok||d.items.length===0){el.innerHTML='<p style="color:#A8A29E">No investors yet.</p>';return;}
    el.innerHTML='<table class="data-table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th></tr></thead><tbody>'+
    d.items.map(u=>'<tr><td><strong>'+u.name+'</strong></td><td>'+u.email+'</td><td>'+(u.phone||'-')+'</td><td>'+new Date(u.created_at).toLocaleDateString()+'</td></tr>').join('')+'</tbody></table>';
  }catch{}
}

async function loadInterests(){
  try{
    const r=await fetch('/api/public/admin/interests',{headers:{Authorization:'Bearer '+token}});
    const d=await r.json();
    const el=document.getElementById('interestList');
    if(!d.ok||!d.items||d.items.length===0){el.innerHTML='<p style="color:#A8A29E">No investor interests yet.</p>';return;}
    el.innerHTML='<table class="data-table"><thead><tr><th>Investor</th><th>Deal</th><th>Range</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead><tbody>'+
    d.items.map(i=>'<tr><td><strong>'+(i.userName||i.user_name||'Unknown')+'</strong><br><span style="font-size:.65rem;color:#A8A29E">'+(i.userEmail||i.user_email||'')+'</span></td><td>'+(i.dealTitle||i.deal_title||'N/A')+'</td><td>'+(i.investmentRange||i.investment_range||'-')+'</td><td><span class="badge badge-'+(i.status||'pending')+'">'+(i.status||'pending')+'</span></td><td>'+formatDate(i.createdAt||i.created_at)+'</td><td style="white-space:nowrap">'+(i.status==='pending'?'<button class="btn btn-sm btn-success" onclick="updateInterest(\''+i.id+'\',\'approved\')">Approve</button> <button class="btn btn-sm btn-danger" onclick="updateInterest(\''+i.id+'\',\'declined\')">Decline</button>':'<button class="btn btn-sm btn-secondary" onclick="updateInterest(\''+i.id+'\',\'pending\')">Reset</button>')+'</td></tr>').join('')+'</tbody></table>';
  }catch(e){console.error('loadInterests error:',e);}
}
async function updateInterest(id,status){
  try{await fetch('/api/public/admin/interests/'+id,{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({status})});showToast('Interest '+status);loadInterests();}catch{showToast('Error updating interest');}
}

async function loadPartners(){
  try{
    const r=await fetch('/api/public/admin/partners',{headers:{Authorization:'Bearer '+token}});
    const d=await r.json();
    const el=document.getElementById('partnerList');
    if(!d.ok||d.items.length===0){el.innerHTML='<p style="color:#A8A29E">No applications yet.</p>';return;}
    el.innerHTML='<table class="data-table"><thead><tr><th>Name</th><th>Email</th><th>Range</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead><tbody>'+
    d.items.map(p=>'<tr><td><strong>'+(p.fullName||p.full_name)+'</strong></td><td>'+p.email+'</td><td>'+(p.investmentRange||p.investment_range||'-')+'</td><td><span class="badge badge-'+(p.status||'pending')+'">'+(p.status||'pending')+'</span></td><td>'+formatDate(p.createdAt||p.created_at)+'</td><td style="white-space:nowrap">'+(p.status==='pending'?'<button class="btn btn-sm btn-success" onclick="updatePartner(\''+p.id+'\',\'approved\')">Approve</button> <button class="btn btn-sm btn-danger" onclick="updatePartner(\''+p.id+'\',\'declined\')">Decline</button>':'<button class="btn btn-sm btn-secondary" onclick="updatePartner(\''+p.id+'\',\'pending\')">Reset</button>')+' <button class="btn btn-sm" onclick="openReply(\''+p.email+'\',\'partner\',\''+p.id+'\',\''+(p.fullName||p.full_name)+'\')">Reply</button></td></tr>').join('')+'</tbody></table>';
  }catch{}
}
async function updatePartner(id,status){
  try{await fetch('/api/public/admin/partners/'+id,{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({status})});showToast('Partner '+status);loadPartners();}catch{showToast('Error updating partner');}
}

async function loadInquiries(){
  try{
    const r=await fetch('/api/public/contacts',{headers:{Authorization:'Bearer '+token}});
    const d=await r.json();
    const el=document.getElementById('inquiryList');
    if(!d.ok||d.items.length===0){el.innerHTML='<p style="color:#A8A29E">No inquiries yet.</p>';return;}
    el.innerHTML='<table class="data-table"><thead><tr><th>Name</th><th>Email</th><th>Message</th><th>Date</th><th>Action</th></tr></thead><tbody>'+
    d.items.map(c=>'<tr><td><strong>'+c.name+'</strong></td><td>'+c.email+'</td><td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(c.message||'-')+'</td><td>'+new Date(c.created_at).toLocaleDateString()+'</td><td><button class="btn btn-sm" onclick="openReply(\''+c.email+'\',\'contact\',\''+c.id+'\',\''+c.name+'\')">Reply</button></td></tr>').join('')+'</tbody></table>';
  }catch{}
}

function openReply(email,relatedType,relatedId,name){
  document.getElementById('replyToEmail').value=email;
  document.getElementById('replyRelatedType').value=relatedType;
  document.getElementById('replyRelatedId').value=relatedId;
  document.getElementById('replyToInfo').innerHTML='<strong>To:</strong> '+name+' ('+email+')';
  document.getElementById('replySubject').value='Re: EdgeSpark Inquiry';
  openModal('replyModal');
}

document.getElementById('propForm')?.addEventListener('submit',async e=>{
  e.preventDefault();
  try{
    const form=document.getElementById('propForm');
    const editId=form.dataset.editId;
    const method=editId?'PATCH':'POST';
    const url=editId?'/api/public/properties/'+editId:'/api/public/properties';
    const r=await fetch(url,{method,headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({
      title:document.getElementById('propTitle').value,address:document.getElementById('propAddress').value,
      city:document.getElementById('propCity').value,state:document.getElementById('propState').value,
      bedrooms:parseInt(document.getElementById('propBeds').value)||null,
      bathrooms:parseInt(document.getElementById('propBaths').value)||null,
      plot_size_sqm:parseInt(document.getElementById('propPlot').value)||null,
      property_type:document.getElementById('propType').value,
      price_ngn:parseInt(document.getElementById('propPrice').value),
      description:document.getElementById('propDesc').value,
      hero_image:document.getElementById('propImage').value||null,
      latitude:parseFloat(document.getElementById('propLat').value)||null,
      longitude:parseFloat(document.getElementById('propLng').value)||null
    })});
    if(r.ok){closeModal('propModal');form.reset();delete form.dataset.editId;form.querySelector('button[type=submit]').textContent='Create Property';document.getElementById('propModalTitle').textContent='New Property';loadProperties();}
    else{const d=await r.json();alert(d.error||'Failed.');}
  }catch{alert('Network error.');}
});

document.getElementById('dealForm')?.addEventListener('submit',async e=>{
  e.preventDefault();
  try{
    const p=parseInt(document.getElementById('dealPurchase').value)||0;
    const r2=parseInt(document.getElementById('dealRenovation').value)||0;
    const l=parseInt(document.getElementById('dealLegal').value)||0;
    const rs=parseInt(document.getElementById('dealResale').value)||0;
    const t=p+r2+l;const profit=rs-t;const rp=((profit/t)*100).toFixed(1);
    const r=await fetch('/api/public/deals',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({
      title:document.getElementById('dealTitle').value,property_id:document.getElementById('dealProperty').value||undefined,
      purchase_price_ngn:p,renovation_costs_ngn:r2,legal_fees_ngn:l,
      total_investment_ngn:t,projected_resale_ngn:rs,gross_profit_ngn:profit,return_percentage:parseFloat(rp),
      description:document.getElementById('dealDesc').value
    })});
    if(r.ok){closeModal('dealModal');document.getElementById('dealForm').reset();loadAdminDeals();}
    else{const d=await r.json();alert(d.error||'Failed.');}
  }catch{alert('Network error.');}
});

document.getElementById('replyForm')?.addEventListener('submit',async e=>{
  e.preventDefault();
  try{
    await fetch('/api/public/admin/email/send',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({
      toEmail:document.getElementById('replyToEmail').value,subject:document.getElementById('replySubject').value,
      body:document.getElementById('replyBody').value,relatedType:document.getElementById('replyRelatedType').value,
      relatedId:document.getElementById('replyRelatedId').value
    })});
    closeModal('replyModal');alert('Reply sent!');document.getElementById('replyForm').reset();
  }catch{alert('Failed to send.');}
});

loadOverview();
</script>
</body></html>
`);


// ============================================

// ============================================
// PROPERTIES LISTING PAGE
// ============================================
reg("properties", `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Browse Properties — EdgeSpark</title><link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;color:#1C1917;background:#FAFAF9}
:root{--gold:#C9A24B;--navy:#0F1729;--bg:#FAFAF9;--surface:#FFF;--fg:#1C1917;--fg2:#57534E;--muted:#A8A29E;--border:#E7E5E4;--serif:'Fraunces',Georgia,serif;--sans:'Plus Jakarta Sans',system-ui,sans-serif}
a{text-decoration:none;color:inherit}
.container{max-width:1200px;margin:0 auto;padding:0 1.5rem}
.nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:1rem 0;background:rgba(250,249,247,.95);backdrop-filter:blur(20px);border-bottom:1px solid var(--border)}
.nav.scrolled{padding:.75rem 0;box-shadow:0 1px 20px rgba(0,0,0,.06)}
.nav-inner{display:flex;align-items:center;justify-content:space-between;max-width:1200px;margin:0 auto;padding:0 1.5rem}
.brand{display:flex;align-items:center;gap:.75rem;text-decoration:none}
.brand-mark{width:40px;height:40px;background:var(--navy);display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:1.1rem;color:var(--gold);font-weight:700}
.brand-name{font-weight:700;font-size:.95rem;color:var(--fg)}
.nav-links{display:flex;align-items:center;gap:1.5rem}
.nav-links a{font-size:.875rem;font-weight:500;color:var(--fg2);transition:color .2s}
.nav-links a:hover{color:var(--fg)}
.nav-cta{background:var(--navy)!important;color:#fff!important;padding:.6rem 1.4rem;font-weight:600;border-radius:8px}
.burger{display:none;background:none;border:none;cursor:pointer;padding:4px}
.burger span{display:block;width:22px;height:2px;background:var(--fg);margin:5px 0;transition:all .2s}
.page-header{padding:8rem 0 3rem;background:linear-gradient(135deg,#061222 0%,#0f2847 50%,#162d4a 100%);color:#fff}
.page-header h1{font-family:var(--serif);font-size:clamp(2rem,4vw,3rem);margin-bottom:.75rem}
.page-header p{color:rgba(255,255,255,.6);font-size:1.125rem;max-width:600px}
.filters{display:flex;gap:1rem;padding:1.5rem 0;border-bottom:1px solid var(--border);margin-bottom:2rem;flex-wrap:wrap}
.filter-group{display:flex;align-items:center;gap:.5rem}
.filter-group label{font-size:.875rem;font-weight:500;color:var(--fg2)}
.filter-group select{padding:.5rem 1rem;font-size:.875rem;border:1px solid var(--border);border-radius:8px;background:var(--surface);cursor:pointer}
.property-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:1.5rem;padding-bottom:4rem}
.property-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;transition:all .2s;cursor:pointer}
.property-card:hover{box-shadow:0 8px 24px rgba(0,0,0,.08);transform:translateY(-2px)}
.property-card.sold{opacity:.85}
.property-card.sold:hover{box-shadow:none;transform:none}
.property-image{height:220px;background:linear-gradient(135deg,#1a2a40,#0f1e30);position:relative;display:flex;align-items:center;justify-content:center}
.property-image img{width:100%;height:100%;object-fit:cover}
.property-image svg{stroke:rgba(255,255,255,.2)}
.badge{position:absolute;top:1rem;left:1rem;padding:.35rem .75rem;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;border-radius:4px}
.badge-available{background:var(--gold);color:#fff}
.badge-sold{background:#9CA3AF;color:#fff}
.property-body{padding:1.5rem}
.property-title{font-family:var(--serif);font-size:1.25rem;color:var(--fg);margin-bottom:.5rem}
.property-location{display:flex;align-items:center;gap:.4rem;font-size:.875rem;color:var(--muted);margin-bottom:1rem}
.property-specs{display:flex;gap:1rem;font-size:.8rem;color:var(--fg2);margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid var(--border)}
.property-price{font-family:var(--serif);font-size:1.5rem;color:var(--fg);font-variant-numeric:tabular-nums}
.property-price small{font-family:var(--sans);font-size:.8rem;color:var(--muted);font-weight:400;margin-left:.5rem}
.property-price.struck{text-decoration:line-through;color:var(--muted);font-size:1rem}
.sale-price{font-size:.875rem;color:#16A34A;font-weight:600;margin-top:.25rem}
.property-link{display:inline-flex;align-items:center;gap:.5rem;font-size:.875rem;font-weight:600;color:var(--gold);margin-top:1rem;transition:gap .2s}
.property-card:hover .property-link{gap:.75rem}
.results-count{font-size:.875rem;color:var(--muted);margin-bottom:1.5rem}
.empty-state{text-align:center;padding:4rem 0;color:var(--muted)}
.empty-state h3{font-family:var(--serif);font-size:1.5rem;color:var(--fg);margin-bottom:.5rem}
.back-link{display:inline-flex;align-items:center;gap:.5rem;font-size:.875rem;color:var(--fg2);margin-bottom:1.5rem}
.back-link:hover{color:var(--gold)}
@media(max-width:768px){
  .nav-links{display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:var(--navy);flex-direction:column;justify-content:center;gap:2.5rem;z-index:99}
  .nav-links.open{display:flex}
  .nav-links a{font-size:1.25rem;color:rgba(255,255,255,.8)}
  .nav-cta{background:var(--gold)!important;color:var(--navy)!important}
  .burger{display:block;z-index:101}
  .property-grid{grid-template-columns:1fr}
  .page-header{padding:6rem 0 2rem}
  .filters{flex-direction:column}
}
</style>
</head>
<body>
<header class="nav" id="nav">
  <div class="nav-inner">
    <a href="/" class="brand"><span class="brand-mark"><svg viewBox="0 0 40 40" width="40" height="40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="6" fill="#0F1729"/><path d="M20 8L10 19h20z" fill="#C9A24B"/><rect x="14" y="21" width="12" height="11" rx="1" fill="#C9A24B"/><rect x="17.5" y="24" width="5" height="8" rx=".5" fill="#0F1729"/></svg></span><span class="brand-text"><span class="brand-name">EdgeSpark</span></span></a>
    <nav class="nav-links" id="navLinks">
      <a href="/#opportunity">Opportunity</a>
      <a href="/api/public/page/properties">Properties</a>
      <a href="/#learn">Learn</a>
      <a href="/api/public/page/calculator">Calculator</a>
      <a href="/api/public/page/partner">Partner</a>
      <a href="/api/public/page/login" class="nav-cta">Login</a>
    </nav>
    <button class="burger" id="burger" aria-label="Toggle menu"><span></span><span></span><span></span></button>
  </div>
</header>

<main>
<section class="page-header">
  <div class="container">
    <h1>Browse Our Properties</h1>
    <p>Every property below is title-verified, physically inspected, and backed by a complete Deal Analyzer.</p>
  </div>
</section>

<section class="container" style="padding-top:2rem">
  <div class="filters">
    <div class="filter-group">
      <label for="filterStatus">Status</label>
      <select id="filterStatus" onchange="loadProperties()">
        <option value="">All</option>
        <option value="available" selected>Available</option>
        <option value="sold">Sold</option>
      </select>
    </div>
    <div class="filter-group">
      <label for="filterCity">Location</label>
      <select id="filterCity" onchange="loadProperties()">
        <option value="">All Locations</option>
      </select>
    </div>
    <div class="filter-group">
      <label for="sortBy">Sort</label>
      <select id="sortBy" onchange="loadProperties()">
        <option value="newest">Newest First</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
      </select>
    </div>
  </div>
  <div class="results-count" id="resultsCount"></div>
  <div class="property-grid" id="propertyGrid">
    <p style="color:#A8A29E;text-align:center;grid-column:1/-1;padding:4rem 0">Loading properties...</p>
  </div>
</section>
</main>

<footer style="background:var(--navy);color:rgba(255,255,255,.5);padding:3rem 0;text-align:center;font-size:.875rem">
  <div class="container">
    <p>&copy; 2026 Evarestus Company Ltd. All rights reserved. · EdgeSpark</p>
  </div>
</footer>

<script>
const nav=document.getElementById('nav');
window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',window.scrollY>40));
document.getElementById('burger')?.addEventListener('click',()=>document.getElementById('navLinks').classList.toggle('open'));

function formatNgn(n){return new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(n);}

async function loadProperties(){
  try{
    const status=document.getElementById('filterStatus').value;
    const city=document.getElementById('filterCity').value;
    const sort=document.getElementById('sortBy').value;
    
    let url='/api/public/properties?limit=50';
    if(status)url+='&status='+status;
    
    const r=await fetch(url);
    const d=await r.json();
    const grid=document.getElementById('propertyGrid');
    
    if(!d.ok||d.items.length===0){
      grid.innerHTML='<div class="empty-state" style="grid-column:1/-1"><h3>No properties found</h3><p>Check back soon for new listings.</p></div>';
      document.getElementById('resultsCount').textContent='Showing 0 properties';
      return;
    }
    
    let items=d.items;
    
    // Filter by city
    if(city)items=items.filter(p=>p.city===city);
    
    // Sort
    if(sort==='price-low')items.sort((a,b)=>a.price_ngn-b.price_ngn);
    else if(sort==='price-high')items.sort((a,b)=>b.price_ngn-a.price_ngn);
    else items.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
    
    // Populate city filter options
    const cities=[...new Set(d.items.map(p=>p.city).filter(Boolean))];
    const citySel=document.getElementById('filterCity');
    const currentCity=citySel.value;
    citySel.innerHTML='<option value="">All Locations</option>'+cities.map(c=>'<option value="'+c+'"'+(c===currentCity?' selected':'')+'>'+c+'</option>').join('');
    
    document.getElementById('resultsCount').textContent='Showing '+items.length+' of '+d.total+' properties';
    
    grid.innerHTML=items.map(p=>{
      const isSold=p.status==='sold';
      const img=p.hero_image?'<img src="'+p.hero_image+'" alt="'+p.title+'">':'<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke-width="1.5"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg>';
      const priceHtml=isSold?
        '<div class="property-price struck">'+formatNgn(p.price_ngn)+'</div>'+(p.price_note?'<div class="sale-price">Sold for '+formatNgn(parseInt(p.price_note))+'</div>':'<div class="sale-price">Sold</div>'):
        '<div class="property-price">'+formatNgn(p.price_ngn)+' <small>≈ $'+Math.round(p.price_ngn/1363).toLocaleString()+' USD</small></div>';
      
      return '<div class="property-card'+(isSold?' sold':'')+'" onclick="window.location=\'/api/public/page/property/'+p.slug+'\'">'+
        '<div class="property-image">'+img+'<span class="badge '+(isSold?'badge-sold':'badge-available')+'">'+(isSold?'Sold':'Available')+'</span></div>'+
        '<div class="property-body">'+
          '<div class="property-title">'+p.title+'</div>'+
          '<div class="property-location"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'+p.city+', '+p.state+'</div>'+
          '<div class="property-specs">'+(p.bedrooms?'<span>'+p.bedrooms+' bed</span>':'')+(p.bathrooms?'<span>'+p.bathrooms+' bath</span>':'')+(p.plot_size_sqm?'<span>'+p.plot_size_sqm+' sqm</span>':'')+(p.property_type?'<span>'+p.property_type+'</span>':'')+'</div>'+
          priceHtml+
          '<div class="property-link">View Details →</div>'+
        '</div>'+
      '</div>';
    }).join('');
  }catch(e){
    document.getElementById('propertyGrid').innerHTML='<p style="color:#DC2626;text-align:center;grid-column:1/-1;padding:4rem 0">Error loading properties.</p>';
  }
}

loadProperties();
</script>
</body>
</html>
`);

// ============================================
// PROPERTY DETAIL PAGE (dynamic - slug extracted in JS)
// ============================================
reg("property", `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Property — EdgeSpark</title><link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;color:#1C1917;background:#FAFAF9}
:root{--gold:#C9A24B;--navy:#0F1729;--bg:#FAFAF9;--surface:#FFF;--fg:#1C1917;--fg2:#57534E;--muted:#A8A29E;--border:#E7E5E4;--serif:'Fraunces',Georgia,serif}
a{text-decoration:none;color:inherit}
.container{max-width:1200px;margin:0 auto;padding:0 1.5rem}
.nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:1rem 0;background:rgba(250,249,247,.95);backdrop-filter:blur(20px);border-bottom:1px solid var(--border)}
.nav-inner{display:flex;align-items:center;justify-content:space-between;max-width:1200px;margin:0 auto;padding:0 1.5rem}
.brand{display:flex;align-items:center;gap:.75rem;text-decoration:none}
.brand-mark{width:40px;height:40px;background:var(--navy);display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:1.1rem;color:var(--gold);font-weight:700}
.brand-name{font-weight:700;font-size:.95rem;color:var(--fg)}
.nav-links{display:flex;align-items:center;gap:1.5rem}
.nav-links a{font-size:.875rem;font-weight:500;color:var(--fg2)}
.nav-cta{background:var(--navy)!important;color:#fff!important;padding:.6rem 1.4rem;font-weight:600;border-radius:8px}
.burger{display:none;background:none;border:none;cursor:pointer;padding:4px}
.burger span{display:block;width:22px;height:2px;background:var(--fg);margin:5px 0}
.detail-main{padding:7rem 0 4rem}
.back-link{display:inline-flex;align-items:center;gap:.5rem;font-size:.875rem;color:var(--fg2);margin-bottom:2rem}
.back-link:hover{color:var(--gold)}
.badge{display:inline-block;padding:.35rem .75rem;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;border-radius:4px}
.badge-available{background:var(--gold);color:#fff}
.badge-sold{background:#9CA3AF;color:#fff}
.gallery{margin-bottom:2rem;border-radius:12px;overflow:hidden}
.gallery-main{width:100%;height:400px;background:linear-gradient(135deg,#1a2a40,#0f1e30);display:flex;align-items:center;justify-content:center;position:relative}
.gallery-main img{width:100%;height:100%;object-fit:cover}
.gallery-main svg{stroke:rgba(255,255,255,.2)}
.gallery-thumbs{display:flex;gap:.5rem;margin-top:.5rem;overflow-x:auto;padding-bottom:.5rem}
.gallery-thumb{width:80px;height:60px;border-radius:6px;overflow:hidden;cursor:pointer;border:2px solid transparent;flex-shrink:0}
.gallery-thumb.active{border-color:var(--gold)}
.gallery-thumb img{width:100%;height:100%;object-fit:cover}
.detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:2rem;align-items:start}
.detail-info{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:2rem}
.detail-info h1{font-family:var(--serif);font-size:1.75rem;margin-bottom:.5rem}
.detail-location{display:flex;align-items:center;gap:.4rem;font-size:.875rem;color:var(--muted);margin-bottom:1.5rem}
.detail-specs{display:grid;grid-template-columns:repeat(2,1fr);gap:1rem;padding:1.5rem 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border);margin-bottom:1.5rem}
.spec-item label{display:block;font-size:.7rem;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;margin-bottom:.25rem}
.spec-item span{font-size:1rem;font-weight:600;color:var(--fg)}
.detail-price{font-family:var(--serif);font-size:2rem;color:var(--fg);font-variant-numeric:tabular-nums;margin-bottom:1.5rem}
.detail-price small{font-family:var(--sans);font-size:.875rem;color:var(--muted);font-weight:400;margin-left:.5rem}
.detail-price.struck{text-decoration:line-through;color:var(--muted);font-size:1.25rem}
.sale-price{font-size:1rem;color:#16A34A;font-weight:600;margin-bottom:1.5rem}
.detail-desc{font-size:.9rem;color:var(--fg2);line-height:1.7;margin-bottom:1.5rem}
.protection-list{list-style:none;counter-reset:protection}
.protection-list li{counter-increment:protection;display:flex;gap:1rem;padding:.75rem 0;border-bottom:1px solid var(--border);font-size:.875rem;color:var(--fg2)}
.protection-list li:last-child{border-bottom:none}
.protection-list li::before{content:counter(protection);font-family:var(--serif);font-size:1rem;color:var(--gold);width:1.5rem;flex-shrink:0}
.deal-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:2rem;margin-bottom:2rem}
.deal-card h2{font-family:var(--serif);font-size:1.5rem;margin-bottom:1.5rem}
.deal-row{display:flex;justify-content:space-between;padding:.75rem 0;border-bottom:1px solid var(--border)}
.deal-row:last-child{border-bottom:none}
.deal-row.highlight{background:var(--bg);margin:0 -1rem;padding:.75rem 1rem;border-radius:6px}
.deal-row.profit{background:#f0f7ef;margin:0 -1rem;padding:.75rem 1rem;border-radius:6px}
.deal-row.profit span:last-child{color:#16A34A;font-weight:600}
.calc-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:2rem;margin-bottom:2rem}
.calc-card h2{font-family:var(--serif);font-size:1.5rem;margin-bottom:1.5rem}
.calc-group{margin-bottom:1rem}
.calc-group label{display:block;font-size:.875rem;font-weight:500;margin-bottom:.5rem}
.calc-group input,.calc-group select{width:100%;padding:.75rem 1rem;font-size:1rem;border:1px solid var(--border);border-radius:8px;background:var(--surface)}
.calc-group input:focus,.calc-group select:focus{outline:none;border-color:var(--gold);box-shadow:0 0 0 3px rgba(201,162,75,.15)}
.calc-results{background:var(--navy);color:#fff;border-radius:8px;padding:1.5rem;margin-top:1rem}
.calc-result-row{display:flex;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid rgba(255,255,255,.1)}
.calc-result-row:last-child{border-bottom:none}
.calc-result-label{color:rgba(255,255,255,.6);font-size:.875rem}
.calc-result-value{font-family:var(--serif);font-size:1.125rem;font-variant-numeric:tabular-nums}
.return-projection{background:rgba(201,162,75,.1);border-radius:8px;padding:1.5rem;margin-top:1rem;text-align:center}
.return-projection .big{font-family:var(--serif);font-size:2rem;color:var(--gold)}
.return-projection .label{font-size:.875rem;color:rgba(255,255,255,.6);margin-top:.25rem}
.cta-btn{display:block;width:100%;padding:1rem;background:var(--gold);color:#061222;font-weight:700;font-size:1rem;border:none;border-radius:8px;cursor:pointer;text-align:center;transition:all .2s;margin-top:1.5rem}
.cta-btn:hover{background:#D4B96A;transform:translateY(-1px)}
.contact-info{margin-top:1.5rem;padding:1rem;background:var(--bg);border-radius:8px;font-size:.875rem;color:var(--fg2)}
.contact-info a{color:var(--gold);font-weight:600}
.map-container{background:linear-gradient(135deg,#1a2a40,#0f1e30);height:300px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-top:2rem}
.map-placeholder{color:rgba(255,255,255,.3);text-align:center}
@media(max-width:768px){
  .detail-grid{grid-template-columns:1fr}
  .gallery-main{height:280px}
  .nav-links{display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:var(--navy);flex-direction:column;justify-content:center;gap:2.5rem;z-index:99}
  .nav-links.open{display:flex}
  .nav-links a{font-size:1.25rem;color:rgba(255,255,255,.8)}
  .burger{display:block;z-index:101}
}
</style>
</head>
<body>
<header class="nav">
  <div class="nav-inner">
    <a href="/" class="brand"><span class="brand-mark"><svg viewBox="0 0 40 40" width="40" height="40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="6" fill="#0F1729"/><path d="M20 8L10 19h20z" fill="#C9A24B"/><rect x="14" y="21" width="12" height="11" rx="1" fill="#C9A24B"/><rect x="17.5" y="24" width="5" height="8" rx=".5" fill="#0F1729"/></svg></span><span class="brand-text"><span class="brand-name">EdgeSpark</span></span></a>
    <nav class="nav-links" id="navLinks">
      <a href="/#opportunity">Opportunity</a>
      <a href="/api/public/page/properties">Properties</a>
      <a href="/#learn">Learn</a>
      <a href="/api/public/page/calculator">Calculator</a>
      <a href="/api/public/page/partner">Partner</a>
      <a href="/api/public/page/login" class="nav-cta">Login</a>
    </nav>
    <button class="burger" id="burger" aria-label="Toggle menu"><span></span><span></span><span></span></button>
  </div>
</header>

<main class="detail-main">
<div class="container">
  <a href="/api/public/page/properties" class="back-link">← Back to Properties</a>
  <div id="propertyContent"><p style="color:#A8A29E">Loading property...</p></div>
</div>
</main>

<script>
document.getElementById('burger')?.addEventListener('click',()=>document.getElementById('navLinks').classList.toggle('open'));
function formatNgn(n){return new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(n);}

const slug=window.location.pathname.split('/').pop();
async function loadProperty(){
  try{
    const r=await fetch('/api/public/properties/'+slug);
    const d=await r.json();
    if(!d.ok){document.getElementById('propertyContent').innerHTML='<p style="color:#DC2626">Property not found.</p>';return;}
    const p=d.property;
    const isSold=p.status==='sold';
    const img=p.hero_image?'<img src="'+p.hero_image+'" alt="'+p.title+'">':'<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke-width="1.5"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg>';
    const priceHtml=isSold?
      '<div class="detail-price struck">'+formatNgn(p.price_ngn)+'</div>'+(p.price_note?'<div class="sale-price">Sold for '+formatNgn(parseInt(p.price_note))+'</div>':'<div class="sale-price">Sold</div>'):
      '<div class="detail-price">'+formatNgn(p.price_ngn)+' <small>≈ $'+Math.round(p.price_ngn/1363).toLocaleString()+' USD</small></div>';

    document.getElementById('propertyContent').innerHTML=
      '<div class="gallery"><div class="gallery-main" id="galleryMain">'+img+'</div>'+
      '<div class="gallery-thumbs" id="galleryThumbs"></div></div>'+
      '<div class="detail-grid"><div class="detail-info">'+
        '<span class="badge '+(isSold?'badge-sold':'badge-available')+'">'+(isSold?'Sold':'Available')+'</span>'+
        '<h1>'+p.title+'</h1>'+
        '<div class="detail-location"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'+p.address+', '+p.city+', '+p.state+'</div>'+
        priceHtml+
        '<div class="detail-specs">'+
          '<div class="spec-item"><label>Bedrooms</label><span>'+(p.bedrooms||'-')+'</span></div>'+
          '<div class="spec-item"><label>Bathrooms</label><span>'+(p.bathrooms||'-')+'</span></div>'+
          '<div class="spec-item"><label>Plot Size</label><span>'+(p.plot_size_sqm?p.plot_size_sqm+' sqm':'-')+'</span></div>'+
          '<div class="spec-item"><label>Type</label><span>'+(p.property_type||'-')+'</span></div>'+
        '</div>'+
        (p.description?'<p class="detail-desc">'+p.description+'</p>':'')+
        '<h3 style="font-size:1rem;font-weight:700;margin-bottom:1rem">Capital Protection</h3>'+
        '<ol class="protection-list"><li>Title-verified at Land Registry</li><li>Written JV agreement</li><li>Full Deal Analyzer transparency</li><li>Start small, build trust</li></ol>'+
        (isSold?'':'<button class="cta-btn" onclick="window.location=\'/api/public/page/register\'">Express Interest →</button>')+
        '<div class="contact-info">Questions? <a href="mailto:evarestuschinecherem@gmail.com">evarestuschinecherem@gmail.com</a></div>'+
      '</div>'+
      '<div>'+
        '<div class="deal-card" id="dealAnalyzer"><h2>Deal Analyzer</h2><p style="color:#A8A29E">Loading deal data...</p></div>'+
        '<div class="calc-card"><h2>Mortgage Calculator</h2>'+
          '<div class="calc-group"><label>Down Payment (%)</label><input type="number" id="calcDown" value="30" min="10" max="90" oninput="calcMortgage('+p.price_ngn+')"></div>'+
          '<div class="calc-group"><label>Interest Rate (% per year)</label><input type="number" id="calcRate" value="15" min="1" max="30" step="0.5" oninput="calcMortgage('+p.price_ngn+')"></div>'+
          '<div class="calc-group"><label>Loan Term</label><select id="calcTerm" onchange="calcMortgage('+p.price_ngn+')"><option value="1">1 year</option><option value="3">3 years</option><option value="5" selected>5 years</option><option value="10">10 years</option></select></div>'+
          '<div class="calc-results" id="calcResults"></div>'+
          '<div class="return-projection" id="returnProj"></div>'+
        '</div>'+
        (p.latitude&&p.longitude?'<div class="map-container"><div class="map-placeholder"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg><p style="margin-top:.75rem">📍 '+p.latitude+', '+p.longitude+'</p><p style="font-size:.75rem;margin-top:.25rem">Google Maps integration coming soon</p></div></div>':'')+
      '</div></div>';

    calcMortgage(p.price_ngn);
    loadDeal(p);
  }catch(e){document.getElementById('propertyContent').innerHTML='<p style="color:#DC2626">Error loading property.</p>';}
}

function calcMortgage(price){
  const downPct=parseFloat(document.getElementById('calcDown')?.value)||30;
  const rate=parseFloat(document.getElementById('calcRate')?.value)||15;
  const years=parseInt(document.getElementById('calcTerm')?.value)||5;
  const downAmount=price*(downPct/100);
  const loanAmount=price-downAmount;
  const monthlyRate=rate/100/12;
  const months=years*12;
  const monthlyPayment=monthlyRate>0?loanAmount*(monthlyRate*Math.pow(1+monthlyRate,months))/(Math.pow(1+monthlyRate,months)-1):loanAmount/months;
  const totalCost=monthlyPayment*months;
  const totalInterest=totalCost-loanAmount;
  const investAmount=loanAmount;
  const returnAmount=investAmount*1.37;
  const profit=returnAmount-investAmount;

  document.getElementById('calcResults').innerHTML=
    '<div class="calc-result-row"><span class="calc-result-label">Monthly Payment</span><span class="calc-result-value">'+formatNgn(Math.round(monthlyPayment))+'</span></div>'+
    '<div class="calc-result-row"><span class="calc-result-label">Loan Amount</span><span class="calc-result-value">'+formatNgn(Math.round(loanAmount))+'</span></div>'+
    '<div class="calc-result-row"><span class="calc-result-label">Total Cost</span><span class="calc-result-value">'+formatNgn(Math.round(totalCost))+'</span></div>'+
    '<div class="calc-result-row"><span class="calc-result-label">Total Interest</span><span class="calc-result-value">'+formatNgn(Math.round(totalInterest))+'</span></div>';

  document.getElementById('returnProj').innerHTML=
    '<div class="big">'+formatNgn(Math.round(returnAmount))+'</div>'+
    '<div class="label">Projected return if invested at 37% (4 months)</div>'+
    '<p style="font-size:.75rem;color:rgba(255,255,255,.4);margin-top:.5rem">Net gain: '+formatNgn(Math.round(profit))+' · Illustrative only</p>';
}

async function loadDeal(p){
  try{
    const r=await fetch('/api/public/deals');
    const d=await r.json();
    const deal=d.items?.find(dl=>dl.property_id===p.id);
    if(!deal){document.getElementById('dealAnalyzer').innerHTML='<h2>Deal Analyzer</h2><p style="color:#A8A29E">Deal analyzer not yet available for this property.</p>';return;}
    document.getElementById('dealAnalyzer').innerHTML='<h2>Deal Analyzer</h2>'+
      '<div class="deal-row"><span>Purchase Price</span><span>'+formatNgn(deal.purchase_price_ngn)+'</span></div>'+
      '<div class="deal-row"><span>Renovation & Costs</span><span>'+formatNgn(deal.renovation_costs_ngn+(deal.legal_fees_ngn||0))+'</span></div>'+
      '<div class="deal-row highlight"><span><strong>Total Investment</strong></span><span><strong>'+formatNgn(deal.total_investment_ngn)+'</strong></span></div>'+
      '<div class="deal-row"><span>Resale Price</span><span>'+formatNgn(deal.projected_resale_ngn)+'</span></div>'+
      '<div class="deal-row profit"><span>Gross Profit</span><span>'+formatNgn(deal.gross_profit_ngn)+' ('+deal.return_percentage+'%)</span></div>'+
      '<div class="deal-row"><span>Investor Share</span><span>'+(deal.investor_share_min||60)+'-'+(deal.investor_share_max||80)+'%</span></div>'+
      '<div class="deal-row"><span>Deal Cycle</span><span>'+(deal.deal_cycle_months||3)+' months</span></div>';
  }catch{}
}

loadProperty();
</script>
</body>
</html>
`);

// CALCULATOR PAGE
// ============================================
reg("calculator", `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Mortgage Calculator — EdgeSpark</title><link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;color:#1C1917;background:#FAFAF9}
:root{--gold:#C9A24B;--navy:#0F1729;--bg:#FAFAF9;--surface:#FFF;--fg:#1C1917;--fg2:#57534E;--muted:#A8A29E;--border:#E7E5E4;--serif:'Fraunces',Georgia,serif}
.container{max-width:800px;margin:0 auto;padding:2rem 1.5rem}
.calc-header{text-align:center;margin-bottom:3rem}
.calc-header h1{font-family:var(--serif);font-size:2.5rem;margin-bottom:.5rem}
.calc-header p{color:var(--fg2);font-size:1.125rem}
.calc-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:2rem;margin-bottom:2rem}
.calc-card h2{font-family:var(--serif);font-size:1.5rem;margin-bottom:1.5rem}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.25rem}
.form-group{margin-bottom:1.25rem}
label{display:block;font-size:.875rem;font-weight:500;margin-bottom:.5rem}
input,select{width:100%;padding:.75rem 1rem;font-size:1rem;border:1px solid var(--border);border-radius:8px;background:var(--surface);transition:border-color .12s}
input:focus,select:focus{outline:none;border-color:var(--gold);box-shadow:0 0 0 3px rgba(201,162,75,.15)}
.result-card{background:var(--navy);color:#fff;border-radius:12px;padding:2rem;margin-top:1.5rem}
.result-row{display:flex;justify-content:space-between;padding:1rem 0;border-bottom:1px solid rgba(255,255,255,.1)}
.result-row:last-child{border-bottom:none}
.result-label{color:rgba(255,255,255,.6);font-size:.875rem}
.result-value{font-family:var(--serif);font-size:1.25rem;font-variant-numeric:tabular-nums}
.result-highlight{background:rgba(201,162,75,.15);border-radius:8px;padding:1.5rem;margin-top:1rem;text-align:center}
.result-highlight .big{font-family:var(--serif);font-size:2.5rem;color:var(--gold)}
.result-highlight .label{font-size:.875rem;color:rgba(255,255,255,.6);margin-top:.25rem}
.profit-bar{height:8px;background:rgba(255,255,255,.1);border-radius:9999px;margin-top:1rem;overflow:hidden}
.profit-fill{height:100%;background:var(--gold);border-radius:9999px;transition:width .3s}
.btn{padding:.85rem 2rem;background:var(--gold);color:#061222;font-weight:600;font-size:.9rem;border:none;border-radius:8px;cursor:pointer;transition:all .25s;width:100%}
.btn:hover{background:#D4B96A}
.back-link{display:inline-flex;align-items:center;gap:.5rem;font-size:.875rem;color:var(--fg2);text-decoration:none;margin-bottom:2rem}
.back-link:hover{color:var(--gold)}
@media(max-width:768px){.form-row{grid-template-columns:1fr}.result-highlight .big{font-size:2rem}}
</style>
</head>
<body>
<div class="container">
<a href="/" class="back-link">← Back to Home</a>
<div class="calc-header">
<h1>Investment Calculator</h1>
<p>Calculate your potential returns on EdgeSpark property deals</p>
</div>

<div class="calc-card">
<h2>Deal Parameters</h2>
<div class="form-row">
<div class="form-group">
<label for="purchase">Purchase Price (NGN)</label>
<input type="number" id="purchase" value="15000000" min="0" oninput="calculate()">
</div>
<div class="form-group">
<label for="renovation">Renovation & Costs (NGN)</label>
<input type="number" id="renovation" value="2500000" min="0" oninput="calculate()">
</div>
</div>
<div class="form-row">
<div class="form-group">
<label for="legal">Legal & Fees (NGN)</label>
<input type="number" id="legal" value="500000" min="0" oninput="calculate()">
</div>
<div class="form-group">
<label for="resale">Projected Resale (NGN)</label>
<input type="number" id="resale" value="24000000" min="0" oninput="calculate()">
</div>
</div>
<div class="form-row">
<div class="form-group">
<label for="investorShare">Your Share (%)</label>
<input type="number" id="investorShare" value="70" min="1" max="100" oninput="calculate()">
</div>
<div class="form-group">
<label for="cycle">Deal Cycle (months)</label>
<input type="number" id="cycle" value="3" min="1" max="24" oninput="calculate()">
</div>
</div>
</div>

<div class="result-card" id="results">
<div class="result-highlight">
<div class="big" id="yourReturn">-</div>
<div class="label">Your Projected Return</div>
</div>
<div class="profit-bar"><div class="profit-fill" id="profitBar" style="width:0%"></div></div>
<div class="result-row">
<span class="result-label">Total Investment</span>
<span class="result-value" id="totalInvestment">-</span>
</div>
<div class="result-row">
<span class="result-label">Gross Profit</span>
<span class="result-value" id="grossProfit">-</span>
</div>
<div class="result-row">
<span class="result-label">Return Percentage</span>
<span class="result-value" id="returnPct">-</span>
</div>
<div class="result-row">
<span class="result-label">Your Profit Share</span>
<span class="result-value" id="yourShare">-</span>
</div>
<div class="result-row">
<span class="result-label">Monthly Return (annualized)</span>
<span class="result-value" id="monthlyReturn">-</span>
</div>
<div class="result-row">
<span class="result-label">Annualized ROI</span>
<span class="result-value" id="annualROI">-</span>
</div>
</div>

<div style="text-align:center;margin-top:2rem">
<a href="/api/public/page/register" class="btn" style="display:inline-block;width:auto;padding:.85rem 3rem">Get Started →</a>
<p style="font-size:.75rem;color:var(--muted);margin-top:1rem">Illustrative only. Actual returns depend on market conditions and deal execution.</p>
</div>
</div>

<script>
function formatNgn(n){return new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(n);}

function calculate(){
  const purchase=parseInt(document.getElementById('purchase').value)||0;
  const renovation=parseInt(document.getElementById('renovation').value)||0;
  const legal=parseInt(document.getElementById('legal').value)||0;
  const resale=parseInt(document.getElementById('resale').value)||0;
  const investorShare=parseInt(document.getElementById('investorShare').value)||70;
  const cycle=parseInt(document.getElementById('cycle').value)||3;

  const totalInvestment=purchase+renovation+legal;
  const grossProfit=resale-totalInvestment;
  const returnPct=totalInvestment>0?((grossProfit/totalInvestment)*100):0;
  const yourProfit=Math.round(grossProfit*(investorShare/100));
  const monthlyReturn=cycle>0?(yourProfit/cycle):yourProfit;
  const annualROI=cycle>0?((returnPct*12)/cycle):returnPct;

  document.getElementById('yourReturn').textContent=formatNgn(yourProfit);
  document.getElementById('totalInvestment').textContent=formatNgn(totalInvestment);
  document.getElementById('grossProfit').textContent=formatNgn(grossProfit);
  document.getElementById('returnPct').textContent=returnPct.toFixed(1)+'%';
  document.getElementById('yourShare').textContent=formatNgn(yourProfit);
  document.getElementById('monthlyReturn').textContent=formatNgn(Math.round(monthlyReturn))+'/mo';
  document.getElementById('annualROI').textContent=annualROI.toFixed(1)+'%';

  // Profit bar
  const barWidth=Math.min(Math.max(returnPct,0),100);
  document.getElementById('profitBar').style.width=barWidth+'%';
}

calculate();
</script>
</body>
</html>
`);

// ============================================
// PARTNER APPLICATION PAGE
// ============================================
reg("partner", `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Partner With Us — EdgeSpark</title><link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;color:#1C1917;background:#FAFAF9}
:root{--gold:#C9A24B;--navy:#0F1729;--bg:#FAFAF9;--surface:#FFF;--fg:#1C1917;--fg2:#57534E;--muted:#A8A29E;--border:#E7E5E4;--serif:'Fraunces',Georgia,serif}
.auth-layout{display:flex;min-height:100vh}
.auth-brand{display:none;flex:1;background:#0F1729;padding:4rem;flex-direction:column;justify-content:center;color:#fff}
.auth-form{flex:1;display:flex;align-items:center;justify-content:center;padding:4rem 2rem;background:#FAFAF9}
.auth-form-inner{width:100%;max-width:480px}
.brand{display:flex;align-items:center;gap:.75rem;margin-bottom:2rem;text-decoration:none}
.brand-mark{width:40px;height:40px;background:#0F1729;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-size:1.1rem;color:#C9A24B;font-weight:700}
.brand-name{font-weight:700;font-size:.95rem;color:#1C1917}
h1{font-family:'Fraunces',serif;font-size:2.25rem;margin-bottom:.5rem}
.form-group{margin-bottom:1.25rem}
label{display:block;font-size:.875rem;font-weight:500;margin-bottom:.5rem}
input,select,textarea{width:100%;padding:.75rem 1rem;font-size:1rem;border:1px solid #E7E5E4;border-radius:8px;background:#fff;transition:border-color .12s}
input:focus,select:focus,textarea:focus{outline:none;border-color:#C9A24B;box-shadow:0 0 0 3px rgba(201,162,75,.15)}
textarea{min-height:120px;resize:vertical}
.btn{width:100%;padding:.85rem;background:#C9A24B;color:#061222;font-weight:600;font-size:.9rem;border:none;border-radius:8px;cursor:pointer;margin-top:1rem;transition:all .25s}
.btn:hover{background:#D4B96A}
.error{padding:.75rem 1rem;background:#fef2f2;border:1px solid #fecaca;color:#DC2626;font-size:.875rem;border-radius:8px;margin-bottom:1.25rem;display:none}
.error.visible{display:block}
.success{padding:1.5rem;background:#f0f7ef;border:1px solid #bbf7d0;border-radius:8px;text-align:center;display:none}
.success.visible{display:block}
.success h3{font-family:'Fraunces',serif;font-size:1.5rem;color:#16A34A;margin-bottom:.5rem}
.footer-link{text-align:center;font-size:.875rem;color:#57534E;margin-top:1.5rem}
.footer-link a{color:#C9A24B;font-weight:600}
@media(min-width:769px){.auth-brand{display:flex}}
</style>
</head>
<body>
<div class="auth-layout">
<div class="auth-brand">
<div style="position:relative;z-index:2;max-width:400px">
<span style="font-size:.6875rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#D4B96A;display:block;margin-bottom:1.5rem">Joint Venture Partner</span>
<h2 style="font-family:'Fraunces',serif;font-size:2.25rem;line-height:1.15;margin-bottom:1.5rem">Invest in verified Nigerian real estate.</h2>
<p style="color:rgba(255,255,255,.6);line-height:1.7">Partner with EdgeSpark on property acquisitions. You approve every deal before any money moves.</p>
<div style="margin-top:2rem;display:grid;gap:1rem">
<div style="display:flex;gap:1rem;align-items:center"><div style="width:8px;height:8px;background:#C9A24B;border-radius:50%"></div><span style="color:rgba(255,255,255,.7)">Title-verified properties</span></div>
<div style="display:flex;gap:1rem;align-items:center"><div style="width:8px;height:8px;background:#C9A24B;border-radius:50%"></div><span style="color:rgba(255,255,255,.7)">60-80% investor profit share</span></div>
<div style="display:flex;gap:1rem;align-items:center"><div style="width:8px;height:8px;background:#C9A24B;border-radius:50%"></div><span style="color:rgba(255,255,255,.7)">2-4 month deal cycles</span></div>
</div>
</div>
</div>
<div class="auth-form">
<div class="auth-form-inner">
<div class="auth-header">
<a href="/" class="brand"><span class="brand-mark"><svg viewBox="0 0 40 40" width="40" height="40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="6" fill="#0F1729"/><path d="M20 8L10 19h20z" fill="#C9A24B"/><rect x="14" y="21" width="12" height="11" rx="1" fill="#C9A24B"/><rect x="17.5" y="24" width="5" height="8" rx=".5" fill="#0F1729"/></svg></span><span class="brand-text"><span class="brand-name">EdgeSpark</span></span></a>
<h1>Partner with EdgeSpark</h1>
<p style="font-size:.875rem;color:#57534E;margin-bottom:2rem">Fill out the form below and our team will reach out to discuss partnership opportunities.</p>
</div>
<div class="error" id="partnerError"></div>
<div class="success" id="partnerSuccess">
<h3>Application Received!</h3>
<p style="color:#57534E;margin-top:.5rem">Thank you for your interest. Our team will review your application and contact you within 2 business days.</p>
<a href="/" style="display:inline-block;margin-top:1.5rem;color:#C9A24B;font-weight:600">← Back to Home</a>
</div>
<form id="partnerForm">
<div class="form-group">
<label for="fullName">Full Name *</label>
<input type="text" id="fullName" required placeholder="Your full name" autocomplete="name">
</div>
<div class="form-group">
<label for="email">Email Address *</label>
<input type="email" id="email" required placeholder="you@email.com" autocomplete="email">
</div>
<div class="form-group">
<label for="phone">Phone Number</label>
<input type="tel" id="phone" placeholder="+234 ..." autocomplete="tel">
</div>
<div class="form-group">
<label for="company">Company (optional)</label>
<input type="text" id="company" placeholder="Your company name">
</div>
<div class="form-group">
<label for="investmentRange">Investment Range</label>
<select id="investmentRange">
<option value="">Select range...</option>
<option value="$5,000 - $10,000">$5,000 - $10,000</option>
<option value="$10,000 - $25,000">$10,000 - $25,000</option>
<option value="$25,000 - $50,000">$25,000 - $50,000</option>
<option value="$50,000 - $100,000">$50,000 - $100,000</option>
<option value="$100,000+">$100,000+</option>
</select>
</div>
<div class="form-group">
<label for="experience">Real Estate Experience</label>
<select id="experience">
<option value="">Select...</option>
<option value="none">No prior experience</option>
<option value="beginner">Beginner (1-2 deals)</option>
<option value="intermediate">Intermediate (3-10 deals)</option>
<option value="experienced">Experienced (10+ deals)</option>
</select>
</div>
<div class="form-group">
<label for="message">Tell us about yourself</label>
<textarea id="message" placeholder="Why are you interested in partnering with EdgeSpark? What are your investment goals?"></textarea>
</div>
<button type="submit" class="btn" id="submitBtn">Submit Application</button>
</form>
<div class="footer-link">Already have an account? <a href="/api/public/page/login">Sign in</a></div>
</div>
</div>
</div>

<script>
document.getElementById('partnerForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const err = document.getElementById('partnerError');
  btn.disabled = true;
  btn.textContent = 'Submitting...';
  err.classList.remove('visible');
  
  try {
    const r = await fetch('/api/public/partners/apply', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value || undefined,
        company: document.getElementById('company').value || undefined,
        investmentRange: document.getElementById('investmentRange').value || undefined,
        experience: document.getElementById('experience').value || undefined,
        message: document.getElementById('message').value || undefined
      })
    });
    const d = await r.json();
    if (r.ok && d.ok) {
      document.getElementById('partnerForm').style.display = 'none';
      document.getElementById('partnerSuccess').classList.add('visible');
    } else {
      err.textContent = d.error || 'Something went wrong. Please try again.';
      err.classList.add('visible');
    }
  } catch {
    err.textContent = 'Network error. Please check your connection.';
    err.classList.add('visible');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Submit Application';
  }
});
</script>
</body>
</html>
`);

// Catch-all route handler
staticRoutes.get("/:page", (c) => {
  const page = c.req.param("page");
  if (pages[page]) return c.html(pages[page]);
  return c.json({ error: "page_not_found", page }, 404);
});

export default staticRoutes;
