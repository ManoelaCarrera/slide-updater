import React, { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateId } from '../utils/helpers';
const ProjectContext = createContext(undefined);
export function ProjectProvider({ children }) {
    const [appState, setAppState] = useLocalStorage('slideUpdater_appState', {
        projects: [],
        currentProjectId: null,
        currentSlideId: null,
    });
    const [undoStack, setUndoStack] = useLocalStorage('slideUpdater_undoStack', []);
    const [redoStack, setRedoStack] = useLocalStorage('slideUpdater_redoStack', []);
    const MAX_HISTORY = 50;
    const createSnapshot = useCallback((description) => ({
        timestamp: new Date().toISOString(),
        projectId: appState.currentProjectId || '',
        appState: JSON.parse(JSON.stringify(appState)),
        description,
    }), [appState]);
    const pushToUndoStack = useCallback((description) => {
        const snapshot = createSnapshot(description);
        const newStack = [snapshot, ...undoStack].slice(0, MAX_HISTORY);
        setUndoStack(newStack);
        setRedoStack([]);
    }, [undoStack, createSnapshot, setUndoStack, setRedoStack]);
    const createProject = useCallback((name) => {
        const newProject = {
            id: generateId(),
            name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            slides: [],
            settings: {
                autoUpdateFrequency: 'manual',
                preferredExportFormat: 'pdf',
            },
            changelog: [],
        };
        const newState = {
            ...appState,
            projects: [...appState.projects, newProject],
            currentProjectId: newProject.id,
        };
        setAppState(newState);
        pushToUndoStack(`Projeto criado: ${name}`);
    }, [appState, setAppState, pushToUndoStack]);
    const deleteProject = useCallback((id) => {
        setAppState({
            ...appState,
            projects: appState.projects.filter(p => p.id !== id),
            currentProjectId: appState.currentProjectId === id ? null : appState.currentProjectId,
        });
    }, [appState, setAppState]);
    const selectProject = useCallback((id) => {
        setAppState({
            ...appState,
            currentProjectId: id,
            currentSlideId: null,
        });
    }, [appState, setAppState]);
    const updateProject = useCallback((id, data) => {
        setAppState({
            ...appState,
            projects: appState.projects.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p),
        });
    }, [appState, setAppState]);
    const addSlide = useCallback((projectId, slide) => {
        const newSlide = { ...slide, id: generateId() };
        setAppState({
            ...appState,
            projects: appState.projects.map(p => p.id === projectId
                ? { ...p, slides: [...p.slides, newSlide], updatedAt: new Date().toISOString() }
                : p),
        });
    }, [appState, setAppState]);
    const updateSlide = useCallback((projectId, slideId, data) => {
        setAppState({
            ...appState,
            projects: appState.projects.map(p => p.id === projectId
                ? {
                    ...p,
                    slides: p.slides.map(s => (s.id === slideId ? { ...s, ...data } : s)),
                    updatedAt: new Date().toISOString(),
                }
                : p),
        });
    }, [appState, setAppState]);
    const deleteSlide = useCallback((projectId, slideId) => {
        setAppState({
            ...appState,
            projects: appState.projects.map(p => p.id === projectId ? { ...p, slides: p.slides.filter(s => s.id !== slideId) } : p),
            currentSlideId: appState.currentSlideId === slideId ? null : appState.currentSlideId,
        });
    }, [appState, setAppState]);
    const selectSlide = useCallback((slideId) => {
        setAppState({ ...appState, currentSlideId: slideId });
    }, [appState, setAppState]);
    const addLiteratureUpdate = useCallback((projectId, slideId, item) => {
        const newItem = { ...item, id: generateId() };
        updateSlide(projectId, slideId, {
            literatureUpdates: [
                ...(appState.projects.find(p => p.id === projectId)?.slides.find(s => s.id === slideId)?.literatureUpdates || []),
                newItem,
            ],
        });
    }, [appState, updateSlide]);
    const removeLiteratureUpdate = useCallback((projectId, slideId, literatureId) => {
        const project = appState.projects.find(p => p.id === projectId);
        const slide = project?.slides.find(s => s.id === slideId);
        if (slide) {
            updateSlide(projectId, slideId, {
                literatureUpdates: slide.literatureUpdates.filter(l => l.id !== literatureId),
            });
        }
    }, [appState, updateSlide]);
    const approveLiteratureUpdate = useCallback((projectId, slideId, literatureId) => {
        const project = appState.projects.find(p => p.id === projectId);
        const slide = project?.slides.find(s => s.id === slideId);
        if (slide) {
            updateSlide(projectId, slideId, {
                literatureUpdates: slide.literatureUpdates.map(l => l.id === literatureId ? { ...l, approved: true } : l),
            });
        }
    }, [appState, updateSlide]);
    const addDesignSuggestion = useCallback((projectId, slideId, suggestion) => {
        const newSuggestion = { ...suggestion, id: generateId() };
        updateSlide(projectId, slideId, {
            designNotes: {
                ...(appState.projects.find(p => p.id === projectId)?.slides.find(s => s.id === slideId)?.designNotes || {
                    lastUpdated: new Date().toISOString(),
                    suggestions: [],
                    appliedChanges: [],
                }),
                suggestions: [
                    ...(appState.projects.find(p => p.id === projectId)?.slides.find(s => s.id === slideId)?.designNotes.suggestions || []),
                    newSuggestion,
                ],
            },
        });
    }, [appState, updateSlide]);
    const removeDesignSuggestion = useCallback((projectId, slideId, suggestionId) => {
        const project = appState.projects.find(p => p.id === projectId);
        const slide = project?.slides.find(s => s.id === slideId);
        if (slide) {
            updateSlide(projectId, slideId, {
                designNotes: {
                    ...slide.designNotes,
                    suggestions: slide.designNotes.suggestions.filter(s => s.id !== suggestionId),
                },
            });
        }
    }, [appState, updateSlide]);
    const addChangelog = useCallback((projectId, entry) => {
        const project = appState.projects.find(p => p.id === projectId);
        if (project) {
            updateProject(projectId, {
                changelog: [
                    ...project.changelog,
                    { ...entry, timestamp: new Date().toISOString() },
                ],
            });
        }
    }, [appState, updateProject]);
    const getCurrentProject = useCallback(() => {
        return appState.projects.find(p => p.id === appState.currentProjectId) || null;
    }, [appState]);
    const getCurrentSlide = useCallback(() => {
        const project = getCurrentProject();
        return project?.slides.find(s => s.id === appState.currentSlideId) || null;
    }, [appState, getCurrentProject]);
    const undo = useCallback(() => {
        if (undoStack.length === 0)
            return;
        const snapshot = undoStack[0];
        const newUndoStack = undoStack.slice(1);
        const newRedoStack = [createSnapshot(''), ...redoStack].slice(0, MAX_HISTORY);
        setAppState(snapshot.appState);
        setUndoStack(newUndoStack);
        setRedoStack(newRedoStack);
    }, [undoStack, redoStack, setAppState, setUndoStack, setRedoStack, createSnapshot]);
    const redo = useCallback(() => {
        if (redoStack.length === 0)
            return;
        const snapshot = redoStack[0];
        const newRedoStack = redoStack.slice(1);
        const newUndoStack = [createSnapshot(''), ...undoStack].slice(0, MAX_HISTORY);
        setAppState(snapshot.appState);
        setUndoStack(newUndoStack);
        setRedoStack(newRedoStack);
    }, [redoStack, undoStack, setAppState, setUndoStack, setRedoStack, createSnapshot]);
    const canUndo = useCallback(() => undoStack.length > 0, [undoStack]);
    const canRedo = useCallback(() => redoStack.length > 0, [redoStack]);
    const getHistory = useCallback(() => undoStack, [undoStack]);
    const clearFuture = useCallback(() => {
        setRedoStack([]);
    }, [setRedoStack]);
    const value = {
        projects: appState.projects,
        currentProjectId: appState.currentProjectId,
        currentSlideId: appState.currentSlideId,
        createProject,
        deleteProject,
        selectProject,
        updateProject,
        addSlide,
        updateSlide,
        deleteSlide,
        selectSlide,
        addLiteratureUpdate,
        removeLiteratureUpdate,
        approveLiteratureUpdate,
        addDesignSuggestion,
        removeDesignSuggestion,
        addChangelog,
        getCurrentProject,
        getCurrentSlide,
        undo,
        redo,
        canUndo,
        canRedo,
        getHistory,
        clearFuture,
    };
    return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}
export function useProject() {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProject must be used within ProjectProvider');
    }
    return context;
}
