import type { User as DbUser } from '@prisma/client'
import type { ApiUser } from '../types/user.js'

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function toApiUser(row: DbUser): ApiUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    nickname: row.nickname,
    bio: row.bio,
    avatarUrl: row.avatarUrl,
    psychotypeId: row.psychotypeId,
    moodNote: row.moodNote,
    budgetComfort: row.budgetComfort,
    cityIntent: row.cityIntent,
    mbti: row.mbti,
    countryOrigin: row.countryOrigin,
    countryCurrent: row.countryCurrent,
    userStatus: row.userStatus,
    zones: parseJson(row.zones, {}),
    dailyBudgetIndex: row.dailyBudgetIndex,
    initialMood: row.initialMood,
    birthYear: row.birthYear,
    routine: parseJson(row.routine, { slots: [] }),
  }
}
