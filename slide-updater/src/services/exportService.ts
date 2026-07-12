/**
 * Exportação 100% local: PPTX (pptxgenjs), PDF (html2pdf.js) e backup JSON.
 * Nenhuma etapa envolve rede — tudo é gerado no navegador da Profa.
 */
import pptxgen from 'pptxgenjs'
import html2pdf from 'html2pdf.js'
import { Project } from '../types'
import { stripHtml, escapeHtml } from '../utils/helpers'

const COLORS = {
  terracota: 'C17847',
  marromEscuro: '2C2416',
  bege: 'FAF8F5',
  referenceText: '666666',
  footerText: '999999',
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^\w\-]+/g, '_')
}

function dateStamp(): string {
  return new Date().toISOString().split('T')[0]
}

function sourceNameFor(project: Project, sourceId: string): string {
  return project.sources.find(s => s.id === sourceId)?.name || 'fonte removida'
}

function triggerDownload(blob: Blob, filename: string) {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

/** Exporta o projeto como PPTX, preservando marcações de fonte de cada slide. */
export async function exportProjectToPPTX(project: Project): Promise<void> {
  const pptx = new pptxgen()
  const sortedSlides = [...project.slides].sort((a, b) => a.order - b.order)

  sortedSlides.forEach((slide, idx) => {
    const pptxSlide = pptx.addSlide()
    pptxSlide.background = { color: COLORS.bege }

    pptxSlide.addText(slide.title, {
      x: 0.5,
      y: 0.4,
      w: 8.5,
      h: 0.7,
      fontFace: 'Calibri',
      fontSize: 32,
      bold: true,
      color: COLORS.terracota,
      align: 'left',
    })

    pptxSlide.addShape('rect', {
      x: 0.5,
      y: 1.15,
      w: 1.5,
      h: 0.03,
      fill: { color: COLORS.terracota },
      line: { color: COLORS.terracota, width: 0 },
    })

    const plainContent = stripHtml(slide.currentContent || slide.originalContent) || '(sem conteúdo)'
    pptxSlide.addText(plainContent, {
      x: 0.5,
      y: 1.5,
      w: 8.5,
      h: slide.appliedChanges.length > 0 ? 4.0 : 5.0,
      fontFace: 'Calibri',
      fontSize: 14,
      color: COLORS.marromEscuro,
      align: 'left',
      valign: 'top',
      lineSpacing: 20,
    })

    if (slide.appliedChanges.length > 0) {
      const refLines = slide.appliedChanges
        .map(change => `• ${sourceNameFor(project, change.sourceId)}: ${stripHtml(change.insertedText).slice(0, 160)}`)
        .join('\n')

      pptxSlide.addText('Referências Utilizadas', {
        x: 0.5,
        y: 5.6,
        w: 8.5,
        h: 0.3,
        fontFace: 'Calibri',
        fontSize: 11,
        bold: true,
        color: COLORS.terracota,
      })
      pptxSlide.addText(refLines, {
        x: 0.5,
        y: 5.9,
        w: 8.5,
        h: 0.85,
        fontFace: 'Calibri',
        fontSize: 9,
        color: COLORS.referenceText,
        valign: 'top',
        lineSpacing: 12,
      })
    }

    pptxSlide.addText(`${idx + 1}`, {
      x: 8.8,
      y: 6.8,
      w: 0.5,
      h: 0.3,
      fontFace: 'Calibri',
      fontSize: 10,
      color: COLORS.footerText,
      align: 'right',
    })
  })

  await pptx.writeFile({ fileName: `${sanitizeFileName(project.name)}-${dateStamp()}.pptx` })
}

function buildPrintableHtml(project: Project): string {
  const sortedSlides = [...project.slides].sort((a, b) => a.order - b.order)
  const slidesHtml = sortedSlides
    .map(slide => {
      const refsHtml =
        slide.appliedChanges.length > 0
          ? `<div class="references"><strong>Referências utilizadas:</strong><ul>${slide.appliedChanges
              .map(
                change =>
                  `<li>${escapeHtml(sourceNameFor(project, change.sourceId))}: ${escapeHtml(
                    stripHtml(change.insertedText).slice(0, 200)
                  )}</li>`
              )
              .join('')}</ul></div>`
          : ''
      return `
        <section class="slide">
          <h2>${escapeHtml(slide.title)}</h2>
          <div class="slide-content">${slide.currentContent || escapeHtml(slide.originalContent)}</div>
          ${refsHtml}
        </section>`
    })
    .join('')

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#2c2416;">
      <style>
        .slide { background:#faf8f5; border-radius:12px; padding:32px; margin-bottom:20px; page-break-after: always; }
        .slide h2 { color:#c17847; border-bottom:3px solid #c17847; padding-bottom:8px; margin-top:0; }
        .slide-content { line-height:1.6; }
        .references { font-size:0.85em; color:#666666; margin-top:16px; }
      </style>
      <h1 style="color:#c17847;">${escapeHtml(project.name)}</h1>
      ${slidesHtml}
    </div>`
}

/** Exporta o projeto como PDF, para compartilhamento/impressão. */
export async function exportProjectToPDF(project: Project): Promise<void> {
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-99999px'
  container.style.top = '0'
  container.style.width = '900px'
  container.innerHTML = buildPrintableHtml(project)
  document.body.appendChild(container)

  try {
    await html2pdf()
      .set({
        margin: 10,
        filename: `${sanitizeFileName(project.name)}-${dateStamp()}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
        pagebreak: { mode: ['css', 'legacy'] },
      })
      .from(container)
      .save()
  } finally {
    document.body.removeChild(container)
  }
}

/** Backup completo do projeto em JSON (para continuar depois ou enviar a colega). */
export function exportProjectToJSON(project: Project): void {
  const json = JSON.stringify(project, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  triggerDownload(blob, `${sanitizeFileName(project.name)}-backup.json`)
}

/** Lê e valida um arquivo JSON de backup de projeto. */
export async function parseProjectJSON(file: File): Promise<Project> {
  const text = await file.text()
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Arquivo JSON inválido')
  }
  if (
    typeof data !== 'object' ||
    data === null ||
    !('id' in data) ||
    !('slides' in data) ||
    !('sources' in data)
  ) {
    throw new Error('Este arquivo não parece ser um backup válido de projeto do Slide Updater')
  }
  return data as Project
}
