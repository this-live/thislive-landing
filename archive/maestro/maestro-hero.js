/* ============================================================================
   maestro — SIGNATURE HERO ANIMATION  ·  "ARRIVE → CONSIDER → SELECT → RECEIPT"
   The maestro dialect of the shared this.live animation alphabet
   (00-DESIGN-SYSTEM.md §4.2 maestro row: "route to the best lane" — one request
   dot reaches a junction; faint candidate lanes fan; the chosen lane brightens
   to cyan, the others dim; a tiny cost / decision_id mono mark fades in).

   A single prompt arrives at the Vega junction; Maestro weighs the candidate
   models/nodes (lanes fan out, each scored), SELECTS one — the chosen lane
   brightens to cyan while the rest recede — and leaves a `decision_id` receipt.
   A whisper of failover hops to the next seat ("a cap is a non-event"). A
   different candidate wins each loop, so the decision never looks scripted.
   Where fabric finishes-first and mnemos remembers, maestro CHOOSES.

   House rules obeyed (the loved this.live substrate, per 00-DESIGN-SYSTEM §4.1):
   single #heroCanvas · DPR cap 2 · debounced resize · visibilitychange +
   IntersectionObserver pause (never animates hidden/off-screen) · rAF loop ·
   colors ONLY via tok('--token') (no literal hex in the motion) · --ease
   (.22,1,.36,1) eases, never snaps · low-contrast (candidate fills 5–8%,
   candidate lanes ≤8%, the one chosen lane peaks at --accent-line 22% for a
   beat then settles) · one cyan accent only · the hero TEXT always wins ·
   prefers-reduced-motion → one static composed "decided" frame · ~18s ambient
   loop · <720px drops to 4 candidates + skips the failover whisper · zero deps
   · CSP-safe (no inline-eval).
   ========================================================================== */
(function () {
  'use strict';

  var canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- token resolution (no literal hex anywhere in the motion) ---------- */
  var css = getComputedStyle(document.documentElement);
  function tok(name, fallback) { var v = css.getPropertyValue(name); return (v && v.trim()) || fallback; }
  function hexToRgb(hex) {
    hex = (hex || '').trim();
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (m) return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
    var s = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(hex);
    return s ? { r: +s[1], g: +s[2], b: +s[3] } : null;
  }
  // maestro IS the cyan pillar: body .h-cyan → --hue resolves to --accent.
  // There is no second identity hue to police here — cyan is both the system
  // accent and maestro's identity. Read --hue from the body for coherence.
  var hueRaw = (getComputedStyle(document.body).getPropertyValue('--hue') || '').trim();
  var ACCENT = hexToRgb(tok('--accent', '#2DE2FF')) || { r: 45, g: 226, b: 255 }; // the request / chosen lane / receipt
  var HUE    = hexToRgb(hueRaw) || ACCENT;                                         // == ACCENT for maestro by design
  var PAPER  = hexToRgb(tok('--text', '#F3F6FB')) || { r: 243, g: 246, b: 251 };   // candidate node fills (low alpha)
  var FONT_MONO = tok('--font-mono', "'JetBrains Mono', monospace");
  function rgba(c, a) { return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + a + ')'; }
  function ease(t) { return 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3); }     // expo-out ≈ --ease (.22,1,.36,1)
  function clamp01(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }

  /* ---- geometry / DPR ---------------------------------------------------- */
  var host = canvas.parentElement, dpr = 1, w = 0, h = 0, mobile = false;
  function measure() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = host.offsetWidth; h = host.offsetHeight;
    mobile = w < 720;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* ---- the routing layout (junction + candidate fan) --------------------- */
  // Lives in the hero's right negative space (the open column beside the copy),
  // where the .phero-orb sits — so the decision never fights the hero text.
  var junction = null;   // the Vega router node where the prompt lands
  var cands = [];        // candidate models/nodes, arranged in an arc
  var dust = [];         // faint connective tissue (barely there)
  var chosenIndex = 0;   // which candidate wins this loop (rotated each loop)

  function layout() {
    var wide = w >= 900;
    // anchor zone: the open column to the right of the copy (or centred on mobile)
    var zoneX0 = wide ? w * 0.50 : w * 0.16;
    var zoneX1 = w - (wide ? 56 : 24);
    var cy = wide ? h * 0.48 : h * 0.46;
    var zoneW = Math.max(160, zoneX1 - zoneX0);

    // the junction (Vega router) sits at the left of the zone
    var jx = zoneX0 + zoneW * 0.06;
    junction = { x: jx, y: cy, r: mobile ? 7 : 8.5, lit: 0 };

    // candidate fan: an arc across the zone's right negative space
    var n = mobile ? 4 : 6;
    var arcX = zoneX0 + zoneW * (mobile ? 0.82 : 0.78);
    var arcR = Math.min(zoneW * 0.40, h * 0.34);
    if (mobile) arcR = Math.min(zoneW * 0.46, h * 0.30);
    var spread = mobile ? 1.05 : 1.30;   // radians, half-angle of the fan
    cands = [];
    for (var i = 0; i < n; i++) {
      var t = n === 1 ? 0.5 : i / (n - 1);          // 0..1 down the arc
      var ang = (t - 0.5) * spread;                  // -spread/2 .. +spread/2
      cands.push({
        x: arcX + Math.cos(ang) * arcR * 0.46,       // gentle arc, not a full circle
        y: cy + Math.sin(ang) * arcR,
        r: mobile ? 5.5 : 6.5,
        // a couple of candidates read as "local" (closer hairline), rest "frontier"
        local: i === Math.floor(n / 2) || i === Math.max(0, Math.floor(n / 2) - 2),
        lit: 0,        // half-notch flicker during CONSIDER
        fill: 0        // soft cyan fill if chosen during SELECT
      });
    }
    // clamp the whole composition inside the canvas (defensive)
    for (var k = 0; k < cands.length; k++) {
      cands[k].x = Math.max(20, Math.min(w - 20, cands[k].x));
      cands[k].y = Math.max(28, Math.min(h - 24, cands[k].y));
    }
  }

  function seedDust() {
    var area = w * h;
    var n = Math.max(10, Math.min(mobile ? 16 : 34, Math.floor(area / 26000)));
    dust = [];
    for (var i = 0; i < n; i++) {
      dust.push({
        x: Math.random() * w, y: Math.random() * h,
        r: 0.5 + Math.random() * 1.1,
        dx: (Math.random() - 0.5) * 0.08, dy: (Math.random() - 0.5) * 0.08,
        o: 0.05 + Math.random() * 0.03   // ~0.05–0.08, connective tissue only
      });
    }
  }

  /* ---- the loop clock + phase choreography ------------------------------- */
  // One ~18s loop split into five eased beats. `t` is the loop fraction [0,1).
  var LOOP = 18000;          // ms
  var t0 = 0;                // loop start timestamp
  // phase boundaries (fractions of the loop)
  var P = { arrive: 0.16, consider: 0.46, select: 0.70, receipt: 0.86 };
  var request = { prog: 0 };       // the cyan request dot, 0 at left → 1 at junction
  var receiptT = 0;                // receipt mark fade [0,1]
  var failover = 0;                // failover-whisper hop [0,1]

  function rotateChoice() {
    chosenIndex = (chosenIndex + (cands.length > 2 ? 2 : 1)) % Math.max(1, cands.length);
  }

  function update(now) {
    if (!t0) t0 = now;
    var t = ((now - t0) % LOOP) / LOOP;
    // detect loop wrap → rotate the winning candidate so it never looks scripted
    if (t < lastT) { rotateChoice(); }
    lastT = t;

    // dust drifts (ambient, barely moving)
    for (var i = 0; i < dust.length; i++) {
      var du = dust[i];
      du.x += du.dx; du.y += du.dy;
      if (du.x < -4) du.x = w + 4; else if (du.x > w + 4) du.x = -4;
      if (du.y < -4) du.y = h + 4; else if (du.y > h + 4) du.y = -4;
    }

    // PHASE 1 — ARRIVE: request dot eases in from the left to the junction
    if (t < P.arrive) {
      request.prog = ease(t / P.arrive);
      junction.lit = request.prog;                 // junction brightens as the prompt lands
      resetCands(0);
      receiptT = 0; failover = 0;
    }
    // PHASE 2 — CONSIDER: lanes fan out; each candidate flickers a half-notch in turn
    else if (t < P.consider) {
      request.prog = 1; junction.lit = 1;
      var ct = (t - P.arrive) / (P.consider - P.arrive);   // 0..1
      for (var c = 0; c < cands.length; c++) {
        // staggered per-candidate scoring flicker (in then settle to a low hold)
        var local = clamp01((ct - c / (cands.length + 2)) * 2.4);
        cands[c].lit = Math.sin(clamp01(local) * Math.PI) * 0.6 + clamp01(local) * 0.18;
        cands[c].fill = 0;
      }
      receiptT = 0; failover = 0;
    }
    // PHASE 3 — SELECT: one lane wins (brightens to cyan), others dim back to faint
    else if (t < P.select) {
      request.prog = 1; junction.lit = 1;
      var st = ease((t - P.consider) / (P.select - P.consider));   // 0..1
      for (var s = 0; s < cands.length; s++) {
        if (s === chosenIndex) { cands[s].lit = 0.18 + st * 0.30; cands[s].fill = st; }
        else { cands[s].lit = 0.18 * (1 - st); cands[s].fill = 0; }
      }
      receiptT = 0; failover = 0;
    }
    // PHASE 4 — RECEIPT: a decision_id mark fades in beside the chosen node;
    //           a whisper of failover hops to the neighbour seat
    else if (t < P.receipt) {
      request.prog = 1; junction.lit = 1;
      var rt = (t - P.select) / (P.receipt - P.select);   // 0..1
      receiptT = Math.sin(clamp01(rt * 1.15) * Math.PI);  // fade in then out
      for (var r = 0; r < cands.length; r++) {
        cands[r].lit = r === chosenIndex ? 0.48 : 0.04;
        cands[r].fill = r === chosenIndex ? 1 : 0;
      }
      failover = (!mobile) ? Math.sin(clamp01(rt) * Math.PI) : 0;   // <1s whisper, desktop only
    }
    // PHASE 5 — BREATHE + LOOP: chosen node holds with a faint breathing glow,
    //           candidates dim, the request dot re-arms at the left
    else {
      var bt = (t - P.receipt) / (1 - P.receipt);   // 0..1
      request.prog = 1 - ease(bt);                  // re-arm: slide back toward the left
      junction.lit = 1 - bt * 0.4;
      var breathe = 0.30 + Math.sin(now / 520) * 0.06;  // barely-perceptible
      for (var b = 0; b < cands.length; b++) {
        cands[b].lit = b === chosenIndex ? (0.40 * (1 - bt) + breathe * (1 - bt)) : 0.04 * (1 - bt);
        cands[b].fill = b === chosenIndex ? (1 - bt) : 0;
      }
      receiptT = (1 - bt) * 0.3; failover = 0;
    }
  }
  var lastT = 0;

  function resetCands(v) {
    for (var i = 0; i < cands.length; i++) { cands[i].lit = v; cands[i].fill = 0; }
  }

  /* ---- render ------------------------------------------------------------ */
  function roundRect(x, y, ww, hh, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + ww, y, x + ww, y + hh, r);
    ctx.arcTo(x + ww, y + hh, x, y + hh, r);
    ctx.arcTo(x, y + hh, x, y, r);
    ctx.arcTo(x, y, x + ww, y, r);
    ctx.closePath();
  }
  // a faint rounded-square "node" glyph (the shared alphabet's node)
  function nodeGlyph(x, y, r, fillA, lineA, fillCol) {
    roundRect(x - r, y - r, r * 2, r * 2, Math.max(2, r * 0.45));
    ctx.fillStyle = rgba(fillCol || PAPER, fillA);
    ctx.fill();
    ctx.lineWidth = 1; ctx.strokeStyle = rgba(ACCENT, lineA);
    ctx.stroke();
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    if (!junction) return;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';

    // 1) dust (connective tissue, barely there)
    for (var i = 0; i < dust.length; i++) {
      var du = dust[i];
      ctx.fillStyle = rgba(ACCENT, du.o);
      ctx.beginPath(); ctx.arc(du.x, du.y, du.r, 0, 6.2832); ctx.fill();
    }

    // 2) candidate lanes (junction → each candidate). Opacity gated on the phase
    //    clock via each candidate's `lit`; the chosen lane peaks at --accent-line.
    for (var c = 0; c < cands.length; c++) {
      var cd = cands[c];
      var chosen = c === chosenIndex;
      // lane brightness: faint candidates ≤8%, the chosen lane up to ~22% then settles
      var laneA = chosen ? Math.min(0.22, 0.05 + cd.lit * 0.34) : Math.min(0.08, 0.02 + cd.lit * 0.10);
      if (laneA < 0.012) continue;
      ctx.strokeStyle = rgba(ACCENT, laneA);
      ctx.lineWidth = chosen ? 1.4 : 0.9;
      ctx.beginPath();
      // a gentle curve from junction to candidate (eased control point), never a snap
      var mx = (junction.x + cd.x) / 2;
      var my = (junction.y + cd.y) / 2 - (cd.y - junction.y) * 0.10;
      ctx.moveTo(junction.x, junction.y);
      ctx.quadraticCurveTo(mx, my, cd.x, cd.y);
      ctx.stroke();
    }

    // 3) failover whisper — a faint hop from the chosen node to its neighbour
    //    ("if this seat caps, the next is ready") — ≤6% opacity, desktop only
    if (failover > 0.01 && cands.length > 1) {
      var a = cands[chosenIndex];
      var b = cands[(chosenIndex + 1) % cands.length];
      ctx.strokeStyle = rgba(ACCENT, 0.06 * failover);
      ctx.lineWidth = 0.9; ctx.setLineDash([2, 4]);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.setLineDash([]);
    }

    // 4) candidate nodes (faint rounded squares; the chosen one fills soft cyan)
    for (var n = 0; n < cands.length; n++) {
      var nd = cands[n];
      var chos = n === chosenIndex;
      var fillA = chos ? (0.05 + nd.fill * 0.16) : (0.05 + nd.lit * 0.05);   // 5–8% base
      var lineA = chos ? Math.min(0.30, 0.10 + nd.lit * 0.30) : (0.07 + nd.lit * 0.10);
      var fillCol = chos ? ACCENT : PAPER;
      // soft glow only on the chosen node, only briefly
      if (chos && nd.fill > 0.04) {
        var gr = nd.r * 4.2;
        var g = ctx.createRadialGradient(nd.x, nd.y, 0, nd.x, nd.y, gr);
        g.addColorStop(0, rgba(ACCENT, 0.18 * nd.fill));
        g.addColorStop(1, rgba(ACCENT, 0));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(nd.x, nd.y, gr, 0, 6.2832); ctx.fill();
      }
      nodeGlyph(nd.x, nd.y, nd.r, fillA, lineA, fillCol);
      // a tiny "local" hairline tick under the local-seat candidates (kept subtle)
      if (nd.local && !chos) {
        ctx.strokeStyle = rgba(ACCENT, 0.10);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(nd.x - nd.r * 0.6, nd.y + nd.r + 4);
        ctx.lineTo(nd.x + nd.r * 0.6, nd.y + nd.r + 4);
        ctx.stroke();
      }
      // the done-tick on the chosen node once selected
      if (chos && nd.fill > 0.5) {
        ctx.strokeStyle = rgba(ACCENT, Math.min(0.85, nd.fill));
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(nd.x - nd.r * 0.5, nd.y);
        ctx.lineTo(nd.x - nd.r * 0.1, nd.y + nd.r * 0.42);
        ctx.lineTo(nd.x + nd.r * 0.55, nd.y - nd.r * 0.4);
        ctx.stroke();
      }
    }

    // 5) the junction (Vega router) — slightly brighter rounded square
    var jLineA = 0.14 + junction.lit * 0.28;
    var jFillA = 0.06 + junction.lit * 0.06;
    if (junction.lit > 0.3) {
      var jgr = junction.r * 3.4;
      var jg = ctx.createRadialGradient(junction.x, junction.y, 0, junction.x, junction.y, jgr);
      jg.addColorStop(0, rgba(ACCENT, 0.10 * junction.lit));
      jg.addColorStop(1, rgba(ACCENT, 0));
      ctx.fillStyle = jg;
      ctx.beginPath(); ctx.arc(junction.x, junction.y, jgr, 0, 6.2832); ctx.fill();
    }
    nodeGlyph(junction.x, junction.y, junction.r, jFillA, jLineA, ACCENT);

    // 6) the request dot — a small cyan dot entering from the left along a stub
    if (request.prog < 0.999) {
      var sx = Math.max(8, junction.x - (mobile ? 70 : 120));
      var rx = sx + (junction.x - sx) * request.prog;
      // a short cyan stub trailing the dot
      var grad = ctx.createLinearGradient(sx, junction.y, rx, junction.y);
      grad.addColorStop(0, rgba(ACCENT, 0));
      grad.addColorStop(1, rgba(ACCENT, 0.20));
      ctx.strokeStyle = grad; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(sx, junction.y); ctx.lineTo(rx, junction.y); ctx.stroke();
      ctx.fillStyle = rgba(ACCENT, 0.62);
      ctx.beginPath(); ctx.arc(rx, junction.y, 2.6, 0, 6.2832); ctx.fill();
    }

    // 7) the receipt mark — a mono-styled rounded rect ("decision_id"):
    //    every decision leaves a receipt.
    if (receiptT > 0.01) {
      var ch = cands[chosenIndex] || junction;
      var bw = 40, bh = 14;
      var bx = ch.x + ch.r + 12, by = ch.y - bh / 2;
      if (bx + bw > w - 6) { bx = ch.x - ch.r - 12 - bw; }   // keep on-canvas
      ctx.globalAlpha = receiptT;
      ctx.strokeStyle = rgba(ACCENT, 0.30); ctx.lineWidth = 1;
      roundRect(bx, by, bw, bh, 4); ctx.stroke();
      ctx.fillStyle = rgba(ACCENT, 0.58);
      ctx.font = '600 8px ' + FONT_MONO;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('decision_id', bx + bw / 2, by + bh / 2 + 0.5);
      ctx.globalAlpha = 1;
    }
  }

  /* ---- static composed frame (prefers-reduced-motion) -------------------- */
  function drawStatic() {
    measure(); layout(); seedDust();
    // settle dust a touch so it isn't a uniform grid
    for (var s = 0; s < 24; s++) for (var i = 0; i < dust.length; i++) {
      var du = dust[i]; du.x += du.dx * 6; du.y += du.dy * 6;
      if (du.x < 0) du.x = w; else if (du.x > w) du.x = 0;
      if (du.y < 0) du.y = h; else if (du.y > h) du.y = 0;
    }
    // compose the DECIDED state: prompt at the junction, faint candidate fan,
    // one chosen cyan lane + done-tick, and the decision_id receipt mark.
    chosenIndex = Math.floor(cands.length / 2);
    junction.lit = 1;
    request.prog = 1;
    for (var c = 0; c < cands.length; c++) {
      cands[c].lit = c === chosenIndex ? 0.48 : 0.06;
      cands[c].fill = c === chosenIndex ? 1 : 0;
    }
    receiptT = 1; failover = 0;
    draw();
  }

  /* ---- loop control ------------------------------------------------------ */
  var raf = 0, running = false, visible = true, onScreen = true;
  function tick(now) {
    if (!running) return;
    update(now);
    draw();
    raf = requestAnimationFrame(tick);
  }
  function start() {
    if (running || reduce) return;
    running = true;
    raf = requestAnimationFrame(tick);
  }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
  function evaluateRun() { if (reduce) return; if (visible && onScreen) start(); else stop(); }

  function init() {
    measure(); layout(); seedDust();
    if (reduce) { drawStatic(); return; }

    document.addEventListener('visibilitychange', function () {
      visible = !document.hidden;
      // reset the loop clock on re-show so it doesn't jump phases
      if (!document.hidden) { t0 = 0; lastT = 0; }
      evaluateRun();
    });

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (ents) {
        onScreen = ents[0].isIntersecting; evaluateRun();
      }, { threshold: 0.02 });
      io.observe(host);
    }

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        var wasReduced = reduce;
        measure(); layout(); seedDust();
        if (wasReduced) { drawStatic(); }
      }, 160);
    }, { passive: true });

    evaluateRun();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
