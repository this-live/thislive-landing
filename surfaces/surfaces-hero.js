/* ============================================================================
   surfaces — SIGNATURE HERO ANIMATION · "SPRAWL → SYNC"
   The product thesis made kinetic: a sprawl of scattered AI tool-windows drifts
   in the dark, then eases home and NESTS into ONE unified app (the desktop
   shell), pulses once, breathes, and dissolves back out to loop.

   Same engine contract as the umbrella's hero.js — single #heroCanvas, DPR cap 2,
   debounced resize, paused off-screen (IntersectionObserver) + tab-hidden
   (visibilitychange), one rAF loop, ALL colors via tok() tokens (never a literal
   hex on the canvas), house easing cubic-bezier(.22,1,.36,1), low-contrast
   (windows 6–10% white, lines ≤6%, one cyan accent ≤22%). Nothing moves faster
   than ~0.25px/frame in sprawl; the collapse eases, never snaps. The hero text
   always wins the hierarchy.
   - prefers-reduced-motion → ONE static composed frame of the SYNCED state.
   - mobile (<720px)        → fewer windows, no parallax, lighter field.
   No dependencies. CSP-safe (no inline-eval). ~150 lines of vanilla canvas.
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
  var ACCENT_RGB = hexToRgb(tok('--accent', '#2DE2FF')) || { r: 45, g: 226, b: 255 };
  // window/dust fills ride the --text ramp (resolved from the token, not literal)
  var WHITE = hexToRgb(tok('--text', '#F3F6FB')) || { r: 243, g: 246, b: 251 };
  function rgba(c, a) { return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + a + ')'; }

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

  /* ---- house easing (cubic-bezier(.22,1,.36,1) — expo-out feel) ---------- */
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function rand(a, b) { return a + Math.random() * (b - a); }

  /* ---- the unified app's home (off-center into the hero's right space) --- */
  function syncCenter() {
    return isMobile ? { x: w * 0.5, y: h * 0.46 } : { x: w * 0.72, y: h * 0.48 };
  }
  /* the merged app card's size (the desktop shell the sprawl nests into) */
  function appSize() {
    var u = Math.min(w, h);
    return { w: Math.max(150, u * (isMobile ? 0.34 : 0.26)), h: Math.max(96, u * (isMobile ? 0.22 : 0.17)) };
  }

  /* ---- cast: scattered AI tool-windows + connective dust ----------------- */
  var wins = [], dust = [];
  function build() {
    var n = isMobile ? 9 : 16;                 // fewer glyphs on mobile
    var c = syncCenter(), app = appSize();
    wins = [];
    for (var i = 0; i < n; i++) {
      // each window's nest slot inside the unified card (loose grid stack)
      var cols = 4, col = i % cols, row = (i / cols) | 0, rows = Math.ceil(n / cols);
      var nx = c.x + (col / (cols - 1) - 0.5) * app.w * 0.74;
      var ny = c.y + (row / Math.max(1, rows - 1) - 0.5) * app.h * 0.62;
      var sx = rand(w * 0.06, w * (isMobile ? 0.94 : 0.96));   // scattered home
      var sy = rand(h * 0.10, h * 0.90);
      wins.push({
        sx: sx, sy: sy,                          // sprawl home (re-randomized each loop)
        nx: nx, ny: ny,                          // nest slot in the unified card
        x: sx, y: sy,                            // current
        wv: rand(0.18, 0.30), hv: rand(0.16, 0.26),
        ww: rand(18, 34), hh: rand(13, 22),      // window size
        rot: rand(-0.035, 0.035),                // gentle ±2°
        rotV: rand(-0.0006, 0.0006),
        phx: rand(0, 6.28), phy: rand(0, 6.28),  // brownian phase
        spd: rand(0.5, 1.0),                     // per-window drift speed
        lines: 1 + ((Math.random() * 2) | 0)     // stub content lines
      });
    }
    // connective dust (kept faint — the existing particle feel, dialed down)
    var dn = Math.max(18, Math.min(isMobile ? 26 : 54, Math.floor(w * h / 24000)));
    dust = [];
    for (var d = 0; d < dn; d++) {
      dust.push({ x: Math.random() * w, y: Math.random() * h,
        r: rand(0.4, 1.6), o: rand(0.04, 0.12),
        dx: rand(-0.10, 0.10), dy: rand(-0.10, 0.10) });
    }
  }
  // re-scatter sprawl homes when a loop restarts (windows re-emit outward)
  function reseedScatter() {
    for (var i = 0; i < wins.length; i++) {
      wins[i].sx = rand(w * 0.06, w * (isMobile ? 0.94 : 0.96));
      wins[i].sy = rand(h * 0.10, h * 0.90);
    }
  }

  /* ---- phase clock: one ambient loop ~16s -------------------------------- */
  var LOOP = 16000, t0 = 0, pulseFired = false;

  function drawWindow(win, x, y, rot, fill, line, op, app) {
    if (op <= 0.002) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    var bw = win.ww, bh = win.hh;
    // body
    ctx.fillStyle = rgba(WHITE, fill * op);
    roundRect(-bw / 2, -bh / 2, bw, bh, 3); ctx.fill();
    ctx.strokeStyle = rgba(WHITE, Math.min(0.08, fill + 0.02) * op);
    ctx.lineWidth = 0.6; ctx.stroke();
    // cyan title-bar hairline (the one accent each window carries)
    ctx.strokeStyle = rgba(ACCENT_RGB, line * op);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-bw / 2 + 2.5, -bh / 2 + 3.5); ctx.lineTo(bw / 2 - 2.5, -bh / 2 + 3.5); ctx.stroke();
    // stub content lines
    ctx.strokeStyle = rgba(WHITE, 0.05 * op);
    for (var l = 0; l < win.lines; l++) {
      var ly = -bh / 2 + 8 + l * 4;
      if (ly > bh / 2 - 2) break;
      ctx.beginPath(); ctx.moveTo(-bw / 2 + 3, ly); ctx.lineTo(bw / 2 - 5, ly); ctx.stroke();
    }
    ctx.restore();
  }

  function roundRect(x, y, ww, hh, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + ww, y, x + ww, y + hh, r);
    ctx.arcTo(x + ww, y + hh, x, y + hh, r);
    ctx.arcTo(x, y + hh, x, y, r);
    ctx.arcTo(x, y, x + ww, y, r);
    ctx.closePath();
  }

  /* ---- parallax (desktop only; never on mobile) -------------------------- */
  var pmx = 0, pmy = 0, tmx = 0, tmy = 0;
  if (!reduce && !isMobile) {
    window.addEventListener('pointermove', function (e) {
      var rect = host.getBoundingClientRect();
      tmx = ((e.clientX - rect.left) / Math.max(1, w) - 0.5) * 2;
      tmy = ((e.clientY - rect.top) / Math.max(1, h) - 0.5) * 2;
    }, { passive: true });
  }

  /* ---- render one frame at loop-fraction f ------------------------------- */
  // f maps to the 4 phases: SPRAWL 0–.45 · PULL .45–.70 · SYNC .70–.90 · BREATHE .90–1
  function frame(f, now) {
    ctx.clearRect(0, 0, w, h);
    pmx += (tmx - pmx) * 0.05; pmy += (tmy - pmy) * 0.05;
    var par = isMobile ? 0 : 1;
    var ox = pmx * 14 * par, oy = pmy * 10 * par;

    var c = syncCenter(), app = appSize();

    // "homeAmt": 0 = fully sprawled, 1 = fully nested. Eased across PULL+SYNC.
    var homeAmt = f < 0.45 ? 0
      : f < 0.90 ? easeOut(Math.min(1, (f - 0.45) / 0.45))
      : 1;
    // sync lines fade in during PULL, out during BREATHE
    var lineAmt = f < 0.45 ? 0
      : f < 0.70 ? (f - 0.45) / 0.25
      : f < 0.95 ? 1 - (f - 0.70) / 0.25 * 0.6
      : 0.4;
    // each small window dissolves as it merges into the unified card
    var winFade = f < 0.70 ? 1 : Math.max(0, 1 - (f - 0.70) / 0.18);
    // the unified app card brightens in over SYNC and breathes in BREATHE
    var appAmt = f < 0.62 ? 0 : easeOut(Math.min(1, (f - 0.62) / 0.16));

    // 1) connective dust (faint, always drifting)
    for (var d = 0; d < dust.length; d++) {
      var pd = dust[d];
      pd.x += pd.dx; pd.y += pd.dy;
      if (pd.x < -4) pd.x = w + 4; else if (pd.x > w + 4) pd.x = -4;
      if (pd.y < -4) pd.y = h + 4; else if (pd.y > h + 4) pd.y = -4;
      ctx.fillStyle = rgba(WHITE, pd.o);
      ctx.beginPath(); ctx.arc(pd.x + ox * 0.5, pd.y + oy * 0.5, pd.r, 0, 6.2832); ctx.fill();
    }

    // 2) advance + place each window (brownian sprawl lerped toward its nest)
    for (var i = 0; i < wins.length; i++) {
      var win = wins[i];
      win.phx += 0.006 * win.spd; win.phy += 0.0052 * win.spd;
      // calm brownian wander around the sprawl home (≤ ~0.25px/frame)
      var bx = win.sx + Math.cos(win.phx) * win.ww * win.wv;
      var by = win.sy + Math.sin(win.phy) * win.hh * win.hv;
      win.x = bx + (win.nx - bx) * homeAmt;
      win.y = by + (win.ny - by) * homeAmt;
      var rot = win.rot + Math.sin(win.phx) * 0.02;
      rot = rot * (1 - homeAmt);  // settle level as it nests
      var fill = 0.06 + 0.04 * win.wv * 6;    // 6–10% white
      fill = Math.min(0.10, fill);
      var ln = 0.22 * (0.5 + 0.5 * homeAmt);  // title hairline ≤22%, brightens home
      drawWindow(win, win.x + ox, win.y + oy, rot,
        fill, ln, winFade, app);
    }

    // 3) sync lines between nearest window pairs (≤6%) — the sprawl connecting
    if (lineAmt > 0.01) {
      var thr = Math.pow(Math.min(w, h) * 0.20, 2);
      ctx.lineWidth = 0.7;
      for (var a = 0; a < wins.length; a++) {
        for (var b = a + 1; b < wins.length; b++) {
          var ex = wins[a].x - wins[b].x, ey = wins[a].y - wins[b].y, dd = ex * ex + ey * ey;
          if (dd < thr) {
            var o = 0.06 * (1 - dd / thr) * lineAmt;
            if (o < 0.004) continue;
            ctx.strokeStyle = rgba(ACCENT_RGB, o);
            ctx.beginPath();
            ctx.moveTo(wins[a].x + ox, wins[a].y + oy);
            ctx.lineTo(wins[b].x + ox, wins[b].y + oy);
            ctx.stroke();
          }
        }
      }
    }

    // 4) the unified app card (the desktop shell the sprawl nests into)
    if (appAmt > 0.01) {
      drawApp(c.x + ox, c.y + oy, app, appAmt, f, now);
    }

    // 5) one soft cyan pulse-ring at the SYNC beat (~f .80)
    if (f >= 0.80 && f < 0.95) {
      var pt = (f - 0.80) / 0.15;
      var pr = (app.w * 0.5) + pt * app.w * 0.9;
      ctx.strokeStyle = rgba(ACCENT_RGB, 0.18 * (1 - pt));
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(c.x + ox, c.y + oy, pr, 0, 6.2832); ctx.stroke();
    }
  }

  // the merged unified card: a clean shell with a left rail + title bar + content
  function drawApp(cx, cy, app, amt, f, now) {
    var bw = app.w, bh = app.h, x = cx - bw / 2, y = cy - bh / 2;
    // breathing glow during BREATHE (barely perceptible)
    var breathe = f >= 0.90 ? 0.5 + 0.5 * Math.sin((now || 0) / 600) : 1;
    ctx.save();
    // card body
    ctx.fillStyle = rgba(WHITE, 0.05 * amt);
    roundRect(x, y, bw, bh, 6); ctx.fill();
    // border brightens one notch to accent-line as it syncs
    ctx.strokeStyle = rgba(ACCENT_RGB, 0.22 * amt * breathe);
    ctx.lineWidth = 1; ctx.stroke();
    // left activity rail (the redesigned shell motif)
    ctx.fillStyle = rgba(WHITE, 0.04 * amt);
    roundRect(x, y, Math.max(8, bw * 0.10), bh, 6); ctx.fill();
    // title bar hairline (cyan)
    ctx.strokeStyle = rgba(ACCENT_RGB, 0.20 * amt);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x + bw * 0.10 + 5, y + 6); ctx.lineTo(x + bw - 6, y + 6); ctx.stroke();
    // content stub lines
    ctx.strokeStyle = rgba(WHITE, 0.06 * amt);
    ctx.lineWidth = 0.8;
    for (var l = 0; l < 4; l++) {
      var ly = y + 13 + l * (bh * 0.16);
      if (ly > y + bh - 5) break;
      ctx.beginPath(); ctx.moveTo(x + bw * 0.10 + 7, ly); ctx.lineTo(x + bw * (0.5 + 0.18 * (l % 2)), ly); ctx.stroke();
    }
    ctx.restore();
  }

  /* ---- static composed frame (reduced-motion + small-screen fallback) ---- */
  function drawStatic() {
    measure(); build();
    // settle dust a touch so it isn't a uniform grid
    for (var s = 0; s < 24; s++) for (var d = 0; d < dust.length; d++) {
      dust[d].x += dust[d].dx; dust[d].y += dust[d].dy;
    }
    pmx = pmy = tmx = tmy = 0;
    // render the SYNCED state: one unified card, faint dust — metaphor reads.
    frame(0.92, performance.now());
  }

  /* ---- loop control (same lifecycle as hero.js) -------------------------- */
  var raf = 0, running = false, visible = true, onScreen = true;
  function tick(now) {
    if (!running) return;
    if (!t0) t0 = now;
    var f = ((now - t0) % LOOP) / LOOP;
    if (f < 0.02 && pulseFired) { reseedScatter(); pulseFired = false; }
    if (f > 0.5) pulseFired = true;
    frame(f, now);
    raf = requestAnimationFrame(tick);
  }
  function start() { if (running || reduce) return; running = true; raf = requestAnimationFrame(tick); }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
  function evaluateRun() {
    if (reduce) return;
    if (visible && onScreen) start(); else stop();
  }

  function init() {
    measure();
    if (reduce) { drawStatic(); return; }
    build();
    document.addEventListener('visibilitychange', function () {
      visible = !document.hidden; evaluateRun();
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
        measure();
        if (reduce) { drawStatic(); return; }
        build();      // re-fit homes + nest slots; no flash, no layout shift
      }, 160);
    }, { passive: true });
    evaluateRun();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
