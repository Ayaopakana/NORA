import type { Map as MapLibreMap } from 'maplibre-gl'

export const NORA_ROUTE_SOURCE = 'nora-day-route'
const NORA_ROUTE_GLOW = 'nora-day-route-glow'
const NORA_ROUTE_LINE = 'nora-day-route-line'
const NORA_ROUTE_ARROWS = 'nora-day-route-arrows'

export type MapRoutePoint = { lng: number; lat: number }

function removeRouteLayers(map: MapLibreMap) {
  for (const id of [NORA_ROUTE_ARROWS, NORA_ROUTE_LINE, NORA_ROUTE_GLOW]) {
    if (map.getLayer(id)) map.removeLayer(id)
  }
  if (map.getSource(NORA_ROUTE_SOURCE)) map.removeSource(NORA_ROUTE_SOURCE)
  const arrowSrc = `${NORA_ROUTE_SOURCE}-arrows`
  if (map.getSource(arrowSrc)) map.removeSource(arrowSrc)
}

/** Линия маршрута точка-к-точке (демо; дорожный роутинг — на бэкенде). */
export function syncMapRouteLayer(
  map: MapLibreMap,
  path: MapRoutePoint[] | undefined,
) {
  removeRouteLayers(map)
  if (!path || path.length < 2) return

  const coordinates = path.map((p) => [p.lng, p.lat] as [number, number])

  map.addSource(NORA_ROUTE_SOURCE, {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates },
    },
  })

  map.addLayer({
    id: NORA_ROUTE_GLOW,
    type: 'line',
    source: NORA_ROUTE_SOURCE,
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      'line-color': '#38bdf8',
      'line-width': 12,
      'line-opacity': 0.22,
      'line-blur': 3,
    },
  })

  map.addLayer({
    id: NORA_ROUTE_LINE,
    type: 'line',
    source: NORA_ROUTE_SOURCE,
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      'line-color': '#0ea5e9',
      'line-width': 4.5,
      'line-opacity': 0.92,
      'line-dasharray': [1.6, 1.1],
    },
  })

  const arrowFeatures = coordinates.slice(0, -1).map((from, i) => {
    const to = coordinates[i + 1]!
    const mid: [number, number] = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2]
    return {
      type: 'Feature' as const,
      properties: { leg: i + 1 },
      geometry: { type: 'Point' as const, coordinates: mid },
    }
  })

  map.addSource(`${NORA_ROUTE_SOURCE}-arrows`, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: arrowFeatures },
  })

  map.addLayer({
    id: NORA_ROUTE_ARROWS,
    type: 'circle',
    source: `${NORA_ROUTE_SOURCE}-arrows`,
    paint: {
      'circle-radius': 4,
      'circle-color': '#f8fafc',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#0284c7',
      'circle-opacity': 0.95,
    },
  })
}

export function removeMapRouteLayer(map: MapLibreMap) {
  removeRouteLayers(map)
}
