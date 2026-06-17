/* ============================================================================
   pillar-cards.js — the SIX pillar cards, made into live "how it works" minis
   on the this.live umbrella landing ("One decentralized system. Six pillars.").

   One small shared engine, six choreographies — the same alphabet as the per-
   pillar page heroes (00-DESIGN-SYSTEM.md §4.2), shrunk to a card-sized figure:
     · maestro  — a prompt arrives, candidate model-lanes score, ONE is SELECTED.
     · mnemos   — scattered data dots FILE into a small hierarchy of scoped bins.
     · fabric   — one request FANS OUT across nodes in parallel (beats the trickle).
     · surfaces — many scattered tool-windows NEST into ONE app card.
     · forge    — labels → a factory node → a better adapter glyph that LOOPS back.
     · cortex   — a small living MESH of nodes (the decentralized fleet).

   House rules (the loved this.live substrate, §4.1):
   per-card <canvas> · DPR cap 2 · debounced resize · colors ONLY via the card's
   own --hue / the system --accent read with getComputedStyle (no literal hex in
   the motion) · low-contrast (fills 5–10%, lines ≤8%, the one accent ≤~26% for a
   beat) · eased, never snapped · plays ONLY while hovered OR scrolled into view
   (IntersectionObserver) — paused otherwise and when the tab is hidden · ~one
   calm loop · degrades < ~150px wide · prefers-reduced-motion → ONE static
   composed frame · zero deps · CSP-safe (no inline-eval). Does NOT touch hero.js
   (the umbrella mesh) or any per-pillar page hero.
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* identify each card by its destination, map to a choreography key */
  var ROUTES = [
    { sel: 'a.pillar[href^="/maestro"]',  key: 'maestro'  },
    { sel: 'a.pillar[href^="/mnemos"]',   key: 'mnemos'   },
    { sel: 'a.pillar[href^="/fabric"]',   key: 'fabric'   },
    { sel: 'a.pillar[href^="/surfaces"]', key: 'surfaces' },
    { sel: 'a.pillar[href^="/forge"]',    key: 'forge'    },
    { sel: 'a.pillar[href^="/cortex"]',   key: 'cortex'   }
  ];

  function hexToRgb(hex) {
    hex = (hex || '').trim();
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (m) return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
    var s = /rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(hex);
    return s ? { r: +s[1] | 0, g: +s[2] | 0, b: +s[3] | 0 } : null;
  }
  function rgba(c, a) { return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + a + ')'; }
  // expo-out, the house ease (≈ cubic-bezier(.22,1,.36,1))
  function ease(t) { t = t < 0 ? 0 : t > 1 ? 1 : t; return 1 - Math.pow(1 - t, 3); }
  function clamp01(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }
  // smooth 0→1→0 pulse over a [s,e] window of phase p
  function pulse(p, s, e) {
    if (p < s || p > e) return 0;
    var k = (p - s) / (e - s);
    return Math.sin(k * Math.PI);
  }

  function Card(el, key) {
    this.el = el;
    this.key = key;
    this.canvas = null;
    this.ctx = null;
    this.w = 0; this.h = 0; this.dpr = 1; this.small = false;
    this.raf = 0;
    this.t0 = 0; this.last = 0; this.phase = 0;
    this.hover = false;
    this.onScreen = false;
    this.running = false;
    this.ACCENT = { r: 45, g: 226, b: 255 };
    this.HUE = { r: 45, g: 226, b: 255 };
    this.PAPER = { r: 243, g: 246, b: 251 };
    this.seed = Math.random() * 1000;
    this.build();
  }

  Card.prototype.build = function () {
    var fig = document.createElement('div');
    fig.className = 'pillar-fig';
    fig.setAttribute('aria-hidden', 'true');
    var c = document.createElement('canvas');
    c.className = 'pillar-fig-canvas';
    fig.appendChild(c);
    // place the figure right under the icon/badge row, above the name
    var top = this.el.querySelector('.pillar-top');
    if (top && top.nextSibling) this.el.insertBefore(fig, top.nextSibling);
    else if (top) this.el.appendChild(fig);
    else this.el.insertBefore(fig, this.el.firstChild);
    this.fig = fig;
    this.canvas = c;
    this.ctx = c.getContext('2d', { alpha: true });

    // resolve colors from the CARD's own cascade (its --hue) + system --accent
    var cs = getComputedStyle(this.el);
    this.HUE = hexToRgb(cs.getPropertyValue('--hue')) || this.HUE;
    this.ACCENT = hexToRgb(cs.getPropertyValue('--accent')) || this.ACCENT;
    this.PAPER = hexToRgb(cs.getPropertyValue('--text')) || this.PAPER;
    this.FONT = (cs.getPropertyValue('--font-mono') || 'monospace').trim() || 'monospace';

    this.measure();
    this.layout();
  };

  Card.prototype.measure = function () {
    if (!this.canvas) return;
    var rect = this.fig.getBoundingClientRect();
    var w = Math.max(1, Math.round(rect.width));
    var h = Math.max(1, Math.round(rect.height));
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = w; this.h = h;
    this.small = w < 150;
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  };

  /* precompute per-pillar geometry (cheap, recomputed on resize) */
  Card.prototype.layout = function () {
    var w = this.w, h = this.h;
    var key = this.key;
    var G = {};
    if (key === 'maestro') {
      G.junction = { x: w * 0.26, y: h * 0.5 };
      var n = this.small ? 3 : 4;
      G.lanes = [];
      for (var i = 0; i < n; i++) {
        var f = n === 1 ? 0.5 : i / (n - 1);
        G.lanes.push({ x: w * 0.84, y: h * (0.22 + 0.56 * f) });
      }
    } else if (key === 'mnemos') {
      // a tiny hierarchy: root (protected) → 2–3 scoped children → filed rows
      var kids = this.small ? 2 : 3;
      G.root = { x: w * 0.5, y: h * 0.20 };
      G.bins = [];
      for (var b = 0; b < kids; b++) {
        var fb = kids === 1 ? 0.5 : b / (kids - 1);
        G.bins.push({ x: w * (0.20 + 0.60 * fb), y: h * 0.62, filled: 0 });
      }
    } else if (key === 'fabric') {
      var pn = this.small ? 4 : 6;
      G.src = { x: w * 0.14, y: h * 0.5 };
      G.nodes = [];
      for (var p = 0; p < pn; p++) {
        var fp = pn === 1 ? 0.5 : p / (pn - 1);
        G.nodes.push({ x: w * 0.80, y: h * (0.16 + 0.68 * fp) });
      }
      G.serial = { x: w * 0.80, y: h * 0.93 }; // the lone trudging serial pulse track
    } else if (key === 'surfaces') {
      var wn = this.small ? 6 : 9;
      G.windows = [];
      for (var k = 0; k < wn; k++) {
        var ang = (k / wn) * Math.PI * 2 + this.seed;
        var rad = Math.min(w, h) * (0.28 + 0.12 * ((k % 3) / 2));
        G.windows.push({
          ox: w * 0.5 + Math.cos(ang) * rad,
          oy: h * 0.5 + Math.sin(ang) * rad * 0.7,
          w: this.small ? 12 : 16, h: this.small ? 8 : 11
        });
      }
      G.dock = { x: w * 0.5, y: h * 0.5, w: this.small ? 30 : 40, h: this.small ? 20 : 26 };
    } else if (key === 'forge') {
      G.labels = [];
      var ln = this.small ? 4 : 6;
      for (var l = 0; l < ln; l++) {
        G.labels.push({ x: w * 0.10, y: h * (0.22 + 0.56 * (l / (ln - 1 || 1))) });
      }
      G.factory = { x: w * 0.5, y: h * 0.5, r: this.small ? 10 : 13 };
      G.adapter = { x: w * 0.86, y: h * 0.5 };
    } else { // cortex — a small living mesh
      var mn = this.small ? 5 : 7;
      G.mesh = [];
      for (var mI = 0; mI < mn; mI++) {
        var aa = (mI / mn) * Math.PI * 2 + this.seed * 0.3;
        var rr = Math.min(w, h) * (mI === 0 ? 0 : 0.34);
        G.mesh.push({
          bx: w * 0.5 + Math.cos(aa) * rr,
          by: h * 0.5 + Math.sin(aa) * rr * 0.78,
          ph: Math.random() * Math.PI * 2,
          amp: 2 + Math.random() * 3,
          live: mI % 3 // 0 hue, 1 accent, 2 paper — honest status spread
        });
      }
    }
    this.G = G;
  };

  /* ---- gating: run only while (hovered OR on-screen) AND tab visible ------ */
  Card.prototype.evaluate = function () {
    if (reduce) return; // static-only; never animates
    var want = (this.hover || this.onScreen) && !document.hidden;
    if (want && !this.running) { this.start(); }
    else if (!want && this.running) { this.stop(); }
  };
  Card.prototype.start = function () {
    if (this.running) return;
    this.running = true;
    var self = this;
    this.t0 = 0; this.last = 0;
    var frame = function (ts) {
      if (!self.running) return;
      if (!self.t0) { self.t0 = ts; self.last = ts; }
      var dt = Math.min(0.05, (ts - self.last) / 1000); self.last = ts;
      // hover plays a touch livelier; in-view ambient is calm
      self.phase += dt * (self.hover ? 0.16 : 0.11);
      if (self.phase > 1) self.phase -= 1;
      self.draw(self.phase);
      self.raf = requestAnimationFrame(frame);
    };
    this.raf = requestAnimationFrame(frame);
  };
  Card.prototype.stop = function () {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    // settle on a composed frame so a paused card still reads as the diagram
    this.draw(this.staticPhase());
  };
  Card.prototype.staticPhase = function () {
    // the "decided / filed / nested / served" beat for each pillar
    return ({ maestro: 0.74, mnemos: 0.82, fabric: 0.72, surfaces: 0.80, forge: 0.78, cortex: 0.5 })[this.key];
  };

  /* ---- the six choreographies ------------------------------------------- */
  Card.prototype.draw = function (p) {
    var ctx = this.ctx; if (!ctx) return;
    ctx.clearRect(0, 0, this.w, this.h);
    var fn = this['draw_' + this.key];
    if (fn) fn.call(this, ctx, p);
  };

  function node(ctx, x, y, r, fill, line, lw) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (line) { ctx.lineWidth = lw || 1; ctx.strokeStyle = line; ctx.stroke(); }
  }
  function lineTo(ctx, a, b, color, lw) {
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = color; ctx.lineWidth = lw || 1; ctx.stroke();
  }

  // maestro — prompt → junction → candidate lanes score → ONE selected
  Card.prototype.draw_maestro = function (ctx, p) {
    var G = this.G, HUE = this.HUE, AC = this.ACCENT, PAPER = this.PAPER;
    var chosen = Math.floor(this.seed) % G.lanes.length;
    // the request travels in over the first beat
    var arrive = ease(clamp01(p / 0.22));
    // candidate lanes fan + each "scores" (a faint fill swell), staggered
    for (var i = 0; i < G.lanes.length; i++) {
      var L = G.lanes[i];
      var score = pulse(p, 0.24, 0.6) * (0.04 + 0.04 * ((i + 1) / G.lanes.length));
      var isChosen = i === chosen;
      var pick = isChosen ? ease(clamp01((p - 0.58) / 0.22)) : 0;
      var dim = isChosen ? 0 : ease(clamp01((p - 0.58) / 0.22)) * 0.5;
      // lane line
      var laneA = 0.05 + score + pick * 0.18 - dim * 0.035;
      lineTo(ctx, G.junction, L, rgba(isChosen ? AC : PAPER, Math.max(0.025, laneA)), isChosen ? (1 + pick) : 1);
      // candidate node
      node(ctx, L.x, L.y, 3 + pick * 1.5,
        rgba(isChosen ? AC : PAPER, 0.06 + score + pick * 0.2),
        rgba(isChosen ? AC : PAPER, 0.12 + pick * 0.3), 1);
    }
    // junction
    node(ctx, G.junction.x, G.junction.y, 4, rgba(PAPER, 0.08), rgba(HUE, 0.3), 1);
    // the cyan request dot arriving at the junction
    var sx = -6 + (G.junction.x + 6) * arrive;
    node(ctx, sx, G.junction.y, 2.6, rgba(AC, 0.9), null);
    // decision_id receipt mark
    var rec = ease(clamp01((p - 0.72) / 0.2));
    if (rec > 0.01 && !this.small) {
      ctx.font = '8px ' + this.FONT;
      ctx.textBaseline = 'middle';
      ctx.fillStyle = rgba(AC, 0.45 * rec);
      ctx.fillText('id:7f3a', G.lanes[chosen].x - 30, G.lanes[chosen].y - 11);
    }
  };

  // mnemos — scattered dots FILE into a small hierarchy of scoped bins
  Card.prototype.draw_mnemos = function (ctx, p) {
    var G = this.G, HUE = this.HUE, AC = this.ACCENT, PAPER = this.PAPER;
    // protected root → bins (the hierarchy)
    for (var b = 0; b < G.bins.length; b++) {
      lineTo(ctx, G.root, G.bins[b], rgba(HUE, 0.07), 1);
    }
    // arriving data dots, each homing to a bin and snapping filed
    var N = this.small ? 5 : 8;
    for (var i = 0; i < N; i++) {
      var local = (p + i / N) % 1;            // staggered, continuous arrival
      var bin = G.bins[i % G.bins.length];
      var startX = bin.x + (((i * 37) % 100) / 100 - 0.5) * this.w * 0.7;
      var startY = -4 - (i % 3) * 6;
      var travel = ease(clamp01(local / 0.7));
      var x = startX + (bin.x - startX) * travel;
      var y = startY + (bin.y - 6 - startY) * travel;
      var filed = local > 0.7;
      var a = filed ? 0.5 : 0.18 + 0.4 * travel;
      node(ctx, x, y, filed ? 1.6 : 2, rgba(AC, a), null);
    }
    // bins accumulate a small filled stack (memory survives across the loop)
    for (var k = 0; k < G.bins.length; k++) {
      var B = G.bins[k];
      var bw = this.small ? 12 : 16, bh = this.small ? 12 : 15;
      ctx.strokeStyle = rgba(HUE, 0.22);
      ctx.lineWidth = 1;
      ctx.strokeRect(B.x - bw / 2, B.y - bh / 2, bw, bh);
      var rows = 2 + ((k + Math.floor(p * 3)) % 3);
      for (var r = 0; r < rows; r++) {
        ctx.fillStyle = rgba(PAPER, 0.06 + (r === rows - 1 ? 0.06 : 0));
        ctx.fillRect(B.x - bw / 2 + 2, B.y + bh / 2 - 3 - r * 3, bw - 4, 1.6);
      }
    }
    // root node — write-protected (never receives the cyan write)
    node(ctx, G.root.x, G.root.y, 4, rgba(PAPER, 0.06), rgba(HUE, 0.34), 1.2);
  };

  // fabric — one request FANS OUT to nodes in parallel; serial pulse trudges
  Card.prototype.draw_fabric = function (ctx, p) {
    var G = this.G, HUE = this.HUE, AC = this.ACCENT, PAPER = this.PAPER;
    var fan = ease(clamp01((p - 0.08) / 0.3)); // lines reach out together
    for (var i = 0; i < G.nodes.length; i++) {
      var Nd = G.nodes[i];
      lineTo(ctx, G.src, Nd, rgba(PAPER, 0.05 + 0.03 * fan), 1);
      // a cyan pulse races out each lane simultaneously
      var tp = clamp01((p - 0.12) / 0.34);
      var px = G.src.x + (Nd.x - G.src.x) * ease(tp);
      var py = G.src.y + (Nd.y - G.src.y) * ease(tp);
      if (tp > 0 && tp < 1) node(ctx, px, py, 1.6, rgba(AC, 0.7), null);
      // each node ticks DONE in the first half (parallel speed)
      var done = ease(clamp01((p - 0.46 - i * 0.01) / 0.16));
      node(ctx, Nd.x, Nd.y, 3, rgba(PAPER, 0.06 + done * 0.06), rgba(HUE, 0.16 + done * 0.22), 1);
      if (done > 0.5 && !this.small) {
        ctx.strokeStyle = rgba(AC, 0.6 * done); ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(Nd.x - 1.6, Nd.y); ctx.lineTo(Nd.x - 0.3, Nd.y + 1.4); ctx.lineTo(Nd.x + 1.8, Nd.y - 1.8);
        ctx.stroke();
      }
    }
    // the lone SERIAL pulse still trudging node-to-node (slower, never finishes)
    var serT = (p * 0.55) % 1;
    var sN = Math.floor(serT * G.nodes.length);
    var sF = serT * G.nodes.length - sN;
    var a0 = sN === 0 ? G.src : { x: G.src.x, y: G.serial.y };
    var aN = { x: G.nodes[Math.min(sN, G.nodes.length - 1)].x, y: G.serial.y };
    lineTo(ctx, { x: G.src.x, y: G.serial.y }, { x: G.nodes[G.nodes.length - 1].x, y: G.serial.y }, rgba(PAPER, 0.04), 1);
    var serX = G.src.x + (G.nodes[G.nodes.length - 1].x - G.src.x) * serT;
    node(ctx, serX, G.serial.y, 1.6, rgba(PAPER, 0.28), null);
    // source
    node(ctx, G.src.x, G.src.y, 3.4, rgba(AC, 0.5), rgba(AC, 0.3), 1);
  };

  // surfaces — scattered tool-windows NEST into ONE unified app card
  Card.prototype.draw_surfaces = function (ctx, p) {
    var G = this.G, HUE = this.HUE, AC = this.ACCENT, PAPER = this.PAPER;
    var gather = ease(clamp01((p - 0.1) / 0.45)); // drift → nest
    var dissolve = ease(clamp01((p - 0.78) / 0.18)); // settle then loop back out
    var D = G.dock;
    for (var i = 0; i < G.windows.length; i++) {
      var W = G.windows[i];
      // small idle Brownian drift while scattered
      var dx = Math.cos(p * 6.28 + i) * (1 - gather) * 2;
      var dy = Math.sin(p * 6.28 + i * 1.3) * (1 - gather) * 2;
      var tx = W.ox + (D.x - W.ox) * gather + dx;
      var ty = W.oy + (D.y - W.oy) * gather + dy;
      var a = 0.05 + 0.03 * (1 - gather) - dissolve * 0.04;
      ctx.strokeStyle = rgba(PAPER, Math.max(0.02, 0.12 - gather * 0.06 - dissolve * 0.05));
      ctx.fillStyle = rgba(PAPER, Math.max(0, a));
      var ww = W.w * (1 - gather * 0.4), wh = W.h * (1 - gather * 0.4);
      ctx.fillRect(tx - ww / 2, ty - wh / 2, ww, wh);
      ctx.lineWidth = 1; ctx.strokeRect(tx - ww / 2, ty - wh / 2, ww, wh);
    }
    // the ONE unified card forming at center
    var form = gather * (1 - dissolve);
    if (form > 0.02) {
      ctx.fillStyle = rgba(PAPER, 0.05 * form);
      ctx.strokeStyle = rgba(HUE, 0.18 + 0.16 * form);
      ctx.lineWidth = 1.2;
      ctx.fillRect(D.x - D.w / 2, D.y - D.h / 2, D.w, D.h);
      ctx.strokeRect(D.x - D.w / 2, D.y - D.h / 2, D.w, D.h);
      // a title bar hairline
      ctx.strokeStyle = rgba(HUE, 0.22 * form);
      ctx.beginPath(); ctx.moveTo(D.x - D.w / 2, D.y - D.h / 2 + 5); ctx.lineTo(D.x + D.w / 2, D.y - D.h / 2 + 5); ctx.stroke();
    }
    // soft cyan pulse-ring when it nests
    var ring = pulse(p, 0.52, 0.74);
    if (ring > 0.01) {
      ctx.strokeStyle = rgba(AC, 0.35 * ring); ctx.lineWidth = 1.4;
      node(ctx, D.x, D.y, (D.w * 0.5) + ring * 12, null, rgba(AC, 0.35 * ring), 1.4);
    }
  };

  // forge — labels → factory node brightens notch-by-notch → adapter LOOPS back
  Card.prototype.draw_forge = function (ctx, p) {
    var G = this.G, HUE = this.HUE, AC = this.ACCENT, PAPER = this.PAPER;
    var F = G.factory;
    // labels stream into the factory (a converging train)
    for (var i = 0; i < G.labels.length; i++) {
      var Lb = G.labels[i];
      lineTo(ctx, Lb, F, rgba(PAPER, 0.05), 1);
      var lp = (p * 1.0 + i / G.labels.length) % 1;
      var t = clamp01(lp / 0.55);
      var x = Lb.x + (F.x - Lb.x) * ease(t);
      var y = Lb.y + (F.y - Lb.y) * ease(t);
      if (t < 1) node(ctx, x, y, 1.5, rgba(PAPER, 0.3 + 0.3 * (1 - t)), null);
      node(ctx, Lb.x, Lb.y, 1.8, rgba(PAPER, 0.12), null);
    }
    // factory node brightens notch-by-notch as it "converges"
    var notch = Math.floor((p % 1) * 4) / 4; // 0,.25,.5,.75
    node(ctx, F.x, F.y, F.r, rgba(PAPER, 0.05 + notch * 0.05), rgba(HUE, 0.18 + notch * 0.2), 1.2);
    // inner ring shows convergence level
    ctx.strokeStyle = rgba(AC, 0.25 + notch * 0.25); ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(F.x, F.y, F.r - 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * notch); ctx.stroke();
    // a served-adapter glyph emitted to the right after a beat
    var emit = ease(clamp01((p - 0.55) / 0.2));
    if (emit > 0.02) {
      var ax = F.x + (G.adapter.x - F.x) * emit;
      lineTo(ctx, F, { x: ax, y: F.y }, rgba(AC, 0.18 * emit), 1);
      // adapter glyph (a small rounded square = the served weight)
      var s = 4 + emit * 1.5;
      ctx.strokeStyle = rgba(AC, 0.55 * emit); ctx.lineWidth = 1.3;
      ctx.strokeRect(ax - s, F.y - s, s * 2, s * 2);
      node(ctx, ax, F.y, 1.4, rgba(AC, 0.7 * emit), null);
    }
    // the RECURSIVE loop-back arc: the better adapter feeds the factory again
    var loop = ease(clamp01((p - 0.78) / 0.2));
    if (loop > 0.02 && !this.small) {
      ctx.strokeStyle = rgba(HUE, 0.3 * loop); ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(G.adapter.x, F.y + 2);
      ctx.quadraticCurveTo(F.x + (G.adapter.x - F.x) / 2, this.h * 0.92, F.x, F.y + F.r);
      ctx.stroke();
    }
  };

  // cortex — a small living MESH of nodes (the decentralized fleet)
  Card.prototype.draw_cortex = function (ctx, p) {
    var G = this.G, HUE = this.HUE, AC = this.ACCENT, PAPER = this.PAPER;
    var pts = [];
    for (var i = 0; i < G.mesh.length; i++) {
      var M = G.mesh[i];
      pts.push({
        x: M.bx + Math.cos(p * 6.28 + M.ph) * M.amp,
        y: M.by + Math.sin(p * 6.28 + M.ph) * M.amp,
        live: M.live
      });
    }
    // lines breathe between nearest pairs
    var maxD = Math.min(this.w, this.h) * 0.5;
    for (var a = 0; a < pts.length; a++) {
      for (var b = a + 1; b < pts.length; b++) {
        var dx = pts[a].x - pts[b].x, dy = pts[a].y - pts[b].y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < maxD) {
          var al = (1 - d / maxD) * 0.07;
          lineTo(ctx, pts[a], pts[b], rgba(PAPER, al), 1);
        }
      }
    }
    // a slow signal traverses one edge (the fleet is alive)
    var li = Math.floor(p * pts.length) % pts.length;
    var lj = (li + 2) % pts.length;
    var sp = (p * pts.length) % 1;
    var sx = pts[li].x + (pts[lj].x - pts[li].x) * sp;
    var sy = pts[li].y + (pts[lj].y - pts[li].y) * sp;
    node(ctx, sx, sy, 1.6, rgba(AC, 0.6), null);
    // nodes with honest status hues (live = hue/accent, others paper)
    for (var n = 0; n < pts.length; n++) {
      var P = pts[n];
      var col = P.live === 1 ? AC : P.live === 0 ? HUE : PAPER;
      var br = 0.06 + 0.04 * (0.5 + 0.5 * Math.sin(p * 6.28 + n));
      node(ctx, P.x, P.y, n === 0 ? 4 : 3, rgba(PAPER, 0.05),
        rgba(col, 0.2 + br), n === 0 ? 1.4 : 1);
      if (P.live !== 2) node(ctx, P.x, P.y, 1.3, rgba(col, 0.4 + br), null);
    }
  };

  /* ---- reduced-motion: ONE static composed frame per card --------------- */
  Card.prototype.drawStatic = function () {
    this.measure(); this.layout();
    this.draw(this.staticPhase());
  };

  /* ---- wiring ------------------------------------------------------------ */
  function init() {
    var cards = [];
    ROUTES.forEach(function (r) {
      var el = document.querySelector(r.sel);
      if (el && !el.querySelector('.pillar-fig')) cards.push(new Card(el, r.key));
    });
    if (!cards.length) return;

    if (reduce) {
      cards.forEach(function (c) { c.drawStatic(); });
      // keep static frames correctly sized on resize
      var rt;
      window.addEventListener('resize', function () {
        clearTimeout(rt);
        rt = setTimeout(function () { cards.forEach(function (c) { c.drawStatic(); }); }, 180);
      }, { passive: true });
      return;
    }

    // hover gating
    cards.forEach(function (c) {
      c.el.addEventListener('mouseenter', function () { c.hover = true; c.evaluate(); });
      c.el.addEventListener('mouseleave', function () { c.hover = false; c.evaluate(); });
      // focus also counts as intent (keyboard users)
      c.el.addEventListener('focus', function () { c.hover = true; c.evaluate(); });
      c.el.addEventListener('blur', function () { c.hover = false; c.evaluate(); });
    });

    // in-view gating
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var c = cards.find(function (x) { return x.el === en.target; });
          if (!c) return;
          c.onScreen = en.isIntersecting;
          c.evaluate();
        });
      }, { threshold: 0.25 });
      cards.forEach(function (c) { io.observe(c.el); c.draw(c.staticPhase()); });
    } else {
      cards.forEach(function (c) { c.onScreen = true; c.evaluate(); });
    }

    // tab visibility pause
    document.addEventListener('visibilitychange', function () {
      cards.forEach(function (c) { c.evaluate(); });
    });

    // debounced resize → re-measure + re-layout (preserve running state)
    var rt2;
    window.addEventListener('resize', function () {
      clearTimeout(rt2);
      rt2 = setTimeout(function () {
        cards.forEach(function (c) {
          c.measure(); c.layout();
          if (!c.running) c.draw(c.staticPhase());
        });
      }, 180);
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
