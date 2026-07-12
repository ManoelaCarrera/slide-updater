# Prompt-Alfaiate: Slide Updater — Atualização de Slides com Literatura Científica

> **Uso**: Cole este prompt integralmente quando quiser que o Arquiteto de Apps crie o aplicativo de atualização de slides. Anexe o Design System quando solicitado.
>
> **Versão**: 2.0 — Simplificada, focada em controle e voz pedagógica da Profa

---

## BRIEFING EXECUTIVO

Crie um **aplicativo web (SPA) de atualização de slides de aulas** 100% funcional, pronto para produção, que permita à **Profa** (docente de Estomatologia/Patologia):

- **Carregar slides base** (PPTX, PDF, ou descrição de tópicos)
- **Carregar fontes** (PDFs de artigos, imagens de livros digitais, arquivos .txt/.md com notas)
- **Sugerir atualizações** (novos estudos, descobertas, gaps para complementação) com base nas fontes carregadas
- **Validar antes de aplicar** com dois modos:
  - Modo A: Validação passo-a-passo (aprova/rejeita cada sugestão)
  - Modo B: Validação final (revisa tudo de uma vez)
- **Preservar a voz pedagógica** da Profa (perguntas, desafios, método socrático — não substitui, complementa)
- **Armazenar tudo localmente** (LocalStorage) — sem backend, sem APIs remotas
- **Exportar slides atualizados** (PPTX, PDF)

**Design System**: Utiliza exatamente o design system visual anexado a este prompt como verdade absoluta para cores, tipografia, spacing, componentes e estados.

---

## REQUISITOS TÉCNICOS

### Stack Obrigatória
- **Frontend**: React 18+ (TypeScript, Vite)
- **Styling**: Tailwind CSS
- **State Management**: React Context + LocalStorage (sem Redux, sem servidor)
- **Upload & Parse**:
  - PPTX: `pptxgen` ou `pptx-parser` (extração e edição)
  - PDF: `pdf.js` ou `pdfjs-dist` (visualização + extração de texto)
  - Imagens: suporte nativo (armazenar como blob em localStorage)
  - Texto: .txt e .md armazenados como strings
- **Armazenamento Local**: localStorage (máx 10-50MB; compactar com gzip se necessário)
- **Exportação**: `pptxgen` (para PPTX), `html2pdf` (para PDF)

### Proibições Explícitas
- ❌ Sem backend, servidor externo, ou APIs remotas (PubMed, Scopus, WoS)
- ❌ Sem autenticação de usuário
- ❌ Sem banco de dados remoto
- ❌ Sem dependências pesadas ou não testadas
- ❌ Sem chamadas HTTP para serviços externos (tudo é local)

---

## DESIGN SYSTEM VISUAL

**O design system anexado é a verdade absoluta.**

Antes de iniciar, solicite que o design system seja disponibilizado. Ele deve conter:
- Paleta de cores (primária, secundária, neutras, semânticas)
- Tipografia (font families, tamanhos, pesos, line-heights)
- Spacing/grid (unidades, escalas)
- Componentes reutilizáveis (botões, inputs, cards, modais, abas, etc.)
- Estados visuais (hover, active, disabled, loading, focus)
- Ícones (se houver)

**Regra de Ouro**: Nenhum elemento visual pode divergir do design system. Se algo não estiver lá, use princípios de acessibilidade e coerência visual para estender, mas sempre referenciando o sistema.

---

## FLUXOS PRINCIPAIS (User Stories)

### 1. Criar Projeto & Carregar Aula Base
- [ ] Profa acessa o app
- [ ] Clica "Novo Projeto" → define nome, disciplina (Estomatologia 1/2, Patologia Básica, Pós-grad)
- [ ] **Upload da aula base**: PPTX ou descrição de tópicos
  - Se PPTX: app extrai slides, preview visual
  - Se descrição: aceita texto ou lista de tópicos
- [ ] Profa revisa estrutura dos slides (pode editar, remover, reordenar)
- [ ] Projeto salvo automaticamente em localStorage

### 2. Carregar Fontes de Referência
- [ ] Botão "Adicionar Fontes"
- [ ] Upload de múltiplos arquivos: PDFs, imagens (screenshots de livros digitais), .txt, .md
- [ ] Cada fonte é nomeada pela Profa (ex: "Stephen Sonis - OM Review 2024.pdf")
- [ ] App exibe lista de fontes carregadas com tamanho e tipo
- [ ] Profa pode visualizar preview de PDFs (pdf.js)
- [ ] Remover fontes se necessário

### 3. Análise & Sugestões de Atualização
- [ ] Profa clica "Analisar Slides & Fontes"
- [ ] App **extrai palavras-chave** dos slides (automático) + **busca nas fontes carregadas**
- [ ] Retorna sugestões por slide:
  - "Novo estudo encontrado: [título] ([ano]) — adicionar?"
  - "Dado desatualizado: Seu slide diz X, mas [fonte] menciona Y"
  - "Gap pedagógico: Você mencionou A, mas não fundamenta em B — sugerir complementação?"
- [ ] **CRÍTICO**: Sugestões devem **preservar a voz e pedagogia da Profa** — não substitui perguntas por respostas, não mascara dúvidas

### 4. Validação & Aplicação (Dois Modos)
**Modo A — Passo-a-Passo (Padrão)**
- [ ] Cada sugestão aparece como card
- [ ] Profa: aprova (✓), rejeita (✗), ou edita (✏️) antes de aplicar
- [ ] Sugestão aprovada é inserida no slide com marcação de "fonte" (data, arquivo)
- [ ] Próxima sugestão aparece
- [ ] Progresso visual (X de Y sugestões processadas)

**Modo B — Validação Final**
- [ ] App aplica *todas* as sugestões simultaneamente (mas marcadas como "em revisão")
- [ ] Profa visualiza slide completo com mudanças destacadas
- [ ] Pode rejeitar mudanças em massa ou uma por uma
- [ ] Confirma ao final

- [ ] **Undo/Redo**: últimas 20 ações, qualquer momento
- [ ] **Histórico de mudanças**: timeline com quem sugeriu o quê, quando

### 5. Preview & Exportação
- [ ] Visualizar slides atualizados (carousel antes/depois)
- [ ] **Exportar como PPTX**: mantém formatação original + marcações de fontes
- [ ] **Exportar como PDF**: para compartilhamento/impressão
- [ ] **Salvar projeto**: backup automático em localStorage + download JSON manual
- [ ] Feedback visual de sucesso

---

## ESTRUTURA DE DADOS (LocalStorage)

```json
{
  "projects": [
    {
      "id": "uuid-xxx",
      "name": "Estomatologia 1 - 2026",
      "discipline": "estomatologia1",
      "createdAt": "2026-07-11T...",
      "updatedAt": "2026-07-11T...",
      "sources": [
        {
          "id": "source-001",
          "name": "Stephen Sonis - OM Review 2024.pdf",
          "type": "pdf",
          "uploadedAt": "2026-07-11T...",
          "fileSize": 2048000,
          "metadata": {
            "pages": 42,
            "extractedText": "..."
          }
        }
      ],
      "slides": [
        {
          "id": "slide-001",
          "order": 1,
          "title": "Mucosite Oral - Definição e Epidemiologia",
          "originalContent": "...",
          "currentContent": "...",
          "keywords": ["mucosite", "rádio-induzida", "quimio-induzida"],
          "suggestions": [
            {
              "id": "sugg-001",
              "type": "add_citation",
              "sourceId": "source-001",
              "suggestedText": "Novo estudo de Sonis (2024) indica...",
              "reason": "Complementa discussão sobre mecanismo",
              "status": "pending|approved|rejected",
              "appliedAt": "2026-07-11T..." | null
            }
          ],
          "appliedChanges": [
            {
              "id": "change-001",
              "timestamp": "2026-07-11T...",
              "type": "add_citation",
              "sourceId": "source-001",
              "insertedText": "...",
              "position": "after_paragraph_3"
            }
          ]
        }
      ],
      "settings": {
        "validationMode": "step-by-step|final-review",
        "preferredExportFormat": "pptx"
      },
      "changelog": [
        {
          "timestamp": "2026-07-11T...",
          "action": "source_added|suggestion_approved|change_applied",
          "slideId": "slide-001",
          "details": "..."
        }
      ]
    }
  ]
}
```

---

## COMPONENTES OBRIGATÓRIOS

1. **Navbar/Header**: Logo, título do projeto, menu principal (Home, Settings, Export)
2. **Sidebar**: 
   - Listagem de slides com navegação
   - Lista de fontes carregadas (com ícone de tipo)
   - Botão "Adicionar Fontes"
3. **Source Manager Panel**: 
   - Upload de múltiplos arquivos (drag-drop)
   - Visualização de fontes carregadas
   - Preview de PDFs (pdf.js)
   - Remover fonte
4. **Slide Editor**: 
   - Editor de texto simples (rich text básico)
   - Visualização de conteúdo original vs. atual
   - Edição inline de sugestões aprovadas
5. **Suggestions Panel**: 
   - Modo A: Exibe sugestões uma por uma (card)
     - Botões: Aprovar (✓), Rejeitar (✗), Editar (✏️)
     - Mostra fonte da sugestão
   - Modo B: Lista todas as sugestões com status
6. **Slide Preview**: 
   - Visualização lado-a-lado: Antes | Depois
   - Highlightings de mudanças
7. **Export Modal**: Opções PPTX e PDF com progresso
8. **Settings Panel**: Modo de validação, disciplina, nome do projeto
9. **History/Changelog**: Timeline de mudanças com undo/redo (últimas 20 ações)
10. **Toast/Notification System**: Feedback visual para todas as ações

---

## PROCESSAMENTO LOCAL DE FONTES

### Extração de Texto
- **PDFs**: Usar `pdf.js` (pdfjs-dist) para extrair texto pagina por pagina
- **Imagens**: Aceitar visualização mas sem OCR obrigatório (OCR é opcional para futuro)
- **Texto/Markdown**: Armazenar como strings direto

### Busca nas Fontes
- **Algoritmo**: 
  1. App extrai palavras-chave do slide (usando simple tokenization)
  2. Busca ocorrências nas fontes carregadas (busca exata ou fuzzy string matching)
  3. Retorna snippets de contexto (ex: 50 palavras antes + depois)
  4. Apresenta ao usuário como "encontrado em [fonte], página X"
- **Sem busca em nuvem, sem APIs externas** — tudo roda no navegador

### Análise de Gaps & Complementações
- App sugere: "Esta seção menciona X mas não cita [fonte Y que fala sobre X]"
- Profa decide se quer adicionar referência ou não

---

## CRITÉRIOS DE ACEITAÇÃO (Checklist)

### Funcionalidade
- [ ] Profa consegue criar novo projeto (nome, disciplina)
- [ ] Carrega PPTX base e app extrai slides corretamente
- [ ] Upload múltiplo de fontes (PDFs, imagens, .txt, .md) sem erros
- [ ] Preview de PDFs funciona (pdf.js)
- [ ] App extrai palavras-chave dos slides
- [ ] Busca nas fontes retorna snippets relevantes
- [ ] Sugestões aparecem com informação de fonte
- [ ] Modo A funciona: aprova/rejeita/edita sugestões passo-a-passo
- [ ] Modo B funciona: visualiza todas as sugestões de uma vez
- [ ] Sugestões aprovadas são inseridas corretamente no slide
- [ ] Undo/Redo funciona (últimas 20 ações)
- [ ] Dados salvam em localStorage sem perder ao refresh
- [ ] Exportação PPTX funciona (preserva formatação original)
- [ ] Exportação PDF funciona (para compartilhamento)
- [ ] Backup JSON (export/import de projetos)

### Design & UX
- [ ] Interface segue **exatamente** o design system anexado
- [ ] Responsivo (desktop 1280px+, tablet 768px+, mobile 375px+)
- [ ] Sem erros de console
- [ ] Loading states para upload e análise
- [ ] Feedback visual claro (toasts, badges, highlights de mudanças)
- [ ] Acessibilidade básica (ARIA labels, contraste WCAG AA, keyboard nav)
- [ ] Dark mode (se design system oferecer)
- [ ] **VOZ PEDAGÓGICA**: Sugestões não substituem perguntas por respostas; preservam espaço para raciocínio da Profa

### Performance
- [ ] Carregamento inicial < 3s
- [ ] Análise de fontes responsiva (< 5s para PDF 10MB)
- [ ] Nenhum memory leak detectável
- [ ] LocalStorage compactado se > 5MB
- [ ] Lazy loading de PDFs

### Robustez
- [ ] Trata upload de arquivos inválidos com mensagens úteis
- [ ] Trata PDFs corrompidos gracefully
- [ ] Undo/Redo sem perda de dados
- [ ] Persistência automática (nada se perde ao fechar)
- [ ] Sanitização de conteúdo (XSS prevention)
- [ ] Sem dependência de serviços externos

---

## INSTRUÇÕES DE EXECUÇÃO

1. **Crie a estrutura completa** em um único repositório (SPA auto-contida)
2. **Implemente features na ordem**: Onboarding → Editor → Literature Search → Design Suggestions → Export
3. **Test end-to-end** antes de entregar (user journeys completos)
4. **Entregue**:
   - Código-fonte (React/TS + Tailwind, bem estruturado)
   - README com setup local (npm install, npm run dev)
   - Arquivo `.env.example` (se houver chaves de API)
   - Instruções de export/importação de projetos
   - Documentação de componentes (Storybook, JSDoc ou inline)
5. **Nenhuma tarefa incompleta**. Se algo não for possível, documente e proponha alternativa viável.

---

## NOTAS CRÍTICAS

- **Design System é lei**: Nenhuma divergência visual. Se houver dúvida, estenda coerentemente dentro do system.
- **Dados nunca se perdem**: LocalStorage é a única fonte de verdade. Auto-save a cada mudança.
- **Zero dependência externa**: Nenhuma chamada HTTP, nenhuma API. Tudo roda no navegador.
- **Voz pedagógica é inviolável**: Sugestões complementam, não substituem. Nunca substitua perguntas por respostas. Profa mantém controle total.
- **Acessibilidade não é opcional**: Keyboard nav, screen reader support, ARIA labels.
- **Exportação é crítica**: PPTX mantém formatação original + marcações de fonte. PDF preserva leitura.

---

## REFERÊNCIA AO DESIGN SYSTEM

**O design system visual será anexado ou referenciado quando este prompt for executado.**

Quando anexado, leia-o completamente e use como verdade absoluta para:
- Cores (primária, secundária, neutras, semânticas)
- Tipografia (fontes, tamanhos, pesos, line-heights, letter-spacing)
- Spacing/grid (unidades, escalas, margem/padding)
- Componentes reutilizáveis (botões, inputs, cards, modals, abas, alerts, etc.)
- Estados (hover, active, disabled, loading, focus, error, success)
- Ícones (se houver set específico)
- Animações/transições (timing, easing, duração)
- Responsividade (breakpoints, comportamento adaptativo)

---

## FIM DO BRIEFING

Comece agora: **Faça 1–2 perguntas cirúrgicas antes de começar a implementar** para garantir que entendeu os requisitos. Depois, implemente sem parar até o app estar 100% funcional e pronto para produção.

**Não há margem para falhas. Cada feature deve funcionar end-to-end.**
