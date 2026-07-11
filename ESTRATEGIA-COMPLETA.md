# Estratégia Completa — Slide Updater v0.1 → v1.0

**Documento Executivo para Pesquisador**  
**Data**: 2026-07-11  
**Responsável**: Clone Acadêmico + Arquiteto-de-Apps

---

## 1. VISÃO GERAL

O **Slide Updater** é uma SPA que permite docentes atualizar slides de aulas automaticamente com literatura científica recente. Atualmente em **v0.1 (protótipo)** — estrutura sólida, mas com **lacunas críticas** que impedem uso em produção.

**Objetivo**: Evoluir para **v1.0 (produção)** em ~40 horas de desenvolvimento estruturado.

---

## 2. DIAGNOSTICO DOS GARGALOS

### 7 Problemas Identificados

| # | Problema | Severidade | Impacto |
|---|---|---|---|
| **1** | Sem undo/redo | 🔴 CRÍTICA | Usuário não pode reverter ações |
| **2** | Upload PDF/PPTX não funciona | 🔴 CRÍTICA | Caso de uso #1 do briefing falha |
| **3** | Exportação PPTX não existe | 🔴 CRÍTICA | Não consegue entregar produto |
| **4** | Keywords ingênuas | 🟠 ALTA | Buscas PubMed retornam lixo |
| **5** | Design suggestions triviais | 🟠 ALTA | Análise superficial, pouco útil |
| **6** | Sem debounce/rate limit | 🟠 ALTA | PubMed bloqueia, localStorage saturado |
| **7** | Scopus/WoS sem suporte real | 🟡 MÉDIA | Cobertura limitada a 1 base |

---

## 3. ARQUITETURA DA SOLUÇÃO

### Abordagem em 3 Fases

```
Fase 1 (CRÍTICO) ──► Fase 2 (ALTO) ──► Fase 3 (MÉDIO) ──► VALIDAÇÃO ──► v1.0
12-15h            10-12h            6-8h              4-6h
```

#### **Fase 1: Bloqueia Produção** ✅ = Viável Usar
Features:
- ✅ Undo/Redo com histórico
- ✅ Upload real de PDF/PPTX
- ✅ Exportação PPTX funcional

**Quando terminar Fase 1**:
- App permite básico: carregar → editar → buscar → exportar
- Usuário pode desfazer ações
- Dados não se perdem

#### **Fase 2: Melhora Qualidade** 🎯 = App Robusto
Features:
- 🎯 Keywords inteligentes (TF-IDF)
- 🎯 Design suggestions sofisticadas
- 🎯 Debounce + rate limiting
- 🎯 Cache inteligente

**Quando terminar Fase 2**:
- Buscas retornam artigos relevantes
- Análise de design é profunda
- App estável sob uso intenso
- Sem duplicatas no cache

#### **Fase 3: Melhorias UX** ✨ = Polish
Features:
- ✨ Rich text editor
- ✨ Scopus/WoS com fallback
- ✨ Acessibilidade WCAG AA

**Quando terminar Fase 3**:
- Editor WYSIWYG completo
- 3 bases de literatura (com fallbacks)
- Acessível para usuários com deficiência

#### **Validação: Pronto para Produção** 🚀
- Testes E2E completos
- Performance Lighthouse >85
- Acessibilidade WCAG AA

---

## 4. ESCOPO TÉCNICO

### Stack Confirmado
- **Frontend**: React 18 + TypeScript 5
- **Build**: Vite 5
- **Styling**: Tailwind CSS 3
- **State**: Context API + LocalStorage
- **APIs**: PubMed (gratuita), Scopus/WoS (fallback)
- **Export**: pptxgen, html2pdf
- **Parse**: pdfjs-dist, docx

### Dependências a Instalar
- Fase 1: nenhuma (pdfjs, docx já incluídas)
- Fase 2: nenhuma (todas built-in)
- Fase 3: `@tiptap/react`, `@tiptap/starter-kit` (rich text)

### Dados: LocalStorage (não há backend)
- Limite: ~5-10MB (compactado)
- Persistence: automática a cada mudança
- Backup: JSON download

---

## 5. PLANO EXECUTIVO

### Semana 1 (Dias 1-3): Fase 1
```
Dia 1: Undo/Redo + PDF Upload
├─ ProjectContext: add undo/redo stacks
├─ FileUpload: pdfjs + docx parser
├─ HistoryPanel: timeline visual
└─ Teste: 5 ações, undo/redo, PDF 3 páginas

Dia 2: PPTX Export + Polimento
├─ ExportPanel: pptxgen implementation
├─ Design System: #c17847 colors, tipografia
├─ Teste: gera PPTX válido, abre no PowerPoint
└─ Code review: tipos, sem `any`

Dia 3: Validação Fase 1
├─ E2E: criar projeto → upload PDF → editar → export PPTX
├─ Performance: Lighthouse >75
└─ Reportar: Fase 1 ✅ completa
```

### Semana 2 (Dias 4-6): Fase 2
```
Dia 4: Keywords Inteligentes
├─ TFIDFExtractor: implementar em utils/
├─ Terminologia: boost scores para estomatologia
├─ Teste: "mucosite" no top 3

Dia 5: Design + Debounce
├─ DesignAnalyzer: 5 tipos de sugestões
├─ RateLimiter: 3 req/sec PubMed
├─ Debounce: 500ms edit, 1s search
└─ Teste: 10 edits/sec → 1 busca

Dia 6: Cache + Validação Fase 2
├─ CacheService: hash, TTL 7d, dedup
├─ E2E: mesma busca 2x → cache
└─ Reportar: Fase 2 ✅ completa
```

### Semana 3 (Dias 7-8): Fase 3
```
Dia 7: Rich Text + Scopus
├─ RichTextEditor: TipTap integration
├─ Scopus API: fallback gracioso

Dia 8: Acessibilidade + Validação
├─ ARIA labels em todos components
├─ axe DevTools: 0 violations WCAG AA
└─ Reportar: Fase 3 ✅ completa + v1.0 pronto
```

---

## 6. MILESTONES E ENTREGAS

| Milestone | Critério | Entrega |
|---|---|---|
| **Fase 1 ✅** | Undo/Redo + PDF + PPTX funcionam | 3-4 dias |
| **Fase 2 ✅** | Keywords, Design, Debounce, Cache | 2-3 dias |
| **Fase 3 ✅** | Rich text, Scopus, A11y | 2 dias |
| **Validação ✅** | E2E, Performance, A11y | 1 dia |
| **v1.0 🚀** | App pronto para produção | ~10 dias |

---

## 7. TESTES: JOURNEYS DE VALIDAÇÃO

### Journey 1: Criar Projeto (Smoke Test)
```
1. Abrir app
2. "+ Novo Projeto" → "Biologia 101"
3. Editar slide: adicionar "Mucosite oral..."
4. Desfazer edição (Undo) → conteúdo volta
5. Refazer edição (Redo) → volta a aparecer
✅ Undo/Redo funciona
```

### Journey 2: Upload PDF (Critical)
```
1. "+ Novo Projeto" → "Câncer HNC"
2. "📤 Importar Slides" → upload "lectures.pdf" (3 páginas)
3. App extrai: 3 slides com título + conteúdo
4. Verificar cada slide tem conteúdo legível
✅ PDF Upload funciona
```

### Journey 3: Buscar Literatura (Core)
```
1. Editar slide: adicionar "mucosite oral quimioterapia"
2. "🔍 Buscar Literatura"
3. Aguardar 3-5s
4. App retorna 5-10 artigos relevantes
5. Aceitar 3 artigos
✅ PubMed search funciona
```

### Journey 4: Exportar PPTX (Critical)
```
1. Ter projeto com 3 slides + literatura aprovada
2. "💾 Exportar" → "PPTX"
3. Download "project.pptx"
4. Abrir em PowerPoint
5. Verificar: slides, títulos, conteúdo, links aparecem
✅ PPTX Export funciona
```

### Journey 5: Performance (5 Edições Rápidas)
```
1. Slide com "mucosite"
2. Digitar 10 caracteres em 2 segundos
3. Disparar 5 "Buscar Literatura" em sequência
4. Verificar que não há 5 buscas (rate limit funciona)
5. Verificar localStorage <5MB
✅ Debounce + Rate Limit funcionam
```

---

## 8. CRITÉRIO DE ACEITE FINAL (v1.0)

### Funcionalidade
- ✅ Undo/Redo: 20+ ações, nenhuma perda de dados
- ✅ PDF/PPTX Upload: parsing válido, fallback gracioso
- ✅ PPTX Export: pixel-perfect, design system respeitado
- ✅ PubMed Search: 5-10 artigos relevantes por slide
- ✅ Design Suggestions: 5 categorias de análise
- ✅ Keywords: TF-IDF com boost técnico
- ✅ Debounce/Rate Limit: nenhum crash por uso intenso
- ✅ Cache: dedup automática, TTL 7 dias

### Performance
- ✅ Initial load: <2s (Lighthouse >85)
- ✅ PDF parsing: <5s/página
- ✅ PPTX generation: <3s/50 slides
- ✅ localStorage: <5MB

### Qualidade
- ✅ Sem erros TypeScript
- ✅ Sem erros console
- ✅ Acessibilidade: WCAG AA
- ✅ Design System: 0 divergências

### Documentação
- ✅ README atualizado
- ✅ Inline comments (JSDoc)
- ✅ Arquivo .env.example (se houver)

---

## 9. RISCOS E MITIGAÇÕES

| Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|
| PDF parse falha (scanned PDFs) | Alta | Médio | OCR fallback ou msg clara |
| PPTX export lento (100+ slides) | Média | Médio | Chunking + progress bar |
| localStorage cheio | Baixa | Alto | Compressão gzip + limpeza |
| Rate limit PubMed | Média | Baixo | Retry + backoff exponencial |
| TF-IDF não detecta termos técnicos | Média | Médio | Manual boost scores |

---

## 10. TIMELINE REAL

### Estimado vs. Realista
```
Otimista (ideal):    8 dias
Realista (buffer):  10-12 dias
Pessimista (bugs):  15 dias
```

**Buffer incorporado**: 20% para bugs, ajustes, testes.

---

## 11. PRÓXIMAS AÇÕES IMEDIATAS

### ✅ JÁ FEITO
1. ✅ Diagnóstico completo dos gargalos
2. ✅ Plano detalhado (PLANO-SLIDE-UPDATER.md)
3. ✅ Especificações Fase 2 (FASE2-SPECS.md)
4. ✅ Delegação ao Arquiteto-de-Apps para Fase 1

### 🔄 EM PROGRESSO
5. 🔄 Agente implementando Fase 1 (3-4 horas)
   - Undo/Redo
   - PDF Upload
   - PPTX Export

### ⏳ PRÓXIMO (Quando Fase 1 ✅)
6. ⏳ Validar Fase 1 localmente (npm run dev)
7. ⏳ Iniciar Fase 2 (Keywords, Design, Debounce, Cache)
8. ⏳ Iniciar Fase 3 (Rich Text, Scopus, A11y)

---

## 12. GOVERNANÇA

### Decisões Já Tomadas
- ✅ Stack: React + Context + LocalStorage (aprovado)
- ✅ Design System: #c17847 terracota (aprovado)
- ✅ APIs: PubMed + Scopus/WoS fallback (aprovado)
- ✅ Fases: 3 fases + validação (aprovado)

### Decisões Pendentes
- ⏳ Rich text editor: TipTap ou outro?
- ⏳ OCR para PDFs scaneados: implementar ou não?
- ⏳ Mobile responsividade: prioridade?

---

## 13. SUCESSO

**v1.0 será sucesso quando**:

1. ✅ Docente consegue: criar → carregar slides → buscar literatura → exportar PPTX
2. ✅ Dados nunca se perdem (undo/redo funciona)
3. ✅ Buscas retornam artigos relevantes (keywords inteligentes)
4. ✅ App estável sob uso intenso (rate limit + cache)
5. ✅ Exportação é profissional (design system respeitado)
6. ✅ Nenhuma dependência de backend ou login
7. ✅ 0 erros de console ou TypeScript

**v1.0 NÃO será sucesso se**:
- ❌ Undo/redo não funciona
- ❌ Não consegue fazer upload de PDF
- ❌ PPTX export não abre
- ❌ PubMed retorna lixo
- ❌ App trava com 100+ slides

---

## 14. COMUNICAÇÃO INTERNA

### Status Updates
- **Diário**: Checklist de features (Notion ou README)
- **Fim Fase**: Relatório completo com testes

### Documentação
- **Código**: JSDoc + inline comments (TypeScript)
- **Usuário**: README em português
- **Dev**: Inline specs em código

---

## 15. REFERÊNCIAS

- `PLANO-SLIDE-UPDATER.md` — Detalhamento completo
- `FASE2-SPECS.md` — Especificações técnicas Fase 2
- `STATUS-IMPLEMENTACAO.md` — Status atual
- `prompt-alfaiate-slide-updater.md` — Briefing original
- `slide-updater/README.md` — Guia de uso

---

**Estratégia estruturada e pronta para execução.**

**Próximo passo**: Aguardar conclusão de Fase 1 (Agente), depois validar e iniciar Fase 2.

---

*Documento elaborado pelo Clone Acadêmico em 2026-07-11*
