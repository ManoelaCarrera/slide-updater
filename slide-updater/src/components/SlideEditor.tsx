import { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader } from './Card'
import { RichTextEditor } from './RichTextEditor'
import { useProject } from '../context/ProjectContext'
import { SuggestionsPanel } from './SuggestionsPanel'
import { analyzeContentLength, formatDate } from '../utils/helpers'
import { useDebounce } from '../hooks/useDebounce'

type Tab = 'edit' | 'suggestions' | 'preview' | 'applied'

export function SlideEditor() {
  const { getCurrentProject, getCurrentSlide, updateSlide } = useProject()
  const [activeTab, setActiveTab] = useState<Tab>('edit')
  const [pendingContent, setPendingContent] = useState('')

  const project = getCurrentProject()
  const slide = getCurrentSlide()

  const debouncedContent = useDebounce(pendingContent, 500)

  useEffect(() => {
    setPendingContent(slide?.currentContent || '')
    setActiveTab('edit')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slide?.id])

  // Sugestões aplicadas (Modo A/B) mudam slide.currentContent de fora do editor —
  // resincroniza o rascunho local sem trocar de aba nem perder o slide selecionado.
  useEffect(() => {
    if (slide) setPendingContent(slide.currentContent || '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slide?.appliedChanges.length])

  useEffect(() => {
    if (!project || !slide) return
    if (debouncedContent !== slide.currentContent) {
      updateSlide(project.id, slide.id, {
        currentContent: debouncedContent,
        keywords: slide.keywords,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedContent])

  if (!project || !slide) {
    return (
      <div className="flex-1 flex items-center justify-center text-neutral-600 text-center px-8">
        Selecione um slide na barra lateral, ou crie um novo, para começar a editar.
      </div>
    )
  }

  const contentStats = analyzeContentLength(slide.currentContent || slide.originalContent)
  const pendingSuggestions = slide.suggestions.filter(s => s.status === 'pending').length

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="border-b border-neutral-200 bg-white px-4 py-2 flex gap-2" role="tablist">
        {(
          [
            ['edit', '✏️ Editar'],
            ['suggestions', `💡 Sugestões${pendingSuggestions > 0 ? ` (${pendingSuggestions})` : ''}`],
            ['preview', '👁️ Antes / Depois'],
            ['applied', `🕘 Aplicadas (${slide.appliedChanges.length})`],
          ] as [Tab, string][]
        ).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            role="tab"
            aria-selected={activeTab === tab}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab ? 'bg-primary-100 text-primary-600' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'edit' && (
          <div className="p-4 space-y-4">
            <div>
              <label htmlFor="slide-title" className="block text-sm font-medium text-neutral-900 mb-2">
                Título do Slide
              </label>
              <input
                id="slide-title"
                type="text"
                value={slide.title}
                onChange={e => updateSlide(project.id, slide.id, { title: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                aria-label="Título do slide"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">Conteúdo</label>
              <RichTextEditor
                key={`${slide.id}-${slide.appliedChanges.length}`}
                value={pendingContent}
                onChange={setPendingContent}
                placeholder="Cole ou digite o conteúdo do slide…"
              />
              <p className="text-xs text-neutral-600 mt-2">
                {contentStats.wordCount} palavras
                {contentStats.isTextHeavy && ' · slide com bastante texto, considere resumir para a aula'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'suggestions' && <SuggestionsPanel project={project} slide={slide} />}

        {activeTab === 'preview' && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-neutral-900">Antes (conteúdo original)</h3>
              </CardHeader>
              <CardBody>
                <div className="prose prose-sm max-w-none text-neutral-800 whitespace-pre-wrap">
                  {slide.originalContent || '(vazio)'}
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-neutral-900">Depois (conteúdo atual)</h3>
              </CardHeader>
              <CardBody>
                <div
                  className="prose prose-sm max-w-none text-neutral-800"
                  dangerouslySetInnerHTML={{ __html: slide.currentContent || '(vazio)' }}
                />
              </CardBody>
            </Card>
          </div>
        )}

        {activeTab === 'applied' && (
          <div className="p-4 space-y-2">
            {slide.appliedChanges.length === 0 ? (
              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 text-center text-sm text-neutral-600">
                Nenhuma sugestão aplicada ainda neste slide.
              </div>
            ) : (
              slide.appliedChanges
                .slice()
                .reverse()
                .map(change => {
                  const source = project.sources.find(s => s.id === change.sourceId)
                  return (
                    <Card key={change.id}>
                      <CardBody>
                        <div className="flex justify-between text-xs text-neutral-600 mb-2">
                          <span>{source?.name || 'Fonte removida'}</span>
                          <span>{formatDate(change.timestamp)}</span>
                        </div>
                        <p className="text-sm text-neutral-800">{change.insertedText}</p>
                      </CardBody>
                    </Card>
                  )
                })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
