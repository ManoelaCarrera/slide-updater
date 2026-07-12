/**
 * Plano de teste manual — Undo/Redo e histórico (v2.0)
 *
 * Sem test runner configurado (sem vitest/jest); este arquivo documenta o
 * plano de teste e é validado por `tsc` como parte de `npm run build`.
 *
 * MANUAL TEST PLAN:
 * 1. Criar projeto "Test Undo"
 * 2. Adicionar/remover slides e fontes
 * 3. Desfazer 3x → verificar se volta 3 ações
 * 4. Refazer 2x → verificar se avança 2 ações
 * 5. Fazer nova ação → verificar se a pilha de redo é limpa
 * 6. Abrir HistoryPanel → verificar timestamps e descrições
 */

interface UndoRedoTestCase {
  name: string
  steps: string[]
  expectedResult: string
  severity: 'critical' | 'high' | 'medium'
}

export const undoRedoTests: UndoRedoTestCase[] = [
  {
    name: 'Criar projeto registra no histórico',
    steps: [
      'Clicar "+ Novo Projeto"',
      'Preencher nome "Test" e disciplina',
      'Abrir DevTools → Application → LocalStorage → slideUpdater_undoStack',
    ],
    expectedResult: 'undoStack contém 1 snapshot com descrição "Projeto criado: Test"',
    severity: 'critical',
  },
  {
    name: 'Desfazer uma ação (adicionar slide)',
    steps: ['Criar projeto', 'Adicionar slide manualmente', 'Clicar ↶ Desfazer'],
    expectedResult: 'Slide é removido; redoStack passa a ter 1 item',
    severity: 'critical',
  },
  {
    name: 'Refazer uma ação',
    steps: ['Após desfazer: clicar ↷ Refazer'],
    expectedResult: 'Slide reaparece; redoStack volta a ficar vazio',
    severity: 'critical',
  },
  {
    name: 'Cadeia de múltiplos undos',
    steps: ['Criar projeto', 'Adicionar 3 slides', 'Remover uma fonte', 'Clicar ↶ 4x seguidas'],
    expectedResult: 'As 4 ações são desfeitas em ordem LIFO (a mais recente primeiro)',
    severity: 'high',
  },
  {
    name: 'Nova ação limpa a pilha de redo',
    steps: ['Criar projeto, adicionar slide', 'Desfazer (1 redo disponível)', 'Adicionar outro slide', 'Clicar ↷ Refazer'],
    expectedResult: 'Botão Refazer fica desabilitado — a nova ação limpou redoStack completamente',
    severity: 'critical',
  },
  {
    name: 'Painel de histórico mostra a linha do tempo',
    steps: ['Criar projeto "HistoryTest"', 'Adicionar fontes e slides', 'Abrir "🕘 Histórico"'],
    expectedResult:
      'Seção "Desfazer/Refazer" mostra últimas 20 ações com timestamp; seção "Linha do tempo do projeto" mostra o changelog completo',
    severity: 'medium',
  },
  {
    name: 'Desfazer desabilitado sem histórico',
    steps: ['Abrir o app com localStorage limpo', 'Verificar botão ↶ na navbar'],
    expectedResult: 'Botão desabilitado (canUndo() === false)',
    severity: 'high',
  },
  {
    name: 'Histórico persiste entre sessões',
    steps: ['Criar projeto e 3 slides', 'Verificar undoStack no localStorage', 'Recarregar a página (F5)'],
    expectedResult: 'Projeto e undoStack continuam disponíveis após o reload',
    severity: 'high',
  },
  {
    name: 'Limite de 20 snapshots (MAX_HISTORY)',
    steps: ['Realizar 25 ações que geram snapshot (ex.: adicionar 25 slides)', 'Checar undoStack.length'],
    expectedResult: 'undoStack.length === 20 (os mais antigos são descartados, FIFO)',
    severity: 'medium',
  },
]

export const undoRedoChecklist = {
  implementation: {
    'ProjectContext expõe undo/redo/canUndo/canRedo/getHistory': true,
    'HistorySnapshot tipado em types.ts': true,
    'MAX_HISTORY = 20 (conforme critério de aceitação v2.0)': true,
    'pushToUndoStack() chamado em criar projeto, adicionar/remover slide, remover fonte': true,
    'undo()/redo() restauram AppState completo a partir do snapshot': true,
  },
  ui: {
    'Navbar mostra botões ↶ e ↷ desabilitados quando vazio': true,
    'HistoryPanel mostra pilha de undo + changelog do projeto': true,
  },
  persistence: {
    'undoStack e redoStack em localStorage, sobrevivem a reload': true,
  },
}
