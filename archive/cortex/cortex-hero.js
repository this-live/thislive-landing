/* ============================================================================
   cortex.this.live — SIGNATURE HERO ANIMATION · "THE MESH, HONESTLY"
   ---------------------------------------------------------------------------
   The control-plane pillar's dialect of the shared this.live animation
   alphabet (00-DESIGN-SYSTEM.md §4.2 — "the fleet, honestly"): a living
   DECENTRALIZED MESH of fleet/pillar nodes that drifts loosely, then RESOLVES
   INTO ONE coherent constellation around a quiet center (the cockpit) — which
   draws an HONEST completion-ring to its TRUE % (~64) and stops there, never
   faking green. The truth-discipline made kinetic.

   Obeys the substrate invariants (§4.1):
     · one #heroCanvas, DPR cap 2, debounced resize
     · pause on visibilitychange + IntersectionObserver (never animates hidden)
     · requestAnimationFrame loop, ~18s ambient cross-dissolving loop
     · ALL colors via tok('--token') — never a hard-coded hex
     · nothing moves faster than ~0.2px/frame in ambient drift; eases, never snaps
     · node fills ~6-8% white, sync lines cyan <=6%, hairlines/ring <=22% (accent-line)
     · prefers-reduced-motion → ONE static composed frame (resolved state)
     · <720px → fewer nodes, no per-pair line spam; mobile stays light
   Vanilla Canvas 2D, zero dependencies, CSP-safe (no inline-eval).
   ========================================================================== */
(function () {
  'use strict';

  var canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- token resolution (stay coherent with the umbrella) ---------------- */
  var css = getComputedStyle(document.documentElement);
  function tok(name, fallback) {
    var v = css.getPropertyValue(name);
    return (v && v.trim()) || fallback;
  }
  function hexToRgb(hex) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec((hex || '').trim());
    return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
  }
  function rgba(rgb, a) { return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + a + ')'; }

  // The shared alphabet's palette — cyan is the only chrome accent; the pillar
  // hues tint only node title-hairlines ("many pillars, one system" narrative).
  var ACCENT = hexToRgb(tok('--accent', '#2DE2FF')) || { r: 45, g: 226, b: 255 };
  var WHITE  = { r: 243, g: 246, b: 251 };                       // --text base
  var FLOOR  = hexToRgb(tok('--bg', '#080B14')) || { r: 8, g: 11, b: 20 };
  var FONT_MONO = tok('--font-mono', "'JetBrains Mono', monospace");
  // pillar-hue ramp: --green leads (cortex identity), the rest narrate the mesh.
  var HUES = [
    hexToRgb(tok('--green',  '#34E5A0')),
    hexToRgb(tok('--violet', '#A78BFA')),
    hexToRgb(tok('--indigo', '#818CF8')),
    hexToRgb(tok('--blue',   '#60A5FA')),
    hexToRgb(tok('--amber',  '#FBBF77')),
    hexToRgb(tok('--rose',   '#FB7185'))
  ];

  /* ---- geometry / DPR ---------------------------------------------------- */
  var host = canvas.parentElement;
  var dpr = 1, w = 0, h = 0, isMobile = false;
  function measure() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = host.offsetWidth; h = host.offsetHeight;
    isMobile = w < 720;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* ---- the cast ---------------------------------------------------------- */
  // The center/cockpit lives in the hero's right negative space (the copy owns
  // a max-width:820px left column). The mesh scatters across the open field.
  var nodes = [], center = null, dust = [];
  var RING_TRUTH = 0.64;          // the audit's TRUE % — the ring stops here.
  function rand(a, b) { return a + Math.random() * (b - a); }

  function field() {
    // the open region the constellation should resolve into (right of the copy)
    var wide = w >= 900;
    return {
      cx: wide ? w * 0.70 : w * 0.5,
      cy: wide ? h * 0.46 : h * 0.42,
      rx: wide ? Math.min(w * 0.26, 320) : w * 0.40,
      ry: wide ? Math.min(h * 0.34, 240) : h * 0.30
    };
  }

  function seed() {
    var f = field();
    var nNodes = isMobile ? 5 : (w < 1100 ? 6 : 8);
    nodes = [];
    for (var i = 0; i < nNodes; i++) {
      var ang = (i / nNodes) * Math.PI * 2 + rand(-0.4, 0.4);
      // resolved "home" — a loose constellation slot around the center
      var hx = f.cx + Math.cos(ang) * f.rx * rand(0.55, 1.0);
      var hy = f.cy + Math.sin(ang) * f.ry * rand(0.55, 1.0);
      // scattered "wander anchor" — where the node roams in the mesh phase
      var sx = f.cx + Math.cos(ang + rand(-1, 1)) * f.rx * rand(1.1, 1.7);
      var sy = f.cy + Math.sin(ang + rand(-1, 1)) * f.ry * rand(1.1, 1.7);
      nodes.push({
        x: sx, y: sy,                    // current position
        homeX: hx, homeY: hy,            // resolved-constellation slot
        scatX: sx, scatY: sy,            // mesh-drift anchor
        ph: rand(0, Math.PI * 2),        // drift phase
        sp: rand(0.5, 1.0),              // drift speed factor
        amp: rand(10, 22),               // drift amplitude
        hue: (i < HUES.length) ? HUES[i] : null,  // <=6 carry a pillar hairline
        hair: 0                          // hairline brightness 0..1
      });
    }
    center = {
      x: f.cx, y: f.cy,
      r: isMobile ? 18 : 22,
      ring: 0,            // ring fill 0..RING_TRUTH
      breathe: 0,         // breathing glow 0..1
      receipt: 0          // receipt-mark opacity 0..1
    };
    // faint connective dust (dialed down from the generic field)
    var nDust = Math.max(18, Math.floor((w * h) / 26000));
    if (isMobile) nDust = Math.min(nDust, 26);
    dust = [];
    for (var d = 0; d < nDust; d++) {
      dust.push({
        x: Math.random() * w, y: Math.random() * h,
        r: rand(0.4, 1.4),
        dx: rand(-0.10, 0.10), dy: rand(-0.10, 0.10),
        o: rand(0.04, 0.10)
      });
    }
  }

  /* ---- the loop clock (phase fraction over ~18s) ------------------------- */
  var LOOP = 18000;           // ambient loop length
  var t0 = 0;
  function easeInOut(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function easeOut(x) { return 1 - Math.pow(1 - x, 3); }
  // smooth 0→1 ramp across [a,b], clamped — the house ease-out feel
  function ramp(t, a, b) {
    if (t <= a) return 0; if (t >= b) return 1;
    return easeInOut((t - a) / (b - a));
  }

  /* ---- per-frame compose ------------------------------------------------- */
  function compose(t) {
    // t in [0,1) over the loop. Phases per the plan (§3.3):
    //   MESH DRIFT 0–45% · RESOLVE 45–72% · HONEST RING 72–88% · BREATHE 88–100%
    var resolve = ramp(t, 0.45, 0.72);          // scatter → constellation
    var ringP   = ramp(t, 0.72, 0.88);          // ring fills to TRUTH
    var receipt = (t > 0.76 && t < 0.90)         // receipt mark beat (~1s window)
      ? Math.sin((t - 0.76) / 0.14 * Math.PI) : 0;
    var breathe = ramp(t, 0.88, 0.97) * (1 - ramp(t, 0.985, 1.0));
    // release back to mesh at the very end (cross-dissolve into the next loop)
    var release = ramp(t, 0.965, 1.0);
    var coh = Math.max(resolve - release, 0);    // coherence: 0 mesh ←→ 1 resolved

    return { resolve: coh, ring: ringP * RING_TRUTH, receipt: receipt, breathe: breathe };
  }

  /* ---- draw -------------------------------------------------------------- */
  function draw(now, state) {
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = 'round';

    var coh = state.resolve;     // 0 = loose mesh, 1 = resolved constellation
    var tSec = now / 1000;

    // 1) connective dust (ambient drift, low contrast) ----------------------
    for (var di = 0; di < dust.length; di++) {
      var pd = dust[di];
      pd.x += pd.dx; pd.y += pd.dy;
      if (pd.x < 0) pd.x = w; else if (pd.x > w) pd.x = 0;
      if (pd.y < 0) pd.y = h; else if (pd.y > h) pd.y = 0;
      ctx.fillStyle = rgba(WHITE, pd.o);
      ctx.beginPath(); ctx.arc(pd.x, pd.y, pd.r, 0, 6.2832); ctx.fill();
    }

    // 2) place nodes: lerp between drifting scatter and the resolved slot ----
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      // gentle Brownian wander around the scatter anchor (mesh life)
      var wob = (1 - coh);                       // wander fades as it resolves
      var dxw = Math.cos(tSec * 0.18 * n.sp + n.ph) * n.amp * wob;
      var dyw = Math.sin(tSec * 0.22 * n.sp + n.ph * 1.3) * n.amp * wob;
      var sx = n.scatX + dxw, sy = n.scatY + dyw;
      // ease toward the constellation home as coherence rises
      n.x = sx + (n.homeX - sx) * coh;
      n.y = sy + (n.homeY - sy) * coh;
      // hairline brightens one notch as the node settles, then relaxes a touch
      n.hair = (n.hue ? 1 : 0) * (0.35 + 0.65 * coh);
    }

    // 3) sync / lane lines — nearest-pair, distance-gated (the mesh breathing)
    // threshold opens up as the constellation resolves (more lines hold steady)
    var dimMin = Math.min(w, h);
    var thr = dimMin * (0.20 + 0.10 * coh);
    var thr2 = thr * thr;
    if (!isMobile || coh > 0.4) {                // mobile skips the busy mesh pass
      ctx.lineWidth = 1;
      for (var a = 0; a < nodes.length; a++) {
        for (var b = a + 1; b < nodes.length; b++) {
          var ex = nodes[a].x - nodes[b].x, ey = nodes[a].y - nodes[b].y;
          var d2 = ex * ex + ey * ey;
          if (d2 < thr2) {
            var prox = 1 - d2 / thr2;
            // cyan sync line, capped <=6%; steadier (brighter) when resolved
            var o = (0.018 + 0.040 * coh) * prox;
            if (o < 0.004) continue;
            ctx.strokeStyle = rgba(ACCENT, o);
            ctx.beginPath();
            ctx.moveTo(nodes[a].x, nodes[a].y);
            ctx.lineTo(nodes[b].x, nodes[b].y);
            ctx.stroke();
          }
        }
        // a faint line to the center once resolving (the canon connecting parts)
        if (coh > 0.15) {
          var cx = nodes[a].x - center.x, cy = nodes[a].y - center.y;
          var cd2 = cx * cx + cy * cy;
          var co = 0.05 * coh * Math.max(0, 1 - cd2 / (thr2 * 1.8));
          if (co > 0.004) {
            ctx.strokeStyle = rgba(ACCENT, co);
            ctx.beginPath();
            ctx.moveTo(nodes[a].x, nodes[a].y);
            ctx.lineTo(center.x, center.y);
            ctx.stroke();
          }
        }
      }
    }

    // 4) node glyphs — small rounded squares, ~6-8% white, pillar-hue hairline
    var side = isMobile ? 11 : 13;
    for (var j = 0; j < nodes.length; j++) {
      var nd = nodes[j];
      roundRect(ctx, nd.x - side / 2, nd.y - side / 2, side, side, 3);
      ctx.fillStyle = rgba(WHITE, 0.07);
      ctx.fill();
      // base hairline border
      ctx.lineWidth = 1;
      ctx.strokeStyle = rgba(WHITE, 0.14);
      ctx.stroke();
      // pillar-hue title-hairline: a brightened top edge (one notch), <=22%
      if (nd.hue && nd.hair > 0.01) {
        ctx.strokeStyle = rgba(nd.hue, 0.10 + 0.12 * nd.hair);
        ctx.beginPath();
        ctx.moveTo(nd.x - side / 2 + 2, nd.y - side / 2 + 0.5);
        ctx.lineTo(nd.x + side / 2 - 2, nd.y - side / 2 + 0.5);
        ctx.stroke();
      }
    }

    // 5) the center node (cockpit) + the HONEST completion-ring -------------
    var c = center;
    var br = c.r + state.breathe * 3;
    // breathing glow (el-accent feel) — only when resolved, barely-there
    if (state.breathe > 0.02) {
      var g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, br * 3);
      g.addColorStop(0, rgba(ACCENT, 0.10 * state.breathe));
      g.addColorStop(1, rgba(ACCENT, 0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(c.x, c.y, br * 3, 0, 6.2832); ctx.fill();
    }
    // center glyph (slightly larger rounded square)
    roundRect(ctx, c.x - br, c.y - br, br * 2, br * 2, 6);
    ctx.fillStyle = rgba(WHITE, 0.08);
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = rgba(WHITE, 0.18);
    ctx.stroke();

    // the honest ring: a thin cyan arc that fills to RING_TRUTH and STOPS.
    // faint full track (the whole, un-faked) + bright arc to the true %.
    var ringR = br + (isMobile ? 9 : 12);
    var start = -Math.PI / 2;                    // 12 o'clock
    ctx.lineWidth = isMobile ? 2 : 2.5;
    ctx.lineCap = 'round';
    // track
    ctx.strokeStyle = rgba(WHITE, 0.06);
    ctx.beginPath(); ctx.arc(c.x, c.y, ringR, 0, 6.2832); ctx.stroke();
    // honest fill — never closes
    if (state.ring > 0.001) {
      ctx.strokeStyle = rgba(ACCENT, 0.5);       // <=22% would be too faint to read
      ctx.beginPath();
      ctx.arc(c.x, c.y, ringR, start, start + state.ring * Math.PI * 2);
      ctx.stroke();
    }

    // 6) the receipt mark — a tiny mono-bordered rect that fades in beside the
    //    center: "every claim maps to a receipt."
    if (state.receipt > 0.01) {
      var ra = state.receipt;
      var rxp = c.x + ringR + (isMobile ? 12 : 16);
      var ryp = c.y - 8;
      roundRect(ctx, rxp, ryp, 16, 16, 3);
      ctx.fillStyle = rgba(FLOOR, 0.55 * ra);
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = rgba(ACCENT, 0.45 * ra);
      ctx.stroke();
      // a tiny mono check inside
      ctx.font = '600 10px ' + FONT_MONO;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = rgba(ACCENT, 0.7 * ra);
      ctx.fillText('✓', rxp + 8, ryp + 8.5);
    }
  }

  function roundRect(c, x, y, ww, hh, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + ww, y, x + ww, y + hh, r);
    c.arcTo(x + ww, y + hh, x, y + hh, r);
    c.arcTo(x, y + hh, x, y, r);
    c.arcTo(x, y, x + ww, y, r);
    c.closePath();
  }

  /* ---- static composed frame (reduced-motion fallback) ------------------- */
  // ONE beautiful frame of the RESOLVED state: constellation settled around the
  // center, faint sync lines holding, the honest ~64% ring drawn, receipt mark
  // present, faint dust. The metaphor reads with zero motion.
  function drawStatic() {
    measure(); seed();
    // snap nodes onto their resolved constellation slots
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].x = nodes[i].homeX; nodes[i].y = nodes[i].homeY; nodes[i].hair = 1;
    }
    draw(performance.now(), { resolve: 1, ring: RING_TRUTH, receipt: 1, breathe: 0.4 });
  }

  /* ---- loop control ------------------------------------------------------ */
  var raf = 0, running = false, visible = true, onScreen = true;
  function tick(now) {
    if (!running) return;
    if (!t0) t0 = now;
    var t = ((now - t0) % LOOP) / LOOP;
    draw(now, compose(t));
    raf = requestAnimationFrame(tick);
  }
  function start() {
    if (running || reduce) return;
    running = true; t0 = 0;
    raf = requestAnimationFrame(tick);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }
  function evaluateRun() {
    if (reduce) return;
    if (visible && onScreen) start(); else stop();
  }

  function init() {
    measure();
    if (reduce) { drawStatic(); return; }
    seed();
    // pause when tab hidden
    document.addEventListener('visibilitychange', function () {
      visible = !document.hidden; evaluateRun();
    });
    // pause when scrolled off-screen
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (ents) {
        onScreen = ents[0].isIntersecting; evaluateRun();
      }, { threshold: 0.02 });
      io.observe(host);
    }
    // debounced resize — re-fit without a flash
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        var wasReduced = reduce;
        measure();
        if (wasReduced) { drawStatic(); return; }
        seed();
      }, 160);
    }, { passive: true });
    evaluateRun();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
