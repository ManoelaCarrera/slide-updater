/**
 * Rate limiting and retry utilities for API requests.
 * Prevents overwhelming external services (e.g., PubMed, literature databases).
 */

/**
 * Rate limiter: enforces maximum requests per time window.
 * Uses token bucket algorithm: tokens refill at fixed rate, requests consume tokens.
 *
 * @example
 * const limiter = new RateLimiter(3, 1000) // 3 requests per second
 * if (limiter.canMakeRequest()) {
 *   await fetch(...)
 *   limiter.recordRequest()
 * } else {
 *   console.log(`Wait ${limiter.getWaitTime()}ms`)
 * }
 */
export class RateLimiter {
  private requestTimestamps: number[] = []
  private maxRequests: number
  private windowMs: number

  /**
   * Create a rate limiter.
   * @param maxRequests - Maximum requests allowed per time window
   * @param windowMs - Time window in milliseconds (default: 1000ms = 1 second)
   */
  constructor(maxRequests: number = 3, windowMs: number = 1000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  /**
   * Check if a request can be made without exceeding rate limit.
   * @returns true if request is allowed, false if rate limit exceeded
   */
  canMakeRequest(): boolean {
    const now = Date.now()
    // Remove timestamps older than the window
    this.requestTimestamps = this.requestTimestamps.filter(ts => now - ts < this.windowMs)
    return this.requestTimestamps.length < this.maxRequests
  }

  /**
   * Record that a request was made.
   * Must be called after each successful API request.
   */
  recordRequest(): void {
    this.requestTimestamps.push(Date.now())
  }

  /**
   * Get milliseconds to wait before next request is allowed.
   * @returns Milliseconds to wait (0 if request is allowed now)
   */
  getWaitTime(): number {
    if (this.requestTimestamps.length < this.maxRequests) {
      return 0
    }
    const oldestTimestamp = this.requestTimestamps[0]
    const now = Date.now()
    const waitMs = Math.max(0, this.windowMs - (now - oldestTimestamp))
    return waitMs
  }

  /**
   * Reset rate limiter (clear all recorded requests).
   */
  reset(): void {
    this.requestTimestamps = []
  }

  /**
   * Get current request count in the window.
   */
  getRequestCount(): number {
    const now = Date.now()
    this.requestTimestamps = this.requestTimestamps.filter(ts => now - ts < this.windowMs)
    return this.requestTimestamps.length
  }
}

/**
 * Exponential backoff retry configuration.
 */
export interface RetryOptions {
  maxRetries?: number
  initialDelayMs?: number
  maxDelayMs?: number
  backoffMultiplier?: number
}

/**
 * Retry a promise-returning function with exponential backoff.
 *
 * Strategy:
 * - Retry up to N times on failure
 * - Wait between retries: delay = min(maxDelay, initialDelay * multiplier^attempt)
 * - Only retry on network/timeout errors, not validation errors
 *
 * @example
 * const result = await withRetry(
 *   () => fetch(url),
 *   { maxRetries: 3, initialDelayMs: 100 }
 * )
 *
 * @param fn - Async function to retry
 * @param options - Retry configuration
 * @returns Result from function
 * @throws Error if all retries fail
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 100,
    maxDelayMs = 10000,
    backoffMultiplier = 2,
  } = options

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Don't retry on client errors (4xx)
      if (isClientError(lastError)) {
        throw lastError
      }

      // On last attempt, throw
      if (attempt === maxRetries) {
        throw lastError
      }

      // Calculate backoff delay
      const delay = Math.min(
        maxDelayMs,
        initialDelayMs * Math.pow(backoffMultiplier, attempt)
      )

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError || new Error('Retry failed')
}

/**
 * Check if error is a client-side error (4xx) that shouldn't be retried.
 */
function isClientError(error: Error): boolean {
  const message = error.message.toLowerCase()
  return (
    message.includes('400') ||
    message.includes('401') ||
    message.includes('403') ||
    message.includes('404') ||
    message.includes('validation') ||
    message.includes('invalid')
  )
}

/**
 * Global rate limiter for PubMed/literature API calls.
 * Configured for typical public API limits: 3 requests/second.
 */
export const literatureRateLimiter = new RateLimiter(3, 1000)

/**
 * Global rate limiter for general API calls.
 * Configured for 5 requests/second.
 */
export const generalRateLimiter = new RateLimiter(5, 1000)

/**
 * Wrapped fetch with rate limiting and retry.
 *
 * @example
 * const result = await rateLimitedFetch(
 *   'https://api.pubmed.gov/...',
 *   { maxRetries: 3 }
 * )
 *
 * @param url - URL to fetch
 * @param options - Fetch and retry options
 * @returns Fetch response
 */
export async function rateLimitedFetch(
  url: string,
  options: { maxRetries?: number; limiter?: RateLimiter } = {}
): Promise<Response> {
  const { maxRetries = 3, limiter = literatureRateLimiter } = options

  // Wait if rate limit exceeded
  const waitMs = limiter.getWaitTime()
  if (waitMs > 0) {
    await new Promise(resolve => setTimeout(resolve, waitMs))
  }

  try {
    const result = await withRetry(
      () => fetch(url),
      {
        maxRetries,
        initialDelayMs: 100,
        maxDelayMs: 5000,
        backoffMultiplier: 2,
      }
    )
    limiter.recordRequest()
    return result
  } catch (error) {
    throw error
  }
}
