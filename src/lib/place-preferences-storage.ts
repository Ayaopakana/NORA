import { isApiEnabled } from '@/api/config'
import {
  apiGetDislikedPlaceIds,
  apiGetPlacePreference,
  apiSetPlacePreference,
} from '@/api/places'
import {
  getCachedDislikedPlaceIds,
  setDislikedCache,
} from '@/lib/api-hydrate'

const PREFS_KEY = 'nora_place_prefs'

export type PlacePreference = 'like' | 'dislike'

type PrefsByUser = Record<string, Record<string, PlacePreference>>

function readAll(): PrefsByUser {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as PrefsByUser
  } catch {
    return {}
  }
}

function writeAll(data: PrefsByUser) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(data))
  } catch {
    /* quota */
  }
}

export function notifyPlaceFeedbackChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('nora-place-feedback-change'))
  }
}

export function getPlacePreference(
  userId: string,
  placeId: string,
): PlacePreference | null {
  return readAll()[userId]?.[placeId] ?? null
}

export async function getPlacePreferenceAsync(
  userId: string,
  placeId: string,
): Promise<PlacePreference | null> {
  if (isApiEnabled()) {
    return apiGetPlacePreference(placeId)
  }
  return getPlacePreference(userId, placeId)
}

export async function setPlacePreference(
  userId: string,
  placeId: string,
  pref: PlacePreference | null,
): Promise<void> {
  if (isApiEnabled()) {
    await apiSetPlacePreference(placeId, pref)
    const ids = await apiGetDislikedPlaceIds()
    setDislikedCache(userId, ids)
    notifyPlaceFeedbackChange()
    return
  }

  const all = readAll()
  const userPrefs = { ...(all[userId] ?? {}) }
  if (pref === null) {
    delete userPrefs[placeId]
  } else {
    userPrefs[placeId] = pref
  }
  all[userId] = userPrefs
  writeAll(all)
  notifyPlaceFeedbackChange()
}

export function getLikedPlaceIds(userId: string): string[] {
  const prefs = readAll()[userId] ?? {}
  return Object.entries(prefs)
    .filter(([, v]) => v === 'like')
    .map(([id]) => id)
}

export function getDislikedPlaceIds(userId: string): string[] {
  if (isApiEnabled()) {
    const cached = getCachedDislikedPlaceIds(userId)
    if (cached !== null) return cached
  }
  const prefs = readAll()[userId] ?? {}
  return Object.entries(prefs)
    .filter(([, v]) => v === 'dislike')
    .map(([id]) => id)
}

export function placePreferenceWeight(
  userId: string | undefined,
  placeId: string,
): number {
  if (!userId) return 0
  const pref = getPlacePreference(userId, placeId)
  if (pref === 'like') return 2
  if (pref === 'dislike') return -100
  return 0
}
