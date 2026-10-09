/* /intelligence — animações da página
   1. Hero: a palavra do título (marketing → negócios → tecnologia) e o chat
      de demonstração trocam juntos; a pergunta é digitada e a resposta chega
      depois dos três pontinhos.
   2. Soluções: as abas passam sozinhas quando a seção está na tela; parar o
      mouse em cima pausa, clicar escolhe.
   3. Canais: o total da audiência conta até o número. */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(r => setTimeout(r, ms));

  /* ── 1. Hero ── */
  const CENAS = [
    { tag: 'Marketing', q: 'Como posiciono a minha marca para atrair patrocinadores?',
      a: ['Seu público é de corredores amadores de 25 a 40 anos: o território é a superação pessoal.', 'Junte os números dos canais e das provas num kit de mídia de uma página.', 'Quer que eu monte o rascunho do kit?'] },
    { tag: 'Negócios', q: 'Quanto vale uma cota do meu evento?',
      a: ['Pelo seu inventário: arena, camisas e transmissão das finais.', 'A cota principal fica entre R$ 40 mil e R$ 60 mil por temporada.', 'O agente de cotas monta a tabela completa.'] },
    { tag: 'Tecnologia', q: 'O que dá para automatizar com IA no meu negócio?',
      a: ['Prospecção: o agente encontra marcas com fit com o seu público.', 'Propostas: geradas a partir do seu inventário.', 'Relatório dos canais: todo mês, sem planilha.'] },
  ];
  const words = [...document.querySelectorAll('[data-rot]')];
  const typed = document.querySelector('[data-demo-typed]');
  const ans = document.querySelector('[data-demo-a]');
  const list = document.querySelector('[data-demo-list]');
  const tag = document.querySelector('[data-demo-tag]');

  function trocaPalavra(i) {
    words.forEach((w, k) => {
      const era = w.classList.contains('is-on');
      w.classList.toggle('is-on', k === i);
      w.classList.toggle('is-out', era && k !== i);
    });
  }

  function mostraCena(c) {
    typed.textContent = c.q;
    tag.textContent = c.tag;
    list.innerHTML = c.a.map(t => `<li class="show">${t}</li>`).join('');
    ans.classList.add('show');
  }

  async function loopHero() {
    if (!typed) return;
    if (reduce) { mostraCena(CENAS[0]); return; }
    await wait(900);
    for (let i = 0; ; i = (i + 1) % CENAS.length) {
      const c = CENAS[i];
      trocaPalavra(i);
      tag.style.opacity = 0;
      await wait(250);
      tag.textContent = c.tag;
      tag.style.opacity = 1;
      ans.classList.remove('show', 'pensando');
      list.innerHTML = '';
      typed.textContent = '';
      for (let k = 1; k <= c.q.length; k++) { typed.textContent = c.q.slice(0, k); await wait(32); }
      await wait(350);
      ans.classList.add('show', 'pensando');
      await wait(1100);
      ans.classList.remove('pensando');
      for (const t of c.a) {
        const li = document.createElement('li');
        li.textContent = t;
        list.appendChild(li);
        requestAnimationFrame(() => li.classList.add('show'));
        await wait(650);
      }
      await wait(3600);
    }
  }
  loopHero();

  /* ── 2. Soluções ── */
  const sol = document.querySelector('[data-sol]');
  if (sol) {
    const tabs = [...sol.querySelectorAll('[data-sol-tab]')];
    const panels = [...sol.querySelectorAll('[data-sol-panel]')];
    const TEMPO = 7000;
    sol.style.setProperty('--sol-t', TEMPO + 'ms');
    let atual = 0, timer = null, visivel = false, pausado = false;

    const ir = (i) => {
      atual = (i + tabs.length) % tabs.length;
      tabs.forEach((t, k) => { t.classList.toggle('is-on', k === atual); t.setAttribute('aria-selected', k === atual); });
      panels.forEach((p, k) => { p.hidden = k !== atual; p.classList.toggle('is-on', k === atual); });
      // a barra de progresso recomeça
      const bar = tabs[atual].querySelector('.in-sol-bar');
      bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = '';
      if (panels[atual].querySelector('[data-count]')) conta(panels[atual].querySelector('[data-count]'));
      agenda();
    };
    const agenda = () => {
      clearTimeout(timer);
      const tocando = visivel && !pausado && !reduce;
      sol.classList.toggle('playing', tocando);
      if (tocando) timer = setTimeout(() => ir(atual + 1), TEMPO);
    };
    tabs.forEach((t, k) => t.addEventListener('click', () => { ir(k); tabs[k].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' }); }));
    sol.addEventListener('mouseenter', () => { pausado = true; agenda(); });
    sol.addEventListener('mouseleave', () => { pausado = false; agenda(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => es.forEach(e => {
        const antes = visivel;
        visivel = e.isIntersecting;
        if (visivel && !antes) ir(atual); else agenda();
      }), { threshold: 0.35 }).observe(sol);
    }
  }

  /* ── 3. Contador ── */
  function conta(el) {
    const alvo = Number(el.dataset.count);
    const fmt = n => n.toLocaleString('pt-BR');
    if (reduce) { el.textContent = fmt(alvo); return; }
    const t0 = performance.now(), dur = 1400;
    const passo = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = fmt(Math.round(alvo * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  }
})();
