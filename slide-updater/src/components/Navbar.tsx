import React from 'react'
import { Button } from './Button'
import { useProject } from '../context/ProjectContext'

export function Navbar() {
  const { currentProjectId, projects, createProject, undo, redo, canUndo, canRedo } = useProject()
  const project = projects.find(p => p.id === currentProjectId)

  return (
    <nav className="bg-white border-b border-neutral-200 shadow-sm">
      <div className="max-w-full px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            📊
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Slide Updater</h1>
            {project && <p className="text-sm text-neutral-600">{project.name}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={undo}
            disabled={!canUndo()}
            title="Desfazer (Ctrl+Z)"
            aria-label="Desfazer última ação"
          >
            ↶
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={redo}
            disabled={!canRedo()}
            title="Refazer (Ctrl+Y)"
            aria-label="Refazer ação desfeita"
          >
            ↷
          </Button>

          <div className="w-px h-6 bg-neutral-300" />

          <Button
            variant="primary"
            size="md"
            onClick={() => {
              const name = prompt('Nome do novo projeto:')
              if (name) createProject(name)
            }}
          >
            + Novo Projeto
          </Button>
        </div>
      </div>
    </nav>
  )
}
