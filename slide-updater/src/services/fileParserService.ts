import { Slide } from '../types'
import { generateId } from '../utils/helpers'

interface ParsedSlide {
  title: string
  content: string
}

export async function parsePDFFile(file: File): Promise<ParsedSlide[]> {
  try {
    const text = await file.text()

    // Fallback simples: dividir por quebras de página ou linhas vazias
    const pages = text.split(/\n\n+/)
    return pages
      .map((page, idx) => ({
        title: `Slide ${idx + 1}`,
        content: page.trim(),
      }))
      .filter(slide => slide.content.length > 0)
  } catch (error) {
    console.error('PDF parsing error:', error)
    throw new Error('Erro ao processar PDF')
  }
}

export async function parsePPTXFile(file: File): Promise<ParsedSlide[]> {
  try {
    // Esta função requer o módulo 'docx'
    // Será implementada via dynamic import
    const buffer = await file.arrayBuffer()

    // Placeholder: será preenchido quando o módulo estiver disponível
    // Por enquanto, retorna erro com orientação
    throw new Error('PPTX parsing requer instalação de dependência')
  } catch (error) {
    console.error('PPTX parsing error:', error)
    throw new Error('Erro ao processar PPTX. Certifique-se de que a dependência docx está instalada.')
  }
}

export async function parseTextFile(file: File): Promise<ParsedSlide[]> {
  try {
    const text = await file.text()
    const lines = text.split('\n').filter(l => l.trim())

    return lines.map((line, idx) => ({
      title: `Slide ${idx + 1}: ${line.substring(0, 50)}...`,
      content: line.trim(),
    }))
  } catch (error) {
    console.error('Text parsing error:', error)
    throw new Error('Erro ao processar arquivo TXT')
  }
}

export async function parseFile(file: File): Promise<ParsedSlide[]> {
  const mimeType = file.type
  const fileName = file.name.toLowerCase()

  if (fileName.endsWith('.pdf') || mimeType === 'application/pdf') {
    return parsePDFFile(file)
  } else if (fileName.endsWith('.pptx') || fileName.endsWith('.ppt')) {
    return parsePPTXFile(file)
  } else if (fileName.endsWith('.txt') || mimeType === 'text/plain') {
    return parseTextFile(file)
  } else {
    throw new Error(`Formato de arquivo não suportado: ${fileName}`)
  }
}

export function createSlidesFromParsedData(parsedSlides: ParsedSlide[]): Omit<Slide, 'id'>[] {
  return parsedSlides.map(ps => ({
    title: ps.title,
    originalContent: ps.content,
    currentContent: ps.content,
    keywords: [],
    literatureUpdates: [],
    designNotes: {
      lastUpdated: new Date().toISOString(),
      suggestions: [],
      appliedChanges: [],
    },
    contentLength: ps.content.split(/\s+/).length,
  }))
}
