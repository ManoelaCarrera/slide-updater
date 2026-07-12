/**
 * Busca textual local nas fontes carregadas + geração de sugestões.
 *
 * Nada aqui faz chamada de rede. Tudo roda no navegador, a partir do texto
 * já extraído das fontes (PDF via pdf.js, .txt/.md como string).
 *
 * Regra de ouro: nunca inventar dado. Toda sugestão carrega um `snippet`
 * literal, extraído da fonte, e o `reason` deixa claro que ela complementa
 * — não substitui — o raciocínio já proposto no slide.
 *
 * O match é por FRASE (não um bloco de N palavras ao redor do termo) e exige
 * coocorrência de pelo menos 2 palavras-chave do slide na mesma frase da
 * fonte — uma única palavra batendo por acaso não basta. Isso corta boa
 * parte dos falsos positivos e mantém o texto inserido do tamanho de uma
 * frase, compatível com o estilo enxuto dos slides.
 */
import { Slide, Source, Suggestion } from '../types'
import { extractKeywordTerms } from './keywordExtractor'
import { stripHtml } from './helpers'

const YEAR_RE = /\b(19|20)\d{2}\b/g
const MAX_SUGGESTIONS = 10
const MAX_SNIPPET_CHARS = 220

function escapeRegExp(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Divide o texto da fonte em frases. Fragmentos curtos (títulos, listas soltas) são descartados. */
function splitIntoSentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-ZÀ-Ú0-9"“])/)
    .map(s => s.trim())
    .filter(s => s.length >= 25)
}

function truncateSnippet(sentence: string): string {
  if (sentence.length <= MAX_SNIPPET_CHARS) return sentence
  const cut = sentence.slice(0, MAX_SNIPPET_CHARS)
  const lastSpace = cut.lastIndexOf(' ')
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : MAX_SNIPPET_CHARS)}…`
}

function countOccurrences(text: string, term: string): number {
  const matches = text.match(new RegExp(escapeRegExp(term), 'gi'))
  return matches ? matches.length : 0
}

export interface AnalysisResult {
  keywords: string[]
  suggestions: Array<Omit<Suggestion, 'id' | 'status' | 'appliedAt'>>
}

interface ScoredSuggestion {
  suggestion: Omit<Suggestion, 'id' | 'status' | 'appliedAt'>
  relevance: number
}

/**
 * Analisa um slide contra as fontes carregadas: extrai palavras-chave do
 * conteúdo atual e busca frases nas fontes onde pelo menos duas dessas
 * palavras-chave aparecem juntas, gerando sugestões de complementação
 * (nunca respostas prontas).
 */
export function analyzeSlideAgainstSources(slide: Slide, sources: Source[]): AnalysisResult {
  const plainContent = stripHtml(slide.currentContent || slide.originalContent)
  const keywords = extractKeywordTerms(plainContent, 8)
  if (keywords.length === 0) {
    return { keywords, suggestions: [] }
  }

  const minCoOccurrence = Math.min(2, keywords.length)
  const slideYears = (plainContent.match(YEAR_RE) || []).map(Number)
  const slideMaxYear = slideYears.length ? Math.max(...slideYears) : undefined
  const slideLower = plainContent.toLowerCase()
  const usableSources = sources.filter(s => !!s.metadata.extractedText)

  const scored: ScoredSuggestion[] = []
  const seen = new Set<string>()

  for (const source of usableSources) {
    const sentences = splitIntoSentences(source.metadata.extractedText as string)

    for (const sentence of sentences) {
      const sentenceLower = sentence.toLowerCase()
      const matchedKeywords = keywords.filter(k => sentenceLower.includes(k.toLowerCase()))
      if (matchedKeywords.length < minCoOccurrence) continue

      const snippet = truncateSnippet(sentence)
      const dedupeKey = `${source.id}:${snippet.slice(0, 80)}`
      if (seen.has(dedupeKey)) continue
      seen.add(dedupeKey)

      const keywordLabel = matchedKeywords.slice(0, 2).join('" e "')
      const years = (sentence.match(YEAR_RE) || []).map(Number)
      const sentenceMaxYear = years.length ? Math.max(...years) : undefined

      let suggestion: Omit<Suggestion, 'id' | 'status' | 'appliedAt'>

      if (sentenceMaxYear && slideMaxYear && sentenceMaxYear > slideMaxYear) {
        suggestion = {
          type: 'update_data',
          sourceId: source.id,
          suggestedText: `"${snippet}"`,
          reason: `O slide traz referência até ${slideMaxYear} sobre "${keywordLabel}"; "${source.name}" aborda o mesmo tema com data mais recente (${sentenceMaxYear}). Vale conferir se ainda é o dado mais atual para levar aos alunos.`,
          snippet,
        }
      } else {
        const totalOccurrencesInSlide = matchedKeywords.reduce(
          (sum, k) => sum + countOccurrences(slideLower, k.toLowerCase()),
          0
        )
        const isGap = totalOccurrencesInSlide <= matchedKeywords.length

        suggestion = isGap
          ? {
              type: 'gap',
              sourceId: source.id,
              suggestedText: `"${snippet}"`,
              reason: `O slide menciona "${keywordLabel}" mas não aprofunda — "${source.name}" traz mais fundamentação sobre isso especificamente. Pode ser material de apoio para a pergunta que já está no slide, sem substituir o raciocínio do aluno.`,
              snippet,
            }
          : {
              type: 'add_citation',
              sourceId: source.id,
              suggestedText: `"${snippet}"`,
              reason: `"${source.name}" traz uma frase que relaciona diretamente "${keywordLabel}", já discutidos neste slide — pode servir de referência de apoio.`,
              snippet,
            }
      }

      scored.push({ suggestion, relevance: matchedKeywords.length })
    }
  }

  const suggestions = scored
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, MAX_SUGGESTIONS)
    .map(s => s.suggestion)

  return { keywords, suggestions }
}
