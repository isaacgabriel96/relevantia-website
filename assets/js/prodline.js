/* ═══════════════════════════════════════════════
   Linha de produção do hero: milhões de pessoas (audiência)
   entram na esteira, passam pelas 3 estações do ecossistema
   e saem como negócio (contratos) do outro lado.
   ═══════════════════════════════════════════════ */
(function () {
  const wrap = document.querySelector('[data-prodline]');
  if (!wrap) return;
  const cv = wrap.querySelector('canvas');
  const ctx = cv.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Posições em fração da largura (casam com os rótulos .prod-station no HTML)
  const BELT_IN = 0.30, BELT_OUT = 0.80;
  const STATIONS = [0.42, 0.555, 0.69];
  const GOLD = '#C8A84B', GOLD_BRIGHT = '#E8C96A';

  let W = 0, H = 0, beltY = 0, mobile = false;
  let crowd = [], belt = [], deals = [], flashes = [0, 0, 0];
  let dash = 0, running = false, last = 0, spawnAcc = 0, dealAcc = 0;

  const rnd = (a, b) => a + Math.random() * (b - a);

  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = wrap.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    mobile = W < 720;
    beltY = H * 0.54;
    const target = mobile ? 220 : 520;
    while (crowd.length < target) crowd.push(newPerson(true));
    crowd.length = target;
  }

  // Pessoa na multidão: anda à toa na nuvem da esquerda
  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
  function newPerson(initial) {
    return {
      x: (0.145 + gauss() * 0.12) * W, y: (0.63 + gauss() * 0.27) * H,
      vx: rnd(-6, 6), vy: rnd(-6, 6),
      r: rnd(1, 1.9), a: initial ? rnd(0.25, 0.85) : 0,
      ta: rnd(0.25, 0.85),
    };
  }

  // Tira uma pessoa da multidão e manda para a entrada da esteira
  function recruit() {
    const i = Math.floor(Math.random() * crowd.length);
    const p = crowd[i];
    crowd[i] = newPerson(false);
    belt.push({ x: p.x, y: p.y, sx: p.x, sy: p.y, t: 0, phase: 'funnel', stage: 0, alpha: p.a, gone: false });
  }

  function step(dt) {
    dash = (dash + dt * 40) % 20;
    const speed = W * (mobile ? 0.11 : 0.085);

    for (const p of crowd) {
      p.vx += rnd(-12, 12) * dt; p.vy += rnd(-12, 12) * dt;
      // puxão suave para o centro da nuvem
      p.vx += (0.145 * W - p.x) * 0.02 * dt; p.vy += (0.63 * H - p.y) * 0.03 * dt;
      p.vx *= 0.98; p.vy *= 0.98;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.a += (p.ta - p.a) * dt * 1.5;
    }

    spawnAcc += dt * (mobile ? 9 : 16);
    while (spawnAcc >= 1) { recruit(); spawnAcc--; }

    for (const b of belt) {
      if (b.phase === 'funnel') {
        b.t += dt * 1.1;
        const k = Math.min(1, b.t), e = k * k * (3 - 2 * k);
        const ex = BELT_IN * W, ey = beltY;
        const cx = (b.sx + ex) / 2, cy = b.sy < beltY ? beltY - H * 0.05 : beltY + H * 0.05;
        b.x = (1 - e) * (1 - e) * b.sx + 2 * (1 - e) * e * cx + e * e * ex;
        b.y = (1 - e) * (1 - e) * b.sy + 2 * (1 - e) * e * cy + e * e * ey;
        b.alpha += (0.95 - b.alpha) * dt * 3;
        if (k >= 1) { b.phase = 'belt'; b.y = beltY + rnd(-3, 3); }
        continue;
      }
      b.x += speed * dt;
      // Cruzou uma estação: muda de forma e só parte segue adiante (filtro)
      for (let s = 0; s < 3; s++) {
        if (b.stage === s && b.x >= STATIONS[s] * W) {
          b.stage = s + 1;
          flashes[s] = 1;
          if (s === 1 && Math.random() < 0.55) b.dying = true;
          if (s === 2) {
            dealAcc += 1;
            if (dealAcc >= (mobile ? 2 : 3)) { dealAcc = 0; b.card = true; } else b.dying = true;
          }
        }
      }
      if (b.dying) { b.alpha -= dt * 3.2; if (b.alpha <= 0) b.gone = true; }
      if (b.x > BELT_OUT * W) { if (b.card) spawnDeal(b.x, b.y); b.gone = true; }
    }
    belt = belt.filter(b => !b.gone);

    for (const d of deals) {
      d.t += dt;
      const k = Math.min(1, d.t / 0.9), e = 1 - Math.pow(1 - k, 3);
      d.x = d.sx + (d.tx - d.sx) * e;
      d.y = d.sy + (d.ty - d.sy) * e - Math.sin(k * Math.PI) * H * 0.12;
      d.a = d.old ? d.a - dt * 2 : Math.min(1, d.a + dt * 4);
    }
    deals = deals.filter(d => !d.old || d.a > 0);
    for (let s = 0; s < 3; s++) flashes[s] = Math.max(0, flashes[s] - dt * 2.2);
  }

  // Negócio fechado: um card dourado voa para a pilha da direita
  let dealCount = 0;
  function spawnDeal(x, y) {
    const cols = mobile ? 2 : 3, rows = mobile ? 6 : 6;
    const cw = mobile ? 22 : 34, ch = mobile ? 14 : 20, gap = mobile ? 5 : 7;
    // empilha de baixo para cima; com a pilha cheia, recomeça trocando os mais antigos
    const slot = dealCount++ % (cols * rows);
    const col = slot % cols, row = Math.floor(slot / cols);
    const x0 = W * 0.97 - cols * (cw + gap) + gap;
    const ty = H * 0.9 - (row + 1) * (ch + gap);
    deals.forEach(d => { if (d.slot === slot) d.old = true; });
    deals.push({ slot, sx: x, sy: y, x, y, tx: x0 + col * (cw + gap), ty, w: cw, h: ch, t: 0, a: 0 });
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // multidão
    for (const p of crowd) {
      ctx.globalAlpha = p.a;
      ctx.fillStyle = '#F5F0E8';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // esteira
    const bx0 = BELT_IN * W, bx1 = BELT_OUT * W;
    const grad = ctx.createLinearGradient(bx0, 0, bx1, 0);
    grad.addColorStop(0, 'rgba(184,134,11,0.10)');
    grad.addColorStop(1, 'rgba(232,201,106,0.35)');
    ctx.fillStyle = grad;
    roundRect(bx0, beltY - 9, bx1 - bx0, 18, 9); ctx.fill();
    ctx.save();
    ctx.strokeStyle = 'rgba(232,201,106,0.35)';
    ctx.setLineDash([6, 14]); ctx.lineDashOffset = -dash; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(bx0 + 8, beltY); ctx.lineTo(bx1 - 8, beltY); ctx.stroke();
    ctx.restore();

    // estações (portais)
    const gh = mobile ? 70 : 92, gw = mobile ? 26 : 34;
    STATIONS.forEach((s, i) => {
      const x = s * W, f = flashes[i];
      if (f > 0) {
        const g = ctx.createRadialGradient(x, beltY, 0, x, beltY, gh);
        g.addColorStop(0, `rgba(232,201,106,${0.28 * f})`); g.addColorStop(1, 'rgba(232,201,106,0)');
        ctx.fillStyle = g; ctx.fillRect(x - gh, beltY - gh, gh * 2, gh * 2);
      }
      ctx.fillStyle = 'rgba(20,15,4,0.85)';
      roundRect(x - gw / 2, beltY - gh / 2, gw, gh, 10); ctx.fill();
      ctx.strokeStyle = `rgba(200,168,75,${0.45 + 0.5 * f})`; ctx.lineWidth = 1.4;
      roundRect(x - gw / 2, beltY - gh / 2, gw, gh, 10); ctx.stroke();
      ctx.fillStyle = `rgba(232,201,106,${0.5 + 0.5 * f})`;
      ctx.fillRect(x - 5, beltY - gh / 2 + 9, 10, 2);
    });

    // itens na esteira: ponto → ponto dourado → quadrado → (some ao virar negócio)
    for (const b of belt) {
      ctx.globalAlpha = Math.max(0, Math.min(1, b.alpha));
      if (b.stage === 0) {
        ctx.fillStyle = '#F5F0E8';
        ctx.beginPath(); ctx.arc(b.x, b.y, 1.8, 0, Math.PI * 2); ctx.fill();
      } else if (b.stage === 1) {
        ctx.fillStyle = GOLD;
        ctx.beginPath(); ctx.arc(b.x, b.y, 2.6, 0, Math.PI * 2); ctx.fill();
      } else if (b.stage === 2 || !b.card) {
        ctx.fillStyle = GOLD_BRIGHT;
        ctx.fillRect(b.x - 3.5, b.y - 3.5, 7, 7);
      } else {
        const g = ctx.createLinearGradient(b.x - 9, b.y - 6, b.x + 9, b.y + 6);
        g.addColorStop(0, '#B8860B'); g.addColorStop(1, '#E8C96A');
        ctx.fillStyle = g; roundRect(b.x - 9, b.y - 6, 18, 12, 3); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // negócios
    for (const d of deals) {
      ctx.globalAlpha = Math.max(0, d.a);
      const g = ctx.createLinearGradient(d.x, d.y, d.x + d.w, d.y + d.h);
      g.addColorStop(0, '#B8860B'); g.addColorStop(1, '#E8C96A');
      ctx.fillStyle = g;
      roundRect(d.x, d.y, d.w, d.h, 4); ctx.fill();
      ctx.fillStyle = 'rgba(10,8,0,0.55)';
      ctx.fillRect(d.x + 5, d.y + d.h * 0.35, d.w * 0.5, 2);
      ctx.fillRect(d.x + 5, d.y + d.h * 0.6, d.w * 0.32, 2);
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
  if (reduce) {
    // Sem movimento: simula alguns segundos e desenha um quadro parado
    for (let i = 0; i < 900; i++) step(0.02);
    draw();
  } else {
    for (let i = 0; i < 700; i++) step(0.02);
  }
  new ResizeObserver(() => { size(); if (!running) draw(); }).observe(wrap);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => es.forEach(e => (e.isIntersecting ? start() : stop()))).observe(wrap);
  } else start();
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
})();
