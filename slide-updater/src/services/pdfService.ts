/**
 * Extração de texto de PDF 100% local, via pdf.js (pdfjs-dist).
 * Nenhuma chamada de rede: o worker é empacotado pelo Vite e servido junto do app.
 */
import * as pdfjsLib from 'pdfjs-dist'
// @ts-ignore - Vite resolve este import como URL do asset do worker
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl

export interface ExtractedPdf {
  text: string
  pages: number
}

/** Extrai o texto de todas as páginas de um PDF, localmente no navegador. */
export async function extractTextFromPdf(file: File): Promise<ExtractedPdf> {
  const buffer = await file.arrayBuffer()
  const loadingTask = pdfjsLib.getDocument({ data: buffer })
  const pdf = await loadingTask.promise

  const pageTexts: string[] = []
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    const strings = content.items
      .map(item => ('str' in item ? (item as { str: string }).str : ''))
      .join(' ')
    pageTexts.push(strings.trim())
  }

  return {
    text: pageTexts.join('\n\n'),
    pages: pdf.numPages,
  }
}
