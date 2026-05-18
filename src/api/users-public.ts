import type { PublicProfile } from '@/types/public-profile'
import { apiFetch } from '@/api/client'
import { parseJson } from '@/api/json'

export async function apiSearchProfiles(
  query: string,
  excludeId?: string,
): Promise<PublicProfile[]> {
  const params = new URLSearchParams()
  if (query.trim()) params.set('q', query.trim())
  if (excludeId) params.set('exclude', excludeId)
  const qs = params.toString()
  const res = await apiFetch(`/users/search${qs ? `?${qs}` : ''}`)
  const data = await parseJson<{ profiles: PublicProfile[] }>(res)
  return data.profiles
}

export async function apiGetPublicProfile(
  userId: string,
): Promise<PublicProfile | null> {
  const res = await apiFetch(`/users/${encodeURIComponent(userId)}/profile`)
  if (res.status === 404) return null
  const data = await parseJson<{ profile: PublicProfile }>(res)
  return data.profile
}
