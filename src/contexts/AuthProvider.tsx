import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { isBudgetComfort, isPsychotypeId } from '../profile/noraProfile'
import { normalizeUser, type User } from '../types/user'
import {
  AuthContext,
  type AuthContextValue,
  type ProfileUpdate,
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

function applyProfilePatch(prev: User, patch: ProfileUpdate): User {
  let next: User = { ...prev }

  if (patch.nickname !== undefined) {
    next = { ...next, nickname: patch.nickname.trim() || prev.name }
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

  return next
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadSessionUser)

  const login = useCallback(async (email: string, password: string) => {
    const normalized = email.trim().toLowerCase()
    const accounts = loadAccounts()
    const account = accounts.find(
      (a) => a.email.toLowerCase() === normalized,
    )
    if (!account || account.password !== password) {
      throw new Error('Неверный email или пароль')
    }
    const sessionUser = normalizeUser(account)
    if (!sessionUser) {
      throw new Error('Ошибка данных пользователя')
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
    ) => {
      const trimmedNickname = nickname.trim()
      if (trimmedNickname.length < 2) {
        throw new Error('Никнейм не короче 2 символов')
      }
      const normalized = email.trim().toLowerCase()
      const accounts = loadAccounts()
      if (accounts.some((a) => a.email.toLowerCase() === normalized)) {
        throw new Error('Пользователь с таким email уже есть')
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
        avatarUrl: avatarDataUrl,
        psychotypeId: '',
        moodNote: '',
        budgetComfort: '',
        cityIntent: '',
        password,
      }
      saveAccounts([...accounts, next])
      const sessionUser = normalizeUser(next)
      if (!sessionUser) {
        throw new Error('Не удалось создать профиль')
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

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login,
      register,
      updateProfile,
      logout,
    }),
    [user, login, register, updateProfile, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
