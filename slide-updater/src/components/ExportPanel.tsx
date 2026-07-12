import { useRef, useState } from 'react'
import { Button } from './Button'
import { useProject } from '../context/ProjectContext'
import { useToast } from './Toast'
import { exportProjectToPPTX, exportProjectToPDF, exportProjectToJSON, parseProjectJSON } from '../services/exportService'
import { formatDate, estimateStorageSize, formatFileSize } from '../utils/helpers'

export function ExportPanel() {
  const { getCurrentProject, importProject } = useProject()
  const { addToast } = useToast()
  const [isExporting, setIsExporting] = useState<'pptx' | 'pdf' | 'json' | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  const project = getCurrentProject()

  if (!project) {
    return <div className="p-4 text-center text-neutral-600">Selecione um projeto para exportar.</div>
  }

  const handleExportPPTX = async () => {
    setIsExporting('pptx')
    try {
      await exportProjectToPPTX(project)
      addToast('Exportado como PPTX com sucesso!', 'success')
    } catch (error) {
      addToast('Erro ao exportar PPTX. Tente novamente.', 'error')
      console.error(error)
    } finally {
      setIsExporting(null)
    }
  }

  const handleExportPDF = async () => {
    setIsExporting('pdf')
    try {
      await exportProjectToPDF(project)
      addToast('Exportado como PDF com sucesso!', 'success')
    } catch (error) {
      addToast('Erro ao exportar PDF. Tente novamente.', 'error')
      console.error(error)
    } finally {
      setIsExporting(null)
    }
  }

  const handleExportJSON = () => {
    setIsExporting('json')
    try {
      exportProjectToJSON(project)
      addToast('Backup salvo como JSON', 'success')
    } catch (error) {
      addToast('Erro ao criar backup', 'error')
    } finally {
      setIsExporting(null)
    }
  }

  const handleImportJSON = async (file: File) => {
    try {
      const imported = await parseProjectJSON(file)
      importProject(imported)
      addToast(`Projeto "${imported.name}" importado`, 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Erro ao importar backup', 'error')
    }
  }

  const storageBytes = estimateStorageSize(project)

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
        <div className="px-4 py-3 border-b border-neutral-200">
          <h2 className="font-semibold">Exportar Apresentação</h2>
        </div>
        <div className="p-4 space-y-3">
          <Button
            variant="primary"
            onClick={handleExportPPTX}
            isLoading={isExporting === 'pptx'}
            className="w-full"
            aria-label="Exportar apresentação como arquivo PowerPoint PPTX"
          >
            📊 Exportar como PPTX
          </Button>
          <Button
            variant="primary"
            onClick={handleExportPDF}
            isLoading={isExporting === 'pdf'}
            className="w-full"
            aria-label="Exportar apresentação como arquivo PDF"
          >
            📄 Exportar como PDF
          </Button>
          <Button
            variant="secondary"
            onClick={handleExportJSON}
            isLoading={isExporting === 'json'}
            className="w-full"
            aria-label="Fazer backup dos dados da apresentação em formato JSON"
          >
            💾 Backup JSON
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
        <div className="px-4 py-3 border-b border-neutral-200">
          <h2 className="font-semibold">Importar Projeto (JSON)</h2>
        </div>
        <div className="p-4">
          <input
            ref={importInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) handleImportJSON(file)
              e.target.value = ''
            }}
          />
          <Button variant="outline" className="w-full" onClick={() => importInputRef.current?.click()}>
            📂 Restaurar de um backup JSON
          </Button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
        💡 PPTX mantém o layout do design system e marca as referências usadas. PDF é melhor para compartilhar
        ou imprimir. JSON é o backup completo — inclui fontes, sugestões e histórico.
      </div>

      <div className="text-xs text-neutral-600 text-center space-y-1">
        <div>Último salvo: {project.updatedAt ? formatDate(project.updatedAt) : 'Nunca'}</div>
        <div>Tamanho aproximado em localStorage: {formatFileSize(storageBytes)}</div>
      </div>
    </div>
  )
}
