import { useState } from 'react'
import { ProjectProvider, useProject } from './context/ProjectContext'
import { ToastProvider, useToast } from './components/Toast'
import { Navbar } from './components/Navbar'
import { Sidebar } from './components/Sidebar'
import { SlideEditor } from './components/SlideEditor'
import { ExportPanel } from './components/ExportPanel'
import { SettingsPanel } from './components/SettingsPanel'
import { HistoryPanel } from './components/HistoryPanel'
import { FileUpload } from './components/FileUpload'
import { SourceManager } from './components/SourceManager'
import { NewSlideModal } from './components/NewSlideModal'
import { Button } from './components/Button'
import { Slide } from './types'

type PanelView = 'editor' | 'export' | 'settings' | 'history'

function AppContent() {
  const { currentProjectId, getCurrentProject, addSlide } = useProject()
  const { addToast } = useToast()
  const [showUpload, setShowUpload] = useState(false)
  const [showSources, setShowSources] = useState(false)
  const [showNewSlide, setShowNewSlide] = useState(false)
  const [panel, setPanel] = useState<PanelView>('editor')

  const project = getCurrentProject()

  const handleAddSlide = () => {
    if (!currentProjectId) {
      addToast('Crie um projeto primeiro', 'warning')
      return
    }
    setShowNewSlide(true)
  }

  const handleCreateSlide = (title: string) => {
    if (!currentProjectId) return
    const newSlide: Omit<Slide, 'id'> = {
      order: (project?.slides.length || 0) + 1,
      title,
      originalContent: '',
      currentContent: '',
      keywords: [],
      suggestions: [],
      appliedChanges: [],
    }
    addSlide(currentProjectId, newSlide)
  }

  return (
    <div className="flex flex-col h-screen bg-neutral-50">
      <Navbar onOpenSettings={() => setPanel(panel === 'settings' ? 'editor' : 'settings')} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar onAddSources={() => setShowSources(true)} onAddSlide={handleAddSlide} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b border-neutral-200 bg-white px-4 py-3 flex gap-2 justify-between flex-wrap">
            <div className="flex gap-2 flex-wrap">
              <Button variant="secondary" size="sm" onClick={() => setShowSources(true)}>
                📚 Adicionar Fontes
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setShowUpload(true)}>
                📤 Importar Aula Base
              </Button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={panel === 'history' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setPanel(panel === 'history' ? 'editor' : 'history')}
              >
                🕘 Histórico
              </Button>
              <Button
                variant={panel === 'export' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setPanel(panel === 'export' ? 'editor' : 'export')}
              >
                💾 Exportar
              </Button>
            </div>
          </div>

          {panel === 'settings' && <SettingsPanel />}
          {panel === 'export' && <ExportPanel />}
          {panel === 'history' && <HistoryPanel />}
          {panel === 'editor' && <SlideEditor />}
        </div>
      </div>

      {showUpload && <FileUpload onClose={() => setShowUpload(false)} />}
      {showSources && <SourceManager onClose={() => setShowSources(false)} />}
      {showNewSlide && <NewSlideModal onCreate={handleCreateSlide} onClose={() => setShowNewSlide(false)} />}
    </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <ProjectProvider>
        <AppContent />
      </ProjectProvider>
    </ToastProvider>
  )
}

export default App
