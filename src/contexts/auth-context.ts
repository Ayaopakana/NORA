import { createContext } from 'react'
import type { User, UserStatus, UserZones, MoodPreset } from '@/types/user'
import type { BudgetComfort, PsychotypeId } from '@/profile/noraProfile'
import type { MbtiId } from '@/lib/mbti'

export type ProfileUpdate = {
  name?: string
  nickname?: string
  bio?: string
  avatarUrl?: string | null
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
}

export type RegisterExtras = {
  countryOrigin?: string
  countryCurrent?: string
  userStatus?: UserStatus
  mbti?: MbtiId | ''
  zones?: UserZones
  initialMood?: MoodPreset
  dailyBudgetIndex?: number
  moodNote?: string
  budgetComfort?: BudgetComfort
}

export type AuthContextValue = {
  user: User | null
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
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
