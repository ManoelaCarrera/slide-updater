import { useState } from 'react'
import { ProjectProvider } from './context/ProjectContext'
import { ToastProvider } from './components/Toast'
import { Navbar } from './components/Navbar'
import { Sidebar } from './components/Sidebar'
import { SlideEditor } from './components/SlideEditor'
import { ExportPanel } from './components/ExportPanel'
import { SettingsPanel } from './components/SettingsPanel'
import { FileUpload } from './components/FileUpload'
import { Button } from './components/Button'

function AppContent() {
  const [showUpload, setShowUpload] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="flex flex-col h-screen bg-neutral-50">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col">
          <div className="border-b border-neutral-200 bg-white px-4 py-3 flex gap-2 justify-between">
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowUpload(true)}
              >
                📤 Importar Slides
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowExport(true)}
              >
                💾 Exportar
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              aria-label="Abrir configurações"
            >
              ⚙️
            </Button>
          </div>

          {showSettings ? (
            <SettingsPanel />
          ) : showExport ? (
            <ExportPanel />
          ) : (
            <SlideEditor />
          )}
        </div>
      </div>

      {showUpload && <FileUpload onClose={() => setShowUpload(false)} />}
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
