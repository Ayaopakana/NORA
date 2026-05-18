import type { Locale } from '@/i18n/config'
import { isApiEnabled } from '@/api/config'
import {
  apiDeleteSavedRoute,
  apiListSavedRoutes,
  apiSaveRoute,
  apiUpdateSavedRoute,
} from '@/api/routes'
import { readStoredLocale } from '@/i18n/locale-storage'
import {
  normalizeDayRouteFields,
  type DayRoute,
} from '@/lib/build-day-route'
import { findRecommendation } from '@/lib/venue-catalog'

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
      if (typeof p.id !== 'string') return null

      const fresh = findRecommendation(p.id, locale)
      let lng = Number(p.lng)
      let lat = Number(p.lat)
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
        if (p.id.startsWith('custom-')) return null
        if (!fresh) return null
        lng = fresh.lng
        lat = fresh.lat
      }

      return {
        id: p.id,
        title: fresh?.title ?? (typeof p.title === 'string' ? p.title : p.id),
        place: fresh?.place ?? (typeof p.place === 'string' ? p.place : ''),
        address: fresh?.address ?? (typeof p.address === 'string' ? p.address : ''),
        lng,
        lat,
        duration: fresh?.duration ?? (typeof p.duration === 'string' ? p.duration : ''),
        budgetTier: Number(p.budgetTier) || fresh?.budgetTier || 0,
        badge: fresh?.badge ?? (typeof p.badge === 'string' ? p.badge : ''),
        mbtiFit: Array.isArray(p.mbtiFit) ? p.mbtiFit : fresh?.mbtiFit,
        venueTags: Array.isArray(p.venueTags) ? p.venueTags : fresh?.venueTags,
        minAge: typeof p.minAge === 'number' ? p.minAge : fresh?.minAge,
      }
    })
    .filter((s): s is NonNullable<typeof s> => s !== null)
  if (!stops.length) return null
  const savedAt = Number(o.savedAt)

  const name =
    typeof o.name === 'string' && o.name.trim() ? o.name.trim() : fields.name

  return {
    id: o.id,
    ...fields,
    ...(name ? { name } : {}),
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

function getSavedRoutesLocal(
  userId: string,
  locale: Locale,
): SavedDayRoute[] {
  const list = readStore()[userId] ?? []
  return list
    .map((r) => normalizeSavedRoute(r, locale))
    .filter((r): r is SavedDayRoute => r !== null)
    .sort((a, b) => b.savedAt - a.savedAt)
}

export async function getSavedRoutesLocalized(
  userId: string,
  locale: Locale,
): Promise<SavedDayRoute[]> {
  if (isApiEnabled()) {
    const routes = await apiListSavedRoutes()
    return routes
      .map((r) => normalizeSavedRoute(r, locale))
      .filter((r): r is SavedDayRoute => r !== null)
      .sort((a, b) => b.savedAt - a.savedAt)
  }
  return getSavedRoutesLocal(userId, locale)
}

export function getSavedRoutes(
  userId: string,
  locale: Locale = readStoredLocale(),
): SavedDayRoute[] {
  return getSavedRoutesLocal(userId, locale)
}

function mergeStopWithSavedCoords(
  saved: DayRoute['stops'][number],
  fresh: DayRoute['stops'][number] | null,
): DayRoute['stops'][number] {
  if (!fresh) return saved
  const lng = Number.isFinite(saved.lng) ? saved.lng : fresh.lng
  const lat = Number.isFinite(saved.lat) ? saved.lat : fresh.lat
  return { ...fresh, lng, lat }
}

export function rehydrateDayRoute(route: DayRoute, locale: Locale): DayRoute {
  const fields = normalizeDayRouteFields(
    route as unknown as Record<string, unknown>,
    locale,
  )
  return {
    ...route,
    ...(fields ?? {}),
    stops: route.stops.map((s) =>
      mergeStopWithSavedCoords(s, findRecommendation(s.id, locale)),
    ),
  }
}

function sameStops(a: DayRoute, b: DayRoute) {
  if (a.stops.length !== b.stops.length) return false
  return a.stops.every((s, i) => s.id === b.stops[i]?.id)
}

export async function isDayRouteSaved(
  userId: string,
  route: DayRoute,
): Promise<boolean> {
  const list = await getSavedRoutesLocalized(userId, readStoredLocale())
  return list.some((r) => r.id === route.id || sameStops(r, route))
}

export async function findSavedRouteMatch(
  userId: string,
  route: DayRoute,
  locale: Locale = readStoredLocale(),
): Promise<SavedDayRoute | null> {
  const list = await getSavedRoutesLocalized(userId, locale)
  return list.find((r) => sameStops(r, route)) ?? null
}

export async function saveDayRoute(
  userId: string,
  route: DayRoute,
): Promise<boolean> {
  const existing = await findSavedRouteById(userId, route.id)
  if (existing) {
    await updateSavedRoute(userId, route)
    return true
  }

  if (isApiEnabled()) {
    try {
      await apiSaveRoute(route)
      notifySavedRoutesChange()
      return true
    } catch {
      return false
    }
  }

  const store = readStore()
  const list = getSavedRoutesLocal(userId, readStoredLocale())
  if (list.some((r) => sameStops(r, route))) return false
  const entry: SavedDayRoute = { ...route, savedAt: Date.now() }
  const next = [entry, ...list].slice(0, MAX_PER_USER)
  store[userId] = next
  writeStore(store)
  notifySavedRoutesChange()
  return true
}

export async function findSavedRouteById(
  userId: string,
  routeId: string,
  locale: Locale = readStoredLocale(),
): Promise<SavedDayRoute | null> {
  const list = await getSavedRoutesLocalized(userId, locale)
  return list.find((r) => r.id === routeId) ?? null
}

export async function updateSavedRoute(userId: string, route: DayRoute) {
  if (isApiEnabled()) {
    await apiUpdateSavedRoute(route)
    notifySavedRoutesChange()
    return
  }

  const store = readStore()
  const list = getSavedRoutesLocal(userId, readStoredLocale())
  const idx = list.findIndex((r) => r.id === route.id)
  if (idx < 0) return
  const prev = list[idx]!
  const entry: SavedDayRoute = { ...route, savedAt: prev.savedAt }
  const next = [...list]
  next[idx] = entry
  store[userId] = next
  writeStore(store)
  notifySavedRoutesChange()
}

export async function removeSavedRoute(userId: string, routeId: string) {
  if (isApiEnabled()) {
    await apiDeleteSavedRoute(routeId)
    notifySavedRoutesChange()
    return
  }

  const store = readStore()
  const list = getSavedRoutesLocal(userId, readStoredLocale()).filter(
    (r) => r.id !== routeId,
  )
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
