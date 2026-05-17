import type { Locale } from '../config'
import type { Messages } from './ru'
import { en } from './en'
import { ko } from './ko'
import { ky } from './ky'
import { ru } from './ru'

export type { Messages }

const catalog: Record<Locale, Messages> = {
  ru,
  en,
  ky,
  ko,
}

export function getMessages(locale: Locale): Messages {
  return catalog[locale] ?? ru
}
