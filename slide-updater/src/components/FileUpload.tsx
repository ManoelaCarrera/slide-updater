import { useRef, useState } from 'react'
import { Card, CardBody } from './Card'
import { Button } from './Button'
import { useToast } from './Toast'
import { useProject } from '../context/ProjectContext'
import { parseFile, createSlidesFromParsedData } from '../services/fileParserService'

interface FileUploadProps {
  onClose: () => void
}

export function FileUpload({ onClose }: FileUploadProps) {
  const { currentProjectId, addSlide } = useProject()
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
      const parsedSlides = await parseFile(file)

      if (parsedSlides.length === 0) {
        addToast('Arquivo vazio ou inválido', 'error')
        setIsProcessing(false)
        return
      }

      const slides = createSlidesFromParsedData(parsedSlides)
      slides.forEach(slide => addSlide(currentProjectId, slide))

      addToast(`${slides.length} slides importados com sucesso!`, 'success')
      onClose()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar arquivo'
      addToast(errorMessage, 'error')
      console.error(error)
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

    const files = Array.from(e.dataTransfer.files)
    files.forEach(file => handleFileUpload(file))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-96">
        <CardBody>
          <h2 className="text-lg font-semibold mb-4">Importar Slides</h2>

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
            <div className="text-4xl mb-2">📁</div>
            <p className="text-neutral-900 font-medium">
              {isProcessing ? 'Processando...' : 'Arraste arquivos aqui'}
            </p>
            <p className="text-sm text-neutral-600 mt-1">ou clique para selecionar</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".txt,.pdf,.pptx,.ppt"
              disabled={isProcessing}
              onChange={(e) => {
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
              {isProcessing ? 'Processando...' : 'Selecionar Arquivos'}
            </Button>
          </div>

          <div className="mt-4 flex gap-2">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-900">
              ✓ Suporte: TXT, PDF, PPTX
              <br />
              • TXT: uma linha = um slide
              <br />
              • PDF: quebras de página = slides
              <br />
              • PPTX: requer instalação de dependência (docx)
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
