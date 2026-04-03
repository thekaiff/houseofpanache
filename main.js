/* ============================================================
   HOUSE OF PANACHE — main.js
   ============================================================ */

'use strict';

/* ============================================================
   iOS 26 STACKED NOTIFICATION SYSTEM
   Defined first so go() can call showToast immediately
   ============================================================ */
const _toasts = [];

function showToast({ icon = '✦', iconClass = 'green', title = '', msg = '', duration = 4500 } = {}) {
  const container = document.getElementById('hop-toast-container');
  if (!container) return;

  const el = document.createElement('div');
  el.className = 'hop-toast';
  el.innerHTML = `
    <div class="hop-toast-icon ${iconClass}">${icon}</div>
    <div class="hop-toast-body">
      <div class="hop-toast-title">${title}</div>
      <div class="hop-toast-msg">${msg}</div>
    </div>
    <div class="hop-toast-time">now</div>
  `;
  container.appendChild(el);
  _toasts.push(el);

  _restackToasts();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => el.classList.add('entering'));
  });

  _addSwipeDismiss(el);

  const timer = setTimeout(() => _dismissToast(el), duration);
  el._dismissTimer = timer;

  el.addEventListener('click', () => {
    clearTimeout(el._dismissTimer);
    _dismissToast(el);
  });
}

function _restackToasts() {
  const stackClasses = ['stacked-1', 'stacked-2', 'stacked-3'];
  const total = _toasts.length;
  _toasts.forEach((t, i) => {
    t.classList.remove('stacked-1', 'stacked-2', 'stacked-3');
    const depth = total - 1 - i;
    if (depth > 0 && depth <= stackClasses.length) {
      setTimeout(() => t.classList.add(stackClasses[depth - 1]), 10);
    }
    if (depth > stackClasses.length) {
      t.style.opacity = '0';
      t.style.pointerEvents = 'none';
    }
  });
}

function _dismissToast(el) {
  const idx = _toasts.indexOf(el);
  if (idx === -1) return;
  _toasts.splice(idx, 1);
  el.classList.remove('entering', 'stacked-1', 'stacked-2', 'stacked-3');
  el.classList.add('dismissing');
  setTimeout(() => _restackToasts(), 20);
  el.addEventListener('transitionend', () => el.remove(), { once: true });
}

function _addSwipeDismiss(el) {
  let startX = 0, isDragging = false, currentX = 0;

  const onStart = (e) => {
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    isDragging = true;
    el.style.transition = 'none';
  };
  const onMove = (e) => {
    if (!isDragging) return;
    currentX = (e.touches ? e.touches[0].clientX : e.clientX) - startX;
    if (currentX > 0) {
      el.style.transform = `translateX(${currentX}px) scale(1)`;
      el.style.opacity   = String(Math.max(0, 1 - currentX / 200));
    }
  };
  const onEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    el.style.transition = '';
    if (currentX > 80) {
      clearTimeout(el._dismissTimer);
      _dismissToast(el);
    } else {
      el.style.transform = '';
      el.style.opacity   = '';
    }
    currentX = 0;
  };

  el.addEventListener('touchstart',  onStart, { passive: true });
  el.addEventListener('touchmove',   onMove,  { passive: true });
  el.addEventListener('touchend',    onEnd);
  el.addEventListener('mousedown',   onStart);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup',   onEnd);
}

/* ============================================================
   NAVIGATION INITIALIZATION
   ============================================================ */
window.addEventListener('DOMContentLoaded', () => {
  const navLogo = document.querySelector('.nav-logo');
  if (navLogo) {
    navLogo.addEventListener('click', (e) => {
      e.preventDefault();
      go('home');
    });
  }
});

/* ============================================================
   PAGE ROUTING
   ============================================================ */
function go(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active-link', l.textContent.trim().toLowerCase() === page);
  });

  // Kill active scroll triggers before scrolling to prevent conflicts
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }
  
  // Simple scroll to top for all pages
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  setTimeout(initReveal, 80);

  if (page === 'contact') {
    setTimeout(() => showToast({
      icon: '📋', iconClass: 'beige',
      title: 'Free Consultation',
      msg: 'We respond within 2 business hours',
      duration: 4500
    }), 350);
  }

  if (page === 'services') {
    setTimeout(() => showToast({
      icon: '✦', iconClass: 'green',
      title: '8 Industry Categories',
      msg: 'Premium uniforms for every sector',
      duration: 4000
    }), 350);
  }

  if (page === 'home') {
    setTimeout(initProcess, 200);
    if (window._heroAnim) window._heroAnim.resume();
    // Reinitialize hero animations for home page
    setTimeout(() => initHeroGSAP(), 150);
  } else {
    if (window._heroAnim) window._heroAnim.pause();
  }
}

/* ============================================================
   NAV SCROLL
   ============================================================ */
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

/* ============================================================
   MOBILE MENU
   ============================================================ */
function toggleMob() {
  const h = document.getElementById('hamburger');
  const m = document.getElementById('mobMenu');
  if (!h || !m) return;
  h.classList.toggle('open');
  m.classList.toggle('open');
  document.body.style.overflow = m.classList.contains('open') ? 'hidden' : '';
}

function closeMob() {
  const h = document.getElementById('hamburger');
  const m = document.getElementById('mobMenu');
  if (!h || !m) return;
  h.classList.remove('open');
  m.classList.remove('open');
  document.body.style.overflow = '';
}

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.10 });

  document
    .querySelectorAll('.reveal:not(.in), .reveal-l:not(.in), .reveal-r:not(.in), .stagger:not(.in)')
    .forEach(el => obs.observe(el));
}

/* ============================================================
   FAQ
   ============================================================ */
function tFaq(item) {
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!wasOpen) item.classList.add('open');
}

/* ============================================================
   HERO — GSAP ANIMATION SYSTEM
   ============================================================ */
function initHeroGSAP() {
  if (typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  const hero     = document.getElementById('heroSection');
  const heroBody = document.getElementById('heroBody');
  if (!hero) return;

  const h1    = document.getElementById('heroH1');
  const lines = h1 ? h1.querySelectorAll('.hero-line-inner') : [];

  /* Master intro timeline */
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.to('#heroRule', { scaleX: 1, duration: 1.4, ease: 'expo.out' }, 0);

  gsap.set('#heroOverline', { y: 16, opacity: 0 });
  tl.to('#heroOverline', { opacity: 1, y: 0, duration: 0.8 }, 0.3);

  if (lines.length) {
    tl.to(lines, { y: '0%', duration: 1.1, stagger: 0.12, ease: 'expo.out' }, 0.45);
  }

  gsap.set('#heroSub', { y: 22, opacity: 0 });
  tl.to('#heroSub', { opacity: 1, y: 0, duration: 0.9 }, 0.82);

  gsap.set('#heroBtns', { y: 18, opacity: 0 });
  tl.to('#heroBtns', { opacity: 1, y: 0, duration: 0.8 }, 0.96);

  tl.to('.hero-stat-item', { opacity: 1, x: 0, duration: 0.9, stagger: 0.14, ease: 'expo.out' }, 0.60);
  tl.to('.hsi-divider',    { opacity: 1, duration: 0.6, stagger: 0.1 }, 0.72);
  tl.to('#heroScrollCue',  { opacity: 1, duration: 0.7 }, 1.3);

  /* Counter animation */
  document.querySelectorAll('.hsi-n').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    tl.to({ val: 0 }, {
      val: target,
      duration: 1.6,
      ease: 'power2.out',
      onUpdate: function () {
        el.textContent = Math.round(this.targets()[0].val);
      }
    }, 0.70);
  });

  /* ScrollTrigger parallax */
  if (heroBody) {
    gsap.to(heroBody, {
      yPercent: 18,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  gsap.to('#heroStats', {
    yPercent: 10,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
  });

  /* Fade out on scroll */
  const fadeTargets = [heroBody, '#heroScrollCue', '#heroRule'].filter(Boolean);
  if (document.getElementById('heroStats')) fadeTargets.push('#heroStats');
  gsap.to(fadeTargets, {
    opacity: 0,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: '45% top', scrub: true }
  });

  /* Scroll dot loop */
  const dot = document.querySelector('.hero-scroll-dot');
  if (dot) {
    gsap.to(dot, { y: 52, opacity: 0, duration: 1.4, ease: 'power1.inOut', repeat: -1, repeatDelay: 0.4 });
  }

  /* Canvas fabric threads — replaced with video background */
  // _initFabricCanvas();
}

/* ── Fabric canvas animation ── */
function _initFabricCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, raf, paused = false;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  const PALETTE = [
    'rgba(107,171,138,',
    'rgba(255,255,255,',
    'rgba(212,200,187,',
    'rgba(61,122,90,'
  ];

  class Thread {
    constructor() { this.reset(); }
    reset() {
      this.x    = Math.random() * W;
      this.y    = Math.random() * H;
      this.len  = 100 + Math.random() * 220;
      this.ang  = Math.random() * Math.PI * 2;
      this.dAng = (Math.random() - 0.5) * 0.0006;
      this.wave = Math.random() * Math.PI * 2;
      this.wA   = 18 + Math.random() * 38;
      this.wS   = 0.0006 + Math.random() * 0.0008;
      this.w    = 0.5 + Math.random() * 1.0;
      this.life = Math.random() * 500;
      this.max  = 300 + Math.random() * 400;
      this.col  = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    }
    draw(t) {
      this.life++;
      if (this.life > this.max) { this.reset(); return; }
      const p  = this.life / this.max;
      const a  = p < 0.15 ? p / 0.15 : p > 0.85 ? (1 - p) / 0.15 : 1;
      this.ang += this.dAng;
      const ox = Math.cos(this.ang), oy = Math.sin(this.ang);
      const px = -oy, py = ox;
      const wv = Math.sin(t * this.wS + this.wave) * this.wA;
      const sx = this.x - ox * this.len * 0.5 + px * wv * 0.3;
      const sy = this.y - oy * this.len * 0.5 + py * wv * 0.3;
      const ex = this.x + ox * this.len * 0.5 + px * wv * 0.3;
      const ey = this.y + oy * this.len * 0.5 + py * wv * 0.3;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(this.x + px * wv, this.y + py * wv, ex, ey);
      ctx.strokeStyle = this.col + (a * 0.45) + ')';
      ctx.lineWidth   = this.w;
      ctx.lineCap     = 'round';
      ctx.stroke();
      this.x += ox * 0.15;
      this.y += oy * 0.15;
      if (this.x < -200) this.x = W + 100;
      if (this.x > W + 200) this.x = -100;
      if (this.y < -200) this.y = H + 100;
      if (this.y > H + 200) this.y = -100;
    }
  }

  const threads = Array.from({ length: 26 }, () => new Thread());
  let t = 0;

  function render() {
    if (paused) return;
    raf = requestAnimationFrame(render);
    t++;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0e1510';
    ctx.fillRect(0, 0, W, H);

    const g1 = ctx.createRadialGradient(W * 0.15, H * 0.3, 0, W * 0.15, H * 0.3, W * 0.5);
    g1.addColorStop(0, 'rgba(40,80,55,0.14)');
    g1.addColorStop(1, 'transparent');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);

    const g2 = ctx.createRadialGradient(W * 0.8, H * 0.7, 0, W * 0.8, H * 0.7, W * 0.4);
    g2.addColorStop(0, 'rgba(61,122,90,0.08)');
    g2.addColorStop(1, 'transparent');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);

    threads.forEach(th => th.draw(t));
  }
  render();

  window._heroAnim = {
    pause()  { paused = true;  if (raf) cancelAnimationFrame(raf); },
    resume() { if (paused) { paused = false; render(); } }
  };
}

/* ============================================================
   PROCESS TIMELINE
   ============================================================ */
const stepDetails = [
  [
    { icon: '<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--green-light);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>', title: 'Discovery Call',       desc: '30-min meeting to understand your organisation, team size, and uniform requirements in full.' },
    { icon: '<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--green-light);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><path d="M3 3h18"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M3 21h18"/></svg>',                                                                                                                                                                                                                              title: 'On-site Measurement', desc: 'Our team visits to take precise measurements for every staff role and body type.' },
    { icon: '<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--green-light);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',                                                                                                                                                                                             title: 'Requirements Brief',  desc: 'A detailed brief capturing brand colours, functional needs, fabric preferences, and timelines.' }
  ],
  [
    { icon: '<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--green-light);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><circle cx="13.5" cy="6.5" r="2.5"/><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',                                                                                                                                       title: 'Design Concepts',     desc: '3 custom concepts presented within 5 days, fully incorporating your brand guidelines.' },
    { icon: '<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--green-light);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/></svg>',                                                                                                     title: 'Fabric Selection',    desc: 'Physical swatches delivered so you can confirm colours and feel the quality before production.' },
    { icon: '<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--green-light);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><polyline points="20 6 9 17 4 12"/></svg>',                                                                                                                                                                                                                                                                             title: 'Prototype Approval',  desc: 'A physical sample garment is produced for fitting and sign-off before full production.' }
  ],
  [
    { icon: '<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--green-light);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><path d="M2 20h20M4 20V10l6-4v4l6-4v14"/><rect x="9" y="14" width="6" height="6"/></svg>',                                                                                                                                                                                                                             title: 'In-House Production', desc: 'Every garment is cut, sewn, and finished in our dedicated UAE facility using premium machinery.' },
    { icon: '<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--green-light);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',                                                                                                                                                                                                                              title: '12-Point QC Check',   desc: 'Each garment is inspected for stitching, colour, sizing, and finish before leaving production.' },
    { icon: '<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--green-light);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',                                                                                                                                                                 title: 'Packing & Labelling', desc: 'Orders are individually labelled by size and department, ready for seamless distribution.' }
  ],
  [
    { icon: '<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--green-light);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',                                                                                                                                                    title: 'UAE-Wide Dispatch',   desc: 'Tracked delivery to all 7 Emirates within the agreed timeline — no exceptions.' },
    { icon: '<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--green-light);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',                                                                                                                                                                                                                        title: 'Aftercare Support',   desc: 'Post-delivery assistance for any adjustments, reorders, or new-hire additions.' },
    { icon: '<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--green-light);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',                                                                                                                                                                                      title: 'Inventory Management',desc: 'Ongoing stock management ensures your team is always fully uniformed across all departments.' }
  ]
];

let _activeStepIdx    = 0;
let _processCycleTimer = null;

function activateStep(idx) {
  _activeStepIdx = idx;

  document.querySelectorAll('.step').forEach((s, i) => {
    s.classList.remove('active', 'done');
    if (i < idx) s.classList.add('done');
    if (i === idx) s.classList.add('active');
  });

  const prog = document.getElementById('tlProg');
  if (prog) prog.style.width = (idx === 0 ? 0 : (idx / 3) * 100) + '%';

  const panel = document.getElementById('stepDetail');
  if (!panel) return;

  panel.className = 'step-detail show';
  panel.innerHTML = stepDetails[idx].map(d => `
    <div class="det-item">
      <div class="det-ico">${d.icon}</div>
      <div class="det-text">
        <strong>${d.title}</strong>
        <span>${d.desc}</span>
      </div>
    </div>
  `).join('');
}

function initProcess() {
  activateStep(0);
  _activeStepIdx = 0;

  const proc = document.querySelector('.proc-sec');
  if (!proc) return;

  if (_processCycleTimer) clearInterval(_processCycleTimer);

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        if (_processCycleTimer) clearInterval(_processCycleTimer);
        _processCycleTimer = setInterval(() => {
          _activeStepIdx = (_activeStepIdx + 1) % 4;
          activateStep(_activeStepIdx);
        }, 2400);
      } else {
        if (_processCycleTimer) clearInterval(_processCycleTimer);
      }
    });
  }, { threshold: 0.25 });

  obs.observe(proc);
}

/* ============================================================
   REVIEWS SLIDER + GOOGLE SHEETS
   ============================================================ */
let rIdx       = 0;
let allReviews = [];
let rvRating   = 0;

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbw2AB2hnpjd2U9mXCyfKrGAsNDLtHVsKQOrEfiqqeD--4N-I5dPtYPOXhU_vSBRtT-G/exec';

const seedReviews = [
  { name: 'Ahmed Al Kaabi',      role: 'HR Director · Dubai Corporation',              rating: 5, text: 'House of Panache transformed how our team presents themselves. Quality across 200 uniforms was exceptional — consistent, on-time, and exactly what our brand demanded.',              ts: Date.now() - 9000000 },
  { name: 'Khalid Al Ameri',     role: 'Operations Manager · Fitness & Wellness Group', rating: 5, text: 'Our fitness centre staff across four locations wear uniforms that truly reflect our brand energy. The fabric quality and colour consistency order after order is simply unmatched.', ts: Date.now() - 8000000 },
  { name: 'Rania Hassan',        role: 'GM · Luxury Hotels Group',                     rating: 5, text: 'Our hospitality staff across three properties wear uniforms that genuinely reflect our luxury brand. The embroidery work and fabric quality are truly extraordinary.',               ts: Date.now() - 7000000 },
  { name: 'Dr. Mohammed Nasser', role: 'Ops Manager · Private Hospital',               rating: 5, text: 'Medical scrubs that fit properly during 12-hour shifts changed everything for our team. The breathable fabric showed they truly understand healthcare requirements.',                ts: Date.now() - 6000000 }
];

function perView()    { return window.innerWidth < 768 ? 1 : 2; }
function totalPages() { return Math.max(1, Math.ceil(allReviews.length / perView())); }

function moveRev(d) {
  rIdx = Math.max(0, Math.min(totalPages() - 1, rIdx + d));
  const track = document.getElementById('revTrack');
  if (track && _revAutoTimer) clearInterval(_revAutoTimer);
  renderRev();
  if (track) {
    track.style.transition = 'transform 0.48s cubic-bezier(0.32, 0.72, 0.26, 1)';
  }
  setTimeout(() => startRevAuto(), 500);
}

function goRev(i) {
  rIdx = i;
  const track = document.getElementById('revTrack');
  if (track && _revAutoTimer) clearInterval(_revAutoTimer);
  renderRev();
  if (track) {
    track.style.transition = 'transform 0.48s cubic-bezier(0.32, 0.72, 0.26, 1)';
  }
  setTimeout(() => startRevAuto(), 500);
}

function renderRev() {
  const track   = document.getElementById('revTrack');
  const dotsEl  = document.getElementById('revDots');
  const emptyEl = document.getElementById('revEmpty');
  if (!track) return;

  [...track.children].forEach(c => { if (!c.id) c.remove(); });

  if (!allReviews.length) {
    if (emptyEl) emptyEl.style.display = 'block';
    if (dotsEl)  dotsEl.innerHTML = '';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  allReviews.forEach(rv => {
    const stars    = '⭐'.repeat(rv.rating);
    const initials = rv.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const card     = document.createElement('div');
    card.className = 'r-card';
    card.innerHTML = `
      <div class="r-stars">${stars}</div>
      <p class="r-txt">"${rv.text}"</p>
      <div class="r-auth">
        <div class="r-av">${initials}</div>
        <div><div class="r-nm">${rv.name}</div><div class="r-role">${rv.role}</div></div>
      </div>`;
    track.appendChild(card);
  });

  requestAnimationFrame(() => {
    const first = track.querySelector('.r-card');
    if (!first) return;
    track.style.transform = `translateX(-${rIdx * (first.offsetWidth + 18) * perView()}px)`;
  });

  if (dotsEl) {
    dotsEl.innerHTML = '';
    for (let i = 0; i < totalPages(); i++) {
      const dot = document.createElement('div');
      dot.className = 'r-dot' + (i === rIdx ? ' on' : '');
      dot.onclick = () => goRev(i);
      dotsEl.appendChild(dot);
    }
  }
  
  // Initialize swipe after render
  setTimeout(initRevSwipe, 50);
}

async function loadReviews() {
  try {
    const res  = await fetch(SHEET_URL, { method: 'GET' });
    const data = await res.json();
    allReviews = (data.success && Array.isArray(data.reviews) && data.reviews.length)
      ? data.reviews
      : [...seedReviews];
  } catch {
    allReviews = [...seedReviews];
  }
  rIdx = 0;
  renderRev();
  initRevSwipe();
}

async function submitReview() {
  const nameEl = document.getElementById('rv-name');
  const roleEl = document.getElementById('rv-role');
  const textEl = document.getElementById('rv-text');
  const msgEl  = document.getElementById('rvFormMsg');
  const btn    = document.getElementById('rvSubmitBtn');
  if (!nameEl || !textEl || !msgEl || !btn) return;

  const name = nameEl.value.trim();
  const role = roleEl ? roleEl.value.trim() : '';
  const text = textEl.value.trim();

  msgEl.className = 'rev-form-msg';
  if (!name)           { msgEl.textContent = 'Please enter your name.';              msgEl.className = 'rev-form-msg err'; return; }
  if (!rvRating)       { msgEl.textContent = 'Please select a star rating.';         msgEl.className = 'rev-form-msg err'; return; }
  if (text.length < 15){ msgEl.textContent = 'Please write at least 15 characters.'; msgEl.className = 'rev-form-msg err'; return; }

  btn.disabled    = true;
  btn.textContent = 'Submitting...';

  try {
    const params = new URLSearchParams({ name, role: role || 'Verified Customer', rating: rvRating, text });
    await fetch(SHEET_URL + '?' + params.toString(), { method: 'GET', mode: 'no-cors' });

    nameEl.value = '';
    if (roleEl) roleEl.value = '';
    textEl.value = '';
    rvRating = 0;
    document.querySelectorAll('.rev-star').forEach(s => s.classList.remove('on'));
    msgEl.textContent = '✓ Thank you! Your review will appear after approval.';
    msgEl.className   = 'rev-form-msg ok';
    setTimeout(() => { msgEl.className = 'rev-form-msg'; }, 6000);
  } catch {
    msgEl.textContent = 'Failed to submit. Please try again.';
    msgEl.className   = 'rev-form-msg err';
  }

  btn.disabled    = false;
  btn.textContent = 'Submit Review';
}

function initStars() {
  const stars = document.querySelectorAll('.rev-star');
  stars.forEach(star => {
    star.addEventListener('click', () => {
      rvRating = parseInt(star.dataset.v);
      stars.forEach(s => s.classList.toggle('on', parseInt(s.dataset.v) <= rvRating));
    });
    star.addEventListener('mouseenter', () => {
      stars.forEach(s => s.classList.toggle('on', parseInt(s.dataset.v) <= parseInt(star.dataset.v)));
    });
    star.addEventListener('mouseleave', () => {
      stars.forEach(s => s.classList.toggle('on', parseInt(s.dataset.v) <= rvRating));
    });
  });
}

let _revAutoTimer = null;
function startRevAuto() {
  if (_revAutoTimer) clearInterval(_revAutoTimer);
  _revAutoTimer = setInterval(() => {
    rIdx = (rIdx + 1) % totalPages();
    renderRev();
  }, 5800);
}

/* ============================================================
   REVIEW SLIDER — SWIPE FUNCTIONALITY
   ============================================================ */
function initRevSwipe() {
  const slider = document.querySelector('.rev-slider');
  const track  = document.getElementById('revTrack');
  if (!slider || !track) return;

  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let isDragging = false;
  let velocity = 0;
  let lastX = 0;
  let lastTime = 0;

  const onTouchStart = (e) => {
    if (totalPages() <= 1) return;
    
    // Clear auto-advance timer on interaction
    if (_revAutoTimer) clearInterval(_revAutoTimer);
    
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    startY = e.touches ? e.touches[0].clientY : e.clientY;
    isDragging = true;
    currentX = 0;
    lastX = startX;
    lastTime = Date.now();
    
    // Pause transition while dragging
    track.style.transition = 'none';
  };

  const onTouchMove = (e) => {
    if (!isDragging) return;
    
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const deltaX = x - startX;
    const deltaY = Math.abs(y - startY);

    // Only swipe if horizontal movement is greater than vertical
    if (Math.abs(deltaX) > deltaY) {
      e.preventDefault();
      currentX = deltaX;
      
      // Calculate velocity for momentum
      const now = Date.now();
      const dt = Math.max(now - lastTime, 16);
      velocity = (x - lastX) / dt;
      lastX = x;
      lastTime = now;
      
      const first = track.querySelector('.r-card');
      if (first) {
        const cardWidth = first.offsetWidth;
        const gapWidth = 18;
        const itemWidth = cardWidth + gapWidth;
        const numPerPage = perView();
        
        track.style.transform = `translateX(calc(-${rIdx * itemWidth * numPerPage}px + ${currentX}px))`;
      }
    }
  };

  const onTouchEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    
    const first = track.querySelector('.r-card');
    if (!first) return;
    
    const cardWidth = first.offsetWidth;
    const gapWidth = 18;
    const itemWidth = cardWidth + gapWidth;
    const numPerPage = perView();
    const threshold = itemWidth * 0.2; // 20% of card width triggers slide
    
    let newIdx = rIdx;
    
    // Check swipe direction with velocity
    if (currentX < -threshold || (Math.abs(currentX) > 5 && velocity < -0.3)) {
      newIdx = Math.min(totalPages() - 1, rIdx + 1);
    } else if (currentX > threshold || (Math.abs(currentX) > 5 && velocity > 0.3)) {
      newIdx = Math.max(0, rIdx - 1);
    }
    
    // Update index and render with smooth transition
    rIdx = newIdx;
    track.style.transition = 'transform 0.48s cubic-bezier(0.32, 0.72, 0.26, 1)';
    track.style.transform = `translateX(-${rIdx * itemWidth * numPerPage}px)`;
    
    // Update dots
    const dotsEl = document.getElementById('revDots');
    if (dotsEl) {
      dotsEl.querySelectorAll('.r-dot').forEach((dot, i) => {
        dot.classList.toggle('on', i === rIdx);
      });
    }
    
    // Restart auto-advance
    setTimeout(() => startRevAuto(), 500);
  };

  // Desktop mouse events
  slider.addEventListener('mousedown', onTouchStart);
  window.addEventListener('mousemove', onTouchMove);
  window.addEventListener('mouseup', onTouchEnd);
  
  // Mobile touch events
  slider.addEventListener('touchstart', onTouchStart, { passive: true });
  slider.addEventListener('touchmove', onTouchMove, { passive: false });
  slider.addEventListener('touchend', onTouchEnd);
  
  // Cursor feedback for dragging
  slider.addEventListener('mouseenter', () => {
    if (totalPages() > 1) slider.style.cursor = 'grab';
  });
  slider.addEventListener('mouseleave', () => {
    slider.style.cursor = 'default';
  });
  slider.addEventListener('mousedown', () => {
    if (totalPages() > 1) slider.style.cursor = 'grabbing';
  });
  window.addEventListener('mouseup', () => {
    if (slider.matches(':hover') && totalPages() > 1) {
      slider.style.cursor = 'grab';
    }
  });
}

window.addEventListener('resize', () => { rIdx = 0; renderRev(); }, { passive: true });

/* ============================================================
   CONTACT FORM — Web3Forms
   ============================================================ */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFormMsg(type, msg) {
  const isErr = type === 'error';
  const id    = isErr ? 'formErrorMsg' : 'formSuccessMsg';
  let el      = document.getElementById(id);

  if (!el) {
    el    = document.createElement('div');
    el.id = id;
    const btn = document.getElementById('submitBtn');
    if (btn) btn.parentNode.insertBefore(el, btn);
  }

  el.style.cssText = isErr
    ? 'background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:12px 16px;font-size:13px;color:#DC2626;margin-bottom:14px;display:flex;align-items:center;gap:8px;'
    : 'background:#F0FDF4;border:1px solid #86EFAC;border-radius:12px;padding:14px 18px;font-size:13px;color:#16A34A;margin-bottom:14px;display:flex;align-items:center;gap:10px;font-weight:600;';
  el.innerHTML     = (isErr ? '⚠️ ' : '✓ ') + msg;
  el.style.display = 'flex';
  if (isErr) setTimeout(() => { el.style.display = 'none'; }, 6000);
}

async function handleSubmit(btn) {
  const fEl = document.getElementById('firstName');
  const lEl = document.getElementById('lastName');
  const eEl = document.getElementById('fromEmail');
  const cEl = document.getElementById('company');
  const pEl = document.getElementById('phone');
  const sEl = document.getElementById('service');
  const qEl = document.getElementById('quantity');
  const mEl = document.getElementById('message');

  if (!fEl || !eEl) { showFormMsg('error', 'Form initialisation error — please refresh the page and try again.'); return; }

  const firstName = fEl.value.trim();
  const lastName  = lEl ? lEl.value.trim() : '';
  const fromEmail = eEl.value.trim();
  const company   = cEl ? cEl.value.trim() : '';
  const phone     = pEl ? pEl.value.trim() : '';
  const service   = sEl ? sEl.value : '';
  const quantity  = qEl ? qEl.value : '';
  const message   = mEl ? mEl.value.trim() : '';

  if (!firstName)                { showFormMsg('error', 'Please enter your first name.');                                     fEl.focus(); return; }
  if (!fromEmail)                { showFormMsg('error', 'Please enter your email address.');                                  eEl.focus(); return; }
  if (!validateEmail(fromEmail)) { showFormMsg('error', 'Please enter a valid email address — e.g. you@company.ae');         eEl.focus(); return; }

  ['formErrorMsg', 'formSuccessMsg'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const origText           = btn.textContent;
  btn.textContent          = '⏳ Sending...';
  btn.style.background     = '#6B7280';
  btn.disabled             = true;

  const payload = {
    access_key: '66ae1d74-4646-47e5-8dac-78dc3a751fb0',
    subject:    'New Uniform Enquiry — ' + firstName + ' ' + lastName + (company ? ' · ' + company : ''),
    from_name:  'House of Panache Website',
    name:       firstName + ' ' + lastName,
    email:      fromEmail,
    phone:      phone    || 'Not provided',
    company:    company  || 'Not provided',
    service:    service  || 'Not specified',
    quantity:   quantity || 'Not specified',
    message:    message  || 'No additional message provided',
    botcheck:   ''
  };

  try {
    const res  = await fetch('https://api.web3forms.com/submit', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body:    JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Network error ' + res.status);
    const data = await res.json();

    if (data.success) {
      btn.textContent      = '✓ Message Sent!';
      btn.style.background = '#2D5E44';
      [fEl, lEl, cEl, eEl, pEl, mEl].forEach(el => { if (el) el.value = ''; });
      if (sEl) sEl.selectedIndex = 0;
      if (qEl) qEl.selectedIndex = 0;
      showFormMsg('success', "Thank you! We'll be in touch within 2 business hours.");
      setTimeout(() => {
        btn.textContent      = origText;
        btn.style.background = '';
        btn.disabled         = false;
        const ok = document.getElementById('formSuccessMsg');
        if (ok) ok.style.display = 'none';
      }, 6000);
    } else {
      throw new Error(data.message || 'Server rejected submission');
    }

  } catch (err) {
    console.error('Form error:', err);
    btn.textContent      = origText;
    btn.style.background = '';
    btn.disabled         = false;

    const waText = encodeURIComponent(
      'Hello, I would like to enquire about your uniform services.' +
      '\n\nName: '    + firstName + ' ' + lastName +
      '\nCompany: '  + (company  || 'N/A') +
      '\nEmail: '    + fromEmail +
      '\nPhone: '    + (phone    || 'N/A') +
      '\nService: '  + (service  || 'N/A') +
      '\nQuantity: ' + (quantity || 'N/A') +
      (message ? '\nRequirements: ' + message : '')
    );

    showFormMsg('error',
      'Could not send email — please ' +
      '<a href="https://wa.me/971506178806?text=' + waText + '" target="_blank" style="color:#DC2626;font-weight:700;text-decoration:underline;">send via WhatsApp</a> ' +
      'or email <a href="mailto:info@houseofpanache.ae" style="color:#DC2626;font-weight:700;">info@houseofpanache.ae</a> directly.'
    );
  }
}

/* ============================================================
   DOM READY — kick everything off
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initProcess();
  initStars();
  initHeroGSAP();
  loadReviews().then(() => startRevAuto());

  setTimeout(() => {
    showToast({
      icon: '✦', iconClass: 'green',
      title: 'House of Panache',
      msg: "UAE's premium uniform manufacturer",
      duration: 5000
    });
  }, 1800);
});
