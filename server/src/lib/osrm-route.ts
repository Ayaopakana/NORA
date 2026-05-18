import { appendPathPoints, type LngLat } from './wkt.js'

type OsrmRouteResponse = {
  code?: string
  routes?: Array<{
    geometry?: {
      coordinates?: [number, number][]
    }
  }>
}

/**
 * Запасной пешеходный маршрут по OpenStreetMap (OSRM), если 2GIS недоступен.
 */
export async function osrmWalkingRoute(points: LngLat[]): Promise<LngLat[]> {
  if (points.length < 2) return []

  const coordStr = points.map((p) => `${p.lng},${p.lat}`).join(';')
  const url =
    `https://router.project-osrm.org/route/v1/foot/${coordStr}` +
    '?overview=full&geometries=geojson&steps=false'

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) return []

  const data = (await res.json()) as OsrmRouteResponse
  if (data.code !== 'Ok' || !data.routes?.[0]?.geometry?.coordinates) {
    return []
  }

  const out: LngLat[] = []
  for (const [lng, lat] of data.routes[0].geometry!.coordinates!) {
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue
    appendPathPoints(out, [{ lng, lat }])
  }

  return out.length >= 2 ? out : []
}
