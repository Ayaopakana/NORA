import type { BudgetComfort, PsychotypeId } from '@/profile/noraProfile'
import { isBudgetComfort, isPsychotypeId } from '@/profile/noraProfile'
import type { MbtiId } from '@/lib/mbti'
import { isMbtiId } from '@/lib/mbti'
import { emptyRoutine, normalizeRoutine, type UserRoutine } from '@/types/routine'

export type UserStatus = '' | 'student' | 'tourist' | 'expat' | 'local'

export type MoodPreset = '' | 'calm' | 'energy' | 'tired' | 'anxious'

export type ZoneKey = 'home' | 'school' | 'work'

export type ZonePoint = { lng: number; lat: number }

export type UserZones = Partial<Record<ZoneKey, ZonePoint>>

export type User = {
  id: string
  email: string
  name: string
  nickname: string
  /** Описание профиля — о себе */
  bio: string
  avatarUrl: string | null
  psychotypeId: PsychotypeId
  moodNote: string
  budgetComfort: BudgetComfort
  cityIntent: string
  mbti: MbtiId | ''
  countryOrigin: string
  countryCurrent: string
  userStatus: UserStatus
  zones: UserZones
  /** 0–3: шаг бюджета «на сегодня» для слайдера */
  dailyBudgetIndex: number
  initialMood: MoodPreset
  /** Год рождения — для фильтра баров/клубов и т.п. */
  birthYear: number | null
  /** Где и когда обычно бывает пользователь (для будущей ИИ) */
  routine: UserRoutine
}

export function isUserStatus(v: unknown): v is UserStatus {
  return (
    v === '' ||
    v === 'student' ||
    v === 'tourist' ||
    v === 'expat' ||
    v === 'local'
  )
}

export function isMoodPreset(v: unknown): v is MoodPreset {
  return (
    v === '' ||
    v === 'calm' ||
    v === 'energy' ||
    v === 'tired' ||
    v === 'anxious'
  )
}

function normalizeZones(raw: unknown): UserZones {
  if (!raw || typeof raw !== 'object') return {}
  const o = raw as Record<string, unknown>
  const out: UserZones = {}
  for (const key of ['home', 'school', 'work'] as ZoneKey[]) {
    const z = o[key]
    if (!z || typeof z !== 'object') continue
    const p = z as Record<string, unknown>
    const lng = Number(p.lng)
    const lat = Number(p.lat)
    if (Number.isFinite(lng) && Number.isFinite(lat)) {
      out[key] = { lng, lat }
    }
  }
  return out
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

  const bio = typeof o.bio === 'string' ? o.bio : ''
  const psychotypeId = isPsychotypeId(o.psychotypeId) ? o.psychotypeId : ''
  const moodNote = typeof o.moodNote === 'string' ? o.moodNote : ''
  const budgetComfort = isBudgetComfort(o.budgetComfort)
    ? o.budgetComfort
    : ''
  const cityIntent = typeof o.cityIntent === 'string' ? o.cityIntent : ''

  const mbti = isMbtiId(o.mbti) ? o.mbti : ''
  const countryOrigin =
    typeof o.countryOrigin === 'string' ? o.countryOrigin : ''
  const countryCurrent =
    typeof o.countryCurrent === 'string' ? o.countryCurrent : ''
  const userStatus = isUserStatus(o.userStatus) ? o.userStatus : ''
  const zones = normalizeZones(o.zones)
  const dailyBudgetIndexRaw = Number(o.dailyBudgetIndex)
  const dailyBudgetIndex =
    Number.isFinite(dailyBudgetIndexRaw) &&
    dailyBudgetIndexRaw >= 0 &&
    dailyBudgetIndexRaw <= 3
      ? Math.round(dailyBudgetIndexRaw)
      : 1
  const initialMood = isMoodPreset(o.initialMood) ? o.initialMood : ''
  const birthYearRaw = Number(o.birthYear)
  const birthYear =
    Number.isFinite(birthYearRaw) &&
    birthYearRaw >= 1920 &&
    birthYearRaw <= new Date().getFullYear()
      ? Math.round(birthYearRaw)
      : null
  const routine = normalizeRoutine(o.routine)

  return {
    id: o.id,
    email: String(o.email).trim(),
    name,
    nickname,
    bio,
    avatarUrl,
    psychotypeId,
    moodNote,
    budgetComfort,
    cityIntent,
    mbti,
    countryOrigin,
    countryCurrent,
    userStatus,
    zones,
    dailyBudgetIndex,
    initialMood,
    birthYear,
    routine,
  }
}

export { emptyRoutine }
export type { UserRoutine }

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
