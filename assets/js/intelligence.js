/* /intelligence — o chat do hero digita as sugestões, como na home (eco.js) */
(function () {
  const typed = document.querySelector('.in-chat [data-typed]');
  if (!typed) return;
  const ph = document.querySelector('.in-chat .ichat-ph').textContent;
  const sugs = [...document.querySelectorAll('.in-chat [data-sug]')].map(s => s.textContent.trim());
  const show = (text, isPh) => { typed.textContent = text; typed.classList.toggle('is-ph', isPh); };
  show(ph, true);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let k = 0;
  const next = () => {
    const text = sugs[k++ % sugs.length];
    let i = 0;
    const tick = () => {
      show(text.slice(0, ++i), false);
      if (i < text.length) setTimeout(tick, 45);
      else setTimeout(() => { show(ph, true); setTimeout(next, 1400); }, 2200);
    };
    tick();
  };
  setTimeout(next, 1500);
})();
