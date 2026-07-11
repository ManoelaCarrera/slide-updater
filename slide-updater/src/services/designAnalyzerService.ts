/**
 * Design analyzer for academic presentations.
 * Detects common design issues and suggests improvements based on content structure.
 * Specializes in dental oncology and scientific presentation standards.
 */

import { DesignSuggestion } from '../types'
import { generateId } from '../utils/helpers'

export interface AnalysisResult {
  suggestions: DesignSuggestion[]
  summary: {
    wordCount: number
    hasTitle: boolean
    hasStructure: boolean
    hasVisuals: boolean
    overallScore: number
  }
}

/**
 * Design analyzer for scientific slides.
 * Evaluates content structure, text load, hierarchy, visual elements, and color contrast.
 */
export class DesignAnalyzer {
  /**
   * Design system color palette (warm, professional, academic).
   * Suitable for dental and medical presentations.
   */
  private designSystemColors: string[] = [
    '#c17847', // Warm brown (primary)
    '#f5f3f0', // Cream/off-white (background)
    '#3d3d3d', // Dark gray (text)
    '#e8e3de', // Light beige (accent)
    '#8b6f47', // Tan (secondary)
  ]

  /**
   * Analyze slide content and generate design suggestions.
   * @param content - Slide body/content text
   * @param title - Slide title
   * @returns Analysis result with suggestions and summary metrics
   */
  analyze(content: string, title: string): AnalysisResult {
    const suggestions: DesignSuggestion[] = []
    const wordCount = this.countWords(content)
    const hasTitle = Boolean(title && title.trim().length > 0)
    const hasStructure = this.detectStructure(content)
    const hasVisuals = this.detectVisualPlaceholders(content)

    // Detect: text-heavy (>150 words)
    if (this.isTextHeavy(wordCount)) {
      suggestions.push(this.createTextHeavySuggestion(wordCount))
    }

    // Detect: missing-hierarchy (no bullets, numbered lists, or line breaks)
    if (!hasStructure && wordCount > 30) {
      suggestions.push(this.createMissingHierarchySuggestion(wordCount))
    }

    // Detect: missing-visual (no visual indicators, all text)
    if (!hasVisuals && wordCount > 20 && wordCount < 100) {
      suggestions.push(this.createMissingVisualSuggestion())
    }

    // Detect: low-contrast (suggest palette from design system)
    if (this.needsColorReview(content)) {
      suggestions.push(this.createLowContrastSuggestion())
    }

    // Detect: suggested-layout (recommend specific slide structure)
    if (wordCount > 80 && !hasStructure) {
      suggestions.push(this.createSuggestedLayoutSuggestion(content))
    }

    // Calculate overall design score (0-100)
    const overallScore = this.calculateDesignScore(
      wordCount,
      hasStructure,
      hasVisuals,
      suggestions.length
    )

    return {
      suggestions,
      summary: {
        wordCount,
        hasTitle,
        hasStructure,
        hasVisuals,
        overallScore,
      },
    }
  }

  /**
   * Detect if content is text-heavy (>150 words).
   */
  private isTextHeavy(wordCount: number): boolean {
    return wordCount > 150
  }

  /**
   * Count words in text.
   */
  private countWords(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter(w => w.length > 0).length
  }

  /**
   * Detect structural markers: bullets, numbers, line breaks, headers.
   */
  private detectStructure(content: string): boolean {
    const hasBullets = /^[\s]*[-•*]\s/m.test(content)
    const hasNumberedList = /^[\s]*\d+[\.\)]\s/m.test(content)
    const hasLineBreaks = (content.match(/\n/g) || []).length > 2
    const hasHeaders = /^#+\s/m.test(content) || /^[A-Z]{2,}:/m.test(content)

    return hasBullets || hasNumberedList || hasLineBreaks || hasHeaders
  }

  /**
   * Detect visual placeholders ([image], [chart], [diagram], etc.).
   */
  private detectVisualPlaceholders(content: string): boolean {
    const visualPatterns = /\[(imagem|image|gráfico|chart|diagrama|diagram|figura|figure|visual)\]/i
    return visualPatterns.test(content)
  }

  /**
   * Check if slide needs color/contrast review.
   * Heuristic: presence of style markers or custom color references.
   */
  private needsColorReview(content: string): boolean {
    // Suggest if text is very long (harder to read without color hierarchy)
    const wordCount = this.countWords(content)
    return wordCount > 120
  }

  /**
   * Create "text-heavy" suggestion.
   */
  private createTextHeavySuggestion(wordCount: number): DesignSuggestion {
    return {
      id: generateId(),
      type: 'text-heavy',
      message: `Este slide contém ${wordCount} palavras, excedendo o limite recomendado de 150 palavras.`,
      recommendation:
        'Divida o conteúdo em múltiplos slides ou crie estrutura visual (bullets, diagramas). Mantenha máximo 150 palavras por slide para legibilidade.',
      severity: 'high',
      actionable: true,
      suggestedLayout: 'split-content',
    }
  }

  /**
   * Create "missing-hierarchy" suggestion.
   */
  private createMissingHierarchySuggestion(wordCount: number): DesignSuggestion {
    return {
      id: generateId(),
      type: 'missing-hierarchy',
      message: `Conteúdo sem estrutura hierárquica clara (${wordCount} palavras em bloco contínuo).`,
      recommendation:
        'Use bullets (•), números, parágrafos curtos ou seções com cabeçalhos. Hierarquia visual melhora retenção e legibilidade. Estruture em 3-5 pontos principais.',
      severity: 'high',
      actionable: true,
      suggestedLayout: 'bullet-points',
    }
  }

  /**
   * Create "missing-visual" suggestion.
   */
  private createMissingVisualSuggestion(): DesignSuggestion {
    return {
      id: generateId(),
      type: 'missing-visual',
      message: 'Slide possui apenas conteúdo textual, sem elementos visuais.',
      recommendation:
        'Adicione um elemento visual: gráfico, diagrama, foto, ícone ou infográfico. Referências visuais aumentam compreensão e retenção em até 65%.',
      severity: 'medium',
      actionable: true,
      suggestedLayout: 'text-visual',
    }
  }

  /**
   * Create "low-contrast" suggestion with color recommendations.
   */
  private createLowContrastSuggestion(): DesignSuggestion {
    return {
      id: generateId(),
      type: 'low-contrast',
      message: 'Revise contraste de cores e hierarquia visual para acessibilidade.',
      recommendation: `Use a paleta recomendada: ${this.designSystemColors.join(', ')}. Garanta razão de contraste mínima 4.5:1 entre texto e fundo para acessibilidade WCAG AA.`,
      severity: 'medium',
      actionable: true,
      suggestedColors: this.designSystemColors,
    }
  }

  /**
   * Create "suggested-layout" suggestion based on content type.
   */
  private createSuggestedLayoutSuggestion(content: string): DesignSuggestion {
    let layout = 'balanced'
    let layoutDesc = 'Layout balanceado: 40% texto + 60% visual'

    // Detect content type hints
    if (/resultado|result|dado|data|número|number|% |estatística|statistic/i.test(content)) {
      layout = 'data-visual'
      layoutDesc = 'Layout para dados: tabela ou gráfico em destaque, interpretação breve'
    } else if (/passo|step|método|method|processo|process|1\. |2\. |3\. /i.test(content)) {
      layout = 'sequential'
      layoutDesc = 'Layout sequencial: passos ou etapas em fluxo visual (timeline ou flow)'
    } else if (/vantagem|advantage|desvantagem|disadvantage|comparação|comparison/i.test(content)) {
      layout = 'comparison'
      layoutDesc = 'Layout comparativo: colunas lado a lado ou tabela paralela'
    }

    return {
      id: generateId(),
      type: 'suggested-layout',
      message: `Sugestão de layout otimizado para o tipo de conteúdo.`,
      recommendation: layoutDesc,
      severity: 'low',
      actionable: true,
      suggestedLayout: layout,
    }
  }

  /**
   * Calculate overall design score (0-100).
   * Based on word count, structure presence, visuals, and suggestion count.
   */
  private calculateDesignScore(
    wordCount: number,
    hasStructure: boolean,
    hasVisuals: boolean,
    suggestionCount: number
  ): number {
    let score = 100

    // Penalize high word count
    if (wordCount > 150) score -= 20
    else if (wordCount > 100) score -= 10

    // Reward structure
    if (!hasStructure && wordCount > 30) score -= 15

    // Reward visuals
    if (!hasVisuals && wordCount > 20) score -= 10

    // Penalize multiple issues
    score -= suggestionCount * 5

    return Math.max(0, Math.min(100, score))
  }
}

/**
 * Convenience function: analyze slide content and generate design suggestions.
 * @param content - Slide content text
 * @param title - Slide title
 * @returns Analysis result with suggestions
 */
export function analyzeDesign(content: string, title: string): AnalysisResult {
  return new DesignAnalyzer().analyze(content, title)
}

/**
 * Generate design suggestions array (legacy interface).
 * @param content - Slide content
 * @param title - Slide title
 * @returns Array of suggestions
 */
export function generateDesignSuggestions(
  content: string,
  title: string
): DesignSuggestion[] {
  return analyzeDesign(content, title).suggestions
}
