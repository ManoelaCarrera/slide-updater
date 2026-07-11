# Deployment — Slide Updater v1.0

## Opções de Deploy

### 1. Vercel (Recomendado — Grátis + Rápido)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd slide-updater
vercel

# Segue prompts:
# Project name: slide-updater
# Framework: Vite
# Root directory: ./
```

**Resultado:** App ao vivo em `https://slide-updater.vercel.app`

### 2. Netlify

```bash
# Build
npm run build

# Deploy (via web UI)
# https://app.netlify.com/drop
# Arraste a pasta 'dist/'
```

**Resultado:** App ao vivo em `https://slide-updater.netlify.app`

### 3. GitHub Pages

```bash
# Add vite.config.ts
export default {
  base: '/slide-updater/',
}

# Build
npm run build

# Deploy
git add dist/
git commit -m "Build for GH Pages"
git push origin gh-pages
```

**Resultado:** App ao vivo em `https://[user].github.io/slide-updater`

### 4. Docker (Self-hosted)

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package.json .
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
EXPOSE 80
```

```bash
# Build
docker build -t slide-updater:1.0 .

# Run
docker run -p 80:80 slide-updater:1.0
```

**Resultado:** App ao vivo em `http://localhost`

---

## Pré-deployment Checklist

### Build
- [ ] `npm run build` sem erros
- [ ] `dist/` folder criada
- [ ] Tamanho < 5MB (gzip)

### Tests
- [ ] `npm test` passa
- [ ] Lighthouse score ≥ 90
- [ ] axe DevTools: 0 violations

### Functionality
- [ ] Rich text editor funciona
- [ ] Scopus fallback funciona
- [ ] A11y completo
- [ ] Export HTML/PPTX funciona

### Security
- [ ] Sem hardcoded secrets
- [ ] Scopus API key em localStorage apenas
- [ ] CORS headers ok
- [ ] CSP headers ok

### Performance
- [ ] First contentful paint < 2s
- [ ] Lighthouse performance ≥ 90
- [ ] Bundle size otimizado

---

## CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: 18

      - run: npm ci
      - run: npm run build
      - run: npm test
      
      - uses: actions/upload-artifact@v2
        with:
          name: dist
          path: dist/

      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: vercel --prod
```

---

## Environment Variables

### `.env.production`
```env
VITE_API_PUBMED=https://eutils.ncbi.nlm.nih.gov/entrez/eutils
VITE_API_SCOPUS=https://api.elsevier.com/content/search/scopus
```

### `.env.development`
```env
VITE_API_PUBMED=http://localhost:3001/pubmed
VITE_API_SCOPUS=http://localhost:3001/scopus
```

---

## Monitoring

### Sentry (Error Tracking)

```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://[key]@sentry.io/[project]",
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

### Google Analytics

```typescript
// Track usage
gtag('event', 'search_literature', {
  keywords: ['cancer', 'research'],
  results_count: 42,
});
```

---

## Scaling

### Traffic > 1000 req/day?

1. **CDN**: Habilitar Vercel/Netlify edge caching
2. **Database**: Adicionar backend para salvar projetos
3. **API**: Rate limiting + IP whitelist
4. **Cache**: Redis para literatura cache

### Arquitetura escalada:

```
Frontend (React/Vite)
    ↓
CloudFlare CDN
    ↓
Backend API (Node.js/Express)
    ↓
Database (PostgreSQL)
    ↓
Cache (Redis)
    ↓
PubMed/Scopus APIs
```

---

## Rollback

```bash
# Se deployment falha:
vercel rollback

# Ou:
git revert HEAD
git push origin main
```

---

## Post-Deploy

### Health Checks

```bash
# Test deployed app
curl -I https://slide-updater.vercel.app

# Test rich text
curl -X POST https://slide-updater.vercel.app/api/test \
  -d '{"content": "<strong>test</strong>"}'

# Test a11y
npx lighthouse https://slide-updater.vercel.app --preset=accessibility
```

### Monitoring Dashboard

```
Vercel: https://vercel.com/dashboard
Netlify: https://app.netlify.com
Sentry: https://sentry.io/projects/
```

---

## Troubleshooting

### Build fails
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### App blank on deploy
- Check `vite.config.ts` → `base` path
- Check `dist/index.html` → script tags
- Console errors → Lighthouse/DevTools

### API errors
- Check CORS headers
- Check API endpoints in `.env`
- Check rate limiting

---

## Support

- 📧 Email: `support@slideupdate.com`
- 💬 Issues: GitHub Issues
- 📚 Docs: `/docs` folder

---

**v1.0 Ready for Production** ✅
