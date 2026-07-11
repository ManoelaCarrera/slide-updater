import React from 'react'
import { Button } from './Button'
import { Card, CardBody } from './Card'
import { useProject } from '../context/ProjectContext'
import { generateId } from '../utils/helpers'

export function Sidebar() {
  const { projects, currentProjectId, currentSlideId, selectSlide, addSlide, deleteSlide, deleteProject } = useProject()
  const project = projects.find(p => p.id === currentProjectId)

  const handleAddSlide = () => {
    if (!currentProjectId) {
      alert('Crie um projeto primeiro')
      return
    }
    const title = prompt('Título do slide:')
    if (title) {
      addSlide(currentProjectId, {
        title,
        originalContent: '',
        currentContent: '',
        keywords: [],
        literatureUpdates: [],
        designNotes: {
          lastUpdated: new Date().toISOString(),
          suggestions: [],
          appliedChanges: [],
        },
        contentLength: 0,
      })
    }
  }

  if (!project) {
    return (
      <div className="w-64 bg-neutral-50 border-r border-neutral-200 p-4 flex flex-col">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Meus Projetos</h2>
        <div className="text-neutral-600 text-sm mb-4">Nenhum projeto selecionado</div>
        <div className="flex flex-wrap gap-2">
          {projects.map(p => (
            <Card key={p.id} className="flex-1">
              <CardBody className="text-sm">
                <button onClick={() => projects.find(x => x.id === p.id)?.id && currentProjectId !== p.id}
                  className="text-primary-600 hover:underline"
                >
                  {p.name}
                </button>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-64 bg-neutral-50 border-r border-neutral-200 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-900 mb-2">{project.name}</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddSlide}
            aria-label="Adicionar novo slide ao projeto"
          >
            + Slide
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteProject(currentProjectId)}
            aria-label="Deletar projeto"
          >
            🗑️
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" role="region" aria-label="Lista de slides">
        {project.slides.length === 0 ? (
          <div className="p-4 text-center text-neutral-600 text-sm" role="status">
            Nenhum slide ainda
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {project.slides.map(slide => (
              <div
                key={slide.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  currentSlideId === slide.id
                    ? 'bg-primary-100 border border-primary-600'
                    : 'bg-white border border-neutral-200 hover:bg-neutral-100'
                }`}
                onClick={() => selectSlide(slide.id)}
                role="button"
                tabIndex={0}
                aria-label={`Slide: ${slide.title}`}
                aria-pressed={currentSlideId === slide.id}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    selectSlide(slide.id)
                  }
                }}
              >
                <div className="font-medium text-sm text-neutral-900">{slide.title}</div>
                <div className="text-xs text-neutral-600 mt-1">
                  {slide.literatureUpdates.length} referências
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteSlide(currentProjectId, slide.id)
                  }}
                  className="text-xs text-red-600 hover:text-red-800 mt-2"
                  aria-label={`Remover slide: ${slide.title}`}
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
