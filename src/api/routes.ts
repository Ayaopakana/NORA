import type { DayRoute } from '@/lib/build-day-route'
import type { SavedDayRoute } from '@/lib/saved-routes-storage'
import { apiFetch } from '@/api/client'
import { parseJson } from '@/api/json'

export async function apiListSavedRoutes(): Promise<SavedDayRoute[]> {
  const res = await apiFetch('/routes')
  const data = await parseJson<{ routes: SavedDayRoute[] }>(res)
  return data.routes
}

export async function apiSaveRoute(route: DayRoute): Promise<SavedDayRoute> {
  const res = await apiFetch('/routes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ route }),
  })
  const data = await parseJson<{ route: SavedDayRoute }>(res)
  return data.route
}

export async function apiDeleteSavedRoute(routeId: string): Promise<void> {
  const res = await apiFetch(`/routes/${encodeURIComponent(routeId)}`, {
    method: 'DELETE',
  })
  if (!res.ok && res.status !== 404) {
    throw new Error(await res.text())
  }
}
