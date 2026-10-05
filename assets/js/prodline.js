/* ═══════════════════════════════════════════════
   Onda de luz do hero (inspiração: horizonte suave, em dourado).
   Uma curva larga cruza a tela, com a luz "escorrendo" para
   baixo e um brilho difuso; ela respira e ondula devagar.
   Pontos discretos (a audiência) deslizam ao longo da linha.
   ═══════════════════════════════════════════════ */
(function () {
  const wrap = document.querySelector('[data-prodline]');
  if (!wrap) return;
  const cv = wrap.querySelector('canvas');
  const ctx = cv.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = 0, H = 0, dpr = 1, time = 0, running = false, last = 0;
  let dots = [];
  const rnd = (a, b) => a + Math.random() * (b - a);

  // altura da onda em x (0..W): um morro largo, mais alto no centro
  function waveY(x, t) {
    const u = x / W;
    const drift = Math.sin(t * 0.25) * 0.04;                 // o pico passeia um pouco
    const narrow = W < 720;
    const bump = Math.exp(-Math.pow((u - 0.5 - drift) / (narrow ? 0.55 : 0.34), 2));
    const ripple = Math.sin(u * Math.PI * 2 + t * 0.4) * 0.012;
    const base = H * (narrow ? 0.5 : 0.62), amp = H * ((narrow ? 0.26 : 0.42) + Math.sin(t * 0.3) * 0.02);
    return base - amp * bump + H * ripple;
  }

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = wrap.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = W < 720 ? 40 : 90;
    while (dots.length < n) dots.push({ x: rnd(0, 1), v: rnd(0.008, 0.025) * (Math.random() < 0.5 ? -1 : 1), off: rnd(-6, 26), s: rnd(0.8, 1.8), ph: rnd(0, 6.28) });
    dots.length = n;
  }

  function linePath(t, dy = 0) {
    ctx.beginPath();
    for (let x = -20; x <= W + 20; x += 8) {
      const y = waveY(x, t) + dy;
      x === -20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const t = time;
    const peakY = waveY(W / 2, t);

    // névoa larga atrás do pico
    const fog = ctx.createRadialGradient(W / 2, peakY + H * 0.1, 0, W / 2, peakY + H * 0.1, Math.max(W, H) * 0.6);
    fog.addColorStop(0, 'rgba(200,168,75,0.20)');
    fog.addColorStop(0.5, 'rgba(184,134,11,0.07)');
    fog.addColorStop(1, 'rgba(184,134,11,0)');
    ctx.fillStyle = fog; ctx.fillRect(0, 0, W, H);

    // luz que escorre para baixo da linha
    ctx.save();
    linePath(t);
    ctx.lineTo(W + 20, H); ctx.lineTo(-20, H); ctx.closePath();
    ctx.clip();
    const spill = ctx.createLinearGradient(0, peakY, 0, peakY + H * 0.55);
    spill.addColorStop(0, 'rgba(232,201,106,0.22)');
    spill.addColorStop(0.35, 'rgba(184,134,11,0.08)');
    spill.addColorStop(1, 'rgba(184,134,11,0)');
    ctx.fillStyle = spill; ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // a linha: halo largo, halo médio e um fio claro
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const fade = ctx.createLinearGradient(0, 0, W, 0);
    fade.addColorStop(0, 'rgba(232,201,106,0.15)');
    fade.addColorStop(0.5, 'rgba(255,240,200,1)');
    fade.addColorStop(1, 'rgba(232,201,106,0.15)');
    [[30, 0.08, 0], [10, 0.25, 16], [2.2, 0.95, 0]].forEach(([w, a, blur]) => {
      ctx.globalAlpha = a;
      ctx.shadowColor = 'rgba(232,201,106,0.9)'; ctx.shadowBlur = blur;
      linePath(t);
      ctx.lineWidth = w; ctx.strokeStyle = fade; ctx.stroke();
    });
    ctx.restore();

    // audiência: pontos discretos deslizando pela linha
    for (const d of dots) {
      const x = d.x * W, y = waveY(x, t) + d.off;
      const center = 1 - Math.min(1, Math.abs(d.x - 0.5) * 2);
      ctx.globalAlpha = (0.15 + center * 0.6) * (0.6 + 0.4 * Math.sin(t * 2 + d.ph));
      ctx.fillStyle = '#F3DC95';
      ctx.fillRect(x - d.s / 2, y - d.s / 2, d.s, d.s);
    }
    ctx.globalAlpha = 1;
  }

  function step(dt) {
    time += dt;
    for (const d of dots) {
      d.x += d.v * dt;
      d.off *= Math.pow(0.85, dt);
      if (d.x < -0.02 || d.x > 1.02) { d.x = d.v > 0 ? -0.02 : 1.02; d.off = rnd(-6, 26); }
    }
  }

  // Um único ciclo de animação por vez: pausar cancela o quadro agendado.
  // (Antes, pausar e voltar no mesmo quadro deixava o ciclo antigo vivo;
  // os ciclos se somavam e a onda acelerava com o tempo.)
  let rafId = 0;
  function frame(t) {
    const dt = Math.min(0.05, Math.max(0, (t - last) / 1000));
    last = t;
    step(dt); draw();
    rafId = requestAnimationFrame(frame);
  }
  function start() {
    if (running || reduce) return;
    running = true;
    last = performance.now();
    rafId = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
  }

  size(); draw();
  new ResizeObserver(() => { size(); if (!running) draw(); }).observe(wrap);
  let visible = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => es.forEach(e => { visible = e.isIntersecting; visible ? start() : stop(); })).observe(wrap);
  } else start();
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : visible && start()));
})();
