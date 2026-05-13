import { createContext } from 'react'
import type { User } from '../types/user'
import type { BudgetComfort, PsychotypeId } from '../profile/noraProfile'

export type ProfileUpdate = {
  nickname?: string
  avatarUrl?: string | null
  psychotypeId?: PsychotypeId
  moodNote?: string
  budgetComfort?: BudgetComfort
  cityIntent?: string
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
  ) => Promise<void>
  updateProfile: (patch: ProfileUpdate) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
