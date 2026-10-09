/* /intelligence — animações da página
   1. Hero: a palavra do título troca sozinha (marketing → negócios →
      tecnologia) e, ao lado, o Raio X das 6 dimensões mostra resultados que
      o Intelligence entrega, um cartão de cada vez.
   2. As 6 dimensões e Soluções: abas que passam sozinhas quando a seção
      está na tela; parar o mouse em cima pausa, clicar escolhe.
   3. Converse: o chat digita a pergunta e a resposta chega depois dos três
      pontinhos (só roda com a seção na tela).
   Com "reduzir movimento" ligado, tudo fica parado no primeiro estado. */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // Roda quando o elemento aparece na tela e para quando sai
  function naTela(el, aoMudar) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { aoMudar(true); return; }
    new IntersectionObserver(es => es.forEach(e => aoMudar(e.isIntersecting)), { threshold: 0.3 }).observe(el);
  }

  /* ── 1a. Palavra do título ── */
  const words = [...document.querySelectorAll('[data-rot]')];
  if (words.length && !reduce) {
    let w = 0;
    setInterval(() => {
      words[w].classList.remove('is-on'); words[w].classList.add('is-out');
      const saiu = words[w];
      w = (w + 1) % words.length;
      words[w].classList.remove('is-out'); words[w].classList.add('is-on');
      setTimeout(() => saiu.classList.remove('is-out'), 700);
    }, 1700);
  }

  /* ── 1b. Raio X com resultados ── */
  const RESULTADOS = [
    { d: 'core', dim: 'Core', t: 'Prioridade do trimestre', p: 'Organizar a governança entre os sócios' },
    { d: 'audience', dim: 'Audience', t: 'Público mapeado', p: 'Corredores amadores, de 25 a 40 anos' },
    { d: 'partnerships', dim: 'Partnerships', t: 'Cota precificada', p: 'Cota master por temporada' },
    { d: 'beyond', dim: 'Beyond', t: 'Novo negócio sugerido', p: 'Assinatura anual para a comunidade' },
    { d: 'brand', dim: 'Brand', t: 'Posicionamento definido', p: 'Território: superação pessoal' },
    { d: 'business', dim: 'Business', t: 'Nova unidade de negócio', p: 'Eventos corporativos, com margem maior' },
    { d: 'partnerships', dim: 'Agente de prospecção', t: '12 marcas com fit', p: 'Prontas para a primeira abordagem' },
    { d: 'business', dim: 'Agente de proposta', t: 'Proposta gerada', p: '8 páginas, pronta para enviar' },
  ];
  const cap = document.querySelector('.in-cap');
  if (cap) {
    const slots = [...cap.querySelectorAll('.in-cap-card')];
    const radar = cap.querySelector('.in-cap-radar');
    const marca = (d) => {
      radar.querySelectorAll('.v, text').forEach(el => el.classList.toggle('on', (el.dataset.v || el.dataset.l) === d));
    };
    const pinta = (slot, r) => {
      slot.style.setProperty('--c', `var(--dim-${r.d})`);
      slot.innerHTML = `<div class="hd"><i></i>${esc(r.dim)}<span class="ok">✓ feito</span></div><b>${esc(r.t)}</b><p>${esc(r.p)}</p><span class="pb"></span>`;
    };
    if (reduce) {
      slots.forEach((s, i) => { pinta(s, RESULTADOS[i]); s.classList.add('show', 'done'); });
      if (radar.pauseAnimations) radar.pauseAnimations();
    } else {
      let k = 0, n = 0, ativo = false, rodando = false;
      const ciclo = async () => {
        if (rodando) return;
        rodando = true;
        while (ativo) {
          const slot = slots[n % slots.length];
          slot.classList.remove('show', 'done');
          await wait(450);
          const r = RESULTADOS[k % RESULTADOS.length];
          pinta(slot, r);
          marca(r.d);
          requestAnimationFrame(() => slot.classList.add('show'));
          await wait(1250);
          slot.classList.add('done');
          await wait(500);
          k++; n++;
        }
        rodando = false;
      };
      naTela(cap, v => { ativo = v; if (v) ciclo(); });
    }
  }

  /* ── 2. Abas que passam sozinhas ── */
  function autoplay(root, { tabs, aoIr, tempo, varTempo }) {
    root.style.setProperty(varTempo, tempo + 'ms');
    let atual = 0, timer = null, visivel = false, pausado = false;
    const agenda = () => {
      clearTimeout(timer);
      const tocando = visivel && !pausado && !reduce;
      root.classList.toggle('playing', tocando);
      if (tocando) timer = setTimeout(() => ir(atual + 1), tempo);
    };
    const ir = (i) => {
      atual = (i + tabs.length) % tabs.length;
      tabs.forEach((t, k) => { t.classList.toggle('is-on', k === atual); t.setAttribute('aria-selected', k === atual); });
      // No celular a lista rola de lado: a aba ativa fica à vista (sem mexer na página)
      const lista = tabs[atual].parentElement;
      if (lista.scrollWidth > lista.clientWidth) lista.scrollTo({ left: tabs[atual].offsetLeft - lista.offsetLeft - 16, behavior: reduce ? 'auto' : 'smooth' });
      const bar = tabs[atual].querySelector('em');
      if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
      aoIr(atual);
      agenda();
    };
    tabs.forEach((t, k) => t.addEventListener('click', () => ir(k)));
    root.addEventListener('mouseenter', () => { pausado = true; agenda(); });
    root.addEventListener('mouseleave', () => { pausado = false; agenda(); });
    ir(0);
    naTela(root, v => { const antes = visivel; visivel = v; if (v && !antes) ir(atual); else agenda(); });
  }

  // As 6 dimensões
  const DIMS = [
    { d: 'core', nome: 'Core', titulo: 'Essência e governança',
      desc: 'O coração da empresa: por que ela existe, como decide e como as unidades de negócio se organizam. É o que sustenta todas as outras dimensões.',
      chips: ['Propósito e valores', 'Governança e sócios', 'Unidades de negócio', 'Maturidade da gestão'],
      qs: ['Qual unidade de negócio deve ser a prioridade este ano?', 'Como organizo as decisões entre os sócios?'],
      fw: ['Golden Circle', 'Mapa de Essência', 'Modelos de Governança'] },
    { d: 'brand', nome: 'Brand', titulo: 'Posicionamento e marca',
      desc: 'Como a marca se diferencia, que território ocupa na cabeça do público e como cada frente nova conversa com a marca principal.',
      chips: ['Posicionamento', 'Território da marca', 'Concorrência', 'Arquitetura de marcas'],
      qs: ['Como me diferencio dos concorrentes?', 'Cada frente nova precisa de uma marca própria?'],
      fw: ['Brand Territory Map', 'Mapa Competitivo', 'Arquétipos de marca'] },
    { d: 'audience', nome: 'Audience', titulo: 'Públicos e comunidade',
      desc: 'Quem são os seus públicos de verdade, o que eles querem resolver e como transformar seguidores em comunidade e em clientes.',
      chips: ['Públicos e personas', 'Jornada de compra', 'Comunidades', 'Canais e audiência'],
      qs: ['Quem é o meu público de verdade?', 'Como transformo seguidores em clientes?'],
      fw: ['Personas e Jornada', 'Jobs to be Done', 'Escada de Engajamento'] },
    { d: 'business', nome: 'Business', titulo: 'Modelo de negócio e receita',
      desc: 'Como o negócio gera dinheiro: modelos de receita, preço, margem e o portfólio de unidades de negócio.',
      chips: ['Modelos de receita', 'Precificação', 'Portfólio de unidades', 'Margem'],
      qs: ['Quanto devo cobrar pelo que eu faço?', 'Qual unidade de negócio dá mais margem?'],
      fw: ['Business Model Canvas', 'Precificação por Valor', 'Mapa de Portfólio'] },
    { d: 'partnerships', nome: 'Partnerships', titulo: 'Parcerias e patrocínio',
      desc: 'Como gerar receita com marcas: o que você tem para vender, quanto vale cada cota, quais marcas combinam e como provar o retorno.',
      chips: ['Inventário de ativos', 'Cotas de patrocínio', 'Fit com marcas', 'Retorno para a marca'],
      qs: ['Quanto vale uma cota do meu projeto?', 'Que marcas combinam com o meu público?'],
      fw: ['Inventário de Ativos', 'Mapa de Fit', 'Modelos de patrocínio'] },
    { d: 'beyond', nome: 'Beyond', titulo: 'Novos negócios e futuro',
      desc: 'Para onde o negócio pode ir: novos negócios a partir do que você já tem, tendências, pilotos com pouco risco e propriedade intelectual própria.',
      chips: ['Novos negócios', 'Adjacências', 'Tendências', 'Pilotos', 'IP próprio'],
      qs: ['Que negócio novo posso abrir com a audiência que já tenho?', 'Como testo uma ideia sem arriscar muito?'],
      fw: ['Horizontes de Aposta', 'Dinâmica de Adjacências', 'Protocolo de Piloto'] },
  ];
  const dx = document.querySelector('[data-dx]');
  if (dx) {
    const panel = dx.querySelector('[data-dx-panel]');
    autoplay(dx, {
      tabs: [...dx.querySelectorAll('.in-dx-tab')], tempo: 6500, varTempo: '--dx-t',
      aoIr(i) {
        const x = DIMS[i];
        let n = 0;
        const st = (cls) => `class="st${cls ? ' ' + cls : ''}" style="--i:${n++}"`;
        panel.style.setProperty('--c', `var(--dim-${x.d})`);
        panel.innerHTML = `
          <div ${st('in-dx-num')}>${String(i + 1).padStart(2, '0')} / 06</div>
          <div ${st('in-dx-name')}><h3>${x.nome}</h3><span>${x.titulo}</span></div>
          <p ${st('in-dx-desc')}>${x.desc}</p>
          <div class="in-dx-grid">
            <div ${st()}><div class="in-dx-h">O que entra</div><div class="in-dx-chips">${x.chips.map(c => `<span>${c}</span>`).join('')}</div></div>
            <div ${st()}><div class="in-dx-h">Frameworks que ele usa</div><div class="in-dx-chips fw">${x.fw.map(c => `<span>${c}</span>`).join('')}</div></div>
            <div ${st('in-dx-full')}><div class="in-dx-h">Perguntas que ele responde</div><div class="in-dx-qs">${x.qs.map(q => `<span>${q}</span>`).join('')}</div></div>
          </div>`;
      },
    });
  }

  // Soluções
  const sol = document.querySelector('[data-sol]');
  if (sol) {
    const panels = [...sol.querySelectorAll('[data-sol-panel]')];
    autoplay(sol, {
      tabs: [...sol.querySelectorAll('[data-sol-tab]')], tempo: 7000, varTempo: '--sol-t',
      aoIr(i) {
        panels.forEach((p, k) => { p.hidden = k !== i; p.classList.toggle('is-on', k === i); });
        const c = panels[i].querySelector('[data-count]');
        if (c) conta(c);
      },
    });
  }

  /* ── 3. Converse ── */
  const CENAS = [
    { tag: 'Beyond', q: 'Que negócio novo posso abrir com a audiência que já tenho?',
      a: ['Seus seguidores pedem conteúdo aprofundado: um curso pago é o caminho mais curto.', 'Comece com uma turma piloto de 30 vagas e 60 dias para decidir.', 'Quer que eu monte o plano do piloto?'] },
    { tag: 'Core', q: 'Qual unidade de negócio deve ser a prioridade este ano?',
      a: ['Eventos dá 70% da receita, mas a margem está em Conteúdo.', 'Priorize Conteúdo e use os eventos como vitrine.', 'Vale definir um responsável por unidade.'] },
    { tag: 'Audience', q: 'Quem é o meu público de verdade?',
      a: ['Pelos seus canais: 25 a 40 anos, maioria em capitais do Sudeste.', 'Dois públicos: quem consome o conteúdo e quem compra o evento.', 'Cada um pede uma mensagem diferente.'] },
    { tag: 'Partnerships', q: 'Quanto vale uma cota do meu evento?',
      a: ['Pelo seu inventário: arena, camisas e transmissão das finais.', 'A cota master fica na faixa mais alta, com exclusividade de setor.', 'O agente de cotas monta a tabela completa.'] },
  ];
  const demo = document.querySelector('[data-demo]');
  if (demo) {
    const typed = demo.querySelector('[data-demo-typed]');
    const ans = demo.querySelector('[data-demo-a]');
    const list = demo.querySelector('[data-demo-list]');
    const tag = demo.querySelector('[data-demo-tag]');
    const mostra = c => { typed.textContent = c.q; tag.textContent = c.tag; list.innerHTML = c.a.map(t => `<li class="show">${esc(t)}</li>`).join(''); ans.classList.add('show'); };
    if (reduce) mostra(CENAS[0]);
    else {
      let ativo = false, rodando = false, i = 0;
      const ciclo = async () => {
        if (rodando) return;
        rodando = true;
        while (ativo) {
          const c = CENAS[i++ % CENAS.length];
          tag.textContent = c.tag;
          ans.classList.remove('show', 'pensando');
          list.innerHTML = '';
          typed.textContent = '';
          for (let k = 1; k <= c.q.length; k++) { typed.textContent = c.q.slice(0, k); await wait(30); }
          await wait(350);
          ans.classList.add('show', 'pensando');
          await wait(1000);
          ans.classList.remove('pensando');
          for (const t of c.a) {
            const li = document.createElement('li');
            li.textContent = t;
            list.appendChild(li);
            requestAnimationFrame(() => li.classList.add('show'));
            await wait(600);
          }
          await wait(3200);
        }
        rodando = false;
      };
      naTela(demo, v => { ativo = v; if (v) ciclo(); });
    }
  }

  // Com "reduzir movimento", os dados param de circular na rede do comparativo
  if (reduce) document.querySelectorAll('.vs-rede-svg').forEach(svg => svg.pauseAnimations && svg.pauseAnimations());

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
