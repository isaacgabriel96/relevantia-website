/* ═══════════════════════════════════════════════
   RELEVANTIA — main runtime (i18n, nav, reveal, formulário)
   ═══════════════════════════════════════════════ */

/* ===== CONFIG: para onde vai o formulário "Quero conhecer" =====
   Com `whatsapp` preenchido (só dígitos, com DDI: '5511999999999'), o envio
   abre o WhatsApp com a mensagem pronta. Vazio, abre o e-mail para `email`. */
const CONTACT = {
  email: 'hello@relevantia.com.br',
  whatsapp: '',
};

(function () {
  const STORAGE_KEY = 'relevantia.lang';
  const SUPPORTED = ['pt', 'en', 'es', 'zh', 'ar'];
  const DEFAULT_LANG = 'pt';
  const RTL_LANGS = ['ar'];
  const LANG_CODE = { pt: 'PT', en: 'EN', es: 'ES', zh: 'ZH', ar: 'AR' };
  const HTML_LANG = { pt: 'pt-BR', en: 'en', es: 'es', zh: 'zh-CN', ar: 'ar' };
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (_) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (_) {} },
  };

  /* ── idioma ── */
  function detectLang() {
    const fromUrl = new URLSearchParams(location.search).get('lang');
    if (fromUrl && SUPPORTED.includes(fromUrl)) return fromUrl;
    const stored = store.get(STORAGE_KEY);
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
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }

  // O HTML é a fonte do português. Chave sem tradução no idioma escolhido cai
  // no inglês (es/zh/ar) e, em último caso, no texto original da página.
  function lookup(lang, key, el) {
    const I = window.I18N || {};
    if (I[lang] && I[lang][key] != null) return I[lang][key];
    if (lang !== 'pt' && I.en && I.en[key] != null) return I.en[key];
    return el ? el.__i18nOrig : null;
  }

  function applyLang(lang) {
    if (!SUPPORTED.includes(lang)) lang = DEFAULT_LANG;
    document.documentElement.lang = HTML_LANG[lang];
    document.documentElement.dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';
    if (lang === 'ar') ensureArabicFont();
    store.set(STORAGE_KEY, lang);

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const attr = el.getAttribute('data-i18n-attr') || (el.tagName === 'META' ? 'content' : null);
      if (el.__i18nOrig === undefined) el.__i18nOrig = attr ? el.getAttribute(attr) : el.innerHTML;
      const val = lookup(lang, el.getAttribute('data-i18n'), el);
      if (val == null) return;
      if (attr) el.setAttribute(attr, val);
      else el.innerHTML = val;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      if (el.__i18nOrig === undefined) el.__i18nOrig = el.getAttribute('placeholder');
      const val = lookup(lang, el.getAttribute('data-i18n-placeholder'), el);
      if (val != null) el.setAttribute('placeholder', val);
    });
    const titleKey = document.documentElement.getAttribute('data-i18n-title');
    if (titleKey) {
      if (document.__i18nTitle === undefined) document.__i18nTitle = document.title;
      document.title = lookup(lang, titleKey) || document.__i18nTitle;
    }
    const metaDesc = document.querySelector('meta[name="description"][data-i18n-meta]');
    if (metaDesc) {
      if (metaDesc.__i18nOrig === undefined) metaDesc.__i18nOrig = metaDesc.content;
      metaDesc.content = lookup(lang, metaDesc.getAttribute('data-i18n-meta')) || metaDesc.__i18nOrig;
    }

    document.querySelectorAll('.lang-select').forEach(sel => {
      sel.querySelectorAll('.lang-menu button').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
      const cur = sel.querySelector('.lang-current');
      if (cur) cur.textContent = LANG_CODE[lang];
    });
    document.dispatchEvent(new CustomEvent('relevantia:lang', { detail: lang }));
  }
  window.relevantiaLang = () => (document.documentElement.lang || 'pt').slice(0, 2);

  /* ── menu mobile ── */
  function initNav() {
    const bar = document.querySelector('.topbar');
    const trigger = document.querySelector('.menu-trigger');
    const links = document.querySelector('.nav-links');
    if (!bar || !trigger || !links) return;
    const set = (open) => {
      links.classList.toggle('open', open);
      bar.classList.toggle('menu-open', open);
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    };
    trigger.addEventListener('click', () => set(!links.classList.contains('open')));
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => set(false)));
    window.matchMedia('(min-width: 921px)').addEventListener('change', (e) => { if (e.matches) set(false); });
  }

  /* ── dropdown do nav (desktop) ── */
  function initNavGroups() {
    const groups = document.querySelectorAll('.nav-group');
    if (!groups.length) return;
    const desktop = () => window.matchMedia('(min-width: 921px)').matches;
    const closeAll = (except) => groups.forEach(g => {
      if (g === except) return;
      g.setAttribute('data-open', 'false');
      const b = g.querySelector('.nav-group-btn');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
    groups.forEach(group => {
      const btn = group.querySelector('.nav-group-btn');
      if (!btn) return;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = group.getAttribute('data-open') === 'true';
        closeAll(group);
        group.setAttribute('data-open', isOpen ? 'false' : 'true');
        btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      });
      group.addEventListener('mouseenter', () => { if (desktop()) { closeAll(group); group.setAttribute('data-open', 'true'); } });
      group.addEventListener('mouseleave', () => { if (desktop()) group.setAttribute('data-open', 'false'); });
    });
    document.addEventListener('click', () => closeAll(null));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(null); });
  }

  /* ── seletor de idioma ── */
  function initLangSelect() {
    document.querySelectorAll('.lang-select').forEach(sel => {
      const trigger = sel.querySelector('.lang-select-btn');
      if (!trigger) return;
      const setOpen = (v) => { sel.setAttribute('data-open', v ? 'true' : 'false'); trigger.setAttribute('aria-expanded', v ? 'true' : 'false'); };
      trigger.addEventListener('click', (e) => { e.stopPropagation(); setOpen(sel.getAttribute('data-open') !== 'true'); });
      sel.querySelectorAll('.lang-menu button').forEach(btn => btn.addEventListener('click', () => { applyLang(btn.dataset.lang); setOpen(false); }));
      document.addEventListener('click', (e) => { if (!sel.contains(e.target)) setOpen(false); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    });
  }

  /* ── reveal ao rolar ── */
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => io.observe(el));
  }

  /* ── FAQ ── */
  function initFAQ() {
    document.querySelectorAll('.faq-item').forEach(item => {
      const q = item.querySelector('.faq-q');
      if (!q) return;
      q.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        item.parentElement.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  /* ── barra de progresso + nav com fundo ao rolar ── */
  function initScroll() {
    const bar = document.querySelector('.topbar');
    const progress = document.querySelector('.progress');
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      if (bar) bar.classList.toggle('scrolled', y > 8);
      if (progress) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      }
    };
    update();
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  }

  /* ── formulário "Quero conhecer" ── */
  const FORM_TXT = {
    pt: {
      required: 'Preencha este campo.',
      email: 'Confira o e-mail.',
      consent: 'Marque para podermos responder.',
      subject: 'Quero conhecer a Relevantia',
      labels: { nome: 'Nome', email: 'E-mail', whatsapp: 'WhatsApp', empresa: 'Empresa ou projeto', perfil: 'Perfil', interesse: 'Interesse', mensagem: 'Mensagem' },
      intro: 'Olá, time Relevantia! Quero conhecer mais.',
      copied: 'Mensagem copiada',
    },
    en: {
      required: 'Please fill in this field.',
      email: 'Please check the email.',
      consent: 'Please tick this so we can reply.',
      subject: 'I want to know Relevantia',
      labels: { nome: 'Name', email: 'Email', whatsapp: 'WhatsApp', empresa: 'Company or project', perfil: 'Profile', interesse: 'Interest', mensagem: 'Message' },
      intro: 'Hi, Relevantia team! I want to learn more.',
      copied: 'Message copied',
    },
  };
  const ftxt = () => FORM_TXT[window.relevantiaLang()] || FORM_TXT.en;

  function buildMessage(form) {
    const t = ftxt();
    const fd = new FormData(form);
    const optText = (name) => {
      const el = form.elements[name];
      if (!el) return '';
      if (el.tagName === 'SELECT') return el.value ? el.options[el.selectedIndex].text.trim() : '';
      return (fd.get(name) || '').toString().trim();
    };
    const interests = [...form.querySelectorAll('input[name="interesse"]:checked')]
      .map(i => i.nextElementSibling ? i.nextElementSibling.textContent.trim() : i.value);
    const lines = [t.intro, ''];
    const add = (k, v) => { if (v) lines.push(`${t.labels[k]}: ${v}`); };
    add('nome', optText('nome'));
    add('email', optText('email'));
    add('whatsapp', optText('whatsapp'));
    add('empresa', optText('empresa'));
    add('perfil', optText('perfil'));
    add('interesse', interests.join(', '));
    const msg = optText('mensagem');
    if (msg) { lines.push(''); lines.push(`${t.labels.mensagem}:`); lines.push(msg); }
    return lines.join('\n');
  }

  function validate(form) {
    const t = ftxt();
    let firstBad = null;
    form.querySelectorAll('.form-group, .form-consent').forEach(g => { g.classList.remove('has-error'); const e = g.querySelector('.form-error'); if (e) e.remove(); });
    const fail = (field, msg) => {
      const g = field.closest('.form-group') || field.closest('.form-consent');
      if (g) {
        g.classList.add('has-error');
        const e = document.createElement('span');
        e.className = 'form-error'; e.textContent = msg;
        g.appendChild(e);
      }
      if (!firstBad) firstBad = field;
    };
    form.querySelectorAll('[required]').forEach(field => {
      if (field.type === 'checkbox') { if (!field.checked) fail(field, t.consent); return; }
      if (!field.value.trim()) { fail(field, t.required); return; }
      if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(field.value.trim())) fail(field, t.email);
    });
    if (firstBad) firstBad.focus();
    return !firstBad;
  }

  function initLeadForms() {
    // ?interesse=radar|edge|intelligence|audiencia pré-marca a frente de interesse
    const pre = new URLSearchParams(location.search).get('interesse');
    document.querySelectorAll('form[data-lead-form]').forEach(form => {
      if (pre) form.querySelectorAll(`input[name="interesse"][value="${CSS.escape(pre)}"]`).forEach(i => { i.checked = true; });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validate(form)) return;
        const text = buildMessage(form);
        const url = CONTACT.whatsapp
          ? `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`
          : `mailto:${CONTACT.email}?subject=${encodeURIComponent(ftxt().subject)}&body=${encodeURIComponent(text)}`;

        const card = form.closest('.form-card') || form.parentElement;
        const success = card.querySelector('[data-form-success]');
        if (success) {
          form.hidden = true;
          success.hidden = false;
          const again = success.querySelector('[data-open-again]');
          if (again) again.href = url;
          const copy = success.querySelector('[data-copy-message]');
          if (copy) copy.onclick = () => {
            const done = () => { copy.textContent = ftxt().copied; };
            if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, () => {});
          };
        }
        if (CONTACT.whatsapp) window.open(url, '_blank', 'noopener');
        else window.location.href = url;
      });
    });

    // links com data-interest marcam a frente antes de rolar até o formulário
    document.querySelectorAll('a[data-interest]').forEach(a => a.addEventListener('click', () => {
      const v = a.dataset.interest;
      document.querySelectorAll(`form[data-lead-form] input[name="interesse"][value="${CSS.escape(v)}"]`).forEach(i => { i.checked = true; });
    }));
  }

  // Preenche os pontos que dependem do CONTACT (texto do e-mail, link do WhatsApp).
  function initContactSlots() {
    document.querySelectorAll('[data-contact-email]').forEach(el => {
      el.textContent = CONTACT.email;
      const a = el.closest('a');
      if (a) a.href = `mailto:${CONTACT.email}`;
    });
    document.querySelectorAll('[data-contact-whatsapp]').forEach(el => {
      if (!CONTACT.whatsapp) { el.hidden = true; return; }
      el.href = `https://wa.me/${CONTACT.whatsapp}`;
    });
    document.querySelectorAll('[data-channel-whatsapp]').forEach(el => { el.hidden = !CONTACT.whatsapp; });
    document.querySelectorAll('[data-channel-email]').forEach(el => { el.hidden = !!CONTACT.whatsapp; });
  }

  /* ── boot ── */
  function boot() {
    applyLang(detectLang());
    initNav();
    initNavGroups();
    initLangSelect();
    initReveal();
    initFAQ();
    initScroll();
    initLeadForms();
    initContactSlots();
    const yr = document.getElementById('yr');
    if (yr) yr.textContent = new Date().getFullYear();
    requestAnimationFrame(() => setTimeout(() => document.body.classList.add('loaded'), 60));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
