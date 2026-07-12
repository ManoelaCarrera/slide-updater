# Deploy — Slide Updater v2.0

O Slide Updater é uma SPA estática: sem backend, sem banco de dados, sem
variáveis de ambiente e sem chaves de API. Tudo roda no navegador — inclusive
a extração de texto de PDF (pdf.js) e a geração de PPTX/PDF de exportação. O
build gera um `dist/` que pode ser hospedado em qualquer servidor de arquivos
estáticos.

**Atenção:** os dados (projetos, fontes, sugestões) ficam salvos em
`localStorage`, por navegador/dispositivo. Não há sincronização entre
computadores — a Profa deve usar o backup JSON (aba "Exportar") para levar um
projeto de um computador para outro.

## Build local

```bash
cd slide-updater
npm install
npm run build   # gera dist/
npm run preview # serve o build localmente para conferir
```

## Vercel

```bash
npm i -g vercel
cd slide-updater
vercel
```

O `vercel.json` já está configurado (`framework: vite`, rewrites para SPA).
Não é preciso configurar nenhuma variável de ambiente.

## Netlify

```bash
npm run build
# Arraste a pasta dist/ em https://app.netlify.com/drop
```

## GitHub Pages / qualquer host estático

```bash
npm run build
# Publique o conteúdo de dist/ — é um site 100% estático
```

Se for publicar em um subcaminho (ex.: `usuario.github.io/slide-updater/`),
ajuste `base` em `vite.config.ts` antes do build.

## Checklist antes de publicar

- [ ] `npm run build` sem erros de TypeScript
- [ ] Abrir `dist/index.html` (via `npm run preview`) e testar: criar projeto,
      adicionar fonte, analisar slide, aprovar sugestão, exportar PPTX/PDF/JSON
- [ ] Sem chamadas de rede no DevTools → Network durante o uso normal
- [ ] Sem chaves de API em `.env`, código ou `vercel.json`
