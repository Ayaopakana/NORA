import {
  appendPathPoints,
  extractOrderedRouteGeometry,
  type LngLat,
} from './wkt.js'

const GEOCODE_URL = 'https://catalog.api.2gis.com/3.0/items/geocode'
const ROUTING_URL = 'https://routing.api.2gis.com/routing/7.0.0/global'

const DEFAULT_CITY = 'Бишкек'

export function isDgisConfigured(): boolean {
  return Boolean(process.env.DGIS_API_KEY?.trim())
}

function apiKey(): string {
  const key = process.env.DGIS_API_KEY?.trim()
  if (!key) {
    throw new Error('DGIS_API_KEY is not set')
  }
  return key
}

type GeocodeResponse = {
  result?: {
    items?: Array<{
      point?: { lat?: number; lon?: number }
      geometry?: { centroid?: string }
    }>
  }
}

type RoutingResponse = {
  status?: string
  result?: unknown[]
  error?: { message?: string }
}

async function fetchWalkingRouteRaw(
  points: LngLat[],
): Promise<unknown | null> {
  if (points.length < 2) return null

  const url = new URL(ROUTING_URL)
  url.searchParams.set('key', apiKey())

  const body = {
    points: points.map((p) => ({
      type: 'walking',
      lon: p.lng,
      lat: p.lat,
    })),
    transport: 'walking',
    route_mode: 'shortest',
    locale: 'ru',
    output: 'detailed',
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(`2GIS routing HTTP ${res.status}`)
  }

  const data = (await res.json()) as RoutingResponse
  if (data.status && data.status !== 'OK') {
    throw new Error(data.error?.message ?? `2GIS routing: ${data.status}`)
  }

  return data.result?.[0] ?? null
}

/** Один участок A→B по тротуарам/улицам. */
export async function dgisWalkingRouteLeg(
  from: LngLat,
  to: LngLat,
): Promise<LngLat[]> {
  const route = await fetchWalkingRouteRaw([from, to])
  if (!route) return []
  const path = extractOrderedRouteGeometry(route)
  return path.length >= 2 ? path : []
}

/** Пешеходный маршрут: участки между остановками по порядку, геометрия по дорогам. */
export async function dgisWalkingRoute(
  points: LngLat[],
): Promise<LngLat[]> {
  if (points.length < 2) return []

  if (points.length === 2) {
    return dgisWalkingRouteLeg(points[0]!, points[1]!)
  }

  const out: LngLat[] = []

  for (let i = 0; i < points.length - 1; i++) {
    const from = points[i]!
    const to = points[i + 1]!
    let leg: LngLat[] = []

    try {
      leg = await dgisWalkingRouteLeg(from, to)
    } catch {
      leg = []
    }

    if (leg.length < 2) {
      appendPathPoints(out, [from, to])
    } else {
      if (out.length === 0) {
        appendPathPoints(out, leg)
      } else {
        appendPathPoints(out, leg.slice(1))
      }
    }
  }

  return out.length >= 2 ? out : []
}

/** Прямое геокодирование: адрес → координаты (2GIS Catalog). */
export async function dgisGeocode(query: string): Promise<LngLat | null> {
  const q = query.includes(DEFAULT_CITY)
    ? query
    : `${DEFAULT_CITY}, ${query}`
  const url = new URL(GEOCODE_URL)
  url.searchParams.set('key', apiKey())
  url.searchParams.set('q', q)
  url.searchParams.set('fields', 'items.point,items.full_name,items.type')
  url.searchParams.set('locale', 'ru_RU')

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`2GIS geocode HTTP ${res.status}`)
  }

  const data = (await res.json()) as GeocodeResponse
  const item = data.result?.items?.[0]
  const point = item?.point
  if (
    point &&
    Number.isFinite(point.lon) &&
    Number.isFinite(point.lat)
  ) {
    return { lng: point.lon!, lat: point.lat! }
  }
  return null
}
