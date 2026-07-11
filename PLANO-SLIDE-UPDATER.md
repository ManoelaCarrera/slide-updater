# Plano de Implementação — Slide Updater

**Data**: 2026-07-11  
**Status**: Fase 1 — Implementação de Críticas  
**Objetivo**: Transformar protótipo v0.1 em produto robusto v1.0

---

## 1. ESCOPO CRÍTICO (Sprint 1 — 3-4 dias)

Sem estas features, o app não é viável:

### 1.1 Undo/Redo com Histórico
- **Problema**: Prompt exige histórico reversível de 20 ações, mas falta UI.
- **Solução**:
  - Estender `ProjectContext` com `undoStack` e `redoStack`
  - Cada ação (edit, add literature, apply design) cria snapshot
  - Buttons em SlideEditor: "↶ Desfazer" e "↷ Refazer"
  - Visor de histórico em timeline (sidebar direita ou modal)
  - Limite: últimas 50 ações por slide
- **Arquivos a modificar**:
  - `context/ProjectContext.tsx` (add undo/redo methods)
  - `components/SlideEditor.tsx` (add buttons + history panel)
  - `components/HistoryPanel.tsx` (novo)
  - `types.ts` (add HistoryState interface)
- **Esforço**: Médio (3-4h)

### 1.2 Upload Real de PDF/PPTX
- **Problema**: Apenas texto. Caso de uso #1 do briefing ("carregar slides existentes") não funciona.
- **Solução**:
  - Integrar `pdf-parse` para PDFs (ou `pdfjs` no browser)
  - Integrar `officegen` para PPTX parsing
  - Fallback: texto extraído, imagens como thumbnail
  - Cada página/slide vira um Slide no projeto
  - Preservar formatting básico (títulos, bullets)
- **Arquivos a modificar**:
  - `components/FileUpload.tsx` (enhance parser)
  - `services/fileParserService.ts` (novo)
  - `types.ts` (add FileUploadResult)
- **Dependências a instalar**: `pdfjs-dist`, `docx`, `pptxjs`
- **Esforço**: Alto (5-6h)

### 1.3 Exportação PPTX Funcional
- **Problema**: `pptxgen` instalado, mas não usado. Exportação PPTX não existe.
- **Solução**:
  - Implementar export em `ExportPanel.tsx`
  - Cada slide → slide PPTX com:
    - Título (heading 1, 40pt)
    - Conteúdo (body text, 18pt)
    - Literatura aprovada como bullets com links
    - Design aplicado (cor de fundo, posicionamento)
  - Respeitar design system (cores, tipografia)
  - Suporte a imagens inline se existirem
- **Arquivos a modificar**:
  - `components/ExportPanel.tsx` (implement PPTX logic)
  - `services/exportService.ts` (extend with PPTX generation)
- **Esforço**: Médio (4-5h)

---

## 2. ESCOPO ALTO (Sprint 2 — 2-3 dias)

Qualidade de funcionalidade existente:

### 2.1 Extração Inteligente de Keywords (TF-IDF)
- **Problema**: Extrator atual é ingênuo. Keywords técnicas ("mucosite", "osteoradionecrose") são perdidas.
- **Solução**:
  - Implementar TF-IDF simples em `utils/keywordExtractor.ts`
  - Input: texto do slide
  - Output: top 5-7 keywords ranqueadas por score
  - Adicionar terminologia técnica da estomatologia oncológica:
    - `['mucosite', 'osteoradionecrose', 'xerostomia', 'osteonecrose', 'fotobiomodulação', 'quimioterapia', 'radioterapia', 'câncer de cabeça e pescoço', 'desordem oral potencialmente maligna', 'hiposalivação']`
  - Validação: testar com textos da área
- **Arquivos a modificar**:
  - `utils/helpers.ts` (replace `extractKeywords`)
  - `utils/keywordExtractor.ts` (novo)
  - `services/pubmedService.ts` (use new extractor)
- **Esforço**: Médio (3-4h)

### 2.2 Sugestões de Design Sofisticadas
- **Problema**: Apenas detecta "muito texto". Não analisa hierarquia, contraste, monocromia, etc.
- **Solução**:
  - Estender `generateDesignSuggestions()` para:
    - **Text-heavy**: slide com >150 palavras → dividir ou visualizar
    - **Missing hierarchy**: sem títulos/subtítulos → estruturar
    - **Missing visual**: <10% conteúdo não-textual → adicionar gráfico/imagem
    - **Low contrast**: (simulado) → sugerir cores do design system
    - **Monochrome**: todas as cores iguais → aplicar paleta
  - Propor layouts específicos: "título + imagem", "título + bullets + gráfico", etc.
  - Cada sugestão tem `severity` (low/medium/high) e `actionable: boolean`
- **Arquivos a modificar**:
  - `utils/helpers.ts` (extend `generateDesignSuggestions`)
  - `services/designAnalyzerService.ts` (novo)
  - `components/DesignSuggestions.tsx` (display + apply)
- **Esforço**: Médio (3-4h)

### 2.3 Debounce + Rate Limiting
- **Problema**: Cada keystroke pode disparar busca. PubMed rate limit = 1 req/seg; localStorage saturado.
- **Solução**:
  - Debounce em `handleContentChange()`: 500ms
  - Debounce em busca de literatura: 1s
  - Rate limiter simples: rastrear timestamp das requisiçõs
  - Retry automático com backoff exponencial (se 429 do PubMed)
  - Cache de buscas: `Map<keywords, results>` com TTL 1 hora
- **Arquivos a modificar**:
  - `hooks/useDebounce.ts` (novo)
  - `utils/rateLimit.ts` (novo)
  - `services/pubmedService.ts` (add rate limit + retry)
  - `components/SlideEditor.tsx` (apply debounce)
- **Esforço**: Baixo (2-3h)

### 2.4 Cache Inteligente e Deduplicação
- **Problema**: Mesmas buscas retornam artigos duplicados.
- **Solução**:
  - Store de cache em localStorage: `slideUpdater_literatureCache`
  - Chave: hash SHA-1 de keywords ordenadas
  - Valor: results + timestamp (TTL 7 dias)
  - Deduplicação por PMID ao mesclar resultados
  - Limpeza automática de cache antigo
- **Arquivos a modificar**:
  - `services/cacheService.ts` (novo)
  - `services/pubmedService.ts` (use cache)
- **Esforço**: Baixo (2h)

---

## 3. ESCOPO MÉDIO (Sprint 3 — 2 dias)

Melhorias de UX:

### 3.1 Rich Text Editor Básico
- **Problema**: Apenas textarea. Não permite **negrito**, *itálico*, listas.
- **Solução**:
  - Integrar `TipTap` (editor baseado em ProseMirror, leve)
  - Comandos básicos: **B**, *I*, `code`, headings, bullets, links
  - Toolbar simples com buttons
  - Salva como HTML em `currentContent`
  - Renderiza HTML ao exibir
- **Arquivos a modificar**:
  - `components/RichTextEditor.tsx` (novo)
  - `components/SlideEditor.tsx` (replace textarea)
  - `types.ts` (update Slide.currentContent type)
- **Dependências**: `@tiptap/react`, `@tiptap/starter-kit`
- **Esforço**: Médio (3-4h)

### 3.2 Scopus/Web of Science com Fallback
- **Problema**: Apenas PubMed. Prompt pede suporte a 3 bases.
- **Solução**:
  - Scopus:
    - Se API key disponível: buscar real
    - Se não: fallback automático para PubMed
    - Mostrar badge "Scopus" no resultado se encontrado
  - Web of Science:
    - Requer credenciais (não viável sem login)
    - Fallback permanente para PubMed
    - Docstring: "WoS disponível com credenciais institucionais"
  - UI: spinner durante busca, mensagem se fallback
- **Arquivos a modificar**:
  - `services/scopusService.ts` (novo)
  - `services/pubmedService.ts` (extend)
  - `components/LiteraturePanel.tsx` (display source)
  - `components/SettingsPanel.tsx` (add Scopus API key input)
- **Esforço**: Alto (4-5h) — requer pesquisa de API Scopus

### 3.3 Acessibilidade (WCAG AA básico)
- **Problema**: Falta ARIA labels, keyboard nav, contraste.
- **Solução**:
  - Adicionar `aria-label`, `aria-describedby` em botões e inputs
  - Keyboard: Tab completo, Enter para submit, Esc para fechar modais
  - Contraste: verificar com DevTools (target: 4.5:1 para text)
  - Screen reader: testar com VoiceOver (Mac) ou NVDA (Windows)
  - Focus indicator: `:focus-visible` com cores visíveis
- **Arquivos a modificar**:
  - Todos os componentes (add ARIA)
  - `index.css` (add focus styles)
- **Esforço**: Médio (3-4h)

---

## 4. TESTES E VALIDAÇÃO

### 4.1 Testes Funcionais (end-to-end)
- Criar projeto → upload PDF → buscar literatura → aplicar design → exportar PPTX
- Undo/redo: 10 ações, refazer, verificar estado
- Rate limiting: disparar 20 buscas em 5s, verificar fila
- Cache: mesma busca 2x, verificar localhost storage

### 4.2 Testes de Performance
- Lighthouse: target >85 (initial load, interaction latency)
- LocalStorage: <5MB com 10 projetos × 50 slides
- Memory leak: dev tools, scroll 100 slides, verificar heap

### 4.3 Testes de Acessibilidade
- axe DevTools: 0 violations de WCAG AA
- Keyboard: navegar app sem mouse
- Screen reader: VoiceOver/NVDA lê conteúdo coerentemente

---

## 5. CRONOGRAMA PROPOSTO

| Fase | Sprints | Objetivo | Duração |
|---|---|---|---|
| **Sprint 1** | Crítico 1-3 | Undo/redo, PDF upload, PPTX export | 3-4 dias |
| **Sprint 2** | Alto 1-4 | Keywords, Design, Debounce, Cache | 2-3 dias |
| **Sprint 3** | Médio 1-3 | Rich text, Scopus, Accessibility | 2 dias |
| **Validação** | Testes 1-3 | E2E, performance, a11y | 1 dia |
| **Total** | — | **v1.0 pronto para produção** | ~10 dias |

---

## 6. DEFINIÇÃO DE PRONTO (Definition of Done)

Cada feature:
- ✅ Código implementado e testado localmente
- ✅ Sem erros de console ou TypeScript
- ✅ Testes E2E passando
- ✅ Performance Lighthouse >85
- ✅ Acessibilidade WCAG AA
- ✅ Documentação atualizada (README, inline comments)
- ✅ Git commit com mensagem clara

---

## 7. NOTAS CRÍTICAS

- **Dados nunca se perdem**: LocalStorage é a única fonte de verdade. Auto-save a cada mudança.
- **Design System é lei**: Nenhuma divergência visual. Usar paleta #c17847 (terracota).
- **Sem backend**: Tudo Client-side. PubMed é a única API remota confiável.
- **Voz autoral**: Preservar simplicidade. Nenhuma feature "cool" que não seja útil clinicamente.

---

**Próximo passo**: ✅ Teste o app em desenvolvimento
→ Confirmar gargalos
→ Iniciar Sprint 1
