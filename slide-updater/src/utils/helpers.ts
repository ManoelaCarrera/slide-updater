export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

import { extractKeywordTerms } from './keywordExtractor'

export function extractKeywords(text: string): string[] {
  // Use TF-IDF extractor with domain-specific boosting
  return extractKeywordTerms(text, 7)
}

export function analyzeContentLength(text: string): { wordCount: number; charCount: number; isTextHeavy: boolean } {
  const wordCount = text.split(/\s+/).length
  const charCount = text.length
  const isTextHeavy = wordCount > 150
  return { wordCount, charCount, isTextHeavy }
}

import { generateDesignSuggestions as generateDesignSuggestionsFromService } from '../services/designAnalyzerService'

export function generateDesignSuggestions(content: string, title: string): Array<{ type: string; message: string; recommendation: string; severity: 'low' | 'medium' | 'high' }> {
  // Use enhanced DesignAnalyzer with 5-type detection
  return generateDesignSuggestionsFromService(content, title) as Array<any>
}

export function estimateReadingTime(wordCount: number): number {
  const wordsPerMinute = 200
  return Math.max(1, Math.round(wordCount / wordsPerMinute))
}

export function sanitizeHtml(html: string): string {
  const div = document.createElement('div')
  div.textContent = html
  return div.innerHTML
}
