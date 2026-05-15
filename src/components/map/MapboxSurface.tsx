'use client'

import maplibregl from 'maplibre-gl'
import type {
  MapMouseEvent,
  Map as MapLibreMap,
  Marker,
  StyleSpecification,
} from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

const DEFAULT_CENTER: [number, number] = [37.6173, 55.7558]

/** Бесплатный векторный стиль OSM для MapLibre (OpenFreeMap). */
const OPENFREEMAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty'

/** Запасной растровый OSM, если основной стиль недоступен. */
const OSM_RASTER_FALLBACK: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap',
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
}

export type MapboxSurfaceProps = {
  className?: string
  blueMono?: boolean
  onMap?: (map: MapLibreMap) => void
  pickPoint?: (coords: { lng: number; lat: number }) => void
  markers?: { id: string; lng: number; lat: number; color?: string }[]
}

export function MapboxSurface({
  className,
  blueMono = false,
  onMap,
  pickPoint,
  markers,
}: MapboxSurfaceProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markerObjs = useRef<Marker[]>([])
  const onMapRef = useRef(onMap)
  onMapRef.current = onMap
  const pickPointRef = useRef(pickPoint)
  pickPointRef.current = pickPoint

  const [tileError, setTileError] = useState<string | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    setTileError(null)

    let cancelled = false
    let instance: MapLibreMap | null = null
    let ro: ResizeObserver | null = null
    let onClick: ((e: MapMouseEvent) => void) | undefined

    const attachPick = (map: MapLibreMap) => {
      if (onClick) map.off('click', onClick)
      const pick = pickPointRef.current
      if (!pick) {
        map.getCanvas().style.cursor = ''
        return
      }
      onClick = (e) => pick({ lng: e.lngLat.lng, lat: e.lngLat.lat })
      map.on('click', onClick)
      map.getCanvas().style.cursor = 'crosshair'
    }

    const afterLoad = (map: MapLibreMap) => {
      map.resize()
      onMapRef.current?.(map)
      attachPick(map)

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (cancelled) return
            map.flyTo({
              center: [pos.coords.longitude, pos.coords.latitude],
              zoom: 13,
            })
          },
          () => {},
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60_000 },
        )
      }
    }

    const wireErrors = (map: MapLibreMap) => {
      map.on('error', (e) => {
        if (cancelled) return
        const msg =
          e.error?.message ??
          (typeof e.error === 'string' ? e.error : 'Ошибка загрузки тайлов')
        setTileError(msg)
      })
    }

    const createMap = (style: string | StyleSpecification) => {
      if (cancelled || !containerRef.current) return

      instance = new maplibregl.Map({
        container: containerRef.current,
        style,
        center: DEFAULT_CENTER,
        zoom: 12,
        attributionControl: { compact: true },
      })

      mapRef.current = instance

      instance.addControl(
        new maplibregl.NavigationControl({ visualizePitch: true }),
        'bottom-right',
      )

      wireErrors(instance)

      instance.once('load', () => {
        if (cancelled || !instance) return
        afterLoad(instance)
      })

      ro = new ResizeObserver(() => {
        instance?.resize()
      })
      ro.observe(containerRef.current)
    }

    createMap(OPENFREEMAP_STYLE)

    const fallbackTimer = window.setTimeout(() => {
      if (cancelled || !instance) return
      if (instance.isStyleLoaded() && instance.loaded()) return

      instance.remove()
      instance = null
      mapRef.current = null
      markerObjs.current.forEach((m) => m.remove())
      markerObjs.current = []

      createMap(OSM_RASTER_FALLBACK)
    }, 8000)

    return () => {
      cancelled = true
      window.clearTimeout(fallbackTimer)
      ro?.disconnect()
      if (onClick && instance) instance.off('click', onClick)
      markerObjs.current.forEach((m) => m.remove())
      markerObjs.current = []
      instance?.remove()
      instance = null
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const pick = pickPointRef.current
    const onClick = pick
      ? (e: MapMouseEvent) => pick({ lng: e.lngLat.lng, lat: e.lngLat.lat })
      : undefined

    if (onClick) {
      map.on('click', onClick)
      map.getCanvas().style.cursor = 'crosshair'
    } else {
      map.getCanvas().style.cursor = ''
    }

    return () => {
      if (onClick) map.off('click', onClick)
    }
  }, [pickPoint])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !markers) return

    markerObjs.current.forEach((m) => m.remove())
    markerObjs.current = []

    for (const m of markers) {
      const el = document.createElement('div')
      el.style.width = '14px'
      el.style.height = '14px'
      el.style.borderRadius = '999px'
      el.style.background = m.color ?? '#38bdf8'
      el.style.boxShadow = '0 0 12px rgba(56,189,248,0.8)'
      el.style.border = '2px solid rgba(255,255,255,0.85)'
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([m.lng, m.lat])
        .addTo(map)
      markerObjs.current.push(marker)
    }
  }, [markers])

  return (
    <div
      className={cn(
        'relative h-full min-h-0 w-full overflow-hidden',
        blueMono && 'nora-map-organic',
        className,
      )}
    >
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />
      {tileError ? (
        <div className="pointer-events-none absolute bottom-24 left-3 right-3 z-[5] rounded-xl border border-amber-500/40 bg-amber-950/90 px-3 py-2 text-center text-xs text-amber-100">
          Не удалось подгрузить часть карты: {tileError}. Проверьте интернет или
          отключите блокировщик рекламы для localhost.
        </div>
      ) : null}
    </div>
  )
}
