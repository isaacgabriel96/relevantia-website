/* ═══════════════════════════════════════════════
   RELEVANTIA — main runtime (i18n, nav, FAQ, reveal, forms)
   ═══════════════════════════════════════════════ */

(function () {
  const STORAGE_KEY = 'relevantia.lang';
  const SUPPORTED = ['pt', 'en', 'es', 'zh', 'ar'];
  const DEFAULT_LANG = 'pt';
  const RTL_LANGS = ['ar'];
  const LANG_LABEL = {
    pt: { name: 'Português', code: 'PT' },
    en: { name: 'English',   code: 'EN' },
    es: { name: 'Español',   code: 'ES' },
    zh: { name: '中文',       code: 'ZH' },
    ar: { name: 'العربية',    code: 'AR' },
  };
  const HTML_LANG = { pt: 'pt-BR', en: 'en', es: 'es', zh: 'zh-CN', ar: 'ar' };

  /* ── lang detection ── */
  function detectLang() {
    const fromUrl = new URLSearchParams(location.search).get('lang');
    if (fromUrl && SUPPORTED.includes(fromUrl)) return fromUrl;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;
    const nav = (navigator.language || '').toLowerCase();
    if (nav.startsWith('en')) return 'en';
    return DEFAULT_LANG;
  }

  function ensureArabicFont() {
    if (document.getElementById('noto-arabic')) return;
    const link = document.createElement('link');
    link.id = 'noto-arabic';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(link);
  }

  function applyLang(lang) {
    if (!SUPPORTED.includes(lang)) lang = DEFAULT_LANG;
    document.documentElement.lang = HTML_LANG[lang] || 'pt-BR';
    document.documentElement.dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';
    if (lang === 'ar') ensureArabicFont();
    localStorage.setItem(STORAGE_KEY, lang);

    const dict = (window.I18N && window.I18N[lang]) || {};

    // text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = dict[key];
      if (val == null) return;
      const attr = el.getAttribute('data-i18n-attr');
      if (attr) el.setAttribute(attr, val);
      else el.innerHTML = val;
    });
    // attribute placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = dict[key];
      if (val != null) el.setAttribute('placeholder', val);
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria-label');
      const val = dict[key];
      if (val != null) el.setAttribute('aria-label', val);
    });
    // title
    const titleKey = document.documentElement.getAttribute('data-i18n-title');
    if (titleKey && dict[titleKey]) document.title = dict[titleKey];
    // description meta
    const metaDesc = document.querySelector('meta[name="description"][data-i18n]');
    if (metaDesc) {
      const v = dict[metaDesc.getAttribute('data-i18n')];
      if (v) metaDesc.setAttribute('content', v);
    }

    // legacy 2-button toggle UI state
    document.querySelectorAll('.lang-toggle button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    // dropdown UI state
    document.querySelectorAll('.lang-select').forEach(sel => {
      sel.querySelectorAll('.lang-menu button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
      });
      const cur = sel.querySelector('.lang-current');
      if (cur) cur.textContent = (LANG_LABEL[lang] && LANG_LABEL[lang].code) || lang.toUpperCase();
    });
    // mobile drawer pills UI state
    document.querySelectorAll('.nav-lang-pills button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  /* ── mobile nav ── */
  function initNav() {
    const trigger = document.querySelector('.menu-trigger');
    const links = document.querySelector('.nav-links');
    if (!trigger || !links) return;
    trigger.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  }

  /* ── lang toggle (legacy 2-button + mobile pills) ── */
  function initLangToggle() {
    document.querySelectorAll('.lang-toggle button, .nav-lang-pills button').forEach(btn => {
      btn.addEventListener('click', () => applyLang(btn.dataset.lang));
    });
  }

  /* ── lang select dropdown (5 idiomas) ── */
  function initLangSelect() {
    document.querySelectorAll('.lang-select').forEach(sel => {
      const trigger = sel.querySelector('.lang-select-btn');
      if (!trigger) return;

      const close = () => sel.setAttribute('data-open', 'false');
      const open  = () => sel.setAttribute('data-open', 'true');
      const toggle = () => sel.getAttribute('data-open') === 'true' ? close() : open();

      trigger.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
      sel.querySelectorAll('.lang-menu button').forEach(btn => {
        btn.addEventListener('click', () => {
          applyLang(btn.dataset.lang);
          close();
        });
      });
      // ESC + click outside
      document.addEventListener('click', (e) => { if (!sel.contains(e.target)) close(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    });
  }

  /* ── scroll reveal ── */
  function initReveal() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  }

  /* ── FAQ ── */
  function initFAQ() {
    document.querySelectorAll('.faq-item').forEach(item => {
      const q = item.querySelector('.faq-q');
      if (!q) return;
      q.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        // close siblings
        item.parentElement.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  /* ── Forms (The Edge / Shift) — submit then redirect to Radar ── */
  function initForms() {
    document.querySelectorAll('form[data-form-redirect]').forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const success = form.querySelector('[data-form-success]');
        const fields = form.querySelector('[data-form-fields]');
        if (fields) fields.hidden = true;
        if (success) success.hidden = false;
        // collect data + persist
        try {
          const data = Object.fromEntries(new FormData(form).entries());
          data._ts = Date.now();
          data._origin = form.dataset.formOrigin || location.pathname;
          const queue = JSON.parse(localStorage.getItem('relevantia.leads') || '[]');
          queue.push(data);
          localStorage.setItem('relevantia.leads', JSON.stringify(queue));
        } catch (_) {}
        // redirect after delay (gives user time to read confirmation)
        const delay = parseInt(form.dataset.formDelay || '4500', 10);
        const target = form.dataset.formRedirect;
        if (target) setTimeout(() => { window.location.href = target; }, delay);
      });
    });
  }

  /* ── Header shadow on scroll ── */
  function initHeaderShadow() {
    const bar = document.querySelector('.topbar');
    if (!bar) return;
    const onScroll = () => bar.classList.toggle('scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── Boot ── */
  function boot() {
    applyLang(detectLang());
    initNav();
    initLangToggle();
    initLangSelect();
    initReveal();
    initFAQ();
    initForms();
    initHeaderShadow();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
