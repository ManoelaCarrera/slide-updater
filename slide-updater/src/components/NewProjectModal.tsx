import { useState } from 'react'
import { Button } from './Button'
import { Card, CardBody } from './Card'
import { useProject } from '../context/ProjectContext'
import { Discipline, DISCIPLINE_LABELS } from '../types'

interface NewProjectModalProps {
  onClose: () => void
}

export function NewProjectModal({ onClose }: NewProjectModalProps) {
  const { createProject } = useProject()
  const [name, setName] = useState('')
  const [discipline, setDiscipline] = useState<Discipline>('estomatologia1')

  const handleCreate = () => {
    if (!name.trim()) return
    createProject(name.trim(), discipline)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-96">
        <CardBody className="space-y-4">
          <h2 className="text-lg font-semibold">Novo Projeto</h2>

          <div>
            <label htmlFor="project-name" className="block text-sm font-medium text-neutral-900 mb-2">
              Nome do projeto
            </label>
            <input
              id="project-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Estomatologia 1 - 2026"
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
          </div>

          <div>
            <label htmlFor="project-discipline" className="block text-sm font-medium text-neutral-900 mb-2">
              Disciplina
            </label>
            <select
              id="project-discipline"
              value={discipline}
              onChange={e => setDiscipline(e.target.value as Discipline)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 bg-white"
            >
              {Object.entries(DISCIPLINE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <Button variant="primary" onClick={handleCreate} disabled={!name.trim()} className="flex-1">
              Criar Projeto
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
