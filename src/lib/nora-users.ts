import { DEMO_USERS, findDemoUser } from '@/lib/demoUsers'
import { isMbtiId } from '@/lib/mbti'
import { normalizeUser, type User } from '@/types/user'
import type { PublicProfile } from '@/types/public-profile'

const USERS_KEY = 'nora_mock_users'

function loadRegisteredUsers(): User[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown[]
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((row) => {
        if (!row || typeof row !== 'object') return null
        const o = row as Record<string, unknown>
        const user = normalizeUser(o)
        return user
      })
      .filter((u): u is User => u !== null)
  } catch {
    return []
  }
}

function userToPublic(u: User): PublicProfile {
  return {
    id: u.id,
    nickname: u.nickname,
    bio: u.bio,
    city: u.cityIntent || '',
    interests: [],
    mbti: u.mbti,
    avatarUrl: u.avatarUrl,
    avatarEmoji: '✨',
    avatarPrivacy: u.avatarPrivacy ?? 'open',
    userStatus: u.userStatus,
    usualMood: u.initialMood,
    dailyBudgetIndex: u.dailyBudgetIndex ?? 1,
    birthDay: u.birthDay ?? null,
    birthMonth: u.birthMonth ?? null,
    birthYear: u.birthYear ?? null,
  }
}

function demoToPublic(id: string): PublicProfile | null {
  const d = findDemoUser(id)
  if (!d) return null
  return {
    id: d.id,
    nickname: d.nickname,
    bio: d.bio,
    city: d.city,
    interests: d.interests,
    mbti: d.mbti && isMbtiId(d.mbti) ? d.mbti : '',
    avatarUrl: d.avatarUrl ?? null,
    avatarEmoji: d.avatarEmoji,
    avatarPrivacy: 'open',
    userStatus: d.userStatus ?? '',
    usualMood: d.usualMood ?? '',
    dailyBudgetIndex: d.dailyBudgetIndex ?? 1,
    birthDay: null,
    birthMonth: null,
    birthYear: null,
  }
}

/** Профиль любого пользователя NORA (демо или зарегистрированный). */
export function getNoraUserProfile(userId: string): PublicProfile | null {
  const demo = demoToPublic(userId)
  if (demo) return demo
  const reg = loadRegisteredUsers().find((u) => u.id === userId)
  if (reg) return userToPublic(reg)
  return null
}

/** Все аккаунты NORA для добавления в маршрут. */
export function listNoraUserProfiles(excludeId?: string): PublicProfile[] {
  const byId = new Map<string, PublicProfile>()
  for (const d of DEMO_USERS) {
    if (d.id === excludeId) continue
    const p = demoToPublic(d.id)
    if (p) byId.set(p.id, p)
  }
  for (const u of loadRegisteredUsers()) {
    if (u.id === excludeId) continue
    byId.set(u.id, userToPublic(u))
  }
  return [...byId.values()].sort((a, b) =>
    a.nickname.localeCompare(b.nickname, 'ru'),
  )
}
