import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { usePersistentState } from './storage'

export type TextSize = 'normal' | 'large' | 'xlarge'

const TextSizeContext = createContext<{ size: TextSize; setSize: (s: TextSize) => void } | null>(null)

/** Larger-text preference for older users; scales the whole rem-based UI. */
export function TextSizeProvider({ children }: { children: ReactNode }) {
  const [size, setSize] = usePersistentState<TextSize>('sb:text-size', 'normal')
  useEffect(() => {
    document.documentElement.dataset.textSize = size
  }, [size])
  return <TextSizeContext.Provider value={{ size, setSize }}>{children}</TextSizeContext.Provider>
}

export function useTextSize() {
  const ctx = useContext(TextSizeContext)
  if (!ctx) throw new Error('useTextSize must be used inside TextSizeProvider')
  return ctx
}
