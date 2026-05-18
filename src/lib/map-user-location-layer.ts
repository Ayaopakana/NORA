import maplibregl from 'maplibre-gl'
import type { GeoJSONSource, Map as MapLibreMap, Marker } from 'maplibre-gl'
import { geodesicCircleRing } from '@/lib/geo-utils'
import {
  createUserLocationMarkerElement,
  updateUserLocationMarkerElement,
  type UserLocationAppearance,
} from '@/lib/map-user-location-marker'

export const NORA_USER_ACCURACY_SOURCE = 'nora-user-accuracy'
const NORA_USER_ACCURACY_FILL = 'nora-user-accuracy-fill'
const NORA_USER_ACCURACY_LINE = 'nora-user-accuracy-line'

export type UserMapLocation = {
  lng: number
  lat: number
  /** Радиус погрешности, м */
  accuracy?: number
  heading?: number | null
  avatarUrl?: string | null
  displayName?: string
}

type PendingUserLocation = {
  location: UserMapLocation | undefined
  appearance: UserLocationAppearance
  isDark: boolean
}

const pendingByMap = new WeakMap<MapLibreMap, PendingUserLocation>()
const markerByMap = new WeakMap<MapLibreMap, Marker>()

const DEFAULT_APPEARANCE: UserLocationAppearance = {
  avatarUrl: null,
  displayName: '',
}

function isValidCoord(n: number) {
  return Number.isFinite(n)
}

function appearanceFromLocation(
  location: UserMapLocation,
): UserLocationAppearance {
  return {
    avatarUrl: location.avatarUrl ?? null,
    displayName: location.displayName?.trim() ?? '',
  }
}

function removeUserLocationLayers(map: MapLibreMap) {
  for (const id of [NORA_USER_ACCURACY_LINE, NORA_USER_ACCURACY_FILL]) {
    if (map.getLayer(id)) map.removeLayer(id)
  }
  if (map.getSource(NORA_USER_ACCURACY_SOURCE)) {
    map.removeSource(NORA_USER_ACCURACY_SOURCE)
  }
  const marker = markerByMap.get(map)
  if (marker) {
    marker.remove()
    markerByMap.delete(map)
  }
}

function accuracyFeature(location: UserMapLocation) {
  const accuracy = location.accuracy
  if (!accuracy || !Number.isFinite(accuracy) || accuracy < 8) return null

  const ring = geodesicCircleRing(
    location.lng,
    location.lat,
    Math.min(accuracy, 120),
  )
  return {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'Polygon' as const,
      coordinates: [ring],
    },
  }
}

function addAccuracyLayers(map: MapLibreMap, isDark: boolean) {
  const fill = isDark ? 'rgba(56, 189, 248, 0.14)' : 'rgba(37, 99, 235, 0.16)'
  const line = isDark ? 'rgba(125, 211, 252, 0.55)' : 'rgba(59, 130, 246, 0.45)'

  map.addSource(NORA_USER_ACCURACY_SOURCE, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  })

  map.addLayer({
    id: NORA_USER_ACCURACY_FILL,
    type: 'fill',
    source: NORA_USER_ACCURACY_SOURCE,
    paint: {
      'fill-color': fill,
      'fill-opacity': 1,
    },
  })

  map.addLayer({
    id: NORA_USER_ACCURACY_LINE,
    type: 'line',
    source: NORA_USER_ACCURACY_SOURCE,
    paint: {
      'line-color': line,
      'line-width': 1.5,
    },
  })
}

export function promoteMapUserLocationLayer(map: MapLibreMap) {
  for (const id of [NORA_USER_ACCURACY_FILL, NORA_USER_ACCURACY_LINE]) {
    if (!map.getLayer(id)) continue
    try {
      map.moveLayer(id)
    } catch {
      /* */
    }
  }
  const marker = markerByMap.get(map)
  if (marker) marker.getElement().style.zIndex = '6'
}

export function resyncPendingMapUserLocation(map: MapLibreMap) {
  const pending = pendingByMap.get(map)
  if (!pending) return
  syncMapUserLocationLayer(
    map,
    pending.location,
    pending.isDark,
    pending.appearance,
  )
}

export function syncMapUserLocationLayer(
  map: MapLibreMap,
  location: UserMapLocation | undefined,
  isDark = false,
  appearance: UserLocationAppearance = DEFAULT_APPEARANCE,
) {
  const resolvedAppearance = location
    ? appearanceFromLocation(location)
    : appearance

  pendingByMap.set(map, {
    location,
    appearance: resolvedAppearance,
    isDark,
  })

  if (
    !location ||
    !isValidCoord(location.lng) ||
    !isValidCoord(location.lat)
  ) {
    removeUserLocationLayers(map)
    return
  }

  try {
    const accuracy = accuracyFeature(location)
    const accuracyCollection = {
      type: 'FeatureCollection' as const,
      features: accuracy ? [accuracy] : [],
    }

    const accuracySource = map.getSource(
      NORA_USER_ACCURACY_SOURCE,
    ) as GeoJSONSource | undefined

    if (!accuracySource) {
      addAccuracyLayers(map, isDark)
    } else {
      accuracySource.setData(accuracyCollection)
    }

    let marker = markerByMap.get(map)
    if (!marker) {
      const el = createUserLocationMarkerElement(resolvedAppearance)
      marker = new maplibregl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat([location.lng, location.lat])
        .addTo(map)
      markerByMap.set(map, marker)
    } else {
      marker.setLngLat([location.lng, location.lat])
      updateUserLocationMarkerElement(
        marker.getElement(),
        resolvedAppearance,
      )
    }

    promoteMapUserLocationLayer(map)
  } catch {
    /* style reload */
  }
}

export function removeMapUserLocationLayer(map: MapLibreMap) {
  pendingByMap.delete(map)
  removeUserLocationLayers(map)
}
