import type { Locale } from '@/i18n/config'
import {
  normalizeDayRouteFields,
  type DayRoute,
} from '@/lib/build-day-route'
import { findPlannerRecommendation } from '@/lib/planner-recommendations'

export type SavedDayRoute = DayRoute & { savedAt: number }

const KEY = 'nora_saved_routes'
const MAX_PER_USER = 24

function readStore(): Record<string, SavedDayRoute[]> {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as Record<string, SavedDayRoute[]>
  } catch {
    return {}
  }
}

function writeStore(store: Record<string, SavedDayRoute[]>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
  } catch {
    /* quota */
  }
}

function normalizeSavedRoute(
  raw: unknown,
  locale: Locale,
): SavedDayRoute | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  if (typeof o.id !== 'string') return null

  const fields = normalizeDayRouteFields(o, locale)
  if (!fields) return null

  const stopsRaw = o.stops
  if (!Array.isArray(stopsRaw) || !stopsRaw.length) return null
  const stops = stopsRaw
    .map((s) => {
      if (!s || typeof s !== 'object') return null
      const p = s as Record<string, unknown>
      const lng = Number(p.lng)
      const lat = Number(p.lat)
      if (
        typeof p.id !== 'string' ||
        typeof p.title !== 'string' ||
        typeof p.place !== 'string' ||
        !Number.isFinite(lng) ||
        !Number.isFinite(lat)
      ) {
        return null
      }
      return {
        id: p.id,
        title: p.title,
        place: p.place,
        address: typeof p.address === 'string' ? p.address : '',
        lng,
        lat,
        duration: typeof p.duration === 'string' ? p.duration : '',
        budgetTier: Number(p.budgetTier) || 0,
        badge: typeof p.badge === 'string' ? p.badge : '',
        mbtiFit: Array.isArray(p.mbtiFit) ? p.mbtiFit : undefined,
        venueTags: Array.isArray(p.venueTags) ? p.venueTags : undefined,
        minAge: typeof p.minAge === 'number' ? p.minAge : undefined,
      }
    })
    .filter((s): s is NonNullable<typeof s> => s !== null)
  if (!stops.length) return null
  const savedAt = Number(o.savedAt)

  return {
    id: o.id,
    ...fields,
    stops,
    totalDurationMin: Number(o.totalDurationMin) || 0,
    savedAt: Number.isFinite(savedAt) ? savedAt : Date.now(),
  }
}

export function notifySavedRoutesChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('nora-routes-change'))
  }
}

export function getSavedRoutes(userId: string): SavedDayRoute[] {
  const list = readStore()[userId] ?? []
  return list
    .map((r) => normalizeSavedRoute(r, 'ru'))
    .filter((r): r is SavedDayRoute => r !== null)
    .sort((a, b) => b.savedAt - a.savedAt)
}

export function getSavedRoutesLocalized(
  userId: string,
  locale: Locale,
): SavedDayRoute[] {
  const list = readStore()[userId] ?? []
  return list
    .map((r) => normalizeSavedRoute(r, locale))
    .filter((r): r is SavedDayRoute => r !== null)
    .sort((a, b) => b.savedAt - a.savedAt)
}

export function rehydrateDayRoute(route: DayRoute, locale: Locale): DayRoute {
  const fields = normalizeDayRouteFields(route as unknown as Record<string, unknown>, locale)
  return {
    ...route,
    ...(fields ?? {}),
    stops: route.stops.map(
      (s) => findPlannerRecommendation(s.id, locale) ?? s,
    ),
  }
}

function sameStops(a: DayRoute, b: DayRoute) {
  if (a.stops.length !== b.stops.length) return false
  return a.stops.every((s, i) => s.id === b.stops[i]?.id)
}

export function isDayRouteSaved(userId: string, route: DayRoute): boolean {
  return getSavedRoutes(userId).some((r) => sameStops(r, route))
}

export function findSavedRouteMatch(
  userId: string,
  route: DayRoute,
): SavedDayRoute | null {
  return getSavedRoutes(userId).find((r) => sameStops(r, route)) ?? null
}

export function saveDayRoute(userId: string, route: DayRoute): boolean {
  const store = readStore()
  const list = getSavedRoutes(userId)
  if (list.some((r) => sameStops(r, route))) return false
  const entry: SavedDayRoute = { ...route, savedAt: Date.now() }
  const next = [entry, ...list].slice(0, MAX_PER_USER)
  store[userId] = next
  writeStore(store)
  notifySavedRoutesChange()
  return true
}

export function removeSavedRoute(userId: string, routeId: string) {
  const store = readStore()
  const list = getSavedRoutes(userId).filter((r) => r.id !== routeId)
  store[userId] = list
  writeStore(store)
  notifySavedRoutesChange()
}

export function clearSavedRoutesForUser(userId: string) {
  const store = readStore()
  delete store[userId]
  writeStore(store)
  notifySavedRoutesChange()
}
