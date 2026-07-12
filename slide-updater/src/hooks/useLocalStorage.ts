import { useCallback, useState } from 'react'

type SetValue<T> = (value: T | ((prev: T) => T)) => void

/**
 * Espelha a API funcional do useState (aceita `setValue(prev => next)`).
 * Sem isso, chamadas em sequência rápida no mesmo tick (ex.: importar vários
 * slides em loop) leem o mesmo valor "antigo" e a última chamada sobrescreve
 * o efeito das anteriores — perda silenciosa de dados.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading from localStorage: ${key}`, error)
      return initialValue
    }
  })

  const setValue = useCallback<SetValue<T>>(
    value => {
      setStoredValue(prev => {
        const next = value instanceof Function ? value(prev) : value
        try {
          window.localStorage.setItem(key, JSON.stringify(next))
        } catch (error) {
          console.error(`Error writing to localStorage: ${key}`, error)
        }
        return next
      })
    },
    [key]
  )

  return [storedValue, setValue]
}
