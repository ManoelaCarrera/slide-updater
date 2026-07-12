import { useRef, useState } from 'react'
import { Card, CardBody } from './Card'
import { Button } from './Button'
import { useToast } from './Toast'
import { useProject } from '../context/ProjectContext'
import { parseBaseFile, createSlidesFromParsedData } from '../services/fileParserService'

interface FileUploadProps {
  onClose: () => void
}

export function FileUpload({ onClose }: FileUploadProps) {
  const { currentProjectId, getCurrentProject, addSlide } = useProject()
  const { addToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = async (file: File) => {
    if (!currentProjectId) {
      addToast('Crie um projeto primeiro', 'warning')
      return
    }
    setIsProcessing(true)
    try {
      const parsed = await parseBaseFile(file)
      const project = getCurrentProject()
      const startOrder = (project?.slides.length || 0) + 1
      const slides = createSlidesFromParsedData(parsed, startOrder)
      slides.forEach(slide => addSlide(currentProjectId, slide))
      addToast(`${slides.length} slide(s) importado(s) com sucesso!`, 'success')
      onClose()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao processar arquivo'
      addToast(message, 'error')
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
    Array.from(e.dataTransfer.files).forEach(file => handleFileUpload(file))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-96">
        <CardBody>
          <h2 className="text-lg font-semibold mb-1">Importar Aula Base</h2>
          <p className="text-xs text-neutral-600 mb-4">
            Carregue um .pptx existente (cada slide vira um slide aqui, com título e texto extraídos) ou um
            .txt/.md (cada linha vira um slide). Depois é só editar, analisar contra as fontes e exportar.
          </p>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isProcessing
                ? 'border-neutral-300 bg-neutral-50 cursor-not-allowed opacity-50'
                : 'border-neutral-300 bg-neutral-50 cursor-pointer hover:border-primary-600 hover:bg-primary-50'
            }`}
          >
            <div className="text-4xl mb-2" aria-hidden="true">
              📁
            </div>
            <p className="text-neutral-900 font-medium">{isProcessing ? 'Processando…' : 'Arraste um arquivo aqui'}</p>
            <p className="text-sm text-neutral-600 mt-1">ou clique para selecionar</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".txt,.md,.markdown,.pptx,.ppt"
              disabled={isProcessing}
              onChange={e => {
                Array.from(e.target.files || []).forEach(file => handleFileUpload(file))
              }}
              className="hidden"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              isLoading={isProcessing}
              className="mt-4"
            >
              {isProcessing ? 'Processando…' : 'Selecionar Arquivo'}
            </Button>
          </div>

          <div className="mt-4 flex gap-2">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-900">
              ✓ .pptx: extrai título e texto de cada slide (imagens e formatação visual do arquivo original
              não são preservadas — a exportação usa o layout do design system)
              <br />
              ✓ .txt e .md: um tópico por linha
              <br />
              ✗ .ppt (formato binário antigo): salve como .pptx no PowerPoint antes de importar
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
