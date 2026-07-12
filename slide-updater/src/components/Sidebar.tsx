import { useState } from 'react'
import { Button } from './Button'
import { useProject } from '../context/ProjectContext'
import { useToast } from './Toast'
import { formatFileSize } from '../utils/helpers'
import { SourceType } from '../types'

const SOURCE_ICON: Record<SourceType, string> = {
  pdf: '📄',
  image: '🖼️',
  txt: '📝',
  md: '📝',
}

interface SidebarProps {
  onAddSources: () => void
  onAddSlide: () => void
}

export function Sidebar({ onAddSources, onAddSlide }: SidebarProps) {
  const { projects, currentProjectId, currentSlideId, selectSlide, deleteSlide, removeSource } = useProject()
  const { addToast } = useToast()
  const [tab, setTab] = useState<'slides' | 'sources'>('slides')

  const project = projects.find(p => p.id === currentProjectId)

  if (!project) {
    return (
      <div className="w-72 bg-neutral-50 border-r border-neutral-200 p-4 flex flex-col">
        <h2 className="text-lg font-semibold text-neutral-900 mb-2">Meus Projetos</h2>
        <p className="text-neutral-600 text-sm">
          Crie um projeto para começar a organizar slides e fontes.
        </p>
      </div>
    )
  }

  const sortedSlides = [...project.slides].sort((a, b) => a.order - b.order)

  return (
    <div className="w-72 bg-neutral-50 border-r border-neutral-200 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-900 truncate">{project.name}</h2>
        <p className="text-xs text-neutral-600 mt-1">
          {sortedSlides.length} slide(s) · {project.sources.length} fonte(s)
        </p>
      </div>

      <div className="flex border-b border-neutral-200" role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'slides'}
          onClick={() => setTab('slides')}
          className={`flex-1 px-3 py-2 text-sm font-medium ${
            tab === 'slides' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-neutral-600'
          }`}
        >
          Slides
        </button>
        <button
          role="tab"
          aria-selected={tab === 'sources'}
          onClick={() => setTab('sources')}
          className={`flex-1 px-3 py-2 text-sm font-medium ${
            tab === 'sources' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-neutral-600'
          }`}
        >
          Fontes
        </button>
      </div>

      {tab === 'slides' && (
        <>
          <div className="p-3 border-b border-neutral-200">
            <Button variant="outline" size="sm" onClick={onAddSlide} className="w-full" aria-label="Adicionar novo slide">
              + Slide
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto" role="region" aria-label="Lista de slides">
            {sortedSlides.length === 0 ? (
              <div className="p-4 text-center text-neutral-600 text-sm" role="status">
                Nenhum slide ainda. Importe a aula base ou adicione manualmente.
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {sortedSlides.map(slide => {
                  const pending = slide.suggestions.filter(s => s.status === 'pending').length
                  return (
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
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') selectSlide(slide.id)
                      }}
                    >
                      <div className="font-medium text-sm text-neutral-900 truncate">
                        {slide.order}. {slide.title}
                      </div>
                      <div className="text-xs text-neutral-600 mt-1 flex gap-2">
                        {pending > 0 && (
                          <span className="text-primary-700 font-medium">{pending} sugestão(ões)</span>
                        )}
                        {slide.appliedChanges.length > 0 && <span>{slide.appliedChanges.length} aplicada(s)</span>}
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          if (confirm(`Remover o slide "${slide.title}"?`)) {
                            deleteSlide(project.id, slide.id)
                            addToast('Slide removido', 'info')
                          }
                        }}
                        className="text-xs text-red-600 hover:text-red-800 mt-2"
                        aria-label={`Remover slide: ${slide.title}`}
                      >
                        Remover
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'sources' && (
        <>
          <div className="p-3 border-b border-neutral-200">
            <Button variant="outline" size="sm" onClick={onAddSources} className="w-full" aria-label="Adicionar fontes de referência">
              + Fontes
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto" role="region" aria-label="Lista de fontes">
            {project.sources.length === 0 ? (
              <div className="p-4 text-center text-neutral-600 text-sm" role="status">
                Nenhuma fonte carregada. Adicione PDFs, imagens, .txt ou .md.
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {project.sources.map(source => (
                  <div key={source.id} className="p-3 rounded-lg bg-white border border-neutral-200">
                    <div className="flex items-start gap-2">
                      <span aria-hidden="true">{SOURCE_ICON[source.type]}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-neutral-900 truncate" title={source.name}>
                          {source.name}
                        </div>
                        <div className="text-xs text-neutral-600">
                          {source.type.toUpperCase()} · {formatFileSize(source.fileSize)}
                          {source.metadata.pages ? ` · ${source.metadata.pages} pág.` : ''}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Remover a fonte "${source.name}"? Sugestões pendentes vindas dela serão descartadas.`)) {
                          removeSource(project.id, source.id)
                          addToast('Fonte removida', 'info')
                        }
                      }}
                      className="text-xs text-red-600 hover:text-red-800 mt-2"
                      aria-label={`Remover fonte: ${source.name}`}
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
