import type { ProfileUpdate, RegisterExtras } from '@/contexts/auth-context'
import type { User } from '@/types/user'
import { apiFetch } from '@/api/client'
import { readApiError } from '@/api/errors'

export type AuthPayload = {
  token: string
  user: User
}

export async function apiLogin(
  email: string,
  password: string,
): Promise<AuthPayload> {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error(await readApiError(res))
  return res.json() as Promise<AuthPayload>
}

export async function apiRegister(
  name: string,
  nickname: string,
  email: string,
  password: string,
  avatarDataUrl: string | null,
  extras?: RegisterExtras,
): Promise<AuthPayload> {
  const res = await apiFetch('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      nickname,
      email,
      password,
      avatarUrl: avatarDataUrl,
      extras,
    }),
  })
  if (!res.ok) throw new Error(await readApiError(res))
  return res.json() as Promise<AuthPayload>
}

export async function apiMe(): Promise<User> {
  const res = await apiFetch('/auth/me')
  if (!res.ok) throw new Error(await readApiError(res))
  const data = (await res.json()) as { user: User }
  return data.user
}

export async function apiPatchProfile(patch: ProfileUpdate): Promise<User> {
  const res = await apiFetch('/users/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error(await readApiError(res))
  const data = (await res.json()) as { user: User }
  return data.user
}

export async function apiChangePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const res = await apiFetch('/users/me/password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword, newPassword }),
  })
  if (!res.ok) throw new Error(await readApiError(res))
}

export async function apiDeleteAccount(password: string): Promise<void> {
  const res = await apiFetch('/users/me', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  if (!res.ok) throw new Error(await readApiError(res))
}
