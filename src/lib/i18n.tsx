import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { usePersistentState } from './storage'

export type Lang = 'id' | 'en'

/** A bilingual string, used in data (packages, articles, FAQs…). */
export type L = { id: string; en: string }

export const LANGS: { key: Lang; label: string; short: string }[] = [
  { key: 'id', label: 'Bahasa Indonesia', short: 'ID' },
  { key: 'en', label: 'English', short: 'EN' },
]

interface I18n {
  lang: Lang
  setLang: (l: Lang) => void
  /** Pick the string for the current language: t('Masuk', 'Sign in'). Works for any value type. */
  t: <T>(id: T, en: T) => T
  /** Translate a bilingual data value. Plain strings pass through (brand names, numbers). */
  tr: (v: L | string) => string
  /** BCP-47 locale for Intl formatting. */
  locale: string
  /** Format an ISO date/time for the current language. */
  date: (iso: string, opts?: Intl.DateTimeFormatOptions) => string
}

const I18nContext = createContext<I18n | null>(null)

const initialLang = (): Lang => {
  try {
    const saved = JSON.parse(localStorage.getItem('sb:lang') ?? 'null')
    if (saved === 'id' || saved === 'en') return saved
  } catch {
    /* ignore */
  }
  return 'id' // Indonesian is the product's primary language
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = usePersistentState<Lang>('sb:lang', initialLang())
  const locale = lang === 'id' ? 'id-ID' : 'en-GB'

  // Screen readers pick pronunciation from <html lang> (WCAG 3.1.1).
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const value: I18n = {
    lang,
    setLang,
    t: (id, en) => (lang === 'id' ? id : en),
    tr: (v) => (typeof v === 'string' ? v : v[lang]),
    locale,
    date: (iso, opts = { day: 'numeric', month: 'short', year: 'numeric' }) => new Date(iso).toLocaleString(locale, opts),
  }
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}

/** Current language outside React (e.g. analytics). */
export const currentLang = (): Lang => (document.documentElement.lang === 'en' ? 'en' : 'id')

/** Screen-reader-only "Close" label for UI-kit close buttons, in the current language. */
export function CloseLabel() {
  const { t } = useI18n()
  return <span className="sr-only">{t('Tutup', 'Close')}</span>
}
