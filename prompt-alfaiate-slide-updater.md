# Prompt-Alfaiate: App de Atualização de Slides com Literatura Científica

> **Uso**: Cole este prompt integralmente quando quiser que o Arquiteto de Apps crie o aplicativo de atualização de slides. Anexe o Design System quando solicitado.

---

## BRIEFING EXECUTIVO

Crie um **aplicativo web (SPA) de atualização dinâmica de slides de aulas** 100% funcional, pronto para produção, que:

- Permite que docentes carreguem ou importem slides existentes
- Integra-se com Pubmed, Scopus e Web of Science para encontrar literatura científica recente
- Sugere atualizações de conteúdo (novos estudos, descobertas, mudanças no estado da arte)
- Propõe melhorias no design dos slides (modernização visual, reorganização)
- Aplica automaticamente updates de conteúdo e design
- Armazena tudo localmente (LocalStorage) — sem backend complexo
- Exporta slides atualizados em formato padrão (PDF, PPTX, ou HTML)

**Design System**: Utiliza exatamente o design system visual anexado a este prompt como verdade absoluta para cores, tipografia, spacing, componentes e estados.

---

## REQUISITOS TÉCNICOS

### Stack Obrigatória
- **Frontend**: React 18+ (TypeScript, Vite ou Next.js)
- **Styling**: Tailwind CSS
- **State Management**: React Context + LocalStorage (sem Redux, sem servidor)
- **APIs Externas**:
  - PubMed Central API (gratuita, sem autenticação)
  - Scopus API (requer chave; fallback local se não houver)
  - Web of Science (requer chave; fallback local se não houver)
- **Armazenamento Local**: localStorage (máx 5-10MB; compactar com gzip se necessário)
- **Exportação**: html2pdf + pptxgen (para PPTX)

### Proibições Explícitas
- ❌ Sem backend Node, Python ou qualquer servidor externo
- ❌ Sem autenticação de usuário (opcional: suportar export/import de projetos)
- ❌ Sem banco de dados remoto
- ❌ Sem dependências pesadas ou bibliotecas não testadas

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

### 1. Onboarding & Upload
- [ ] Usuário acessa a app
- [ ] Botão "Criar Novo Projeto" ou "Carregar Slides"
- [ ] Upload de arquivo (PDF, imagem, ou descrição de tópicos)
- [ ] Parser básico: extrai texto dos slides ou aceita texto direto
- [ ] Slide preview e edição manual de conteúdo
- [ ] Usuário pode revisar e ajustar antes de prosseguir

### 2. Análise de Literatura
- [ ] Usuário clica "Buscar Atualizações"
- [ ] App extrai palavras-chave dos slides (automático ou manual)
- [ ] Faz buscas paralelas em Pubmed, Scopus, Web of Science
- [ ] Retorna top 5-10 artigos relevantes por slide/tema
- [ ] Mostra: título, autores, ano, abstract resumido, link
- [ ] Loading states claros durante busca
- [ ] Tratamento de erros gracioso (fallback, mensagens úteis)

### 3. Sugestões de Atualização de Conteúdo
- [ ] App oferece sugestões por slide: "Adicionar citação", "Atualizar dado", "Mencionar novo estudo"
- [ ] Usuário revisa e aprova/rejeita cada sugestão (checkboxes)
- [ ] Sugestões aprovadas são insertas no slide
- [ ] Histórico de mudanças: undo/redo (últimas 20 ações)
- [ ] Visual feedback de cada ação

### 4. Sugestões de Design
- [ ] Análise básica: "Seu slide tem muito texto", "Falta visualização", "Cores monótonas"
- [ ] Propostas:
  - Rearranjar layout
  - Inserir gráfico/diagrama baseado em dados
  - Melhorar tipografia (contraste, hierarquia)
  - Sugerir cores alternativas (usando design system)
- [ ] User aceita proposta ou customiza manualmente

### 5. Preview e Exportação
- [ ] Visualizar slides atualizados (carousel ou thumbnail grid)
- [ ] Exportar como: PDF, PPTX, ou HTML interativo
- [ ] Salvar projeto localmente (localStorage com backup)
- [ ] Opção: Download de backup JSON (para reimportação)
- [ ] Feedback visual confirmando sucesso de export

---

## ESTRUTURA DE DADOS (LocalStorage)

```json
{
  "projects": [
    {
      "id": "uuid-xxx",
      "name": "Biologia 101 - 2026",
      "createdAt": "2026-07-11T...",
      "updatedAt": "2026-07-11T...",
      "slides": [
        {
          "id": "slide-001",
          "title": "Introdução à Genética",
          "originalContent": "...",
          "currentContent": "...",
          "keywords": ["gene", "DNA", "herança"],
          "literatureUpdates": [
            {
              "id": "lit-001",
              "source": "pubmed",
              "title": "...",
              "year": 2026,
              "authors": "...",
              "pmid": "...",
              "abstract": "...",
              "url": "...",
              "approved": true,
              "insertedAt": "2026-07-11T..."
            }
          ],
          "designNotes": {
            "lastUpdated": "2026-07-11T...",
            "suggestions": [],
            "appliedChanges": []
          },
          "exportFormats": {
            "pdf": "blob-url-xxx",
            "pptx": "blob-url-xxx"
          }
        }
      ],
      "settings": {
        "autoUpdateFrequency": "weekly",
        "preferredExportFormat": "pdf"
      },
      "changelog": [
        {
          "timestamp": "2026-07-11T...",
          "action": "added_literature",
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

1. **Navbar/Header**: Logo, título do projeto, menu principal (Home, Settings, Help)
2. **Sidebar**: Listagem de slides, filtros, configurações
3. **Slide Editor**: Editor WYSIWYG simples (rich text + imagem, inline)
4. **Literature Panel**: Exibe artigos encontrados, com botões aprovar/descartar, expandir abstract
5. **Design Suggester**: Mostra propostas de redesign com previews
6. **Preview**: Visualiza slide atualizado em tempo real (lado a lado: antes/depois)
7. **Export Modal**: Opções de exportação (PDF/PPTX/HTML) com progresso
8. **Settings Panel**: Frequência de atualização, chaves de API (opcional)
9. **History/Changelog**: Timeline de todas as mudanças feitas, com botões undo/redo
10. **Toast/Notification System**: Feedback visual para todas as ações async

---

## INTEGRAÇÕES DE API

### PubMed
- **Endpoint**: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi`
- Busca por keyword + year filter
- Retorna PMIDs; depois faz fetch de abstracts via `efetch`
- Sem autenticação (rate limit: ~1 req/seg)
- Tratamento de retry automático para timeouts

### Scopus
- **Endpoint**: `https://api.elsevier.com/content/search/scopus`
- Requer API key (armazenar em localStorage como opcional)
- Se a key não existir, desabilitar gracefully ou usar fallback
- Busca por query, retorna títulos + citações

### Web of Science
- Requer credenciais
- Se não houver, desabilitar gracefully
- Fallback: buscar no PubMed apenas

**Nota Importante**: Todas as buscas devem ser assíncronas, com loading indicador e tratamento de erro. Implementar retry logic e graceful degradation se uma base falhar.

---

## CRITÉRIOS DE ACEITAÇÃO (Checklist)

### Funcionalidade
- [x] Usuário consegue criar novo projeto ou carregar slides (texto/imagem/PDF)
- [x] App busca literatura em Pubmed sem erros
- [x] Sugestões aparecem ordenadas por relevância (ano + citações + match score)
- [x] Usuário pode aceitar/rejeitar/editar sugestões
- [x] Conteúdo atualizado é inserido corretamente nos slides
- [x] Design suggestions aparecem e são aplicáveis
- [x] Dados salvam em localStorage sem perder ao refresh
- [x] Exportação funciona (PDF e PPTX com formatação respeitada)
- [x] Undo/Redo funciona (últimas 20 ações, com histórico visual)
- [x] Compartilhamento/export de projetos (JSON backup)

### Design & UX
- [x] Interface segue **exatamente** o design system anexado
- [x] Responsivo (desktop 1280px+, tablet 768px+, mobile 375px+)
- [x] Sem erros de console (warnings aceitáveis)
- [x] Loading states em todas as ações async (spinners, skeleton screens)
- [x] Feedbacks visuais claros (toasts, badges, state changes)
- [x] Acessibilidade básica (ARIA labels, contraste WCAG AA, keyboard nav)
- [x] Dark mode (se design system oferecer, automaticamente detectado)

### Performance
- [x] Carregamento inicial < 2s (conexão 4G, Lighthouse score > 80)
- [x] Busca de literatura responsiva < 5s
- [x] Nenhum memory leak detectável (dev tools)
- [x] LocalStorage compactado (gzip) se > 1MB
- [x] Lazy loading de imagens e componentes

### Robustez
- [x] Trata erros de API (fallback, retry, mensagens claras)
- [x] Trata arquivos inválidos (upload, parsing) com feedback útil
- [x] Undo/Redo funciona sem perda de dados
- [x] Sem perda de dados ao fechar/reabrir app (persistência automática)
- [x] Validação de entrada (sanitize de conteúdo, XSS prevention)
- [x] Rate limiting respeito (não sobrecarregar APIs)

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

- **Design System é lei**: Nenhuma divergência visual. Se houver dúvida, estenda coerentemente dentro do system, nunca contra ele.
- **Dados nunca se perdem**: LocalStorage é a única fonte de verdade. Implemente auto-save a cada mudança.
- **APIs são optativas no setup**: O app deve funcionar offline se o usuário não configurar keys de Scopus/WoS.
- **Acessibilidade não é opcional**: Keyboard nav, screen reader support, ARIA labels em todos os components interativos.
- **Exportação é crítica**: PDF e PPTX devem ser pixel-perfect conforme design system.

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
