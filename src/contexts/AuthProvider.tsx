'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { isBudgetComfort, isPsychotypeId } from '@/profile/noraProfile'
import { isMbtiId } from '@/lib/mbti'
import { clearSavedRoutesForUser } from '@/lib/saved-routes-storage'
import {
  isMoodPreset,
  isUserStatus,
  normalizeUser,
  type User,
  type UserZones,
} from '@/types/user'
import { translateKey } from '@/i18n/locale-storage'
import {
  AuthContext,
  type AuthContextValue,
  type ProfileUpdate,
  type RegisterExtras,
} from './auth-context'

const SESSION_KEY = 'nora_session'
const USERS_KEY = 'nora_mock_users'

type StoredAccount = User & { password: string }

type SessionPayload = {
  token: string
  user: unknown
}

function storageGet(key: string): string | null {
  try {
    if (typeof localStorage === 'undefined') return null
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function storageSet(key: string, value: string): void {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(key, value)
  } catch {
    /* quota / private mode */
  }
}

function storageRemove(key: string): void {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

function loadAccounts(): StoredAccount[] {
  const raw = storageGet(USERS_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown[]
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((row) => normalizeStoredAccount(row))
      .filter((a): a is StoredAccount => a !== null)
  } catch {
    return []
  }
}

function normalizeStoredAccount(raw: unknown): StoredAccount | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  if (typeof o.password !== 'string' || !o.password) return null
  const user = normalizeUser(raw)
  if (!user) return null
  return { ...user, password: o.password }
}

function saveAccounts(accounts: StoredAccount[]) {
  storageSet(USERS_KEY, JSON.stringify(accounts))
}

function saveSession(payload: { token: string; user: User }) {
  storageSet(SESSION_KEY, JSON.stringify(payload))
}

function clearSession() {
  storageRemove(SESSION_KEY)
}

function loadSessionUser(): User | null {
  const raw = storageGet(SESSION_KEY)
  if (!raw) return null
  try {
    const data = JSON.parse(raw) as SessionPayload
    const u = normalizeUser(data.user)
    if (!u) {
      clearSession()
      return null
    }
    return u
  } catch {
    clearSession()
    return null
  }
}

function mergeZones(prev: UserZones, patch?: UserZones): UserZones {
  if (!patch) return prev
  return { ...prev, ...patch }
}

function applyProfilePatch(prev: User, patch: ProfileUpdate): User {
  let next: User = { ...prev }

  if (patch.name !== undefined) {
    const name = patch.name.trim()
    if (name.length >= 2) next = { ...next, name }
  }
  if (patch.nickname !== undefined) {
    next = { ...next, nickname: patch.nickname.trim() || prev.name }
  }
  if (patch.bio !== undefined) {
    next = { ...next, bio: patch.bio.trim() }
  }
  if (patch.avatarUrl !== undefined) {
    next = { ...next, avatarUrl: patch.avatarUrl }
  }
  if (patch.psychotypeId !== undefined) {
    next = {
      ...next,
      psychotypeId: isPsychotypeId(patch.psychotypeId)
        ? patch.psychotypeId
        : prev.psychotypeId,
    }
  }
  if (patch.moodNote !== undefined) {
    next = { ...next, moodNote: patch.moodNote.trim() }
  }
  if (patch.budgetComfort !== undefined) {
    next = {
      ...next,
      budgetComfort: isBudgetComfort(patch.budgetComfort)
        ? patch.budgetComfort
        : prev.budgetComfort,
    }
  }
  if (patch.cityIntent !== undefined) {
    next = { ...next, cityIntent: patch.cityIntent.trim() }
  }
  if (patch.mbti !== undefined) {
    next = {
      ...next,
      mbti: patch.mbti === '' || isMbtiId(patch.mbti) ? patch.mbti : prev.mbti,
    }
  }
  if (patch.countryOrigin !== undefined) {
    next = { ...next, countryOrigin: patch.countryOrigin }
  }
  if (patch.countryCurrent !== undefined) {
    next = { ...next, countryCurrent: patch.countryCurrent }
  }
  if (patch.userStatus !== undefined) {
    next = {
      ...next,
      userStatus: isUserStatus(patch.userStatus)
        ? patch.userStatus
        : prev.userStatus,
    }
  }
  if (patch.zones !== undefined) {
    next = { ...next, zones: mergeZones(prev.zones, patch.zones) }
  }
  if (patch.dailyBudgetIndex !== undefined) {
    const v = Math.max(0, Math.min(3, Math.round(patch.dailyBudgetIndex)))
    next = { ...next, dailyBudgetIndex: v }
  }
  if (patch.initialMood !== undefined) {
    next = {
      ...next,
      initialMood: isMoodPreset(patch.initialMood)
        ? patch.initialMood
        : prev.initialMood,
    }
  }
  if (patch.birthYear !== undefined) {
    next = {
      ...next,
      birthYear:
        patch.birthYear === null
          ? null
          : Number.isFinite(patch.birthYear)
            ? Math.round(patch.birthYear)
            : prev.birthYear,
    }
  }
  if (patch.routine !== undefined) {
    next = { ...next, routine: patch.routine }
  }

  return next
}

export function AuthProvider({ children }: { children: ReactNode }) {
  /** Начальное состояние одинаково на сервере и клиенте — сессию читаем только в useEffect. */
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    setUser(loadSessionUser())
    setAuthReady(true)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const normalized = email.trim().toLowerCase()
    const accounts = loadAccounts()
    const account = accounts.find(
      (a) => a.email.toLowerCase() === normalized,
    )
    if (!account || account.password !== password) {
      throw new Error(translateKey('authErrors.invalidCredentials'))
    }
    const sessionUser = normalizeUser(account)
    if (!sessionUser) {
      throw new Error(translateKey('authErrors.userDataError'))
    }
    saveSession({ token: 'mock-token', user: sessionUser })
    setUser(sessionUser)
  }, [])

  const register = useCallback(
    async (
      name: string,
      nickname: string,
      email: string,
      password: string,
      avatarDataUrl: string | null,
      extras?: RegisterExtras,
    ) => {
      const trimmedNickname = nickname.trim()
      if (trimmedNickname.length < 2) {
        throw new Error(translateKey('authErrors.nickTooShort'))
      }
      const normalized = email.trim().toLowerCase()
      const accounts = loadAccounts()
      if (accounts.some((a) => a.email.toLowerCase() === normalized)) {
        throw new Error(translateKey('authErrors.emailExists'))
      }
      const id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now())
      const next: StoredAccount = {
        id,
        email: email.trim(),
        name: name.trim(),
        nickname: trimmedNickname,
        bio: '',
        avatarUrl: avatarDataUrl,
        psychotypeId: '',
        moodNote: extras?.moodNote?.trim() ?? '',
        budgetComfort: extras?.budgetComfort ?? '',
        cityIntent: extras?.cityIntent?.trim() ?? '',
        mbti: extras?.mbti && isMbtiId(extras.mbti) ? extras.mbti : '',
        countryOrigin: extras?.countryOrigin ?? '',
        countryCurrent: extras?.countryCurrent ?? '',
        userStatus: extras?.userStatus && isUserStatus(extras.userStatus)
          ? extras.userStatus
          : '',
        zones: extras?.zones ?? {},
        dailyBudgetIndex:
          extras?.dailyBudgetIndex !== undefined
            ? Math.max(0, Math.min(3, Math.round(extras.dailyBudgetIndex)))
            : 1,
        initialMood:
          extras?.initialMood && isMoodPreset(extras.initialMood)
            ? extras.initialMood
            : '',
        birthYear:
          extras?.birthYear !== undefined && extras.birthYear !== null
            ? Math.round(extras.birthYear)
            : null,
        routine: extras?.routine ?? { slots: [] },
        password,
      }
      saveAccounts([...accounts, next])
      const sessionUser = normalizeUser(next)
      if (!sessionUser) {
        throw new Error(translateKey('authErrors.createProfileFailed'))
      }
      saveSession({ token: 'mock-token', user: sessionUser })
      setUser(sessionUser)
    },
    [],
  )

  const updateProfile = useCallback((patch: ProfileUpdate) => {
    setUser((prev) => {
      if (!prev) return prev
      const next = applyProfilePatch(prev, patch)
      saveSession({ token: 'mock-token', user: next })
      const accounts = loadAccounts()
      const idx = accounts.findIndex((a) => a.id === next.id)
      if (idx >= 0) {
        const acc = accounts[idx]
        accounts[idx] = { ...next, password: acc.password }
        saveAccounts(accounts)
      }
      return next
    })
  }, [])

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!user) throw new Error(translateKey('authErrors.loginRequired'))
      const next = newPassword.trim()
      if (next.length < 4) {
        throw new Error(translateKey('authErrors.passwordTooShort'))
      }
      const accounts = loadAccounts()
      const idx = accounts.findIndex((a) => a.id === user.id)
      if (idx < 0) throw new Error(translateKey('authErrors.accountNotFound'))
      if (accounts[idx].password !== currentPassword) {
        throw new Error(translateKey('authErrors.wrongPassword'))
      }
      accounts[idx] = { ...accounts[idx], password: next }
      saveAccounts(accounts)
    },
    [user],
  )

  const deleteAccount = useCallback(async (password: string) => {
    const current = user
    if (!current) throw new Error(translateKey('authErrors.loginRequired'))
    const accounts = loadAccounts()
    const acc = accounts.find((a) => a.id === current.id)
    if (!acc || acc.password !== password) {
      throw new Error(translateKey('authErrors.wrongDeletePassword'))
    }
    saveAccounts(accounts.filter((a) => a.id !== current.id))
    storageRemove('nora_friends')
    storageRemove('nora_outgoing_requests')
    storageRemove('nora_incoming_requests')
    storageRemove('nora_chats')
    storageRemove('nora_social_seeded')
    clearSavedRoutesForUser(current.id)
    clearSession()
    setUser(null)
  }, [user])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      authReady,
      login,
      register,
      updateProfile,
      changePassword,
      deleteAccount,
      logout,
    }),
    [
      user,
      authReady,
      login,
      register,
      updateProfile,
      changePassword,
      deleteAccount,
      logout,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
