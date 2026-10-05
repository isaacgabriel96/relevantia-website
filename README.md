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

As páginas antigas (`/the-edge`, `/contato`, `/sobre`, `/manifesto`, `/shift`, `/intelligence`) redirecionam para as seções do one pager (`vercel.json`).

## Formulário

Sem backend: ao enviar, abre o e-mail (ou o WhatsApp, se `CONTACT.whatsapp` estiver preenchido em `assets/js/main.js`) com a mensagem pronta. Links com `data-interest="radar|edge|intelligence|audiencia"` já marcam o interesse.

## Idiomas

PT é o texto do HTML; EN fica em `i18n-v5.js`. ES, ZH e AR caem no inglês. Ao mudar CSS ou JS, suba o `?v=` no `index.html` (cache imutável na Vercel).

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
