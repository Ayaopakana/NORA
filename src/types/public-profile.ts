import type { MbtiId } from '@/lib/mbti'
import type { AvatarPrivacy } from '@/types/avatar-privacy'
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
  avatarPrivacy: AvatarPrivacy
  userStatus: UserStatus
  usualMood: MoodPreset
  dailyBudgetIndex: number
  birthDay?: number | null
  birthMonth?: number | null
  birthYear?: number | null
}
