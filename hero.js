/* ============================================================================
   this.live — SIGNATURE HERO ENGINE
   A living neural-network constellation in deep space that periodically
   self-organizes into truthful mind-maps of real projects (Cortex 6-pillar
   topology, the fleet Tailscale mesh, the route→…→cheaper flywheel) then
   dissolves back to ambient drift. Hand-rolled Canvas 2D. No dependencies.

   Restraint over spectacle. DPR-aware. Single rAF. Capped work per frame.
   - prefers-reduced-motion  → one beautiful STATIC composed constellation
   - off-screen / tab hidden  → paused (IntersectionObserver + visibilitychange)
   - mobile / low-power       → fewer particles, no parallax
   Colors/type pulled from the shared design-system tokens (--accent, hues, fonts).
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
  var HUES = {
    cyan:   tok('--accent', '#2DE2FF'),
    indigo: tok('--indigo', '#818CF8'),
    violet: tok('--violet', '#A78BFA'),
    blue:   tok('--blue',   '#60A5FA'),
    green:  tok('--green',  '#34E5A0'),
    amber:  tok('--amber',  '#FBBF77'),
    muted:  '#5C6B86'
  };
  var ACCENT = HUES.cyan;
  var ACCENT_RGB = hexToRgb(ACCENT) || { r: 45, g: 226, b: 255 };
  var FONT_MONO = tok('--font-mono', "'JetBrains Mono', monospace");

  /* ---- geometry / DPR ---------------------------------------------------- */
  var host = canvas.parentElement;
  var dpr = 1, w = 0, h = 0;
  var isMobile = false;
  function measure() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = host.offsetWidth;
    h = host.offsetHeight;
    isMobile = w < 640;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* ---- particle pool ----------------------------------------------------- */
  /* Each particle has an ambient home (drifting) and, when a map is active, a
     target it springs toward. z ∈ [0,1] drives depth (size + opacity). */
  var pts = [];
  var gridBuf = [];   // reused spatial-hash buckets for the ambient edge pass
  function rand(a, b) { return a + Math.random() * (b - a); }

  function buildPool() {
    var area = w * h;
    var density = reduce ? 16000 : (isMobile ? 17000 : 11000);
    var n = Math.max(26, Math.min(reduce ? 150 : (isMobile ? 60 : 150), Math.floor(area / density)));
    pts = [];
    for (var i = 0; i < n; i++) {
      var z = Math.random();
      pts.push({
        hx: Math.random() * w, hy: Math.random() * h,   // ambient home
        x: Math.random() * w, y: Math.random() * h,      // current
        vx: 0, vy: 0,                                    // spring velocity
        dx: rand(-0.16, 0.16), dy: rand(-0.16, 0.16),    // ambient drift
        z: z,
        r: 0.6 + z * 1.9,
        baseO: 0.10 + z * 0.34,
        tx: null, ty: null,        // map target (null = ambient)
        node: null,                // bound map node (for labels/hue)
        glow: 0                    // 0..1 highlight for formed nodes
      });
    }
  }

  /* ---- mind-map data ----------------------------------------------------- */
  var MAPS = null, mapIndex = 0;
  function mapCenter() {
    // On wide layouts the hero copy owns the left column, so the constellation
    // lives in the open right-hand space (whole map stays legible). On narrow/
    // mobile layouts the copy sits above, so the map is centred.
    var wide = w >= 900;
    return { cx: w * (wide ? 0.70 : 0.5), cy: h * (wide ? 0.50 : 0.46) };
  }
  function mapSpan() {
    var s = Math.min(w, h) * (isMobile ? 0.40 : 0.34);
    return { span: s, spanX: Math.min(w * (w >= 900 ? 0.26 : 0.40), s * 1.5) };
  }
  function projectMap(map) {
    // place a normalized (-1..1) map into an aspect-safe box
    var ctr = mapCenter(), sp = mapSpan();
    var cx = ctr.cx, cy = ctr.cy, span = sp.span, spanX = sp.spanX;
    var nodes = {};
    map.nodes.forEach(function (nd) {
      nodes[nd.id] = {
        id: nd.id, label: nd.label, hue: HUES[nd.hue] || ACCENT,
        dim: !!nd.dim, core: !!nd.core,
        x: cx + nd.x * spanX, y: cy + nd.y * span
      };
    });
    return { nodes: nodes, edges: map.edges, label: map.label, caption: map.caption };
  }

  /* ---- assignment: bind nearest free particles to node targets ----------- */
  function bindMap(proj) {
    // reset bindings
    for (var i = 0; i < pts.length; i++) { pts[i].tx = pts[i].ty = null; pts[i].node = null; pts[i].glow = 0; }
    var ids = Object.keys(proj.nodes);
    var used = {};
    ids.forEach(function (id) {
      var nd = proj.nodes[id];
      // pick the closest unused particle to this node target
      var best = -1, bestD = Infinity;
      for (var i = 0; i < pts.length; i++) {
        if (used[i]) continue;
        var ddx = pts[i].x - nd.x, ddy = pts[i].y - nd.y, d = ddx * ddx + ddy * ddy;
        if (d < bestD) { bestD = d; best = i; }
      }
      if (best >= 0) {
        used[best] = true;
        var p = pts[best];
        p.tx = nd.x; p.ty = nd.y; p.node = nd;
        p.z = nd.dim ? 0.45 : 0.96;        // formed nodes sit forward (dim ones recede)
        p.r = (nd.core ? 4.2 : 3.0);
      }
    });
    proj._bound = true;
    return proj;
  }

  /* ---- morph clock ------------------------------------------------------- */
  var PHASE = { AMBIENT: 0, FORM: 1, HOLD: 2, DISSOLVE: 3 };
  var DUR = { AMBIENT: 4200, FORM: 1300, HOLD: 3400, DISSOLVE: 1200 };
  var phase = PHASE.AMBIENT, phaseStart = 0, formAmt = 0; // 0 ambient → 1 fully formed
  var active = null; // current projected+bound map

  function advance(now) {
    var el = now - phaseStart;
    if (phase === PHASE.AMBIENT) {
      if (el >= DUR.AMBIENT) {
        active = bindMap(projectMap(MAPS[mapIndex]));
        phase = PHASE.FORM; phaseStart = now;
      }
    } else if (phase === PHASE.FORM) {
      formAmt = easeOut(Math.min(1, el / DUR.FORM));
      if (el >= DUR.FORM) { formAmt = 1; phase = PHASE.HOLD; phaseStart = now; }
    } else if (phase === PHASE.HOLD) {
      formAmt = 1;
      if (el >= DUR.HOLD) { phase = PHASE.DISSOLVE; phaseStart = now; }
    } else if (phase === PHASE.DISSOLVE) {
      formAmt = 1 - easeInOut(Math.min(1, el / DUR.DISSOLVE));
      if (el >= DUR.DISSOLVE) {
        formAmt = 0;
        for (var i = 0; i < pts.length; i++) { pts[i].tx = pts[i].ty = null; pts[i].node = null; }
        active = null;
        mapIndex = (mapIndex + 1) % MAPS.length;
        phase = PHASE.AMBIENT; phaseStart = now;
      }
    }
  }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  /* ---- parallax (mouse + scroll) ----------------------------------------- */
  var pmx = 0, pmy = 0, tmx = 0, tmy = 0, scrollPar = 0;
  if (!reduce && !isMobile) {
    window.addEventListener('pointermove', function (e) {
      var rect = host.getBoundingClientRect();
      tmx = ((e.clientX - rect.left) / w - 0.5) * 2;
      tmy = ((e.clientY - rect.top) / h - 0.5) * 2;
    }, { passive: true });
    window.addEventListener('scroll', function () {
      scrollPar = Math.max(-1, Math.min(1, window.scrollY / Math.max(1, h)));
    }, { passive: true });
  }

  /* ---- render ------------------------------------------------------------ */
  var EDGE_D2 = 0;          // ambient connect distance²
  function recalcEdgeDist() { var s = Math.min(w, h); EDGE_D2 = Math.pow(s * (isMobile ? 0.20 : 0.16), 2); }

  function rgba(rgb, a) { return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + a + ')'; }
  function hexToRgb(hex) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
    return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
  }
  var hueRgbCache = {};
  function hueRgb(hex) { return hueRgbCache[hex] || (hueRgbCache[hex] = hexToRgb(hex) || ACCENT_RGB); }

  function stepAmbient(p) {
    p.hx += p.dx; p.hy += p.dy;
    if (p.hx < -20) p.hx = w + 20; else if (p.hx > w + 20) p.hx = -20;
    if (p.hy < -20) p.hy = h + 20; else if (p.hy > h + 20) p.hy = -20;
  }

  function draw(now) {
    ctx.clearRect(0, 0, w, h);

    // smooth parallax toward target
    pmx += (tmx - pmx) * 0.05; pmy += (tmy - pmy) * 0.05;

    var formed = formAmt > 0.001 && active;

    // 1) advance positions (ambient home + spring toward target when forming)
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      stepAmbient(p);
      var ax = p.hx, ay = p.hy;
      if (formed && p.tx != null) {
        // critically-damped-ish spring blended by formAmt
        var gx = ax + (p.tx - ax) * formAmt;
        var gy = ay + (p.ty - ay) * formAmt;
        var k = 0.14, dmp = 0.78;
        p.vx = (p.vx + (gx - p.x) * k) * dmp;
        p.vy = (p.vy + (gy - p.y) * k) * dmp;
        p.x += p.vx; p.y += p.vy;
        p.glow += ((p.node && p.node.dim ? 0.35 : 1) * formAmt - p.glow) * 0.12;
      } else {
        p.x += (ax - p.x) * 0.10; p.y += (ay - p.y) * 0.10;
        p.glow += (0 - p.glow) * 0.12;
      }
    }

    // parallax offset by depth (foreground moves more); subtle
    var par = isMobile ? 0 : 1;
    function px(p) { return p.x + (pmx * 18 + 0) * p.z * par; }
    function py(p) { return p.y + (pmy * 14 - scrollPar * 26) * p.z * par; }

    ctx.lineCap = 'round';

    // 2) ambient edges (distance-faded). A spatial-hash grid keeps this O(n)
    //    instead of O(n²): each point only tests its own + adjacent cells, so
    //    the busiest ambient frame stays inside the 16.7ms/60fps budget.
    if (formAmt < 0.75) {
      var ambA = (1 - formAmt);
      ctx.lineWidth = 0.6;
      var cell = Math.sqrt(EDGE_D2);                    // cell == connect radius
      var cols = Math.max(1, Math.ceil(w / cell)) + 1;
      var grid = gridBuf; for (var gi = 0; gi < grid.length; gi++) grid[gi] = null;
      // bucket
      for (var g = 0; g < pts.length; g++) {
        var pg = pts[g];
        var cxi = (pg.x / cell) | 0, cyi = (pg.y / cell) | 0;
        if (cxi < 0) cxi = 0; if (cyi < 0) cyi = 0;
        var key = cyi * cols + cxi;
        (grid[key] || (grid[key] = [])).push(g);
      }
      // for each point, test the 4 forward neighbor cells (avoids dup pairs)
      var NB = [[0, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
      for (var p = 0; p < pts.length; p++) {
        var pa = pts[p];
        var pcx = (pa.x / cell) | 0, pcy = (pa.y / cell) | 0;
        if (pcx < 0) pcx = 0; if (pcy < 0) pcy = 0;
        for (var nb = 0; nb < NB.length; nb++) {
          var bucket = grid[(pcy + NB[nb][1]) * cols + (pcx + NB[nb][0])];
          if (!bucket) continue;
          for (var bi = 0; bi < bucket.length; bi++) {
            var q = bucket[bi];
            if (q <= p) continue;                        // each pair once
            var pb = pts[q];
            var ex = pa.x - pb.x, ey = pa.y - pb.y, d2 = ex * ex + ey * ey;
            if (d2 < EDGE_D2) {
              var t = 1 - d2 / EDGE_D2;
              var o = 0.055 * t * (pa.z * 0.5 + 0.5) * ambA;
              if (o < 0.004) continue;
              ctx.strokeStyle = rgba(ACCENT_RGB, o);
              ctx.beginPath(); ctx.moveTo(px(pa), py(pa)); ctx.lineTo(px(pb), py(pb)); ctx.stroke();
            }
          }
        }
      }
    }

    // 3) map edges (grow with formAmt)
    if (formed) {
      var nodes = active.nodes, edges = active.edges;
      for (var e = 0; e < edges.length; e++) {
        var ed = edges[e];
        var n1 = nodes[ed.from], n2 = nodes[ed.to];
        if (!n1 || !n2) continue;
        var grow = Math.min(1, formAmt * 1.25);
        var sx = n1.x, sy = n1.y;
        var ex2 = n1.x + (n2.x - n1.x) * grow, ey2 = n1.y + (n2.y - n1.y) * grow;
        // parallax-shift map edges too (use core depth ~0.96)
        var po = (pmx * 18) * 0.9 * par, po2 = (pmy * 14 - scrollPar * 26) * 0.9 * par;
        var eo = ed.dim ? 0.10 : 0.42;
        var col = ed.flywheel ? hueRgb(HUES.amber) : ACCENT_RGB;
        ctx.strokeStyle = rgba(col, eo * formAmt);
        ctx.lineWidth = ed.dim ? 0.7 : (ed.governs ? 0.9 : 1.3);
        if (ed.governs) ctx.setLineDash([2, 5]); else ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(sx + po, sy + po2);
        ctx.lineTo(ex2 + po, ey2 + po2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // 4) nodes (glow + core). Additive-ish glow via radial gradient.
    for (var j = 0; j < pts.length; j++) {
      var p2 = pts[j];
      var X = px(p2), Y = py(p2);
      var bound = formed && p2.node;
      var hueC = bound ? hueRgb(p2.node.hue) : ACCENT_RGB;
      var depthO = p2.baseO * (0.45 + p2.z * 0.55);
      var o2 = bound ? (p2.node.dim ? 0.30 : 0.92) * formAmt + depthO * (1 - formAmt) : depthO;
      var rr = bound ? p2.r * (0.6 + 0.4 * Math.min(1, formAmt)) : p2.r;

      // soft glow on forward / formed nodes
      var gAmt = bound ? (p2.node.dim ? 0.25 : 1) * formAmt : (p2.z > 0.7 ? (p2.z - 0.7) * 1.4 : 0);
      if (gAmt > 0.02) {
        var gr = rr * (bound ? 6 : 4.5);
        var g = ctx.createRadialGradient(X, Y, 0, X, Y, gr);
        g.addColorStop(0, rgba(hueC, 0.30 * gAmt));
        g.addColorStop(1, rgba(hueC, 0));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(X, Y, gr, 0, 6.2832); ctx.fill();
      }
      // core dot
      ctx.fillStyle = rgba(hueC, o2);
      ctx.beginPath(); ctx.arc(X, Y, rr, 0, 6.2832); ctx.fill();
      // bright pip on formed core nodes
      if (bound && p2.node.core && formAmt > 0.5) {
        ctx.fillStyle = rgba({ r: 255, g: 255, b: 255 }, 0.9 * formAmt);
        ctx.beginPath(); ctx.arc(X, Y, rr * 0.4, 0, 6.2832); ctx.fill();
      }
    }

    // 5) labels (design-system mono type), fade in late, only when formed
    if (formed && formAmt > 0.55) {
      var lblA = Math.min(1, (formAmt - 0.55) / 0.4);
      ctx.font = '600 ' + (isMobile ? 10 : 11) + "px " + FONT_MONO;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var nds = active.nodes;
      for (var nk in nds) {
        var nd = nds[nk];
        var lx = nd.x + (pmx * 18) * 0.9 * par;
        var ly = nd.y + (pmy * 14 - scrollPar * 26) * 0.9 * par + (nd.core ? 0 : 0);
        var labY = ly + (isMobile ? 14 : 17);
        // label chip backing for legibility
        var txt = nd.label;
        var tw = ctx.measureText(txt).width;
        ctx.fillStyle = rgba({ r: 8, g: 11, b: 20 }, 0.55 * lblA);
        roundRect(ctx, lx - tw / 2 - 6, labY - 8, tw + 12, 16, 5); ctx.fill();
        ctx.fillStyle = nd.dim ? rgba({ r: 243, g: 246, b: 251 }, 0.42 * lblA)
                               : rgba({ r: 243, g: 246, b: 251 }, 0.92 * lblA);
        ctx.fillText(txt, lx, labY);
      }
      // map title (above the constellation box)
      ctx.font = '600 ' + (isMobile ? 10 : 11) + "px " + FONT_MONO;
      var ctr = mapCenter();
      var titleY = ctr.cy - mapSpan().span - (isMobile ? 8 : 16);
      ctx.fillStyle = rgba(ACCENT_RGB, 0.85 * lblA);
      ctx.textAlign = 'center';
      ctx.fillText(active.label.toUpperCase(), ctr.cx, Math.max(20, titleY));
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
  function drawStatic() {
    // one beautiful, fully-formed Cortex constellation — painted once, no rAF.
    measure(); buildPool(); recalcEdgeDist();
    // settle ambient a touch so it isn't a uniform grid
    for (var s = 0; s < 30; s++) for (var i = 0; i < pts.length; i++) stepAmbient(pts[i]);
    for (var k = 0; k < pts.length; k++) { pts[k].x = pts[k].hx; pts[k].y = pts[k].hy; }
    active = bindMap(projectMap(MAPS[0]));
    // snap bound particles onto targets
    for (var j = 0; j < pts.length; j++) {
      if (pts[j].tx != null) { pts[j].x = pts[j].tx; pts[j].y = pts[j].ty; pts[j].glow = 1; }
    }
    formAmt = 1; phase = PHASE.HOLD;
    pmx = pmy = scrollPar = 0;
    draw(performance.now());
  }

  /* ---- loop control ------------------------------------------------------ */
  var raf = 0, running = false, visible = true, onScreen = true, started = false;
  function tick(now) {
    if (!running) return;
    advance(now);
    draw(now);
    raf = requestAnimationFrame(tick);
  }
  function start() {
    if (running || reduce) return;
    running = true; phaseStart = performance.now();
    raf = requestAnimationFrame(tick);
  }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
  /* capture mode: lets verification drive phases & ignore the hidden-tab pause
     (headless preview reports the tab as hidden). Gated behind ?herocap=1 so it
     never affects production. */
  var CAP = /[?&]herocap=1/.test(location.search);
  function evaluateRun() {
    if (reduce) return;
    if (CAP) { start(); return; }
    if (visible && onScreen) start(); else stop();
  }

  function init(maps) {
    MAPS = maps;
    measure(); recalcEdgeDist();
    if (reduce) { drawStatic(); return; }
    buildPool();
    started = true;
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
    // resize (debounced) — keep zero layout shift, just re-fit
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        var wasReduced = reduce;
        measure(); recalcEdgeDist();
        if (wasReduced) { drawStatic(); return; }
        // rescale homes proportionally rather than reseeding (no flash)
        buildPool();
      }, 160);
    }, { passive: true });

    // verification harness (debug-only): force a given map into a held formed
    // state, or release back to the live cycle. No-op unless ?herocap=1.
    if (CAP) {
      window.__hero = {
        maps: function () { return MAPS.map(function (m) { return m.id; }); },
        // hold(index): freeze a fully-formed map for screenshots
        hold: function (i) {
          mapIndex = ((i || 0) % MAPS.length + MAPS.length) % MAPS.length;
          active = bindMap(projectMap(MAPS[mapIndex]));
          for (var k = 0; k < pts.length; k++) {
            if (pts[k].tx != null) { pts[k].x = pts[k].tx; pts[k].y = pts[k].ty; }
          }
          formAmt = 1; phase = PHASE.HOLD; phaseStart = performance.now();
          stop(); draw(performance.now());
          return MAPS[mapIndex].id;
        },
        // freeze mid-dissolve so the morph-out is observable
        dissolve: function (i, t) {
          mapIndex = ((i || 0) % MAPS.length + MAPS.length) % MAPS.length;
          active = bindMap(projectMap(MAPS[mapIndex]));
          for (var k = 0; k < pts.length; k++) {
            if (pts[k].tx != null) { pts[k].x = pts[k].tx; pts[k].y = pts[k].ty; }
          }
          formAmt = 1 - easeInOut(t == null ? 0.5 : t);
          phase = PHASE.DISSOLVE; stop(); draw(performance.now());
          return formAmt;
        },
        ambient: function () { formAmt = 0; active = null; phase = PHASE.AMBIENT; phaseStart = performance.now(); start(); },
        phase: function () { return ['ambient', 'form', 'hold', 'dissolve'][phase] + ' formAmt=' + formAmt.toFixed(2); }
      };
    }
    evaluateRun();
  }

  /* ---- load data (same-origin; CSP default-src 'self') ------------------- */
  function boot() {
    fetch('/assets/mindmaps.json', { cache: 'force-cache' })
      .then(function (r) { return r.json(); })
      .then(function (data) { init(data.maps); })
      .catch(function () {
        // graceful: ambient-only with an inline Cortex fallback so it's never blank
        init([{ id: 'cortex', label: 'Cortex Suite', caption: '', nodes: [
          { id: 'c', label: 'Cortex', x: 0, y: 0, hue: 'green', core: true },
          { id: 'm', label: 'Maestro', x: -0.6, y: -0.4, hue: 'cyan' },
          { id: 'n', label: 'Mnemos', x: 0.6, y: -0.4, hue: 'indigo' },
          { id: 'f', label: 'Fabric', x: 0.7, y: 0.4, hue: 'violet' },
          { id: 's', label: 'Surfaces', x: 0, y: 0.7, hue: 'blue' },
          { id: 'g', label: 'Forge', x: -0.7, y: 0.4, hue: 'amber' }
        ], edges: [
          { from: 's', to: 'f' }, { from: 'f', to: 'm' }, { from: 'm', to: 'n' },
          { from: 'g', to: 'm' }, { from: 'c', to: 'm', governs: true }, { from: 'c', to: 'n', governs: true }
        ] }]);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})();
