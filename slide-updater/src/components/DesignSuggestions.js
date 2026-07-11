import React from 'react';
import { Button } from './Button';
import { Card, CardBody } from './Card';
import { useProject } from '../context/ProjectContext';
import { useToast } from './Toast';
export function DesignSuggestions({ slide, project }) {
    const { updateSlide, removeDesignSuggestion } = useProject();
    const { addToast } = useToast();
    const handleApplySuggestion = (suggestion) => {
        const newAppliedChanges = [...slide.designNotes.appliedChanges, suggestion.message];
        updateSlide(project.id, slide.id, {
            designNotes: {
                ...slide.designNotes,
                appliedChanges: newAppliedChanges,
                lastUpdated: new Date().toISOString(),
            },
        });
        removeDesignSuggestion(project.id, slide.id, suggestion.id);
        addToast('Sugestão aplicada', 'success');
    };
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high':
                return 'bg-red-100 border-red-300 text-red-900';
            case 'medium':
                return 'bg-yellow-100 border-yellow-300 text-yellow-900';
            case 'low':
                return 'bg-blue-100 border-blue-300 text-blue-900';
            default:
                return 'bg-neutral-100 border-neutral-300 text-neutral-900';
        }
    };
    const suggestions = slide.designNotes.suggestions;
    if (suggestions.length === 0) {
        return (<div className="p-8 text-center text-neutral-600">
        <div className="text-4xl mb-2">✨</div>
        <p>Nenhuma sugestão de design</p>
        <p className="text-sm mt-2">Use a aba "Editar" para gerar sugestões</p>
      </div>);
    }
    return (<div className="p-4 space-y-4">
      {suggestions.map(suggestion => (<Card key={suggestion.id} className={getSeverityColor(suggestion.severity)}>
          <CardBody>
            <div className="mb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{suggestion.message}</h3>
                  <p className="text-sm mt-1 opacity-90">{suggestion.recommendation}</p>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-white bg-opacity-50 rounded">
                  {suggestion.severity.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="primary" onClick={() => handleApplySuggestion(suggestion)}>
                ✓ Aplicar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => removeDesignSuggestion(project.id, slide.id, suggestion.id)}>
                ✕ Ignorar
              </Button>
            </div>
          </CardBody>
        </Card>))}

      {slide.designNotes.appliedChanges.length > 0 && (<div className="mt-6 pt-4 border-t border-neutral-200">
          <h3 className="font-semibold text-neutral-900 mb-2">Mudanças Aplicadas</h3>
          <ul className="space-y-1">
            {slide.designNotes.appliedChanges.map((change, i) => (<li key={i} className="text-sm text-neutral-600 flex items-center gap-2">
                <span className="text-green-600">✓</span>
                {change}
              </li>))}
          </ul>
        </div>)}
    </div>);
}
