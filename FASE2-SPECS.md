# Fase 2 — Especificações Técnicas Detalhadas

**Objetivo**: Melhorar qualidade e robustez das funcionalidades existentes  
**Duração Estimada**: 10-12 horas  
**Dependências**: Fase 1 ✅ completa

---

## Feature 4: Extração Inteligente de Keywords (TF-IDF)

### Problema Atual
- Função `extractKeywords()` (helpers.ts:5-8) é ingênua: apenas filtra stopwords + tamanho
- Resultado: "mucosite", "osteoradionecrose", "fotobiomodulação" são perdidas
- PubMed recebe keywords genéricas → artigos irrelevantes

### Solução: TF-IDF Simples

#### Entrada
```typescript
const slideContent = `
  Mucosite oral é complicação frequente em pacientes com câncer de cabeça e pescoço 
  tratados com radioterapia ou quimioterapia. A fotobiomodulação pode auxiliar no 
  reparo de feridas e redução de inflamação. Osteoradionecrose é risco significativo 
  após radioterapia em campo maxilar.
`;
```

#### Saída
```typescript
[
  { keyword: "mucosite", score: 0.85 },
  { keyword: "osteoradionecrose", score: 0.78 },
  { keyword: "fotobiomodulação", score: 0.72 },
  { keyword: "radioterapia", score: 0.68 },
  { keyword: "câncer cabeça pescoço", score: 0.65 }
]
```

#### Implementação
**Arquivo**: `utils/keywordExtractor.ts` (novo)

```typescript
export interface KeywordScore {
  keyword: string
  score: number
}

export class TFIDFExtractor {
  private stopWords: Set<string>
  private technicalTerms: Map<string, number> // boost scores
  
  constructor() {
    // Portuguese + English stopwords
    this.stopWords = new Set([/* ... */])
    
    // Terminologia da área: boost scores
    this.technicalTerms = new Map([
      ["mucosite", 1.5],
      ["osteoradionecrose", 1.4],
      ["xerostomia", 1.3],
      ["osteonecrose", 1.3],
      ["fotobiomodulação", 1.2],
      ["quimioterapia", 1.1],
      ["radioterapia", 1.1],
      ["câncer de cabeça e pescoço", 1.3],
      ["desordem oral potencialmente maligna", 1.2],
      ["hiposalivação", 1.2],
      // ... mais termos
    ])
  }
  
  extract(text: string, topN: number = 7): KeywordScore[] {
    // 1. Tokenize + normalize
    const tokens = this.tokenize(text)
    
    // 2. Calcular TF (term frequency)
    const tf = this.calculateTF(tokens)
    
    // 3. Aplicar IDF (inverse document frequency) — simulado
    const tfidf = this.applyIDF(tf)
    
    // 4. Boost technical terms
    const boosted = this.boostTechnicalTerms(tfidf)
    
    // 5. Rank e retornar top N
    return Array.from(boosted.entries())
      .map(([keyword, score]) => ({ keyword, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topN)
  }
  
  private tokenize(text: string): string[] {
    // Split em palavras, remove pontuação, normalize
    // Suporta n-gramas: "câncer de cabeça e pescoço" como token único
    // ...
  }
  
  private calculateTF(tokens: string[]): Map<string, number> {
    // frequency / total
    // ...
  }
  
  private applyIDF(tf: Map<string, number>): Map<string, number> {
    // Simulado: IDF = log(total_docs / docs_com_termo)
    // Como não temos corpus, usamos frequência como proxy
    // ...
  }
  
  private boostTechnicalTerms(tfidf: Map<string, number>): Map<string, number> {
    // Aplicar multipliers do technicalTerms map
    const boosted = new Map(tfidf)
    boosted.forEach((score, keyword) => {
      const boost = this.technicalTerms.get(keyword) || 1.0
      boosted.set(keyword, score * boost)
    })
    return boosted
  }
}

export function extractKeywords(text: string, topN: number = 7): KeywordScore[] {
  const extractor = new TFIDFExtractor()
  return extractor.extract(text, topN)
}
```

#### Integração
- **Replace**: `utils/helpers.ts` — `extractKeywords()` chama novo extractor
- **Update**: `services/pubmedService.ts` — use scores para ranquear keywords
- **Test**: com textos da área (mucosite, xerostomia, PBM)

#### Critério de Aceitação
- [ ] "mucosite" e "osteoradionecrose" aparecem no top 3
- [ ] PubMed recebe keywords relevantes (validar manualmente)
- [ ] Sem erros de TypeScript

---

## Feature 5: Sugestões de Design Sofisticadas

### Problema Atual
- Apenas detecta "muito texto" (>150 palavras)
- Não analisa hierarquia, contraste, monocromia, layout

### Solução: Análise Sofisticada em Camadas

#### Tipos de Sugestões
```typescript
type DesignSuggestionType = 
  | 'text-heavy'           // >150 palavras
  | 'missing-hierarchy'    // sem headings/estrutura
  | 'missing-visual'       // <5% conteúdo não-texto
  | 'low-contrast'         // simulado: propor cores
  | 'monochrome'           // todas as cores iguais
  | 'poor-layout'          // texto sem margem
  | 'suggested-layout'     // layout específico

interface DesignSuggestion {
  id: string
  type: DesignSuggestionType
  message: string
  recommendation: string
  suggestedLayout?: 'title-image' | 'title-bullets-chart' | 'title-columns'
  severity: 'low' | 'medium' | 'high'
  actionable: boolean
  appliedColors?: string[] // cores do design system
}
```

#### Implementação
**Arquivo**: `services/designAnalyzerService.ts` (novo)

```typescript
export class DesignAnalyzer {
  private designSystemColors = ['#c17847', '#f5f3f0', '#3d3d3d', '#e8e3de']
  
  analyze(content: string, title: string): DesignSuggestion[] {
    const suggestions: DesignSuggestion[] = []
    
    // 1. Text-heavy analysis
    if (this.isTextHeavy(content)) {
      suggestions.push({
        id: generateId(),
        type: 'text-heavy',
        message: `Slide contém ${this.wordCount(content)} palavras.`,
        recommendation: 'Divida em múltiplos slides ou use visualização.',
        severity: 'high',
        actionable: true,
      })
    }
    
    // 2. Missing hierarchy
    if (!this.hasStructure(content)) {
      suggestions.push({
        id: generateId(),
        type: 'missing-hierarchy',
        message: 'Conteúdo sem estrutura clara (sem títulos/bullets).',
        recommendation: 'Organize em seções: introdução, pontos-chave, conclusão.',
        suggestedLayout: 'title-bullets-chart',
        severity: 'medium',
        actionable: true,
      })
    }
    
    // 3. Missing visual
    if (this.isAllText(content)) {
      suggestions.push({
        id: generateId(),
        type: 'missing-visual',
        message: 'Slide é 100% textual.',
        recommendation: 'Adicione gráfico, imagem ou diagrama para complementar.',
        suggestedLayout: 'title-image',
        severity: 'medium',
        actionable: true,
      })
    }
    
    // 4. Color & contrast (simulado)
    suggestions.push({
      id: generateId(),
      type: 'low-contrast',
      message: 'Considere melhorar contraste de cores.',
      recommendation: `Usar paleta do design system: ${this.designSystemColors.join(', ')}`,
      appliedColors: this.designSystemColors,
      severity: 'low',
      actionable: true,
    })
    
    // 5. Suggested layouts
    const layout = this.suggestLayout(content)
    if (layout) {
      suggestions.push({
        id: generateId(),
        type: 'suggested-layout',
        message: `Layout recomendado: ${layout}`,
        recommendation: `Este layout funciona bem para: ${this.layoutDescription(layout)}`,
        suggestedLayout: layout,
        severity: 'low',
        actionable: true,
      })
    }
    
    return suggestions.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 }
      return severityOrder[a.severity] - severityOrder[b.severity]
    })
  }
  
  private isTextHeavy(content: string): boolean {
    return this.wordCount(content) > 150
  }
  
  private hasStructure(content: string): boolean {
    // Detectar headings, bullets, quebras de linha
    return /^#+|\n-|\n\*|\n\d+\./.test(content)
  }
  
  private isAllText(content: string): boolean {
    // Simples: se não tem quebras de linha ou bullets, é tudo texto
    return !this.hasStructure(content)
  }
  
  private suggestLayout(content: string): string | null {
    const wc = this.wordCount(content)
    if (wc > 200) return 'title-bullets-chart'
    if (wc > 50) return 'title-image'
    return 'title-columns'
  }
  
  private wordCount(text: string): number {
    return text.split(/\s+/).length
  }
  
  private layoutDescription(layout: string): string {
    const desc = {
      'title-image': 'títulos com imagem lateral',
      'title-bullets-chart': 'título, bullets + gráfico',
      'title-columns': 'título com conteúdo em colunas',
    }
    return desc[layout] || ''
  }
}

export function generateDesignSuggestions(
  content: string,
  title: string
): DesignSuggestion[] {
  const analyzer = new DesignAnalyzer()
  return analyzer.analyze(content, title)
}
```

#### Integração
- **Replace**: `utils/helpers.ts` — `generateDesignSuggestions()`
- **Update**: `components/DesignSuggestions.tsx` — display + apply layouts
- **Update**: `types.ts` — adicionar tipos novos

#### Critério de Aceitação
- [ ] Slide com >150 palavras → sugestão text-heavy
- [ ] Slide sem estrutura → sugestão hierarchy
- [ ] Layout sugerido é coerente com conteúdo
- [ ] Cores vêm do design system

---

## Feature 6: Debounce + Rate Limiting

### Problema Atual
- Cada keystroke dispara busca em PubMed
- Rate limit PubMed: 1 req/seg → crashes após 5-10 edições rápidas
- localStorage saturado com requests duplicados

### Solução: Debounce + Rate Limiter + Cache

#### Arquivo: `hooks/useDebounce.ts` (novo)

```typescript
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
```

#### Arquivo: `utils/rateLimit.ts` (novo)

```typescript
export class RateLimiter {
  private requestTimestamps: number[] = []
  private readonly maxRequests: number
  private readonly windowMs: number
  
  constructor(maxRequests: number = 5, windowMs: number = 1000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }
  
  canMakeRequest(): boolean {
    const now = Date.now()
    this.requestTimestamps = this.requestTimestamps.filter(
      ts => now - ts < this.windowMs
    )
    return this.requestTimestamps.length < this.maxRequests
  }
  
  recordRequest(): void {
    this.requestTimestamps.push(Date.now())
  }
  
  getWaitTime(): number {
    if (this.requestTimestamps.length === 0) return 0
    const oldestRequest = this.requestTimestamps[0]
    const waitTime = this.windowMs - (Date.now() - oldestRequest)
    return Math.max(0, waitTime)
  }
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  backoffMs: number = 500
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === maxRetries - 1) throw error
      const delay = backoffMs * Math.pow(2, attempt) // exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw new Error('Retry failed')
}
```

#### Integração em SlideEditor.tsx

```typescript
function SlideEditor() {
  const debouncedContent = useDebounce(slide.currentContent, 500)
  
  const handleSearchLiterature = async () => {
    const limiter = new RateLimiter(3, 1000) // 3 reqs per second
    
    if (!limiter.canMakeRequest()) {
      const waitTime = limiter.getWaitTime()
      addToast(`Aguarde ${(waitTime/1000).toFixed(1)}s antes de nova busca`, 'info')
      return
    }
    
    limiter.recordRequest()
    
    try {
      const results = await withRetry(
        () => searchMultipleSources(keywords, year),
        3,
        500
      )
      // ... handle results
    } catch (error) {
      addToast('Erro após 3 tentativas. PubMed pode estar indisponível.', 'error')
    }
  }
  
  useEffect(() => {
    // Auto-extract keywords com debounce
    const keywords = extractKeywords(debouncedContent)
    updateSlide(project.id, slide.id, { keywords })
  }, [debouncedContent])
}
```

#### Critério de Aceitação
- [ ] Digitar 10 caracteres em 1s → 1 busca (não 10)
- [ ] Respeita rate limit PubMed (1 req/seg)
- [ ] Retry automático se falhar
- [ ] Toast mostra tempo de espera

---

## Feature 7: Cache Inteligente

### Problema Atual
- Mesma busca 2x retorna resultados duplicados
- localStorage cresce infinitamente

### Solução: Cache com TTL e Deduplicação

#### Arquivo: `services/cacheService.ts` (novo)

```typescript
import { LiteratureItem } from '../types'

interface CacheEntry {
  timestamp: number
  results: LiteratureItem[]
  ttl: number // milliseconds
}

export class LiteratureCache {
  private cacheKey = 'slideUpdater_literatureCache'
  private defaultTTL = 7 * 24 * 60 * 60 * 1000 // 7 days
  
  get(keywords: string[]): LiteratureItem[] | null {
    const cache = this.loadCache()
    const key = this.generateKey(keywords)
    
    if (!(key in cache)) return null
    
    const entry = cache[key]
    if (Date.now() - entry.timestamp > entry.ttl) {
      delete cache[key]
      this.saveCache(cache)
      return null
    }
    
    return entry.results
  }
  
  set(keywords: string[], results: LiteratureItem[]): void {
    const cache = this.loadCache()
    const key = this.generateKey(keywords)
    
    // Deduplication by PMID
    const existingPmids = new Set<string>()
    const deduped: LiteratureItem[] = []
    
    const allResults = [
      ...(cache[key]?.results || []),
      ...results,
    ]
    
    for (const item of allResults) {
      const pmid = item.pmid || item.id
      if (!existingPmids.has(pmid)) {
        existingPmids.add(pmid)
        deduped.push(item)
      }
    }
    
    cache[key] = {
      timestamp: Date.now(),
      results: deduped,
      ttl: this.defaultTTL,
    }
    
    this.saveCache(cache)
  }
  
  clear(): void {
    localStorage.removeItem(this.cacheKey)
  }
  
  private generateKey(keywords: string[]): string {
    // SHA-1 simulado: hash simples
    const sorted = keywords.sort().join('|')
    return `cache_${Buffer.from(sorted).toString('base64')}`
  }
  
  private loadCache(): Record<string, CacheEntry> {
    try {
      const data = localStorage.getItem(this.cacheKey)
      return data ? JSON.parse(data) : {}
    } catch {
      return {}
    }
  }
  
  private saveCache(cache: Record<string, CacheEntry>): void {
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify(cache))
    } catch (error) {
      console.error('Cache save failed:', error)
    }
  }
}

export const literatureCache = new LiteratureCache()
```

#### Integração em pubmedService.ts

```typescript
export async function searchMultipleSources(
  keywords: string[],
  year?: number
): Promise<LiteratureItem[]> {
  // Verificar cache primeiro
  const cached = literatureCache.get(keywords)
  if (cached) return cached
  
  try {
    const pubmedResults = await searchPubMed(keywords, year)
    
    // Salvar em cache
    literatureCache.set(keywords, pubmedResults)
    
    return pubmedResults.sort((a, b) => b.year - a.year)
  } catch (error) {
    console.error('Literature search error:', error)
    return []
  }
}
```

#### Critério de Aceitação
- [ ] Busca "mucosite" → cache
- [ ] Busca "mucosite" novamente → retorna instantly do cache
- [ ] Cache válido por 7 dias
- [ ] PMIDs duplicados não aparecem
- [ ] localStorage <5MB com cache

---

## Ordem de Implementação

1. ✅ Instalar dependências (nenhuma para Fase 2)
2. 📝 Feature 4: Extração de Keywords
3. 📝 Feature 5: Sugestões de Design
4. 📝 Feature 6: Debounce + Rate Limiting
5. 📝 Feature 7: Cache Inteligente
6. 🧪 Testes E2E
7. ✅ Reportar

---

## Critério de Aceitação Global (Fase 2)

- [ ] TF-IDF retorna keywords técnicas corretas
- [ ] Design suggestions aparecem em 5 categorias
- [ ] Debounce funciona (5 edições/sec → 1 busca)
- [ ] Rate limiter respeita PubMed (1 req/sec)
- [ ] Cache deduplicado e TTL funcionam
- [ ] Sem erros de TypeScript
- [ ] localStorage <5MB

---

**Status**: Aguardando confirmação de Fase 1  
**Próximo**: Iniciar Feature 4 assim que Fase 1 ✅
