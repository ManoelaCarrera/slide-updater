/**
 * Importação da AULA BASE (não confundir com fontes de referência).
 * Aceita descrição em tópicos (.txt/.md — uma linha ou bloco = um slide) ou
 * um .pptx existente (extrai título + texto de cada slide via pptxImportService).
 */
import { Slide } from '../types'
import { parsePptxFile } from './pptxImportService'

interface ParsedSlide {
  title: string
  content: string
}

async function parseTopicsFile(file: File): Promise<ParsedSlide[]> {
  const text = await file.text()
  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)

  return lines.map((line, idx) => ({
    title: line.length > 60 ? `${line.slice(0, 60)}…` : line,
    content: line,
  }))
}

export async function parseBaseFile(file: File): Promise<ParsedSlide[]> {
  const name = file.name.toLowerCase()

  if (name.endsWith('.txt') || name.endsWith('.md') || file.type === 'text/plain') {
    const parsed = await parseTopicsFile(file)
    if (parsed.length === 0) {
      throw new Error('Arquivo vazio ou inválido')
    }
    return parsed
  }

  if (name.endsWith('.pptx') || name.endsWith('.ppt')) {
    const parsed = await parsePptxFile(file)
    if (parsed.length === 0) {
      throw new Error('Não encontrei conteúdo neste arquivo PPTX.')
    }
    return parsed
  }

  throw new Error(`Formato de arquivo não suportado: ${file.name}. Use .txt ou .md com um tópico por linha.`)
}

export function createSlidesFromParsedData(
  parsedSlides: ParsedSlide[],
  startOrder: number
): Omit<Slide, 'id'>[] {
  return parsedSlides.map((ps, idx) => ({
    order: startOrder + idx,
    title: ps.title,
    originalContent: ps.content,
    currentContent: ps.content,
    keywords: [],
    suggestions: [],
    appliedChanges: [],
  }))
}
