# Relevantia — Site institucional

Site da Relevantia em página única (one pager): ecossistema de marketing, negócios e tecnologia que faz audiências virarem negócios. Seções: hero com a animação da linha de produção, Radar (mockup da plataforma e os 4 formatos de ativo), Relevantia Intelligence (em breve), The Edge (consultoria), Audiência S/A + Lab, Sobre e o formulário "Quero conhecer" (#contato).

## Stack

- HTML + CSS + JS puro, sem build. Tudo em `index.html`.
- Design System v3.2 (mesmos tokens do Intelligence e do CRM). Sem itálico: `<em>`/`<i>` herdam fonte, peso e cor. Título num peso e numa cor só.
- UX da landing do Audiência S/A: nav transparente que ganha fundo ao rolar, barra de progresso, título linha a linha, marquee e reveal ao rolar.

## Arquivos

```
index.html                 # o site inteiro
assets/css/relevantia.css  # tokens + componentes
assets/js/main.js          # nav, idioma, reveal, progresso, formulário (CONTACT no topo)
assets/js/prodline.js      # animação do hero: audiência → linha de produção → negócio (canvas)
assets/js/radar-logo.js    # radar animado oficial (cópia de MVP/js/radar-svg-logo.js)
assets/js/i18n-v5.js       # traduções (o português fica no HTML)
assets/img, assets/logos
```

As páginas antigas (`/the-edge`, `/contato`, `/sobre`, `/manifesto`, `/shift`) redirecionam para as seções do one pager (`vercel.json`).

`/intelligence` é a página própria do Relevantia Intelligence (`intelligence.html`, com `assets/css/intelligence.css` e `assets/js/intelligence.js`): como funciona, as 6 dimensões, os agentes, as formas de acesso (Audience to Business, assinatura e The Edge), perguntas e a lista de espera (o mesmo formulário da home, com Intelligence marcado). Só em português por enquanto.

## Formulário

Sem backend: ao enviar, abre o e-mail (ou o WhatsApp, se `CONTACT.whatsapp` estiver preenchido em `assets/js/main.js`) com a mensagem pronta. Links com `data-interest="radar|edge|intelligence|audiencia"` já marcam o interesse.

## Idiomas

PT é o texto do HTML; EN fica em `i18n-v5.js`. ES, ZH e AR caem no inglês. Ao mudar CSS ou JS, suba o `?v=` no `index.html` (cache imutável na Vercel).

## Preview de compartilhamento

A imagem que aparece ao enviar o link (WhatsApp, LinkedIn etc.) é `assets/og/relevantia-og-2026.jpg` (1200×630), gerada a partir de `tools/og/og.html`. Para refazer, com o servidor local rodando na porta 8765:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --force-device-scale-factor=1 --window-size=1200,630 --virtual-time-budget=6000 --screenshot=/tmp/og.png http://localhost:8765/tools/og/og.html && sips -s format jpeg -s formatOptions 88 /tmp/og.png --out assets/og/relevantia-og-2026.jpg
```

Ao trocar a imagem, salve com um nome novo e atualize `og:image` e `twitter:image` no `index.html`: o WhatsApp guarda o preview em cache pela URL. Use nomes sem `?` na URL da imagem.

## Rodar localmente

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Deploy

### Vercel
```bash
vercel deploy --prod
```

### GitHub Pages
Push para `main` e habilite Pages em Settings → Pages → Deploy from branch.

### Netlify
```bash
netlify deploy --prod --dir=.
```

## Backup

A versão exportada do Framer original está em `_framer-mirror-backup/` para referência.
