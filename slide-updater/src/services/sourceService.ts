/**
 * Transforma arquivos carregados pela Profa (PDF, imagem, .txt, .md) em
 * objetos `Source`. Tudo roda localmente: leitura de arquivo + pdf.js para
 * PDFs. Nenhuma requisição de rede é feita.
 */
import { Source, SourceType } from '../types'
import { generateId } from '../utils/helpers'
import { extractTextFromPdf } from './pdfService'

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB por arquivo

function detectSourceType(file: File): SourceType | null {
  const name = file.name.toLowerCase()
  if (name.endsWith('.pdf') || file.type === 'application/pdf') return 'pdf'
  if (name.endsWith('.md') || name.endsWith('.markdown')) return 'md'
  if (name.endsWith('.txt') || file.type === 'text/plain') return 'txt'
  if (file.type.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp)$/i.test(name)) return 'image'
  return null
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error(`Não foi possível ler o arquivo: ${file.name}`))
    reader.readAsDataURL(file)
  })
}

/** Converte um File em Source, extraindo texto/preview conforme o tipo. */
export async function fileToSource(file: File): Promise<Source> {
  const type = detectSourceType(file)
  if (!type) {
    throw new Error(`Formato não suportado: ${file.name}. Use PDF, imagem, .txt ou .md.`)
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Arquivo muito grande (máx. 25MB): ${file.name}`)
  }
  if (file.size === 0) {
    throw new Error(`Arquivo vazio: ${file.name}`)
  }

  const base: Source = {
    id: generateId(),
    name: file.name,
    type,
    uploadedAt: new Date().toISOString(),
    fileSize: file.size,
    metadata: {},
  }

  if (type === 'pdf') {
    const { text, pages } = await extractTextFromPdf(file)
    if (!text.trim()) {
      throw new Error(
        `Não foi possível extrair texto de "${file.name}". O PDF pode ser um scan de imagem sem OCR — a busca textual não vai encontrar nada nele.`
      )
    }
    base.metadata = { extractedText: text, pages }
  } else if (type === 'image') {
    const dataUrl = await readFileAsDataUrl(file)
    base.metadata = { dataUrl, mimeType: file.type }
  } else {
    const text = await file.text()
    if (!text.trim()) {
      throw new Error(`Arquivo vazio ou ilegível: ${file.name}`)
    }
    base.metadata = { extractedText: text }
  }

  return base
}

export async function filesToSources(files: File[]): Promise<{ sources: Source[]; errors: string[] }> {
  const sources: Source[] = []
  const errors: string[] = []
  for (const file of files) {
    try {
      sources.push(await fileToSource(file))
    } catch (error) {
      errors.push(error instanceof Error ? error.message : `Erro ao processar ${file.name}`)
    }
  }
  return { sources, errors }
}
