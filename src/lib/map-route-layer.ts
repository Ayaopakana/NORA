import type {
  ExpressionSpecification,
  GeoJSONSource,
  Map as MapLibreMap,
} from 'maplibre-gl'
import {
  NORA_MAP_ROUTE_DARK,
  NORA_MAP_ROUTE_LIGHT,
} from '@/lib/map-nora-palette'

export const NORA_ROUTE_SOURCE = 'nora-day-route'
const NORA_ROUTE_CASING = 'nora-day-route-casing'
const NORA_ROUTE_GLOW = 'nora-day-route-glow'
const NORA_ROUTE_LINE = 'nora-day-route-line'

const ROUTE_LAYER_IDS = [NORA_ROUTE_CASING, NORA_ROUTE_GLOW, NORA_ROUTE_LINE] as const

export type MapRoutePoint = { lng: number; lat: number }

type PendingRoute = {
  path: MapRoutePoint[] | undefined
  isDark: boolean
}

const pendingByMap = new WeakMap<MapLibreMap, PendingRoute>()

function isValidCoord(n: number) {
  return Number.isFinite(n)
}

export function routePathFromStops(
  stops: readonly { lng: number; lat: number }[],
): MapRoutePoint[] | undefined {
  const path = stops
    .map((s) => ({
      lng: typeof s.lng === 'number' ? s.lng : Number(s.lng),
      lat: typeof s.lat === 'number' ? s.lat : Number(s.lat),
    }))
    .filter((s) => isValidCoord(s.lng) && isValidCoord(s.lat))
  return path.length >= 2 ? path : undefined
}

function removeRouteLayers(map: MapLibreMap) {
  for (const id of ROUTE_LAYER_IDS) {
    if (map.getLayer(id)) map.removeLayer(id)
  }
  if (map.getSource(NORA_ROUTE_SOURCE)) map.removeSource(NORA_ROUTE_SOURCE)
}

function routePaint(isDark: boolean) {
  return isDark ? NORA_MAP_ROUTE_DARK : NORA_MAP_ROUTE_LIGHT
}

/** Ширина линии по зуму — на карте читается как дорога, а не точки. */
const LINE_WIDTH_CASING: ExpressionSpecification = [
  'interpolate',
  ['linear'],
  ['zoom'],
  10,
  6,
  13,
  10,
  16,
  14,
  18,
  18,
]

const LINE_WIDTH_GLOW: ExpressionSpecification = [
  'interpolate',
  ['linear'],
  ['zoom'],
  10,
  5,
  13,
  8,
  16,
  11,
  18,
  14,
]

const LINE_WIDTH_CORE: ExpressionSpecification = [
  'interpolate',
  ['linear'],
  ['zoom'],
  10,
  3.5,
  13,
  5.5,
  16,
  7.5,
  18,
  9,
]

function applyRoutePaint(map: MapLibreMap, isDark: boolean) {
  const route = routePaint(isDark)
  if (map.getLayer(NORA_ROUTE_CASING)) {
    map.setPaintProperty(NORA_ROUTE_CASING, 'line-color', route.casing)
  }
  if (map.getLayer(NORA_ROUTE_GLOW)) {
    map.setPaintProperty(NORA_ROUTE_GLOW, 'line-color', route.glow)
  }
  if (map.getLayer(NORA_ROUTE_LINE)) {
    map.setPaintProperty(NORA_ROUTE_LINE, 'line-color', route.line)
  }
}

function addRouteLayers(
  map: MapLibreMap,
  coordinates: [number, number][],
  isDark: boolean,
) {
  const route = routePaint(isDark)
  const layout = {
    'line-join': 'round' as const,
    'line-cap': 'round' as const,
  }

  map.addSource(NORA_ROUTE_SOURCE, {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates },
    },
  })

  map.addLayer({
    id: NORA_ROUTE_CASING,
    type: 'line',
    source: NORA_ROUTE_SOURCE,
    layout,
    paint: {
      'line-color': route.casing,
      'line-width': LINE_WIDTH_CASING,
      'line-opacity': 0.92,
    },
  })

  map.addLayer({
    id: NORA_ROUTE_GLOW,
    type: 'line',
    source: NORA_ROUTE_SOURCE,
    layout,
    paint: {
      'line-color': route.glow,
      'line-width': LINE_WIDTH_GLOW,
      'line-opacity': 0.45,
      'line-blur': 1.2,
    },
  })

  map.addLayer({
    id: NORA_ROUTE_LINE,
    type: 'line',
    source: NORA_ROUTE_SOURCE,
    layout,
    paint: {
      'line-color': route.line,
      'line-width': LINE_WIDTH_CORE,
      'line-opacity': 1,
    },
  })
}

/** Поднять линию маршрута над 3D-зданиями и базовыми слоями стиля. */
export function promoteMapRouteLayer(map: MapLibreMap) {
  if (!map.getLayer(NORA_ROUTE_LINE)) return
  for (const id of ROUTE_LAYER_IDS) {
    if (!map.getLayer(id)) continue
    try {
      map.moveLayer(id)
    } catch {
      /* стиль ещё пересобирается */
    }
  }
}

/** Повторно применить последний маршрут после смены/обновления стиля карты. */
export function resyncPendingMapRoute(map: MapLibreMap) {
  const pending = pendingByMap.get(map)
  if (!pending) return
  syncMapRouteLayer(map, pending.path, pending.isDark)
}

/** Линия маршрута по дорогам (геометрия с бэкенда / 2GIS). */
export function syncMapRouteLayer(
  map: MapLibreMap,
  path: MapRoutePoint[] | undefined,
  isDark = false,
) {
  pendingByMap.set(map, { path, isDark })

  if (!path || path.length < 2) {
    removeRouteLayers(map)
    return
  }

  const coordinates = path.map((p) => [p.lng, p.lat] as [number, number])
  const lineFeature = {
    type: 'Feature' as const,
    properties: {},
    geometry: { type: 'LineString' as const, coordinates },
  }

  try {
    const lineSource = map.getSource(NORA_ROUTE_SOURCE) as GeoJSONSource | undefined

    if (lineSource && map.getLayer(NORA_ROUTE_LINE)) {
      lineSource.setData(lineFeature)
      applyRoutePaint(map, isDark)
      promoteMapRouteLayer(map)
      return
    }

    removeRouteLayers(map)
    addRouteLayers(map, coordinates, isDark)
    promoteMapRouteLayer(map)
  } catch {
    /* style reload — resyncPendingMapRoute на idle */
  }
}

export function removeMapRouteLayer(map: MapLibreMap) {
  pendingByMap.delete(map)
  removeRouteLayers(map)
}
