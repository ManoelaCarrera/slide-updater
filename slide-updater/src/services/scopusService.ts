import { LiteratureItem } from '../types'
import { literatureCache } from './cacheService'

/**
 * Scopus Service
 * Attempts to search Scopus API if API key is configured
 * Falls back gracefully if not available or on error
 */

const SCOPUS_API_URL = 'https://api.elsevier.com/content/search/scopus'

export async function searchScopus(keywords: string[], apiKey?: string): Promise<LiteratureItem[]> {
  // If no API key provided, return empty array and let caller handle fallback
  if (!apiKey) {
    console.warn('Scopus API key not configured. Set it in Settings to enable Scopus search.')
    return []
  }

  try {
    // Check cache first
    const cacheKey = `scopus-${keywords.join(',')}`
    const cached = literatureCache.get(keywords, 'scopus')
    if (cached) {
      console.log(`Scopus cache hit: ${keywords.join(', ')}`)
      return cached
    }

    const query = keywords.map(k => `TITLE("${k}") OR ABSTRACT("${k}")`).join(' OR ')

    const url = new URL(SCOPUS_API_URL)
    url.searchParams.append('query', query)
    url.searchParams.append('count', '10')
    url.searchParams.append('sort', '-pubdate')

    const response = await fetch(url.toString(), {
      headers: {
        'X-ELS-APIKey': apiKey,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        console.error('Scopus: Invalid API key')
      } else if (response.status === 429) {
        console.warn('Scopus: Rate limit exceeded')
      } else {
        console.error(`Scopus API error: ${response.status}`)
      }
      return []
    }

    const data = await response.json()
    const results: LiteratureItem[] = []

    if (data['search-results']?.entry) {
      for (const entry of data['search-results'].entry) {
        results.push({
          id: `scopus-${entry['eid'] || entry['scopus-id']}`,
          source: 'scopus',
          title: entry['dc:title'] || 'Untitled',
          year: parseInt(entry['prism:publicationYear'] || '2024'),
          authors: entry['dc:creator'] || 'Unknown',
          doi: entry['prism:doi'],
          abstract: entry['dc:description'] || 'No abstract available',
          url: entry['link']?.[0]?.['@href'] || 'https://scopus.com',
          approved: false,
          insertedAt: new Date().toISOString(),
          citationCount: parseInt(entry['citedby-count'] || '0'),
        })
      }
    }

    if (results.length > 0) {
      literatureCache.set(keywords, results, 'scopus')
    }

    return results
  } catch (error) {
    console.error('Scopus search error:', error)
    return []
  }
}

/**
 * Get the configured Scopus API key from localStorage
 */
export function getScopusApiKey(): string | null {
  try {
    const settings = localStorage.getItem('app-settings')
    if (settings) {
      const parsed = JSON.parse(settings)
      return parsed.scopusApiKey || null
    }
  } catch (error) {
    console.error('Error reading Scopus API key:', error)
  }
  return null
}

/**
 * Save Scopus API key to localStorage
 */
export function setScopusApiKey(apiKey: string): void {
  try {
    const settings = localStorage.getItem('app-settings') || '{}'
    const parsed = JSON.parse(settings)
    parsed.scopusApiKey = apiKey
    localStorage.setItem('app-settings', JSON.stringify(parsed))
  } catch (error) {
    console.error('Error saving Scopus API key:', error)
  }
}

/**
 * Clear the stored Scopus API key
 */
export function clearScopusApiKey(): void {
  try {
    const settings = localStorage.getItem('app-settings') || '{}'
    const parsed = JSON.parse(settings)
    delete parsed.scopusApiKey
    localStorage.setItem('app-settings', JSON.stringify(parsed))
  } catch (error) {
    console.error('Error clearing Scopus API key:', error)
  }
}
