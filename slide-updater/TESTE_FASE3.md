# Teste Rápido — Fase 3

## Pré-requisitos

```bash
cd slide-updater
npm install
npm run dev
```

Browser abrir em `http://localhost:5173`

---

## Feature 8: Rich Text Editor

### Teste 1: Bold/Italic/Underline
1. Novo projeto → Novo slide
2. Na aba **Editar**, clique em conteúdo
3. Digite: `teste de formatação`
4. Selecione a palavra "teste"
5. Clique no botão **B** → vire `<strong>teste</strong>`
6. Selecione "formatação", clique **I** → vire `<em>formatação</em>`
7. ✅ **PASS**: HTML gerado corretamente

### Teste 2: Links
1. Digite: `Leia o artigo`
2. Selecione "artigo"
3. Clique 🔗 **Link**
4. Insira: `https://pubmed.ncbi.nlm.nih.gov/12345`
5. Clique OK
6. ✅ **PASS**: `<a href="...">artigo</a>` criado

### Teste 3: Headings
1. Selecione "título do slide"
2. Dropdown → "Título H2"
3. Clique no botão
4. ✅ **PASS**: Texto muda para `<h2>...</h2>`

### Teste 4: Listas
1. Click em "• Lista" (bullet)
2. Digite primeiro item
3. Enter → próximo item
4. Click em "1. Lista" (numerado)
5. ✅ **PASS**: `<ul>` e `<ol>` alternam

### Teste 5: Word Count
1. Digite 100+ palavras no editor
2. Rodapé mostra: "X caracteres / Y palavras"
3. ✅ **PASS**: Contador atualiza em tempo real

---

## Feature 9: Scopus Fallback

### Teste 1: Busca sem Scopus (PubMed só)
1. Novo slide com conteúdo: "mucositis oral cancer"
2. Clique **🔍 Buscar Literatura**
3. Aguarde resposta
4. ✅ **PASS**: Resultados mostram badge "🔍 PubMed"

### Teste 2: Configurar Scopus API Key
1. Clique ⚙️ (Configurações) no canto superior direito
2. Seção "Chave de API Scopus"
3. Clique **Adicionar Chave**
4. Insira uma chave de teste (fake: `test-key-123`)
5. Clique **Salvar**
6. ✅ **PASS**: Mensagem "✓ Scopus habilitado (***...123)"

### Teste 3: Fallback com Scopus inválido
1. Com a chave fake ainda ativa, busque literatura
2. Sistema tentará Scopus, falhará, fallback para PubMed
3. ✅ **PASS**: Resultados PubMed aparecem (mesmo com Scopus falho)

### Teste 4: Remover Scopus Key
1. Aba ⚙️ → "Remover"
2. ✅ **PASS**: Status volta para "Adicionar Chave"

### Teste 5: Cache + Dedup
1. Busque "cancer research" 2x consecutivas
2. Segunda busca deve vir do cache (log: "Cache hit")
3. ✅ **PASS**: Resposta instantânea

---

## Feature 10: Acessibilidade WCAG AA

### Teste 1: Keyboard Navigation
1. Abra app
2. Pressione **Tab** repetidamente
3. Visível: focus com outline 3px marrom
4. ✅ **PASS**: Todos botões/inputs recebem focus

### Teste 2: ARIA Labels (VoiceOver/NVDA)
**Mac:**
1. System Preferences → Accessibility → VoiceOver → Ativar
2. Ctrl+Alt+Right-arrow = next element
3. Ouve: "Desfazer última ação, botão"
4. ✅ **PASS**: Labels corretos

**Windows (NVDA):**
1. Baixar NVDA de https://www.nvaccess.org
2. Iniciar
3. Tecla NVDA + Tab = próximo elemento
4. Ouve: "Botão, Buscar literatura relacionada"
5. ✅ **PASS**: Labels descritivos

### Teste 3: Focus Visible
1. Tab até um botão
2. Outline 3px marrom aparece ao redor
3. Chrome DevTools → :focus-visible CSS ativo
4. ✅ **PASS**: Foco visível sem ambiguidade

### Teste 4: Contraste (Lighthouse)
1. Chrome DevTools → Lighthouse → Accessibility
2. Run audit
3. ✅ **PASS**: Score ≥ 95, 0 contrast violations

### Teste 5: axe DevTools
1. Firefox: Install axe DevTools
2. Right-click → Scan this page
3. Results → 0 Violations (WCAG AA)
4. ✅ **PASS**: Accessibility audit limpo

### Teste 6: Dark Mode
1. System Preferences → Appearance → Dark (Mac)
   OU Settings → Colors → Dark (Windows)
2. Recarregar página
3. ✅ **PASS**: UI legível, focus outline ainda visível

### Teste 7: High Contrast Mode
1. Mac: System Preferences → Accessibility → Display → Increase Contrast
2. Windows: Settings → Ease of Access → Display → High Contrast
3. Recarregar
4. Focus outline mais espesso (4px)
5. ✅ **PASS**: Outline mais proeminente

### Teste 8: Reduced Motion
1. Mac: System Preferences → Accessibility → Display → Reduce Motion
2. Windows: Settings → Ease of Access → Display → Show animations
3. Clique em abas, transições não animam
4. ✅ **PASS**: Animações eliminadas

---

## Teste Integrado (Todos Features)

### Workflow Completo:
1. **Criar projeto** + slide
2. **Digitar conteúdo** em rich text editor:
   - "Estudamos **câncer oral** em *mucosa*"
3. **Formatar**: bold Câncer, italic mucosa
4. **Inserir link** para PubMed (https://pubmed.ncbi.nlm.nih.gov)
5. **Buscar literatura** → keywords extraído automaticamente
6. **Revisar resultados** → PubMed badges visíveis
7. **Configurar Scopus** (opcional) → fallback automático
8. **Exportar PPTX**
9. **Verificar a11y** com axe/Lighthouse

**Resultado esperado:**
- ✅ Rich text preservado em HTML
- ✅ Literatura com deduplicate
- ✅ Scopus fallback funcionando
- ✅ 0 violations de a11y
- ✅ PPTX com formatação

---

## Debugging

### RichText não funciona?
```javascript
// Console: verificar HTML
console.log(document.querySelector('[role="textbox"]').innerHTML)
```

### Scopus sem resposta?
```javascript
// Console: check API key
console.log(localStorage.getItem('app-settings'))
```

### A11y failing?
```javascript
// Lighthouse
DevTools → Lighthouse → Accessibility → Run
// axe
Firefox: axe DevTools extension
```

---

## Contato

Issues/PRs no repositório:  
`https://github.com/[owner]/slide-updater`
