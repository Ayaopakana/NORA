'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, type Locale } from '@/i18n/config'
import { readStoredLocale } from '@/i18n/locale-storage'
import { getMessages } from '@/i18n/messages'
import { translate } from '@/i18n/translate'

type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, vars?: Record<string, string | number>) => string
  ready: boolean
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() =>
    typeof window === 'undefined' ? DEFAULT_LOCALE : readStoredLocale(),
  )
  const [ready, setReady] = useState(() => typeof window !== 'undefined')

  useEffect(() => {
    if (!ready) return
    document.documentElement.lang = locale
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale)
    } catch {
      /* */
    }
    window.dispatchEvent(new Event('nora-locale-change'))
  }, [locale, ready])

  const messages = useMemo(() => getMessages(locale), [locale])

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      translate(messages, key, vars),
    [messages],
  )

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
  }, [])

  const value = useMemo(
    () => ({ locale, setLocale, t, ready }),
    [locale, setLocale, t, ready],
  )

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    throw new Error('useI18n must be used within LocaleProvider')
  }
  return ctx
}
