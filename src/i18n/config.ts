export const LOCALES = ['ru', 'en', 'ky', 'ko'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'ru'
export const LOCALE_STORAGE_KEY = 'nora_locale'

export const LOCALE_LABELS: Record<
  Locale,
  { native: string; label: string }
> = {
  ru: { native: 'Русский', label: 'Русский' },
  en: { native: 'English', label: 'English' },
  ky: { native: 'Кыргызча', label: 'Кыргызский' },
  ko: { native: '한국어', label: 'Корейский' },
}

export function isLocale(v: string): v is Locale {
  return (LOCALES as readonly string[]).includes(v)
}
