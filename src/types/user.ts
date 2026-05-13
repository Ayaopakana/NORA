import type { BudgetComfort, PsychotypeId } from '../profile/noraProfile'
import { isBudgetComfort, isPsychotypeId } from '../profile/noraProfile'

export type User = {
  id: string
  email: string
  name: string
  nickname: string
  avatarUrl: string | null
  /** Стиль восприятия / «психотип» для подбора (демо, позже API) */
  psychotypeId: PsychotypeId
  /** Текущее настроение, ритм дня — своими словами */
  moodNote: string
  /** Комфортный уровень трат на активности */
  budgetComfort: BudgetComfort
  /** Что ищете в городе: люди, события, знакомство со средой */
  cityIntent: string
}

/** Совместимость со старыми записями в localStorage */
export function normalizeUser(raw: unknown): User | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  if (
    typeof o.id !== 'string' ||
    typeof o.email !== 'string' ||
    typeof o.name !== 'string'
  ) {
    return null
  }
  const name = String(o.name).trim()
  const nicknameRaw =
    typeof o.nickname === 'string' ? o.nickname.trim() : ''
  const nickname = nicknameRaw || name
  let avatarUrl: string | null = null
  if (typeof o.avatarUrl === 'string' && o.avatarUrl.length > 0) {
    avatarUrl = o.avatarUrl
  }

  const psychotypeId = isPsychotypeId(o.psychotypeId) ? o.psychotypeId : ''
  const moodNote =
    typeof o.moodNote === 'string' ? o.moodNote : ''
  const budgetComfort = isBudgetComfort(o.budgetComfort)
    ? o.budgetComfort
    : ''
  const cityIntent =
    typeof o.cityIntent === 'string' ? o.cityIntent : ''

  return {
    id: o.id,
    email: String(o.email).trim(),
    name,
    nickname,
    avatarUrl,
    psychotypeId,
    moodNote,
    budgetComfort,
    cityIntent,
  }
}

/** Безопасно для «битых» данных из storage */
export function displayName(user: Pick<User, 'nickname' | 'name'>): string {
  const nick =
    typeof user.nickname === 'string' ? user.nickname.trim() : ''
  const name = typeof user.name === 'string' ? user.name.trim() : ''
  return nick || name || 'Пользователь'
}

export function initialsFromDisplay(display: string): string {
  const t = display.trim()
  if (!t) return '?'
  const parts = t.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    const a = parts[0][0]
    const b = parts[1][0]
    if (a && b) return (a + b).toUpperCase()
  }
  return t.slice(0, 2).toUpperCase()
}
