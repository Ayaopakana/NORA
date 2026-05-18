import { fetchPlaceCoords, type PlaceCoordsMap } from '@/api/map'
import { isApiEnabled } from '@/api/config'
import type { DayRoute } from '@/lib/build-day-route'

let cache: PlaceCoordsMap | null = null
let loadPromise: Promise<PlaceCoordsMap | null> | null = null

export function getPlaceCoordsCache(): PlaceCoordsMap | null {
  return cache
}

/** Загрузить кэш координат с бэкенда (2GIS geocode, один раз на сервере). */
export async function loadPlaceCoordinates(): Promise<PlaceCoordsMap | null> {
  if (!isApiEnabled()) return null
  if (cache) return cache
  if (loadPromise) return loadPromise
  loadPromise = fetchPlaceCoords().then((data) => {
    cache = data
    return data
  })
  return loadPromise
}

export function withPlaceCoordinates<T extends { id: string; lng: number; lat: number }>(
  item: T,
): T {
  const hit = cache?.[item.id]
  if (!hit) return item
  return { ...item, lng: hit.lng, lat: hit.lat }
}

export function invalidatePlaceCoordinatesCache() {
  cache = null
  loadPromise = null
}

/** Обновить lng/lat остановок из кэша без пересборки маршрута. */
export function applyPlaceCoordsToRoute(route: DayRoute): DayRoute {
  return {
    ...route,
    stops: route.stops.map((s) => withPlaceCoordinates(s)),
  }
}
