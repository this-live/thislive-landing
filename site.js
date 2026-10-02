/* this.live consulting site: navigation, scroll reveal, flow cards, calculator.

   Flow cards follow Bryce's motion and HUD rules (cortex-ops COMPANY-MAP-MOTION-BRIEF,
   JARVIS visual language): flat crisp nodes, one state channel per meaning
   (cyan running, amber waiting, rose blocked, a check for done), n8n-style
   connectors where the connector INTO the running step is the only thing that
   moves, real data in the output panel, short critically damped motion, no
   glow, no floating dots. prefers-reduced-motion gets the finished frame.
   Dependency-free; CSP-safe ('self' only). */
(function () {
  'use strict';

  /* ================================================================ Motion
     Small primitive set. Everything is interruptible through a Run token and
     resolves instantly under reduced motion. */
  var Motion = (function () {
    var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var linearOK = !!(window.CSS && CSS.supports && CSS.supports('transition-timing-function', 'linear(0, 1)'));

    /* Spring easing as a CSS linear() curve. Critically damped by default:
       settles without overshoot, the "camera" feel from the motion brief. */
    function spring(stiffness, damping) {
      var k = stiffness || 260, c = damping || 2 * Math.sqrt(k), w0 = Math.sqrt(k), z = c / (2 * w0);
      var x = function (t) {
        if (z >= 1) { return 1 - (1 + w0 * t) * Math.exp(-w0 * t); }
        var wd = w0 * Math.sqrt(1 - z * z);
        return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t));
      };
      var T = 0.05;
      while (T < 3 && Math.abs(1 - x(T)) > 0.001) { T += 0.01; }
      var pts = [];
      for (var i = 0; i <= 32; i++) { pts.push(+x(T * i / 32).toFixed(4)); }
      pts[pts.length - 1] = 1;
      return { easing: linearOK ? 'linear(' + pts.join(', ') + ')' : 'cubic-bezier(0.22, 1, 0.36, 1)', duration: Math.round(T * 1000) };
    }
    var SETTLE = spring(260);          /* ~600 ms: layout and card moves */
    var EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';

    function Run() { this.alive = true; }
    Run.prototype.cancel = function () { this.alive = false; };

    function wait(ms, run) {
      return new Promise(function (res) {
        if (reduced || ms <= 0) { res(!run || run.alive); return; }
        setTimeout(function () { res(!run || run.alive); }, ms);
      });
    }

    /* Reveal: 180 ms ease-out, 6 px rise. Used for nodes, rows and labels. */
    function reveal(el, delay) {
      if (reduced || !el.animate) { el.style.opacity = ''; return Promise.resolve(); }
      return el.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }],
        { duration: 180, delay: delay || 0, easing: EASE_OUT, fill: 'backwards' }).finished.catch(function () {});
    }

    function fade(el, to, dur) {
      if (reduced || !el.animate) { el.style.opacity = to; return Promise.resolve(); }
      var from = getComputedStyle(el).opacity;
      el.style.opacity = to;
      return el.animate([{ opacity: from }, { opacity: to }], { duration: dur || 160, easing: EASE_OUT }).finished.catch(function () {});
    }

    /* Draw an SVG path in the direction of flow (edge entry). */
    function draw(path, dur, delay) {
      if (reduced || !path.animate) { return Promise.resolve(); }
      var len = path.getTotalLength();
      path.style.strokeDasharray = len + ' ' + len;
      var a = path.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
        { duration: dur || 320, delay: delay || 0, easing: EASE_OUT, fill: 'backwards' });
      return a.finished.then(function () { path.style.strokeDasharray = ''; }, function () { path.style.strokeDasharray = ''; });
    }

    /* Calm typewriter for AI-written text (~45 chars/s). */
    function type(el, text, run) {
      if (reduced) { el.textContent = text; return Promise.resolve(); }
      var caret = document.createElement('i');
      caret.className = 'mi-caret';
      el.textContent = '';
      var node = document.createTextNode('');
      el.appendChild(node); el.appendChild(caret);
      var i = 0;
      return new Promise(function (res) {
        (function step() {
          if (run && !run.alive) { node.data = text; caret.remove(); res(); return; }
          i = Math.min(text.length, i + 2);
          node.data = text.slice(0, i);
          if (i >= text.length) { setTimeout(function () { caret.remove(); res(); }, 260); return; }
          setTimeout(step, 44);
        })();
      });
    }

    /* Number ticker with tabular figures. */
    function count(el, to, fmt, run) {
      var f = fmt || function (n) { return Math.round(n).toLocaleString('en-US'); };
      if (reduced) { el.textContent = f(to); return Promise.resolve(); }
      var t0 = 0, dur = 700;
      return new Promise(function (res) {
        (function frame(now) {
          if (!t0) { t0 = now; }
          var p = Math.min(1, (now - t0) / dur);
          if (run && !run.alive) { p = 1; }
          el.textContent = f(to * (1 - Math.pow(1 - p, 3)));
          if (p < 1) { requestAnimationFrame(frame); } else { res(); }
        })(performance.now());
      });
    }

    function onVisible(el, cb, threshold) {
      if (!('IntersectionObserver' in window)) { cb(true); return; }
      new IntersectionObserver(function (es) { es.forEach(function (e) { cb(e.isIntersecting); }); },
        { threshold: threshold || 0.3 }).observe(el);
    }

    if (linearOK) { document.documentElement.style.setProperty('--ease-settle', SETTLE.easing); }
    document.documentElement.style.setProperty('--dur-settle', SETTLE.duration + 'ms');

    return { reduced: reduced, spring: spring, Run: Run, wait: wait, reveal: reveal, fade: fade, draw: draw, type: type, count: count, onVisible: onVisible };
  })();

  var SVGNS = 'http://www.w3.org/2000/svg';
  function el(tag, cls, parent, ns) {
    var n = ns ? document.createElementNS(SVGNS, tag) : document.createElement(tag);
    if (cls) { n.setAttribute('class', cls); }
    if (parent) { parent.appendChild(n); }
    return n;
  }

  /* Lucide icon bodies (24x24, stroke). */
  var ICONS = {
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    table: '<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>',
    receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
    calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    bot: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',
    'user-check': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>',
    'file-text': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
    smartphone: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
    dashboard: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
    cpu: '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
    code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    flask: '<path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5c-1.4 0-2.5-1.1-2.5-2.5V2"/><path d="M8.5 2h7"/><path d="M14.5 16h-5"/>',
    eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    clipboard: '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
    chart: '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    waves: '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    alert: '<path d="M12 8v4"/><path d="M12 16h.01"/>'
  };
  function icon(name, size) {
    return '<svg viewBox="0 0 24 24" width="' + (size || 22) + '" height="' + (size || 22) + '" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }

  /* ================================================================ Flows
     n: nodes [id, col, row, icon, title, sub, opts]; opts: t trigger, w wide,
        subs [[icon,label],...] (AI capabilities hanging below, n8n style)
     e: edges [id, from, to]
     s: steps { e: edges that carry work INTO this step, n: {node: final state},
        wait: node held amber before it completes, out: [panel node, rows],
        after: rows shown once a wait resolves }
     rows: [key, value, kind]; kind: 'type' (AI text), 'n' (count to number,
        value = [number, prefix, suffix]), 'ok' | 'warn' | 'bad' (status pill) */
  var FLOWS = {
    lead: {
      title: 'Lead follow-up', tag: 'Sample data',
      n: [['form', 0, 0, 'globe', 'Website form', 'Trigger', { t: 1 }],
          ['mail', 0, 1, 'mail', 'New email', 'Trigger', { t: 1 }],
          ['ai', 1, 0.5, 'bot', 'Draft reply', 'AI agent', { w: 1, subs: [['cpu', 'Model'], ['database', 'Memory'], ['clipboard', 'Your rules']] }],
          ['ok', 2, 0.5, 'user-check', 'You approve', 'Waits for you'],
          ['crm', 3, 0, 'users', 'Add to CRM', 'Contact + notes'],
          ['cal', 3, 1, 'calendar', 'Follow-up', 'If no reply']],
      e: [['e1', 'form', 'ai'], ['e2', 'mail', 'ai'], ['e3', 'ai', 'ok'], ['e4', 'ok', 'crm'], ['e5', 'ok', 'cal']],
      s: [
        { e: [], n: { form: 'done' }, out: ['Website form', [['name', 'Dana R.'], ['email', 'dana.r@example.com'], ['message', 'Looking for a quote to redo our kitchen in Coventry. Weekday evenings work best.'], ['received', 'Sun 21:14']]] },
        { e: ['e1'], n: { ai: 'done' }, out: ['Draft reply', [['to', 'dana.r@example.com'], ['subject', 'Re: Kitchen remodel quote'], ['draft', 'Hi Dana, thanks for reaching out. We can walk the kitchen Tuesday at 6 pm or Thursday at 5:30. Could you send two photos and rough measurements?', 'type'], ['checked', 'Calendar, price list']]] },
        { e: ['e3'], n: { ok: 'done' }, wait: 'ok', out: ['You approve', [['status', 'Waiting for you', 'warn'], ['sent to', 'Your phone']]], after: [['status', 'Approved', 'ok'], ['edits', 'None'], ['sent', 'Sun 21:31']] },
        { e: ['e4', 'e5'], n: { crm: 'done', cal: 'done' }, out: ['Add to CRM', [['contact', 'Dana R., new lead'], ['stage', 'Quote sent'], ['follow-up', 'Tue 9:00 if no reply'], ['time to reply', [17, '', ' min'], 'n']]] }
      ]
    },
    paperwork: {
      title: 'Invoice intake', tag: 'Sample data',
      n: [['in', 0, 0.5, 'file-text', 'New invoice', 'Shared folder', { t: 1 }],
          ['read', 1, 0.5, 'bot', 'Read document', 'AI agent', { w: 1, subs: [['cpu', 'Model'], ['clipboard', 'Field list']] }],
          ['chk', 2, 0.5, 'shield-check', 'Check totals', 'Your rules'],
          ['books', 3, 0, 'receipt', 'Post to books', 'Accounting'],
          ['rev', 3, 1, 'flag', 'Needs review', 'Waits for a person']],
      e: [['p1', 'in', 'read'], ['p2', 'read', 'chk'], ['p3', 'chk', 'books'], ['p4', 'chk', 'rev']],
      s: [
        { e: [], n: { in: 'done' }, out: ['New invoice', [['files', [3, '', ' PDFs'], 'n'], ['first', 'INV-2291.pdf'], ['from', 'Tri-County Supply'], ['received', 'Mon 08:02']]] },
        { e: ['p1'], n: { read: 'done' }, out: ['Read document', [['vendor', 'Tri-County Supply'], ['invoice', 'INV-2291, Sep 29'], ['line items', [12, '', ''], 'n'], ['total', [1284.5, '$', ''], 'n']]] },
        { e: ['p2'], n: { chk: 'done' }, out: ['Check totals', [['line sum', '$1,284.50'], ['matches total', 'Yes', 'ok'], ['vendor', 'On file', 'ok'], ['duplicate', 'None found', 'ok']]] },
        { e: ['p3', 'p4'], n: { books: 'done', rev: 'flag' }, out: ['Post to books', [['posted', [2, '', ' invoices'], 'n'], ['amount', '$3,112.80'], ['flagged', 'INV-2294: lines $421.00, total $412.00', 'bad'], ['next', 'Flag waits for a person']]] }
      ]
    },
    report: {
      title: 'Weekly report', tag: 'Sample data',
      n: [['when', 0, 1, 'clock', 'Every Monday', '6:00 am', { t: 1 }],
          ['sales', 1, 0, 'users', 'Sales', 'CRM'],
          ['jobs', 1, 1, 'table', 'Jobs', 'Spreadsheet'],
          ['inv', 1, 2, 'receipt', 'Invoices', 'Accounting'],
          ['build', 2, 1, 'bot', 'Build report', 'AI agent', { w: 1, subs: [['cpu', 'Model'], ['chart', 'Past 8 weeks']] }],
          ['send', 3, 1, 'mail', 'Email it', 'Owner + office']],
      e: [['r1', 'when', 'sales'], ['r2', 'when', 'jobs'], ['r3', 'when', 'inv'], ['r4', 'sales', 'build'], ['r5', 'jobs', 'build'], ['r6', 'inv', 'build'], ['r7', 'build', 'send']],
      s: [
        { e: ['r1', 'r2', 'r3'], n: { when: 'done', sales: 'done', jobs: 'done', inv: 'done' }, out: ['Pull data', [['deals', [46, '', ''], 'n'], ['jobs', [31, '', ''], 'n'], ['invoices', [112, '', ''], 'n'], ['pulled', 'Mon 06:00']]] },
        { e: ['r4', 'r5', 'r6'], n: { build: 'run' }, out: ['Build report', [['revenue', [48210, '$', ''], 'n'], ['vs last week', '+6%', 'ok'], ['jobs closed', [31, '', ''], 'n'], ['open invoices', [18, '', ''], 'n']]] },
        { e: [], n: { build: 'done' }, out: ['Build report', [['note', 'Four invoices are past 30 days, $6,940 in total.', 'type'], ['note', 'Jobs closed are up three on last week.', 'type']]] },
        { e: ['r7'], n: { send: 'done' }, out: ['Email it', [['to', 'Owner, office manager'], ['subject', 'Week of Sep 22: revenue up 6%'], ['sent', 'Mon 06:02']]] }
      ]
    },
    sheet: {
      title: 'Spreadsheet to app', tag: 'Sample data',
      n: [['sheet', 0, 0.5, 'table', 'Master sheet', 'Shared drive', { t: 1 }],
          ['map', 1, 0.5, 'clipboard', 'Map the rules', 'With your team'],
          ['db', 2, 0.5, 'database', 'Database', 'Validated'],
          ['app', 3, 0, 'smartphone', 'Team app', 'Phone + desktop'],
          ['dash', 3, 1, 'dashboard', 'Dashboard', 'Live']],
      e: [['s1', 'sheet', 'map'], ['s2', 'map', 'db'], ['s3', 'db', 'app'], ['s4', 'db', 'dash']],
      s: [
        { e: ['s1'], n: { sheet: 'done', map: 'done' }, out: ['Map the rules', [['columns', [14, '', ''], 'n'], ['rows', [2317, '', ''], 'n'], ['rules found', [6, '', ''], 'n'], ['example', 'Job numbers must be unique']]] },
        { e: ['s2'], n: { db: 'done' }, out: ['Database', [['tables', 'Jobs, Customers, Crews, Invoices'], ['rules', '6 enforced', 'ok'], ['history', 'Every change logged'], ['access', 'By role']]] },
        { e: ['s3'], n: { app: 'done' }, out: ['Team app', [['screens', 'Check in, New job, Find a job'], ['devices', 'Phone, tablet, desktop'], ['sign in', 'Each person, own login']]] },
        { e: ['s4'], n: { dash: 'done' }, out: ['Dashboard', [['open jobs', [27, '', ''], 'n'], ['waiting on parts', [4, '', ''], 'n'], ['overdue', '2 jobs', 'warn'], ['updated', 'Live']]] }
      ]
    },
    practice: {
      title: 'Practice planner', tag: 'Real build',
      n: [['set', 0, 0.5, 'calendar', 'Season setup', 'Coach input', { t: 1 }],
          ['eng', 1, 0.5, 'cpu', 'Practice engine', 'Plans each day', { w: 1, subs: [['clipboard', 'Club rules'], ['waves', 'Group levels']] }],
          ['chk', 2, 0.5, 'shield-check', 'Rule checker', 'Blocks bad sets'],
          ['pdf', 3, 0, 'file-text', 'Coach sheet', 'Ready to print'],
          ['card', 3, 1, 'clipboard', 'Group cards', 'One per group']],
      e: [['q1', 'set', 'eng'], ['q2', 'eng', 'chk'], ['q3', 'chk', 'pdf'], ['q4', 'chk', 'card']],
      s: [
        { e: [], n: { set: 'done' }, out: ['Season setup', [['groups', 'PRE, AG1, AG2, AG3, SR'], ['season', 'Sep to Mar, yards'], ['meets', [9, '', ''], 'n']]] },
        { e: ['q1'], n: { eng: 'done' }, out: ['Practice engine', [['group', 'AG3, Tuesday'], ['warm-up', '400 swim, 4 x 50 kick', 'type'], ['main', '8 x 100 free on 1:40, aerobic', 'type'], ['cool-down', '200 easy', 'type']]] },
        { e: ['q2'], n: { chk: 'done' }, out: ['Rule checker', [['distance', 'Inside the AG3 limit', 'ok'], ['rest', 'Valid', 'ok'], ['focus', 'Matches the week', 'ok']]] },
        { e: ['q3', 'q4'], n: { pdf: 'done', card: 'done' }, out: ['Coach sheet', [['coach sheet', 'PDF, ready to print'], ['group cards', [5, '', ''], 'n'], ['status', 'Ready for the pool deck', 'ok']]] }
      ]
    },
    agents: {
      title: 'How a change ships', tag: 'Example change',
      n: [['brief', 0, 1, 'user', 'Your brief', 'Plain language', { t: 1 }],
          ['plan', 1, 1, 'compass', 'Architecture', 'Bryce', { w: 1, subs: [['clipboard', 'Acceptance checks']] }],
          ['build', 2, 0, 'code', 'Build agent', 'Writes code'],
          ['test', 2, 1, 'flask', 'Test agent', 'Runs tests'],
          ['rev', 2, 2, 'eye', 'Review agent', 'Reads the diff'],
          ['ver', 3, 1, 'shield-check', 'Verified', 'Checks pass']],
      e: [['a1', 'brief', 'plan'], ['a2', 'plan', 'build'], ['a3', 'plan', 'test'], ['a4', 'plan', 'rev'], ['a5', 'build', 'ver'], ['a6', 'test', 'ver'], ['a7', 'rev', 'ver']],
      s: [
        { e: [], n: { brief: 'done' }, out: ['Your brief', [['request', 'A quote tool for our crew. Each quote takes an hour right now.', 'type'], ['from', 'Owner, on the triage call']]] },
        { e: ['a1'], n: { plan: 'done' }, out: ['Architecture', [['screens', [3, '', ''], 'n'], ['tables', [4, '', ''], 'n'], ['acceptance checks', [9, '', ''], 'n'], ['written by', 'Bryce']]] },
        { e: ['a2', 'a3', 'a4'], n: { build: 'done', test: 'done', rev: 'done' }, out: ['Agents', [['files changed', [14, '', ''], 'n'], ['tests', [48, '', ' passing'], 'n'], ['review', '2 comments, resolved', 'ok']]] },
        { e: ['a5', 'a6', 'a7'], n: { ver: 'done' }, out: ['Verified', [['acceptance', '9 of 9 pass on your data', 'ok'], ['status', 'Ready for your demo', 'ok']]] }
      ]
    }
  };

  /* ============================================================ FlowCard */
  var SUB_DY = 142;  /* AI capability nodes sit below the row-labels band */
  var STATE_LABEL = { idle: 'Ready', run: 'Running', wait: 'Waiting', done: 'Done', flag: 'Done' };

  function FlowCard(root, flowId, group) {
    this.root = root;
    this.group = group || null;
    this.ns = {};
    this.es = {};
    this.run = null;
    this.seen = false;
    this.build();
    this.load(flowId);
    var self = this, lastW = 0;
    if ('ResizeObserver' in window) {
      new ResizeObserver(function () {
        var w = self.stage.clientWidth;
        if (Math.abs(w - lastW) > 2) { lastW = w; self.render(); }
      }).observe(this.stage);
    }
  }

  FlowCard.prototype.build = function () {
    var r = this.root;
    r.classList.add('fx');
    r.innerHTML =
      '<span class="fx-corner fx-corner--tl"></span><span class="fx-corner fx-corner--tr"></span>' +
      '<span class="fx-corner fx-corner--bl"></span><span class="fx-corner fx-corner--br"></span>' +
      '<div class="fx-head"><span class="fx-title">System // <b></b></span>' +
      '<span class="fx-meta"><span class="fx-tag"></span><span class="fx-status" data-state="idle"><i></i><span></span></span><time class="fx-time">00:00</time></span></div>' +
      '<div class="fx-stage" aria-hidden="true"></div>' +
      '<div class="fx-out" aria-hidden="true"><div class="fx-out-head"><span>Output</span><b></b><em></em></div><dl class="fx-rows"></dl></div>';
    this.titleEl = r.querySelector('.fx-title b');
    this.tagEl = r.querySelector('.fx-tag');
    this.statusEl = r.querySelector('.fx-status');
    this.timeEl = r.querySelector('.fx-time');
    this.stage = r.querySelector('.fx-stage');
    this.outName = r.querySelector('.fx-out-head b');
    this.outItems = r.querySelector('.fx-out-head em');
    this.rowsEl = r.querySelector('.fx-rows');
  };

  FlowCard.prototype.load = function (flowId) {
    this.cancel();
    this.id = flowId;
    this.def = FLOWS[flowId];
    this.titleEl.textContent = this.def.title;
    this.tagEl.textContent = this.def.tag;
    this.tagEl.classList.toggle('is-real', this.def.tag === 'Real build');
    this.ns = {}; this.es = {};
    this.render();
    this.reset();
  };

  /* Layout: n8n canvas (left to right) when wide; a vertical pipeline with
     labels beside each node when narrow. Pure geometry from col/row. */
  /* Pure geometry: n8n canvas (left to right) when wide, a vertical pipeline
     with labels beside each node when narrow. */
  function layoutFlow(d, W) {
    var pos = {}, H = 0, horiz = W >= 440, cols = 0;
    d.n.forEach(function (n) { cols = Math.max(cols, n[1] + 1); });
    if (horiz) {
      var pad = 68, dx = Math.min(176, (W - 2 * pad) / Math.max(1, cols - 1));
      var x0 = (W - dx * (cols - 1)) / 2, dy = 108, top = 40, maxY = 0;
      d.n.forEach(function (n) {
        var w = n[6] && n[6].w ? 104 : 56;
        var p = pos[n[0]] = { x: x0 + n[1] * dx, y: top + 28 + n[2] * dy, w: w, h: 56 };
        maxY = Math.max(maxY, n[6] && n[6].subs ? p.y + SUB_DY + 40 : p.y + 28 + 40);
      });
      H = maxY + 24;
    } else {
      var order = d.n.slice().sort(function (a, b) { return a[1] - b[1] || a[2] - b[2]; });
      order.forEach(function (n, i) { pos[n[0]] = { x: 46, y: 34 + i * 66, w: 44, h: 44, i: i }; });
      H = 34 + order.length * 66 - 4;
    }
    return { pos: pos, H: H, horiz: horiz };
  }

  FlowCard.prototype.render = function () {
    var d = this.def, st = this.stage, self = this;
    var W = st.clientWidth || 560;
    var L = layoutFlow(d, W), pos = L.pos, horiz = L.horiz, H = L.H;
    /* Cards that switch between flows share one height (tallest flow) so the
       page never shifts; shorter flows sit vertically centred. */
    if (this.group) {
      var maxH = 0;
      this.group.forEach(function (id) { maxH = Math.max(maxH, layoutFlow(FLOWS[id], W).H); });
      if (maxH > H) {
        var shift = (maxH - H) / 2;
        Object.keys(pos).forEach(function (k) { pos[k].y += shift; });
        H = maxH;
      }
    }
    st.innerHTML = '';
    st.classList.toggle('is-vertical', !horiz);
    var svg = el('svg', 'fx-edges', st, true);
    st.style.height = Math.round(H) + 'px';
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('width', W);
    svg.setAttribute('height', H);

    this.edges = {};
    var outDeg = {}, inDeg = {};
    d.e.forEach(function (e) { outDeg[e[1]] = (outDeg[e[1]] || 0) + 1; inDeg[e[2]] = (inDeg[e[2]] || 0) + 1; });
    /* Item-count label position: away from whichever end is shared, so
       fan-outs and fan-ins don't stack their labels at the junction. */
    var bez = function (t, a, b, c, d2) { var u = 1 - t; return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d2; };
    d.e.forEach(function (e) {
      var a = pos[e[1]], b = pos[e[2]], dpath, arrow, mid;
      if (horiz) {
        var x1 = a.x + a.w / 2 + 4, y1 = a.y, x2 = b.x - b.w / 2 - 4, y2 = b.y, k = Math.max(28, (x2 - x1) / 2);
        dpath = 'M' + x1 + ' ' + y1 + ' C' + (x1 + k) + ' ' + y1 + ' ' + (x2 - k) + ' ' + y2 + ' ' + x2 + ' ' + y2;
        arrow = 'M' + (x2 - 7) + ' ' + (y2 - 4) + ' L' + (x2 - 1) + ' ' + y2 + ' L' + (x2 - 7) + ' ' + (y2 + 4);
        var tt = outDeg[e[1]] > 1 && inDeg[e[2]] < 2 ? 0.74 : inDeg[e[2]] > 1 && outDeg[e[1]] < 2 ? 0.3 : 0.5;
        mid = { x: bez(tt, x1, x1 + k, x2 - k, x2), y: bez(tt, y1, y1, y2, y2) - 8 };
      } else if (b.i - a.i === 1) {
        dpath = 'M' + a.x + ' ' + (a.y + 26) + ' L' + b.x + ' ' + (b.y - 26);
        arrow = 'M' + (b.x - 4) + ' ' + (b.y - 32) + ' L' + b.x + ' ' + (b.y - 27) + ' L' + (b.x + 4) + ' ' + (b.y - 32);
      } else {
        var lx = a.x - 26, bend = 14 + 3 * (b.i - a.i);
        dpath = 'M' + lx + ' ' + a.y + ' C' + (lx - bend) + ' ' + a.y + ' ' + (lx - bend) + ' ' + b.y + ' ' + lx + ' ' + b.y;
        arrow = 'M' + (lx - 6) + ' ' + (b.y - 4) + ' L' + (lx - 1) + ' ' + b.y + ' L' + (lx - 6) + ' ' + (b.y + 4);
      }
      var g = el('g', 'fx-edge', svg, true);
      var p = el('path', 'fx-edge-line', g, true); p.setAttribute('d', dpath);
      var ar = el('path', 'fx-edge-arrow', g, true); ar.setAttribute('d', arrow);
      if (mid) { var t = el('text', 'fx-edge-count', g, true); t.setAttribute('x', mid.x); t.setAttribute('y', mid.y); t.setAttribute('text-anchor', 'middle'); t.textContent = '1 item'; }
      self.edges[e[0]] = { g: g, path: p };
    });

    this.nodes = {};
    d.n.forEach(function (n) {
      var p = pos[n[0]], o = n[6] || {};
      var node = el('div', 'fx-node' + (o.t ? ' fx-node--trigger' : '') + (o.w && horiz ? ' fx-node--wide' : ''), st);
      node.style.left = (p.x - p.w / 2) + 'px';
      node.style.top = (p.y - p.h / 2) + 'px';
      node.style.width = p.w + 'px';
      var subTxt = !horiz && o.subs ? ' · ' + o.subs.map(function (s) { return s[1]; }).join(', ') : '';
      node.innerHTML = '<div class="fx-box">' + icon(n[3], horiz ? 22 : 20) + (o.w && horiz ? '<span class="fx-ai">' + (n[3] === 'bot' ? 'AI' : '') + '</span>' : '') +
        '<span class="fx-port fx-port--in"></span><span class="fx-port fx-port--out"></span><span class="fx-badge"></span></div>' +
        '<div class="fx-label"><strong>' + n[4] + '</strong><span>' + n[5] + subTxt + '</span></div>';
      if (horiz && o.subs) {
        var nS = o.subs.length;
        o.subs.forEach(function (s, i) {
          var px = p.x + (i - (nS - 1) / 2) * 22, sx = p.x + (i - (nS - 1) / 2) * 64, sy = p.y + SUB_DY;
          var line = el('path', 'fx-sub-line', svg, true);
          line.setAttribute('d', 'M' + px + ' ' + (p.y + 32) + ' C' + px + ' ' + (p.y + 80) + ' ' + sx + ' ' + (sy - 60) + ' ' + sx + ' ' + (sy - 20));
          var sub = el('div', 'fx-sub', st);
          sub.style.left = (sx - 31) + 'px';
          sub.style.top = (sy - 18) + 'px';
          sub.innerHTML = '<div class="fx-sub-dot">' + icon(s[0], 15) + '</div><span>' + s[1] + '</span>';
          var diamond = el('i', 'fx-diamond', st);
          diamond.style.left = (px - 4) + 'px';
          diamond.style.top = (p.y + 28 - 4) + 'px';
        });
      }
      self.nodes[n[0]] = node;
    });
    this.applyStates();
  };

  FlowCard.prototype.setNode = function (id, s) { this.ns[id] = s; this.paintNode(id); };
  FlowCard.prototype.setEdge = function (id, s) { this.es[id] = s; this.paintEdge(id); };
  FlowCard.prototype.paintNode = function (id) {
    var n = this.nodes[id], s = this.ns[id] || 'idle';
    if (!n) { return; }
    n.setAttribute('data-state', s);
    var b = n.querySelector('.fx-badge');
    b.innerHTML = s === 'done' ? icon('check', 11) : s === 'flag' ? icon('alert', 12) : s === 'wait' ? icon('clock', 11) : '';
  };
  FlowCard.prototype.paintEdge = function (id) {
    var e = this.edges[id];
    if (e) { e.g.setAttribute('data-state', this.es[id] || 'idle'); }
  };
  FlowCard.prototype.applyStates = function () {
    var k;
    for (k in this.nodes) { this.paintNode(k); }
    for (k in this.edges) { this.paintEdge(k); }
  };

  FlowCard.prototype.status = function (s) {
    this.statusEl.setAttribute('data-state', s);
    this.statusEl.lastChild.textContent = STATE_LABEL[s] || s;
  };
  FlowCard.prototype.clock = function (on) {
    var self = this;
    clearInterval(this.tick);
    if (!on) { return; }
    var t0 = Date.now();
    this.timeEl.textContent = '00:00';
    this.tick = setInterval(function () {
      var s = Math.floor((Date.now() - t0) / 1000);
      self.timeEl.textContent = (s < 600 ? '0' : '') + Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60);
    }, 1000);
  };

  FlowCard.prototype.cancel = function () {
    if (this.run) { this.run.cancel(); }
    this.run = null;
    this.clock(false);
  };

  FlowCard.prototype.reset = function () {
    this.ns = {}; this.es = {};
    this.applyStates();
    this.status('idle');
    this.timeEl.textContent = '00:00';
    this.outName.textContent = '';
    this.outItems.textContent = '';
    this.rowsEl.innerHTML = '<div class="fx-empty">Waiting for the first item</div>';
  };

  /* Entry choreography the first time the card is seen: nodes arrive in
     flow order with a light stagger, each edge draws just after its source. */
  FlowCard.prototype.enter = function () {
    if (this.seen || Motion.reduced) { this.seen = true; return; }
    this.seen = true;
    var d = this.def, self = this, order = {};
    d.n.forEach(function (n) { order[n[0]] = n[1] * 2 + n[2] * 0.6; });
    d.n.forEach(function (n) { Motion.reveal(self.nodes[n[0]], order[n[0]] * 70); });
    Array.prototype.forEach.call(this.stage.querySelectorAll('.fx-sub, .fx-diamond'), function (s) { Motion.reveal(s, 420); });
    d.e.forEach(function (e) { Motion.draw(self.edges[e[0]].path, 360, order[e[1]] * 70 + 140); });
  };

  function fmtCount(spec) {
    var dec = spec[0] % 1 !== 0;
    return function (v) {
      return spec[1] + v.toLocaleString('en-US', { minimumFractionDigits: dec ? 2 : 0, maximumFractionDigits: dec ? 2 : 0 }) + spec[2];
    };
  }

  FlowCard.prototype.showRows = function (name, rows, run, instant) {
    var self = this;
    this.outName.textContent = name;
    this.outItems.textContent = '1 item';
    this.rowsEl.innerHTML = '';
    var jobs = [];
    rows.forEach(function (r, i) {
      var dt = el('dt', '', self.rowsEl); dt.textContent = r[0];
      var dd = el('dd', '', self.rowsEl);
      var kind = r[2];
      if (kind === 'ok' || kind === 'warn' || kind === 'bad') {
        var pill = el('span', 'fx-pill fx-pill--' + kind, dd); pill.textContent = r[1];
      } else if (kind === 'n') {
        dd.className = 'fx-num';
        dd.textContent = fmtCount(r[1])(instant ? r[1][0] : 0);
        if (!instant) { jobs.push(function () { return Motion.count(dd, r[1][0], fmtCount(r[1]), run); }); }
      } else if (kind === 'type') {
        if (instant) { dd.textContent = r[1]; } else { jobs.push(function () { return Motion.type(dd, r[1], run); }); }
      } else { dd.textContent = r[1]; }
      if (!instant) { Motion.reveal(dt, i * 50); Motion.reveal(dd, i * 50); }
    });
    if (instant || !jobs.length) { return Promise.resolve(); }
    return jobs.reduce(function (p, j) { return p.then(function () { return run && !run.alive ? null : j(); }); }, Motion.wait(160, run));
  };

  /* Apply step i to the canvas. instant: jump straight to its end state. */
  FlowCard.prototype.step = function (i, run, instant) {
    var self = this, s = this.def.s[i];
    var finish = function () {
      s.e.forEach(function (e) { self.setEdge(e, 'done'); });
      Object.keys(s.n).forEach(function (k) { self.setNode(k, s.n[k]); });
    };
    if (instant) {
      finish();
      this.showRows(s.out[0], s.after || s.out[1], null, true);
      return Promise.resolve(true);
    }
    s.e.forEach(function (e) { self.setEdge(e, 'flow'); });
    Object.keys(s.n).forEach(function (k) { self.setNode(k, 'run'); });
    this.status('run');
    var travel = s.e.length ? 1100 : 500;
    return Motion.wait(travel, run).then(function (alive) {
      if (!alive) { return false; }
      s.e.forEach(function (e) { self.setEdge(e, 'done'); });
      return self.showRows(s.out[0], s.out[1], run, false);
    }).then(function (alive) {
      if (alive === false || (run && !run.alive)) { return false; }
      if (s.wait) {
        self.setNode(s.wait, 'wait');
        self.status('wait');
        return Motion.wait(1600, run).then(function (ok) {
          if (!ok) { return false; }
          finish();
          self.status('run');
          return self.showRows(s.out[0], s.after, run, false).then(function () { return run.alive; });
        });
      }
      finish();
      return run ? run.alive : true;
    });
  };

  /* Jump to the end state of step i (and everything before it). */
  FlowCard.prototype.jump = function (i) {
    this.cancel();
    this.ns = {}; this.es = {};
    for (var k = 0; k <= i; k++) { this.step(k, null, true); }
    this.status(i >= this.def.s.length - 1 ? 'done' : 'run');
    if (i < 0) { this.reset(); }
  };

  /* Play steps from..to with pacing. Returns a promise of completion. */
  FlowCard.prototype.play = function (from, to, gap, onStep) {
    this.cancel();
    var run = this.run = new Motion.Run(), self = this;
    if (from === 0) { this.ns = {}; this.es = {}; this.applyStates(); }
    this.clock(true);
    var chain = Promise.resolve(true);
    for (var i = from; i <= to; i++) {
      (function (k) {
        chain = chain.then(function (alive) {
          if (!alive || !run.alive) { return false; }
          if (onStep) { onStep(k); }
          return self.step(k, run, false).then(function (ok) { return ok && k < to ? Motion.wait(gap, run) : ok; });
        });
      })(i);
    }
    return chain.then(function (ok) {
      if (ok && run.alive && to >= self.def.s.length - 1) { self.status('done'); self.clock(false); }
      return ok && run.alive;
    });
  };

  /* ========================================================= Hero card
     Cycles three workflows; the switch picks one. Plays only on screen. */
  function initHero(root) {
    var ids = root.getAttribute('data-flow-hero').split(',');
    var holder = root.querySelector('[data-flow-card]');
    var btns = Array.prototype.slice.call(root.querySelectorAll('[data-flow-pick]'));
    var card = new FlowCard(holder, ids[0], ids);
    var idx = 0, visible = false, loopRun = null;
    function mark() { btns.forEach(function (b, i) { b.setAttribute('aria-pressed', i === idx ? 'true' : 'false'); }); }
    function show(i, animateSwap) {
      idx = i; mark();
      if (animateSwap && !Motion.reduced) {
        return Motion.fade(card.stage, 0, 140).then(function () {
          card.load(ids[i]); card.seen = false; card.stage.style.opacity = 1; card.enter();
        });
      }
      card.load(ids[i]);
      return Promise.resolve();
    }
    function loop() {
      if (loopRun) { loopRun.cancel(); }
      var me = loopRun = new Motion.Run();
      if (Motion.reduced) { card.jump(card.def.s.length - 1); return; }
      card.play(0, card.def.s.length - 1, 900).then(function (done) {
        if (!done || !me.alive) { return; }
        return Motion.wait(3200, me).then(function (ok) {
          if (!ok || !visible) { return; }
          return show((idx + 1) % ids.length, true).then(function () { return Motion.wait(500, me); }).then(function (ok2) { if (ok2 && visible) { loop(); } });
        });
      });
    }
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () {
        if (loopRun) { loopRun.cancel(); }
        show(i, true).then(function () { if (visible || Motion.reduced) { loop(); } });
      });
    });
    mark();
    if (Motion.reduced) { card.jump(card.def.s.length - 1); }
    Motion.onVisible(root, function (v) {
      var was = visible;
      visible = v;
      if (v && !was) { card.enter(); loop(); }
      if (!v && was) { if (loopRun) { loopRun.cancel(); } card.cancel(); card.load(ids[idx]); card.seen = true; }
    });
  }

  /* ======================================================= Step player
     A flow card plus the step list and controls in the demo panels. */
  function Player(panel, flowId, opts) {
    var self = this;
    this.card = new FlowCard(panel.querySelector('[data-flow-card]'), flowId, opts && opts.group);
    this.steps = Array.prototype.slice.call(panel.querySelectorAll('.demo-step'));
    this.bar = panel.querySelector('.demo-progress i');
    this.playBtn = panel.querySelector('[data-ctrl="play"]');
    this.index = -1;
    this.playing = !Motion.reduced;
    this.visible = false;
    this.active = !opts || opts.active !== false;
    this.auto = opts && opts.auto;
    this.loopRun = null;
    this.steps.forEach(function (b, i) { b.addEventListener('click', function () { self.setPlaying(false); self.goto(i); }); });
    var prev = panel.querySelector('[data-ctrl="prev"]'), next = panel.querySelector('[data-ctrl="next"]');
    if (prev) { prev.addEventListener('click', function () { self.setPlaying(false); self.goto(Math.max(0, self.index - 1)); }); }
    if (next) { next.addEventListener('click', function () { self.setPlaying(false); self.goto(Math.min(self.card.def.s.length - 1, self.index + 1)); }); }
    if (this.playBtn) {
      if (Motion.reduced) {
        this.playBtn.disabled = true;
        this.playBtn.setAttribute('aria-pressed', 'false');
        this.playBtn.setAttribute('aria-label', 'Autoplay is off because reduced motion is on');
      } else {
        this.playBtn.addEventListener('click', function () { self.setPlaying(!self.playing); });
      }
    }
    if (Motion.reduced) { this.mark(this.card.def.s.length - 1); this.card.jump(this.card.def.s.length - 1); }
  }
  Player.prototype.mark = function (i) {
    this.index = i;
    var n = this.card.def.s.length;
    this.steps.forEach(function (b, k) {
      if (k === i) { b.setAttribute('aria-current', 'step'); } else { b.removeAttribute('aria-current'); }
      b.classList.toggle('is-done', k < i);
    });
    if (this.bar) { this.bar.style.width = (i < 0 ? 0 : (i + 1) / n * 100) + '%'; }
  };
  Player.prototype.stop = function () { if (this.loopRun) { this.loopRun.cancel(); } this.card.cancel(); };
  /* Manual navigation: settle everything before i, then animate step i. */
  Player.prototype.goto = function (i) {
    this.stop();
    var self = this;
    this.card.jump(i - 1);
    this.mark(i);
    if (Motion.reduced) { this.card.jump(i); return; }
    this.card.play(i, i, 0).then(function (ok) { if (ok && self.playing) { self.cycle(i + 1); } });
  };
  Player.prototype.cycle = function (from) {
    var self = this, n = this.card.def.s.length;
    if (!this.playing || !this.visible || !this.active || Motion.reduced) { return; }
    var me = this.loopRun = new Motion.Run();
    if (from >= n) {
      Motion.wait(3200, me).then(function (ok) { if (ok) { self.card.reset(); self.mark(-1); Motion.wait(600, me).then(function (ok2) { if (ok2) { self.cycle(0); } }); } });
      return;
    }
    this.card.play(from, n - 1, 1500, function (k) { self.mark(k); }).then(function (done) { if (done && me.alive) { self.cycle(n); } });
  };
  Player.prototype.setPlaying = function (p) {
    this.playing = p && !Motion.reduced;
    if (this.playBtn && !Motion.reduced) {
      this.playBtn.setAttribute('aria-pressed', this.playing ? 'true' : 'false');
      this.playBtn.setAttribute('aria-label', this.playing ? 'Pause walkthrough' : 'Play walkthrough');
    }
    if (this.playing) { this.cycle(this.index >= this.card.def.s.length - 1 || this.index < 0 ? (this.index < 0 ? 0 : this.card.def.s.length) : this.index + 1); }
    else { this.stop(); }
  };
  Player.prototype.setVisible = function (v) {
    var was = this.visible;
    this.visible = v;
    if (v && !was) { this.card.enter(); if (this.active && this.playing) { this.restart(); } }
    if (!v && was) { this.stop(); }
  };
  Player.prototype.restart = function () {
    this.stop();
    if (Motion.reduced) { return; }
    this.card.reset();
    this.mark(-1);
    this.cycle(0);
  };
  Player.prototype.setActive = function (a) {
    this.active = a;
    if (!a) { this.stop(); return; }
    this.card.render();
    if (Motion.reduced) { this.mark(this.card.def.s.length - 1); this.card.jump(this.card.def.s.length - 1); return; }
    this.card.seen = false;
    this.card.enter();
    if (this.playing && this.visible) { this.restart(); }
  };

  function initDemo(root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('.demo-panel'));
    var players = {};
    var group = panels.map(function (p) { return p.getAttribute('data-flow'); });
    panels.forEach(function (p) { players[p.id] = new Player(p, p.getAttribute('data-flow'), { active: !p.hidden, group: group }); });
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        panel.hidden = !on;
        players[panel.id].setActive(on);
      });
      if (focus) { tab.focus(); }
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') { n = tabs[(i + 1) % tabs.length]; }
        if (e.key === 'ArrowLeft') { n = tabs[(i - 1 + tabs.length) % tabs.length]; }
        if (e.key === 'Home') { n = tabs[0]; }
        if (e.key === 'End') { n = tabs[tabs.length - 1]; }
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
    Motion.onVisible(root, function (v) { panels.forEach(function (p) { players[p.id].setVisible(v); }); }, 0.2);
  }

  function initAuto(root) {
    var p = new Player(root, root.getAttribute('data-flow-auto'), { auto: true });
    Motion.onVisible(root, function (v) { p.setVisible(v); });
  }

  /* ========================================================== Calculator */
  function initCalc(root) {
    var f = { hours: root.querySelector('[name="hours"]'), people: root.querySelector('[name="people"]'), rate: root.querySelector('[name="rate"]') };
    var out = {
      hours: root.querySelector('[data-out="hours"]'), people: root.querySelector('[data-out="people"]'),
      rate: root.querySelector('[data-out="rate"]'), cost: root.querySelector('[data-out="cost"]'),
      total: root.querySelector('[data-out="total-hours"]')
    };
    var money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    var num = new Intl.NumberFormat('en-US');
    function fill(input) { input.style.setProperty('--fill', ((input.value - input.min) / (input.max - input.min) * 100) + '%'); }
    function update() {
      var h = +f.hours.value, p = +f.people.value, r = +f.rate.value, yearly = h * p * 48;
      out.hours.textContent = h + (h === 1 ? ' hour' : ' hours');
      out.people.textContent = p + (p === 1 ? ' person' : ' people');
      out.rate.textContent = money.format(r) + '/hr';
      out.total.textContent = num.format(yearly);
      out.cost.textContent = money.format(yearly * r);
      [f.hours, f.people, f.rate].forEach(fill);
    }
    [f.hours, f.people, f.rate].forEach(function (i) { i.addEventListener('input', update); });
    update();
  }

  /* ========================================================= Page chrome */
  function initChrome() {
    var header = document.querySelector('.site-header');
    var btn = document.querySelector('.menu-btn');
    var nav = document.getElementById('mobile-nav');
    if (header) {
      var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
    if (btn && nav) {
      var set = function (open) {
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        nav.classList.toggle('is-open', open);
      };
      btn.addEventListener('click', function () { set(btn.getAttribute('aria-expanded') !== 'true'); });
      nav.addEventListener('click', function (e) { if (e.target.closest('a')) { set(false); } });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); } });
    }
    var reveals = document.querySelectorAll('.reveal');
    if (Motion.reduced || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(reveals, function (r) { r.classList.add('is-in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      Array.prototype.forEach.call(reveals, function (r) { io.observe(r); });
    }
    Array.prototype.forEach.call(document.querySelectorAll('[data-stagger]'), function (group) {
      Array.prototype.forEach.call(group.children, function (c, i) { c.style.setProperty('--mi-delay', (i * 0.06).toFixed(2) + 's'); });
    });
  }

  function boot() {
    initChrome();
    Array.prototype.forEach.call(document.querySelectorAll('[data-flow-hero]'), initHero);
    Array.prototype.forEach.call(document.querySelectorAll('[data-demo]'), initDemo);
    Array.prototype.forEach.call(document.querySelectorAll('[data-flow-auto]'), initAuto);
    Array.prototype.forEach.call(document.querySelectorAll('[data-calc]'), initCalc);
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', boot); } else { boot(); }
})();
