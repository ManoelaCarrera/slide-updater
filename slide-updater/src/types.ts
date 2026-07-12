// Modelo de dados v2.0 — Slide Updater
// Sem integração com PubMed/Scopus/Web of Science: toda fonte é carregada
// manualmente pela Profa e todo processamento roda localmente no navegador.

export type SourceType = 'pdf' | 'image' | 'txt' | 'md'

export interface SourceMetadata {
  /** Número de páginas (apenas PDFs) */
  pages?: number
  /** Texto extraído localmente (PDF via pdf.js, ou conteúdo bruto de .txt/.md) */
  extractedText?: string
  /** Data URL (base64) — usado para preview de imagens */
  dataUrl?: string
  /** MIME type original do arquivo */
  mimeType?: string
}

export interface Source {
  id: string
  name: string
  type: SourceType
  uploadedAt: string
  fileSize: number
  metadata: SourceMetadata
}

export type SuggestionType = 'add_citation' | 'update_data' | 'gap'
export type SuggestionStatus = 'pending' | 'approved' | 'rejected'

export interface Suggestion {
  id: string
  type: SuggestionType
  sourceId: string
  /** Texto proposto para complementar o slide (sempre derivado de um trecho real da fonte) */
  suggestedText: string
  /** Explicação de por que a sugestão foi gerada */
  reason: string
  /** Trecho literal encontrado na fonte que originou a sugestão */
  snippet: string
  status: SuggestionStatus
  appliedAt: string | null
}

export interface AppliedChange {
  id: string
  timestamp: string
  type: SuggestionType
  sourceId: string
  insertedText: string
  position: string
}

export interface Slide {
  id: string
  order: number
  title: string
  originalContent: string
  currentContent: string
  keywords: string[]
  suggestions: Suggestion[]
  appliedChanges: AppliedChange[]
}

export type Discipline =
  | 'estomatologia1'
  | 'estomatologia2'
  | 'patologia-basica'
  | 'pos-graduacao'
  | 'outra'

export const DISCIPLINE_LABELS: Record<Discipline, string> = {
  estomatologia1: 'Estomatologia 1',
  estomatologia2: 'Estomatologia 2',
  'patologia-basica': 'Patologia Básica',
  'pos-graduacao': 'Pós-graduação em Odontologia e Saúde',
  outra: 'Outra disciplina',
}

export type ValidationMode = 'step-by-step' | 'final-review'

export interface ProjectSettings {
  validationMode: ValidationMode
  preferredExportFormat: 'pptx' | 'pdf'
}

export type ChangelogAction =
  | 'created'
  | 'source_added'
  | 'source_removed'
  | 'slide_added'
  | 'slide_removed'
  | 'slide_edited'
  | 'analysis_run'
  | 'suggestion_approved'
  | 'suggestion_rejected'
  | 'suggestion_edited'
  | 'change_applied'

export interface ChangelogEntry {
  timestamp: string
  action: ChangelogAction
  slideId?: string
  details: string
}

export interface Project {
  id: string
  name: string
  discipline: Discipline
  createdAt: string
  updatedAt: string
  sources: Source[]
  slides: Slide[]
  settings: ProjectSettings
  changelog: ChangelogEntry[]
}

export interface AppState {
  projects: Project[]
  currentProjectId: string | null
  currentSlideId: string | null
}

export interface HistorySnapshot {
  timestamp: string
  projectId: string
  appState: AppState
  description: string
}
