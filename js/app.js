/* ------------------------------------------------------------------
   Portfolio Mostafa Gomaa — Sprachumschaltung, Blattskalierung,
   Navigation. Kein Framework, keine externen Abhaengigkeiten.
   ------------------------------------------------------------------ */
(function () {
  'use strict';

  var STORAGE_KEY = 'mg-portfolio-lang';
  var SUPPORTED = ['de', 'en'];
  var SHEET_W = 1122.52;               // 297 mm bei 96 dpi
  var MOBILE = window.matchMedia('(max-width: 899px)');

  /* ---------------- Sprache bestimmen ----------------
     Reihenfolge: URL-Parameter -> gespeicherte Wahl -> Browser -> Englisch */
  function fromUrl() {
    var v = new URLSearchParams(window.location.search).get('lang');
    return SUPPORTED.indexOf(v) > -1 ? v : null;
  }
  function fromStorage() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      return SUPPORTED.indexOf(v) > -1 ? v : null;
    } catch (e) { return null; }
  }
  function fromBrowser() {
    var list = navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language || ''];
    for (var i = 0; i < list.length; i++) {
      if (String(list[i]).toLowerCase().indexOf('de') === 0) return 'de';
    }
    return null;
  }
  function initialLang() {
    return fromUrl() || fromStorage() || fromBrowser() || 'en';
  }

  /* ---------------- Sprache anwenden ---------------- */
  function setMeta(name, value, attr) {
    var el = document.querySelector('meta[' + (attr || 'name') + '="' + name + '"]');
    if (el) el.setAttribute('content', value);
  }

  function applyLang(lang, pushUrl) {
    var dict = window.I18N[lang] || {};
    var meta = window.META[lang] || {};

    document.documentElement.setAttribute('lang', lang);

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var v = dict[el.getAttribute('data-i18n')];
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
      var v = dict[el.getAttribute('data-i18n-alt')];
      if (v != null) el.setAttribute('alt', v);
    });

    if (meta.title) document.title = meta.title;
    if (meta.desc) {
      setMeta('description', meta.desc);
      setMeta('twitter:description', meta.desc);
      setMeta('og:description', meta.desc, 'property');
    }
    if (meta.title) {
      setMeta('twitter:title', meta.title);
      setMeta('og:title', meta.title, 'property');
    }
    if (meta.locale) {
      setMeta('og:locale', meta.locale, 'property');
      setMeta('og:locale:alternate', lang === 'de' ? 'en_GB' : 'de_DE', 'property');
    }

    document.querySelectorAll('.lang-btn').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    });

    if (pushUrl) {
      var url = new URL(window.location.href);
      url.searchParams.set('lang', lang);
      history.replaceState(null, '', url.pathname + url.search + url.hash);
    }
  }

  function chooseLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) return;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    applyLang(lang, true);
  }

  /* ---------------- Blattskalierung ----------------
     Das Blatt bleibt 297 x 210 mm und wird auf die Breite skaliert.
     Unterhalb 900 px uebernimmt das Stapel-Layout aus der CSS. */
  function rescale() {
    if (MOBILE.matches) {
      document.documentElement.style.setProperty('--s', '1');
      return;
    }
    var box = document.querySelector('.sheet-scale');
    if (!box) return;
    var s = box.clientWidth / SHEET_W;
    document.documentElement.style.setProperty('--s', String(Math.round(s * 10000) / 10000));
  }


  /* ---------------- Schwebendes Schriftfeld ----------------
     Sichtbar ab Blatt 02. Blendet nach IDLE_MS ohne Scrollen aus
     und kehrt bei der naechsten Scrollbewegung zurueck. */
  var IDLE_MS = 2500;
  var bar, barNo, idleTimer, currentSheet = 1;

  function setSheet(n) {
    if (!n || n === currentSheet) return;
    currentSheet = n;
    if (barNo) barNo.textContent = n < 10 ? '0' + n : String(n);
    if (n <= 1) hideBar();
  }

  function showBar() {
    if (!bar || currentSheet <= 1) return;
    if (!bar.classList.contains('is-on')) {        // DOM nur bei Zustandswechsel anfassen
      bar.classList.add('is-on');
      bar.setAttribute('aria-hidden', 'false');
    }
    clearTimeout(idleTimer);
    idleTimer = setTimeout(hideBar, IDLE_MS);
  }

  function hideBar() {
    if (!bar || !bar.classList.contains('is-on')) { clearTimeout(idleTimer); return; }
    clearTimeout(idleTimer);
    bar.classList.remove('is-on');
    bar.setAttribute('aria-hidden', 'true');
  }

  function initSheetBar() {
    bar = document.getElementById('sfbar');
    barNo = document.getElementById('sfbarNo');
    if (!bar) return;
    window.addEventListener('scroll', showBar, { passive: true });
    // Beim Verlassen des Fensters ausblenden
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) hideBar();
    });
  }

  /* ---------------- Fortschritt und aktiver Navipunkt ---------------- */
  function initProgress() {
    var bar = document.getElementById('progressBar');
    if (!bar) return;
    var ticking = false;
    function update() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  function initObservers() {
    var links = Array.prototype.slice.call(
      document.querySelectorAll('.mainnav a[href^="#"], .mobilenav a[href^="#"]'));

    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.sheet').forEach(function (s) { s.classList.add('is-in'); });
      return;
    }

    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); reveal.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.04 });
    document.querySelectorAll('.sheet').forEach(function (s) { reveal.observe(s); });

    var sheets = Array.prototype.slice.call(document.querySelectorAll('.sheet[id]'));
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = e.target.id;
        links.forEach(function (a) {
          a.setAttribute('aria-current',
            a.getAttribute('href') === '#' + id ? 'true' : 'false');
        });
        setSheet(sheets.indexOf(e.target) + 1);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sheets.forEach(function (s) { spy.observe(s); });
  }

  /* ---------------- Mobile Navigation ---------------- */
  function initMobileNav() {
    var btn = document.querySelector('.navtoggle');
    var nav = document.getElementById('mobilenav');
    if (!btn || !nav) return;

    function close() { btn.setAttribute('aria-expanded', 'false'); nav.hidden = true; }
    function open() { btn.setAttribute('aria-expanded', 'true'); nav.hidden = false; }

    btn.addEventListener('click', function () {
      btn.getAttribute('aria-expanded') === 'true' ? close() : open();
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
    close();
  }

  /* ---------------- Start ---------------- */
  function ready() {
    applyLang(initialLang(), false);

    document.querySelectorAll('.lang-btn').forEach(function (b) {
      b.addEventListener('click', function () { chooseLang(b.dataset.lang); });
    });

    rescale();
    initSheetBar();
    initProgress();
    initObservers();
    initMobileNav();

    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t); t = setTimeout(rescale, 80);
    }, { passive: true });
    if (MOBILE.addEventListener) MOBILE.addEventListener('change', rescale);
    window.addEventListener('beforeprint', function () {
      document.documentElement.style.setProperty('--s', '1');
    });
    window.addEventListener('afterprint', rescale);
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', ready)
    : ready();
})();
