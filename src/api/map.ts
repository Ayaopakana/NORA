import { apiFetch } from '@/api/client'
import { isApiEnabled } from '@/api/config'
import type { MapRoutePoint } from '@/lib/map-route-layer'

export type PlaceCoordsMap = Record<
  string,
  { lng: number; lat: number; query?: string; geocodedAt?: string }
>

export type VenueCatalogItem = {
  id: string
  title: string
  place: string
  address: string
  lng: number
  lat: number
  duration: string
  budgetTier: number
  badge: string
  venueTags: string[]
  minAge?: number
  moods: Array<'calm' | 'energy' | 'tired' | 'anxious'>
}

export type MapRouteResponse = {
  path: MapRoutePoint[]
  source: '2gis' | 'osrm' | 'straight'
  cached?: boolean
}

export async function fetchPlaceCoords(): Promise<PlaceCoordsMap | null> {
  if (!isApiEnabled()) return null
  const res = await apiFetch('/map/places/coords')
  if (!res.ok) return null
  return (await res.json()) as PlaceCoordsMap
}

export async function fetchVenueCatalog(): Promise<VenueCatalogItem[] | null> {
  if (!isApiEnabled()) return null
  const res = await apiFetch('/map/places/catalog')
  if (!res.ok) return null
  return (await res.json()) as VenueCatalogItem[]
}

export async function fetchGeocode(
  query: string,
): Promise<{ lng: number; lat: number } | null> {
  if (!isApiEnabled()) return null
  const res = await apiFetch('/map/geocode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) return null
  const data = (await res.json()) as { lng: number; lat: number }
  if (!Number.isFinite(data.lng) || !Number.isFinite(data.lat)) return null
  return { lng: data.lng, lat: data.lat }
}

export async function fetchWalkingRoutePath(
  points: MapRoutePoint[],
): Promise<MapRouteResponse | null> {
  if (!isApiEnabled() || points.length < 2) return null
  const res = await apiFetch('/map/route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ points }),
  })
  if (!res.ok) return null
  return (await res.json()) as MapRouteResponse
}
