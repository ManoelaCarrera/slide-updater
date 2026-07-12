import { useRef, useState } from 'react'
import { Card, CardBody } from './Card'
import { Button } from './Button'
import { useToast } from './Toast'
import { useProject } from '../context/ProjectContext'
import { filesToSources } from '../services/sourceService'
import { formatFileSize } from '../utils/helpers'
import { Source, SourceType } from '../types'

const SOURCE_ICON: Record<SourceType, string> = {
  pdf: '📄',
  image: '🖼️',
  txt: '📝',
  md: '📝',
}

interface SourceManagerProps {
  onClose: () => void
}

export function SourceManager({ onClose }: SourceManagerProps) {
  const { currentProjectId, projects, addSource } = useProject()
  const { addToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewSource, setPreviewSource] = useState<Source | null>(null)

  const project = projects.find(p => p.id === currentProjectId)

  const handleFiles = async (files: File[]) => {
    if (!currentProjectId) {
      addToast('Crie ou selecione um projeto primeiro', 'warning')
      return
    }
    if (files.length === 0) return

    setIsProcessing(true)
    try {
      const { sources, errors } = await filesToSources(files)
      sources.forEach(source => addSource(currentProjectId, source))
      if (sources.length > 0) {
        addToast(`${sources.length} fonte(s) adicionada(s)`, 'success')
      }
      errors.forEach(err => addToast(err, 'error'))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (isProcessing) return
    e.preventDefault()
    e.currentTarget.classList.add('border-primary-600', 'bg-primary-50')
  }
  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('border-primary-600', 'bg-primary-50')
  }
  const handleDrop = (e: React.DragEvent) => {
    if (isProcessing) return
    e.preventDefault()
    e.currentTarget.classList.remove('border-primary-600', 'bg-primary-50')
    handleFiles(Array.from(e.dataTransfer.files))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[85vh] flex flex-col">
        <CardBody className="flex-1 overflow-auto">
          <h2 className="text-lg font-semibold mb-1">Fontes de Referência</h2>
          <p className="text-sm text-neutral-600 mb-4">
            Carregue PDFs de artigos, screenshots de livros digitais, ou notas em .txt/.md. Tudo fica
            só no seu navegador — nenhum arquivo é enviado para servidor nenhum.
          </p>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isProcessing
                ? 'border-neutral-300 bg-neutral-50 cursor-not-allowed opacity-60'
                : 'border-neutral-300 bg-neutral-50 cursor-pointer hover:border-primary-600 hover:bg-primary-50'
            }`}
          >
            <div className="text-3xl mb-2" aria-hidden="true">
              📁
            </div>
            <p className="text-neutral-900 font-medium">{isProcessing ? 'Processando…' : 'Arraste arquivos aqui'}</p>
            <p className="text-sm text-neutral-600 mt-1">ou clique para selecionar (PDF, imagem, .txt, .md)</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.txt,.md,.markdown,image/*"
              disabled={isProcessing}
              onChange={e => handleFiles(Array.from(e.target.files || []))}
              className="hidden"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              isLoading={isProcessing}
              className="mt-3"
            >
              Selecionar Arquivos
            </Button>
          </div>

          {project && project.sources.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-semibold text-neutral-900">Fontes carregadas ({project.sources.length})</h3>
              {project.sources.map(source => (
                <div key={source.id} className="flex items-center gap-2 p-2 border border-neutral-200 rounded-lg bg-white">
                  <span aria-hidden="true">{SOURCE_ICON[source.type]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-neutral-900 truncate" title={source.name}>
                      {source.name}
                    </div>
                    <div className="text-xs text-neutral-600">
                      {formatFileSize(source.fileSize)}
                      {source.metadata.pages ? ` · ${source.metadata.pages} pág.` : ''}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setPreviewSource(source)} aria-label={`Ver preview de ${source.name}`}>
                    Ver
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardBody>

        <div className="p-4 border-t border-neutral-200 flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </Card>

      {previewSource && <SourcePreviewModal source={previewSource} onClose={() => setPreviewSource(null)} />}
    </div>
  )
}

function SourcePreviewModal({ source, onClose }: { source: Source; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
      <Card className="w-full max-w-xl max-h-[80vh] flex flex-col">
        <CardBody className="flex-1 overflow-auto">
          <h3 className="font-semibold mb-2 truncate">{source.name}</h3>
          {source.type === 'image' && source.metadata.dataUrl && (
            <img src={source.metadata.dataUrl} alt={`Preview de ${source.name}`} className="max-w-full rounded-lg border border-neutral-200" />
          )}
          {(source.type === 'pdf' || source.type === 'txt' || source.type === 'md') && (
            <div className="text-sm text-neutral-800 whitespace-pre-wrap bg-neutral-50 border border-neutral-200 rounded-lg p-3 max-h-96 overflow-auto">
              {source.metadata.extractedText
                ? source.metadata.extractedText.slice(0, 3000) +
                  (source.metadata.extractedText.length > 3000 ? '…' : '')
                : 'Sem texto extraído.'}
            </div>
          )}
          {source.type === 'pdf' && source.metadata.pages && (
            <p className="text-xs text-neutral-600 mt-2">{source.metadata.pages} página(s) no PDF original.</p>
          )}
        </CardBody>
        <div className="p-4 border-t border-neutral-200 flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </Card>
    </div>
  )
}
