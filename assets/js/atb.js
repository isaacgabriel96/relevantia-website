/* Audience to Business no ecossistema: escada dos cinco níveis.
   Quando a escada aparece (ao rolar), as barras sobem, um círculo vermelho marca a audiência
   (onde a maioria trava) e uma seta tracejada vai até o negócio. Roda uma vez só. */
(() => {
  const box = document.querySelector('.atb-steps');
  if (!box) return;
  const items = [...box.querySelectorAll('.atb-ol li')];
  const circle = box.querySelector('.atb-circle'), arrow = box.querySelector('.atb-arrow'), reveal = box.querySelector('.atb-reveal');

  // o conteúdo pode estar com scale() no celular: converte de pixels da tela para o espaço do SVG
  const draw = () => {
    const o = box.getBoundingClientRect(), k = o.width / (box.offsetWidth || 1) || 1;
    const r = el => { const b = el.getBoundingClientRect(); return { x: (b.left - o.left) / k, y: (b.top - o.top) / k, w: b.width / k, h: b.height / k }; };
    const lbl = r(items[1].querySelector('.atb-lbl')), b2 = r(items[1].querySelector('.atb-bar')), b5 = r(items[4].querySelector('.atb-bar'));
    const top = lbl.y, bottom = b2.y + Math.min(b2.h, 26);
    const cx = lbl.x + lbl.w / 2, cy = (top + bottom) / 2, rx = lbl.w / 2 + 14, ry = (bottom - top) / 2 + 12;
    circle.setAttribute('d', `M ${cx + rx * .15} ${cy - ry} A ${rx} ${ry} -4 1 1 ${cx - rx * .1} ${cy - ry * 1.02} L ${cx + rx * .3} ${cy - ry * .94}`);
    const x0 = b2.x + b2.w / 2, y0 = b2.y + Math.min(30, b2.h * .5), x1 = b5.x + b5.w / 2, y1 = b5.y + 24;
    const d = `M ${x0} ${y0} C ${x0 + (x1 - x0) * .55} ${y0 + 4} ${x1 - (x1 - x0) * .3} ${y1 + (y0 - y1) * .35} ${x1} ${y1}`;
    arrow.setAttribute('d', d); reveal.setAttribute('d', d);
  };

  box.addEventListener('transitionend', draw);
  addEventListener('resize', draw);
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    box.classList.add('in');
    draw();
    setTimeout(() => { draw(); box.classList.add('fx'); }, 750);
    io.disconnect();
  }), { threshold: .55 });
  io.observe(box);
  draw();
})();
