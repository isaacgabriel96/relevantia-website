/* ═══════════════════════════════════════════════
   Animação do hero: a audiência (centenas de pontos) gira em
   espiral até o núcleo da Relevantia; cada lote absorvido vira
   um bloco dourado que empilha nas barras de negócio embaixo.
   ═══════════════════════════════════════════════ */
(function () {
  const wrap = document.querySelector('[data-prodline]');
  if (!wrap) return;
  const cv = wrap.querySelector('canvas');
  const ctx = cv.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const BARS = 7;
  const TARGET = [0.28, 0.38, 0.46, 0.58, 0.68, 0.84, 1];   // curva de crescimento
  let W = 0, H = 0, cx = 0, cy = 0, R = 0, coreR = 0;
  let people = [], blocks = [], bars = [], pulse = 0, absorbed = 0, barsFade = 1;
  let running = false, last = 0;

  const rnd = (a, b) => a + Math.random() * (b - a);
  const lerp = (a, b, t) => a + (b - a) * t;

  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = wrap.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = W / 2; cy = H * 0.4;
    R = Math.min(W * 0.5, H * 0.42);
    coreR = Math.max(16, R * 0.11);
    const n = W < 480 ? 360 : 640;
    while (people.length < n) people.push(newPerson(true));
    people.length = n;
    if (!bars.length) resetBars();
  }

  function newPerson(initial) {
    return {
      a: rnd(0, Math.PI * 2),
      r: initial ? rnd(0.18, 1.15) : rnd(0.95, 1.2),
      decay: rnd(0.035, 0.09),       // velocidade com que cai para o centro
      spin: rnd(0.18, 0.32),
      s: rnd(0.8, 1.8),
      alpha: initial ? 1 : 0,
    };
  }

  function resetBars() { bars = TARGET.map(() => 0); barsFade = 1; }

  function barGeom(i) {
    const bw = Math.min(28, W * 0.055), gap = bw * 0.55;
    const total = BARS * bw + (BARS - 1) * gap;
    const x = cx - total / 2 + i * (bw + gap);
    const base = H * 0.95, maxH = H * 0.2;
    return { x, bw, base, maxH };
  }

  function emit() {
    // próxima barra que ainda não chegou na meta
    const i = bars.findIndex((h, k) => h < TARGET[k] - 0.001);
    if (i < 0) return;
    const g = barGeom(i);
    blocks.push({ i, x: cx, y: cy, tx: g.x + g.bw / 2, ty: g.base - bars[i] * g.maxH, t: 0 });
  }

  function step(dt) {
    for (const p of people) {
      // quanto mais perto do núcleo, mais rápido gira e mais rápido cai
      const k = 1 / Math.max(0.12, p.r);
      p.a += p.spin * k * dt * 0.6;
      p.r -= p.decay * dt * (0.6 + k * 0.25);
      p.alpha = Math.min(1, p.alpha + dt * 1.5);
      if (p.r * R < coreR * 0.9) {
        Object.assign(p, newPerson(false));
        pulse = 1;
        if (++absorbed % 9 === 0) emit();
      }
    }
    for (const b of blocks) {
      b.t += dt / 0.9;
      if (b.t >= 1 && !b.done) {
        b.done = true;
        bars[b.i] = Math.min(TARGET[b.i], bars[b.i] + 0.07);
      }
    }
    blocks = blocks.filter(b => !b.done);
    pulse = Math.max(0, pulse - dt * 2.5);

    // gráfico completo: segura um instante, apaga e recomeça
    if (bars.every((h, k) => h >= TARGET[k] - 0.001)) {
      barsFade -= dt * 0.35;
      if (barsFade <= 0) resetBars();
    }
  }

  function roundRect(x, y, w, h, r) {
    r = Math.min(r, h / 2, w / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // anéis guia
    ctx.lineWidth = 1;
    [0.35, 0.65, 0.95].forEach((f, i) => {
      ctx.strokeStyle = `rgba(200,168,75,${0.06 + i * 0.02})`;
      ctx.beginPath(); ctx.arc(cx, cy, R * f, 0, Math.PI * 2); ctx.stroke();
    });

    // audiência: branco longe, dourado perto do núcleo
    for (const p of people) {
      const t = Math.max(0, Math.min(1, 1 - (p.r - 0.12) / 0.8));
      const x = cx + Math.cos(p.a) * p.r * R;
      const y = cy + Math.sin(p.a) * p.r * R * 0.92;
      const c0 = [245, 240, 232], c1 = [232, 201, 106];
      ctx.fillStyle = `rgb(${lerp(c0[0], c1[0], t) | 0},${lerp(c0[1], c1[1], t) | 0},${lerp(c0[2], c1[2], t) | 0})`;
      ctx.globalAlpha = p.alpha * (p.r > 1 ? Math.max(0, 1.2 - p.r) * 5 : lerp(0.35, 0.95, t));
      const s = p.s * lerp(1, 1.4, t);
      ctx.fillRect(x - s / 2, y - s / 2, s, s);
    }
    ctx.globalAlpha = 1;

    // núcleo: brilho + os três quadrados da marca
    const glowR = coreR * (2.6 + pulse * 0.8);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
    g.addColorStop(0, `rgba(232,201,106,${0.45 + pulse * 0.25})`);
    g.addColorStop(1, 'rgba(232,201,106,0)');
    ctx.fillStyle = g; ctx.fillRect(cx - glowR, cy - glowR, glowR * 2, glowR * 2);
    ctx.fillStyle = '#0E0A02';
    roundRect(cx - coreR, cy - coreR, coreR * 2, coreR * 2, coreR * 0.45); ctx.fill();
    ctx.strokeStyle = 'rgba(232,201,106,0.6)'; ctx.lineWidth = 1.2;
    roundRect(cx - coreR, cy - coreR, coreR * 2, coreR * 2, coreR * 0.45); ctx.stroke();
    const q = coreR * 0.42;
    const grad = ctx.createLinearGradient(cx - q, cy - q, cx + q, cy + q);
    grad.addColorStop(0, '#B8860B'); grad.addColorStop(1, '#E8C96A');
    ctx.fillStyle = grad;
    ctx.fillRect(cx - q * 1.05, cy + q * 0.05, q, q);
    ctx.fillRect(cx + q * 0.05, cy + q * 0.05, q, q);
    ctx.fillRect(cx + q * 0.05, cy - q * 1.05, q, q);

    // barras de negócio
    ctx.globalAlpha = Math.max(0, barsFade);
    for (let i = 0; i < BARS; i++) {
      const b = barGeom(i);
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      roundRect(b.x, b.base - b.maxH * TARGET[i], b.bw, b.maxH * TARGET[i], 4); ctx.fill();
      const h = bars[i] * b.maxH;
      if (h > 0.5) {
        const gb = ctx.createLinearGradient(0, b.base - h, 0, b.base);
        gb.addColorStop(0, '#E8C96A'); gb.addColorStop(1, '#8B6508');
        ctx.fillStyle = gb;
        roundRect(b.x, b.base - h, b.bw, h, 4); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // blocos voando do núcleo para as barras
    for (const b of blocks) {
      const e = b.t * b.t * (3 - 2 * b.t);
      const x = lerp(b.x, b.tx, e), y = lerp(b.y, b.ty, e) - Math.sin(b.t * Math.PI) * H * 0.04;
      const s = 7;
      ctx.fillStyle = '#E8C96A';
      ctx.shadowColor = 'rgba(232,201,106,0.8)'; ctx.shadowBlur = 10;
      ctx.fillRect(x - s / 2, y - s / 2, s, s);
      ctx.shadowBlur = 0;
    }
  }

  function frame(t) {
    if (!running) return;
    const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
    last = t;
    step(dt); draw();
    requestAnimationFrame(frame);
  }
  function start() { if (running || reduce) return; running = true; last = performance.now(); requestAnimationFrame(frame); }
  function stop() { running = false; }

  size();
  // começa com o gráfico pela metade, como se já estivesse rodando
  for (let i = 0; i < 260; i++) step(0.03);
  draw();

  new ResizeObserver(() => { size(); if (!running) draw(); }).observe(wrap);
  let visible = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => es.forEach(e => { visible = e.isIntersecting; visible ? start() : stop(); })).observe(wrap);
  } else start();
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : visible && start()));
})();
