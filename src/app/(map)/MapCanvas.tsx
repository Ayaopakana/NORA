'use client'

import type { Map as MapLibreMap } from 'maplibre-gl'
import { MapboxSurface } from '@/components/map/MapboxSurface'
import type { MapSurfaceMarker } from '@/lib/map-marker'
import type { MapRoutePoint } from '@/lib/map-route-layer'
import type { UserMapLocation } from '@/lib/map-user-location-layer'
import type { NoraMapHandle } from './map-types'

export type MapCanvasProps = {
  onMap: (map: NoraMapHandle) => void
  markers: MapSurfaceMarker[]
  routePath?: MapRoutePoint[]
  userLocation?: UserMapLocation
}

/** Отдельный чанк: MapLibre только в браузере, чтобы не «ронять» весь экран при ошибке модуля. */
export default function MapCanvas({
  onMap,
  markers,
  routePath,
  userLocation,
}: MapCanvasProps) {
  return (
    <div className="fixed inset-0 z-0 nora-map-viewport">
      <MapboxSurface
        className="h-full w-full"
        topDown
        onMap={(map: MapLibreMap) => onMap(map as NoraMapHandle)}
        markers={markers}
        routePath={routePath}
        userLocation={userLocation}
      />
    </div>
  )
}
