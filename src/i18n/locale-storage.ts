import { DEFAULT_LOCALE, isLocale, LOCALE_STORAGE_KEY, type Locale } from './config'
import { getMessages } from './messages'
import { translate } from './translate'

export function readStoredLocale(): Locale {
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (raw && isLocale(raw)) return raw
  } catch {
    /* private mode */
  }
  return DEFAULT_LOCALE
}

export function translateKey(
  key: string,
  vars?: Record<string, string | number>,
  locale?: Locale,
): string {
  return translate(getMessages(locale ?? readStoredLocale()), key, vars)
}
