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
import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_STORAGE_KEY,
  type Locale,
} from '@/i18n/config'
import { getMessages } from '@/i18n/messages'
import { translate } from '@/i18n/translate'

type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, vars?: Record<string, string | number>) => string
  ready: boolean
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

function readStoredLocale(): Locale {
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (raw && isLocale(raw)) return raw
  } catch {
    /* private mode */
  }
  return DEFAULT_LOCALE
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setLocaleState(readStoredLocale())
    setReady(true)
  }, [])

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
