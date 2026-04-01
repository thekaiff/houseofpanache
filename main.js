/* ============================================================
   HOUSE OF PANACHE — main.js
   ============================================================ */

'use strict';

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

  window.scrollTo({ top: 0 });
  setTimeout(initReveal, 80);

  if (page === 'home') {
    setTimeout(initProcess, 200);
    // Resume canvas animation when returning home
    if (window._heroAnim) window._heroAnim.resume();
  } else {
    // Pause canvas when not on home (performance)
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
   HERO CANVAS ANIMATION
   Fashion / Uniform Niche — Floating fabric threads, needle
   paths, subtle stitch patterns, draped cloth silhouettes
   Palette: deep forest greens, warm beige, white threads
   ============================================================ */
(function initHeroCanvas() {

  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, raf, paused = false;

  /* ── Resize ── */
  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  /* ── Colour palette ── */
  const PALETTE = {
    thread1: 'rgba(107,171,138,',   // soft green thread
    thread2: 'rgba(255,255,255,',   // white thread
    thread3: 'rgba(212,200,187,',   // beige thread
    thread4: 'rgba(61,122,90,',     // deep green accent
    particle:'rgba(245,240,232,',   // cream particle
  };

  /* ─────────────────────────────────────────
     THREADS — smooth bezier curves that drift
     like threads caught in a gentle breeze
  ───────────────────────────────────────── */
  class Thread {
    constructor() { this.init(); }

    init() {
      this.x      = Math.random() * W;
      this.y      = Math.random() * H;
      this.length = 80 + Math.random() * 200;
      this.angle  = Math.random() * Math.PI * 2;
      this.speed  = 0.0003 + Math.random() * 0.0005;
      this.drift  = (Math.random() - 0.5) * 0.0008;
      this.wave   = Math.random() * Math.PI * 2; // phase
      this.waveAmp= 20 + Math.random() * 40;
      this.waveSpd= 0.0008 + Math.random() * 0.001;
      this.thick  = 0.5 + Math.random() * 1.2;
      this.life   = 0;
      this.maxLife= 300 + Math.random() * 400;
      // pick colour
      const r = Math.random();
      if      (r < 0.35) this.col = PALETTE.thread1;
      else if (r < 0.60) this.col = PALETTE.thread2;
      else if (r < 0.82) this.col = PALETTE.thread3;
      else               this.col = PALETTE.thread4;
    }

    draw(t) {
      this.life++;
      if (this.life > this.maxLife) { this.init(); return; }

      // fade in/out
      const progress = this.life / this.maxLife;
      const alpha = progress < 0.15
        ? progress / 0.15
        : progress > 0.85
          ? (1 - progress) / 0.15
          : 1;

      // drift angle slowly
      this.angle += this.drift;

      const ox = Math.cos(this.angle);
      const oy = Math.sin(this.angle);

      // perpendicular for wave offset
      const px = -oy;
      const py =  ox;

      const wave = Math.sin(t * this.waveSpd + this.wave) * this.waveAmp;

      // start point
      const sx = this.x + ox * (-this.length * 0.5) + px * wave * 0.3;
      const sy = this.y + oy * (-this.length * 0.5) + py * wave * 0.3;

      // end point
      const ex = this.x + ox * (this.length * 0.5) + px * wave * 0.3;
      const ey = this.y + oy * (this.length * 0.5) + py * wave * 0.3;

      // control point for bezier (creates the drape)
      const cx1 = this.x + px * wave;
      const cy1 = this.y + py * wave;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(cx1, cy1, ex, ey);
      ctx.strokeStyle = this.col + (alpha * 0.55) + ')';
      ctx.lineWidth   = this.thick;
      ctx.lineCap     = 'round';
      ctx.stroke();

      // slow movement across canvas
      this.x += ox * 0.18;
      this.y += oy * 0.18;

      // wrap edges
      if (this.x < -200) this.x = W + 100;
      if (this.x >  W + 200) this.x = -100;
      if (this.y < -200) this.y = H + 100;
      if (this.y >  H + 200) this.y = -100;
    }
  }

  /* ─────────────────────────────────────────
     STITCH DOTS — evenly spaced dots that
     simulate a running stitch pattern
  ───────────────────────────────────────── */
  class StitchLine {
    constructor() { this.init(); }

    init() {
      this.x     = Math.random() * W;
      this.y     = Math.random() * H;
      this.len   = 60 + Math.random() * 120;
      this.angle = (Math.random() < 0.5 ? 0 : Math.PI / 4) + (Math.random() - 0.5) * 0.3;
      this.gap   = 8 + Math.random() * 8;
      this.dashW = 4 + Math.random() * 6;
      this.life  = 0;
      this.maxLife = 200 + Math.random() * 300;
      this.speed = 0.0002 + Math.random() * 0.0003;
      this.thick = 0.6 + Math.random() * 0.8;
      const r = Math.random();
      this.col   = r < 0.5 ? PALETTE.thread2 : r < 0.75 ? PALETTE.thread3 : PALETTE.thread1;
    }

    draw() {
      this.life++;
      if (this.life > this.maxLife) { this.init(); return; }

      const p = this.life / this.maxLife;
      const alpha = p < 0.12 ? p / 0.12 : p > 0.88 ? (1 - p) / 0.12 : 1;

      const ox = Math.cos(this.angle);
      const oy = Math.sin(this.angle);
      const total = this.len;
      const step  = this.dashW + this.gap;
      const count = Math.floor(total / step);

      ctx.fillStyle = this.col + (alpha * 0.35) + ')';
      for (let i = 0; i < count; i++) {
        const d  = i * step;
        const x1 = this.x + ox * d;
        const y1 = this.y + oy * d;
        ctx.beginPath();
        ctx.roundRect
          ? ctx.roundRect(x1 - this.dashW / 2, y1 - this.thick / 2, this.dashW, this.thick, 1)
          : ctx.rect(x1 - this.dashW / 2, y1 - this.thick / 2, this.dashW, this.thick);
        ctx.fill();
      }

      // drift slowly
      this.x += Math.cos(this.angle + Math.PI / 2) * 0.08;
      this.y += Math.sin(this.angle + Math.PI / 2) * 0.08;
    }
  }

  /* ─────────────────────────────────────────
     FLOATING PARTICLES — tiny dust motes /
     fabric micro-fibres
  ───────────────────────────────────────── */
  class Particle {
    constructor() { this.init(); }

    init() {
      this.x    = Math.random() * W;
      this.y    = Math.random() * H;
      this.r    = 0.5 + Math.random() * 1.8;
      this.vx   = (Math.random() - 0.5) * 0.25;
      this.vy   = -0.08 - Math.random() * 0.18;
      this.life = 0;
      this.maxLife = 180 + Math.random() * 220;
      this.col  = Math.random() < 0.6 ? PALETTE.particle : PALETTE.thread2;
    }

    draw() {
      this.life++;
      if (this.life > this.maxLife) { this.init(); return; }

      const p = this.life / this.maxLife;
      const alpha = p < 0.15 ? p / 0.15 : p > 0.80 ? (1 - p) / 0.20 : 1;

      this.x += this.vx;
      this.y += this.vy;

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.col + (alpha * 0.40) + ')';
      ctx.fill();
    }
  }

  /* ─────────────────────────────────────────
     NEEDLE PATH — occasional long thin arc
     simulating a needle's path through fabric
  ───────────────────────────────────────── */
  class NeedlePath {
    constructor() { this.init(); }

    init() {
      this.x      = Math.random() * W;
      this.y      = Math.random() * H;
      this.len    = 30 + Math.random() * 70;
      this.angle  = Math.random() * Math.PI;
      this.life   = 0;
      this.maxLife= 120 + Math.random() * 160;
      this.drawn  = 0; // animated draw progress
    }

    draw() {
      this.life++;
      if (this.life > this.maxLife) { this.init(); return; }

      const p = this.life / this.maxLife;
      const alpha = p < 0.10 ? p / 0.10 : p > 0.85 ? (1 - p) / 0.15 : 1;
      this.drawn = Math.min(1, this.drawn + 0.04);

      const ex = this.x + Math.cos(this.angle) * this.len * this.drawn;
      const ey = this.y + Math.sin(this.angle) * this.len * this.drawn;

      // needle body
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = PALETTE.thread2 + (alpha * 0.60) + ')';
      ctx.lineWidth   = 0.8;
      ctx.lineCap     = 'round';
      ctx.stroke();

      // needle eye — small circle at start
      ctx.beginPath();
      ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE.thread2 + (alpha * 0.50) + ')';
      ctx.fill();

      // needle point — tiny dot at end
      ctx.beginPath();
      ctx.arc(ex, ey, 1.0, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE.thread3 + (alpha * 0.45) + ')';
      ctx.fill();
    }
  }

  /* ─────────────────────────────────────────
     FABRIC WEAVE GRID — very faint orthogonal
     lines suggesting woven fabric structure
  ───────────────────────────────────────── */
  function drawWeaveGrid(t) {
    const spacing = 48;
    const alpha   = 0.025 + Math.sin(t * 0.0003) * 0.008;

    ctx.strokeStyle = PALETTE.thread3 + alpha + ')';
    ctx.lineWidth   = 0.4;

    // horizontal
    for (let y = 0; y < H; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    // vertical
    for (let x = 0; x < W; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
  }

  /* ── Instantiate objects ── */
  const THREAD_COUNT  = 28;
  const STITCH_COUNT  = 14;
  const PARTICLE_COUNT= 50;
  const NEEDLE_COUNT  = 6;

  const threads  = Array.from({ length: THREAD_COUNT  }, () => new Thread());
  const stitches = Array.from({ length: STITCH_COUNT  }, () => new StitchLine());
  const parts    = Array.from({ length: PARTICLE_COUNT}, () => new Particle());
  const needles  = Array.from({ length: NEEDLE_COUNT  }, () => new NeedlePath());

  // Stagger initial life so they don't all appear at once
  threads.forEach(t => { t.life  = Math.floor(Math.random() * t.maxLife); });
  stitches.forEach(s => { s.life = Math.floor(Math.random() * s.maxLife); });
  parts.forEach(p   => { p.life  = Math.floor(Math.random() * p.maxLife); });
  needles.forEach(n => { n.life  = Math.floor(Math.random() * n.maxLife); });

  /* ── Render loop ── */
  let t = 0;
  function render() {
    if (paused) return;
    raf = requestAnimationFrame(render);
    t++;

    ctx.clearRect(0, 0, W, H);

    // background: deep dark canvas (matches .hero background)
    ctx.fillStyle = '#111410';
    ctx.fillRect(0, 0, W, H);

    // subtle ambient glow — top-left and bottom-right
    const g1 = ctx.createRadialGradient(W * 0.15, H * 0.25, 0, W * 0.15, H * 0.25, W * 0.55);
    g1.addColorStop(0, 'rgba(45,94,68,0.12)');
    g1.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);

    const g2 = ctx.createRadialGradient(W * 0.82, H * 0.72, 0, W * 0.82, H * 0.72, W * 0.45);
    g2.addColorStop(0, 'rgba(61,122,90,0.07)');
    g2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);

    // weave grid (base layer)
    drawWeaveGrid(t);

    // stitch lines
    stitches.forEach(s => s.draw());

    // threads (mid layer)
    threads.forEach(th => th.draw(t));

    // needle paths
    needles.forEach(n => n.draw());

    // particles (top layer)
    parts.forEach(p => p.draw());
  }

  render();

  /* ── Expose pause/resume for page switching ── */
  window._heroAnim = {
    pause()  { paused = true;  if (raf) cancelAnimationFrame(raf); },
    resume() { if (paused) { paused = false; render(); } }
  };

})();

/* ============================================================
   PROCESS TIMELINE
   ============================================================ */
const stepDetails = [
  [
    { icon: '<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--green-light);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>', title: 'Discovery Call', desc: '30-min meeting to understand your organisation, team size, and uniform requirements in full.' },
    { icon: '<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--green-light);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><path d="M3 3h18"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M3 21h18"/></svg>', title: 'On-site Measurement', desc: 'Our team visits to take precise measurements for every staff role and body type.' },
    { icon: '<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--green-light);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>', title: 'Requirements Brief', desc: 'A detailed brief capturing brand colours, functional needs, fabric preferences, and timelines.' }
  ],
  [
    { icon: '<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--green-light);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><circle cx="13.5" cy="6.5" r="2.5"/><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>', title: 'Design Concepts', desc: '3 custom concepts presented within 5 days, fully incorporating your brand guidelines.' },
    { icon: '<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--green-light);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/></svg>', title: 'Fabric Selection', desc: 'Physical swatches delivered so you can confirm colours and feel the quality before production.' },
    { icon: '<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--green-light);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><polyline points="20 6 9 17 4 12"/></svg>', title: 'Prototype Approval', desc: 'A physical sample garment is produced for fitting and sign-off before full production.' }
  ],
  [
    { icon: '<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--green-light);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><path d="M2 20h20M4 20V10l6-4v4l6-4v14"/><rect x="9" y="14" width="6" height="6"/></svg>', title: 'In-House Production', desc: 'Every garment is cut, sewn, and finished in our dedicated UAE facility using premium machinery.' },
    { icon: '<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--green-light);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>', title: '12-Point QC Check', desc: 'Each garment is inspected for stitching, colour, sizing, and finish before leaving production.' },
    { icon: '<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--green-light);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>', title: 'Packing & Labelling', desc: 'Orders are individually labelled by size and department, ready for seamless distribution.' }
  ],
  [
    { icon: '<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--green-light);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>', title: 'UAE-Wide Dispatch', desc: 'Tracked delivery to all 7 Emirates within the agreed timeline — no exceptions.' },
    { icon: '<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--green-light);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>', title: 'Aftercare Support', desc: 'Post-delivery assistance for any adjustments, reorders, or new-hire additions.' },
    { icon: '<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:var(--green-light);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>', title: 'Inventory Management', desc: 'Ongoing stock management ensures your team is always fully uniformed across all departments.' }
  ]
];

let _activeStepIdx = 0;
let _processCycleTimer = null;

function activateStep(idx) {
  _activeStepIdx = idx;

  document.querySelectorAll('.step').forEach((s, i) => {
    s.classList.remove('active', 'done');
    if (i < idx) s.classList.add('done');
    if (i === idx) s.classList.add('active');
  });

  const prog = document.getElementById('tlProg');
  if (prog) {
    const pct = idx === 0 ? 0 : (idx / 3) * 100;
    prog.style.width = pct + '%';
  }

  const panel = document.getElementById('stepDetail');
  if (!panel) return;

  const data = stepDetails[idx];
  panel.className = 'step-detail show';
  panel.innerHTML = data.map(d => `
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
  {
    name: 'Ahmed Al Kaabi',
    role: 'HR Director · Dubai Corporation',
    rating: 5,
    text: 'House of Panache transformed how our team presents themselves. Quality across 200 uniforms was exceptional — consistent, on-time, and exactly what our brand demanded.',
    ts: Date.now() - 9000000
  },
  {
    name: 'Khalid Al Ameri',
    role: 'Operations Manager · Fitness & Wellness Group',
    rating: 5,
    text: 'Our fitness centre staff across four locations wear uniforms that truly reflect our brand energy. The fabric quality and colour consistency order after order is simply unmatched.',
    ts: Date.now() - 8000000
  },
  {
    name: 'Rania Hassan',
    role: 'GM · Luxury Hotels Group',
    rating: 5,
    text: 'Our hospitality staff across three properties wear uniforms that genuinely reflect our luxury brand. The embroidery work and fabric quality are truly extraordinary.',
    ts: Date.now() - 7000000
  },
  {
    name: 'Dr. Mohammed Nasser',
    role: 'Ops Manager · Private Hospital',
    rating: 5,
    text: 'Medical scrubs that fit properly during 12-hour shifts changed everything for our team. The breathable fabric showed they truly understand healthcare requirements.',
    ts: Date.now() - 6000000
  }
];

function perView()    { return window.innerWidth < 768 ? 1 : 2; }
function totalPages() { return Math.max(1, Math.ceil(allReviews.length / perView())); }

function moveRev(d) {
  rIdx = Math.max(0, Math.min(totalPages() - 1, rIdx + d));
  renderRev();
}

function goRev(i) {
  rIdx = i;
  renderRev();
}

function renderRev() {
  const track   = document.getElementById('revTrack');
  const dotsEl  = document.getElementById('revDots');
  const emptyEl = document.getElementById('revEmpty');
  if (!track) return;

  // Remove existing cards (keep the empty placeholder)
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
        <div>
          <div class="r-nm">${rv.name}</div>
          <div class="r-role">${rv.role}</div>
        </div>
      </div>`;
    track.appendChild(card);
  });

  requestAnimationFrame(() => {
    const first = track.querySelector('.r-card');
    if (!first) return;
    const cardW = first.offsetWidth + 18;
    track.style.transform = `translateX(-${rIdx * cardW * perView()}px)`;
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
}

async function loadReviews() {
  try {
    const res  = await fetch(SHEET_URL, { method: 'GET' });
    const data = await res.json();
    if (data.success && Array.isArray(data.reviews) && data.reviews.length) {
      allReviews = data.reviews;
    } else {
      allReviews = [...seedReviews];
    }
  } catch {
    allReviews = [...seedReviews];
  }
  rIdx = 0;
  renderRev();
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

  // Reset message
  msgEl.className = 'rev-form-msg';

  if (!name) {
    msgEl.textContent = 'Please enter your name.';
    msgEl.className   = 'rev-form-msg err';
    return;
  }
  if (!rvRating) {
    msgEl.textContent = 'Please select a star rating.';
    msgEl.className   = 'rev-form-msg err';
    return;
  }
  if (text.length < 15) {
    msgEl.textContent = 'Please write at least 15 characters.';
    msgEl.className   = 'rev-form-msg err';
    return;
  }

  btn.disabled    = true;
  btn.textContent = 'Submitting...';

  try {
    const params = new URLSearchParams({
      name:   name,
      role:   role || 'Verified Customer',
      rating: rvRating,
      text:   text
    });

    await fetch(SHEET_URL + '?' + params.toString(), {
      method: 'GET',
      mode:   'no-cors'
    });

    // Reset form
    nameEl.value = '';
    if (roleEl) roleEl.value = '';
    textEl.value = '';
    rvRating     = 0;
    document.querySelectorAll('.rev-star').forEach(s => s.classList.remove('on'));

    msgEl.textContent = '✅ Thank you! Your review will appear after approval.';
    msgEl.className   = 'rev-form-msg ok';
    setTimeout(() => { msgEl.className = 'rev-form-msg'; }, 6000);

  } catch {
    msgEl.textContent = 'Failed to submit. Please try again.';
    msgEl.className   = 'rev-form-msg err';
  }

  btn.disabled    = false;
  btn.textContent = 'Submit Review';
}

/* Star selector */
function initStars() {
  const stars = document.querySelectorAll('.rev-star');
  stars.forEach(star => {
    star.addEventListener('click', () => {
      rvRating = parseInt(star.dataset.v);
      stars.forEach(s => s.classList.toggle('on', parseInt(s.dataset.v) <= rvRating));
    });
    star.addEventListener('mouseenter', () => {
      const v = parseInt(star.dataset.v);
      stars.forEach(s => s.classList.toggle('on', parseInt(s.dataset.v) <= v));
    });
    star.addEventListener('mouseleave', () => {
      stars.forEach(s => s.classList.toggle('on', parseInt(s.dataset.v) <= rvRating));
    });
  });
}

/* Auto-advance slider */
let _revAutoTimer = null;
function startRevAuto() {
  if (_revAutoTimer) clearInterval(_revAutoTimer);
  _revAutoTimer = setInterval(() => {
    rIdx = (rIdx + 1) % totalPages();
    renderRev();
  }, 5800);
}

window.addEventListener('resize', () => {
  rIdx = 0;
  renderRev();
}, { passive: true });

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

  el.innerHTML     = (isErr ? '⚠️ ' : '✅ ') + msg;
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

  if (!fEl || !eEl) {
    showFormMsg('error', 'Form initialisation error — please refresh the page and try again.');
    return;
  }

  const firstName = fEl.value.trim();
  const lastName  = lEl ? lEl.value.trim() : '';
  const fromEmail = eEl.value.trim();
  const company   = cEl ? cEl.value.trim() : '';
  const phone     = pEl ? pEl.value.trim() : '';
  const service   = sEl ? sEl.value : '';
  const quantity  = qEl ? qEl.value : '';
  const message   = mEl ? mEl.value.trim() : '';

  if (!firstName) { showFormMsg('error', 'Please enter your first name.'); fEl.focus(); return; }
  if (!fromEmail) { showFormMsg('error', 'Please enter your email address.'); eEl.focus(); return; }
  if (!validateEmail(fromEmail)) {
    showFormMsg('error', 'Please enter a valid email address — e.g. you@company.ae');
    eEl.focus();
    return;
  }

  // Hide stale messages
  ['formErrorMsg', 'formSuccessMsg'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const origText = btn.textContent;
  btn.textContent = '⏳ Sending...';
  btn.style.background = '#6B7280';
  btn.disabled = true;

  const ACCESS_KEY = '66ae1d74-4646-47e5-8dac-78dc3a751fb0';

  const payload = {
    access_key: ACCESS_KEY,
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
    const res = await fetch('https://api.web3forms.com/submit', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body:    JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('Network error ' + res.status);
    const data = await res.json();

    if (data.success) {
      btn.textContent      = '✓ Message Sent!';
      btn.style.background = '#2D5E44';

      // Clear all fields
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
    console.error('Form submission error:', err);
    btn.textContent      = origText;
    btn.style.background = '';
    btn.disabled         = false;

    const waText = encodeURIComponent(
      'Hello, I would like to enquire about your uniform services.' +
      '\n\nName: '     + firstName + ' ' + lastName +
      '\nCompany: '   + (company  || 'N/A') +
      '\nEmail: '     + fromEmail +
      '\nPhone: '     + (phone    || 'N/A') +
      '\nService: '   + (service  || 'N/A') +
      '\nQuantity: '  + (quantity || 'N/A') +
      (message ? '\nRequirements: ' + message : '')
    );

    showFormMsg(
      'error',
      'Could not send email — please ' +
      '<a href="https://wa.me/971506178806?text=' + waText + '" target="_blank" ' +
      'style="color:#DC2626;font-weight:700;text-decoration:underline;">send via WhatsApp</a> ' +
      'or email <a href="mailto:info@houseofpanache.ae" ' +
      'style="color:#DC2626;font-weight:700;">info@houseofpanache.ae</a> directly.'
    );
  }
}

/* ============================================================
   DOM READY — kick everything off
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  // Scroll reveal
  initReveal();

  // Process timeline (home page starts active)
  initProcess();

  // Star rating widget
  initStars();

  // Load reviews from Google Sheets
  loadReviews().then(() => startRevAuto());

});
