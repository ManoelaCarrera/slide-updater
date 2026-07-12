import { useState } from 'react'
import { Button } from './Button'
import { useProject } from '../context/ProjectContext'
import { useToast } from './Toast'
import { NewProjectModal } from './NewProjectModal'
import { DISCIPLINE_LABELS } from '../types'

interface NavbarProps {
  onOpenSettings: () => void
}

export function Navbar({ onOpenSettings }: NavbarProps) {
  const { currentProjectId, projects, selectProject, undo, redo, canUndo, canRedo } = useProject()
  const { addToast } = useToast()
  const [showNewProject, setShowNewProject] = useState(false)

  const project = projects.find(p => p.id === currentProjectId)

  return (
    <nav className="bg-white border-b border-neutral-200 shadow-sm">
      <div className="max-w-full px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0">
            📊
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-neutral-900">Slide Updater</h1>
            {project ? (
              <p className="text-sm text-neutral-600 truncate">
                {project.name} · {DISCIPLINE_LABELS[project.discipline]}
              </p>
            ) : (
              <p className="text-sm text-neutral-600">Nenhum projeto selecionado</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {projects.length > 0 && (
            <select
              aria-label="Selecionar projeto"
              value={currentProjectId || ''}
              onChange={e => e.target.value && selectProject(e.target.value)}
              className="px-2 py-2 text-sm border border-neutral-200 rounded-lg bg-white max-w-[180px]"
            >
              <option value="" disabled>
                Trocar projeto…
              </option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (!canUndo()) {
                addToast('Nada para desfazer', 'info')
                return
              }
              undo()
              addToast('Ação desfeita', 'success')
            }}
            disabled={!canUndo()}
            title="Desfazer"
            aria-label="Desfazer última ação"
          >
            ↶
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (!canRedo()) {
                addToast('Nada para refazer', 'info')
                return
              }
              redo()
              addToast('Ação refeita', 'success')
            }}
            disabled={!canRedo()}
            title="Refazer"
            aria-label="Refazer ação desfeita"
          >
            ↷
          </Button>

          <div className="w-px h-6 bg-neutral-300" />

          <Button variant="ghost" size="sm" onClick={onOpenSettings} aria-label="Abrir configurações">
            ⚙️
          </Button>

          <Button variant="primary" size="sm" onClick={() => setShowNewProject(true)}>
            + Novo Projeto
          </Button>
        </div>
      </div>

      {showNewProject && <NewProjectModal onClose={() => setShowNewProject(false)} />}
    </nav>
  )
}
