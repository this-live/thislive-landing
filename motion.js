/* this.live motion layer (see MOTION.md). No framework, ~2KB.
   Sticky nav state, scroll reveals (IntersectionObserver, once), interruptible FAQ accordion. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  window.__motionReady = true;

  function token(name, fallback) {
    var v = getComputedStyle(root).getPropertyValue(name).trim();
    return v || fallback;
  }
  function ms(v) { return v.indexOf('ms') > -1 ? parseFloat(v) : parseFloat(v) * 1000; }

  // 1 · Sticky nav: toggle .is-scrolled, rAF-throttled, passive listener.
  var nav = d.getElementById('nav');
  if (nav) {
    var ticking = false;
    var update = function () { nav.classList.toggle('is-scrolled', window.scrollY > 8); ticking = false; };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  // 2 · Scroll reveal: same selector list as motion.css. Run once; stagger within each batch (max 5 steps).
  var SEL = '.section .section-head, .section .svc-label, .section .card2, .section .step, .cta-band, .about2, .faq details, .note-callout, .prose > *';
  var targets = d.querySelectorAll(SEL);
  var showAll = function () { for (var i = 0; i < targets.length; i++) targets[i].classList.add('is-in'); };
  if (reduce.matches || !('IntersectionObserver' in window)) {
    showAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      var n = 0;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.style.setProperty('--m-delay', Math.min(n++, 5) * 60 + 'ms');
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    for (var i = 0; i < targets.length; i++) io.observe(targets[i]);
  }
  reduce.addEventListener && reduce.addEventListener('change', function (e) { if (e.matches) showAll(); });

  // 2b · Card spotlight (adapted from Motion Primitives' Spotlight, MIT): pointer position -> --mx/--my, rAF-batched.
  if (!reduce.matches && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var pending = null, frame = 0;
    d.addEventListener('pointermove', function (e) {
      var card = e.target.closest && e.target.closest('.card2');
      if (!card) return;
      pending = { card: card, x: e.clientX, y: e.clientY };
      if (!frame) frame = requestAnimationFrame(function () {
        frame = 0;
        var r = pending.card.getBoundingClientRect();
        pending.card.style.setProperty('--mx', (pending.x - r.left) + 'px');
        pending.card.style.setProperty('--my', (pending.y - r.top) + 'px');
      });
    }, { passive: true });
  }

  // 3 · FAQ accordion: animate <details> height with WAAPI. Interruptible: a second click reverses
  //     from the current height. Reduced motion falls back to the native toggle.
  var faqs = d.querySelectorAll('.faq details');
  Array.prototype.forEach.call(faqs, function (det) {
    var summary = det.querySelector('summary');
    if (!summary || !det.animate) return;
    var anim = null, wantOpen = det.open;
    summary.addEventListener('click', function (ev) {
      if (reduce.matches) { det.removeAttribute('data-open'); return; }
      ev.preventDefault();
      wantOpen = anim ? !wantOpen : !det.open;
      det.setAttribute('data-open', String(wantOpen));
      var start = det.getBoundingClientRect().height;
      if (anim) { anim.cancel(); anim = null; }
      det.style.overflow = 'hidden';
      if (wantOpen) det.open = true;
      var end = wantOpen ? det.scrollHeight : summary.getBoundingClientRect().height;
      var a = det.animate({ height: [start + 'px', end + 'px'] },
        { duration: ms(token('--dur-2', '0.28s')), easing: token('--ease', 'cubic-bezier(0.22, 1, 0.36, 1)') });
      anim = a;
      a.onfinish = function () {
        if (anim !== a) return;
        if (!wantOpen) det.open = false;
        det.style.overflow = '';
        anim = null;
      };
    });
  });
})();
