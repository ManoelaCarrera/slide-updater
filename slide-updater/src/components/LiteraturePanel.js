import React from 'react';
import { Button } from './Button';
import { Card, CardBody } from './Card';
import { useProject } from '../context/ProjectContext';
import { useToast } from './Toast';
export function LiteraturePanel({ slide, project }) {
    const { approveLiteratureUpdate, removeLiteratureUpdate, updateSlide } = useProject();
    const { addToast } = useToast();
    const handleApprove = (literatureId) => {
        approveLiteratureUpdate(project.id, slide.id, literatureId);
        addToast('Referência aprovada', 'success');
    };
    const handleRemove = (literatureId) => {
        removeLiteratureUpdate(project.id, slide.id, literatureId);
        addToast('Referência removida', 'info');
    };
    const handleInsertIntoSlide = (literature) => {
        const citation = `[${literature.authors}, ${literature.year}]`;
        updateSlide(project.id, slide.id, {
            currentContent: slide.currentContent + `\n\n${citation}: ${literature.title}\n${literature.abstract}`,
        });
        handleApprove(literature.id);
        addToast('Referência inserida no slide', 'success');
    };
    if (slide.literatureUpdates.length === 0) {
        return (<div className="p-8 text-center text-neutral-600" role="status">
        <div className="text-4xl mb-2">📚</div>
        <p>Nenhuma referência ainda</p>
        <p className="text-sm mt-2">Use a aba "Editar" para buscar literatura</p>
      </div>);
    }
    return (<div className="p-4 space-y-3" role="region" aria-label="Lista de referências literárias">
      {slide.literatureUpdates.map(lit => (<Card key={lit.id} className={lit.approved ? 'border-green-200 bg-green-50' : ''}>
          <CardBody>
            <div className="mb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <a href={lit.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-medium">
                    {lit.title}
                  </a>
                  <div className="text-sm text-neutral-600 mt-1">
                    {lit.authors} ({lit.year})
                  </div>
                </div>
                <div className="text-xs bg-neutral-200 text-neutral-900 px-2 py-1 rounded">
                  {lit.source === 'pubmed' && 'PubMed'}
                  {lit.source === 'scopus' && 'Scopus'}
                  {lit.source === 'wos' && 'WoS'}
                </div>
              </div>
              <p className="text-sm text-neutral-700 mt-2 line-clamp-3">{lit.abstract}</p>
            </div>

            <div className="flex gap-2 mt-3">
              {!lit.approved ? (<>
                  <Button size="sm" variant="primary" onClick={() => handleApprove(lit.id)} aria-label={`Aprovar referência: ${lit.title}`}>
                    ✓ Aprovar
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleInsertIntoSlide(lit)} aria-label={`Inserir referência no slide: ${lit.title}`}>
                    + Inserir
                  </Button>
                </>) : (<span className="text-xs text-green-600 font-medium" role="status" aria-label="Referência aprovada">
                  ✓ Aprovada
                </span>)}
              <Button size="sm" variant="ghost" onClick={() => handleRemove(lit.id)} aria-label={`Remover referência: ${lit.title}`}>
                🗑️ Remover
              </Button>
            </div>
          </CardBody>
        </Card>))}
    </div>);
}
