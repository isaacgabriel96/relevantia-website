# Relevantia — Site institucional

Site guarda-chuva da Relevantia. Apresenta o ecossistema (Radar, Intelligence, The Edge, Shift), o manifesto e os canais de contato.

## Stack

- HTML + CSS + JS puro (sem build step)
- i18n via JS dictionary (PT-BR / EN), persistente em localStorage
- Design System Relevantia v3.2 (Poppins + DM Sans + Playfair Display + Space Grotesk)

## Estrutura

```
.
├── index.html              # Landing guarda-chuva
├── radar.html              # Marketplace de patrocínio
├── intelligence.html       # Diagnóstico estratégico
├── the-edge.html           # Consultoria contínua (com formulário)
├── shift.html              # Imersão presencial (com formulário)
├── manifesto.html          # Manifesto
├── contato.html            # Contato + formulário geral
└── assets/
    ├── css/relevantia.css  # Design system completo
    ├── js/i18n.js          # Dicionário PT-BR / EN
    ├── js/main.js          # Runtime: nav, FAQ, reveal, forms, lang toggle
    └── logos/              # Marca + lockups Radar
```

## Rodar localmente

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Fluxo de cadastro

The Edge e Shift têm formulários que:
1. Validam campos obrigatórios
2. Persistem dados em `localStorage` (`relevantia.leads`) — pickup futuro
3. Exibem confirmação de sucesso
4. Redirecionam para `/radar.html` após 4.5s

Para integrar com backend (Supabase, HubSpot, etc.), edite `assets/js/main.js → initForms()`.

## Bilíngue

Toggle PT/EN no topbar. Idioma persistido em `localStorage`. Detecção automática:
1. `?lang=pt` ou `?lang=en` na URL
2. localStorage
3. `navigator.language`
4. Default: PT

Para adicionar/editar texto: `assets/js/i18n.js`. Cada elemento tem `data-i18n="key"`.

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
