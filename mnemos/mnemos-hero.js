/* ============================================================================
   mnemos — SIGNATURE HERO ANIMATION  ·  "ARRIVE → FILE → PERSIST"
   The mnemos dialect of the shared this.live animation alphabet
   (00-DESIGN-SYSTEM.md §4.2: "pulses arrive and settle into a persistent local
   lattice that stays lit across loops — memory that survives").

   Scattered data points fly in from every edge ("from every harness"), route
   DOWN a small hierarchical tree (root → scoped child container), and snap into
   a filed row. The protected root never receives a write. The lattice ACCUMULATES
   and never resets to empty between loops — the mnemos-specific signature: where
   fabric finishes-first and surfaces syncs-into-one, mnemos REMEMBERS.

   House rules obeyed: single #heroCanvas · DPR cap 2 · debounced resize ·
   visibilitychange + IntersectionObserver pause · rAF loop · colors ONLY via
   tok('--token') (no literal hex in the motion) · --ease (.22,1,.36,1) eases,
   no snaps except the deliberate "filed" click · low-contrast (fills 5–8%,
   lines ≤8%, one cyan accent ≤60% on the small dots) · the hero TEXT wins ·
   prefers-reduced-motion → one static composed filed frame · ~16–20s ambient
   loop · <720px drops to 2 children + half the arrival rate · zero deps · CSP-safe.
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
  // body sets .h-indigo → --hue resolves to --indigo on :root via pillar.css;
  // read --hue from the body so the pillar identity tints the lattice.
  var hueRaw = (getComputedStyle(document.body).getPropertyValue('--hue') || '').trim();
  var ACCENT = hexToRgb(tok('--accent', '#2DE2FF')) || { r: 45, g: 226, b: 255 };   // cyan: the data/recall/receipt
  var HUE    = hexToRgb(hueRaw) || hexToRgb(tok('--indigo', '#818CF8')) || { r: 129, g: 140, b: 248 }; // indigo: container identity
  var INK    = hexToRgb(tok('--bg', '#080B14')) || { r: 8, g: 11, b: 20 };
  var PAPER  = { r: 243, g: 246, b: 251 };   // --text base, used only at low alpha for filled rows
  var FONT_MONO = tok('--font-mono', "'JetBrains Mono', monospace");
  function rgba(c, a) { return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + a + ')'; }

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

  /* ---- the container lattice (root → scoped children) -------------------- */
  // Lives in the hero's right negative space (the open column beside the copy).
  var root = null, containers = [], dust = [];
  var MAX_ROWS = 6;            // a container "breathes" — finite memory
  function ease(t) { return 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3); } // expo-out ≈ --ease

  function layout() {
    // anchor the lattice in the open right column; centre on mobile (copy stacks)
    var wide = w >= 900;
    var cx = wide ? w * 0.74 : w * 0.5;
    var cw = Math.min(168, w * (wide ? 0.30 : 0.62));   // child container width
    var top = h * (wide ? 0.30 : 0.30);
    var rootW = cw * 1.18;
    root = { x: cx - rootW / 2, y: top, w: rootW, hh: 28, tag: 'cortex' };

    var labels = ['cortex/forge', 'cortex/agent-fabric', 'cortex/maestro'];
    var n = mobile ? 2 : 3;
    var chTop = top + 64;
    var gap = mobile ? 70 : 60;
    var prev = containers;          // PRESERVE filed rows across resize (memory survives)
    containers = [];
    for (var i = 0; i < n; i++) {
      var keepRows = (prev[i] && prev[i].rows) ? prev[i].rows.slice(0, MAX_ROWS) : [];
      containers.push({
        x: cx - cw / 2, y: chTop + i * gap, w: cw, hh: 44,
        tag: labels[i], rows: keepRows, flash: 0, idx: i
      });
    }
  }

  function seedDust() {
    // faint connective dust (the existing field, dialed right down to ~0.06)
    var area = w * h, n = Math.max(8, Math.min(mobile ? 26 : 44, Math.floor(area / 26000)));
    dust = [];
    for (var i = 0; i < n; i++) dust.push({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.1 + 0.4,
      dx: (Math.random() - 0.5) * 0.14, dy: (Math.random() - 0.5) * 0.14,
      o: Math.random() * 0.05 + 0.02
    });
  }

  /* ---- incoming data dots ------------------------------------------------ */
  // Each dot is born at a hero edge, pre-assigned a target child container,
  // travels to the root rail, routes DOWN the tree, then snaps into a filed row.
  var dots = [], spawnAt = 0, t0 = 0;
  function edgePoint() {
    var side = Math.floor(Math.random() * 3); // left, top, bottom (never the right where the lattice sits)
    if (side === 0) return { x: -16, y: Math.random() * h };
    if (side === 1) return { x: Math.random() * w * 0.7, y: -16 };
    return { x: Math.random() * w * 0.7, y: h + 16 };
  }
  function spawnDot() {
    if (!containers.length) return;
    var ti = Math.floor(Math.random() * containers.length);
    var e = edgePoint();
    dots.push({
      x: e.x, y: e.y, sx: e.x, sy: e.y,
      ti: ti, prog: 0, leg: 0, filed: false,
      // leg 0: edge → root rail centre ; leg 1: root → child (down the tree)
      dur0: 1900 + Math.random() * 1400, dur1: 900 + Math.random() * 500,
      born: performance.now()
    });
  }

  /* ---- the optional recall pulse (a memory read back out) ---------------- */
  var recall = null;
  function maybeRecall(now) {
    if (recall || !containers.length) return;
    var lit = containers.filter(function (c) { return c.rows.length; });
    if (!lit.length) return;
    var c = lit[Math.floor(Math.random() * lit.length)];
    recall = { fx: c.x, fy: c.y + c.hh / 2, tx: w * 0.08, ty: h * 0.5, prog: 0, born: now, dur: 2600 };
  }

  /* ---- phase clock (one ~18s ambient loop) ------------------------------- */
  var LOOP = 18000;
  var receiptT = 0;   // 0..1 fade of the mono receipt mark in the REST beat

  /* ---- update ------------------------------------------------------------ */
  function update(now) {
    if (!t0) t0 = now;
    var loopT = ((now - t0) % LOOP) / LOOP;     // 0..1 within the loop
    var justLooped = (now - t0) > LOOP && (((now - t0 - 16) % LOOP) / LOOP) > loopT;
    if (justLooped) {
      t0 = now;
      // re-arm GENTLY: trim a few of the OLDEST filed rows to make room (memory
      // is finite, the store breathes) — but NEVER empty. This is the signature.
      for (var ci = 0; ci < containers.length; ci++) {
        var rs = containers[ci].rows;
        if (rs.length > 3) rs.splice(0, 1);      // drop the oldest one only
      }
      receiptT = 0;
    }

    // ARRIVE: spawn sparsely (~1 / 0.6s desktop, halved on mobile) during 0–80%
    var interval = mobile ? 1200 : 620;
    if (loopT < 0.82 && now - spawnAt > interval) { spawnDot(); spawnAt = now; }

    // advance dots
    for (var i = dots.length - 1; i >= 0; i--) {
      var d = dots[i];
      var c = containers[d.ti];
      if (!c) { dots.splice(i, 1); continue; }
      var rootCx = root.x + root.w / 2, rootCy = root.y + root.hh / 2;
      var childCx = c.x + c.w / 2, childTopY = c.y + 4;
      if (d.leg === 0) {
        d.prog += 16 / d.dur0;
        var p = ease(d.prog);
        // route to the root rail (write wants to land at root — but root is protected)
        d.x = d.sx + (rootCx - d.sx) * p;
        d.y = d.sy + (rootCy - d.sy) * p;
        if (d.prog >= 1) {
          // PROTECTED ROOT: a dot that reached cortex is gently DEFLECTED to a
          // child (a 1-frame nudge) — the write-protected root reads with no text.
          d.leg = 1; d.prog = 0; d.sx = rootCx; d.sy = rootCy;
        }
      } else if (d.leg === 1) {
        d.prog += 16 / d.dur1;
        var p1 = ease(d.prog);
        // travel DOWN the tree from root to the child container's filing slot
        var rowY = childTopY + Math.min(c.rows.length, MAX_ROWS - 1) * 6 + 6;
        d.x = d.sx + (childCx - d.sx) * p1;
        d.y = d.sy + (rowY - d.sy) * p1;
        if (d.prog >= 1) {
          // FILE: the only crisp motion in the piece — a deliberate, satisfying click.
          if (c.rows.length >= MAX_ROWS) c.rows.shift();
          c.rows.push({ born: now, o: 0 });
          c.flash = 1;                          // title-hairline brightens one notch
          dots.splice(i, 1);
        }
      }
    }

    // settle container flashes + filed-row fade-in
    for (var k = 0; k < containers.length; k++) {
      var cc = containers[k];
      cc.flash += (0 - cc.flash) * 0.06;        // eases back to rest
      for (var r = 0; r < cc.rows.length; r++) cc.rows[r].o += (1 - cc.rows[r].o) * 0.10;
    }

    // PERSIST beat: occasionally read a memory back out (proves the store is read)
    if (loopT > 0.40 && loopT < 0.78 && Math.random() < 0.004) maybeRecall(now);
    if (recall) {
      recall.prog = (now - recall.born) / recall.dur;
      if (recall.prog >= 1) recall = null;
    }

    // REST beat (80–100%): the receipt mark fades in then out
    if (loopT > 0.82) {
      var rt = (loopT - 0.82) / 0.18;           // 0..1 across the rest beat
      receiptT = rt < 0.5 ? rt * 2 : (1 - rt) * 2;   // up then down
    } else receiptT = 0;

    // dust drift
    for (var u = 0; u < dust.length; u++) {
      var du = dust[u];
      du.x += du.dx; du.y += du.dy;
      if (du.x < 0) du.x = w; else if (du.x > w) du.x = 0;
      if (du.y < 0) du.y = h; else if (du.y > h) du.y = 0;
    }
  }

  /* ---- draw -------------------------------------------------------------- */
  function roundRect(x, y, ww, hh, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + ww, y, x + ww, y + hh, r);
    ctx.arcTo(x + ww, y + hh, x, y + hh, r);
    ctx.arcTo(x, y + hh, x, y, r);
    ctx.arcTo(x, y, x + ww, y, r);
    ctx.closePath();
  }

  function drawLattice() {
    if (!root) return;
    var rootCx = root.x + root.w / 2;

    // hierarchy connectors (root → each child) — faint indigo (pillar identity)
    ctx.lineWidth = 1;
    for (var i = 0; i < containers.length; i++) {
      var c = containers[i], childCx = c.x + c.w / 2;
      ctx.strokeStyle = rgba(HUE, 0.10);
      ctx.beginPath();
      ctx.moveTo(rootCx, root.y + root.hh);
      ctx.lineTo(rootCx, c.y + c.hh / 2);
      ctx.lineTo(childCx, c.y + c.hh / 2);
      ctx.stroke();
    }

    // ROOT rail — drawn write-protected: a tiny lock-hairline, never receives a dot
    ctx.fillStyle = rgba(PAPER, 0.04);
    roundRect(root.x, root.y, root.w, root.hh, 8); ctx.fill();
    ctx.strokeStyle = rgba(HUE, 0.18); ctx.lineWidth = 1; ctx.stroke();
    // lock glyph (shackle + body) — the protected-root tell
    var lx = root.x + 13, ly = root.y + root.hh / 2;
    ctx.strokeStyle = rgba(HUE, 0.40); ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.arc(lx, ly - 2, 2.4, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = rgba(HUE, 0.34);
    roundRect(lx - 3.2, ly - 1, 6.4, 5, 1.2); ctx.fill();
    ctx.font = '600 10px ' + FONT_MONO;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillStyle = rgba(PAPER, 0.32);
    ctx.fillText(root.tag, root.x + 24, ly);

    // child containers — accumulate filed rows, stay lit
    for (var j = 0; j < containers.length; j++) {
      var cc = containers[j];
      ctx.fillStyle = rgba(PAPER, 0.05);
      roundRect(cc.x, cc.y, cc.w, cc.hh, 8); ctx.fill();
      // title-hairline: indigo at rest, brightens to cyan one notch on FILE
      var hairA = 0.14 + cc.flash * 0.4;
      var hairC = cc.flash > 0.04 ? ACCENT : HUE;
      ctx.strokeStyle = rgba(hairC, hairA); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cc.x + 8, cc.y + 0.5); ctx.lineTo(cc.x + cc.w - 8, cc.y + 0.5); ctx.stroke();
      ctx.strokeStyle = rgba(PAPER, 0.06);
      roundRect(cc.x, cc.y, cc.w, cc.hh, 8); ctx.stroke();
      // tag
      ctx.font = '600 9.5px ' + FONT_MONO;
      ctx.fillStyle = rgba(PAPER, 0.30);
      ctx.fillText(cc.tag, cc.x + 9, cc.y + 11);
      // filed rows — persistent, low-contrast tick-lines that survive loops
      for (var r = 0; r < cc.rows.length; r++) {
        var row = cc.rows[r], ry = cc.y + 18 + r * 6;
        if (ry > cc.y + cc.hh - 3) break;
        ctx.strokeStyle = rgba(PAPER, 0.10 * row.o);
        ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(cc.x + 9, ry); ctx.lineTo(cc.x + 9 + (cc.w - 26) * (0.5 + 0.5 * row.o), ry); ctx.stroke();
        // tiny cyan filed-pip at the row head
        ctx.fillStyle = rgba(ACCENT, 0.30 * row.o);
        ctx.beginPath(); ctx.arc(cc.x + 9, ry, 1, 0, 6.2832); ctx.fill();
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = 'round';

    // 1) dust (connective tissue, barely there)
    for (var i = 0; i < dust.length; i++) {
      var du = dust[i];
      ctx.fillStyle = rgba(HUE, du.o);
      ctx.beginPath(); ctx.arc(du.x, du.y, du.r, 0, 6.2832); ctx.fill();
    }

    // 2) the lattice (root + children + filed rows)
    drawLattice();

    // 3) in-flight data dots (cyan, small + few, with a faint motion trail)
    for (var d = 0; d < dots.length; d++) {
      var dt = dots[d];
      var trailX = dt.x - (dt.x - dt.sx) * 0.06, trailY = dt.y - (dt.y - dt.sy) * 0.06;
      var grad = ctx.createLinearGradient(trailX, trailY, dt.x, dt.y);
      grad.addColorStop(0, rgba(ACCENT, 0));
      grad.addColorStop(1, rgba(ACCENT, 0.22));
      ctx.strokeStyle = grad; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(trailX, trailY); ctx.lineTo(dt.x, dt.y); ctx.stroke();
      ctx.fillStyle = rgba(ACCENT, 0.58);
      ctx.beginPath(); ctx.arc(dt.x, dt.y, 2.4, 0, 6.2832); ctx.fill();
    }

    // 4) recall pulse (a memory being read back out toward the hero's left)
    if (recall) {
      var rp = ease(recall.prog);
      var rx = recall.fx + (recall.tx - recall.fx) * rp;
      var ry = recall.fy + (recall.ty - recall.fy) * rp;
      var fade = Math.sin(recall.prog * Math.PI);   // in then out
      ctx.fillStyle = rgba(ACCENT, 0.42 * fade);
      ctx.beginPath(); ctx.arc(rx, ry, 2.2, 0, 6.2832); ctx.fill();
    }

    // 5) the receipt mark (REST beat) — "every write leaves a record"
    if (receiptT > 0.01 && root) {
      var bx = root.x + root.w + 14, by = root.y + 2, bw = 30, bh = 14;
      if (bx + bw > w - 6) { bx = root.x - bw - 14; }   // keep on-canvas
      ctx.globalAlpha = receiptT;
      ctx.strokeStyle = rgba(ACCENT, 0.30); ctx.lineWidth = 1;
      roundRect(bx, by, bw, bh, 4); ctx.stroke();
      ctx.fillStyle = rgba(ACCENT, 0.55);
      ctx.font = '600 8px ' + FONT_MONO;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('●rcpt', bx + bw / 2, by + bh / 2 + 0.5);
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
    // pre-fill each child with 3–5 filed rows (the persisted state, fully drawn)
    for (var c = 0; c < containers.length; c++) {
      var fill = 3 + (c % 3);
      for (var r = 0; r < fill; r++) containers[c].rows.push({ born: 0, o: 1 });
    }
    // a couple of in-flight dots frozen mid-route toward their container
    for (var k = 0; k < (mobile ? 1 : 2); k++) {
      if (!containers.length) break;
      var tgt = containers[k % containers.length];
      dots.push({ x: w * (0.18 + k * 0.16), y: h * (0.40 + k * 0.16), sx: 0, sy: 0,
                  ti: k % containers.length, prog: 0.5, leg: 0 });
    }
    receiptT = 1;                 // receipt present in the frozen frame
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
    if (!t0) t0 = performance.now();
    raf = requestAnimationFrame(tick);
  }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
  function evaluateRun() { if (reduce) return; if (visible && onScreen) start(); else stop(); }

  function init() {
    measure(); layout(); seedDust();
    if (reduce) { drawStatic(); return; }

    document.addEventListener('visibilitychange', function () {
      visible = !document.hidden;
      // freeze the loop clock while hidden so re-show doesn't jump phases
      if (document.hidden) { /* paused */ } else { t0 = 0; spawnAt = 0; }
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
        measure(); layout(); seedDust();    // layout() preserves filed rows
        if (wasReduced) { drawStatic(); return; }
      }, 160);
    }, { passive: true });

    evaluateRun();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
