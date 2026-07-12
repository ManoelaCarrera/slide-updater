# Slide Updater v2.0 — Atualização de Slides com Literatura Científica

Aplicativo para a Profa (Estomatologia / Odontologia Oncológica) atualizar
slides de aula com base em literatura que ela mesma carrega — sem nenhuma
integração com PubMed, Scopus, Web of Science ou qualquer outra API externa.
Tudo roda localmente, no navegador: upload de fontes, extração de texto,
busca e geração de sugestões, edição e exportação.

## O que mudou da v1.0 para a v2.0

A v1.0 assumia buscas automáticas em bases como PubMed/Scopus. Essa
abordagem foi abandonada: exigia credenciais, dependia de disponibilidade de
serviços de terceiros e não dava controle real sobre a qualidade das fontes.
Na v2.0, a Profa baixa e carrega ela mesma os PDFs/artigos/imagens que quer
usar como referência, e o app faz busca textual local nesse material.

## Recursos

- **Projetos** por disciplina (Estomatologia 1/2, Patologia Básica, Pós-graduação)
- **Fontes de referência**: upload de PDF (extração de texto via pdf.js),
  imagem (screenshot de livro digital), .txt e .md — tudo processado no
  navegador
- **Aula base**: importação de tópicos em .txt/.md (uma linha = um slide) ou
  criação manual de slides
- **Análise & Sugestões**: busca local por palavras-chave do slide nas fontes
  carregadas, com três tipos de sugestão — nova referência, dado possivelmente
  desatualizado, gap pedagógico — sempre citando o trecho literal da fonte
- **Dois modos de validação**: passo-a-passo (aprova/rejeita/edita uma
  sugestão por vez) ou revisão final (marca várias e aplica em lote)
- **Undo/Redo** (últimas 20 ações) e linha do tempo do projeto
- **Exportação**: PPTX (com o design system e marcação de fontes), PDF e
  backup/restauração em JSON
- **Zero rede**: nenhuma chamada HTTP para serviços externos, nenhuma chave
  de API — nem da Profa, nem de ninguém

## Regra de ouro: voz pedagógica preservada

As sugestões do app **complementam, não substituem** o raciocínio já
proposto no slide. Elas nunca entregam uma resposta pronta no lugar de uma
pergunta socrática — trazem um trecho literal extraído da fonte carregada,
com uma explicação de por que pode ser útil, e é a Profa quem decide se e
como incorporar.

## Quick Start

### Requisitos
- Node.js 18+ e npm

```bash
cd slide-updater
npm install
npm run dev       # http://localhost:5173
```

### Build de produção

```bash
npm run build      # gera dist/
npm run preview    # serve o build localmente
```

## Como usar

### 1. Criar um projeto
"+ Novo Projeto" na navbar → nome + disciplina.

### 2. Carregar a aula base
"📤 Importar Aula Base" para subir um .txt/.md com um tópico por linha, ou
use "+ Slide" na barra lateral para criar slides manualmente.

### 3. Carregar fontes
"📚 Adicionar Fontes" → arraste PDFs, imagens, .txt ou .md. Cada fonte fica
listada na aba "Fontes" da barra lateral, com preview do texto extraído (ou
da imagem).

### 4. Analisar e revisar sugestões
No slide selecionado, aba "💡 Sugestões" → "Analisar Este Slide". O app
extrai palavras-chave do conteúdo e procura ocorrências nas fontes. Escolha
o modo de validação (passo-a-passo ou revisão final) em Configurações ou
direto no painel de sugestões.

### 5. Exportar
Botão "💾 Exportar": PPTX (mantém o design system e lista as fontes usadas em
cada slide), PDF, ou backup/restauração em JSON.

## Arquitetura

```
src/
├── components/         # UI (Sidebar, SourceManager, SuggestionsPanel, SlideEditor, ExportPanel, ...)
├── context/             # ProjectContext (estado global + localStorage + undo/redo)
├── hooks/                # useLocalStorage, useDebounce, useRichText
├── services/            # pdfService (pdf.js), sourceService, fileParserService, exportService
├── utils/                # keywordExtractor (TF-IDF), textSearch (busca local + sugestões), helpers
├── types.ts              # Modelo de dados (Project, Source, Slide, Suggestion, ...)
└── App.tsx
```

## O que funciona e o que não dá

- ✅ Roda 100% offline depois do build — sem servidor, sem API, sem chave
- ✅ Upload e extração de texto de PDF, imagem, .txt, .md
- ✅ Busca textual local + sugestões com trecho literal da fonte
- ✅ Exportação PPTX/PDF/JSON funcionando de ponta a ponta
- ⚠️ PDFs escaneados como imagem (sem camada de texto) não têm OCR — o app
  avisa quando não consegue extrair texto
- ⚠️ Importação automática de PPTX existente ainda não é suportada — os
  slides precisam ser criados manualmente (a exportação para PPTX funciona
  normalmente)
- ⚠️ Dados ficam no `localStorage` do navegador/dispositivo — sem
  sincronização entre computadores; use o backup JSON para levar um projeto
  de um lugar para outro

## Armazenamento

Tudo salvo em `localStorage` sob a chave `slideUpdater_appState` (mais pilhas
de undo/redo). A aba Configurações mostra o tamanho aproximado do projeto
atual; se ficar grande (muitas imagens, por exemplo), baixe um backup JSON e
considere remover fontes que não estão mais em uso.

## Privacidade

- Zero rastreamento, zero analytics
- Nenhuma chamada de rede — nem para PubMed/Scopus/WoS, nem para nenhum outro
  serviço
- Todos os arquivos carregados (PDF, imagem, texto) ficam só no navegador da
  Profa

## Design System

- Cores: terracota `#c17847` (primária), marrom escuro `#2c2416` (neutro
  900), bege `#faf8f5` (fundo)
- Tipografia: fontes do sistema
- Componentes: Button, Card, Toast, Modal — ver `src/components/`

---

**v2.0.0**
