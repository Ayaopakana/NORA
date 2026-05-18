import type { MapRoutePoint } from '@/lib/map-route-layer'

/** Прямые отрезки между остановками (плотнее, чем 2 точки). */
export function straightWalkingPath(stops: MapRoutePoint[]): MapRoutePoint[] {
  if (stops.length < 2) return stops.length ? [...stops] : []

  const out: MapRoutePoint[] = []
  for (let i = 0; i < stops.length; i++) {
    const p = stops[i]!
    const prev = out[out.length - 1]
    if (prev && prev.lng === p.lng && prev.lat === p.lat) continue
    out.push({ lng: p.lng, lat: p.lat })
  }
  return out
}

/** OSRM fallback с клиента, если бэкенд вернул только «прямую». */
export async function fetchOsrmWalkingPath(
  stops: MapRoutePoint[],
): Promise<MapRoutePoint[] | null> {
  if (stops.length < 2) return null

  const coordStr = stops.map((p) => `${p.lng},${p.lat}`).join(';')
  const url =
    `https://router.project-osrm.org/route/v1/foot/${coordStr}` +
    '?overview=full&geometries=geojson&steps=false'

  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) return null
    const data = (await res.json()) as {
      code?: string
      routes?: Array<{ geometry?: { coordinates?: [number, number][] } }>
    }
    const coords = data.routes?.[0]?.geometry?.coordinates
    if (data.code !== 'Ok' || !coords?.length) return null
    return coords.map(([lng, lat]) => ({ lng, lat }))
  } catch {
    return null
  }
}

export function isStraightLinePath(
  path: MapRoutePoint[],
  stops: MapRoutePoint[],
): boolean {
  return path.length <= stops.length && stops.length >= 2
}
