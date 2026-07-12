import { useState } from 'react'
import { Button } from './Button'
import { Card, CardBody, CardHeader } from './Card'
import { useProject } from '../context/ProjectContext'
import { useToast } from './Toast'
import { analyzeSlideAgainstSources } from '../utils/textSearch'
import { Project, Slide, Suggestion, SuggestionType } from '../types'

const TYPE_LABEL: Record<SuggestionType, string> = {
  add_citation: '📚 Nova referência',
  update_data: '⚠️ Dado possivelmente desatualizado',
  gap: '❓ Gap pedagógico',
}

function sourceName(project: Project, sourceId: string): string {
  return project.sources.find(s => s.id === sourceId)?.name || 'Fonte removida'
}

interface SuggestionsPanelProps {
  project: Project
  slide: Slide
}

export function SuggestionsPanel({ project, slide }: SuggestionsPanelProps) {
  const { setSlideSuggestions, applySuggestion, rejectSuggestion, editSuggestion, updateSettings, addChangelog } =
    useProject()
  const { addToast } = useToast()
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const pending = slide.suggestions.filter(s => s.status === 'pending')
  const decided = slide.suggestions.filter(s => s.status !== 'pending')

  const handleAnalyze = () => {
    if (project.sources.length === 0) {
      addToast('Adicione ao menos uma fonte antes de analisar', 'warning')
      return
    }
    setIsAnalyzing(true)
    try {
      const { keywords, suggestions } = analyzeSlideAgainstSources(slide, project.sources)
      setSlideSuggestions(project.id, slide.id, keywords, suggestions)
      addToast(
        suggestions.length > 0
          ? `${suggestions.length} sugestão(ões) encontrada(s)`
          : 'Nenhuma sugestão encontrada — as fontes não trazem complementos óbvios para este slide',
        suggestions.length > 0 ? 'success' : 'info'
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleModeChange = (mode: 'step-by-step' | 'final-review') => {
    updateSettings(project.id, { validationMode: mode })
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardBody className="space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <h2 className="font-semibold text-neutral-900">Análise de Sugestões</h2>
              <p className="text-xs text-neutral-600 mt-1">
                Busca local nas fontes carregadas por palavras-chave deste slide. As sugestões complementam
                — nunca substituem — as perguntas e o raciocínio já propostos no slide.
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={handleAnalyze} isLoading={isAnalyzing}>
              🔎 Analisar Este Slide
            </Button>
          </div>

          {slide.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {slide.keywords.map(k => (
                <span key={k} className="px-2 py-0.5 text-xs bg-neutral-100 text-neutral-700 rounded-full">
                  {k}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <span className="text-neutral-600">Modo de validação:</span>
            <div className="flex gap-1">
              <button
                onClick={() => handleModeChange('step-by-step')}
                className={`px-2 py-1 rounded text-xs ${
                  project.settings.validationMode === 'step-by-step'
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                A · Passo-a-passo
              </button>
              <button
                onClick={() => handleModeChange('final-review')}
                className={`px-2 py-1 rounded text-xs ${
                  project.settings.validationMode === 'final-review'
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                B · Revisão final
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      {pending.length === 0 ? (
        <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 text-center text-sm text-neutral-600">
          Nenhuma sugestão pendente. Clique em "Analisar Este Slide" para buscar nas fontes carregadas.
        </div>
      ) : project.settings.validationMode === 'step-by-step' ? (
        <StepByStepView
          project={project}
          slide={slide}
          pending={pending}
          onApprove={id => {
            applySuggestion(project.id, slide.id, id)
            addToast('Sugestão aplicada ao slide', 'success')
          }}
          onReject={id => {
            rejectSuggestion(project.id, slide.id, id)
            addToast('Sugestão rejeitada', 'info')
          }}
          onEdit={(id, text) => editSuggestion(project.id, slide.id, id, text)}
        />
      ) : (
        <FinalReviewView
          project={project}
          slide={slide}
          pending={pending}
          onApplySelected={ids => {
            ids.forEach(id => applySuggestion(project.id, slide.id, id))
            addToast(`${ids.length} sugestão(ões) aplicada(s)`, 'success')
          }}
          onRejectSelected={ids => {
            ids.forEach(id => rejectSuggestion(project.id, slide.id, id))
            addToast(`${ids.length} sugestão(ões) rejeitada(s)`, 'info')
          }}
          onEdit={(id, text) => editSuggestion(project.id, slide.id, id, text)}
        />
      )}

      {decided.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-neutral-900">Já decididas ({decided.length})</h3>
          </CardHeader>
          <CardBody className="space-y-2 max-h-64 overflow-y-auto">
            {decided.map(s => (
              <div key={s.id} className="text-xs p-2 rounded border border-neutral-200 bg-neutral-50">
                <div className="flex justify-between gap-2">
                  <span className="font-medium">{TYPE_LABEL[s.type]}</span>
                  <span className={s.status === 'approved' ? 'text-green-700' : 'text-red-600'}>
                    {s.status === 'approved' ? '✓ aplicada' : '✗ rejeitada'}
                  </span>
                </div>
                <div className="text-neutral-600 mt-1">{sourceName(project, s.sourceId)}</div>
              </div>
            ))}
          </CardBody>
        </Card>
      )}
    </div>
  )
}

const LONG_TEXT_THRESHOLD = 160

function SuggestionCard({
  project,
  suggestion,
  onApprove,
  onReject,
  onEdit,
}: {
  project: Project
  suggestion: Suggestion
  onApprove: () => void
  onReject: () => void
  onEdit: (text: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(suggestion.suggestedText)
  const [expanded, setExpanded] = useState(false)

  const isLong = suggestion.suggestedText.length > LONG_TEXT_THRESHOLD
  const displayText =
    isLong && !expanded ? `${suggestion.suggestedText.slice(0, LONG_TEXT_THRESHOLD)}…` : suggestion.suggestedText

  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-sm font-semibold text-neutral-900">{TYPE_LABEL[suggestion.type]}</span>
        <span className="text-xs text-neutral-600 truncate max-w-[50%]" title={sourceName(project, suggestion.sourceId)}>
          {sourceName(project, suggestion.sourceId)}
        </span>
      </CardHeader>
      <CardBody className="space-y-4">
        <p className="text-sm text-neutral-800 leading-relaxed">{suggestion.reason}</p>

        {isEditing ? (
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            className="w-full px-3 py-3 border border-neutral-200 rounded-lg text-base leading-relaxed min-h-32"
            aria-label="Editar texto da sugestão"
          />
        ) : (
          <div>
            <div className="text-xs font-medium text-neutral-500 mb-1">Trecho da fonte:</div>
            <blockquote className="text-base text-neutral-800 leading-relaxed border-l-4 border-primary-600 bg-neutral-50 px-4 py-3 rounded-r whitespace-pre-wrap break-words">
              {displayText}
            </blockquote>
            {isLong && (
              <button
                onClick={() => setExpanded(prev => !prev)}
                className="text-xs text-primary-700 hover:underline mt-1"
              >
                {expanded ? 'ver menos' : 'ver trecho completo'}
              </button>
            )}
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {isEditing ? (
            <>
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  onEdit(draft)
                  setIsEditing(false)
                }}
              >
                Salvar edição
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="primary" onClick={onApprove} aria-label="Aprovar sugestão">
                ✓ Aprovar
              </Button>
              <Button size="sm" variant="secondary" onClick={onReject} aria-label="Rejeitar sugestão">
                ✗ Rejeitar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)} aria-label="Editar sugestão">
                ✏️ Editar
              </Button>
            </>
          )}
        </div>
      </CardBody>
    </Card>
  )
}

function StepByStepView({
  project,
  pending,
  onApprove,
  onReject,
  onEdit,
}: {
  project: Project
  slide: Slide
  pending: Suggestion[]
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onEdit: (id: string, text: string) => void
}) {
  const current = pending[0]
  const total = pending.length

  return (
    <div className="space-y-2">
      <div className="text-xs text-neutral-600" role="status">
        Sugestão 1 de {total} pendentes
      </div>
      <SuggestionCard
        key={current.id}
        project={project}
        suggestion={current}
        onApprove={() => onApprove(current.id)}
        onReject={() => onReject(current.id)}
        onEdit={text => onEdit(current.id, text)}
      />
    </div>
  )
}

function FinalReviewView({
  project,
  pending,
  onApplySelected,
  onRejectSelected,
  onEdit,
}: {
  project: Project
  slide: Slide
  pending: Suggestion[]
  onApplySelected: (ids: string[]) => void
  onRejectSelected: (ids: string[]) => void
  onEdit: (id: string, text: string) => void
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(pending.map(p => p.id)))

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="primary"
          size="sm"
          onClick={() => onApplySelected(pending.filter(p => selected.has(p.id)).map(p => p.id))}
          disabled={selected.size === 0}
        >
          ✓ Aplicar selecionadas ({selected.size})
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onRejectSelected(pending.filter(p => !selected.has(p.id)).map(p => p.id))}
          disabled={selected.size === pending.length}
        >
          ✗ Rejeitar não selecionadas
        </Button>
      </div>

      {pending.map(suggestion => (
        <div key={suggestion.id} className="flex gap-2 items-start">
          <input
            type="checkbox"
            checked={selected.has(suggestion.id)}
            onChange={() => toggle(suggestion.id)}
            className="mt-6"
            aria-label={`Selecionar sugestão de ${sourceName(project, suggestion.sourceId)}`}
          />
          <div className="flex-1">
            <SuggestionCard
              project={project}
              suggestion={suggestion}
              onApprove={() => onApplySelected([suggestion.id])}
              onReject={() => onRejectSelected([suggestion.id])}
              onEdit={text => onEdit(suggestion.id, text)}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
