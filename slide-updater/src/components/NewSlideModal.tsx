import { useState } from 'react'
import { Button } from './Button'
import { Card, CardBody } from './Card'

interface NewSlideModalProps {
  onCreate: (title: string) => void
  onClose: () => void
}

export function NewSlideModal({ onCreate, onClose }: NewSlideModalProps) {
  const [title, setTitle] = useState('')

  const handleCreate = () => {
    if (!title.trim()) return
    onCreate(title.trim())
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-96">
        <CardBody className="space-y-4">
          <h2 className="text-lg font-semibold">Novo Slide</h2>

          <div>
            <label htmlFor="slide-title" className="block text-sm font-medium text-neutral-900 mb-2">
              Título do slide
            </label>
            <input
              id="slide-title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Mucosite Oral - Definição e Epidemiologia"
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="primary" onClick={handleCreate} disabled={!title.trim()} className="flex-1">
              Criar Slide
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
