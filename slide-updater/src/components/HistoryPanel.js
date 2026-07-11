import React from 'react';
import { Button } from './Button';
import { Card, CardBody, CardHeader } from './Card';
import { useProject } from '../context/ProjectContext';
import { useToast } from './Toast';
export function HistoryPanel() {
    const { undo, redo, canUndo, canRedo, getHistory } = useProject();
    const { addToast } = useToast();
    const history = getHistory();
    const handleUndo = () => {
        if (!canUndo()) {
            addToast('Nada para desfazer', 'info');
            return;
        }
        undo();
        addToast('Ação desfeita', 'success');
    };
    const handleRedo = () => {
        if (!canRedo()) {
            addToast('Nada para refazer', 'info');
            return;
        }
        redo();
        addToast('Ação refeita', 'success');
    };
    return (<div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-neutral-900">Desfazer / Refazer</h2>
        </CardHeader>
        <CardBody className="flex gap-2">
          <Button variant={canUndo() ? 'primary' : 'disabled'} onClick={handleUndo} disabled={!canUndo()} className="flex-1">
            ↶ Desfazer
          </Button>
          <Button variant={canRedo() ? 'primary' : 'disabled'} onClick={handleRedo} disabled={!canRedo()} className="flex-1">
            ↷ Refazer
          </Button>
        </CardBody>
      </Card>

      {history.length > 0 && (<Card>
          <CardHeader>
            <h3 className="font-semibold text-sm text-neutral-900">
              Histórico ({history.length})
            </h3>
          </CardHeader>
          <CardBody className="max-h-96 overflow-y-auto space-y-2">
            {history.map((snapshot, idx) => (<div key={idx} className="px-3 py-2 bg-neutral-50 rounded-lg border border-neutral-200 text-xs">
                <div className="font-medium text-neutral-900">
                  {idx === 0 ? '→ ' : ''}{snapshot.description || '(ação sem descrição)'}
                </div>
                <div className="text-neutral-600 text-xs mt-1">
                  {new Date(snapshot.timestamp).toLocaleTimeString()}
                </div>
              </div>))}
          </CardBody>
        </Card>)}

      {history.length === 0 && (<div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 text-center">
          <p className="text-sm text-neutral-600">
            Nenhum histórico ainda. Comece a editar!
          </p>
        </div>)}
    </div>);
}
