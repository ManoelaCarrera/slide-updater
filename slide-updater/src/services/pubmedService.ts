import { LiteratureItem } from '../types'
import { literatureRateLimiter, withRetry } from '../utils/rateLimit'
import { literatureCache } from './cacheService'
import { searchScopus, getScopusApiKey } from './scopusService'

const PUBMED_SEARCH = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi'
const PUBMED_FETCH = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi'

interface PubMedSearchResult {
  esearchresult: {
    idlist: string[]
    count: string
  }
}

interface PubMedArticle {
  uid: string
  title: string
  source: string
  pubdate: string
  authors?: Array<{ name: string }>
  abstracttext?: string
}

export async function searchPubMed(keywords: string[], year?: number): Promise<LiteratureItem[]> {
  try {
    // Check cache first
    const cached = literatureCache.get(keywords, 'pubmed')
    if (cached) {
      console.log(`PubMed cache hit: ${keywords.join(', ')}`)
      return cached
    }

    // Wait if rate limit exceeded
    const waitMs = literatureRateLimiter.getWaitTime()
    if (waitMs > 0) {
      await new Promise(resolve => setTimeout(resolve, waitMs))
    }

    const query = keywords.join(' OR ')
    const yearFilter = year ? ` AND ${year}[pdat]` : ''
    const url = new URL(PUBMED_SEARCH)
    url.searchParams.append('db', 'pubmed')
    url.searchParams.append('term', `(${query})${yearFilter}`)
    url.searchParams.append('retmax', '10')
    url.searchParams.append('rettype', 'json')

    // Retry with exponential backoff
    const response = await withRetry(
      () => fetch(url.toString()),
      { maxRetries: 3, initialDelayMs: 100, maxDelayMs: 5000 }
    )
    if (!response.ok) throw new Error(`PubMed search failed: ${response.status}`)

    literatureRateLimiter.recordRequest()

    const data: PubMedSearchResult = await response.json()
    const pmids = data.esearchresult.idlist || []

    if (pmids.length === 0) {
      return []
    }

    const articles = await fetchPubMedArticles(pmids.slice(0, 10))

    // Store in cache
    if (articles.length > 0) {
      literatureCache.set(keywords, articles, 'pubmed')
    }

    return articles
  } catch (error) {
    console.error('PubMed search error:', error)
    return []
  }
}

async function fetchPubMedArticles(pmids: string[]): Promise<LiteratureItem[]> {
  try {
    const url = new URL(PUBMED_FETCH)
    url.searchParams.append('db', 'pubmed')
    url.searchParams.append('id', pmids.join(','))
    url.searchParams.append('rettype', 'abstract')
    url.searchParams.append('retmode', 'json')

    // Retry with exponential backoff
    const response = await withRetry(
      () => fetch(url.toString()),
      { maxRetries: 3, initialDelayMs: 100, maxDelayMs: 5000 }
    )
    if (!response.ok) throw new Error(`PubMed fetch failed: ${response.status}`)

    const data = await response.json()
    const articles: LiteratureItem[] = []

    if (data.result?.uids) {
      for (const uid of data.result.uids) {
        const article = data.result[uid]
        if (article && article.uid) {
          articles.push({
            id: `pubmed-${article.uid}`,
            source: 'pubmed',
            title: article.title || 'Untitled',
            year: parseInt(article.pubdate?.substring(0, 4) || '2024'),
            authors: article.authors?.map((a: any) => a.name).join(', ') || 'Unknown',
            pmid: article.uid,
            abstract: article.abstracttext || 'No abstract available',
            url: `https://pubmed.ncbi.nlm.nih.gov/${article.uid}/`,
            approved: false,
            insertedAt: new Date().toISOString(),
            citationCount: 0,
          })
        }
      }
    }

    return articles
  } catch (error) {
    console.error('PubMed fetch error:', error)
    return []
  }
}

/**
 * Search multiple sources with Scopus fallback
 * 1. Attempts Scopus if API key is configured
 * 2. Always searches PubMed (cached)
 * 3. Merges and deduplicates results
 * 4. Falls back gracefully if any source fails
 */
export async function searchMultipleSources(keywords: string[], year?: number): Promise<LiteratureItem[]> {
  try {
    const results: LiteratureItem[] = []

    // Attempt Scopus if API key configured
    const scopusApiKey = getScopusApiKey()
    if (scopusApiKey) {
      try {
        console.log('Attempting Scopus search...')
        const scopusResults = await searchScopus(keywords, scopusApiKey)
        if (scopusResults.length > 0) {
          results.push(...scopusResults)
          console.log(`Found ${scopusResults.length} Scopus results`)
        }
      } catch (error) {
        console.warn('Scopus search failed, falling back to PubMed:', error)
      }
    }

    // Always search PubMed (fallback and/or complementary)
    const pubmedResults = await searchPubMed(keywords, year)
    if (pubmedResults.length > 0) {
      results.push(...pubmedResults)
      console.log(`Found ${pubmedResults.length} PubMed results`)
    }

    // Deduplicate by ID and DOI
    const deduplicated = deduplicateResults(results)

    // Sort by year (most recent first)
    const sorted = deduplicated.sort((a, b) => b.year - a.year)

    return sorted
  } catch (error) {
    console.error('Literature search error:', error)
    // Final fallback: try PubMed alone
    try {
      return await searchPubMed(keywords, year)
    } catch (fallbackError) {
      console.error('All literature searches failed:', fallbackError)
      return []
    }
  }
}

/**
 * Deduplicate results by ID, DOI, and title similarity
 */
function deduplicateResults(results: LiteratureItem[]): LiteratureItem[] {
  const seen = new Map<string, LiteratureItem>()

  for (const item of results) {
    // Use DOI as primary key if available
    if (item.doi) {
      if (!seen.has(item.doi)) {
        seen.set(item.doi, item)
      }
      continue
    }

    // Use ID as secondary key
    if (!seen.has(item.id)) {
      seen.set(item.id, item)
    }
  }

  return Array.from(seen.values())
}
