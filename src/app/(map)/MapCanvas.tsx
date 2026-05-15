'use client'

import type { Map as MapLibreMap } from 'maplibre-gl'
import { MapboxSurface } from '@/components/map/MapboxSurface'
import type { NoraMapHandle } from './map-types'

export type MapCanvasProps = {
  onMap: (map: NoraMapHandle) => void
  markers: { id: string; lng: number; lat: number; color?: string }[]
}

/** Отдельный чанк: MapLibre только в браузере, чтобы не «ронять» весь экран при ошибке модуля. */
export default function MapCanvas({ onMap, markers }: MapCanvasProps) {
  return (
    <div className="fixed inset-0 z-0 nora-map-viewport">
      <MapboxSurface
        className="h-full w-full"
        onMap={(map: MapLibreMap) => onMap(map)}
        markers={markers}
      />
    </div>
  )
}
