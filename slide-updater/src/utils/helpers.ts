export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function analyzeContentLength(text: string): {
  wordCount: number
  charCount: number
  isTextHeavy: boolean
} {
  const plain = stripHtml(text)
  const wordCount = plain.trim().length === 0 ? 0 : plain.trim().split(/\s+/).length
  const charCount = plain.length
  const isTextHeavy = wordCount > 150
  return { wordCount, charCount, isTextHeavy }
}

export function estimateReadingTime(wordCount: number): number {
  const wordsPerMinute = 200
  return Math.max(1, Math.round(wordCount / wordsPerMinute))
}

/** Remove marcação HTML, retornando apenas o texto visível. */
export function stripHtml(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

/** Escapa texto bruto para inserção segura em HTML (previne XSS). */
export function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, exponent)
  return `${exponent === 0 ? value : value.toFixed(1)} ${units[exponent]}`
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('pt-BR')
  } catch {
    return iso
  }
}

/** Estimativa aproximada do tamanho ocupado por um projeto em localStorage. */
export function estimateStorageSize(value: unknown): number {
  try {
    return new Blob([JSON.stringify(value)]).size
  } catch {
    return 0
  }
}
