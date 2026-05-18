import type { User as DbUser } from '@prisma/client'

export type PublicProfile = {
  id: string
  nickname: string
  bio: string
  city: string
  interests: string[]
  mbti: string
  avatarUrl: string | null
  avatarEmoji: string
  userStatus: string
  usualMood: string
  dailyBudgetIndex: number
  birthYear: number | null
}

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function toPublicProfile(row: DbUser): PublicProfile {
  return {
    id: row.id,
    nickname: row.nickname,
    bio: row.bio,
    city: row.cityIntent,
    interests: parseJson<string[]>(row.interests, []),
    mbti: row.mbti,
    avatarUrl: row.avatarUrl,
    avatarEmoji: row.avatarEmoji,
    userStatus: row.userStatus,
    usualMood: row.initialMood,
    dailyBudgetIndex: row.dailyBudgetIndex,
    birthYear: row.isDemo ? null : row.birthYear,
  }
}
