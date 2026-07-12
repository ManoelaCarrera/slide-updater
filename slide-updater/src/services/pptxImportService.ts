/**
 * Extrai texto (título + conteúdo) de um .pptx existente para popular o
 * projeto. Não edita o arquivo original — os slides extraídos entram no
 * mesmo modelo de dados usado pela importação de .txt/.md, e a exportação
 * de volta gera um PPTX novo no template do design system (ver exportService).
 * Imagens, tema visual e formatação do arquivo original não são preservados,
 * só o texto.
 */
import JSZip from 'jszip'

interface ParsedSlide {
  title: string
  content: string
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function slideNumber(path: string): number {
  const match = path.match(/slide(\d+)\.xml$/)
  return match ? parseInt(match[1], 10) : 0
}

function extractTextRuns(node: Element): string {
  return Array.from(node.getElementsByTagName('a:t'))
    .map(t => t.textContent || '')
    .join('')
}

function parseSlideXml(xmlText: string): { title: string; paragraphs: string[] } {
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml')
  if (doc.getElementsByTagName('parsererror').length > 0) {
    return { title: '', paragraphs: [] }
  }

  let title = ''
  const bodyParagraphs: string[] = []

  for (const shape of Array.from(doc.getElementsByTagName('p:sp'))) {
    const placeholder = shape.getElementsByTagName('p:ph')[0]
    const placeholderType = placeholder?.getAttribute('type') || ''
    const isTitle = placeholderType === 'title' || placeholderType === 'ctrTitle'

    const shapeParagraphs = Array.from(shape.getElementsByTagName('a:p'))
      .map(extractTextRuns)
      .map(t => t.trim())
      .filter(t => t.length > 0)

    if (shapeParagraphs.length === 0) continue

    if (isTitle && !title) {
      title = shapeParagraphs.join(' ')
    } else {
      bodyParagraphs.push(...shapeParagraphs)
    }
  }

  if (!title && bodyParagraphs.length > 0) {
    title = bodyParagraphs.shift() as string
  }

  return { title, paragraphs: bodyParagraphs }
}

export async function parsePptxFile(file: File): Promise<ParsedSlide[]> {
  if (file.name.toLowerCase().endsWith('.ppt')) {
    throw new Error(
      'Formato .ppt (binário antigo do PowerPoint) não é suportado. Abra o arquivo no PowerPoint e salve como .pptx, depois importe novamente.'
    )
  }

  let zip: JSZip
  try {
    zip = await JSZip.loadAsync(file)
  } catch {
    throw new Error('Não consegui abrir este arquivo como PPTX. Verifique se ele não está corrompido.')
  }

  const slidePaths = Object.keys(zip.files)
    .filter(name => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => slideNumber(a) - slideNumber(b))

  if (slidePaths.length === 0) {
    throw new Error('Não encontrei slides neste arquivo. Confirme que é um .pptx válido.')
  }

  const parsed: ParsedSlide[] = []
  for (let i = 0; i < slidePaths.length; i++) {
    const xmlText = await zip.files[slidePaths[i]].async('text')
    const { title, paragraphs } = parseSlideXml(xmlText)
    const content = paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('')
    parsed.push({
      title: title ? escapeHtml(title) : `Slide ${i + 1}`,
      content,
    })
  }

  return parsed
}
