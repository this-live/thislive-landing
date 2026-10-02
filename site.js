/* this.live consulting site: navigation, scroll reveal, the diagram engine
   (hero systems map, demo player, agent-team diagram) and the cost calculator.
   Dependency-free, CSP-safe ('self' only). Motion runs only while a diagram is
   on screen, and never for prefers-reduced-motion: those users get a complete
   static frame and manual step controls. */
(function () {
  'use strict';

  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SVGNS = 'http://www.w3.org/2000/svg';

  /* Lucide icon bodies (24x24, stroke). Same names as the HTML generator. */
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
    'layout-dashboard': '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
    cpu: '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
    code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    flask: '<path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5c-1.4 0-2.5-1.1-2.5-2.5V2"/><path d="M8.5 2h7"/><path d="M14.5 16h-5"/>',
    eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
    'check-circle': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>'
  };

  /* ---------------------------------------------------------------- scenes */
  var SCENES = {
    hero: {
      viewBox: '0 0 600 420',
      hub: { id: 'hub', x: 300, y: 210, label: 'Your system', sub: 'THIS.LIVE BUILD' },
      nodes: [
        { id: 'web', x: 300, y: 50, label: 'Website', icon: 'globe', caption: 'Website: inquiries and bookings captured, nothing lost.' },
        { id: 'inbox', x: 476, y: 122, label: 'Inbox', icon: 'mail', caption: 'Inbox: replies drafted, sorted and logged for you.' },
        { id: 'crm', x: 476, y: 298, label: 'CRM', icon: 'users', caption: 'CRM: every contact saved with the full history.' },
        { id: 'books', x: 300, y: 370, label: 'Accounting', icon: 'receipt', caption: 'Accounting: invoices and receipts entered and matched.' },
        { id: 'sheets', x: 124, y: 298, label: 'Spreadsheets', icon: 'table', caption: 'Spreadsheets: totals and reports that update themselves.' },
        { id: 'cal', x: 124, y: 122, label: 'Calendar', icon: 'calendar', caption: 'Calendar: follow-ups and appointments booked on time.' }
      ],
      events: [
        ['web', 'in', 'Website', 'New inquiry captured'],
        ['inbox', 'out', 'Inbox', 'Reply drafted, waiting for approval'],
        ['crm', 'out', 'CRM', 'Contact saved with notes'],
        ['cal', 'out', 'Calendar', 'Follow-up booked for Tue 9:00'],
        ['books', 'in', 'Accounting', 'Invoice matched to job #1042'],
        ['sheets', 'out', 'Sheets', 'Weekly totals updated'],
        ['inbox', 'in', 'Inbox', 'Supplier PDF read, 12 line items'],
        ['books', 'out', 'Accounting', 'Entry posted, receipt attached']
      ]
    },
    lead: {
      viewBox: '0 0 600 360',
      nodes: [
        { id: 'form', x: 92, y: 92, label: 'Website form', icon: 'globe' },
        { id: 'inbox', x: 92, y: 268, label: 'Email inbox', icon: 'mail' },
        { id: 'agent', x: 298, y: 180, label: 'AI assistant', icon: 'bot', ai: true },
        { id: 'you', x: 504, y: 70, label: 'You approve', icon: 'user-check' },
        { id: 'crm', x: 504, y: 180, label: 'CRM', icon: 'users' },
        { id: 'follow', x: 504, y: 290, label: 'Follow-up', icon: 'calendar' }
      ],
      edges: [['e1', 'form', 'agent'], ['e2', 'inbox', 'agent'], ['e3', 'agent', 'you'], ['e4', 'you', 'crm'], ['e5', 'crm', 'follow']],
      steps: [
        { nodes: ['form'], edges: ['e1'], log: [['21:14', 'New inquiry: kitchen remodel, Coventry']] },
        { nodes: ['agent'], edges: [], log: [['21:14', 'Draft reply ready: availability + 2 questions']] },
        { nodes: ['you'], edges: ['e3'], log: [['21:31', 'Owner approved from phone']] },
        { nodes: ['crm', 'follow'], edges: ['e4', 'e5'], log: [['21:31', 'Reply sent, contact added to CRM'], ['21:31', 'Follow-up set: Tue 9:00 if no reply']] }
      ]
    },
    paperwork: {
      viewBox: '0 0 600 360',
      nodes: [
        { id: 'docs', x: 100, y: 180, label: 'Invoices & forms', icon: 'file-text' },
        { id: 'extract', x: 290, y: 96, label: 'AI extraction', icon: 'bot', ai: true },
        { id: 'rules', x: 290, y: 264, label: 'Rules check', icon: 'shield-check' },
        { id: 'books', x: 500, y: 96, label: 'Your books', icon: 'receipt' },
        { id: 'flag', x: 500, y: 264, label: 'Needs review', icon: 'flag' }
      ],
      edges: [['d1', 'docs', 'extract'], ['d2', 'extract', 'rules'], ['d3', 'rules', 'books'], ['d4', 'rules', 'flag']],
      steps: [
        { nodes: ['docs'], edges: ['d1'], log: [['08:02', '3 invoices received by email']] },
        { nodes: ['extract'], edges: [], log: [['08:02', 'INV-2291, Tri-County Supply, $1,284.50']] },
        { nodes: ['rules'], edges: ['d2'], log: [['08:03', 'Vendor on file, totals re-added: match']] },
        { nodes: ['books', 'flag'], edges: ['d3', 'd4'], log: [['08:03', '2 entered in the books'], ['08:03', '1 flagged: total does not match lines']] }
      ]
    },
    report: {
      viewBox: '0 0 600 360',
      nodes: [
        { id: 'sales', x: 96, y: 70, label: 'Sales / CRM', icon: 'users' },
        { id: 'jobs', x: 96, y: 180, label: 'Jobs sheet', icon: 'table' },
        { id: 'books', x: 96, y: 290, label: 'Accounting', icon: 'receipt' },
        { id: 'builder', x: 300, y: 180, label: 'Report builder', icon: 'bot', ai: true },
        { id: 'inbox', x: 506, y: 180, label: 'Your inbox', icon: 'mail' }
      ],
      edges: [['r1', 'sales', 'builder'], ['r2', 'jobs', 'builder'], ['r3', 'books', 'builder'], ['r4', 'builder', 'inbox']],
      steps: [
        { nodes: ['sales', 'jobs', 'books'], edges: ['r1', 'r2', 'r3'], log: [['06:00', 'Pulled last week from 3 systems']] },
        { nodes: ['builder'], edges: [], log: [['06:01', 'Revenue, jobs closed, open invoices']] },
        { nodes: ['builder'], edges: [], log: [['06:01', 'Noted: 4 invoices past 30 days']] },
        { nodes: ['inbox'], edges: ['r4'], log: [['06:02', 'Sent to owner and office manager']] }
      ]
    },
    sheet: {
      viewBox: '0 0 600 360',
      nodes: [
        { id: 'sheet', x: 110, y: 180, label: 'Master spreadsheet', icon: 'table' },
        { id: 'db', x: 310, y: 180, label: 'Database', icon: 'database' },
        { id: 'app', x: 500, y: 90, label: 'Team app', icon: 'smartphone' },
        { id: 'dash', x: 500, y: 270, label: 'Dashboard', icon: 'layout-dashboard' }
      ],
      edges: [['s1', 'sheet', 'db'], ['s2', 'db', 'app'], ['s3', 'db', 'dash']],
      steps: [
        { nodes: ['sheet'], edges: [], log: [['day 1', 'Mapped 14 columns and 6 unwritten rules']] },
        { nodes: ['db'], edges: ['s1'], log: [['day 4', 'Rule enforced: no duplicate job numbers']] },
        { nodes: ['app'], edges: ['s2'], log: [['day 9', 'Field crew checks in from their phones']] },
        { nodes: ['dash'], edges: ['s3'], log: [['day 12', 'Dashboard: open jobs by stage, live']] }
      ]
    },
    practice: {
      viewBox: '0 0 600 360',
      nodes: [
        { id: 'season', x: 104, y: 180, label: 'Season & groups', icon: 'calendar' },
        { id: 'engine', x: 300, y: 180, label: 'Practice engine', icon: 'cpu', ai: true },
        { id: 'check', x: 500, y: 90, label: 'Rule checker', icon: 'shield-check' },
        { id: 'sheets', x: 500, y: 270, label: 'Practice sheets', icon: 'file-text' }
      ],
      edges: [['p1', 'season', 'engine'], ['p2', 'engine', 'check'], ['p3', 'check', 'sheets']],
      steps: [
        { nodes: ['season'], edges: ['p1'], log: [['setup', 'Groups, meet dates and club rules loaded']] },
        { nodes: ['engine'], edges: [], log: [['run', 'Season drafted, practice by practice']] },
        { nodes: ['check'], edges: ['p2'], log: [['check', 'Every practice inside its group limits']] },
        { nodes: ['sheets'], edges: ['p3'], log: [['ready', 'Coach sheets and lane cards printed']] }
      ]
    },
    agents: {
      viewBox: '0 0 640 360',
      nodes: [
        { id: 'you', x: 66, y: 180, label: 'You', icon: 'user' },
        { id: 'bryce', x: 212, y: 180, label: 'Bryce, architect', icon: 'compass', ai: true },
        { id: 'build', x: 404, y: 72, label: 'Build agents', icon: 'code' },
        { id: 'test', x: 404, y: 180, label: 'Test agents', icon: 'flask' },
        { id: 'review', x: 404, y: 288, label: 'Review agents', icon: 'eye' },
        { id: 'ship', x: 574, y: 180, label: 'Verified', icon: 'check-circle' }
      ],
      edges: [['a1', 'you', 'bryce'], ['a2', 'bryce', 'build'], ['a3', 'bryce', 'test'], ['a4', 'bryce', 'review'], ['a5', 'build', 'ship'], ['a6', 'test', 'ship'], ['a7', 'review', 'ship']],
      steps: [
        { nodes: ['you', 'bryce'], edges: ['a1'], log: [['brief', 'Problem described in plain language']] },
        { nodes: ['bryce'], edges: [], log: [['plan', 'Architecture and acceptance checks written down']] },
        { nodes: ['build', 'test', 'review'], edges: ['a2', 'a3', 'a4'], log: [['build', 'Agents build, test and review in parallel']] },
        { nodes: ['ship'], edges: ['a5', 'a6', 'a7'], log: [['ship', 'Only work that passes the checks reaches you']] }
      ]
    }
  };

  /* Compact (phone) layouts: same nodes and edges, stacked vertically so labels
     stay readable at ~0.85x instead of ~0.55x. */
  var COMPACT = {
    hero: { viewBox: '0 0 380 480', pos: { hub: [190, 240], web: [190, 40], inbox: [302, 125], crm: [302, 355], books: [190, 440], sheets: [78, 355], cal: [78, 125] } },
    lead: { viewBox: '0 0 380 480', pos: { form: [100, 48], inbox: [280, 48], agent: [190, 165], you: [190, 285], crm: [100, 420], follow: [280, 420] } },
    paperwork: { viewBox: '0 0 380 470', pos: { docs: [190, 45], extract: [190, 155], rules: [190, 265], books: [100, 410], flag: [280, 410] } },
    report: { viewBox: '0 0 380 430', pos: { sales: [95, 60], jobs: [95, 180], books: [95, 300], builder: [276, 180], inbox: [276, 370] } },
    sheet: { viewBox: '0 0 380 370', pos: { sheet: [190, 45], db: [190, 170], app: [100, 315], dash: [280, 315] } },
    practice: { viewBox: '0 0 380 440', pos: { season: [190, 45], engine: [190, 160], check: [190, 275], sheets: [190, 395] } },
    agents: { viewBox: '0 0 380 430', pos: { you: [190, 40], bryce: [190, 145], build: [70, 262], test: [190, 262], review: [310, 262], ship: [190, 385] },
      labels: { build: 'Build', test: 'Test', review: 'Review' } }
  };
  var COMPACT_MQ = window.matchMedia ? window.matchMedia('(max-width: 640px)') : null;

  /* --------------------------------------------------------------- helpers */
  function svgEl(tag, attrs, parent) {
    var n = document.createElementNS(SVGNS, tag);
    if (attrs) { for (var k in attrs) { n.setAttribute(k, attrs[k]); } }
    if (parent) { parent.appendChild(n); }
    return n;
  }
  function boxWidth(label) { return Math.round(Math.max(96, label.length * 7.2 + 54)); }
  function edgePath(a, b, straight) {
    if (straight) { return 'M' + a.x + ' ' + a.y + ' L' + b.x + ' ' + b.y; }
    var dx = b.x - a.x, dy = b.y - a.y;
    if (Math.abs(dx) >= Math.abs(dy)) {
      var mx = a.x + dx / 2;
      return 'M' + a.x + ' ' + a.y + ' C' + mx + ' ' + a.y + ' ' + mx + ' ' + b.y + ' ' + b.x + ' ' + b.y;
    }
    var my = a.y + dy / 2;
    return 'M' + a.x + ' ' + a.y + ' C' + a.x + ' ' + my + ' ' + b.x + ' ' + my + ' ' + b.x + ' ' + b.y;
  }
  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  /* Diagram: renders a scene into an <svg>, owns its pulse animation loop, and
     redraws itself in the compact layout when the viewport crosses 640px. */
  function Diagram(svg, scene, sceneId) {
    this.svg = svg;
    this.scene = scene;
    this.sceneId = sceneId;
    this.pulses = [];
    this.raf = 0;
    this.visible = false;
    this.onRender = null;
    var self = this;
    this.render();
    if (COMPACT_MQ && COMPACT[sceneId]) {
      var onChange = function () { self.render(); if (self.onRender) { self.onRender(); } };
      if (COMPACT_MQ.addEventListener) { COMPACT_MQ.addEventListener('change', onChange); } else { COMPACT_MQ.addListener(onChange); }
    }
  }
  Diagram.prototype.render = function () {
    var scene = this.scene, svg = this.svg, self = this;
    var compact = COMPACT_MQ && COMPACT_MQ.matches && COMPACT[this.sceneId];
    this.pulses.forEach(function (p) { p.el.remove(); });
    this.pulses = [];
    this.nodes = {};
    this.edges = {};
    while (svg.firstChild) { svg.removeChild(svg.firstChild); }
    svg.setAttribute('viewBox', compact ? compact.viewBox : scene.viewBox);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    var gE = svgEl('g', { 'class': 'dg-edges' }, svg);
    this.gP = svgEl('g', { 'class': 'dg-pulses' }, svg);
    var gN = svgEl('g', { 'class': 'dg-nodes' }, svg);
    var place = function (n) {
      var c = compact && compact.pos[n.id];
      var label = (compact && compact.labels && compact.labels[n.id]) || n.label;
      return { id: n.id, x: c ? c[0] : n.x, y: c ? c[1] : n.y, label: label, icon: n.icon, ai: n.ai, sub: n.sub };
    };
    var pos = {};
    if (scene.hub) { pos[scene.hub.id] = place(scene.hub); }
    scene.nodes.forEach(function (n) { pos[n.id] = place(n); });

    var edges = scene.edges || scene.nodes.map(function (n) { return ['h-' + n.id, scene.hub.id, n.id]; });
    edges.forEach(function (e) {
      var p = svgEl('path', { 'class': 'dg-edge', d: edgePath(pos[e[1]], pos[e[2]], !!scene.hub) }, gE);
      self.edges[e[0]] = p;
    });

    if (scene.hub) {
      var h = pos[scene.hub.id];
      var hg = svgEl('g', { 'class': 'dg-hub' }, gN);
      svgEl('circle', { 'class': 'dg-ring dg-ring--breathe', cx: h.x, cy: h.y, r: 92 }, hg);
      svgEl('circle', { 'class': 'dg-ring', cx: h.x, cy: h.y, r: 72 }, hg);
      svgEl('circle', { 'class': 'dg-core', cx: h.x, cy: h.y, r: 56 }, hg);
      var t1 = svgEl('text', { x: h.x, y: h.y + 2, 'text-anchor': 'middle' }, hg); t1.textContent = h.label;
      var t2 = svgEl('text', { 'class': 'dg-sub', x: h.x, y: h.y + 20, 'text-anchor': 'middle' }, hg); t2.textContent = h.sub;
      this.hub = hg;
    }

    scene.nodes.forEach(function (raw) {
      var n = pos[raw.id];
      var w = boxWidth(n.label), hgt = 44;
      var g = svgEl('g', { 'class': 'dg-node' + (n.ai ? ' dg-node--ai' : ''), 'data-node': n.id }, gN);
      svgEl('rect', { 'class': 'dg-box', x: n.x - w / 2, y: n.y - hgt / 2, width: w, height: hgt, rx: 12 }, g);
      var ig = svgEl('g', { 'class': 'dg-icon', transform: 'translate(' + (n.x - w / 2 + 14) + ' ' + (n.y - 9) + ') scale(0.75)', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
      ig.innerHTML = ICONS[n.icon] || '';
      var tx = svgEl('text', { x: n.x - w / 2 + 42, y: n.y + 4.5 }, g); tx.textContent = n.label;
      self.nodes[n.id] = g;
    });
  };
  Diagram.prototype.setState = function (activeNodes, doneNodes, litEdges, activeEdges) {
    var k;
    for (k in this.nodes) {
      this.nodes[k].classList.toggle('is-active', activeNodes.indexOf(k) > -1);
      this.nodes[k].classList.toggle('is-done', doneNodes.indexOf(k) > -1 && activeNodes.indexOf(k) < 0);
    }
    for (k in this.edges) {
      this.edges[k].classList.toggle('is-lit', litEdges.indexOf(k) > -1);
      this.edges[k].classList.toggle('is-active', activeEdges.indexOf(k) > -1 && litEdges.indexOf(k) < 0);
    }
  };
  Diagram.prototype.pulse = function (edgeId, reverse, dur, done) {
    var path = this.edges[edgeId];
    if (!path || REDUCED) { if (done) { done(); } return; }
    var c = svgEl('circle', { 'class': 'dg-pulse', r: 4, cx: -10, cy: -10 }, this.gP);
    this.pulses.push({ path: path, len: path.getTotalLength(), t0: 0, dur: dur || 1000, rev: !!reverse, el: c, done: done });
    this.loop();
  };
  Diagram.prototype.loop = function () {
    if (this.raf || !this.visible) { return; }
    var self = this;
    var tick = function (now) {
      self.raf = 0;
      if (!self.visible) { return; }
      self.pulses = self.pulses.filter(function (p) {
        if (!p.t0) { p.t0 = now; }
        var t = Math.min(1, (now - p.t0) / p.dur);
        var e = easeInOut(t);
        var pt = p.path.getPointAtLength((p.rev ? 1 - e : e) * p.len);
        p.el.setAttribute('cx', pt.x.toFixed(1));
        p.el.setAttribute('cy', pt.y.toFixed(1));
        p.el.setAttribute('opacity', (t < 0.12 ? t / 0.12 : t > 0.88 ? (1 - t) / 0.12 : 1).toFixed(2));
        if (t >= 1) { p.el.remove(); if (p.done) { p.done(); } return false; }
        return true;
      });
      if (self.pulses.length) { self.raf = requestAnimationFrame(tick); }
    };
    this.raf = requestAnimationFrame(tick);
  };
  Diagram.prototype.setVisible = function (v) {
    this.visible = v;
    if (v && this.pulses.length) { this.loop(); }
  };

  function onVisible(el, cb) {
    if (!('IntersectionObserver' in window)) { cb(true); return; }
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { cb(en.isIntersecting); });
    }, { threshold: 0.25 }).observe(el);
  }

  function logLine(list, time, text, max) {
    var li = document.createElement('li');
    li.className = 'is-new' + (REDUCED ? '' : ' mi-row-enter');
    var t = document.createElement('time'); t.textContent = time;
    var s = document.createElement('span'); s.textContent = text;
    li.appendChild(t); li.appendChild(s);
    Array.prototype.forEach.call(list.children, function (c) { c.classList.remove('is-new'); });
    list.appendChild(li);
    while (list.children.length > (max || 5)) { list.removeChild(list.firstElementChild); }
  }

  /* ------------------------------------------------------------- hero map */
  function initHero(root) {
    var svg = root.querySelector('svg[data-scene="hero"]');
    var list = root.querySelector('[data-log]');
    var caption = root.querySelector('[data-caption]');
    if (!svg) { return; }
    var scene = SCENES.hero;
    var d = new Diagram(svg, scene, 'hero');
    var clock = 8 * 60 + 2;
    var i = 0, timer = 0, focusId = null;
    function stamp() {
      clock += 1 + Math.floor(Math.random() * 5);
      var h = Math.floor(clock / 60) % 24, m = clock % 60;
      return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
    }
    function fire() {
      var ev = scene.events[i % scene.events.length];
      i += 1;
      var nodeEl = d.nodes[ev[0]];
      var edge = 'h-' + ev[0];
      d.edges[edge].classList.add('is-lit');
      var finish = function () {
        nodeEl.classList.add('is-active');
        if (list) { logLine(list, stamp(), ev[2] + '  ' + ev[3], 5); }
        setTimeout(function () {
          nodeEl.classList.remove('is-active');
          d.edges[edge].classList.remove('is-lit');
        }, 1400);
      };
      d.pulse(edge, ev[1] === 'in', 1300, finish);
    }
    function start() { if (!timer && !REDUCED) { fire(); timer = setInterval(fire, 2400); } }
    function stop() { clearInterval(timer); timer = 0; }

    function bindNodes() {
      scene.nodes.forEach(function (n) {
        var g = d.nodes[n.id];
        g.setAttribute('tabindex', '0');
        g.setAttribute('role', 'button');
        g.setAttribute('aria-label', n.caption);
        var on = function () {
          focusId = n.id;
          g.classList.add('is-focus');
          d.edges['h-' + n.id].classList.add('is-active');
          if (caption) { caption.textContent = n.caption; }
        };
        var off = function () {
          if (focusId === n.id) { focusId = null; }
          g.classList.remove('is-focus');
          d.edges['h-' + n.id].classList.remove('is-active');
        };
        g.addEventListener('mouseenter', on); g.addEventListener('focus', on);
        g.addEventListener('mouseleave', off); g.addEventListener('blur', off);
      });
    }
    bindNodes();
    d.onRender = function () {
      bindNodes();
      if (REDUCED) { d.setState([], [], [], Object.keys(d.edges)); }
    };

    if (REDUCED) {
      d.setState([], [], [], Object.keys(d.edges));
      if (list) { scene.events.slice(0, 4).forEach(function (ev) { logLine(list, stamp(), ev[2] + '  ' + ev[3], 5); }); }
      return;
    }
    if (list) { scene.events.slice(-3).forEach(function (ev) { logLine(list, stamp(), ev[2] + '  ' + ev[3], 5); }); }
    onVisible(root, function (v) {
      d.setVisible(v);
      if (v && !document.hidden) { start(); } else { stop(); }
    });
    document.addEventListener('visibilitychange', function () { if (document.hidden) { stop(); } });
  }

  /* --------------------------------------------------------- step player */
  function Player(panel, sceneId, opts) {
    var self = this;
    this.panel = panel;
    this.scene = SCENES[sceneId];
    this.diagram = new Diagram(panel.querySelector('svg[data-scene]'), this.scene, sceneId);
    this.diagram.onRender = function () { self.redraw(); };
    this.list = panel.querySelector('[data-log]');
    this.stepEls = Array.prototype.slice.call(panel.querySelectorAll('.demo-step'));
    this.bar = panel.querySelector('.demo-progress i');
    this.playBtn = panel.querySelector('[data-ctrl="play"]');
    this.index = -1;
    this.playing = !REDUCED;
    this.visible = false;
    this.active = opts && opts.active !== undefined ? opts.active : true;
    this.interval = (opts && opts.interval) || 3400;
    this.timer = 0;
    this.stepEls.forEach(function (b, i) { b.addEventListener('click', function () { self.setPlaying(false); self.go(i); }); });
    var prev = panel.querySelector('[data-ctrl="prev"]');
    var next = panel.querySelector('[data-ctrl="next"]');
    if (prev) { prev.addEventListener('click', function () { self.setPlaying(false); self.go(Math.max(0, self.index - 1)); }); }
    if (next) { next.addEventListener('click', function () { self.setPlaying(false); self.go(Math.min(self.scene.steps.length - 1, self.index + 1)); }); }
    if (this.playBtn) {
      this.playBtn.addEventListener('click', function () {
        var p = !self.playing;
        if (p && self.index >= self.scene.steps.length - 1) { self.reset(); }
        self.setPlaying(p);
      });
    }
    this.reset();
    if (REDUCED) {
      if (this.playBtn) {
        this.playBtn.setAttribute('aria-pressed', 'false');
        this.playBtn.setAttribute('aria-label', 'Autoplay is off because reduced motion is on');
        this.playBtn.disabled = true;
      }
      this.go(this.scene.steps.length - 1, true);
    }
  }
  Player.prototype.reset = function () {
    this.index = -1;
    if (this.list) { this.list.innerHTML = ''; }
    this.diagram.setState([], [], [], []);
    this.stepEls.forEach(function (b) { b.removeAttribute('aria-current'); b.classList.remove('is-done'); });
    if (this.bar) { this.bar.style.width = '0%'; }
  };
  Player.prototype.redraw = function () {
    var steps = this.scene.steps, i = this.index;
    if (i < 0) { this.diagram.setState([], [], [], []); return; }
    var done = [], prevEdges = [];
    for (var n = 0; n < i; n++) { done = done.concat(steps[n].nodes); prevEdges = prevEdges.concat(steps[n].edges); }
    this.diagram.setState(steps[i].nodes, done, steps[i].edges, prevEdges);
  };
  Player.prototype.go = function (i, quiet) {
    var steps = this.scene.steps, self = this;
    if (i < this.index) { this.reset(); for (var j = 0; j < i; j++) { this.apply(j, true); } }
    else { for (var k = this.index + 1; k < i; k++) { this.apply(k, true); } }
    this.apply(i, !!quiet);
    if (this.bar) { this.bar.style.width = ((i + 1) / steps.length * 100) + '%'; }
    this.stepEls.forEach(function (b, n) {
      if (n === i) { b.setAttribute('aria-current', 'step'); } else { b.removeAttribute('aria-current'); }
      b.classList.toggle('is-done', n < i);
    });
    this.schedule();
  };
  Player.prototype.apply = function (i, quiet) {
    var steps = this.scene.steps, d = this.diagram, self = this;
    this.index = i;
    var active = steps[i].nodes;
    var done = [], prevEdges = [];
    for (var n = 0; n < i; n++) { done = done.concat(steps[n].nodes); prevEdges = prevEdges.concat(steps[n].edges); }
    d.setState(quiet ? active : [], done, steps[i].edges, prevEdges);
    var showNodes = function () { d.setState(active, done, steps[i].edges, prevEdges); };
    if (!quiet && steps[i].edges.length && !REDUCED) {
      var pending = steps[i].edges.length;
      steps[i].edges.forEach(function (e) { d.pulse(e, false, 950, function () { pending -= 1; if (!pending) { showNodes(); } }); });
    } else { showNodes(); }
    if (this.list) { steps[i].log.forEach(function (l) { logLine(self.list, l[0], l[1], 6); }); }
  };
  Player.prototype.schedule = function () {
    clearTimeout(this.timer);
    var self = this;
    if (!this.playing || !this.visible || !this.active || REDUCED) { return; }
    var last = this.index >= this.scene.steps.length - 1;
    this.timer = setTimeout(function () {
      if (last) { self.reset(); self.go(0); } else { self.go(self.index + 1); }
    }, last ? this.interval + 1600 : this.interval);
  };
  Player.prototype.setPlaying = function (p) {
    this.playing = p && !REDUCED;
    if (this.playBtn) {
      this.playBtn.setAttribute('aria-pressed', this.playing ? 'true' : 'false');
      this.playBtn.setAttribute('aria-label', this.playing ? 'Pause walkthrough' : 'Play walkthrough');
    }
    if (this.playing && this.index < 0) { this.go(0); } else { this.schedule(); }
  };
  Player.prototype.setVisible = function (v) {
    this.visible = v;
    this.diagram.setVisible(v);
    if (v && this.active && this.playing && this.index < 0) { this.go(0); } else { this.schedule(); }
  };
  Player.prototype.setActive = function (a) {
    this.active = a;
    if (a) { this.reset(); if (REDUCED) { this.go(this.scene.steps.length - 1, true); } else if (this.playing && this.visible) { this.go(0); } }
    else { clearTimeout(this.timer); }
  };

  function initDemo(root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    var players = {};
    var panels = Array.prototype.slice.call(root.querySelectorAll('.demo-panel'));
    panels.forEach(function (p) { players[p.id] = new Player(p, p.getAttribute('data-panel-scene'), { active: !p.hidden }); });
    if (!tabs.length) {
      panels.forEach(function (p) { onVisible(p, function (v) { players[p.id].setVisible(v); }); });
      return;
    }
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
    onVisible(root, function (v) { panels.forEach(function (p) { players[p.id].setVisible(v); }); });
  }

  /* ------------------------------------------------------- auto diagrams */
  function initAuto(root) {
    var p = new Player(root, root.getAttribute('data-auto-scene'), { interval: 2600 });
    onVisible(root, function (v) { p.setVisible(v); });
  }

  /* ----------------------------------------------------------- calculator */
  function initCalc(root) {
    var f = {
      hours: root.querySelector('[name="hours"]'),
      people: root.querySelector('[name="people"]'),
      rate: root.querySelector('[name="rate"]')
    };
    var out = {
      hours: root.querySelector('[data-out="hours"]'),
      people: root.querySelector('[data-out="people"]'),
      rate: root.querySelector('[data-out="rate"]'),
      cost: root.querySelector('[data-out="cost"]'),
      total: root.querySelector('[data-out="total-hours"]')
    };
    var money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    var num = new Intl.NumberFormat('en-US');
    function fill(input) {
      var pct = (input.value - input.min) / (input.max - input.min) * 100;
      input.style.setProperty('--fill', pct + '%');
    }
    function update() {
      var h = +f.hours.value, p = +f.people.value, r = +f.rate.value;
      var yearly = h * p * 48;
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

  /* --------------------------------------------------------- page chrome */
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
    if (REDUCED || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(reveals, function (r) { r.classList.add('is-in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      Array.prototype.forEach.call(reveals, function (r) { io.observe(r); });
    }
    Array.prototype.forEach.call(document.querySelectorAll('[data-stagger]'), function (group) {
      Array.prototype.forEach.call(group.children, function (c, i) { c.style.setProperty('--mi-delay', (i * 0.07).toFixed(2) + 's'); });
    });
  }

  function boot() {
    initChrome();
    Array.prototype.forEach.call(document.querySelectorAll('[data-hero]'), initHero);
    Array.prototype.forEach.call(document.querySelectorAll('[data-demo]'), initDemo);
    Array.prototype.forEach.call(document.querySelectorAll('[data-auto-scene]'), initAuto);
    Array.prototype.forEach.call(document.querySelectorAll('[data-calc]'), initCalc);
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', boot); } else { boot(); }
})();
