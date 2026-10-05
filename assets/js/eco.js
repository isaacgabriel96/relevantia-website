/* ═══════════════════════════════════════════════
   Seção Ecossistema: os produtos lado a lado.
   Desktop: a seção fica presa na tela e a rolagem vertical
   anda pelos produtos na horizontal. Celular/telas baixas:
   carrossel com arraste (scroll-snap).
   ═══════════════════════════════════════════════ */
(function () {
  const sec = document.querySelector('.eco');
  if (!sec) return;
  const track = sec.querySelector('.eco-track');
  const slides = [...sec.querySelectorAll('.eco-slide')];
  const tabs = [...sec.querySelectorAll('.eco-tab')];
  const bar = sec.querySelector('.eco-bar i');
  const count = sec.querySelector('.eco-count b');
  const N = slides.length;
  const pinnedMq = matchMedia('(min-height: 500px)');
  const pad = n => String(n).padStart(2, '0');
  let idx = -1;

  // Trava: cada produto segura a tela por um trecho da rolagem (HOLD)
  // antes de deslizar para o próximo (MOVE).
  const HOLD = 0.7, MOVE = 1, SEG = HOLD + MOVE;
  const UNITS = N * HOLD + (N - 1) * MOVE;
  const ease = t => t * t * (3 - 2 * t);
  function position(p) {             // progresso 0..1 → posição 0..N-1
    const u = p * UNITS, k = Math.floor(u / SEG), r = u - k * SEG;
    if (k >= N - 1) return N - 1;
    return r < HOLD ? k : k + ease((r - HOLD) / MOVE);
  }
  const progressFor = i => (i * SEG + HOLD / 2) / UNITS;   // meio da trava do produto i
  let pos = 0;

  const pinned = () => pinnedMq.matches;

  function setActive(i, progress) {
    if (bar) bar.style.transform = `scaleX(${progress})`;
    if (i === idx) return;
    idx = i;
    tabs.forEach((t, k) => { t.classList.toggle('is-active', k === i); t.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
    slides.forEach((s, k) => s.classList.toggle('is-current', k === i));
    if (count) count.textContent = pad(i + 1);
    // mantém a aba ativa visível quando a fileira de abas rola (celular)
    const tab = tabs[i];
    if (tab && tab.parentElement.scrollWidth > tab.parentElement.clientWidth) {
      tab.parentElement.scrollTo({ left: tab.offsetLeft - 16, behavior: 'smooth' });
    }
  }

  // Desktop: progresso da rolagem dentro da seção → deslocamento horizontal
  function onScroll() {
    if (!pinned()) return;
    const total = sec.offsetHeight - window.innerHeight;
    const p = total > 0 ? Math.min(1, Math.max(0, -sec.getBoundingClientRect().top / total)) : 0;
    pos = position(p);
    track.style.transform = `translate3d(${(-pos / N) * 100}%,0,0)`;
    setActive(Math.round(pos), (1 + pos) / N);
    scheduleSnap();
  }

  // Celular: slide mais próximo do centro do carrossel
  function onTrackScroll() {
    if (pinned()) return;
    const mid = track.scrollLeft + track.clientWidth / 2;
    let best = 0, bestD = Infinity;
    slides.forEach((s, k) => {
      const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - mid);
      if (d < bestD) { bestD = d; best = k; }
    });
    setActive(best, (best + 1) / N);
  }

  function goTo(i, smooth = true) {
    i = Math.max(0, Math.min(N - 1, i));
    const behavior = smooth ? 'smooth' : 'auto';
    if (pinned()) {
      const total = sec.offsetHeight - window.innerHeight;
      const top = sec.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + total * progressFor(i), behavior });
    } else {
      const r = sec.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.5 || r.bottom < window.innerHeight * 0.3) {
        window.scrollTo({ top: r.top + window.scrollY, behavior });
      }
      const padL = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      track.scrollTo({ left: slides[i].offsetLeft - padL, behavior });
    }
  }

  // Se a rolagem parar no meio de uma transição, completa até o produto mais próximo
  let snapTimer = 0;
  function scheduleSnap() {
    clearTimeout(snapTimer);
    snapTimer = setTimeout(() => {
      if (!pinned()) return;
      const r = sec.getBoundingClientRect();
      if (r.top > 0 || r.bottom < window.innerHeight) return;   // fora da área presa
      const frac = pos - Math.floor(pos);
      if (frac > 0.02 && frac < 0.98) goTo(Math.round(pos));
    }, 180);
  }

  // Celular: se o conteúdo de um produto for mais alto que a tela, encolhe
  // o bloco inteiro (escala) em vez de esconder partes dele.
  const smallMq = matchMedia('(max-width: 960px)');
  function fit() {
    slides.forEach(s => {
      const g = s.querySelector('.eco-grid');
      if (!g) return;
      g.style.setProperty('--fit', '1');
      if (!smallMq.matches || !pinned()) return;
      const cs = getComputedStyle(s);
      const avail = s.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - 12;
      const need = g.offsetHeight;
      if (need > avail && avail > 0) g.style.setProperty('--fit', Math.max(0.55, avail / need).toFixed(3));
    });
  }

  function reset() {
    fit();
    if (!pinned()) track.style.transform = '';
    idx = -1;
    pinned() ? onScroll() : onTrackScroll();
  }

  tabs.forEach(t => t.addEventListener('click', () => goTo(+t.dataset.go)));
  sec.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => goTo(Math.max(idx, 0) + +b.dataset.step)));

  // Links do menu e do rodapé (#radar, #lab...) vão para o produto certo
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const i = slides.findIndex(s => '#' + s.id === a.getAttribute('href'));
    if (i < 0) return;
    e.preventDefault();
    history.replaceState(null, '', a.getAttribute('href'));
    goTo(i);
  });

  // cálculo leve: roda direto no evento, sem depender de requestAnimationFrame
  window.addEventListener('scroll', onScroll, { passive: true });
  track.addEventListener('scroll', onTrackScroll, { passive: true });
  window.addEventListener('resize', reset);
  pinnedMq.addEventListener('change', reset);

  reset();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  window.addEventListener('load', fit);
  document.addEventListener('relevantia:lang', () => requestAnimationFrame(fit));
  // chegou por /#radar, /#the-edge (inclusive pelos redirects das páginas antigas)
  const fromHash = slides.findIndex(s => '#' + s.id === location.hash);
  if (fromHash >= 0) setTimeout(() => goTo(fromHash, false), 50);
  // Chat do Intelligence: alterna a pergunta e as sugestões, digitando
  const typed = sec.querySelector('[data-typed]');
  if (typed) {
    const ph = sec.querySelector('.ichat-ph');
    const sugs = [...sec.querySelectorAll('.ichat-sug [data-i18n]')];
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let k = 0;
    const show = (text, isPh) => { typed.textContent = text; typed.classList.toggle('is-ph', isPh); };
    show(ph.textContent, true);
    if (!reduce) {
      const next = () => {
        const text = sugs[k++ % sugs.length].textContent.trim();
        let i = 0;
        const tick = () => {
          show(text.slice(0, ++i), false);
          if (i < text.length) setTimeout(tick, 45);
          else setTimeout(() => { show(ph.textContent, true); setTimeout(next, 1400); }, 2200);
        };
        tick();
      };
      setTimeout(next, 1500);
    }
  }
})();
