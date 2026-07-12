import React, { createContext, useContext, useCallback, ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { generateId } from '../utils/helpers'
import {
  AppState,
  ChangelogEntry,
  Discipline,
  HistorySnapshot,
  Project,
  ProjectSettings,
  Slide,
  Source,
  Suggestion,
  ValidationMode,
} from '../types'

const MAX_HISTORY = 20

const emptyAppState: AppState = {
  projects: [],
  currentProjectId: null,
  currentSlideId: null,
}

function defaultSettings(): ProjectSettings {
  return {
    validationMode: 'step-by-step',
    preferredExportFormat: 'pptx',
  }
}

interface ProjectContextValue {
  projects: Project[]
  currentProjectId: string | null
  currentSlideId: string | null

  createProject: (name: string, discipline: Discipline) => void
  deleteProject: (id: string) => void
  selectProject: (id: string) => void
  updateProject: (id: string, data: Partial<Project>) => void
  updateSettings: (projectId: string, settings: Partial<ProjectSettings>) => void

  addSource: (projectId: string, source: Source) => void
  removeSource: (projectId: string, sourceId: string) => void

  addSlide: (projectId: string, slide: Omit<Slide, 'id'>) => void
  updateSlide: (projectId: string, slideId: string, data: Partial<Slide>) => void
  deleteSlide: (projectId: string, slideId: string) => void
  reorderSlides: (projectId: string, orderedSlideIds: string[]) => void
  selectSlide: (slideId: string | null) => void

  setSlideSuggestions: (
    projectId: string,
    slideId: string,
    keywords: string[],
    suggestions: Array<Omit<Suggestion, 'id' | 'status' | 'appliedAt'>>
  ) => void
  applySuggestion: (projectId: string, slideId: string, suggestionId: string) => void
  rejectSuggestion: (projectId: string, slideId: string, suggestionId: string) => void
  editSuggestion: (projectId: string, slideId: string, suggestionId: string, newText: string) => void

  addChangelog: (projectId: string, entry: Omit<ChangelogEntry, 'timestamp'>) => void

  getCurrentProject: () => Project | null
  getCurrentSlide: () => Slide | null

  importProject: (project: Project) => void

  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  getHistory: () => HistorySnapshot[]
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [appState, setAppState] = useLocalStorage<AppState>('slideUpdater_appState', emptyAppState)
  const [undoStack, setUndoStack] = useLocalStorage<HistorySnapshot[]>('slideUpdater_undoStack', [])
  const [redoStack, setRedoStack] = useLocalStorage<HistorySnapshot[]>('slideUpdater_redoStack', [])

  const createSnapshot = useCallback(
    (description: string): HistorySnapshot => ({
      timestamp: new Date().toISOString(),
      projectId: appState.currentProjectId || '',
      appState: JSON.parse(JSON.stringify(appState)),
      description,
    }),
    [appState]
  )

  const pushToUndoStack = useCallback(
    (description: string) => {
      const snapshot = createSnapshot(description)
      setUndoStack([snapshot, ...undoStack].slice(0, MAX_HISTORY))
      setRedoStack([])
    },
    [undoStack, createSnapshot, setUndoStack, setRedoStack]
  )

  const withProjectIn = useCallback(
    (projects: Project[], projectId: string, updater: (project: Project) => Project): Project[] =>
      projects.map(p => (p.id === projectId ? updater(p) : p)),
    []
  )

  // ---- Projeto ----
  // Todos os mutadores abaixo usam a forma funcional de setAppState (prev => ...)
  // em vez de fechar sobre `appState`. Isso é essencial quando várias chamadas
  // acontecem em sequência no mesmo tick (ex.: importar N slides de um PPTX em
  // loop) — com a forma funcional, cada chamada enxerga o resultado da anterior
  // em vez de todas partirem do mesmo `appState` desatualizado e se sobrescreverem.

  const createProject = useCallback(
    (name: string, discipline: Discipline) => {
      const newProject: Project = {
        id: generateId(),
        name,
        discipline,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sources: [],
        slides: [],
        settings: defaultSettings(),
        changelog: [{ timestamp: new Date().toISOString(), action: 'created', details: `Projeto criado: ${name}` }],
      }
      setAppState(prev => ({
        ...prev,
        projects: [...prev.projects, newProject],
        currentProjectId: newProject.id,
        currentSlideId: null,
      }))
      pushToUndoStack(`Projeto criado: ${name}`)
    },
    [setAppState, pushToUndoStack]
  )

  const deleteProject = useCallback(
    (id: string) => {
      setAppState(prev => ({
        ...prev,
        projects: prev.projects.filter(p => p.id !== id),
        currentProjectId: prev.currentProjectId === id ? null : prev.currentProjectId,
        currentSlideId: prev.currentProjectId === id ? null : prev.currentSlideId,
      }))
    },
    [setAppState]
  )

  const selectProject = useCallback(
    (id: string) => {
      setAppState(prev => ({ ...prev, currentProjectId: id, currentSlideId: null }))
    },
    [setAppState]
  )

  const updateProject = useCallback(
    (id: string, data: Partial<Project>) => {
      setAppState(prev => ({
        ...prev,
        projects: withProjectIn(prev.projects, id, p => ({ ...p, ...data, updatedAt: new Date().toISOString() })),
      }))
    },
    [setAppState, withProjectIn]
  )

  const updateSettings = useCallback(
    (projectId: string, settings: Partial<ProjectSettings>) => {
      setAppState(prev => ({
        ...prev,
        projects: withProjectIn(prev.projects, projectId, p => ({
          ...p,
          settings: { ...p.settings, ...settings },
          updatedAt: new Date().toISOString(),
        })),
      }))
    },
    [setAppState, withProjectIn]
  )

  // ---- Fontes ----

  const addSource = useCallback(
    (projectId: string, source: Source) => {
      setAppState(prev => ({
        ...prev,
        projects: withProjectIn(prev.projects, projectId, p => ({
          ...p,
          sources: [...p.sources, source],
          updatedAt: new Date().toISOString(),
          changelog: [
            ...p.changelog,
            { timestamp: new Date().toISOString(), action: 'source_added', details: `Fonte adicionada: ${source.name}` },
          ],
        })),
      }))
    },
    [setAppState, withProjectIn]
  )

  const removeSource = useCallback(
    (projectId: string, sourceId: string) => {
      pushToUndoStack('Fonte removida')
      setAppState(prev => ({
        ...prev,
        projects: withProjectIn(prev.projects, projectId, p => {
          const source = p.sources.find(s => s.id === sourceId)
          return {
            ...p,
            sources: p.sources.filter(s => s.id !== sourceId),
            // sugestões pendentes que vieram dessa fonte deixam de fazer sentido
            slides: p.slides.map(s => ({
              ...s,
              suggestions: s.suggestions.filter(sug => !(sug.sourceId === sourceId && sug.status === 'pending')),
            })),
            updatedAt: new Date().toISOString(),
            changelog: [
              ...p.changelog,
              {
                timestamp: new Date().toISOString(),
                action: 'source_removed',
                details: `Fonte removida: ${source?.name || sourceId}`,
              },
            ],
          }
        }),
      }))
    },
    [setAppState, withProjectIn, pushToUndoStack]
  )

  // ---- Slides ----

  const addSlide = useCallback(
    (projectId: string, slide: Omit<Slide, 'id'>) => {
      pushToUndoStack(`Slide adicionado: ${slide.title}`)
      const newSlide: Slide = { ...slide, id: generateId() }
      setAppState(prev => ({
        ...prev,
        projects: withProjectIn(prev.projects, projectId, p => ({
          ...p,
          slides: [...p.slides, newSlide],
          updatedAt: new Date().toISOString(),
          changelog: [
            ...p.changelog,
            { timestamp: new Date().toISOString(), action: 'slide_added', slideId: newSlide.id, details: `Slide adicionado: ${newSlide.title}` },
          ],
        })),
      }))
    },
    [setAppState, withProjectIn, pushToUndoStack]
  )

  const updateSlide = useCallback(
    (projectId: string, slideId: string, data: Partial<Slide>) => {
      setAppState(prev => ({
        ...prev,
        projects: withProjectIn(prev.projects, projectId, p => ({
          ...p,
          slides: p.slides.map(s => (s.id === slideId ? { ...s, ...data } : s)),
          updatedAt: new Date().toISOString(),
        })),
      }))
    },
    [setAppState, withProjectIn]
  )

  const deleteSlide = useCallback(
    (projectId: string, slideId: string) => {
      pushToUndoStack('Slide removido')
      setAppState(prev => ({
        ...prev,
        projects: withProjectIn(prev.projects, projectId, p => ({
          ...p,
          slides: p.slides.filter(s => s.id !== slideId),
        })),
        currentSlideId: prev.currentSlideId === slideId ? null : prev.currentSlideId,
      }))
    },
    [setAppState, withProjectIn, pushToUndoStack]
  )

  const reorderSlides = useCallback(
    (projectId: string, orderedSlideIds: string[]) => {
      setAppState(prev => ({
        ...prev,
        projects: withProjectIn(prev.projects, projectId, p => ({
          ...p,
          slides: orderedSlideIds
            .map((id, idx) => {
              const slide = p.slides.find(s => s.id === id)
              return slide ? { ...slide, order: idx + 1 } : null
            })
            .filter((s): s is Slide => s !== null),
        })),
      }))
    },
    [setAppState, withProjectIn]
  )

  const selectSlide = useCallback(
    (slideId: string | null) => {
      setAppState(prev => ({ ...prev, currentSlideId: slideId }))
    },
    [setAppState]
  )

  // ---- Sugestões ----

  const setSlideSuggestions = useCallback(
    (
      projectId: string,
      slideId: string,
      keywords: string[],
      suggestions: Array<Omit<Suggestion, 'id' | 'status' | 'appliedAt'>>
    ) => {
      const fullSuggestions: Suggestion[] = suggestions.map(s => ({
        ...s,
        id: generateId(),
        status: 'pending',
        appliedAt: null,
      }))
      setAppState(prev => ({
        ...prev,
        projects: withProjectIn(prev.projects, projectId, p => ({
          ...p,
          slides: p.slides.map(s =>
            s.id === slideId
              ? {
                  ...s,
                  keywords,
                  // mantém sugestões já decididas (aprovadas/rejeitadas), substitui as pendentes
                  suggestions: [...s.suggestions.filter(sug => sug.status !== 'pending'), ...fullSuggestions],
                }
              : s
          ),
          updatedAt: new Date().toISOString(),
          changelog: [
            ...p.changelog,
            {
              timestamp: new Date().toISOString(),
              action: 'analysis_run',
              slideId,
              details: `Análise gerou ${fullSuggestions.length} sugestão(ões)`,
            },
          ],
        })),
      }))
    },
    [setAppState, withProjectIn]
  )

  const applySuggestion = useCallback(
    (projectId: string, slideId: string, suggestionId: string) => {
      setAppState(prev => {
        const project = prev.projects.find(p => p.id === projectId)
        const slide = project?.slides.find(s => s.id === slideId)
        const suggestion = slide?.suggestions.find(s => s.id === suggestionId)
        if (!project || !slide || !suggestion) return prev

        const source = project.sources.find(s => s.id === suggestion.sourceId)
        const now = new Date().toISOString()
        const insertedHtml = `<p class="suggestion-added" data-source="${suggestion.sourceId}"><em>[Fonte: ${
          source?.name || 'removida'
        }]</em> ${suggestion.suggestedText}</p>`
        const changeId = generateId()

        return {
          ...prev,
          projects: withProjectIn(prev.projects, projectId, p => ({
            ...p,
            slides: p.slides.map(s =>
              s.id === slideId
                ? {
                    ...s,
                    currentContent: `${s.currentContent || ''}${insertedHtml}`,
                    suggestions: s.suggestions.map(sug =>
                      sug.id === suggestionId ? { ...sug, status: 'approved', appliedAt: now } : sug
                    ),
                    appliedChanges: [
                      ...s.appliedChanges,
                      {
                        id: changeId,
                        timestamp: now,
                        type: suggestion.type,
                        sourceId: suggestion.sourceId,
                        insertedText: suggestion.suggestedText,
                        position: 'end_of_content',
                      },
                    ],
                  }
                : s
            ),
            updatedAt: now,
            changelog: [
              ...p.changelog,
              { timestamp: now, action: 'change_applied', slideId, details: `Sugestão aplicada (${suggestion.type})` },
            ],
          })),
        }
      })
    },
    [setAppState, withProjectIn]
  )

  const rejectSuggestion = useCallback(
    (projectId: string, slideId: string, suggestionId: string) => {
      setAppState(prev => ({
        ...prev,
        projects: withProjectIn(prev.projects, projectId, p => ({
          ...p,
          slides: p.slides.map(s =>
            s.id === slideId
              ? { ...s, suggestions: s.suggestions.map(sug => (sug.id === suggestionId ? { ...sug, status: 'rejected' } : sug)) }
              : s
          ),
          changelog: [
            ...p.changelog,
            { timestamp: new Date().toISOString(), action: 'suggestion_rejected', slideId, details: 'Sugestão rejeitada' },
          ],
        })),
      }))
    },
    [setAppState, withProjectIn]
  )

  const editSuggestion = useCallback(
    (projectId: string, slideId: string, suggestionId: string, newText: string) => {
      setAppState(prev => ({
        ...prev,
        projects: withProjectIn(prev.projects, projectId, p => ({
          ...p,
          slides: p.slides.map(s =>
            s.id === slideId
              ? { ...s, suggestions: s.suggestions.map(sug => (sug.id === suggestionId ? { ...sug, suggestedText: newText } : sug)) }
              : s
          ),
        })),
      }))
    },
    [setAppState, withProjectIn]
  )

  // ---- Changelog / util ----

  const addChangelog = useCallback(
    (projectId: string, entry: Omit<ChangelogEntry, 'timestamp'>) => {
      setAppState(prev => ({
        ...prev,
        projects: withProjectIn(prev.projects, projectId, p => ({
          ...p,
          changelog: [...p.changelog, { ...entry, timestamp: new Date().toISOString() }],
        })),
      }))
    },
    [setAppState, withProjectIn]
  )

  const getCurrentProject = useCallback(
    () => appState.projects.find(p => p.id === appState.currentProjectId) || null,
    [appState]
  )

  const getCurrentSlide = useCallback(() => {
    const project = getCurrentProject()
    return project?.slides.find(s => s.id === appState.currentSlideId) || null
  }, [appState, getCurrentProject])

  const importProject = useCallback(
    (project: Project) => {
      setAppState(prev => {
        const exists = prev.projects.some(p => p.id === project.id)
        return {
          ...prev,
          projects: exists ? withProjectIn(prev.projects, project.id, () => project) : [...prev.projects, project],
          currentProjectId: project.id,
          currentSlideId: null,
        }
      })
    },
    [setAppState, withProjectIn]
  )

  // ---- Undo/Redo ----

  const undo = useCallback(() => {
    if (undoStack.length === 0) return
    const [snapshot, ...rest] = undoStack
    setRedoStack([createSnapshot(''), ...redoStack].slice(0, MAX_HISTORY))
    setAppState(snapshot.appState)
    setUndoStack(rest)
  }, [undoStack, redoStack, setAppState, setUndoStack, setRedoStack, createSnapshot])

  const redo = useCallback(() => {
    if (redoStack.length === 0) return
    const [snapshot, ...rest] = redoStack
    setUndoStack([createSnapshot(''), ...undoStack].slice(0, MAX_HISTORY))
    setAppState(snapshot.appState)
    setRedoStack(rest)
  }, [redoStack, undoStack, setAppState, setUndoStack, setRedoStack, createSnapshot])

  const canUndo = useCallback(() => undoStack.length > 0, [undoStack])
  const canRedo = useCallback(() => redoStack.length > 0, [redoStack])
  const getHistory = useCallback(() => undoStack, [undoStack])

  const value: ProjectContextValue = {
    projects: appState.projects,
    currentProjectId: appState.currentProjectId,
    currentSlideId: appState.currentSlideId,
    createProject,
    deleteProject,
    selectProject,
    updateProject,
    updateSettings,
    addSource,
    removeSource,
    addSlide,
    updateSlide,
    deleteSlide,
    reorderSlides,
    selectSlide,
    setSlideSuggestions,
    applySuggestion,
    rejectSuggestion,
    editSuggestion,
    addChangelog,
    getCurrentProject,
    getCurrentSlide,
    importProject,
    undo,
    redo,
    canUndo,
    canRedo,
    getHistory,
  }

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export function useProject(): ProjectContextValue {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider')
  }
  return context
}
