import { createContext } from 'react'
import type {
  User,
  UserStatus,
  UserZones,
  MoodPreset,
  UserRoutine,
} from '@/types/user'
import type { BudgetComfort, PsychotypeId } from '@/profile/noraProfile'
import type { MbtiId } from '@/lib/mbti'
import type { AvatarPrivacy } from '@/types/avatar-privacy'

export type ProfileUpdate = {
  name?: string
  nickname?: string
  bio?: string
  avatarUrl?: string | null
  avatarPrivacy?: AvatarPrivacy
  psychotypeId?: PsychotypeId
  moodNote?: string
  budgetComfort?: BudgetComfort
  cityIntent?: string
  mbti?: MbtiId | ''
  countryOrigin?: string
  countryCurrent?: string
  userStatus?: UserStatus
  zones?: UserZones
  dailyBudgetIndex?: number
  initialMood?: MoodPreset
  birthDay?: number | null
  birthMonth?: number | null
  birthYear?: number | null
  routine?: UserRoutine
}

export type RegisterExtras = {
  countryOrigin?: string
  countryCurrent?: string
  cityIntent?: string
  userStatus?: UserStatus
  mbti?: MbtiId | ''
  zones?: UserZones
  initialMood?: MoodPreset
  dailyBudgetIndex?: number
  moodNote?: string
  budgetComfort?: BudgetComfort
  birthDay?: number | null
  birthMonth?: number | null
  birthYear?: number | null
  routine?: UserRoutine
}

export type AuthContextValue = {
  user: User | null
  /** false до чтения localStorage на клиенте (избегаем ложного редиректа на /login) */
  authReady: boolean
  login: (email: string, password: string) => Promise<void>
  register: (
    name: string,
    nickname: string,
    email: string,
    password: string,
    avatarDataUrl: string | null,
    extras?: RegisterExtras,
  ) => Promise<void>
  updateProfile: (patch: ProfileUpdate) => void
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  deleteAccount: (password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
