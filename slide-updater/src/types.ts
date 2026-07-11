export interface Slide {
  id: string
  title: string
  originalContent: string
  currentContent: string
  keywords: string[]
  literatureUpdates: LiteratureItem[]
  designNotes: DesignNotes
  contentLength: number
}

export interface LiteratureItem {
  id: string
  source: 'pubmed' | 'scopus' | 'wos'
  title: string
  year: number
  authors: string
  pmid?: string
  doi?: string
  abstract: string
  url: string
  approved: boolean
  insertedAt: string
  citationCount?: number
}

export interface DesignNotes {
  lastUpdated: string
  suggestions: DesignSuggestion[]
  appliedChanges: string[]
}

export interface DesignSuggestion {
  id: string
  type: 'text-heavy' | 'missing-hierarchy' | 'missing-visual' | 'low-contrast' | 'suggested-layout'
  message: string
  recommendation: string
  severity: 'low' | 'medium' | 'high'
  actionable: boolean
  suggestedColors?: string[]
  suggestedLayout?: string
}

export interface Project {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  slides: Slide[]
  settings: ProjectSettings
  changelog: ChangelogEntry[]
}

export interface ProjectSettings {
  autoUpdateFrequency: 'manual' | 'weekly' | 'monthly'
  preferredExportFormat: 'pdf' | 'pptx' | 'html'
}

export interface ChangelogEntry {
  timestamp: string
  action: 'created' | 'added_literature' | 'applied_design' | 'edited_content'
  slideId?: string
  details: string
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

export interface HistoryState {
  past: HistorySnapshot[]
  present: AppState
  future: HistorySnapshot[]
}
