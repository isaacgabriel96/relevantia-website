/* ═══════════════════════════════════════════════
   Arco de luz do hero: a audiência (pontos) sobe pelas laterais
   do horizonte dourado até o topo, onde vira brilho. É a mesma
   ideia de "audiência virando negócio", no visual da referência.
   ═══════════════════════════════════════════════ */
(function () {
  const wrap = document.querySelector('[data-prodline]');
  if (!wrap) return;
  const cv = wrap.querySelector('canvas');
  const ctx = cv.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = 0, H = 0, cx = 0, apexY = 0, rx = 0, ry = 0;
  let dots = [], pulse = 0, running = false, last = 0, time = 0;
  let glow = null;   // brilho do horizonte pré-renderizado (blur é caro por quadro)
  const rnd = (a, b) => a + Math.random() * (b - a);

  // ponto do arco no ângulo th (0 = topo; ±π/2 = laterais)
  const arcPt = th => [cx + rx * Math.sin(th), apexY + ry * (1 - Math.cos(th))];

  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = wrap.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const mobile = W < 720;
    cx = W / 2;
    apexY = H * (mobile ? 0.3 : 0.32);
    rx = W * (mobile ? 1.05 : 0.72);
    ry = H * (mobile ? 0.9 : 1.05);
    glow = document.createElement('canvas');
    glow.width = cv.width; glow.height = cv.height;
    const gctx = glow.getContext('2d');
    gctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    gctx.lineCap = 'round';
    [[70, 'rgba(184,134,11,0.20)', 60], [18, 'rgba(232,201,106,0.32)', 24]].forEach(([w, c, b]) => {
      gctx.shadowColor = c; gctx.shadowBlur = b;
      strokeArc(gctx, w, c);
    });
    gctx.shadowBlur = 0;
    const n = mobile ? 150 : 300;
    while (dots.length < n) dots.push(newDot(true));
    dots.length = n;
  }

  function newDot(initial) {
    const side = Math.random() < 0.5 ? -1 : 1;
    return {
      th: side * (initial ? rnd(0.02, 1.25) : rnd(0.9, 1.3)),
      off: rnd(8, 120) * (Math.random() < 0.75 ? -1 : 1),   // distância do arco (negativo = acima)
      v: rnd(0.05, 0.12),
      s: rnd(0.7, 1.7),
      a: initial ? 1 : 0,
      tw: rnd(0, Math.PI * 2),
    };
  }

  function step(dt) {
    time += dt;
    for (const d of dots) {
      const k = Math.abs(d.th);
      // acelera e cola no arco perto do topo
      d.th -= Math.sign(d.th) * d.v * dt * (0.5 + (1.3 - k) * 0.9);
      d.off *= Math.pow(0.55, dt);
      d.a = Math.min(1, d.a + dt * 0.8);
      if (Math.abs(d.th) < 0.015) { Object.assign(d, newDot(false)); pulse = Math.min(1, pulse + 0.35); }
    }
    pulse = Math.max(0, pulse - dt * 1.4);
  }

  function strokeArc(c, width, color) {
    c.beginPath();
    for (let i = 0; i <= 120; i++) {
      const th = -Math.PI / 2 + (Math.PI * i) / 120;
      const [x, y] = arcPt(th);
      i ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.lineWidth = width; c.strokeStyle = color; c.stroke();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // brilho do horizonte: várias passadas largas e suaves + linha central
    const breathe = 0.85 + Math.sin(time * 0.8) * 0.15;
    ctx.save();
    ctx.globalAlpha = breathe;
    ctx.drawImage(glow, 0, 0, W, H);
    ctx.globalAlpha = 1;
    ctx.lineCap = 'round';
    const lg = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0);
    lg.addColorStop(0, 'rgba(232,201,106,0)');
    lg.addColorStop(0.5, 'rgba(255,244,210,0.95)');
    lg.addColorStop(1, 'rgba(232,201,106,0)');
    strokeArc(ctx, 1.6, lg);
    ctx.restore();

    // ponto de luz no topo, pulsando a cada pessoa que chega
    const gR = 90 + pulse * 50;
    const g = ctx.createRadialGradient(cx, apexY, 0, cx, apexY, gR);
    g.addColorStop(0, `rgba(255,244,210,${0.55 + pulse * 0.35})`);
    g.addColorStop(0.3, `rgba(232,201,106,${0.22 + pulse * 0.2})`);
    g.addColorStop(1, 'rgba(232,201,106,0)');
    ctx.fillStyle = g; ctx.fillRect(cx - gR, apexY - gR, gR * 2, gR * 2);

    // audiência
    for (const d of dots) {
      const [ax, ay] = arcPt(d.th);
      const x = ax, y = ay + d.off;
      if (y < -10 || y > H + 10 || x < -10 || x > W + 10) continue;
      const near = 1 - Math.min(1, Math.abs(d.th) / 1.2);
      const tw = 0.6 + 0.4 * Math.sin(time * 3 + d.tw);
      ctx.globalAlpha = d.a * (0.25 + near * 0.7) * tw;
      ctx.fillStyle = near > 0.55 ? '#F3DC95' : '#F5F0E8';
      const s = d.s * (1 + near * 0.6);
      ctx.fillRect(x - s / 2, y - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
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
  for (let i = 0; i < 200; i++) step(0.03);
  draw();

  new ResizeObserver(() => { size(); if (!running) draw(); }).observe(wrap);
  let visible = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => es.forEach(e => { visible = e.isIntersecting; visible ? start() : stop(); })).observe(wrap);
  } else start();
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : visible && start()));
})();
