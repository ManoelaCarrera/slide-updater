import React, { useState, useEffect } from 'react'
import { Button } from './Button'
import { Card, CardBody, CardHeader } from './Card'
import { useToast } from './Toast'
import { getScopusApiKey, setScopusApiKey, clearScopusApiKey } from '../services/scopusService'

export function SettingsPanel() {
  const [scopusApiKey, setScopusApiKeyLocal] = useState('')
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const { addToast } = useToast()

  // Load saved API key on mount
  useEffect(() => {
    const saved = getScopusApiKey()
    if (saved) {
      setScopusApiKeyLocal('***' + saved.slice(-8)) // Mask for security
      setIsSaved(true)
    }
  }, [])

  const handleSaveApiKey = () => {
    if (!scopusApiKey.trim()) {
      addToast('Chave de API vazia', 'warning')
      return
    }

    // Only save if it's not masked
    if (!scopusApiKey.startsWith('***')) {
      setScopusApiKey(scopusApiKey)
      setScopusApiKeyLocal('***' + scopusApiKey.slice(-8))
      addToast('Chave de API Scopus salva com sucesso!', 'success')
      setShowApiKeyInput(false)
      setIsSaved(true)
    }
  }

  const handleRemoveApiKey = () => {
    clearScopusApiKey()
    setScopusApiKeyLocal('')
    addToast('Chave de API removida', 'info')
    setIsSaved(false)
    setShowApiKeyInput(false)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 space-y-4 overflow-auto">
        {/* Scopus API Key Section */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-neutral-900">Configurações de Busca</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                📊 Chave de API Scopus (Opcional)
              </label>
              <p className="text-xs text-neutral-600 mb-3">
                Ative buscas em Scopus para resultados mais completos. Fallback automático para PubMed se indisponível.
              </p>

              {!showApiKeyInput ? (
                <div className="flex items-center gap-2">
                  {isSaved ? (
                    <>
                      <div
                        className="flex-1 px-3 py-2 bg-green-50 border border-green-200 rounded text-sm text-green-700"
                        role="status"
                        aria-live="polite"
                      >
                        ✓ Scopus habilitado ({scopusApiKey})
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setShowApiKeyInput(true)}
                        aria-label="Editar chave de API Scopus"
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleRemoveApiKey}
                        aria-label="Remover chave de API Scopus"
                      >
                        Remover
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setShowApiKeyInput(true)}
                      aria-label="Adicionar chave de API Scopus"
                    >
                      Adicionar Chave
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="password"
                    placeholder="Cole sua chave de API Scopus aqui..."
                    value={scopusApiKey}
                    onChange={(e) => setScopusApiKeyLocal(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 text-sm"
                    aria-label="Entrada de chave de API Scopus"
                  />
                  <p className="text-xs text-neutral-500">
                    Sua chave não será compartilhada e fica armazenada localmente no navegador.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleSaveApiKey}
                      aria-label="Salvar chave de API"
                    >
                      Salvar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowApiKeyInput(false)
                        setScopusApiKeyLocal('')
                      }}
                      aria-label="Cancelar"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <div className="text-xs text-blue-900">
                <strong>Como obter uma chave de API Scopus?</strong>
                <ol className="mt-2 space-y-1 ml-4 list-decimal">
                  <li>Visite <a href="https://dev.elsevier.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">dev.elsevier.com</a></li>
                  <li>Registre uma conta e crie uma aplicação</li>
                  <li>Copie sua API Key</li>
                  <li>Cole aqui para ativar buscas em Scopus</li>
                </ol>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* About Section */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-neutral-900">Sobre</h3>
          </CardHeader>
          <CardBody>
            <div className="text-sm text-neutral-600 space-y-2">
              <p><strong>Slide Updater</strong> v1.0</p>
              <p>Ferramenta acadêmica para atualizar slides com literatura, análise de design e edição de conteúdo rich text.</p>
              <p className="text-xs text-neutral-500 mt-3">
                Dados armazenados localmente no navegador. Nenhuma informação é enviada para servidores externos além das buscas em PubMed e Scopus.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
