import type { RouteAreaKey } from '@/lib/route-intents'

export type AreaBBox = {
  minLng: number
  maxLng: number
  minLat: number
  maxLat: number
}

export type AreaCircle = {
  lng: number
  lat: number
  radiusKm: number
}

type AreaGeoRule = {
  boxes?: AreaBBox[]
  circles?: AreaCircle[]
  /** Минимум км от центра Бишкека (загород / пригород) */
  minKmFromCenter?: number
  /** Исключить плотную городскую застройку */
  excludeUrbanCore?: boolean
}

/** Центр Бишкека — для расстояний и сортировки остановок */
export const BISHKEK_CENTER = { lng: 74.5698, lat: 42.8746 } as const

const URBAN_CORE: AreaBBox = {
  minLng: 74.52,
  maxLng: 74.64,
  minLat: 42.848,
  maxLat: 42.892,
}

/**
 * Приблизительные зоны Бишкека (lng/lat).
 * Точки вне всех зон не попадают в пресет — только custom по тексту.
 */
export const ROUTE_AREA_GEO: Record<
  Exclude<RouteAreaKey, 'custom'>,
  AreaGeoRule
> = {
  center: {
    boxes: [
      {
        minLng: 74.585,
        maxLng: 74.632,
        minLat: 42.864,
        maxLat: 42.886,
      },
    ],
  },
  osh: {
    boxes: [
      {
        minLng: 74.518,
        maxLng: 74.582,
        minLat: 42.848,
        maxLat: 42.888,
      },
    ],
  },
  north: {
    boxes: [
      {
        minLng: 74.52,
        maxLng: 74.66,
        minLat: 42.882,
        maxLat: 42.91,
      },
    ],
  },
  south: {
    boxes: [
      {
        minLng: 74.52,
        maxLng: 74.66,
        minLat: 42.838,
        maxLat: 42.866,
      },
    ],
  },
  parks: {
    circles: [
      { lng: 74.6038, lat: 42.8735, radiusKm: 1.1 },
      { lng: 74.6034, lat: 42.8775, radiusKm: 0.85 },
      { lng: 74.5692, lat: 42.8741, radiusKm: 0.75 },
      { lng: 74.5882, lat: 42.8863, radiusKm: 1.0 },
      { lng: 74.5512, lat: 42.8895, radiusKm: 1.2 },
    ],
    boxes: [
      {
        minLng: 74.535,
        maxLng: 74.625,
        minLat: 42.868,
        maxLat: 42.895,
      },
    ],
  },
  countryside: {
    minKmFromCenter: 2.8,
    excludeUrbanCore: true,
  },
}

export function haversineKm(
  a: { lng: number; lat: number },
  b: { lng: number; lat: number },
) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(x)))
}

function inBBox(lng: number, lat: number, box: AreaBBox) {
  return (
    lng >= box.minLng &&
    lng <= box.maxLng &&
    lat >= box.minLat &&
    lat <= box.maxLat
  )
}

function inCircle(lng: number, lat: number, circle: AreaCircle) {
  return (
    haversineKm({ lng, lat }, { lng: circle.lng, lat: circle.lat }) <=
    circle.radiusKm
  )
}

export function isCoordInRouteArea(
  lng: number,
  lat: number,
  areaKey: Exclude<RouteAreaKey, 'custom'>,
): boolean {
  const rule = ROUTE_AREA_GEO[areaKey]

  if (rule.excludeUrbanCore && inBBox(lng, lat, URBAN_CORE)) {
    return false
  }

  if (rule.minKmFromCenter != null) {
    const d = haversineKm({ lng, lat }, BISHKEK_CENTER)
    if (d < rule.minKmFromCenter) return false
    if (!rule.boxes?.length && !rule.circles?.length) return true
  }

  const inBox = rule.boxes?.some((b) => inBBox(lng, lat, b)) ?? false
  const inCirc =
    rule.circles?.some((c) => inCircle(lng, lat, c)) ?? false

  if (rule.boxes?.length || rule.circles?.length) {
    return inBox || inCirc
  }

  return false
}

/** Точка для сортировки остановок «от центра района» */
export function routeAreaSeed(
  areaKey: RouteAreaKey,
): { lng: number; lat: number } {
  if (areaKey === 'custom') return BISHKEK_CENTER
  if (areaKey === 'countryside') {
    return { lng: 74.62, lat: 42.92 }
  }
  const rule = ROUTE_AREA_GEO[areaKey]
  const box = rule.boxes?.[0]
  if (box) {
    return {
      lng: (box.minLng + box.maxLng) / 2,
      lat: (box.minLat + box.maxLat) / 2,
    }
  }
  const circle = rule.circles?.[0]
  if (circle) return { lng: circle.lng, lat: circle.lat }
  return BISHKEK_CENTER
}
