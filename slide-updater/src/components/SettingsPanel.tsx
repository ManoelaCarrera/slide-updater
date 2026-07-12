import { useState } from 'react'
import { Button } from './Button'
import { Card, CardBody, CardHeader } from './Card'
import { useToast } from './Toast'
import { useProject } from '../context/ProjectContext'
import { DISCIPLINE_LABELS, Discipline } from '../types'
import { estimateStorageSize, formatFileSize } from '../utils/helpers'

export function SettingsPanel() {
  const { getCurrentProject, updateProject, updateSettings } = useProject()
  const { addToast } = useToast()
  const project = getCurrentProject()
  const [name, setName] = useState(project?.name || '')

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center text-neutral-600 p-4 text-center">
        Selecione um projeto para ver as configurações.
      </div>
    )
  }

  const handleSaveName = () => {
    if (!name.trim()) return
    updateProject(project.id, { name: name.trim() })
    addToast('Nome do projeto atualizado', 'success')
  }

  const storageBytes = estimateStorageSize(project)
  const storageWarning = storageBytes > 5 * 1024 * 1024

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 space-y-4 overflow-auto">
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-neutral-900">Projeto</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label htmlFor="settings-name" className="block text-sm font-medium text-neutral-900 mb-2">
                Nome do projeto
              </label>
              <div className="flex gap-2">
                <input
                  id="settings-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
                <Button size="sm" variant="primary" onClick={handleSaveName}>
                  Salvar
                </Button>
              </div>
            </div>

            <div>
              <label htmlFor="settings-discipline" className="block text-sm font-medium text-neutral-900 mb-2">
                Disciplina
              </label>
              <select
                id="settings-discipline"
                value={project.discipline}
                onChange={e => updateProject(project.id, { discipline: e.target.value as Discipline })}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 bg-white"
              >
                {Object.entries(DISCIPLINE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold text-neutral-900">Validação de sugestões</h3>
          </CardHeader>
          <CardBody className="space-y-2">
            <p className="text-xs text-neutral-600">
              Como você quer revisar as sugestões geradas a partir das fontes?
            </p>
            <label className="flex items-start gap-2 p-3 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50">
              <input
                type="radio"
                name="validationMode"
                checked={project.settings.validationMode === 'step-by-step'}
                onChange={() => updateSettings(project.id, { validationMode: 'step-by-step' })}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-medium text-neutral-900">Modo A · Passo-a-passo</span>
                <span className="block text-xs text-neutral-600">
                  Uma sugestão por vez: aprova, rejeita ou edita antes de seguir para a próxima.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-2 p-3 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50">
              <input
                type="radio"
                name="validationMode"
                checked={project.settings.validationMode === 'final-review'}
                onChange={() => updateSettings(project.id, { validationMode: 'final-review' })}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-medium text-neutral-900">Modo B · Revisão final</span>
                <span className="block text-xs text-neutral-600">
                  Vê todas as sugestões de uma vez, marca as que quer aplicar e confirma em lote.
                </span>
              </span>
            </label>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold text-neutral-900">Armazenamento</h3>
          </CardHeader>
          <CardBody className="space-y-2">
            <p className="text-sm text-neutral-700">
              Este projeto ocupa aproximadamente <strong>{formatFileSize(storageBytes)}</strong> no localStorage
              do navegador.
            </p>
            {storageWarning && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs text-yellow-900">
                ⚠️ Projeto grande. Se notar lentidão, remova imagens/fontes que não estão mais em uso ou baixe
                um backup JSON (na aba Exportar) antes de continuar.
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold text-neutral-900">Sobre</h3>
          </CardHeader>
          <CardBody>
            <div className="text-sm text-neutral-600 space-y-2">
              <p>
                <strong>Slide Updater</strong> v2.0
              </p>
              <p>
                Ferramenta acadêmica para atualizar slides com literatura carregada por você. Sem PubMed, Scopus
                ou qualquer outra API externa — a busca é local, nas fontes que você mesma carrega.
              </p>
              <p className="text-xs text-neutral-500 mt-3">
                Todos os dados ficam salvos apenas no navegador (localStorage). Nenhuma informação — slide,
                fonte ou sugestão — é enviada para servidor nenhum.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
