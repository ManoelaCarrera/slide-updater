# Guia Rápido de Testes — Fase 1

Teste as 3 features implementadas em ordem (10-15 min por feature).

---

## Pré-requisito

```bash
cd slide-updater
npm install
npm run dev
# Acessa http://localhost:5173
```

---

## Feature 1: Undo/Redo (5 min)

### Setup
1. Abrir app em http://localhost:5173
2. Click "+ Novo Projeto"
3. Nomear "TestUndo"
4. Click em projeto para selecionar

### Teste 1: Criar e Desfazer
```
1. Click "Adicionar Slide"
2. Edit título: "Slide 1"
3. Edit conteúdo: "Teste undo"
4. Observe ↶ button ativa (antes estava desabilitada)
5. Click ↶ Desfazer
6. Verificar: Slide desapareceu, ↷ button agora ativa
✅ PASS se slide removido e redo disponível
```

### Teste 2: Refazer
```
1. Click ↷ Refazer
2. Verificar: Slide "Slide 1" reaparece
✅ PASS se slide volta
```

### Teste 3: Múltiplas Ações
```
1. Fazer 3 edições diferentes (editar título/conteúdo 3x)
2. Click ↶ 3x rápido
3. Verificar: Volta 3 edições em ordem LIFO
✅ PASS se volta em ordem correta
```

### Teste 4: Limpar Redo ao Fazer Nova Ação
```
1. Click ↶ para desfazer
2. Fazer nova edição
3. Verificar: ↷ button desabilitada (redo limpo)
✅ PASS se redo foi limpo
```

---

## Feature 2: File Upload (5 min)

### Setup
1. Criar novo projeto "TestUpload"
2. Click "Importar Slides" (modal abre)

### Teste 1: Upload TXT
```
Criar arquivo test.txt com:
---
Mucosite oral: definição
Fatores de risco em câncer
Métodos de prevenção
---

1. Drag test.txt para modal
2. Esperar processamento (vê spinner)
3. Verificar: 3 slides criados na sidebar
4. Click slide → verificar conteúdo
✅ PASS se 3 slides aparecem com conteúdo correto
```

### Teste 2: Verificar originalContent
```
1. Click primeiro slide
2. Abrir DevTools (F12) → Console
3. Executar: console.log(document.querySelector('[data-testid="slide-content"]')?.textContent)
4. Verificar: Conteúdo original está lá
✅ PASS se originalContent preservado
```

### Teste 3: Upload PDF (se disponível)
```
1. Criar PDF simples com 2 páginas
2. Drag PDF para modal
3. Esperar processamento
4. Verificar: Slides criados (quantidade depende do parser)
✅ PASS se não crasheia, slides criados ou erro amigável
```

### Teste 4: Erro Gracioso
```
1. Tentar upload de arquivo .exe ou .bin
2. Verificar: Toast error "Formato de arquivo não suportado"
3. App continua funcionando
✅ PASS se erro amigável, sem crash
```

---

## Feature 3: Export PPTX (5 min)

### Setup
1. Criar projeto "TestExport"
2. Adicionar 2 slides:
   - Slide 1: "Mucosite Oral" | "Definição e etiologia"
   - Slide 2: "Prevenção" | "Métodos eficazes"
3. Click "Buscar Literatura" (aguarda 30s+ para PubMed)
4. Adicionar 4 artigos manualmente ou do resultado
5. Aprovar 2 artigos (checkbox ✓)

### Teste 1: Export Básico
```
1. Click "📊 Exportar como PPTX"
2. Esperar "Exportado como PPTX com sucesso!" toast
3. Verificar: Arquivo baixado (.pptx)
✅ PASS se arquivo criado
```

### Teste 2: Validar Cores e Design
```
1. Abrir .pptx em PowerPoint/LibreOffice
2. Verificar:
   - Título "Mucosite Oral" em terracota (#c17847)
   - Conteúdo em marrom escuro
   - Fundo em bege claro
   - Linha decorativa terracota sob título
✅ PASS se cores corretas
```

### Teste 3: Apenas Literatura Aprovada
```
1. Em PowerPoint, ir para "Referências Utilizadas"
2. Contar quantas referências aparecem
3. Verificar: Apenas 2 aparecem (as aprovadas)
4. NÃO devem aparecer as 2 não-aprovadas
✅ PASS se apenas aprovadas no PPTX
```

### Teste 4: Numeração de Slides
```
1. Em PowerPoint, verificar rodapé de cada slide
2. Slide 1 → "1" no canto inferior direito
3. Slide 2 → "2" no canto inferior direito
✅ PASS se números aparecem
```

---

## Sumário de Testes

### Undo/Redo
- [ ] Desfazer remove ação anterior
- [ ] Refazer restaura ação
- [ ] Múltiplas ações em LIFO
- [ ] Nova ação limpa redo

### File Upload
- [ ] TXT: 3 linhas = 3 slides
- [ ] originalContent preservado
- [ ] PDF: fallback simples
- [ ] Erro gracioso em formato inválido

### Export PPTX
- [ ] Arquivo .pptx criado
- [ ] Cores terracota/marrom/bege
- [ ] Apenas referências aprovadas
- [ ] Números de slide no rodapé

**Se todos 12 testes passarem: ✅ FASE 1 VALIDADA**

---

## Troubleshooting

### App não carrega
```
1. npm install (instalar deps)
2. npm run dev (restart dev server)
3. Limpar cache: rm -rf node_modules/.vite
```

### undo/redo não funciona
```
1. F12 → Application → LocalStorage
2. Verificar slideUpdater_undoStack existe
3. Se não: limpar localStorage e tentar de novo
```

### File upload erro
```
1. Verificar que arquivo é .txt válido (UTF-8)
2. Se PDF: tente com .txt primeiro
3. Arquivo vazio? Adicione conteúdo
```

### PPTX não exporta
```
1. Verificar que há slides criados
2. Verificar que há literatura (aprovada ou não)
3. Se erro pptxgen: tente novamente (lib pode estar carregando)
```

---

## Tempo Total

| Feature | Tempo |
|---------|-------|
| Undo/Redo | 5 min |
| File Upload | 5 min |
| Export PPTX | 5 min |
| **Total** | **~15 min** |

---

**Status:** Pronto para testes manuais  
**Data:** 2026-07-11
