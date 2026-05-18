import type { MbtiId } from '@/lib/mbti'
import type { MoodPreset, UserStatus } from '@/types/user'

export type PublicProfile = {
  id: string
  nickname: string
  bio: string
  city: string
  interests: string[]
  mbti: MbtiId | ''
  avatarUrl: string | null
  avatarEmoji: string
  userStatus: UserStatus
  usualMood: MoodPreset
  dailyBudgetIndex: number
  birthYear?: number | null
}
