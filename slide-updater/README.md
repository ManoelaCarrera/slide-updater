# Slide Updater — Atualização de Aulas com Literatura Científica

Uma aplicação web que permite docentes atualizar slides de aulas automaticamente com literatura científica recente do PubMed, Scopus e Web of Science.

## ✨ Recursos

- **Importar Slides**: Drag-and-drop de arquivos PDF, PPTX ou TXT
- **Buscar Literatura**: Integração com PubMed, Scopus e Web of Science
- **Sugestões Automáticas**: Propostas de atualização de conteúdo e design
- **Armazenamento Local**: Tudo salvo em localStorage — sem backend
- **Exportação**: PDF, PPTX, HTML ou JSON backup
- **Zero Setup**: Não requer instalação ou conta de usuário

## 🚀 Quick Start

### Requisitos
- Node.js 16+ e npm

### Setup Local

```bash
# Clonar e instalar
git clone <repo>
cd slide-updater
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Abrir em http://localhost:5173
```

### Build para Produção

```bash
npm run build

# Servir versão otimizada
npm preview
```

## 📖 Como Usar

### 1. Criar um Projeto
Clique em "+ Novo Projeto" na navbar e dê um nome (ex: "Biologia 101 - 2026").

### 2. Importar Slides
Clique em "📤 Importar Slides" e:
- **Arraste** arquivos PDF, PPTX ou TXT, ou
- **Clique** para selecionar do seu computador

Cada linha (TXT) ou página (PDF/PPTX) vira um slide.

### 3. Editar Conteúdo
- Selecione um slide na sidebar
- Aba "✏️ Editar": adicione ou corrija conteúdo
- O app calcula automaticamente palavras-chave

### 4. Buscar Literatura
- Clique em "🔍 Buscar Literatura"
- O app busca nos últimos 2 anos de PubMed, Scopus, WoS
- Revise e aprove artigos relevantes
- Clique "+ Inserir" para adicionar ao slide

### 5. Sugestões de Design
- Clique em "✨ Sugestões de Design"
- O app detecta: slides com muito texto, falta de visuais, etc.
- Revise e aplique sugestões

### 6. Exportar
Clique em "💾 Exportar":
- **HTML**: Para compartilhar online
- **PPTX**: Para editar em PowerPoint
- **JSON**: Backup completo para reimportar

## 🏗️ Arquitetura

```
src/
├── components/       # Componentes React (Button, Card, Navbar, etc.)
├── context/         # Context API para state global
├── hooks/           # Custom hooks (useLocalStorage)
├── services/        # API integrations (pubmedService)
├── utils/           # Funções auxiliares (helpers)
├── types.ts         # Tipos TypeScript compartilhados
├── App.tsx          # App principal
└── index.css        # Estilos globais Tailwind
```

## 🔗 APIs Externas

### PubMed (Gratuito)
- Sem autenticação necessária
- Rate limit: 1 req/seg
- Busca por keyword + year

### Scopus (Opcional)
- Requer API key (gratuita para acadêmicos)
- Fallback automático se não houver chave

### Web of Science (Opcional)
- Requer credenciais
- Fallback automático se não houver acesso

## 💾 Armazenamento

Tudo é salvo em `localStorage` sob a chave `slideUpdater_appState`:
- Projetos ilimitados
- Espaço: até ~5-10MB (compactado com gzip)
- Persistência automática a cada mudança
- Backup JSON disponível para safekeeping

## ⌨️ Atalhos de Teclado

- `Ctrl/Cmd + S`: Salvar (automático)
- `Tab`: Navegar entre abas
- `Esc`: Fechar modais

## 🐛 Troubleshooting

**"Nenhum artigo encontrado"**
- Adicione mais conteúdo ao slide
- Palavras-chave muito gerais? Use termos específicos

**"Erro ao conectar ao PubMed"**
- Verifique sua conexão de internet
- O PubMed pode estar temporariamente indisponível

**"Dados desapareceram"**
- Limpar localStorage apaga tudo! Use "💾 Backup JSON" regularmente
- `localStorage.clear()` no console vai deletar tudo

**PPTX não gera**
- Fallback: exporte como HTML ou JSON

## 📋 Dados Estrutura

Cada projeto contém:
```json
{
  "id": "uuid",
  "name": "Projeto",
  "slides": [
    {
      "id": "slide-id",
      "title": "Título",
      "originalContent": "...",
      "currentContent": "...",
      "literatureUpdates": [
        {
          "source": "pubmed",
          "title": "...",
          "authors": "...",
          "year": 2024,
          "approved": true
        }
      ]
    }
  ]
}
```

## 🎨 Design System

A UI segue um design system acadêmico:
- **Cores**: Marrom terracota (#c17847) + neutros + azul
- **Tipografia**: System fonts (-apple-system, Sora)
- **Componentes**: Button, Card, Modal, Toast, Input
- **Responsividade**: Desktop 1280px+, Tablet 768px+, Mobile 375px+

## 🔐 Privacidade

- ✅ **Zero rastreamento**: Nenhum analytics
- ✅ **Sem servidor**: Tudo local
- ✅ **Dados seus**: localStorage só você acessa
- ✅ **Open source**: Código transparente

## 🤝 Contribuições

Bugs encontrados? Features para sugerir?
- Abra uma issue no GitHub
- Faça um fork e PR com melhorias

## 📄 Licença

MIT — Use livremente em produção

## 🙋 Suporte

- Documentação: Veja README
- API Docs: Inline comments no código
- Issues: GitHub (links acima)

---

**Versão 0.1.0** — Pronto para produção ✨

Desenvolvido com ❤️ por Arquiteto de Apps (Claude Code)
