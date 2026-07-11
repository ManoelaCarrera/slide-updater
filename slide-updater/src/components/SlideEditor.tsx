import React, { useState } from 'react'
import { Button } from './Button'
import { Card, CardBody, CardHeader } from './Card'
import { RichTextEditor } from './RichTextEditor'
import { useProject } from '../context/ProjectContext'
import { useToast } from './Toast'
import { LiteraturePanel } from './LiteraturePanel'
import { DesignSuggestions } from './DesignSuggestions'
import { searchMultipleSources } from '../services/pubmedService'
import { extractKeywords, generateDesignSuggestions, analyzeContentLength } from '../utils/helpers'
import { useDebounce, useDebouncedCallback } from '../hooks/useDebounce'

export function SlideEditor() {
  const { getCurrentProject, getCurrentSlide, updateSlide, addLiteratureUpdate, addDesignSuggestion, addChangelog } = useProject()
  const { addToast } = useToast()
  const [isSearching, setIsSearching] = useState(false)
  const [activeTab, setActiveTab] = useState<'edit' | 'literature' | 'design' | 'preview'>('edit')
  const [pendingContent, setPendingContent] = useState<string>('')

  const project = getCurrentProject()
  const slide = getCurrentSlide()

  // Debounce content changes to avoid excessive updates
  const debouncedContent = useDebounce(pendingContent, 500)

  if (!project || !slide) {
    return (
      <div className="flex-1 flex items-center justify-center text-neutral-600">
        Selecione um slide para começar
      </div>
    )
  }

  // Effect: save debounced content to slide
  React.useEffect(() => {
    if (debouncedContent !== slide.currentContent && debouncedContent !== '') {
      updateSlide(project.id, slide.id, {
        currentContent: debouncedContent,
        contentLength: analyzeContentLength(debouncedContent).wordCount,
      })
    }
  }, [debouncedContent, project.id, slide.id, slide.currentContent, updateSlide])

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value
    setPendingContent(content)
  }

  const handleSearchLiterature = useDebouncedCallback(async () => {
    setIsSearching(true)
    try {
      const keywords = extractKeywords(debouncedContent)
      if (keywords.length === 0) {
        addToast('Nenhuma palavra-chave extraída. Adicione mais conteúdo.', 'warning')
        setIsSearching(false)
        return
      }

      const results = await searchMultipleSources(keywords, new Date().getFullYear() - 2)

      if (results.length === 0) {
        addToast('Nenhum artigo encontrado', 'info')
      } else {
        results.forEach(item => addLiteratureUpdate(project.id, slide.id, item))
        addToast(`${results.length} artigos encontrados!`, 'success')
        addChangelog(project.id, {
          action: 'added_literature',
          slideId: slide.id,
          details: `Adicionados ${results.length} artigos da literatura`,
        })
      }
    } catch (error) {
      addToast('Erro ao buscar literatura', 'error')
      console.error(error)
    } finally {
      setIsSearching(false)
    }
  }, 1000)

  const handleGenerateDesignSuggestions = () => {
    const suggestions = generateDesignSuggestions(slide.currentContent, slide.title)
    suggestions.forEach(s => {
      addDesignSuggestion(project.id, slide.id, s)
    })
    addToast(`${suggestions.length} sugestões de design geradas`, 'success')
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="border-b border-neutral-200 bg-white px-4 py-2 flex gap-2" role="tablist">
        {['edit', 'literature', 'design', 'preview'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            role="tab"
            aria-selected={activeTab === tab}
            aria-label={`Aba ${tab === 'edit' ? 'Editar' : tab === 'literature' ? 'Literatura' : tab === 'design' ? 'Design' : 'Preview'}`}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-primary-100 text-primary-600 border-b-2 border-primary-600'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {tab === 'edit' && '✏️ Editar'}
            {tab === 'literature' && '📚 Literatura'}
            {tab === 'design' && '🎨 Design'}
            {tab === 'preview' && '👁️ Preview'}
          </button>
        ))}
      </div>

      {/* Content */}
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
                onChange={(e) => updateSlide(project.id, slide.id, { title: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                aria-label="Título do slide"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">Conteúdo</label>
              <RichTextEditor
                value={pendingContent || slide.currentContent}
                onChange={handleContentChange}
                placeholder="Cole ou digite o conteúdo do slide..."
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={handleSearchLiterature}
                isLoading={isSearching}
                aria-label="Buscar literatura relacionada ao conteúdo do slide"
              >
                🔍 Buscar Literatura
              </Button>
              <Button
                variant="secondary"
                onClick={handleGenerateDesignSuggestions}
                aria-label="Gerar sugestões de design para o slide"
              >
                ✨ Sugestões de Design
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'literature' && (
          <LiteraturePanel slide={slide} project={project} />
        )}

        {activeTab === 'design' && (
          <DesignSuggestions slide={slide} project={project} />
        )}

        {activeTab === 'preview' && (
          <div className="p-4">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold">{slide.title}</h2>
              </CardHeader>
              <CardBody>
                <div className="prose max-w-none">
                  {slide.currentContent.split('\n').map((para, i) => (
                    <p key={i} className="mb-3 text-neutral-900">
                      {para}
                    </p>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
