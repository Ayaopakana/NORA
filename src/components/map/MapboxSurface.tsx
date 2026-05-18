'use client'

import maplibregl from 'maplibre-gl'
import type {
  MapMouseEvent,
  Map as MapLibreMap,
  Marker,
  StyleSpecification,
} from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'
import { applyNoraVectorMapStyle } from '@/lib/map-nora-vector-style'
import { mapAppearanceScheme } from '@/lib/map-appearance'
import {
  mapFallbackForTheme,
  mapStyleForTheme,
} from '@/lib/map-styles'
import { useI18n } from '@/hooks/useI18n'
import {
  resyncPendingMapRoute,
  syncMapRouteLayer,
  type MapRoutePoint,
} from '@/lib/map-route-layer'
import {
  resyncPendingMapUserLocation,
  syncMapUserLocationLayer,
  type UserMapLocation,
} from '@/lib/map-user-location-layer'
import {
  createMapMarkerElement,
  type MapSurfaceMarker,
} from '@/lib/map-marker'
import { nudgeMapResize } from '@/lib/nudge-map-resize'
import { cn } from '@/lib/utils'

/** Центр карты по умолчанию — Бишкек */
const DEFAULT_CENTER: [number, number] = [74.5698, 42.8746]

export type MapboxSurfaceProps = {
  className?: string
  /** @deprecated тонировка задаётся классом nora-map-dark / nora-map-light */
  blueMono?: boolean
  onMap?: (map: MapLibreMap) => void
  pickPoint?: (coords: { lng: number; lat: number }) => void
  markers?: MapSurfaceMarker[]
  /** Точки маршрута по порядку — линия на карте (демо, до бэкенд-роутинга) */
  routePath?: MapRoutePoint[]
  /** Текущая геопозиция пользователя (watchPosition) */
  userLocation?: UserMapLocation
  /** Вид сверху при старте (pitch 0) — для главной карты */
  topDown?: boolean
}

type MapViewState = {
  center: [number, number]
  zoom: number
  bearing: number
  pitch: number
}

export function MapboxSurface({
  className,
  onMap,
  pickPoint,
  markers,
  routePath,
  userLocation,
  topDown = false,
}: MapboxSurfaceProps) {
  const { t } = useI18n()
  const tRef = useRef(t)
  tRef.current = t
  const { theme, resolvedTheme } = useTheme()
  const mapScheme = mapAppearanceScheme(theme, resolvedTheme)
  const isDark = mapScheme === 'dark'

  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markerObjs = useRef<Marker[]>([])
  const onMapRef = useRef(onMap)
  onMapRef.current = onMap
  const pickPointRef = useRef(pickPoint)
  pickPointRef.current = pickPoint
  const themeRef = useRef(theme)
  themeRef.current = theme
  const resolvedThemeRef = useRef(resolvedTheme)
  resolvedThemeRef.current = resolvedTheme

  const getMapScheme = () =>
    mapAppearanceScheme(themeRef.current, resolvedThemeRef.current)

  const [tileError, setTileError] = useState<string | null>(null)
  const [isRasterFallback, setIsRasterFallback] = useState(false)
  const [mounted, setMounted] = useState(false)
  /** Пока false — закрываем «сырую» серую подложку, пока стиль и тайлы не готовы. */
  const [mapTilesReady, setMapTilesReady] = useState(false)

  const isRasterFallbackRef = useRef(false)
  isRasterFallbackRef.current = isRasterFallback
  /** Чтобы не вызывать setStyle сразу после перехода на растр с тем же стилем. */
  const rasterThemeSyncedRef = useRef<string | undefined>(undefined)
  /** Последняя тема векторного стиля (Positron vs Dark) — без полного setStyle слои двух стилей смешиваются. */
  const vectorSchemeSyncedRef = useRef<'light' | 'dark' | undefined>(undefined)
  const vectorStyleSwitchGenRef = useRef(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  /** Один раз при монтировании: смена темы не пересоздаёт MapLibre (позиция не сбрасывается). */
  useEffect(() => {
    const el = containerRef.current
    if (!el || !mounted) return

    setTileError(null)
    setIsRasterFallback(false)
    setMapTilesReady(false)
    rasterThemeSyncedRef.current = undefined
    vectorSchemeSyncedRef.current = undefined

    let cancelled = false
    let instance: MapLibreMap | null = null
    let ro: ResizeObserver | null = null
    let onClick: ((e: MapMouseEvent) => void) | undefined
    let onViewportChange: (() => void) | undefined
    let usedFallback = false

    const initialScheme = getMapScheme()
    const vectorStyle = mapStyleForTheme(
      initialScheme === 'light' ? 'light' : undefined,
    )

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

    const readView = (map: MapLibreMap): MapViewState => ({
      center: [map.getCenter().lng, map.getCenter().lat],
      zoom: map.getZoom(),
      bearing: map.getBearing(),
      pitch: map.getPitch(),
    })

    const afterLoad = (map: MapLibreMap, runGeolocate: boolean) => {
      map.resize()
      map.setMaxPitch(85)
      try {
        applyNoraVectorMapStyle(map, getMapScheme() === 'dark')
      } catch {
        /* векторный стиль мог ещё догружаться */
      }
      map.once('idle', () => {
        try {
          applyNoraVectorMapStyle(map, getMapScheme() === 'dark')
        } catch {
          /* */
        }
      })
      onMapRef.current?.(map)
      attachPick(map)

      if (runGeolocate && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (cancelled) return
            map.flyTo({
              center: [pos.coords.longitude, pos.coords.latitude],
              zoom: 13,
              pitch: 58,
              bearing: -22,
              duration: 2200,
            })
          },
          () => {},
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60_000 },
        )
      }
    }

    let styleLoadCompleted = false

    const wireErrors = (map: MapLibreMap) => {
      map.on('error', (e) => {
        if (cancelled) return
        const msg =
          e.error?.message ??
          (typeof e.error === 'string' ? e.error : tRef.current('mapSurface.tileError'))
        setTileError(msg)
      })
    }

    const createMap = (
      style: string | StyleSpecification,
      view?: MapViewState,
      runGeolocate = false,
    ) => {
      if (cancelled || !containerRef.current) return

      setMapTilesReady(false)
      styleLoadCompleted = false

      instance = new maplibregl.Map({
        container: containerRef.current,
        style,
        center: view?.center ?? DEFAULT_CENTER,
        zoom: view?.zoom ?? (topDown ? 16 : 12),
        bearing: view?.bearing ?? (topDown ? 0 : -18),
        pitch: view?.pitch ?? (topDown ? 0 : 56),
        attributionControl: false,
        /* Быстрее показывать тайлы, без долгого «растворения» пустой подложки */
        fadeDuration: 0,
        maxPitch: 85,
        touchPitch: true,
        dragRotate: true,
        touchZoomRotate: true,
      })

      mapRef.current = instance

      wireErrors(instance)

      instance.once('load', () => {
        if (cancelled || !instance) return
        styleLoadCompleted = true
        afterLoad(instance, runGeolocate)
        const markTilesReady = () => {
          if (cancelled || !instance) return
          setMapTilesReady(true)
          nudgeMapResize(instance)
        }
        instance.once('idle', markTilesReady)
      })

      ro?.disconnect()
      ro = new ResizeObserver(() => {
        if (instance) nudgeMapResize(instance)
      })
      ro.observe(containerRef.current)
    }

    onViewportChange = () => {
      if (mapRef.current) nudgeMapResize(mapRef.current)
    }
    window.visualViewport?.addEventListener('resize', onViewportChange)
    window.addEventListener('orientationchange', onViewportChange)

    createMap(vectorStyle)

    const fallbackTimer = window.setTimeout(() => {
      if (cancelled || !instance || usedFallback) return
      if (instance.isStyleLoaded() && instance.loaded()) return

      usedFallback = true
      setIsRasterFallback(true)
      rasterThemeSyncedRef.current = getMapScheme()
      const preserved = readView(instance)
      instance.remove()
      instance = null
      mapRef.current = null
      markerObjs.current.forEach((m) => m.remove())
      markerObjs.current = []

      const rasterFallback = mapFallbackForTheme(getMapScheme())
      createMap(rasterFallback, preserved, false)
    }, 8000)

    const tilesFallbackTimer = window.setTimeout(() => {
      if (cancelled) return
      setMapTilesReady(true)
    }, 25_000)

    return () => {
      cancelled = true
      window.clearTimeout(fallbackTimer)
      window.clearTimeout(tilesFallbackTimer)
      ro?.disconnect()
      if (onViewportChange) {
        window.visualViewport?.removeEventListener('resize', onViewportChange)
        window.removeEventListener('orientationchange', onViewportChange)
      }
      if (onClick && instance) instance.off('click', onClick)
      markerObjs.current.forEach((m) => m.remove())
      markerObjs.current = []
      instance?.remove()
      instance = null
      mapRef.current = null
    }
  }, [mounted])

  /** Вектор: полный обмен URL стиля — иначе смешиваются слои Positron и Dark. Без оверлея «загрузки». */
  useEffect(() => {
    if (!mounted) return
    const map = mapRef.current
    if (!map || isRasterFallback) return

    if (vectorSchemeSyncedRef.current === undefined) {
      vectorSchemeSyncedRef.current = mapScheme
      return
    }
    if (vectorSchemeSyncedRef.current === mapScheme) return
    vectorSchemeSyncedRef.current = mapScheme

    const gen = ++vectorStyleSwitchGenRef.current
    const nextUrl = mapStyleForTheme(mapScheme === 'light' ? 'light' : undefined)
    const center = map.getCenter()
    const zoom = map.getZoom()
    const bearing = map.getBearing()
    const pitch = map.getPitch()
    const applyDark = mapScheme === 'dark'

    const finishVectorTheme = () => {
      if (gen !== vectorStyleSwitchGenRef.current) return
      if (!map.isStyleLoaded()) return
      map.jumpTo({ center, zoom, bearing, pitch })
      nudgeMapResize(map)
      try {
        applyNoraVectorMapStyle(map, applyDark)
      } catch {
        /* */
      }
      resyncPendingMapRoute(map)
      resyncPendingMapUserLocation(map)
    }

    /* После setStyle приходит серия styledata; первый раз список слоёв может быть ещё без building —
     * одна отписка и один apply тогда навсегда пропускают ensureBuildings3d. Держим слушатель до idle. */
    const onStyleData = () => {
      if (gen !== vectorStyleSwitchGenRef.current) return
      if (!map.isStyleLoaded()) return
      try {
        applyNoraVectorMapStyle(map, applyDark)
      } catch {
        /* */
      }
    }

    map.on('styledata', onStyleData)
    map.setStyle(nextUrl)
    map.once('idle', () => {
      map.off('styledata', onStyleData)
      finishVectorTheme()
      resyncPendingMapRoute(map)
      resyncPendingMapUserLocation(map)
    })

    return () => {
      map.off('styledata', onStyleData)
    }
  }, [mapScheme, isRasterFallback, mounted])

  /** Растровый fallback: разные стили — setStyle с сохранением камеры (только при смене темы). */
  useEffect(() => {
    const map = mapRef.current
    if (!map || !isRasterFallbackRef.current) return

    if (rasterThemeSyncedRef.current === undefined) {
      rasterThemeSyncedRef.current = mapScheme
      return
    }
    if (rasterThemeSyncedRef.current === mapScheme) return
    rasterThemeSyncedRef.current = mapScheme

    const center = map.getCenter()
    const zoom = map.getZoom()
    const bearing = map.getBearing()
    const pitch = map.getPitch()
    const nextStyle = mapFallbackForTheme(mapScheme)

    const onRasterStyleData = () => {
      if (!map.isStyleLoaded()) return
      map.off('styledata', onRasterStyleData)
      map.jumpTo({
        center,
        zoom,
        bearing,
        pitch,
      })
      map.resize()
      resyncPendingMapRoute(map)
      resyncPendingMapUserLocation(map)
    }

    map.on('styledata', onRasterStyleData)
    map.setStyle(nextStyle)

    return () => {
      map.off('styledata', onRasterStyleData)
    }
  }, [mapScheme])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const pick = pickPointRef.current
    const onClickHandler = pick
      ? (e: MapMouseEvent) => pick({ lng: e.lngLat.lng, lat: e.lngLat.lat })
      : undefined

    if (onClickHandler) {
      map.on('click', onClickHandler)
      map.getCanvas().style.cursor = 'crosshair'
    } else {
      map.getCanvas().style.cursor = ''
    }

    return () => {
      if (onClickHandler) map.off('click', onClickHandler)
    }
  }, [pickPoint])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const syncMarkers = () => {
      markerObjs.current.forEach((m) => m.remove())
      markerObjs.current = []

      if (markers) {
        for (const m of markers) {
          const el = createMapMarkerElement(m, isDark)
          const marker = new maplibregl.Marker({
            element: el,
            anchor: 'bottom',
          })
            .setLngLat([m.lng, m.lat])
            .addTo(map)
          markerObjs.current.push(marker)
        }
      }
    }

    if (map.isStyleLoaded()) {
      syncMarkers()
    } else {
      map.once('load', syncMarkers)
      return () => {
        map.off('load', syncMarkers)
      }
    }
  }, [markers, isDark])

  const routePathRef = useRef(routePath)
  routePathRef.current = routePath
  const routeIsDarkRef = useRef(isDark)
  routeIsDarkRef.current = isDark

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const syncRoute = () => {
      syncMapRouteLayer(map, routePathRef.current, routeIsDarkRef.current)
    }

    if (map.isStyleLoaded()) {
      syncRoute()
      return
    }

    map.once('idle', syncRoute)
    return () => {
      map.off('idle', syncRoute)
    }
  }, [routePath, isDark])

  const userLocationRef = useRef(userLocation)
  userLocationRef.current = userLocation
  const userLocationIsDarkRef = useRef(isDark)
  userLocationIsDarkRef.current = isDark

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const syncUser = () => {
      syncMapUserLocationLayer(
        map,
        userLocationRef.current,
        userLocationIsDarkRef.current,
      )
    }

    if (map.isStyleLoaded()) {
      syncUser()
      return
    }

    map.once('idle', syncUser)
    return () => {
      map.off('idle', syncUser)
    }
  }, [userLocation, isDark])

  return (
    <div
      className={cn(
        'relative h-full min-h-0 w-full overflow-hidden',
        isDark && 'nora-map-dark',
        isRasterFallback && 'nora-map-raster',
        !isDark && 'nora-map-light',
        className,
      )}
    >
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />
      {!mapTilesReady ? (
        <div
          className={cn(
            'pointer-events-none absolute inset-0 z-[4] flex flex-col items-center justify-center gap-2 transition-opacity duration-300',
            isDark
              ? 'bg-[#1a1824] text-[var(--nora-text-muted)]'
              : 'bg-[#f0eeeb] text-[var(--nora-text-muted)]',
          )}
          aria-busy
          aria-label={t('mapSurface.loadingAria')}
        >
          <span
            className={cn(
              'text-sm font-medium',
              isDark
                ? 'text-[color-mix(in_srgb,var(--nora-accent-2)_88%,var(--nora-text))]'
                : 'text-[color-mix(in_srgb,var(--nora-accent)_88%,var(--nora-text))]',
            )}
          >
            NORA
          </span>
          <p className="text-xs">{t('map.loading')}</p>
          <span
            className={cn(
              'mt-2 block h-1 w-28 rounded-full motion-safe:animate-pulse',
              isDark
                ? 'bg-[color-mix(in_srgb,var(--nora-accent-2)_40%,transparent)]'
                : 'bg-[color-mix(in_srgb,var(--nora-accent)_35%,transparent)]',
            )}
          />
        </div>
      ) : null}
      {tileError ? (
        <div className="pointer-events-none absolute bottom-24 left-3 right-3 z-[5] rounded-xl border border-amber-500/40 bg-amber-950/90 px-3 py-2 text-center text-xs text-amber-100">
          {t('map.tileError')}
        </div>
      ) : null}
    </div>
  )
}
