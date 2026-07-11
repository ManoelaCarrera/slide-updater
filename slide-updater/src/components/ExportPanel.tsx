import React, { useState } from 'react'
import { Button } from './Button'
import { Card, CardBody, CardHeader } from './Card'
import { useProject } from '../context/ProjectContext'
import { useToast } from './Toast'
import * as PptxGenJS from 'pptxgen'

const pptx = PptxGenJS.default || PptxGenJS

export function ExportPanel() {
  const { getCurrentProject } = useProject()
  const { addToast } = useToast()
  const [isExporting, setIsExporting] = useState(false)

  const project = getCurrentProject()

  if (!project) return null

  const exportToHTML = () => {
    setIsExporting(true)
    try {
      const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; background: #faf8f5; }
    .slide { background: white; border-radius: 12px; padding: 40px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .slide h2 { color: #c17847; margin-top: 0; border-bottom: 3px solid #c17847; padding-bottom: 10px; }
    .slide-content { line-height: 1.6; color: #333; }
    .references { font-size: 0.9em; color: #666; margin-top: 20px; }
  </style>
</head>
<body>
  <h1>${project.name}</h1>
  ${project.slides
    .map(
      slide => `
    <div class="slide">
      <h2>${slide.title}</h2>
      <div class="slide-content">${slide.currentContent.replace(/\n/g, '<br>')}</div>
      ${
        slide.literatureUpdates.length > 0
          ? `
        <div class="references">
          <strong>Referências:</strong>
          <ul>
            ${slide.literatureUpdates.map(lit => `<li><a href="${lit.url}">${lit.title}</a> - ${lit.authors} (${lit.year})</li>`).join('')}
          </ul>
        </div>
      `
          : ''
      }
    </div>
  `
    )
    .join('')}
</body>
</html>`

      const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${project.name}-${new Date().toISOString().split('T')[0]}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)

      addToast('Exportado como HTML', 'success')
    } catch (error) {
      addToast('Erro ao exportar para HTML', 'error')
      console.error(error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportToJSON = () => {
    setIsExporting(true)
    try {
      const json = JSON.stringify(project, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${project.name}-backup.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)

      addToast('Backup salvo como JSON', 'success')
    } catch (error) {
      addToast('Erro ao criar backup', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  const exportToPPTX = () => {
    setIsExporting(true)
    try {
      if (typeof pptx === 'function') {
        const presentation = new (pptx as any)()

        // Configurar tema: cores e fontes padrão
        const themePrimary = '#c17847' // terracota
        const themeSecondary = '#2c2416' // marrom escuro
        const themeNeutral = '#faf8f5' // off-white

        project.slides.forEach((slide, slideIdx) => {
          const slidePage = presentation.addSlide()

          // Fundo
          slidePage.background = { color: themeNeutral }

          // Título (com linha decorativa)
          slidePage.addText(slide.title, {
            x: 0.5,
            y: 0.4,
            w: 8.5,
            h: 0.7,
            fontSize: 36,
            bold: true,
            color: themePrimary,
            align: 'left',
            fontFace: 'Calibri',
          })

          // Linha decorativa sob o título
          slidePage.addShape(presentation.ShapeType.rect, {
            x: 0.5,
            y: 1.15,
            w: 1.5,
            h: 0.05,
            fill: { color: themePrimary },
            line: { type: 'none' },
          })

          // Conteúdo principal
          slidePage.addText(slide.currentContent, {
            x: 0.5,
            y: 1.5,
            w: 8.5,
            h: 4.2,
            fontSize: 14,
            color: themeSecondary,
            align: 'left',
            valign: 'top',
            fontFace: 'Calibri',
            lineSpacing: 20,
            wrap: true,
          })

          // Referências aprovadas (se houver)
          const approvedLiterature = slide.literatureUpdates.filter(lit => lit.approved)
          if (approvedLiterature.length > 0) {
            const refsStartY = 5.8
            slidePage.addText('Referências Utilizadas:', {
              x: 0.5,
              y: refsStartY,
              w: 8.5,
              h: 0.3,
              fontSize: 11,
              bold: true,
              color: themePrimary,
              fontFace: 'Calibri',
            })

            const refList = approvedLiterature
              .map(lit => `${lit.authors} (${lit.year}). ${lit.title}`)
              .join('\n')

            slidePage.addText(refList, {
              x: 0.5,
              y: refsStartY + 0.35,
              w: 8.5,
              h: 0.85,
              fontSize: 9,
              color: '#666666',
              align: 'left',
              valign: 'top',
              fontFace: 'Calibri',
              lineSpacing: 14,
              wrap: true,
            })
          }

          // Rodapé: número do slide
          slidePage.addText(`${slideIdx + 1}`, {
            x: 8.8,
            y: 6.8,
            w: 0.5,
            h: 0.3,
            fontSize: 10,
            color: '#999999',
            align: 'right',
            fontFace: 'Calibri',
          })
        })

        presentation.writeFile({
          fileName: `${project.name}-${new Date().toISOString().split('T')[0]}.pptx`,
        })

        addToast('Exportado como PPTX com sucesso!', 'success')
      } else {
        addToast('Erro: pptxgen não disponível. Tente novamente.', 'error')
      }
    } catch (error) {
      addToast('Erro ao exportar para PPTX', 'error')
      console.error(error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Exportar Apresentação</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          <Button
            variant="primary"
            onClick={exportToHTML}
            isLoading={isExporting}
            className="w-full"
            aria-label="Exportar apresentação como arquivo HTML"
          >
            📄 Exportar como HTML
          </Button>
          <Button
            variant="primary"
            onClick={exportToPPTX}
            isLoading={isExporting}
            className="w-full"
            aria-label="Exportar apresentação como arquivo PowerPoint PPTX"
          >
            📊 Exportar como PPTX
          </Button>
          <Button
            variant="secondary"
            onClick={exportToJSON}
            isLoading={isExporting}
            className="w-full"
            aria-label="Fazer backup dos dados da apresentação em formato JSON"
          >
            💾 Backup JSON
          </Button>
        </CardBody>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardBody className="text-sm text-blue-900">
          💡 <strong>Dica:</strong> Use JSON para fazer backup completo e depois importar. HTML é melhor para compartilhar.
        </CardBody>
      </Card>

      <div className="text-xs text-neutral-600 text-center">
        Último salvo: {project.updatedAt ? new Date(project.updatedAt).toLocaleString() : 'Nunca'}
      </div>
    </div>
  )
}
