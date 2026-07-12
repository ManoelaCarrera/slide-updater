/**
 * Custom React hook for debouncing values.
 * Delays state updates until the value hasn't changed for a specified duration.
 *
 * Useful for:
 * - Delaying expensive operations (API searches, re-renders)
 * - Waiting for user to finish typing before searching
 * - Batching rapid changes into single updates
 *
 * @example
 * const searchTerm = "mucosite"
 * const debouncedTerm = useDebounce(searchTerm, 500)
 * // debouncedTerm updates 500ms after searchTerm stops changing
 */

import { useState, useEffect, useRef } from 'react'

/**
 * Hook: debounce a value with a configurable delay.
 *
 * @template T - Type of the value being debounced
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Debounced value that updates after no changes for `delay` ms
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    // Set new timer
    timerRef.current = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup on unmount or value/delay change
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook: debounce a callback function (fire callback after delay).
 *
 * @example
 * const debouncedAnalyze = useDebouncedCallback(
 *   (slideId) => analyzeSlideAgainstSources(slideId),
 *   1000
 * )
 *
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced version of callback
 */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number = 300
): T {
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return ((...args: any[]) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    timerRef.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }) as T
}
