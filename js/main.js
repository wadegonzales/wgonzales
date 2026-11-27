/* ==========================================================================
   WADE GONZALES — PORTFOLIO
   Every feature runs inside safe(): if one fails, the rest still work and
   content is never left hidden. Nothing here is required to read the page.
   ========================================================================== */
(function () {
  'use strict';

  var doc = document.documentElement;
  var body = document.body;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasIO = 'IntersectionObserver' in window;

  function safe(name, fn) {
    try { fn(); } catch (err) { if (window.console) console.warn('[portfolio] "' + name + '" skipped:', err); }
  }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* Without IntersectionObserver there is nothing to trigger reveals — show everything. */
  if (!hasIO) doc.classList.remove('reveal-ready');
   /* ---------------- Envelope intro (replaces the old preloader) ---------------- */
  safe('envelope-intro', function () {
    var PLAY_ONCE_PER_SESSION = false;   // true = only show on the first visit of a browser session
    var SPEED = 1.7;                     // 1 = original speed, 2 = twice as fast (try 1.5 - 2.5)
    var intro = document.getElementById('envelopeIntro');
    if (!intro) { doc.classList.add('is-loaded'); return; }
    var env = document.getElementById('env');
    var seal = document.getElementById('envSeal');
    var skip = document.getElementById('envSkip');
    var opened = false, left = false;

    // scales every intro animation/transition (and the page rise) without touching the CSS
    function speedUp(els) {
      void intro.offsetWidth;                        // flush styles so the animations exist
      els.forEach(function (el) {
        if (!el || !el.getAnimations) return;
        el.getAnimations({ subtree: el === intro }).forEach(function (a) {
          if (a.animationName !== 'envFailsafe') a.playbackRate = SPEED;
        });
      });
    }

    function leave() {
      if (left) return;
      left = true;
      doc.classList.add('is-loaded');
      doc.classList.remove('env-on', 'env-open');
      body.classList.remove('lock');
      intro.style.display = 'none';
      try { sessionStorage.setItem('envelopeSeen', '1'); } catch (e) {}
    }
    function open() {
      if (opened || left) return;
      opened = true;
      doc.classList.add('env-open');                 // the page rises inside the envelope
      env.classList.add('open');                     // seal peels, flap lifts, paper slides away
      speedUp([intro, document.querySelector('main'), document.querySelector('.site-header')]);
      setTimeout(function () { doc.classList.add('is-loaded'); }, 1000 / SPEED);   // hero entrance plays as the paper leaves
      setTimeout(leave, 2500 / SPEED);
    }

    var seen = false;
    try { seen = PLAY_ONCE_PER_SESSION && sessionStorage.getItem('envelopeSeen') === '1'; } catch (e) {}
    if (reduceMotion || seen) { leave(); return; }

    body.classList.add('lock');
    doc.classList.add('env-on');
    speedUp([intro]);
    seal.addEventListener('click', open);
    skip.addEventListener('click', leave);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') leave(); });
    setTimeout(open, 1900 / SPEED);                         // opens by itself; click the seal to open sooner
    setTimeout(leave, 6500);                          // safety net
  });
  /* ---------------- Marquees (single source of truth for the lists) ---------------- */
  safe('marquee', function () {
    var LISTS = {
      services: ['Video Editing', 'Event Materials', 'Infographics', 'UI/UX Design', 'Graphic Design', 'Branding & Logos', 'Social Media Visuals'],
      tags: ['Design', 'UI/UX', 'Design Thinking', 'Creativity']
    };
    var tracks = $$('[data-marquee]');
    function build() {
      tracks.forEach(function (track) {
        var kind = track.getAttribute('data-marquee');
        var items = LISTS[kind];
        if (!items) return;
        track.classList.remove('run');
        track.textContent = '';
        function addCopy() {
          items.forEach(function (text) {
            var span = document.createElement('span');
            span.textContent = text;
            var sep = document.createElement('i');
            if (kind === 'tags') { sep.className = 'dot'; sep.textContent = '\u00b7'; } else { sep.className = 'diamond'; }
            track.appendChild(span);
            track.appendChild(sep);
          });
        }
        addCopy();
        var half = track.scrollWidth || 600;
        var target = Math.max(window.innerWidth, (window.screen && screen.width) || 0, 1600);
        var reps = Math.max(1, Math.ceil(target / half));
        for (var i = 1; i < reps * 2; i++) addCopy(); // even number of identical halves => seamless -50% loop
        if (!reduceMotion) track.classList.add('run');
      });
    }
    build();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
  });

  /* ---------------- Header, menu, scrollspy ---------------- */
  safe('header', function () {
    var header = document.getElementById('siteHeader');
    if (!header) return;
    function onScroll() { header.classList.toggle('scrolled', window.scrollY > 30); }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  });

  safe('menu', function () {
    var btn = document.getElementById('hamburger');
    var nav = document.getElementById('mobileNav');
    var header = document.getElementById('siteHeader');
    if (!btn || !nav) return;
    function set(open) {
      nav.classList.toggle('open', open);
      btn.classList.toggle('active', open);
      if (header) header.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
    var openedAt = 0;
    btn.addEventListener('click', function () { openedAt = window.scrollY; set(!nav.classList.contains('open')); });
    window.addEventListener('scroll', function () {
      if (nav.classList.contains('open') && Math.abs(window.scrollY - openedAt) > 80) set(false); // tidy up if the visitor scrolls on
    }, { passive: true });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) set(false); });
  });

  safe('scrollspy', function () {
    var links = $$('.main-nav a[data-nav]');
    var ids = ['about', 'visual-identity', 'ui-ux', 'video-editing', 'testimonials'];
    var sections = ids.map(function (id) { return document.getElementById(id); }).filter(Boolean);
    if (!links.length || !sections.length) return;
    var ticking = false;
    function update() {
      ticking = false;
      var line = window.innerHeight * 0.4, current = '';
      sections.forEach(function (s) { if (s.getBoundingClientRect().top <= line) current = s.id; });
      links.forEach(function (l) { l.classList.toggle('active', !!current && l.getAttribute('href') === '#' + current); });
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  });

  /* ---------------- Scroll reveals, skill bars, timeline ---------------- */
  safe('reveal', function () {
    if (!hasIO) return;
    var io = new IntersectionObserver(function (entries) {
      var batch = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.style.transitionDelay = (batch++ % 4) * 80 + 'ms';
        el.classList.add('in-view');
        io.unobserve(el);
        setTimeout(function () { el.style.transitionDelay = ''; }, 1400);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    $$('.reveal-up').forEach(function (el) { io.observe(el); });
  });

  safe('skills', function () {
    var grid = $('.software-grid');
    if (!grid || !hasIO) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        $$('.soft-badge', entry.target).forEach(function (badge, i) {
          setTimeout(function () { badge.classList.add('filled'); }, i * 90);
        });
        io.disconnect();
      });
    }, { threshold: 0.3 });
    io.observe(grid);
  });

  safe('timeline', function () {
    var tl = $('.timeline');
    if (!tl || !hasIO) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('in-view'); io.disconnect(); }
      });
    }, { threshold: 0.2 });
    io.observe(tl);
  });

  /* ---------------- Hero parallax (CSS reads --scroll) ---------------- */
  safe('parallax', function () {
    var hero = $('.hero');
    if (!hero || reduceMotion) return;
    var ticking = false;
    function update() {
      ticking = false;
      var y = window.scrollY;
      if (y < window.innerHeight * 1.2) hero.style.setProperty('--scroll', Math.round(y));
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  });

  /* ---------------- Ink-drop cursor (mouse only) ---------------- */
  safe('cursor', function () {
    var drip = document.getElementById('drip');
    if (!drip || !finePointer || reduceMotion) return;
    var tx = 0, ty = 0, x = 0, y = 0, running = false;
    function loop() {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      drip.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    }
    window.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!running) { running = true; x = tx; y = ty; drip.classList.add('active'); loop(); }
    }, { passive: true });
    document.addEventListener('mouseover', function (e) {
      drip.classList.toggle('grow', !!(e.target.closest && e.target.closest('a, button, [role="button"], .soft-badge, .video-frame')));
    });
  });

  /* ---------------- Testimonial card tilt ---------------- */
  safe('tilt', function () {
    if (!finePointer || reduceMotion) return;
    $$('.testi-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(900px) rotateY(' + (px * 6).toFixed(2) + 'deg) rotateX(' + (-py * 6).toFixed(2) + 'deg) translateY(-4px)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  });

  /* ---------------- Lightbox with prev / next per gallery ---------------- */
  safe('lightbox', function () {
    var box = document.getElementById('lightbox');
    var big = document.getElementById('lightboxImg');
    var btnClose = document.getElementById('lightboxClose');
    var btnPrev = document.getElementById('lightboxPrev');
    var btnNext = document.getElementById('lightboxNext');
    if (!box || !big) return;
    var group = [], index = 0, lastFocus = null;

    function show(i) {
      index = (i + group.length) % group.length;
      var el = group[index];
      big.src = el.currentSrc || el.src;
      big.alt = el.alt || '';
    }
    function open(list, i, trigger) {
      group = list; lastFocus = trigger;
      box.classList.toggle('single', list.length < 2);
      show(i);
      box.classList.add('open');
      box.setAttribute('aria-hidden', 'false');
      body.classList.add('lock');
      btnClose.focus();
    }
    function close() {
      if (!box.classList.contains('open')) return;
      box.classList.remove('open');
      box.setAttribute('aria-hidden', 'true');
      body.classList.remove('lock');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    $$('.gallery-masonry, .rgs-showcase').forEach(function (galleryEl) {
      var imgs = $$('img', galleryEl);
      imgs.forEach(function (img, i) {
        img.tabIndex = 0;
        img.setAttribute('role', 'button');
        img.setAttribute('aria-label', 'View larger: ' + (img.alt || 'image'));
        img.addEventListener('click', function () { open(imgs, i, img); });
        img.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(imgs, i, img); }
        });
      });
    });

    btnClose.addEventListener('click', close);
    btnPrev.addEventListener('click', function () { show(index - 1); });
    btnNext.addEventListener('click', function () { show(index + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft' && group.length > 1) show(index - 1);
      else if (e.key === 'ArrowRight' && group.length > 1) show(index + 1);
      else if (e.key === 'Tab') { // keep focus inside the viewer
        var f = [btnClose, btnPrev, btnNext].filter(function (b) { return b.offsetParent !== null; });
        var pos = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(pos + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });
  });

  /* ---------------- Back to top ---------------- */
  safe('to-top', function () {
    var btn = document.getElementById('toTop');
    if (!btn) return;
    btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); });
  });
})();
